// app/konto/panel-rynkowy/scenariusze-abc/ScenariosClient.tsx
'use client';

import { useMemo, useState } from 'react';
import type { ScenarioItem, ScenarioPart } from '@/lib/panel/scenariosABC';

type Props = {
  items: ScenarioItem[];
};

type CategoryKey = 'Wszystko' | 'FX' | 'Indeksy' | 'Towary' | 'Akcje';
type Timeframe = ScenarioItem['timeframe'];

const C_FX = ['EURUSD', 'GBPUSD', 'USDJPY', 'EURPLN', 'USDPLN'];
const C_INDEKSY = ['US100', 'US500', 'DE40', 'US30'];
const C_TOWARY = ['XAUUSD', 'XAGUSD', 'WTI', 'BRENT'];
const C_AKCJE = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META'];

const CATEGORY_ASSETS: Record<CategoryKey, string[]> = {
  Wszystko: [...C_FX, ...C_INDEKSY, ...C_TOWARY, ...C_AKCJE],
  FX: C_FX,
  Indeksy: C_INDEKSY,
  Towary: C_TOWARY,
  Akcje: C_AKCJE,
};

const TIMEFRAMES: Timeframe[] = ['H1', 'H4', 'D1'];

function splitToBullets(text: string): string[] {
  const raw = String(text || '').trim();
  if (!raw) return [];
  // Try to split on sentence delimiters or semicolons to get short bullets (max 4)
  const parts = raw
    .split(/(?<=[.!?])\s+|;\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 1) return [parts[0]];
  return parts.slice(0, 4);
}

