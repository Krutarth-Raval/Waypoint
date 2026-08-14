"use client";

import { testDirectNotification, testManualGeofence } from "@/lib/diagnosticTests";

export default function DiagnosticPanel() {
  return (
    <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-4 mb-6 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-destructive text-sm uppercase tracking-wider">🛠 Developer Diagnostics</h3>
        <span className="text-[10px] text-destructive/70 font-semibold uppercase tracking-widest px-2 py-1 bg-destructive/10 rounded-full">Temporary</span>
      </div>
      
      <p className="text-xs text-muted-foreground leading-relaxed">
        Use these buttons to manually trace where the notification pipeline fails on your Android device. 
        <strong className="text-foreground ml-1">Open Android Studio Logcat or Chrome Inspect (chrome://inspect)</strong> to view the diagnostic logs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        <button 
          onClick={() => testDirectNotification()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span>Test 1: Direct Notification</span>
        </button>

        <button 
          onClick={() => testManualGeofence('test-task-123', 'Test Diagnostic Task', 'Test Diagnostic Place', 'ARRIVE')}
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span>Test 2: Manual Geofence (Enter)</span>
        </button>
      </div>
    </div>
  );
}
