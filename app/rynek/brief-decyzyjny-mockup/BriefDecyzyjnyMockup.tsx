import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import {
	BRIEF_ASSETS,
	BRIEF_DAY_PRIORITY,
	BRIEF_MAIN_TOPIC,
	BRIEF_SCENARIOS,
	type Sensitivity,
} from './briefMockData';
import type { DecisionBriefView } from '@/lib/decision-brief/types';

const FREE_ASSET_ROWS = 3;

export type BriefDecyzyjnyMockupProps = {
	/** Ustawiane na serwerze: `hasFeature(userId, FEATURE_BRIEF_DECISION)`. */
	hasFullBriefAccess: boolean;
	/** Opublikowany brief z bazy; `null` — fallback do mocków + komunikat. */
	publishedBrief: DecisionBriefView | null;
};

type MainTopicBlock = {
	title: string;
	summaryLines: string[];
	contextBullets: string[];
	watchBullets: string[];
};

type AssetTableRow = {
	symbol: string;
	direction: string;
	supports: string;
	weakens: string;
	sensitivity: Sensitivity;
};

type ScenarioBlock = {
	base: string[];
	alternative: string[];
	invalidate: string[];
};

function sensitivityClass(s: Sensitivity): string {
	if (s === 'wysoka') return 'border-rose-500/35 bg-rose-950/25 text-rose-100/90';
	if (s === 'średnia') return 'border-amber-500/35 bg-amber-950/20 text-amber-100/90';
	return 'border-slate-500/35 bg-slate-900/60 text-slate-200/90';
}

function buildFromDb(b: DecisionBriefView): {
	mainTopic: MainTopicBlock;
	assets: AssetTableRow[];
	scenarios: ScenarioBlock;
	dayPriority: string;
	summary: string;
} {
	return {
		mainTopic: {
			title: b.title,
			summaryLines: b.narrativeAxisLines,
			contextBullets: b.contextLines,
			watchBullets: b.onRadarLines,
		},
		assets: b.assets.map((a) => ({
			symbol: a.asset,
			direction: a.baseDirection,
			supports: a.supports,
			weakens: a.weakens,
			sensitivity: a.sensitivity,
		})),
		scenarios: {
			base: b.baseScenarioLines,
			alternative: b.alternativeScenarioLines,
			invalidate: b.invalidationLines,
		},
		dayPriority: b.priorityOfDay.trim() || '—',
		summary: b.summary.trim(),
	};
}

