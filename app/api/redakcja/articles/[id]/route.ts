import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { articleInputSchema, parseTags, slugify } from '@/lib/redakcja/admin';
import { revalidatePath } from 'next/cache';

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
	try {
		const data = await req.json();
		// get current slug to handle slug change revalidation
		const before = await prisma.article.findUnique({ where: { id: params.id }, select: { slug: true } });
		const parsed = articleInputSchema.partial().parse(data || {});
		const payload: any = {};
		if (parsed.title !== undefined) payload.title = parsed.title;
		if (parsed.slug !== undefined) payload.slug = parsed.slug || slugify(payload.title || '');
		if (parsed.excerpt !== undefined) payload.excerpt = parsed.excerpt ?? null;
		if (parsed.content !== undefined) payload.content = parsed.content;
		if (parsed.status !== undefined) payload.status = parsed.status;
		if (parsed.coverImageUrl !== undefined) payload.coverImageUrl = parsed.coverImageUrl ?? null;
		if (parsed.coverImageAlt !== undefined) payload.coverImageAlt = parsed.coverImageAlt ?? null;
		if (parsed.readingTime !== undefined) payload.readingTime = parsed.readingTime ?? null;
		if (parsed.tags !== undefined) payload.tags = parseTags(parsed.tags);
		if (parsed.seoTitle !== undefined) payload.seoTitle = parsed.seoTitle ?? null;
		if (parsed.seoDescription !== undefined) payload.seoDescription = parsed.seoDescription ?? null;

		// If status becomes PUBLISHED and no publishedAt yet, keep it unchanged (only publish endpoint sets date)
		const updated = await prisma.article.update({
			where: { id: params.id },
			data: payload,
		});
		// Revalidate list and affected detail pages
		revalidatePath('/redakcja');
		if (before?.slug) revalidatePath(`/redakcja/${before.slug}`);
		if (updated.slug && updated.slug !== before?.slug) revalidatePath(`/redakcja/${updated.slug}`);
		return NextResponse.json(updated);
	} catch (e: any) {
		if (e?.code === 'P2002') {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
	}
}

export async function DELETE(_req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
	try {
		const before = await prisma.article.findUnique({ where: { id: params.id }, select: { slug: true } });
		await prisma.article.delete({ where: { id: params.id } });
		// Revalidate list and previous detail page
		revalidatePath('/redakcja');
		if (before?.slug) revalidatePath(`/redakcja/${before.slug}`);
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
}


