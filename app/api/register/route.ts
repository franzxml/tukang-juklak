import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sql } from "@/db";

export async function POST(req: Request) {
  try {
    const { email, nama, password } = await req.json();

    // Validasi input sederhana
    if (!email || !nama || !password) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah user sudah ada
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    await sql`
      INSERT INTO users (email, nama, password)
      VALUES (${email}, ${nama}, ${hashedPassword})
    `;

    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: `Terjadi kesalahan sistem: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
