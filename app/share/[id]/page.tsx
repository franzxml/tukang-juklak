import { sql } from "@/db";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import RequestEditButton from "@/components/RequestEditButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ShareJuklakPage({ params }: Props) {
  const session = await getServerSession();
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

  const formatList = (val: string) => {
    if (!val) return "-";
    const items = val.split(/, |\n/).filter(p => !!p);
    return (
      <div className="flex flex-col gap-3 min-w-[120px]">
        {items.map((item, i) => {
          const match = item.match(/^\((.*?)\)\s*(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex gap-2 text-zinc-900 leading-tight">
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

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* Header Section */}
      <header className="border-b border-zinc-100 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
                Petunjuk Pelaksanaan Acara
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">
                {event.judul_acara}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
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
                  <span className="text-zinc-500 font-medium">Tempat</span>
                  <span className="font-bold text-black">{event.tempat || "-"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Waktu Keseluruhan</span>
                  <span className="font-bold text-black">
                    {event.waktu_mulai?.substring(0, 5) || "??:??"} - {event.waktu_selesai ? event.waktu_selesai.substring(0, 5) : "Selesai"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Dresscode</span>
                  <span className="font-bold text-black">{event.dresscode || "-"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Disusun oleh</span>
                  <span className="font-bold text-black">{event.owner_nama}</span>
                </div>
              </div>
            </div>

            {!isOwner && (
              <div className="mt-4 sm:mt-0">
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
          <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Kegiatan</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Durasi</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Tempat</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">PJ</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Perlengkapan</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Teknis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-zinc-50/50">
                    <td className="whitespace-nowrap px-6 py-6 font-bold text-black">
                      {activity.waktu_kegiatan.substring(0, 5)} - {activity.waktu_selesai ? activity.waktu_selesai.substring(0, 5) : "Selesai"}
                    </td>
                    <td className="px-6 py-6 font-semibold text-black">
                      {activity.nama_kegiatan}
                    </td>
                    <td className="px-6 py-6 font-medium text-zinc-600">
                      {calculateDuration(activity.waktu_kegiatan, activity.waktu_selesai)}
                    </td>
                    <td className="px-6 py-6 text-zinc-600">
                      {activity.tempat || "-"}
                    </td>
                    <td className="px-6 py-6 text-zinc-600">
                      {formatList(activity.penanggung_jawab)}
                    </td>
                    <td className="px-6 py-6 text-zinc-600">
                      {formatList(activity.perlengkapan)}
                    </td>
                    <td className="px-6 py-6 text-zinc-600">
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
