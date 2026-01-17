'use client';
import React, { useEffect, useMemo, useState } from 'react';
import type { NewsItemEnriched } from '@/lib/news/types';

type Props = {
  hours: 24 | 48 | 72;
  live: boolean;
};

export default function NewsTicker({ hours, live }: Props) {
  const [items, setItems] = useState<NewsItemEnriched[]>([]);
  const [tick, setTick] = useState(0);

  async function load() {
    const res = await fetch(`/api/news/list?hours=${hours}`, { cache: 'no-store' }).catch(() => null);
    const json = res && res.ok ? await res.json() : { items: [] };
    setItems(Array.isArray(json.items) ? json.items : []);
  }

  useEffect(() => { load(); }, [hours]);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => { setTick(t => t + 1); load(); }, 90_000);
    return () => clearInterval(id);
  }, [live, hours]);

  const top = useMemo(() => {
    return items
      .slice(0, 40)
      .sort((a, b) => (b.timeEdge ?? 0) - (a.timeEdge ?? 0))
      .slice(0, 8);
  }, [items]);

  if (top.length === 0) {
    return null;
  }

  return (
    <div className="relative mt-6 overflow-hidden rounded-xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-transparent backdrop-blur-sm">
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 text-xs font-bold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NAJNOWSZE
          </span>
        </div>
        <div className="animate-marquee whitespace-nowrap [animation-duration:40s] flex-1">
          {top.map((it, i) => (
            <span key={it.id || i} className="mx-8 inline-flex items-center gap-2 text-sm text-white/90">
              <span className="font-medium">{it.title}</span>
              <span className="text-white/40 text-xs">
                {new Date(it.publishedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-white/20">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


