'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Item = {
  label: string;         // wyświetlana etykieta
  symbol: string;        // symbol w Finnhub (np. BINANCE:BTCUSDT, OANDA:EUR_USD, SPY)
  decimals?: number;     // ile miejsc po przecinku
};

type LiveRow = {
  label: string;
  price: number;
  base?: number;
  changePct: number;
  ts: number;            // timestamp ostatniej aktualizacji
};

const DEFAULT_ITEMS: Item[] = [
  { label: 'US500',  symbol: 'OANDA:US500_USD',     decimals: 0 },
  { label: 'US100',  symbol: 'OANDA:NAS100_USD',    decimals: 0 },
  { label: 'EURUSD', symbol: 'OANDA:EUR_USD',       decimals: 5 },
  { label: 'USDJPY', symbol: 'OANDA:USD_JPY',       decimals: 3 },
  { label: 'USDPLN', symbol: 'OANDA:USD_PLN',       decimals: 4 },
  { label: 'XAUUSD', symbol: 'OANDA:XAU_USD',       decimals: 2 },
  { label: 'WTI',    symbol: 'OANDA:WTICO_USD',     decimals: 2 },
  { label: 'BTCUSD', symbol: 'BINANCE:BTCUSDT',     decimals: 0 },
  { label: 'ETHUSD', symbol: 'BINANCE:ETHUSDT',     decimals: 0 },
];

const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;

// pobiera snapshot (current/prev close) do wyliczenia %
async function fetchQuote(symbol: string) {
  if (!token) return null;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const q = await res.json(); // { c,d,dp,h,l,o,pc }
    if (typeof q?.c === 'number' && typeof q?.pc === 'number') {
      const base = q.pc;
      const price = q.c;
      const dp = base > 0 ? ((price - base) / base) * 100 : (q.dp ?? 0);
      return { price, base, pct: dp as number };
    }
  } catch {}
  return null;
}

export default function MarketTickerLive({
  items = DEFAULT_ITEMS,
  speedSec = 40,
  className = '',
  pollEveryMs = 15000, // fallback REST, gdy WS nie działa
}: {
  items?: Item[];
  speedSec?: number;
  className?: string;
  pollEveryMs?: number;
}) {
  const [rows, setRows] = useState<Record<string, LiveRow>>({});
  const [status, setStatus] = useState<'no-token' | 'connecting' | 'live' | 'polling' | 'error'>(
    token ? 'connecting' : 'no-token'
  );
  const baseRef = useRef<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // czytelny znacznik stanu
  const StatusDot = () => {
    const color =
      status === 'live' ? 'bg-emerald-400' :
      status === 'connecting' ? 'bg-amber-300' :
      status === 'polling' ? 'bg-sky-400' :
      status === 'no-token' ? 'bg-white/50' : 'bg-rose-400';
    const txt =
      status === 'live' ? 'LIVE (WebSocket)' :
      status === 'connecting' ? 'Łączenie…' :
      status === 'polling' ? 'Fallback (REST)' :
      status === 'no-token' ? 'Brak tokena' : 'Błąd';
    return (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/60 flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
        {txt}
      </span>
    );
  };

  // start/stop fallback REST
  const startPolling = () => {
    if (pollRef.current) return;
    setStatus(token ? 'polling' : 'no-token');
    const run = async () => {
      for (const it of items) {
        const snap = await fetchQuote(it.symbol);
        if (!snap) continue;
        setRows(prev => ({
          ...prev,
          [it.symbol]: {
            label: it.label,
            price: snap.price,
            base: snap.base,
            changePct: snap.pct,
            ts: Date.now(),
          }
        }));
      }
    };
    run();
    pollRef.current = setInterval(run, Math.max(5000, pollEveryMs));
  };
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // WebSocket live
  useEffect(() => {
    if (!token) { startPolling(); return; }

    setStatus('connecting');
    const ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      items.forEach(it => ws.send(JSON.stringify({ type: 'subscribe', symbol: it.symbol })));
      setStatus('live');
      stopPolling(); // jeśli włączony, to wyłącz
    });

    ws.addEventListener('message', (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload?.type !== 'trade' || !Array.isArray(payload.data)) return;

        setRows(prev => {
          const next = { ...prev };
          for (const t of payload.data) {
            const sym: string = t.s;
            const price: number = t.p;
            const item = items.find(i => i.symbol === sym);
            if (!item || !isFinite(price)) continue;

            if (!baseRef.current[sym]) {
              // pierwszy tick – spróbujmy mieć sensowną bazę z REST
              // (bez await – fire-and-forget)
              fetchQuote(sym).then(snap => {
                if (snap?.base) baseRef.current[sym] = snap.base;
              }).catch(() => {});
              baseRef.current[sym] = price;
            }
            const base = baseRef.current[sym];
            const changePct = base > 0 ? ((price - base) / base) * 100 : 0;

            next[sym] = {
              label: item.label,
              price,
              base,
              changePct,
              ts: Date.now(),
            };
          }
          return next;
        });
      } catch {}
    });

    ws.addEventListener('close', () => {
      // przechodzimy na fallback REST
      startPolling();
    });

    ws.addEventListener('error', () => {
      setStatus('error');
      startPolling();
    });

    return () => {
      try {
        items.forEach(it => ws.send(JSON.stringify({ type: 'unsubscribe', symbol: it.symbol })));
      } catch {}
      ws.close();
      stopPolling();
    };
  }, [items]);

  // render listy (dublujemy do płynnego loopa)
  const ordered = useMemo(() => {
    return items.map((it) => {
      const r = rows[it.symbol];
      const decimals = it.decimals ?? 2;
      const price = r?.price ?? NaN;
      const pct = r?.changePct ?? 0;
      const positive = pct >= 0;

      return (
        <div
          key={it.symbol}
          className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 mr-3"
          title={`${it.symbol}${r?.ts ? ' • ' + new Date(r.ts).toLocaleTimeString() : ''}`}
        >
          <span className="font-semibold">{it.label}</span>
          <span className="text-white/80 text-sm">
            {isFinite(price)
              ? price.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
              : '…'}
          </span>
          <span className={`text-xs font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {positive ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
          </span>
        </div>
      );
    });
  }, [items, rows]);

  const duration = `${Math.max(10, speedSec)}s`;

  return (
    <div className={`relative overflow-hidden border-y border-white/10 bg-black/20 ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent" />

      <StatusDot />

      <div
        className="whitespace-nowrap will-change-transform pl-28" /* miejsce dla statusu */
        style={{ animation: 'tickerScroll linear infinite', animationDuration: duration }}
      >
        <div className="inline-flex items-center">{ordered}</div>
        <div className="inline-flex items-center">{ordered}</div>
      </div>

      <style jsx>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
