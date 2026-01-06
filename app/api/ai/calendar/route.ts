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
	const toId = setTimeout(() => ac.abort(), 10_000);
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
	const today = new Date().toISOString().slice(0, 10);
	const upcoming = CALENDAR_7D.filter((e) => e.date >= today).slice(0, Math.max(3, days));
	return upcoming.map<ApiEvent>((e) => ({
		date: e.date,
		time: e.time,
		title: e.event,
		region: e.region,
		importance: e.importance,
		source: 'EDU',
	}));
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const days = Math.min(14, Math.max(1, Number(url.searchParams.get('days') || 7)));
		const limit = Math.min(8, Math.max(3, Number(url.searchParams.get('limit') || 5)));
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
				const completion = await openai.chat.completions.create({
					model: 'gpt-4o-mini',
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
							content: JSON.stringify({ limit, inputs: clamp(raw, 30) }),
						},
					],
				});
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
						modelUsed = 'gpt-4o-mini';
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
		if (noWeekend.length) items = noWeekend.slice(0, limit);

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


