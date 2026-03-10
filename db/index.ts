import { neon } from '@neondatabase/serverless';

/**
 * Inisialisasi koneksi ke Neon Database.
 * Menggunakan variabel lingkungan DATABASE_URL dari .env.local.
 */

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Please check your .env.local file.');
}

// Ekspor koneksi sql agar bisa digunakan di seluruh aplikasi Next.js (Server Components/Actions)
export const sql = neon(process.env.DATABASE_URL);
