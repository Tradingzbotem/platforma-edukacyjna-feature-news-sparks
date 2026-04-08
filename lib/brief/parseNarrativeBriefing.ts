import type {
	NarrativeBriefBulletBlock,
	NarrativeBriefEventPriorityFilter,
	NarrativeBriefEventShift,
	NarrativeBriefForwardConditional,
	NarrativeBriefForwardRealities,
	NarrativeBriefGlossaryEntry,
	NarrativeBriefMarketContext,
	NarrativeBriefMarketMechanics,
	NarrativeBriefPriorityTier,
	NarrativeBriefRankedEvent,
	NarrativeBriefResponse,
	NarrativeBriefScenario,
	NarrativeBriefUpdate,
} from '@/lib/brief/narrativeBriefingTypes';

const MIN_FORWARD_CONDITIONALS = 3;
const MIN_GLOSSARY = 3;
const TOP_EVENTS_COUNT = 3;

function parsePriorityTier(raw: unknown): NarrativeBriefPriorityTier | null {
	if (typeof raw !== 'string') return null;
	const t = raw.trim().toLowerCase();
	if (t === 'high' || t === 'medium') return t;
	return null;
}

function parseRankedEvent(row: unknown): NarrativeBriefRankedEvent | null {
	if (!row || typeof row !== 'object') return null;
	const o = row as Record<string, unknown>;
	const summary = typeof o.summary === 'string' ? o.summary.trim() : '';
	const rationale = typeof o.rationale === 'string' ? o.rationale.trim() : '';
	const channelsRaw =
		typeof o.channelsImpactOilIndicesFxVix === 'string'
			? o.channelsImpactOilIndicesFxVix.trim()
			: typeof o.channelsImpact === 'string'
				? o.channelsImpact.trim()
				: '';
	const tier = parsePriorityTier(o.priorityTier);
	if (!summary || !rationale || !channelsRaw || !tier) return null;
	return {
		summary,
		priorityTier: tier,
		channelsImpactOilIndicesFxVix: channelsRaw,
		rationale,
	};
}

function parseEventPriorityFilter(x: unknown): NarrativeBriefEventPriorityFilter | null {
	if (!x || typeof x !== 'object') return null;
	const o = x as Record<string, unknown>;
	const primaryDriver = typeof o.primaryDriver === 'string' ? o.primaryDriver.trim() : '';
	if (!primaryDriver) return null;
	const hasConcreteHeadlineEvent = o.hasConcreteHeadlineEvent === true;
	let headlineEventOneLiner =
		typeof o.headlineEventOneLiner === 'string' ? o.headlineEventOneLiner.trim() : '';
	if (!hasConcreteHeadlineEvent) {
		headlineEventOneLiner = '';
	} else if (!headlineEventOneLiner) {
		return null;
	}
	const raw = o.topThreeEvents;
	if (!Array.isArray(raw) || raw.length !== TOP_EVENTS_COUNT) return null;
	const topThreeEvents: NarrativeBriefRankedEvent[] = [];
	for (let i = 0; i < TOP_EVENTS_COUNT; i++) {
		const ev = parseRankedEvent(raw[i]);
		if (!ev) return null;
		topThreeEvents.push(ev);
	}
	return {
		topThreeEvents,
		primaryDriver,
		hasConcreteHeadlineEvent,
		headlineEventOneLiner,
	};
}

/** Odrzuca krótkie akapity będące wyłącznie komunikatem o braku danych (model mimo promptu). */
function isNoMarketDataOnlyParagraph(s: string): boolean {
	const t = s.trim();
	if (t.length > 280) return false;
	const exact = [
		/^brak\s+dostępnych\s+informacji\s+rynkowych\.?$/i,
		/^brak\s+dostepnych\s+informacji\s+rynkowych\.?$/i,
		/^brak\s+informacji\s+rynkowych\.?$/i,
		/^brak\s+danych\s+rynkowych\.?$/i,
		/^brak\s+danych\.?$/i,
		/^nie\s+ma\s+dostępnych\s+informacji\s+rynkowych\.?$/i,
		/^nie\s+ma\s+dostepnych\s+informacji\s+rynkowych\.?$/i,
		/^no\s+market\s+data\.?$/i,
		/^no\s+market\s+information\.?$/i,
		/^unavailable\s+market\s+data\.?$/i,
		/^prices?\s+unavailable\.?$/i,
		/^prices?\s+not\s+available\.?$/i,
	];
	return exact.some((re) => re.test(t));
}

