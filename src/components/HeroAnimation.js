"use client";

import { useState, useEffect } from "react";
import { MapPin, Bell, CheckCircle2 } from "lucide-react";

export default function HeroAnimation() {
  const [isInZone, setIsInZone] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const runAnimation = () => {
      setIsInZone(false);
      setIsDone(false);
      
      // Move into zone
      setTimeout(() => {
        setIsInZone(true);
      }, 2000);

      // Mark as done
      setTimeout(() => {
        setIsDone(true);
      }, 4500);
    };

    runAnimation();
    const interval = setInterval(runAnimation, 7000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square md:aspect-video rounded-3xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl flex items-center justify-center">
      
      {/* Background Map Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
      
      {/* Geofence Circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center">
        <img src="/icon.png" className="w-8 h-8 object-contain mb-6 opacity-60" alt="Pin" />
      </div>

      {/* Moving User Dot */}
      <div 
        className="absolute w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-1000 ease-in-out z-10 flex items-center justify-center"
        style={{
          left: isInZone ? '50%' : '15%',
          top: isInZone ? '50%' : '85%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="absolute w-full h-full rounded-full bg-blue-400 animate-ping opacity-75" />
      </div>

      {/* Notification Toast */}
      <div 
        className={`absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-xl p-4 border border-border shadow-lg transition-all duration-500 z-20 ${
          isInZone && !isDone ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Bell className="w-5 h-5 text-primary animate-bounce" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">You've arrived at Grocery Store</h4>
            <p className="text-xs text-muted-foreground mt-1">Task: Buy milk and eggs</p>
          </div>
        </div>
      </div>

      {/* Completion Toast */}
      <div 
        className={`absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-xl p-4 border border-green-500/30 bg-green-500/10 shadow-lg transition-all duration-500 z-20 ${
          isDone ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-medium text-sm text-green-100">Task Completed!</span>
        </div>
      </div>
      
    </div>
  );
}
