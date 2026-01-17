// lib/prisma.ts — minimal Prisma singleton with safety for missing env/DB.
// Avoid importing Prisma types to prevent generator-time issues in environments without DB.
import { isDatabaseConfigured } from '@/lib/db';

type PrismaClientType = any;

let prisma: PrismaClientType | null = null;

export function getPrisma(): PrismaClientType | null {
	if (!isDatabaseConfigured()) return null;
	if (prisma) return prisma;
	try {
		// Lazy-load Prisma client to avoid module-not-found in dev builds
		// when @prisma/client hasn't been generated yet.
		const { PrismaClient } = require('@prisma/client');

		// Resolve connection string from multiple env variants
		const dbUrl =
			process.env.DATABASE_URL ??
			process.env.POSTGRES_URL ??
			(process.env as any).POSTGRES_PRISMA_URL ??
			process.env.POSTGRES_URL_NON_POOLING;
		if (!dbUrl) return null;

		// Prisma 7: pass datasourceUrl directly to PrismaClient
		prisma = new PrismaClient({ datasourceUrl: dbUrl });
		return prisma;
	} catch {
		return null;
	}
}


