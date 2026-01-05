// lib/news/labels.ts
// Friendly polish labels for common symbols

const DICT: Record<string, string> = {
  // Surowce
  USOIL: 'Ropa WTI',
  WTI: 'Ropa WTI',
  UKOIL: 'Ropa Brent',
  BRENT: 'Ropa Brent',
  XAUUSD: 'Złoto',
  XAGUSD: 'Srebro',
  XPTUSD: 'Platyna',
  XPDUSD: 'Pallad',
  NG: 'Gaz ziemny',
  NATGAS: 'Gaz ziemny',
  COPPER: 'Miedź',
  HG: 'Miedź',

  // Indeksy
  US100: 'NASDAQ 100',
  NDX: 'NASDAQ 100',
  SPX: 'S&P 500',
  SP500: 'S&P 500',
  DJIA: 'Dow Jones',
  DJI: 'Dow Jones',
  DAX: 'DAX',
  FTSE: 'FTSE 100',
  CAC: 'CAC 40',

  // Waluty – popularne skróty
  DXY: 'Indeks dolara (DXY)',

  // Spółki (wybrane)
  XOM: 'ExxonMobil',
  CVX: 'Chevron',
  TSLA: 'Tesla',
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  AMZN: 'Amazon',
  META: 'Meta',
  GOOGL: 'Alphabet',
  GOOG: 'Alphabet',
  NEE: 'NextEra Energy',
  QCOM: 'Qualcomm',

  // ETF-y/sektory
  SOXX: 'iShares Semiconductors (SOXX)',
  SMH: 'VanEck Semiconductors (SMH)',
};

// EURUSD → EUR/USD, USDJPY → USD/JPY, itp.
function formatFxPair(symbol: string): string | null {
  const m = symbol.match(/^([A-Z]{3})([A-Z]{3})$/);
  if (!m) return null;
  return `${m[1]}/${m[2]}`;
}

export function formatInstrument(symbol: string): string {
  const s = String(symbol || '').toUpperCase();
  if (DICT[s]) return DICT[s];
  const fx = formatFxPair(s);
  if (fx) return fx;
  return s;
}


