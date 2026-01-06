'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Pencil } from 'lucide-react';

type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };

const TOPBAR_SYMBOLS = [
  'OANDA:NAS100_USD',
  'OANDA:XAU_USD',
  'OANDA:WTICO_USD',
  'OANDA:BCO_USD',
  'OANDA:EUR_USD',
  'OANDA:USD_JPY',
  'OANDA:US500_USD',
  'BINANCE:BTCUSDT',
  'BINANCE:ETHUSDT',
] as const;
const STORAGE_KEY = `ticker:finnhub:v1:${[
  'OANDA:NAS100_USD',
  'OANDA:XAU_USD',
  'OANDA:WTICO_USD',
  'OANDA:BCO_USD',
  'OANDA:EUR_USD',
  'OANDA:USD_JPY',
  'OANDA:US500_USD',
].join(',')}`;
const CUSTOM_LIST_KEY = 'watchlist:custom:list:v1';

function labelFor(symbol: string) {
  const map: Record<string, string> = {
    'OANDA:NAS100_USD': 'US100',
    'OANDA:XAU_USD': 'GOLD',
    'OANDA:WTICO_USD': 'OIL',
    'OANDA:BCO_USD': 'OIL Brent',
    'OANDA:EUR_USD': 'EURUSD',
    'OANDA:USD_JPY': 'USDJPY',
    'OANDA:US500_USD': 'SP500',
    'BINANCE:BTCUSDT': 'BTCUSD',
    'BINANCE:ETHUSDT': 'ETHUSD',
  };
  return map[symbol] || symbol.split(':').pop() || symbol;
}

function fmt(n: number | undefined, digits = 2) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export default function WatchlistCustom() {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [list, setList] = useState<string[]>([]);
  const [edit, setEdit] = useState(false);
  const [addSymbol, setAddSymbol] = useState<string>('');

  // load list
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_LIST_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : null;
      setList(parsed && Array.isArray(parsed) && parsed.length ? parsed : ['OANDA:NAS100_USD', 'OANDA:EUR_USD', 'OANDA:XAU_USD']);
    } catch {
      setList(['OANDA:NAS100_USD', 'OANDA:EUR_USD', 'OANDA:XAU_USD']);
    }
  }, []);

  // persist list
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_LIST_KEY, JSON.stringify(list));
    } catch {}
  }, [list]);

  // poll quotes from shared storage populated by ticker
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, Quote>) : {};
        setQuotes(parsed || {});
      } catch {}
    };
    read();
    const id = setInterval(read, 1000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    return list.map((symbol) => {
      const q = quotes[symbol] ?? {};
      const up = typeof q.changePct === 'number' ? q.changePct >= 0 : undefined;
      const color = up == null ? 'text-white/60' : up ? 'text-emerald-400' : 'text-rose-400';
      return (
        <div key={symbol} className="py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center -mx-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
            <span>{labelFor(symbol)}</span>
            <span className="text-xs text-white/50">{symbol}</span>
          </div>
          <div className="text-right">
            <div className="leading-5">
              <span className="font-semibold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmt(q.price, 2)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs">
              {q.changePct == null ? (
                <span className="inline-block h-3 w-10 rounded bg-white/10 align-middle" aria-hidden />
              ) : (
                <span className={color} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {up ? '+ ' : '− '}
                  {Math.abs(q.changePct).toFixed(2)}%
                </span>
              )}
              <span className="rounded-full border border-white/15 px-1 text-[10px] leading-none text-white/70">24h</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center justify-end">
            {edit && (
              <button
                type="button"
                onClick={() => setList((prev) => prev.filter((s) => s !== symbol))}
                className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold bg-rose-500/10 text-rose-200 ring-1 ring-inset ring-rose-400/30 hover:bg-rose-500/20"
                aria-label={`Usuń ${symbol}`}
                title="Usuń"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      );
    });
  }, [list, quotes, edit]);

  const suggestions = useMemo(() => {
    return TOPBAR_SYMBOLS.filter((s) => !list.includes(s));
  }, [list]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Moja watchlista</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEdit((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 text-white font-semibold text-sm px-3 py-2 hover:bg-white/20 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <Pencil className="h-4 w-4" />
            {edit ? 'Zakończ edycję' : 'Edytuj'}
          </button>
        </div>
      </div>
      {edit && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={addSymbol}
            onChange={(e) => setAddSymbol(e.target.value)}
            className="rounded-lg bg-white/10 border border-white/10 px-2 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="">Wybierz instrument…</option>
            {suggestions.map((s) => (
              <option key={s} value={s}>
                {labelFor(s)} — {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              if (!addSymbol) return;
              setList((prev) => (prev.includes(addSymbol) ? prev : [...prev, addSymbol]));
              setAddSymbol('');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white text-slate-900 font-semibold text-sm px-3 py-2 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Dodaj
          </button>
        </div>
      )}
      <div className="mt-3 divide-y divide-white/10">{rows}</div>
    </section>
  );
}


