import 'server-only';
import { getPrisma } from '@/lib/prisma';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureArticleTable } from '@/lib/redakcja/ensureDb';

export type DbArticle = {
	id: string;
	slug: string;
	title: string;
	content: string;
	readingTime: number | null;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
};

export async function getPublishedArticles(): Promise<DbArticle[]> {
	const prisma = getPrisma();
	if (prisma) {
		try {
			const items = await prisma.article.findMany({
				orderBy: [{ createdAt: 'desc' }],
				select: {
					id: true,
					slug: true,
					title: true,
					content: true,
					readingTime: true,
					tags: true,
					createdAt: true,
					updatedAt: true,
				},
			});
			return items as DbArticle[];
		} catch {
			// fall through to SQL path
		}
	}
	// Fallback to direct SQL (Neon/@vercel/postgres) when Prisma client isn't available
	if (isDatabaseConfigured()) {
		try {
			await ensureArticleTable();
			const { rows } = await sql<{
				id: string;
				slug: string;
				title: string;
				content: string;
				readingTime: number | null;
				tags: string[] | null;
				createdAt: Date;
				updatedAt: Date;
			}>`
        SELECT id, slug, title, content, "readingTime", tags, "createdAt", "updatedAt"
        FROM "Article"
        ORDER BY "createdAt" DESC
      `;
			return rows.map((r) => ({
				id: r.id,
				slug: r.slug,
				title: r.title,
				content: r.content,
				readingTime: r.readingTime ?? null,
				tags: (r.tags ?? []) as string[],
				createdAt: r.createdAt,
				updatedAt: r.updatedAt,
			}));
		} catch {
			// ignore and return empty
		}
	}
	return [];
}

export async function getPublishedArticleBySlug(slug: string): Promise<DbArticle | null> {
	const prisma = getPrisma();
	if (prisma) {
		try {
			const item = await prisma.article.findFirst({
				where: { slug },
				select: {
					id: true,
					slug: true,
					title: true,
					content: true,
					readingTime: true,
					tags: true,
					createdAt: true,
					updatedAt: true,
				},
			});
			return (item as DbArticle) ?? null;
		} catch {
			// fall through to SQL path
		}
	}
	// Fallback to direct SQL
	if (isDatabaseConfigured()) {
		try {
			await ensureArticleTable();
			const { rows } = await sql<{
				id: string;
				slug: string;
				title: string;
				content: string;
				readingTime: number | null;
				tags: string[] | null;
				createdAt: Date;
				updatedAt: Date;
			}>`
        SELECT id, slug, title, content, "readingTime", tags, "createdAt", "updatedAt"
        FROM "Article"
        WHERE slug = ${slug}
        LIMIT 1
      `;
			const r = rows[0];
			if (!r) return null;
			return {
				id: r.id,
				slug: r.slug,
				title: r.title,
				content: r.content,
				readingTime: r.readingTime ?? null,
				tags: (r.tags ?? []) as string[],
				createdAt: r.createdAt,
				updatedAt: r.updatedAt,
			};
		} catch {
			// ignore
		}
	}
	return null;
}


