import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Params = { params: { id: string } };

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: Params) {
	const baseDir = path.join(process.cwd(), '.data', 'media');
	try {
		const files = fs.readdirSync(baseDir);
		const file = files.find((f) => f.startsWith(params.id + '.'));
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


