export type PublicChartAssetGroup = 'indices' | 'etf' | 'commodities' | 'fx' | 'crypto';

export type PublicChartAsset = {
	id: string;
	label: string;
	tvSymbol: string;
	group: PublicChartAssetGroup;
	description: string;
	watchPoints: string[];
};

type Def = {
	id: string;
	label: string;
	tvSymbol: string;
	group: PublicChartAssetGroup;
	description?: string;
	watchPoints?: string[];
};

const DEFAULTS: Record<
	PublicChartAssetGroup,
	{ description: string; watchPoints: string[] }
> = {
	indices: {
		description:
			'Instrument oparty o indeks — wrażliwy na sesję głównych giełd, politykę banków centralnych i szerokość rynku. Materiał poglądowy, bez rekomendacji.',
		watchPoints: ['Otwarcia i zamknięcia kluczowych sesji', 'Rentowności i komunikaty banków centralnych', 'Korelacje z FX i surowcami'],
	},
	etf: {
		description:
			'ETF lub indeks zmienności na wykresie referencyjnym — ułatwia porównanie struktury ruchu z innymi klasami aktywów. Tylko edukacja.',
		watchPoints: ['Płynność w godzinach sesji USA', 'Skład i sektor ETF (jeśli dotyczy)', 'Szeroki kontekst ryzyka (VIX itp.)'],
	},
	commodities: {
		description:
			'Surowiec notowany na rynkach globalnych — czuły na popyt cykliczny, zapasy, dolar i zdarzenia geopolityczne. Bez sygnałów transakcyjnych.',
		watchPoints: ['Dane fundamentalne rynku (zapasy, produkcja)', 'USD i realne stopy', 'Sentyment ryzyka na akcjach'],
	},
	fx: {
		description:
			'Para walutowa — suma względnych oczekiwań polityki pieniężnej, wzrostu i ryzyka po obu stronach notowania. Wyłącznie materiał edukacyjny.',
		watchPoints: ['Kalendarz banków centralnych (Fed, ECB, BoE, BoJ…)', 'Dane makro ważne dla obu walut', 'Zmienność w dni publikacji'],
	},
	crypto: {
		description:
			'Rynek krypto — bardzo wysoka zmienność; powiązania z płynnością globalną i sentymentem spekulacyjnym bywają niestabilne. Tylko edukacja.',
		watchPoints: ['Płynność i spread w embedzie', 'BTC jako tło całego segmentu', 'Regulacje i wydarzenia sektorowe'],
	},
};

function expand(d: Def): PublicChartAsset {
	const base = DEFAULTS[d.group];
	return {
		id: d.id,
		label: d.label,
		tvSymbol: d.tvSymbol,
		group: d.group,
		description: d.description ?? base.description,
		watchPoints: d.watchPoints ?? base.watchPoints,
	};
}

/** Indeksy (głównie CFD OANDA / zgodne z TradingView embed). */
const INDEX_DEFS: Def[] = [
	{
		id: 'US100',
		label: 'US100',
		tvSymbol: 'OANDA:NAS100USD',
		group: 'indices',
		description:
			'Technologiczny nurt USA — często „prowadzi” nastroje ryzyka w ciągu dnia. Wrażliwy na stopy, zyski spółek i szerokość ruchu w obrębie indeksu.',
		watchPoints: ['Komunikaty Fed i rentowności', 'Publikacje inflacyjne z USA', 'Korelacja z innymi indeksami'],
	},
	{
		id: 'SP500',
		label: 'S&P 500',
		tvSymbol: 'CAPITALCOM:US500',
		group: 'indices',
		description:
			'Szeroki rynek akcji USA — referencja dla wielu strategii i benchmarków. Łączy cykl, zyski i oczekiwania co do miękkiego / twardego lądowania.',
		watchPoints: ['Sektory i rotacja', 'Sezon wyników', 'Dolar i realne stopy jako tło'],
	},
	{
		id: 'DE40',
		label: 'DE40',
		tvSymbol: 'OANDA:DE30EUR',
		group: 'indices',
		description:
			'Niemiecki blue chip — most między Europą a globalnym cyklem. Silnie zależny od nastroju wobec wzrostu i warunków finansowania w strefie euro.',
		watchPoints: ['Polityka ECB i spready obligacji', 'Dane przemysłu z strefy euro', 'Impulsy z USA na otwarciu'],
	},
	{ id: 'US30', label: 'US 30', tvSymbol: 'OANDA:US30USD', group: 'indices' },
	{ id: 'UK100', label: 'UK 100', tvSymbol: 'OANDA:UK100GBP', group: 'indices' },
	{ id: 'JP225', label: 'JP 225', tvSymbol: 'OANDA:JP225USD', group: 'indices' },
	{ id: 'AU200', label: 'AU 200', tvSymbol: 'OANDA:AU200AUD', group: 'indices' },
	{ id: 'FR40', label: 'FR 40', tvSymbol: 'OANDA:FR40EUR', group: 'indices' },
	{ id: 'EU50', label: 'EU 50', tvSymbol: 'OANDA:EU50EUR', group: 'indices' },
	{ id: 'ES35', label: 'ES 35', tvSymbol: 'OANDA:ESPIXEUR', group: 'indices' },
	{ id: 'HK33', label: 'HK 33', tvSymbol: 'OANDA:HK33HKD', group: 'indices' },
	{ id: 'CH20', label: 'CH 20', tvSymbol: 'OANDA:CH20CHF', group: 'indices' },
	{ id: 'NL25', label: 'NL 25', tvSymbol: 'OANDA:NLD25EUR', group: 'indices' },
	{ id: 'US2000', label: 'US 2000', tvSymbol: 'OANDA:US2000USD', group: 'indices' },
];

