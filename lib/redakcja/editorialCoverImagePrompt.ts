/**
 * Jeden system promptów okładek Redakcji (DALL·E): fotorealistyczna scena dopasowana do kategorii,
 * styl zbliżony do zdjęć redakcyjnych (FT / Bloomberg), bez ikon i „stock AI illustration”.
 */

export type EditorialCoverImageCategory = 'forex' | 'giełda' | 'surowce' | 'makro' | 'wiadomości';

/**
 * Wąska scena tematyczna — wygrywa nad ogólnym bucketem kategorii, gdy tekst zawiera mocne słowa kluczowe.
 * Kolejność w `resolveEditorialCoverPreciseSceneKey` = priorytet (pierwsze trafienie).
 */
export type EditorialCoverPreciseSceneKey =
	| 'geopolitics_logistics'
	| 'precious_metals'
	| 'central_bank'
	| 'ai_big_tech'
	| 'asset_management'
	| 'forex_usd'
	| 'equities'
	| 'commodities_broad'
	| 'macro_general';

/** Wejście do budowy promptu obrazu — używaj wszędzie zamiast ręcznego składania stringów. */
export type EditorialImagePromptParams = {
	title: string;
	/** Jeśli podane (np. z News Command Center), nadpisuje heurystykę z tekstu. */
	category?: EditorialCoverImageCategory | null;
	/** Streszczenie / kontekst wydarzenia — polepsza dopasowanie sceny (nie renderować jako tekst). */
	summary?: string | null;
	tags?: string[];
	variant?: 'primary' | 'safe';
};

const CATEGORY_SCENE: Record<EditorialCoverImageCategory, string> = {
	forex:
		'Scene: a REAL place where FX is traded — institutional dealing room or bank treasury with physical desks and chairs, multiple monitors showing only blurred light (no legible numbers). People in business dress seen from behind; glass partitions; or a rain-wet financial district street at dusk with anonymous commuters. The shot must feel like on-location press photography, not a concept render.',
	giełda:
		'Scene: a REAL equities environment — exchange trading floor or modern broker floor with depth, cables, chairs, and large wall screens as soft bokeh (no readable tickers). Or documentary-style Wall Street / City of London canyon: stone buildings, traffic, overcast natural light. Backs of heads and motion blur only; no hero poses.',
	surowce:
		'Scene: PHYSICAL commodity infrastructure you could visit with a camera — refinery lights at night, tanker at a commercial pier, open-pit mine, bulk terminal, pipeline ROW in real landscape. Wide-angle documentary; grit, weather, scale. No stylized “commodity icons”.',
	makro:
		'Scene: macro / policy in the REAL world — central bank press room with empty podium and plain flags (no seals or text), neoclassical bank façade at street level, or ministry corridor with natural window light. Institutional, quiet tension; no crowd stock-photo clichés.',
	wiadomości:
		'Scene: only if the topic does not imply a more specific place — otherwise prefer hints below. Generic fallback: golden-hour skyline with real atmospheric haze, sidewalk crowd from behind, or distant newsroom floor. Still photojournalism, not a poster.',
};

/** Dokładna scena + negatywy tematyczne (doklejane tylko przy danym kluczu). */
const PRECISE_SCENE_BLOCK: Record<
	EditorialCoverPreciseSceneKey,
	{ scene: string; negatives?: string }
