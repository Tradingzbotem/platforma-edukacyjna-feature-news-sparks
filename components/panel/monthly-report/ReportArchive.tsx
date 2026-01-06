'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { EduMonthlyReport } from '@/lib/panel/monthlyReports';

type Props = {
	reports: EduMonthlyReport[];
	baseHref: string; // e.g. "/konto/panel-rynkowy/raport-miesieczny"
};

export default function ReportArchive({ reports, baseHref }: Props) {
	const [query, setQuery] = useState('');

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return reports;
		return reports.filter((r) => {
			const hay = `${r.title} ${r.tldr} ${(r.tags || []).join(' ')} ${r.narrative}`.toLowerCase();
			return hay.includes(q);
		});
	}, [query, reports]);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="text-lg font-semibold">Archiwum</div>
				<div className="relative">
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Szukaj po tytule i tagach…"
						className="w-72 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30"
					/>
				</div>
			</div>

			<ul className="mt-4 space-y-2">
				{filtered.map((r) => (
					<li key={r.ym} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
						<div>
							<div className="text-sm text-white/70">{r.ym}</div>
							<div className="text-white font-medium">{r.title}</div>
						</div>
						<Link
							href={`${baseHref}/${r.ym}`}
							className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
						>
							Otwórz raport
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}


