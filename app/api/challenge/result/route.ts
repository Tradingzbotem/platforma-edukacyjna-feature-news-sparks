import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/challenge/result
 * body: {
 *   userId: string,
 *   challengeKey: string,
 *   outcome: 'up'|'down'|'flat',
 *   xpAwarded: number
 * }
 *
 * Aktualizuje istniejący pick o wynik i przyznane XP.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { challengeKey, outcome, xpAwarded } = await req.json();

    if (!challengeKey || !outcome || typeof xpAwarded !== 'number') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // sanitize Neon connection string
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    await sql`
      UPDATE challenge_picks
      SET outcome = ${outcome},
          xp_awarded = ${xpAwarded},
          settled_at = now()
      WHERE user_id = ${userId} AND challenge_key = ${challengeKey} AND xp_awarded IS NULL
    `;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Result update error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
