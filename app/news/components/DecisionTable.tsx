'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { NewsItemEnriched } from '@/lib/news/types';
import { formatInstrument } from '@/lib/news/labels';
import { formatNewsTableTime } from '@/lib/news/formatNewsTableTime';
import {
  buildDecisionObserveExpanded,
  buildDecisionObservePreview,
  buildDecisionObserveSource,
} from '@/lib/news/decisionObserveText';
import { directionBadgeClass, sentimentToDirectionLabel } from '@/lib/news/sentimentDirection';
import { sortNewsByDecisionPriority } from '@/lib/news/sortNewsDecisionPriority';
import NewsFilters, { type Filters } from '@/components/News/NewsFilters';

type Props = {
  items: NewsItemEnriched[];
  isLoading?: boolean;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
};

const INITIAL_ROWS = 10;

function clampImpact(v: unknown): number {
  return Math.max(1, Math.min(5, Number(v || 1)));
}

type PriorityTier = 'high' | 'mid' | 'low';

/** Pasek priorytetu: wysoki = impact 4–5 + wysoki TimeEdge; średni = umiarkowany impuls; niski = reszta. */
function rowPriorityTier(it: NewsItemEnriched): PriorityTier {
  const imp = clampImpact(it.impact);
  const te = Number(it.timeEdge ?? 0);
  if ((imp >= 4 && te >= 6) || (imp >= 5 && te >= 5)) return 'high';
  if (imp >= 3 || te >= 4) return 'mid';
  return 'low';
}

function priorityBorderClass(tier: PriorityTier, top3: boolean): string {
  switch (tier) {
    case 'high':
      return top3 ? 'border-l-emerald-300' : 'border-l-emerald-500/75';
    case 'mid':
      return top3 ? 'border-l-amber-300/80' : 'border-l-amber-500/45';
    case 'low':
    default:
      return top3 ? 'border-l-white/25' : 'border-l-white/[0.14]';
  }
}

type RowStatus = 'HOT' | 'NOW' | 'WATCH' | 'LOW';

/**
 * HOT: impact ≥4 i wysoki TimeEdge (lub impact 5 i TE≥5).
 * NOW: wysoka świeżość (TE≥5), impact nie „top” (≤3).
 * WATCH: średni priorytet (impact≥2 lub TE≥3).
 * LOW: pozostałe.
 */
function rowStatus(it: NewsItemEnriched): RowStatus {
  const imp = clampImpact(it.impact);
  const te = Number(it.timeEdge ?? 0);
  if ((imp >= 4 && te >= 6) || (imp >= 5 && te >= 5)) return 'HOT';
  if (te >= 5 && imp <= 3) return 'NOW';
  if (imp >= 2 || te >= 3) return 'WATCH';
  return 'LOW';
}

function statusBadgeClass(s: RowStatus): string {
  switch (s) {
    case 'HOT':
      return 'border-rose-400/35 bg-rose-500/[0.14] text-rose-100/95';
    case 'NOW':
      return 'border-sky-400/35 bg-sky-500/[0.14] text-sky-100/90';
    case 'WATCH':
      return 'border-amber-400/30 bg-amber-500/[0.1] text-amber-100/85';
    case 'LOW':
    default:
      return 'border-white/12 bg-white/[0.05] text-white/40';
  }
}

function topInstrumentSymbol(list: NewsItemEnriched[]): string | null {
  const score = new Map<string, number>();
  for (const it of list) {
    const edge = Number(it.timeEdge || 0);
    for (const s of it.instruments || []) {
      score.set(s, (score.get(s) || 0) + edge);
    }
  }
  const best = [...score.entries()].sort((a, b) => b[1] - a[1])[0];
  return best?.[0] ?? null;
}