const ETF_DEFS: Def[] = [
	{ id: 'SPY', label: 'SPY', tvSymbol: 'AMEX:SPY', group: 'etf' },
	{ id: 'QQQ', label: 'QQQ', tvSymbol: 'NASDAQ:QQQ', group: 'etf' },
	{ id: 'IWM', label: 'IWM', tvSymbol: 'AMEX:IWM', group: 'etf' },
	{ id: 'DIA', label: 'DIA', tvSymbol: 'AMEX:DIA', group: 'etf' },
	{ id: 'VIX', label: 'VIX', tvSymbol: 'TVC:VIX', group: 'etf' },
	{ id: 'EEM', label: 'EEM', tvSymbol: 'AMEX:EEM', group: 'etf' },
	{ id: 'GLD', label: 'GLD', tvSymbol: 'AMEX:GLD', group: 'etf' },
];

const COMMODITY_DEFS: Def[] = [
	{
		id: 'GOLD',
		label: 'Złoto',
		tvSymbol: 'OANDA:XAUUSD',
		group: 'commodities',
		description:
			'Złoto w parze z USD — często reaguje na realne stopy, siłę dolara i epizody podwyższonej awersji do ryzyka.',
		watchPoints: ['Oczekiwania co do ścieżki stóp', 'Indeks dolara (szerszy kontekst)', 'Zmienność na rynkach akcji'],
	},
	{
		id: 'SILVER',
		label: 'Srebro',
		tvSymbol: 'OANDA:XAGUSD',
		group: 'commodities',
	},
	{
		id: 'WTI',
		label: 'Ropa WTI',
		tvSymbol: 'OANDA:WTICOUSD',
		group: 'commodities',
		description:
			'Ropa amerykańska — łączy popyt cykliczny, zapasy i geopolitykę. Spread do Brentu bywa podpowiedzią o lokalnych zaburzeniach podaży.',
		watchPoints: ['Dane zapasów i produkcji', 'Napięcia w regionach eksportu', 'Sentyment do ryzyka na indeksach'],
	},
	{ id: 'BRENT', label: 'Ropa Brent', tvSymbol: 'OANDA:BCOUSD', group: 'commodities' },
	{ id: 'NATGAS', label: 'Gaz ziemny', tvSymbol: 'OANDA:NATGASUSD', group: 'commodities' },
	{ id: 'COPPER', label: 'Miedź', tvSymbol: 'OANDA:XCUUSD', group: 'commodities' },
	{ id: 'WHEAT', label: 'Pszenica', tvSymbol: 'CBOT:ZW1!', group: 'commodities' },
	{ id: 'CORN', label: 'Kukurydza', tvSymbol: 'CBOT:ZC1!', group: 'commodities' },
];

/** Pary FX — OANDA (format TradingView embed). */
const FX_PAIRS: Array<[string, string]> = [
	['EURUSD', 'EUR/USD'],
	['GBPUSD', 'GBP/USD'],
	['USDJPY', 'USD/JPY'],
	['USDCHF', 'USD/CHF'],
	['AUDUSD', 'AUD/USD'],
	['NZDUSD', 'NZD/USD'],
	['USDCAD', 'USD/CAD'],
	['EURJPY', 'EUR/JPY'],
	['GBPJPY', 'GBP/JPY'],
	['EURGBP', 'EUR/GBP'],
	['EURAUD', 'EUR/AUD'],
	['EURNZD', 'EUR/NZD'],
	['GBPAUD', 'GBP/AUD'],
	['GBPNZD', 'GBP/NZD'],
	['AUDJPY', 'AUD/JPY'],
	['NZDJPY', 'NZD/JPY'],
	['CADJPY', 'CAD/JPY'],
	['AUDNZD', 'AUD/NZD'],
	['EURCAD', 'EUR/CAD'],
	['GBPCAD', 'GBP/CAD'],
	['AUDCAD', 'AUD/CAD'],
	['NZDCAD', 'NZD/CAD'],
	['EURCHF', 'EUR/CHF'],
	['GBPCHF', 'GBP/CHF'],
	['CADCHF', 'CAD/CHF'],
	['AUDCHF', 'AUD/CHF'],
	['NZDCHF', 'NZD/CHF'],
	['EURSEK', 'EUR/SEK'],
	['EURNOK', 'EUR/NOK'],
	['GBPSEK', 'GBP/SEK'],
	['USDSEK', 'USD/SEK'],
	['USDNOK', 'USD/NOK'],
	['USDSGD', 'USD/SGD'],
	['USDHKD', 'USD/HKD'],
	['USDMXN', 'USD/MXN'],
	['USDZAR', 'USD/ZAR'],
	['USDTRY', 'USD/TRY'],
];

