// lib/panel/techLevels.ts — kanoniczne poziomy cenowe dla wybranych aktywów (EDU)
import type { TechMapItem } from './techMaps';

// Jedno źródło prawdy dla kluczowych poziomów wybranych aktywów.
// Wszystkie interwały tych aktywów będą korzystać z tych poziomów (EDU).
export const CANONICAL_LEVELS: Record<string, string[]> = {
	BRENT: ['83', '81', '79', '77'],
	WTI: ['78', '76', '74', '72', '70'],
};

export function enforceCanonicalLevels(items: TechMapItem[]): TechMapItem[] {
	return items.map((m) => {
		const canonical = CANONICAL_LEVELS[m.asset];
		if (!canonical) return m;
		// Wymuś kanoniczne poziomy niezależnie od TF/źródła (statyczne/DB/AI).
		return {
			...m,
			keyLevels: [...canonical],
		};
	});
}


