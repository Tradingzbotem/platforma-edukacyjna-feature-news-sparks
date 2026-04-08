import { NEWS_FACTS_MARKER_END, NEWS_FACTS_MARKER_START } from '@/lib/redakcja/newsFactsMarkers';

export type SplitNewsFactsResult = {
	body: string;
	factsMarkdown: string | null;
};

/**
 * Wycina appendix oznaczony markerami. Brak obu markerów → całość w body, factsMarkdown = null.
 */
export function splitNewsFactsAppendix(content: string): SplitNewsFactsResult {
	const start = content.indexOf(NEWS_FACTS_MARKER_START);
	const end = content.indexOf(NEWS_FACTS_MARKER_END);
	if (start === -1 || end === -1 || end <= start) {
		return { body: content, factsMarkdown: null };
	}

	const before = content.slice(0, start).trimEnd();
	const after = content.slice(end + NEWS_FACTS_MARKER_END.length).trimStart();
	const body = after ? `${before}\n\n${after}` : before;

	const inner = content.slice(start + NEWS_FACTS_MARKER_START.length, end).trim();
	return {
		body,
		factsMarkdown: inner.length > 0 ? inner : null,
	};
}
