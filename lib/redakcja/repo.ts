import 'server-only';
import { getPrisma } from '@/lib/prisma';

export type DbArticle = {
	id: string;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string;
	status: 'DRAFT' | 'PUBLISHED';
	publishedAt: Date | null;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	readingTime: number | null;
	tags: string[];
	seoTitle: string | null;
	seoDescription: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export async function getPublishedArticles(): Promise<DbArticle[]> {
	const prisma = getPrisma();
	if (!prisma) return [];
	try {
		const items = await prisma.article.findMany({
			where: { status: 'PUBLISHED' },
			orderBy: [
				{ publishedAt: 'desc' },
				{ createdAt: 'desc' },
			],
			select: {
				id: true,
				slug: true,
				title: true,
				excerpt: true,
				content: true,
				status: true,
				publishedAt: true,
				coverImageUrl: true,
				coverImageAlt: true,
				readingTime: true,
				tags: true,
				seoTitle: true,
				seoDescription: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return items as DbArticle[];
	} catch {
		return [];
	}
}

export async function getPublishedArticleBySlug(slug: string): Promise<DbArticle | null> {
	const prisma = getPrisma();
	if (!prisma) return null;
	try {
		const item = await prisma.article.findFirst({
			where: { slug, status: 'PUBLISHED' },
			select: {
				id: true,
				slug: true,
				title: true,
				excerpt: true,
				content: true,
				status: true,
				publishedAt: true,
				coverImageUrl: true,
				coverImageAlt: true,
				readingTime: true,
				tags: true,
				seoTitle: true,
				seoDescription: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return (item as DbArticle) ?? null;
	} catch {
		return null;
	}
}


