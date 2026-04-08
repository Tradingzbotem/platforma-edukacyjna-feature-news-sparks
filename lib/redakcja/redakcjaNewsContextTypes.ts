/** DTO opcjonalnego kontekstu Redakcji w odpowiedzi `/api/decision-block` (Decision Center). */
export type RedakcjaNewsContextDto = {
	articleSlug: string;
	/** Tytuł artykułu w Redakcji (nagłówek publikacji). */
	articleTitle: string;
	/** Tytuł doniesienia z sekcji „Dane wydarzenia” w appendixie. */
	eventTitle: string;
	impactSentence: string | null;
	sentiment: string | null;
	impact: string | number | null;
	timeEdge: string | number | null;
	/** Klasa dopasowania scoringu v1 (UI: Bezpośrednio / Makro / Tło rynkowe). */
	matchKind: 'direct' | 'macro' | 'backdrop';
};