function ScenarioBlock({
  title,
  data,
}: {
  title: string;
  data: ScenarioPart;
}) {
  const bulletsIf = useMemo(() => splitToBullets(data.if), [data.if]);
  const bulletsInvalid = useMemo(() => splitToBullets(data.invalidation), [data.invalidation]);
  const bulletsConf = useMemo(() => splitToBullets(data.confirmations), [data.confirmations]);
  const bulletsRisk = useMemo(() => splitToBullets(data.riskNotes), [data.riskNotes]);

  return (
    <div className="mt-3 text-sm text-white/80">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 grid gap-2">
        <div>
          <div className="text-white/70">Co musiałoby się stać</div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {bulletsIf.map((b, i) => (
              <li key={`if-${i}`}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-white/70">Kiedy ten pomysł traci sens</div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {bulletsInvalid.map((b, i) => (
              <li key={`inv-${i}`}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-white/70">Co warto sprawdzić jako potwierdzenie</div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {bulletsConf.map((b, i) => (
              <li key={`conf-${i}`}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-white/70">Na co uważać</div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {bulletsRisk.map((b, i) => (
              <li key={`risk-${i}`}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

type OpinionCache = Record<string, { text: string; at: number }>;

export default function ScenariosClient({ items }: Props) {
  // Selections (pending vs applied)
  const [selCat, setSelCat] = useState<CategoryKey>('Indeksy');
  const [selAsset, setSelAsset] = useState<string>('US100');
  const [selTf, setSelTf] = useState<Timeframe>('H4');
  const [applied, setApplied] = useState<{ cat: CategoryKey; asset: string; tf: Timeframe }>({
    cat: 'Indeksy',
    asset: 'US100',
    tf: 'H4',
  });

  // AI opinion state per (asset+tf)
  const [opinion, setOpinion] = useState<OpinionCache>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const assetOptions = useMemo(() => CATEGORY_ASSETS[selCat], [selCat]);

  const filtered = useMemo(() => {
    const a = applied.asset;
    const tf = applied.tf;
    if (applied.cat === 'Wszystko') {
      return items;
    }
    // Filter client-side on provided static examples; if nothing matches, show all for that asset or fallback to all
    const byAssetTf = items.filter((s) => (!a || s.asset === a) && (!tf || s.timeframe === tf));
    if (byAssetTf.length > 0) return byAssetTf;
    const byAsset = items.filter((s) => s.asset === a);
    return byAsset.length > 0 ? byAsset : items;
  }, [items, applied]);

  function keyFor(asset: string, tf: string) {
    return `${asset}__${tf}`;
  }

  async function generateOpinionFor(s: ScenarioItem) {
    const k = keyFor(s.asset, s.timeframe);
    if (opinion[k]) return;
    setLoadingKey(k);
    setErrorKey(null);
    try {
      const r = await fetch('/api/edu/scenarios/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: s.asset,
          timeframe: s.timeframe,
          levels: s.levels,
          contextText: s.context,
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(String(err?.error || `HTTP ${r.status}`));
      }
      const json = await r.json();
      const text = String(json?.shortOpinion || '').slice(0, 1200);
      setOpinion((prev) => ({ ...prev, [k]: { text, at: Date.now() } }));
    } catch (e: any) {
      setErrorKey(k);
    } finally {
      setLoadingKey((cur) => (cur === k ? null : cur));
    }
  }

  return (
    <div>
      {/* Filters bar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 sm:grid-cols-[160px_1fr_140px_auto] items-end">
          <div>
            <label htmlFor="cat" className="text-xs text-white/70">Kategoria</label>
            <select
              id="cat"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
              value={selCat}
              onChange={(e) => {
                const next = e.target.value as CategoryKey;
                setSelCat(next);
                const first = CATEGORY_ASSETS[next][0];
                setSelAsset(first);
              }}
            >
              {(Object.keys(CATEGORY_ASSETS) as CategoryKey[]).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="asset" className="text-xs text-white/70">Aktywo</label>
            <select
              id="asset"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
              value={selAsset}
              onChange={(e) => setSelAsset(e.target.value)}
            >
              {assetOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tf" className="text-xs text-white/70">Interwał</label>
            <select
              id="tf"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
              value={selTf}
              onChange={(e) => setSelTf(e.target.value as Timeframe)}
            >
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="sm:justify-self-end">
            <button
              onClick={() => setApplied({ cat: selCat, asset: selAsset, tf: selTf })}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Pokaż scenariusze
            </button>
          </div>
        </div>
      </div>

      {/* Grid of cards (2 columns on desktop) */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((s, idx) => {
          const k = keyFor(s.asset, s.timeframe);
          const hasOpinion = Boolean(opinion[k]);
          const ts = hasOpinion ? new Date(opinion[k].at).toLocaleString() : null;
          const loading = loadingKey === k;
          const errored = errorKey === k;
          return (
            <article key={`${s.asset}-${s.timeframe}-${idx}`} className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-white/70">
                  <div className="font-semibold text-white/80">{s.asset} · {s.timeframe}</div>
                  <div className="mt-0.5">Aktualizacja: {new Date(s.updatedAt).toLocaleString()}</div>
                </div>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                  EDU
                </span>
              </div>

              {/* Context */}
              <div className="mt-3 text-sm text-white/80">
                <div className="font-semibold">Kontekst</div>
                <p className="mt-1">{s.context}</p>
              </div>

              {/* Levels */}
              <div className="mt-2 text-sm text-white/80">
                <div className="font-semibold">Poziomy</div>
                <ul className="mt-1 list-disc pl-5">
                  {s.levels.map((lv, i) => <li key={i}>{String(lv)}</li>)}
                </ul>
              </div>

              {/* AI Opinion (EDU) */}
              <div className="mt-3 text-sm text-white/80 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span aria-hidden>✨</span>
                    <span>Opinia AI (edukacyjnie)</span>
                  </div>
                  {!hasOpinion && !loading && (
                    <button
                      onClick={() => generateOpinionFor(s)}
                      className="text-xs rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 hover:bg-white/20"
                    >
                      Wygeneruj opinię AI
                    </button>
                  )}
                </div>

                {loading && (
                  <div className="mt-2 animate-pulse space-y-2">
                    <div className="h-3 w-5/6 rounded bg-white/10" />
                    <div className="h-3 w-4/6 rounded bg-white/10" />
                    <div className="h-3 w-3/6 rounded bg-white/10" />
                  </div>
                )}

                {errored && !loading && !hasOpinion && (
                  <div className="mt-2 text-xs text-red-300">Nie udało się pobrać opinii. Spróbuj ponownie.</div>
                )}

                {hasOpinion && (
                  <div className="mt-2 space-y-2">
                    <p className="leading-6">{opinion[k]?.text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/60">Aktualizacja: {ts}</span>
                      <span className="text-[11px] text-white/50">To nie jest rekomendacja ani sygnał — tylko edukacyjny komentarz do wykresu.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scenarios */}
              <ScenarioBlock title="Scenariusz A" data={s.scenarioA} />

              <details className="mt-3 group rounded-xl border border-white/10">
                <summary className="cursor-pointer list-none select-none rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06]">
                  <span className="font-semibold">Pokaż B/C (rozwiń)</span>
                </summary>
                <div className="p-3">
                  <ScenarioBlock title="Scenariusz B" data={s.scenarioB} />
                  <ScenarioBlock title="Scenariusz C" data={s.scenarioC} />
                </div>
              </details>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-6 text-sm text-white/70">
          Brak scenariuszy dla wybranych filtrów.
        </div>
      )}
    </div>
  );
}


