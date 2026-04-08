/** Tryb wyjścia briefingu — structured = JSON modułowy (legacy), narrative = komentarz redakcyjny. */
export type BriefingFormat = 'structured' | 'narrative';

export type NarrativeBriefUpdate = {
	dateLabel?: string;
	title?: string;
	paragraphs: string[];
};

export type NarrativeBriefBulletBlock = {
	title: string;
	bullets: string[];
};

export type NarrativeBriefMarketContext = {
	title: string;
	paragraphs: string[];
	bulletBlocks?: NarrativeBriefBulletBlock[];
};

export type NarrativeBriefScenario = {
	title: string;
	paragraphs?: string[];
	bullets?: string[];
};

export type NarrativeBriefGlossaryEntry = {
	term: string;
	definition: string;
};

export type NarrativeBriefPriorityTier = 'high' | 'medium';

/** Jedna pozycja rankingu TOP 3 wydarzeń (12–24h). Kolejność tablicy = priorytet malejący. */
export type NarrativeBriefRankedEvent = {
	summary: string;
	priorityTier: NarrativeBriefPriorityTier;
	/** Zwięźle: jak czytać wpływ na ropę, indeksy, FX, VIX */
	channelsImpactOilIndicesFxVix: string;
	rationale: string;
};

/**
 * Warstwa filtra PRZED narracją: TOP 3 + jeden driver + opcjonalne „Najważniejsze wydarzenie”.
 */
export type NarrativeBriefEventPriorityFilter = {
	topThreeEvents: NarrativeBriefRankedEvent[];
	primaryDriver: string;
	/** True gdy wyłania się jeden konkretny event wysokiego priorytetu (np. deeskalacja, BC) — wtedy headline jest obowiązkowy. */
	hasConcreteHeadlineEvent: boolean;
	/** Jedno zdanie — treść pod etykietą „Najważniejsze wydarzenie”; puste gdy hasConcreteHeadlineEvent false. */
	headlineEventOneLiner: string;
};

/** Wykrycie zmiany narracji 12–24h + pierwsze trzy zdania w stylu desku. */
export type NarrativeBriefEventShift = {
	changeLast12to24h: string;
	dominantEvent: string;
	priorScenario: string;
	currentScenario: string;
	/** Dokładnie 3 zdania: [0] szablon pivotu A→B + event; [1] dlaczego ważne; [2] kontrast wcześniej vs teraz. */
	openingThreeSentences: string[];
};

/** Pozycjonowanie / flow / kto zamyka — „Mechanika rynku”. */
export type NarrativeBriefMarketMechanics = {
	title: string;
	paragraphs: string[];
	bulletBlocks?: NarrativeBriefBulletBlock[];
};

/** Warunkowe „co dalej” — tylko JEŚLI → TO, bez ogólników. */
export type NarrativeBriefForwardConditional = {
	if: string;
	then: string;
};

export type NarrativeBriefForwardRealities = {
	title: string;
	conditionals: NarrativeBriefForwardConditional[];
};

/** Odpowiedź JSON z modelu w trybie narracyjnym (discriminant: format). */
export type NarrativeBriefResponse = {
	format: 'narrative';
	dateLabel: string;
	title?: string;
	eventPriorityFilter: NarrativeBriefEventPriorityFilter;
	eventShift: NarrativeBriefEventShift;
	/** Dalsza rozmowa na desku po pivotcie — bez powielania openingThreeSentences. */
	leadParagraphs: string[];
	marketMechanics: NarrativeBriefMarketMechanics;
	updates?: NarrativeBriefUpdate[];
	marketContext: NarrativeBriefMarketContext;
	forwardRealities: NarrativeBriefForwardRealities;
	scenarios?: NarrativeBriefScenario[];
	glossary: NarrativeBriefGlossaryEntry[];
};
