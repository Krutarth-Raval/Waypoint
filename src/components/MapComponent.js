"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      }
    }
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom() > 13 ? map.getZoom() : 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({ places = [], onMapClick, defaultCenter = [37.7749, -122.4194], tempMarker = null }) {
  
  // If there are places, center on the first one, or the tempMarker if present
  const center = tempMarker 
    ? [tempMarker.latitude, tempMarker.longitude] 
    : places.length > 0 
      ? [places[0].latitude, places[0].longitude] 
      : defaultCenter;

  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const tileUrl = currentTheme === "dark" 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full rounded-radius-lg overflow-hidden z-0 relative shadow-sm border border-border">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ width: "100%", height: "100%" }}
      >
        <MapController center={center} />
        <MapClickHandler onMapClick={onMapClick} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        
        {places.map((place) => (
          <div key={place.id}>
            <Marker position={[place.latitude, place.longitude]}>
              <Popup>
                <div className="font-semibold">{place.name}</div>
                <div className="text-xs">{place.radiusMeters}m radius</div>
              </Popup>
            </Marker>
            <Circle 
              center={[place.latitude, place.longitude]} 
              radius={place.radiusMeters} 
              pathOptions={{ color: 'var(--color-primary)', fillColor: 'var(--color-primary)', fillOpacity: 0.2 }}
            />
          </div>
        ))}
        
        {tempMarker && (
          <Marker position={[tempMarker.latitude, tempMarker.longitude]}>
            <Popup>
              <div className="font-semibold">Selected Location</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