function dominantBiasLabel(list: NewsItemEnriched[]): string {
  if (!list.length) return '—';
  let pos = 0;
  let neg = 0;
  let neu = 0;
  for (const it of list) {
    const s = it.sentiment || 'neutral';
    if (s === 'positive') pos++;
    else if (s === 'negative') neg++;
    else neu++;
  }
  if (neg > pos && neg > neu) return 'Risk-off';
  if (pos > neg && pos > neu) return 'Risk-on';
  return 'Mieszany';
}

function ImpactCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[4.5rem]">
      <span className="text-xs font-medium tabular-nums text-white/85">{value}/5</span>
      <div className="hidden sm:flex flex-1 h-1.5 max-w-[52px] rounded-full bg-white/10 overflow-hidden" aria-hidden>
        <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function DecisionTable({ items, isLoading, filters, onFiltersChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);

  useEffect(() => {
    setShowAllRows(false);
    setOpenId(null);
  }, [items]);

  const sortedItems = useMemo(() => sortNewsByDecisionPriority(items), [items]);
  const visibleItems = useMemo(
    () => (showAllRows ? sortedItems : sortedItems.slice(0, INITIAL_ROWS)),
    [sortedItems, showAllRows],
  );
  const hasMore = sortedItems.length > INITIAL_ROWS;

  const microTopSymbol = useMemo(() => topInstrumentSymbol(sortedItems), [sortedItems]);
  const microBiasVisible = useMemo(() => dominantBiasLabel(visibleItems), [visibleItems]);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section className="mb-10" aria-labelledby="decision-table-heading">
      <div className="relative rounded-2xl border border-white/[0.1] bg-gradient-to-b from-slate-900/55 via-slate-950/90 to-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_70px_-28px_rgba(15,23,42,0.85)] ring-1 ring-white/[0.05]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl"
          aria-hidden
        />

        <header className="relative border-b border-white/[0.08] bg-slate-950/55 px-5 py-7 md:px-8 md:py-8 text-center rounded-t-2xl">
          <div className="mx-auto max-w-2xl flex flex-col items-center">
            <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/[0.12] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/95 mb-4">
              Panel decyzyjny
            </span>
            <h2 id="decision-table-heading" className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Tabela decyzyjna
            </h2>
            <p className="mt-3 text-sm md:text-[15px] text-white/55 max-w-2xl leading-relaxed mx-auto">
              Najważniejsze wydarzenia, aktywa pod wpływem i kierunek pierwszej reakcji — w jednym widoku.
            </p>
          </div>
        </header>

        <div className="relative border-b border-white/[0.07] bg-slate-950/50 px-3 py-2.5 md:px-5">
          <NewsFilters variant="toolbar" value={filters} onChange={onFiltersChange} />
        </div>

        {isLoading && items.length === 0 && (
          <div className="p-10 text-center text-sm text-white/50 rounded-b-2xl">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400 mb-3" />
            <div>Ładowanie…</div>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="p-10 text-center text-sm text-white/55 rounded-b-2xl">
            Brak pozycji — zmień filtry lub zakres godzin w panelu powyżej.
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="hidden md:block max-h-[min(72vh,880px)] overflow-y-auto overflow-x-auto overscroll-contain border-t border-white/[0.06]">
              <table className="w-full text-left text-sm border-collapse min-w-[720px]">
                <thead className="sticky top-0 z-20 bg-slate-950/98 backdrop-blur-md border-b border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
                  <tr className="text-[10px] uppercase tracking-wider text-white/40">
                    <th className="pl-3 pr-2 py-2.5 font-semibold w-[4.5rem]">Czas</th>
                    <th className="px-2 py-2.5 font-semibold min-w-[200px]">News</th>
                    <th className="px-2 py-2.5 font-semibold w-[7.5rem]">Aktywo</th>
                    <th className="px-2 py-2.5 font-semibold w-[6rem]">Impact</th>
                    <th className="px-2 py-2.5 font-semibold w-[7rem]">Kierunek</th>
                    <th className="px-2 py-2.5 font-semibold min-w-[140px] max-w-[220px]">Co obserwować</th>
                    <th className="pl-2 pr-3 py-2.5 w-9" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((it, idx) => {
                    const inst = it.instruments || [];
                    const first = inst[0];
                    const extra = inst.length > 1 ? inst.length - 1 : 0;
                    const impact = clampImpact(it.impact);
                    const sent = it.sentiment || 'neutral';
                    const observe = buildDecisionObservePreview(it, 160);
                    const expanded = openId === it.id;
                    const expandedBody = buildDecisionObserveExpanded(it);
                    const observeFull = buildDecisionObserveSource(it);
                    const tier = rowPriorityTier(it);
                    const status = rowStatus(it);
                    const top3 = idx < 3;

                    const rowBg = top3 ? 'bg-white/[0.045]' : '';
                    const rowRing = top3 ? 'ring-1 ring-inset ring-white/[0.07]' : '';

                    return (
                      <React.Fragment key={it.id}>
                        <tr
                          className={`border-b border-white/[0.06] border-l-[3px] transition-colors cursor-pointer ${priorityBorderClass(tier, top3)} ${rowBg} ${rowRing} ${
                            expanded ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]'
                          }`}
                          onClick={() => toggle(it.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggle(it.id);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-expanded={expanded}
                        >
                          <td className="pl-3 pr-2 py-2.5 align-top text-[11px] text-white/55 tabular-nums whitespace-nowrap">
                            {top3 && (
                              <span className="block text-[9px] font-bold uppercase tracking-widest text-emerald-400/55 mb-0.5">
                                #{idx + 1}
                              </span>
                            )}
                            {formatNewsTableTime(it.publishedAt)}
                          </td>
                          <td className="px-2 py-2.5 align-top min-w-0">
                            <div className="flex items-start gap-2 min-w-0">
                              <span
                                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${statusBadgeClass(status)}`}
                              >
                                {status}
                              </span>
                              <span className="font-medium text-white/95 leading-snug line-clamp-2 min-w-0">{it.title}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 align-top">
                            {first ? (
                              <span className="inline-flex items-center gap-1 flex-wrap">
                                <span className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                  {formatInstrument(first)}
                                </span>
                                {extra > 0 && (
                                  <span className="rounded-full border border-white/15 bg-white/5 px-1 py-0.5 text-[9px] text-white/50">
                                    +{extra}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-white/35 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 align-top">
                            <ImpactCell value={impact} />
                          </td>
                          <td className="px-2 py-2.5 align-top">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${directionBadgeClass(sent)}`}
                            >
                              {sentimentToDirectionLabel(sent)}
                            </span>
                          </td>
                          <td className="px-2 py-2.5 align-top text-xs text-white/60 min-w-0 max-w-[220px]">
                            <span className="block truncate" title={observe === '—' ? undefined : observe}>
                              {observe}
                            </span>
                          </td>
                          <td className="pl-2 pr-3 py-2.5 align-middle">
                            <Chevron open={expanded} />
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-black/30 border-b border-white/[0.06]">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="pl-0 md:pl-4 max-w-3xl space-y-3 text-sm">
                                {observeFull && observeFull !== (expandedBody || '') ? (
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Co obserwować</div>
                                    <p className="text-white/75 leading-relaxed">{observeFull}</p>
                                  </div>
                                ) : null}
                                <div>
                                  <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Wpływ / kontekst</div>
                                  <p className="text-white/80 leading-relaxed">{expandedBody || '—'}</p>
                                </div>
                                {inst.length > 0 && (
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1.5">Instrumenty</div>
                                    <div className="flex flex-wrap gap-2">
                                      {inst.map((sym) => (
                                        <span
                                          key={sym}
                                          className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
                                        >
                                          {formatInstrument(sym)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <a
                                  href={it.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Czytaj źródło
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-white/[0.06]">
              {visibleItems.map((it, idx) => {
                const inst = it.instruments || [];
                const first = inst[0];
                const extra = inst.length > 1 ? inst.length - 1 : 0;
                const impact = clampImpact(it.impact);
                const sent = it.sentiment || 'neutral';
                const observe = buildDecisionObservePreview(it, 160);
                const expanded = openId === it.id;
                const expandedBody = buildDecisionObserveExpanded(it);
                const observeFull = buildDecisionObserveSource(it);
                const tier = rowPriorityTier(it);
                const status = rowStatus(it);
                const top3 = idx < 3;

                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => toggle(it.id)}
                      className={`w-full text-left px-3 py-3.5 transition-colors flex gap-2 border-l-[3px] ${priorityBorderClass(tier, top3)} ${
                        top3 ? 'bg-white/[0.045] ring-1 ring-inset ring-white/[0.07]' : ''
                      } ${expanded ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035] active:bg-white/[0.05]'}`}
                      aria-expanded={expanded}
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {top3 && (
                              <span className="text-[9px] font-bold text-emerald-400/55 shrink-0">#{idx + 1}</span>
                            )}
                            <span className="text-[10px] text-white/45 tabular-nums">{formatNewsTableTime(it.publishedAt)}</span>
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide border ${statusBadgeClass(status)}`}
                            >
                              {status}
                            </span>
                          </div>
                          <ImpactCell value={impact} />
                        </div>
                        <div className="font-medium text-white/95 text-sm leading-snug">{it.title}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          {first ? (
                            <>
                              <span className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                {formatInstrument(first)}
                              </span>
                              {extra > 0 && (
                                <span className="rounded-full border border-white/15 bg-white/5 px-1.5 py-0.5 text-[9px] text-white/55">
                                  +{extra}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-white/35 text-xs">Aktywo: —</span>
                          )}
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${directionBadgeClass(sent)}`}
                          >
                            {sentimentToDirectionLabel(sent)}
                          </span>
                        </div>
                        <p className="text-xs text-white/55 truncate" title={observe === '—' ? undefined : observe}>
                          {observe}
                        </p>
                      </div>
                      <Chevron open={expanded} />
                    </button>
                    {expanded && (
                      <div className="px-3 pb-4 pt-0 space-y-3 text-sm bg-black/25 border-t border-white/[0.04]">
                        {observeFull && observeFull !== (expandedBody || '') ? (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Co obserwować</div>
                            <p className="text-white/75 leading-relaxed text-sm">{observeFull}</p>
                          </div>
                        ) : null}
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Wpływ / kontekst</div>
                          <p className="text-white/80 leading-relaxed text-sm">{expandedBody || '—'}</p>
                        </div>
                        {inst.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1.5">Instrumenty</div>
                            <div className="flex flex-wrap gap-2">
                              {inst.map((sym) => (
                                <span
                                  key={sym}
                                  className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
                                >
                                  {formatInstrument(sym)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium"
                        >
                          Czytaj źródło
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-white/10 bg-slate-950/55 px-3 py-2.5 md:px-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-b-2xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-white/45">
                <span className="tabular-nums">
                  Widoczne <span className="text-white/70 font-medium">{visibleItems.length}</span> z{' '}
                  <span className="text-white/70 font-medium">{sortedItems.length}</span>
                </span>
                <span className="hidden sm:inline text-white/20" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-white/60">
                  Bias: <span className="text-white/85">{microBiasVisible}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-white/60">
                  Fokus:{' '}
                  <span className="text-emerald-300/90">
                    {microTopSymbol ? formatInstrument(microTopSymbol) : '—'}
                  </span>
                </span>
              </div>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setShowAllRows((v) => !v)}
                  className="inline-flex items-center justify-center shrink-0 rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 hover:border-white/22 transition-colors w-full sm:w-auto"
                >
                  {showAllRows ? 'Pokaż mniej' : 'Pokaż więcej'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
