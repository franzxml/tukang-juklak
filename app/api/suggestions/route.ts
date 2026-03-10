import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { sql } from "@/db";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    const userId = userResult[0]?.id;

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const fields = ['nama_kegiatan', 'tempat', 'penanggung_jawab', 'perlengkapan', 'teknis'];
    const suggestions: Record<string, string[]> = {};

    for (const field of fields) {
      const result = await (sql as any)(`
        SELECT DISTINCT ${field} as value
        FROM juklak_activities a
        JOIN juklak_events e ON a.event_id = e.id
        WHERE e.owner_id = $1
        AND ${field} IS NOT NULL
        AND ${field} != ''
        LIMIT 15
      `, [userId]);
      
      suggestions[field] = result.map((row: any) => row.value);
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("GET Suggestions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
