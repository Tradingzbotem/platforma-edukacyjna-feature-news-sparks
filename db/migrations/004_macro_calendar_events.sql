-- macro_calendar_events schema and indexes (idempotent)

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

-- columns safety (for older tables)
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS current TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS forecast TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS previous TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS importance TEXT;
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE "MacroCalendarEvent" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();

-- indexes
CREATE INDEX IF NOT EXISTS idx_macro_calendar_date ON "MacroCalendarEvent"(date);
CREATE INDEX IF NOT EXISTS idx_macro_calendar_date_importance ON "MacroCalendarEvent"(date, importance);
CREATE INDEX IF NOT EXISTS idx_macro_calendar_created_at ON "MacroCalendarEvent"("createdAt");
