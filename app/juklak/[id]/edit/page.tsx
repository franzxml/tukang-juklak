"use client";

import { useState, useEffect, use } from "react";
import { JuklakForm } from "@/components/JuklakForm";
import { Activity, JuklakEvent } from "@/types/juklak";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditJuklakPage({ params }: Props) {
  const { id } = use(params);
  const [event, setEvent] = useState<JuklakEvent | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [resEvent, resActivities] = await Promise.all([
          fetch(`/api/juklak/${id}`),
          fetch(`/api/juklak/${id}/activities`)
        ]);

        if (!resEvent.ok) throw new Error("Gagal mengambil data acara.");
        const eventData: JuklakEvent = await resEvent.json();
        
        // Transform date for input[type="date"]
        if (eventData.tanggal_acara) {
           eventData.tanggal_acara = new Date(eventData.tanggal_acara).toISOString().split('T')[0];
        }
        
        setEvent(eventData);

        if (!resActivities.ok) throw new Error("Gagal mengambil data kegiatan.");
        const activitiesData: Activity[] = await resActivities.json();
        setActivities(activitiesData.map(a => ({ 
          ...a, 
          tempId: a.id ? a.id.toString() : Math.random().toString(36).substring(2, 9) 
        })));

      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-black"></div>
        <p className="text-sm font-medium">Memuat data juklak...</p>
      </div>
    </div>
  );

  if (error || !event || !activities) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 font-sans p-6 text-center">
       <div className="max-w-md space-y-4">
          <p className="text-red-600 font-semibold">{error || "Data tidak ditemukan."}</p>
          <button onClick={() => window.location.reload()} className="text-sm font-bold underline hover:no-underline">Coba Lagi</button>
       </div>
    </div>
  );

  return (
    <JuklakForm 
      isEdit 
      eventId={id} 
      initialEvent={event} 
      initialActivities={activities} 
    />
  );
}
