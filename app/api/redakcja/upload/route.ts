import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { createFallbackMediaAsset } from '@/lib/redakcja/mediaFallbackStore';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureMediaAssetTable } from '@/lib/redakcja/ensureDb';

export const runtime = 'nodejs';
export const maxDuration = 60;

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
		const baseDir = path.join(process.cwd(), '.data', 'media');
		ensureDir(baseDir);

		// If Prisma is available, use DB-first path
		if (prisma) {
			try {
				// Prefer persistent blob storage in production when token is configured
				if (blobToken) {
					const { put } = await import('@vercel/blob');
					// Create DB record first to get id
					const created = await prisma.mediaAsset.create({
						data: { url: '', alt, notes, contentType: file.type, size: file.size, isArchived: false },
					});
					const filename = `${created.id}.${ext}`;
					const uploaded = await put(`redakcja/${filename}`, file, { access: 'public', token: blobToken });
					const saved = await prisma.mediaAsset.update({
						where: { id: created.id },
						data: { url: uploaded.url, pathname: null, contentType: file.type },
					});
					return NextResponse.json({ ok: true, ...saved }, { status: 201 });
				} else {
					// Local/file-based path (works in dev; not persisted on serverless)
					// Create DB record first to get id
					const created = await prisma.mediaAsset.create({
						data: { url: '', alt, notes, contentType: file.type, size: file.size, isArchived: false },
					});
					const filename = `${created.id}.${ext}`;
					const filePath = path.join(baseDir, filename);
					const arrayBuffer = await file.arrayBuffer();
					fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
					const url = `/api/redakcja/media/file/${created.id}`;
					const saved = await prisma.mediaAsset.update({
						where: { id: created.id },
						data: { url, pathname: filePath, contentType: file.type },
					});
					return NextResponse.json({ ok: true, ...saved }, { status: 201 });
				}
			} catch (e: any) {
				const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
				if (!connectionErrors.has(e?.code)) {
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
				// fall through to file-based save
			}
		}

		// Direct Neon SQL when Prisma client isn't available but env is configured
		if (isDatabaseConfigured()) {
			try {
				await ensureMediaAssetTable();
				const genId =
					typeof crypto !== 'undefined' && 'randomUUID' in crypto
						? (crypto as any).randomUUID()
						: `m_${Date.now().toString(36)}`;
				const filename = `${genId}.${ext}`;
				let url: string | null = null;
				let pathname: string | null = null;
				if (blobToken) {
					const { put } = await import('@vercel/blob');
					const uploaded = await put(`redakcja/${filename}`, file, { access: 'public', token: blobToken });
					url = uploaded.url;
					pathname = null;
				} else {
					const filePath = path.join(baseDir, filename);
					const arrayBuffer = await file.arrayBuffer();
					fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
					url = `/api/redakcja/media/file/${genId}`;
					pathname = filePath;
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
            ${file.type || null},
            ${typeof file.size === 'number' ? file.size : null},
            ${alt},
            ${notes},
            FALSE,
            NOW(),
            NOW()
          )
          RETURNING id, url, pathname, "contentType", size, alt, notes, "isArchived", "createdAt", "updatedAt"
        `;
				const created = rows[0];
				if (created) {
					return NextResponse.json({ ok: true, ...created }, { status: 201 });
				}
			} catch (e: any) {
				// If SQL path fails (missing perms/table), fall through to file-based store
			}
		}

		// Fallback: generate id, save file locally, and persist metadata in file store
		const genId =
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? (crypto as any).randomUUID()
				: `m_${Date.now().toString(36)}`;
		const filename = `${genId}.${ext}`;
		const filePath = path.join(baseDir, filename);
		const arrayBuffer = await file.arrayBuffer();
		fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
		const url = `/api/redakcja/media/file/${genId}`;
		const saved = await createFallbackMediaAsset({
			id: genId,
			url,
			pathname: filePath,
			contentType: file.type || null,
			size: typeof file.size === 'number' ? file.size : null,
			alt,
			notes,
			isArchived: false,
		});
		return NextResponse.json({ ok: true, ...saved }, { status: 201 });
	} catch (e) {
		return NextResponse.json({ ok: false, error: 'UPLOAD_FAILED', message: 'Upload failed' }, { status: 500 });
	}
}


