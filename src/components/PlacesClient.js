"use client";

import { useState } from "react";
import { MapPin, Plus, X, Navigation, LocateFixed, MoreVertical, Edit2, Trash2 } from "lucide-react";
import PlaceForm from "@/components/PlaceForm";
import Map from "@/components/Map";
import BottomSheet from "@/components/layout/BottomSheet";
import LocationSearch from "@/components/LocationSearch";
import { deletePlace } from "@/app/actions";
import { useRef, useEffect } from "react";

export default function PlacesClient({ places }) {
  const [addStep, setAddStep] = useState('hidden'); // 'hidden', 'select', 'form'
  const [tempMarker, setTempMarker] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleAddClick() {
    setTempMarker(null);
    setEditingPlace(null);
    setAddStep('select');
  }

  function handleEditClick(place) {
    setEditingPlace(place);
    setTempMarker({ latitude: place.latitude, longitude: place.longitude });
    setAddStep('form');
  }

  async function confirmDelete() {
    if (!placeToDelete) return;
    setIsDeleting(true);
    await deletePlace(placeToDelete.id);
    setIsDeleting(false);
    setPlaceToDelete(null);
  }

  function handleMapClick(coords) {
    setTempMarker(coords);
  }
  
  function handleConfirmLocation() {
    if (!tempMarker) return;
    setAddStep('form');
  }

  function handleFormSuccess() {
    setTempMarker(null);
    setAddStep('hidden');
  }

  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setTempMarker({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-8 pb-32">
      <header className="mb-6 md:mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Places</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Manage your geofence locations</p>
        </div>
        <button
          onClick={handleAddClick}
          className="w-12 h-12 md:w-14 md:h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </header>

      {/* Places List */}
      {places.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-border shadow-lg mt-12 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10 animate-bounce">
            <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          <h3 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 relative z-10">No places yet</h3>
          <p className="text-muted-foreground text-sm md:text-lg max-w-sm mb-6 relative z-10">
            Create locations like "Home" or "Grocery Store" to get geofence notifications.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {places.map((place) => (
            <PlaceCard 
              key={place.id} 
              place={place} 
              onEdit={() => handleEditClick(place)} 
              onDelete={() => setPlaceToDelete(place)}
              isDeleting={isDeleting && placeToDelete?.id === place.id}
            />
          ))}
        </div>
      )}



      {/* Fullscreen Map Modal */}
      {addStep !== 'hidden' && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-4 left-4 right-4 z-[60] flex items-start justify-between pointer-events-none">
            <div className="pointer-events-auto w-full flex justify-end md:justify-center">
              <LocationSearch 
                onCloseMap={() => { setAddStep('hidden'); setTempMarker(null); }}
                onLocationSelect={(loc) => {
                  setTempMarker({ latitude: loc.latitude, longitude: loc.longitude });
                }} 
              />
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <Map 
              places={places} 
              onMapClick={handleMapClick} 
              tempMarker={tempMarker} 
            />
            {!tempMarker && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white px-5 py-3 rounded-full text-sm font-medium shadow-2xl animate-bounce whitespace-nowrap">
                  Tap anywhere to drop a pin
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-[104px] right-6 z-10 pointer-events-auto">
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="w-12 h-12 bg-background/90 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center border border-border hover:bg-background transition-colors disabled:opacity-50 text-foreground"
              title="Use current location"
            >
              {isLocating ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <LocateFixed className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Button Bar (Only show in 'select' step) */}
          {addStep === 'select' && (
            <div className="absolute bottom-0 inset-x-0 z-10 p-6 bg-gradient-to-t from-background via-background/80 to-transparent pb-safe pointer-events-none">
              <button 
                disabled={!tempMarker}
                onClick={handleConfirmLocation}
                className="w-full max-w-sm mx-auto h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-transform active:scale-[0.98] pointer-events-auto"
              >
                {tempMarker ? "Confirm Location" : "Tap map or search"}
                {tempMarker && <Navigation className="w-5 h-5 ml-2" />}
              </button>
            </div>
          )}
          
          {/* Form Overlay (Side Panel on Desktop, Bottom Sheet on Mobile) */}
          {addStep === 'form' && (
            <>
              {/* Backdrop for Desktop */}
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300 hidden md:block"
                onClick={() => setAddStep('hidden')}
              />
              
              <div className="fixed z-[70] bg-card shadow-2xl overflow-y-auto transition-transform duration-300
                /* Mobile: Bottom Sheet */
                inset-x-0 bottom-0 rounded-t-[32px] max-h-[85vh] md:max-h-none animate-in slide-in-from-bottom-full md:animate-none
                /* Desktop: Side Panel */
                md:inset-y-0 md:right-0 md:bottom-0 md:left-auto md:w-[450px] md:rounded-none md:border-l md:border-border md:animate-in md:slide-in-from-right-full"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">{editingPlace ? "Edit Location" : "Save Location"}</h2>
                    <button 
                      onClick={() => setAddStep('hidden')}
                      className="w-10 h-10 rounded-full bg-accent text-muted-foreground flex items-center justify-center hover:text-foreground hover:bg-accent/80 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mb-6 pb-6 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-3">Selected coordinates:</p>
                    <div className="flex items-center justify-between bg-accent p-3 rounded-radius-lg border border-border">
                      <div className="text-sm font-mono text-foreground truncate mr-4">
                        {tempMarker?.latitude.toFixed(5)}, {tempMarker?.longitude.toFixed(5)}
                      </div>
                      <button 
                        onClick={() => setAddStep('select')}
                        className="text-primary text-sm font-medium hover:underline whitespace-nowrap bg-primary/10 px-3 py-1.5 rounded-full"
                      >
                        Re-choose
                      </button>
                    </div>
                  </div>

                  <div className="mt-[-16px]">
                    <PlaceForm 
                      onSuccess={handleFormSuccess} 
                      initialCoords={tempMarker} 
                      initialData={editingPlace}
                      onLocationDetect={(coords) => {
                        setTempMarker(coords);
                      }} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {placeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPlaceToDelete(null)}>
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] p-6 md:p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg md:text-xl font-bold mb-2">Delete Place?</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-8 leading-relaxed">Are you sure you want to delete "{placeToDelete.name}"? All tasks associated with this location will also be permanently deleted.</p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setPlaceToDelete(null)}
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
                {isDeleting ? "Deleting..." : "Delete Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceCard({ place, onEdit, onDelete, isDeleting }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Swipe state
  const [offset, setOffset] = useState(0);
  const [startX, setStartX] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleDeleteClick(e) {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete();
  }

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    if (startX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // limit max swipe
    if (diff > 100) setOffset(100);
    else if (diff < -100) setOffset(-100);
    else setOffset(diff);
  };
  
  const handleTouchEnd = () => {
    if (offset > 60) {
      onEdit();
    } else if (offset < -60) {
      onDelete();
    }
    setOffset(0);
    setStartX(null);
  };

  return (
    <div className={`relative w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Background actions revealed on swipe */}
      <div className={`absolute inset-0 flex rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-opacity duration-200 ${startX !== null || offset !== 0 ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left half: Edit (Green) */}
        <div className="flex-1 bg-green-500/90 flex items-center pl-6 md:pl-8 justify-start">
          <Edit2 className="w-6 h-6 text-white" />
        </div>
        {/* Right half: Delete (Red) */}
        <div className="flex-1 bg-red-500/90 flex items-center pr-6 md:pr-8 justify-end">
          <Trash2 className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Foreground Card */}
      <div 
        className={`bg-card/90 backdrop-blur-xl p-5 md:p-6 px-6 md:px-8 border border-border hover:border-primary/50 transition-colors cursor-pointer group relative flex flex-row items-center justify-between min-h-[100px] md:min-h-[120px] shadow-sm rounded-[1.5rem] md:rounded-[2rem] w-full
          ${startX === null ? 'transition-transform duration-300 ease-out' : 'transition-none'}
        `}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors pointer-events-none -mr-10 -mt-10" />
        
        <div className="flex items-center gap-5 md:gap-6 relative z-10 w-full min-w-0 pr-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
            <MapPin className="w-6 h-6 md:w-7 md:h-7 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg md:text-xl lg:text-2xl mb-1 truncate">{place.name}</h3>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{place.radiusMeters}m radius</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="relative z-10 shrink-0 flex items-center justify-end" ref={menuRef}>
          {/* Menu Options */}
          <div className={`absolute right-14 top-1/2 -translate-y-1/2 flex items-center bg-card/95 backdrop-blur-md rounded-full shadow-lg border border-border p-1 transition-all duration-300 ease-out ${isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit(); }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-foreground hover:bg-accent transition-colors shrink-0 cursor-pointer"
              title="Edit Place"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-6 bg-border mx-1" />
            <button
              onClick={handleDeleteClick}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
              title="Delete Place"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all focus:outline-none shrink-0 cursor-pointer ${isMenuOpen ? 'bg-accent/50 text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
          >
            {isMenuOpen ? <X className="w-6 h-6 animate-in spin-in-90 duration-200" /> : <MoreVertical className="w-6 h-6 animate-in spin-in-[-90deg] duration-200" />}
          </button>
        </div>
      </div>
    </div>
  );
}
