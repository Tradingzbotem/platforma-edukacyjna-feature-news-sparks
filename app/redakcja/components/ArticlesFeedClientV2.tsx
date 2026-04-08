'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ArticleListItem } from '@/lib/redakcja/types';
import { extractCoverFromContent, leadPlainTextFromMarkdown } from '@/lib/redakcja/content-utils';
import { partitionFeedItemsByLocalDay } from '@/lib/redakcja/feedDateBuckets';
import CategoryTabs from '@/components/redakcja/CategoryTabs';
import TopCard from './TopCard';
import MiniRow from './MiniRow';
import TopStoryHero from './TopStoryHero';
import DaySectionFeaturedToday from './DaySectionFeaturedToday';
import DaySectionFeaturedYesterday from './DaySectionFeaturedYesterday';

/**
 * Pasek kategorii / czasu nie jest już `sticky` — przewija się z treścią.
 * Kotwice sekcji: tylko miejsce pod stały SiteHeader (`h-16` ≈ 64px) + bufor.
 */
const REDAKCJA_SECTION_ANCHOR_OFFSET_PX = 64 + 12;

/** Ujednolicenie porównania tag ↔ kategoria URL (małe litery + bez znaków diakrytycznych). */
function normalizeRedakcjaCategoryKey(s: string): string {
	return String(s || '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

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

type FeedItem = ArticleListItem & { __key: string; leadText: string };

type DateSectionKey = 'today' | 'yesterday' | 'earlier';

function sectionAnchorId(key: DateSectionKey): string {
	if (key === 'today') return 'dzis';
	if (key === 'yesterday') return 'wczoraj';
	return 'wczesniej';
}

function normalize(item: ApiItem): Omit<FeedItem, '__key'> {
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
		leadText: leadPlainTextFromMarkdown(derived.contentWithoutCover),
	};
}

function DateBucketHeading({
	label,
	active,
}: {
	label: string;
	active: boolean;
}) {
	return (
		<div
			className={[
				'flex items-center gap-3 rounded-md border px-1 py-1.5 transition-colors duration-200',
				active
					? 'border-white/15 bg-white/[0.06] shadow-[0_0_24px_-8px_rgba(255,255,255,0.08)]'
					: 'border-transparent',
			].join(' ')}
		>
			<span
				className={[
					'shrink-0 text-xs font-medium uppercase tracking-[0.2em]',
					active ? 'text-white/90' : 'text-white/50',
				].join(' ')}
			>
				{label}
			</span>
			<div
				className={['h-px min-w-[2rem] flex-1', active ? 'bg-emerald-400/35' : 'bg-white/10'].join(' ')}
				aria-hidden
			/>
		</div>
	);
}

function TimeSectionPills({
	sections,
	activeAnchorId,
	onSelect,
}: {
	sections: { key: DateSectionKey; shortLabel: string }[];
	activeAnchorId: string | null;
	onSelect: (anchorId: string) => void;
}) {
	if (sections.length === 0) return null;
	return (
		<nav aria-label="Sekcje czasowe" className="flex flex-wrap items-center gap-1">
			{sections.map(({ key, shortLabel }) => {
				const id = sectionAnchorId(key);
				const active = activeAnchorId === id;
				return (
					<button
						key={key}
						type="button"
						onClick={() => onSelect(id)}
						aria-current={active ? 'true' : undefined}
						className={[
							'rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition-colors',
							active
								? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
								: 'border-zinc-700/80 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900/70 hover:text-zinc-200',
						].join(' ')}
					>
						{shortLabel}
					</button>
				);
			})}
		</nav>
	);
}

/** WCZEŚNIEJ: jednolita siatka kart (TopCard). */
function EarlierBucketFeed({ items }: { items: FeedItem[] }) {
	if (items.length === 0) return null;
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{items.map((a) => (
				<TopCard key={a.__key ?? a.slug} article={a} />
			))}
		</div>
	);
}

function TodayBucketFeed({ items }: { items: FeedItem[] }) {
	if (items.length === 0) return null;
	const featured = items[0];
	const rest = items.slice(1);
	const a = rest[0];
	const b = rest[1];
	const more = rest.slice(2);

	if (rest.length === 0) {
		return (
			<div className="max-w-full">
				<DaySectionFeaturedToday article={featured} layout="solo" />
			</div>
		);
	}

	if (rest.length === 1) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2 lg:gap-3">
					<div className="min-h-0">
						<DaySectionFeaturedToday article={featured} layout="pair" />
					</div>
					<div className="min-h-0">
						<TopCard article={a} />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:grid-rows-2 lg:items-start lg:gap-3">
				<div className="min-h-0 lg:row-span-2">
					<DaySectionFeaturedToday article={featured} layout="pair" />
				</div>
				{a ? <TopCard article={a} /> : null}
				{b ? <TopCard article={b} /> : null}
			</div>
			{more.length > 0 ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{more.map((x) => (
						<TopCard key={x.__key ?? x.slug} article={x} />
					))}
				</div>
			) : null}
		</div>
	);
}

function YesterdayBucketFeed({ items }: { items: FeedItem[] }) {
	if (items.length === 0) return null;
	const featured = items[0];
	const rest = items.slice(1);
	return (
		<div className="space-y-5">
			<DaySectionFeaturedYesterday article={featured} />
			{rest.length > 0 ? (
				<div className="space-y-0">
					{rest.map((a) => (
						<MiniRow key={a.__key ?? a.slug} article={a} />
					))}
				</div>
			) : null}
		</div>
	);
}

