import { sql } from "@/db";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import RequestEditButton from "@/components/RequestEditButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ShareJuklakPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    return notFound();
  }

  // Ambil data event
  const eventResult = await sql`
    SELECT e.*, u.nama as owner_nama 
    FROM juklak_events e
    JOIN users u ON e.owner_id = u.id
    WHERE e.id = ${eventId}
    LIMIT 1
  `;
  const event = eventResult[0];

  if (!event) {
    return notFound();
  }

  // Cek apakah user adalah owner
  let isOwner = false;
  let currentUserId = null;

  if (session?.user?.email) {
    const currentUserResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    currentUserId = currentUserResult[0]?.id;
    isOwner = currentUserId === event.owner_id;
  }

  // Ambil data aktivitas
  const activities = await sql`
    SELECT * FROM juklak_activities 
    WHERE event_id = ${eventId} 
    ORDER BY waktu_kegiatan ASC
  `;

  const calculateDuration = (start: string, end: string | null) => {
    if (!start || end === null) return "Hingga Selesai";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60;

    return `${diffMins} menit`;
  };

  const renderDresscode = (dcString: string | null | undefined) => {
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

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* Header Section */}
      <header className="border-b border-zinc-100 px-6 py-12">
        <div className="mx-auto max-w-5xl relative">
          {!isOwner && (
            <div className="absolute right-0 top-0 hidden sm:block">
              <RequestEditButton eventId={eventId} isLoggedIn={!!session} />
            </div>
          )}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
              Petunjuk Pelaksanaan Acara
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">
              {event.judul_acara}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16 text-sm w-full max-w-3xl text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Tanggal Acara</span>
                  <span className="font-bold text-black">
                    {new Date(event.tanggal_acara).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Waktu Keseluruhan</span>
                  <span className="font-bold text-black">
                    {event.waktu_mulai?.substring(0, 5) || "??:??"} - {event.waktu_selesai ? event.waktu_selesai.substring(0, 5) : "Selesai"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Tempat</span>
                  <span className="font-bold text-black">{event.tempat || "-"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Dresscode</span>
                  {renderDresscode(event.dresscode)}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Disusun oleh</span>
                  <span className="font-bold text-black">{event.owner_nama}</span>
                </div>
              </div>

              {!isOwner && (
                <div className="mt-8 sm:hidden">
                  <RequestEditButton eventId={eventId} isLoggedIn={!!session} />
                </div>
              )}
            </div>
          </div>
      </header>

      {/* Content Section */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {activities.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            Belum ada rincian kegiatan yang ditambahkan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <tbody className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase tracking-wider text-center">Waktu</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase tracking-wider text-center">Kegiatan</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase tracking-wider text-center">Durasi</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase tracking-wider text-center">Tempat</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase tracking-wider text-center">PJ</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase tracking-wider text-center">Perlengkapan</th>
                  <th className="border border-zinc-200 px-4 py-4 font-bold uppercase tracking-wider text-center">Teknis</th>
                </tr>
              </tbody>
              <tbody className="divide-y divide-zinc-100">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-zinc-50/50 print:break-inside-avoid">
                    <td className="border border-zinc-200 align-top whitespace-nowrap px-4 py-4 font-bold text-black text-center">
                      {activity.waktu_kegiatan.substring(0, 5)} - {activity.waktu_selesai ? activity.waktu_selesai.substring(0, 5) : "Selesai"}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 font-semibold text-black">
                      {activity.nama_kegiatan}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 font-medium text-zinc-600 text-center">
                      {calculateDuration(activity.waktu_kegiatan, activity.waktu_selesai)}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600">
                      {activity.tempat || "-"}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600">
                      {formatList(activity.penanggung_jawab)}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600">
                      {formatPerlengkapan(activity.perlengkapan)}
                    </td>
                    <td className="border border-zinc-200 align-top px-4 py-4 text-zinc-600">
                      {formatTeknis(activity.teknis, activity.penanggung_jawab)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-400">
            Dibuat menggunakan <span className="font-bold text-zinc-900">Tukang Juklak</span>
          </p>
        </div>
      </main>
    </div>
  );
}
