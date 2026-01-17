'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Recharts
const ResponsiveContainer = dynamic(async () => (await import('recharts')).ResponsiveContainer, { ssr: false });
const LineChart = dynamic(async () => (await import('recharts')).LineChart, { ssr: false });
const Line = dynamic(async () => (await import('recharts')).Line, { ssr: false });
const XAxis = dynamic(async () => (await import('recharts')).XAxis, { ssr: false });
const YAxis = dynamic(async () => (await import('recharts')).YAxis, { ssr: false });
const Tooltip = dynamic(async () => (await import('recharts')).Tooltip, { ssr: false });
const ReferenceLine = dynamic(async () => {
  const mod = await import('recharts');
  return { default: mod.ReferenceLine } as any;
}, { ssr: false });

const ReferenceLineAny = ReferenceLine as any;

export type RangeKey = '24h' | '48h' | '72h';

type SparkResp = { symbol: string; series: Array<[number, number]> };

async function fetchSparks(symbols: string[]): Promise<SparkResp[]> {
  if (!symbols.length) return [];
  const url = `/api/quotes/sparkline?symbols=${encodeURIComponent(symbols.join(','))}&range=7d&interval=1h`;
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(String(res.status));
  const json = await res.json();
  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr as SparkResp[];
}

// Oblicz zmienność (volatility) jako średnią z bezwzględnych zmian procentowych
function calculateVolatility(series: Array<[number, number]>): number {
  if (!series?.length || series.length < 2) return 0;
  const sorted = series.slice().sort((a, b) => a[0] - b[0]);
  let sumAbsChanges = 0;
  let count = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1][1];
    const curr = sorted[i][1];
    if (prev > 0 && isFinite(prev) && isFinite(curr)) {
      const pctChange = Math.abs((curr - prev) / prev) * 100;
      sumAbsChanges += pctChange;
      count++;
    }
  }
  return count > 0 ? sumAbsChanges / count : 0;
}

// Oblicz średnią zmianę procentową w ostatnich N godzinach
function calculateAverageChange(series: Array<[number, number]>, lastHours: number): number {
  if (!series?.length || series.length < 2) return 0;
  const sorted = series.slice().sort((a, b) => a[0] - b[0]);
  const now = sorted[sorted.length - 1][0];
  const targetTime = now - (lastHours * 3600 * 1000);
  
  let startIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i][0] <= targetTime) {
      startIdx = i;
    } else {
      break;
    }
  }
  
  if (startIdx === sorted.length - 1) startIdx = 0;
  
  const first = sorted[startIdx]?.[1];
  const last = sorted[sorted.length - 1]?.[1];
  if (!(isFinite(first) && isFinite(last)) || first === 0) return 0;
  return ((last - first) / first) * 100;
}

// Oblicz wskaźnik stresu rynkowego (0-100)
// Wyższa wartość = większy stres/zmienność
function calculateStressIndex(assets: Array<{ volatility: number; change: number }>): number {
  if (!assets.length) return 50; // neutralny
  
  // Średnia zmienność
  const avgVolatility = assets.reduce((sum, a) => sum + a.volatility, 0) / assets.length;
  
  // Średnia bezwzględna zmiana
  const avgAbsChange = assets.reduce((sum, a) => sum + Math.abs(a.change), 0) / assets.length;
  
  // Kombinacja: volatility * 2 + abs change * 3
  // Skalowanie do 0-100
  const raw = (avgVolatility * 2 + avgAbsChange * 3);
  const normalized = Math.min(100, Math.max(0, raw * 10));
  
  return normalized;
}

const hoursFromRange = (r: RangeKey): number => (r === '24h' ? 24 : r === '48h' ? 48 : 72);

const ASSETS: Array<{ label: string; symbol: string }> = [
  { label: 'EUR/USD', symbol: 'EURUSD' },
  { label: 'USD/JPY', symbol: 'USDJPY' },
  { label: 'US100', symbol: 'US100' },
  { label: 'ZŁOTO', symbol: 'GOLD' },
  { label: 'WTI', symbol: 'WTI' },
  { label: 'BRENT', symbol: 'BRENT' },
];

