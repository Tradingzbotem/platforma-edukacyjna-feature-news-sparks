// lib/panel/ensureMacroCalendar.ts
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

// Ensure Neon has a MacroCalendarEvent table compatible with Prisma schema.
// Safe to call on every request (IF NOT EXISTS / ALTER IF NOT EXISTS).
export async function ensureMacroCalendarTable(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  // Create table if it doesn't exist (use quoted CamelCase columns to match Prisma)
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "MacroCalendarEvent" (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT,
        currency TEXT,
        event TEXT NOT NULL,
        weight TEXT,
        current TEXT,
        forecast TEXT,
        previous TEXT,
        region TEXT,
        importance TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  } catch (e: any) {
    // swallow "already exists" style errors from some providers
    const msg = String(e?.message || '').toLowerCase();
    const code = e?.code || e?.originalError?.code;
    if (code !== '42P07' && !msg.includes('already exists')) {
      throw e;
    }
  }

  // Backfill columns if table exists with a reduced schema
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS time TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS currency TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS weight TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS current TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS forecast TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS previous TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS region TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS importance TEXT;`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();`;
  await sql`ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();`;

  // Ensure indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_macro_calendar_date ON "MacroCalendarEvent"(date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_macro_calendar_date_importance ON "MacroCalendarEvent"(date, importance);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_macro_calendar_created_at ON "MacroCalendarEvent"("createdAt");`;
}
