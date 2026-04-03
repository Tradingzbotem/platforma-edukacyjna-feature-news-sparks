// lib/panel/macroCalendarCore.ts — wspólne ładowanie kalendarza makro (bez LLM)
import { sql } from '@vercel/postgres';
import { ensureMacroCalendarTable } from '@/lib/panel/ensureMacroCalendar';
import { isDatabaseConfigured } from '@/lib/db';

export type MacroCalendarApiEvent = {
	date: string;
	time?: string;
	region?: string;
	title: string;
	importance?: 'low' | 'medium' | 'high';
	source?: string;
};

export function clampMacroCalendar<T>(arr: T[], n: number): T[] {
	return Array.isArray(arr) ? arr.slice(0, Math.max(0, n)) : [];
}

async function loadFromDatabase(days: number): Promise<MacroCalendarApiEvent[]> {
	if (!isDatabaseConfigured()) return [];
	try {
		await ensureMacroCalendarTable();
		const from = startOfDay(new Date(Date.now() - 7 * 24 * 3600 * 1000));
		const to = startOfDay(new Date(Date.now() + Math.max(1, days) * 24 * 3600 * 1000));
		const fromStr = from.toISOString().slice(0, 10);
		const toStr = to.toISOString().slice(0, 10);

		const result = await sql`
			SELECT date, time, currency, event, weight, current, forecast, previous, region, importance
			FROM "MacroCalendarEvent"
			WHERE date >= ${fromStr} AND date <= ${toStr}
			ORDER BY date ASC, time ASC NULLS LAST
			LIMIT 500
		`;

		return result.rows.map((row: any) => ({
			date: String(row.date || ''),
			time: row.time ? String(row.time).slice(0, 5) : undefined,
			title: String(row.event || ''),
			region: row.region || (row.currency ? inferRegionFromCurrency(row.currency) : undefined),
			importance: ((): 'low' | 'medium' | 'high' | undefined => {
				const v = String(row.importance || '').toLowerCase();
				return v === 'high' ? 'high' : v === 'medium' ? 'medium' : v === 'low' ? 'low' : undefined;
			})(),
			source: 'Database',
		}));
	} catch (error: any) {
		console.error('[macroCalendarCore] Database error:', error?.message);
		return [];
	}
}

function inferRegionFromCurrency(currency?: string): string | undefined {
	if (!currency) return undefined;
	const c = currency.toUpperCase().trim();
	const regionMap: Record<string, string> = {
		USD: 'US',
		EUR: 'EU',
		GBP: 'UK',
		JPY: 'JP',
		CNY: 'CN',
		CHF: 'CH',
		AUD: 'AU',
		CAD: 'CA',
		NZD: 'NZ',
		SEK: 'SE',
		NOK: 'NO',
		DKK: 'DK',
		PLN: 'PL',
	};
	return regionMap[c];
}

