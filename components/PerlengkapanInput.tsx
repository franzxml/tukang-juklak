"use client";

import { useEffect, useState } from "react";
import { SmartInput } from "./SmartInput";

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
  const [items, setItems] = useState<string[]>([""]);

  useEffect(() => {
    if (value) {
      const parts = value.split(",").map(p => p.trim()).filter(p => !!p);
      if (parts.length > 0) {
        setItems(parts);
      } else {
        setItems([""]);
      }
    } else {
      setItems([""]);
    }
  }, [value]);

  const updateValue = (newItems: string[]) => {
    const formatted = newItems.filter(item => item.trim() !== "").join(", ");
    onChange(formatted);
  };

  const handleItemChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
    updateValue(newItems);
  };

  const addItem = () => {
    const newItems = [...items, ""];
    setItems(newItems);
    updateValue(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      const newItems = [""];
      setItems(newItems);
      updateValue(newItems);
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    updateValue(newItems);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      {label && <label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>}
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 w-full">
          <div className="flex-1">
            <SmartInput
              placeholder={index === 0 ? placeholder : "Nama perlengkapan..."}
              value={item}
              onChange={(val) => handleItemChange(index, val)}
              suggestions={suggestions}
              className="!py-1.5"
            />
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-lg bg-zinc-100 px-3 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="self-start text-[10px] font-medium text-zinc-500 hover:text-zinc-800 mt-1"
      >
        + Tambah Perlengkapan
      </button>
    </div>
  );
}
