import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { requireTier } from '@/lib/panel/ssrGate';
import { getMonthlyReport, getMonthlyReports } from '@/lib/panel/monthlyReports';
import MonthlyReportPage from '@/components/panel/monthly-report/MonthlyReportPage';

type Params = {
	params: Promise<{ ym: string }>;
};

export default async function Page({ params }: Params) {
	const session = await getSession();
	const c = await cookies();
	const { unlocked } = requireTier(c, session, 'elite');

	const { ym } = await params;
	const report = getMonthlyReport(ym);
	if (!report) {
		notFound();
	}

	const allReports = getMonthlyReports();

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
					<Link href="/konto/panel-rynkowy/raport-miesieczny" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
						Raport miesięczny
					</Link>
					<span className="text-white/30">/</span>
					<span className="text-white/70">{ym}</span>
				</div>

				{/* back */}
				<div className="mt-3">
					<Link
						href="/konto/panel-rynkowy/raport-miesieczny"
						className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
					>
						← Lista raportów
					</Link>
				</div>

				{/* header */}
				<div className="mt-4">
					<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Raport miesięczny (EDU)</h1>
					<p className="mt-2 text-white/80 max-w-3xl">Szczegóły raportu {ym}. EDU ONLY — bez rekomendacji i „sygnałów”.</p>
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
					<div className="mt-6">
						<MonthlyReportPage report={report} allReports={allReports} hideTabsSidebar={ym === '2026-01'} />
					</div>
				)}
			</section>
		</main>
	);
}


