// app/api/ai/calendar/route.ts — Live economic events summarized/ranked by GPT
import OpenAI from 'openai';
import {
	clampMacroCalendar,
	loadMacroCalendarRawChain,
	rankMacroCalendarItems,
	type MacroCalendarApiEvent,
} from '@/lib/panel/macroCalendarCore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ApiEvent = MacroCalendarApiEvent;

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const days = Math.min(31, Math.max(1, Number(url.searchParams.get('days') || 7)));
		const limit = Math.min(200, Math.max(3, Number(url.searchParams.get('limit') || 50)));
		const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

		const { raw, source } = await loadMacroCalendarRawChain(days);

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
								content: JSON.stringify({ limit, inputs: clampMacroCalendar(raw, 50) }),
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
						items = clampMacroCalendar(
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

		if (!usedLLM) {
			items = rankMacroCalendarItems(raw, limit);
		}

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
		if (noWeekend.length >= 5) {
			items = noWeekend.slice(0, limit);
		}

		return new Response(JSON.stringify({ items, cachedAt: new Date().toISOString(), source }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cache-Control': 'no-store',
				'X-LLM-Used': usedLLM ? '1' : '0',
				'X-Source': source,
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