function toIsoDate(d: Date): string {
	return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
	const copy = new Date(d);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function addDays(d: Date, n: number): Date {
	const copy = new Date(d);
	copy.setDate(copy.getDate() + n);
	return copy;
}

function nextWeekday(d: Date, weekday: number): Date {
	const copy = startOfDay(d);
	const diff = (weekday + 7 - copy.getDay()) % 7;
	return addDays(copy, diff || 7);
}

function firstWeekdayOfMonth(year: number, monthZeroBased: number, weekday: number): Date {
	const first = new Date(year, monthZeroBased, 1);
	const diff = (weekday + 7 - first.getDay()) % 7;
	return new Date(year, monthZeroBased, 1 + diff);
}

function clampToWindow(date: Date, from: Date, to: Date): boolean {
	return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
}

function toWeekdayIfWeekend(date: Date): Date {
	const wd = date.getDay();
	if (wd === 6) return addDays(date, -1);
	if (wd === 0) return addDays(date, 1);
	return date;
}

async function loadFromFinnhub(days: number): Promise<MacroCalendarApiEvent[]> {
	const token =
		process.env.FINNHUB_KEY ||
		process.env.FINNHUB_TOKEN ||
		process.env.NEXT_PUBLIC_FINNHUB_KEY ||
		process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
		'';
	if (!token) return [];

	const from = new Date();
	const to = new Date(Date.now() + Math.max(1, days) * 24 * 3600 * 1000);
	const url = `https://finnhub.io/api/v1/calendar/economic?from=${encodeURIComponent(
		toIsoDate(from),
	)}&to=${encodeURIComponent(toIsoDate(to))}&token=${encodeURIComponent(token)}`;

	const ac = new AbortController();
	const toId = setTimeout(() => ac.abort(), 15_000);
	const res = await fetch(url, { cache: 'no-store', signal: ac.signal }).catch(() => null as any);
	clearTimeout(toId);
	if (!res || !('ok' in res) || !res.ok) return [];
	const json = await res.json().catch(() => ({} as any));
	const events: any[] = Array.isArray(json?.economicCalendar)
		? json.economicCalendar
		: Array.isArray(json?.data)
			? json.data
			: [];
	const mapped: MacroCalendarApiEvent[] = events
		.map((e: any) => {
			const date = String(e?.date || e?.time || '').slice(0, 10);
			const time = String(e?.time || e?.datetime || '').slice(11, 16) || String(e?.time || '').slice(0, 5);
			const title = String(e?.event || e?.title || e?.indicator || '').trim();
			const region = String(e?.country || e?.region || '').toUpperCase().slice(0, 2) || undefined;
			const impactRaw = String(e?.impact || e?.importance || '').toLowerCase();
			const importance: 'low' | 'medium' | 'high' | undefined =
				impactRaw.includes('high') ? 'high' : impactRaw.includes('medium') ? 'medium' : impactRaw ? 'low' : undefined;
			return date && title
				? ({
						date,
						time,
						title,
						region,
						importance,
						source: 'Finnhub',
					} as MacroCalendarApiEvent)
				: null;
		})
		.filter(Boolean) as MacroCalendarApiEvent[];
	return mapped;
}

function fallbackFromEdu(days: number): MacroCalendarApiEvent[] {
	const now = startOfDay(new Date());
	const from = now;
	const to = startOfDay(new Date(now.getTime() + Math.max(1, days) * 24 * 3600 * 1000));
	const items: MacroCalendarApiEvent[] = [];

	let wed = nextWeekday(from, 3);
	while (wed.getTime() <= to.getTime()) {
		items.push({
			date: toIsoDate(wed),
			time: '15:30',
			title: 'USA — EIA Crude Oil Inventories',
			region: 'US',
			importance: 'medium',
			source: 'EDU',
		});
		wed = addDays(wed, 7);
	}

	function addMonthlySet(year: number, monthZero: number) {
		const firstFriday = firstWeekdayOfMonth(year, monthZero, 5);
		if (clampToWindow(firstFriday, from, to)) {
			items.push({
				date: toIsoDate(firstFriday),
				time: '13:30',
				title: 'USA — Non-Farm Payrolls (NFP)',
				region: 'US',
				importance: 'high',
				source: 'EDU',
			});
			items.push({
				date: toIsoDate(firstFriday),
				time: '13:30',
				title: 'USA — Unemployment Rate',
				region: 'US',
				importance: 'high',
				source: 'EDU',
			});
		}

		const firstMonday = firstWeekdayOfMonth(year, monthZero, 1);
		if (clampToWindow(firstMonday, from, to)) {
			items.push({
				date: toIsoDate(firstMonday),
				time: '15:00',
				title: 'USA — ISM Manufacturing PMI',
				region: 'US',
				importance: 'medium',
				source: 'EDU',
			});
		}

		const thirdMonday = addDays(firstMonday, 14);
		if (clampToWindow(thirdMonday, from, to)) {
			items.push({
				date: toIsoDate(thirdMonday),
				time: '15:00',
				title: 'USA — ISM Services PMI',
				region: 'US',
				importance: 'medium',
				source: 'EDU',
			});
		}

		let cpi = new Date(year, monthZero, 12);
		cpi = toWeekdayIfWeekend(cpi);
		if (clampToWindow(cpi, from, to)) {
			items.push({
				date: toIsoDate(cpi),
				time: '13:30',
				title: 'USA — CPI',
				region: 'US',
				importance: 'high',
				source: 'EDU',
			});
			let ppi = toWeekdayIfWeekend(addDays(cpi, 1));
			if (clampToWindow(ppi, from, to)) {
				items.push({
					date: toIsoDate(ppi),
					time: '13:30',
					title: 'USA — PPI',
					region: 'US',
					importance: 'medium',
					source: 'EDU',
				});
			}
		}

		let retail = new Date(year, monthZero, 15);
		retail = toWeekdayIfWeekend(retail);
		if (clampToWindow(retail, from, to)) {
			items.push({
				date: toIsoDate(retail),
				time: '13:30',
				title: 'USA — Retail Sales',
				region: 'US',
				importance: 'medium',
				source: 'EDU',
			});
		}

		let pce = new Date(year, monthZero, 28);
		pce = toWeekdayIfWeekend(pce);
		if (clampToWindow(pce, from, to)) {
			items.push({
				date: toIsoDate(pce),
				time: '13:30',
				title: 'USA — PCE Price Index',
				region: 'US',
				importance: 'high',
				source: 'EDU',
			});
		}

		let gdp = new Date(year, monthZero, 28);
		gdp = toWeekdayIfWeekend(gdp);
		if (clampToWindow(gdp, from, to)) {
			items.push({
				date: toIsoDate(gdp),
				time: '13:30',
				title: 'USA — GDP (Preliminary)',
				region: 'US',
				importance: 'high',
				source: 'EDU',
			});
		}

		const fomcMonths = [0, 2, 4, 5, 6, 8, 10, 11];
		if (fomcMonths.includes(monthZero)) {
			let fomc = new Date(year, monthZero, 15);
			fomc = toWeekdayIfWeekend(fomc);
			while (fomc.getDay() !== 3 && fomc.getTime() <= to.getTime()) {
				fomc = addDays(fomc, 1);
			}
			if (clampToWindow(fomc, from, to)) {
				items.push({
					date: toIsoDate(fomc),
					time: '19:00',
					title: 'USA — FOMC Interest Rate Decision',
					region: 'US',
					importance: 'high',
					source: 'EDU',
				});
			}
		}
	}

	const y0 = from.getFullYear();
	const m0 = from.getMonth();
	addMonthlySet(y0, m0);
	const nextMonth = new Date(from.getFullYear(), from.getMonth() + 1, 1);
	if (nextMonth.getTime() <= to.getTime()) {
		addMonthlySet(nextMonth.getFullYear(), nextMonth.getMonth());
	}
	const monthAfterNext = new Date(from.getFullYear(), from.getMonth() + 2, 1);
	if (monthAfterNext.getTime() <= to.getTime()) {
		addMonthlySet(monthAfterNext.getFullYear(), monthAfterNext.getMonth());
	}

	const pri = (x: MacroCalendarApiEvent) => (x.importance === 'high' ? 2 : x.importance === 'medium' ? 1 : 0);
	return items
		.slice()
		.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : pri(b) - pri(a)));
}

