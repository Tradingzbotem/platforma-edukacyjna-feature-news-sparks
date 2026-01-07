// lib/db.ts
import { sql } from '@vercel/postgres';

// Allow Neon/Vercel setups that expose DATABASE_URL* instead of POSTGRES_URL*
// Map them early so @vercel/postgres finds the expected envs.
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_URL_NON_POOLING && (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL_NON_POOLING)) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL_NON_POOLING as string;
}
import bcrypt from 'bcryptjs';

// In some local setups developers paste full CLI commands like:
//   psql 'postgresql://user:pass@host/db?sslmode=require'
// This helper strips the leading "psql " and surrounding quotes so @vercel/postgres
// receives a clean connection URL.
function sanitizeConnectionString(value: string | undefined): string | undefined {
  if (!value) return value;
  let trimmed = value.trim();
  // Strip leading psql and optional quotes
  if (trimmed.toLowerCase().startsWith('psql ')) {
    trimmed = trimmed.slice(5).trim();
  }
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    trimmed = trimmed.slice(1, -1);
  }
  return trimmed;
}

// Sanitize potentially misformatted env vars (do this after mapping above)
process.env.POSTGRES_URL = sanitizeConnectionString(process.env.POSTGRES_URL);
process.env.POSTGRES_URL_NON_POOLING = sanitizeConnectionString(process.env.POSTGRES_URL_NON_POOLING);
process.env.DATABASE_URL = sanitizeConnectionString(process.env.DATABASE_URL);
process.env.DATABASE_URL_UNPOOLED = sanitizeConnectionString(process.env.DATABASE_URL_UNPOOLED);
process.env.DATABASE_URL_NON_POOLING = sanitizeConnectionString(process.env.DATABASE_URL_NON_POOLING);

export type User = {
  id: string;
  email: string;
  password_hash: string;
  plan?: 'free' | 'starter' | 'pro' | 'elite';
  phone: string | null;
  name: string | null;
  created_at: Date | string;
};

export async function ensureUsersTable() {
  if (!hasPostgres()) return; // skip in environments without DB
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  // Backfill new columns
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';`;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!hasPostgres()) return null;
  const { rows } = await sql<User>`SELECT id, email, password_hash, plan, phone, name, created_at FROM users WHERE email = ${email} LIMIT 1`;
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (!hasPostgres()) return null;
  const { rows } = await sql<User>`SELECT id, email, password_hash, plan, phone, name, created_at FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] ?? null;
}

export async function insertUser(u: { id: string; email: string; password_hash: string; name?: string | null; phone: string; plan?: 'free' | 'starter' | 'pro' | 'elite'; }) {
  if (!hasPostgres()) return;
  await sql`
    INSERT INTO users (id, email, password_hash, name, phone, plan)
    VALUES (${u.id}, ${u.email}, ${u.password_hash}, ${u.name ?? null}, ${u.phone}, ${u.plan ?? 'free'})
  `;
}

export async function hashPassword(plain: string) {
  // cost 12 – rozsądny kompromis
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function listUsersBasic(): Promise<Pick<User, 'id' | 'email' | 'plan' | 'created_at'>[]> {
  if (!hasPostgres()) return [];
  const { rows } = await sql<{ id: string; email: string; plan: string | null; created_at: Date }>`
    SELECT id, email, plan, created_at FROM users ORDER BY created_at DESC LIMIT 500
  `;
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    plan: (r.plan === 'elite' || r.plan === 'pro' || r.plan === 'starter') ? (r.plan as any) : 'free',
    created_at: r.created_at.toISOString(),
  }));
}

export async function updateUserPlan(userId: string, plan: 'free' | 'starter' | 'pro' | 'elite'): Promise<void> {
  if (!hasPostgres()) return;
  await sql`UPDATE users SET plan = ${plan} WHERE id = ${userId}`;
}

export async function deleteUserCascade(userId: string): Promise<void> {
  if (!hasPostgres()) return;
  // Ensure optional tables exist before deleting
  try { await ensureProgressTables(); } catch {}
  try { await ensureChecklistHistoryTable(); } catch {}
  try { await ensureContactTable(); } catch {}
  // Delete dependent rows; ignore absence if tables not present
  try { await sql`DELETE FROM lesson_progress WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM quiz_results WHERE user_id = ${userId}`; } catch {}
  try { await sql`DELETE FROM checklist_history WHERE user_id = ${userId}`; } catch {}
  // Finally delete the user
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact messages (from /api/contact)
export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  handled: boolean;
  admin_note: string | null;
};

export async function ensureContactTable() {
  if (!hasPostgres()) return;
  // Be defensive: some providers may still throw even with IF NOT EXISTS.
  // Ignore "relation already exists" (42P07) and continue with ALTERs.
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
  } catch (e: any) {
    const code = e?.code || e?.originalError?.code;
    const msg = String(e?.message || '').toLowerCase();
    if (code !== '42P07' && !msg.includes('already exists')) {
      throw e;
    }
  }
  await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS handled BOOLEAN DEFAULT FALSE;`;
  await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_note TEXT;`;
}

export async function listContactMessages(limit = 200): Promise<ContactMessage[]> {
  if (!hasPostgres()) return [];
  await ensureContactTable();
  const { rows } = await sql<{
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: Date;
    handled: boolean | null;
    admin_note: string | null;
  }>`
    SELECT id, name, email, subject, message, created_at, COALESCE(handled, FALSE) AS handled, admin_note
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    message: r.message,
    created_at: r.created_at.toISOString(),
    handled: Boolean(r.handled),
    admin_note: r.admin_note ?? null,
  }));
}

