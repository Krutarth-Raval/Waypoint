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
    BackgroundGeolocation.addListener('geofenceTransition', async (event) => {
      console.log('Geofence Transition Received:', event);
      // event.identifier is the task ID
      // event.transition is 'ENTER' or 'EXIT'

      const state = getState();
      const taskId = event.identifier;
      const currentState = state[taskId] || 'UNKNOWN';
      const isEntering = event.transition === 'ENTER';

      // Ensure the task still exists and gets its info for the notification
      const activeTasks = getActiveTasksFromStorage();
      const taskInfo = activeTasks.find(t => t.id === taskId);
      
      let nextState = currentState;
      let shouldNotify = false;
      let notificationBody = '';
      let notificationTitle = '';

      if (isEntering) {
        if (currentState !== 'INSIDE') {
          nextState = 'INSIDE';
          // Only notify for OUTSIDE -> INSIDE transition if task wants ARRIVE
          if (currentState === 'OUTSIDE' && taskInfo && taskInfo.triggerType === 'ARRIVE') {
            shouldNotify = true;
            notificationTitle = `Arrived at ${taskInfo.place.name}`;
            notificationBody = `${taskInfo.title}`;
          }
        }
      } else { // EXIT
        if (currentState !== 'OUTSIDE') {
          nextState = 'OUTSIDE';
          // Only notify for INSIDE -> OUTSIDE transition if task wants LEAVE
          if (currentState === 'INSIDE' && taskInfo && taskInfo.triggerType === 'LEAVE') {
            shouldNotify = true;
            notificationTitle = `Left ${taskInfo.place.name}`;
            notificationBody = `${taskInfo.title}`;
          }
        }
      }

      state[taskId] = nextState;
      saveState(state);

      if (shouldNotify && taskInfo) {
        // Trigger local notification
        await LocalNotifications.schedule({
          notifications: [
            {
              title: '📍 ' + notificationTitle,
              body: notificationBody,
              id: Math.floor(Math.random() * 1000000), // Random ID for local notification
              schedule: { at: new Date(Date.now() + 1000) },
              sound: null,
              attachments: null,
              actionTypeId: "",
              extra: null
            }
          ]
        });
      }
    });

    initialized = true;
    if (tasks) syncTasks(tasks);
  } catch (error) {
    console.error('Error initializing geofencing:', error);
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
    const monitoredIds = monitored.geofences.map(g => g.identifier);
    
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
        });
      }
    }
    
    saveState(currentState);
  } catch (error) {
    console.error('Error syncing geofences:', error);
  }
}
