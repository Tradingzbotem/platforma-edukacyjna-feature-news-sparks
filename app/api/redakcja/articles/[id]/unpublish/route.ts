import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
	try {
		const article = await prisma.article.findUnique({ where: { id: params.id }, select: { slug: true } });
		const updated = await prisma.article.update({
			where: { id: params.id },
			data: { status: 'DRAFT', publishedAt: null },
		});
		revalidatePath('/redakcja');
		if (article?.slug) revalidatePath(`/redakcja/${article.slug}`);
		return NextResponse.json(updated);
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
}


