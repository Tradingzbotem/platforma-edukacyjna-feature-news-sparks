import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/challenge/ranking
 * Suma xp_awarded (zrealizowane), a nie zadeklarowane XP.
 */
export async function GET() {
  try {
    // sanitize Neon connection string
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    const rows = await sql`
      SELECT user_id, COALESCE(SUM(xp_awarded), 0) AS total_xp, COUNT(*) AS trades
      FROM challenge_picks
      GROUP BY user_id
      ORDER BY total_xp DESC
      LIMIT 10
    `;

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Ranking fetch error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