> = {
	geopolitics_logistics: {
		scene:
			'PRIMARY SCENE (geopolitics / aviation / logistics): ONE specific real location tied to the headline — commercial airport apron or terminal concourse from a distance (no airline logos), parked or taxiing aircraft as environment only, FIDS boards as illegible blur, intermodal rail yard, container seaport at dawn or dusk, highway freight corridor, humanitarian logistics warehouse exterior. Physical infrastructure, weather, scale of movement.',
		negatives:
			'NEGATIVE for this topic: no abstract “global economy”, no generic skyscraper skyline as the hero subject, no map infographics, no combat or identifiable military/victims.',
	},
	precious_metals: {
		scene:
			'PRIMARY SCENE (gold / silver / precious metals): tangible metal markets — secure bullion vault corridor with stacked bars (no serial numbers, no text), precious-metals wholesale dealing desk with scales and trays (blurred), jewelry district shop windows as bokeh, small refinery or assay office detail, or regulated commodity exchange pit / ring where metals are traded (environment only, no readable boards). Documentary precious-metals trading context, not “finance interior”.',
		negatives:
			'NEGATIVE for this topic: do NOT use generic marble banking lobby, generic corporate atrium, or anonymous “economy / finance interior” unless the article is explicitly about a named institution’s building. Do NOT use city skyline as the main subject. Do NOT default to oil/refinery unless the text is about energy — here the metal is the story.',
	},
	central_bank: {
		scene:
			'PRIMARY SCENE (central bank / monetary policy): institutional policy setting — central bank press briefing room with empty podium and plain flags (no seals or readable text), wood-paneled policy chamber from the back rows, marble central-bank façade at street level in overcast light, or long quiet corridor with institutional molding and window light. Tension of a policy venue, not a retail bank branch.',
		negatives:
			'NEGATIVE for this topic: avoid generic trading-floor hero shots unless the piece explicitly ties to market reaction on a dealing desk; avoid generic skyline; avoid shopping-mall or branch banking aesthetics.',
	},
	ai_big_tech: {
		scene:
			'PRIMARY SCENE (AI / Big Tech / semiconductors): real tech economy — semiconductor cleanroom or fab corridor through glass (no logos), server datacenter aisle with cable trays and cold lighting, research campus exterior at dusk, GPU/AI hardware lab bench (equipment blurred), or Big Tech-style glass HQ base with anonymous workers entering (no logos, no brand marks).',
		negatives:
			'NEGATIVE for this topic: no floating holographic brains, no sci-fi cyborg illustration, no neon “AI” typography, no stock “robot hand” clichés; keep press-photo realism.',
	},
	asset_management: {
		scene:
			'PRIMARY SCENE (asset management / private credit / PE): anonymous glass tower headquarters lobby with depth and reflections, private credit / fund office floor with meeting rooms (silhouettes), understated boardroom with city view (no logos on screen), or financial district entrance with revolving doors — institutional scale without naming any firm.',
		negatives:
			'NEGATIVE for this topic: no logos, no branded signage, no portrait of executives; avoid generic marble banking hall unless clearly a fund/HQ setting with glass and depth.',
	},
	forex_usd: {
		scene:
			'PRIMARY SCENE (FX / USD / currencies): where FX actually trades — institutional FX dealing room or treasury desk with multiple monitors (blurred light only), cross-currency dealing pit vibe with cables and chairs, or policy-era corridor next to dealing (central-bank adjacency) with natural light. Physical FX environment, not an icon of a dollar.',
		negatives:
			'NEGATIVE for this topic: avoid generic banking hall as the default; avoid generic city skyline hero; avoid giant floating dollar symbols or chart overlays; prioritize real dealing desks, currency boards as bokeh, or wet-street financial district with commuters from behind.',
	},
	equities: {
		scene:
			'PRIMARY SCENE (indices / equities): modern stock exchange floor or broker dealing room with rows of workstations, large wall of screens as abstract motion blur, or Wall Street / City canyon documentary — stone facades, traffic, overcast. Traders from behind only.',
	},
	commodities_broad: {
		scene:
			'PRIMARY SCENE (commodities, non-precious): industrial realism — refinery at night, crude tanker at pier, open-pit mine, grain elevator, LNG terminal, pipeline ROW. Wide documentary framing, weather and grit.',
	},
	macro_general: {
		scene:
			'PRIMARY SCENE (macro data / economy-wide, no explicit CB headline): government statistics office hallway, ministry briefing backdrop (empty), or trading floor reaction as secondary environment — still photorealistic, still no readable data on screens.',
		negatives:
			'NEGATIVE: avoid pure skyline stock shot; anchor to a real institutional or market-operations place.',
	},
};

const GLOBAL_STYLE = [
	'Must be a single photorealistic EDITORIAL NEWS PHOTOGRAPH (on-location documentary feel, Reuters / FT / Bloomberg Pictures).',
	'Natural or cinematic financial-news lighting: mixed office practicals, overcast daylight, sodium streetlights, or soft bounce — never flat “AI stock” lighting.',
	'The frame must illustrate ONE concrete real-world situation suggested by the topic and summary — a specific type of place, weather, and activity. Avoid generic “the economy” as an abstract theme.',
	'ABSOLUTELY NO: icons, pictograms, clipart, cartoons, 3D renders, CGI poster look, infographic layout, floating or overlaid charts, pie charts, percentage callouts, glowing trend lines, holographic tickers.',
	'NO abstract financial symbols (arrows, coins, piggy banks, dollar signs) unless they are ordinary physical objects naturally in the scene (e.g. real cash in a tray at a distance, blurred).',
	'NEGATIVE / AVOID: generic economy illustration; chart overlays on photos; infographic composition; symbolic “finance poster” aesthetics; collage; surreal metaphors; isometric diagrams.',
	'No text, no logos, no watermarks, no brand names, no readable headlines or app UI.',
	'Do NOT depict recognizable real people or identifiable faces; backs of heads, silhouettes, shallow depth of field, or empty environments only.',
].join(' ');

