-- decision_lab_entries trading parameters columns (idempotent)

-- Trading parameters columns
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS entry NUMERIC NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS stop_loss NUMERIC NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS take_profit NUMERIC NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS risk_percent NUMERIC NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS invalidation TEXT NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS setup_type TEXT NULL;
ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS timeframes TEXT[] NULL;
