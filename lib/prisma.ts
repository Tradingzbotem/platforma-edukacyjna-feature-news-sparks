/* eslint-disable @typescript-eslint/no-var-requires */
// lib/prisma.ts — minimal Prisma singleton with safety for missing env/DB.
// Avoid importing Prisma types to prevent generator-time issues in environments without DB.
import { isDatabaseConfigured } from '@/lib/db';

type PrismaClientType = any;

let prisma: PrismaClientType | null = null;

export function getPrisma(): PrismaClientType | null {
	if (!isDatabaseConfigured()) return null;
	if (prisma) return prisma;
	try {
		// Resolve connection string from multiple env variants
		const dbUrl =
			process.env.DATABASE_URL ??
			process.env.POSTGRES_URL ??
			(process.env as any).POSTGRES_PRISMA_URL ??
			process.env.POSTGRES_URL_NON_POOLING;
		if (!dbUrl) return null;

		// Prisma 7: pass datasourceUrl directly to PrismaClient
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { PrismaClient } = require('@prisma/client') as { PrismaClient: new (args?: any) => PrismaClientType };
		prisma = new PrismaClient({ datasourceUrl: dbUrl });
		return prisma;
	} catch {
		return null;
	}
}


