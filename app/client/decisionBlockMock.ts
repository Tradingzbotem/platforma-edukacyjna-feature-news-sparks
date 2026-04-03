/**
 * Decision Block — model + mocki per aktywo.
 * Docelowo: mapowanie z API / agregacji modułów po `DecisionAssetId`.
 */

/**
 * Id w URL/API — muszą przechodzić przez `normalizeDecisionAssetId` (np. GOLD → XAUUSD).
 * Tylko instrumenty z modułu scenariuszy ABC + mapowanie cen w silniku v1.
 */
export type DecisionAssetId =
	| "US100"
	| "US500"
	| "DE40"
	| "GOLD"
	| "EURUSD"
	| "GBPUSD"
	| "USDJPY"
	| "WTI";

export type DecisionScenario = {
  key: "A" | "B" | "C";
  title: string;
  condition: string;
};

export type DecisionBlockModel = {
  assetLabel: string;
  sessionLabel: string;
  marketDirection: string;
  scenarios: DecisionScenario[];
  levels: {
    trigger: string;
    invalidation: string;
    target: string;
  };
  context: [string, string, string];
  conclusion: string;
  dataAsOf: string;
};

/** Kolejność i etykiety w selektorze — zgodne z silnikiem v1 (scenariusze ABC + wycena). */
export const DECISION_ASSET_OPTIONS: { id: DecisionAssetId; label: string; hint?: string }[] = [
  { id: "US100", label: "US100", hint: "Nasdaq 100" },
  { id: "US500", label: "US500", hint: "S&P 500 · SPX" },
  { id: "DE40", label: "DE40", hint: "DAX" },
  { id: "GOLD", label: "XAU / Gold", hint: "złoto vs USD" },
  { id: "EURUSD", label: "EUR/USD" },
  { id: "GBPUSD", label: "GBP/USD" },
  { id: "USDJPY", label: "USD/JPY" },
  { id: "WTI", label: "WTI", hint: "ropa WTI" },
];

