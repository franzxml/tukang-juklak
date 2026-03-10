"use client";

import { useEffect, useState } from "react";
import { SmartInput } from "./SmartInput";

interface PJ {
  bidang: string;
  nama: string;
}

interface PJInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  label?: string;
}

export function PJInput({ value, onChange, suggestions = [], label = "PJ" }: PJInputProps) {
  const [pjs, setPjs] = useState<PJ[]>([{ bidang: "", nama: "" }]);

  // Parse initial value: (Bidang) Nama, (Bidang) Nama
  useEffect(() => {
    if (value) {
      const parts = value.split(", ").filter(p => !!p);
      const parsedPjs = parts.map(part => {
        const match = part.match(/^\((.*?)\)\s*(.*)$/);
        if (match) {
          return { bidang: match[1], nama: match[2] };
        } else {
          return { bidang: "", nama: part };
        }
      });
      if (parsedPjs.length > 0) {
        setPjs(parsedPjs);
      } else {
        setPjs([{ bidang: "", nama: "" }]);
      }
    } else {
      setPjs([{ bidang: "", nama: "" }]);
    }
  }, [value]);

  const updateValue = (newPjs: PJ[]) => {
    const formatted = newPjs
      .filter(pj => pj.bidang || pj.nama)
      .map(pj => `(${pj.bidang}) ${pj.nama}`)
      .join(", ");
    onChange(formatted);
  };

  const handlePjChange = (index: number, field: keyof PJ, val: string) => {
    const newPjs = [...pjs];
    newPjs[index] = { ...newPjs[index], [field]: val };
    setPjs(newPjs);
    updateValue(newPjs);
  };

  const addPj = () => {
    const newPjs = [...pjs, { bidang: "", nama: "" }];
    setPjs(newPjs);
    updateValue(newPjs);
  };

  const removePj = (index: number) => {
    if (pjs.length === 1) {
      const newPjs = [{ bidang: "", nama: "" }];
      setPjs(newPjs);
      updateValue(newPjs);
      return;
    }
    const newPjs = pjs.filter((_, i) => i !== index);
    setPjs(newPjs);
    updateValue(newPjs);
  };

  // Suggestions for bidang and nama derived from existing penanggung_jawab suggestions
  const bidangSuggestions = Array.from(new Set(suggestions
    .flatMap(s => s.split(", ").map(part => {
      const match = part.match(/^\((.*?)\)/);
      return match ? match[1] : null;
    }))
    .filter((s): s is string => !!s)));

  const namaSuggestions = Array.from(new Set(suggestions
    .flatMap(s => s.split(", ").map(part => {
      const match = part.match(/^\(.*?\)\s*(.*)$/);
      return match ? match[1] : part;
    }))
    .filter(s => !!s)));

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>}
      {pjs.map((pj, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SmartInput
              placeholder="Bidang (Contoh: Acara)"
              value={pj.bidang}
              onChange={(val) => handlePjChange(index, "bidang", val)}
              suggestions={bidangSuggestions}
              className="!py-1.5"
            />
            <div className="flex gap-2">
              <SmartInput
                placeholder="Nama PJ (Contoh: Budi)"
                value={pj.nama}
                onChange={(val) => handlePjChange(index, "nama", val)}
                suggestions={namaSuggestions}
                className="flex-1 !py-1.5"
              />
              {pjs.length > 0 && (
                <button
                  type="button"
                  onClick={() => removePj(index)}
                  className="rounded-lg bg-zinc-100 px-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addPj}
        className="self-start text-[10px] font-medium text-zinc-500 hover:text-zinc-800"
      >
        + Tambah PJ
      </button>
    </div>
  );
}
