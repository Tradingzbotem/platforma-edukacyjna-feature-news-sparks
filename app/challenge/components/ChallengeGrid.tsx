'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ChallengeCard, { type ChallengeCardProps } from './ChallengeCard';
import { REFRESH_WINDOW_MS } from '../config';

/** proste helpery czasu */
const H = 60 * 60 * 1000;
const D = 24 * H;

function endIn(msFromNow: number) {
  return Date.now() + msFromNow;
}

/** deadline → „nowa runda ≤30s” */
function refreshBy(deadlineMs: number) {
  return deadlineMs + REFRESH_WINDOW_MS;
}

type CardData = Omit<ChallengeCardProps, 'userId' | 'onPick'>;

type Category = 'forex' | 'surowce' | 'akcje' | 'indeksy' | 'krypto';

type CategorizedData = {
  category: Category;
  label: string;
  items: CardData[];
};

function getCategory(ticker: string): Category {
  const t = ticker.toUpperCase();
  // Forex - wszystkie pary walutowe
  if (['EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURPLN', 'USDPLN', 'GBPPLN', 'CHFPLN'].includes(t)) {
    return 'forex';
  }
  // Indeksy - sprawdzamy PRZED surowcami, aby US100 i US500 nie trafiły do surowców
  if (['US100', 'US500', 'DE40', 'DAX', 'US30', 'SPX500', 'NAS100', 'SP500', 'SPX'].includes(t)) {
    return 'indeksy';
  }
  // Surowce
  if (['OIL.WTI', 'WTI', 'OIL', 'BRENT', 'XAUUSD', 'GOLD', 'XAGUSD', 'SILVER', 'NG', 'NATGAS'].includes(t)) {
    return 'surowce';
  }
  // Akcje
  if (['TSLA', 'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'].includes(t)) {
    return 'akcje';
  }
  // Krypto
  if (['BTCUSD', 'BTC', 'ETHUSD', 'ETH'].includes(t)) {
    return 'krypto';
  }
  // Domyślnie surowce
  return 'surowce';
}

function categorizeItems(items: CardData[]): CategorizedData[] {
  const categorized: Record<Category, CardData[]> = {
    forex: [],
    surowce: [],
    akcje: [],
    indeksy: [],
    krypto: [],
  };

  for (const item of items) {
    const category = getCategory(item.ticker);
    categorized[category].push(item);
  }

  const categoryLabels: Record<Category, string> = {
    forex: 'Forex',
    surowce: 'Surowce',
    akcje: 'Akcje',
    indeksy: 'Indeksy',
    krypto: 'Kryptowaluty',
  };

  return Object.entries(categorized)
    .filter(([_, items]) => items.length > 0)
    .map(([key, items]) => ({
      category: key as Category,
      label: categoryLabels[key as Category],
      items,
    }));
}

function getAssetDisplayName(ticker: string): string {
  const t = ticker.toUpperCase();
  const names: Record<string, string> = {
    'OIL.WTI': 'Ropa WTI',
    'WTI': 'Ropa WTI',
    'BRENT': 'Ropa Brent',
    'XAUUSD': 'GOLD',
    'XAGUSD': 'Srebro',
    'NG': 'NATGAS',
    'DE40': 'DAX',
    'US100': 'Nasdaq 100',
    'US500': 'S&P 500',
    'SPX500': 'S&P 500',
    'SP500': 'S&P 500',
    'SPX': 'S&P 500',
    'NAS100': 'Nasdaq 100',
    'BTCUSD': 'Bitcoin',
    'ETHUSD': 'Ethereum',
  };
  return names[t] || ticker;
}

function getAutoNewsFor(ticker: string): string[] {
  const t = ticker.toUpperCase();
  const newsMap: Record<string, string[]> = {
    'OIL.WTI': ['WTI', 'OIL', 'OIL.WTI', 'Crude'],
    'WTI': ['WTI', 'OIL', 'Crude'],
    'BRENT': ['BRENT', 'Brent', 'Crude'],
    'XAUUSD': ['XAUUSD', 'GOLD', 'Złoto'],
    'XAGUSD': ['XAGUSD', 'SILVER', 'Srebro'],
    'NG': ['NG', 'NATGAS', 'Natural Gas'],
    'DE40': ['DE40', 'DAX', 'GER40'],
    'US100': ['US100', 'NAS100', 'Nasdaq', 'Nasdaq 100'],
    'US500': ['US500', 'SPX', 'SP500', 'S&P 500', 'S&P500'],
    'SPX500': ['US500', 'SPX', 'SP500', 'S&P 500', 'S&P500'],
    'SP500': ['US500', 'SPX', 'SP500', 'S&P 500', 'S&P500'],
    'SPX': ['US500', 'SPX', 'SP500', 'S&P 500', 'S&P500'],
    'NAS100': ['US100', 'NAS100', 'Nasdaq', 'Nasdaq 100'],
    'BTCUSD': ['BTCUSD', 'BTC', 'Bitcoin'],
    'ETHUSD': ['ETHUSD', 'ETH', 'Ethereum'],
    'EURUSD': ['EURUSD', 'EUR/USD', 'EUR', 'USD'],
    'USDJPY': ['USDJPY', 'USD/JPY', 'JPY'],
    'TSLA': ['TSLA', 'Tesla'],
    'NVDA': ['NVDA', 'NVIDIA'],
    'AAPL': ['AAPL', 'Apple'],
  };
  return newsMap[t] || [ticker];
}

