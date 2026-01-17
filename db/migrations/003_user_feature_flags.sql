-- user_feature_flags schema and indexes (idempotent)

CREATE TABLE IF NOT EXISTS user_feature_flags (
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, feature)
);

-- columns safety (for older tables)
ALTER TABLE user_feature_flags ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE user_feature_flags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- indexes
CREATE INDEX IF NOT EXISTS idx_user_feature_flags_user_id ON user_feature_flags (user_id);
