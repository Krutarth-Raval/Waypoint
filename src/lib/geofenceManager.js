"use client";

import { Capacitor } from '@capacitor/core';

let initialized = false;

// We use a simple localStorage-based state machine
const STATE_KEY = 'waypoint_geofence_state';

function getState() {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STATE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }
}

export async function initGeofencing(tasks) {
  if (typeof window === 'undefined') return;
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) {
    if (tasks) syncTasks(tasks);
    return;
  }

  try {
    // Dynamic import to avoid Next.js server-side errors
    const { BackgroundGeolocation } = await import('@capgo/background-geolocation');
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // Setup geofencing
    await BackgroundGeolocation.setupGeofencing({
      backgroundLocation: true, // Necessary for Android 10+ background
    });

    // Listen for geofence transitions
    BackgroundGeolocation.addListener('geofenceTransition', handleGeofenceTransition);

    // Listen for geofence errors
    BackgroundGeolocation.addListener('onGeofenceError', (error) => {
      console.error('[WaypointGeofence] ERROR received from plugin:', error);
    });

    initialized = true;
    if (tasks) syncTasks(tasks);
  } catch (error) {
    console.error('Error initializing geofencing:', error);
  }
}

// Dev helper to test notification UI without walking outside
export async function testNotification() {
  if (typeof window === 'undefined') return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    if (Capacitor.getPlatform() === 'android') {
      try {
        await LocalNotifications.createChannel({
          id: 'geofence_alerts',
          name: 'Geofence Alerts',
          description: 'Notifications for arriving and leaving tasks',
          importance: 4, // High importance
          visibility: 1, // Public visibility
        });
      } catch (e) {
        console.error('Error creating notification channel:', e);
      }
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: '📍 Arrived at Test Location',
          body: 'This is a test geofence notification!',
          id: Math.floor(Math.random() * 1000000),
          channelId: 'geofence_alerts',
        }
      ]
    });
    console.log("Test notification scheduled successfully!");
  } catch (e) {
    console.error("Test notification failed:", e);
  }
}

if (typeof window !== 'undefined') {
  window.testGeofenceNotification = testNotification;
}

export async function handleGeofenceTransition(event) {
  console.log('[WaypointGeofence] Transition Received:', event);
  console.log(`[WaypointGeofence] Transition = ${event.transition}`);
  console.log(`[WaypointGeofence] Identifier = ${event.identifier}`);

  try {
    const state = getState();
    const taskId = event.identifier;
    const currentState = state[taskId] || 'UNKNOWN';
    const isEntering = event.transition === 'enter' || event.transition === 'ENTER';

    const activeTasks = getActiveTasksFromStorage();
    const taskInfo = activeTasks.find(t => t.id === taskId);
    
    if (!taskInfo) {
      console.log('[WaypointGeofence] Task not found in active tasks storage. Aborting notification.');
      return;
    }

    let nextState = currentState;
    let shouldNotify = false;
    let notificationBody = '';
    let notificationTitle = '';

    if (isEntering) {
      if (currentState !== 'INSIDE') {
        nextState = 'INSIDE';
        if ((currentState === 'OUTSIDE' || currentState === 'UNKNOWN') && taskInfo.triggerType === 'ARRIVE') {
          shouldNotify = true;
          notificationTitle = `Arrived at ${taskInfo.place.name}`;
          notificationBody = `${taskInfo.title}`;
        }
      }
    } else { // EXIT
      if (currentState !== 'OUTSIDE') {
        nextState = 'OUTSIDE';
        if ((currentState === 'INSIDE' || currentState === 'UNKNOWN') && taskInfo.triggerType === 'LEAVE') {
          shouldNotify = true;
          notificationTitle = `Left ${taskInfo.place.name}`;
          notificationBody = `${taskInfo.title}`;
        }
      }
    }

    state[taskId] = nextState;
    saveState(state);

    if (shouldNotify) {
      console.log('[WaypointNotification] Creating notification...');
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      if (Capacitor.getPlatform() === 'android') {
        try {
          console.log('[WaypointNotification] Creating Android channel geofence_alerts');
          await LocalNotifications.createChannel({
            id: 'geofence_alerts',
            name: 'Geofence Alerts',
            description: 'Notifications for arriving and leaving tasks',
            importance: 4,
            visibility: 1,
          });
        } catch (e) {
          console.error('[WaypointNotification] Error creating notification channel:', e);
        }
      }

      console.log('[WaypointNotification] Scheduling notification via LocalNotifications.schedule()');
      const result = await LocalNotifications.schedule({
        notifications: [
          {
            title: '📍 ' + notificationTitle,
            body: notificationBody,
            id: Math.floor(Math.random() * 1000000),
            channelId: 'geofence_alerts',
            sound: null,
            attachments: null,
            actionTypeId: "",
            extra: null
          }
        ]
      });
      console.log('[WaypointNotification] Notification sent result:', result);
    } else {
      console.log('[WaypointGeofence] Transition ignored (no notification needed).');
    }
  } catch (error) {
    console.error('[WaypointGeofence] Error handling transition:', error);
  }
}

const TASKS_KEY = 'waypoint_active_tasks';

function getActiveTasksFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveActiveTasksToStorage(tasks) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }
}

export async function syncTasks(tasks) {
  if (typeof window === 'undefined') return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { BackgroundGeolocation } = await import('@capgo/background-geolocation');
    
    // Only monitor active tasks that have a place
    const locationTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.place);
    
    saveActiveTasksToStorage(locationTasks);

    const currentState = getState();
    
    const monitored = await BackgroundGeolocation.getMonitoredGeofences();
    const monitoredIds = monitored.regions || [];
    
    const targetIds = locationTasks.map(t => t.id);

    // Remove obsolete
    for (const id of monitoredIds) {
      if (!targetIds.includes(id)) {
        await BackgroundGeolocation.removeGeofence({ identifier: id });
        delete currentState[id];
      }
    }

    // Add new or update
    for (const task of locationTasks) {
      const { id, place } = task;
      if (!monitoredIds.includes(id)) {
        if (!currentState[id]) {
          currentState[id] = 'UNKNOWN';
        }
        await BackgroundGeolocation.addGeofence({
          identifier: id,
          latitude: place.latitude,
          longitude: place.longitude,
          radius: place.radiusMeters || 100,
          notifyOnEntry: true,
          notifyOnExit: true,
          payload: { 
            title: task.title, 
            placeName: place.name, 
            triggerType: task.triggerType 
          }
        });
      }
    }
    
    saveState(currentState);
  } catch (error) {
    console.error('Error syncing geofences:', error);
  }
}
