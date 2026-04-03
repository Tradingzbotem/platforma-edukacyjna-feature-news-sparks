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

  // Mapowanie tickera na override key
  // Dla większości aktywów użyj tickera bezpośrednio (override używa tego samego klucza)
  const overrideKey = useMemo(() => {
    const t = ticker.toUpperCase();
    // Specjalne przypadki mapowania
    if (t === 'OIL.WTI' || t === 'WTI' || t === 'OIL') return 'WTI';
    if (t === 'DE40' || t === 'DAX') return 'DE40';
    if (t === 'XAUUSD' || t === 'GOLD') return 'XAUUSD';
    if (t === 'XAGUSD' || t === 'SILVER') return 'XAGUSD';
    if (t === 'NG' || t === 'NATGAS') return 'NG';
    if (t === 'BTCUSD' || t === 'BTC') return 'BTCUSD';
    if (t === 'ETHUSD' || t === 'ETH') return 'ETHUSD';
    // Dla pozostałych (forex, akcje, indeksy) użyj tickera bezpośrednio
    return t;
  }, [ticker]);

  useEffect(() => {
    let alive = true;
    const storageKey = `fxedu:challenge:startPrice:${challengeKey}`;
    const lastFetchKey = `fxedu:challenge:lastPriceFetch:${overrideKey}`;
    const now = Date.now();
    const isBeforeDeadline = now < deadlineMs;

    // Sprawdź czy minął dzień od ostatniego odświeżenia
    function shouldRefreshPrice(): boolean {
      try {
        const lastFetchStr = localStorage.getItem(lastFetchKey);
        if (!lastFetchStr) return true; // Pierwsze odświeżenie
        
        const lastFetch = parseInt(lastFetchStr, 10);
        if (isNaN(lastFetch)) return true;
        
        const oneDayMs = 24 * 60 * 60 * 1000; // 24 godziny
        const timeSinceLastFetch = now - lastFetch;
        
        return timeSinceLastFetch >= oneDayMs;
      } catch {
        return true;
      }
    }

    // Zapisz datę ostatniego odświeżenia
    function markPriceFetched() {
      try {
        localStorage.setItem(lastFetchKey, String(now));
      } catch {}
    }

    async function fetchPrice() {
      // Sprawdź czy powinno się odświeżyć (raz dziennie)
      if (!shouldRefreshPrice()) {
        // Użyj zapisanej ceny jeśli dostępna
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            const savedPrice = typeof parsed?.price === 'number' && Number.isFinite(parsed.price) ? parsed.price : null;
            if (savedPrice !== null && savedPrice > 0) {
              // Oblicz zmianę na podstawie zapisanej ceny
              const change = ((savedPrice - savedPrice) / savedPrice) * 100; // 0% bo to ta sama cena
              setPriceInfo({
                price: savedPrice,
                updatedAt: null,
                change: 0,
                direction: 'flat',
              });
              if (alive) setLoading(false);
              return;
            }
          }
        } catch {}
      }

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

        // Zapisz datę ostatniego odświeżenia
        markPriceFetched();
      } catch (e: any) {
        if (alive) {
          setPriceInfo({ price: null, updatedAt: null, change: null, direction: null });
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchPrice();
    
    // Sprawdź co godzinę, czy minął dzień (aby odświeżyć o odpowiedniej porze)
    const checkInterval = setInterval(() => {
      if (shouldRefreshPrice()) {
        fetchPrice();
      }
    }, 60 * 60 * 1000); // Co godzinę

    return () => {
      alive = false;
      clearInterval(checkInterval);
    };
  }, [overrideKey, challengeKey, deadlineMs]);

  return { ...priceInfo, loading };
}
