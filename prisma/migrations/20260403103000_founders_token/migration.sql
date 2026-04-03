-- Founders Pass (wewnętrzny) — enum + tabele
CREATE TYPE "FoundersTokenStatus" AS ENUM ('active', 'transferred', 'inactive');

CREATE TABLE "FoundersToken" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT,
    "benefits_json" JSONB,
    "status" "FoundersTokenStatus" NOT NULL DEFAULT 'active',
    "transferable" BOOLEAN NOT NULL DEFAULT true,
    "owner_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoundersToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FoundersTokenTransfer" (
    "id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "from_user_id" TEXT,
    "to_user_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoundersTokenTransfer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FoundersToken_code_key" ON "FoundersToken"("code");
CREATE INDEX "FoundersToken_owner_user_id_idx" ON "FoundersToken"("owner_user_id");
CREATE INDEX "FoundersTokenTransfer_token_id_idx" ON "FoundersTokenTransfer"("token_id");

ALTER TABLE "FoundersTokenTransfer" ADD CONSTRAINT "FoundersTokenTransfer_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "FoundersToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
