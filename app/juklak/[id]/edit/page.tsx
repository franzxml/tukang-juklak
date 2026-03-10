"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TimeInput } from "@/components/TimeInput";
import { SmartInput } from "@/components/SmartInput";
import { PJInput } from "@/components/PJInput";
import { PerlengkapanInput } from "@/components/PerlengkapanInput";
import { TeknisInput } from "@/components/TeknisInput";

interface Activity {
  id?: number;
  waktu_kegiatan: string;
  waktu_selesai: string;
  nama_kegiatan: string;
  tempat: string;
  penanggung_jawab: string;
  perlengkapan: string;
  teknis: string;
}

interface JuklakEvent {
  id: number;
  judul_acara: string;
  tanggal_acara: string;
  tempat?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  dresscode?: string;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditJuklakPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [judulAcara, setJudulAcara] = useState("");
  const [tanggalAcara, setTanggalAcara] = useState("");
  const [tempatList, setTempatList] = useState<string[]>([""]);
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesaiEvent, setWaktuSelesaiEvent] = useState("");
  const [isSelesaiEvent, setIsSelesaiEvent] = useState(false);
  const [dresscode, setDresscode] = useState("");
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesSelesai, setActivitiesSelesai] = useState<boolean[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
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

  const calculateDuration = (start: string, end: string, isUntilFinished?: boolean) => {
    if (isUntilFinished) return "Hingga Selesai";
    if (!start || !end) return "-";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60; // Handle cross-day

    return `${diffMins} menit`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [resEvent, resActivities, resSuggestions] = await Promise.all([
          fetch(`/api/juklak/${id}`),
          fetch(`/api/juklak/${id}/activities`),
          fetch(`/api/suggestions`)
        ]);

        if (!resEvent.ok) throw new Error("Gagal mengambil data acara.");
        const eventData: JuklakEvent = await resEvent.json();
        setJudulAcara(eventData.judul_acara);
        setTanggalAcara(new Date(eventData.tanggal_acara).toISOString().split('T')[0]);
        
        // Handle multiple locations
        const rawTempat = eventData.tempat || "";
        if (rawTempat.includes(" & ")) {
          setTempatList(rawTempat.split(" & "));
        } else if (rawTempat) {
          setTempatList([rawTempat]);
        } else {
          setTempatList([""]);
        }

        setWaktuMulai(eventData.waktu_mulai || "");
        
        if (eventData.waktu_selesai === null || eventData.waktu_selesai === undefined) {
          setIsSelesaiEvent(true);
          setWaktuSelesaiEvent("");
        } else {
          setIsSelesaiEvent(false);
          setWaktuSelesaiEvent(eventData.waktu_selesai);
        }
        
        setDresscode(eventData.dresscode || "");

        if (!resActivities.ok) throw new Error("Gagal mengambil data kegiatan.");
        const activitiesData: Activity[] = await resActivities.json();
        setActivities(activitiesData);
        setActivitiesSelesai(activitiesData.map(a => a.waktu_selesai === null));

        if (resSuggestions.ok) {
          const suggestionsData = await resSuggestions.json();
          setSuggestions(suggestionsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

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
    setActivities([
      ...activities,
      { waktu_kegiatan: "", waktu_selesai: "", nama_kegiatan: "", tempat: "", penanggung_jawab: "", perlengkapan: "", teknis: "" }
    ]);
    setActivitiesSelesai([...activitiesSelesai, false]);
  };

  const handleRemoveActivity = async (index: number) => {
    const activity = activities[index];
    if (activity.id) {
      try {
        await fetch(`/api/juklak/${id}/activities?activityId=${activity.id}`, { method: "DELETE" });
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

  const handleActivityChange = (index: number, field: keyof Activity, value: string) => {
    const newActivities = [...activities];
    (newActivities[index] as any)[field] = value;
    setActivities(newActivities);
  };

  const handleActivitySelesaiChange = (index: number, checked: boolean) => {
    const newSelesai = [...activitiesSelesai];
    newSelesai[index] = checked;
    setActivitiesSelesai(newSelesai);
    
    if (checked) {
      handleActivityChange(index, "waktu_selesai", "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const combinedTempat = tempatList.filter(t => t.trim() !== "").join(" & ");

      const resEvent = await fetch(`/api/juklak/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          judul_acara: judulAcara, 
          tanggal_acara: tanggalAcara,
          tempat: combinedTempat,
          waktu_mulai: waktuMulai,
          waktu_selesai: isSelesaiEvent ? null : waktuSelesaiEvent,
          dresscode
        }),
      });

      if (!resEvent.ok) throw new Error("Gagal memperbarui data acara.");

      const activityPromises = activities.map((activity, index) => {
        const payload = {
          ...activity,
          waktu_selesai: activitiesSelesai[index] ? null : activity.waktu_selesai
        };

        if (activity.id) {
          return fetch(`/api/juklak/${id}/activities`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          return fetch(`/api/juklak/${id}/activities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      });

      await Promise.all(activityPromises);
      
      router.push(`/juklak/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-black"></div>
        <p className="text-sm font-medium">Memuat data juklak...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans text-zinc-900">
      <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/juklak/${id}`} className="text-zinc-500 hover:text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-black">Edit Juklak</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
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
              <div className="grid grid-cols-2 gap-4">
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
                    value={isSelesaiEvent ? "" : (waktuSelesaiEvent ? waktuSelesaiEvent.substring(0, 5) : "")}
                    onChange={(val) => setWaktuSelesaiEvent(val)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Dresscode</label>
                <input
                  type="text"
                  value={dresscode}
                  onChange={(e) => setDresscode(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 outline-none focus:border-black text-zinc-900"
                  placeholder="Misal: Batik, Bebas Rapi"
                />
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

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kegiatan #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(index)}
                      className="text-zinc-400 hover:text-red-500 transition-colors text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Mulai</label>
                      <TimeInput
                        required
                        value={activity.waktu_kegiatan.substring(0,5)}
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
                        value={activitiesSelesai[index] ? "" : (activity.waktu_selesai?.substring(0,5) || "")}
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

                    <div className="md:col-span-2">
                      <SmartInput
                        label="Nama Kegiatan"
                        required
                        value={activity.nama_kegiatan}
                        onChange={(val) => handleActivityChange(index, "nama_kegiatan", val)}
                        suggestions={suggestions.nama_kegiatan}
                        placeholder="Pembukaan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <PJInput
                        label="PJ"
                        value={activity.penanggung_jawab}
                        onChange={(val) => handleActivityChange(index, "penanggung_jawab", val)}
                        suggestions={allPjSuggestions}
                      />
                    </div>

                    <div className="md:col-span-4 grid gap-6 md:grid-cols-2">
                      <PerlengkapanInput
                        label="Perlengkapan"
                        value={activity.perlengkapan}
                        onChange={(val) => handleActivityChange(index, "perlengkapan", val)}
                        suggestions={allPerlengkapanSuggestions}
                        placeholder="Contoh: Mic, Speaker"
                      />
                      <div className="flex flex-col">
                        <TeknisInput
                          value={activity.teknis}
                          pjValue={activity.penanggung_jawab}
                          onChange={(val) => handleActivityChange(index, "teknis", val)}
                          suggestions={suggestions.teknis}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