export default function BriefDecyzyjnyMockup({ hasFullBriefAccess, publishedBrief }: BriefDecyzyjnyMockupProps) {
	const fromDatabase = publishedBrief !== null;
	const db = fromDatabase && publishedBrief ? buildFromDb(publishedBrief) : null;

	const mainTopic: MainTopicBlock = db
		? db.mainTopic
		: {
				title: BRIEF_MAIN_TOPIC.title,
				summaryLines: BRIEF_MAIN_TOPIC.summaryLines,
				contextBullets: BRIEF_MAIN_TOPIC.contextBullets,
				watchBullets: BRIEF_MAIN_TOPIC.watchBullets,
			};

	const allAssets: AssetTableRow[] = db
		? db.assets
		: BRIEF_ASSETS.map((r) => ({
				symbol: r.symbol,
				direction: r.direction,
				supports: r.supports,
				weakens: r.weakens,
				sensitivity: r.sensitivity,
			}));

	const scenarios: ScenarioBlock = db
		? db.scenarios
		: {
				base: BRIEF_SCENARIOS.base,
				alternative: BRIEF_SCENARIOS.alternative,
				invalidate: BRIEF_SCENARIOS.invalidate,
			};

	const dayPriority = db ? db.dayPriority : BRIEF_DAY_PRIORITY;
	const dbSummary = db ? db.summary : '';

	const visibleAssets = hasFullBriefAccess ? allAssets : allAssets.slice(0, FREE_ASSET_ROWS);
	const baseScenarioLines = hasFullBriefAccess ? scenarios.base : scenarios.base.slice(0, 1);

	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<section className="relative border-b border-white/10 overflow-hidden">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.07),_transparent_55%)]" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.06),_transparent_50%)]" />
				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
					<div className="mb-6 flex flex-wrap items-center gap-3">
						<Link
							href="/rynek/panel-rynkowy"
							className="inline-flex text-sm text-white/65 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/35 rounded transition-colors"
						>
							← Panel rynkowy
						</Link>
						{fromDatabase ? (
							<span className="rounded-full border border-emerald-500/35 bg-emerald-950/35 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200/90">
								Brief dnia
							</span>
						) : (
							<span className="rounded-full border border-violet-400/30 bg-violet-950/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200/90">
								Mockup · nieprodukcyjny
							</span>
						)}
					</div>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 max-w-4xl">
						Brief decyzyjny
					</h1>
					<p className="text-base sm:text-lg text-white/75 max-w-2xl leading-snug">
						Najważniejsze wydarzenia, aktywa pod wpływem i scenariusze do obserwacji.
					</p>
					{!fromDatabase ? (
						<p className="mt-4 text-sm text-amber-200/85 max-w-2xl leading-snug">
							Brak opublikowanego briefu w bazie — poniżej pokazano treść przykładową (mock).
						</p>
					) : null}
					{fromDatabase && dbSummary ? (
						<p className="mt-4 text-base text-white/80 max-w-3xl leading-relaxed">{dbSummary}</p>
					) : null}
					<p className="mt-5 text-xs text-white/45 max-w-xl flex items-start gap-2">
						<ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/35" aria-hidden />
						<span>
							Materiał edukacyjny, szkic modułu premium — bez rekomendacji inwestycyjnych i bez sygnałów transakcyjnych.
						</span>
					</p>
				</div>
			</section>

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12 space-y-10 lg:space-y-12">
				{/* Temat główny */}
				<section aria-labelledby="brief-main-topic">
					<div className="mb-4 flex items-baseline justify-between gap-4 flex-wrap">
						<h2 id="brief-main-topic" className="text-lg font-bold tracking-tight text-white">
							Temat główny
						</h2>
						<span className="text-[11px] uppercase tracking-wider text-white/40">Sekcja premium · układ roboczy</span>
					</div>
					<div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/35 via-slate-950 to-amber-950/15 p-5 sm:p-7 shadow-2xl shadow-black/40 ring-1 ring-amber-500/15">
						<h3 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-5 pb-4 border-b border-white/10">
							{mainTopic.title}
						</h3>
						<div className="grid gap-6 lg:grid-cols-3">
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200/75 mb-2">Oś narracji</p>
								<ul className="space-y-2 text-sm text-white/80 leading-snug">
									{mainTopic.summaryLines.length ? (
										mainTopic.summaryLines.map((t, i) => (
											<li key={`n-${i}-${t.slice(0, 24)}`} className="flex gap-2">
												<span className="text-violet-400/70 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))
									) : (
										<li className="text-white/40 text-sm">—</li>
									)}
								</ul>
							</div>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200/75 mb-2">Kontekst</p>
								<ul className="space-y-2 text-sm text-white/80 leading-snug">
									{mainTopic.contextBullets.length ? (
										mainTopic.contextBullets.map((t, i) => (
											<li key={`c-${i}-${t.slice(0, 24)}`} className="flex gap-2">
												<span className="text-violet-400/70 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))
									) : (
										<li className="text-white/40 text-sm">—</li>
									)}
								</ul>
							</div>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200/75 mb-2">Na radarze</p>
								<ul className="space-y-2 text-sm text-white/80 leading-snug">
									{mainTopic.watchBullets.length ? (
										mainTopic.watchBullets.map((t, i) => (
											<li key={`w-${i}-${t.slice(0, 24)}`} className="flex gap-2">
												<span className="text-violet-400/70 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))
									) : (
										<li className="text-white/40 text-sm">—</li>
									)}
								</ul>
							</div>
						</div>
					</div>
				</section>

				{/* Aktywa */}
				<section aria-labelledby="brief-assets">
					<h2 id="brief-assets" className="text-lg font-bold tracking-tight text-white mb-4">
						Aktywa pod wpływem
					</h2>
					<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-lg shadow-black/25">
						<div className="overflow-x-auto">
							<table className="min-w-[640px] w-full text-left text-sm">
								<thead>
									<tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/45">
										<th className="px-4 py-3 font-semibold">Aktywo</th>
										<th className="px-4 py-3 font-semibold">Kierunek bazowy</th>
										<th className="px-4 py-3 font-semibold">Wspiera</th>
										<th className="px-4 py-3 font-semibold">Osłabia</th>
										<th className="px-4 py-3 font-semibold w-[120px]">Wrażliwość</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/[0.06]">
									{visibleAssets.length ? (
										visibleAssets.map((row, i) => (
											<tr key={`${row.symbol}-${i}`} className="hover:bg-white/[0.03] transition-colors">
												<td className="px-4 py-3 font-semibold text-white tabular-nums">{row.symbol}</td>
												<td className="px-4 py-3 text-white/85 whitespace-nowrap">{row.direction}</td>
												<td className="px-4 py-3 text-white/70 max-w-[200px]">{row.supports}</td>
												<td className="px-4 py-3 text-white/70 max-w-[200px]">{row.weakens}</td>
												<td className="px-4 py-3">
													<span
														className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold capitalize ${sensitivityClass(row.sensitivity)}`}
													>
														{row.sensitivity}
													</span>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={5} className="px-4 py-6 text-center text-sm text-white/45">
												Brak aktywów w briefie.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
						{!hasFullBriefAccess && visibleAssets.length > 0 && (
							<div className="pointer-events-none absolute inset-x-0 bottom-0 top-[38%] flex items-end justify-center border-t border-white/10 bg-gradient-to-b from-transparent via-slate-950/88 to-slate-950 px-4 pb-5 pt-12 backdrop-blur-[5px] sm:top-[36%] sm:pb-6">
								<p className="text-center text-sm font-semibold text-white/90 tracking-tight">
									Odblokuj pełną analizę aktywów
								</p>
							</div>
						)}
					</div>
				</section>

				{/* Scenariusze */}
				<section aria-labelledby="brief-scenarios">
					<h2 id="brief-scenarios" className="text-lg font-bold tracking-tight text-white mb-4">
						Scenariusze
					</h2>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/15 p-5">
							<p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/80 mb-3">Bazowy</p>
							<ul className="space-y-2 text-sm text-white/78 leading-snug">
								{baseScenarioLines.length ? (
									baseScenarioLines.map((t, i) => (
										<li key={`b-${i}-${t.slice(0, 24)}`} className="flex gap-2">
											<span className="text-emerald-400/60 shrink-0">·</span>
											<span>{t}</span>
										</li>
									))
								) : (
									<li className="text-white/40 text-sm">—</li>
								)}
							</ul>
						</div>
						<div className="relative rounded-2xl border border-sky-500/20 bg-sky-950/15 p-5 min-h-[140px]">
							<div className={!hasFullBriefAccess ? 'blur-sm opacity-[0.42] select-none' : ''}>
								<p className="text-[11px] font-semibold uppercase tracking-wider text-sky-200/80 mb-3">Alternatywny</p>
								<ul className="space-y-2 text-sm text-white/78 leading-snug">
									{scenarios.alternative.length ? (
										scenarios.alternative.map((t, i) => (
											<li key={`a-${i}-${t.slice(0, 24)}`} className="flex gap-2">
												<span className="text-sky-400/60 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))
									) : (
										<li className="text-white/40 text-sm">—</li>
									)}
								</ul>
							</div>
							{!hasFullBriefAccess && (
								<div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/55">
									<span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75">
										PRO
									</span>
								</div>
							)}
						</div>
						<div className="relative rounded-2xl border border-rose-500/25 bg-rose-950/15 p-5 min-h-[140px]">
							<div className={!hasFullBriefAccess ? 'blur-sm opacity-[0.42] select-none' : ''}>
								<p className="text-[11px] font-semibold uppercase tracking-wider text-rose-200/80 mb-3">Co unieważnia</p>
								<ul className="space-y-2 text-sm text-white/78 leading-snug">
									{scenarios.invalidate.length ? (
										scenarios.invalidate.map((t, i) => (
											<li key={`i-${i}-${t.slice(0, 24)}`} className="flex gap-2">
												<span className="text-rose-400/60 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))
									) : (
										<li className="text-white/40 text-sm">—</li>
									)}
								</ul>
							</div>
							{!hasFullBriefAccess && (
								<div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/55">
									<span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75">
										PRO
									</span>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Priorytet dnia */}
				<section aria-labelledby="brief-priority">
					<h2 id="brief-priority" className="text-lg font-bold tracking-tight text-white mb-4">
						Priorytet dnia
					</h2>
					<div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-slate-900/80 px-5 py-4 sm:px-6 sm:py-5 shadow-lg shadow-amber-950/10">
						<p className="text-sm sm:text-base text-white/90 leading-snug font-medium">{dayPriority}</p>
					</div>
				</section>

				{!hasFullBriefAccess && (
					<div className="rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-6 text-center sm:px-8 sm:py-8">
						<p className="text-base sm:text-lg font-semibold text-white/90 leading-snug">
							Pełny brief decyzyjny dostępny w pakiecie PRO
						</p>
						<Link
							href="/ebooki#plany"
							className="mt-4 inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-5 py-2.5 text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
						>
							Zobacz plany
						</Link>
					</div>
				)}
			</div>
		</main>
	);
}
