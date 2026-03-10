import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { sql } from "@/db";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ambil data user untuk mendapatkan ID
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    const userId = userResult[0]?.id;

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ambil daftar event milik user tersebut
    const events = await sql`
      SELECT * FROM juklak_events 
      WHERE owner_id = ${userId} 
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET Juklak Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { judul_acara, tanggal_acara, tempat, waktu_mulai, waktu_selesai, dresscode } = await req.json();

    if (!judul_acara || !tanggal_acara) {
      return NextResponse.json({ error: "Judul dan tanggal diperlukan" }, { status: 400 });
    }

    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    const userId = userResult[0]?.id;

    const result = await sql`
      INSERT INTO juklak_events (judul_acara, tanggal_acara, tempat, waktu_mulai, waktu_selesai, dresscode, owner_id)
      VALUES (${judul_acara}, ${tanggal_acara}, ${tempat}, ${waktu_mulai}, ${waktu_selesai}, ${dresscode}, ${userId})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST Juklak Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
