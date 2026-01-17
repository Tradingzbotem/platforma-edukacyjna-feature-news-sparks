'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { TechMapItem } from '@/lib/panel/techMaps';

type Props = {
  items: TechMapItem[];
};

type PriceData = {
  price: number | null;
  updatedAt: string | null;
};

function parseLevelToNumber(v: string | number): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v || '').trim();
  if (!s) return null;
  // Remove thousands separators (spaces, commas), keep dot as decimal
  const cleaned = s.replace(/[\s,\u00A0]/g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function getDecimalsForAsset(asset: string): number {
  const assetUpper = asset.toUpperCase();
  if (assetUpper.includes('USD') && !assetUpper.includes('XAU') && !assetUpper.includes('XAG')) {
    return 5; // FX pairs
  } else if (assetUpper === 'USDJPY') {
    return 3;
  } else if (assetUpper.includes('PLN')) {
    return 4;
  } else if (assetUpper.includes('US100') || assetUpper.includes('US500') || assetUpper.includes('US30')) {
    return 0; // Indices
  }
  return 2; // Default
}

function roundToStep(value: number, step: number): number {
  if (!Number.isFinite(value) || step <= 0) return value;
  return Math.round(value / step) * step;
}

function pickStepForPrice(price: number, decimals: number): number {
  if (!Number.isFinite(price)) return Math.max(1, Math.pow(10, -decimals));
  if (decimals > 0) return Math.pow(10, -decimals);
  if (price >= 20000) return 50;
  if (price >= 5000) return 20;
  if (price >= 1000) return 10;
  return 1;
}

function normalizeLevelsForPrice(
  levels: Array<string | number>,
  currentPrice: number | null,
  decimals: number = 0
): string[] {
  const nums = levels.map(parseLevelToNumber).filter((x): x is number => x != null && isFinite(x));
  if (!Array.isArray(nums) || nums.length === 0) {
    return levels.map((lv) => String(lv));
  }
  if (currentPrice == null || !isFinite(currentPrice)) {
    return nums.map((n) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  }
  // Use median level as reference scale
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  if (!isFinite(median) || median <= 0) {
    return nums.map((n) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  }
  const ratio = currentPrice / median;
  // Rebase when price drift is meaningful (~±10%)
  const needsRebase = ratio >= 1.1 || ratio <= 0.9;
  const step = pickStepForPrice(currentPrice, decimals);
  const scaled = needsRebase
    ? nums.map((n) => roundToStep(n * ratio, step))
    : nums;
  return scaled.map((n) =>
    n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
}

export default function SummaryTechMaps({ items }: Props) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  // Pobierz ceny override dla wszystkich aktywów w mapach
  // Automatycznie odświeża gdy ceny się zmieniają (polling co 10s)
  useEffect(() => {
    let mounted = true;
    async function fetchOverrides() {
      const uniqueAssets = Array.from(new Set(items.map((m) => m.asset)));
      if (uniqueAssets.length === 0) return;
      
      const results = await Promise.allSettled(
        uniqueAssets.map(async (asset) => {
          try {
            const r = await fetch(`/api/panel/price-override/${encodeURIComponent(asset)}`, {
              cache: 'no-store',
            });
            if (!r.ok) throw new Error(String(r.status));
            const j = await r.json();
            return {
              asset,
              price: typeof j?.price === 'number' && isFinite(j.price) ? j.price : null,
              updatedAt: j?.updatedAt || null,
            };
          } catch {
            return { asset, price: null, updatedAt: null };
          }
        })
      );

      if (!mounted) return;

      const nextPrices: Record<string, PriceData> = {};
      for (const res of results) {
        if (res.status === 'fulfilled') {
          nextPrices[res.value.asset] = {
            price: res.value.price,
            updatedAt: res.value.updatedAt,
          };
        }
      }
      
      setPrices((prev) => {
        // Sprawdź czy ceny się zmieniły - jeśli tak, odśwież
        const changed = Object.keys(nextPrices).some(
          (asset) => prev[asset]?.price !== nextPrices[asset]?.price
        );
        return changed ? nextPrices : prev;
      });
    }
    
    fetchOverrides();
    
    // Polling co 10 sekund, żeby wykryć zmiany override z admina
    const pollInterval = setInterval(fetchOverrides, 10000);
    
    // refresh overrides on window focus to reflect recent admin saves
    function onFocus() {
      fetchOverrides();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [items]);

  // Grupuj mapy po aktywach i wybierz najważniejsze (D1/H4 dla każdego aktywa)
  const featuredMaps = useMemo(() => {
    if (items.length === 0) return [];
    
    const byAsset: Record<string, TechMapItem[]> = {};
    items.forEach((map) => {
      if (!byAsset[map.asset]) byAsset[map.asset] = [];
      byAsset[map.asset].push(map);
    });

    const featured: TechMapItem[] = [];
    const priorityTimeframes: TechMapItem['timeframe'][] = ['D1', 'H4', 'H1', 'W1'];
    
    Object.values(byAsset).forEach((maps) => {
      for (const tf of priorityTimeframes) {
        const map = maps.find((m) => m.timeframe === tf);
        if (map) {
          featured.push(map);
          break;
        }
      }
    });

    return featured.slice(0, 3); // Pokaż maksymalnie 3 mapy
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-white/70 text-sm">
        <p>Brak dostępnych map technicznych.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/70 mb-3">
        Mapy techniczne pokazują kluczowe poziomy wsparcia i oporu, strukturę trendu oraz zmienność jako kontekst dla analizy.
      </p>
      
      {featuredMaps.length > 0 ? (
        <div className="space-y-2">
          {featuredMaps.map((map) => (
            <div key={map.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{map.asset}</span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/60">{map.timeframe}</span>
                  </div>
                  <p className="text-xs text-white/80 line-clamp-2 mb-2">{map.trend}</p>
                </div>
              </div>
              
              {map.keyLevels && map.keyLevels.length > 0 && (() => {
                const currentPrice = prices[map.asset]?.price ?? null;
                const decimals = getDecimalsForAsset(map.asset);
                const normalizedLevels = normalizeLevelsForPrice(map.keyLevels, currentPrice, decimals);
                
                return (
                  <div className="mb-2">
                    <p className="text-xs text-white/50 mb-1">Poziomy kluczowe:</p>
                    <div className="flex flex-wrap gap-1">
                      {normalizedLevels.slice(0, 4).map((level, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-white/70"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {map.volatility && (
                <div className="mb-2">
                  <p className="text-xs text-white/50 mb-0.5">Zmienność:</p>
                  <p className="text-xs text-white/70 line-clamp-1">{map.volatility}</p>
                </div>
              )}
            </div>
          ))}
          
          {items.length > featuredMaps.length && (
            <div className="pt-2">
              <Link
                href="/konto/panel-rynkowy/mapy-techniczne"
                className="text-xs text-white/60 hover:text-white/90 transition-colors inline-flex items-center gap-1"
              >
                Zobacz wszystkie mapy ({items.length}) →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="text-xs font-semibold text-white/90 mb-1">Poziomy kluczowe</p>
            <p className="text-xs text-white/60">Wsparcia, opory i strefy reakcji</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="text-xs font-semibold text-white/90 mb-1">Struktura</p>
            <p className="text-xs text-white/60">Trend, range, konsolidacja</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="text-xs font-semibold text-white/90 mb-1">Zmienność</p>
            <p className="text-xs text-white/60">ATR jako filtr ryzyka</p>
          </div>
        </div>
      )}
    </div>
  );
}
