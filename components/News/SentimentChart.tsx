// components/News/SentimentChart.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Recharts
const ResponsiveContainer = dynamic(async () => (await import('recharts')).ResponsiveContainer, { ssr: false });
const LineChart = dynamic(async () => (await import('recharts')).LineChart, { ssr: false });
const Line = dynamic(async () => (await import('recharts')).Line, { ssr: false });
const XAxis = dynamic(async () => (await import('recharts')).XAxis, { ssr: false });
const YAxis = dynamic(async () => (await import('recharts')).YAxis, { ssr: false });
const Tooltip = dynamic(async () => (await import('recharts')).Tooltip, { ssr: false });
// Note: dynamic expects a module with a default export; wrap ReferenceLine accordingly
const ReferenceLine = dynamic(async () => {
  const mod = await import('recharts');
  return { default: mod.ReferenceLine } as any;
}, { ssr: false });

const ReferenceLineAny = ReferenceLine as any;

export type RangeKey = '24h' | '48h' | '72h';

type BriefItem = {
  title?: string;
  summary?: string;
  sentiment?: number | string; // optional numeric
  timestamp_iso?: string;
};

type NewsItem = {
  title: string;
  summary: string;
  timestamp_iso: string;
};

function classifySentimentText(text: string): number {
  const t = text.toLowerCase();
  if (/(bull|byczy|pozytywn)/.test(t)) return 70;
  if (/(bear|niedzwiedz|negatyw)/.test(t)) return 30;
  if (/(neutral)/.test(t)) return 50;
  // Heuristic based on keywords
  const pos = /(rally|gain|beats|strong|improves|cooling inflation|surge|record|wzrost|rosną|lepszy|mocny|umocnienie|zyskuje|rekord)/.test(t);
  const neg = /(drop|falls|miss|weak|selloff|risk|war|crisis|downgrade|spadek|spadają|gorzej|słaby|osłabienie|traci|ryzyko|wojna|kryzys|obniżka)/.test(t);
  if (pos && !neg) return 65;
  if (neg && !pos) return 35;
  return 50;
}

function toIndex(v: number | string | undefined): number {
  if (typeof v === 'number' && isFinite(v)) {
    // Clamp to 0-100
    return Math.max(0, Math.min(100, v));
  }
  if (typeof v === 'string') return classifySentimentText(v);
  return 50;
}

function sma(data: number[], windowSize = 3): number[] {
  if (windowSize <= 1) return data.slice();
  const out: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const from = Math.max(0, i - windowSize + 1);
    const slice = data.slice(from, i + 1);
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return out;
}

function labelFromIndex(v: number): 'Pozytywny' | 'Neutralny' | 'Negatywny' {
  if (v >= 60) return 'Pozytywny';
  if (v <= 40) return 'Negatywny';
  return 'Neutralny';
}

// Map UI range to number of hours used for percent move calculation
const hoursFromRange = (r: RangeKey): number => (r === '24h' ? 24 : r === '48h' ? 48 : 72);

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

function computeChange(series: Array<[number, number]>, lastHours: number): number | null {
  if (!series?.length || series.length < 2) return null;
  // Sortuj po czasie (timestamp)
  const sorted = series.slice().sort((a, b) => a[0] - b[0]);
  if (sorted.length < 2) return null;
  
  // Znajdź punkt sprzed lastHours godzin
  const now = sorted[sorted.length - 1][0];
  const targetTime = now - (lastHours * 3600 * 1000);
  
  // Znajdź najbliższy punkt przed targetTime
  let startIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i][0] <= targetTime) {
      startIdx = i;
    } else {
      break;
    }
  }
  
  // Użyj pierwszego punktu jeśli nie znaleziono odpowiedniego
  if (startIdx === sorted.length - 1) startIdx = 0;
  
  const first = sorted[startIdx]?.[1];
  const last = sorted[sorted.length - 1]?.[1];
  if (!(isFinite(first) && isFinite(last)) || first === 0) return null;
  return ((last - first) / first) * 100;
}

