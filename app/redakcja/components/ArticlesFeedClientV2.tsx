'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ArticleListItem } from '@/lib/redakcja/types';
import { extractCoverFromContent } from '@/lib/redakcja/content-utils';
import CategoryTabs from '@/components/redakcja/CategoryTabs';
import TopCard from './TopCard';
import FeaturedCard from './FeaturedCard';
import MiniRow from './MiniRow';
import TopicBlock from './TopicBlock';

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

export default function ArticlesFeedClientV2() {
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
				const uniqueById = Array.from(new Map(data.items.map((it) => [it.id, it])).values());
				const normalized = uniqueById.map((it) => {
					const n = normalize(it);
					const key = it.id || `${it.slug}-${it.updatedAt || it.createdAt}`;
					return { ...n, __key: key };
				});
				setItems(
					normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
				);
			})
			.catch((e) => {
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

	const top3 = filtered.slice(0, 3);
	// Featured prioritization: if any article has tag "featured", use it. Otherwise fallback to 4th/last.
	const featuredTagged = filtered.find((a) => a.tags?.some((t) => String(t).toLowerCase() === 'featured'));
	const featured = featuredTagged ?? (filtered[3] ?? filtered[filtered.length - 1]);
	const leftList = filtered.slice(4, 12);

	const topicMain = useMemo(() => {
		const withTag = filtered.find((it) => (it.tags?.length ?? 0) > 0);
		if (withTag) return withTag;
		return filtered[4];
	}, [filtered]);

	const topicRelated = useMemo(() => {
		if (!topicMain) return [] as ArticleListItem[];
		const mainTag = (topicMain.tags?.[0] || '').toLowerCase();
		let related = [] as ArticleListItem[];
		if (mainTag) {
			related = filtered.filter(
				(it) =>
					it.slug !== topicMain.slug &&
					it.tags.some((t) => String(t).toLowerCase() === mainTag),
			);
		}
		if (related.length === 0) {
			related = filtered.slice(5, 9).filter((it) => it.slug !== topicMain.slug);
		}
		return related.slice(0, 4);
	}, [filtered, topicMain]);

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
					Brak artykułów dla tej kategorii.
				</div>
			)}

			{!loading && !error && filtered.length > 0 && (
				<div className="space-y-6">
					{/* Sekcja A: TOP 3 */}
					{top3.length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{top3.map((a) => (
								<TopCard key={(a as any).__key ?? a.slug} article={a} />
							))}
						</div>
					)}

					{/* Sekcja B: FEATURED */}
					{featured && (
						<FeaturedCard article={featured} />
					)}

					{/* Sekcja C: Dół – 2 kolumny */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
						<div className="lg:col-span-5 space-y-3">
							{leftList.map((a) => (
								<MiniRow key={(a as any).__key ?? a.slug} article={a} />
							))}
						</div>
						<div className="lg:col-span-7">
							{topicMain && (
								<TopicBlock main={topicMain} related={topicRelated} />
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}


