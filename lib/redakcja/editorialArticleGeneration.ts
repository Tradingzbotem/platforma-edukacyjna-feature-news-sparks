/**
 * Wspólny pipeline generowania artykułów Redakcji (jakość jak „z newsa”):
 * konkretny kontekst, wpływ na aktywa, „na co patrzeć”, ton analityczny, bez porad inwestycyjnych.
 */
import OpenAI from 'openai';
import type { AdminNewsItemRecord } from '@/lib/news/adminNewsItem';
import { getPrisma } from '@/lib/prisma';
import { isDatabaseConfigured } from '@/lib/db';
import { sql } from '@vercel/postgres';
import { NEWS_FACTS_MARKER_END, NEWS_FACTS_MARKER_START } from '@/lib/redakcja/newsFactsMarkers';
import type { EditorialCoverImageCategory } from '@/lib/redakcja/editorialCoverImagePrompt';

export const EDITORIAL_ARTICLE_SYSTEM_PROMPT = `
Jesteś redaktorem tworzącym edukacyjne artykuły o rynkach finansowych i ekonomii — styl redakcyjno-analityczny, konkretny, bez „lania wody”.

Zasady:
- Artykuł musi być osadzony w podanym wejściu (news lub temat ręczny). Nie wymyślaj faktów ani cytatów; jeśli czegoś brakuje, napisz wprost, że to ramy edukacyjne / typowe mechanizmy rynkowe.
- Materiał jest CZYSTO EDUKACYJNY — zero rekomendacji inwestycyjnych, zero porad tradingowych, zero sygnałów kup/sprzedaj, zero wskazywania działań dla czytelnika.
- Możesz omawiać scenariusze i mechanizmy rynkowe wyłącznie w ujęciu edukacyjnym.
- Język: polski, profesjonalny, zwięzły.
- Długość: ok. 800–1200 słów.

Struktura Markdown (w tej kolejności):
- Krótki lead (1–3 zdania, bez nagłówka)
- ## Co się wydarzyło / kontekst
- ## Możliwy wpływ na instrumenty i rynek (wyłącznie edukacyjnie / scenariuszowo, bez rekomendacji)
- ## Szerszy kontekst i mechanizm
- ## Na co patrzeć dalej (obserwacje edukacyjne — nie „co kupić”)
- ## Uwaga edukacyjna (2–3 zdania: treść ma charakter wyłącznie edukacyjny; nie stanowi porady inwestycyjnej ani rekomendacji)

Format odpowiedzi (JSON):
{
  "title": "Tytuł artykułu (maksymalnie 80 znaków)",
  "content": "Treść w Markdown z nagłówkami ## zgodnie ze strukturą powyżej.",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 5
}
`.trim();

export type EditorialArticleSourceType = 'news' | 'manual_topic';

/** Ustandaryzowane wejście do generatora (news lub temat ręczny). */
export type EditorialArticleOpenAIInput = {
	sourceType: EditorialArticleSourceType;
	title: string;
	summary?: string;
	instruments?: string[];
	impact?: string;
	whyItMatters?: string;
	/** Opcjonalne pole z panelu — może pochodzić z enrich w przyszłości */
	possibleMarketImpact?: string;
	context?: string;
	manualHints?: string;
	watch?: string[];
	impacts?: Array<{ symbol?: string; direction?: string; effect?: string }>;
	sourceLabel?: string;
	sourceUrl?: string;
	publishedAt?: string;
};

/** Opcjonalny kontekst wyłącznie dla `buildEditorialImagePrompt` (nie jest wymagany w DB). */
export type EditorialArticleImagePromptContext = {
	summary?: string;
	category?: EditorialCoverImageCategory;
};

export type EditorialArticleData = {
	title: string;
	content: string;
	tags: string[];
	readingTime: number;
	imagePromptContext?: EditorialArticleImagePromptContext;
};

export type EditorialArticleResult =
	| { ok: true; data: EditorialArticleData }
	| { ok: false; error: string; details?: unknown };

function serializeError(err: unknown) {
	const e = err as {
		message?: string;
		status?: number;
		code?: string;
		type?: string;
		name?: string;
		error?: unknown;
		response?: { data?: unknown };
	};
	return {
		message: e?.message,
		status: e?.status,
		code: e?.code,
		type: e?.type,
		name: e?.name,
		error: e?.error,
		responseData: e?.response?.data ?? null,
	};
}

