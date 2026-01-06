import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function POST(req: Request) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	if (!prisma) {
		return NextResponse.json(
			{
				ok: false,
				error: 'DB_UNAVAILABLE',
				message: 'Database is not configured or not reachable.',
				hint: 'Set DATABASE_URL or POSTGRES_URL in your environment.',
			},
			{ status: 503 },
		);
	}
	try {
		const form = await req.formData();
		const file = form.get('file') as File | null;
		const alt = (form.get('alt') as string) || null;
		const notes = (form.get('notes') as string) || null;
		if (!file) return NextResponse.json({ ok: false, error: 'MISSING_FILE', message: 'Missing file' }, { status: 400 });
		if (!file.type.startsWith('image/')) {
			return NextResponse.json({ ok: false, error: 'INVALID_TYPE', message: 'Only image uploads are allowed' }, { status: 400 });
		}
		// Create DB record first to get id
		const created = await prisma.mediaAsset.create({
			data: { url: '', alt, notes, contentType: file.type, size: file.size, isArchived: false },
		});
		const ext = (file.type.split('/')[1] || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
		const baseDir = path.join(process.cwd(), '.data', 'media');
		ensureDir(baseDir);
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
	} catch (e) {
		return NextResponse.json({ ok: false, error: 'UPLOAD_FAILED', message: 'Upload failed' }, { status: 500 });
	}
}


