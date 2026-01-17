// app/konto/panel-rynkowy/scenariusze-abc/ScenariosClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScenarioItem, ScenarioPart } from '@/lib/panel/scenariosABC';
import { updatePriceValuesInText } from '@/lib/panel/scenarioTextUpdater';

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

type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };

function mapToFinnhubSymbol(asset: string): { symbol: string; decimals: number } | null {
  const v = String(asset || '').toUpperCase();
  // Indices (CFD via OANDA)
  if (v === 'US100' || v.includes('NAS100')) return { symbol: 'OANDA:NAS100_USD', decimals: 0 };
  if (v === 'US500' || v.includes('SPX') || v.includes('S&P')) return { symbol: 'OANDA:US500_USD', decimals: 0 };
  if (v === 'US30' || v.includes('DOW')) return { symbol: 'OANDA:US30_USD', decimals: 0 };
  if (v === 'DE40' || v.includes('DAX')) return { symbol: 'OANDA:DE30_EUR', decimals: 0 }; // OANDA symbol name

  // FX (CFD/cash via OANDA)
  if (v === 'EURUSD') return { symbol: 'OANDA:EUR_USD', decimals: 5 };
  if (v === 'GBPUSD') return { symbol: 'OANDA:GBP_USD', decimals: 5 };
  if (v === 'USDJPY') return { symbol: 'OANDA:USD_JPY', decimals: 3 };
  if (v === 'EURPLN') return { symbol: 'OANDA:EUR_PLN', decimals: 4 };
  if (v === 'USDPLN') return { symbol: 'OANDA:USD_PLN', decimals: 4 };

  // Commodities
  if (v === 'XAUUSD' || v === 'XAU') return { symbol: 'OANDA:XAU_USD', decimals: 2 };
  // Silver: część źródeł zwraca różne jednostki; TVC:SILVER jest stabilnym feedem spot
  if (v === 'XAGUSD' || v === 'XAG') return { symbol: 'TVC:SILVER', decimals: 2 };
  if (v === 'WTI') return { symbol: 'OANDA:WTICO_USD', decimals: 2 };
  if (v === 'BRENT') return { symbol: 'OANDA:BCO_USD', decimals: 2 };

  // Stocks (Finnhub native)
  const STOCKS = new Set(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'NFLX']);
  if (STOCKS.has(v)) return { symbol: v, decimals: 2 };

  return null;
}

