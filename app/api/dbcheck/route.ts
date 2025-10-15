import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Accept DATABASE_URL as an alias for POSTGRES_URL for Vercel/Neon integration
    if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
      process.env.POSTGRES_URL = process.env.DATABASE_URL;
    }
    const { rows } = await sql`select now() as now`;
    return Response.json({ ok: true, now: rows[0]?.now }, { status: 200 });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || 'DB error' },
      { status: 500 }
    );
  }
}