function normalizeHaystack(tags: string[], textForHeuristics: string): string {
	const parts = [textForHeuristics, ...tags].map((s) => s.toLowerCase());
	return parts.join(' ');
}

/** Jawne tagi redakcyjne — mają pierwszeństwo przed heurystyką z tekstu. */
function resolveCategoryFromExplicitTags(tags: string[]): EditorialCoverImageCategory | null {
	const set = new Set(tags.map((t) => t.toLowerCase().trim()).filter(Boolean));
	const ordered: EditorialCoverImageCategory[] = ['forex', 'giełda', 'surowce', 'makro', 'wiadomości'];
	const aliases: Record<EditorialCoverImageCategory, string[]> = {
		forex: ['forex'],
		giełda: ['giełda', 'gielda'],
		surowce: ['surowce'],
		makro: ['makro'],
		wiadomości: ['wiadomości', 'wiadomosci'],
	};
	for (const cat of ordered) {
		for (const a of aliases[cat]) {
			if (set.has(a)) return cat;
		}
	}
	return null;
}

/**
 * Mapowanie kategorii z News Command Center (`NewsCategory`) → scena okładki.
 */
export function mapNewsCategoryToEditorialImageCategory(raw: string): EditorialCoverImageCategory | null {
	const c = raw.trim().toLowerCase();
	const table: Record<string, EditorialCoverImageCategory> = {
		fx: 'forex',
		indeksy: 'giełda',
		surowce: 'surowce',
		makro: 'makro',
		'spółki': 'giełda',
		spolki: 'giełda',
		geo: 'wiadomości',
		inne: 'wiadomości',
	};
	return table[c] ?? null;
}

const RE_GEOPOLITICS_TRANSPORT =
	/\b(wojn|wojna|wojsk|nato|ukrain|geopolit|konflikt|sanction|embargo|bliski\s*wsch|bliskim\s+wsch|middle\s+east|gaza|iran|irak|syria|liban|izrael|jemen|ormuz|hormuz|czerwone\s+morze|red\s+sea|lotnictw|lini[eą]\s+lotnicz|linie\s+lotnicze|airline|airlines|airport|lotnisk|runway|płyta|samolot|avia|cargo\s+plane|flight\s+cancell|odwołan\w+\s+lot|logistyk|transport|łańcuch\s+dostaw|supply\s+chain|kontener|port\s+morsz|container\s+terminal|kolej\s+towarow|rail\s+yard|konwoj|humanitarian\s+aid)\b/i;

const RE_PRECIOUS_METALS =
	/(złot|złota|złote|gold|xau|xauusd|xag|srebr|silver|platyn|pallad|sztabk|sztabki|kruszec|kruszcu|bullion|lombard|metale\s+szlachet|precious\s+metal|metal\s+szlachet)/i;

const RE_CENTRAL_BANK_MONETARY =
	/\b(bank\s*centraln|central\s+bank|narodowy\s+bank|rpp\b|ecb\b|boj\b|boe\b|fomc|posiedzeni\w+\s+(rpp|monetary|fed|ecb)|decyzj\w+\s+(rpp|o\s+stop|o\s+stopy|fed|ecb)|konferencj\w+.*\b(stop|stóp|rpp|fed|ecb)|stopy\s+procentow|polityka\s+monetarna|monetary\s+policy|interest\s+rate\s+decision)\b/i;

const RE_AI_BIG_TECH =
	/\b(sztuczn\w+\s+inteligenc|\bai\b|machine\s+learning|deep\s+learning|nvidia|openai|anthropic|big\s+tech|magnificent\s+seven|półprzewodnik|polprzewodnik|semiconductor|chip\s+fabric|fab\s+floor|llm\b|gpt\b|generatywn\w+|cloud\s+comput|datacenter|data\s+center)\b|microsoft|google|alphabet|meta\s+platforms|apple\b|tesla\b/i;