function fmt(n: number | undefined, digits: number) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function parseLevelToNumber(v: string | number): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v || '').trim();
  if (!s) return null;
  // Remove thousands separators (spaces, commas), keep dot as decimal
  const cleaned = s.replace(/[\s,\u00A0]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
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
  currentPrice?: number,
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
  originalLevels,
  normalizedLevels,
  decimals,
}: {
  title: string;
  data: ScenarioPart;
  originalLevels?: Array<string | number>;
  normalizedLevels?: string[];
  decimals?: number;
}) {
  // Aktualizuj wartości cenowe w tekstach jeśli mamy znormalizowane poziomy
  const updatedIf = useMemo(() => {
    if (originalLevels && normalizedLevels && decimals != null) {
      return updatePriceValuesInText(data.if, originalLevels, normalizedLevels, decimals);
    }
    return data.if;
  }, [data.if, originalLevels, normalizedLevels, decimals]);
  
  const updatedInvalidation = useMemo(() => {
    if (originalLevels && normalizedLevels && decimals != null) {
      return updatePriceValuesInText(data.invalidation, originalLevels, normalizedLevels, decimals);
    }
    return data.invalidation;
  }, [data.invalidation, originalLevels, normalizedLevels, decimals]);
  
  const updatedConfirmations = useMemo(() => {
    if (originalLevels && normalizedLevels && decimals != null && data.confirmations) {
      return updatePriceValuesInText(data.confirmations, originalLevels, normalizedLevels, decimals);
    }
    return data.confirmations;
  }, [data.confirmations, originalLevels, normalizedLevels, decimals]);
  
  const updatedRiskNotes = useMemo(() => {
    if (originalLevels && normalizedLevels && decimals != null && data.riskNotes) {
      return updatePriceValuesInText(data.riskNotes, originalLevels, normalizedLevels, decimals);
    }
    return data.riskNotes;
  }, [data.riskNotes, originalLevels, normalizedLevels, decimals]);
  
  const bulletsIf = useMemo(() => splitToBullets(updatedIf), [updatedIf]);
  const bulletsInvalid = useMemo(() => splitToBullets(updatedInvalidation), [updatedInvalidation]);
  const bulletsConf = useMemo(() => splitToBullets(updatedConfirmations || ''), [updatedConfirmations]);
  const bulletsRisk = useMemo(() => splitToBullets(updatedRiskNotes || ''), [updatedRiskNotes]);

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

  // Live quotes (CFD-centric via Finnhub/OANDA mapping)
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN || process.env.NEXT_PUBLIC_FINNHUB_KEY;
  const [overridePrices, setOverridePrices] = useState<Record<string, number>>({});

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

  // Read live quotes snapshot from topbar ticker (localStorage), to keep prices identical across app
  useEffect(() => {
    let alive = true;
    function readTopbarSnapshot() {
      if (typeof window === 'undefined') return;
      try {
        const ls = window.localStorage;
        const merged: Record<string, Quote> = {};
        for (let i = 0; i < ls.length; i++) {
          const k = ls.key(i);
          if (!k || !k.startsWith('ticker:finnhub:v1:')) continue;
          const raw = ls.getItem(k);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw) as Record<string, Quote> | null;
            if (!parsed || typeof parsed !== 'object') continue;
            for (const sym of Object.keys(parsed)) {
              const cur = merged[sym];
              const nxt = parsed[sym];
              if (!nxt || typeof nxt !== 'object') continue;
              // prefer latest by lastTs
              const curTs = typeof cur?.lastTs === 'number' ? cur.lastTs : 0;
              const nxtTs = typeof nxt?.lastTs === 'number' ? nxt.lastTs : 0;
              if (!cur || nxtTs >= curTs) merged[sym] = nxt;
            }
          } catch {
            // ignore malformed entry
          }
        }
        if (!alive) return;
        if (Object.keys(merged).length === 0) return;
        // Only keep symbols relevant for currently shown scenarios
        const needed = new Set(
          filtered
            .map((s) => s.asset)
            .map((a) => mapToFinnhubSymbol(a)?.symbol)
            .filter(Boolean) as string[]
        );
        if (needed.size === 0) return;
        const next: Record<string, Quote> = {};
        for (const sym of needed) {
          const q = merged[sym];
          if (q && typeof q === 'object') next[sym] = q;
        }
        if (Object.keys(next).length) {
          setQuotes((prev) => ({ ...prev, ...next }));
        }
      } catch {
        // noop
      }
    }
    // initial read
    readTopbarSnapshot();
    // poll to stay in sync with topbar WS updates
    const id = window.setInterval(readTopbarSnapshot, 1000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [filtered]);

  // Server snapshot (independent from public token) — merge if available
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch('/api/edu/scenarios/snapshot?ttlMin=60', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        const arr = Array.isArray(j?.data) ? (j.data as Array<{ asset: string; symbol?: string; price?: number; prevClose?: number; changePct?: number }>) : [];
        const next: Record<string, Quote> = {};
        for (const row of arr) {
          const sym = typeof row?.symbol === 'string' ? row.symbol : undefined;
          if (!sym) continue;
          const price = typeof row?.price === 'number' ? row.price : undefined;
          const prevClose = typeof row?.prevClose === 'number' ? row.prevClose : undefined;
          const changePct = typeof row?.changePct === 'number' ? row.changePct : undefined;
          next[sym] = { price, prevClose, changePct, lastTs: Date.now() };
        }
        if (!alive || Object.keys(next).length === 0) return;
        setQuotes((prev) => ({ ...prev, ...next }));
      } catch {
        // noop
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch admin price overrides for visible assets (public GET)
  // Automatycznie odświeża gdy updatedAt się zmienia (polling co 10s)
  useEffect(() => {
    let alive = true;
    async function fetchOverrides() {
      try {
        const uniqAssets = Array.from(new Set(filtered.map((s) => s.asset)));
        if (!uniqAssets.length) return;
        const results = await Promise.allSettled(
          uniqAssets.map(async (a) => {
            const r = await fetch(`/api/panel/price-override/${encodeURIComponent(a)}`, { cache: 'no-store' });
            if (!r.ok) throw new Error(String(r.status));
            const j = await r.json();
            const price = typeof j?.price === 'number' ? j.price : null;
            return { asset: a, price };
          }),
        );
        if (!alive) return;
        const next: Record<string, number> = {};
        for (const it of results) {
          if (it.status !== 'fulfilled') continue;
          if (it.value.price != null && isFinite(it.value.price) && it.value.price > 0) {
            next[it.value.asset.toUpperCase()] = it.value.price;
          }
        }
        if (Object.keys(next).length) {
          setOverridePrices((prev) => {
            // Sprawdź czy ceny się zmieniły - jeśli tak, odśwież
            const changed = Object.keys(next).some(
              (key) => prev[key] !== next[key]
            );
            return changed ? { ...prev, ...next } : prev;
          });
        }
      } catch {}
    }
    
    fetchOverrides();

    // refresh overrides on window focus to reflect recent admin saves
    function onFocus() {
      fetchOverrides();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }
    
    // Polling co 10 sekund, żeby wykryć zmiany override z admina
    const pollInterval = setInterval(fetchOverrides, 10000);
    
    return () => {
      alive = false;
      clearInterval(pollInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [filtered]);

  // Fetch quotes for visible assets (unique) using Finnhub REST snapshot
  // Tylko dla aktywów, które NIE mają override z admina
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!token) return;
        const uniq = Array.from(
          new Set(
            filtered
              .map((s) => s.asset)
              .map((a) => mapToFinnhubSymbol(a)?.symbol)
              .filter(Boolean) as string[]
          )
        );
        if (!uniq.length) return;
        
        // Filtruj tylko te symbole, które nie mają override
        const assetsWithoutOverride = filtered
          .map((s) => {
            const mapped = mapToFinnhubSymbol(s.asset);
            if (!mapped) return null;
            const hasOverride = overridePrices[s.asset.toUpperCase()] != null;
            return hasOverride ? null : mapped.symbol;
          })
          .filter(Boolean) as string[];
        
        if (assetsWithoutOverride.length === 0) return;
        
        const results = await Promise.allSettled(
          assetsWithoutOverride.map(async (sym) => {
            const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${token}`;
            const r = await fetch(url, { cache: 'no-store' });
            if (!r.ok) throw new Error(String(r.status));
            const j = await r.json();
            const price = typeof j.c === 'number' ? j.c : undefined;
            const prevClose = typeof j.pc === 'number' ? j.pc : undefined;
            const changePct =
              price != null && prevClose != null && prevClose !== 0
                ? ((price - prevClose) / prevClose) * 100
                : typeof j.dp === 'number'
                ? j.dp
                : undefined;
            return { sym, q: { price, prevClose, changePct, lastTs: Date.now() } as Quote };
          })
        );
        if (!alive) return;
        const next: Record<string, Quote> = {};
        for (const res of results) {
          if (res.status === 'fulfilled') next[res.value.sym] = res.value.q;
        }
        if (Object.keys(next).length) {
          setQuotes((prev) => ({ ...prev, ...next }));
        }
      } catch {
        // noop
      }
    })();
    return () => {
      alive = false;
    };
  }, [filtered, token, overridePrices]);

  function keyFor(asset: string, tf: string) {
    return `${asset}__${tf}`;
  }

  // Helper function to get effective price (override z admina jako priorytet)
  function getEffectivePrice(asset: string, symbol?: string): number | undefined {
    const ov = overridePrices[asset.toUpperCase()];
    if (typeof ov === 'number' && ov > 0) {
      return ov;
    }
    if (symbol) {
      const q = quotes[symbol];
      if (q && typeof q.price === 'number' && q.price > 0) {
        return q.price;
      }
    }
    return undefined;
  }

  async function generateOpinionFor(s: ScenarioItem) {
    const k = keyFor(s.asset, s.timeframe);
    if (opinion[k]) return;
    setLoadingKey(k);
    setErrorKey(null);
    try {
      // Prepare current quote and normalized levels to feed the API with up-to-date context
      const mapped = mapToFinnhubSymbol(s.asset);
      const effectivePrice = getEffectivePrice(s.asset, mapped?.symbol);
      const normalizedLevels = normalizeLevelsForPrice(s.levels, effectivePrice, mapped?.decimals ?? 0);

      const r = await fetch('/api/edu/scenarios/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: s.asset,
          timeframe: s.timeframe,
          levels: s.levels,
          levelsNormalized: normalizedLevels,
          currentPrice: typeof effectivePrice === 'number' ? effectivePrice : undefined,
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
                <div className="flex items-center gap-2">
                  {(() => {
                    const m = mapToFinnhubSymbol(s.asset);
                    if (!m) return null;
                    const q = quotes[m.symbol];
                    const pct = q?.changePct;
                    const cls =
                      pct == null
                        ? 'text-white/70'
                        : pct >= 0
                        ? 'text-emerald-300'
                        : 'text-red-300';
                    return (
                      <div className="text-right">
                        <div className="text-xs text-white/70">
                          <span className="inline-block rounded border border-white/10 bg-white/5 px-2 py-0.5">
                            {fmt(
                              getEffectivePrice(s.asset, m.symbol),
                              m.decimals
                            )}
                          </span>
                        </div>
                        <div className={`text-[11px] ${cls}`}>
                          {pct == null ? '—' : `${pct.toFixed(2)}%`}
                        </div>
                      </div>
                    );
                  })()}
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                    EDU
                  </span>
                </div>
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
                  {(() => {
                    const m = mapToFinnhubSymbol(s.asset);
                    const priceForRebase = getEffectivePrice(s.asset, m?.symbol);
                    const display = normalizeLevelsForPrice(s.levels, priceForRebase, m?.decimals ?? 0);
                    return display.map((lv, i) => <li key={i}>{lv}</li>);
                  })()}
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
              {(() => {
                const m = mapToFinnhubSymbol(s.asset);
                const priceForRebase = getEffectivePrice(s.asset, m?.symbol);
                const normalized = normalizeLevelsForPrice(s.levels, priceForRebase, m?.decimals ?? 0);
                return (
                  <>
                    <ScenarioBlock 
                      title="Scenariusz A" 
                      data={s.scenarioA}
                      originalLevels={s.levels}
                      normalizedLevels={normalized}
                      decimals={m?.decimals ?? 0}
                    />

                    <details className="mt-3 group rounded-xl border border-white/10">
                      <summary className="cursor-pointer list-none select-none rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06]">
                        <span className="font-semibold">Pokaż B/C (rozwiń)</span>
                      </summary>
                      <div className="p-3">
                        <ScenarioBlock 
                          title="Scenariusz B" 
                          data={s.scenarioB}
                          originalLevels={s.levels}
                          normalizedLevels={normalized}
                          decimals={m?.decimals ?? 0}
                        />
                        <ScenarioBlock 
                          title="Scenariusz C" 
                          data={s.scenarioC}
                          originalLevels={s.levels}
                          normalizedLevels={normalized}
                          decimals={m?.decimals ?? 0}
                        />
                      </div>
                    </details>
                  </>
                );
              })()}
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


