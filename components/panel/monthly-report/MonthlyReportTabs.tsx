'use client';

import { useMemo, useState } from 'react';
import type { EduMonthlyReport } from '@/lib/panel/monthlyReports';
import ReturnCalculator from './ReturnCalculator';
import MonthlyChecklist from './MonthlyChecklist';
import MonthlyQuiz from './MonthlyQuiz';

function parseYm(ym: string): { y: number; m: number } {
	const [y, m] = ym.split('-').map((x) => Number(x));
	return { y, m };
}

function isBefore(a: string, b: string): boolean {
	const pa = parseYm(a);
	const pb = parseYm(b);
	if (pa.y !== pb.y) return pa.y < pb.y;
	return pa.m < pb.m;
}

type Props = {
	report: EduMonthlyReport;
	allReports: EduMonthlyReport[];
	hideSidebar?: boolean;
};

const TABS = [
	{ key: 'tldr', label: 'Przegląd' },
	{ key: 'what', label: 'Co się wydarzyło' },
	{ key: 'why', label: 'Dlaczego to poruszyło rynek' },
	{ key: 'map', label: 'Mapa miesiąca' },
	{ key: 'events', label: 'Eventy i playbooki' },
	{ key: 'scenarios', label: 'Scenariusze A/B/C' },
	{ key: 'returns', label: 'Ile można było zarobić (EDU)' },
	{ key: 'checklists', label: 'Checklisty' },
	{ key: 'quiz', label: 'Quiz' },
	{ key: 'glossary', label: 'Słownik' },
	{ key: 'archive', label: 'Archiwum' },
] as const;

