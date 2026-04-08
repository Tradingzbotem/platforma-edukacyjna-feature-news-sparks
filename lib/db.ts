// lib/db.ts
import { sql } from '@vercel/postgres';

// Allow Neon/Vercel setups that expose DATABASE_URL* or POSTGRES_PRISMA_URL
// Map them early so @vercel/postgres finds the expected envs.
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_URL && (process.env as any).POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_URL = (process.env as any).POSTGRES_PRISMA_URL;
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
  /**
   * Poziom konta. W FXEDULAB /client mapuje się przez `panelUserTierFromDbPlan`:
   * `free` → brak centrum decyzji; `starter` → Founders (NFT); `pro` → ten sam widok co Founders (legacy);
   * `elite` → Elite.
   */
  plan?: 'free' | 'starter' | 'pro' | 'elite';
  phone: string | null;
  name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  marketing_consent?: boolean | null;
  /** URL awatara (opcjonalnie), https/http. */
  avatar_url?: string | null;
  notify_edu?: boolean | null;
  notify_market?: boolean | null;
  created_at: Date | string;
  last_active_at?: Date | string | null;
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
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_edu BOOLEAN DEFAULT TRUE;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_market BOOLEAN DEFAULT TRUE;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;`;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!hasPostgres()) return null;
  const { rows } = await sql<User>`SELECT id, email, password_hash, plan, phone, name, first_name, last_name, marketing_consent, avatar_url, notify_edu, notify_market, created_at, last_active_at FROM users WHERE email = ${email} LIMIT 1`;
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (!hasPostgres()) return null;
  const { rows } = await sql<User>`SELECT id, email, password_hash, plan, phone, name, first_name, last_name, marketing_consent, avatar_url, notify_edu, notify_market, created_at, last_active_at FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] ?? null;
}

/** Podstawowe dane konta dla list admina (np. podejścia do egzaminu). */
export async function findUsersBasicByIds(
  ids: string[],
): Promise<Map<string, { email: string; name: string | null }>> {
  const out = new Map<string, { email: string; name: string | null }>();
  if (!hasPostgres() || ids.length === 0) return out;
  const unique = [...new Set(ids)];
  const result = await sql.query<{ id: string; email: string; name: string | null }>(
    "SELECT id, email, name FROM users WHERE id = ANY($1::text[])",
    [unique],
  );
  const { rows } = result;
  for (const r of rows) {
    out.set(r.id, { email: r.email, name: r.name });
  }
  return out;
}

export async function insertUser(u: { id: string; email: string; password_hash: string; name?: string | null; phone: string; plan?: 'free' | 'starter' | 'pro' | 'elite'; marketing_consent?: boolean | null; }) {
  if (!hasPostgres()) return;
  await sql`
    INSERT INTO users (id, email, password_hash, name, phone, plan, marketing_consent)
    VALUES (${u.id}, ${u.email}, ${u.password_hash}, ${u.name ?? null}, ${u.phone}, ${u.plan ?? 'free'}, ${u.marketing_consent ?? false})
  `;
}

export async function hashPassword(plain: string) {
  // cost 12 – rozsądny kompromis
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function listUsersBasic(): Promise<Array<{ id: string; email: string; plan: 'free' | 'starter' | 'pro' | 'elite'; created_at: string; last_active_at: string | null; is_online: boolean }>> {
  if (!hasPostgres()) return [];
  const { rows } = await sql<{ id: string; email: string; plan: string | null; created_at: Date; last_active_at: Date | null; is_online: boolean }>`
    SELECT
      id,
      email,
      plan,
      created_at,
      last_active_at,
      CASE
        WHEN last_active_at IS NOT NULL AND (NOW() - last_active_at) < INTERVAL '5 minutes'
        THEN TRUE
        ELSE FALSE
      END AS is_online
    FROM users
    ORDER BY created_at DESC
    LIMIT 500
  `;
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    plan: (r.plan === 'elite' || r.plan === 'pro' || r.plan === 'starter') ? (r.plan as any) : 'free',
    created_at: r.created_at.toISOString(),
    last_active_at: r.last_active_at ? r.last_active_at.toISOString() : null,
    is_online: Boolean(r.is_online),
  }));
}

export async function updateUserPlan(userId: string, plan: 'free' | 'starter' | 'pro' | 'elite'): Promise<void> {
  if (!hasPostgres()) return;
  await sql`UPDATE users SET plan = ${plan} WHERE id = ${userId}`;
}

export type UserProfilePatch = {
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  notify_edu?: boolean;
  notify_market?: boolean;
};

