'use client';
import React from 'react';

export type Broker = {
  name: string;
  rating: number;                 // np. 4.5
  platforms: string[];            // np. ['xStation','MT5']
  markets: string[];              // np. ['Forex','Indeksy','Akcje (CFD)']
  pros: string[];                 // atuty
  cons: string[];                 // uwagi
  ticker?: string;                // opcjonalnie
};

export default function BrokerCard({ broker }: { broker: Broker }) {
  return (
    <article className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm transition hover:border-blue-400/30 hover:shadow-blue-500/10 motion-reduce:transition-none">
      {/* nagłówek */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white/90">{broker.name}</h3>
        <div className="rounded-lg bg-yellow-500/15 px-2 py-1 text-sm text-yellow-300">
          ★ {broker.rating.toFixed(1)}
        </div>
      </div>

      {/* meta: platformy / rynki */}
      <div className="mb-3 flex flex-wrap gap-2 text-xs text-white/70">
        {broker.platforms.slice(0, 3).map(p => (
          <span key={p} className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">{p}</span>
        ))}
        {broker.platforms.length > 3 && (
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">+{broker.platforms.length - 3}</span>
        )}
      </div>

      {/* atuty / uwagi — skrócone */}
      <div className="grid gap-3 md:grid-cols-2 items-stretch">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex flex-col h-full min-h-[160px]">
          <p className="mb-1 text-sm font-semibold text-emerald-200">Atuty</p>
          <ul className="list-disc pl-5 text-sm text-emerald-100/90 space-y-1 overflow-hidden">
            {broker.pros.slice(0, 3).map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 flex flex-col h-full min-h-[160px]">
          <p className="mb-1 text-sm font-semibold text-rose-200">Zwróć uwagę</p>
          <ul className="list-disc pl-5 text-sm text-rose-100/90 space-y-1 overflow-hidden">
            {broker.cons.slice(0, 3).map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      </div>
    </article>
  );
}


