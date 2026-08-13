"use client";

import { useEffect } from "react";
import { initGeofencing } from "@/lib/geofenceManager";

export default function GeofenceInitializer() {
  useEffect(() => {
    // Initialize geofencing listeners on mount without tasks yet
    // Tasks will be synced when they load in TasksClient
    initGeofencing(null);
  }, []);

  return null;
}
