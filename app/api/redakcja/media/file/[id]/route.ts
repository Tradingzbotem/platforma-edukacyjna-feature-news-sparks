import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isDatabaseConfigured } from '@/lib/db';
import { getPrisma } from '@/lib/prisma';
import { sql } from '@vercel/postgres';
import { ensureMediaAssetBlobTable } from '@/lib/redakcja/ensureDb';

type Params = { params: Promise<{ id: string }> };

export const runtime = 'nodejs';

function toBuffer(data: unknown): Buffer | null {
	if (!data) return null;
	if (Buffer.isBuffer(data)) return data;
	if (data instanceof ArrayBuffer) return Buffer.from(new Uint8Array(data));
	if (data instanceof Uint8Array) return Buffer.from(data);
	if (typeof data === 'object' && data !== null) {
		const maybe = data as { type?: unknown; data?: unknown };
		if (maybe.type === 'Buffer' && Array.isArray(maybe.data)) {
			try {
				return Buffer.from(maybe.data as number[]);
			} catch {
				return null;
			}
		}
	}
	if (typeof data === 'string') {
		const trimmed = data.trim();
		if (trimmed.startsWith('{')) {
			try {
				const parsed = JSON.parse(trimmed) as { type?: string; data?: unknown };
				if (parsed?.type === 'Buffer' && Array.isArray(parsed.data)) {
					return Buffer.from(parsed.data as number[]);
				}
				if (Array.isArray(parsed?.data)) {
					return Buffer.from(parsed.data as number[]);
				}
			} catch {
				// ignore JSON parse errors
			}
		}
		// Postgres bytea can come back as "\\x..." hex string
		if (data.startsWith('\\x')) {
			try {
				return Buffer.from(data.slice(2), 'hex');
			} catch {
				return null;
			}
		}
		// Raw hex string - PostgreSQL encode() returns hex strings without prefix
		// For very long strings, skip regexp check (causes stack overflow) and try conversion directly
		if (data.length % 2 === 0 && data.length > 0) {
			// For strings longer than 10KB, skip regexp and try hex conversion directly
			// For shorter strings, do a quick validation
			let shouldTryHex = false;
			if (data.length > 10000) {
				// Very long string - assume it's hex from PostgreSQL encode() and try conversion
				shouldTryHex = true;
			} else {
				// Short string - do quick regexp check
				shouldTryHex = /^[0-9a-fA-F]+$/.test(data);
			}
			
			if (shouldTryHex) {
				try {
					return Buffer.from(data, 'hex');
				} catch {
					// Not valid hex, continue to fallback
				}
			}
		}
		// Fallback: treat as base64 if it looks like it
		try {
			return Buffer.from(data, 'base64');
		} catch {
			return null;
		}
	}
	return null;
}

function normalizeBuffer(buf: Buffer): Buffer {
	// Handle legacy JSON-serialized buffers stored in bytea
	if (buf.length > 2 && buf[0] === 0x7b) {
		try {
			const text = buf.toString('utf-8');
			if (text.includes('"data"')) {
				const parsed = JSON.parse(text) as { data?: unknown };
				if (Array.isArray(parsed?.data)) {
					return Buffer.from(parsed.data as number[]);
				}
			}
		} catch {
			// ignore JSON parse errors
		}
	}
	return buf;
}