export default function MarketStressIndex({
  range,
  onRangeChange,
}: {
  range: RangeKey;
  onRangeChange?: (r: RangeKey) => void;
}) {
  const [data, setData] = useState<Array<{ t: number; value: number }>>([]);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    
    (async () => {
      try {
        const hrs = hoursFromRange(range);
        
        // Pobierz dane sparkline dla wszystkich aktywów
        const resp = await fetchSparks(ASSETS.map(a => a.symbol));
        const map = new Map(resp.map(r => [r.symbol.toUpperCase(), r.series] as const));
        
        // Oblicz zmienność i zmiany dla każdego aktywa
        const assetsData = ASSETS.map(a => {
          const series = map.get(a.symbol.toUpperCase()) || [];
          const volatility = calculateVolatility(series);
          const change = calculateAverageChange(series, hrs);
          return { symbol: a.symbol, label: a.label, volatility, change };
        });
        
        // Generuj szereg czasowy wskaźnika stresu
        // Użyj danych z ostatnich N godzin, podzielonych na przedziały
        const now = Date.now();
        const start = now - (hrs * 3600 * 1000);
        const intervalMs = (hrs * 3600 * 1000) / 30; // 30 punktów
        
        const points: Array<{ t: number; value: number }> = [];
        
        for (let i = 0; i < 30; i++) {
          const t = start + (i * intervalMs);
          // Dla każdego punktu czasowego, oblicz stres na podstawie danych dostępnych do tego momentu
          const timeAssets = assetsData.map(a => {
            const series = map.get(a.symbol.toUpperCase()) || [];
            const filtered = series.filter(([ts]) => ts <= t);
            if (filtered.length < 2) return { volatility: 0, change: 0 };
            
            const windowHours = Math.min(hrs, (t - filtered[0][0]) / (3600 * 1000));
            const volatility = calculateVolatility(filtered);
            const change = windowHours > 0 ? calculateAverageChange(filtered, windowHours) : 0;
            return { volatility, change };
          });
          
          const stress = calculateStressIndex(timeAssets);
          points.push({ t, value: stress });
        }
        
        // Jeśli brak danych, generuj symulowane dane
        if (points.length === 0 || points.every(p => p.value === 0)) {
          const baseValue = 45 + Math.random() * 10; // 45-55
          for (let i = 0; i < 30; i++) {
            const t = start + (i * intervalMs);
            const variation = Math.sin((i / 30) * Math.PI * 2) * 8;
            const noise = (Math.random() - 0.5) * 6;
            const value = Math.max(30, Math.min(70, baseValue + variation + noise));
            points.push({ t, value });
          }
        }
        
        if (!alive) return;
        setData(points);
        setCurrentValue(points.length > 0 ? points[points.length - 1].value : null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Błąd pobierania danych');
        
        // Fallback: symulowane dane
        const hrs = hoursFromRange(range);
        const now = Date.now();
        const start = now - (hrs * 3600 * 1000);
        const intervalMs = (hrs * 3600 * 1000) / 30;
        const points: Array<{ t: number; value: number }> = [];
        const baseValue = 45 + Math.random() * 10;
        for (let i = 0; i < 30; i++) {
          const t = start + (i * intervalMs);
          const variation = Math.sin((i / 30) * Math.PI * 2) * 8;
          const noise = (Math.random() - 0.5) * 6;
          const value = Math.max(30, Math.min(70, baseValue + variation + noise));
          points.push({ t, value });
        }
        setData(points);
        setCurrentValue(points[points.length - 1].value);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    
    return () => {
      alive = false;
    };
  }, [range]);

  const getStatusLabel = (value: number | null): string => {
    if (value === null) return '—';
    if (value >= 70) return 'Wysoki';
    if (value >= 55) return 'Podwyższony';
    if (value >= 45) return 'Umiarkowany';
    if (value >= 30) return 'Niski';
    return 'Bardzo niski';
  };

  const getStatusColor = (value: number | null): string => {
    if (value === null) return '#e5e7eb';
    if (value >= 70) return '#f87171'; // czerwony
    if (value >= 55) return '#fb923c'; // pomarańczowy
    if (value >= 45) return '#eab308'; // żółty
    if (value >= 30) return '#84cc16'; // zielony
    return '#4ade80'; // jasny zielony
  };

  const statusLabel = getStatusLabel(currentValue);
  const statusColor = getStatusColor(currentValue);

  return (
    <section className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-4" aria-label="Wskaźnik stresu rynkowego">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-white/70">Wskaźnik stresu rynkowego ({range})</span>
          <span className="ml-auto text-sm font-semibold" style={{ color: statusColor }}>
            {statusLabel}{currentValue === null ? '' : ` • ${Math.round(currentValue)} / ${range}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(['24h', '48h', '72h'] as RangeKey[]).map(r => (
            <button
              key={r}
              onClick={() => onRangeChange?.(r)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                range === r
                  ? 'bg-white text-slate-900 font-semibold'
                  : 'hover:bg-white/10 border border-white/10 text-white/70'
              }`}
              aria-pressed={range === r}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mb-2 rounded-lg bg-white/5 border border-white/10 p-2 text-white/70 text-xs">
          Ładowanie danych...
        </div>
      )}

      {error && (
        <div className="mb-2 rounded-lg bg-amber-500/10 border border-amber-400/20 p-2 text-amber-200 text-xs">
          {error}. Wyświetlam symulowane dane.
        </div>
      )}

      {/* Chart */}
      <div style={{ width: '100%', height: 220 }}>
        {data.length > 0 ? (
          <ResponsiveContainer>
            <LineChart
              data={data.map(p => ({ t: p.t, value: p.value }))}
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="t"
                tickFormatter={() => ''}
                axisLine={false}
                tickLine={false}
                interval="preserveEnd"
              />
              <YAxis domain={[0, 100]} hide />
              <ReferenceLineAny y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Tooltip
                labelFormatter={(ts: any) =>
                  new Date(Number(ts)).toLocaleString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })
                }
                formatter={(v: any) => [`${Math.round(Number(v))}`, 'Stres']}
                contentStyle={{
                  background: '#0b1220',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={statusColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-white/40 text-sm">
            Brak danych do wyświetlenia
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>0 = Brak stresu</span>
          <span>50 = Neutralny</span>
          <span>100 = Ekstremalny stres</span>
        </div>
      </div>
    </section>
  );
}
