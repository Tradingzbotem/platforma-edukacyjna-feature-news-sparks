-- decision_lab_entries schema and indexes (idempotent)

CREATE TABLE IF NOT EXISTS decision_lab_entries (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL,
  horizon TEXT NOT NULL,
  thesis TEXT NOT NULL,
  market_mode TEXT NOT NULL,
  confidence INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  outcome TEXT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ NULL
);

-- columns safety (for older tables)
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS outcome TEXT NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS note TEXT NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL;

-- New columns for enhanced decision tracking
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS emotional_state TEXT NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS actual_action TEXT NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS risk_notes TEXT NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS time_of_day TEXT NULL;

-- AI analysis columns
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analysis JSONB NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ NULL;

-- constraints and indexes
CREATE INDEX IF NOT EXISTS idx_decision_lab_user_created_at ON decision_lab_entries (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_lab_user_status ON decision_lab_entries (user_id, status);
