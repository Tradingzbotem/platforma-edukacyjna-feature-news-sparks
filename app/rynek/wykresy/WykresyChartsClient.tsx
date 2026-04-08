'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Info, LineChart, Search } from 'lucide-react';
import {
	getPublicChartAsset,
	PUBLIC_CHART_ASSETS,
	PUBLIC_CHART_GROUP_LABEL,
	type ChartFilterTab,
	type PublicChartAsset,
	type PublicChartAssetGroup,
} from '@/lib/rynek/publicChartAssets';

const TradingViewAdvancedEmbed = dynamic(
	() => import('@/components/widgets/TradingViewAdvancedEmbed'),
	{ ssr: false },
);

const GROUP_ORDER: PublicChartAssetGroup[] = ['indices', 'etf', 'commodities', 'fx', 'crypto'];

/** Umożliwia szukanie bez polskich znaków, np. „zloto” → Złoto. */
function normalizeForSearch(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/\s+/g, '');
}

function groupAssets(list: PublicChartAsset[]): Record<PublicChartAssetGroup, PublicChartAsset[]> {
	const m: Record<PublicChartAssetGroup, PublicChartAsset[]> = {
		indices: [],
		etf: [],
		commodities: [],
		fx: [],
		crypto: [],
	};
	for (const a of list) {
		m[a.group].push(a);
	}
	return m;
}

function pillClass(active: boolean): string {
	const base =
		'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';
	return active
		? `${base} bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40 shadow-[0_0_20px_-4px_rgba(52,211,153,0.35)]`
		: `${base} bg-white/[0.04] text-white/70 ring-1 ring-white/10 hover:bg-white/[0.08] hover:text-white hover:ring-white/18`;
}

const TAB_ALL: ChartFilterTab = 'all';

const FILTER_TABS: Array<{ id: ChartFilterTab; label: string }> = [
	{ id: TAB_ALL, label: 'Wszystkie' },
	{ id: 'indices', label: PUBLIC_CHART_GROUP_LABEL.indices },
	{ id: 'etf', label: PUBLIC_CHART_GROUP_LABEL.etf },
	{ id: 'commodities', label: PUBLIC_CHART_GROUP_LABEL.commodities },
	{ id: 'fx', label: PUBLIC_CHART_GROUP_LABEL.fx },
	{ id: 'crypto', label: PUBLIC_CHART_GROUP_LABEL.crypto },
];

