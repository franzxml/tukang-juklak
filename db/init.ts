import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL tidak ditemukan.");
    return;
  }

  // Cast as any untuk mengakses properti query jika diperlukan oleh tipe datanya
  const sql: any = neon(databaseUrl);
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const commands = schema
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  console.log(`Ditemukan ${commands.length} perintah SQL. Mulai injeksi...`);

  for (const command of commands) {
    try {
      // Gunakan .query() sesuai instruksi error sebelumnya
      await sql.query(command);
      console.log(`✅ Berhasil: ${command.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Gagal pada perintah: ${command.substring(0, 50)}...`);
      console.error(error);
    }
  }

  console.log("🏁 Proses selesai.");
}

initDb();
