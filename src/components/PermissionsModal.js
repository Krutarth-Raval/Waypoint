"use client";

import { useState, useEffect } from "react";
import { MapPin, Bell, ShieldCheck, ArrowRight } from "lucide-react";

export default function PermissionsModal() {
  const [show, setShow] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle, loading, granted, denied
  const [notificationStatus, setNotificationStatus] = useState("idle"); // idle, loading, granted, denied

  useEffect(() => {
    // Only show if we haven't asked before on this device
    const hasRequested = localStorage.getItem("waypoint_permissions_requested");
    if (!hasRequested) {
      // Delay slightly so it doesn't pop up instantly on fast loads, making it feel smoother
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem("waypoint_permissions_requested", "true");
    setShow(false);
  };

  const handleRequestPermissions = async () => {
    // Request Notifications
    const requestNotifications = new Promise(async (resolve) => {
      if ("Notification" in window) {
        setNotificationStatus("loading");
        try {
          const permission = await Notification.requestPermission();
          const finalStatus = permission === "granted" ? "granted" : "denied";
          setNotificationStatus(finalStatus);
          resolve(finalStatus);
        } catch (error) {
          setNotificationStatus("denied");
          resolve("denied");
        }
      } else {
        setNotificationStatus("denied");
        resolve("denied");
      }
    });

    // Request Location
    const requestLocation = new Promise((resolve) => {
      if ("geolocation" in navigator) {
        setLocationStatus("loading");
        navigator.geolocation.getCurrentPosition(
          (position) => { setLocationStatus("granted"); resolve("granted"); },
          (error) => { setLocationStatus("denied"); resolve("denied"); }
        );
      } else {
        setLocationStatus("denied");
        resolve("denied");
      }
    });

    // Wait for both to finish
    await Promise.all([requestNotifications, requestLocation]);

    // Delay slightly so user can see "Granted" state before it closes
    setTimeout(() => {
      handleFinish();
    }, 1200);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white/90 dark:bg-black/80 backdrop-blur-3xl border border-border/50 shadow-2xl rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full mx-4 relative overflow-hidden animate-in zoom-in-95 duration-500 delay-150">
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Welcome to Waypoint</h2>
          <p className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed">
            To unlock the full magic of location-aware tasks, we need a couple of quick permissions. You can always change these later in your settings.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50">
              <div className="p-2 bg-blue-500/10 rounded-xl mt-0.5">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Location Access</h3>
                <p className="text-xs text-muted-foreground mt-1">Allows us to detect when you enter or leave your geofenced tasks.</p>
                {locationStatus === "loading" && <p className="text-xs text-blue-500 font-medium mt-2 animate-pulse">Requesting...</p>}
                {locationStatus === "granted" && <p className="text-xs text-emerald-500 font-medium mt-2">Granted!</p>}
                {locationStatus === "denied" && <p className="text-xs text-red-500 font-medium mt-2">Denied (Enable in browser settings)</p>}
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50">
              <div className="p-2 bg-primary/10 rounded-xl mt-0.5">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Push Notifications</h3>
                <p className="text-xs text-muted-foreground mt-1">So we can actually ping you the moment you arrive at your destination.</p>
                {notificationStatus === "loading" && <p className="text-xs text-primary font-medium mt-2 animate-pulse">Requesting...</p>}
                {notificationStatus === "granted" && <p className="text-xs text-emerald-500 font-medium mt-2">Granted!</p>}
                {notificationStatus === "denied" && <p className="text-xs text-red-500 font-medium mt-2">Denied (Enable in browser settings)</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleRequestPermissions}
              className="w-full bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 group"
            >
              Enable Permissions
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleFinish}
              className="w-full bg-transparent text-muted-foreground hover:text-foreground font-semibold px-8 py-3 rounded-2xl transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
