import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

// Ensure Neon has an Article table compatible with Prisma schema used by redakcja.
// Safe to call on every request (IF NOT EXISTS / ALTER IF NOT EXISTS).
export async function ensureArticleTable(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  // Create table if it doesn't exist (use quoted CamelCase columns to match Prisma)
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "Article" (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "readingTime" INTEGER,
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  } catch (e: any) {
    // swallow "already exists" style errors from some providers
    const msg = String(e?.message || '').toLowerCase();
    const code = e?.code || e?.originalError?.code;
    if (code !== '42P07' && !msg.includes('already exists')) {
      throw e;
    }
  }

  // Backfill columns if table exists with a reduced schema (e.g., created manually in Neon)
  await sql`ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "readingTime" INTEGER;`;
  await sql`ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];`;
  await sql`ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();`;
  await sql`ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();`;

  // Ensure slug uniqueness even if the table was created without a constraint
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"(slug);`;
}

// Ensure Neon has a MediaAsset table compatible with Prisma schema used by redakcja.
export async function ensureMediaAssetTable(): Promise<void> {
	if (!isDatabaseConfigured()) return;

	// Create table if it doesn't exist
	try {
		await sql`
      CREATE TABLE IF NOT EXISTS "MediaAsset" (
        id TEXT PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        pathname TEXT,
        "contentType" TEXT,
        size INTEGER,
        alt TEXT,
        notes TEXT,
        "isArchived" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;
	} catch (e: any) {
		const msg = String(e?.message || '').toLowerCase();
		const code = e?.code || e?.originalError?.code;
		if (code !== '42P07' && !msg.includes('already exists')) {
			throw e;
		}
	}

	// Backfill columns if table exists with a reduced schema
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS pathname TEXT;`;
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "contentType" TEXT;`;
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS size INTEGER;`;
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS alt TEXT;`;
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS notes TEXT;`;
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN DEFAULT FALSE;`;
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();`;
	await sql`ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();`;
	// Ensure url uniqueness
	await sql`CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_url_key" ON "MediaAsset"(url);`;
}

// Store binary bytes for MediaAsset in Neon/Postgres (so uploads work on serverless without filesystem).
export async function ensureMediaAssetBlobTable(): Promise<void> {
	if (!isDatabaseConfigured()) return;
	try {
		await sql`
      CREATE TABLE IF NOT EXISTS "MediaAssetBlob" (
        id TEXT PRIMARY KEY,
        data BYTEA NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;
	} catch (e: any) {
		const msg = String(e?.message || '').toLowerCase();
		const code = e?.code || e?.originalError?.code;
		if (code !== '42P07' && !msg.includes('already exists')) {
			throw e;
		}
	}
	await sql`ALTER TABLE "MediaAssetBlob" ADD COLUMN IF NOT EXISTS data BYTEA;`;
	await sql`ALTER TABLE "MediaAssetBlob" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();`;
	await sql`ALTER TABLE "MediaAssetBlob" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();`;
}


