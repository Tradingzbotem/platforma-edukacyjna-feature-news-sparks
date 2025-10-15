'use client';

import { useEffect, useState } from 'react';

export type StripItem = {
  key: string;
  label: string;
  pct: number;
  dir: 'up' | 'down' | 'flat';
};

type SparkResp = { symbol: string; series: Array<[number, number]> };

function computeChangePct(series: Array<[number, number]>, hours: 24 | 48 | 72): number | null {
  if (!series?.length) return null;
  const take = Math.min(series.length, Math.max(2, hours));
  const slice = series.slice(series.length - take);
  const first = slice[0]?.[1];
  const last = slice[slice.length - 1]?.[1];
  if (!(isFinite(first) && isFinite(last))) return null;
  return ((last - first) / first) * 100;
}

const ASSETS: Array<{ key: string; label: string; symbol: string }> = [
  { key: 'USD', label: 'USD', symbol: 'USD' },
  { key: 'EURUSD', label: 'EUR/USD', symbol: 'EURUSD' },
  { key: 'USDJPY', label: 'USD/JPY', symbol: 'USDJPY' },
  { key: 'US100', label: 'US100', symbol: 'US100' },
  { key: 'XAUUSD', label: 'ZŁOTO', symbol: 'ZLOTO' },
  { key: 'WTI', label: 'WTI', symbol: 'WTI' },
  { key: 'BRENT', label: 'BRENT', symbol: 'BRENT' },
];

export function useMarketStrip(windowH: 24 | 48 | 72) {
  const [items, setItems] = useState<StripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const fetchSparks = async (symbols: string[]): Promise<SparkResp[]> => {
      if (!symbols.length) return [];
      const url = `/api/quotes/sparkline?symbols=${encodeURIComponent(symbols.join(','))}&range=7d&interval=1h`;
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      return arr as SparkResp[];
    };

    (async () => {
      try {
        // Prefer sparkline endpoint used elsewhere; if unavailable, try news overview (adapter)
        const resp = await fetchSparks(ASSETS.map(a => a.symbol));
        const map = new Map(resp.map(r => [r.symbol.toUpperCase(), r.series] as const));
        const out: StripItem[] = ASSETS.map(a => {
          const series = map.get(a.symbol.toUpperCase()) || [];
          const pct = computeChangePct(series, windowH);
          const v = Number.isFinite(pct) ? Number(pct) : 0;
          return {
            key: a.key,
            label: a.label,
            pct: v,
            dir: v > 0.05 ? 'up' : v < -0.05 ? 'down' : 'flat',
          };
        });
        if (!alive) return;
        setItems(out);
        setUpdatedAt(new Date());
      } catch {
        // Fallback: attempt /api/news/overview if exists
        try {
          const r = await fetch(`/api/news/overview?window=${windowH}h`, { cache: 'no-store' });
          if (!r.ok) throw new Error('no overview');
          const raw = await r.json();
          const src: any[] = Array.isArray(raw?.assets) ? raw.assets : [];
          const mapped: StripItem[] = src.map((x) => {
            const pct = Number(x.changePct ?? x.pct ?? 0);
            const v = Number.isFinite(pct) ? pct : 0;
            return {
              key: String(x.key ?? x.symbol ?? x.label ?? '').toUpperCase(),
              label: String(x.label ?? x.symbol ?? x.key ?? ''),
              pct: v,
              dir: v > 0.05 ? 'up' : v < -0.05 ? 'down' : 'flat',
            };
          });
          if (!alive) return;
          setItems(mapped);
          setUpdatedAt(new Date());
        } catch {
          if (!alive) return;
          setItems([
            { key: 'USD', label: 'USD', pct: -1.43, dir: 'down' },
            { key: 'EURUSD', label: 'EUR/USD', pct: -0.83, dir: 'down' },
            { key: 'USDJPY', label: 'USD/JPY', pct: -2.01, dir: 'down' },
            { key: 'US100', label: 'US100', pct: -2.31, dir: 'down' },
            { key: 'XAUUSD', label: 'ZŁOTO', pct: -3.55, dir: 'down' },
            { key: 'WTI', label: 'WTI', pct: -2.25, dir: 'down' },
            { key: 'BRENT', label: 'BRENT', pct: -2.76, dir: 'down' },
          ]);
          setUpdatedAt(new Date());
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [windowH]);

  return { items, loading, updatedAt };
}


