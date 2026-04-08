/**
 * Wybór jednego news_items dla automatycznego generowania artykułu Redakcji (cron).
 *
 * Brak w schemacie powiązania Article ↔ news_id: deduplikacja heurystyczna przez
 * strpos(content, url) — jeśli URL newsa występuje w treści któregoś artykułu,
 * uznajemy że z tego newsa już powstał wpis (appendix „Dane wydarzenia” zawiera link).
 */
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

export async function selectNewsItemIdForCronEditorial(): Promise<string | null> {
	if (!isDatabaseConfigured()) return null;

	try {
		const { rows } = await sql<{ id: string }>`
      SELECT n.id
      FROM news_items n
      WHERE n.url IS NOT NULL AND length(trim(n.url)) > 0
        AND NOT EXISTS (
          SELECT 1 FROM "Article" a
          WHERE strpos(coalesce(a.content, ''), n.url) > 0
        )
      ORDER BY (n.enriched IS NOT NULL) DESC, n.published_at DESC NULLS LAST
      LIMIT 1
    `;
		return rows[0]?.id ?? null;
	} catch (e: unknown) {
		const code = (e as { code?: string })?.code;
		if (code === '42P01') {
			try {
				const { rows } = await sql<{ id: string }>`
          SELECT id
          FROM news_items
          WHERE url IS NOT NULL AND length(trim(url)) > 0
          ORDER BY (enriched IS NOT NULL) DESC, published_at DESC NULLS LAST
          LIMIT 1
        `;
				return rows[0]?.id ?? null;
			} catch (e2: unknown) {
				const c2 = (e2 as { code?: string })?.code;
				if (c2 === '42P01') return null;
				throw e2;
			}
		}
		throw e;
	}
}
