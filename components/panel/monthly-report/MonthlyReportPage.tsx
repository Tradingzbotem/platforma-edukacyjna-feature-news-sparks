'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { EduMonthlyReport } from '@/lib/panel/monthlyReports';
import MonthlyReportTabs from './MonthlyReportTabs';
import CoachPromptButton from './CoachPromptButton';

type Props = {
	report: EduMonthlyReport;
	allReports: EduMonthlyReport[];
	hideTabsSidebar?: boolean;
};

type QuickState = Record<string, boolean>;

function storageKey(ym: string) {
	return `monthly-checklist:${ym}`;
}

export default function MonthlyReportPage({ report, allReports, hideTabsSidebar }: Props) {
	const avgAbsMove = useMemo(() => {
		if (!report.movesForCalculator.length) return 0;
		return (
			report.movesForCalculator.reduce((a, m) => a + Math.abs(m.movePct), 0) / report.movesForCalculator.length
		);
	}, [report.movesForCalculator]);
	const regime = avgAbsMove >= 2.0 ? 'wysoka' : avgAbsMove >= 1.0 ? 'średnia' : 'niska';

	// quick checklist (first three items from preData)
	const quickItems = report.checklist.preData.slice(0, 3).map((txt, i) => ({ id: `pre:${i}`, txt }));
	const [qs, setQs] = useState<QuickState>({});
	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(storageKey(report.ym));
			setQs(raw ? (JSON.parse(raw) as QuickState) : {});
		} catch {
			setQs({});
		}
	}, [report.ym]);
	useEffect(() => {
		try {
			// merge into existing storage to not lose other checkboxes
			const raw = window.localStorage.getItem(storageKey(report.ym));
			const base = raw ? (JSON.parse(raw) as QuickState) : {};
			const next = { ...base, ...qs };
			window.localStorage.setItem(storageKey(report.ym), JSON.stringify(next));
		} catch {
			// ignore
		}
	}, [qs, report.ym]);

	return (
		<div>
			{/* hero */}
			<section className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<div className="text-sm text-white/70">Miesiąc</div>
						<h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight">{report.title}</h1>
						<p className="mt-2 text-white/80 max-w-3xl">{report.tldr}</p>
					</div>
					<span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
						ELITE
					</span>
				</div>
				<div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
						<div className="text-xs text-white/70">Główna narracja</div>
						<div className="mt-1 text-white/90 text-sm line-clamp-3">{report.narrative}</div>
					</div>
					<div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
						<div className="text-xs text-white/70">Najważniejsze eventy</div>
						<div className="mt-1 text-2xl font-extrabold text-white/90">{report.keyEvents.length}</div>
					</div>
					<div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
						<div className="text-xs text-white/70">Reżim zmienności (EDU)</div>
						<div className="mt-1 text-2xl font-extrabold text-white/90">{regime}</div>
					</div>
					<div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
						<div className="text-xs text-white/70">Pułapka miesiąca</div>
						<div className="mt-1 text-sm text-white/90">{report.pitfalls[0] ?? '—'}</div>
					</div>
				</div>
				<div className="mt-4">
					<CoachPromptButton
						month={report.ym}
						narrative={report.narrative}
						keyEvents={report.keyEvents.map((k) => ({ date: k.date, name: k.name }))}
					/>
					<Link
						className="ml-3 inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
						href="/konto/panel-rynkowy/coach-ai"
					>
						Otwórz Coach AI
					</Link>
				</div>
			</section>

			{/* body with sticky side */}
			<div className="mt-6 grid gap-5 lg:grid-cols-[1fr,320px]">
				<div>
					<MonthlyReportTabs report={report} allReports={allReports} hideSidebar={hideTabsSidebar} />
				</div>
				<aside className="sticky top-4 self-start rounded-2xl border border-white/10 bg-white/5 p-5">
					<div className="text-lg font-semibold">Szybki skrót miesiąca</div>
					<p className="mt-1 text-sm text-white/80">{report.tldr.slice(0, 200)}{report.tldr.length > 200 ? '…' : ''}</p>

					<div className="mt-4">
						<div className="text-sm font-semibold">Checklisty (skrót)</div>
						<ul className="mt-2 space-y-2">
							{quickItems.map((it) => (
								<li key={it.id} className="flex items-start gap-2">
									<input
										type="checkbox"
										checked={Boolean(qs[it.id])}
										onChange={(e) => setQs((s) => ({ ...s, [it.id]: e.target.checked }))}
										className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/30"
									/>
									<span className="text-sm text-white/85">{it.txt}</span>
								</li>
							))}
						</ul>
						<a
							className="mt-2 inline-flex items-center text-xs text-white/75 underline hover:no-underline"
							href="#"
							onClick={(e) => {
								e.preventDefault();
								// switch to checklists tab via hash (client-side component will not observe); provide hint to scroll
								window.scrollTo({ top: 0, behavior: 'smooth' });
							}}
						>
							Pełne checklisty w sekcji poniżej
						</a>
					</div>

					<div className="mt-4">
						<div className="text-sm font-semibold">Powiązane moduły</div>
						<ul className="mt-2 space-y-1 text-sm text-white/85">
							<li><Link className="underline hover:no-underline" href="/konto/panel-rynkowy/playbooki-eventowe">Playbooki</Link></li>
							<li><Link className="underline hover:no-underline" href="/konto/panel-rynkowy/coach-ai">Coach AI</Link></li>
							<li><Link className="underline hover:no-underline" href="/news">News & Briefs</Link></li>
						</ul>
					</div>

					<div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
						<div className="text-amber-200 text-sm">
							EDU: brak rekomendacji inwestycyjnych, brak „sygnałów”. Decyzje podejmujesz samodzielnie.
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}


