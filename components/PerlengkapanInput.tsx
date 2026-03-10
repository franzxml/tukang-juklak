"use client";

import { useState, useRef, useEffect } from "react";

interface PerlengkapanInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  label?: string;
  placeholder?: string;
}

export function PerlengkapanInput({
  value,
  onChange,
  suggestions = [],
  label = "Perlengkapan",
  placeholder = "Contoh: Mic, Speaker",
}: PerlengkapanInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const items = value.split(", ").filter((i) => i.trim() !== "");
      setSelectedItems(items);
    } else {
      setSelectedItems([]);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateValue = (items: string[]) => {
    onChange(items.join(", "));
  };

  const addItem = (item: string) => {
    const trimmedItem = item.trim();
    if (trimmedItem && !selectedItems.includes(trimmedItem)) {
      const newItems = [...selectedItems, trimmedItem];
      setSelectedItems(newItems);
      updateValue(newItems);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeItem = (itemToRemove: string) => {
    const newItems = selectedItems.filter((item) => item !== itemToRemove);
    setSelectedItems(newItems);
    updateValue(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addItem(inputValue);
    } else if (e.key === "Backspace" && !inputValue && selectedItems.length > 0) {
      removeItem(selectedItems[selectedItems.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !selectedItems.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  const previousSuggestions = suggestions.filter(
    (s) => !selectedItems.includes(s)
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>}
      
      <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-300 bg-zinc-50 p-2 focus-within:border-black min-h-[42px]">
        {selectedItems.map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(item)}
              className="hover:text-zinc-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none text-zinc-900 placeholder:text-zinc-400"
          placeholder={selectedItems.length === 0 ? placeholder : ""}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
          <div className="mb-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Saran Perlengkapan
          </div>
          <div className="flex flex-col gap-1">
            {filteredSuggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => addItem(suggestion)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showSuggestions && previousSuggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1 overflow-hidden max-h-12">
          {previousSuggestions.slice(0, 10).map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addItem(suggestion)}
              className="whitespace-nowrap rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
          {previousSuggestions.length > 10 && (
            <span className="text-[10px] text-zinc-400 flex items-center px-1">+{previousSuggestions.length - 10}</span>
          )}
        </div>
      )}
    </div>
  );
}
