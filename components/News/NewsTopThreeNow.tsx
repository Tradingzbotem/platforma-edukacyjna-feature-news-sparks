'use client';

import React, { useMemo } from 'react';
import type { NewsItemEnriched } from '@/lib/news/types';
import { formatInstrument } from '@/lib/news/labels';
import { directionBadgeClass, sentimentToDirectionLabel } from '@/lib/news/sentimentDirection';

type Props = {
  items: NewsItemEnriched[];
};

function clampImpact(v: unknown): number {
  return Math.max(1, Math.min(5, Number(v || 1)));
}

function oneLine(text: string | undefined, max = 96): string | null {
  if (!text?.trim()) return null;
  const t = text.replace(/\s+/g, ' ').trim();
  const cut = t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
  return cut;
}

/** Karta 1: pierwsza dostępna wskazówka z danych newsa (bez API). */
function signalInterpretation(it: NewsItemEnriched): string {
  const w = oneLine(it.whyItMatters, 100);
  if (w) return w;
  const watch0 = it.watch?.[0]?.trim();
  if (watch0) return oneLine(watch0, 100) || watch0;
  const imp = it.impacts?.find((x) => x.effect?.trim());
  if (imp?.effect) return oneLine(imp.effect, 100) || imp.effect;
  const s = oneLine(it.summaryShort, 100);
  if (s) return s;
  const first = it.instruments?.[0];
  if (it.category === 'Surowce') return 'Temat może ciągnąć sentyment w sektorze surowcowym.';
  if (it.category === 'Indeksy') return 'Kluczowe dla szerokiego rynku i benchmarków.';
  if (first) return `Główny wektor: ${formatInstrument(first)} — śledź reakcję kwotowań.`;
  return 'Najsilniejszy impuls informacyjny w tym oknie — weryfikuj w tabeli poniżej.';
}

function pickStrongestNews(list: NewsItemEnriched[]): NewsItemEnriched | null {
  if (!list.length) return null;
  return list.reduce((best, it) => {
    const imp = clampImpact(it.impact);
    const bestImp = clampImpact(best.impact);
    if (imp > bestImp) return it;
    if (imp < bestImp) return best;
    const te = Number(it.timeEdge ?? 0);
    const bte = Number(best.timeEdge ?? 0);
    if (te > bte) return it;
    if (te < bte) return best;
    return new Date(it.publishedAt).getTime() > new Date(best.publishedAt).getTime() ? it : best;
  });
}

function topInstrument(list: NewsItemEnriched[]): { symbol: string; score: number } | null {
  const score = new Map<string, number>();
  for (const it of list) {
    const edge = Number(it.timeEdge || 0);
    for (const s of it.instruments || []) {
      score.set(s, (score.get(s) || 0) + edge);
    }
  }
  const sorted = Array.from(score.entries())
    .map(([symbol, s]) => ({ symbol, score: Math.round(s * 10) / 10 }))
    .sort((a, b) => b.score - a.score);
  return sorted[0] ?? null;
}

const SAFE_HAVEN = /^(USD|JPY|CHF|XAU|GOLD|USDT|DXY)/i;

/** Karta 2: opis przepływu / fokusu — z impacts, treści newsów lub heurystyki symbolu. */
function capitalInterpretation(symbol: string, list: NewsItemEnriched[]): string {
  const sym = symbol.toUpperCase();
  for (const it of list) {
    const hit = it.impacts?.find((x) => x.symbol?.toUpperCase() === sym && x.effect?.trim());
    if (hit?.effect) return oneLine(hit.effect, 100) || hit.effect;
  }
  for (const it of list) {
    if (!it.instruments?.some((s) => s.toUpperCase() === sym)) continue;
    const w = oneLine(it.whyItMatters, 90);
    if (w) return w;
  }
  if (SAFE_HAVEN.test(sym)) {
    return 'Często czytane jako oś „bezpiecznych” aktywów — przy risk-off kapitał tu zagląda pierwszy.';
  }
  if (/^VIX/i.test(sym)) {
    return 'Wskaźnik strachu — wyższe odczyty zwykle idą w parze z ostrożnością na akcjach.';
  }
  return 'Najczęściej powiązany z newsami w tym oknie — obserwuj, czy ruch się utrzymuje.';
}

type BiasBlock = {
  headline: string;
  line1: string;
  line2: string;
};

