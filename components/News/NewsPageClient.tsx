'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SentimentChart, { type RangeKey } from '@/components/News/SentimentChart';
import QuickAI from '@/components/News/QuickAI';
import CollapsibleBuckets from '@/components/News/CollapsibleBuckets';
import { useNewsSWR } from '@/components/News/useNewsSWR';

type Item = {
  title: string;
  summary: string;
  instruments: string[];
  timestamp_iso: string;
  source?: string;
  link?: string;
};

type Props = {
  initial72h?: { items: Item[] } | null;
};

export default function NewsPageClient({ initial72h }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const rangeParam = sp.get('range') ?? '72';
  const range: RangeKey = rangeParam === '24' ? '24h' : rangeParam === '48' ? '48h' : '72h';

  const key = `/api/news/articles?bucket=${range}&lang=pl`;
  const { data, mutate, isValidating } = useNewsSWR<{ items: Item[] }>(
    key,
    range === '72h' ? (initial72h && Array.isArray(initial72h.items) ? { items: initial72h.items } : undefined) : undefined
  );
  const items = data?.items || [];

  const latestTs = useMemo(
    () => (items.length ? Math.max(...items.map(i => new Date(i.timestamp_iso).getTime())) : null),
    [items]
  );

  const setRange = (r: RangeKey) => {
    const next = new URLSearchParams(sp.toString());
    next.set('range', r.replace('h', ''));
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [busy, setBusy] = useState(false);
  async function onRefresh() {
    setBusy(true);
    try {
      await fetch('/api/news/revalidate', { method: 'POST' }).catch(() => {});
      await mutate();
    } finally {
      setBusy(false);
    }
  }

  // 0–24h section
  const nowMs = Date.now();
  const b24 = items.filter(i => nowMs - new Date(i.timestamp_iso).getTime() <= 24 * 3600 * 1000);
  const lead = b24[0];
  const rest = b24.slice(1);
  const [limit, setLimit] = useState(12);
  useEffect(() => setLimit(12), [key]);

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-8">
      {/* Top bar */}
      <nav className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          ← Strona główna
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* zakres 24/48/72 */}
          <div className="rounded-xl bg-white/10 border border-white/10 p-1 text-sm">
            {(['24h','48h','72h'] as RangeKey[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg ${range === r ? 'bg-white text-slate-900' : 'hover:bg-white/10'}`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* język */}
          <select className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none">
            <option>Polish</option>
          </select>

          {/* updated info */}
          <div className="text-xs text-white/60 px-2">
            {latestTs !== null ? `Zaktualizowano ${Math.max(0, Math.floor((Date.now() - latestTs) / 60000))} min temu` : null}
          </div>

          <button
            onClick={onRefresh}
            disabled={busy || isValidating}
            className="rounded-xl px-4 py-2 bg-white text-slate-900 text-sm font-semibold disabled:opacity-40"
          >
            {busy || isValidating ? 'Odświeżanie…' : 'Odśwież teraz'}
          </button>
        </div>
      </nav>

      <header className="mb-3">
        <h1 className="text-3xl md:text-4xl font-extrabold">Przegląd rynkowy</h1>
        <p className="mt-1 text-slate-300">
          Zwięzłe podsumowania wraz z możliwymi reakcjami rynku (AI). Informacje mają charakter edukacyjny i nie stanowią doradztwa inwestycyjnego.
        </p>
      </header>

      {/* Górny wykres nastrojów */}
      <SentimentChart range={range} items={items} onRangeChange={setRange} />

      {/* Szybkie info (AI) */}
      <div className="mt-6">
        <QuickAI />
      </div>

      {/* Lead (0–24h) */}
      {!!lead && (
        <div className="mt-4">
          <article className="rounded-2xl bg-[#0b1220] border border-white/10 p-4">
            <div className="text-xs text-white/60">
              <time dateTime={lead.timestamp_iso}>{new Date(lead.timestamp_iso).toLocaleString('pl-PL')}</time>
            </div>
            <h2 className="text-xl font-semibold mt-1">{lead.title}</h2>
            <p className="text-white/80 mt-1">{lead.summary}</p>
          </article>
        </div>
      )}

      {/* Siatka kart (0–24h) */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rest.slice(0, limit).map((it, i) => (
          <article key={`${it.timestamp_iso}-${i}`} className="rounded-2xl bg-[#0b1220] border border-white/10 p-4">
            <div className="text-[11px] text-white/60">
              <time dateTime={it.timestamp_iso}>{new Date(it.timestamp_iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
            <div className="mt-1 font-semibold">{it.title}</div>
            <p className="mt-1 text-sm text-white/70">{it.summary}</p>
          </article>
        ))}
      </section>

      {rest.length > limit && (
        <div className="mt-4 flex justify-center">
          <button onClick={() => setLimit(l => l + 12)} className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/20">
            Pokaż więcej
          </button>
        </div>
      )}

      {/* Zwijane informacje (24–48h i 48–72h) */}
      <div className="mt-8">
        <CollapsibleBuckets range={range} />
      </div>

      {/* Stopka */}
      <footer className="mt-10 text-[11px] text-white/50">
        Wyłącznie materiały edukacyjne. Streszczenia generowane automatycznie; zawsze sprawdź oryginalne źródło.
      </footer>
    </main>
  );
}


