// app/api/ai/calendar/route.ts — Live economic events summarized/ranked by GPT
import OpenAI from 'openai';
import { CALENDAR_7D, type CalendarEvent } from '@/lib/panel/calendar7d';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ApiEvent = {
	date: string;      // YYYY-MM-DD
	time?: string;     // HH:mm
	region?: string;   // US/EU/UK/DE/FR/...
	title: string;
	importance?: 'low' | 'medium' | 'high';
	source?: string;
};

function clamp<T>(arr: T[], n: number): T[] {
	return Array.isArray(arr) ? arr.slice(0, Math.max(0, n)) : [];
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
	// weekday: 0=Sun..6=Sat
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
	// Move Sat/Sun to nearest Friday/Monday (prefer Friday for macro)
	const wd = date.getDay();
	if (wd === 6) return addDays(date, -1); // Saturday -> Friday
	if (wd === 0) return addDays(date, 1); // Sunday -> Monday
	return date;
}

async function loadFromFinnhub(days: number): Promise<ApiEvent[]> {
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
	const toId = setTimeout(() => ac.abort(), 15_000); // Increased timeout for better reliability
	const res = await fetch(url, { cache: 'no-store', signal: ac.signal }).catch(() => null as any);
	clearTimeout(toId);
	if (!res || !('ok' in res) || !res.ok) return [];
	const json = await res.json().catch(() => ({} as any));
	const events: any[] = Array.isArray(json?.economicCalendar) ? json.economicCalendar : Array.isArray(json?.data) ? json.data : [];
	const mapped: ApiEvent[] = events
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
				  } as ApiEvent)
				: null;
		})
		.filter(Boolean) as ApiEvent[];
	return mapped;
}

