'use client';

import { useEffect, useState, useMemo } from 'react';

type PriceInfo = {
  price: number | null;
  updatedAt: string | null;
  change: number | null; // procentowa zmiana
  direction: 'up' | 'down' | 'flat' | null;
};

/**
 * Hook do śledzenia zmiany ceny override dla challenge.
 * Porównuje cenę początkową (zapisaną w localStorage) z aktualną ceną.
 */
export function usePriceChange(ticker: string, challengeKey: string, deadlineMs: number) {
  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    price: null,
    updatedAt: null,
    change: null,
    direction: null,
  });
  const [loading, setLoading] = useState(true);

  // Mapowanie tickera na override key (jak w TechnicalSnapshotPanel)
  const overrideKey = useMemo(() => {
    const t = ticker.toUpperCase();
    if (t === 'OIL.WTI' || t === 'WTI' || t === 'OIL') return 'WTI';
    if (t === 'DE40' || t === 'DAX') return 'DE40';
    if (t === 'XAUUSD' || t === 'GOLD') return 'XAUUSD';
    if (t === 'EURUSD') return 'EURUSD';
    if (t === 'USDJPY') return 'USDJPY';
    if (t === 'BTCUSD' || t === 'BTC') return 'BTCUSD';
    if (t === 'ETHUSD' || t === 'ETH') return 'ETHUSD';
    if (t === 'GBPUSD') return 'GBPUSD';
    if (t === 'NG' || t === 'NATGAS') return 'NG';
    // Dla akcji (TSLA, NVDA, AAPL) użyj tickera bezpośrednio
    return t;
  }, [ticker]);

  useEffect(() => {
    let alive = true;
    const storageKey = `fxedu:challenge:startPrice:${challengeKey}`;
    const now = Date.now();
    const isBeforeDeadline = now < deadlineMs;

    async function fetchPrice() {
      try {
        const res = await fetch(`/api/panel/price-override/${encodeURIComponent(overrideKey)}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const currentPrice = typeof data?.price === 'number' && Number.isFinite(data.price) ? data.price : null;

        if (!alive) return;

        if (currentPrice === null) {
          setPriceInfo({ price: null, updatedAt: null, change: null, direction: null });
          setLoading(false);
          return;
        }

        // Zapisz cenę początkową jeśli jeszcze nie zapisana (tylko raz na challengeKey)
        try {
          const stored = localStorage.getItem(storageKey);
          if (!stored && currentPrice > 0) {
            localStorage.setItem(storageKey, JSON.stringify({ price: currentPrice, timestamp: now }));
          }
        } catch {}

        // Pobierz cenę początkową
        let startPrice: number | null = null;
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            startPrice = typeof parsed?.price === 'number' && Number.isFinite(parsed.price) ? parsed.price : null;
          }
        } catch {}

        // Oblicz zmianę jeśli mamy obie ceny
        let change: number | null = null;
        let direction: 'up' | 'down' | 'flat' | null = null;

        if (startPrice !== null && startPrice > 0) {
          change = ((currentPrice - startPrice) / startPrice) * 100;
          // Flat jeśli zmiana < 0.3%
          if (Math.abs(change) < 0.3) {
            direction = 'flat';
          } else if (change > 0) {
            direction = 'up';
          } else {
            direction = 'down';
          }
        }

        setPriceInfo({
          price: currentPrice,
          updatedAt: data?.updatedAt || null,
          change,
          direction,
        });
      } catch (e: any) {
        if (alive) {
          setPriceInfo({ price: null, updatedAt: null, change: null, direction: null });
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchPrice();
    
    // Odśwież co 10 sekund
    const interval = setInterval(fetchPrice, 10000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [overrideKey, challengeKey, deadlineMs]);

  return { ...priceInfo, loading };
}
