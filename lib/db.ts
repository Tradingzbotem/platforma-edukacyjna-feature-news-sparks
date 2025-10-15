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
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!hasPostgres()) return null;
  const { rows } = await sql<User>`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  return rows[0] ?? null;
}

export async function insertUser(u: { id: string; email: string; password_hash: string; name?: string | null; }) {
  if (!hasPostgres()) return;
  await sql`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (${u.id}, ${u.email}, ${u.password_hash}, ${u.name ?? null})
  `;
}

export async function hashPassword(plain: string) {
  // cost 12 – rozsądny kompromis
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
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