/** Aktualizacja pól profilu z /konto/ustawienia — tylko przekazane klucze. */
export async function updateUserProfileSettings(userId: string, patch: UserProfilePatch): Promise<void> {
  if (!hasPostgres()) return;
  if (patch.name !== undefined) {
    const v = patch.name === null ? null : patch.name.trim() || null;
    await sql`UPDATE users SET name = ${v} WHERE id = ${userId}`;
  }
  if (patch.first_name !== undefined) {
    const v = patch.first_name === null ? null : patch.first_name.trim() || null;
    await sql`UPDATE users SET first_name = ${v} WHERE id = ${userId}`;
  }
  if (patch.last_name !== undefined) {
    const v = patch.last_name === null ? null : patch.last_name.trim() || null;
    await sql`UPDATE users SET last_name = ${v} WHERE id = ${userId}`;
  }
  if (patch.phone !== undefined) {
    const v = patch.phone === null ? null : patch.phone.trim() || null;
    await sql`UPDATE users SET phone = ${v} WHERE id = ${userId}`;
  }
  if (patch.avatar_url !== undefined) {
    const v = patch.avatar_url === null ? null : patch.avatar_url.trim() || null;
    await sql`UPDATE users SET avatar_url = ${v} WHERE id = ${userId}`;
  }
  if (patch.notify_edu !== undefined) {
    await sql`UPDATE users SET notify_edu = ${patch.notify_edu} WHERE id = ${userId}`;
  }
  if (patch.notify_market !== undefined) {
    await sql`UPDATE users SET notify_market = ${patch.notify_market} WHERE id = ${userId}`;
  }
}