/**
 * Łańcuch: Database → Finnhub → EDU (bez LLM).
 */
export async function loadMacroCalendarRawChain(days: number): Promise<{ raw: MacroCalendarApiEvent[]; source: string }> {
	let raw: MacroCalendarApiEvent[] = [];
	let source = 'EDU';

	try {
		raw = await loadFromDatabase(days);
		if (raw.length > 0) source = 'Database';
	} catch (error: any) {
		console.error('[macroCalendarCore] Database load error:', error?.message);
	}

	if (!raw.length) {
		try {
			raw = await loadFromFinnhub(days);
			if (raw.length > 0) source = 'Finnhub';
		} catch {
			raw = [];
		}
	}

	if (!raw.length) {
		raw = fallbackFromEdu(days);
	}

	return { raw, source };
}

function isWeekendISO(iso?: string): boolean {
	if (!iso) return false;
	try {
		const [y, m, d] = iso.split('-').map(Number);
		const wd = new Date(y, (m || 1) - 1, d || 1).getDay();
		return wd === 0 || wd === 6;
	} catch {
		return false;
	}
}

/**
 * Sortowanie jak w /api/ai/calendar bez LLM + filtr weekendów.
 */
export function rankMacroCalendarItems(raw: MacroCalendarApiEvent[], limit: number): MacroCalendarApiEvent[] {
	const pri = (x: MacroCalendarApiEvent) => (x.importance === 'high' ? 2 : x.importance === 'medium' ? 1 : 0);
	let items = raw
		.slice()
		.sort((a, b) => {
			const dc = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
			return dc || pri(b) - pri(a);
		})
		.slice(0, limit);

	const noWeekend = items.filter((x) => x.date && !isWeekendISO(x.date));
	if (noWeekend.length >= 5) {
		items = noWeekend.slice(0, limit);
	}
	return items;
}
