// lib/panel/scenariosABC.ts — statyczne scenariusze A/B/C (EDU)

export type ScenarioPart = {
  if: string;             // warunek aktywacji
  invalidation: string;   // warunek unieważnienia
  confirmations: string;  // co obserwować (konfluencje)
  riskNotes: string;      // ryzyka/uwagi (EDU, bez sygnałów)
};

export type ScenarioItem = {
  asset: string;        // np. US100, XAUUSD, EURUSD
  timeframe: 'H1' | 'H4' | 'D1';
  context: string;      // zwięzłe tło makro/sentyment
  levels: Array<string | number>;
  scenarioA: ScenarioPart;
  scenarioB: ScenarioPart;
  scenarioC: ScenarioPart;
  updatedAt: string;
};

export const SCENARIOS_ABC: ScenarioItem[] = [
  {
    asset: 'US100',
    timeframe: 'H4',
    context:
      'Technologia utrzymuje przewagę relatywną; rynek czeka na dane inflacyjne i sygnały od Fed. Sentyment pozytywny, ale podatny na zaskoczenia makro.',
    levels: ['18,100', '17,650', '17,400', '17,200'],
    scenarioA: {
      if: 'Po pozytywnych danych inflacyjnych utrzymane zostaje wybicie powyżej 18,100 przy rosnącym wolumenie.',
      invalidation: 'Powrót i domknięcie pod 17,650 bez szybkiego odkupienia.',
      confirmations: 'Relatywna siła sektora półprzewodników, spłaszczenie VIX, szeroki breadth.',
      riskNotes: 'Zależność od mega-capów i krótkoterminowe przegrzanie momentum mogą ograniczyć kontynuację.',
    },
    scenarioB: {
      if: 'Po neutralnych danych rynek konsoliduje między 17,650–18,100 i respektuje wsparcia.',
      invalidation: 'Zamknięcie poniżej 17,400 i brak popytu na retestach.',
      confirmations: 'Wygaszanie zmienności (ATR), wąskie świece, rotacja sektorowa bez panicznej podaży.',
      riskNotes: 'Ryzyko wybicia fałszywego podczas publikacji danych lub wystąpień członków Fed.',
    },
    scenarioC: {
      if: 'Po „hawkish” sygnałach i gorszych danych pojawia się impuls risk-off z wyłamaniem 17,400.',
      invalidation: 'Szybki powrót ponad 17,650 i akumulacja na dołkach.',
      confirmations: 'Wzrost DXY i rentowności, podwyższony VIX, presja na growth.',
      riskNotes: 'Możliwe odwrócenia w drugiej części sesji (buy-the-dip) — scenariusz warunkowy.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'XAUUSD',
    timeframe: 'H1',
    context:
      'Złoto wrażliwe na rentowności i USD. Narracja: hedge na ryzyka makro i geopolityczne; brak sygnałów tradingowych — tylko kontekst.',
    levels: [2300, 2285, 2268, 2250],
    scenarioA: {
      if: 'Spadek rentowności UST i słabnący USD; utrzymanie powyżej 2285 po danych.',
      invalidation: 'Silny USD i przełamanie 2268 bez reakumulacji.',
      confirmations: 'Popyt na metalach szlachetnych, risk-off na akcjach defensywnych, stabilny napływ w ETF-ach.',
      riskNotes: 'Szybkie rotacje ryzyka przy publikacjach NFP/CPI — presja na zmienność.',
    },
    scenarioB: {
      if: 'Konsolidacja 2268–2300 przed kluczowym odczytem i brak zdecydowanego impulsu.',
      invalidation: 'Wybicie i akceptacja poniżej 2250.',
      confirmations: 'Zawężenie ATR, malejące wolumeny, respekt poziomów intraday.',
      riskNotes: 'Fałszywe wybicia w oknie danych; pamiętaj o kontekście USD i real yields.',
    },
    scenarioC: {
      if: 'Wzrost rentowności i umocnienie USD prowadzi do testu 2250.',
      invalidation: 'Szybki powrót powyżej 2285 i popyt na korektach.',
      confirmations: 'Risk-on w akcjach, silny dolar, podaż na metalach.',
      riskNotes: 'Reakcje bywają krótkie, jeśli zmiana wynika tylko z krótkotrwałego impulsu w danych.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'EURUSD',
    timeframe: 'D1',
    context:
      'Różnica polityki monetarnej Fed–EBC i dane inflacyjne decydują o średnioterminowym kierunku. Edukacyjny przykład budowy scenariuszy.',
    levels: ['1.1200', '1.1050', '1.0950', '1.0850'],
    scenarioA: {
      if: 'Lepsze perspektywy inflacyjne w EZ i gołębie sygnały z USA wspierają euro powyżej 1.1050.',
      invalidation: 'Domknięcie poniżej 1.0950 i brak kontynuacji na retestach.',
      confirmations: 'Spadek DXY, poprawa PMI w EZ, popyt na aktywa ryzykowne w EU.',
      riskNotes: 'Ryzyko nagłych zwrotów po konferencjach banków centralnych.',
    },
    scenarioB: {
      if: 'Brak rozstrzygnięcia: wahania 1.0950–1.1050 bez wybicia i akceptacji.',
      invalidation: 'Silny impuls wybiciowy z akceptacją ponad 1.1200 lub poniżej 1.0850.',
      confirmations: 'Wygaszanie zmienności, mieszane dane, brak jednej dominującej narracji.',
      riskNotes: 'Wybicia na danych (CPI/NFP) często fałszywe — potrzebne potwierdzenia.',
    },
    scenarioC: {
      if: 'Wyższa inflacja w USA i jastrzębi Fed wzmacniają USD; spadek pod 1.0850.',
      invalidation: 'Powrót ponad 1.0950 oraz słabnący impet USD.',
      confirmations: 'Wzrost DXY, relatywna słabość euro, risk-off na europejskich indeksach.',
      riskNotes: 'Geopolityka i przepływy miesiąca mogą krótkoterminowo zakłócać obraz.',
    },
    updatedAt: new Date().toISOString(),
  },
];

