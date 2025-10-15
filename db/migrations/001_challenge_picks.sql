-- challenge_picks schema and indexes (idempotent)

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

-- columns safety (for older tables)
ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS challenge_key TEXT;
ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS xp_awarded INT;
ALTER TABLE challenge_picks ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;

-- constraints and indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pick ON challenge_picks (user_id, challenge_key);
CREATE INDEX IF NOT EXISTS idx_picks_user_created_at ON challenge_picks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_picks_settled ON challenge_picks (settled_at);


