/**
 * Grupowanie artykułów feedu po lokalnej dacie kalendarzowej (YYYY-MM-DD z API / normalizacji).
 * Brak poprawnej daty → traktujemy jak „wcześniej”.
 */

export type FeedDayBucket = 'today' | 'yesterday' | 'earlier';

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

function startOfLocalDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Porównuje pole `date` (YYYY-MM-DD) z dziś / wczoraj w strefie lokalnej przeglądarki.
 */
export function feedItemDayBucket(dateStr: string, now: Date = new Date()): FeedDayBucket {
	const s = (dateStr || '').trim();
	if (!YMD_RE.test(s)) return 'earlier';
	const [year, month, day] = s.split('-').map(Number);
	const articleDay = new Date(year, month - 1, day);
	if (Number.isNaN(articleDay.getTime())) return 'earlier';

	const today0 = startOfLocalDay(now);
	const yesterday0 = new Date(today0);
	yesterday0.setDate(yesterday0.getDate() - 1);

	const ad = startOfLocalDay(articleDay);
	const t = today0.getTime();
	const yMs = yesterday0.getTime();
	const a = ad.getTime();

	if (a === t) return 'today';
	if (a === yMs) return 'yesterday';
	return 'earlier';
}

export function partitionFeedItemsByLocalDay<T extends { date: string }>(
	items: T[],
	now: Date = new Date(),
): { today: T[]; yesterday: T[]; earlier: T[] } {
	const today: T[] = [];
	const yesterday: T[] = [];
	const earlier: T[] = [];
	for (const item of items) {
		const b = feedItemDayBucket(item.date, now);
		if (b === 'today') today.push(item);
		else if (b === 'yesterday') yesterday.push(item);
		else earlier.push(item);
	}
	return { today, yesterday, earlier };
}