function fallbackFromEdu(days: number): ApiEvent[] {
	// Generatywne EDU fallback: najważniejsze wydarzenia makro które mogą wpłynąć na rynek
	const now = startOfDay(new Date());
	const from = now;
	const to = startOfDay(new Date(now.getTime() + Math.max(1, days) * 24 * 3600 * 1000));
	const items: ApiEvent[] = [];

	// Cotygodniowe: EIA Crude Oil Inventories (Środa ~15:30 UTC)
	let wed = nextWeekday(from, 3); // 3=Wed
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

	// Miesięczne wydarzenia makro
	function addMonthlySet(year: number, monthZero: number) {
		// NFP (pierwszy piątek m-ca, 13:30)
		const firstFriday = firstWeekdayOfMonth(year, monthZero, 5); // 5=Fri
		if (clampToWindow(firstFriday, from, to)) {
			items.push({
				date: toIsoDate(firstFriday),
				time: '13:30',
				title: 'USA — Non-Farm Payrolls (NFP)',
				region: 'US',
				importance: 'high',
				source: 'EDU',
			});
			// Unemployment Rate (razem z NFP)
			items.push({
				date: toIsoDate(firstFriday),
				time: '13:30',
				title: 'USA — Unemployment Rate',
				region: 'US',
				importance: 'high',
				source: 'EDU',
			});
		}

		// ISM Manufacturing (pierwszy poniedziałek m-ca, 15:00)
		const firstMonday = firstWeekdayOfMonth(year, monthZero, 1); // 1=Mon
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

		// ISM Services (trzeci poniedziałek m-ca, 15:00)
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

		// CPI (~12-ty dzień m-ca, 13:30)
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
			// PPI: dzień po CPI
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

		// Retail Sales (~15 dzień m-ca, 13:30)
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

		// PCE (~28-30 dzień m-ca, 13:30) - preferowana przez Fed miara inflacji
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

		// PKB/GDP (~28 dzień m-ca, 13:30)
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

		// FOMC - spotkania Fed (zwykle co 6-8 tygodni, około 15-20 dnia miesiąca)
		// Przybliżone daty: styczeń, marzec, maj, czerwiec, lipiec, wrzesień, listopad, grudzień
		const fomcMonths = [0, 2, 4, 5, 6, 8, 10, 11]; // 0=styczeń, 11=grudzień
		if (fomcMonths.includes(monthZero)) {
			let fomc = new Date(year, monthZero, 15);
			fomc = toWeekdayIfWeekend(fomc);
			// FOMC zwykle kończy się w środę, więc szukamy najbliższej środy
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
	// jeśli zakres sięga następnego miesiąca — dołóż
	const nextMonth = new Date(from.getFullYear(), from.getMonth() + 1, 1);
	if (nextMonth.getTime() <= to.getTime()) {
		addMonthlySet(nextMonth.getFullYear(), nextMonth.getMonth());
	}
	// jeśli zakres sięga jeszcze dalej (dla 14 dni może być potrzebne)
	const monthAfterNext = new Date(from.getFullYear(), from.getMonth() + 2, 1);
	if (monthAfterNext.getTime() <= to.getTime()) {
		addMonthlySet(monthAfterNext.getFullYear(), monthAfterNext.getMonth());
	}

	// Zwróć posortowane po dacie+ważności (wysoka->średnia->niska)
	const pri = (x: ApiEvent) => (x.importance === 'high' ? 2 : x.importance === 'medium' ? 1 : 0);
	return items
		.slice()
		.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : pri(b) - pri(a)));
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const days = Math.min(31, Math.max(1, Number(url.searchParams.get('days') || 7)));
		const limit = Math.min(200, Math.max(3, Number(url.searchParams.get('limit') || 50))); // Increased default limit
		const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

		// 1) Load raw events
		let raw: ApiEvent[] = [];
		try {
			raw = await loadFromFinnhub(days);
		} catch {
			raw = [];
		}
		if (!raw.length) {
			raw = fallbackFromEdu(days);
		}

		// 2) If GPT available, let it rank/normalize top N (ensures real-time + coherent EDU labels)
		let items: ApiEvent[] = raw;
		let usedLLM = false;
		let modelUsed = '';
		if (apiKey && raw.length > 0) {
			try {
				const openai = new OpenAI({ apiKey });
				async function gen(model: string) {
					return openai.chat.completions.create({
						model,
						temperature: 0,
						response_format: {
							type: 'json_schema',
							json_schema: {
								name: 'calendar_items',
								strict: true,
								schema: {
									type: 'object',
									required: ['items'],
									properties: {
										items: {
											type: 'array',
											items: {
												type: 'object',
												additionalProperties: false,
												required: ['date', 'title'],
												properties: {
													date: { type: 'string' },
													time: { type: 'string' },
													region: { type: 'string' },
													title: { type: 'string' },
													importance: { type: 'string', enum: ['low', 'medium', 'high'] },
												},
											},
										},
									},
								},
							},
						} as any,
						messages: [
							{
								role: 'system',
								content:
									'Wybierz NAJBARDZIEJ RYNKOWE wydarzenia z nadchodzących dni. Zwróć tylko JSON {items:[{date,time,region,title,importance}]}. ' +
									'Kryteria rankingu: PCE/CPI/NFP/FOMC/ISM > PMI/GDP > mniejsze raporty. Nie wymyślaj. Użyj dostępnych pól.',
							},
							{
								role: 'user',
								content: JSON.stringify({ limit, inputs: clamp(raw, 50) }), // Increased input limit for better selection
							},
						],
					});
				}
				let completion: any = null;
				try {
					completion = await gen('gpt-4o-mini');
					modelUsed = 'gpt-4o-mini';
				} catch {
					completion = await gen('gpt-4.1-mini');
					modelUsed = 'gpt-4.1-mini';
				}
				const content = completion?.choices?.[0]?.message?.content ?? '';
				if (content) {
					const parsed = JSON.parse(content);
					if (Array.isArray(parsed?.items) && parsed.items.length) {
						items = clamp(
							parsed.items.map((x: any) => ({
								date: String(x?.date || ''),
								time: String(x?.time || ''),
								region: String(x?.region || '').toUpperCase().slice(0, 3) || undefined,
								title: String(x?.title || ''),
								importance: ((): 'low' | 'medium' | 'high' | undefined => {
									const v = String(x?.importance || '').toLowerCase();
									return v === 'high' ? 'high' : v === 'medium' ? 'medium' : v === 'low' ? 'low' : undefined;
								})(),
								source: 'LLM',
							})),
							limit,
						);
						usedLLM = true;
					}
				}
			} catch {
				// fall back to raw
			}
		}

		// 3) Default trimming
		if (!usedLLM) {
			// Simple heuristic: keep items with high/medium first, then by date
			const pri = (x: ApiEvent) => (x.importance === 'high' ? 2 : x.importance === 'medium' ? 1 : 0);
			items = raw
				.slice()
				.sort((a, b) => (b.date > a.date ? -1 : 1) + (pri(b) - pri(a)))
				.slice(0, limit);
		}

		// 4) Weekend guard — usuń wydarzenia datowane na sob/niedz (zostaw, jeśli byśmy wyczyścili wszystko)
		const isWeekendISO = (iso?: string) => {
			if (!iso) return false;
			try {
				const [y, m, d] = iso.split('-').map(Number);
				const wd = new Date(y, (m || 1) - 1, d || 1).getDay();
				return wd === 0 || wd === 6;
			} catch {
				return false;
			}
		};
		const noWeekend = items.filter((x) => x.date && !isWeekendISO(x.date));
		// Only filter weekends if we have enough non-weekend events (at least 5)
		if (noWeekend.length >= 5) {
			items = noWeekend.slice(0, limit);
		}

		return new Response(JSON.stringify({ items, cachedAt: new Date().toISOString() }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cache-Control': 'no-store',
				'X-LLM-Used': usedLLM ? '1' : '0',
				...(usedLLM ? { 'X-LLM-Model': modelUsed } : {}),
			},
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e?.message || 'calendar error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}
}


