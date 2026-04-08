import { resolveMorningBriefCanonicalKeyFromAssetLabel } from '@/lib/brief/morningBriefAssetCanonical';
import type { MorningBriefPriceRowMeta } from '@/lib/brief/morningBriefMarketSnapshot';
import type { MorningBriefCanonicalKey } from '@/lib/brief/morningBriefMarketSymbols';

/**
 * Ustawia livePrice / livePriceSource / livePriceAgeHours wg rozstrzygnięcia serwera
 * (nadpisuje halucynacje modelu dla instrumentów z mapy snapshotu).
 */
export function overlayMorningBriefingAssetPriceFields(
	briefing: Record<string, unknown>,
	perLabel: Partial<Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>>,
): void {
	const assets = briefing.assets;
	if (!Array.isArray(assets)) return;

	for (const row of assets) {
		if (!row || typeof row !== 'object') continue;
		const r = row as Record<string, unknown>;
		const name = typeof r.asset === 'string' ? r.asset : '';
		const key = resolveMorningBriefCanonicalKeyFromAssetLabel(name);
		if (!key) continue;

		const meta = perLabel[key];
		if (!meta) continue;

		r.livePriceSource = meta.livePriceSource;

		if (meta.livePriceSource === 'none') {
			r.livePrice = '';
			delete r.livePriceAgeHours;
			continue;
		}

		if (meta.livePriceSource === 'live') {
			delete r.livePriceAgeHours;
			r.livePrice = meta.displayPrice ?? '';
			continue;
		}

		// override_recent
		if (meta.livePriceAgeHours != null) {
			r.livePriceAgeHours = meta.livePriceAgeHours;
		} else {
			delete r.livePriceAgeHours;
		}
		r.livePrice = meta.displayPrice ?? '';
	}
}