export function strFromUnknown(v: unknown): string {
	if (v == null) return '';
	if (typeof v === 'string') return v.trim();
	if (typeof v === 'number' && Number.isFinite(v)) return String(v);
	return '';
}

export function directionPl(d: string): string {
	const m: Record<string, string> = {
		up: 'wzrost',
		down: 'spadek',
		volatile: 'zmienność',
		neutral: 'neutralnie',
	};
	const key = d.trim().toLowerCase();
	return m[key] || d;
}

export function buildEditorialFactsBlockForPrompt(input: EditorialArticleOpenAIInput): string {
	const lines: string[] = [];
	lines.push(`Tytuł / temat: ${input.title}`);
	if (input.sourceLabel) lines.push(`Źródło: ${input.sourceLabel}`);
	if (input.sourceUrl) lines.push(`URL: ${input.sourceUrl}`);
	if (input.publishedAt) lines.push(`Data publikacji: ${input.publishedAt}`);
	if (input.summary) lines.push(`Streszczenie: ${input.summary}`);
	if (input.instruments?.length) lines.push(`Instrumenty / tickery: ${input.instruments.join(', ')}`);
	if (input.impact) lines.push(`Impact (skala / siła): ${input.impact}`);
	if (input.whyItMatters) lines.push(`Dlaczego to ważne: ${input.whyItMatters}`);
	if (input.possibleMarketImpact) lines.push(`Możliwy wpływ rynkowy (z wejścia): ${input.possibleMarketImpact}`);
	if (input.context) lines.push(`Kontekst dodatkowy: ${input.context}`);
	if (input.watch?.length) lines.push(`Obserwacja / „watch”: ${input.watch.join('; ')}`);

	const impactLines: string[] = [];
	for (const raw of input.impacts || []) {
		const sym = strFromUnknown(raw.symbol);
		const dir = strFromUnknown(raw.direction);
		const eff = strFromUnknown(raw.effect);
		if (!sym && !eff) continue;
		const dirPart = dir ? ` (${directionPl(dir)})` : '';
		impactLines.push(`${sym || '?'}${dirPart}: ${eff || '—'}`);
	}
	if (impactLines.length) {
		lines.push('Szczegóły wpływu (z wejścia):');
		impactLines.forEach((l) => lines.push(`  - ${l}`));
	}

	return lines.join('\n');
}

export function adminNewsItemToEditorialInput(item: AdminNewsItemRecord): EditorialArticleOpenAIInput {
	const e = item.enriched || {};
	const inst = Array.isArray(e.instruments) ? e.instruments.map((x) => strFromUnknown(x)).filter(Boolean) : [];
	const watch = Array.isArray(e.watch) ? e.watch.map((x) => strFromUnknown(x)).filter(Boolean) : [];
	const impactsRaw = Array.isArray(e.impacts) ? e.impacts : [];
	const impacts: EditorialArticleOpenAIInput['impacts'] = [];
	for (const raw of impactsRaw) {
		if (!raw || typeof raw !== 'object') continue;
		const o = raw as Record<string, unknown>;
		impacts.push({
			symbol: strFromUnknown(o.symbol),
			direction: strFromUnknown(o.direction),
			effect: strFromUnknown(o.effect),
		});
	}
	const cat = strFromUnknown(e.category);
	const timeEdge = strFromUnknown(e.timeEdge);
	const ctxParts = [cat && `Kategoria: ${cat}`, timeEdge && `TimeEdge: ${timeEdge}`].filter(Boolean) as string[];

	return {
		sourceType: 'news',
		title: item.title,
		summary: strFromUnknown(e.summaryShort) || undefined,
		instruments: inst.length ? inst : undefined,
		impact: strFromUnknown(e.impact) || undefined,
		whyItMatters: strFromUnknown(e.whyItMatters) || undefined,
		possibleMarketImpact: strFromUnknown(e.possibleMarketImpact) || undefined,
		context: ctxParts.length ? ctxParts.join(' | ') : undefined,
		watch: watch.length ? watch : undefined,
		impacts: impacts.length ? impacts : undefined,
		sourceLabel: item.source,
		sourceUrl: item.url,
		publishedAt: item.publishedAt,
	};
}

