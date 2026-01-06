'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Pencil } from 'lucide-react';

type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };

const CATALOG = [
  { key: 'US100',  label: 'US100',  symbol: 'OANDA:NAS100_USD', decimals: 2 },
  { key: 'EURUSD', label: 'EURUSD', symbol: 'OANDA:EUR_USD',    decimals: 3 },
  { key: 'GOLD',   label: 'GOLD',   symbol: 'OANDA:XAU_USD',    decimals: 2 },
  { key: 'OIL',    label: 'OIL',    symbol: 'OANDA:WTICO_USD',  decimals: 2 },
] as const;

// TickerFinnhub uses this exact storage key (see app/components/TickerFinnhub.tsx)
const TOPBAR_SYMBOLS = [
  'OANDA:NAS100_USD',
  'OANDA:XAU_USD',
  'OANDA:WTICO_USD',
  'OANDA:BCO_USD',
  'OANDA:EUR_USD',
  'OANDA:USD_JPY',
  'OANDA:US500_USD',
];
const STORAGE_KEY = `ticker:finnhub:v1:${TOPBAR_SYMBOLS.join(',')}`;
const SNAPSHOT_KEY = 'watchlist:realtime:v1';
const ORDER_KEY = 'watchlist:default:order:v1';
const FRESH_MS = 2 * 60 * 1000; // 2 minutes considered "live"