function scrubTextFields(arr: string[]): string[] {
	return arr.map((s) => s.trim()).filter((s) => s.length > 0 && !isNoMarketDataOnlyParagraph(s));
}

function asTrimmedStrings(x: unknown): string[] {
	if (!Array.isArray(x)) return [];
	return x
		.filter((i): i is string => typeof i === 'string')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

function parseUpdate(row: unknown): NarrativeBriefUpdate | null {
	if (!row || typeof row !== 'object') return null;
	const o = row as Record<string, unknown>;
	const paragraphs = scrubTextFields(asTrimmedStrings(o.paragraphs));
	if (paragraphs.length === 0) return null;
	const dateLabel = typeof o.dateLabel === 'string' ? o.dateLabel.trim() : undefined;
	const title = typeof o.title === 'string' ? o.title.trim() : undefined;
	return {
		...(dateLabel ? { dateLabel } : {}),
		...(title ? { title } : {}),
		paragraphs,
	};
}

function parseBulletBlock(row: unknown): NarrativeBriefBulletBlock | null {
	if (!row || typeof row !== 'object') return null;
	const o = row as Record<string, unknown>;
	const title = typeof o.title === 'string' ? o.title.trim() : '';
	const bullets = scrubTextFields(asTrimmedStrings(o.bullets));
	if (!title || bullets.length === 0) return null;
	return { title, bullets };
}

function parseMarketContext(x: unknown): NarrativeBriefMarketContext | undefined {
	if (!x || typeof x !== 'object') return undefined;
	const o = x as Record<string, unknown>;
	const title = typeof o.title === 'string' ? o.title.trim() : '';
	const paragraphs = scrubTextFields(asTrimmedStrings(o.paragraphs));
	if (!title || paragraphs.length === 0) return undefined;
	const rawBlocks = o.bulletBlocks;
	const bulletBlocks: NarrativeBriefBulletBlock[] = [];
	if (Array.isArray(rawBlocks)) {
		for (const b of rawBlocks) {
			const block = parseBulletBlock(b);
			if (block) bulletBlocks.push(block);
		}
	}
	return {
		title,
		paragraphs,
		...(bulletBlocks.length ? { bulletBlocks } : {}),
	};
}

function parseMarketMechanics(x: unknown): NarrativeBriefMarketMechanics | undefined {
	if (!x || typeof x !== 'object') return undefined;
	const o = x as Record<string, unknown>;
	const title = typeof o.title === 'string' ? o.title.trim() : '';
	const paragraphs = scrubTextFields(asTrimmedStrings(o.paragraphs));
	if (!title || paragraphs.length === 0) return undefined;
	const rawBlocks = o.bulletBlocks;
	const bulletBlocks: NarrativeBriefBulletBlock[] = [];
	if (Array.isArray(rawBlocks)) {
		for (const b of rawBlocks) {
			const block = parseBulletBlock(b);
			if (block) bulletBlocks.push(block);
		}
	}
	return {
		title,
		paragraphs,
		...(bulletBlocks.length ? { bulletBlocks } : {}),
	};
}

function parseEventShift(x: unknown): NarrativeBriefEventShift | null {
	if (!x || typeof x !== 'object') return null;
	const o = x as Record<string, unknown>;
	const changeLast12to24h =
		typeof o.changeLast12to24h === 'string' ? o.changeLast12to24h.trim() : '';
	const dominantEvent = typeof o.dominantEvent === 'string' ? o.dominantEvent.trim() : '';
	const priorScenario = typeof o.priorScenario === 'string' ? o.priorScenario.trim() : '';
	const currentScenario = typeof o.currentScenario === 'string' ? o.currentScenario.trim() : '';
	const openingThreeSentences = scrubTextFields(asTrimmedStrings(o.openingThreeSentences));
	if (
		!changeLast12to24h ||
		!dominantEvent ||
		!priorScenario ||
		!currentScenario ||
		openingThreeSentences.length !== 3
	) {
		return null;
	}
	return {
		changeLast12to24h,
		dominantEvent,
		priorScenario,
		currentScenario,
		openingThreeSentences,
	};
}

function parseForwardConditional(row: unknown): NarrativeBriefForwardConditional | null {
	if (!row || typeof row !== 'object') return null;
	const o = row as Record<string, unknown>;
	const condIf = typeof o.if === 'string' ? o.if.trim() : '';
	const condThen = typeof o.then === 'string' ? o.then.trim() : '';
	if (!condIf || !condThen) return null;
	if (isNoMarketDataOnlyParagraph(condIf) || isNoMarketDataOnlyParagraph(condThen)) return null;
	return { if: condIf, then: condThen };
}

function parseForwardRealities(x: unknown): NarrativeBriefForwardRealities | null {
	if (!x || typeof x !== 'object') return null;
	const o = x as Record<string, unknown>;
	const title = typeof o.title === 'string' ? o.title.trim() : '';
	if (!title) return null;
	const raw = o.conditionals;
	const conditionals: NarrativeBriefForwardConditional[] = [];
	if (Array.isArray(raw)) {
		for (const c of raw) {
			const row = parseForwardConditional(c);
			if (row) conditionals.push(row);
		}
	}
	if (conditionals.length < MIN_FORWARD_CONDITIONALS) return null;
	return { title, conditionals };
}

function parseScenario(row: unknown): NarrativeBriefScenario | null {
	if (!row || typeof row !== 'object') return null;
	const o = row as Record<string, unknown>;
	const title = typeof o.title === 'string' ? o.title.trim() : '';
	if (!title) return null;
	const paragraphs = scrubTextFields(asTrimmedStrings(o.paragraphs));
	const bullets = scrubTextFields(asTrimmedStrings(o.bullets));
	if (paragraphs.length === 0 && bullets.length === 0) return null;
	return {
		title,
		...(paragraphs.length ? { paragraphs } : {}),
		...(bullets.length ? { bullets } : {}),
	};
}

function parseGlossaryEntry(row: unknown): NarrativeBriefGlossaryEntry | null {
	if (!row || typeof row !== 'object') return null;
	const o = row as Record<string, unknown>;
	const term = typeof o.term === 'string' ? o.term.trim() : '';
	const definition = typeof o.definition === 'string' ? o.definition.trim() : '';
	if (!term || !definition || isNoMarketDataOnlyParagraph(definition)) return null;
	return { term, definition };
}

/**
 * Normalizuje surowy JSON z modelu do NarrativeBriefResponse lub null, gdy brakuje pól wymaganych.
 */
export function parseNarrativeBriefingFromUnknown(raw: unknown): NarrativeBriefResponse | null {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
	const o = raw as Record<string, unknown>;
	const dateLabel = typeof o.dateLabel === 'string' ? o.dateLabel.trim() : '';
	const leadParagraphs = scrubTextFields(asTrimmedStrings(o.leadParagraphs));
	if (!dateLabel || leadParagraphs.length === 0) return null;

	const title = typeof o.title === 'string' ? o.title.trim() : undefined;

	const eventPriorityFilter = parseEventPriorityFilter(o.eventPriorityFilter);
	if (!eventPriorityFilter) return null;

	const eventShift = parseEventShift(o.eventShift);
	if (!eventShift) return null;

	const marketMechanics = parseMarketMechanics(o.marketMechanics);
	if (!marketMechanics) return null;

	const marketContext = parseMarketContext(o.marketContext);
	if (!marketContext) return null;

	const forwardRealities = parseForwardRealities(o.forwardRealities);
	if (!forwardRealities) return null;

	const updatesRaw = o.updates;
	const updates: NarrativeBriefUpdate[] = [];
	if (Array.isArray(updatesRaw)) {
		for (const u of updatesRaw) {
			const up = parseUpdate(u);
			if (up) updates.push(up);
		}
	}

	const scenariosRaw = o.scenarios;
	const scenarios: NarrativeBriefScenario[] = [];
	if (Array.isArray(scenariosRaw)) {
		for (const s of scenariosRaw) {
			const sc = parseScenario(s);
			if (sc) scenarios.push(sc);
		}
	}

	const glossaryRaw = o.glossary;
	const glossary: NarrativeBriefGlossaryEntry[] = [];
	if (Array.isArray(glossaryRaw)) {
		for (const g of glossaryRaw) {
			const ge = parseGlossaryEntry(g);
			if (ge) glossary.push(ge);
		}
	}

	if (glossary.length < MIN_GLOSSARY) return null;

	return {
		format: 'narrative',
		dateLabel,
		...(title ? { title } : {}),
		eventPriorityFilter,
		eventShift,
		leadParagraphs,
		marketMechanics,
		...(updates.length ? { updates } : {}),
		marketContext,
		forwardRealities,
		...(scenarios.length ? { scenarios } : {}),
		glossary,
	} satisfies NarrativeBriefResponse;
}
