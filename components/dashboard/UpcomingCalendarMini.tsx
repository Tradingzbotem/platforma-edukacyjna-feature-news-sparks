'use client';

import { useEffect, useState } from 'react';
import { CALENDAR_7D, type CalendarEvent } from '@/lib/panel/calendar7d';

function isWeekendISO(iso: string): boolean {
	try {
		const [y, m, d] = iso.split('-').map(Number);
		const wd = new Date(y, (m || 1) - 1, d || 1).getDay(); // 0=Nd,6=Sob
		return wd === 0 || wd === 6;
	} catch {
		return false;
	}
}

function formatDateLabel(iso: string): string {
	// Expect YYYY-MM-DD
	try {
		const [y, m, d] = iso.split('-').map(Number);
		const dt = new Date(y, (m || 1) - 1, d || 1);
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		const that = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
		const diff = Math.round((that - today) / (24 * 3600 * 1000));
		// Unikamy etykiet Dziś/Jutro w weekend, aby nie mylić użytkownika
		const todayWd = now.getDay();
		const thatWd = dt.getDay();
		const todayIsWeekend = todayWd === 0 || todayWd === 6;
		const thatIsWeekend = thatWd === 0 || thatWd === 6;
		if (!todayIsWeekend && !thatIsWeekend) {
			if (diff === 0) return 'Dziś';
			if (diff === 1) return 'Jutro';
			if (diff === -1) return 'Wczoraj';
		}
		return dt.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' }).replace('.', '');
	} catch {
		return iso;
	}
}

function importanceStyles(level: CalendarEvent['importance']): { dot: string; label: string } {
	if (level === 'high') return { dot: 'bg-rose-400', label: 'Wysoka' };
	if (level === 'medium') return { dot: 'bg-amber-300', label: 'Średnia' };
	return { dot: 'bg-white/50', label: 'Niska' };
}

type LiveItem = { date: string; time?: string; region?: string; title: string; importance?: 'low'|'medium'|'high' };

export default function UpcomingCalendarMini() {
	const [items, setItems] = useState<LiveItem[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch('/api/ai/calendar?days=14&limit=30', { cache: 'no-store' });
				const json = await res.json().catch(() => ({}));
				if (!mounted) return;
				const arr: LiveItem[] = Array.isArray(json?.items) ? json.items : [];
				if (arr.length) {
					setItems(arr);
				} else {
					setItems(null);
				}
			} catch (e: any) {
				if (!mounted) return;
				setError(String(e?.message || 'fetch-error'));
				setItems(null);
			}
		})();
		return () => { mounted = false; };
	}, []);

	const todayIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
	const fallback = CALENDAR_7D.filter(e => e.date >= todayIso).slice(0, 30).map<LiveItem>(e => ({
		date: e.date, time: e.time, region: e.region, title: e.event, importance: e.importance
	}));
	const rawData = items && items.length ? items : fallback;
	// Usuń daty weekendowe; jeśli po filtrze pusto, pokaż oryginał z jawną datą (bez „Dziś”/„Jutro”)
	const filtered = rawData.filter(ev => ev.date && !isWeekendISO(ev.date));
	const data = filtered.length ? filtered : rawData;

	return (
		<section className="rounded-2xl bg-white/5 border border-white/10 p-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Najbliższe wydarzenia (EDU)</h2>
			</div>
			<ul className="mt-3 space-y-3" role="list">
				{data.map((ev, idx) => {
					const imp = importanceStyles(ev.importance as any);
					return (
						<li key={`${ev.date}-${ev.time}-${idx}`} className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="text-xs text-white/60">
									<span className="font-semibold text-white/80">{formatDateLabel(ev.date)}</span>
									{' · '}
									<span>{ev.time}</span>
									{' · '}
									<span>{ev.region}</span>
								</div>
								<div className="mt-0.5 text-sm font-medium text-white/90 truncate">{(ev as any).event ?? ev.title}</div>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<span className={`h-2 w-2 rounded-full ${imp.dot}`} aria-hidden />
								<span className="text-xs text-white/60">{imp.label}</span>
							</div>
						</li>
					);
				})}
			</ul>
			<p className="mt-3 text-[11px] text-white/60">
				Ekonomiczny przegląd wydarzeń: na żywo przez GPT + fallback EDU.
			</p>
		</section>
	);
}


