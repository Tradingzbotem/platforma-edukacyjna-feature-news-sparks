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
      if (first && hasMetrics) return first;
    }

    // 2) Ask server to ensure/generate the latest brief via OpenAI (if key present)
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
    async function fetchSpark() {
      try {
        const r = await fetch(`/api/quotes/sparkline?symbols=US100&range=7d&interval=1h`, { cache: 'no-store' });
        const j = await r.json();
        const arr: Array<{ symbol: string; series: Array<[number, number]> }> = Array.isArray(j?.data) ? j.data : [];
        const series = arr.find(x => x.symbol === 'US100')?.series ?? [];
        if (!series.length) return;
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
        const THRESH = 0.4; // 0.4% threshold for consolidation
        const label = changePct > THRESH ? 'wzrost' : changePct < -THRESH ? 'spadek' : 'konsolidacja';
        if (alive) setTrend(label);
      } catch {
        // keep default 'konsolidacja' on failure
      }
    }
    void fetchSpark();
    return () => { alive = false; };
  }, []);

  const tsLabel = latest?.ts_iso
    ? new Date(latest.ts_iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
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
    const rsi = typeof m.rsi === 'number' ? m.rsi : undefined;
    const adx = typeof m.adx === 'number' ? m.adx : undefined;
    const macd = typeof m.macd === 'number' ? m.macd : undefined;
    const vol = m.volume;
    const d200 = parseDist200(m.dist200);

    let up = 0;
    let down = 0;
    // trend z US100 (z QuickAI)
    if (trend === 'wzrost') up += 1;
    if (trend === 'spadek') down += 1;

    // RSI — siła
    if (rsi != null) {
      if (rsi >= 70) up += 2;
      else if (rsi >= 60) up += 1;
      else if (rsi <= 30) down += 2;
      else if (rsi <= 40) down += 1;
    }
    // MACD — momentum
    if (macd != null) {
      if (macd > 0) up += 1;
      if (macd < 0) down += 1;
    }
    // Odległość od 200MA
    if (d200 != null) {
      if (d200 > 0) up += d200 > 2 ? 2 : 1;
      if (d200 < 0) down += Math.abs(d200) > 2 ? 2 : 1;
    }
    // Wolumen — wzmocnienie
    if (vol === 'Wysokie') {
      if (up > down) up += 1; else if (down > up) down += 1;
    }

    // ADX niski => konsolidacja
    if (adx != null && adx < 15) {
      return { label: 'KONSOLIDACJA', reason: 'Niska siła trendu (ADX<15) sugeruje konsolidację.', date: todayStr() };
    }

    // Rozstrzygnięcie
    let label: Decision['label'] = 'KONSOLIDACJA';
    if (Math.abs(up - down) <= 1) {
      label = 'KONSOLIDACJA';
    } else {
      label = up > down ? 'WZROST' : 'SPADEK';
    }

    // Powód (krótko, po polsku)
    const reasons: string[] = [];
    if (label !== 'KONSOLIDACJA' && adx != null && adx >= 15) reasons.push(`siła trendu ADX ${Math.round(adx)}`);
    if (rsi != null) reasons.push(`RSI ${Math.round(rsi)}`);
    if (macd != null) reasons.push(`MACD ${macd > 0 ? '>' : '<'} 0`);
    if (d200 != null) reasons.push(`${d200 > 0 ? '+' : ''}${d200}% od 200MA`);
    const reason =
      label === 'KONSOLIDACJA'
        ? 'Wskaźniki nie wskazują przewagi strony popytu/podaży.'
        : `Przewaga sygnałów (${reasons.slice(0, 3).join(', ')}).`;

    return { label, reason, date: todayStr() };
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DECISION_KEY);
      const parsed = raw ? (JSON.parse(raw) as Decision) : null;
      if (parsed && parsed.date === todayStr()) {
        setDecision(parsed);
        return;
      }
    } catch {}
    const d = computeDecision();
    setDecision(d);
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
          </div>
        </div>

        {/* Prawa kolumna – metryki */}
        <aside className="md:w-[180px] w-full shrink-0 space-y-2 mx-auto text-center">
          <div className="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold bg-white/10 border border-white/15">
            {sentimentLabel}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              label="RSI(14)"
              value={m?.rsi !== undefined ? Number(m.rsi).toFixed(0) : '—'}
              hint="RSI: 0–100; >70 wykupienie, <30 wyprzedanie. Krótkoterminowa siła ruchu."
            />
            <StatTile
              label="ADX"
              value={m?.adx !== undefined ? Number(m.adx).toFixed(0) : '—'}
              hint="ADX: siła trendu; <15 konsolidacja, 15–25 trend słaby, >25 trend silniejszy."
            />
            <StatTile
              label="MACD"
              value={m?.macd !== undefined ? Number(m.macd).toFixed(2) : '—'}
              hint="MACD: momentum; >0 przewaga wzrostów, <0 przewaga spadków."
            />
            <StatTile
              label="Wolumen"
              value={m?.volume ?? '—'}
              hint="Szacowany poziom aktywności obrotu: Niskie / Średnie / Wysokie."
            />
            <StatTile
              label="Dist 200MA"
              value={m?.dist200 ?? '—'}
              hint="Odległość od średniej 200-okresowej; dodatnia powyżej MA, ujemna poniżej."
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

