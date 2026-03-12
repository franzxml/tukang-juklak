import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sql } from "@/db";
import LogoutButton from "@/components/LogoutButton";
import DeleteJuklakButton from "@/components/DeleteJuklakButton";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // Ambil ID user dari email sesi
  const userResult = await sql`SELECT id, nama FROM users WHERE email = ${session.user.email} LIMIT 1`;
  const user = userResult[0];

  if (!user) {
    redirect("/login");
  }

  // Ambil daftar event milik user
  const events = await sql`
    SELECT id, judul_acara, tanggal_acara 
    FROM juklak_events 
    WHERE owner_id = ${user.id} 
    ORDER BY created_at DESC
  `;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Navigation / Header */}
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-black">
            Tukang Juklak
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-zinc-600">
              Halo, <span className="font-semibold text-black">{user.nama}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-black">
              Dashboard Juklak
            </h2>
            <p className="mt-1 text-zinc-600">
              Kelola dan susun petunjuk pelaksanaan acara Anda di sini.
            </p>
          </div>
          <Link
            href="/juklak/create"
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Buat Juklak Baru
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-24 text-center">
            <div className="rounded-full bg-zinc-100 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-zinc-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-black">
              Belum ada Juklak
            </h3>
            <p className="mt-2 text-zinc-600">
              Anda belum membuat petunjuk pelaksanaan acara apa pun.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/juklak/${event.id}`}
                className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-black hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                    Acara
                  </div>
                  <div className="flex items-center gap-2 -mr-2 -mt-2">
                    <span className="text-xs text-zinc-500">
                      {new Date(event.tanggal_acara).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <DeleteJuklakButton 
                      id={event.id} 
                      title={event.judul_acara} 
                      className="relative z-10 p-2 text-zinc-400 hover:text-red-600 rounded-full hover:bg-zinc-100 transition-colors"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black group-hover:underline">
                  {event.judul_acara}
                </h3>
                <div className="mt-8 flex items-center text-sm font-medium text-black">
                  Lihat Detail
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
