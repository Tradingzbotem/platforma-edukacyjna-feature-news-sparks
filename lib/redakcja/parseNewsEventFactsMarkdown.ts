/**
 * Parser appendixu „Dane wydarzenia” (markdown między markerami news facts).
 * Współdzielony: UI Redakcji + serwer (Decision Center).
 */

export type ParsedNewsEventFacts = {
	title: string;
	source?: string;
	link?: string;
	category?: string;
	instruments: string[];
	sentiment?: string;
	impact?: string;
	timeEdge?: string;
	impacts: { symbol: string; direction?: string; effect: string }[];
	observations: string[];
};

export function parseNewsEventFactsMarkdown(md: string): ParsedNewsEventFacts | null {
	const lines = md.split(/\r?\n/);
	let section: 'dane' | 'wplyw' | 'obserwacja' | null = null;
	let sawDaneHeader = false;
	const out: ParsedNewsEventFacts = {
		title: '',
		instruments: [],
		impacts: [],
		observations: [],
	};

	for (const raw of lines) {
		const line = raw.trimEnd();
		const t = line.trim();
		if (!t) continue;
		if (t === '---') continue;

		if (t === '## Dane wydarzenia') {
			section = 'dane';
			sawDaneHeader = true;
			continue;
		}
		if (t === '## Szczegóły wpływu') {
			section = 'wplyw';
			continue;
		}
		if (t === '## Obserwacja') {
			section = 'obserwacja';
			continue;
		}
		if (t.startsWith('## ')) {
			section = null;
			continue;
		}

		if (section === 'dane' && t.startsWith('* ')) {
			const bullet = t.slice(2);
			const colon = bullet.indexOf(':');
			if (colon === -1) continue;
			const label = bullet.slice(0, colon).trim();
			const value = bullet.slice(colon + 1).trim();
			if (!value) continue;

			if (label === 'Tytuł') out.title = value;
			else if (label === 'Źródło') out.source = value;
			else if (label === 'Link') out.link = value;
			else if (label === 'Kategoria') out.category = value;
			else if (label === 'Instrumenty') {
				out.instruments = value
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean);
			} else if (label === 'Sentyment') out.sentiment = value;
			else if (label === 'Impact') out.impact = value;
			else if (label === 'TimeEdge') out.timeEdge = value;
			continue;
		}

		if (section === 'wplyw' && t.startsWith('* ')) {
			const rest = t.slice(2);
			const impactMatch = rest.match(/^\*\*([^*]+)\*\*\s*(?:\(([^)]+)\))?\s*:\s*(.*)$/);
			if (impactMatch) {
				out.impacts.push({
					symbol: impactMatch[1].trim(),
					direction: impactMatch[2]?.trim() || undefined,
					effect: (impactMatch[3] || '—').trim(),
				});
			}
			continue;
		}

		if (section === 'obserwacja' && t.startsWith('* ')) {
			out.observations.push(t.slice(2).trim());
		}
	}

	if (!sawDaneHeader || !out.title.trim()) {
		return null;
	}

	return out;
}