/** Stały blok z surowych danych newsa — doklejany po generacji AI. */
export function buildNewsFactsMarkdownAppendix(item: AdminNewsItemRecord): string {
	const e = item.enriched || {};
	const parts: string[] = ['\n\n---\n\n', '## Dane wydarzenia\n'];

	const bullets: Array<{ label: string; value: string }> = [
		{ label: 'Tytuł', value: item.title },
		{ label: 'Źródło', value: item.source },
		{ label: 'Link', value: item.url },
	];
	const cat = strFromUnknown(e.category);
	if (cat) bullets.push({ label: 'Kategoria', value: cat });
	const inst = Array.isArray(e.instruments) ? e.instruments.map((x) => strFromUnknown(x)).filter(Boolean) : [];
	if (inst.length) bullets.push({ label: 'Instrumenty', value: inst.join(', ') });
	const sent = strFromUnknown(e.sentiment);
	if (sent) bullets.push({ label: 'Sentyment', value: sent });
	const impact = strFromUnknown(e.impact);
	if (impact) bullets.push({ label: 'Impact', value: impact });
	const timeEdge = strFromUnknown(e.timeEdge);
	if (timeEdge) bullets.push({ label: 'TimeEdge', value: timeEdge });

	for (const b of bullets) {
		if (b.value) parts.push(`* ${b.label}: ${b.value}\n`);
	}

	const impacts = Array.isArray(e.impacts) ? e.impacts : [];
	const impactBullets: string[] = [];
	for (const raw of impacts) {
		if (!raw || typeof raw !== 'object') continue;
		const o = raw as Record<string, unknown>;
		const sym = strFromUnknown(o.symbol);
		const dir = strFromUnknown(o.direction);
		const eff = strFromUnknown(o.effect);
		if (!sym && !eff) continue;
		const dirPart = dir ? ` (${directionPl(dir)})` : '';
		impactBullets.push(`* **${sym || '?'}**${dirPart}: ${eff || '—'}`);
	}
	if (impactBullets.length) {
		parts.push('\n## Szczegóły wpływu\n\n');
		parts.push(impactBullets.join('\n') + '\n');
	}

	const watch = Array.isArray(e.watch) ? e.watch.map((x) => strFromUnknown(x)).filter(Boolean) : [];
	const wim = strFromUnknown(e.whyItMatters);
	const obs: string[] = [];
	if (wim) obs.push(wim);
	obs.push(...watch);
	if (obs.length) {
		parts.push('\n## Obserwacja\n\n');
		obs.forEach((t) => parts.push(`* ${t}\n`));
	}

	return `\n\n${NEWS_FACTS_MARKER_START}\n${parts.join('')}\n${NEWS_FACTS_MARKER_END}\n`;
}

function buildUserPrompt(input: EditorialArticleOpenAIInput, dateStr: string): string {
	const facts = buildEditorialFactsBlockForPrompt(input);
	const sourceLine =
		input.sourceType === 'news'
			? 'Źródło wejścia: doniesienie / news z systemu (wykorzystaj wszystkie sensowne pola poniżej).'
			: 'Źródło wejścia: temat wpisany ręcznie przez redakcję — zbuduj artykuł w tej samej strukturze jakościowej co przy newsie; uzupełnij luki typowymi, edukacyjnymi ramami mechanizmu rynkowego, bez zmyślania faktów.';

	const hintsBlock = input.manualHints?.trim()
		? `\n\nWskazówki redaktora (opcjonalne):\n${input.manualHints.trim()}`
		: '';

	return `Dziś jest ${dateStr}. ${sourceLine}

DANE WEJŚCIOWE:
${facts}
${hintsBlock}

Wymagania:
- Konkretnie i analitycznie; unikaj ogólników.
- Zachowaj sekcje i ton z promptu systemowego.
- Bez rekomendacji inwestycyjnych.`.trim();
}

