'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type UiKey = 'US100' | 'EURUSD' | 'GOLD' | 'OIL';
type UiItem = { key: UiKey; symbol: string; label: string; icon?: string };
type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };

const ITEMS: UiItem[] = [
  { key: 'US100',  symbol: 'OANDA:NAS100_USD', label: 'US100',  icon: '📈' },
  { key: 'EURUSD', symbol: 'OANDA:EUR_USD',    label: 'EURUSD', icon: '€' },
  { key: 'GOLD',   symbol: 'OANDA:XAU_USD',    label: 'GOLD',   icon: '🥇' },
  { key: 'OIL',    symbol: 'OANDA:WTICO_USD',  label: 'OIL',    icon: '🛢️' },
] as const;

function fmtPrice(key: UiKey, price?: number) {
  if (price == null || Number.isNaN(price)) return '—';
  if (key === 'EURUSD') {
    return price.toLocaleString('pl-PL', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }
  return price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function altCode(it: UiItem): string {
  const core = it.symbol.replace('OANDA:', '');
  if (core === 'WTICO_USD') return 'WTI';
  if (core === 'BCO_USD') return 'BRENT';
  if (core === 'NAS100_USD') return 'NAS100';
  if (core === 'US500_USD') return 'US500';
  if (core === 'XAU_USD') return 'XAU';
  if (core === 'EUR_USD') return 'EURUSD';
  if (core === 'USD_JPY') return 'USDJPY';
  return core.replace('_', '');
}

function buildSparkPath(series: Array<[number, number]>, w = 120, h = 28): string {
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

function marketLabel(it: UiItem): string {
  if (it.key === 'US100') return 'NASDAQ';
  if (it.key === 'EURUSD') return 'FOREX';
  if (it.key === 'GOLD') return 'COMMODITY';
  if (it.key === 'OIL') return 'ENERGY';
  return 'MARKET';
}

export default function AssetsBar() {
  const token =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ??
    '';

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [sparks, setSparks] = useState<Record<UiKey, Array<[number, number]>>>({
    US100: [], EURUSD: [], GOLD: [], OIL: []
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<{ tries: number; timer?: any }>({ tries: 0 });

  // Hydratacja danymi z paska na stronie głównej (TickerFinnhub → localStorage)
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
      ITEMS.forEach((it) => {
        const q = parsed[it.symbol];
        if (q) next[it.symbol] = q;
      });
      if (Object.keys(next).length) {
        setQuotes((prev) => ({ ...next, ...prev }));
      }
    } catch { /* noop */ }
  }, []);

  // initial quotes
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!token) return;
      try {
        const results = await Promise.allSettled(
          ITEMS.map(async (it) => {
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
      } catch { /* noop */ }
    }
    void boot();
    return () => { cancelled = true; };
  }, [token]);

  // live quotes
  useEffect(() => {
    if (!token) return;
    const connect = () => {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
      wsRef.current = ws;
      ws.onopen = () => {
        reconnectRef.current.tries = 0;
        ITEMS.forEach((it) => ws.send(JSON.stringify({ type: 'subscribe', symbol: it.symbol })));
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
          ITEMS.forEach((it) => ws.send(JSON.stringify({ type: 'unsubscribe', symbol: it.symbol })));
        }
        ws?.close();
      } catch {}
      if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer);
    };
  }, [token]);

  // sparklines
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const resp = await Promise.all(
          ITEMS.map(async (it) => {
            const endpoint = token
              ? `/api/quotes/finnhub-spark?symbol=${encodeURIComponent(it.symbol)}&range=7d&interval=1h`
              : `/api/quotes/sparkline?symbols=${encodeURIComponent(it.key)}&range=7d&interval=1h`;
            const r = await fetch(endpoint, { cache: 'no-store' });
            const j = await r.json();
            if (token) {
              const series: Array<[number, number]> = Array.isArray(j?.series) ? j.series : [];
              return { key: it.key, series } as const;
            } else {
              const arr: Array<{ symbol: string; series: Array<[number, number]> }> = Array.isArray(j?.data) ? j.data : [];
              const match = arr.find((x) => x.symbol.toUpperCase() === it.key.toUpperCase());
              return { key: it.key, series: match?.series ?? [] } as const;
            }
          })
        );
        if (!alive) return;
        const map: Record<UiKey, Array<[number, number]>> = { US100: [], EURUSD: [], GOLD: [], OIL: [] };
        for (const r of resp) map[r.key] = r.series;
        setSparks(map);
      } catch {}
    }
    void load();
    return () => { alive = false; };
  }, [token]);

  function qFor(key: UiKey) {
    const symbol = ITEMS.find(i => i.key === key)!.symbol;
    return quotes[symbol];
  }

  return (
    <div className="flex flex-col gap-2">
      {ITEMS.map((it) => {
        const q = qFor(it.key) ?? {};
        const s = sparks[it.key] || [];
        // Fallback: jeśli nie mamy changePct z /quote, policz z serii (ostatni vs pierwszy)
        const seriesPct =
          s && s.length > 1 ? ((s[s.length - 1][1] - s[0][1]) / Math.max(1e-9, s[0][1])) * 100 : undefined;
        const pct = typeof q.changePct === 'number' ? q.changePct : seriesPct;
        const up = pct != null ? pct >= 0 : undefined;
        const colorCls = up == null ? 'text-slate-500' : up ? 'text-emerald-600' : 'text-rose-600';
        // Fallback ceny na podstawie serii (ostatni punkt), gdy brak /quote
        const seriesLast = s && s.length ? s[s.length - 1][1] : undefined;
        const effPrice = (typeof q.price === 'number' ? q.price : seriesLast);
        const path = buildSparkPath(s);
        return (
          <div key={it.key} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                  {it.icon ?? '◎'}
                </span>
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="text-base text-slate-900 font-bold truncate uppercase">{it.label}</div>
                  <div className="text-[11px] text-slate-500 tracking-wide">{marketLabel(it)} · {altCode(it)}</div>
                </div>
              </div>
              <div className="text-right shrink-0 w-28 leading-tight">
                <div className={`text-lg font-semibold tabular-nums ${up == null ? 'text-slate-900' : up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {fmtPrice(it.key, effPrice)}
                </div>
                <div className="flex items-center justify-end gap-1 text-xs">
                  <span className={colorCls}>
                    {up == null ? '…' : up ? '▲ ' : '▼ '}
                    {pct != null ? Math.abs(pct).toFixed(2) : '—'}%
                  </span>
                  <span className="rounded-full border border-slate-200 px-1 text-[10px] leading-none text-slate-500">24h</span>
                </div>
              </div>
            </div>
            <div className="mt-2 h-5">
              <svg width="100%" height="20" viewBox="0 0 120 20" aria-hidden>
                <path d={path} fill="none" stroke="currentColor" className={up == null ? 'text-slate-300' : up ? 'text-emerald-500' : 'text-rose-500'} strokeWidth="2" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}


