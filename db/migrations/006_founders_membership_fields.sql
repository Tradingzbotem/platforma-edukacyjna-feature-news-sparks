-- Founders: rozszerzenie członkostwa (półmanualne, bez on-chain)
-- Uruchom: npx tsx scripts/run-sql-migration.ts db/migrations/006_founders_membership_fields.sql

ALTER TYPE "FoundersTokenStatus" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "FoundersTokenStatus" ADD VALUE IF NOT EXISTS 'revoked';

ALTER TABLE "FoundersToken"
  ADD COLUMN IF NOT EXISTS "granted_by_admin_id" TEXT,
  ADD COLUMN IF NOT EXISTS "granted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "admin_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "nft_label" TEXT NOT NULL DEFAULT 'Founders',
  ADD COLUMN IF NOT EXISTS "transfer_locked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "allow_access_without_nft" BOOLEAN NOT NULL DEFAULT false;
