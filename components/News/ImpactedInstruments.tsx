'use client';
import React, { useMemo } from 'react';
import type { NewsItemEnriched, InstrumentScore } from '@/lib/news/types';
import { formatInstrument } from '@/lib/news/labels';

type Props = {
  items: NewsItemEnriched[];
};

export default function ImpactedInstruments({ items }: Props) {
  const top = useMemo<InstrumentScore[]>(() => {
    const score = new Map<string, number>();
    for (const it of items) {
      const edge = Number(it.timeEdge || 0);
      for (const s of it.instruments || []) {
        score.set(s, (score.get(s) || 0) + edge);
      }
    }
    return Array.from(score.entries())
      .map(([symbol, s]) => ({ symbol, score: Math.round(s * 10) / 10 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [items]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
      <div className="text-sm font-semibold">Najbardziej dotknięte instrumenty</div>
      <div className="mt-3 space-y-2">
        {top.map((t) => (
          <div key={t.symbol} className="flex items-center gap-3">
            <div className="w-32 text-xs text-white/80">{formatInstrument(t.symbol)}</div>
            <div className="h-6 flex-1 rounded bg-black/30 relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-emerald-500/40" style={{ width: `${Math.min(100, t.score * 6)}%` }} />
            </div>
            <div className="w-28 text-right text-[11px] text-white/60">suma wpływu {t.score.toFixed(1)}</div>
          </div>
        ))}
        {top.length === 0 && <div className="text-sm text-white/60">Brak danych w tym oknie.</div>}
      </div>
    </div>
  );
}