function generateChallengesForAsset(ticker: string): CardData[] {
  const eod = endIn(8 * H);
  const h48 = endIn(48 * H);
  const h24 = endIn(24 * H);
  const d5 = endIn(5 * D);
  const displayName = getAssetDisplayName(ticker);
  const autoNewsFor = getAutoNewsFor(ticker);

  return [
    {
      title: `${displayName} — EOD`,
      ticker,
      horizon: 'EOD',
      deadlineMs: eod,
      nextRefreshByMs: refreshBy(eod),
      autoNewsFor,
    },
    {
      title: `${displayName} — 48h`,
      ticker,
      horizon: '48h',
      deadlineMs: h48,
      nextRefreshByMs: refreshBy(h48),
      autoNewsFor,
    },
    {
      title: `${displayName} — 24h`,
      ticker,
      horizon: '24h',
      deadlineMs: h24,
      nextRefreshByMs: refreshBy(h24),
      autoNewsFor,
    },
    {
      title: `${displayName} — 5 dni`,
      ticker,
      horizon: '5 dni',
      deadlineMs: d5,
      nextRefreshByMs: refreshBy(d5),
      autoNewsFor,
    },
  ];
}

function useChallengeData(): CardData[] {
  const [availableAssets, setAvailableAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch('/api/challenge/available-assets', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data?.assets)) {
          setAvailableAssets(data.assets);
        }
      } catch (err) {
        console.warn('Failed to fetch available assets', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
    // Odśwież co 60 sekund, aby wykryć nowe aktywa z override
    const interval = setInterval(fetchAssets, 60000);
    return () => clearInterval(interval);
  }, []);

  const showTest = process.env.NEXT_PUBLIC_CHALLENGE_TEST === '1';

  const items: CardData[] = [];

  // Test challenge
  if (showTest) {
    items.push({
      title: 'EURUSD — TEST (60s)',
      ticker: 'EURUSD',
      horizon: 'TEST-60s',
      deadlineMs: Date.now() + 60_000,
      nextRefreshByMs: Date.now() + 90_000,
      autoNewsFor: ['EURUSD', 'EUR/USD', 'EUR', 'USD'],
    });
  }

  // Generuj challenge dla każdego aktywa z override
  if (!loading && availableAssets.length > 0) {
    for (const asset of availableAssets) {
      items.push(...generateChallengesForAsset(asset));
    }
  }

  return items;
}

export default function ChallengeGrid({ userId }: { userId: string }) {
  const items = useChallengeData();
  const categorized = useMemo(() => categorizeItems(items), [items]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(['forex', 'surowce', 'akcje', 'indeksy', 'krypto'])
  );

  // Filtruj karty na podstawie wyszukiwania
  const filteredCategorized = useMemo(() => {
    if (!searchQuery.trim()) {
      return categorized;
    }

    const query = searchQuery.trim().toUpperCase();
    return categorized.map(({ category, label, items: categoryItems }) => {
      const filtered = categoryItems.filter((item) => {
        const tickerMatch = item.ticker.toUpperCase().includes(query);
        const titleMatch = item.title.toUpperCase().includes(query);
        const displayNameMatch = getAssetDisplayName(item.ticker).toUpperCase().includes(query);
        return tickerMatch || titleMatch || displayNameMatch;
      });
      return { category, label, items: filtered };
    }).filter(({ items }) => items.length > 0);
  }, [categorized, searchQuery]);

  const toggleCategory = (category: Category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Pole wyszukiwania */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Wyszukaj aktywo (np. EURUSD, GOLD, TSLA)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/10 focus:outline-none"
        />
      </div>

      <div className="space-y-6">
        {filteredCategorized.map(({ category, label, items: categoryItems }) => {
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div key={category} className="space-y-3">
              <button
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
              >
                <h2 className="text-lg font-semibold text-white">
                  {label} <span className="text-sm font-normal text-white/60">({categoryItems.length})</span>
                </h2>
                <span className="text-white/60">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              
              {isExpanded && (
                <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryItems.map((props, i) => (
                    <ChallengeCard
                      key={`${props.ticker}-${category}-${i}`}
                      {...props}
                      userId={userId}
                      onPick={undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCategorized.length === 0 && searchQuery && (
        <div className="py-12 text-center text-white/60">
          Brak wyników dla "{searchQuery}"
        </div>
      )}
    </div>
  );
}
