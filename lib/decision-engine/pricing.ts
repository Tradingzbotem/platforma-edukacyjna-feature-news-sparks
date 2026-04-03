// lib/decision-engine/pricing.ts — mapowanie symboli, normalizacja poziomów, cena (Finnhub + override)
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

export type FinnhubMapping = { symbol: string; decimals: number };

export function mapToFinnhubSymbol(asset: string): FinnhubMapping | null {
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
	if (v === 'XAGUSD' || v === 'XAG' || v === 'SILVER') return { symbol: 'TVC:SILVER', decimals: 2 };
	if (v === 'WTI') return { symbol: 'OANDA:WTICO_USD', decimals: 2 };
	if (v === 'BRENT') return { symbol: 'OANDA:BCO_USD', decimals: 2 };
	return null;
}

export function parseLevelToNumber(v: string | number): number | null {
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

export function normalizeLevelsForPrice(
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
	const needsRebase = ratio >= 1.1 || ratio <= 0.9;
	const step = pickStepForPrice(currentPrice, decimals);
	const scaled = needsRebase ? nums.map((n) => roundToStep(n * ratio, step)) : nums;
	return scaled.map((n) =>
		n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
	);
}

export type QuoteSnapshot = {
	price?: number;
	prevClose?: number;
	changePct?: number;
	symbol?: string;
};

export async function fetchFinnhubQuote(symbol: string, token: string): Promise<QuoteSnapshot> {
	if (!token || !symbol) return {};
	try {
		const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`, {
			cache: 'no-store',
		});
		if (!r.ok) return {};
		const j = await r.json();
		const p = typeof j.c === 'number' ? j.c : undefined;
		const pc = typeof j.pc === 'number' ? j.pc : undefined;
		const price = p && isFinite(p) && p > 0 ? p : undefined;
		const prevClose = pc && isFinite(pc) && pc > 0 ? pc : undefined;
		const changePct =
			price != null && prevClose != null && prevClose !== 0
				? ((price - prevClose) / prevClose) * 100
				: typeof j.dp === 'number'
					? j.dp
					: undefined;
		return { price, prevClose, changePct, symbol };
	} catch {
		return {};
	}
}

function getFinnhubToken(): string {
	return (
		process.env.FINNHUB_KEY ||
		process.env.FINNHUB_TOKEN ||
		process.env.NEXT_PUBLIC_FINNHUB_KEY ||
		process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
		''
	);
}

async function ensurePriceOverridesTable() {
	if (!isDatabaseConfigured()) return;
	try {
		await sql`
      CREATE TABLE IF NOT EXISTS price_overrides (
        asset TEXT PRIMARY KEY,
        price NUMERIC NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
	} catch {
		// ignore
	}
}

function getMemStore(): Record<string, { price: number; updated_at: string }> {
	const g = globalThis as any;
	if (!g.__PRICE_OVERRIDES__) g.__PRICE_OVERRIDES__ = {};
	return g.__PRICE_OVERRIDES__;
}

export type PriceOverrideResult = {
	price: number | null;
	updatedAt: string | null;
	source: 'db' | 'env' | 'mem' | 'none';
};

/**
 * Ta sama kolejność co GET /api/panel/price-override/[asset] (bez HTTP).
 */
export async function readPriceOverride(assetUpper: string): Promise<PriceOverrideResult> {
	const asset = String(assetUpper || '').trim().toUpperCase();
	if (!asset) return { price: null, updatedAt: null, source: 'none' };

	if (isDatabaseConfigured()) {
		try {
			await ensurePriceOverridesTable();
			const { rows } = await sql<{ asset: string; price: string; updated_at: Date }>`
        SELECT asset, price::text, updated_at FROM price_overrides WHERE asset = ${asset} LIMIT 1
      `;
			const r = rows?.[0];
			if (r) {
				return {
					price: Number(r.price),
					updatedAt: new Date(r.updated_at).toISOString(),
					source: 'db',
				};
			}
		} catch {
			// continue
		}
	}

	const envKey = `OVERRIDE_${asset}_PRICE`;
	const envVal = process.env[envKey as any];
	const envNum = envVal != null ? Number(envVal) : NaN;
	if (Number.isFinite(envNum) && envNum > 0) {
		return { price: envNum, updatedAt: null, source: 'env' };
	}

	const mem = getMemStore();
	const inMem = mem[asset];
	if (inMem && Number.isFinite(inMem.price) && inMem.price > 0) {
		return { price: inMem.price, updatedAt: inMem.updated_at, source: 'mem' };
	}

	return { price: null, updatedAt: null, source: 'none' };
}

export type ResolvedPrice = {
	price: number | undefined;
	prevClose: number | undefined;
	changePct: number | undefined;
	override: PriceOverrideResult;
	quote: QuoteSnapshot;
	finnhubSymbol?: string;
	decimals: number;
};

/**
 * Cena efektywna: override (jeśli jest) > Finnhub quote.
 */
export async function resolvePriceForCanonicalAsset(canonicalAsset: string): Promise<ResolvedPrice> {
	const map = mapToFinnhubSymbol(canonicalAsset);
	const decimals = map?.decimals ?? 0;
	const token = getFinnhubToken();

	const [override, quoteRaw] = await Promise.all([
		readPriceOverride(canonicalAsset),
		map && token ? fetchFinnhubQuote(map.symbol, token) : Promise.resolve({} as QuoteSnapshot),
	]);

	const quote = map ? { ...quoteRaw, symbol: map.symbol } : quoteRaw;
	let price = override.price != null && isFinite(override.price) ? override.price : quote.price;
	const prevClose = quote.prevClose;
	const changePct = quote.changePct;

	return {
		price: price != null && isFinite(price) ? price : undefined,
		prevClose,
		changePct,
		override,
		quote,
		finnhubSymbol: map?.symbol,
		decimals,
	};
}
