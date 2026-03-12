import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/db";

type Props = {
  params: Promise<{ id: string }>;
};

// GET: Ambil semua aktivitas untuk satu event tertentu
export async function GET(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = parseInt(id);

  try {
    const activities = await sql`
      SELECT * FROM juklak_activities 
      WHERE event_id = ${eventId} 
      ORDER BY position ASC, waktu_kegiatan ASC, id ASC
    `;
    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET Activities Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Tambah aktivitas baru ke dalam event
export async function POST(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = parseInt(id);

  try {
    const { waktu_kegiatan, waktu_selesai, nama_kegiatan, tempat, penanggung_jawab, perlengkapan, teknis, position } = await req.json();

    if (!waktu_kegiatan || !nama_kegiatan) {
      return NextResponse.json({ error: "Waktu dan nama kegiatan diperlukan" }, { status: 400 });
    }

    const safeWaktuSelesai = waktu_selesai || null;
    const safePosition = position !== undefined ? position : 0;

    const result = await sql`
      INSERT INTO juklak_activities (event_id, waktu_kegiatan, waktu_selesai, nama_kegiatan, tempat, penanggung_jawab, perlengkapan, teknis, position)
      VALUES (${eventId}, ${waktu_kegiatan}, ${safeWaktuSelesai}, ${nama_kegiatan}, ${tempat}, ${penanggung_jawab}, ${perlengkapan}, ${teknis}, ${safePosition})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST Activity Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update aktivitas yang sudah ada (menggunakan activity_id dari body)
export async function PUT(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: activityId, waktu_kegiatan, waktu_selesai, nama_kegiatan, tempat, penanggung_jawab, perlengkapan, teknis, position } = await req.json();

    if (!activityId) {
      return NextResponse.json({ error: "ID aktivitas diperlukan" }, { status: 400 });
    }

    const safeWaktuSelesai = waktu_selesai || null;

    const result = await sql`
      UPDATE juklak_activities 
      SET waktu_kegiatan = ${waktu_kegiatan}, 
          waktu_selesai = ${safeWaktuSelesai},
          nama_kegiatan = ${nama_kegiatan}, 
          tempat = ${tempat},
          penanggung_jawab = ${penanggung_jawab}, 
          perlengkapan = ${perlengkapan}, 
          teknis = ${teknis},
          position = ${position !== undefined ? position : 0}
      WHERE id = ${activityId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Aktivitas tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT Activity Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Hapus aktivitas (menggunakan activity_id dari URL query atau body)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("activityId");

  if (!activityId) {
    return NextResponse.json({ error: "ID aktivitas diperlukan" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM juklak_activities WHERE id = ${parseInt(activityId)}`;
    return NextResponse.json({ message: "Aktivitas berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Activity Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
