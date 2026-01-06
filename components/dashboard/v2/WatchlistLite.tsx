'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type UiItem = {
  key: string;
  symbol: string;
  label: string;
};

type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };

const CATALOG: UiItem[] = [
  { key: 'US100',  symbol: 'OANDA:NAS100_USD', label: 'US100' },
  { key: 'EURUSD', symbol: 'OANDA:EUR_USD',    label: 'EURUSD' },
  { key: 'GOLD',   symbol: 'OANDA:XAU_USD',    label: 'GOLD' },
  { key: 'OIL',    symbol: 'OANDA:WTICO_USD',  label: 'OIL' },
  { key: 'USDJPY', symbol: 'OANDA:USD_JPY',    label: 'USDJPY' },
] as const;
const DEFAULT_KEYS = ['US100', 'EURUSD', 'GOLD', 'OIL'] as const;
const DEFAULT_ITEMS: UiItem[] = DEFAULT_KEYS.map(k => CATALOG.find(c => c.key === k)!).filter(Boolean) as UiItem[];
const LS_KEY = 'fxedu:watchlist:v2';

function fmtPrice(key: string, price?: number) {
  if (price == null || Number.isNaN(price)) return '—';
  if (key === 'EURUSD') return price.toFixed(3);
  return price.toFixed(2);
}

function buildSparkPath(series: Array<[number, number]>, w = 84, h = 24): string {
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
    const py = h - (((y - minY) / dy) * (h - 2) + 1);
    return [px, py] as const;
  });
  return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
}

