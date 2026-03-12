import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { sql } from "@/db";

type Props = {
  params: Promise<{ id: string }>;
};

// GET: Ambil detail satu event
export async function GET(req: Request, { params }: Props) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  
  try {
    const result = await sql`SELECT * FROM juklak_events WHERE id = ${parseInt(id)} LIMIT 1`;
    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// PATCH: Update Judul, Tanggal, Tempat, Waktu, & Dresscode Event
export async function PATCH(req: Request, { params }: Props) {
  const session = await getServerSession();
  if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { judul_acara, tanggal_acara, tempat, waktu_mulai, waktu_selesai, dresscode } = await req.json();

  const safeWaktuMulai = waktu_mulai || null;
  const safeWaktuSelesai = waktu_selesai || null;

  try {
    // Ambil user id
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    if (userResult.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = userResult[0].id;

    // Cek kepemilikan
    const eventResult = await sql`SELECT owner_id FROM juklak_events WHERE id = ${parseInt(id)} LIMIT 1`;
    if (eventResult.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (eventResult[0].owner_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const result = await sql`
      UPDATE juklak_events 
      SET judul_acara = ${judul_acara}, 
          tanggal_acara = ${tanggal_acara},
          tempat = ${tempat},
          waktu_mulai = ${safeWaktuMulai},
          waktu_selesai = ${safeWaktuSelesai},
          dresscode = ${dresscode}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PATCH Juklak Event Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Hapus Event Beserta Semua Aktivitasnya
export async function DELETE(req: Request, { params }: Props) {
  const session = await getServerSession();
  if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Ambil user id
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    if (userResult.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = userResult[0].id;

    // Cek kepemilikan
    const eventResult = await sql`SELECT owner_id FROM juklak_events WHERE id = ${parseInt(id)} LIMIT 1`;
    if (eventResult.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (eventResult[0].owner_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await sql`DELETE FROM juklak_events WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ message: "Juklak deleted" });
  } catch (error) {
    console.error("DELETE Juklak Event Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
