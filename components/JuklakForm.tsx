"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TimeInput } from "@/components/TimeInput";
import { SmartInput } from "@/components/SmartInput";
import { PJInput } from "@/components/PJInput";
import { PerlengkapanInput } from "@/components/PerlengkapanInput";
import { TeknisInput } from "@/components/TeknisInput";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Activity, JuklakEvent, Dresscode } from "@/types/juklak";

interface JuklakFormProps {
  initialEvent?: JuklakEvent;
  initialActivities?: Activity[];
  isEdit?: boolean;
  eventId?: string;
  onSuccess?: () => void;
}

export function JuklakForm({
  initialEvent,
  initialActivities,
  isEdit = false,
  eventId,
}: JuklakFormProps) {
  const router = useRouter();
  
  // Event Info State
  const [judulAcara, setJudulAcara] = useState(initialEvent?.judul_acara || "");
  const [tanggalAcara, setTanggalAcara] = useState(initialEvent?.tanggal_acara || "");
  const [tempatList, setTempatList] = useState<string[]>(
    initialEvent?.tempat?.includes(" & ") 
      ? initialEvent.tempat.split(" & ") 
      : (initialEvent?.tempat ? [initialEvent.tempat] : [""])
  );
  const [waktuMulai, setWaktuMulai] = useState(initialEvent?.waktu_mulai || "");
  const [waktuSelesai, setWaktuSelesai] = useState(initialEvent?.waktu_selesai || "");
  const [isSelesaiEvent, setIsSelesaiEvent] = useState(initialEvent?.waktu_selesai === null);
  
  const [dresscode, setDresscode] = useState<Dresscode>(() => {
    try {
      const parsed = JSON.parse(initialEvent?.dresscode || "{}");
      return {
        baju: parsed.baju || "",
        celana: parsed.celana || "",
        aksesoris: parsed.aksesoris || ""
      };
    } catch {
      return { baju: initialEvent?.dresscode || "", celana: "", aksesoris: "" };
    }
  });

  // Activities State
  const [activities, setActivities] = useState<Activity[]>(
    initialActivities || [
      { 
        tempId: Math.random().toString(36).substring(2, 9), 
        waktu_kegiatan: "", 
        waktu_selesai: "", 
        nama_kegiatan: "", 
        tempat: "", 
        penanggung_jawab: "", 
        perlengkapan: "", 
        teknis: "" 
      }
    ]
  );
  
  const [activitiesSelesai, setActivitiesSelesai] = useState<boolean[]>(
    initialActivities ? initialActivities.map(a => a.waktu_selesai === null) : [false]
  );

  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allPjSuggestions = useMemo(() => {
    return Array.from(new Set([
      ...(suggestions.penanggung_jawab || []),
      ...activities.map(a => a.penanggung_jawab).filter(p => !!p)
    ]));
  }, [suggestions.penanggung_jawab, activities]);

  const allPerlengkapanSuggestions = useMemo(() => {
    return Array.from(new Set([
      ...(suggestions.perlengkapan || []),
      ...activities.flatMap(a => (a.perlengkapan || "").split(", ").filter(p => !!p))
    ]));
  }, [suggestions.perlengkapan, activities]);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await fetch("/api/suggestions");
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Gagal mengambil saran:", err);
      }
    }
    fetchSuggestions();
  }, []);

  const calculateDuration = (start: string, end: string | null, isUntilFinished?: boolean) => {
    if (isUntilFinished) return "Hingga Selesai";
    if (!start || !end) return "-";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60; // Handle cross-day

    return `${diffMins} menit`;
  };

  const handleAddTempat = () => {
    setTempatList([...tempatList, ""]);
  };

  const handleRemoveTempat = (index: number) => {
    if (tempatList.length === 1) return;
    const newTempatList = [...tempatList];
    newTempatList.splice(index, 1);
    setTempatList(newTempatList);
  };

  const handleTempatChange = (index: number, value: string) => {
    const newTempatList = [...tempatList];
    newTempatList[index] = value;
    setTempatList(newTempatList);
  };

  const handleAddActivity = () => {
    const lastActivity = activities[activities.length - 1];
    setActivities([
      ...activities,
      { 
        tempId: Math.random().toString(36).substring(2, 9),
        waktu_kegiatan: lastActivity ? (lastActivity.waktu_selesai?.substring(0,5) || "") : "", 
        waktu_selesai: "", 
        nama_kegiatan: "", 
        tempat: lastActivity ? (lastActivity.tempat || "") : "", 
        penanggung_jawab: lastActivity ? (lastActivity.penanggung_jawab || "") : "", 
        perlengkapan: lastActivity ? (lastActivity.perlengkapan || "") : "", 
        teknis: "" 
      }
    ]);
    setActivitiesSelesai([...activitiesSelesai, false]);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const selesai = Array.from(activitiesSelesai);
    const [reorderedSelesai] = selesai.splice(result.source.index, 1);
    selesai.splice(result.destination.index, 0, reorderedSelesai);
    
    setActivities(items);
    setActivitiesSelesai(selesai);
  };

  const handleRemoveActivity = async (index: number) => {
    if (activities.length === 1) return;
    
    const activity = activities[index];
    if (isEdit && eventId && activity.id) {
      try {
        await fetch(`/api/juklak/${eventId}/activities?activityId=${activity.id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Gagal menghapus kegiatan dari database");
      }
    }

    const newActivities = [...activities];
    newActivities.splice(index, 1);
    setActivities(newActivities);
    
    const newSelesai = [...activitiesSelesai];
    newSelesai.splice(index, 1);
    setActivitiesSelesai(newSelesai);
  };

  const handleActivityChange = (index: number, field: keyof Activity, value: any) => {
    const newActivities = [...activities];
    (newActivities[index] as any)[field] = value;
    setActivities(newActivities);
  };

  const handleActivitySelesaiChange = (index: number, checked: boolean) => {
    const newSelesai = [...activitiesSelesai];
    newSelesai[index] = checked;
    setActivitiesSelesai(newSelesai);
    
    if (checked) {
      handleActivityChange(index, "waktu_selesai", null);
    }
  };

  const handleCopyFromPrevious = (index: number, fields: (keyof Activity)[], fromIndex?: number) => {
    const sourceIndex = fromIndex !== undefined ? fromIndex : index - 1;
    if (sourceIndex < 0 || sourceIndex >= index) return;
    
    const prevActivity = activities[sourceIndex];
    const newActivities = [...activities];
    fields.forEach(field => {
      (newActivities[index] as any)[field] = (prevActivity as any)[field] || "";
    });
    setActivities(newActivities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const combinedTempat = tempatList.filter(t => t.trim() !== "").join(" & ");
      
      const eventPayload = { 
        judul_acara: judulAcara, 
        tanggal_acara: tanggalAcara,
        tempat: combinedTempat,
        waktu_mulai: waktuMulai,
        waktu_selesai: isSelesaiEvent ? null : waktuSelesai,
        dresscode: JSON.stringify(dresscode)
      };

      let currentEventId = eventId;

      if (isEdit && eventId) {
        const resEvent = await fetch(`/api/juklak/${eventId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventPayload),
        });
        if (!resEvent.ok) throw new Error("Gagal memperbarui data acara utama.");
      } else {
        const resEvent = await fetch("/api/juklak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventPayload),
        });
        if (!resEvent.ok) throw new Error("Gagal menyimpan data acara utama.");
        const eventData = await resEvent.json();
        currentEventId = eventData.id;
      }

      // Simpan Semua Aktivitas
      const activityPromises = activities.map((activity, index) => {
        const payload = {
          ...activity,
          waktu_selesai: activitiesSelesai[index] ? null : activity.waktu_selesai,
          position: index
        };

        if (isEdit && activity.id) {
          return fetch(`/api/juklak/${currentEventId}/activities`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          return fetch(`/api/juklak/${currentEventId}/activities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      });

      const activityResponses = await Promise.all(activityPromises);
      if (activityResponses.some((r) => !r.ok)) {
        throw new Error("Beberapa kegiatan gagal disimpan, silakan periksa kembali.");
      }

      router.push(isEdit ? `/juklak/${currentEventId}` : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans text-zinc-900">
      <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={isEdit ? `/juklak/${eventId}` : "/dashboard"} className="text-zinc-500 hover:text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-black">{isEdit ? "Edit Juklak" : "Buat Juklak Baru"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddActivity}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Baris
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : (isEdit ? "Simpan Perubahan" : "Simpan Juklak")}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 pt-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-black">Informasi Acara</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700">Judul Acara</label>
                <input
                  type="text"
                  required
                  value={judulAcara}
                  onChange={(e) => setJudulAcara(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 outline-none focus:border-black text-zinc-900"
                  placeholder="Contoh: Malam Keakraban 2024"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Tanggal Acara</label>
                <input
                  type="date"
                  required
                  value={tanggalAcara}
                  onChange={(e) => setTanggalAcara(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 outline-none focus:border-black text-zinc-900"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">Tempat</label>
                  <button
                    type="button"
                    onClick={handleAddTempat}
                    className="text-xs font-bold text-zinc-500 hover:text-black"
                  >
                    + Tambah Lokasi
                  </button>
                </div>
                {tempatList.map((tempat, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tempat}
                      onChange={(e) => handleTempatChange(index, e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 outline-none focus:border-black text-zinc-900"
                      placeholder={index === 0 ? "Lokasi Utama" : "Lokasi Tambahan (Misal: Zoom)"}
                    />
                    {tempatList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTempat(index)}
                        className="text-zinc-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Waktu Mulai</label>
                  <TimeInput
                    value={waktuMulai}
                    onChange={(val) => setWaktuMulai(val)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-700">Waktu Selesai</label>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-zinc-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelesaiEvent}
                        onChange={(e) => setIsSelesaiEvent(e.target.checked)}
                        className="h-3 w-3 rounded border-zinc-300 accent-black"
                      />
                      Hingga Selesai
                    </label>
                  </div>
                  <TimeInput
                    disabled={isSelesaiEvent}
                    value={isSelesaiEvent ? "" : (waktuSelesai || "")}
                    onChange={(val) => setWaktuSelesai(val)}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700">Dresscode</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Baju</span>
                    <input
                      type="text"
                      value={dresscode.baju || ""}
                      onChange={(e) => setDresscode({ ...dresscode, baju: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-zinc-900 transition-all"
                      placeholder="Misal: Kemeja Putih"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Celana</span>
                    <input
                      type="text"
                      value={dresscode.celana || ""}
                      onChange={(e) => setDresscode({ ...dresscode, celana: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-zinc-900 transition-all"
                      placeholder="Misal: Celana Bahan Hitam"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Aksesoris</span>
                    <input
                      type="text"
                      value={dresscode.aksesoris || ""}
                      onChange={(e) => setDresscode({ ...dresscode, aksesoris: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-zinc-900 transition-all"
                      placeholder="Misal: Dasi Merah"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">Susunan Kegiatan</h2>
              <button
                type="button"
                onClick={handleAddActivity}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:underline"
              >
                + Tambah Baris
              </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="activities">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {activities.map((activity, index) => (
                      <Draggable key={activity.tempId} draggableId={activity.tempId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group relative rounded-2xl border ${snapshot.isDragging ? 'border-black shadow-lg z-50' : 'border-zinc-200'} bg-white p-6 shadow-sm transition-all hover:border-zinc-300`}
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="cursor-grab active:cursor-grabbing rounded p-1 hover:bg-zinc-100 text-zinc-400"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                  </svg>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kegiatan #{index + 1}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyFromPrevious(index, ["tempat", "penanggung_jawab", "perlengkapan"])}
                                    className="text-[10px] font-bold uppercase tracking-tight text-zinc-400 hover:text-black"
                                    title="Salin Tempat, PJ, & Perlengkapan dari baris sebelumnya"
                                  >
                                    Salin dari # {index}
                                  </button>
                                )}
                                {activities.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveActivity(index)}
                                    className="text-zinc-400 hover:text-red-500 transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid gap-6 md:grid-cols-4">
                              <div className="md:col-span-4">
                                <SmartInput
                                  label="Nama Kegiatan"
                                  required
                                  value={activity.nama_kegiatan}
                                  onChange={(val) => handleActivityChange(index, "nama_kegiatan", val)}
                                  suggestions={suggestions.nama_kegiatan}
                                  placeholder="Pembukaan"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-zinc-500">Mulai</label>
                                <TimeInput
                                  required
                                  value={activity.waktu_kegiatan}
                                  onChange={(val) => handleActivityChange(index, "waktu_kegiatan", val)}
                                />
                              </div>
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="block text-xs font-medium text-zinc-500">Selesai</label>
                                  <label className="flex items-center gap-1 text-[9px] font-bold uppercase text-zinc-400 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={activitiesSelesai[index]}
                                      onChange={(e) => handleActivitySelesaiChange(index, e.target.checked)}
                                      className="h-2.5 w-2.5 rounded border-zinc-300 accent-black"
                                    />
                                    Selesai
                                  </label>
                                </div>
                                <TimeInput
                                  required={!activitiesSelesai[index]}
                                  disabled={activitiesSelesai[index]}
                                  value={activitiesSelesai[index] ? "" : (activity.waktu_selesai || "")}
                                  onChange={(val) => handleActivityChange(index, "waktu_selesai", val)}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-zinc-500">Durasi</label>
                                <div className="w-full rounded-lg border border-transparent bg-zinc-100 px-3 py-2 text-sm text-zinc-600 font-semibold">
                                  {calculateDuration(activity.waktu_kegiatan, activity.waktu_selesai, activitiesSelesai[index])}
                                </div>
                              </div>

                              <div>
                                <SmartInput
                                  label="Tempat"
                                  value={activity.tempat || ""}
                                  onChange={(val) => handleActivityChange(index, "tempat", val)}
                                  suggestions={suggestions.tempat}
                                  placeholder="Aula Utama"
                                />
                              </div>

                              <div>
                                <PJInput
                                  value={activity.penanggung_jawab || ""}
                                  onChange={(val) => handleActivityChange(index, "penanggung_jawab", val)}
                                  suggestions={allPjSuggestions}
                                />
                              </div>

                              <div className="md:col-span-2">
                                <PerlengkapanInput
                                  value={activity.perlengkapan || ""}
                                  onChange={(val) => handleActivityChange(index, "perlengkapan", val)}
                                  suggestions={allPerlengkapanSuggestions}
                                />
                              </div>

                              <div className="md:col-span-4">
                                <TeknisInput
                                  value={activity.teknis || ""}
                                  onChange={(val) => handleActivityChange(index, "teknis", val)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <button
              type="button"
              onClick={handleAddActivity}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 py-8 text-sm font-bold text-zinc-400 transition-all hover:border-zinc-400 hover:text-zinc-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Kegiatan Baru
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}
