// components/News/QuickAI.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { BannerError, StatTile } from './ui';
import type { BriefItem as BriefItemT } from './types';

const LS_KEY = 'fxedu_quickai_latest';
const DECISION_KEY = 'fxedu_quickai_decision_v1';

type BriefItem = BriefItemT;

async function fetchLatestBrief(): Promise<BriefItem | null> {
  try {
    // Check if it's weekend
    const isWeekend = () => {
      const d = new Date();
      const wd = d.getDay();
      return wd === 0 || wd === 6; // Sunday or Saturday
    };
    const weekend = isWeekend();
    // In weekends, accept data up to 72h old (Friday's data is still valid on Saturday/Sunday)
    const maxAge = weekend ? 72 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // 1) Try existing GEN list first
    const res = await fetch('/api/brief/list?type=GEN&limit=1', { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      const first = Array.isArray(j?.items) && j.items.length ? (j.items[0] as BriefItem) : null;
      const hasMetrics =
        !!first?.metrics &&
        (first.metrics.rsi != null ||
          first.metrics.adx != null ||
          first.metrics.macd != null ||
          first.metrics.volume != null ||
          (typeof first.metrics.dist200 === 'string' && first.metrics.dist200.length > 0));
      if (first && hasMetrics) {
        // Return if fresh (within maxAge); otherwise, fall through to auto-generation
        const ts = first.ts_iso ? new Date(first.ts_iso).getTime() : 0;
        const isFresh = ts && Date.now() - ts < maxAge;
        if (isFresh) return first;
        // In weekends, still return the latest available even if older (it's expected)
        if (weekend && first) return first;
      }
    }

    // 2) Ask server to ensure/generate the latest brief via OpenAI (if key present)
    // In weekends, this may not generate new data, but we try anyway
    const auto = await fetch('/api/brief/auto-latest?enrich=1', { cache: 'no-store' }).catch(() => null as any);
    if (auto && auto.ok) {
      const j2 = await auto.json();
      const b = j2?.brief as BriefItem | undefined;
      const hasM =
        !!b?.metrics &&
        (b.metrics.rsi != null ||
          b.metrics.adx != null ||
          b.metrics.macd != null ||
          b.metrics.volume != null ||
          (typeof b.metrics.dist200 === 'string' && b.metrics.dist200.length > 0));
      if (b && hasM) return b;
      if (b) return b;
    }

    return null;
  } catch {
    return null;
  }
}

function defaultPromptPL(): string {
  return (
    'Napisz po polsku zwięzły briefing rynkowy skierowany na USA. Wypisz najważniejsze wydarzenia z ostatnich 1-3 dni i ich możliwe konsekwencje dla rynków w USA. Jeśli dotyczy, uwzględnij wątek shutdownu administracji publicznej w USA. Styl edukacyjny, bez rekomendacji inwestycyjnych. Struktura: nagłówek „Szybki briefing — GEN”, sekcja „CO TERAZ GRA NAJGŁOŚNIEJ” (6–8 punktów), „OPINIA AI (SKRÓT)” jedno zdanie oraz metryki techniczne: RSI(14), ADX (proxy), MACD, wolumen, odległość od 200MA.'
  );
}

function stripMarkdownHeadings(text: string): string {
  // Remove markdown headings and trim excessive whitespace
  let t = text
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '') // strip blockquote markers if any
    // remove bold/italic markers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1');
  // remove common leading labels like "OPINIA AI (SKRÓT):"
  t = t.replace(/^\s*opinia\s*ai.*?:\s*/i, '');
  // collapse whitespace/newlines
  t = t.replace(/\s+\n/g, '\n').replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return t;
}

