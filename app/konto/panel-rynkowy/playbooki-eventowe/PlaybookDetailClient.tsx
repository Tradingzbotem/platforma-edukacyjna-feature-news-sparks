// app/konto/panel-rynkowy/playbooki-eventowe/PlaybookDetailClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Playbook } from '@/lib/panel/playbooks';
import PlaybookTabs from './PlaybookTabs';
import PlaybookChecklist from './PlaybookChecklist';
import PlaybookQuiz from './PlaybookQuiz';

type TabKey = 'tldr' | 'pre' | 'live' | 'scenarios' | 'pitfalls' | 'map' | 'risk' | 'quiz' | 'glossary';

type Props = {
  item: Playbook;
  initialTab?: TabKey;
};

const INSTRUMENTS: Array<'US100' | 'XAUUSD' | 'EURUSD' | 'UST10Y'> = ['US100', 'XAUUSD', 'EURUSD', 'UST10Y'];

export default function PlaybookDetailClient({ item, initialTab = 'tldr' }: Props) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [instrument, setInstrument] = useState<typeof INSTRUMENTS[number]>('US100');

  const instrumentNotes = useMemo(() => {
    return (item.instrumentFocus?.[instrument] ?? []);
  }, [item, instrument]);

  // AI overrides per tab
  const [overrides, setOverrides] = useState<Record<TabKey, any>>({} as any);
  const [loading, setLoading] = useState<Record<TabKey, boolean>>({} as any);
  const [error, setError] = useState<Record<TabKey, string | undefined>>({} as any);
  const [lastRefresh, setLastRefresh] = useState<Record<TabKey, string | undefined>>({} as any); // ISO string

  const hasWindow = typeof window !== 'undefined';
  function lsGet(key: string): string | null {
    try {
      if (!hasWindow) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function lsSet(key: string, value: string) {
    try {
      if (!hasWindow) return;
      window.localStorage.setItem(key, value);
    } catch {}
  }

  function todayKey(): string {
    // UTC date bucket is OK for daily gating
    return new Date().toISOString().slice(0, 10);
  }
  function cacheKeys(slug: string, t: TabKey, instr: string) {
    const base = `pb-ai:${slug}:${t}:${instr}`;
    return {
      date: `${base}:date`,
      data: `${base}:data`,
      time: `${base}:time`,
    };
  }
  function loadFromCache(slug: string, t: TabKey, instr: string) {
    const { date, data, time } = cacheKeys(slug, t, instr);
    const d = lsGet(date) || undefined;
    const raw = lsGet(data);
    const tm = lsGet(time) || undefined;
    let parsed: any = undefined;
    try { parsed = raw ? JSON.parse(raw) : undefined; } catch { parsed = undefined; }
    return { date: d, data: parsed, time: tm };
  }
  function saveToCache(slug: string, t: TabKey, instr: string, payload: any) {
    const { date, data, time } = cacheKeys(slug, t, instr);
    lsSet(date, todayKey());
    lsSet(data, JSON.stringify(payload ?? {}));
    const nowIso = new Date().toISOString();
    lsSet(time, nowIso);
    setLastRefresh((s) => ({ ...s, [t]: lsGet(time) || undefined }));
  }
  function isRefreshedToday(slug: string, t: TabKey, instr: string) {
    const { date } = cacheKeys(slug, t, instr);
    const d = lsGet(date);
    return d === todayKey();
  }
  async function fetchAi(tabToFetch: TabKey, force = false) {
    if (loading[tabToFetch]) return;
    // Daily gating
    if (!force && isRefreshedToday(item.slug, tabToFetch, instrument)) {
      // If cached data exists, load it
      const { data, time } = loadFromCache(item.slug, tabToFetch, instrument);
      if (data) {
        setOverrides((s) => ({ ...s, [tabToFetch]: data }));
        setLastRefresh((s) => ({ ...s, [tabToFetch]: time }));
      }
      return;
    }
    setLoading((s) => ({ ...s, [tabToFetch]: true }));
    setError((s) => ({ ...s, [tabToFetch]: undefined }));
    try {
      const r = await fetch('/api/panel/playbooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: item.slug, tab: tabToFetch, instrument }),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        throw new Error(txt || `Request failed: ${r.status}`);
      }
      const json = await r.json();
      const payload = json?.data || {};
      setOverrides((s) => ({ ...s, [tabToFetch]: payload }));
      saveToCache(item.slug, tabToFetch, instrument, payload);
    } catch (e: any) {
      setError((s) => ({ ...s, [tabToFetch]: e?.message || 'Błąd AI' }));
    } finally {
      setLoading((s) => ({ ...s, [tabToFetch]: false }));
    }
  }

  // Auto-fetch AI content when switching tab (once per tab)
  useEffect(() => {
    // Try load from cache; if not refreshed today, fetch and cache (first visit of the day)
    const cached = loadFromCache(item.slug, tab, instrument);
    if (cached?.data && isRefreshedToday(item.slug, tab, instrument)) {
      setOverrides((s) => ({ ...s, [tab]: cached.data }));
      setLastRefresh((s) => ({ ...s, [tab]: cached.time }));
      return;
    }
    if (!overrides[tab] && !loading[tab]) {
      fetchAi(tab, false);
    }
  }, [tab, item.slug, instrument]); // regenerate per instrument (optional)

  return (
    <div className="mt-6">
      {/* Title & meta */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Region: {item.region}</span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Premium (EDU)</span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Bez sygnałów</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">{item.title}</h1>
            <p className="mt-2 text-white/80 max-w-2xl">{item.summaryOneLine}</p>
          </div>
          <div className="text-right text-xs text-white/60">
            <div>Aktualizacja</div>
            <div className="font-medium text-white/80">{new Date(item.updatedAt).toLocaleString('pl-PL')}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <PlaybookTabs
            item={item}
            active={tab}
            onChange={setTab}
            overrides={overrides[tab]}
            renderQuiz={(itemsOverride) => <PlaybookQuiz item={item} itemsOverride={itemsOverride} />}
          />

          {/* AI state & disclaimer */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs text-white/60">
              {loading[tab]
                ? 'Generowanie treści (AI)…'
                : error[tab]
                ? `Błąd AI: ${error[tab]}`
                : isRefreshedToday(item.slug, tab, instrument)
                ? `Odświeżono dziś • ${new Date(String(lastRefresh[tab] || '')).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`
                : 'Dziś nie odświeżano • możesz odświeżyć raz dziennie.'}
            </div>
            <button
              onClick={() => {
                if (isRefreshedToday(item.slug, tab, instrument)) return;
                fetchAi(tab, true);
              }}
              className={`text-xs rounded-lg border px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                isRefreshedToday(item.slug, tab, instrument)
                  ? 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              aria-disabled={isRefreshedToday(item.slug, tab, instrument)}
            >
              Odśwież AI
            </button>
          </div>

          {/* Instrument focus (optional) */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold tracking-tight">Instrument focus (EDU)</div>
                <p className="text-sm text-white/70">Jakie kanały transmisji zwykle dominują — filtr treści.</p>
              </div>
              <div>
                <label className="sr-only" htmlFor="instrument-select">Wybierz instrument</label>
                <select
                  id="instrument-select"
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value as any)}
                  className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {INSTRUMENTS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            {instrumentNotes.length > 0 ? (
              <ul className="mt-3 list-disc pl-5 space-y-1 text-white/80">
                {instrumentNotes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            ) : (
              <div className="mt-3 text-sm text-white/60">Brak dedykowanych notatek dla tego instrumentu.</div>
            )}
          </div>
        </div>
        <div>
          <PlaybookChecklist item={item} />
        </div>
      </div>
    </div>
  );
}