export default function ArticlesFeedClientV2() {
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<FeedItem[]>([]);
	const [activeTimeSection, setActiveTimeSection] = useState<string | null>(null);
	const scrollSpySkip = useRef(false);

	const activeCategory = searchParams.get('cat') || 'Wszystkie';

	/** (a) pełna lista → (b) filtr kategorii — porównanie po znormalizowanych tagach. */
	const filtered = useMemo(() => {
		if (!activeCategory || activeCategory === 'Wszystkie') return items;
		const target = normalizeRedakcjaCategoryKey(activeCategory);
		return items.filter((a) =>
			a.tags.some((t) => normalizeRedakcjaCategoryKey(String(t)) === target),
		);
	}, [items, activeCategory]);

	/** (c) TOP STORY = filtered[0]; (d) grupowanie tylko na reszcie, żeby nie duplikować pierwszego wpisu. */
	const rest = useMemo(() => filtered.slice(1), [filtered]);

	const dayBuckets = useMemo(() => partitionFeedItemsByLocalDay(rest), [rest]);

	const dateSections = useMemo(
		() =>
			[
				{ key: 'today' as const, label: 'Dziś', shortLabel: 'Dziś', items: dayBuckets.today },
				{ key: 'yesterday' as const, label: 'Wczoraj', shortLabel: 'Wczoraj', items: dayBuckets.yesterday },
				{ key: 'earlier' as const, label: 'Wcześniej', shortLabel: 'Wcześniej', items: dayBuckets.earlier },
			].filter((s) => s.items.length > 0),
		[dayBuckets],
	);

	const timeNavSections = useMemo(
		() => dateSections.map(({ key, shortLabel }) => ({ key, shortLabel })),
		[dateSections],
	);

	/** DEBUG: liczby fetch → filtr → buckety → render (tylko dev; zakomentuj cały useEffect po weryfikacji). */
	useEffect(() => {
		if (process.env.NODE_ENV !== 'development') return;
		if (loading) return;
		const bt = dayBuckets.today.length;
		const by = dayBuckets.yesterday.length;
		const be = dayBuckets.earlier.length;
		const inBuckets = bt + by + be;
		const topStory = filtered.length > 0 ? 1 : 0;
		const rendered = topStory + inBuckets;
		console.log('[redakcja feed]', {
			poFetch: items.length,
			poFiltrze: filtered.length,
			dzis: bt,
			wczoraj: by,
			wczesniej: be,
			sumaWBucketach: inBuckets,
			topStory,
			renderRazem: rendered,
			zgodnosc: rendered === filtered.length ? 'OK' : 'BŁĄD',
		});
	}, [
		loading,
		items.length,
		filtered.length,
		dayBuckets.today.length,
		dayBuckets.yesterday.length,
		dayBuckets.earlier.length,
	]);

	const scrollToTimeAnchor = useCallback((anchorId: string) => {
		const el = document.getElementById(anchorId);
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - REDAKCJA_SECTION_ANCHOR_OFFSET_PX;
		scrollSpySkip.current = true;
		window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
		window.setTimeout(() => {
			scrollSpySkip.current = false;
			setActiveTimeSection(anchorId);
		}, 500);
	}, []);

	useEffect(() => {
		if (!dateSections.length || loading) {
			setActiveTimeSection(null);
			return;
		}
		const anchors = dateSections.map((s) => sectionAnchorId(s.key));
		setActiveTimeSection(anchors[0] ?? null);
	}, [dateSections, loading]);

	useEffect(() => {
		if (!dateSections.length || loading) return;

		let ticking = false;
		const updateActive = () => {
			ticking = false;
			if (scrollSpySkip.current) return;
			const anchors = dateSections.map((s) => sectionAnchorId(s.key));
			let current: string | null = anchors[0] ?? null;
			for (const id of anchors) {
				const el = document.getElementById(id);
				if (!el) continue;
				const top = el.getBoundingClientRect().top;
				if (top <= REDAKCJA_SECTION_ANCHOR_OFFSET_PX + 4) current = id;
			}
			setActiveTimeSection((prev) => (prev === current ? prev : current));
		};

		const onScroll = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(updateActive);
			}
		};

		updateActive();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [dateSections, loading]);

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
				const normalized: FeedItem[] = uniqueById.map((it) => {
					const key = it.id || `${it.slug}-${it.updatedAt || it.createdAt}`;
					return { ...normalize(it), __key: key };
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

	return (
		<div className="min-w-0">
			<div className="relative z-10 w-full border-b border-white/[0.07] bg-slate-950/78 py-2 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-950/72">
				<div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
					<CategoryTabs compact />
					{!loading && !error && filtered.length > 0 && timeNavSections.length > 0 ? (
						<TimeSectionPills
							sections={timeNavSections}
							activeAnchorId={activeTimeSection}
							onSelect={scrollToTimeAnchor}
						/>
					) : null}
				</div>
			</div>

			<div className="space-y-4">
				{loading && (
					<div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="h-24 animate-pulse rounded-lg border border-zinc-900 bg-zinc-950/40" />
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
						<TopStoryHero article={filtered[0]} />

						{dateSections.map((section) => {
							const anchorId = sectionAnchorId(section.key);
							const headingActive = activeTimeSection === anchorId;
							return (
								<section
									key={section.key}
									id={anchorId}
									className="space-y-4"
									style={{ scrollMarginTop: REDAKCJA_SECTION_ANCHOR_OFFSET_PX }}
									aria-labelledby={`${anchorId}-heading`}
								>
									<div id={`${anchorId}-heading`}>
										<DateBucketHeading label={section.label} active={headingActive} />
									</div>
									{section.key === 'today' ? (
										<TodayBucketFeed items={section.items} />
									) : section.key === 'yesterday' ? (
										<YesterdayBucketFeed items={section.items} />
									) : (
										<EarlierBucketFeed items={section.items} />
									)}
								</section>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
