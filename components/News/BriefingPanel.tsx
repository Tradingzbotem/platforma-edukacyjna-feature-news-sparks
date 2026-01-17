'use client';
import React, { useEffect, useState } from 'react';
import type { BriefWindow } from '@/lib/news/types';

type Brief = {
  id: string;
  window: BriefWindow;
  generatedAt: string;
  bullets: { what: string[]; why: string[]; watch: string[] };
  extended?: string;
  disclaimer: string;
};

export default function BriefingPanel({ window }: { window: BriefWindow }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [expanded, setExpanded] = useState(false);
  async function load() {
    const res = await fetch(`/api/brief/latest?window=${window}`, { cache: 'no-store' }).catch(() => null);
    const json = res && res.ok ? await res.json() : { brief: null };
    setBrief(json.brief || null);
  }
  useEffect(() => { load(); }, [window]);
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div>
          <h3 className="text-sm font-semibold">Szybki Briefing</h3>
          <p className="text-xs text-white/50">Podsumowanie najważniejszych wydarzeń</p>
        </div>
      </div>
      {!brief && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin mb-3" />
          <div className="text-sm text-white/60">Ładowanie briefingu...</div>
        </div>
      )}
      {!!brief && (
        <div className="space-y-4">
          {brief.bullets.what?.length > 0 && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-emerald-400 rounded-full" />
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">Co się stało</span>
              </div>
              <ul className="space-y-1.5 pl-3">
                {brief.bullets.what.slice(0, 3).map((x, i) => (
                  <li key={i} className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-400 mt-1.5">•</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {brief.bullets.why?.length > 0 && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-amber-400 rounded-full" />
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">Dlaczego to ważne</span>
              </div>
              <ul className="space-y-1.5 pl-3">
                {brief.bullets.why.slice(0, 2).map((x, i) => (
                  <li key={i} className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {brief.bullets.watch?.length > 0 && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-sky-400 rounded-full" />
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Co obserwować</span>
              </div>
              <ul className="space-y-1.5 pl-3">
                {brief.bullets.watch.slice(0, 3).map((x, i) => (
                  <li key={i} className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
                    <span className="text-sky-400 mt-1.5">•</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!brief.extended && (
            <div className="pt-3 border-t border-white/5">
              <button
                className="inline-flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                onClick={() => setExpanded(v => !v)}
              >
                <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {expanded ? 'Zwiń szczegóły' : 'Rozwiń szczegóły (5 min)'}
              </button>
              {expanded && (
                <div className="mt-3 p-3 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-sm text-white/70 leading-relaxed">{brief.extended}</p>
                </div>
              )}
            </div>
          )}
          <div className="pt-3 border-t border-white/5">
            <p className="text-[11px] text-white/40 leading-relaxed">{brief.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}


