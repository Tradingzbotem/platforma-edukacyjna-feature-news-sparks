-- Jeden aktywny certyfikat (ISSUED) na parę (użytkownik, ścieżka) — zapobiega duplikatom przy równoległym POST „Wygeneruj”.
CREATE UNIQUE INDEX IF NOT EXISTS "certification_records_user_track_issued_unique"
ON "certification_records" ("user_id", "track")
WHERE "status" = 'ISSUED' AND "user_id" IS NOT NULL;
