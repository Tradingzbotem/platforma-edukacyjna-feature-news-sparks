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

type Lang = 'pl' | 'en';

export default function ClientNewsPage({ initial }: { initial: { items: Item[] } }) {
  const [lang, setLang] = useState<Lang>('pl');
  const [hours, setHours] = useState<24 | 48 | 72>(72);
  const rangeKey: RangeKey = hours === 24 ? '24h' : hours === 48 ? '48h' : '72h';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load from URL on first mount
  useEffect(() => {
    const urlRange = (searchParams?.get('range') || '').trim();
    if (urlRange === '24') setHours(24);
    if (urlRange === '48') setHours(48);
    if (urlRange === '72') setHours(72);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ISR initial data provided for 72h; for other ranges we have no SSR cache here
  const initialForRange = rangeKey === '72h' ? initial : undefined;
  const swrKey = `/api/news/summarize?bucket=${rangeKey}`;
  const { data, error, mutate, isValidating } = useNewsSWR<{ items: Item[] }>(swrKey, initialForRange);
  const items = data?.items || [];

  // updated info
  const latestTs = useMemo(() => (items.length ? Math.max(...items.map(i => new Date(i.timestamp_iso).getTime())) : null), [items]);

  // Sync URL with range
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('range', String(hours));
    params.delete('refresh');
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours]);

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

  // Ranking and filtering kept simple: take 0–24h subset for top grid
  const nowMs = Date.now();
  const b24 = items.filter(i => nowMs - new Date(i.timestamp_iso).getTime() <= 24 * 3600 * 1000);
  const lead = b24[0];
  const rest = b24.slice(1);
  const [limit, setLimit] = useState(12);
  useEffect(() => setLimit(12), [swrKey]);

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
            {[24, 48, 72].map(h => (
              <button
                key={h}
                onClick={() => setHours(h as 24 | 48 | 72)}
                className={`px-3 py-1 rounded-lg ${hours === h ? 'bg-white text-slate-900' : 'hover:bg-white/10'}`}
              >
                {h}h
              </button>
            ))}
          </div>

          {/* język */}
          <select
            value={lang}
            onChange={e => setLang(e.currentTarget.value as Lang)}
            className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none"
          >
            <option value="pl">Polish</option>
            <option value="en">English</option>
          </select>

          {/* updated info */}
          <div className="text-xs text-white/60 px-2">
            {latestTs ? `Zaktualizowano ${Math.max(0, Math.floor((Date.now() - latestTs) / 60000))} min temu` : null}
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

      {/* Górny wykres nastrojów (use SSR items as first source) */}
      <SentimentChart range={rangeKey} items={items} onRangeChange={(r) => setHours(r === '24h' ? 24 : r === '48h' ? 48 : 72)} />

      {/* Szybkie info (AI) */}
      <QuickAI />

      {/* Treść */}
      {(!items || items.length === 0) && !error && (
        <div className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-6 text-white/70">Ładowanie…</div>
      )}
      {error && (
        <div className="mt-4 rounded-2xl bg-rose-500/10 border border-rose-400/20 p-4 text-rose-200 text-sm">
          Nie udało się pobrać świeżych danych. Pokazuję ostatni zapis z pamięci.
        </div>
      )}

      {!!items && items.length > 0 && (
        <>
          {/* Lead (0–24h) */}
          {lead && (
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

          {/* Siatka kart (0–24h) — większe kafelki */}
          <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
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
          <CollapsibleBuckets range={rangeKey} />
        </>
      )}

      {/* Stopka */}
      <footer className="mt-10 text-[11px] text-white/50">
        Wyłącznie materiały edukacyjne. Streszczenia generowane automatycznie; zawsze sprawdź oryginalne źródło.
      </footer>
    </main>
  );
}


