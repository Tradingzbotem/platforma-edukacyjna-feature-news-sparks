'use client';
import React from 'react';
import type { NewsItemEnriched } from '@/lib/news/types';
import { formatInstrument } from '@/lib/news/labels';

type Props = {
  items: NewsItemEnriched[];
  showMiniCharts: boolean;
};

function ImpactDots({ value = 1 }: { value?: number }) {
  const v = Math.max(1, Math.min(5, Number(value || 1)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${i < v ? 'bg-white' : 'bg-white/20'}`}
        />
      ))}
    </div>
  );
}

function TimeEdgeBar({ value = 0 }: { value?: number }) {
  const v = Math.max(0, Math.min(10, Number(value || 0)));
  const pct = (v / 10) * 100;
  return (
    <div className="h-2 w-32 rounded bg-white/10 overflow-hidden">
      <div className="h-full bg-white" style={{ width: `${pct}%` }} />
    </div>
  );
}

function SentimentBadge({ value = 'neutral' as NewsItemEnriched['sentiment'] }) {
  const map: Record<string, string> = {
    positive: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
    neutral: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
    negative: 'text-rose-300 bg-rose-500/15 border-rose-400/30',
  };
  const cls = map[value || 'neutral'] || map.neutral;
  const label = value || 'neutral';
  return <span className={`rounded border px-2 py-[2px] text-[11px] ${cls}`}>{label}</span>;
}

export default function NewsFeed({ items, showMiniCharts }: Props) {
  return (
    <section className="space-y-3">
      {items.map((it) => (
        <article key={it.id} className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
          <div className="flex justify-between text-[11px] text-white/60">
            <div className="flex gap-2">
              <span className="uppercase">{it.source}</span>
              <time dateTime={it.publishedAt} className="opacity-80">
                {new Date(it.publishedAt).toLocaleString('pl-PL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              {it.category && <span className="rounded bg-white/10 px-2 py-[1px] text-[10px]">{it.category}</span>}
            </div>
            {typeof it.timeEdge === 'number' && <div className="opacity-60">Edge {it.timeEdge}</div>}
          </div>
          <h3 className="mt-1 text-base font-semibold">{it.title}</h3>
          {it.summaryShort && <p className="mt-1 text-sm text-white/80">{it.summaryShort}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {(it.instruments || []).slice(0, 6).map(sym => (
              <span key={sym} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/80">{formatInstrument(sym)}</span>
            ))}
          </div>
          {/* Metrics row */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-white/60 w-20">Impact</div>
              <ImpactDots value={it.impact} />
              <span className="ml-2 text-[11px] text-white/50">{Math.max(1, Math.min(5, Number(it.impact || 1)))}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-white/60 w-20">TimeEdge</div>
              <TimeEdgeBar value={it.timeEdge} />
              <span className="ml-2 text-[11px] text-white/50">{Math.max(0, Math.min(10, Number(it.timeEdge || 0)))}/10</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-white/60 w-20">Sentiment</div>
              <SentimentBadge value={it.sentiment} />
            </div>
          </div>
          {!!it.impacts?.length && (
            <ul className="mt-2 space-y-1">
              {it.impacts.slice(0, 4).map((im, idx) => (
                <li key={`${im.symbol}-${idx}`} className="text-[12px] text-white/75">
                  <span className="rounded bg-white/10 px-1.5 py-[1px] mr-2">{formatInstrument(im.symbol)}</span>
                  <span className="opacity-80">{im.effect}</span>
                  <span className="ml-2 opacity-60">({im.direction})</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex items-center justify-between">
            {showMiniCharts ? (
              <div className="h-10 w-full rounded bg-black/30" />
            ) : (
              <div className="h-10 w-full rounded bg-black/20" />
            )}
          </div>
          <div className="mt-3">
            <a href={it.url} target="_blank" rel="noreferrer" className="text-sm text-sky-300 hover:underline">Czytaj źródło</a>
          </div>
        </article>
      ))}
    </section>
  );
}


