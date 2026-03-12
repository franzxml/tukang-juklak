import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { sql } from "@/db";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Validasi: Harus login dan memiliki role 'admin'
  if (!session || (session.user as any).role !== "admin") {
    // Anda bisa mengarahkan ke dashboard atau halaman 403
    redirect("/dashboard");
  }

  // Ambil daftar user (tanpa password)
  const users = await sql`
    SELECT id, nama, email, role, created_at 
    FROM users 
    ORDER BY created_at DESC
  `;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Admin Header */}
      <nav className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-600"></div>
            <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Admin Panel
            </h1>
          </div>
          <div className="text-sm font-medium text-zinc-500">
            Pusat Kendali Pengguna
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Daftar Akun Terdaftar
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manajemen seluruh pengguna yang terdaftar di platform Tukang Juklak.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Tgl Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                    #{user.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-black dark:text-white">
                    {user.nama}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
