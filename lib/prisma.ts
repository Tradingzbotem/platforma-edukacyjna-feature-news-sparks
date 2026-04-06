// lib/prisma.ts — minimal Prisma singleton with safety for missing env/DB.
// Avoid importing Prisma types to prevent generator-time issues in environments without DB.
import { isDatabaseConfigured } from '@/lib/db';

type PrismaClientType = any;

let prisma: PrismaClientType | null = null;

let loggedNotConfigured = false;
let loggedMissingDbUrl = false;
let loggedInitAttempt = false;

function resolvePrismaDbUrl(): { url: string; source: string } | null {
	if (process.env.DATABASE_URL) {
		return { url: process.env.DATABASE_URL, source: 'DATABASE_URL' };
	}

	if (process.env.DATABASE_URL_UNPOOLED) {
		return { url: process.env.DATABASE_URL_UNPOOLED, source: 'DATABASE_URL_UNPOOLED' };
	}

	if (process.env.DATABASE_URL_NON_POOLING) {
		return { url: process.env.DATABASE_URL_NON_POOLING, source: 'DATABASE_URL_NON_POOLING' };
	}

	if (process.env.POSTGRES_URL) {
		return { url: process.env.POSTGRES_URL, source: 'POSTGRES_URL' };
	}

	const prismaUrl = (process.env as { POSTGRES_PRISMA_URL?: string }).POSTGRES_PRISMA_URL;
	if (prismaUrl) {
		return { url: prismaUrl, source: 'POSTGRES_PRISMA_URL' };
	}

	if (process.env.POSTGRES_URL_NON_POOLING) {
		return { url: process.env.POSTGRES_URL_NON_POOLING, source: 'POSTGRES_URL_NON_POOLING' };
	}

	return null;
}

export function getPrisma(): PrismaClientType | null {
	const configured = isDatabaseConfigured();

	if (!configured) {
		if (!loggedNotConfigured) {
			loggedNotConfigured = true;
			console.error('[getPrisma] isDatabaseConfigured(): false');
		}
		return null;
	}

	if (prisma) {
		return prisma;
	}

	const resolved = resolvePrismaDbUrl();
	if (!resolved) {
		if (!loggedMissingDbUrl) {
			loggedMissingDbUrl = true;
			console.error('[getPrisma] isDatabaseConfigured(): true');
			console.error(
				'[getPrisma] dbUrl: not found for PrismaClient (checked in order: DATABASE_URL, DATABASE_URL_UNPOOLED, DATABASE_URL_NON_POOLING, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING)',
			);
		}
		return null;
	}

	if (!loggedInitAttempt) {
		loggedInitAttempt = true;
		console.warn('[getPrisma] isDatabaseConfigured(): true');
		console.warn('[getPrisma] dbUrl: found (env var name only):', resolved.source);
	}

	let step = 'require(@prisma/client)';
	try {
		// Prisma 7+: client requires a driver adapter or accelerateUrl — use @prisma/adapter-pg.
		const { PrismaClient } = require('@prisma/client');
		step = 'require(@prisma/adapter-pg) PrismaPg';
		const { PrismaPg } = require('@prisma/adapter-pg');
		step = 'new PrismaPg({ connectionString })';
		const adapter = new PrismaPg({ connectionString: resolved.url });
		step = 'new PrismaClient({ adapter })';
		prisma = new PrismaClient({ adapter });
		return prisma;
	} catch (e) {
		console.error('[getPrisma] Prisma initialization failed at step:', step);
		console.error('[getPrisma] isDatabaseConfigured():', configured);
		console.error('[getPrisma] dbUrl from env var (name only):', resolved.source);
		console.error('[getPrisma] error:', e);
		return null;
	}
}