function fmt(n: number | undefined, digits: number) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export default function WatchlistRealtime() {
  const [data, setData] = useState<Record<string, Quote>>({});
  const [status, setStatus] = useState<'live' | 'cached' | 'empty'>('empty');
  const [edit, setEdit] = useState(false);
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(ORDER_KEY) : null;
      const arr = raw ? (JSON.parse(raw) as string[]) : null;
      const fallback = CATALOG.map(c => c.key);
      return Array.isArray(arr) && arr.length ? arr.filter(k => fallback.includes(k)) : fallback;
    } catch {
      return CATALOG.map(c => c.key);
    }
  });

  // persist order
  useEffect(() => {
    try {
      window.localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch { /* noop */ }
  }, [order]);

  // Deterministyczny fallback — natychmiastowa „fotka” cen dla nowych użytkowników
  function buildInitialSnapshot(): Record<string, Quote> {
    // Bazowe wartości zbliżone do realnych, aby UI nie był puste
    const BASE: Record<string, number> = {
      'OANDA:NAS100_USD': 25445,
      'OANDA:EUR_USD': 1.187,
      'OANDA:XAU_USD': 2350,
      'OANDA:WTICO_USD': 77.2,
      'OANDA:US500_USD': 5632,
      'OANDA:USD_JPY': 151.72,
      'OANDA:BCO_USD': 82.0,
    };
    const now = Date.now();
    const obj: Record<string, Quote> = {};
    for (const it of CATALOG) {
      const base = Number.isFinite(BASE[it.symbol]) ? BASE[it.symbol] : 100;
      obj[it.symbol] = { price: base, prevClose: base, changePct: 0, lastTs: now - FRESH_MS - 1 };
    }
    return obj;
  }

  // Poll localStorage populated by the top ticker (1s)
  useEffect(() => {
    let mounted = true;
    const read = () => {
      if (typeof window === 'undefined') return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const snapshotRaw = window.localStorage.getItem(SNAPSHOT_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, Quote>) : undefined;
        const snapshot = snapshotRaw ? (JSON.parse(snapshotRaw) as { savedAt: number; data: Record<string, Quote> }) : undefined;

        // Helper: detect freshness by any symbol's lastTs within FRESH_MS
        const now = Date.now();
        const isParsedUsable =
          parsed && typeof parsed === 'object' && Object.keys(parsed).some((k) => typeof (parsed as any)[k]?.price === 'number');
        const isParsedFresh =
          isParsedUsable &&
          Object.values(parsed!).some((q) => typeof q?.lastTs === 'number' && now - (q!.lastTs as number) <= FRESH_MS);

        if (isParsedUsable) {
          if (mounted) {
            setData(parsed as Record<string, Quote>);
            setStatus(isParsedFresh ? 'live' : 'cached');
          }
          // Persist snapshot of latest known prices to survive market close / reloads
          try {
            window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: now, data: parsed }));
          } catch { /* noop */ }
          return;
        }

        // Fallback to snapshot (close) when ticker not available (weekend/after hours)
        if (snapshot && snapshot.data && typeof snapshot.data === 'object') {
          if (mounted) {
            setData(snapshot.data);
            setStatus('cached');
          }
          return;
        }

        // If no data at all — utwórz deterministyczny snapshot i użyj od razu
        try {
          const initial = buildInitialSnapshot();
          window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: now, data: initial }));
          if (mounted) {
            setData(initial);
            setStatus('cached');
          }
          return;
        } catch { /* noop */ }

        // Brak możliwości ustawienia fallbacku
        if (mounted) {
          setStatus('empty');
        }
      } catch { /* noop */ }
    };
    read();
    const id = setInterval(read, 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const rows = useMemo(() => {
    const items = order
      .map(k => CATALOG.find(c => c.key === k))
      .filter((x): x is typeof CATALOG[number] => Boolean(x));
    return items.map((it, idx) => {
      const q = data[it.symbol] ?? {};
      const up = typeof q.changePct === 'number' ? q.changePct >= 0 : undefined;
      const color = up == null ? 'text-white/60' : up ? 'text-emerald-400' : 'text-rose-400';
      const Price = () =>
        q.price == null ? (
          <span className="inline-block h-4 w-14 rounded bg-white/10 align-middle" aria-hidden />
        ) : (
          <span className="font-semibold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmt(q.price, it.decimals)}
          </span>
        );
      const Change = () =>
        q.changePct == null ? (
          <span className="inline-block h-3 w-10 rounded bg-white/10 align-middle" aria-hidden />
        ) : (
          <span className={color} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {up ? '+ ' : '− '}
            {Math.abs(q.changePct).toFixed(2)}%
          </span>
        );
      return (
        <div
          key={it.key}
          className="py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center -mx-2 px-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
            <span>{it.label}</span>
          </div>
          <div className="text-right">
            <div className="leading-5">
              <Price />
            </div>
            <div className="flex items-center justify-end gap-1 text-xs">
              <Change />
              <span className="rounded-full border border-white/15 px-1 text-[10px] leading-none text-white/70">24h</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center justify-end gap-1">
            {edit && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOrder(prev => {
                      const next = [...prev];
                      if (idx <= 0) return next;
                      const [moved] = next.splice(idx, 1);
                      next.splice(idx - 1, 0, moved);
                      return next;
                    });
                  }}
                  className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15"
                  aria-label={`Przesuń ${it.label} w górę`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrder(prev => {
                      const next = [...prev];
                      if (idx >= next.length - 1) return next;
                      const [moved] = next.splice(idx, 1);
                      next.splice(idx + 1, 0, moved);
                      return next;
                    });
                  }}
                  className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15"
                  aria-label={`Przesuń ${it.label} w dół`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      );
    });
  }, [data, order, edit]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Watchlist</h2>
          <span
            className={
              'inline-block h-2.5 w-2.5 rounded-full ' +
              (status === 'live' ? 'bg-emerald-400' : status === 'cached' ? 'bg-amber-400' : 'bg-slate-500')
            }
            title={status === 'live' ? 'Połączenie na żywo' : status === 'cached' ? 'Dane z pamięci (ostatnie zamknięcie)' : 'Brak danych'}
            aria-label={status === 'live' ? 'Połączenie na żywo' : status === 'cached' ? 'Dane z pamięci' : 'Brak danych'}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEdit(v => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 text-white font-semibold text-sm px-3 py-2 hover:bg-white/20 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <Pencil className="h-4 w-4" />
            {edit ? 'Zakończ edycję' : 'Edytuj'}
          </button>
          <a href="/konto/panel-rynkowy/kalendarz-7-dni" className="text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white">
            Otwórz kalendarz →
          </a>
        </div>
      </div>
      <div className="mt-3 divide-y divide-white/10">
        {rows}
      </div>
    </section>
  );
}


