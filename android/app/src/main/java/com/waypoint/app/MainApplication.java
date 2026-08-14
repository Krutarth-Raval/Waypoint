package com.waypoint.app;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import org.json.JSONException;
import org.json.JSONObject;

public class MainApplication extends Application {

    private static final String TAG = "WaypointNative";
    private static final String ACTION_GEOFENCE_EVENT = "com.capgo.capacitor_background_geolocation.geofence";
    private static final String CHANNEL_ID = "geofence_alerts";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "MainApplication onCreate() initialized.");

        createNotificationChannel();

        LocalBroadcastManager.getInstance(this).registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String payloadStr = intent.getStringExtra("payload");
                if (payloadStr == null) return;
                
                Log.d(TAG, "Geofence transition received in background: " + payloadStr);
                
                try {
                    JSONObject data = new JSONObject(payloadStr);
                    String transition = data.optString("transition"); // 'enter' or 'exit'
                    JSONObject payload = data.optJSONObject("payload");
                    
                    if (payload != null) {
                        String title = payload.optString("title", "Task at this location");
                        String placeName = payload.optString("placeName", "Unknown Place");
                        String triggerType = payload.optString("triggerType", "UNKNOWN");

                        boolean shouldNotify = false;
                        String notificationTitle = "";

                        if ("enter".equals(transition) && "ARRIVE".equals(triggerType)) {
                            shouldNotify = true;
                            notificationTitle = "📍 Arrived at " + placeName;
                        } else if ("exit".equals(transition) && "LEAVE".equals(triggerType)) {
                            shouldNotify = true;
                            notificationTitle = "👋 Left " + placeName;
                        }

                        if (shouldNotify) {
                            showNotification(context, notificationTitle, title);
                        }
                    }
                    
                } catch (JSONException e) {
                    Log.e(TAG, "Failed to parse geofence payload", e);
                }
            }
        }, new IntentFilter(ACTION_GEOFENCE_EVENT));
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Geofence Alerts";
            String description = "Notifications for arriving and leaving tasks";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void showNotification(Context context, String title, String body) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher) // You can change this to a specific transparent icon if you have one
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true);

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.notify((int) System.currentTimeMillis(), builder.build());
        }
    }
}