const RE_ASSET_MANAGEMENT =
	/\b(private\s+equity|private\s+credit|asset\s+management|zarządzan\w+\s+aktyw|zarzadzanie\s+aktywami|fundusz\s+kredytow|kredytow\w+\s+fundusz|blackstone|kkr\b|carlyle|apollo\s+global|lbo\b|buyout)\b/i;

const RE_FOREX_USD =
	/\b(usd\b|eur\/usd|usd\/jpy|gbp\/usd|dolar\w*|walut\w*|forex|fx\b|rynek\s+walut|currency\s+market|carry\s+trade)\b/i;

const RE_EQUITIES =
	/\b(giełd|gielda|nasdaq|nyse|indeks|s\s*&\s*p|sp500|sp\s*500|akcj|akcje|stock\s+market|equity\s+market|ipo|dividend)\b/i;

const RE_COMMODITIES_BROAD =
	/\b(surowc\w*|ropa|brent|wti|lng|gaz ziemny|miedź|miedz|copper|oil\s+price|kopaln|tankowiec|rafiner|rafineri|pipeline|commodit)\b/i;

const RE_MACRO_GENERAL =
	/\b(inflac|cpi|ppi|pkb|gdp|bezroboc|unemployment|recession|stagflac)\b/i;

/**
 * Wybór „twardej” sceny redakcyjnej — pierwsze dopasowanie wygrywa (nadpisuje szeroki bucket).
 */
export function resolveEditorialCoverPreciseSceneKey(
	tags: string[],
	textForHeuristics: string
): EditorialCoverPreciseSceneKey | null {
	const h = normalizeHaystack(tags, textForHeuristics);

	if (RE_GEOPOLITICS_TRANSPORT.test(h)) return 'geopolitics_logistics';
	if (RE_PRECIOUS_METALS.test(h)) return 'precious_metals';
	if (RE_CENTRAL_BANK_MONETARY.test(h)) return 'central_bank';
	if (RE_AI_BIG_TECH.test(h)) return 'ai_big_tech';
	if (RE_ASSET_MANAGEMENT.test(h)) return 'asset_management';
	if (RE_FOREX_USD.test(h)) return 'forex_usd';
	if (RE_EQUITIES.test(h)) return 'equities';
	if (RE_COMMODITIES_BROAD.test(h)) return 'commodities_broad';
	if (RE_MACRO_GENERAL.test(h)) return 'macro_general';

	return null;
}

function formatPreciseSceneBlock(key: EditorialCoverPreciseSceneKey): string {
	const b = PRECISE_SCENE_BLOCK[key];
	const parts = [b.scene];
	if (b.negatives) parts.push(b.negatives);
	return parts.join(' ');
}

/** Jawny tag „wiadomości” nie blokuje mocnych sygnałów z tytułu / streszczenia (kategoria + fallback mediów). */
const WEAK_EXPLICIT_COVER_CATEGORY = new Set<EditorialCoverImageCategory>(['wiadomości']);

/**
 * Wybór kategorii okładki (m.in. dopasowanie fallbacków mediów): ta sama hierarchia priorytetów co scena precyzyjna.
 */
export function resolveEditorialCoverImageCategory(tags: string[], textForHeuristics: string): EditorialCoverImageCategory {
	const fromTags = resolveCategoryFromExplicitTags(tags);
	const strongExplicit = fromTags && !WEAK_EXPLICIT_COVER_CATEGORY.has(fromTags) ? fromTags : null;
	if (strongExplicit) return strongExplicit;

	const h = normalizeHaystack(tags, textForHeuristics);

	if (RE_GEOPOLITICS_TRANSPORT.test(h)) return 'wiadomości';
	if (RE_PRECIOUS_METALS.test(h)) return 'surowce';
	if (RE_CENTRAL_BANK_MONETARY.test(h)) return 'makro';
	if (RE_AI_BIG_TECH.test(h)) return 'wiadomości';
	if (RE_ASSET_MANAGEMENT.test(h)) return 'giełda';
	if (RE_FOREX_USD.test(h)) return 'forex';
	if (RE_EQUITIES.test(h)) return 'giełda';
	if (RE_COMMODITIES_BROAD.test(h)) return 'surowce';
	if (RE_MACRO_GENERAL.test(h)) return 'makro';

	return fromTags ?? 'wiadomości';
}

