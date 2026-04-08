import type { NewsItemEnriched } from '@/lib/news/types';

function clampImpact(v: unknown): number {
  return Math.max(1, Math.min(5, Number(v || 1)));
}

/** Impact ↓, tie-breaker timeEdge ↓, then publishedAt (świeższe pierwsze). */
export function sortNewsByDecisionPriority(items: NewsItemEnriched[]): NewsItemEnriched[] {
  return [...items].sort((a, b) => {
    const ib = clampImpact(b.impact);
    const ia = clampImpact(a.impact);
    if (ib !== ia) return ib - ia;
    const tb = Number(b.timeEdge || 0);
    const ta = Number(a.timeEdge || 0);
    if (tb !== ta) return tb - ta;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}
