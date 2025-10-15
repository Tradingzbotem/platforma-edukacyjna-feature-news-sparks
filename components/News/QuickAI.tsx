// components/News/QuickAI.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BannerError, Button, Section, StatTile } from './ui';
import type { BriefItem as BriefItemT } from './types';

const LS_KEY = 'fxedu_quickai_latest';
const REFRESH_MS = 21600000; // 6h

type BriefItem = BriefItemT;

async function fetchLatestBrief(): Promise<BriefItem | null> {
  try {
    const res = await fetch('/api/brief/list?type=GEN&limit=1', { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const j = await res.json();
    const first = Array.isArray(j?.items) && j.items.length ? j.items[0] : null;
    return first || null;
  } catch {
    return null;
  }
}

function defaultPromptPL(): string {
  return (
    'Napisz po polsku zwięzły briefing rynkowy skierowany na USA. Wypisz najważniejsze wydarzenia z ostatnich 1-3 dni i ich możliwe konsekwencje dla rynków w USA. Jeśli dotyczy, uwzględnij wątek shutdownu administracji publicznej w USA. Styl edukacyjny, bez rekomendacji inwestycyjnych. Struktura: nagłówek „Szybki briefing — GEN”, sekcja „CO TERAZ GRA NAJGŁOŚNIEJ” (6–8 punktów), „OPINIA AI (SKRÓT)” jedno zdanie oraz metryki techniczne: RSI(14), ADX (proxy), MACD, wolumen, odległość od 200MA.'
  );
}

async function generateBriefNow(): Promise<boolean> {
  try {
    const res = await fetch('/api/brief/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'pl',
        range: '72h',
        prompt: defaultPromptPL(),
      }),
    });
    if (!res.ok) return false;
    const j = await res.json();
    return Boolean(j?.ok);
  } catch {
    return false;
  }
}

export default function QuickAI() {
  const [latest, setLatest] = useState<BriefItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [netError, setNetError] = useState(false);

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

  // Fetch latest now + every 6h
  useEffect(() => {
    let alive = true;
    async function pull() {
      const item = await fetchLatestBrief();
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
    const id = setInterval(pull, REFRESH_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  async function onGenerateNow() {
    setBusy(true);
    setNetError(false);
    const ok = await generateBriefNow();
    if (ok) {
      const item = await fetchLatestBrief();
      if (item) {
        setLatest(item);
        try { localStorage.setItem(LS_KEY, JSON.stringify(item)); } catch {}
      }
    } else {
      setNetError(true);
    }
    setBusy(false);
  }

  const tsLabel = latest?.ts_iso
    ? new Date(latest.ts_iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '';

  const bullets = latest?.bullets?.length ? latest.bullets.slice(0, 8) : [];
  const m = latest?.metrics || {};
  const sentiment = latest?.sentiment || '—';
  const sentimentLabel = typeof sentiment === 'string' ? sentiment.replace('Neutralny', 'Neutralny') : '—';

  return (
    <Section
      title="Szybkie info (AI)"
      right={<Button onClick={onGenerateNow} disabled={busy}>{busy ? 'Generowanie…' : 'Wygeneruj teraz'}</Button>}
    >
      {netError && (
        <div className="mb-3">
          <BannerError>Nie udało się pobrać świeżych danych. Pokazuję ostatni zapis z pamięci.</BannerError>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="text-sm text-white/60 mb-1">Szybki briefing — GEN {tsLabel && `(${tsLabel})`}</div>
          {bullets.length ? (
            <ul className="list-disc pl-5 space-y-1 text-white/80">
              {bullets.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : (
            <div className="text-white/60">—</div>
          )}
          {latest?.opinion && (
            <div className="mt-3 text-sm">
              <span className="text-white/60">Opinia AI (skrót): </span>
              <span className="font-medium">{latest.opinion}</span>
            </div>
          )}
        </div>
        <aside className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          <StatTile label="RSI(14)" value={m?.rsi !== undefined ? Number(m.rsi).toFixed(0) : '—'} />
          <StatTile label="ADX" value={m?.adx !== undefined ? Number(m.adx).toFixed(0) : '—'} />
          <StatTile label="MACD" value={m?.macd !== undefined ? Number(m.macd).toFixed(2) : '—'} />
          <StatTile label="Wolumen" value={m?.volume ?? '—'} />
          <StatTile label="Dist 200MA" value={m?.dist200 ?? '—'} />
          <StatTile label="Sentyment" value={sentimentLabel} />
        </aside>
      </div>
      <div className="mt-3 text-[11px] text-white/50">Materiał edukacyjny — nie jest doradztwem inwestycyjnym.</div>
    </Section>
  );
}