export const DECISION_BLOCKS_BY_ASSET: Record<DecisionAssetId, DecisionBlockModel> = {
  US100: {
    assetLabel: "US100",
    sessionLabel: "USA · przed CPI",
    marketDirection: "Bias long tylko ponad wczorajszym high; do danych — mały size lub pauza.",
    levels: {
      trigger: "> wczorajszy high, hold po retestcie.",
      invalidation: "Zamknięcie < środek wczorajszego range.",
      target: "1× zasięg ostatniego impulsu w górę.",
    },
    scenarios: [
      { key: "A", title: "Trend", condition: "Akceptacja breakoutu; nie chase — czekaj na retest." },
      { key: "B", title: "Pułapka", condition: "False break → gra w range, bez wymuszania kierunku." },
      { key: "C", title: "Event vol", condition: "Szerokie świece po danych — pierwsza reakcja nie jest werdyktem." },
    ],
    context: [
      "CPI w 24h — spread / gapy.",
      "Wczoraj szeroki range → dziś selekcja, nie FOMO.",
      "USD ↑ = ciężar dla US100.",
    ],
    conclusion: "Albo potwierdzenie ponad high, albo nie graj na siłę przed publikacją.",
    dataAsOf: "2026-04-02 · 14:10 CET · demo",
  },
  GOLD: {
    assetLabel: "XAU/USD",
    sessionLabel: "London / NY · real yields",
    marketDirection: "Neutral z lekkim biasem long przy obronie dziennej strefy popytu; bez potwierdzenia — czekaj.",
    levels: {
      trigger: "Hold ponad lokalnym VPOC / środkiem sesji.",
      invalidation: "Zamknięcie pod ostatnim swing low sesji.",
      target: "Równoległy poziom liquidity powyżej ostatniej konsolidacji.",
    },
    scenarios: [
      { key: "A", title: "Risk-off bid", condition: "Słabsze rentowności realne → złoto trzyma bid; nie dokładaj w szczycie impulsu." },
      { key: "B", title: "Korekta", condition: "Silny USD + brak paniki → wraca do range; gra na mean-reversion wewnątrz dnia." },
      { key: "C", title: "Squeeze", condition: "Niski płyn / news → wypchnięcie i szybki reject; czekaj na zamknięcie, nie na knot." },
    ],
    context: [
      "DXY w krótkim overextension — korelacja złoto/USD aktywna.",
      "Sesja: płynność rośnie w NY.",
      "Spready mogą się poszerzyć przy nagłych ruchach.",
    ],
    conclusion: "Najpierw obrona strefy; dopiero potem myśl o kontynuacji — bez potwierdzenia nie eskaluj ryzyka.",
    dataAsOf: "2026-04-02 · 13:40 CET · demo",
  },
  EURUSD: {
    assetLabel: "EUR/USD",
    sessionLabel: "Europa · konsensus ECB",
    marketDirection: "Range do przełamania ostatniego swing high/low; breakout bez follow-through = pułapka.",
    levels: {
      trigger: "Break + zamknięcie poza range z retestem.",
      invalidation: "Powrót pełnym zasięgiem do środka boxa.",
      target: "1× wysokość boxa w kierunku breakoutu.",
    },
    scenarios: [
      { key: "A", title: "Breakout", condition: "Potwierdzenie poza boxem; short-covering może przyspieszyć ruch." },
      { key: "B", title: "Fakeout", condition: "Wybicie i natychmiastowy reject → gra z powrotem do środka range." },
      { key: "C", title: "News spike", condition: "Konferencja / komunikat — pierwszy ruch często odwracany po 15–30 min." },
    ],
    context: [
      "Spread EUR/USD zwykle najlepszy w europejskiej sesji.",
      "USD index korekta może podnieść EUR bez zmiany trendu tygodniowego.",
      "Nie handluj w szczycie zmienności bez planu inwalidacji.",
    ],
    conclusion: "Nie wybieraj kierunku przed potwierdzeniem wyjścia z range — albo follow-through, albo fade do środka.",
    dataAsOf: "2026-04-02 · 12:05 CET · demo",
  },
  WTI: {
    assetLabel: "WTI",
    sessionLabel: "Tygodnie zapasów · OPEC+ noise",
    marketDirection: "Krótkoterminowo: bias sell bounces przy oporze supply; potwierdź zmęczenie kupujących.",
    levels: {
      trigger: "Odrzucenie przy znanej strefie podaży + lower high.",
      invalidation: "Zamknięcie ponad ostatni lokalny HH intraday.",
      target: "Ostatni equal lows / strefa popytu H1.",
    },
    scenarios: [
      { key: "A", title: "Supply hold", condition: "Cena nie utrzymuje się nad resistance — kontynuacja przesunięcia w dół." },
      { key: "B", title: "Short squeeze", condition: "Nagły news bullish → wyciągnięcie shortów; czekaj na strukturę, nie na emocję." },
      { key: "C", title: "Range chop", condition: "Brak follow-through po raporcie — dzień wewnątrz value area." },
    ],
    context: [
      "Tygodniowe zapasy — ryzyko gapów przy publikacji.",
      "Korelacja z risk sentiment (indeksy) bywa chwilowa.",
      "Uwaga na rollover kontraktu i spread nocny.",
    ],
    conclusion: "Priorytet: reakcja na poziomie, nie narracja — bez rejecta przy supply nie forsuj shorta.",
    dataAsOf: "2026-04-02 · 15:55 CET · demo",
  },
  US500: {
    assetLabel: "S&P 500",
    sessionLabel: "USA · dane i wyniki",
    marketDirection: "Szeroki rynek reaguje na inflację i earnings — breakout bez breadth bywa krótki.",
    levels: {
      trigger: "Akceptacja ponad ostatnim swing high z retestem.",
      invalidation: "Powrót pod środek konsolidacji bez szybkiego odkupienia.",
      target: "Równoległy zasięg w kierunku wybicia.",
    },
    scenarios: [
      { key: "A", title: "Risk-on breadth", condition: "Szeroki rynek i spokojniejszy VIX wspierają kontynuację." },
      { key: "B", title: "Konsolidacja", condition: "Brak impulsu — gra w pasmie do rozstrzygnięcia danymi." },
      { key: "C", title: "Risk-off", condition: "VIX w górę i rotacja — presja na niższe strefy." },
    ],
    context: ["Dane inflacyjne i Fed w tle.", "Sezon wyników mega-cap.", "Korelacja z US100 i USD."],
    conclusion: "Patrz na breadth i zachowanie po danych — jedna świeca nie jest planem.",
    dataAsOf: "2026-04-02 · demo",
  },
  DE40: {
    assetLabel: "DAX / DE40",
    sessionLabel: "Europa · EZ i USA",
    marketDirection: "Niemiecki benchmark czuły na PMI, EBC i nastrój w USA.",
    levels: {
      trigger: "Utrzymanie ponad kluczowym oporem z retestem.",
      invalidation: "Akceptacja pod wsparciem sesji.",
      target: "Kolejna strefa płynności w kierunku impulsu.",
    },
    scenarios: [
      { key: "A", title: "Stabilna EZ", condition: "Lepsze dane i spokojniejsze bundy." },
      { key: "B", title: "Range", condition: "Konsolidacja przed publikacjami." },
      { key: "C", title: "Risk-off", condition: "Słabsze PMI i silniejszy USD." },
    ],
    context: ["Synchronizacja z S&P.", "EBC i rentowności w strefie euro.", "Geopolityka w tle."],
    conclusion: "DAX często „dopina” narrację z USA — nie ignoruj zamknięcia sesji US.",
    dataAsOf: "2026-04-02 · demo",
  },
  GBPUSD: {
    assetLabel: "GBP/USD",
    sessionLabel: "London · BoE / USD",
    marketDirection: "Para wrażliwa na różnicę stóp i nagłe ruchy USD.",
    levels: {
      trigger: "Break i hold poza boxem z retestem.",
      invalidation: "Pełny powrót do środka range.",
      target: "1× wysokość boxa.",
    },
    scenarios: [
      { key: "A", title: "Sterling strength", condition: "Twardsze BoE vs oczekiwania." },
      { key: "B", title: "Chop", condition: "Brak follow-through po wybiciu." },
      { key: "C", title: "USD bid", condition: "Silny dolar gasi odbicia funta." },
    ],
    context: ["Sesja londyńska ma najlepszy spread.", "NFP i CPI w USA mogą zdominować dzień.", "Brexit-risk już rzadziej driverem intraday."],
    conclusion: "Najpierw rozstrzygnięcie USD, potem narracja GBP.",
    dataAsOf: "2026-04-02 · demo",
  },
  USDJPY: {
    assetLabel: "USD/JPY",
    sessionLabel: "Azja · carry i JPY",
    marketDirection: "Para pod wpływem rentowności US i risk sentiment; interwencje rzadkie ale wpływowe.",
    levels: {
      trigger: "Kontynuacja po retestcie wybicia.",
      invalidation: "Odrzucenie całego ruchu impulsu.",
      target: "Kolejna rundaowa liczba / strefa płynności.",
    },
    scenarios: [
      { key: "A", title: "Wyższe US yields", condition: "JPY słabszy przy risk-on." },
      { key: "B", title: "Konsolidacja", condition: "Brak impulsu z obligacji." },
      { key: "C", title: "Risk-off bid JPY", condition: "Odwrotny ruch przy strachu na rynku." },
    ],
    context: ["BoJ w tle.", "Korelacja z US10Y.", "Azja ustawia ton przed Europą."],
    conclusion: "Nie chase po jednym knotcie — JPY potrafi szybko zawracać na sentymencie.",
    dataAsOf: "2026-04-02 · demo",
  },
};

/** Zgodność wsteczna z wcześniejszym importem. */
export const DECISION_BLOCK_DEMO: DecisionBlockModel = DECISION_BLOCKS_BY_ASSET.US100;

export function getDecisionBlockForAsset(id: DecisionAssetId): DecisionBlockModel {
  return DECISION_BLOCKS_BY_ASSET[id];
}
