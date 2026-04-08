import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

export type AdminNewsItemRecord = {
	id: string;
	url: string;
	title: string;
	source: string;
	publishedAt: string;
	createdAt: string;
	enriched: Record<string, unknown> | null;
};

/**
 * Pojedynczy wiersz news_items dla panelu admina (pełne enriched).
 */
export async function getAdminNewsItemById(id: string): Promise<AdminNewsItemRecord | null> {
	const trimmed = String(id || '').trim();
	if (!trimmed) return null;
	if (!isDatabaseConfigured()) return null;

	try {
		const { rows } = await sql<{
			id: string;
			url: string;
			title: string;
			source: string;
			published_at: Date;
			created_at: Date;
			enriched: unknown;
		}>`
			SELECT id, url, title, source, published_at, created_at, enriched
			FROM news_items
			WHERE id = ${trimmed}
			LIMIT 1
		`;
		const r = rows[0];
		if (!r) return null;

		const enriched =
			r.enriched && typeof r.enriched === 'object' && !Array.isArray(r.enriched)
				? (r.enriched as Record<string, unknown>)
				: null;

		return {
			id: r.id,
			url: r.url,
			title: r.title,
			source: r.source,
			publishedAt: new Date(r.published_at).toISOString(),
			createdAt: new Date(r.created_at).toISOString(),
			enriched,
		};
	} catch (e: unknown) {
		const code = (e as { code?: string })?.code;
		if (code === '42P01') return null;
		throw e;
	}
}