export default function WykresyChartsClient() {
	const router = useRouter();
	const pathname = usePathname();
	const sp = useSearchParams();
	const sym = sp.get('symbol');
	const current = useMemo(() => getPublicChartAsset(sym), [sym]);

	const [filterTab, setFilterTab] = useState<ChartFilterTab>(TAB_ALL);
	const [search, setSearch] = useState('');

	const filteredByTab = useMemo(() => {
		if (filterTab === TAB_ALL) return PUBLIC_CHART_ASSETS;
		return PUBLIC_CHART_ASSETS.filter((a) => a.group === filterTab);
	}, [filterTab]);

	const filtered = useMemo(() => {
		const s = normalizeForSearch(search.trim());
		if (!s) return filteredByTab;
		return filteredByTab.filter((a) => {
			const hay = normalizeForSearch(`${a.label}${a.id}${a.tvSymbol}`);
			return hay.includes(s);
		});
	}, [filteredByTab, search]);

	const grouped = useMemo(() => groupAssets(filtered), [filtered]);

	const setAsset = (id: string) => {
		const p = new URLSearchParams(sp.toString());
		p.set('symbol', id.toUpperCase());
		router.replace(`${pathname}?${p.toString()}`, { scroll: false });
	};

	return (
		<main id="content" className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-20">
			<div
				className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(52,211,153,0.14),transparent_55%)]"
				aria-hidden
			/>

			<header className="relative mb-10 max-w-3xl">
				<div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200/90">
					<LineChart className="h-3.5 w-3.5" aria-hidden />
					Rynek
				</div>
				<h1 className="mt-4 text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
					Wykresy TradingView
				</h1>
				<p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl">
					Wybierz instrument z listy lub wyszukaj po nazwie. Osadzone wykresy pochodzą z TradingView — treści mają charakter
					wyłącznie <span className="text-white/80">edukacyjny</span>, bez sygnałów i rekomendacji inwestycyjnych.
				</p>
			</header>

			<section
				aria-label="Wybór aktywa"
				className="relative rounded-3xl border border-white/[0.12] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-1 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]"
			>
				<div className="rounded-[1.35rem] bg-slate-950/80 backdrop-blur-sm border border-white/5 px-4 py-5 sm:px-6 sm:py-6">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
						<div className="min-w-0 flex-1">
							<h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Instrumenty</h2>
							<p className="mt-1 text-sm text-white/50">
								{filtered.length} z {PUBLIC_CHART_ASSETS.length} — filtruj zakładką lub szukaj
							</p>
						</div>
						<div className="relative w-full lg:max-w-sm shrink-0">
							<Search
								className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
								aria-hidden
							/>
							<input
								type="search"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Szukaj: EUR, złoto, BTC…"
								className="w-full rounded-full border border-white/12 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
								autoComplete="off"
								aria-label="Szukaj instrumentu"
							/>
						</div>
					</div>

					<div
						role="tablist"
						aria-label="Kategoria instrumentów"
						className="mt-5 flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
					>
						{FILTER_TABS.map((t) => {
							const active = filterTab === t.id;
							return (
								<button
									key={t.id}
									type="button"
									role="tab"
									aria-selected={active}
									onClick={() => setFilterTab(t.id)}
									className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
										active
											? 'bg-white text-slate-900 shadow-md shadow-black/30'
											: 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/85 ring-1 ring-white/10'
									}`}
								>
									{t.label}
								</button>
							);
						})}
					</div>

					<div className="mt-5 max-h-[min(42vh,22rem)] overflow-y-auto overscroll-contain pr-1 -mr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
						{filtered.length === 0 ? (
							<p className="py-10 text-center text-sm text-white/45">
								Brak wyników. Zmień wyszukiwanie lub przełącz kategorię.
							</p>
						) : (
							<div className="flex flex-col gap-5">
								{GROUP_ORDER.map((g) => {
									const items = grouped[g];
									if (!items.length) return null;
									return (
										<div key={g}>
											<p className="sticky top-0 z-[1] mb-2.5 w-fit rounded-md bg-slate-950/95 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80 backdrop-blur-sm">
												{PUBLIC_CHART_GROUP_LABEL[g]}
											</p>
											<div className="flex flex-wrap gap-1.5">
												{items.map((a) => (
													<button
														key={a.id}
														type="button"
														onClick={() => setAsset(a.id)}
														className={pillClass(current.id === a.id)}
														aria-pressed={current.id === a.id}
													>
														{a.label}
													</button>
												))}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</section>

			<div className="relative mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="flex flex-wrap items-end justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-white">Wykres</h2>
							<p className="mt-0.5 text-sm text-white/45">
								<span className="text-white/80 font-medium">{current.label}</span>
								<span className="mx-2 text-white/25">·</span>
								<span className="font-mono text-xs text-emerald-400/70">{current.tvSymbol}</span>
							</p>
						</div>
					</div>
					<div className="rounded-3xl border border-white/[0.1] bg-slate-900/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_-28px_rgba(0,0,0,0.9)] ring-1 ring-black/40">
						<div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" aria-hidden />
						<div className="p-2 sm:p-3">
							<TradingViewAdvancedEmbed
								key={current.tvSymbol}
								symbol={current.tvSymbol}
								className="w-full"
								containerClassName="h-full w-full"
							/>
						</div>
					</div>
					<p className="text-xs text-white/45 leading-relaxed">
						Wykres dostarczany przez{' '}
						<Link
							href="https://www.tradingview.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-emerald-400/90 underline decoration-emerald-500/30 underline-offset-2 hover:decoration-emerald-400/60"
						>
							TradingView
						</Link>
						. Jeśli któryś symbol nie załaduje się w embedzie, TradingView mógł zmienić dostępność notowania — wtedy wybierz
						inny instrument lub sprawdź symbol na stronie TradingView.
					</p>
				</div>

				<aside
					className="lg:col-span-4 rounded-3xl border border-white/[0.1] bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-slate-950/90 p-5 sm:p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] ring-1 ring-emerald-500/10"
					aria-labelledby="asset-info-heading"
				>
					<div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-emerald-400/80 to-emerald-600/20 mb-5" aria-hidden />
					<div className="flex items-start gap-3">
						<div className="rounded-xl bg-emerald-500/15 p-2.5 ring-1 ring-emerald-400/25 shrink-0">
							<Info className="h-5 w-5 text-emerald-200/90" aria-hidden />
						</div>
						<div className="min-w-0">
							<h2 id="asset-info-heading" className="text-lg font-semibold text-white leading-snug">
								Krótko: {current.label}
							</h2>
							<p className="mt-1 text-[11px] uppercase tracking-wider text-white/40">
								{PUBLIC_CHART_GROUP_LABEL[current.group]} · materiał EDU
							</p>
						</div>
					</div>
					<p className="mt-5 text-sm text-white/72 leading-relaxed">{current.description}</p>
					<div className="mt-6">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70 mb-2.5">Co warto obserwować</h3>
						<ul className="list-disc space-y-2 pl-4 text-sm text-white/65 marker:text-emerald-500/60">
							{current.watchPoints.map((pt) => (
								<li key={pt}>{pt}</li>
							))}
						</ul>
					</div>
				</aside>
			</div>
		</main>
	);
}
