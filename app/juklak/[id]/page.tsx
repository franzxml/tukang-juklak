"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";

interface Activity {
  id: number;
  waktu_kegiatan: string;
  waktu_selesai: string | null;
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
  waktu_selesai?: string | null;
  dresscode?: string;
  owner_id: number;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default function JuklakDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [event, setEvent] = useState<JuklakEvent | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: event?.judul_acara || "Juklak",
  });

  const calculateDuration = (start: string, end: string | null) => {
    if (!start || end === null) return "Hingga Selesai";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60;

    return `${diffMins} menit`;
  };

  const formatList = (val: string) => {
    if (!val) return "-";
    const items = val.split(/, |\n/).filter(p => !!p);
    return (
      <div className="flex flex-col gap-3 min-w-[120px]">
        {items.map((item, i) => {
          const match = item.match(/^\((.*?)\)\s*(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex gap-2">
                {items.length > 1 && <span className="text-zinc-400 font-bold shrink-0">{i + 1}.</span>}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 leading-tight">
                    {match[1]}
                  </span>
                  <span className="font-semibold text-zinc-900 leading-tight">
                    {match[2]}
                  </span>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="flex gap-2 leading-tight font-semibold text-zinc-900">
              {items.length > 1 && <span className="text-zinc-400 font-bold shrink-0">{i + 1}.</span>}
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatTeknis = (val: string, pjValue: string) => {
    if (!val) return "-";
    const items = val.split("\n").filter(p => !!p);
    const availablePjs = (pjValue || "").split(", ").filter(p => !!p).sort((a, b) => b.length - a.length);

    return (
      <div className="flex flex-col gap-3 min-w-[120px]">
        {items.map((item, i) => {
          const matchingPj = availablePjs.find(pj => item.startsWith(pj));
          
          if (matchingPj) {
            let instruction = item.substring(matchingPj.length);
            if (instruction.startsWith(" ")) instruction = instruction.substring(1);

            return (
              <div key={i} className="flex gap-2 text-zinc-900 leading-tight">
                {items.length > 1 && <span className="text-zinc-400 font-bold shrink-0">{i + 1}.</span>}
                <div className="block">
                  <span className="font-bold">{matchingPj}</span>
                  {instruction && <span className="font-normal text-zinc-700"> {instruction}</span>}
                </div>
              </div>
            );
          }

          const match = item.match(/^\((.*?)\)\s*(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex gap-2 text-zinc-900 leading-tight">
                {items.length > 1 && <span className="text-zinc-400 font-bold shrink-0">{i + 1}.</span>}
                <div className="block">
                  <span className="font-bold">({match[1]})</span>
                  <span className="font-normal text-zinc-700"> {match[2]}</span>
                </div>
              </div>
            );
          }
          
          return (
            <div key={i} className="flex gap-2 leading-tight font-normal text-zinc-700">
              {items.length > 1 && <span className="text-zinc-400 font-bold shrink-0">{i + 1}.</span>}
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const resActivities = await fetch(`/api/juklak/${id}/activities`);
        if (!resActivities.ok) throw new Error("Gagal mengambil data kegiatan.");
        const dataActivities = await resActivities.json();
        setActivities(dataActivities);

        const resEvents = await fetch("/api/juklak");
        const dataEvents = await resEvents.json();
        const currentEvent = dataEvents.find((e: any) => e.id === parseInt(id));
        
        if (!currentEvent) throw new Error("Juklak tidak ditemukan.");
        setEvent(currentEvent);
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
        <p className="text-sm font-medium">Memuat detail juklak...</p>
      </div>
    </div>
  );
  if (error) return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans">
      <nav className="print:hidden sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-500 hover:text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-black">Detail Juklak</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/juklak/${id}/edit`}
              className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-zinc-50"
            >
              Edit Juklak
            </Link>
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-zinc-50"
            >
              Export PDF
            </button>
            <Link
              href={`/share/${id}`}
              className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
            >
              Lihat Link Publik
            </Link>
          </div>
        </div>
      </nav>

      {/* Printable Content Area */}
      <main ref={printRef} className="mx-auto max-w-5xl px-6 pt-10 print:p-10 print:bg-white text-zinc-900">
        <div className="mb-10 border-b border-zinc-200 pb-10 print:border-zinc-300">
          <div className="mb-4 inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600 print:bg-zinc-100 print:text-zinc-600">
            Juklak Acara
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-black print:text-black mb-6">
            {event?.judul_acara}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-medium">Tanggal Acara</span>
              <span className="font-bold text-black">
                {event && new Date(event.tanggal_acara).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-medium">Tempat</span>
              <span className="font-bold text-black">{event?.tempat || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-medium">Waktu Keseluruhan</span>
              <span className="font-bold text-black">
                {event?.waktu_mulai?.substring(0, 5) || "??:??"} - {event?.waktu_selesai ? event.waktu_selesai.substring(0, 5) : "Selesai"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-medium">Dresscode</span>
              <span className="font-bold text-black">{event?.dresscode || "-"}</span>
            </div>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            Belum ada rincian kegiatan.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm print:border-zinc-300 print:shadow-none">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 print:bg-zinc-100 print:text-zinc-600">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase">Waktu</th>
                  <th className="px-6 py-4 font-bold uppercase">Kegiatan</th>
                  <th className="px-6 py-4 font-bold uppercase">Durasi</th>
                  <th className="px-6 py-4 font-bold uppercase">Tempat</th>
                  <th className="px-6 py-4 font-bold uppercase">PJ</th>
                  <th className="px-6 py-4 font-bold uppercase">Perlengkapan</th>
                  <th className="px-6 py-4 font-bold uppercase">Teknis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 print:divide-zinc-300">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-zinc-50 print:hover:bg-transparent">
                    <td className="whitespace-nowrap px-6 py-6 font-bold text-black print:text-black">
                      {activity.waktu_kegiatan.substring(0, 5)} - {activity.waktu_selesai ? activity.waktu_selesai.substring(0, 5) : "Selesai"}
                    </td>
                    <td className="px-6 py-6 font-semibold text-black print:text-black">
                      {activity.nama_kegiatan}
                    </td>
                    <td className="px-6 py-6 font-medium text-zinc-600">
                      {calculateDuration(activity.waktu_kegiatan, activity.waktu_selesai)}
                    </td>
                    <td className="px-6 py-6 text-zinc-600 print:text-zinc-600">
                      {activity.tempat || "-"}
                    </td>
                    <td className="px-6 py-6 text-zinc-600 print:text-zinc-600">
                      {formatList(activity.penanggung_jawab)}
                    </td>
                    <td className="px-6 py-6 text-zinc-600 print:text-zinc-600">
                      {formatList(activity.perlengkapan)}
                    </td>
                    <td className="px-6 py-6 text-zinc-600 print:text-zinc-600">
                      {formatTeknis(activity.teknis, activity.penanggung_jawab)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer for Print Only */}
        <div className="hidden print:block mt-12 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400">
          Dicetak melalui aplikasi Tukang Juklak pada {new Date().toLocaleDateString("id-ID")}
        </div>
      </main>
    </div>
  );
}