export async function touchUserLastActive(userId: string): Promise<void> {
  if (!hasPostgres()) return;
  try {
    await sql`UPDATE users SET last_active_at = NOW() WHERE id = ${userId}`;
  } catch {
    // best-effort; ignore failures
  }
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

export async function deleteContactMessage(id: number) {
  if (!hasPostgres()) return;
  await ensureContactTable();
  await sql`DELETE FROM contact_messages WHERE id = ${id}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress tracking (courses/lessons and quizzes)

function hasPostgres(): boolean {
  return !!(
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL_NON_POOLING ||
    // Vercel Postgres/Neon integration often provides Prisma-specific URL
    (process.env as any).POSTGRES_PRISMA_URL
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
  // Add answers column if it doesn't exist
  await sql`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS answers JSONB`;
}

export async function upsertLessonProgress(params: {
  userId: string;
  course: string;
  lessonId: string;
  done: boolean;
  /**
   * Gdy `done=false`: zapis „wizyty” z LessonVisitTracker — nie cofaj wcześniejszego ukończenia w DB
   * (np. pusty localStorage po czyszczeniu danych).
   */
  visitOnly?: boolean;
}) {
  const { userId, course, lessonId, done, visitOnly = false } = params;
  if (!hasPostgres()) return;
  await ensureProgressTables();
  await sql`
    INSERT INTO lesson_progress (user_id, course, lesson_id, done)
    VALUES (${userId}, ${course}, ${lessonId}, ${done})
    ON CONFLICT (user_id, course, lesson_id)
    DO UPDATE SET
      done = CASE
        WHEN ${visitOnly} AND NOT EXCLUDED.done THEN lesson_progress.done
        ELSE EXCLUDED.done
      END,
      updated_at = NOW();
  `;
}

/** Zmapowany postęp lekcji w jednym kursie (wartość true = ukończono lub w toku z done). */
export async function getLessonProgressBooleanMapForCourse(
  userId: string,
  courseId: string,
): Promise<Record<string, boolean>> {
  if (!hasPostgres() || !userId) return {};
  await ensureProgressTables();
  const { rows } = await sql<{ lesson_id: string; done: boolean }>`
    SELECT lesson_id, done
    FROM lesson_progress
    WHERE user_id = ${userId} AND course = ${courseId}
  `;
  const out: Record<string, boolean> = {};
  for (const r of rows) {
    if (r.done) out[r.lesson_id] = true;
  }
  return out;
}

/** Wszystkie wiersze postępu dla jednego kursu (ukończenie + wizyta) — spisy lekcji vs /kursy. */
export async function getLessonProgressRowMapForCourse(
  userId: string,
  course: string
): Promise<Record<string, { done: boolean }>> {
  if (!hasPostgres() || !userId) return {};
  await ensureProgressTables();
  const { rows } = await sql<{ lesson_id: string; done: boolean }>`
    SELECT lesson_id, done
    FROM lesson_progress
    WHERE user_id = ${userId} AND course = ${course}
  `;
  const out: Record<string, { done: boolean }> = {};
  for (const r of rows) {
    out[r.lesson_id] = { done: Boolean(r.done) };
  }
  return out;
}

export async function insertQuizResult(params: {
  userId: string;
  slug: string;
  score: number;
  total: number;
  at?: Date | string;
  answers?: Array<{
    questionId: string;
    userAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}) {
  const { userId, slug, score, total, at, answers } = params;
  if (!hasPostgres()) return;
  await ensureProgressTables();
  const answersJson = answers ? JSON.stringify(answers) : null;
  if (at) {
    const atStr = typeof at === 'string' ? at : at.toISOString();
    await sql`
      INSERT INTO quiz_results (user_id, slug, score, total, at, answers)
      VALUES (${userId}, ${slug}, ${score}, ${total}, ${atStr}, ${answersJson}::jsonb);
    `;
  } else {
    await sql`
      INSERT INTO quiz_results (user_id, slug, score, total, answers)
      VALUES (${userId}, ${slug}, ${score}, ${total}, ${answersJson}::jsonb);
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

export type LessonProgressRow = {
  course: string;
  lesson_id: string;
  done: boolean;
  updated_at: Date;
};

/** Wiersze postępu lekcji dla głównych modułów /kursy (wizyta: done=false, ukończenie: done=true). */
export async function getLessonProgressRowsForMainCourses(userId: string): Promise<LessonProgressRow[]> {
  if (!hasPostgres() || !userId) return [];
  await ensureProgressTables();
  const result = await sql<{ course: string; lesson_id: string; done: boolean; updated_at: Date }>`
    SELECT course, lesson_id, done, updated_at
    FROM lesson_progress
    WHERE user_id = ${userId}
      AND course IN ('podstawy', 'forex', 'cfd', 'zaawansowane')
  `;
  return result.rows.map((r) => ({
    course: r.course,
    lesson_id: r.lesson_id,
    done: Boolean(r.done),
    updated_at: r.updated_at instanceof Date ? r.updated_at : new Date(r.updated_at),
  }));
}

/** Postęp lekcji kursu „regulacje” (spis /kursy/regulacje). */
export async function getLessonProgressRowsForRegulacje(userId: string): Promise<LessonProgressRow[]> {
  if (!hasPostgres() || !userId) return [];
  await ensureProgressTables();
  const result = await sql<{ course: string; lesson_id: string; done: boolean; updated_at: Date }>`
    SELECT course, lesson_id, done, updated_at
    FROM lesson_progress
    WHERE user_id = ${userId}
      AND course = 'regulacje'
  `;
  return result.rows.map((r) => ({
    course: r.course,
    lesson_id: r.lesson_id,
    done: Boolean(r.done),
    updated_at: r.updated_at instanceof Date ? r.updated_at : new Date(r.updated_at),
  }));
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
  // Defensive: on some providers concurrent CREATE TABLE IF NOT EXISTS can still race on pg_type.
  try {
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
  } catch (e: any) {
    const code = e?.code || e?.originalError?.code;
    const msg = String(e?.message || '').toLowerCase();
    // Ignore "relation already exists" and rare pg_type unique violations during concurrent creation
    const isAlreadyExists = code === '42P07' || msg.includes('already exists');
    const isTypeUniqRace = code === '23505' && msg.includes('pg_type_typname_nsp_index');
    if (!isAlreadyExists && !isTypeUniqRace) {
      throw e;
    }
  }
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

export async function deleteChecklistHistory(userId: string, id: string): Promise<void> {
  if (!hasPostgres()) return;
  await ensureChecklistHistoryTable();
  await sql`
    DELETE FROM checklist_history
    WHERE user_id = ${userId} AND id = ${id}::bigint
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Elite Trial (7-day free trial for Edulab)

export type EliteTrial = {
  user_id: string;
  requested_at: string;
  started_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  original_plan: string | null;
  created_at: string;
};

export async function ensureEliteTrialsTable() {
  if (!hasPostgres()) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS elite_trials (
        user_id TEXT PRIMARY KEY,
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ NULL,
        expires_at TIMESTAMPTZ NULL,
        is_active BOOLEAN NOT NULL DEFAULT false,
        original_plan TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  } catch (e: any) {
    const code = e?.code || e?.originalError?.code;
    const msg = String(e?.message || '').toLowerCase();
    if (code !== '42P07' && !msg.includes('already exists')) {
      throw e;
    }
  }
  await sql`CREATE INDEX IF NOT EXISTS idx_elite_trials_status ON elite_trials (is_active, started_at)`;
}

export async function getEliteTrial(userId: string): Promise<EliteTrial | null> {
  if (!hasPostgres()) return null;
  await ensureEliteTrialsTable();
  const { rows } = await sql<{
    user_id: string;
    requested_at: Date;
    started_at: Date | null;
    expires_at: Date | null;
    is_active: boolean;
    original_plan: string | null;
    created_at: Date;
  }>`
    SELECT user_id, requested_at, started_at, expires_at, is_active, original_plan, created_at
    FROM elite_trials
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    user_id: r.user_id,
    requested_at: r.requested_at.toISOString(),
    started_at: r.started_at ? r.started_at.toISOString() : null,
    expires_at: r.expires_at ? r.expires_at.toISOString() : null,
    is_active: Boolean(r.is_active),
    original_plan: r.original_plan,
    created_at: r.created_at.toISOString(),
  };
}

export async function requestEliteTrial(userId: string, originalPlan: string): Promise<void> {
  if (!hasPostgres()) return;
  await ensureEliteTrialsTable();
  await sql`
    INSERT INTO elite_trials (user_id, original_plan, is_active)
    VALUES (${userId}, ${originalPlan}, false)
    ON CONFLICT (user_id) DO NOTHING
  `;
}

export async function activateEliteTrial(userId: string): Promise<void> {
  if (!hasPostgres()) return;
  await ensureEliteTrialsTable();
  
  // Get current plan and save as original if not already saved
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  
  const trial = await getEliteTrial(userId);
  const originalPlan = trial?.original_plan || user.plan || 'free';
  
  // Update trial: set started_at, expires_at (7 days), is_active = true
  await sql`
    UPDATE elite_trials
    SET started_at = NOW(),
        expires_at = NOW() + INTERVAL '7 days',
        is_active = true,
        original_plan = ${originalPlan}
    WHERE user_id = ${userId}
  `;
  
  // Update user plan to elite
  await updateUserPlan(userId, 'elite');
  
  // Enable decision_lab feature flag
  await sql`
    INSERT INTO user_feature_flags (user_id, feature, enabled, updated_at)
    VALUES (${userId}, 'decision_lab', true, now())
    ON CONFLICT (user_id, feature)
    DO UPDATE SET enabled = true, updated_at = now()
  `;
}

export async function deactivateEliteTrial(userId: string): Promise<void> {
  if (!hasPostgres()) return;
  await ensureEliteTrialsTable();
  
  const trial = await getEliteTrial(userId);
  if (!trial) return;
  
  // Update trial: set is_active = false
  await sql`
    UPDATE elite_trials
    SET is_active = false
    WHERE user_id = ${userId}
  `;
  
  // Restore original plan
  if (trial.original_plan && (trial.original_plan === 'free' || trial.original_plan === 'starter' || trial.original_plan === 'pro' || trial.original_plan === 'elite')) {
    await updateUserPlan(userId, trial.original_plan as 'free' | 'starter' | 'pro' | 'elite');
  } else {
    await updateUserPlan(userId, 'free');
  }
  
  // Disable decision_lab feature flag
  await sql`
    INSERT INTO user_feature_flags (user_id, feature, enabled, updated_at)
    VALUES (${userId}, 'decision_lab', false, now())
    ON CONFLICT (user_id, feature)
    DO UPDATE SET enabled = false, updated_at = now()
  `;
}

export async function listEliteTrials(): Promise<Array<EliteTrial & { email: string; days_elapsed: number | null }>> {
  if (!hasPostgres()) return [];
  await ensureEliteTrialsTable();
  const { rows } = await sql<{
    user_id: string;
    email: string;
    requested_at: Date;
    started_at: Date | null;
    expires_at: Date | null;
    is_active: boolean;
    original_plan: string | null;
    created_at: Date;
    days_elapsed: number | null;
  }>`
    SELECT 
      et.user_id,
      u.email,
      et.requested_at,
      et.started_at,
      et.expires_at,
      et.is_active,
      et.original_plan,
      et.created_at,
      CASE 
        WHEN et.started_at IS NOT NULL THEN EXTRACT(EPOCH FROM (NOW() - et.started_at)) / 86400
        ELSE NULL
      END AS days_elapsed
    FROM elite_trials et
    LEFT JOIN users u ON et.user_id = u.id
    ORDER BY et.requested_at DESC
  `;
  return rows.map((r) => ({
    user_id: r.user_id,
    email: r.email,
    requested_at: r.requested_at.toISOString(),
    started_at: r.started_at ? r.started_at.toISOString() : null,
    expires_at: r.expires_at ? r.expires_at.toISOString() : null,
    is_active: Boolean(r.is_active),
    original_plan: r.original_plan,
    created_at: r.created_at.toISOString(),
    days_elapsed: r.days_elapsed ? Math.floor(r.days_elapsed) : null,
  }));
}

export async function deleteEliteTrial(userId: string): Promise<void> {
  if (!hasPostgres()) return;
  await ensureEliteTrialsTable();
  await sql`DELETE FROM elite_trials WHERE user_id = ${userId}`;
}