export default function WatchlistLite({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const token =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ??
    '';

  function Sparkline({ d, colorClass }: { d: string; colorClass: string }) {
    const ref = React.useRef<SVGPathElement | null>(null);
    useEffect(() => {
      const el = ref.current;
      if (!el || !d) return;
      try {
        const len = el.getTotalLength();
        el.style.transition = 'none';
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len}`;
        // force reflow
        void el.getBoundingClientRect();
        // animate draw
        el.style.transition = 'stroke-dashoffset 700ms ease';
        el.style.strokeDashoffset = '0';
      } catch {}
    }, [d]);
    return (
      <svg width="84" height="24" viewBox="0 0 84 24" aria-hidden>
        <path ref={ref} d={d} fill="none" stroke="currentColor" className={colorClass} strokeWidth="2" />
      </svg>
    );
  }

  // Typowe bazy cen (dla realistycznych wartości bez klucza API)
  const PRICE_BASE: Record<string, number> = {
    US100: 25445,
    US500: 5632,
    EURUSD: 1.187,
    USDJPY: 151.72,
    GOLD: 2350,
    OIL: 77.2,
    BRENT: 82.0,
  };

  // Lokalny deterministyczny generator — natychmiastowy fallback (bez API)
  function genSeriesForKey(key: string, range: '7d' | '30d', interval: '1h' | '4h' | '1d'): Array<[number, number]> {
    const now = Date.now();
    const steps = interval === '1d' ? (range === '7d' ? 7 : 30) : interval === '4h' ? (range === '7d' ? 42 : 180) : (range === '7d' ? 168 : 720);
    const stepMs = interval === '1d' ? 24 * 3600 * 1000 : interval === '4h' ? 4 * 3600 * 1000 : 3600 * 1000;
    const symbol = key;
    let h = 0;
    for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) | 0;
    const seed = Math.abs(h);
    const defaultBase = 100 + (seed % 50);
    const base = PRICE_BASE[key] ?? defaultBase;
    const points: Array<[number, number]> = [];
    for (let i = steps - 1; i >= 0; i--) {
      const t = now - i * stepMs;
      const angle = (i / steps) * Math.PI * 2;
      const noise = ((Math.sin(angle * (1 + (seed % 3))) + Math.cos(angle * 0.7 + (seed % 5))) / 2) * 2;
      const value = base + Math.sin(angle) * (base * 0.005) + noise; // ~0.5% wahania
      points.push([t, Number(value.toFixed(2))]);
    }
    return points;
  }

  // Start with deterministic default to avoid SSR/CSR mismatch.
  const [list, setList] = useState<UiItem[]>(DEFAULT_ITEMS);
  // Hydrate list from localStorage after mount (client-only).
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
      if (!raw) return;
      const keys = JSON.parse(raw) as string[];
      const resolved = keys.map(k => CATALOG.find(c => c.key === k)).filter(Boolean) as UiItem[];
      if (resolved.length) setList(resolved);
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    try {
      const keys = list.map(x => x.key);
      localStorage.setItem(LS_KEY, JSON.stringify(keys));
    } catch {}
  }, [list]);

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [sparks, setSparks] = useState<Record<string, Array<[number, number]>>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<{ tries: number; timer?: any }>({ tries: 0 });
  const [pickerOpen, setPickerOpen] = useState(false);

  // Hydratacja danymi z paska na stronie głównej (TickerFinnhub zapisuje do localStorage)
  useEffect(() => {
    try {
      const topbarSymbols = [
        'OANDA:NAS100_USD',
        'OANDA:XAU_USD',
        'OANDA:WTICO_USD',
        'OANDA:BCO_USD',
        'OANDA:EUR_USD',
        'OANDA:USD_JPY',
        'OANDA:US500_USD',
      ];
      const storageKey = `ticker:finnhub:v1:${topbarSymbols.join(',')}`;
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, Quote>;
      if (!parsed || typeof parsed !== 'object') return;
      const next: Record<string, Quote> = {};
      list.forEach((it) => {
        const q = parsed[it.symbol];
        if (q) next[it.symbol] = q;
      });
      if (Object.keys(next).length) setQuotes((prev) => ({ ...next, ...prev }));
    } catch { /* noop */ }
  }, [list]);

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
        const next: Record<string, Quote> = {};
        for (const res of results) {
          if (res.status === 'fulfilled') next[res.value.s] = res.value.q;
        }
        setQuotes((prev) => ({ ...next, ...prev }));
      } catch {}
    }
    void boot();
    return () => { cancelled = true; };
  }, [list, token]);

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
        } catch {}
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

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const range: '7d' | '30d' = '7d';
        const interval: '1h' | '4h' | '1d' = '1h';

        // Szybki odczyt z cache lub natychmiastowa generacja (bez czekania na sieć)
        const symbolsKey = list.map((it) => it.key).join(',');
        const cacheKey = `sparkline:v1:${range}:${interval}:${symbolsKey}`;
        if (typeof window !== 'undefined') {
          try {
            const cachedRaw = window.localStorage.getItem(cacheKey);
            const cached = cachedRaw ? (JSON.parse(cachedRaw) as { ts: number; data: Record<string, Array<[number, number]>> }) : null;
            const fresh = cached && typeof cached.ts === 'number' && Date.now() - cached.ts < 5 * 60 * 1000;
            const cachedData = fresh && cached?.data ? cached.data : {};
            // Uzupełnij brakujące serie natychmiast (cache → generator), bez kasowania istniejących
            setSparks((prev) => {
              const merged: Record<string, Array<[number, number]>> = { ...prev };
              for (const it of list) {
                const existing = merged[it.key];
                if (existing && existing.length) continue;
                const fromCache = (cachedData as any)?.[it.key] as Array<[number, number]> | undefined;
                if (fromCache && fromCache.length) {
                  merged[it.key] = fromCache;
                } else {
                  merged[it.key] = genSeriesForKey(it.key, range, interval);
                }
              }
              return merged;
            });
          } catch {}
        }

        if (token) {
          // Finnhub endpoint — jeden symbol na żądanie (limit API)
          const resp = await Promise.all(
            list.map(async (it) => {
              const endpoint = `/api/quotes/finnhub-spark?symbol=${encodeURIComponent(it.symbol)}&range=${range}&interval=${interval}`;
              const r = await fetch(endpoint, { cache: 'no-store' });
              const j = await r.json();
              const series: Array<[number, number]> = Array.isArray(j?.series) ? j.series : [];
              return { key: it.key, series };
            })
          );
          if (!alive) return;
          const map: Record<string, Array<[number, number]>> = {};
          for (const r of resp) map[r.key] = r.series;
          setSparks(map);
        } else {
          // Fallback: jeden batched request dla wszystkich symboli
          const symbols = list.map((it) => it.key).join(',');
          const endpoint = `/api/quotes/sparkline?symbols=${encodeURIComponent(symbols)}&range=${range}&interval=${interval}`;
          const r = await fetch(endpoint, { cache: 'no-store' });
          const j = await r.json();
          const arr: Array<{ symbol: string; series: Array<[number, number]> }> = Array.isArray(j?.data) ? j.data : [];
          const map: Record<string, Array<[number, number]>> = {};
          for (const it of list) {
            const match = arr.find((x) => x.symbol.toUpperCase() === it.key.toUpperCase());
            const series = match?.series ?? [];
            // Re-bazowanie do realistycznej skali jeśli znamy typowy poziom
            const targetBase = PRICE_BASE[it.key];
            if (series.length && typeof targetBase === 'number') {
              const first = series[0]?.[1];
              if (typeof first === 'number' && isFinite(first) && first !== 0) {
                const scale = targetBase / first;
                map[it.key] = series.map(([t, v]) => [t, Number((v * scale).toFixed(3))]);
              } else {
                map[it.key] = series;
              }
            } else if (!series.length) {
              // fallback do lokalnego generatora, gdyby endpoint nic nie zwrócił
              map[it.key] = genSeriesForKey(it.key, range, interval);
            } else {
              map[it.key] = series;
            }
          }
          if (!alive) return;
          // Nigdy nie pozwalaj na "wyczyszczenie" danych – łącz z poprzednimi
          setSparks((prev) => {
            const merged: Record<string, Array<[number, number]>> = {};
            for (const it of list) {
              const next = map[it.key];
              const current = prev[it.key];
              merged[it.key] = next && next.length ? next : (current && current.length ? current : genSeriesForKey(it.key, range, interval));
            }
            return merged;
          });
          try {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: map }));
            }
          } catch {}
        }
      } catch {}
    }
    void load();
    return () => { alive = false; };
  }, [list, token]);

  const isDark = variant === 'dark';
  const cls = {
    section: isDark ? 'rounded-2xl bg-white/5 border border-white/10 p-4 text-white' : 'rounded-2xl bg-white border border-slate-200 shadow-sm p-4',
    title: isDark ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-slate-900',
    addBtn: isDark ? 'rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 text-sm' : 'rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 text-sm',
    link: isDark ? 'text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white' : 'text-sm underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500',
    rowLabel: isDark ? 'text-sm text-white/90' : 'text-sm text-slate-900',
    rowPrice: isDark ? 'font-semibold text-white' : 'font-semibold text-slate-900',
    rowBadge: isDark ? 'rounded-full border border-white/15 px-1 text-[10px] leading-none text-white/70' : 'rounded-full border border-slate-200 px-1 text-[10px] leading-none text-slate-500',
    rowDivide: isDark ? 'mt-3 divide-y divide-white/10' : 'mt-3 divide-y divide-slate-200',
    sparkNeutral: isDark ? 'text-slate-400' : 'text-slate-300',
    sparkUp: isDark ? 'text-emerald-400' : 'text-emerald-500',
    sparkDown: isDark ? 'text-rose-400' : 'text-rose-500',
    changeNeutral: isDark ? 'text-white/70' : 'text-slate-500',
    changeUp: isDark ? 'text-emerald-400' : 'text-emerald-600',
    changeDown: isDark ? 'text-rose-400' : 'text-rose-600',
    picker: isDark ? 'mt-3 rounded-xl border border-white/10 bg-black/30 p-3' : 'mt-3 rounded-xl border border-slate-200 bg-white p-3',
    pickerBtn: (active: boolean) =>
      active
        ? (isDark ? 'flex items-center justify-center gap-2 rounded-lg px-3 py-2 border text-sm bg-white text-slate-900 border-white' : 'flex items-center justify-center gap-2 rounded-lg px-3 py-2 border text-sm bg-blue-600 text-white border-blue-600')
        : (isDark ? 'flex items-center justify-center gap-2 rounded-lg px-3 py-2 border text-sm bg-white/5 text-white border-white/10 hover:bg-white/10' : 'flex items-center justify-center gap-2 rounded-lg px-3 py-2 border text-sm bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200'),
  };

  const rows = useMemo(() => {
    return list.map((it) => {
      const q = quotes[it.symbol] ?? {};
      const s = sparks[it.key] || [];
      const seriesPct =
        s && s.length > 1 ? ((s[s.length - 1][1] - s[0][1]) / Math.max(1e-9, s[0][1])) * 100 : undefined;
      const pct = typeof q.changePct === 'number' ? q.changePct : seriesPct;
      const up = pct != null ? pct >= 0 : undefined;
      const path = buildSparkPath(s);
      const colorCls = up == null ? cls.changeNeutral : up ? cls.changeUp : cls.changeDown;
      const effPrice = (typeof q.price === 'number' ? q.price : (s && s.length ? s[s.length - 1][1] : undefined));
      return (
        <div key={it.key} className="py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
          <div className={cls.rowLabel}>{it.label}</div>
          <div className="text-right">
            <div className={cls.rowPrice}>{fmtPrice(it.key, effPrice)}</div>
            <div className="flex items-center justify-end gap-1 text-xs">
              <span className={colorCls}>
                {up == null ? '…' : up ? '+ ' : '− '}
                {pct != null ? Math.abs(pct).toFixed(2) : '—'}%
              </span>
              <span className={cls.rowBadge}>24h</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline d={path} colorClass={up == null ? cls.sparkNeutral : up ? cls.sparkUp : cls.sparkDown} />
          </div>
        </div>
      );
    });
  }, [list, quotes, sparks, variant]);

  return (
    <section className={cls.section}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className={cls.title}>Watchlist</h2>
          <button
            type="button"
            className={cls.addBtn}
            onClick={() => setPickerOpen(v => !v)}
            aria-expanded={pickerOpen}
            aria-controls="watchlist-lite-picker"
          >
            Dodaj +
          </button>
        </div>
        <Link href="/konto/panel-rynkowy/kalendarz-7-dni" className={cls.link}>
          Otwórz kalendarz →
        </Link>
      </div>

      {pickerOpen && (
        <div id="watchlist-lite-picker" role="dialog" aria-label="Wybierz instrumenty" className={cls.picker}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATALOG.map(item => {
              const active = !!list.find(x => x.key === item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setList(prev => (prev.find(p => p.key === item.key) ? prev.filter(p => p.key !== item.key) : [...prev, item]))}
                  className={cls.pickerBtn(active)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={cls.rowDivide}>{rows}</div>
      {!token && (
        <div className={isDark ? 'mt-3 text-[11px] text-white/60' : 'mt-3 text-[11px] text-slate-500'}>
          Podłącz Finnhub (`NEXT_PUBLIC_FINNHUB_KEY`), by włączyć kursy na żywo.
        </div>
      )}
    </section>
  );
}


