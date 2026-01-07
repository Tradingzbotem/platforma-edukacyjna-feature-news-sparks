import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { isDatabaseConfigured } from '@/lib/db';

export async function GET() {
	try {
		const envConfigured = isDatabaseConfigured();
		// Check if the generated client is present on disk
		let clientResolved: string | null = null;
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			clientResolved = require.resolve('@prisma/client');
		} catch {
			clientResolved = null;
		}

		const prisma = getPrisma();
		if (!prisma) {
			return NextResponse.json(
				{
					ok: false,
					error: 'NO_PRISMA_CLIENT',
					message: 'Prisma client unavailable (not generated or cannot be required)',
					envConfigured,
					clientResolved,
				},
				{ status: 503 },
			);
		}
		// Simple connectivity check
		await prisma.$executeRawUnsafe('SELECT 1');
		// Try to read minimal info from Article if exists
		let articleCount: number | null = null;
		try {
			const r = await prisma.$queryRawUnsafe<any[]>('SELECT COUNT(*)::int AS count FROM "Article";');
			articleCount = Array.isArray(r) && r[0] && typeof r[0].count === 'number' ? r[0].count : null;
		} catch {
			// ignore if table doesn't exist
		}
		return NextResponse.json({ ok: true, client: 'prisma', articleCount, envConfigured, clientResolved });
	} catch (e: any) {
		return NextResponse.json(
			{ ok: false, error: 'PRISMA_ERROR', code: e?.code, message: e?.message || String(e) },
			{ status: 500 },
		);
	}
}

export const runtime = 'nodejs';


