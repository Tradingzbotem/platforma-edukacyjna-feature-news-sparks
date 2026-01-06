'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type UiItem = {
  key: string;             // UI code like US100, EURUSD
  symbol: string;          // Finnhub symbol e.g. OANDA:NAS100_USD
  label: string;           // Human label
  icon?: string;           // Optional emoji/icon
};

type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };
type State = Record<string, Quote>;

type SparkResp = { symbol: string; series: Array<[number, number]> };

const CATALOG: UiItem[] = [
  { key: 'US100',  symbol: 'OANDA:NAS100_USD', label: 'US100',    icon: '📈' },
  { key: 'US500',  symbol: 'OANDA:US500_USD',  label: 'US500',    icon: '🏛️' },
  { key: 'DE40',   symbol: 'OANDA:DE30_EUR',   label: 'DE40',     icon: '🇩🇪' },
  { key: 'EURUSD', symbol: 'OANDA:EUR_USD',    label: 'EUR/USD',  icon: '€' },
  { key: 'USDJPY', symbol: 'OANDA:USD_JPY',    label: 'USD/JPY',  icon: '¥' },
  { key: 'GOLD',   symbol: 'OANDA:XAU_USD',    label: 'Złoto',    icon: '🥇' },
  { key: 'WTI',    symbol: 'OANDA:WTICO_USD',  label: 'WTI',      icon: '🛢️' },
  { key: 'BRENT',  symbol: 'OANDA:BCO_USD',    label: 'Brent',    icon: '🛢️' },
  { key: 'BTCUSD', symbol: 'OANDA:BTC_USD',    label: 'BTC/USD',  icon: '₿' },
] as const;

const DEFAULT_KEYS = ['US100', 'EURUSD', 'GOLD', 'WTI'] as const;
const DEFAULT_ITEMS: UiItem[] = DEFAULT_KEYS.map(k => CATALOG.find(c => c.key === k)!).filter(Boolean) as UiItem[];
const LS_KEY = 'fxedu:watchlist:v1';

function fmtPrice(key: string, price?: number) {
  if (price == null || Number.isNaN(price)) return '—';
  if (key === 'EURUSD') return price.toFixed(3);
  if (key === 'US100') return price.toFixed(2);
  if (key === 'GOLD') return price.toFixed(2);
  if (key === 'OIL') return price.toFixed(2);
  if (key === 'WTI' || key === 'BRENT') return price.toFixed(2);
  return price.toFixed(2);
}

function buildSparkPath(series: Array<[number, number]>, w = 80, h = 24): string {
  if (!series?.length) return '';
  const xs = series.map((p) => p[0]);
  const ys = series.map((p) => p[1]);
  const minX = xs[0]!;
  const maxX = xs[xs.length - 1]!;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = Math.max(1, maxX - minX);
  const dy = Math.max(1e-6, maxY - minY);
  const points = series.map(([x, y]) => {
    const px = ((x - minX) / dx) * (w - 2) + 1;
    const py = h - (((y - minY) / dy) * (h - 2) + 1); // invert Y
    return [px, py] as const;
  });
  return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
}

