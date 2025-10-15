'use client';
import React from 'react';
import type { StripItem } from '../lib/useMarketStrip';

export default function MarketStrip({ items }: { items: StripItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it.key}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm',
            'border transition',
            it.dir === 'up'   ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' :
            it.dir === 'down' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' :
                                'border-white/15 bg-white/[0.06] text-white/80'
          ].join(' ')}
          title={`${it.label}: ${it.pct.toFixed(2)}%`}
        >
          <span className="font-medium">{it.label}</span>
          <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-xs">
            {arrow(it.dir)} {fmt(it.pct)}%
          </span>
        </span>
      ))}
    </div>
  );
}

function fmt(n: number) {
  const s = Math.abs(n).toFixed(2);
  return n < 0 ? `-${s}` : s;
}
function arrow(d: 'up'|'down'|'flat') {
  if (d === 'up') return '▲';
  if (d === 'down') return '▼';
  return '•';
}


