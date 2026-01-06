import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { requireTier } from '@/lib/panel/ssrGate';
import { getMonthlyReports } from '@/lib/panel/monthlyReports';
import ReportArchive from '@/components/panel/monthly-report/ReportArchive';

export default async function Page() {
	const session = await getSession();
	const c = await cookies();

	const { unlocked } = requireTier(c, session, 'elite'); // ELITE only

	const reports = getMonthlyReports();

	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
				{/* breadcrumbs */}
				<div className="flex items-center gap-3 text-sm text-white/70">
					<Link href="/" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
						← Strona główna
					</Link>
					<span className="text-white/30">/</span>
					<Link href="/konto/panel-rynkowy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
						Panel (EDU)
					</Link>
					<span className="text-white/30">/</span>
					<span className="text-white/70">Raport miesięczny</span>
				</div>

				{/* back */}
				<div className="mt-3">
					<Link
						href="/konto/panel-rynkowy"
						className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
					>
						← Wróć do Panelu (EDU)
					</Link>
				</div>

				{/* header */}
				<div className="mt-4">
					<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Raport miesięczny (EDU)</h1>
					<p className="mt-2 text-white/80 max-w-3xl">
						Podsumowanie miesiąca, narracje, scenariusze i checklisty. EDU ONLY — bez rekomendacji i „sygnałów”.
					</p>
				</div>

				{!unlocked ? (
					<div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
						<div className="flex items-center justify-between gap-4">
							<div>
								<div className="text-lg font-semibold">Zablokowane</div>
								<div className="text-sm text-white/70 mt-1">Ten moduł jest dostępny wyłącznie w ELITE.</div>
							</div>
							<Link
								href="/kontakt?topic=zakup-pakietu"
								className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
							>
								Ulepsz plan
							</Link>
						</div>
					</div>
				) : (
					<>
						{/* highlights */}
						<div className="mt-6 grid gap-4 md:grid-cols-3">
							{reports.slice(0, 3).map((r) => (
								<article
									key={r.ym}
									className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-sm"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<div className="text-xs text-white/70">{r.ym}</div>
											<h2 className="mt-1 text-lg font-semibold">{r.title}</h2>
										</div>
										<span className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
											ELITE
										</span>
									</div>
									<ul className="mt-3 space-y-1 text-sm text-white/80">
										<li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/60" /><span>Przegląd i główna narracja</span></li>
										<li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/60" /><span>Eventy i playbooki</span></li>
										<li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/60" /><span>Scenariusze A/B/C + checklisty</span></li>
									</ul>
									<div className="mt-4 flex items-center justify-between">
										<Link
											href={`/konto/panel-rynkowy/raport-miesieczny/${r.ym}`}
											className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
										>
											Otwórz raport
										</Link>
										<div className="text-xs text-white/60">EDU</div>
									</div>
								</article>
							))}
						</div>

						{/* archive */}
						<div className="mt-8">
							<ReportArchive reports={reports} baseHref="/konto/panel-rynkowy/raport-miesieczny" />
						</div>
					</>
				)}

				{/* disclaimer */}
				<div className="mt-10 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
					<p className="text-amber-200 text-sm">
						EDU: brak rekomendacji inwestycyjnych, brak „sygnałów”. Decyzje podejmujesz samodzielnie.
					</p>
				</div>
			</section>
		</main>
	);
}

