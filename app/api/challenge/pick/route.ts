import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/challenge/pick
 * body: {
 *  userId?: string,
 *  ticker: string,
 *  direction: 'up'|'down'|'flat',
 *  confidence: number,
 *  xp?: number, // opcjonalne; nieużywane na tym etapie
 *  challengeKey: string // np. `${ticker}|${horizon}|${deadlineMs}`
 * }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { ticker, direction, confidence, challengeKey } = data || {};

    if (!ticker || !direction || !confidence || !challengeKey) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // sanitize Neon connection string (handles copies like: psql 'postgresql://...')
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    // ensure schema (idempotent)
    await sql`
      CREATE TABLE IF NOT EXISTS challenge_picks (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        ticker TEXT,
        direction TEXT,
        confidence INT,
        xp INT DEFAULT 0,
        challenge_key TEXT,
        outcome TEXT,            -- 'up' | 'down' | 'flat'
        xp_awarded INT,          -- przyznane XP po rozliczeniu
        created_at TIMESTAMPTZ DEFAULT now(),
        settled_at TIMESTAMPTZ
      )
    `;

    // Add missing columns if table existed earlier
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS challenge_key TEXT`;
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS outcome TEXT`;
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS xp_awarded INT`;
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ`;

    // unikamy wielu insertów tego samego wyboru: (user_id, challenge_key) unikalne
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pick ON challenge_picks (user_id, challenge_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_picks_user_created_at ON challenge_picks (user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_picks_settled ON challenge_picks (settled_at)`;

    await sql`
      INSERT INTO challenge_picks (user_id, ticker, direction, confidence, xp, challenge_key)
      VALUES (${userId}, ${ticker}, ${direction}, ${confidence}, 0, ${challengeKey})
      ON CONFLICT (user_id, challenge_key) DO UPDATE
      SET direction = EXCLUDED.direction,
          confidence = EXCLUDED.confidence,
          ticker = EXCLUDED.ticker
    `;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Pick insert error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