function marketPicture(list: NewsItemEnriched[]): BiasBlock {
  if (!list.length) {
    return {
      headline: 'Brak danych',
      line1: 'W tym oknie nie ma jeszcze newsów do oceny sentymentu.',
      line2: 'Włącz szerszy zakres godzin lub poczekaj na kolejne wpisy.',
    };
  }
  let pos = 0;
  let neg = 0;
  let neu = 0;
  for (const it of list) {
    const s = it.sentiment || 'neutral';
    if (s === 'positive') pos++;
    else if (s === 'negative') neg++;
    else neu++;
  }

  const negIndexish = list.filter((it) => it.sentiment === 'negative' && it.category === 'Indeksy').length;
  const anyIndex = list.some((it) => it.category === 'Indeksy');

  if (neg > pos && neg > neu) {
    return {
      headline: 'Risk-off',
      line1: 'Przewaga negatywnych newsów w bieżącym oknie.',
      line2:
        negIndexish > 0 || anyIndex
          ? 'Możliwa presja na indeksy — weryfikuj szerokość spadków.'
          : 'Nastroje sprzyjają ostrożności i redukcji ryzyka.',
    };
  }
  if (pos > neg && pos > neu) {
    return {
      headline: 'Risk-on',
      line1: 'Dominacja pozytywnego sentymentu w nagłówkach.',
      line2: 'Warunki sprzyjają apetytowi na ryzyko — uważaj na wyprzedanie impulsu.',
    };
  }
  return {
    headline: 'Mieszany obraz',
    line1: 'Mieszany obraz rynku — bez wyraźnej przewagi stron.',
    line2: 'Decyzje wymagają selekcji pojedynczych wydarzeń, nie tylko ogólnego tła.',
  };
}

export default function NewsTopThreeNow({ items }: Props) {
  const strongest = useMemo(() => pickStrongestNews(items), [items]);
  const instrument = useMemo(() => topInstrument(items), [items]);
  const bias = useMemo(() => marketPicture(items), [items]);

  const signalLine = strongest ? signalInterpretation(strongest) : null;
  const capitalLine = instrument ? capitalInterpretation(instrument.symbol, items) : null;

  return (
    <section className="mb-12" aria-labelledby="important-now-heading">
      <div className="text-center mb-7 md:mb-8">
        <h2 id="important-now-heading" className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          Co jest ważne teraz
        </h2>
        <p className="mt-2 text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
          Szybki kontekst rynku — co ma teraz największe znaczenie.
        </p>
      </div>

      <div className="grid gap-4 md:gap-5 sm:grid-cols-3">
        <article className="group rounded-2xl border border-white/[0.1] bg-white/[0.035] px-5 py-5 md:px-6 md:py-6 text-left ring-1 ring-white/[0.05] transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.055] hover:ring-white/[0.08]">
          <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/80 mb-4">
            Najmocniejszy sygnał
          </h3>
          {strongest ? (
            <div className="space-y-3">
              <p className="text-[15px] sm:text-base font-semibold text-white leading-snug line-clamp-3">{strongest.title}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm tabular-nums text-emerald-300 font-bold">{clampImpact(strongest.impact)}/5</span>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${directionBadgeClass(strongest.sentiment || 'neutral')}`}
                >
                  {sentimentToDirectionLabel(strongest.sentiment || 'neutral')}
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed border-t border-white/[0.06] pt-3">{signalLine}</p>
            </div>
          ) : (
            <p className="text-sm text-white/45">Brak pozycji w oknie.</p>
          )}
        </article>

        <article className="group rounded-2xl border border-white/[0.1] bg-white/[0.035] px-5 py-5 md:px-6 md:py-6 text-left ring-1 ring-white/[0.05] transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.055] hover:ring-white/[0.08]">
          <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/80 mb-4">
            Gdzie jest kapitał
          </h3>
          {instrument ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight">{formatInstrument(instrument.symbol)}</span>
                <span className="shrink-0 rounded-full bg-emerald-500/20 text-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border border-emerald-400/30">
                  Największy wpływ
                </span>
              </div>
              <p className="text-xs text-white/45">
                Siła skupienia:{' '}
                <span className="tabular-nums font-semibold text-emerald-400/95">{instrument.score.toFixed(1)}</span>
                <span className="text-white/35"> · suma TimeEdge w oknie</span>
              </p>
              <p className="text-sm text-white/60 leading-relaxed border-t border-white/[0.06] pt-3">{capitalLine}</p>
            </div>
          ) : (
            <p className="text-sm text-white/45">Brak powiązanych instrumentów.</p>
          )}
        </article>

        <article className="group rounded-2xl border border-white/[0.1] bg-white/[0.035] px-5 py-5 md:px-6 md:py-6 text-left ring-1 ring-white/[0.05] transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.055] hover:ring-white/[0.08]">
          <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/80 mb-4">
            Obraz rynku
          </h3>
          <div className="space-y-2.5">
            <p className="text-lg sm:text-xl font-bold text-white tracking-tight">{bias.headline}</p>
            <p className="text-sm text-white/65 leading-relaxed">{bias.line1}</p>
            <p className="text-sm text-white/55 leading-relaxed">{bias.line2}</p>
          </div>
        </article>
      </div>

      <p className="mt-6 text-center text-xs sm:text-sm text-white/45 max-w-2xl mx-auto leading-relaxed px-2">
        Jeśli ten obraz się utrzyma → szukaj kontynuacji. Jeśli się zmieni → rynek może odwrócić kierunek.
      </p>
    </section>
  );
}
