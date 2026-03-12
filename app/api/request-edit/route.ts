import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID diperlukan" }, { status: 400 });
    }

    // Ambil ID requester dari email sesi
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    const requesterId = userResult[0]?.id;

    if (!requesterId) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah request sudah pernah dibuat sebelumnya
    const existingRequest = await sql`
      SELECT id FROM edit_requests 
      WHERE event_id = ${eventId} AND requester_id = ${requesterId} AND status = 'pending'
      LIMIT 1
    `;

    if (existingRequest.length > 0) {
      return NextResponse.json({ message: "Permintaan akses sedang diproses" }, { status: 200 });
    }

    // Masukkan data ke tabel edit_requests
    await sql`
      INSERT INTO edit_requests (event_id, requester_id, status)
      VALUES (${eventId}, ${requesterId}, 'pending')
    `;

    return NextResponse.json({ message: "Permintaan akses berhasil dikirim" }, { status: 201 });
  } catch (error) {
    console.error("POST Request Edit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
