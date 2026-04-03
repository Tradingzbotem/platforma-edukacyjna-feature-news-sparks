// app/api/edu/scenarios/snapshot/route.ts — EDU: dzienny snapshot cen i dopasowanych poziomów
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { SCENARIOS_ABC } from '@/lib/panel/scenariosABC';
import { fetchFinnhubQuote, mapToFinnhubSymbol, normalizeLevelsForPrice } from '@/lib/decision-engine/pricing';

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
				const q = await fetchFinnhubQuote(map.symbol, token);
				price = q.price;
				prevClose = q.prevClose;
				changePct = q.changePct;
			}

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
