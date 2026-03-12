"use client";

import { useEffect, useState, useRef } from "react";
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

const parsePjsFromValue = (val: string): PJ[] => {
  if (!val) return [];
  if (val.includes("\n")) {
    return val.split("\n").filter(p => !!p).map(part => {
      const match = part.match(/^\((.*?)\)\s*(.*)$/);
      return match ? { bidang: match[1], nama: match[2] } : { bidang: "", nama: part };
    });
  }

  const parts = val.split(", ").filter(p => !!p);
  const pjs: PJ[] = [];
  for (const part of parts) {
    if (part.startsWith("(")) {
      const match = part.match(/^\((.*?)\)\s*(.*)$/);
      if (match) {
        pjs.push({ bidang: match[1], nama: match[2] });
      } else {
        pjs.push({ bidang: "", nama: part });
      }
    } else {
      if (pjs.length > 0) {
        pjs[pjs.length - 1].nama += ", " + part;
      } else {
        pjs.push({ bidang: "", nama: part });
      }
    }
  }
  return pjs;
};

export function PJInput({ value, onChange, suggestions = [], label = "PJ" }: PJInputProps) {
  const [pjs, setPjs] = useState<PJ[]>([{ bidang: "", nama: "" }]);
  const prevValueRef = useRef<string | undefined>(undefined);

  // Parse initial value
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      if (value) {
        const parsedPjs = parsePjsFromValue(value);
        if (parsedPjs.length > 0) {
          setPjs(parsedPjs);
        } else {
          setPjs([{ bidang: "", nama: "" }]);
        }
      } else {
        setPjs([{ bidang: "", nama: "" }]);
      }
    }
  }, [value]);

  const updateValue = (newPjs: PJ[]) => {
    const formatted = newPjs
      .filter(pj => pj.bidang || pj.nama)
      .map(pj => `(${pj.bidang}) ${pj.nama}`)
      .join("\n");
    prevValueRef.current = formatted;
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
    .flatMap(s => parsePjsFromValue(s).map(pj => pj.bidang))
    .filter(s => !!s)));

  const namaSuggestions = Array.from(new Set(suggestions
    .flatMap(s => parsePjsFromValue(s).flatMap(pj => pj.nama.split(", ")))
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
