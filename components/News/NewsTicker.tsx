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

  return (
    <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
      <div className="absolute left-0 top-0 h-full w-28 bg-gradient-to-r from-[#0b1220] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-28 bg-gradient-to-l from-[#0b1220] to-transparent pointer-events-none" />
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-xs font-semibold">NOW</span>
        <div className="animate-marquee whitespace-nowrap [animation-duration:30s]">
          {top.map((it, i) => (
            <span key={it.id || i} className="mx-6 text-sm text-white/80">
              {it.title} <span className="text-white/40">({new Date(it.publishedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