export async function generateEditorialArticleWithOpenAI(
	apiKey: string,
	input: EditorialArticleOpenAIInput,
	options?: { appendNewsFactsFrom?: AdminNewsItemRecord | null }
): Promise<EditorialArticleResult> {
	const openai = new OpenAI({ apiKey });
	const today = new Date();
	const dateStr = today.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });
	const userPrompt = buildUserPrompt(input, dateStr);

	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: input.sourceType === 'news' ? 0.65 : 0.7,
			response_format: { type: 'json_object' },
			messages: [
				{ role: 'system', content: EDITORIAL_ARTICLE_SYSTEM_PROMPT },
				{ role: 'user', content: userPrompt },
			],
			max_tokens: 2800,
		});

		const content = completion.choices?.[0]?.message?.content;
		if (!content) {
			const details = {
				finishReason: completion.choices?.[0]?.finish_reason ?? null,
				completionId: completion.id ?? null,
			};
			console.error('OpenAI empty completion (editorial):', details);
			return { ok: false, error: 'OPENAI_EMPTY_RESPONSE', details };
		}

		let parsed: Record<string, unknown>;
		try {
			parsed = JSON.parse(content) as Record<string, unknown>;
		} catch (parseErr) {
			const pe = serializeError(parseErr);
			const contentPreview = content.slice(0, 400);
			console.error('OpenAI JSON parse error (editorial):', pe, { contentPreview });
			return {
				ok: false,
				error: 'OPENAI_JSON_PARSE_FAILED',
				details: { parseError: pe, contentPreview },
			};
		}

		let baseContent = String(parsed.content || '').trim();
		const appendixItem = options?.appendNewsFactsFrom;
		if (appendixItem) {
			baseContent += buildNewsFactsMarkdownAppendix(appendixItem);
		}

		const defaultTags = input.sourceType === 'news' ? ['edukacja', 'news'] : ['edukacja', 'redakcja'];

		return {
			ok: true,
			data: {
				title: String(parsed.title || input.title || 'Artykuł edukacyjny').trim().slice(0, 200),
				content: baseContent,
				tags: Array.isArray(parsed.tags)
					? parsed.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
					: defaultTags,
				readingTime: typeof parsed.readingTime === 'number' ? parsed.readingTime : 5,
			},
		};
	} catch (e: unknown) {
		const details = serializeError(e);
		console.error('OpenAI error (editorial):', details);
		return { ok: false, error: 'OPENAI_GENERATION_FAILED', details };
	}
}

export async function getRecentArticleTopics(limit: number = 10): Promise<string[]> {
	const prisma = getPrisma();
	const topics: string[] = [];

	try {
		if (prisma) {
			const articles = await prisma.article.findMany({
				take: limit,
				orderBy: { createdAt: 'desc' },
				select: { title: true, tags: true },
			});
			for (const art of articles) {
				if (art.title) topics.push(art.title.toLowerCase());
				if (Array.isArray(art.tags)) topics.push(...art.tags.map((t: string) => t.toLowerCase()));
			}
		} else if (isDatabaseConfigured()) {
			const { rows } = await sql<{ title: string; tags: string[] }>`
				SELECT title, tags FROM "Article" ORDER BY "createdAt" DESC LIMIT ${limit}
			`;
			for (const art of rows) {
				if (art.title) topics.push(art.title.toLowerCase());
				if (Array.isArray(art.tags)) topics.push(...art.tags.map((t: string) => t.toLowerCase()));
			}
		}
	} catch {
		// ignore
	}

	return topics;
}

