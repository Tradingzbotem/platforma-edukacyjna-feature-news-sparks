// lib/panel/techMaps.ts — statyczne mapy techniczne (EDU)

export type TechMapItem = {
  id: string;
  asset: string;
  timeframe: 'H1' | 'H4' | 'D1';
  trend: string;                // opisowo (EDU)
  keyLevels: string[];          // kluczowe poziomy/strefy
  indicators: string[];         // wskaźniki/kontext techniczny
  volatility: string;           // opis zmienności (ATR/środowisko)
  scenarioNotes: string[];      // notatki scenariuszowe (EDU, warunkowe)
  updatedAt: string;
};

export const TECH_MAPS: TechMapItem[] = [
  {
    id: 'us100-h4',
    asset: 'US100',
    timeframe: 'H4',
    trend: 'Dominacja trendu wzrostowego, korekty płytkie. Wrażliwość na dane inflacyjne i komentarze z Fed.',
    keyLevels: ['18,100', '17,800', '17,400', '17,100'],
    indicators: ['MA(50/200) w układzie pro-wzrostowym', 'Momentum dodatnie na średnich TF'],
    volatility: 'ATR umiarkowany; skoki zmienności przy kluczowych odczytach (CPI/NFP).',
    scenarioNotes: [
      'Jeśli wybicie i akceptacja powyżej 18,100 → kontynuacja prawdopodobna przy potwierdzeniach szerokiego rynku.',
      'Jeśli powrót pod 17,800 i brak odkupienia → ryzyko głębszej korekty w strefę 17,400.',
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'xauusd-h1',
    asset: 'XAUUSD',
    timeframe: 'H1',
    trend: 'Wzrosty zależne od kondycji USD i rentowności; krótkie, dynamiczne fale po publikacjach.',
    keyLevels: ['2300', '2285', '2268', '2250'],
    indicators: ['RSI: przegrzanie bywa krótkie', 'MA(50) jako dynamiczne wsparcie/opor'],
    volatility: 'ATR podwyższony w okolicach publikacji danych inflacyjnych i NFP.',
    scenarioNotes: [
      'Akceptacja powyżej 2285 przy słabnącym USD wspiera trend wyżej, dopóki 2268 broni się w retestach.',
      'Przełamanie 2268 przy silnym USD może prowadzić do testu 2250 — scenariusz warunkowy.',
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'eurusd-d1',
    asset: 'EURUSD',
    timeframe: 'D1',
    trend: 'Boczny z lekkim biasem w górę; zależny od różnicy stóp i perspektyw inflacyjnych EZ/USA.',
    keyLevels: ['1.1200', '1.1050', '1.0950', '1.0850'],
    indicators: ['MA(200) blisko ceny jako filtr kierunkowy', 'Momentum neutralne, wrażliwe na dane'],
    volatility: 'ATR umiarkowany; większy ruch przy CPI/NFP oraz konferencjach banków centralnych.',
    scenarioNotes: [
      'Utrzymanie powyżej 1.1050 przy gołębim USD wspiera test 1.1200, o ile dane z EZ nie rozczarują.',
      'Powrót pod 1.0950 przy jastrzębim Fed zwiększa ryzyko zejścia w kierunku 1.0850.',
    ],
    updatedAt: new Date().toISOString(),
  },
];

