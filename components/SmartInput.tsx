"use client";

import { useState, useRef, useEffect } from "react";

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
  type?: "input" | "textarea" | "select";
  rows?: number;
  required?: boolean;
  className?: string;
}

export function SmartInput({
  value,
  onChange,
  suggestions = [],
  placeholder,
  label,
  type = "input",
  rows = 2,
  required = false,
  className = "",
}: SmartInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase() !== value.toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>}
      
      {type === "select" ? (
        <div className="relative">
          <select
            required={required}
            value={value}
            onChange={(e) => {
              if (e.target.value === "custom_input") {
                const custom = prompt("Masukkan Penanggung Jawab baru:");
                if (custom) onChange(custom);
              } else {
                onChange(e.target.value);
              }
            }}
            className={`w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm outline-none focus:border-black text-zinc-900 ${className}`}
          >
            <option value="" disabled>{placeholder || "Pilih..."}</option>
            {suggestions.map((suggestion, i) => (
              <option key={i} value={suggestion}>
                {suggestion}
              </option>
            ))}
            {value !== "" && !suggestions.includes(value) && (
              <option value={value}>{value}</option>
            )}
            <option value="custom_input">-- Ketik Manual --</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      ) : type === "input" ? (
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className={`w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm outline-none focus:border-black text-zinc-900 ${className}`}
          placeholder={placeholder}
        />
      ) : (
        <textarea
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className={`w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm outline-none focus:border-black text-zinc-900 ${className}`}
          placeholder={placeholder}
        />
      )}

      {type !== "select" && showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-xl backdrop-blur-sm">
          <div className="mb-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Saran Sebelumnya
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filteredSuggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-black hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {!showSuggestions && filteredSuggestions.length > 0 && (
         <div className="mt-1.5 flex flex-wrap gap-1 overflow-hidden max-h-6">
            {filteredSuggestions.slice(0, 3).map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="whitespace-nowrap rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
            {filteredSuggestions.length > 3 && (
              <span className="text-[10px] text-zinc-400 flex items-center px-1">+{filteredSuggestions.length - 3}</span>
            )}
         </div>
      )}
    </div>
  );
}
