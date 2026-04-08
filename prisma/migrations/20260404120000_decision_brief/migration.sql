-- Brief decyzyjny (dzienny) + aktywa pod wpływem
CREATE TABLE IF NOT EXISTS "decision_briefs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "narrative_axis" TEXT NOT NULL DEFAULT '',
    "context" TEXT NOT NULL DEFAULT '',
    "on_radar" TEXT NOT NULL DEFAULT '',
    "priority_of_day" TEXT NOT NULL DEFAULT '',
    "base_scenario" TEXT NOT NULL DEFAULT '',
    "alternative_scenario" TEXT NOT NULL DEFAULT '',
    "invalidation" TEXT NOT NULL DEFAULT '',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decision_briefs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "decision_briefs_slug_key" ON "decision_briefs"("slug");
CREATE INDEX IF NOT EXISTS "decision_briefs_is_published_published_at_idx" ON "decision_briefs"("is_published", "published_at");

CREATE TABLE IF NOT EXISTS "decision_brief_assets" (
    "id" TEXT NOT NULL,
    "brief_id" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "base_direction" TEXT NOT NULL DEFAULT '',
    "supports" TEXT NOT NULL DEFAULT '',
    "weakens" TEXT NOT NULL DEFAULT '',
    "sensitivity" TEXT NOT NULL DEFAULT 'średnia',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "decision_brief_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "decision_brief_assets_brief_id_sort_order_idx" ON "decision_brief_assets"("brief_id", "sort_order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'decision_brief_assets_brief_id_fkey'
  ) THEN
    ALTER TABLE "decision_brief_assets"
      ADD CONSTRAINT "decision_brief_assets_brief_id_fkey"
      FOREIGN KEY ("brief_id") REFERENCES "decision_briefs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
