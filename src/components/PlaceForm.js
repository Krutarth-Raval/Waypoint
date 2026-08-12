"use client";

import { useState, useEffect } from "react";
import { createPlace, updatePlace } from "@/app/actions";
import { MapPin } from "lucide-react";

export default function PlaceForm({ onSuccess, initialCoords, initialData, onLocationDetect }) {
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState("37.7749");
  const [lng, setLng] = useState("-122.4194");

  useEffect(() => {
    if (initialCoords) {
      setLat(initialCoords.latitude.toFixed(6));
      setLng(initialCoords.longitude.toFixed(6));
    }
  }, [initialCoords]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get("name"),
      latitude: parseFloat(formData.get("latitude")),
      longitude: parseFloat(formData.get("longitude")),
      radiusMeters: parseInt(formData.get("radius")),
    };

    if (initialData) {
      await updatePlace(initialData.id, data);
    } else {
      await createPlace(data);
    }
    
    setLoading(false);
    if (onSuccess) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full text-left">
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground/80">Place Name</label>
        <input required name="name" type="text" defaultValue={initialData?.name || ""} placeholder="e.g. Work, Gym, Grocery Store" className="w-full bg-background/50 backdrop-blur-md border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground/80">Latitude</label>
          <input required name="latitude" type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full bg-background/50 backdrop-blur-md border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground/80">Longitude</label>
          <input required name="longitude" type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full bg-background/50 backdrop-blur-md border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground/80">Geofence Radius (meters)</label>
        <input required name="radius" type="number" defaultValue={initialData?.radiusMeters || 100} min="50" max="1000" className="w-full bg-background/50 backdrop-blur-md border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
      </div>

      <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 mt-2">
        {loading ? "Saving..." : initialData ? "Save Changes" : "Save Place"}
      </button>
    </form>
  );
}
