import type { NewsItemEnriched, Sentiment } from '@/lib/news/types';

export type DirectionLabel = 'Wzrostowy' | 'Spadkowy' | 'Neutralny';

export function sentimentToDirectionLabel(s: Sentiment | undefined): DirectionLabel {
  if (s === 'positive') return 'Wzrostowy';
  if (s === 'negative') return 'Spadkowy';
  return 'Neutralny';
}

export function directionBadgeClass(s: NewsItemEnriched['sentiment']): string {
  switch (s) {
    case 'positive':
      return 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300';
    case 'negative':
      return 'border-rose-400/35 bg-rose-500/15 text-rose-300';
    default:
      return 'border-white/15 bg-white/10 text-white/70';
  }
}