export async function updateContactMessage(id: number, updates: { handled?: boolean; admin_note?: string | null }) {
  if (!hasPostgres()) return;
  await ensureContactTable();
  const handled = updates.handled;
  const admin_note = updates.admin_note;
  if (typeof handled === 'boolean' && typeof admin_note !== 'undefined') {
    await sql`UPDATE contact_messages SET handled = ${handled}, admin_note = ${admin_note} WHERE id = ${id}`;
    return;
  }
  if (typeof handled === 'boolean') {
    await sql`UPDATE contact_messages SET handled = ${handled} WHERE id = ${id}`;
    return;
  }
  if (typeof admin_note !== 'undefined') {
    await sql`UPDATE contact_messages SET admin_note = ${admin_note} WHERE id = ${id}`;
    return;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress tracking (courses/lessons and quizzes)

function hasPostgres(): boolean {
  return !!(
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL_NON_POOLING
  );
}

// Public helper for routes to decide whether to hard-fail when DB is missing
export function isDatabaseConfigured(): boolean {
  return hasPostgres();
}

export async function ensureProgressTables() {
  // Per-lesson completion
  if (!hasPostgres()) return; // skip in environments without DB
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

  // Per-quiz results history
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_results (
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export async function upsertLessonProgress(params: {
  userId: string;
  course: string;
  lessonId: string;
  done: boolean;
}) {
  const { userId, course, lessonId, done } = params;
  if (!hasPostgres()) return;
  await ensureProgressTables();
  await sql`
    INSERT INTO lesson_progress (user_id, course, lesson_id, done)
    VALUES (${userId}, ${course}, ${lessonId}, ${done})
    ON CONFLICT (user_id, course, lesson_id)
    DO UPDATE SET done = EXCLUDED.done, updated_at = NOW();
  `;
}

export async function insertQuizResult(params: {
  userId: string;
  slug: string;
  score: number;
  total: number;
  at?: Date | string;
}) {
  const { userId, slug, score, total, at } = params;
  if (!hasPostgres()) return;
  await ensureProgressTables();
  if (at) {
    const atStr = typeof at === 'string' ? at : at.toISOString();
    await sql`
      INSERT INTO quiz_results (user_id, slug, score, total, at)
      VALUES (${userId}, ${slug}, ${score}, ${total}, ${atStr});
    `;
  } else {
    await sql`
      INSERT INTO quiz_results (user_id, slug, score, total)
      VALUES (${userId}, ${slug}, ${score}, ${total});
    `;
  }
}

export type ProgressSummary = {
  coursesDone: number;
  quizzesDone: number;
  recentQuizResults: { slug: string; score: number; total: number; at: string }[];
};

export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  if (!hasPostgres()) {
    return { coursesDone: 0, quizzesDone: 0, recentQuizResults: [] };
  }
  await ensureProgressTables();

  const coursesDoneQ = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM lesson_progress
    WHERE user_id = ${userId} AND done = TRUE
  `;
  const quizzesDoneQ = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM quiz_results
    WHERE user_id = ${userId}
  `;
  const recentQ = await sql<{ slug: string; score: number; total: number; at: Date }>`
    SELECT slug, score, total, at
    FROM quiz_results
    WHERE user_id = ${userId}
    ORDER BY at DESC
    LIMIT 20
  `;

  const coursesDone = Number(coursesDoneQ.rows[0]?.count ?? '0');
  const quizzesDone = Number(quizzesDoneQ.rows[0]?.count ?? '0');
  const recentQuizResults = recentQ.rows.map(r => ({
    slug: r.slug,
    score: r.score,
    total: r.total,
    at: new Date(r.at).toISOString(),
  }));

  return { coursesDone, quizzesDone, recentQuizResults };
}

// ─────────────────────────────────────────────────────────────────────────────
// Checklist (EDU) — historia planów/analityki per użytkownik

export type ChecklistHistoryEntry = {
  id: string;
  user_id: string;
  created_at: string;
  asset: string | null;
  timeframe: string | null;
  horizon: string | null;
  thesis: string | null;
  reasons: string[] | null;
  invalidation_kind: string | null;
  invalidation_level: string | null;
  red_flags: string | null;
  plan_b: string | null;
  risk: string | null;
  checks: Record<string, boolean> | null;
};

export async function ensureChecklistHistoryTable() {
  if (!hasPostgres()) return;
  await sql`
    CREATE TABLE IF NOT EXISTS checklist_history (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      asset TEXT,
      timeframe TEXT,
      horizon TEXT,
      thesis TEXT,
      reasons JSONB,
      invalidation_kind TEXT,
      invalidation_level TEXT,
      red_flags TEXT,
      plan_b TEXT,
      risk TEXT,
      checks JSONB
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_checklist_history_user ON checklist_history(user_id, created_at DESC);`;
}

export async function insertChecklistHistory(params: {
  userId: string;
  asset?: string | null;
  timeframe?: string | null;
  horizon?: string | null;
  thesis?: string | null;
  reasons?: string[] | null;
  invalidation_kind?: string | null;
  invalidation_level?: string | null;
  red_flags?: string | null;
  plan_b?: string | null;
  risk?: string | null;
  checks?: Record<string, boolean> | null;
}) {
  if (!hasPostgres()) return;
  await ensureChecklistHistoryTable();
  const {
    userId,
    asset = null,
    timeframe = null,
    horizon = null,
    thesis = null,
    reasons = null,
    invalidation_kind = null,
    invalidation_level = null,
    red_flags = null,
    plan_b = null,
    risk = null,
    checks = null,
  } = params;
  await sql`
    INSERT INTO checklist_history
      (user_id, asset, timeframe, horizon, thesis, reasons, invalidation_kind, invalidation_level, red_flags, plan_b, risk, checks)
    VALUES
      (${userId}, ${asset}, ${timeframe}, ${horizon}, ${thesis}, ${reasons ? JSON.stringify(reasons) : null}::jsonb, ${invalidation_kind}, ${invalidation_level}, ${red_flags}, ${plan_b}, ${risk}, ${checks ? JSON.stringify(checks) : null}::jsonb);
  `;
}

export async function listChecklistHistory(userId: string, limit = 50): Promise<ChecklistHistoryEntry[]> {
  if (!hasPostgres()) return [];
  await ensureChecklistHistoryTable();
  const { rows } = await sql<ChecklistHistoryEntry>`
    SELECT
      id::text, user_id, created_at,
      asset, timeframe, horizon, thesis,
      COALESCE(reasons, '[]'::jsonb) as reasons,
      invalidation_kind, invalidation_level,
      red_flags, plan_b, risk,
      COALESCE(checks, '{}'::jsonb) as checks
    FROM checklist_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  // @vercel/postgres returns JSON objects already parsed
  return rows.map((r) => ({
    ...r,
    created_at: new Date(r.created_at).toISOString(),
  }));
}
