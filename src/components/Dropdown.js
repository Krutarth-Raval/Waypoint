"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Dropdown({ value, onChange, options, placeholder = "Select an option", className = "", buttonClassName = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-background border border-border rounded-radius-md px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors flex items-center justify-between text-left ${buttonClassName}`}
      >
        <span className={`block truncate ${!selectedOption ? "text-muted-foreground" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 ml-2 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-xl border border-border rounded-radius-md shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {options.length === 0 ? (
             <div className="px-3 py-2 text-sm text-muted-foreground">No options</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors ${
                  value === opt.value ? "bg-primary/10 text-primary font-medium" : "text-sm"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
