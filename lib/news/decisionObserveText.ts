import type { NewsItemEnriched } from '@/lib/news/types';

function normalizeOneLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function truncateEllipsis(s: string, max: number): string {
  const t = normalizeOneLine(s);
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/** Prefer whyItMatters, then condensed instrument impacts, then summary. */
export function buildDecisionObserveSource(item: NewsItemEnriched): string {
  if (item.whyItMatters && item.whyItMatters.trim()) {
    return normalizeOneLine(item.whyItMatters);
  }
  const fromImpacts = (item.impacts || [])
    .map((i) => i.effect)
    .filter(Boolean)
    .join(' ');
  if (fromImpacts.trim()) return normalizeOneLine(fromImpacts);
  if (item.summaryShort && item.summaryShort.trim()) {
    return normalizeOneLine(item.summaryShort);
  }
  return '';
}

export function buildDecisionObservePreview(item: NewsItemEnriched, max = 100): string {
  const src = buildDecisionObserveSource(item);
  if (!src) return '—';
  return truncateEllipsis(src, max);
}

/** Longer text for expanded row (no hard cap). */
export function buildDecisionObserveExpanded(item: NewsItemEnriched): string {
  if (item.whyItMatters && item.whyItMatters.trim()) {
    return normalizeOneLine(item.whyItMatters);
  }
  const fromImpacts = (item.impacts || [])
    .map((i) => i.effect)
    .filter(Boolean)
    .join(' ');
  if (fromImpacts.trim()) return normalizeOneLine(fromImpacts);
  if (item.summaryShort && item.summaryShort.trim()) {
    return normalizeOneLine(item.summaryShort);
  }
  return '';
}