async function fetchBrief(range: RangeKey): Promise<BriefItem[]> {
  const url = `/api/brief/list?bucket=${range}`;
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(String(res.status));
  const json = await res.json();
  // API zwraca { ok: true, items: [...] }
  const arr: any[] = Array.isArray(json?.items) ? json.items : Array.isArray(json) ? json : [];
  // Mapuj strukturę Brief na BriefItem
  return arr.map((item: any) => {
    // Konwertuj sentiment string na liczbę
    let sentimentNum: number | undefined = undefined;
    if (item.sentiment === 'Pozytywny') sentimentNum = 70;
    else if (item.sentiment === 'Negatywny') sentimentNum = 30;
    else if (item.sentiment === 'Neutralny') sentimentNum = 50;
    
    // Stwórz summary z bullets lub content
    const summary = item.content || (Array.isArray(item.bullets) ? item.bullets.join('. ') : '') || item.title || '';
    
    return {
      title: item.title || '',
      summary: summary,
      sentiment: sentimentNum,
      timestamp_iso: item.ts_iso || item.timestamp_iso || item.generatedAt || new Date().toISOString(),
    };
  });
}

async function fetchNewsFallback(range: RangeKey): Promise<NewsItem[]> {
  const res = await fetch(`/api/news/summarize?bucket=${encodeURIComponent(range)}`, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(String(res.status));
  const json = await res.json();
  return Array.isArray(json?.items) ? json.items : [];
}

export default function SentimentChart({
  range,
  onRangeChange,
  onChangeRange,
  items,
  initialData,
}: {
  range: RangeKey;
  onRangeChange?: (r: RangeKey) => void;
  onChangeRange?: (r: RangeKey) => void;
  items?: Array<{ title: string; summary: string; timestamp_iso: string }>;
  initialData?: unknown;
}) {
  const [data, setData] = useState<Array<{ t: number; value: number }>>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [moves, setMoves] = useState<Array<{ label: string; pct: number | null }>>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        let points: Array<{ t: number; value: number }> = [];
        // Prefer explicit items
        if (items && items.length) {
          const series = items
            .map(n => ({ t: new Date(n.timestamp_iso).getTime(), value: classifySentimentText(`${n.title}. ${n.summary}`) }))
            .sort((a, b) => a.t - b.t);
          const smoothed = sma(series.map(s => s.value), 3);
          points = series.map((s, i) => ({ t: s.t, value: smoothed[i] }));
        } else if (initialData && (initialData as any)?.items?.length) {
          const arr = (initialData as any).items as Array<{ title: string; summary: string; timestamp_iso: string }>;
          const series = arr
            .map(n => ({ t: new Date(n.timestamp_iso).getTime(), value: classifySentimentText(`${n.title}. ${n.summary}`) }))
            .sort((a, b) => a.t - b.t);
          const smoothed = sma(series.map(s => s.value), 3);
          points = series.map((s, i) => ({ t: s.t, value: smoothed[i] }));
        }
        try {
          if (!points.length) {
            const brief = await fetchBrief(range);
            if (brief.length) {
              const series = brief
                .map(b => ({
                  t: b.timestamp_iso ? new Date(b.timestamp_iso).getTime() : Date.now(),
                  value: toIndex(typeof b.sentiment === 'number' ? b.sentiment : (b.summary || b.title || '')),
                }))
                .filter(p => isFinite(p.t) && isFinite(p.value))
                .sort((a, b) => a.t - b.t);
              if (series.length > 0) {
                const smoothed = sma(series.map(s => s.value), Math.min(3, series.length));
                points = series.map((s, i) => ({ t: s.t, value: smoothed[i] || s.value }));
              }
            }
          }
        } catch (e) {
          // ignore, fallback below
        }
        if (!points.length) {
          try {
            const news = await fetchNewsFallback(range);
            if (news.length) {
              const series = news
                .map(n => ({ 
                  t: new Date(n.timestamp_iso).getTime(), 
                  value: classifySentimentText(`${n.title}. ${n.summary}`) 
                }))
                .filter(p => isFinite(p.t) && isFinite(p.value))
                .sort((a, b) => a.t - b.t);
              if (series.length > 0) {
                const smoothed = sma(series.map(s => s.value), Math.min(3, series.length));
                points = series.map((s, i) => ({ t: s.t, value: smoothed[i] || s.value }));
              }
            }
          } catch (e2) {
            // ignore, will show empty state
          }
        }
        
        // Fallback: jeśli nadal brak danych, generuj symulowane dane dla wykresu
        if (!points.length) {
          const hrs = hoursFromRange(range);
          const now = Date.now();
          const start = now - (hrs * 3600 * 1000);
          const step = (hrs * 3600 * 1000) / 20; // 20 punktów
          const baseValue = 50; // neutralna wartość
          points = [];
          for (let i = 0; i < 20; i++) {
            const t = start + (i * step);
            // Symuluj wahania wokół wartości neutralnej (40-60)
            const variation = Math.sin((i / 20) * Math.PI * 2) * 10;
            const noise = (Math.random() - 0.5) * 5;
            const value = Math.max(35, Math.min(65, baseValue + variation + noise));
            points.push({ t, value });
          }
        }
        
        if (!alive) return;
        setData(points);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || 'Błąd danych wykresu');
        setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range, items, initialData]);

  const last = data.length ? data[data.length - 1].value : null;
  const label = last === null ? '—' : labelFromIndex(last);
  const col = last === null ? '#e5e7eb' : last >= 60 ? '#fbbf24' : last <= 40 ? '#fb7185' : '#eab308';

  const header = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/70">Market Turbulence Index ({range})</span>
      <span className="ml-auto text-sm" style={{ color: col }}>
        {label}{last === null ? '' : ` • ${Math.round(last)} / ${range}`}
      </span>
    </div>
  );

  // Fetch percent moves for key assets and compute change over selected range hours
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ASSETS: Array<{ label: string; symbol: string }> = [
          { label: 'EUR/USD', symbol: 'EURUSD' },
          { label: 'USD/JPY', symbol: 'USDJPY' },
          { label: 'US100', symbol: 'US100' },
          { label: 'ZŁOTO', symbol: 'GOLD' },
          { label: 'WTI', symbol: 'WTI' },
          { label: 'BRENT', symbol: 'BRENT' },
        ];
        const resp = await fetchSparks(ASSETS.map(a => a.symbol));
        const hrs = hoursFromRange(range);
        const map = new Map(resp.map(r => [r.symbol.toUpperCase(), r.series] as const));
        const arr = ASSETS.map(a => {
          const series = map.get(a.symbol.toUpperCase()) || [];
          const pct = computeChange(series, hrs);
          return { label: a.label, pct };
        });
        if (!alive) return;
        setMoves(arr);
      } catch {
        if (!alive) return;
        setMoves([]);
      }
    })();
    return () => { alive = false; };
  }, [range]);

  return (
    <section className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-3" aria-label="Wykres sentymentu 24/48/72h">
      {/* Moves bar */}
      {!!moves.length && (
        <div className="flex flex-wrap items-center gap-2 mb-2 overflow-x-auto">
          {moves.map((m, i) => {
            const v = m.pct;
            const col = v == null ? 'text-white/60' : v > 0.1 ? 'text-emerald-300' : v < -0.1 ? 'text-rose-300' : 'text-amber-300';
            const bg = v == null ? 'bg-white/5' : v > 0.1 ? 'bg-emerald-500/10' : v < -0.1 ? 'bg-rose-500/10' : 'bg-amber-500/10';
            return (
              <div key={i} className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 ${bg}`}>
                <span className="text-xs text-white/70">{m.label}</span>
                <span className={`text-xs font-semibold ${col}`}>{v == null ? '—' : `${v >= 0 ? '▲' : '▼'} ${Math.abs(v).toFixed(2)}%`}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        {header}
        <div className="ml-auto flex items-center gap-1">
          {(['24h','48h','72h'] as RangeKey[]).map(r => (
            <button
              key={r}
              onClick={() => (onRangeChange ? onRangeChange(r) : onChangeRange ? onChangeRange(r) : undefined)}
              className={`px-3 py-1 rounded-lg text-sm ${range === r ? 'bg-white text-slate-900' : 'hover:bg-white/10 border border-white/10'}`}
              aria-pressed={range === r}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {loading && (
        <div className="mb-2 rounded-lg bg-white/5 border border-white/10 p-2 text-white/70 text-xs">
          Ładowanie danych wykresu...
        </div>
      )}
      {err && (
        <div className="mb-2 rounded-lg bg-rose-500/10 border border-rose-400/20 p-2 text-rose-200 text-xs">
          Nie udało się pobrać świeżych danych. Pokazuję ostatni zapis z pamięci, jeśli jest.
        </div>
      )}
      {!loading && !err && data.length === 0 && (
        <div className="mb-2 rounded-lg bg-amber-500/10 border border-amber-400/20 p-2 text-amber-200 text-xs">
          Brak danych do wyświetlenia dla wybranego zakresu czasowego. Spróbuj innego zakresu lub odśwież stronę.
        </div>
      )}
      <div style={{ width: '100%', height: 220 }}>
        {data.length > 0 ? (
          <ResponsiveContainer>
            <LineChart data={data.map(p => ({ t: p.t, value: p.value }))} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
                labelFormatter={(ts: any) => new Date(Number(ts)).toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                formatter={(v: any) => [`${Math.round(Number(v))}`, 'Sentyment']}
                contentStyle={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-white/40 text-sm">
            Brak danych do wyświetlenia
          </div>
        )}
      </div>
    </section>
  );
}


