"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, MoreVertical, Trash2, X } from "lucide-react";
import { completeTask } from "@/app/actions";

export default function TaskCard({ task, onDelete, isDeleting, isHighlighted = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
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

  async function handleComplete() {
    setIsCompleting(true);
    
    if (typeof window !== 'undefined') {
      const sound = localStorage.getItem('task_done_sound') || 'sound-1';
      if (sound !== 'none') {
        const audio = new Audio(`/Sounds/MarkAsRead/${sound}.mp3`);
        audio.play().catch(e => console.error(e));
      }
    }

    await completeTask(task.id);
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
      handleComplete();
    } else if (offset < -60) {
      onDelete();
    }
    setOffset(0);
    setStartX(null);
  };

  return (
    <div className={`relative w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ${(isDeleting || isCompleting) ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Background actions revealed on swipe */}
      <div className={`absolute inset-0 flex rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-opacity duration-200 ${startX !== null || offset !== 0 ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left half: Mark Done (Blue) */}
        <div className="flex-1 bg-blue-500/90 flex items-center pl-6 md:pl-8 justify-start">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        {/* Right half: Delete (Red) */}
        <div className="flex-1 bg-red-500/90 flex items-center pr-6 md:pr-8 justify-end">
          <Trash2 className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Foreground Card */}
      <div 
        className={`p-5 md:p-6 transition-colors group relative flex flex-col justify-between rounded-[1.5rem] md:rounded-[2rem] w-full border bg-card
          ${isHighlighted ? 'border-primary/30 shadow-md shadow-primary/5 scale-[1.01]' : 'border-border/50 hover:border-primary/50 shadow-sm'}
          ${startX === null ? 'transition-transform duration-300 ease-out' : 'transition-none'}
        `}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tint overlay for highlighted tasks */}
        {isHighlighted && <div className="absolute inset-0 bg-primary/5 rounded-[1.5rem] md:rounded-[2rem] pointer-events-none" />}
        
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none -mr-10 -mt-10" />
        
        <div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className={`font-bold text-lg md:text-xl transition-colors pr-10 ${isHighlighted ? 'text-foreground' : 'text-foreground group-hover:text-primary'}`}>{task.title}</h3>
            
            {/* Desktop Menu */}
            <div className="absolute right-0 top-0 flex items-center justify-end" ref={menuRef}>
              <div className={`absolute right-10 top-1/2 -translate-y-1/2 flex items-center bg-card/95 backdrop-blur-md rounded-full shadow-lg border border-border p-1 transition-all duration-300 ease-out ${isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <button
                  onClick={handleComplete}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors shrink-0 cursor-pointer mr-1"
                  title="Mark Done"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-border" />
                <button
                  onClick={handleDeleteClick}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer ml-1"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all focus:outline-none shrink-0 -mr-2 cursor-pointer ${isMenuOpen ? 'bg-accent/50 text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
              >
                {isMenuOpen ? <X className="w-5 h-5 animate-in spin-in-90 duration-200" /> : <MoreVertical className="w-5 h-5 animate-in spin-in-[-90deg] duration-200" />}
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-5 relative z-10">{task.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
