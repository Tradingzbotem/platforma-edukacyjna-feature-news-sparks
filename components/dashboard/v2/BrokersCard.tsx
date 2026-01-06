'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

const BROKERS = [
  { name: 'Burity', tag: 'Demo', spread: '2', leverage: '1:500' },
  { name: 'XTrade', tag: 'PRO', spread: '1', leverage: '1:200' },
  { name: 'Brokerly', tag: 'STARTER', spread: '1.2', leverage: '1:100' },
];

export default function BrokersCard() {
  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => BROKERS.filter(b => b.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Porównaj brokerów</h3>
        <Link href="/rankingi/brokerzy" className="text-sm underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500">
          Ranking brokerów
        </Link>
      </div>
      <div className="mt-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Wyszukaj brokera…"
          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400"
        />
      </div>
      <ul className="mt-3 divide-y divide-slate-200 text-sm">
        {filtered.map((b) => (
          <li key={b.name} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-700">
                {b.tag}
              </span>
              <span className="font-medium text-slate-900">{b.name}</span>
            </div>
            <div className="text-slate-600">Spread: {b.spread} • Dźwignia: {b.leverage}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}


