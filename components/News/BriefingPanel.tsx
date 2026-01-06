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
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
      <div className="text-sm font-semibold">Szybki Briefing (1 minuta)</div>
      {!brief && <div className="mt-2 text-sm text-white/60">Ładowanie…</div>}
      {!!brief && (
        <div className="mt-2 space-y-3">
          {brief.bullets.what?.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Co się stało</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-white/80">
                {brief.bullets.what.slice(0, 3).map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}
          {brief.bullets.why?.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Dlaczego to ważne</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-white/80">
                {brief.bullets.why.slice(0, 2).map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}
          {brief.bullets.watch?.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Co obserwować</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-white/80">
                {brief.bullets.watch.slice(0, 3).map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}
          {!!brief.extended && (
            <div className="mt-2">
              <button className="text-xs text-sky-300 hover:underline" onClick={() => setExpanded(v => !v)}>
                {expanded ? 'Zwiń' : 'Rozwiń (5 min)'}
              </button>
              {expanded && <p className="mt-2 text-sm text-white/70">{brief.extended}</p>}
            </div>
          )}
          <div className="text-[11px] text-white/50">{brief.disclaimer}</div>
        </div>
      )}
    </div>
  );
}


