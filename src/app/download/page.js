"use client";

import { Smartphone, Monitor, Download, Apple } from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-8 pb-32">
      <header className="mb-10 md:mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Get the App</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Install Waypoint on your devices to get background location alerts and offline access.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        
        {/* Android */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2rem] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors pointer-events-none" />
          <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-500 relative z-10">
            <Smartphone className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">Android</h2>
          <p className="text-muted-foreground mb-8 flex-1 relative z-10">
            Get background geofencing and push notifications natively on your Android device.
          </p>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10 shadow-lg shadow-green-500/20">
            <Download className="w-5 h-5" />
            Download APK
          </button>
        </div>

        {/* iOS */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2rem] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary relative z-10">
            <svg viewBox="0 0 384 512" className="w-9 h-9 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">iOS</h2>
          <p className="text-muted-foreground mb-8 flex-1 relative z-10">
            Native iOS experience with optimized background location tracking for Apple devices.
          </p>
          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10 shadow-lg shadow-primary/20">
            <Download className="w-5 h-5" />
            Download App Store
          </button>
        </div>

        {/* Laptop / PWA */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2rem] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
          <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 relative z-10">
            <Monitor className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">Laptop</h2>
          <p className="text-muted-foreground mb-8 flex-1 relative z-10">
            Install the web application directly to your desktop for a native-like windowed experience.
          </p>
          <button 
            onClick={() => alert("To install on Laptop: Click the Install icon in your browser's address bar, or select 'Install Waypoint' from the browser menu.")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10 shadow-lg shadow-blue-500/20"
          >
            <Download className="w-5 h-5" />
            Install PWA
          </button>
        </div>

      </div>
    </div>
  );
}
