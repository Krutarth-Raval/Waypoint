"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-300 md:hidden"
        onClick={onClose}
      />
      
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-[32px] p-6 pb-safe shadow-2xl animate-in slide-in-from-bottom-full duration-300 md:hidden max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
