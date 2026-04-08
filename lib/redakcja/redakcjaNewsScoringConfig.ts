/**
 * Reguły scoringu v1 dla dopasowania appendixu Redakcji do aktywa (Decision Center).
 * Mały, jawny zestaw — bez NLP; tylko wybrane kanoniczne assety + domyślny fallback (głównie direct).
 */

export type RedakcjaNewsScoringRules = {
	/** Tagi (uppercase, bez spacji) traktowane jako „pokrewne” przy direct +28, jeśli nie zaliczono exact +45. */
	directFamilyTags: string[];
	/** Słowa/frazy w tekście (lowercase) — trafienie daje macro +22 (łącznie max 22). */
	macroKeywords: string[];
	/** Słowa/frazy dla backdrop +12 (łącznie max 12). */
	backdropKeywords: string[];
};

const US100: RedakcjaNewsScoringRules = {
	directFamilyTags: ['NASDAQ', 'SPX', 'SP500', 'S&P', 'NDX'],
	macroKeywords: [
		'fed',
		'fomc',
		'powell',
		'cpi',
		'nfp',
		'payroll',
		'ism',
		'treasury',
		'yield',
		'dxy',
		'usd',
		'inflacja',
		'stopy procent',
		'stop procent',
		'stopy procentowe',
		'gdp',
		'pce',
	],
	backdropKeywords: [
		'geopol',
		'bliski wsch',
		'gaza',
		'ukrain',
		'iran',
		'opec',
		'ropa',
		'crude',
		'oil',
		'wti',
		'brent',
		'risk off',
		'risk on',
		'awersja do ryzyka',
	],
};

const EURUSD: RedakcjaNewsScoringRules = {
	directFamilyTags: ['DXY', 'DOLLAR', 'USD'],
	macroKeywords: [
		'ecb',
		'lagarde',
		'eurozone',
		'strefa euro',
		'euribor',
		'cpi',
		'inflacja',
		'fed',
		'fomc',
		'powell',
		'dxy',
	],
	backdropKeywords: ['geopol', 'risk off', 'risk on', 'awersja do ryzyka', 'ukrain', 'bliski wsch'],
};

const GBPUSD: RedakcjaNewsScoringRules = {
	directFamilyTags: ['DXY', 'USD'],
	macroKeywords: [
		'boe',
		'mpc',
		'bank of england',
		'gilt',
		'uk cpi',
		'inflacja wielkiej brytanii',
		'fed',
		'fomc',
		'dxy',
	],
	backdropKeywords: ['geopol', 'risk off', 'risk on', 'brexit'],
};

const XAUUSD: RedakcjaNewsScoringRules = {
	directFamilyTags: ['XAU', 'GOLD', 'SILVER', 'XAG'],
	macroKeywords: [
		'fed',
		'fomc',
		'powell',
		'cpi',
		'inflacja',
		'treasury',
		'yield',
		'real yield',
		'dxy',
		'usd',
		'stopy procent',
	],
	backdropKeywords: [
		'geopol',
		'bliski wsch',
		'gaza',
		'ukrain',
		'iran',
		'risk off',
		'awersja do ryzyka',
		'bezpieczna przystań',
	],
};

const WTI: RedakcjaNewsScoringRules = {
	directFamilyTags: ['BRENT', 'UKOIL', 'OIL', 'XTIUSD', 'ENERGY'],
	macroKeywords: ['eia', 'opec', 'inventories', 'zapasy ropy', 'production cut', 'cięcie produkcji', 'sanctions'],
	backdropKeywords: [
		'geopol',
		'bliski wsch',
		'gaza',
		'ukrain',
		'ormuz',
		'hormuz',
		'red sea',
		'supply shock',
		'embargo',
	],
};

/** Pusty profil: tylko uniwersalne direct (exact/family przez newsInstrumentMatch), bez słów macro/backdrop. */
const DEFAULT: RedakcjaNewsScoringRules = {
	directFamilyTags: [],
	macroKeywords: [],
	backdropKeywords: [],
};

const BY_CANONICAL: Record<string, RedakcjaNewsScoringRules> = {
	US100,
	EURUSD,
	GBPUSD,
	XAUUSD,
	WTI,
	BRENT: WTI,
};

export function getRedakcjaNewsScoringRules(canonicalAsset: string): RedakcjaNewsScoringRules {
	const c = String(canonicalAsset || '').trim().toUpperCase();
	return BY_CANONICAL[c] ?? DEFAULT;
}
