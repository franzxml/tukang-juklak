"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { SmartInput } from "./SmartInput";

interface TeknisStep {
  pj: string;
  instruction: string;
}

interface TeknisInputProps {
  value: string;
  onChange: (value: string) => void;
  pjValue: string; // The value from PJInput (formatted as "(Bidang) Nama, (Bidang) Nama")
  label?: string;
  suggestions?: string[];
}

export function TeknisInput({ value, onChange, pjValue, label = "Teknis Pelaksanaan", suggestions = [] }: TeknisInputProps) {
  const [steps, setSteps] = useState<TeknisStep[]>([{ pj: "", instruction: "" }]);
  const prevValueRef = useRef<string | undefined>(undefined);

  // Parse available PJs from pjValue
  const availablePjs = useMemo(() => {
    if (!pjValue) return [];
    if (pjValue.includes("\n")) {
      return pjValue.split("\n").filter(p => !!p);
    }
    const parts = pjValue.split(", ").filter(p => !!p);
    const pjs: string[] = [];
    for (const part of parts) {
      if (part.startsWith("(")) {
        pjs.push(part);
      } else {
        if (pjs.length > 0) {
          pjs[pjs.length - 1] += ", " + part;
        } else {
          pjs.push(part);
        }
      }
    }
    return pjs;
  }, [pjValue]);

  // Parse initial value from parent
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      if (value) {
        const lines = value.split("\n").filter(l => !!l);
        // Sort PJs by length descending to match the longest one first
        const sortedPjs = [...availablePjs].sort((a, b) => b.length - a.length);
        
        const parsedSteps = lines.map(line => {
          const matchingPj = sortedPjs.find(pj => line.startsWith(pj));
          
          if (matchingPj) {
            let instruction = line.substring(matchingPj.length);
            // Remove exactly one leading space if it exists (the separator)
            if (instruction.startsWith(" ")) {
              instruction = instruction.substring(1);
            }
            return {
              pj: matchingPj,
              instruction: instruction
            };
          }
          return { pj: "", instruction: line };
        });
        
        if (parsedSteps.length > 0) {
          setSteps(parsedSteps);
        }
      } else {
        // If the value is empty, only reset if we don't already have an empty single step
        // to prevent losing focus or wiping out mid-typing when parent sends empty string.
        // Actually, if parent sends explicit empty string, it's safer to just set to one empty step.
        setSteps([{ pj: "", instruction: "" }]);
      }
    }
  }, [value, availablePjs]);

  const updateValue = (newSteps: TeknisStep[]) => {
    const formatted = newSteps
      .filter(step => step.pj || step.instruction)
      .map(step => {
        if (step.pj && step.instruction) {
          return `${step.pj} ${step.instruction}`;
        }
        return step.pj || step.instruction;
      })
      .join("\n");
    prevValueRef.current = formatted;
    onChange(formatted);
  };

  const handleStepChange = (index: number, field: keyof TeknisStep, val: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: val };
    setSteps(newSteps);
    updateValue(newSteps);
  };

  const addStep = () => {
    const newSteps = [...steps, { pj: "", instruction: "" }];
    setSteps(newSteps);
    updateValue(newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) {
      const newSteps = [{ pj: "", instruction: "" }];
      setSteps(newSteps);
      updateValue([]);
      return;
    }
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
    updateValue(newSteps);
  };

  return (
    <div className="flex flex-col space-y-3">
      {label && <label className="block text-xs font-medium text-zinc-500">{label}</label>}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
            <div className="flex items-center justify-between mb-1">
               <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Langkah #{index + 1}</span>
               {steps.length > 0 && (
                 <button 
                   type="button" 
                   onClick={() => removeStep(index)} 
                   className="text-zinc-400 hover:text-red-500 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
               )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                 <div className="relative">
                   <select
                     value={step.pj}
                     onChange={(e) => handleStepChange(index, "pj", e.target.value)}
                     className="w-full appearance-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-black text-zinc-900 pr-8"
                   >
                     <option value="">Pilih PJ</option>
                     {availablePjs.map((pj, i) => (
                       <option key={i} value={pj}>{pj}</option>
                     ))}
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                   </div>
                 </div>
              </div>
              <div className="sm:col-span-2">
                <SmartInput
                  placeholder="Instruksi (Contoh: Menyiapkan konsumsi)"
                  value={step.instruction}
                  onChange={(val) => handleStepChange(index, "instruction", val)}
                  suggestions={suggestions}
                  className="!py-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addStep}
        className="self-start text-[10px] font-bold uppercase tracking-tight text-zinc-500 hover:text-black transition-colors"
      >
        + Tambah Langkah Teknis
      </button>
    </div>
  );
}
