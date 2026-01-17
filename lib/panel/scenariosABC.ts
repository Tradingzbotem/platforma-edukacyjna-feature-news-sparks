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
  // ───────────── FX (uzupełnienia) ─────────────
  {
    asset: 'GBPUSD',
    timeframe: 'H1',
    context:
      'Funt i dolar często reagują na różnice w ścieżce stóp i dane inflacyjne. To edukacyjny szkic czytania wykresu bez sygnałów.',
    levels: ['1.2900', '1.2850', '1.2800', '1.2750'],
    scenarioA: {
      if: 'Jeśli nastroje sprzyjają ryzyku i słabnie USD, utrzymanie powyżej 1.2850 zwykle wspiera dalsze wzrosty.',
      invalidation: 'Głębsze zejście pod 1.2800 bez szybkiego powrotu.',
      confirmations: 'Słabszy DXY, spokojniejsze świece, brak panicznej podaży na retestach.',
      riskNotes: 'Publikacje CPI/PMI potrafią zmienić obraz w krótkim czasie.',
    },
    scenarioB: {
      if: 'Gdy brak impulsu, kurs potrafi krążyć między 1.2800–1.2850, szanując poziomy.',
      invalidation: 'Akceptacja poniżej 1.2750 albo szybki rajd bez korekt.',
      confirmations: 'Zawężenie wahań, małe świece, obroty umiarkowane.',
      riskNotes: 'Fałszywe wybicia w oknie danych są częste — potrzebna ostrożność.',
    },
    scenarioC: {
      if: 'Jeśli USD się wzmacnia, wybicie dołem 1.2800 bywa impulsem do testu niższych stref.',
      invalidation: 'Powrót powyżej 1.2850 i odkupienia korekt.',
      confirmations: 'Wyższy DXY, słabość ryzyka, mocniejsze spadkowe świece.',
      riskNotes: 'Zwroty w drugiej części sesji nie są rzadkie.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'USDJPY',
    timeframe: 'H1',
    context:
      'Para często zależy od różnicy rentowności i nastawienia BoJ/Fed. Tu pokazujemy prosty, edukacyjny szablon scenariuszy.',
    levels: [162.5, 161.8, 161.0, 160.2],
    scenarioA: {
      if: 'Jeśli rentowności USA rosną, a JPY słabnie, utrzymanie powyżej 161.8 zwykle sprzyja kontynuacji.',
      invalidation: 'Spadek i akceptacja poniżej 161.0 bez szybkiej reakcji popytowej.',
      confirmations: 'Stabilny wzrost UST, mocniejszy DXY, brak presji podaży na wybiciach.',
      riskNotes: 'Nagłe komentarze BoJ potrafią odwrócić kierunek.',
    },
    scenarioB: {
      if: 'Brak rozstrzygnięcia bywa widoczny jako wąska konsolidacja 161.0–161.8.',
      invalidation: 'Wybicie z akceptacją i brak szybkiego powrotu.',
      confirmations: 'Małe świece, niższa zmienność, respekt poziomów.',
      riskNotes: 'Publikacje USA/Japonia mogą zrywać konsolidacje bez kontynuacji.',
    },
    scenarioC: {
      if: 'Gdy spadają rentowności USA, zejścia pod 161.0 mogą skłaniać do testów niższych stref.',
      invalidation: 'Powrót ponad 161.8 i spokojniejsze wybicia.',
      confirmations: 'Słabszy DXY, mocniejszy JPY, większe czerwone świece.',
      riskNotes: 'Ruchy bywają szybkie i krótkotrwałe na danych.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'EURPLN',
    timeframe: 'H4',
    context:
      'Kurs zależny od sentymentu do rynków EM i różnicy stóp. Przykład edukacyjny — prosty opis poziomów i zachowania.',
    levels: [4.40, 4.36, 4.33, 4.30],
    scenarioA: {
      if: 'Jeśli panuje spokój na rynkach, utrzymanie ponad 4.36 często pomaga stabilizacji/odbiciom.',
      invalidation: 'Powrót pod 4.33 bez szybkiego odkupienia.',
      confirmations: 'Mniejsze świece, spokojniejsza zmienność, brak presji podaży przy retestach.',
      riskNotes: 'Dane lokalne i globalne potrafią wywołać skoki.',
    },
    scenarioB: {
      if: 'Gdy nie ma impulsu, wahania 4.33–4.36 bywają częste.',
      invalidation: 'Wyjście z akceptacją i brak powrotu.',
      confirmations: 'Zwężające się wahania, krótkie knoty, respekt stref.',
      riskNotes: 'Nagłe newsy makro mogą przebić konsolidację.',
    },
    scenarioC: {
      if: 'Przy mocniejszym PLN, zejścia pod 4.33 mogą pchać w kierunku 4.30.',
      invalidation: 'Szybkie wejście z powrotem powyżej 4.36.',
      confirmations: 'Lepszy sentyment do PLN, spokojniejsze świece spadkowe.',
      riskNotes: 'Zmienność bywa podwyższona wokół decyzji banków centralnych.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'USDPLN',
    timeframe: 'H4',
    context:
      'Para często odbija nastroje globalne i siłę USD. Poniżej prosty, edukacyjny układ scenariuszy.',
    levels: [4.10, 4.06, 4.03, 4.00],
    scenarioA: {
      if: 'Jeśli USD zyskuje globalnie, utrzymanie powyżej 4.06 bywa wspierające dla wzrostów.',
      invalidation: 'Spadek i akceptacja poniżej 4.03.',
      confirmations: 'Silniejszy DXY, mniejsze knoty spadkowe, odbicia na retestach.',
      riskNotes: 'Dane z USA i lokalne publikacje potrafią zmienić obraz szybko.',
    },
    scenarioB: {
      if: 'Brak wyraźnego impulsu sprzyja wahanom 4.03–4.06.',
      invalidation: 'Wyjście z akceptacją  i brak szybkiego powrotu.',
      confirmations: 'Malejąca zmienność, wąskie świece, respekt poziomów.',
      riskNotes: 'Wokół publikacji dane bywają mylące.',
    },
    scenarioC: {
      if: 'Przy mocniejszym PLN, zejście poniżej 4.03 bywa krokiem w stronę 4.00.',
      invalidation: 'Powrót powyżej 4.06 i utrzymanie.',
      confirmations: 'Słabszy DXY, spokojniejsze spadki, brak paniki na retestach.',
      riskNotes: 'Zwroty intraday nie są rzadkie.',
    },
    updatedAt: new Date().toISOString(),
  },
  // ───────────── Indeksy ─────────────
  {
    asset: 'US500',
    timeframe: 'H4',
    context:
      'Szeroki rynek w USA często reaguje na wyniki i dane o inflacji. Edukacyjny opis: poziomy i zachowanie, bez sygnałów.',
    levels: [5300, 5250, 5200, 5140],
    scenarioA: {
      if: 'Jeśli panuje risk-on, utrzymanie powyżej 5250 często wspiera dalsze podejścia.',
      invalidation: 'Domknięcia pod 5200 bez szybkiego powrotu.',
      confirmations: 'Szeroki breadth, spokojniejsze VIX, brak podaży na retestach.',
      riskNotes: 'Sezon wyników i dane makro potrafią przynieść nagłe zwroty.',
    },
    scenarioB: {
      if: 'Przy braku impulsu konsolidacja 5200–5250 jest naturalna.',
      invalidation: 'Zerwanie konsolidacji i akceptacja poza zakresem.',
      confirmations: 'Wygaszanie zmienności, węższe świece.',
      riskNotes: 'Wybicia na danych bywają krótkie bez potwierdzeń.',
    },
    scenarioC: {
      if: 'Jeśli pojawi się risk-off, zejście pod 5200 bywa krokiem do 5140.',
      invalidation: 'Szybki powrót ponad 5250 i brak podaży na retestach.',
      confirmations: 'Wyższy VIX, presja na growth, mocniejszy USD.',
      riskNotes: 'Zwroty po południu sesji się zdarzają.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'US500',
    timeframe: 'D1',
    context:
      'Na interwale dziennym S&P 500 pozostaje w trendzie zależnym od stóp i wyników. Edukacyjny układ bez sygnałów.',
    levels: [5400, 5320, 5250, 5140],
    scenarioA: {
      if: 'Akceptacja powyżej 5320 przy spokojnym VIX i szerokim breadth.',
      invalidation: 'Domknięcia pod 5250 bez szybkiego odkupienia.',
      confirmations: 'Lepsze wyniki mega-capów, stabilne rentowności, brak podaży na wybiciach.',
      riskNotes: 'Sezon wyników bywa zmienny; potrzebne potwierdzenia z breadth.',
    },
    scenarioB: {
      if: 'Konsolidacja 5250–5320 przed kluczowymi danymi lub wynikami.',
      invalidation: 'Trwałe wyjście z zakresu bez powrotu.',
      confirmations: 'Wygaszanie zmienności, mniejsze świece, respekt stref.',
      riskNotes: 'Wybicia na nagłówkach bywają krótkie bez konfluencji.',
    },
    scenarioC: {
      if: 'Presja risk-off i zejście pod 5250 kierują uwagę na 5140.',
      invalidation: 'Szybki powrót ponad 5320 i akceptacja.',
      confirmations: 'Wyższy VIX, mocniejszy USD, rotacja do defensywy.',
      riskNotes: 'Zwroty w drugiej części sesji są możliwe.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'DE40',
    timeframe: 'H4',
    context:
      'Niemiecki indeks często odbija nastroje w EZ i dane przemysłowe. Przykład edukacyjny, bez wskazań inwestycyjnych.',
    levels: [18600, 18450, 18250, 18050],
    scenarioA: {
      if: 'Jeśli sentyment w EZ jest stabilny, utrzymanie powyżej 18450 bywa sprzyjające.',
      invalidation: 'Wybicie i akceptacja poniżej 18250.',
      confirmations: 'Lepsze PMI, wsparcie na retestach, spokojniejsze świece.',
      riskNotes: 'Geopolityka i dane z USA też potrafią wpłynąć.',
    },
    scenarioB: {
      if: 'Konsolidacja 18250–18450 jest częsta, gdy brak nowych informacji.',
      invalidation: 'Trwałe wyjście poza zakres bez szybkiego powrotu.',
      confirmations: 'Niższa zmienność, węższe świece, respekt poziomów.',
      riskNotes: 'Wybicia na danych bywają fałszywe.',
    },
    scenarioC: {
      if: 'Przy risk-off zejścia pod 18250 mogą zapraszać niższe strefy.',
      invalidation: 'Powrót ponad 18450 i brak presji podaży.',
      confirmations: 'Słabsze PMI, większy DXY, zjazdy na ryzyku.',
      riskNotes: 'Ruchy bywają poszarpane w okolicach publikacji.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'DE40',
    timeframe: 'D1',
    context:
      'Na D1 DAX odzwierciedla oczekiwania wobec EZ i krzywej bundów. Edukacyjny, bez sygnałów.',
    levels: [18800, 18600, 18250, 17950],
    scenarioA: {
      if: 'Akceptacja powyżej 18600 przy stabilnych PMI i poprawie sentymentu w EZ.',
      invalidation: 'Domknięcie pod 18250 i brak szybkiego powrotu.',
      confirmations: 'Lepsze PMI, spokojniejsze bundy, rotacja do cyklicznych.',
      riskNotes: 'Wrażliwość na USD i dane z USA pozostaje wysoka.',
    },
    scenarioB: {
      if: 'Konsolidacja 18250–18600 w oczekiwaniu na dane/posiedzenia EBC.',
      invalidation: 'Wybicie z akceptacją poza zakres.',
      confirmations: 'Niższa zmienność, wąskie korpusy, respekt poziomów.',
      riskNotes: 'Wybicia na danych bywają fałszywe bez potwierdzeń.',
    },
    scenarioC: {
      if: 'Przy pogorszeniu koniunktury zejście pod 18250 kieruje uwagę na 17950.',
      invalidation: 'Powrót nad 18600 i uspokojenie świec.',
      confirmations: 'Słabsze PMI, mocniejszy USD, risk-off na ryzyku.',
      riskNotes: 'Zwroty po nagłówkach makro są możliwe.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'US30',
    timeframe: 'H4',
    context:
      'Indeks spółek blue-chip często jest spokojniejszy niż growth. Edukacyjne poziomy i warunki, bez sygnałów.',
    levels: [40000, 39750, 39500, 39200],
    scenarioA: {
      if: 'Jeśli popyt dominuje, respekt 39750 bywa wsparciem dla wzrostów.',
      invalidation: 'Akceptacja poniżej 39500.',
      confirmations: 'Spokojniejszy VIX, brak presji podaży po wybiciach.',
      riskNotes: 'Dane z USA potrafią szybko zmienić klimat.',
    },
    scenarioB: {
      if: 'Przy braku kierunku zakres 39500–39750 często się utrzymuje.',
      invalidation: 'Wyjście z akceptacją i brak powrotu.',
      confirmations: 'Zawężenie świec, malejąca zmienność.',
      riskNotes: 'Wybicia na newsach bywają krótkie.',
    },
    scenarioC: {
      if: 'Gdy wraca risk-off, spadki pod 39500 mogą prowadzić do 39200.',
      invalidation: 'Szybki powrót ponad 39750.',
      confirmations: 'Wyższy DXY, presja na cykliczne sektory.',
      riskNotes: 'Późne zwroty w sesji nie są wyjątkowe.',
    },
    updatedAt: new Date().toISOString(),
  },
  // ───────────── Towary ─────────────
  {
    asset: 'XAGUSD',
    timeframe: 'H1',
    context:
      'Srebro często porusza się podobnie do złota, ale bywa bardziej zmienne. Edukacyjny szkic.',
    levels: [29.5, 29.0, 28.6, 28.0],
    scenarioA: {
      if: 'Przy słabszym USD i spokojnym sentymencie utrzymanie powyżej 29.0 bywa sprzyjające.',
      invalidation: 'Wejście poniżej 28.6 bez szybkiego odbicia.',
      confirmations: 'Popyt na metale, spokojniejsze świece, brak głębokich knotów spadkowych.',
      riskNotes: 'Zmienność potrafi nagle wzrosnąć przy danych USA.',
    },
    scenarioB: {
      if: 'Gdy brak impulsu, konsolidacja 28.6–29.0 jest typowa.',
      invalidation: 'Wyjście z akceptacją.',
      confirmations: 'Wąskie świece, malejąca zmienność.',
      riskNotes: 'Fałszywe ruchy przy publikacjach nie są rzadkie.',
    },
    scenarioC: {
      if: 'Jeśli USD się wzmacnia, spadek pod 28.6 bywa krokiem do 28.0.',
      invalidation: 'Powrót ponad 29.0 i brak podaży na retestach.',
      confirmations: 'Mocniejszy DXY, słabość metali.',
      riskNotes: 'Ruchy bywają gwałtowne, ale krótkie.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'XAUUSD',
    timeframe: 'H4',
    context:
      'Na H4 złoto reaguje na real yields i USD; układ edukacyjny bez sygnałów.',
    levels: [2335, 2310, 2290, 2268],
    scenarioA: {
      if: 'Spadek real yields i słabszy USD, utrzymanie nad 2310.',
      invalidation: 'Akceptacja pod 2290 bez reakumulacji.',
      confirmations: 'Popyt w metalach, spokojniejsze świece, risk-off w akcjach.',
      riskNotes: 'Publikacje CPI/NFP potrafią odwracać ruchy intraday.',
    },
    scenarioB: {
      if: 'Konsolidacja 2290–2310 przed danymi i brak kierunku.',
      invalidation: 'Trwałe wybicie poza zakres i brak powrotu.',
      confirmations: 'Malejąca zmienność, węższe korpusy.',
      riskNotes: 'Fałszywe wybicia w oknie danych się zdarzają.',
    },
    scenarioC: {
      if: 'Przy mocniejszym USD spadek pod 2290 kieruje uwagę na 2268.',
      invalidation: 'Powrót nad 2310 i brak podaży na retestach.',
      confirmations: 'Wyższy DXY, podaż na metalach.',
      riskNotes: 'Zwroty po nagłówkach geopolitycznych są możliwe.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'WTI',
    timeframe: 'H4',
    context:
      'Ropa reaguje na zapasy, OPEC i risk-on/off. Edukacyjny opis — poziomy i zachowanie.',
    levels: [84, 82, 80, 78],
    scenarioA: {
      if: 'Przy lepszym sentymencie i wsparciu popytu utrzymanie powyżej 82 bywa pozytywne.',
      invalidation: 'Spadek pod 80 bez szybkiej reakcji.',
      confirmations: 'Spokojniejsze świece, brak podaży na retestach, stabilne zapasy.',
      riskNotes: 'Nagłe newsy geopolityczne potrafią zmienić obraz.',
    },
    scenarioB: {
      if: 'Kiedy brak kierunku, 80–82 bywa zakresem.',
      invalidation: 'Trwałe wyjście z zakresu.',
      confirmations: 'Malejąca zmienność, wąskie korpusy.',
      riskNotes: 'Wybicia przy danych o zapasach bywają krótkie.',
    },
    scenarioC: {
      if: 'Przy risk-off zejścia pod 80 częściej testują niższe poziomy.',
      invalidation: 'Szybki powrót ponad 82.',
      confirmations: 'Mocniejszy USD, słabsze ryzyko, większe czerwone świece.',
      riskNotes: 'Zwroty intraday zdarzają się po nagłówkach.',
    },
    updatedAt: new Date().toISOString(),
  },
  // ───────────── FX (rozszerzenia TF) ─────────────
  {
    asset: 'EURUSD',
    timeframe: 'H1',
    context:
      'EURUSD na H1 wrażliwy na intraday dane i komentarze; edukacyjny układ.',
    levels: ['1.1050', '1.1000', '1.0950', '1.0900'],
    scenarioA: {
      if: 'Akceptacja ponad 1.1000 przy słabszym DXY i stabilnych rentownościach.',
      invalidation: 'Domknięcie pod 1.0950 bez powrotu.',
      confirmations: 'Słabszy DXY, risk-on, spokojniejsze świece.',
      riskNotes: 'W oknie danych CPI/PMI zdarzają się fałszywe wybicia.',
    },
    scenarioB: {
      if: 'Konsolidacja 1.0950–1.1000 bez impulsu.',
      invalidation: 'Wyjście z akceptacją i brak powrotu.',
      confirmations: 'Zwężenie ATR, wąskie świece, respekt poziomów.',
      riskNotes: 'Nagłe komentarze banków centralnych potrafią rozerwać zakres.',
    },
    scenarioC: {
      if: 'Przy mocniejszym USD zejście pod 1.0950 może celować w 1.0900.',
      invalidation: 'Powrót ponad 1.1000 i akceptacja.',
      confirmations: 'Wyższy DXY, słabsze indeksy europejskie.',
      riskNotes: 'Zwroty intraday częste po danych.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'BRENT',
    timeframe: 'H4',
    context:
      'Brent zachowuje się podobnie do WTI — wpływ zapasów i nagłówków. Edukacyjny układ.',
    levels: [86, 84, 82, 80],
    scenarioA: {
      if: 'Jeśli popyt utrzymuje poziom 84, zwykle wspiera to podejścia.',
      invalidation: 'Wejście pod 82 i brak szybkiego powrotu.',
      confirmations: 'Spokojniejsze świece, stabilne zapasy, brak podaży na retestach.',
      riskNotes: 'Geopolityka potrafi gwałtownie zmienić kierunek.',
    },
    scenarioB: {
      if: 'W konsolidacji 82–84 rynek często czeka na nowe informacje.',
      invalidation: 'Wyjście z akceptacją.',
      confirmations: 'Mniejsze korpusy, niższa zmienność.',
      riskNotes: 'Wybicia bywają krótkotrwałe bez potwierdzeń.',
    },
    scenarioC: {
      if: 'Przy risk-off spadek pod 82 potrafi kierować uwagę na 80.',
      invalidation: 'Powrót nad 84 i uspokojenie świec.',
      confirmations: 'Wyższy DXY, słabsze aktywa ryzykowne.',
      riskNotes: 'Zwroty nie są rzadkie po publikacjach.',
    },
    updatedAt: new Date().toISOString(),
  },
  // ───────────── Akcje (przykładowe, EDU) ─────────────
  {
    asset: 'AAPL',
    timeframe: 'D1',
    context:
      'Duża spółka technologiczna; kurs często odzwierciedla sentyment do sektora i wyniki. Edukacyjny przykład techniczny.',
    levels: [230, 225, 220, 215],
    scenarioA: {
      if: 'Jeśli sektor tech ma wsparcie, utrzymanie ponad 225 zwykle pomaga we wzrostach.',
      invalidation: 'Domknięcia pod 220 bez szybkiego powrotu.',
      confirmations: 'Spokojniejsze świece, brak podaży na retestach, szeroki popyt w sektorze.',
      riskNotes: 'Sezon wyników potrafi zmienić obraz w jeden dzień.',
    },
    scenarioB: {
      if: 'Gdy brak impulsu, zakres 220–225 bywa utrzymywany.',
      invalidation: 'Trwałe wyjście z zakresu.',
      confirmations: 'Malejąca zmienność, krótsze świece.',
      riskNotes: 'Wybicia bez potwierdzeń bywają krótkie.',
    },
    scenarioC: {
      if: 'Przy słabości sektora zejścia pod 220 kierują uwagę na 215.',
      invalidation: 'Powrót ponad 225 i brak presji podaży.',
      confirmations: 'Słabszy sentyment do growth, większe czerwone świece.',
      riskNotes: 'Nagłówki o produktach potrafią szybko odwrócić ruch.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'TSLA',
    timeframe: 'D1',
    context:
      'Spółka o podwyższonej zmienności; narracja często zmienia się po wynikach/produkcji. Edukacyjny układ.',
    levels: [260, 245, 230, 215],
    scenarioA: {
      if: 'Przy lepszym sentymencie utrzymanie powyżej 245 bywa wsparciem.',
      invalidation: 'Spadek pod 230 bez szybkiego odbicia.',
      confirmations: 'Węższe świece, brak podaży na retestach, wsparcie w sektorze EV.',
      riskNotes: 'News flow bywa gwałtowny i zmienny.',
    },
    scenarioB: {
      if: 'Gdy brak kierunku, 230–245 bywa zakresem.',
      invalidation: 'Trwałe wybicie z akceptacją.',
      confirmations: 'Niższa zmienność, zawężenie wahań.',
      riskNotes: 'Fałszywe wybicia nie są rzadkie.',
    },
    scenarioC: {
      if: 'Przy słabości sentymentu zjazd pod 230 kieruje uwagę na 215.',
      invalidation: 'Powrót nad 245 i utrzymanie.',
      confirmations: 'Słabszy sektor growth, większe czerwone świece.',
      riskNotes: 'Zwroty pod wpływem nagłówków są częste.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'NVDA',
    timeframe: 'D1',
    context:
      'Lider półprzewodników; często dyktuje ton dla sektora. Edukacyjny szkic poziomów i zachowania.',
    levels: [140, 132, 126, 120],
    scenarioA: {
      if: 'Jeśli półprzewodniki są silne, respekt 132 zwykle sprzyja utrzymaniu trendu.',
      invalidation: 'Akceptacja poniżej 126.',
      confirmations: 'Szeroki popyt w półprzewodnikach, spokojniejsze świece.',
      riskNotes: 'Wyniki i guidance potrafią zmienić obraz natychmiast.',
    },
    scenarioB: {
      if: 'Przy braku nowości 126–132 bywa zakresem.',
      invalidation: 'Trwałe wyjście z zakresu i brak powrotu.',
      confirmations: 'Malejąca zmienność, wąskie korpusy.',
      riskNotes: 'Wybicia bez potwierdzeń często gasną.',
    },
    scenarioC: {
      if: 'Przy osłabieniu sektora zejście pod 126 kieruje uwagę na 120.',
      invalidation: 'Powrót ponad 132 i brak podaży na retestach.',
      confirmations: 'Słabość sektora, większe czerwone świece.',
      riskNotes: 'Zwroty wraz z nastrojami do AI są częste.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'MSFT',
    timeframe: 'D1',
    context:
      'Duża spółka technologiczna; ruch często jest spokojniejszy niż u mniejszych growth. Edukacyjny układ.',
    levels: [465, 455, 445, 435],
    scenarioA: {
      if: 'Jeśli sektor IT jest stabilny, utrzymanie powyżej 455 bywa wspierające.',
      invalidation: 'Spadek pod 445 bez szybkiego powrotu.',
      confirmations: 'Spokojniejsze świece, brak podaży po wybiciach.',
      riskNotes: 'Wyniki i guidance mogą chwilowo podbić zmienność.',
    },
    scenarioB: {
      if: 'Gdy brak impulsu, zakres 445–455 potrafi się utrzymywać.',
      invalidation: 'Wyjście poza zakres i akceptacja.',
      confirmations: 'Wąskie korpusy, niższa zmienność.',
      riskNotes: 'Fałszywe wybicia możliwe wokół newsów o produktach.',
    },
    scenarioC: {
      if: 'Przy słabości sektora zejścia pod 445 kierują uwagę na 435.',
      invalidation: 'Powrót nad 455 i brak podaży.',
      confirmations: 'Słabszy popyt w IT, większe czerwone świece.',
      riskNotes: 'Zwroty po konferencjach produktowych się zdarzają.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'AMZN',
    timeframe: 'D1',
    context:
      'E-commerce i chmura; wrażliwa na sezon zakupowy i CAPEX. Edukacyjny szkic.',
    levels: [200, 195, 190, 184],
    scenarioA: {
      if: 'Przy spokojnym rynku utrzymanie ponad 195 bywa wspierające.',
      invalidation: 'Wejście pod 190 i brak szybkiego powrotu.',
      confirmations: 'Spokojniejsze świece, brak podaży na retestach.',
      riskNotes: 'Wyniki i guidance potrafią zmienić obraz.',
    },
    scenarioB: {
      if: 'Kiedy brak impulsu, 190–195 bywa zakresem.',
      invalidation: 'Wyjście z akceptacją.',
      confirmations: 'Niższa zmienność, wąskie korpusy.',
      riskNotes: 'Wybicia bez potwierdzeń bywają krótkie.',
    },
    scenarioC: {
      if: 'Przy słabości sektora zejścia pod 190 kierują uwagę na 184.',
      invalidation: 'Powrót ponad 195 i stabilizacja.',
      confirmations: 'Słabszy popyt na growth, mocniejszy USD.',
      riskNotes: 'Zwroty po nagłówkach o chmurze/logistyce są częste.',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'META',
    timeframe: 'D1',
    context:
      'Spółka social/ads; sentyment bywa związany z wydatkami reklamowymi i narracją AI. Edukacyjny układ.',
    levels: [540, 520, 500, 480],
    scenarioA: {
      if: 'Jeśli rynek akceptuje 520 jako wsparcie, często pomaga to utrzymaniu trendu.',
      invalidation: 'Spadek pod 500 i brak szybkiego odbicia.',
      confirmations: 'Spokojniejsze świece, brak podaży na retestach, wsparcie w szerokim rynku.',
      riskNotes: 'Wyniki i guidance mogą szybko zmienić nastroje.',
    },
    scenarioB: {
      if: 'Gdy brak kierunku, zakres 500–520 bywa utrzymywany.',
      invalidation: 'Trwałe wyjście z zakresu.',
      confirmations: 'Wąskie korpusy, mniejsza zmienność.',
      riskNotes: 'Wybicia bez potwierdzeń bywają chwilowe.',
    },
    scenarioC: {
      if: 'Przy słabym sentymencie zejścia pod 500 kierują uwagę na 480.',
      invalidation: 'Powrót nad 520 i utrzymanie.',
      confirmations: 'Słabsze reklamy/sektor, większe czerwone świece.',
      riskNotes: 'Zwroty po nagłówkach o polityce/produktach są możliwe.',
    },
    updatedAt: new Date().toISOString(),
  },
];

