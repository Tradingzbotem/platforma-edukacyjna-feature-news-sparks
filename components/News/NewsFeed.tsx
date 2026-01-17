'use client';
import React, { useState } from 'react';
import type { NewsItemEnriched } from '@/lib/news/types';
import { formatInstrument } from '@/lib/news/labels';

type Props = {
  items: NewsItemEnriched[];
  showMiniCharts: boolean;
};

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-900 border border-white/20 rounded-lg shadow-xl max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white/20" />
        </div>
      )}
    </div>
  );
}

function ImpactDots({ value = 1 }: { value?: number }) {
  const v = Math.max(1, Math.min(5, Number(value || 1)));
  return (
    <Tooltip content="Impact (1-5): Potencjalna skala wpływu na rynek. Wyższa wartość = większy wpływ.">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`inline-block h-2.5 w-2.5 rounded-full transition-colors ${i < v ? 'bg-emerald-400' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </Tooltip>
  );
}

function TimeEdgeBar({ value = 0 }: { value?: number }) {
  const v = Math.max(0, Math.min(10, Number(value || 0)));
  const pct = (v / 10) * 100;
  const color = v >= 7 ? 'bg-emerald-400' : v >= 4 ? 'bg-amber-400' : 'bg-white/40';
  return (
    <Tooltip content="TimeEdge (0-10): Świeżość przewagi informacyjnej. Wyższa wartość = informacja jest bardziej aktualna i ma większą przewagę czasową.">
      <div className="h-2.5 w-32 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </Tooltip>
  );
}

function SentimentBadge({ value = 'neutral' as NewsItemEnriched['sentiment'] }) {
  const map: Record<string, { style: string; label: string; tooltip: string }> = {
    positive: {
      style: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
      label: 'Pozytywny',
      tooltip: 'Pozytywny: Informacja może wpłynąć pozytywnie na rynek',
    },
    neutral: {
      style: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
      label: 'Neutralny',
      tooltip: 'Neutralny: Informacja ma neutralny wpływ na rynek',
    },
    negative: {
      style: 'text-rose-300 bg-rose-500/15 border-rose-400/30',
      label: 'Negatywny',
      tooltip: 'Negatywny: Informacja może wpłynąć negatywnie na rynek',
    },
  };
  const config = map[value || 'neutral'] || map.neutral;
  return (
    <Tooltip content={config.tooltip}>
      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.style}`}>
        {config.label}
      </span>
    </Tooltip>
  );
}

function formatTimeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'przed chwilą';
  if (diffMins < 60) return `${diffMins} min temu`;
  if (diffHours < 24) return `${diffHours} godz. temu`;
  if (diffDays < 7) return `${diffDays} dni temu`;
  return new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

export default function NewsFeed({ items, showMiniCharts }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
          <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Brak wiadomości</h3>
        <p className="text-sm text-white/60">Spróbuj zmienić filtry lub zakres czasowy, aby zobaczyć więcej wyników.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wiadomości ({items.length})</h2>
        <div className="text-xs text-white/50">
          Sortowane według TimeEdge (najświeższe pierwsze)
        </div>
      </div>
      {items.map((it) => (
        <article key={it.id} className="group rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5 hover:border-white/20 transition-all">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-white/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="uppercase font-medium">{it.source}</span>
              </span>
              <time dateTime={it.publishedAt} className="text-xs text-white/50">
                {formatTimeAgo(it.publishedAt)}
              </time>
              {it.category && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-white/70 font-medium">
                  {it.category}
                </span>
              )}
            </div>
            {typeof it.timeEdge === 'number' && it.timeEdge >= 7 && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-semibold">
                NOW
              </span>
            )}
          </div>

          {/* Title & Summary */}
          <h3 className="text-lg font-bold mb-2 leading-snug group-hover:text-white transition-colors">
            {it.title}
          </h3>
          {it.summaryShort && (
            <p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-2">
              {it.summaryShort}
            </p>
          )}

          {/* Instruments */}
          {(it.instruments || []).length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-white/50 mb-2">Instrumenty:</div>
              <div className="flex flex-wrap items-center gap-2">
                {(it.instruments || []).slice(0, 8).map(sym => (
                  <span
                    key={sym}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300 font-medium"
                  >
                    {formatInstrument(sym)}
                  </span>
                ))}
                {(it.instruments || []).length > 8 && (
                  <span className="text-xs text-white/50">
                    +{(it.instruments || []).length - 8} więcej
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-black/20 border border-white/5 mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 font-medium">Impact</span>
                <span className="text-xs text-white/40">({Math.max(1, Math.min(5, Number(it.impact || 1)))}/5)</span>
              </div>
              <ImpactDots value={it.impact} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 font-medium">TimeEdge</span>
                <span className="text-xs text-white/40">({Math.max(0, Math.min(10, Number(it.timeEdge || 0)))}/10)</span>
              </div>
              <TimeEdgeBar value={it.timeEdge} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-white/60 font-medium">Sentiment</span>
              <SentimentBadge value={it.sentiment} />
            </div>
          </div>

          {/* Impacts */}
          {!!it.impacts?.length && (
            <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="text-xs text-white/50 mb-2 font-medium">Szczegółowy wpływ:</div>
              <ul className="space-y-2">
                {it.impacts.slice(0, 4).map((im, idx) => (
                  <li key={`${im.symbol}-${idx}`} className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center rounded-md bg-emerald-400/20 text-emerald-300 px-2 py-0.5 text-xs font-medium">
                      {formatInstrument(im.symbol)}
                    </span>
                    <span className="text-white/80 flex-1">{im.effect}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      im.direction === 'up' ? 'bg-emerald-500/20 text-emerald-300' :
                      im.direction === 'down' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {im.direction === 'up' ? '↑' : im.direction === 'down' ? '↓' : '→'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <a
              href={it.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Czytaj źródło
            </a>
            {showMiniCharts && (
              <div className="h-8 w-32 rounded bg-black/30 border border-white/5" />
            )}
          </div>
        </article>
      ))}
    </section>
  );
}


