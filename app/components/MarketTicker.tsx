'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type TickerItem = {
  symbol: string;
  price: number;   // bieżąca cena
  change: number;  // zmiana % (np. 0.35 to +0.35%)
};

type Props = {
  /** Jeśli nie podasz items – włączą się dane demo z lekką animacją */
  items?: TickerItem[];
  /** Ile sekund trwa pełne przejście taśmy w lewo */
  speedSec?: number;
  className?: string;
};

const DEMO: TickerItem[] = [
  { symbol: 'US500',   price: 5632.14, change: +0.42 },
  { symbol: 'US100',   price: 19876.5, change: -0.31 },
  { symbol: 'DE40',    price: 18224.9, change: +0.11 },
  { symbol: 'EURUSD',  price: 1.0852,  change: -0.05 },
  { symbol: 'USDJPY',  price: 151.72,  change: +0.18 },
  { symbol: 'XAUUSD',  price: 2342.1,  change: +0.27 },
  { symbol: 'XTIUSD',  price: 77.83,   change: -0.62 },
  { symbol: 'BTCUSD',  price: 67450,   change: +1.24 },
];

export default function MarketTicker({ items, speedSec = 40, className = '' }: Props) {
  const [data, setData] = useState<TickerItem[]>(() => items ?? DEMO);

  // aktualizuj, jeśli podasz items z góry
  useEffect(() => {
    if (items) setData(items);
  }, [items]);

  // delikatne „życie” dla dema – losowy dryf co kilka sekund
  useEffect(() => {
    if (items) return; // gdy mamy prawdziwe dane, nie dotykamy
    const id = setInterval(() => {
      setData((prev) =>
        prev.map((x) => {
          const driftPct = (Math.random() - 0.5) * 0.3; // +-0.15% ~ 0.30% zakres
          const nextPrice = x.price * (1 + driftPct / 100);
          return {
            ...x,
            price: Number(nextPrice.toFixed(x.symbol.endsWith('JPY') ? 3 : x.symbol.includes('USD') ? 2 : 2)),
            change: Number(driftPct.toFixed(2)),
          };
        })
      );
    }, 4000);
    return () => clearInterval(id);
  }, [items]);

  const row = useMemo(
    () =>
      data.map((it, idx) => {
        const positive = it.change >= 0;
        return (
          <div
            key={`${it.symbol}-${idx}`}
            className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 mr-3"
          >
            <span className="font-semibold">{it.symbol}</span>
            <span className="text-white/80 text-sm">
              {it.price.toLocaleString(undefined, { minimumFractionDigits: it.symbol.endsWith('JPY') ? 3 : 2 })}
            </span>
            <span className={`text-xs font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {positive ? '▲' : '▼'} {Math.abs(it.change).toFixed(2)}%
            </span>
          </div>
        );
      }),
    [data]
  );

  return (
    <div className={`relative overflow-hidden border-y border-white/10 bg-black/20 ${className}`}>
      {/* gradienty brzegu (estetyka) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent" />

      {/* taśma (dublujemy zawartość dla płynnej pętli) */}
      <div
        className="whitespace-nowrap will-change-transform"
        style={{
          animation: `tickerScroll linear infinite`,
          animationDuration: `${speedSec}s`,
        }}
      >
        <div className="inline-flex items-center">{row}</div>
        <div className="inline-flex items-center">{row}</div>
      </div>

      {/* keyframes lokalnie – brak zmian w Tailwind config */}
      <style jsx>{`
        @keyframes tickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
