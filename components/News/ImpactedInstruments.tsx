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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h3 className="text-sm font-semibold">Najbardziej dotknięte instrumenty</h3>
      </div>
      <p className="text-xs text-white/50 mb-4">
        Suma wpływu wszystkich wiadomości na instrumenty w wybranym oknie czasowym
      </p>
      {top.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-sm text-white/60">Brak danych w tym oknie.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {top.map((t, idx) => {
            const maxScore = top[0]?.score || 1;
            const width = Math.min(100, (t.score / maxScore) * 100);
            return (
              <div key={t.symbol} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/90">{formatInstrument(t.symbol)}</span>
                    {idx === 0 && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold">
                        #1
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">{t.score.toFixed(1)}</span>
                </div>
                <div className="h-2 rounded-full bg-black/40 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


