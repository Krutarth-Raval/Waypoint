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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
        
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
          <a href="/waypoint.apk" download className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10 shadow-lg shadow-green-500/20">
            <Download className="w-5 h-5" />
            Download APK
          </a>
        </div>

        {/* Windows / PWA */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2rem] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
          <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 relative z-10">
            <Monitor className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">Windows Desktop</h2>
          <p className="text-muted-foreground mb-8 flex-1 relative z-10">
            Install the web application directly to your Windows desktop for a native, fast windowed experience.
          </p>
          <button 
            onClick={() => alert("To install on Windows: Open this page in Chrome or Edge, click the 'Install App' icon in the address bar (near the bookmark star).")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10 shadow-lg shadow-blue-500/20"
          >
            <Download className="w-5 h-5" />
            Install App
          </button>
        </div>

      </div>
    </div>
  );
}