export default function MonthlyReportTabs({ report, allReports, hideSidebar }: Props) {
	const [active, setActive] = useState<(typeof TABS)[number]['key']>('tldr');

	const glossary = useMemo(() => {
		// EDU: prosty „słownik” wyciągnięty z narracji jako placeholder
		const words = ['breadth', 'real yields', 'repricing', 'core', 'headline'];
		return words.map((w) => ({
			term: w,
			def: `EDU: wyjaśnienie pojęcia „${w}” w kontekście raportu.`,
		}));
	}, []);

	const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
		if (hideSidebar) {
			return <div className="space-y-5">{children}</div>;
		}
		return (
			<div className="grid gap-5 lg:grid-cols-[260px,1fr]">
				<nav className="self-start rounded-2xl border border-white/10 bg-white/5 p-2 lg:sticky lg:top-4 lg:z-0">
					<ul className="space-y-1">
						{TABS.filter((t) => t.key !== 'tldr').map((t) => {
							const selected = active === t.key;
							return (
								<li key={t.key}>
									<button
										type="button"
										onClick={() => setActive(t.key)}
										className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition ${
											selected ? 'bg-white text-slate-900' : 'text-white/85 hover:bg-white/10'
										}`}
									>
										{t.label}
									</button>
								</li>
							);
						})}
					</ul>
				</nav>
				<div className="relative z-10 space-y-5">{children}</div>
			</div>
		);
	};

	return (
		<Layout>
				{active === 'tldr' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Przegląd</h3>
						<p className="mt-2 text-white/85">Wybierz, co chcesz zobaczyć w szczegółach. Poniżej skrótowy spis sekcji.</p>
						<ul className="mt-3 grid gap-2 md:grid-cols-2">
							<li>
								<button
									type="button"
									onClick={() => setActive('what')}
									className="w-full text-left rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-950/60"
								>
									<span className="font-semibold">Co się wydarzyło</span>
									<div className="text-white/70">Krótki opis najważniejszych faktów.</div>
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => setActive('why')}
									className="w-full text-left rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-950/60"
								>
									<span className="font-semibold">Dlaczego to poruszyło rynek</span>
									<div className="text-white/70">Mechanika reakcji rynku i interpretacja.</div>
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => setActive('events')}
									className="w-full text-left rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-950/60"
								>
									<span className="font-semibold">Eventy i playbooki</span>
									<div className="text-white/70">Daty, waga i na co patrzeć.</div>
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => setActive('scenarios')}
									className="w-full text-left rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-950/60"
								>
									<span className="font-semibold">Scenariusze A/B/C</span>
									<div className="text-white/70">Warunki, co sprawdzić i pułapki.</div>
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => setActive('returns')}
									className="w-full text-left rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-950/60"
								>
									<span className="font-semibold">Ile można było zarobić (EDU)</span>
									<div className="text-white/70">Symulacje 1:1 i CFD z ostrzeżeniami.</div>
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => setActive('checklists')}
									className="w-full text-left rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-950/60"
								>
									<span className="font-semibold">Checklisty</span>
									<div className="text-white/70">Przed danymi, w dniu, po publikacji.</div>
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => setActive('quiz')}
									className="w-full text-left rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-950/60"
								>
									<span className="font-semibold">Quiz</span>
									<div className="text-white/70">Sprawdź wiedzę i zobacz wyjaśnienia.</div>
								</button>
							</li>
						</ul>
						<div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-white/85">
							<div className="font-semibold">Uwaga (EDU)</div>
							<div className="mt-1">To przegląd sekcji — bez rekomendacji i bez „sygnałów”.</div>
						</div>
					</section>
				)}
				{active === 'what' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Co się wydarzyło</h3>
						<ul className="mt-2 list-disc pl-5 text-white/85 space-y-1">
							{report.whatHappened.map((x, i) => (
								<li key={i}>{x}</li>
							))}
						</ul>
						<div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-white/85">
							<div className="font-semibold">Jak nie dać się złapać w pułapkę?</div>
							<ul className="mt-1 list-disc pl-5 space-y-1">
								<li>Oddziel noise (szum) od faktów — porównuj do konsensusu.</li>
								<li>Patrz na szerokość ruchu (breadth), nie tylko na nagłówki.</li>
							</ul>
						</div>
					</section>
				)}
				{active === 'why' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Dlaczego to poruszyło rynek</h3>
						<ul className="mt-2 list-disc pl-5 text-white/85 space-y-1">
							{report.whyItMoved.map((x, i) => (
								<li key={i}>{x}</li>
							))}
						</ul>
						<div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-white/85">
							<div className="font-semibold">Co sprawdzić, żeby nie wyciągnąć złych wniosków?</div>
							<ul className="mt-1 list-disc pl-5 space-y-1">
								<li>Rewizje danych i komunikację banków centralnych.</li>
								<li>Potwierdzenie na krzywej długu i USD.</li>
							</ul>
						</div>
					</section>
				)}
				{active === 'map' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Mapa miesiąca — Główna narracja</h3>
						<p className="mt-2 text-white/85 whitespace-pre-wrap">{report.narrative}</p>
					</section>
				)}
				{active === 'events' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Najważniejsze eventy</h3>
						<ul className="mt-2 space-y-2">
							{report.keyEvents.map((ev) => (
								<li key={ev.date + ev.name} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
									<div className="flex items-center justify-between gap-3">
										<div>
											<div className="text-[12px] text-white/70">{new Date(ev.date).toLocaleDateString('pl-PL')}</div>
											<div className="text-sm font-semibold">{ev.name}</div>
										</div>
										<span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
											{ev.importance === 'high' ? 'Wysoka' : ev.importance === 'medium' ? 'Średnia' : 'Niska'}
										</span>
									</div>
									<div className="mt-2 text-sm text-white/80">{ev.whatToWatch}</div>
									{ev.playbookSlug && (
										<div className="mt-2 text-xs">
											<a
												className="underline hover:no-underline text-white/80"
												href="/konto/panel-rynkowy/playbooki-eventowe"
											>
												Zobacz playbook
											</a>
										</div>
									)}
								</li>
							))}
						</ul>
					</section>
				)}
				{active === 'scenarios' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Scenariusze A/B/C (EDU)</h3>
						<div className="mt-2 grid gap-3 md:grid-cols-2">
							{report.scenarios.map((s) => (
								<div key={s.name} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
									<div className="text-sm font-semibold">{s.name}</div>
									<div className="mt-2 text-[12px] text-white/70">Warunki:</div>
									<ul className="mt-1 list-disc pl-5 text-sm text-white/85">
										{s.conditions.map((c, i) => <li key={i}>{c}</li>)}
									</ul>
									<div className="mt-2 text-[12px] text-white/70">Sprawdź:</div>
									<ul className="mt-1 list-disc pl-5 text-sm text-white/85">
										{s.whatToCheck.map((c, i) => <li key={i}>{c}</li>)}
									</ul>
									<div className="mt-2 text-[12px] text-white/70">Pułapki:</div>
									<ul className="mt-1 list-disc pl-5 text-sm text-white/85">
										{s.commonTraps.map((c, i) => <li key={i}>{c}</li>)}
									</ul>
								</div>
							))}
						</div>
						<div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100/90">
							EDU: Szablony interpretacyjne. To nie są rekomendacje ani „sygnały”.
						</div>
					</section>
				)}
				{active === 'returns' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Ile można było zarobić (EDU)</h3>
						<p className="mt-1 text-sm text-white/70">
							„Symulacja edukacyjna na podstawie ruchu ceny”. Pamiętaj o kosztach i ryzyku dźwigni (margin/stop-out).
						</p>

						{/* MoM changes vs previous month for overlapping instruments (EDU) */}
						{(() => {
							const sortedAsc = [...allReports].sort((a, b) => (isBefore(a.ym, b.ym) ? -1 : 1));
							const idx = sortedAsc.findIndex((r) => r.ym === report.ym);
							const prev = idx > 0 ? sortedAsc[idx - 1] : undefined;
							if (!prev) {
								return (
									<div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
										Brak danych z poprzedniego miesiąca do porównania m/m.
									</div>
								);
							}
							const prevMap = new Map(prev.movesForCalculator.map((m) => [m.instrument, m]));
							const overlap = report.movesForCalculator
								.filter((m) => prevMap.has(m.instrument))
								.slice(0, 8);
							if (!overlap.length) {
								return null;
							}
							return (
								<div className="mt-4">
									<div className="text-sm font-semibold text-white/85">Zmiany m/m (EDU — przykładowe ruchy)</div>
									<div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
										{overlap.map((cur) => {
											const p = prevMap.get(cur.instrument)!;
											const diff = cur.movePct - p.movePct; // pp difference of monthly move
											const sign = diff > 0 ? '+' : diff < 0 ? '−' : '';
											const tone =
												diff > 0
													? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
													: diff < 0
													? 'border-rose-300/30 bg-rose-400/10 text-rose-200'
													: 'border-white/15 bg-white/10 text-white/80';
											return (
												<div key={cur.instrument} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
													<div className="flex items-center justify-between gap-3">
														<div className="text-sm font-semibold text-white/90">{cur.label}</div>
														<span className="text-[11px] text-white/60">{prev.ym} → {report.ym}</span>
													</div>
													<div className="mt-1 flex items-center gap-3 text-sm">
														<span className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-white/85">
															{p.movePct >= 0 ? '+' : ''}
															{p.movePct}%
														</span>
														<span className="text-white/60">→</span>
														<span className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-white/85">
															{cur.movePct >= 0 ? '+' : ''}
															{cur.movePct}%
														</span>
														<span className={`ml-auto inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
															Δ {sign}
															{Math.abs(diff).toFixed(1)} pp
														</span>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							);
						})()}

						<div className="mt-4">
							<ReturnCalculator moves={report.movesForCalculator} />
						</div>
					</section>
				)}
				{active === 'checklists' && (
					<MonthlyChecklist ym={report.ym} checklist={report.checklist} />
				)}
				{active === 'quiz' && (
					<MonthlyQuiz ym={report.ym} questions={report.quiz} links={{ playbooksHref: '/konto/panel-rynkowy/playbooki-eventowe' }} />
				)}
				{active === 'glossary' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Słownik (EDU)</h3>
						<ul className="mt-2 space-y-2">
							{glossary.map((g) => (
								<li key={g.term} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
									<div className="text-sm font-semibold">{g.term}</div>
									<div className="text-sm text-white/80">{g.def}</div>
								</li>
							))}
						</ul>
					</section>
				)}
				{active === 'archive' && (
					<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-semibold">Archiwum</h3>
						<ul className="mt-2 space-y-2">
							{allReports.map((r) => (
								<li key={r.ym} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
									<div>
										<div className="text-xs text-white/70">{r.ym}</div>
										<div className="text-sm font-medium">{r.title}</div>
									</div>
									<a
										className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
										href={`/konto/panel-rynkowy/raport-miesieczny/${r.ym}`}
									>
										Otwórz
									</a>
								</li>
							))}
						</ul>
					</section>
				)}
		</Layout>
	);
}


