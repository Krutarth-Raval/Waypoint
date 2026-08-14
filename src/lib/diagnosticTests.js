"use client";

import { Capacitor } from '@capacitor/core';
import { handleGeofenceTransition } from './geofenceManager';

export async function testDirectNotification() {
  console.log('[WaypointNotification] Test started');
  
  if (!Capacitor.isNativePlatform()) {
    console.log('[WaypointNotification] Not running on native Android/iOS. Aborting local notification test.');
    return;
  }

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // 1. Check permissions
    console.log('[WaypointNotification] Checking permission status...');
    let permStatus = await LocalNotifications.checkPermissions();
    console.log('[WaypointNotification] Initial Permission status:', permStatus.display);

    if (permStatus.display !== 'granted') {
        console.log('[WaypointNotification] Requesting permissions...');
        permStatus = await LocalNotifications.requestPermissions();
        console.log('[WaypointNotification] New Permission status:', permStatus.display);
    }

    if (permStatus.display !== 'granted') {
        console.error('[WaypointNotification] Permission denied. Cannot schedule notification.');
        return;
    }

    // 2. Create channel
    if (Capacitor.getPlatform() === 'android') {
      console.log('[WaypointNotification] Creating notification channel');
      try {
        await LocalNotifications.createChannel({
          id: 'geofence_alerts',
          name: 'Geofence Alerts',
          description: 'Notifications for arriving and leaving tasks',
          importance: 4, // High importance
          visibility: 1, // Public visibility
        });
        console.log('[WaypointNotification] Notification channel created or already exists');
      } catch (e) {
        console.error('[WaypointNotification] Failed to create channel:', e);
      }
    }

    // 3. Schedule notification
    console.log('[WaypointNotification] Scheduling notification in 1 second');
    const result = await LocalNotifications.schedule({
      notifications: [
        {
          title: '🛠 Diagnostic Direct Notification',
          body: 'If you see this, native local notifications are working perfectly.',
          id: Math.floor(Math.random() * 1000000),
          channelId: 'geofence_alerts',
          schedule: { at: new Date(Date.now() + 1000) } // schedule 1s in the future
        }
      ]
    });
    
    console.log('[WaypointNotification] Notification call completed:', result);
  } catch (error) {
    console.error('[WaypointNotification] Test failed with exception:', error);
  }
}

export async function testManualGeofence(taskId, title, placeName, triggerType) {
  console.log('[WaypointGeofence] Triggering manual geofence test');
  
  // Create a fake active task in localStorage so handleGeofenceTransition finds it
  const TASKS_KEY = 'waypoint_active_tasks';
  const fakeTask = {
    id: taskId,
    title: title,
    triggerType: triggerType,
    place: { name: placeName, latitude: 0, longitude: 0, radiusMeters: 100 }
  };
  
  try {
    const existingStr = localStorage.getItem(TASKS_KEY);
    let tasks = existingStr ? JSON.parse(existingStr) : [];
    // filter out existing fake task to avoid duplicates
    tasks = tasks.filter(t => t.id !== taskId);
    tasks.push(fakeTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('[WaypointGeofence] Failed to inject fake task into storage for test', e);
  }

  // Create fake geofence event
  const fakeEvent = {
    identifier: taskId,
    transition: 'enter' // Assume enter for test
  };

  await handleGeofenceTransition(fakeEvent);
  console.log('[WaypointGeofence] Manual geofence test function finished.');
}
