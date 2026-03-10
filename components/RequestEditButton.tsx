"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RequestEditButtonProps {
  eventId: number;
  isLoggedIn: boolean;
}

export default function RequestEditButton({ eventId, isLoggedIn }: RequestEditButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRequest = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/request-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Permintaan berhasil terkirim!");
      } else {
        setMessage(data.error || "Gagal mengirim permintaan.");
      }
    } catch (err) {
      setMessage("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRequest}
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Memproses..." : isLoggedIn ? "Ajukan Akses Edit" : "Masuk untuk Edit"}
      </button>
      {message && (
        <p className={`text-xs ${message.includes("Gagal") || message.includes("kesalahan") ? "text-red-500" : "text-zinc-500"} text-center`}>
          {message}
        </p>
      )}
    </div>
  );
}
