// app/api/edu/scenarios/snapshot/route.ts — EDU: dzienny snapshot cen i dopasowanych poziomów
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { SCENARIOS_ABC } from '@/lib/panel/scenariosABC';

type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };

function mapToFinnhubSymbol(asset: string): { symbol: string; decimals: number } | null {
  const v = String(asset || '').toUpperCase();
  if (v === 'US100' || v.includes('NAS100')) return { symbol: 'OANDA:NAS100_USD', decimals: 0 };
  if (v === 'US500' || v.includes('SPX') || v.includes('S&P')) return { symbol: 'OANDA:US500_USD', decimals: 0 };
  if (v === 'US30' || v.includes('DOW')) return { symbol: 'OANDA:US30_USD', decimals: 0 };
  if (v === 'DE40' || v.includes('DAX')) return { symbol: 'OANDA:DE30_EUR', decimals: 0 };
  if (v === 'EURUSD') return { symbol: 'OANDA:EUR_USD', decimals: 5 };
  if (v === 'GBPUSD') return { symbol: 'OANDA:GBP_USD', decimals: 5 };
  if (v === 'USDJPY') return { symbol: 'OANDA:USD_JPY', decimals: 3 };
  if (v === 'EURPLN') return { symbol: 'OANDA:EUR_PLN', decimals: 4 };
  if (v === 'USDPLN') return { symbol: 'OANDA:USD_PLN', decimals: 4 };
  if (v === 'XAUUSD' || v === 'XAU') return { symbol: 'OANDA:XAU_USD', decimals: 2 };
  // Silver: TVC feed zapewnia spójne notowania spot
  if (v === 'XAGUSD' || v === 'XAG' || v === 'SILVER') return { symbol: 'TVC:SILVER', decimals: 2 };
  if (v === 'WTI') return { symbol: 'OANDA:WTICO_USD', decimals: 2 };
  if (v === 'BRENT') return { symbol: 'OANDA:BCO_USD', decimals: 2 };
  return null;
}

function parseLevelToNumber(v: string | number): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v || '').trim();
  if (!s) return null;
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
  if (!nums.length) return levels.map(String);
  if (currentPrice == null || !isFinite(currentPrice)) {
    return nums.map((n) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  }
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
  const scaled = needsRebase ? nums.map((n) => roundToStep(n * ratio, step)) : nums;
  return scaled.map((n) =>
    n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
}

type SnapshotItem = {
  asset: string;
  symbol?: string;
  decimals: number;
  price?: number;
  prevClose?: number;
  changePct?: number;
  levelsNormalized: string[];
  at: number;
};

let CACHE: { at: number; data: SnapshotItem[] } | null = null;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ttlMin = Math.max(5, Math.min(1440, Number(url.searchParams.get('ttlMin') || '60'))); // default 60 min
    const now = Date.now();
    if (CACHE && now - CACHE.at < ttlMin * 60_000) {
      return Response.json({ ok: true, cached: true, at: CACHE.at, data: CACHE.data }, { status: 200 });
    }

    const token =
      process.env.FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
      '';

    const uniqAssets = Array.from(new Set(SCENARIOS_ABC.map((s) => s.asset)));
    const results: SnapshotItem[] = [];

    for (const asset of uniqAssets) {
      const map = mapToFinnhubSymbol(asset);
      const decimals = map?.decimals ?? 0;
      let price: number | undefined;
      let prevClose: number | undefined;
      let changePct: number | undefined;

      if (map && token) {
        try {
          const r = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(map.symbol)}&token=${token}`,
            { cache: 'no-store' }
          );
          if (r.ok) {
            const j = await r.json();
            const p = typeof j.c === 'number' ? j.c : undefined;
            const pc = typeof j.pc === 'number' ? j.pc : undefined;
            price = p && isFinite(p) && p > 0 ? p : undefined;
            prevClose = pc && isFinite(pc) && pc > 0 ? pc : undefined;
            changePct =
              price != null && prevClose != null && prevClose !== 0
                ? ((price - prevClose) / prevClose) * 100
                : typeof j.dp === 'number'
                ? j.dp
                : undefined;
          }
        } catch {}
      }

      // find first scenario levels for that asset to normalize
      const first = SCENARIOS_ABC.find((s) => s.asset === asset);
      const levelsNormalized = normalizeLevelsForPrice(first?.levels ?? [], price, decimals);

      results.push({
        asset,
        symbol: map?.symbol,
        decimals,
        price,
        prevClose,
        changePct,
        levelsNormalized,
        at: now,
      });
    }

    CACHE = { at: now, data: results };
    return Response.json({ ok: true, cached: false, at: now, data: results }, { status: 200 });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