/**
 * Konflikt / geopolityka / transport — zachowane dla kompatybilności; treść jest w PRECISE_SCENE_BLOCK.
 */
export function editorialCoverGeopoliticsLogisticsSceneHint(tags: string[], textForHeuristics: string): string | null {
	const h = normalizeHaystack(tags, textForHeuristics);
	if (!RE_GEOPOLITICS_TRANSPORT.test(h)) return null;
	return formatPreciseSceneBlock('geopolitics_logistics');
}

/** @deprecated Sceny precyzyjne: `resolveEditorialCoverPreciseSceneKey` + `buildEditorialImagePrompt`. */
export function editorialCoverFinanceInstitutionsSceneHint(_tags: string[], _textForHeuristics: string): string | null {
	return null;
}

/** @deprecated Użyj `editorialCoverGeopoliticsLogisticsSceneHint`. */
export function editorialCoverWarGeopoliticsSceneHint(tags: string[], textForHeuristics: string): string | null {
	return editorialCoverGeopoliticsLogisticsSceneHint(tags, textForHeuristics);
}

export function sanitizeTitleForImagePrompt(title: string): string {
	let t = title;
	const replacements: Array<[RegExp, string]> = [
		[/\bDonald\s+Trump\b/gi, 'a US political figure'],
		[/\bJoe\s+Biden\b/gi, 'a US political figure'],
		[/\bVladimir\s+Putin\b/gi, 'a world leader'],
		[/\bVolodymyr\s+Zelensky\b/gi, 'a world leader'],
	];
	for (const [re, rep] of replacements) t = t.replace(re, rep);
	if (/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\b/.test(t)) {
		t = t.replace(/\b([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\b/g, '$1 (public figure)');
	}
	return t.trim();
}

/**
 * Jedyny punkt składania promptu obrazu dla Redakcji — używany przez persist, generate-cover i ewentualne narzędzia.
 */
export function buildEditorialImagePrompt(params: EditorialImagePromptParams): string {
	const tags = params.tags ?? [];
	const variant = params.variant ?? 'primary';
	const summary = (params.summary || '').trim();
	const subject = variant === 'safe' ? sanitizeTitleForImagePrompt(params.title) : params.title;

	const textForHeuristics = [params.title, summary, ...tags].filter(Boolean).join(' ');
	const category = params.category ?? resolveEditorialCoverImageCategory(tags, textForHeuristics);
	const preciseKey = resolveEditorialCoverPreciseSceneKey(tags, textForHeuristics);

	const sceneBucketLine = `Reference category bucket (${category}, for loose context only): ${CATEGORY_SCENE[category]}`;

	let primarySceneLine: string;
	if (preciseKey) {
		primarySceneLine = `Primary scene (${preciseKey.replace(/_/g, ' ')}): ${formatPreciseSceneBlock(preciseKey)}`;
	} else {
		primarySceneLine = `Primary scene (category ${category}): ${CATEGORY_SCENE[category]}`;
	}

	const geoHint =
		preciseKey && preciseKey !== 'geopolitics_logistics'
			? null
			: !preciseKey
				? editorialCoverGeopoliticsLogisticsSceneHint(tags, textForHeuristics)
				: null;

	const financeHint = null;

	const tagStr = tags
		.map((t) => t.trim())
		.filter(Boolean)
		.slice(0, 3)
		.join(', ');

	const summaryLine =
		summary.length > 0
			? `Story context for mood and location only (do not render as text, do not quote): ${summary.slice(0, 500)}`
			: null;

	const parts = [
		'Create a single photorealistic editorial news photograph (not a drawing, not CGI, not a poster) suitable as a magazine cover.',
		`Article topic (mood only — do not render as text): "${subject}".`,
		tagStr ? `Editorial tags: ${tagStr}.` : null,
		summaryLine,
		primarySceneLine,
		preciseKey ? sceneBucketLine : null,
		geoHint,
		financeHint,
		GLOBAL_STYLE,
	].filter(Boolean);

	return parts.join(' ');
}

/** @deprecated Prefer `buildEditorialImagePrompt` — cienka kompatybilność wsteczna (tylko tytuł + tagi). */
export function buildEditorialCoverImagePrompt(title: string, tags: string[], variant: 'primary' | 'safe'): string {
	return buildEditorialImagePrompt({ title, tags, variant });
}