export default function Watchlist({ items = DEFAULT_ITEMS }: { items?: UiItem[] }) {
  const token =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ??
    '';

  // LocalStorage-backed list
  const [list, setList] = useState<UiItem[]>(() => {
    if (typeof window === 'undefined') return items;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return items;
      const keys = JSON.parse(raw) as string[];
      const resolved = keys
        .map(k => CATALOG.find(c => c.key === k))
        .filter(Boolean) as UiItem[];
      return resolved.length ? resolved : items;
    } catch {
      return items;
    }
  });
  useEffect(() => {
    try {
      const keys = list.map(x => x.key);
      localStorage.setItem(LS_KEY, JSON.stringify(keys));
    } catch {}
  }, [list]);

  const [quotes, setQuotes] = useState<State>({});
  const [sparks, setSparks] = useState<Record<string, Array<[number, number]>>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<{ tries: number; timer?: any }>({ tries: 0 });
  const [pickerOpen, setPickerOpen] = useState(false);

  // Start: fetch initial quotes
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!token) return;
      try {
        const results = await Promise.allSettled(
          list.map(async (it) => {
            const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(it.symbol)}&token=${token}`;
            const r = await fetch(url, { cache: 'no-store' });
            if (!r.ok) throw new Error(String(r.status));
            const j = await r.json();
            const price = typeof j.c === 'number' ? j.c : undefined;
            const prevClose = typeof j.pc === 'number' ? j.pc : undefined;
            const changePct =
              price != null && prevClose != null && prevClose !== 0
                ? ((price - prevClose) / prevClose) * 100
                : undefined;
            return { s: it.symbol, q: { price, prevClose, changePct, lastTs: Date.now() } as Quote };
          })
        );
        if (cancelled) return;
        const next: State = {};
        for (const res of results) {
          if (res.status === 'fulfilled') next[res.value.s] = res.value.q;
        }
        setQuotes((prev) => ({ ...next, ...prev }));
      } catch {
        /* noop */
      }
    }
    void boot();
    return () => { cancelled = true; };
  }, [list, token]);

  // WebSocket live updates
  useEffect(() => {
    if (!token) return;
    const connect = () => {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
      wsRef.current = ws;
      ws.onopen = () => {
        reconnectRef.current.tries = 0;
        list.forEach((it) => ws.send(JSON.stringify({ type: 'subscribe', symbol: it.symbol })));
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'trade' && Array.isArray(msg.data)) {
            const last = msg.data[msg.data.length - 1];
            const s: string | undefined = last?.s;
            const p: number | undefined = last?.p;
            const t: number | undefined = last?.t;
            if (s && typeof p === 'number') {
              setQuotes((prev) => {
                const prevClose = prev[s]?.prevClose;
                const changePct =
                  prevClose != null && prevClose !== 0 ? ((p - prevClose) / prevClose) * 100 : prev[s]?.changePct;
                return { ...prev, [s]: { price: p, prevClose, changePct, lastTs: t ?? Date.now() } };
              });
            }
          }
        } catch { /* noop */ }
      };
      ws.onerror = () => { try { ws.close(); } catch {} };
      ws.onclose = () => {
        const tries = ++reconnectRef.current.tries;
        const delay = Math.min(30000, 1000 * Math.pow(2, tries));
        reconnectRef.current.timer = setTimeout(connect, delay);
      };
    };
    connect();
    return () => {
      try {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          list.forEach((it) => ws.send(JSON.stringify({ type: 'unsubscribe', symbol: it.symbol })));
        }
        ws?.close();
      } catch {}
      if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer);
    };
  }, [list, token]);

  // Load sparklines (real if token, fallback to fake generator)
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const resp = await Promise.all(
          list.map(async (it) => {
            const endpoint = token
              ? `/api/quotes/finnhub-spark?symbol=${encodeURIComponent(it.symbol)}&range=7d&interval=1h`
              : `/api/quotes/sparkline?symbols=${encodeURIComponent(it.key)}&range=7d&interval=1h`;
            if (token) {
              const r = await fetch(endpoint, { cache: 'no-store' });
              if (!r.ok) throw new Error('spark fail');
              const j = await r.json();
              const series: Array<[number, number]> = Array.isArray(j?.series) ? j.series : [];
              return { key: it.key, series };
            } else {
              const r = await fetch(endpoint, { cache: 'no-store' });
              const j = await r.json();
              const arr: Array<{ symbol: string; series: Array<[number, number]> }> = Array.isArray(j?.data) ? j.data : [];
              const match = arr.find((x) => x.symbol.toUpperCase() === it.key.toUpperCase());
              return { key: it.key, series: match?.series ?? [] };
            }
          })
        );
        if (!alive) return;
        const map: Record<string, Array<[number, number]>> = {};
        for (const r of resp) map[r.key] = r.series;
        setSparks(map);
      } catch { /* noop */ }
    }
    void load();
    return () => { alive = false; };
  }, [list, token]);

  const rows = useMemo(() => {
    return list.map((it) => {
      const q = quotes[it.symbol] ?? {};
      const up = q.changePct != null ? q.changePct >= 0 : undefined;
      const s = sparks[it.key] || [];
      const path = buildSparkPath(s);
      return (
        <div key={it.key} className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-semibold">
              {it.icon ?? it.key}
            </div>
            <div className="text-white/80 text-sm">{it.label}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <svg width="80" height="24" viewBox="0 0 80 24" aria-hidden>
                <path d={path} fill="none" stroke="currentColor" className={up == null ? 'text-white/40' : up ? 'text-emerald-400' : 'text-rose-400'} strokeWidth="2" />
              </svg>
            </div>
            <div className="text-right">
              <div className="font-semibold">{fmtPrice(it.key, q.price)}</div>
              <div className={`text-xs ${up == null ? 'text-white/60' : up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {up == null ? '…' : up ? '▲' : '▼'} {q.changePct != null ? Math.abs(q.changePct).toFixed(2) : '—'}%
              </div>
            </div>
            <button
              aria-label={`Usuń ${it.label} z watchlisty`}
              className="ml-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-xs"
              onClick={() => setList(prev => prev.filter(x => x.key !== it.key))}
            >
              ×
            </button>
          </div>
        </div>
      );
    });
  }, [list, quotes, sparks]);

  function toggle(item: UiItem) {
    setList(prev => (prev.find(p => p.key === item.key) ? prev.filter(p => p.key !== item.key) : [...prev, item]));
  }

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Watchlist</h2>
          <button
            type="button"
            className="rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-sm"
            onClick={() => setPickerOpen(v => !v)}
            aria-expanded={pickerOpen}
            aria-controls="watchlist-picker"
          >
            Dodaj +
          </button>
        </div>
        <a href="/konto/panel-rynkowy/kalendarz-7-dni" className="text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white">
          Otwórz kalendarz →
        </a>
      </div>
      {pickerOpen && (
        <div
          id="watchlist-picker"
          role="dialog"
          aria-label="Wybierz instrumenty do watchlisty"
          className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATALOG.map(item => {
              const active = !!list.find(x => x.key === item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggle(item)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${active ? 'bg-white text-slate-900 border-white' : 'bg-white/5 hover:bg-white/10 border-white/10'} text-sm`}
                >
                  <span className="h-6 w-6 inline-flex items-center justify-center rounded bg-white/10 border border-white/10">{item.icon ?? '◎'}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[11px] text-white/60">Zaznacz, aby dodać/zdjąć z listy. Zapisuję w przeglądarce (LocalStorage).</div>
        </div>
      )}
      <div className="mt-3 divide-y divide-white/10">{rows}</div>
      {!token && (
        <div className="mt-3 text-[11px] text-white/50">
          Podłącz Finnhub, ustawiając `NEXT_PUBLIC_FINNHUB_KEY` aby włączyć kursy na żywo.
        </div>
      )}
    </section>
  );
}


