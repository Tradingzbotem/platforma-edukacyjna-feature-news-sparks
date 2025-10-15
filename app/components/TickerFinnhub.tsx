// app/components/TickerFinnhub.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  symbols?: string[];         // opcjonalnie możesz nadpisać listę
  className?: string;
  speedSec?: number;          // szybkość przesuwu (UI), domyślnie 40s
};

type Quote = {
  price?: number;
  prevClose?: number;
  changePct?: number;
  lastTs?: number;
};
type State = Record<string, Quote>;

const FINNHUB_WS = 'wss://ws.finnhub.io';
const FINNHUB_REST = 'https://finnhub.io/api/v1';

// Domyślna lista (to, o co prosiłeś)
const DEFAULT_SYMBOLS = [
  'OANDA:NAS100_USD', // US100
  'OANDA:XAU_USD',    // Złoto
  'OANDA:WTICO_USD',  // Ropa WTI
  'OANDA:BCO_USD',    // Ropa Brent
  'OANDA:EUR_USD',    // EUR/USD
  'OANDA:USD_JPY',    // USD/JPY
  'OANDA:US500_USD',  // US500
];

// Ładne etykiety
function niceLabel(symbol: string) {
  if (symbol.startsWith('OANDA:')) {
    const core = symbol.replace('OANDA:', '');
    if (core === 'NAS100_USD') return 'us100';
    if (core === 'US500_USD') return 'us500';
    if (core === 'XAU_USD')   return 'złoto';
    if (core === 'WTICO_USD') return 'wti';
    if (core === 'BCO_USD')   return 'brent';
    if (core.includes('_'))   return core.toLowerCase().replace('_', '/'); // np. eur/usd
  }
  return symbol.toLowerCase();
}

function fmtPrice(price?: number) {
  if (price == null || Number.isNaN(price)) return '—';
  return price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TickerFinnhub({ symbols, className, speedSec = 40 }: Props) {
  // ✅ Obsługa obu nazw zmiennych środowiskowych
  const token =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ??
    '';

  // Podpowiedź w konsoli, jeśli brak klucza
  useEffect(() => {
    if (!token) {
      console.warn(
        '[TickerFinnhub] Brak klucza Finnhub. Ustaw NEXT_PUBLIC_FINNHUB_KEY (lub NEXT_PUBLIC_FINNHUB_TOKEN) w .env.local'
      );
    }
  }, [token]);

  const list = symbols && symbols.length ? symbols : DEFAULT_SYMBOLS;

  // Klucz do localStorage (po liście symboli)
  const storageKey = `ticker:finnhub:v1:${list.join(',')}`;

  // Hydratacja: pokaż ostatnie znane wartości natychmiast po starcie (perceived performance)
  const [data, setData] = useState<State>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as State;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<{ tries: number; timer?: any }>({ tries: 0 });

  // Debounce zapisu do localStorage, by uniknąć nadmiernych zapisów przy tickach
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        /* noop */
      }
    }, 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, storageKey]);

  // 1) Startowe /quote (żeby coś było widać od razu)
  useEffect(() => {
    if (!token || list.length === 0) return;
    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled(
        list.map(async (s) => {
          const url = `${FINNHUB_REST}/quote?symbol=${encodeURIComponent(s)}&token=${token}`;
          const r = await fetch(url, { cache: 'no-store' });
          if (!r.ok) throw new Error(`${s} quote HTTP ${r.status}`);
          const j = await r.json(); // { c, pc, ... }
          const price = typeof j.c === 'number' ? j.c : undefined;
          const prevClose = typeof j.pc === 'number' ? j.pc : undefined;
          const changePct =
            price != null && prevClose != null && prevClose !== 0
              ? ((price - prevClose) / prevClose) * 100
              : undefined;
          return { s, q: { price, prevClose, changePct, lastTs: Date.now() } as Quote };
        })
      );

      if (cancelled) return;
      const next: State = {};
      for (const res of results) {
        if (res.status === 'fulfilled') next[res.value.s] = res.value.q;
      }
      if (!cancelled) setData((prev) => ({ ...next, ...prev }));
    })().catch(() => { /* noop */ });

    return () => {
      cancelled = true;
    };
  }, [list, token]);

  // 2) WebSocket live
  useEffect(() => {
    if (!token || list.length === 0) return;

    const connect = () => {
      const ws = new WebSocket(`${FINNHUB_WS}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectRef.current.tries = 0;
        list.forEach((s) => ws.send(JSON.stringify({ type: 'subscribe', symbol: s })));
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
              setData((prev) => {
                const prevClose = prev[s]?.prevClose;
                const changePct =
                  prevClose != null && prevClose !== 0 ? ((p - prevClose) / prevClose) * 100 : prev[s]?.changePct;
                return { ...prev, [s]: { price: p, prevClose, changePct, lastTs: t ?? Date.now() } };
              });
            }
          }
        } catch { /* noop */ }
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
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
          list.forEach((s) => ws.send(JSON.stringify({ type: 'unsubscribe', symbol: s })));
        }
        ws?.close();
      } catch {}
      if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer);
    };
  }, [list, token]);

  // 3) UI — ciągły marquee bez scrollbara
  const items = useMemo(() => {
    return list.map((s) => {
      const q = data[s] ?? {};
      const label = niceLabel(s);
      const up = q.changePct != null ? q.changePct >= 0 : undefined;

      return (
        <div key={s} className="flex items-center gap-2 px-3 py-2 border-r border-white/10">
          <span className="text-xs text-white/60 uppercase">{label}</span>
          <span className="text-sm font-semibold">{fmtPrice(q.price)}</span>
          {q.changePct != null ? (
            <span className={`text-xs ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {up ? '▲' : '▼'} {q.changePct.toFixed(2)}%
            </span>
          ) : (
            <span className="text-xs text-white/40">…</span>
          )}
        </div>
      );
    });
  }, [list, data]);

  return (
    <div className={`w-full bg-black/20 ${className || ''}`}>
      <div className="mx-auto max-w-7xl overflow-hidden relative">
        <div
          className="inline-flex will-change-transform"
          style={{ animation: `tickerScroll ${speedSec}s linear infinite` }}
        >
          {items}
          {items /* duplikat dla płynnej pętli */}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent" />
      </div>

      <style jsx>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
