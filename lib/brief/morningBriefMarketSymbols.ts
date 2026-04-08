/** Symbole zgodne z resztą projektu (ticker, decision engine). */
export const MORNING_BRIEF_MARKET_SYMBOLS = {
	US500: 'OANDA:US500_USD',
	US100: 'OANDA:NAS100_USD',
	DE40: 'OANDA:DE30_EUR',
	EURUSD: 'OANDA:EUR_USD',
	XAUUSD: 'OANDA:XAU_USD',
	BRENT: 'OANDA:BCO_USD',
	USDJPY: 'OANDA:USD_JPY',
	VIX: 'CBOE:VIX',
} as const;

export type MorningBriefCanonicalKey = keyof typeof MORNING_BRIEF_MARKET_SYMBOLS;
