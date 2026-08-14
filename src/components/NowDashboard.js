"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, MapPin, Loader2, Navigation, AlertTriangle, ShieldCheck, Sun, Trash2, Bell, BellRing } from "lucide-react";
import { completeTask, deleteTask } from "@/app/actions";
import TaskCard from "@/components/TaskCard";
import { syncTasks } from "@/lib/geofenceManager";

// Haversine formula to calculate distance between two coordinates in meters
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function NowDashboard({ tasks, greeting, firstName }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(true);

  const [appVersion, setAppVersion] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@capacitor/core').then(({ Capacitor }) => {
        setIsNative(Capacitor.isNativePlatform());
        if (Capacitor.isNativePlatform()) {
          import('@capacitor/app').then(({ App }) => {
            App.getInfo().then(info => {
              setAppVersion(info.version);
              checkForUpdates(info.version);
            });
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, []);

  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  };

  const checkForUpdates = async (currentVersion) => {
    try {
      const res = await fetch('/api/version');
      const data = await res.json();
      if (data.version && currentVersion) {
        if (compareVersions(data.version, currentVersion) > 0) {
          setUpdateAvailable(true);
        }
      }
    } catch (e) {
      console.error("Failed to check for updates", e);
    }
  };

  useEffect(() => {
    syncTasks(tasks).catch(() => {});
  }, [tasks]);

  // Notification State
  const [notificationPermission, setNotificationPermission] = useState('default');
  const prevNearbyTaskIds = useRef(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("Your browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      new Notification("Notifications Enabled! 🚀", {
        body: "Waypoint will now alert you when you arrive at your tasks.",
        icon: '/favicon.ico',
        vibrate: [200, 100, 200]
      });
    }
  };
  
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  async function confirmDelete() {
    if (!taskToDelete) return;
    setIsDeleting(true);
    await deleteTask(taskToDelete.id);
    setIsDeleting(false);
    setTaskToDelete(null);
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openDeviceLocationSettings = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Windows
    if (/windows phone/i.test(userAgent) || /Win/i.test(userAgent)) {
      window.location.href = "ms-settings:privacy-location";
      return;
    }

    // Android
    if (/android/i.test(userAgent)) {
      window.location.href = "intent:#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end";
      return;
    }

    // iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.location.href = "App-Prefs:root=Privacy&path=LOCATION";
      return;
    }
    
    // macOS
    if (/Mac/.test(userAgent)) {
      window.location.href = "x-apple.systempreferences:com.apple.preference.security?Privacy_LocationServices";
      return;
    }

    alert("Please manually open your device settings to enable location.");
  };

  const requestLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationError(null);
        setIsLocating(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location blocked. Attempting to open device settings...");
          openDeviceLocationSettings();
        } else {
          setLocationError(error.message);
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationError(null);
        setIsLocating(false);
      },
      (error) => {
        setLocationError(error.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Filter tasks based on location
  const nearbyTasks = [];
  const elsewhereTasks = [];

  if (currentLocation && tasks.length > 0) {
    tasks.forEach(task => {
      const distance = getDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        task.place.latitude,
        task.place.longitude
      );
      if (distance <= task.place.radiusMeters) {
        nearbyTasks.push(task);
      } else {
        elsewhereTasks.push(task);
      }
    });
  } else {
    // If no location, everything goes to elsewhere
    elsewhereTasks.push(...tasks);
  }

  // Geofence Notification Logic
  useEffect(() => {
    if (!currentLocation) return;
    
    const currentNearbyTaskIds = new Set(nearbyTasks.map(t => t.id));

    // Don't fire notifications on the very first GPS lock, only on subsequent changes
    if (isInitialLoad.current) {
      prevNearbyTaskIds.current = currentNearbyTaskIds;
      isInitialLoad.current = false;
      return;
    }

    if (notificationPermission === 'granted' && !isNative) {
      // Check for newly entered tasks
      nearbyTasks.forEach(task => {
        if (!prevNearbyTaskIds.current.has(task.id) && task.triggerType === 'ARRIVE') {
          new Notification(`📍 Arrived at ${task.place.name}`, {
            body: task.title,
            icon: '/favicon.ico', // Replace with a better icon if available
            vibrate: [200, 100, 200, 100, 200], // Distinct pattern
            tag: `arrive-${task.id}`, // Prevents spam
            renotify: true
          });
        }
      });

      // Check for newly exited tasks
      elsewhereTasks.forEach(task => {
        if (prevNearbyTaskIds.current.has(task.id) && task.triggerType === 'LEAVE') {
          new Notification(`👋 Leaving ${task.place.name}?`, {
            body: task.title,
            icon: '/favicon.ico',
            vibrate: [100, 50, 100], // Short vibration for leaving
            tag: `leave-${task.id}`,
            renotify: true
          });
        }
      });
    }

    prevNearbyTaskIds.current = currentNearbyTaskIds;
  }, [nearbyTasks, elsewhereTasks, currentLocation, notificationPermission, isNative]);

  // Group tasks by place
  function groupTasksByPlace(taskList) {
    const grouped = taskList.reduce((acc, task) => {
      const placeName = task.place.name;
      if (!acc[placeName]) acc[placeName] = [];
      acc[placeName].push(task);
      return acc;
    }, {});

    // Sort tasks within each place (ARRIVE before LEAVE)
    Object.keys(grouped).forEach(placeName => {
      grouped[placeName].sort((a, b) => {
        if (a.triggerType === b.triggerType) return 0;
        return a.triggerType === 'ARRIVE' ? -1 : 1;
      });
    });

    return grouped;
  }

  const groupedNearby = groupTasksByPlace(nearbyTasks);
  const groupedElsewhere = groupTasksByPlace(elsewhereTasks);

  const renderTaskGroup = (groupedTasks, isNearby) => {
    return Object.entries(groupedTasks).map(([placeName, placeTasks]) => {
      const arriveTasks = placeTasks.filter(t => t.triggerType === 'ARRIVE');
      const leaveTasks = placeTasks.filter(t => t.triggerType === 'LEAVE');

      return (
        <div key={placeName} className="mb-6">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">{placeName}</h3>
          </div>
          
          <div className="flex flex-col gap-4 pl-4 border-l-2 border-border/40 ml-6">
            {arriveTasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">When I Arrive</h4>
                {arriveTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isHighlighted={isNearby && task.triggerType === 'ARRIVE'} 
                    onDelete={() => setTaskToDelete(task)}
                    isDeleting={isDeleting && taskToDelete?.id === task.id}
                  />
                ))}
              </div>
            )}
            
            {leaveTasks.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">When I Leave</h4>
                {leaveTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isHighlighted={isNearby && task.triggerType === 'ARRIVE'} 
                    onDelete={() => setTaskToDelete(task)}
                    isDeleting={isDeleting && taskToDelete?.id === task.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    });
  };



  return (
    <div className="w-full flex flex-col gap-12">
      
      <div className="flex flex-col gap-2">
        {/* Notification Status Banner */}
        {notificationPermission === 'default' && !isNative && !locationError && !isLocating && (
          <div className="w-full rounded-2xl py-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4 border shadow-sm backdrop-blur-md bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-3 text-sm font-medium">
              <BellRing className="w-5 h-5 shrink-0" />
              <span>Allow notifications to be alerted when you arrive at your tasks.</span>
            </div>
            <button 
              onClick={requestNotificationPermission}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              Enable Notifications
            </button>
          </div>
        )}
      {/* Location Status Banner - Only show on error */}
      {locationError && (
        <div className={`w-full rounded-2xl py-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4 border shadow-sm backdrop-blur-md mb-2 bg-destructive/10 border-destructive/20 text-destructive`}>
          <div className="flex items-center gap-3 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{locationError}</span>
            <button 
              onClick={requestLocation}
              className="ml-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-xs font-bold hover:bg-destructive/90 transition-colors shadow-sm whitespace-nowrap"
            >
              Turn On Location
            </button>
          </div>
          
          {/* Security Assurance Badge */}
          <a href="/privacy" className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold shrink-0 hover:opacity-80 transition-opacity bg-destructive/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Secure & Private. Learn more.</span>
          </a>
        </div>
      )}
      </div>

      {/* App Update Popup */}
      {updateAvailable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Sun className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Update Available!</h3>
              <p className="text-zinc-400 mb-6 text-sm">
                A new version of Waypoint is available with improved geofencing and new features. Download it now to get the best experience.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setUpdateAvailable(false)}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
                >
                  Later
                </button>
                <a 
                  href="/download"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all flex items-center justify-center"
                >
                  Update Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render the Hero Greeting Card here */}
      <section className="mb-6 relative col-span-1 md:col-span-12 z-10">
        <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl opacity-40 pointer-events-none" />
        <div className="relative bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-border flex flex-row items-center justify-between gap-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {greeting},<br /><span className="text-primary">{firstName}</span>.
          </h1>
          
          {currentTime && (
            <div className="flex flex-col items-center justify-center bg-background/40 dark:bg-black/40 backdrop-blur-md border border-border/60 rounded-[1.5rem] p-3 md:p-6 shadow-inner shrink-0">
              <span className="text-xl md:text-3xl font-black tracking-tighter text-foreground">{currentTime}</span>
              <div className="h-0.5 w-8 md:w-12 bg-primary/40 my-1 md:my-2 rounded-full" />
              <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">{currentDate}</span>
            </div>
          )}
        </div>
      </section>

      {/* Nearby Tasks Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2 tracking-tight">
            Nearby Tasks
            <span className="flex items-center justify-center min-w-[1.5rem] h-6 md:min-w-[1.75rem] md:h-7 px-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm ml-2 font-bold">{nearbyTasks.length}</span>
          </h2>
        </div>

        {nearbyTasks.length === 0 ? (
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 flex flex-col items-center justify-center text-center shadow-lg border border-border relative overflow-hidden group min-h-[200px] md:min-h-[250px]">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1rem] md:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6 border border-primary/20">
              <Navigation className="w-6 h-6 md:w-8 md:h-8 text-primary opacity-50" />
            </div>
            <h3 className="font-bold text-xl md:text-2xl text-foreground mb-2 md:mb-3 tracking-tight">Nothing nearby</h3>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              {locationError 
                ? "Location is disabled, so we can't find nearby tasks."
                : "You don't have any pending tasks for your current location."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {renderTaskGroup(groupedNearby, true)}
          </div>
        )}
      </section>

      {/* Elsewhere Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-extrabold text-muted-foreground flex items-center gap-2 tracking-tight">
            Elsewhere
            <span className="flex items-center justify-center min-w-[1.5rem] h-6 md:min-w-[1.75rem] md:h-7 px-1.5 bg-card/60 border border-border/50 text-muted-foreground rounded-full text-xs md:text-sm ml-1 font-bold">{elsewhereTasks.length}</span>
          </h2>
        </div>

        {elsewhereTasks.length === 0 ? (
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-sm border border-border relative overflow-hidden min-h-[200px]">
             <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 border border-border/50">
               <MapPin className="w-6 h-6 text-muted-foreground opacity-50" />
             </div>
             <p className="text-muted-foreground font-medium">No tasks in other locations.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 opacity-75 hover:opacity-100 transition-opacity duration-300">
            {renderTaskGroup(groupedElsewhere, false)}
          </div>
        )}
      </section>

      {/* Custom Confirmation Dialog */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setTaskToDelete(null)}>
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] p-6 md:p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg md:text-xl font-bold mb-2">Delete Task?</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-8 leading-relaxed">Are you sure you want to delete "{taskToDelete.title}"?</p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm md:text-base rounded-full font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm md:text-base rounded-full font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
