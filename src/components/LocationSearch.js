"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

export default function LocationSearch({ onLocationSelect, onCloseMap }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setResults(data.features || []);
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!query) setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result) => {
    setQuery("");
    setIsOpen(false);
    setIsExpanded(false);
    setResults([]);
    
    // Photon returns [longitude, latitude]
    const [lon, lat] = result.geometry.coordinates;
    const props = result.properties;
    
    const displayName = [props.name, props.city, props.state, props.country]
      .filter(Boolean)
      .join(", ");

    onLocationSelect({
      latitude: lat,
      longitude: lon,
      name: props.name || displayName
    });
  };

  const handleCloseSearch = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-2 z-[60] justify-end">
      
      {/* The Search Bar (animates width) */}
      <div 
        className={`relative flex items-center bg-background/90 backdrop-blur-md rounded-full border border-border shadow-lg overflow-hidden transition-all duration-300 ease-out focus-within:shadow-primary/20 focus-within:border-primary/50
          ${isExpanded ? 'w-[calc(100vw-110px)] sm:w-[350px] md:w-[450px] opacity-100' : 'w-12 h-12 cursor-pointer hover:bg-accent/50'}`
        }
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
      >
        {/* Search Icon (Always visible on left) */}
        <div className={`flex items-center justify-center shrink-0 transition-colors duration-300 ${isExpanded ? 'w-12 h-12 text-muted-foreground' : 'w-12 h-12 text-foreground'}`}>
          <Search className="w-5 h-5" />
        </div>
        
        {/* Input Field (Fades in/out) */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search location..."
          className={`bg-transparent border-none py-3 text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground text-sm font-medium transition-all duration-300 ${
            isExpanded ? 'w-full opacity-100 px-0' : 'w-0 opacity-0 px-0 pointer-events-none'
          }`}
          disabled={!isExpanded}
        />
        
        {/* Cross Icon to Close Search (Fades in/out) */}
        <div className={`flex items-center shrink-0 transition-all duration-300 ${isExpanded ? 'w-12 opacity-100' : 'w-0 opacity-0 pointer-events-none overflow-hidden'}`}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />
          ) : (
            <button 
              onClick={handleCloseSearch} 
              className="w-8 h-8 rounded-full flex items-center justify-center mx-auto hover:bg-accent hover:text-foreground text-muted-foreground transition-colors"
              title="Close Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Close Map Button */}
      {onCloseMap && (
        <button 
          onClick={onCloseMap}
          className="w-12 h-12 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center border border-border shadow-xl text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
          title="Close Map"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {isOpen && query.length >= 3 && (
        <div className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((result, idx) => {
                const props = result.properties;
                const title = props.name || props.city || props.state;
                const subtitle = [props.street, props.city, props.state, props.country]
                  .filter(Boolean)
                  .filter(item => item !== title)
                  .join(", ");
                  
                return (
                  <li key={idx}>
                    <button
                      onClick={() => handleSelect(result)}
                      className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors flex items-start gap-3"
                    >
                      <MapPin className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{title}</p>
                        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : !loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No locations found. Try a more specific address.
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
