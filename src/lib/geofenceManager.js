"use client";

import { Capacitor } from '@capacitor/core';

let initPromise = null;

// Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

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

export function initGeofencing() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const { BackgroundGeolocation } = await import('@capgo/background-geolocation');
      
      await BackgroundGeolocation.setupGeofencing({
        backgroundLocation: true,
      });

      const transitionHandle = await BackgroundGeolocation.addListener('geofenceTransition', handleGeofenceTransition);
      console.log('[WaypointGeofence] geofenceTransition listener registered successfully:', transitionHandle);

      const errorHandle = await BackgroundGeolocation.addListener('geofenceError', (error) => {
        console.error('[WaypointGeofence] ERROR');
        console.error('identifier:', error.identifier);
        console.error('code:', error.code);
        console.error('message:', error.message);
        console.error('domain:', error.domain);
        console.error('full error:', JSON.stringify(error));
      });
      console.log('[WaypointGeofence] geofenceError listener registered successfully:', errorHandle);

    } catch (error) {
      console.error('[WaypointGeofence] Error initializing geofencing:', error);
      throw error;
    }
  })();

  return initPromise;
}


export async function handleGeofenceTransition(event) {
  console.log('[WaypointGeofence] REAL TRANSITION RECEIVED');
  console.log(JSON.stringify(event, null, 2));
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
    // Wait for the initialization promise to finish first to avoid race conditions
    await initGeofencing();

    const { BackgroundGeolocation } = await import('@capgo/background-geolocation');
    
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
      
      console.log(`[WaypointGeofence] Validating task for registration:`);
      console.log(`task.id: ${id}`);
      console.log(`task.title: ${task.title}`);
      console.log(`task.triggerType: ${task.triggerType}`);
      console.log(`task.place.name: ${place.name}`);
      console.log(`task.place.latitude: ${place.latitude}`);
      console.log(`task.place.longitude: ${place.longitude}`);
      console.log(`task.place.radiusMeters: ${place.radiusMeters}`);

      if (!id || typeof place.latitude !== 'number' || typeof place.longitude !== 'number' || isNaN(place.latitude) || isNaN(place.longitude)) {
        console.error(`[WaypointGeofence] Validation failed for task ${id}: Invalid coordinates.`);
        continue;
      }
      if (task.triggerType !== 'ARRIVE' && task.triggerType !== 'LEAVE') {
        console.error(`[WaypointGeofence] Validation failed for task ${id}: Invalid triggerType.`);
        continue;
      }

      if (!monitoredIds.includes(id)) {
        if (!currentState[id] || currentState[id] === 'UNKNOWN') {
          // Pre-seed state using current GPS if possible
          const currentLoc = await getCurrentLocation();
          if (currentLoc) {
            const dist = getDistance(currentLoc.latitude, currentLoc.longitude, place.latitude, place.longitude);
            currentState[id] = dist <= Math.max(place.radiusMeters || 50, 50) ? 'INSIDE' : 'OUTSIDE';
          } else {
            currentState[id] = 'UNKNOWN';
          }
        }
        
        const radiusToUse = Math.max(place.radiusMeters || 50, 50);
        console.log(`[WaypointGeofence] REAL TASK REGISTRATION`);
        console.log(`task.id: ${id}`);
        console.log(`task.title: ${task.title}`);
        console.log(`task.triggerType: ${task.triggerType}`);
        console.log(`place.id: ${place.id}`);
        console.log(`place.name: ${place.name}`);
        console.log(`latitude: ${place.latitude}`);
        console.log(`longitude: ${place.longitude}`);
        console.log(`radius: ${radiusToUse}`);

        await BackgroundGeolocation.addGeofence({
          identifier: id,
          latitude: place.latitude,
          longitude: place.longitude,
          radius: radiusToUse,
          notifyOnEntry: true,
          notifyOnExit: true,
          payload: { 
            title: task.title, 
            placeName: place.name, 
            triggerType: task.triggerType 
          }
        });
        
        // Immediately verify registration
        const updatedMonitored = await BackgroundGeolocation.getMonitoredGeofences();
        console.log(`[WaypointGeofence] Currently monitored regions post-add:`, updatedMonitored.regions);
        
        if (!updatedMonitored.regions || !updatedMonitored.regions.includes(id)) {
          console.error(`[WaypointGeofence] ERROR: Task ${id} was not successfully registered by the OS!`);
        }
      }
    }
    
    saveState(currentState);
  } catch (error) {
    console.error('[WaypointGeofence] Error syncing geofences:', error);
  }
}
