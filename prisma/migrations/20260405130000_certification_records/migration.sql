-- CreateEnum
CREATE TYPE "CertificationTrack" AS ENUM ('FOREX_FUNDAMENTALS', 'TECHNICAL_ANALYSIS', 'RISK_MANAGEMENT');

-- CreateEnum
CREATE TYPE "CertificationRecordStatus" AS ENUM ('DRAFT', 'ISSUED', 'REVOKED');

-- CreateTable
CREATE TABLE "certification_records" (
    "id" TEXT NOT NULL,
    "certificate_id" TEXT NOT NULL,
    "verification_token" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "track" "CertificationTrack" NOT NULL,
    "score_percent" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3),
    "status" "CertificationRecordStatus" NOT NULL DEFAULT 'DRAFT',
    "skill_breakdown_json" JSONB,
    "pdf_url" TEXT,
    "user_id" TEXT,
    "created_by_admin_user_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_records_certificate_id_key" ON "certification_records"("certificate_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_records_verification_token_key" ON "certification_records"("verification_token");

-- CreateIndex
CREATE INDEX "certification_records_status_issued_at_idx" ON "certification_records"("status", "issued_at");

-- CreateIndex
CREATE INDEX "certification_records_created_at_idx" ON "certification_records"("created_at");
