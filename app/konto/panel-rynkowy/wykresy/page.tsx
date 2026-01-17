'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TradingViewAdvancedEmbed from '@/components/widgets/TradingViewAdvancedEmbed';
import TechnicalSnapshotPanel from '@/components/charts/TechnicalSnapshotPanel';
import MacroEventsPanel from '@/components/charts/MacroEventsPanel';
import MarketStressIndex from '@/components/charts/MarketStressIndex';

type SymbolKey = 'US100' | 'GOLD' | 'OIL' | 'EURUSD' | 'SP500' | 'DAX40' | 'BTCUSD' | 'ETHUSD' | 'USDJPY' | 'GBPUSD';

function mapKeyToTvSymbol(key: SymbolKey): { tv: string; label: string } {
  switch (key) {
    case 'GOLD':
      return { tv: 'OANDA:XAUUSD', label: 'Złoto' };
    case 'OIL':
      return { tv: 'OANDA:WTICOUSD', label: 'Ropa' };
    case 'EURUSD':
      return { tv: 'OANDA:EURUSD', label: 'EUR/USD' };
    case 'SP500':
      return { tv: 'CAPITALCOM:US500', label: 'S&P 500' };
    case 'DAX40':
      return { tv: 'OANDA:DE30EUR', label: 'DAX40' };
    case 'BTCUSD':
      return { tv: 'BINANCE:BTCUSDT', label: 'BTC/USD' };
    case 'ETHUSD':
      return { tv: 'BINANCE:ETHUSDT', label: 'ETH/USD' };
    case 'USDJPY':
      return { tv: 'OANDA:USDJPY', label: 'USD/JPY' };
    case 'GBPUSD':
      return { tv: 'OANDA:GBPUSD', label: 'GBP/USD' };
    case 'US100':
    default:
      return { tv: 'OANDA:NAS100USD', label: 'US100' };
  }
}

export default function Page() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = (sp.get('symbol') || 'US100').toUpperCase();
  const currentKey: SymbolKey = 
    q === 'GOLD' ? 'GOLD' : 
    q === 'OIL' ? 'OIL' : 
    q === 'EURUSD' ? 'EURUSD' :
    q === 'SP500' ? 'SP500' :
    q === 'DAX40' ? 'DAX40' :
    q === 'BTCUSD' ? 'BTCUSD' :
    q === 'ETHUSD' ? 'ETHUSD' :
    q === 'USDJPY' ? 'USDJPY' :
    q === 'GBPUSD' ? 'GBPUSD' :
    'US100';
  const mapped = useMemo(() => mapKeyToTvSymbol(currentKey), [currentKey]);
  const [sentimentRange, setSentimentRange] = useState<'24h' | '48h' | '72h'>('24h');

  const setKey = (k: SymbolKey) => {
    const params = new URLSearchParams(sp.toString());
    params.set('symbol', k);
    router.push(`?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Wykres — {mapped.label}</h1>
          <p className="mt-1 text-sm text-white/60">
            Dane wykresu pochodzą z osadzonego widżetu TradingView. Materiał edukacyjny.
          </p>
        </header>

        <section className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                type="button"
                onClick={() => setKey('US100')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'US100' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'US100'}
              >
                US100
              </button>
              <button
                type="button"
                onClick={() => setKey('GOLD')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'GOLD' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'GOLD'}
              >
                Złoto
              </button>
              <button
                type="button"
                onClick={() => setKey('OIL')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'OIL' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'OIL'}
              >
                Ropa
              </button>
              <button
                type="button"
                onClick={() => setKey('EURUSD')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'EURUSD' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'EURUSD'}
              >
                EUR/USD
              </button>
              <button
                type="button"
                onClick={() => setKey('SP500')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'SP500' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'SP500'}
              >
                SP500
              </button>
              <button
                type="button"
                onClick={() => setKey('DAX40')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'DAX40' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'DAX40'}
              >
                DAX40
              </button>
            </div>
            <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                type="button"
                onClick={() => setKey('BTCUSD')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'BTCUSD' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'BTCUSD'}
              >
                BTC/USD
              </button>
              <button
                type="button"
                onClick={() => setKey('ETHUSD')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'ETHUSD' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'ETHUSD'}
              >
                ETH/USD
              </button>
              <button
                type="button"
                onClick={() => setKey('USDJPY')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'USDJPY' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'USDJPY'}
              >
                USD/JPY
              </button>
              <button
                type="button"
                onClick={() => setKey('GBPUSD')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${currentKey === 'GBPUSD' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={currentKey === 'GBPUSD'}
              >
                GBP/USD
              </button>
            </div>
          </div>
          <div className="mt-3">
            <TradingViewAdvancedEmbed
              symbol={mapped.tv}
              className="w-full"
              containerClassName="h-full w-full"
            />
          </div>
          <div className="mt-2 text:[11px] text-white/60">
            Wykres dostarczany przez{' '}
            <a
              className="underline hover:opacity-80"
              href="https://www.tradingview.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              TradingView
            </a>
            .
          </div>
        </section>

        {/* Górny rząd: Technika + Makro */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TechnicalSnapshotPanel assetKey={currentKey} />
          <MacroEventsPanel assetKey={currentKey} />
        </div>

        {/* Wskaźnik stresu rynkowego */}
        <div className="mt-6">
          <MarketStressIndex 
            range={sentimentRange} 
            onRangeChange={(r) => setSentimentRange(r)}
          />
        </div>
      </div>
    </main>
  );
}


