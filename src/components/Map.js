"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-accent/50 rounded-radius-lg border border-border">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 mb-4 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-primary" />
        </div>
        <div className="text-muted-foreground font-medium">Loading map...</div>
      </div>
    </div>
  ),
});

export default function Map({ places = [], onMapClick, defaultCenter = [37.7749, -122.4194], tempMarker = null }) {
  return <MapComponent places={places} onMapClick={onMapClick} defaultCenter={defaultCenter} tempMarker={tempMarker} />;
}