const FX_DEFS: Def[] = FX_PAIRS.map(([id, label]) => ({
	id,
	label,
	tvSymbol: `OANDA:${id}`,
	group: 'fx' as const,
}));

const CRYPTO_DEFS: Def[] = [
	{
		id: 'BTCUSD',
		label: 'BTC / USD',
		tvSymbol: 'BINANCE:BTCUSDT',
		group: 'crypto',
		description:
			'Bitcoin w notowaniu zbliżonym do spot — wysoka zmienność; silnie powiązany z płynnością, sentymentem spekulacyjnym i makro.',
		watchPoints: ['Płynność globalna i ryzyko', 'Korelacja z indeksami w wybranych fazach', 'Regulacje i wydarzenia sektorowe'],
	},
	{
		id: 'ETHUSD',
		label: 'ETH / USD',
		tvSymbol: 'BINANCE:ETHUSDT',
		group: 'crypto',
		description:
			'Ether — drugi co do ważności rynek referencyjny w segmencie; często bardziej „tech” w zachowaniu względem BTC.',
		watchPoints: ['BTC jako tło sektora', 'Aktywność on-chain (kontekst)', 'Sentyment spekulacyjny'],
	},
	{ id: 'SOLUSD', label: 'SOL / USD', tvSymbol: 'BINANCE:SOLUSDT', group: 'crypto' },
	{ id: 'XRPUSD', label: 'XRP / USD', tvSymbol: 'BINANCE:XRPUSDT', group: 'crypto' },
	{ id: 'ADAUSD', label: 'ADA / USD', tvSymbol: 'BINANCE:ADAUSDT', group: 'crypto' },
	{ id: 'DOGEUSD', label: 'DOGE / USD', tvSymbol: 'BINANCE:DOGEUSDT', group: 'crypto' },
	{ id: 'DOTUSD', label: 'DOT / USD', tvSymbol: 'BINANCE:DOTUSDT', group: 'crypto' },
	{ id: 'AVAXUSD', label: 'AVAX / USD', tvSymbol: 'BINANCE:AVAXUSDT', group: 'crypto' },
	{ id: 'LINKUSD', label: 'LINK / USD', tvSymbol: 'BINANCE:LINKUSDT', group: 'crypto' },
	{ id: 'LTCUSD', label: 'LTC / USD', tvSymbol: 'BINANCE:LTCUSDT', group: 'crypto' },
	{ id: 'BCHUSD', label: 'BCH / USD', tvSymbol: 'BINANCE:BCHUSDT', group: 'crypto' },
	{ id: 'ATOMUSD', label: 'ATOM / USD', tvSymbol: 'BINANCE:ATOMUSDT', group: 'crypto' },
	{ id: 'NEARUSD', label: 'NEAR / USD', tvSymbol: 'BINANCE:NEARUSDT', group: 'crypto' },
	{ id: 'APTUSD', label: 'APT / USD', tvSymbol: 'BINANCE:APTUSDT', group: 'crypto' },
];

const ALL_DEFS: Def[] = [...INDEX_DEFS, ...ETF_DEFS, ...COMMODITY_DEFS, ...FX_DEFS, ...CRYPTO_DEFS];

export const PUBLIC_CHART_GROUP_LABEL: Record<PublicChartAssetGroup, string> = {
	indices: 'Indeksy',
	etf: 'ETF i volatility',
	commodities: 'Suwrowce',
	fx: 'Forex',
	crypto: 'Krypto',
};

export const PUBLIC_CHART_ASSETS: PublicChartAsset[] = ALL_DEFS.map(expand);

const byId = Object.fromEntries(PUBLIC_CHART_ASSETS.map((a) => [a.id.toUpperCase(), a])) as Record<string, PublicChartAsset>;

export function getPublicChartAsset(id: string | null | undefined): PublicChartAsset {
	if (!id) return byId.US100;
	const upper = id.trim().toUpperCase();
	return byId[upper] ?? byId.US100;
}

export function publicChartAssetsInGroup(group: PublicChartAssetGroup): PublicChartAsset[] {
	return PUBLIC_CHART_ASSETS.filter((a) => a.group === group);
}

export type ChartFilterTab = PublicChartAssetGroup | 'all';
