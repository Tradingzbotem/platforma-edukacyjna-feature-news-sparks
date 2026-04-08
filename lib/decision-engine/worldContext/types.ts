// World Context Layer v1 — struktura wyjścia dla Decision Engine (deterministyczna, bez LLM).

export type WorldRiskLevel = 'low' | 'elevated' | 'high';

/** Syntetyczny kierunek nastroju z ważonych nagłówków (heurystyka). */
export type WorldDirectionalPressure = 'risk_on' | 'risk_off' | 'mixed' | 'neutral';

export type WorldEventMatchKind = 'instrument_tag' | 'keyword_geo' | 'keyword_energy' | 'keyword_cb' | 'category_geo';

export type WorldRelatedEventImpact = {
	symbol: string;
	direction?: string | null;
	effect: string;
};

export type WorldRelatedEvent = {
	id: string;
	title: string;
	category?: string;
	publishedAt: string;
	/** Świeżość w godzinach (od publikacji do zbudowania kontekstu). */
	ageHours: number;
	/** 0–100, do sortowania i progu ryzyka. */
	relevanceScore: number;
	sentiment?: 'positive' | 'neutral' | 'negative';
	matchKinds: WorldEventMatchKind[];
	impact?: number;
	timeEdge?: number;
	source?: string;
	/** Pola z `NewsItemEnriched` — do lekkiego boxa „Kontekst rynkowy” w Decision Center. */
	url?: string;
	whyItMatters?: string | null;
	summaryShort?: string | null;
	watch?: string[];
	impacts?: WorldRelatedEventImpact[];
};

export type WorldTakeawayEmphasis =
	| 'none'
	| 'caution_geopolitics'
	| 'caution_energy'
	| 'caution_policy'
	| 'broad_risk_off';

export type DecisionWorldContext = {
	schemaVersion: 1;
	/** Jawne źródło danych (audyt). */
	sources: { module: 'lib/news/store'; method: 'listNews' }[];
	windowHours: number;
	collectedAt: string;
	/** Krótka etykieta PL (np. dominująca kategoria lub temat słów kluczowych). */
	dominantTheme: string;
	worldRiskLevel: WorldRiskLevel;
	directionalPressure: WorldDirectionalPressure;
	/** Max 3 krótkie linie PL — streszczenie dla człowieka. */
	keyWorldBullets: string[];
	relatedEvents: WorldRelatedEvent[];
	/** Jak „świeży” jest najważniejszy powiązany nagłówek. */
	freshness: 'stale' | 'recent' | 'hot';
	/** Modyfikator copy / takeaway — bez zmiany reguł A/B/C. */
	takeawayModifier: {
		emphasis: WorldTakeawayEmphasis;
		/** Jedno zdanie PL do wplecenia w „Najważniejszy wniosek” (deterministyczne szablony). */
		leadSentence: string | null;
	};
	/** Gdy brak wzbogaconych newsów w oknie. */
	isEmpty: boolean;
};
