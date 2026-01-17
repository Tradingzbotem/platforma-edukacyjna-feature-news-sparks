'use client';

import { useEffect, useState, useMemo } from 'react';
import type { ScenarioItem } from '@/lib/panel/scenariosABC';
import { updatePriceValuesInText } from '@/lib/panel/scenarioTextUpdater';

type Props = {
  scenarios: ScenarioItem[];
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
  const cleaned = s.replace(/[\s,\u00A0]/g, '');
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

function formatPrice(price: number | null, asset: string): string {
  if (price == null || !isFinite(price)) return '—';
  const decimals = getDecimalsForAsset(asset);
  return price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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

export default function SummaryScenarios({ scenarios }: Props) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  // Pobierz ceny override dla wszystkich aktywów
  // Automatycznie odświeża gdy ceny się zmieniają (polling co 10s)
  useEffect(() => {
    let mounted = true;
    async function fetchOverrides() {
      const uniqueAssets = Array.from(new Set(scenarios.map((s) => s.asset)));
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
  }, [scenarios]);

  if (scenarios.length === 0) {
    return (
      <div className="text-white/70 text-sm">
        <p>Brak dostępnych scenariuszy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scenarios.slice(0, 3).map((scenario, idx) => {
        const mainScenario = scenario.scenarioA;
        const currentPrice = prices[scenario.asset]?.price ?? null;
        const decimals = getDecimalsForAsset(scenario.asset);
        
        const normalizedLevels = normalizeLevelsForPrice(scenario.levels, currentPrice, decimals);
        
        const levelKey = normalizedLevels[0] || scenario.levels[0] || 'N/A';
        const levelNum = parseLevelToNumber(levelKey);
        
        const priceVsLevel = (() => {
          if (currentPrice == null || levelNum == null) return null;
          if (currentPrice > levelNum) return 'above';
          if (currentPrice < levelNum) return 'below';
          return 'at';
        })();

        return (
          <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-xs font-semibold text-white">{scenario.asset}</span>
              <span className="text-xs text-white/40">•</span>
              <span className="text-xs text-white/60">{scenario.timeframe}</span>
              {priceVsLevel && (
                <span className={`text-xs px-1.5 py-0.5 rounded ml-auto ${
                  priceVsLevel === 'above'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : priceVsLevel === 'below'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {priceVsLevel === 'above' ? 'Powyżej' : priceVsLevel === 'below' ? 'Poniżej' : 'Na poziomie'}
                </span>
              )}
            </div>
            
            <div className="mb-1.5">
              <span className="text-xs text-white/50">Poziom: </span>
              <span className="text-xs font-semibold text-white">{String(levelKey)}</span>
            </div>

            <p className="text-xs text-white/70 line-clamp-2">
              {currentPrice != null
                ? updatePriceValuesInText(mainScenario.if, scenario.levels, normalizedLevels, decimals)
                : mainScenario.if}
            </p>
          </div>
        );
      })}
      {scenarios.length > 3 && (
        <p className="text-xs text-white/50 pt-1">+{scenarios.length - 3} więcej scenariuszy</p>
      )}
    </div>
  );
}