export async function GET(_req: Request, ctx: Params) {
	const { id } = await ctx.params;
	// 1) Prefer DB blob storage (works on serverless)
	if (isDatabaseConfigured()) {
		const prisma = getPrisma();
		try {
			// First check if MediaAsset has an external URL (Vercel Blob, etc.)
			// If so, redirect to it instead of trying to serve from blob storage
			try {
				let externalUrl: string | null = null;
				if (prisma) {
					const asset = await prisma.mediaAsset.findUnique({
						where: { id },
						select: { url: true },
					});
					if (asset?.url && (asset.url.startsWith('http://') || asset.url.startsWith('https://'))) {
						externalUrl = asset.url;
					}
				}
				if (!externalUrl) {
					const urlRows = await sql<{ url: string }>`
						SELECT url FROM "MediaAsset" WHERE id = ${id} LIMIT 1
					`;
					if (urlRows.rows?.[0]?.url && (urlRows.rows[0].url.startsWith('http://') || urlRows.rows[0].url.startsWith('https://'))) {
						externalUrl = urlRows.rows[0].url;
					}
				}
				if (externalUrl) {
					return NextResponse.redirect(externalUrl);
				}
			} catch (e) {
				console.error('Error checking external URL:', e);
				// Continue to blob storage lookup
			}

			// Ensure table exists before querying
			await ensureMediaAssetBlobTable();
			
			let data: unknown = null;
			let contentType: string | null = null;
			if (prisma) {
				try {
					const rows = (await prisma.$queryRaw`
						SELECT encode(b.data, 'hex') AS data, m."contentType" AS "contentType"
						FROM "MediaAssetBlob" b
						LEFT JOIN "MediaAsset" m ON m.id = b.id
						WHERE b.id = ${id}
						LIMIT 1
				  `) as Array<{ data: unknown; contentType?: string | null }>;
					data = rows?.[0]?.data ?? null;
					contentType = (rows?.[0]?.contentType as string | null) ?? null;
				} catch (e) {
					console.error('Prisma query error in media file route:', e);
					// fall through to SQL
				}
			}
			if (!data) {
				try {
					const rows = await sql<{ data: unknown; contentType: string | null }>`
            SELECT encode(b.data, 'hex') AS data, m."contentType" AS "contentType"
            FROM "MediaAssetBlob" b
            LEFT JOIN "MediaAsset" m ON m.id = b.id
            WHERE b.id = ${id}
            LIMIT 1
          `;
					if (rows.rows && rows.rows.length > 0) {
						data = rows.rows[0]?.data ?? null;
						contentType = rows.rows[0]?.contentType ?? null;
						console.log(`Media file found in database for id: ${id}, data length: ${data ? String(data).length : 0}`);
					} else {
						console.warn(`Media file blob not found in database for id: ${id}`);
					}
				} catch (e) {
					console.error('SQL query error in media file route:', e);
					console.error('Error details:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
				}
			}

			if (data) {
				// Content-Type is not stored here; we infer a best-effort type from binary signature (or default)
				// Since uploader only allows image/*, default to image/* safe fallback if detection fails.
				let buf = toBuffer(data);
				if (!buf) {
					console.error('Failed to convert data to buffer for media file:', id);
					// fall through to FS
				} else {
					buf = normalizeBuffer(buf);
					const isPng = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
					const isJpg = buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8;
					const isGif =
						buf.length > 6 && (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a');
					const isWebp =
						buf.length > 12 &&
						buf.toString('ascii', 0, 4) === 'RIFF' &&
						buf.toString('ascii', 8, 12) === 'WEBP';
					const inferred = isPng
						? 'image/png'
						: isJpg
							? 'image/jpeg'
							: isGif
								? 'image/gif'
								: isWebp
									? 'image/webp'
									: 'application/octet-stream';
					const mime = contentType || inferred;
					return new NextResponse(buf, {
						status: 200,
						headers: {
							'Content-Type': mime,
							'Cache-Control': 'public, max-age=31536000, immutable',
						},
					});
				}
			} else {
				console.warn('Media file not found in database blob storage:', id);
			}
		} catch (e) {
			console.error('Error fetching media file from database:', e);
			// fall back to FS
		}
	}

	// 2) Fallback: local filesystem (dev)
	const baseDir = path.join(process.cwd(), '.data', 'media');
	try {
		const files = fs.readdirSync(baseDir);
		const file = files.find((f) => f.startsWith(id + '.'));
		if (!file) return new NextResponse('Not found', { status: 404 });
		const filePath = path.join(baseDir, file);
		const buf = fs.readFileSync(filePath);
		const ext = path.extname(file).slice(1).toLowerCase();
		const mime =
			ext === 'jpg' || ext === 'jpeg'
				? 'image/jpeg'
				: ext === 'png'
				? 'image/png'
				: ext === 'gif'
				? 'image/gif'
				: ext === 'webp'
				? 'image/webp'
				: 'application/octet-stream';
		return new NextResponse(buf, {
			status: 200,
			headers: {
				'Content-Type': mime,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});
	} catch {
		return new NextResponse('Not found', { status: 404 });
	}
}


