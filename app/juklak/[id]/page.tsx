"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import DeleteJuklakButton from "@/components/DeleteJuklakButton";

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

  const formatPerlengkapan = (val: string) => {
    if (!val) return "-";
    let items: string[] = [];
    if (val.includes("\n")) {
      items = val.split("\n").filter(p => !!p);
    } else {
      items = val.split(",").map(p => p.trim()).filter(p => !!p);
    }
    return (
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 leading-tight font-semibold text-zinc-900">
            <span className="shrink-0 text-zinc-400 font-bold">-</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatList = (val: string) => {
    if (!val) return "-";
    let items: string[] = [];
    if (val.includes("\n")) {
      items = val.split("\n").filter(p => !!p);
    } else {
      const parts = val.split(", ").filter(p => !!p);
      for (const part of parts) {
        if (part.startsWith("(")) {
          items.push(part);
        } else {
          if (items.length > 0) {
            items[items.length - 1] += ", " + part;
          } else {
            items.push(part);
          }
        }
      }
    }
    return (
      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const match = item.match(/^\((.*?)\)\s*(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex flex-col leading-tight">
                <span className="font-bold text-black">{match[1]}</span>
                <span className="text-zinc-700">({match[2]})</span>
              </div>
            );
          }
          return (
            <div key={i} className="leading-tight font-semibold text-zinc-900">
              {item}
            </div>
          );
        })}
      </div>
    );
  };

  const formatTeknis = (val: string, pjValue: string) => {
    if (!val) return "-";
    const items = val.split("\n").filter(p => !!p);
    let pjs: string[] = [];
    const pv = pjValue || "";
    if (pv.includes("\n")) {
      pjs = pv.split("\n").filter(p => !!p);
    } else {
      const parts = pv.split(", ").filter(p => !!p);
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
    }
    const availablePjs = pjs.sort((a, b) => b.length - a.length);

    return (
      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const matchingPj = availablePjs.find(pj => item.startsWith(pj));
          
          if (matchingPj) {
            let instruction = item.substring(matchingPj.length);
            if (instruction.startsWith(" ")) instruction = instruction.substring(1);
            
            // Format PJ to be more prominent: **PJ (Names)**
            const pjMatch = matchingPj.match(/^\((.*?)\)\s*(.*)$/);
            const formattedPj = pjMatch ? `${pjMatch[1]} (${pjMatch[2]})` : matchingPj;

            return (
              <div key={i} className="flex gap-2 text-zinc-900 leading-tight">
                <span className="shrink-0 text-zinc-400 font-bold">-</span>
                <div className="block">
                  <span className="font-bold">{formattedPj}</span>
                  {instruction && <span className="font-normal text-zinc-800"> {instruction}</span>}
                </div>
              </div>
            );
          }

          const match = item.match(/^\((.*?)\)\s*(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex gap-2 text-zinc-900 leading-tight">
                <span className="shrink-0 text-zinc-400 font-bold">-</span>
                <div className="block">
                  <span className="font-bold">{match[1]} ({match[2]})</span>
                </div>
              </div>
            );
          }
          
          return (
            <div key={i} className="flex gap-2 leading-tight font-normal text-zinc-800">
              <span className="shrink-0 text-zinc-400 font-bold">-</span>
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDresscode = (dcString: string | undefined) => {
    if (!dcString) return "-";
    try {
      const parsed = JSON.parse(dcString);
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 mt-0.5">
            {parsed.baju && (
              <>
                <span className="text-zinc-500">Baju:</span>
                <span className="font-bold text-black">{parsed.baju}</span>
              </>
            )}
            {parsed.celana && (
              <>
                <span className="text-zinc-500">Celana:</span>
                <span className="font-bold text-black">{parsed.celana}</span>
              </>
            )}
            {parsed.aksesoris && (
              <>
                <span className="text-zinc-500">Aksesoris:</span>
                <span className="font-bold text-black">{parsed.aksesoris}</span>
              </>
            )}
            {!parsed.baju && !parsed.celana && !parsed.aksesoris && <span className="col-span-2">-</span>}
          </div>
        );
      }
      return <span className="font-bold text-black">{dcString}</span>;
    } catch {
      return <span className="font-bold text-black">{dcString}</span>;
    }
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
            <DeleteJuklakButton 
              id={parseInt(id)} 
              title={event?.judul_acara || ""} 
              redirectUrl="/dashboard"
              variant="text"
              className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
            />
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
        <div className="mb-10 border-b border-zinc-200 pb-10 print:border-zinc-300 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600 print:bg-zinc-100 print:text-zinc-600">
            Juklak Acara
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-black print:text-black mb-8">
            {event?.judul_acara}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16 text-sm w-full max-w-3xl text-left">
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
              <span className="text-zinc-500 font-medium">Waktu Keseluruhan</span>
              <span className="font-bold text-black">
                {event?.waktu_mulai?.substring(0, 5) || "??:??"} - {event?.waktu_selesai ? event.waktu_selesai.substring(0, 5) : "Selesai"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-medium">Tempat</span>
              <span className="font-bold text-black">{event?.tempat || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-medium">Dresscode</span>
              {renderDresscode(event?.dresscode)}
            </div>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            Belum ada rincian kegiatan.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm print:border-zinc-300 print:shadow-none">
            <table className="w-full text-left text-sm border-collapse">
              <tbody className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 print:bg-zinc-100 print:text-zinc-700">
                <tr>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase text-center">Waktu</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase text-center">Kegiatan</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase text-center">Durasi</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase text-center">Tempat</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase text-center">PJ</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase text-center">Perlengkapan</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase text-center">Teknis</th>
                </tr>
              </tbody>
              <tbody className="divide-y divide-zinc-200 print:divide-zinc-300">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-zinc-50 print:hover:bg-transparent print:break-inside-avoid">
                    <td className="border border-zinc-200 align-top whitespace-nowrap px-4 py-4 font-bold text-black print:text-black text-center">
                      {activity.waktu_kegiatan.substring(0, 5)} - {activity.waktu_selesai ? activity.waktu_selesai.substring(0, 5) : "Selesai"}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 font-semibold text-black print:text-black">
                      {activity.nama_kegiatan}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 font-medium text-zinc-600 text-center">
                      {calculateDuration(activity.waktu_kegiatan, activity.waktu_selesai)}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600 print:text-zinc-600">
                      {activity.tempat || "-"}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600 print:text-zinc-600">
                      {formatList(activity.penanggung_jawab)}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600 print:text-zinc-600">
                      {formatPerlengkapan(activity.perlengkapan)}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600 print:text-zinc-600">
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
