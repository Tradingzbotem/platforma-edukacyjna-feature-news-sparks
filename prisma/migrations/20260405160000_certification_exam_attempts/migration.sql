-- CreateEnum
CREATE TYPE "CertificationExamAttemptStatus" AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'PASSED',
  'FAILED',
  'EXPIRED'
);

-- CreateTable
CREATE TABLE "certification_exam_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "track" "CertificationTrack" NOT NULL,
    "status" "CertificationExamAttemptStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "score_percent" INTEGER,
    "passed" BOOLEAN,
    "answers_json" JSONB,
    "time_limit_minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certification_exam_attempts_user_id_status_idx" ON "certification_exam_attempts"("user_id", "status");

-- CreateIndex
CREATE INDEX "certification_exam_attempts_user_id_track_idx" ON "certification_exam_attempts"("user_id", "track");
