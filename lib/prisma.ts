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
		// Ensure Prisma sees a valid DATABASE_URL even if only POSTGRES_* are set
		const dbUrl =
			process.env.DATABASE_URL ??
			process.env.POSTGRES_URL ??
			(process.env as any).POSTGRES_PRISMA_URL ??
			process.env.POSTGRES_URL_NON_POOLING;
		if (!process.env.DATABASE_URL && dbUrl) {
			process.env.DATABASE_URL = dbUrl;
		}
		// Require at runtime to avoid typegen dependency at build time.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { PrismaClient } = require('@prisma/client') as { PrismaClient: new () => PrismaClientType };
		prisma = new PrismaClient();
		return prisma;
	} catch {
		return null;
	}
}


