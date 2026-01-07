'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ArticleListItem } from '@/lib/redakcja/types';
import { extractCoverFromContent } from '@/lib/redakcja/content-utils';
import ArticleRow from './ArticleRow';
import CategoryTabs from './CategoryTabs';

type ApiItem = {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	status: 'DRAFT' | 'PUBLISHED';
	publishedAt: string | null;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	readingTime: number | null;
	tags: string[];
	seoTitle: string | null;
	seoDescription: string | null;
	createdAt: string;
	updatedAt: string;
	_storage?: 'file';
};

type ApiResponse =
	| { ok: true; items: ApiItem[]; _storage?: 'file' }
	| { ok: false; error: string; message: string };

function normalize(item: ApiItem): ArticleListItem {
	const dateSource = item.publishedAt || item.createdAt;
	const derived = extractCoverFromContent(item.content || '');
	return {
		title: item.title,
		slug: item.slug,
		date: (dateSource || '').slice(0, 10),
		tags: Array.isArray(item.tags) ? item.tags : [],
		readingTime: item.readingTime ?? 0,
		excerpt: item.excerpt || '',
		coverImageUrl: item.coverImageUrl || derived.cover.url || undefined,
	};
}

export default function ArticlesFeedClient() {
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<(ArticleListItem & { __key: string })[]>([]);

	useEffect(() => {
		const ac = new AbortController();
		setLoading(true);
		setError(null);
		fetch('/api/redakcja/articles', { signal: ac.signal, cache: 'no-store' })
			.then(async (r) => {
				const data = (await r.json()) as ApiResponse;
				if (!r.ok) throw new Error((data as any)?.message || 'Request failed');
				if (!('ok' in data) || data.ok !== true) throw new Error((data as any)?.message || 'Invalid response');
				// Deduplicate by id (can happen when mixing DB and fallback or after rapid updates)
				const uniqueById = Array.from(new Map(data.items.map((it) => [it.id, it])).values());
				const normalized = uniqueById.map((it) => {
					const n = normalize(it);
					// Build a stable React key (prefer id; fallback to slug+updatedAt)
					const key = it.id || `${it.slug}-${it.updatedAt || it.createdAt}`;
					return { ...n, __key: key };
				});
				setItems(
					normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
				);
			})
			.catch((e) => {
				// Ignore aborts (navigation/unmount/rapid re-renders)
				const msg = String(e?.message || '');
				if (e?.name === 'AbortError' || msg.toLowerCase().includes('aborted')) {
					return;
				}
				setError(msg || 'Nie udało się pobrać artykułów');
			})
			.finally(() => {
				setLoading(false);
			});
		return () => ac.abort();
	}, []);

	const activeCategory = searchParams.get('cat') || 'Wszystkie';

	const filtered = useMemo(() => {
		if (!activeCategory || activeCategory === 'Wszystkie') return items;
		const target = activeCategory.toLowerCase();
		return items.filter((a) => a.tags.some((t) => String(t).toLowerCase() === target));
	}, [items, activeCategory]);

	return (
		<div className="space-y-4">
			<div className="sticky -top-1 z-10 bg-[rgb(10,10,10,0.6)] backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70 py-2">
				<CategoryTabs />
			</div>

			{loading && (
				<div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="h-24 rounded-lg border border-zinc-900 bg-zinc-950/40 animate-pulse" />
					))}
				</div>
			)}

			{!loading && error && (
				<div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-200">
					<b>Błąd:</b> {error}
				</div>
			)}

			{!loading && !error && filtered.length === 0 && (
				<div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 text-zinc-300">
					Brak artykułów do wyświetlenia.
				</div>
			)}

			{!loading && !error && filtered.length > 0 && (
				<ul className="space-y-3">
					{filtered.map((article) => (
						<li key={(article as any).__key ?? article.slug}>
							<ArticleRow article={article as any} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}