function toNumber(input: string | number | undefined): number | undefined {
  if (typeof input === 'number' && !Number.isNaN(input)) return input;
  if (typeof input === 'string') {
    const n = Number(input.replace(',', '.').trim());
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function inferMetricsFromText(item: BriefItem | null | undefined): {
  rsi?: number;
  adx?: number;
  macd?: number;
  volume?: 'Niskie' | 'Średnie' | 'Wysokie';
  dist200?: string;
} {
  if (!item) return {};
  const candidates: string[] = []
    .concat(Array.isArray(item.bullets) ? item.bullets : [])
    .concat(item.content ? [item.content] : [])
    .concat(item.opinion ? [item.opinion] : []);
  const text = candidates.join('\n');
  const rsiMatch = text.match(/rsi\s*\(?\s*14\)?[^0-9\-+]*([+\-]?\d+(?:[.,]\d+)?)/i);
  const adxMatch = text.match(/adx[^0-9\-+]*([+\-]?\d+(?:[.,]\d+)?)/i);
  const macdMatch = text.match(/macd[^0-9\-+]*([+\-]?\d+(?:[.,]\d+)?)/i);
  const volMatch = text.match(/(wolumen|volume)[^a-z]*(nisk\w+|średni\w+|sredni\w+|wysok\w+)/i);
  const distMatch =
    text.match(/(odległość|odleglosc).*200\s*ma[^+\-0-9]*([+\-]?\d+%)/i) ||
    text.match(/200\s*ma[^+\-0-9]*([+\-]?\d+%)/i);

  let volume: 'Niskie' | 'Średnie' | 'Wysokie' | undefined = undefined;
  if (volMatch) {
    const lvl = volMatch[2].toLowerCase();
    if (lvl.startsWith('nisk')) volume = 'Niskie';
    else if (lvl.startsWith('wysok')) volume = 'Wysokie';
    else volume = 'Średnie';
  }

  return {
    rsi: rsiMatch ? toNumber(rsiMatch[1]) : undefined,
    adx: adxMatch ? toNumber(adxMatch[1]) : undefined,
    macd: macdMatch ? toNumber(macdMatch[1]) : undefined,
    volume,
    dist200: distMatch ? distMatch[2] || distMatch[1] : undefined,
  };
}

export default function QuickAI() {
  const [latest, setLatest] = useState<BriefItem | null>(null);
  const [netError, setNetError] = useState(false);
  const [trend, setTrend] = useState<'wzrost' | 'spadek' | 'konsolidacja'>('konsolidacja');
  const [tech, setTech] = useState<{
    rsi14?: number;
    macdHist?: number;
    ema21DistPct?: number;
    volPct?: number;
    emaSlopePct?: number;
  }>({});
  const [gauge, setGauge] = useState<number>(0); // -3 .. +3 (negative=spadek, 0=konsolidacja, positive=wzrost)

  // Load from LS immediately
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BriefItem;
        if (parsed && parsed.ts_iso) setLatest(parsed);
      }
    } catch {}
  }, []);

  // Auto-refresh co godzinę: jeśli wpis starszy niż 1h, pobierz najnowszy
  useEffect(() => {
    let alive = true;
    const FRESH_MS = 60 * 60 * 1000; // 1h

    async function pull() {
      const now = Date.now();
      // jeżeli w LS mamy świeższe niż 1h — użyj i nie pobieraj
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as BriefItem;
          const ts = parsed?.ts_iso ? new Date(parsed.ts_iso).getTime() : 0;
          if (ts && now - ts < FRESH_MS) {
            if (alive) setLatest(parsed);
            return;
          }
        }
      } catch {}

      // Pobierz najnowszy GEN; jeśli brak, spróbuj DAILY lub bucket=24h
      let item: BriefItem | null = await fetchLatestBrief();
      if (!item) {
        try {
          const r = await fetch('/api/brief/list?type=DAILY&limit=1&fallback=true', { cache: 'no-store' });
          if (r.ok) {
            const j = await r.json();
            item = Array.isArray(j?.items) && j.items.length ? j.items[0] : null;
          }
        } catch {}
      }
      if (!item) {
        try {
          const r = await fetch('/api/brief/list?bucket=24h&limit=1', { cache: 'no-store' });
          if (r.ok) {
            const j = await r.json();
            item = Array.isArray(j?.items) && j.items.length ? j.items[0] : null;
          }
        } catch {}
      }

      if (!alive) return;
      if (item) {
        setLatest(item);
        try { localStorage.setItem(LS_KEY, JSON.stringify(item)); } catch {}
        setNetError(false);
      } else {
        setNetError(true);
      }
    }

    void pull();
    const id = setInterval(() => void pull(), 60 * 60 * 1000); // co godzinę
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Determine US100 daily trend to show short opinion label
  useEffect(() => {
    let alive = true;

    function computeEMA(values: number[], period: number): number[] {
      if (!values.length || period <= 1) return values.slice();
      const k = 2 / (period + 1);
      const out: number[] = [];
      let prev = values[0];
      out.push(prev);
      for (let i = 1; i < values.length; i++) {
        const cur = values[i] * k + prev * (1 - k);
        out.push(cur);
        prev = cur;
      }
      return out;
    }
    function computeRSI(values: number[], period = 14): number | undefined {
      if (values.length < period + 1) return undefined;
      let gains = 0;
      let losses = 0;
      for (let i = values.length - period; i < values.length; i++) {
        const change = values[i] - values[i - 1];
        if (change >= 0) gains += change; else losses -= change;
      }
      if (gains + losses === 0) return 50;
      const rs = gains / (losses === 0 ? 1e-9 : losses);
      return 100 - 100 / (1 + rs);
    }
    function computeMACDHist(values: number[]): number | undefined {
      if (values.length < 35) return undefined;
      const ema12 = computeEMA(values, 12);
      const ema26 = computeEMA(values, 26);
      const macdLine = ema12.map((v, i) => v - (ema26[i] ?? v));
      const signal = computeEMA(macdLine, 9);
      const hist = macdLine[macdLine.length - 1] - signal[signal.length - 1];
      return hist;
    }
    function pct(a: number, b: number): number {
      return b !== 0 ? ((a - b) / b) * 100 : 0;
    }
    function computeVolatilityPct(values: number[], window = 20): number | undefined {
      if (values.length < window + 1) return undefined;
      const rets: number[] = [];
      for (let i = values.length - window; i < values.length; i++) {
        const r = pct(values[i], values[i - 1]);
        rets.push(r);
      }
      const mean = rets.reduce((s, v) => s + v, 0) / rets.length;
      const variance = rets.reduce((s, v) => s + (v - mean) * (v - mean), 0) / rets.length;
      return Math.sqrt(variance);
    }

    async function fetchSpark() {
      try {
        const r = await fetch(`/api/quotes/sparkline?symbols=US100&range=7d&interval=1h`, { cache: 'no-store' });
        if (!r.ok) {
          console.warn('[QuickAI] Failed to fetch sparkline data');
          return;
        }
        const j = await r.json();
        const arr: Array<{ symbol: string; series: Array<[number, number]> }> = Array.isArray(j?.data) ? j.data : [];
        const series = arr.find(x => x.symbol === 'US100')?.series ?? [];
        if (!series.length) {
          console.warn('[QuickAI] No series data for US100');
          return;
        }
        const sorted = series.slice().sort((a, b) => a[0] - b[0]);
        const last = sorted[sorted.length - 1];
        const dayMs = 24 * 3600 * 1000;
        const targetTs = last[0] - dayMs;
        // find point closest to targetTs but not after last
        let base = sorted[0];
        for (let i = sorted.length - 2; i >= 0; i--) {
          if (sorted[i][0] <= targetTs) { base = sorted[i]; break; }
        }
        const changePct = base[1] > 0 ? ((last[1] - base[1]) / base[1]) * 100 : 0;

        // Compute technicals from closes
        const closes = sorted.map(p => p[1]);
        const ema21Arr = computeEMA(closes, 21);
        const ema21 = ema21Arr[ema21Arr.length - 1];
        const ema21Prev = ema21Arr[Math.max(0, ema21Arr.length - 6)]; // ~5 steps back
        const emaSlopePct = pct(ema21, ema21Prev);
        const ema21DistPct = pct(closes[closes.length - 1], ema21);
        const rsi14 = computeRSI(closes, 14);
        const macdHist = computeMACDHist(closes);
        const volPct = computeVolatilityPct(closes, 20);

        // Improved trend calculation using multiple indicators
        // Combine price change, MACD, EMA slope, and RSI
        let upSignals = 0;
        let downSignals = 0;

        // Price change (24h)
        const THRESH = 0.3; // Lowered threshold from 0.4% to 0.3%
        if (changePct > THRESH) upSignals += 1;
        else if (changePct < -THRESH) downSignals += 1;

        // MACD histogram
        if (macdHist != null) {
          if (macdHist > 0.1) upSignals += 1.5; // Stronger weight for MACD
          else if (macdHist < -0.1) downSignals += 1.5;
        }

        // EMA21 slope (trend direction)
        if (emaSlopePct != null) {
          if (emaSlopePct > 0.1) upSignals += 1;
          else if (emaSlopePct < -0.1) downSignals += 1;
        }

        // EMA21 distance (price vs moving average)
        if (ema21DistPct != null) {
          if (ema21DistPct > 0.5) upSignals += 0.5;
          else if (ema21DistPct < -0.5) downSignals += 0.5;
        }

        // RSI (momentum)
        if (rsi14 != null) {
          if (rsi14 > 55) upSignals += 0.5;
          else if (rsi14 < 45) downSignals += 0.5;
        }

        // Determine trend label
        let label: 'wzrost' | 'spadek' | 'konsolidacja' = 'konsolidacja';
        const signalDiff = upSignals - downSignals;
        if (signalDiff > 1) {
          label = 'wzrost';
        } else if (signalDiff < -1) {
          label = 'spadek';
        } else {
          label = 'konsolidacja';
        }

        if (alive) {
          setTrend(label);
          setTech({ rsi14, macdHist, ema21DistPct, volPct, emaSlopePct });
        }
      } catch (err) {
        console.warn('[QuickAI] Error fetching sparkline:', err);
        // keep default 'konsolidacja' on failure
      }
    }
    
    void fetchSpark();
    // Refresh trend every 15 minutes
    const intervalId = setInterval(() => {
      if (alive) void fetchSpark();
    }, 15 * 60 * 1000);
    
    return () => { 
      alive = false; 
      clearInterval(intervalId);
    };
  }, []);

  // Check if it's weekend
  const isWeekend = () => {
    const d = new Date();
    const wd = d.getDay();
    return wd === 0 || wd === 6; // Sunday or Saturday
  };

  const tsLabel = latest?.ts_iso
    ? (() => {
        const date = new Date(latest.ts_iso);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        const isOld = diffHours > 24;
        const label = date.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        // Add weekend indicator if applicable
        if (isWeekend() && isOld) {
          return `${label} (weekend)`;
        }
        return label;
      })()
    : '';

  const bullets = latest?.bullets?.length ? latest.bullets.slice(0, 8) : [];
  const inferred = inferMetricsFromText(latest);
  const baseM = latest?.metrics || {};
  const m = {
    rsi: baseM.rsi ?? inferred.rsi,
    adx: baseM.adx ?? inferred.adx,
    macd: baseM.macd ?? inferred.macd,
    volume: baseM.volume ?? inferred.volume,
    dist200: baseM.dist200 ?? inferred.dist200,
  };
  const sentiment = latest?.sentiment || '—';
  const sentimentLabel = typeof sentiment === 'string' ? sentiment.replace('Neutralny', 'Neutralny') : '—';
  const opinionSanitized = latest?.opinion ? stripMarkdownHeadings(latest.opinion) : '';
  // We intentionally hide verbose bullet list in this compact card to keep readability.

  // --- Decyzja AI (raz dziennie) ---
  type Decision = { label: 'WZROST' | 'SPADEK' | 'KONSOLIDACJA'; reason: string; date: string };
  const [decision, setDecision] = useState<Decision | null>(null);

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function parseDist200(dist?: string): number | undefined {
    if (!dist) return undefined;
    const m = String(dist).match(/([+\-]?\d+(?:[.,]\d+)?)\s*%/);
    if (!m) return undefined;
    const n = Number(m[1].replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  }

  function computeDecision(): Decision {
    // Prefer client-derived technicals
    const macdHist = typeof tech.macdHist === 'number' ? tech.macdHist : (typeof m.macd === 'number' ? m.macd : undefined);
    const dist = typeof tech.ema21DistPct === 'number' ? tech.ema21DistPct : parseDist200(m.dist200);
    const slope = typeof tech.emaSlopePct === 'number' ? tech.emaSlopePct : undefined;
    const vol = typeof tech.volPct === 'number' ? tech.volPct : undefined;

    let up = 0;
    let down = 0;
    // trend z US100 (z QuickAI) - stronger weight
    if (trend === 'wzrost') up += 1.5;
    if (trend === 'spadek') down += 1.5;

    // MACD histogram — momentum change (stronger weight for significant values)
    if (macdHist != null) {
      if (macdHist > 0.2) up += 2; // Strong bullish momentum
      else if (macdHist > 0) up += 1;
      else if (macdHist < -0.2) down += 2; // Strong bearish momentum
      else if (macdHist < 0) down += 1;
    }
    // Odległość od EMA21
    if (dist != null) {
      if (dist > 1.5) up += 2; // Strong above EMA
      else if (dist > 0.3) up += 1;
      else if (dist < -1.5) down += 2; // Strong below EMA
      else if (dist < -0.3) down += 1;
    }
    // Slope EMA21 — kierunek trendu
    if (slope != null) {
      if (slope > 0.1) up += 1.5; // Strong upward slope
      else if (slope > 0.05) up += 1;
      else if (slope < -0.1) down += 1.5; // Strong downward slope
      else if (slope < -0.05) down += 1;
    }

    // Niska zmienność => konsolidacja (but only if all signals are weak)
    const signalDiff = up - down;
    if (vol != null && vol < 0.15 && Math.abs(signalDiff) < 1) {
      return { label: 'KONSOLIDACJA', reason: 'Niska zmienność i brak przewagi momentum.', date: todayStr(), score: 0 };
    }

    // Rozstrzygnięcie - lowered threshold from 1 to 0.5 for better sensitivity
    let label: Decision['label'] = 'KONSOLIDACJA';
    if (Math.abs(signalDiff) > 0.5) {
      label = signalDiff > 0 ? 'WZROST' : 'SPADEK';
    } else {
      label = 'KONSOLIDACJA';
    }

    // Powód (krótko, po polsku)
    const reasons: string[] = [];
    if (trend !== 'konsolidacja') reasons.push(`Trend: ${trend}`);
    if (macdHist != null && Math.abs(macdHist) > 0.1) reasons.push(`MACD ${macdHist > 0 ? '↑' : '↓'} ${Math.abs(macdHist).toFixed(2)}`);
    if (dist != null && Math.abs(dist) > 0.3) reasons.push(`${dist > 0 ? '+' : ''}${dist.toFixed(1)}% od EMA21`);
    if (slope != null && Math.abs(slope) > 0.05) reasons.push(`EMA21 ${slope > 0 ? '↑' : '↓'} ${Math.abs(slope).toFixed(2)}%`);
    const reason =
      label === 'KONSOLIDACJA'
        ? 'Wskaźniki nie wskazują przewagi strony popytu/podaży.'
        : reasons.length > 0 
          ? `Przewaga sygnałów: ${reasons.slice(0, 3).join(', ')}.`
          : 'Analiza wskaźników technicznych.';

    const score = signalDiff; // -inf..+inf, realnie ~ -5..+5
    return { label, reason, date: todayStr(), score };
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DECISION_KEY);
      const parsed = raw ? (JSON.parse(raw) as Decision) : null;
      if (parsed && parsed.date === todayStr()) {
        setDecision(parsed);
        if (typeof parsed.score === 'number') setGauge(parsed.score);
        return;
      }
    } catch {}
    const d = computeDecision();
    setDecision(d);
    if (typeof d.score === 'number') setGauge(d.score);
    try { localStorage.setItem(DECISION_KEY, JSON.stringify(d)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.rsi, m.adx, m.macd, m.volume, m.dist200, trend]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-5 transition-colors hover:bg-white/10">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Szybkie info (AI)</h2>
      </div>

      {netError && (
        <div className="mb-3">
          <BannerError>Nie udało się pobrać świeżych danych. Pokazuję ostatni zapis z pamięci.</BannerError>
        </div>
      )}

      <div className="grid gap-4 items-start md:grid-cols-[1fr_180px]">
        {/* Lewa kolumna */}
        <div className="min-w-0 break-words">
          <div className="text-sm text-white/60">Szybki briefing — GEN {tsLabel && `(${tsLabel})`}</div>
          {/* skrót opinii */}
          <div className="mt-3 text-sm">
            <div className="text-white/60 mb-1">Opinia AI (skrót)</div>
            <p className="font-medium line-clamp-2 capitalize">{trend}</p>
            {/* Wizualizacja: spadek ↔ konsolidacja ↔ wzrost */}
            <div className="mt-2">
              <div className="relative h-1.5 rounded bg-white/10">
                <div className="absolute inset-0 rounded bg-gradient-to-r from-rose-400/40 via-white/20 to-emerald-400/40" />
                <div
                  className="absolute -top-1.5 h-4 w-4 rounded-full bg-white border border-white/30 shadow"
                  style={{
                    left: `calc(${Math.max(0, Math.min(100, ((gauge + 3) / 6) * 100))}% - 8px)`,
                  }}
                  aria-label="Wskaźnik kierunku"
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-white/60">
                <span>Spadek</span>
                <span>Konsolidacja</span>
                <span>Wzrost</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prawa kolumna – metryki */}
        <aside className="md:w-[180px] w-full shrink-0 space-y-2 mx-auto text-center">
          <div className="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold bg-white/10 border border-white/15">
            {sentimentLabel}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              label="MACD hist"
              value={tech.macdHist != null ? Number(tech.macdHist).toFixed(2) : (m?.macd !== undefined ? Number(m.macd).toFixed(2) : '—')}
              hint="MACD histogram: momentum zmiany; >0 przewaga wzrostowa, <0 spadkowa."
            />
            <StatTile
              label="Dist EMA21"
              value={tech.ema21DistPct != null ? `${tech.ema21DistPct.toFixed(1)}%` : (m?.dist200 ?? '—')}
              hint="Odległość od EMA21; dodatnia powyżej średniej, ujemna poniżej."
            />
            <StatTile
              label="σ20 (vol)"
              value={tech.volPct != null ? `${tech.volPct.toFixed(2)}%` : '—'}
              hint="Zmienność stopy zwrotu (okno 20); wyższa = większe wahania."
            />
            <StatTile
              label="Nach. EMA21"
              value={tech.emaSlopePct != null ? `${tech.emaSlopePct.toFixed(2)}%` : '—'}
              hint="Nachylenie EMA21 (ok. 5 kroków); dodatnie = kierunek w górę."
            />
          </div>
        </aside>
      </div>

      {/* Decyzja AI (24h) */}
      <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Decyzja AI (24h)</div>
          <span
            className={
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ' +
              (decision?.label === 'WZROST'
                ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30'
                : decision?.label === 'SPADEK'
                  ? 'bg-rose-500/15 text-rose-200 ring-rose-400/30'
                  : 'bg-white/10 text-white/80 ring-white/20')
            }
          >
            {decision?.label ?? 'KONSOLIDACJA'}
          </span>
        </div>
        <p className="mt-1 text-sm text-white/70">
          {decision?.reason ?? 'Wskaźniki nie dają przewagi którejkolwiek ze stron.'}
        </p>
        <div className="mt-2 text-[11px] text-white/50">Aktualizacja raz dziennie • EDU</div>
      </div>

      <div className="mt-3 text-[11px] text-white/50">Materiał edukacyjny — nie jest doradztwem inwestycyjnym.</div>
    </section>
  );
}