export function selectRandomTopic(recentTopics: string[], newsContext?: string): string {
	const allTopics = [
		'stopy procentowe i ich wpływ na rynki',
		'polityka monetarna banków centralnych',
		'relacja między inflacją a bezrobociem (krzywa Phillipsa)',
		'deficyt budżetowy i dług publiczny',
		'wymiana walutowa i kursy walutowe',
		'złoto jako aktywo bezpieczne (safe haven)',
		'ropa naftowa i czynniki wpływające na jej cenę',
		'obligacje skarbowe i rentowności',
		'akcje technologiczne vs wartościowe',
		'kryptowaluty i blockchain w kontekście finansów',
		'EUR/USD - główne czynniki wpływające na parę',
		'NASDAQ 100 - charakterystyka indeksu',
		'S&P 500 - jak czytać indeks',
		'DAX 40 - niemiecki indeks giełdowy',
		'poziomy wsparcia i oporu',
		'średnie kroczące (MA) - zastosowanie',
		'RSI - wskaźnik siły względnej',
		'MACD - interpretacja sygnałów',
		'formacje świecowe japońskie',
		'wolumen i jego znaczenie w analizie',
		'trendy i ich identyfikacja',
		'psychologia tradingu - emocje vs logika',
		'zarządzanie ryzykiem w tradingu',
		'NFP (Non-Farm Payrolls) - co to jest i jak wpływa',
		'CPI (Consumer Price Index) - interpretacja danych',
		'PCE - alternatywny wskaźnik inflacji',
		'decyzje FOMC i ich wpływ na rynki',
		'decyzje EBC (Europejski Bank Centralny)',
		'GDP - produkt krajowy brutto',
		'fuzje i przejęcia (M&A) - jak wpływają na wyceny',
		'duże ruchy kursów akcji (gap up / gap down) - przyczyny i kontekst',
		'wyniki kwartalne spółek - jak je czytać',
		'IPO i debiuty giełdowe - ryzyka i szanse',
		'dywidendy i buybacki - wpływ na kurs akcji',
		'sektorowe rotacje kapitału na giełdzie',
		'rynki wschodzące vs rozwinięte',
		'geopolityka a rynki finansowe',
		'carry trade - strategia na różnicach stóp',
		'hedging - zabezpieczanie pozycji',
		'korelacje między aktywami',
	];

	if (newsContext) {
		const contextLower = newsContext.toLowerCase();
		const assetKeywords: Record<string, string[]> = {
			złoto: ['złoto', 'gold', 'xau'],
			ropa: ['ropa', 'oil', 'wti', 'brent'],
			eurusd: ['eurusd', 'euro', 'dolar'],
			nasdaq: ['nasdaq', 'nas100', 'tech'],
			sp500: ['sp500', 's&p', 's&p 500'],
			dax: ['dax', 'dax40', 'niemcy'],
			btc: ['bitcoin', 'btc', 'krypto'],
		};

		for (const [asset, keywords] of Object.entries(assetKeywords)) {
			if (keywords.some((k) => contextLower.includes(k))) {
				const assetTopics = allTopics.filter((t) => t.toLowerCase().includes(asset));
				if (assetTopics.length > 0) {
					const selected = assetTopics[Math.floor(Math.random() * assetTopics.length)];
					if (!recentTopics.some((rt) => selected.toLowerCase().includes(rt))) {
						return selected;
					}
				}
			}
		}

		if (contextLower.includes('nfp') || contextLower.includes('bezrobocie')) {
			const topic = 'NFP (Non-Farm Payrolls) - co to jest i jak wpływa';
			if (!recentTopics.some((rt) => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('inflacja') || contextLower.includes('cpi')) {
			const topic = 'CPI (Consumer Price Index) - interpretacja danych';
			if (!recentTopics.some((rt) => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('stop') && contextLower.includes('procent')) {
			const topic = 'stopy procentowe i ich wpływ na rynki';
			if (!recentTopics.some((rt) => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('fuzj') || contextLower.includes('przeję')) {
			const topic = 'fuzje i przejęcia (M&A) - jak wpływają na wyceny';
			if (!recentTopics.some((rt) => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('wyniki') || contextLower.includes('earnings')) {
			const topic = 'wyniki kwartalne spółek - jak je czytać';
			if (!recentTopics.some((rt) => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('ipo') || contextLower.includes('debiut')) {
			const topic = 'IPO i debiuty giełdowe - ryzyka i szanse';
			if (!recentTopics.some((rt) => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('dywidend') || contextLower.includes('buyback')) {
			const topic = 'dywidendy i buybacki - wpływ na kurs akcji';
			if (!recentTopics.some((rt) => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
	}

	const availableTopics = allTopics.filter((topic) => {
		const topicLower = topic.toLowerCase();
		return !recentTopics.some((rt) => topicLower.includes(rt) || rt.includes(topicLower));
	});

	const topicsToChooseFrom = availableTopics.length > 0 ? availableTopics : allTopics;
	return topicsToChooseFrom[Math.floor(Math.random() * topicsToChooseFrom.length)];
}

/** Losowy artykuł (np. stary POST bez JSON) — ten sam prompt co „z tematu”. */
export async function generateLegacyRandomEditorialArticle(
	apiKey: string,
	newsHeadlinesContext?: string
): Promise<EditorialArticleResult> {
	const recentTopics = await getRecentArticleTopics(10);
	const selectedTopic = selectRandomTopic(recentTopics, newsHeadlinesContext);
	const input: EditorialArticleOpenAIInput = {
		sourceType: 'manual_topic',
		title: selectedTopic,
		context: newsHeadlinesContext
			? `Skrót tytułów z ostatnich wiadomości (orientacja tematyczna, bez traktowania jako faktów): ${newsHeadlinesContext}`
			: undefined,
	};
	return generateEditorialArticleWithOpenAI(apiKey, input);
}
