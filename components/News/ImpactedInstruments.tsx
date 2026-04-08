'use client';
import React, { useMemo } from 'react';
import type { NewsItemEnriched, InstrumentScore } from '@/lib/news/types';
import { formatInstrument } from '@/lib/news/labels';

type Props = {
  items: NewsItemEnriched[];
  /** Pełna szerokość pod tabelą — mocniejszy wizualnie „briefing rynku”. */
  variant?: 'sidebar' | 'featured';
};

export default function ImpactedInstruments({ items, variant = 'sidebar' }: Props) {
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

  const isFeatured = variant === 'featured';

  return (
    <div
      className={
        isFeatured
          ? 'relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-slate-900/85 via-slate-950 to-slate-950 p-6 md:p-7 shadow-[0_0_44px_-12px_rgba(52,211,153,0.18)] ring-1 ring-emerald-500/15'
          : 'rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5'
      }
    >
      {isFeatured && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
          aria-hidden
        />
      )}
      <div className={`flex items-start gap-3 ${isFeatured ? 'mb-5' : 'mb-4'}`}>
        {isFeatured ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 shadow-inner">
            <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        ) : (
          <svg className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
        <div className="min-w-0 flex-1">
          {isFeatured && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-emerald-300/85 mb-1">
              Podsumowanie okna
            </span>
          )}
          <h3
            className={
              isFeatured
                ? 'text-lg md:text-xl font-semibold tracking-tight text-white'
                : 'text-sm font-semibold text-white'
            }
          >
            Najbardziej dotknięte instrumenty
          </h3>
          <p className={`mt-1.5 leading-relaxed ${isFeatured ? 'text-sm text-white/60 max-w-2xl' : 'text-xs text-white/50'}`}>
            Suma wpływu wszystkich wiadomości na instrumenty w wybranym oknie czasowym (TimeEdge × wystąpienia w newsach).
          </p>
        </div>
      </div>
      {top.length === 0 ? (
        <div className={`text-center ${isFeatured ? 'py-10' : 'py-8'}`}>
          <div className="text-sm text-white/60">Brak danych w tym oknie.</div>
        </div>
      ) : (
        <div className={isFeatured ? 'space-y-4' : 'space-y-3'}>
          {top.map((t, idx) => {
            const maxScore = top[0]?.score || 1;
            const width = Math.min(100, (t.score / maxScore) * 100);
            return (
              <div key={t.symbol} className="group">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`font-medium text-white truncate ${isFeatured ? 'text-sm' : 'text-xs text-white/90'}`}
                    >
                      {formatInstrument(t.symbol)}
                    </span>
                    {idx === 0 && (
                      <span className="shrink-0 rounded-full bg-emerald-500/25 text-emerald-200 px-2 py-0.5 text-[10px] font-semibold border border-emerald-400/20">
                        najwyższy wpływ
                      </span>
                    )}
                  </div>
                  <span className={`shrink-0 text-emerald-400 font-semibold tabular-nums ${isFeatured ? 'text-sm' : 'text-xs'}`}>
                    {t.score.toFixed(1)}
                  </span>
                </div>
                <div
                  className={`h-2 rounded-full bg-black/45 relative overflow-hidden ${isFeatured ? 'ring-1 ring-white/5' : ''}`}
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
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
