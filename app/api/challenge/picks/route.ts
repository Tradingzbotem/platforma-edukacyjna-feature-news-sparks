import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/challenge/picks?userId=xxx&limit=50
 * Zwraca listę picków (wraz z outcome/xp_awarded gdy są).
 */
export async function GET(_req: Request) {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const limit = 100;

    // sanitize Neon connection string (handles copies like: psql 'postgresql://...')
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    // ensure table exists (idempotent)
    await sql`
      CREATE TABLE IF NOT EXISTS challenge_picks (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        ticker TEXT,
        direction TEXT,
        confidence INT,
        xp INT DEFAULT 0,
        challenge_key TEXT,
        outcome TEXT,
        xp_awarded INT,
        created_at TIMESTAMPTZ DEFAULT now(),
        settled_at TIMESTAMPTZ
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_picks_user_created_at ON challenge_picks (user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_picks_settled ON challenge_picks (settled_at)`;

    type Row = {
      user_id: string;
      ticker: string;
      direction: string | null;
      confidence: number | null;
      challenge_key: string | null;
      outcome: string | null;
      xp_awarded: number | null;
      created_at: string;
      settled_at: string | null;
    };

    const result = await sql`
      SELECT user_id, ticker, direction, confidence, challenge_key, outcome, xp_awarded, created_at, settled_at
      FROM challenge_picks
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    const rows = result as unknown as Row[];

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('picks list error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


