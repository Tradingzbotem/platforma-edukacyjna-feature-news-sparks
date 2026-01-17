import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { createFallbackMediaAsset } from '@/lib/redakcja/mediaFallbackStore';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureMediaAssetBlobTable, ensureMediaAssetTable } from '@/lib/redakcja/ensureDb';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const maxDuration = 60;

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function saveImageToLocalDataDir(params: { id: string; ext: string; file: File }) {
	const baseDir = path.join(process.cwd(), '.data', 'media');
	ensureDir(baseDir);
	const filename = `${params.id}.${params.ext}`;
	const filePath = path.join(baseDir, filename);
	const arrayBuffer = await params.file.arrayBuffer();
	fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
	const url = `/api/redakcja/media/file/${params.id}`;
	return { url, pathname: filePath };
}

async function createMediaAssetWithSql(params: {
	file: File;
	ext: string;
	alt: string | null;
	notes: string | null;
	blobToken: string;
}) {
	const genId =
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? (crypto as any).randomUUID()
			: `m_${Date.now().toString(36)}`;
	await ensureMediaAssetTable();
	await ensureMediaAssetBlobTable();

	let url: string | null = null;
	let pathname: string | null = null;
	if (params.blobToken) {
		try {
			const { put } = await import('@vercel/blob');
			const filename = `${genId}.${params.ext}`;
			const uploaded = await put(`redakcja/${filename}`, params.file, { access: 'public', token: params.blobToken });
			url = uploaded.url;
			pathname = null;
		} catch {
			// Blob store missing or unavailable → fall back to DB bytes in Neon.
		}
	}
	if (!url) {
		const bytes = Buffer.from(await params.file.arrayBuffer());
		await sql`
      INSERT INTO "MediaAssetBlob" (id, data, "createdAt", "updatedAt")
      VALUES (${genId}, ${bytes}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW()
    `;
		url = `/api/redakcja/media/file/${genId}`;
		pathname = null;
	}

	const { rows } = await sql<{
		id: string;
		url: string;
		pathname: string | null;
		contentType: string | null;
		size: number | null;
		alt: string | null;
		notes: string | null;
		isArchived: boolean;
		createdAt: Date;
		updatedAt: Date;
	}>`
    INSERT INTO "MediaAsset" (id, url, pathname, "contentType", size, alt, notes, "isArchived", "createdAt", "updatedAt")
    VALUES (
      ${genId},
      ${url},
      ${pathname},
      ${params.file.type || null},
      ${typeof params.file.size === 'number' ? params.file.size : null},
      ${params.alt},
      ${params.notes},
      FALSE,
      NOW(),
      NOW()
    )
    RETURNING id, url, pathname, "contentType", size, alt, notes, "isArchived", "createdAt", "updatedAt"
  `;

	return rows[0] ?? null;
}

export async function POST(req: Request) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	try {
		const form = await req.formData();
		const file = form.get('file') as File | null;
		const alt = (form.get('alt') as string) || null;
		const notes = (form.get('notes') as string) || null;
		if (!file) return NextResponse.json({ ok: false, error: 'MISSING_FILE', message: 'Missing file' }, { status: 400 });
		if (!file.type.startsWith('image/')) {
			return NextResponse.json({ ok: false, error: 'INVALID_TYPE', message: 'Only image uploads are allowed' }, { status: 400 });
		}

		const ext = (file.type.split('/')[1] || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
		const blobToken =
			process.env.BLOB_READ_WRITE_TOKEN ||
			// support alternative naming just in case
			(process.env as any).VERCEL_BLOB_RW_TOKEN ||
			(process.env as any).BLOB_TOKEN ||
			'';

		// If Prisma is available, use DB-first path
		if (prisma) {
			try {
				// Prefer SQL-based path so MediaAsset is always in Neon.
				if (isDatabaseConfigured()) {
					const created = await createMediaAssetWithSql({ file, ext, alt, notes, blobToken });
					if (created) return NextResponse.json({ ok: true, ...created }, { status: 201 });
				}

				// Local/file-based path (works in dev; NOT persisted on serverless)
				// Create DB record first to get id
				const created = await prisma.mediaAsset.create({
					data: { url: '', alt, notes, contentType: file.type, size: file.size, isArchived: false },
				});
				const { url, pathname: filePath } = await saveImageToLocalDataDir({ id: created.id, ext, file });
				const saved = await prisma.mediaAsset.update({
					where: { id: created.id },
					data: { url, pathname: filePath, contentType: file.type },
				});
				return NextResponse.json({ ok: true, ...saved }, { status: 201 });
			} catch (e: any) {
				const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
				if (connectionErrors.has(e?.code)) {
					return NextResponse.json(
						{
							ok: false,
							error: 'DB_CONNECTION_FAILED',
							code: e?.code || 'UNKNOWN',
							message: e?.message || 'Database connection failed while uploading media.',
							hint: 'To działało wcześniej, więc najczęściej zmieniły się ENV w Production albo DB jest niedostępna (np. inny projekt Vercel / odpięty Neon / inny region / wygasły credentials).',
						},
						{ status: 503 },
					);
				}

				return NextResponse.json(
					{
						ok: false,
						error: 'PRISMA_ERROR',
						code: e?.code || 'UNKNOWN',
						message: e?.message || 'Prisma error while creating MediaAsset',
					},
					{ status: 500 },
				);
			}
		}

		// Direct Neon SQL when Prisma client isn't available but env is configured
		if (isDatabaseConfigured()) {
			try {
				const created = await createMediaAssetWithSql({ file, ext, alt, notes, blobToken });
				if (created) return NextResponse.json({ ok: true, ...created }, { status: 201 });
			} catch (e: any) {
				return NextResponse.json(
					{ ok: false, error: 'DB_UNAVAILABLE', message: e?.message || 'Database unavailable for upload.' },
					{ status: 500 },
				);
			}
		}

		// On serverless (Vercel) do NOT write to filesystem.
		if (process.env.VERCEL) {
			return NextResponse.json(
				{
					ok: false,
					error: 'UPLOAD_STORAGE_UNAVAILABLE',
					message:
						'Upload storage unavailable. Configure database (POSTGRES_PRISMA_URL/DATABASE_URL) or BLOB_READ_WRITE_TOKEN. Serverless filesystem is read-only.',
					debug: {
						hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
						hasPostgresPrismaUrl: Boolean((process.env as any).POSTGRES_PRISMA_URL),
						hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
						hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env as any).VERCEL_BLOB_RW_TOKEN || (process.env as any).BLOB_TOKEN),
						prismaAvailable: Boolean(prisma),
					},
				},
				{ status: 500 },
			);
		}

		// Fallback: generate id, save file locally, and persist metadata in file store
		const genId =
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? (crypto as any).randomUUID()
				: `m_${Date.now().toString(36)}`;
		const local = await saveImageToLocalDataDir({ id: genId, ext, file });
		const saved = await createFallbackMediaAsset({
			id: genId,
			url: local.url,
			pathname: local.pathname,
			contentType: file.type || null,
			size: typeof file.size === 'number' ? file.size : null,
			alt,
			notes,
			isArchived: false,
		});
		return NextResponse.json({ ok: true, ...saved }, { status: 201 });
	} catch (e: any) {
		return NextResponse.json(
			{
				ok: false,
				error: 'UPLOAD_FAILED',
				message: e?.message ? String(e.message) : 'Upload failed',
				code: e?.code ? String(e.code) : undefined,
			},
			{ status: 500 },
		);
	}
}


