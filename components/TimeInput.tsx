"use client";

import { useState, useEffect } from "react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function TimeInput({ value, onChange, disabled, className, required }: TimeInputProps) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":");
      setHour(h.padStart(2, "0"));
      setMinute(m.substring(0, 2).padStart(2, "0"));
    } else {
      setHour("");
      setMinute("");
    }
  }, [value]);

  const updateTime = (newHour: string, newMinute: string) => {
    if (newHour && newMinute) {
      onChange(`${newHour}:${newMinute}`);
    } else {
      onChange("");
    }
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateTime(newHour, minute);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateTime(hour, newMinute);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <select
        required={required}
        disabled={disabled}
        value={hour}
        onChange={(e) => handleHourChange(e.target.value)}
        className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-2.5 text-sm outline-none focus:border-black text-zinc-900 disabled:opacity-50"
      >
        <option value="">Jam</option>
        {Array.from({ length: 24 }).map((_, i) => {
          const h = i.toString().padStart(2, "0");
          return <option key={h} value={h}>{h}</option>;
        })}
      </select>
      <span className="text-zinc-400 font-bold">:</span>
      <select
        required={required}
        disabled={disabled}
        value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-2.5 text-sm outline-none focus:border-black text-zinc-900 disabled:opacity-50"
      >
        <option value="">Menit</option>
        {Array.from({ length: 60 }).map((_, i) => {
          const m = i.toString().padStart(2, "0");
          return <option key={m} value={m}>{m}</option>;
        })}
      </select>
    </div>
  );
}
