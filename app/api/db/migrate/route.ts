import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizeConn(str: string | undefined): string {
  const raw = (str || '').trim();
  if (!raw) return '';
  if (raw.startsWith('psql ')) {
    const m = raw.match(/^psql\s+'(.+)'/);
    if (m) return m[1];
    return raw.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
  }
  if (
    (raw.startsWith("'") && raw.endsWith("'")) ||
    (raw.startsWith('"') && raw.endsWith('"'))
  ) {
    return raw.slice(1, -1);
  }
  return raw;
}

export async function POST() {
  try {
    const connStr = sanitizeConn(process.env.POSTGRES_URL);
    if (!connStr) {
      return NextResponse.json(
        { ok: false, error: 'DB_NOT_CONFIGURED' },
        { status: 503 }
      );
    }
    const sql = neon(connStr);

    // users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email)`;

    // lesson_progress
    await sql`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        user_id TEXT NOT NULL,
        course TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, course, lesson_id)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress (user_id)`;

    // quiz_results
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_results (
        user_id TEXT NOT NULL,
        slug TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_results_user_at ON quiz_results (user_id, at DESC)`;

    // challenge_picks (mirrors db/migrations/001_challenge_picks.sql)
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
      );
    `;
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS challenge_key TEXT`;
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS outcome TEXT`;
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS xp_awarded INT`;
    await sql`ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pick ON challenge_picks (user_id, challenge_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_picks_user_created_at ON challenge_picks (user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_picks_settled ON challenge_picks (settled_at)`;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'migration_error' },
      { status: 500 }
    );
  }
}


