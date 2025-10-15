'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type StreamDef = { label: string; stream: string; decimals?: number };
type Row = { label: string; price: number; base: number; ts: number; changePct: number };

const STREAMS: StreamDef[] = [
  { label: 'BTCUSD', stream: 'btcusdt@trade', decimals: 0 },
  { label: 'ETHUSD', stream: 'ethusdt@trade', decimals: 0 },
];

export default function TickerBinance({
  speedSec = 35,
  className = '',
}: { speedSec?: number; className?: string }) {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);
  const baseRef = useRef<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // ✅ separator MUSI być "/" dla combined streams
    const q = STREAMS.map(s => s.stream).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${q}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setStatus('connecting'); // live ustawimy po pierwszej wiadomości
      setLastError(null);
    });

    ws.addEventListener('message', (ev) => {
      try {
        const payload = JSON.parse(ev.data as string);
        const d = payload?.data;
        if (!d || typeof d.p !== 'string' || typeof d.s !== 'string') return;

        const sym = d.s.toUpperCase(); // BTCUSDT, ETHUSDT
        const label = sym === 'BTCUSDT' ? 'BTCUSD' : sym === 'ETHUSDT' ? 'ETHUSD' : sym;
        const price = parseFloat(d.p);
        if (!isFinite(price)) return;

        if (!baseRef.current[sym]) baseRef.current[sym] = price;
        const base = baseRef.current[sym];
        const changePct = base > 0 ? ((price - base) / base) * 100 : 0;

        setRows(prev => ({
          ...prev,
          [sym]: { label, price, base, ts: Date.now(), changePct },
        }));
        setStatus('live');
      } catch (e) {
        // nic, jedziemy dalej
      }
    });

    ws.addEventListener('error', (e) => {
      setStatus('error');
      setLastError('Błąd połączenia z Binance WS');
      console.error('Binance WS error:', e);
    });
    ws.addEventListener('close', () => {
      setStatus('error');
      if (!lastError) setLastError('Połączenie WebSocket zamknięte');
    });

    return () => { try { ws.close(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordered = useMemo(() => {
    return STREAMS.map(def => {
      // ✅ klucz: bez dodatkowego "T"
      const sym = def.stream.split('@')[0].toUpperCase(); // BTCUSDT / ETHUSDT
      const r = rows[sym];
      const price = r?.price;
      const pct = r?.changePct ?? 0;
      const pos = pct >= 0;
      const decimals = def.decimals ?? 2;

      return (
        <div
          key={def.stream}
          className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 mr-3"
          title={r ? new Date(r.ts).toLocaleTimeString() : 'brak danych'}
        >
          <span className="font-semibold">{def.label}</span>
          <span className="text-white/80 text-sm">
            {isFinite(price as number)
              ? (price as number).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
              : '…'}
          </span>
          <span className={`text-xs font-medium ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {pos ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
          </span>
        </div>
      );
    });
  }, [rows]);

  const duration = `${Math.max(10, speedSec)}s`;
  const dot =
    status === 'live' ? 'bg-emerald-400' :
    status === 'connecting' ? 'bg-amber-300' : 'bg-rose-400';
  const txt =
    status === 'live' ? 'LIVE (Binance WS)' :
    status === 'connecting' ? 'Łączenie…' : `Błąd${lastError ? ` — ${lastError}` : ''}`;

  return (
    <div className={`relative overflow-hidden border-y border-white/10 bg-black/20 ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/60 flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} /> {txt}
      </span>
      <div
        className="whitespace-nowrap will-change-transform pl-28"
        style={{ animation: 'tickerScroll linear infinite', animationDuration: duration }}
      >
        <div className="inline-flex items-center">{ordered}</div>
        <div className="inline-flex items-center">{ordered}</div>
      </div>
      <style jsx>{`
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
