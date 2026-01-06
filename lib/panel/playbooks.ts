// lib/panel/playbooks.ts — premium EDU playbooks (rich content, no signals)
//
// NOTE: This file is used ONLY by the Playbooki eventowe (EDU) module.
// Do not import it elsewhere unless the scope explicitly expands.

export type Region = 'US' | 'EU' | 'UK';
export type Importance = 'low' | 'medium' | 'high';

export type PlaybookQuizItem = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Playbook = {
  slug: string;
  title: string;
  region: Region;
  importance: Importance;
  tags: string[];                  // e.g. ['inflacja', 'praca', 'stopy']
  updatedAt: string;               // ISO

  summaryOneLine: string;          // Co zwykle porusza rynkiem (1 linia)
  sixtySeconds: string[];          // TL;DR: 6–10 zdań

  preRelease: {
    t24h: string[];
    t2h: string[];
    t15m: string[];
  };

  during: string[];                // Procedura krok po kroku (1..6)

  scenarios: Array<{
    id: string;
    title: string;                 // np. Scenariusz A: „Jeśli… to zwykle…”
    details: string[];             // 2–4 punkty
    caveats: string[];             // Kiedy może nie zadziałać
  }>;

  pitfalls: string[];              // 6–10 typowych pułapek

  marketMap: {
    firstReactors: string[];       // Kto reaguje pierwszy
    confirmations: string[];       // Co potwierdza ruch
    crossChecks: string[];         // Co krzyżowo weryfikować
  };

  risks: string[];                 // slippage, whipsaw, korelacje, płynność, godziny

  quickQuestions: string[];        // „Szybkie pytania do Asystenta AI”
  related: string[];               // np. ['DXY', 'UST2Y', 'UST10Y', 'US100', 'XAU']

  // Sticky checklist (per playbook). Local state only.
  checklist: Array<{ id: string; label: string }>;

  quiz: PlaybookQuizItem[];

  glossary: Array<{ term: string; definition: string }>;

  // Optional: instrument-focused EDU notes (no signals)
  instrumentFocus?: Partial<Record<'US100' | 'XAUUSD' | 'EURUSD' | 'UST10Y', string[]>>;
};

// Helper to generate ISO timestamps consistently at build time
const nowISO = () => new Date().toISOString();

export const PLAYBOOKS: Playbook[] = [
  // 1) US CPI
  {
    slug: 'us-cpi',
    title: 'US CPI (Inflacja konsumencka)',
    region: 'US',
    importance: 'high',
    tags: ['inflacja', 'stopy', 'dxy', 'ust'],
    updatedAt: nowISO(),
    summaryOneLine: 'Nagłówek i core vs konsensus; reakcja na UST2Y/UST10Y i DXY często nadaje kierunek.',
    sixtySeconds: [
      'US CPI to jeden z kluczowych wyznaczników ścieżki stóp procentowych i oczekiwań inflacyjnych.',
      'Rynek patrzy na nagłówek i core; rozjazd między nimi potrafi zmieniać pierwszą reakcję.',
      'UST2Y i UST10Y zwykle reagują szybko — kierunek rentowności wpływa na DXY i wrażliwe sektory.',
      'Rewizje poprzednich odczytów i detale koszyka (np. shelter) potrafią osłabić impuls z nagłówka.',
      'Narracja „sticky inflation” lub „disinflation” bywa ważniejsza niż pojedyncza niespodzianka.',
      'Zaskoczenia dodatnie często wzmacniają USD i rentowności; ujemne – osłabiają.',
      'Kontekst cyklu (faza zacieśniania/oczekiwania cięć) modyfikuje odbiór danych.',
      'Wysoka zmienność w pierwszych minutach: ostrożność wobec whipsaw i poślizgów.',
      'Brak „sygnałów” – materiał wyłącznie EDU, do zrozumienia mechanizmów reakcji.',
      'Sprawdź spójność z innymi danymi (PCE, płace), bo rynek integruje obraz całościowo.',
    ],
    preRelease: {
      t24h: [
        'Sprawdź konsensus (nagłówek i core) oraz rozpiętość prognoz.',
        'Zbadaj niedawne dane inflacyjne (PPI, regionalne wskaźniki) i narrację rynkową.',
        'Zobacz jak wyceniane są oczekiwania stóp (dotychczas) i jak reagowały UST2Y/UST10Y.',
      ],
      t2h: [
        'Zidentyfikuj poziomy techniczne na DXY, UST2Y/10Y, US100 i XAU.',
        'Przejrzyj ostatnie komentarze Fed (jastrzębie/gołębie akcenty).',
        'Sprawdź czy nie ma nakładających się publikacji w podobnej godzinie.',
      ],
      t15m: [
        'Przygotuj sekwencję odczytu: nagłówek → core → rewizje → komponenty.',
        'Ustal, jak oceniasz potencjalną zgodność/rozbieżność z narracją rynku.',
        'Zwróć uwagę na płynność i spread tuż przed publikacją.',
      ],
    },
    during: [
      'Sprawdź: nagłówek (r/r, m/m) i core (r/r, m/m) względem konsensusu.',
      'Zerknij na rewizje poprzednich odczytów, które potrafią zmieniać wydźwięk.',
      'Przejdź do komponentów (np. shelter, energy, services) – czy obraz jest spójny?',
      'Obserwuj UST2Y/UST10Y i DXY – czy reakcja jest klarowna czy mieszana?',
      'Porównaj z oczekiwaniami dot. ścieżki stóp – czy rynek zmienia wyceny?',
      'Zwróć uwagę na whipsaw w pierwszych minutach i czy pojawia się kontynuacja.',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'Jeśli CPI/core wyraźnie powyżej konsensusu',
        details: [
          'Częsta początkowa reakcja: wzrost rentowności UST i umocnienie DXY.',
          'Sektory wrażliwe na stopy mogą odczuć presję, zwłaszcza growth.',
          'Rynek „wycenia” dłuższe utrzymanie restrykcyjności polityki.',
        ],
        caveats: [
          'Gdy komponenty łagodzą wydźwięk (np. przejściowe czynniki), impuls może słabnąć.',
          'Jeżeli wcześniej rynek silnie dyskontował „hawkish” narrację, reakcja bywa krótkotrwała.',
        ],
      },
      {
        id: 'B',
        title: 'Jeśli CPI/core wyraźnie poniżej konsensusu',
        details: [
          'Częsta początkowa reakcja: spadek UST yields i osłabienie DXY.',
          'Sektory wzrostowe zyskują na łagodniejszej ścieżce stóp.',
          'Narracja disinflation może się umacniać w komentarzach.',
        ],
        caveats: [
          'Jeśli rewizje poprzednich danych są „hawkish”, rynek może odwracać ruch.',
          'Przejściowe czynniki lub jednorazowość odczytu osłabiają wymowę.',
        ],
      },
      {
        id: 'C',
        title: 'Jeśli odczyt blisko konsensusu i bez nowych wniosków',
        details: [
          'Reakcja bywa ograniczona, rynek czeka na kolejne dane (np. PCE).',
          'Kontekst wcześniejszego trendu i nastroju determinuje mikro-reakcję.',
        ],
        caveats: [
          'Duża wrażliwość na komentarze decydentów i ruch na UST.',
        ],
      },
    ],
    pitfalls: [
      'Ignorowanie rozjazdu między nagłówkiem a core.',
      'Pomijanie rewizji i komponentów zmieniających wydźwięk.',
      'Zakładanie trwałości pierwszego impulsu bez potwierdzeń.',
      'Brak weryfikacji reakcji na UST2Y/UST10Y i DXY.',
      'Przecenianie pojedynczego odczytu vs trend i narracja.',
      'Overfitting do krótkiej historii odczytów.',
      'Pomijanie godziny publikacji i płynności.',
    ],
    marketMap: {
      firstReactors: ['UST2Y', 'UST10Y', 'DXY'],
      confirmations: ['Szerokość rynku (breadth)', 'VIX', 'Reakcja sektorów wrażliwych na stopy'],
      crossChecks: ['PCE/core PCE', 'Wynagrodzenia (NFP)', 'PPI'],
    },
    risks: [
      'Poślizgi/spready w pierwszych minutach.',
      'Whipsaw przy niejednoznacznych komponentach.',
      'Zależności korelacyjne zmienne w czasie.',
      'Okna płynności (godzina publikacji, overlapping sessions).',
      'Kiedy odpuścić: gdy brak spójności narracji i potwierdzeń.',
    ],
    quickQuestions: [
      'Wyjaśnij jak CPI wpływa na UST2Y/UST10Y i DXY w krótkim terminie.',
      'Które komponenty CPI najczęściej zmieniają pierwszą reakcję rynku?',
      'Jakie są typowe pułapki przy interpretacji CPI vs core?',
      'Co weryfikować po 5–15 minutach od publikacji CPI?',
    ],
    related: ['DXY', 'UST2Y', 'UST10Y', 'US100', 'XAU'],
    checklist: [
      { id: 'cpi-consensus', label: 'Sprawdzony konsensus (headline, core)' },
      { id: 'cpi-revisions', label: 'Rewizje poprzednich danych zapisane' },
      { id: 'cpi-components', label: 'Lista kluczowych komponentów do weryfikacji' },
      { id: 'levels-noted', label: 'Poziomy techniczne na DXY/UST/US100/XAU' },
      { id: 'liquidity-note', label: 'Uwagę o płynności i spreadach dodano' },
    ],
    quiz: [
      {
        question: 'Co najczęściej jest pierwszym „nośnikiem” reakcji po CPI?',
        options: ['Indeksy akcji', 'Rentowności UST', 'Złoto', 'Szerokość rynku'],
        correctIndex: 1,
        explanation: 'Rynek stóp (UST2Y/10Y) zwykle pierwszy reprycuje oczekiwania dot. ścieżki stóp.',
      },
      {
        question: 'Co może szybko odwrócić pierwszą reakcję po CPI?',
        options: ['Rewizje, komponenty i rozjazd z core', 'Komentarze spółek', 'Otwarta luka na indeksach', 'Zmiana w VIX powyżej 20'],
        correctIndex: 0,
        explanation: 'Detale raportu często modyfikują nagłówek.',
      },
      {
        question: 'Który czynnik zwykle wzmacnia narrację „dovish” po CPI?',
        options: ['Wyższy core', 'Niższy headline i zgodny core', 'Wyższy headline i niższy core', 'Wzrost indeksu cen usług'],
        correctIndex: 1,
        explanation: 'Spójnie niższy headline + core wspiera narrację łagodniejszej inflacji.',
      },
      {
        question: 'Jakie rynki krzyżowo warto sprawdzić oprócz UST i DXY?',
        options: ['BTC i ETH', 'Breadth i VIX', 'Ropa i miedź', 'REIT-y'],
        correctIndex: 1,
        explanation: 'Szerokość rynku i VIX pomagają ocenić wiarygodność ruchu.',
      },
      {
        question: 'Które z poniższych to ryzyko operacyjne przy CPI?',
        options: ['Niskie spready', 'Whipsaw i poślizg', 'Stałe korelacje', 'Brak rewizji'],
        correctIndex: 1,
        explanation: 'Whipsaw i slippage są typowe przy dużej zmienności.',
      },
    ],
    glossary: [
      { term: 'Core CPI', definition: 'Inflacja CPI z wyłączeniem cen żywności i energii.' },
      { term: 'Rewizja', definition: 'Aktualizacja poprzedniego odczytu, mogąca zmienić wydźwięk danych.' },
      { term: 'Sticky inflation', definition: 'Utrzymująca się, wolno spadająca inflacja.' },
      { term: 'Disinflation', definition: 'Spowolnienie tempa wzrostu cen (spadek inflacji).' },
      { term: 'UST2Y', definition: 'Rentowność 2-letnich obligacji skarbowych USA.' },
      { term: 'UST10Y', definition: 'Rentowność 10-letnich obligacji skarbowych USA.' },
      { term: 'Breadth', definition: 'Miara szerokości ruchu rynku (udział spółek w ruchu).' },
      { term: 'Whipsaw', definition: 'Szybkie, mylące odwrócenia ruchu tuż po publikacji.' },
      { term: 'Headline CPI', definition: 'Inflacja ogólna CPI, bez wyłączeń.' },
      { term: 'Energy component', definition: 'Składnik koszyka CPI związany z energią.' },
    ],
    instrumentFocus: {
      US100: [
        'Wrażliwy na oczekiwania stóp — rentowności UST2Y/10Y po CPI bywają kluczowe.',
        'Kontekst growth vs value może modyfikować odbiór danych inflacyjnych.',
      ],
      XAUUSD: [
        'Złoto reaguje na real yields i DXY; wzrost realnych stóp bywa niekorzystny.',
      ],
      EURUSD: [
        'Para reaguje na różnicę oczekiwań stóp (USD vs EUR) i DXY.',
      ],
      UST10Y: [
        'Kierunek po CPI bywa wyraźny; zwróć uwagę na kształt krzywej (2s10s).',
      ],
    },
  },

  // 2) US Core PCE
  {
    slug: 'us-core-pce',
    title: 'US Core PCE (Inflacja bazowa PCE)',
    region: 'US',
    importance: 'high',
    tags: ['inflacja', 'stopy', 'pce', 'dxy'],
    updatedAt: nowISO(),
    summaryOneLine: 'Preferowana przez Fed miara inflacji; często ważniejsza dla narracji niż CPI.',
    sixtySeconds: [
      'Core PCE to miara inflacji bliska mandatowi Fed; rynek często przykłada do niej większą wagę.',
      'Rozbieżność CPI vs PCE bywa źródłem rekalibracji narracji inflacyjnej.',
      'Reakcje w UST i DXY mogą być podobne do CPI, ale liczy się zbieżność sygnału.',
      'Detale konsumpcji i dochodów gospodarstw domowych wpływają na wydźwięk.',
      'Niższy Core PCE wspiera oczekiwania łagodniejszej ścieżki stóp.',
      'Wyższy odczyt może wzmacniać „higher for longer”, ale zależy od trendu i rewizji.',
      'W pierwszych minutach typowe są szerokie wahania — uwaga na whipsaw.',
      'EDU: brak zaleceń; celem jest zrozumienie transmisji do UST/DXY i nastrojów.',
    ],
    preRelease: {
      t24h: [
        'Konsensus PCE i porównanie z ostatnim CPI.',
        'Komentarze Fed dotyczące presji cenowej i popytu.',
        'Przegląd krzywej dochodowości i oczekiwań dot. stóp.',
      ],
      t2h: [
        'Kluczowe poziomy na UST/DXY/EURUSD/XAU.',
        'Sentyment rynku akcji i szerokość ruchu.',
        'Czy są inne dane w tym samym oknie czasowym?',
      ],
      t15m: [
        'Kolejność odczytu: core → headline → dochody/wydatki.',
        'Ustal punkty szybkiej weryfikacji komponentów.',
        'Zwróć uwagę na płynność i spready.',
      ],
    },
    during: [
      'Porównaj core PCE z konsensusem (m/m, r/r).',
      'Oceń wydatki/dochodów – czy wspierają obraz inflacyjny?',
      'Sprawdź rewizje i czy sygnał spójny z CPI.',
      'Obserwuj UST2Y/10Y i DXY – pierwsza reakcja i kontynuacja.',
      'Zweryfikuj komentarze rynkowe – czy narracja się zmienia?',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'Core PCE poniżej konsensusu i spójny z miękką inflacją',
        details: [
          'Częste obniżenie UST yields i osłabienie DXY.',
          'Wrażliwe na stopy segmenty reagują pozytywnie.',
        ],
        caveats: [
          'Jeśli wydatki/dochodów sygnalizują presję popytową, obraz słabnie.',
        ],
      },
      {
        id: 'B',
        title: 'Core PCE powyżej konsensusu',
        details: [
          'Wzrost UST yields i umocnienie DXY bywa pierwszą reakcją.',
          'Rynek może przesunąć ścieżkę oczekiwań stóp.',
        ],
        caveats: [
          'Jeżeli CPI był miękki, rynek może kwestionować jednorazowość.',
        ],
      },
      {
        id: 'C',
        title: 'Brak zaskoczenia',
        details: [
          'Ograniczona reakcja; liczy się stan narracji i trendy.',
        ],
        caveats: [
          'Komentarze członków Fed mogą szybko przejąć ster.',
        ],
      },
    ],
    pitfalls: [
      'Ignorowanie różnic vs CPI.',
      'Brak spojrzenia na dochody/wydatki.',
      'Oparcie wniosku na nagłówku bez trendu.',
      'Błędna interpretacja rewizji.',
      'Pomijanie krzyżowych rynków (DXY, real yields).',
      'Założenie stałych korelacji.',
    ],
    marketMap: {
      firstReactors: ['UST2Y', 'UST10Y', 'DXY'],
      confirmations: ['EURUSD (odwrotnie do DXY)', 'Szerokość rynku'],
      crossChecks: ['CPI/core', 'PPI', 'Komentarze Fed'],
    },
    risks: [
      'Whipsaw i poślizgi.',
      'Zależność od wcześniejszych danych CPI.',
      'Okresy niskiej płynności.',
    ],
    quickQuestions: [
      'Dlaczego core PCE jest preferowane przez Fed?',
      'Kiedy rozjazd CPI vs PCE jest istotny dla DXY?',
      'Jak odczytywać wydatki/dochodów przy PCE?',
    ],
    related: ['DXY', 'UST2Y', 'UST10Y', 'EURUSD', 'XAU'],
    checklist: [
      { id: 'pce-consensus', label: 'Konsensus core/headline PCE' },
      { id: 'pce-vs-cpi', label: 'Porównanie z ostatnim CPI' },
      { id: 'pce-revisions', label: 'Rewizje i kontekst trendu' },
      { id: 'pce-levels', label: 'Poziomy na UST/DXY/EURUSD' },
    ],
    quiz: [
      {
        question: 'Dlaczego core PCE bywa ważniejsze niż CPI dla Fed?',
        options: ['Ma niższą zmienność i inne wagi', 'Jest publikowane częściej', 'Uwzględnia PMI', 'Dotyczy wyłącznie energii'],
        correctIndex: 0,
        explanation: 'Core PCE ma inne wagi i bywa bliższe ujęciu inflacji konsumpcyjnej istotnej dla Fed.',
      },
      {
        question: 'Co może zneutralizować „dovish” odczyt core PCE?',
        options: ['Silny wzrost wydatków', 'Spadek DXY', 'Brak rewizji', 'Wyższy VIX'],
        correctIndex: 0,
        explanation: 'Wydatki i dochody mogą sygnalizować presję popytową.',
      },
    ],
    glossary: [
      { term: 'Core PCE', definition: 'Bazowa inflacja PCE, bez żywności i energii.' },
      { term: 'Personal Consumption Expenditures', definition: 'Miara wydatków konsumpcyjnych gospodarstw domowych.' },
      { term: 'Real yields', definition: 'Rentowności obligacji po uwzględnieniu inflacji.' },
    ],
  },

  // 3) US NFP
  {
    slug: 'us-nfp',
    title: 'US Non-Farm Payrolls (NFP)',
    region: 'US',
    importance: 'high',
    tags: ['praca', 'płace', 'stopy'],
    updatedAt: nowISO(),
    summaryOneLine: 'Nagłówek, rewizje i płace decydują o tonie; UST i USD szybko reagują.',
    sixtySeconds: [
      'NFP to raport o zatrudnieniu; rynek patrzy na nagłówek, rewizje i płace godzinowe.',
      'Wzrost płac wzmacnia wątek inflacyjny; bezrobocie i partycypacja zmieniają odbiór.',
      'Pierwsza reakcja często w UST i DXY, potem indeksy i surowce.',
      'Silne rewizje potrafią odwrócić początkowy impuls.',
      'Znaczenie raportu zależy od etapu cyklu i priorytetów Fed.',
      'Pułapką jest rozjazd nagłówka z płacami i partycypacją.',
      'EDU: celem jest rozumienie transmisji — bez rekomendacji „co robić”.',
    ],
    preRelease: {
      t24h: [
        'Konsensus nagłówka i płac, zakres prognoz.',
        'Poprzednie rewizje i „trend” w zatrudnieniu.',
        'Komentarze Fed dot. chłodzenia/rozgrzewania rynku pracy.',
      ],
      t2h: [
        'Poziomy na UST/DXY/US100/XAU.',
        'Sentyment i breadth: czy rynek jest rozciągnięty?',
        'Potencjalne nakładanie się innych danych w godzinie publikacji.',
      ],
      t15m: [
        'Kolejność odczytu: nagłówek → rewizje → płace → bezrobocie/party.',
        'Sprawdź płynność/spready.',
        'Przygotuj krótkie wnioski do weryfikacji po 5–15 min.',
      ],
    },
    during: [
      'Sprawdź nagłówek vs konsensus i rewizje.',
      'Oceń płace (m/m, r/r) oraz bezrobocie/party.',
      'Zobacz reakcję UST2Y/UST10Y i DXY.',
      'Zweryfikuj, czy obraz jest spójny (brak rozjazdów).',
      'Czy komentarze rynkowe zmieniają narrację?',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'Silny nagłówek + rosnące płace',
        details: [
          'Często „hawkish”: UST yields w górę, DXY w górę.',
          'Sektory wrażliwe na stopy otrzymują presję.',
        ],
        caveats: [
          'Jeśli bezrobocie rośnie i partycypacja spada, wydźwięk łagodnieje.',
        ],
      },
      {
        id: 'B',
        title: 'Słaby nagłówek + miękkie płace',
        details: [
          'Często „dovish”: UST yields w dół, DXY w dół.',
          'Rynek wycenia łagodniejszą politykę.',
        ],
        caveats: [
          'Silne rewizje potrafią zneutralizować ten obraz.',
        ],
      },
      {
        id: 'C',
        title: 'Mieszany obraz (rozjazd nagłówka i płac)',
        details: [
          'Reakcja bywa niespójna i krótkotrwała.',
          'Kontekst trendu i wcześniejszych danych decyduje.',
        ],
        caveats: [
          'Rynek czeka na kolejne publikacje (np. CPI/PCE).',
        ],
      },
    ],
    pitfalls: [
      'Ignorowanie rewizji.',
      'Brak analizy płac i partycypacji.',
      'Wnioskowanie z samego nagłówka.',
      'Brak crosscheck z UST i DXY.',
      'Nadmierna wiara w stabilność korelacji.',
      'Przeoczenie wpływu sezonowości.',
    ],
    marketMap: {
      firstReactors: ['UST2Y', 'UST10Y', 'DXY'],
      confirmations: ['Szerokość rynku', 'Reakcja sektorów cyklicznych'],
      crossChecks: ['UI Claims', 'JOLTS', 'Komentarze Fed'],
    },
    risks: [
      'Duże poślizgi i whipsaw.',
      'Okresy rozciągnięcia sentymentu wzmacniają Amplitudę.',
      'Zależność od cyklu koniunkturalnego.',
    ],
    quickQuestions: [
      'Jak interpretować rozjazd nagłówka NFP i płac?',
      'Dlaczego rewizje w NFP są krytyczne?',
      'Kiedy bezrobocie/party zmienia wydźwięk danych?',
    ],
    related: ['DXY', 'UST2Y', 'UST10Y', 'US100', 'XAU'],
    checklist: [
      { id: 'nfp-consensus', label: 'Konsensus nagłówka/płac' },
      { id: 'nfp-revisions', label: 'Sprawdź rewizje' },
      { id: 'nfp-levels', label: 'Poziomy UST/DXY/US100/XAU' },
      { id: 'nfp-liquidity', label: 'Zapis o płynności/spreadach' },
    ],
    quiz: [
      {
        question: 'Co najmocniej modyfikuje wydźwięk nagłówka NFP?',
        options: ['Płace i rewizje', 'Zamknięcie sesji', 'VIX', 'Nastroje konsumentów'],
        correctIndex: 0,
        explanation: 'Płace i rewizje często odwracają pierwsze wnioski.',
      },
    ],
    glossary: [
      { term: 'Participation rate', definition: 'Wskaźnik partycypacji siły roboczej w rynku pracy.' },
      { term: 'Average hourly earnings', definition: 'Przeciętne wynagrodzenie godzinowe.' },
      { term: 'Rewizja', definition: 'Korekta poprzedniego odczytu.' },
    ],
  },

  // 4) FOMC Decision (rate decision + konferencja)
  {
    slug: 'fomc-decision',
    title: 'FOMC Decision (stopy + konferencja)',
    region: 'US',
    importance: 'high',
    tags: ['stopy', 'fed', 'konferencja'],
    updatedAt: nowISO(),
    summaryOneLine: 'Decyzja, oświadczenie i konferencja: ton bywa ważniejszy niż sam ruch stóp.',
    sixtySeconds: [
      'Rynek reaguje na zestaw: decyzja → oświadczenie → konferencja.',
      '„Dot plot” (gdy publikowany) i sformułowania o ryzykach wpływają na wyceny.',
      'Rozjazd między decyzją a tonem konferencji może odwrócić ruch.',
      'UST i DXY często prowadzą, ale reakcja bywa wielofazowa.',
      'Wysokie oczekiwania rynku mogą ograniczać zaskoczenie.',
      'EDU: rozumiemy mechanikę komunikacji monetarnej — bez porad.',
    ],
    preRelease: {
      t24h: [
        'Oczekiwania na zmianę stóp i ścieżkę (futures).',
        'Analiza ostatnich wystąpień członków Fed.',
        'Poziomy techniczne na UST/DXY/EURUSD/US100.',
      ],
      t2h: [
        'Checklist: co sprawdzić w oświadczeniu i w Q&A.',
        'Sygnały o bilansie, QT/QE — czy temat wraca?',
        'Sentyment w sektorach wrażliwych na stopy.',
      ],
      t15m: [
        'Kolejność: decyzja → keywords → konferencja.',
        'Zwróć uwagę na płynność/spready i szerokość ruchu.',
      ],
    },
    during: [
      'Czy decyzja zgodna z konsensusem? Jeśli nie — pierwszy impuls.',
      'Słowa klucze w oświadczeniu (inflacja, rynek pracy, ryzyka).',
      'Konferencja: ton przewodniczącego, kierunkowe wskazówki.',
      'Reakcja UST/DXY i szerokość rynku.',
      'Weryfikacja po 10–20 min po konferencji — stabilizuje się ton?',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'Zgodna decyzja, gołębi ton konferencji',
        details: [
          'Często spadek UST yields i osłabienie DXY.',
          'Sektory wrażliwe na stopy zyskują.',
        ],
        caveats: [
          'Jeśli oświadczenie jest jastrzębie, obraz może być mieszany.',
        ],
      },
      {
        id: 'B',
        title: 'Zgodna decyzja, jastrzębi ton konferencji',
        details: [
          'Często wzrost UST yields i umocnienie DXY.',
          'Rynek rekalibruje ścieżkę stóp.',
        ],
        caveats: [
          'Rynek może „nie kupić” tonu, jeśli dane inflacyjne są miękkie.',
        ],
      },
      {
        id: 'C',
        title: 'Zaskakująca decyzja (cięcie/podwyżka nieoczekiwana)',
        details: [
          'Silny pierwszy impuls w UST i DXY.',
          'Wysoka zmienność do końca konferencji.',
        ],
        caveats: [
          'Jeśli szybko pojawiają się wyjaśnienia, reakcja bywa korygowana.',
        ],
      },
    ],
    pitfalls: [
      'Wyciąganie wniosków przed konferencją.',
      'Ignorowanie rozjazdu oświadczenie vs Q&A.',
      'Pomijanie wpływu dot plot (gdy jest).',
      'Założenie stałych korelacji.',
      'Błędna ocena płynności w oknie konferencji.',
    ],
    marketMap: {
      firstReactors: ['UST2Y', 'UST10Y', 'DXY'],
      confirmations: ['Breadth', 'Reakcja sektorów growth/value'],
      crossChecks: ['Dot plot', 'Wypowiedzi członków Fed', 'Ostatnie CPI/PCE'],
    },
    risks: [
      'Wieloetapowość reakcji (decyzja → konferencja).',
      'Whipsaw i szerokie spready.',
      'Zdolność rynku do „odrzucenia” tonu.',
    ],
    quickQuestions: [
      'Jakie słowa klucze w oświadczeniu FOMC zmieniają narrację?',
      'Jak konferencja potrafi odwrócić pierwszy impuls po decyzji?',
      'Jak interpretować rozjazd między dot plot a bieżącymi danymi?',
    ],
    related: ['DXY', 'UST2Y', 'UST10Y', 'EURUSD', 'US100'],
    checklist: [
      { id: 'fomc-expectations', label: 'Oczekiwania rynku na decyzję/stopy' },
      { id: 'fomc-keywords', label: 'Słowa klucze do oświadczenia' },
      { id: 'fomc-conference', label: 'Pytania na konferencję (ton)' },
    ],
    quiz: [
      {
        question: 'Co najczęściej zmienia obraz po decyzji FOMC?',
        options: ['Czas publikacji', 'Konferencja i ton', 'Zmiana VIX', 'Sezonowość'],
        correctIndex: 1,
        explanation: 'Konferencja potrafi odwrócić lub wzmocnić pierwszy impuls.',
      },
    ],
    glossary: [
      { term: 'Dot plot', definition: 'Wykres oczekiwań członków FOMC dot. stóp.' },
      { term: 'Statement', definition: 'Oświadczenie publikowane wraz z decyzją.' },
      { term: 'Q&A', definition: 'Sesja pytań i odpowiedzi na konferencji prasowej.' },
    ],
  },

  // 5) FOMC Minutes
  {
    slug: 'fomc-minutes',
    title: 'FOMC Minutes',
    region: 'US',
    importance: 'medium',
    tags: ['fed', 'minutes', 'stopy'],
    updatedAt: nowISO(),
    summaryOneLine: 'Dokument uzupełniający: ton i niuanse — wpływ zależy od świeżości innych danych.',
    sixtySeconds: [
      'Minutes to zapis dyskusji — kontekst między posiedzeniami.',
      'Wpływ rośnie, gdy rynek szuka wskazówek między ważnymi danymi.',
      '„Jastrzębie” vs „gołębie” akcenty zmieniają wyceny krzywych stóp.',
      'Reakcja często spokojniejsza niż po CPI/FOMC Decision.',
      'EDU: analiza tonu i konsekwencji dla UST/DXY.',
    ],
    preRelease: {
      t24h: [
        'Sprawdź ostatnie dane (CPI, NFP) — czy minutes mogą to „przykryć”?',
        'Oczekiwania rynku na ścieżkę stóp.',
      ],
      t2h: [
        'Słowa klucze: inflacja, rynek pracy, ryzyka, wrażliwość na dane.',
        'Poziomy techniczne na UST/DXY.',
      ],
      t15m: [
        'Przygotuj krótkie podsumowanie oczekiwań co do tonu.',
      ],
    },
    during: [
      'Skanuj ton: jastrzębi vs gołębi vs neutralny.',
      'Czy padają nowe argumenty dot. inflacji i popytu?',
      'Obserwuj UST i DXY pod kątem spójności reakcji.',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'Wyraźnie jastrzębi ton',
        details: ['UST w górę, DXY w górę bywa pierwszą reakcją.'],
        caveats: ['Gdy świeższe dane były miękkie, wpływ jest ograniczony.'],
      },
      {
        id: 'B',
        title: 'Wyraźnie gołębi ton',
        details: ['UST w dół, DXY w dół, risk-on sprzyja indeksom.'],
        caveats: ['Brak nowych informacji ogranicza trwałość reakcji.'],
      },
      {
        id: 'C',
        title: 'Brak nowych wniosków',
        details: ['Reakcja niewielka; rynek czeka na ważniejsze dane.'],
        caveats: ['Komentarze członków Fed mogą szybciej zmienić narrację.'],
      },
    ],
    pitfalls: [
      'Wnioskowanie „jak po decyzji FOMC” – minutes to inny materiał.',
      'Ignorowanie świeżości danych makro.',
      'Brak porównania z poprzednimi minutes.',
    ],
    marketMap: {
      firstReactors: ['UST2Y', 'UST10Y'],
      confirmations: ['DXY', 'EURUSD'],
      crossChecks: ['Ostatnie CPI/PCE/NFP', 'Wystąpienia Fed'],
    },
    risks: [
      'Wpływ bywa umiarkowany.',
      'Czynniki zewnętrzne mogą przyćmić minutes.',
    ],
    quickQuestions: [
      'Jak minutes zmieniają ocenę ryzyk inflacyjnych Fed?',
      'Czy minutes zawierają nowe informacje względem decyzji?',
    ],
    related: ['UST2Y', 'UST10Y', 'DXY', 'EURUSD'],
    checklist: [
      { id: 'min-ton', label: 'Ocena tonu (hawk/dove)' },
      { id: 'min-new', label: 'Nowe informacje vs poprzednie' },
      { id: 'min-cross', label: 'Cross-check z danymi makro' },
    ],
    quiz: [
      {
        question: 'Minutes a decyzja: co je różni w wpływie na rynek?',
        options: ['Minutes zwykle silniejsze', 'Decyzja/konferencja zwykle silniejsza', 'Równa siła', 'Minutes mają wpływ tylko na złoto'],
        correctIndex: 1,
        explanation: 'Decyzja i konferencja zazwyczaj niosą większy impuls.',
      },
    ],
    glossary: [
      { term: 'Minutes', definition: 'Szczegółowy zapis dyskusji na posiedzeniu FOMC.' },
      { term: 'Tone analysis', definition: 'Ocena „jastrzębi”/„gołębi” akcentów.' },
    ],
  },

  // 6) ISM Manufacturing
  {
    slug: 'ism-manufacturing',
    title: 'ISM Manufacturing',
    region: 'US',
    importance: 'medium',
    tags: ['wzrost', 'pmi', 'ceny'],
    updatedAt: nowISO(),
    summaryOneLine: 'Nagłówek i komponenty (new orders, prices, employment); próg 50 jako ważny sygnał fazy.',
    sixtySeconds: [
      'ISM pokazuje stan sektora przemysłu; kluczowe są komponenty.',
      'New orders i prices wpływają na narrację inflacyjno-popytową.',
      'Rynek może bardziej reagować, gdy ISM „przechodzi” przez 50.',
      'Wpływ umiarkowany vs CPI/NFP, ale ważny w zmianie narracji.',
      'Instrumenty: UST, DXY, cykliczne sektory, surowce.',
    ],
    preRelease: {
      t24h: [
        'Sprawdź trend i ostatnie odchylenia od konsensusu.',
        'Porównaj z regionalnymi PMI.',
      ],
      t2h: [
        'Poziomy techniczne i sentyment.',
      ],
      t15m: [
        'Kolejność odczytu: nagłówek → new orders → prices → employment.',
      ],
    },
    during: [
      'Nagłówek vs konsensus i względem 50.',
      'Komponenty zmieniające wydźwięk (prices/new orders).',
      'Reakcja UST/DXY i szerokość rynku.',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'ISM > 50 i komponenty rosną',
        details: ['Wspiera narrację o poprawie koniunktury.'],
        caveats: ['Jeśli prices rosną za mocno, inflacyjne obawy mogą dominować.'],
      },
      {
        id: 'B',
        title: 'ISM < 50 i komponenty spadają',
        details: ['Słabszy obraz wzrostu; możliwa presja na DXY zależnie od kontekstu.'],
        caveats: ['Jeśli inne dane silne, wpływ krótkotrwały.'],
      },
      {
        id: 'C',
        title: 'Mieszany obraz komponentów',
        details: ['Reakcja bywa niejednoznaczna, rynek szuka potwierdzeń.'],
        caveats: ['Liczy się trend i kolejne publikacje.'],
      },
    ],
    pitfalls: [
      'Wyciąganie wniosków z nagłówka bez komponentów.',
      'Brak odniesienia do progu 50.',
      'Pominięcie trendu i regionalnych wskaźników.',
    ],
    marketMap: {
      firstReactors: ['UST10Y', 'DXY'],
      confirmations: ['Sektory cykliczne', 'Surowce'],
      crossChecks: ['Regionalne PMI', 'Sentyment przedsiębiorstw'],
    },
    risks: [
      'Umiarkowany wpływ vs duże dane makro.',
      'Zmienna wrażliwość zależnie od cyklu.',
    ],
    quickQuestions: [
      'Jak komponent „prices” zmienia interpretację ISM?',
      'Kiedy próg 50 ma największe znaczenie?',
    ],
    related: ['UST10Y', 'DXY', 'US100'],
    checklist: [
      { id: 'ism-header', label: 'Nagłówek vs 50' },
      { id: 'ism-components', label: 'New orders/prices/employment' },
      { id: 'ism-trend', label: 'Trend vs regionalne PMI' },
    ],
    quiz: [
      {
        question: 'Który komponent często wzmacnia wątek inflacyjny?',
        options: ['New orders', 'Employment', 'Prices', 'Backlogs'],
        correctIndex: 2,
        explanation: 'Wzrost „prices” może budzić obawy o presję cenową.',
      },
    ],
    glossary: [
      { term: 'ISM', definition: 'Indeks aktywności w przemyśle w USA.' },
      { term: 'PMI', definition: 'Wskaźnik menedżerów zakupów — kondycja sektora.' },
    ],
  },

  // 7) US Retail Sales
  {
    slug: 'us-retail-sales',
    title: 'US Retail Sales',
    region: 'US',
    importance: 'medium',
    tags: ['konsumpcja', 'popyt', 'wzrost'],
    updatedAt: nowISO(),
    summaryOneLine: 'Odbicie popytu konsumenckiego może wzmacniać oczekiwania inflacyjne i wzrostowe.',
    sixtySeconds: [
      'Sprzedaż detaliczna odzwierciedla siłę popytu konsumenckiego.',
      'Ważne są odczyty „ex-autos” i rewizje.',
      'Silny popyt może wzmacniać obawy o inflację, zależnie od kontekstu.',
      'UST i DXY reagują, ale siła wpływu mniejsza niż CPI/NFP.',
      'EDU: rozumienie transmisji popytu do stóp i waluty.',
    ],
    preRelease: {
      t24h: ['Konsensus (headline, ex-autos)', 'Sentyment konsumentów (jako kontekst)'],
      t2h: ['Poziomy na UST/DXY/EURUSD', 'Breadth i kondycja sektorów'],
      t15m: ['Kolejność: headline → ex-autos → rewizje → detale'],
    },
    during: [
      'Nagłówek vs konsensus, ex-autos i rewizje.',
      'Reakcja UST/DXY; czy sygnał spójny z inflacją?',
      'Komentarze rynkowe: popyt a presja cenowa.',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'Silne zaskoczenie w górę',
        details: ['Możliwy wzrost UST yields i DXY, zależnie od narracji inflacyjnej.'],
        caveats: ['Jednorazowość i rewizje mogą osłabić wydźwięk.'],
      },
      {
        id: 'B',
        title: 'Słabe dane',
        details: ['Możliwy spadek UST yields i DXY; rynek ocenia siłę konsumenta.'],
        caveats: ['Inne dane mogą dominować (CPI/PCE).'],
      },
      {
        id: 'C',
        title: 'Blisko konsensusu',
        details: ['Reakcja ograniczona; liczy się trend i rewizje.'],
        caveats: ['Słaby kontekst może wzmocnić małe odchylenia.'],
      },
    ],
    pitfalls: [
      'Ignorowanie ex-autos i rewizji.',
      'Wnioskowanie o inflacji bez danych potwierdzających.',
      'Brak cross-check z dochodami i wydatkami.',
    ],
    marketMap: {
      firstReactors: ['UST2Y', 'DXY'],
      confirmations: ['Sektory konsumpcyjne', 'Breadth'],
      crossChecks: ['PCE', 'CPI', 'Wynagrodzenia'],
    },
    risks: ['Whipsaw przy małych różnicach vs konsensus', 'Niska płynność poza sesją'],
    quickQuestions: [
      'Jak Retail Sales wpływa na narrację inflacyjną?',
      'Kiedy ex-autos jest ważniejsze od nagłówka?',
    ],
    related: ['DXY', 'UST2Y', 'EURUSD', 'US100'],
    checklist: [
      { id: 'rs-consensus', label: 'Konsensus headline/ex-autos' },
      { id: 'rs-revisions', label: 'Rewizje poprzednich odczytów' },
      { id: 'rs-cross', label: 'Cross-check PCE/CPI' },
    ],
    quiz: [
      {
        question: 'Który składnik bywa kluczowy w interpretacji sprzedaży?',
        options: ['Ex-autos', 'Zapasy', 'Eksport', 'Cło'],
        correctIndex: 0,
        explanation: 'Ex-autos redukuje wpływ zmiennej kategorii pojazdów.',
      },
    ],
    glossary: [
      { term: 'Ex-autos', definition: 'Sprzedaż detaliczna z wyłączeniem pojazdów.' },
      { term: 'Consumer demand', definition: 'Popyt konsumentów na dobra i usługi.' },
    ],
  },

  // 8) US GDP (Advance)
  {
    slug: 'us-gdp-advance',
    title: 'US GDP (Advance)',
    region: 'US',
    importance: 'high',
    tags: ['wzrost', 'pkb', 'cykl'],
    updatedAt: nowISO(),
    summaryOneLine: 'Pierwszy szacunek PKB; komponenty (konsumpcja, inwestycje, eksport) kształtują narrację.',
    sixtySeconds: [
      'Raport „Advance” to pierwszy szacunek PKB — rynek ocenia wiarygodność i komponenty.',
      'Silny PKB bywa wspierający dla wycen wzrostu, ale komponenty są kluczowe.',
      'Wpływ na UST/DXY zależy od implikacji dla stóp i inflacji.',
      'Rewizje w kolejnych wydaniach mogą zmieniać obraz.',
      'EDU: rozumiemy, jak mix komponentów kształtuje reakcję rynkową.',
    ],
    preRelease: {
      t24h: ['Konsensus PKB i komponenty oczekiwane', 'Ostatnie wskaźniki wyprzedzające'],
      t2h: ['Poziomy na UST/DXY, sentyment indeksów'],
      t15m: ['Kolejność: headline → komponenty → deflator → rewizje'],
    },
    during: [
      'Nagłówek PKB vs konsensus.',
      'Komponenty: konsumpcja/inwestycje/eksport/import.',
      'Deflator PKB jako wątek inflacyjny.',
      'Reakcja UST/DXY i spójność z narracją.',
    ],
    scenarios: [
      {
        id: 'A',
        title: 'Silny wzrost PKB i solidne komponenty',
        details: ['Możliwa presja na UST yields w górę i DXY w górę.'],
        caveats: ['Jeśli deflator łagodny, obraz inflacyjny słabnie.'],
      },
      {
        id: 'B',
        title: 'Słaby PKB lub słabe komponenty',
        details: ['Możliwy spadek UST yields i DXY.'],
        caveats: ['Konflikt z innymi danymi osłabia wpływ.'],
      },
      {
        id: 'C',
        title: 'Mieszany obraz i wysoka niepewność',
        details: ['Reakcja ograniczona; rynek czeka na kolejne rewizje.'],
        caveats: ['Advance często bywa korygowany później.'],
      },
    ],
    pitfalls: [
      'Wyciąganie wniosków bez komponentów.',
      'Ignorowanie deflatora.',
      'Przecenianie pierwszego szacunku względem rewizji.',
    ],
    marketMap: {
      firstReactors: ['UST10Y', 'DXY'],
      confirmations: ['Sektory cykliczne', 'Surowce wzrostowe'],
      crossChecks: ['Leading indicators', 'PMI/ISM'],
    },
    risks: [
      'Wysokie rewizje kolejnych odczytów.',
      'Zmienne korelacje w zależności od cyklu.',
    ],
    quickQuestions: [
      'Jak interpretować deflator PKB w kontekście stóp?',
      'Które komponenty decydują o odbiorze PKB przez rynek?',
    ],
    related: ['UST10Y', 'DXY', 'US100', 'XAU'],
    checklist: [
      { id: 'gdp-consensus', label: 'Konsensus nagłówka i deflatora' },
      { id: 'gdp-components', label: 'Lista komponentów do weryfikacji' },
      { id: 'gdp-cross', label: 'Cross-check z wskaźnikami wyprzedzającymi' },
    ],
    quiz: [
      {
        question: 'Co odróżnia „Advance” od kolejnych odczytów PKB?',
        options: ['Niższa dokładność i możliwe rewizje', 'Wyższa dokładność', 'Brak komponentów', 'Brak deflatora'],
        correctIndex: 0,
        explanation: 'Pierwszy szacunek jest wstępny i często rewidowany.',
      },
    ],
    glossary: [
      { term: 'Advance GDP', definition: 'Pierwszy, wstępny szacunek PKB.' },
      { term: 'GDP deflator', definition: 'Miara zmian cen w gospodarce (inflacyjny komponent PKB).' },
    ],
  },

  // Dodatkowe playbooki (szablony bazowe) — można rozszerzać później
  {
    slug: 'us-core-retail-sales',
    title: 'US Core Retail Sales (ex-autos & gas)',
    region: 'US',
    importance: 'medium',
    tags: ['konsumpcja', 'popyt'],
    updatedAt: nowISO(),
    summaryOneLine: 'Miara popytu konsumenckiego bez autos & gas — ważna dla trendu.',
    sixtySeconds: [
      'Ex-autos & gas ogranicza zmienność kategorii.',
      'Trend ważniejszy niż pojedynczy odczyt.',
      'Krzyżowo sprawdzaj PCE/CPI.',
      'EDU — bez sygnałów.',
    ],
    preRelease: { t24h: [], t2h: [], t15m: [] },
    during: [],
    scenarios: [],
    pitfalls: [],
    marketMap: { firstReactors: [], confirmations: [], crossChecks: [] },
    risks: [],
    quickQuestions: [],
    related: ['DXY', 'UST2Y'],
    checklist: [{ id: 'core-rs-consensus', label: 'Konsensus ex-autos & gas' }],
    quiz: [],
    glossary: [],
  },

  // EU — HICP
  {
    slug: 'eu-hicp',
    title: 'EU HICP (Zharmonizowany wskaźnik cen HICP)',
    region: 'EU',
    importance: 'high',
    tags: ['inflacja', 'ecb', 'hicp'],
    updatedAt: nowISO(),
    summaryOneLine: 'HICP to kluczowa miara inflacji w strefie euro; wpływa na oczekiwania co do polityki EBC.',
    sixtySeconds: [
      'HICP i bazowy HICP są głównymi punktami odniesienia dla EBC.',
      'Zaskoczenia kształtują wyceny stóp w strefie euro i EUR.',
      'Rewizje i rozkład komponentów (np. energy) zmieniają wydźwięk.',
      'Reakcja zależy od spójności z trendem i komentarzami EBC.',
      'EDU: zrozum transmisję do krzywej i EUR bez wniosków inwestycyjnych.',
    ],
    preRelease: {
      t24h: ['Konsensus HICP i core', 'Ostatnie dane z głównych gospodarek (DE/FR/IT)'],
      t2h: ['Poziomy na EURUSD, Bund yields, sentyment na indeksach EU'],
      t15m: ['Sekwencja: headline → core → komponenty → rewizje'],
    },
    during: ['Headline/core vs konsensus', 'Komponenty i rewizje', 'Reakcja Bund/EUR', 'Zbieżność z narracją EBC'],
    scenarios: [
      { id: 'A', title: 'HICP wyżej niż konsensus', details: ['Bund yields w górę', 'EUR bywa mocniejszy'], caveats: ['Jeśli energia jednorazowo zawyża'] },
      { id: 'B', title: 'HICP niżej niż konsensus', details: ['Bund yields w dół', 'EUR bywa słabszy'], caveats: ['Miękkie dane mogą być przejściowe'] },
      { id: 'C', title: 'Blisko konsensusu', details: ['Reakcja ograniczona'], caveats: ['Komentarze EBC mogą dominować'] },
    ],
    pitfalls: ['Ignorowanie core', 'Brak analizy komponentów', 'Wnioski bez trendu'],
    marketMap: {
      firstReactors: ['Bund (10Y)', 'EURUSD'],
      confirmations: ['Stoxx 600 wrażliwe sektory'],
      crossChecks: ['PPI', 'Komentarze EBC'],
    },
    risks: ['Whipsaw przy mieszanych detalach', 'Niska płynność poza sesją'],
    quickQuestions: ['Kiedy core HICP „przykrywa” nagłówek?', 'Jak energia zmienia obraz HICP?'],
    related: ['EURUSD', 'Bund10Y'],
    checklist: [
      { id: 'hicp-consensus', label: 'Konsensus headline/core' },
      { id: 'hicp-components', label: 'Komponenty (energy, services)' },
      { id: 'hicp-cross', label: 'Cross-check z PPI' },
    ],
    quiz: [],
    glossary: [
      { term: 'HICP', definition: 'Zharmonizowany wskaźnik cen konsumpcyjnych w UE.' },
      { term: 'Core HICP', definition: 'HICP bez energii i żywności.' },
    ],
  },

  // EU — ECB Decision
  {
    slug: 'ecb-decision',
    title: 'ECB Decision (decyzja i komunikacja)',
    region: 'EU',
    importance: 'high',
    tags: ['ecb', 'stopy', 'komunikacja'],
    updatedAt: nowISO(),
    summaryOneLine: 'Decyzja EBC, oświadczenie i konferencja – ton bywa ważniejszy niż ruch stóp.',
    sixtySeconds: [
      'EBC reaguje na ścieżkę inflacji i wzrostu; rynki patrzą na ton.',
      'Rozbieżność oświadczenie vs Q&A potrafi odwrócić ruch.',
      'EUR i krzywa stóp w strefie euro są kluczowe dla reakcji.',
      'EDU: rozumiemy mechanikę bez rekomendacji.',
    ],
    preRelease: {
      t24h: ['Oczekiwania na ruch stóp w ESTR futures', 'Komentarze członków EBC'],
      t2h: ['Poziomy na EURUSD/Bund', 'Sentyment sektorów wrażliwych na stopy'],
      t15m: ['Sekwencja: decyzja → słowa klucze → konferencja'],
    },
    during: ['Decyzja vs konsensus', 'Słowa klucze w oświadczeniu', 'Ton na konferencji', 'Reakcja Bund/EUR'],
    scenarios: [
      { id: 'A', title: 'Gołębi ton', details: ['Bund yields w dół', 'EUR słabszy'], caveats: ['Zaskakujące dane inflacyjne mogą ograniczyć wpływ'] },
      { id: 'B', title: 'Jastrzębi ton', details: ['Bund yields w górę', 'EUR mocniejszy'], caveats: ['Rynek może „nie kupić” tonu przy miękkim HICP'] },
      { id: 'C', title: 'Brak nowych informacji', details: ['Reakcja niewielka'], caveats: ['Kolejne dane szybko dominują'] },
    ],
    pitfalls: ['Wnioski przed konferencją', 'Ignorowanie ton vs dane', 'Założenie stałych korelacji'],
    marketMap: {
      firstReactors: ['Bund2Y/10Y', 'EURUSD'],
      confirmations: ['Stoxx 600 breadth'],
      crossChecks: ['HICP', 'PPI', 'Wypowiedzi EBC'],
    },
    risks: ['Wieloetapowość reakcji', 'Whipsaw w Q&A'],
    quickQuestions: ['Które zwroty w oświadczeniu EBC zmieniają narrację?', 'Jak konferencja może odwrócić pierwszy impuls?'],
    related: ['EURUSD', 'Bund10Y'],
    checklist: [
      { id: 'ecb-expect', label: 'Oczekiwania rynku (futures)' },
      { id: 'ecb-keywords', label: 'Słowa klucze do oświadczenia' },
      { id: 'ecb-qa', label: 'Pytania na konferencję' },
    ],
    quiz: [],
    glossary: [
      { term: 'ESTR futures', definition: 'Instrumenty odzwierciedlające oczekiwania stóp w strefie euro.' },
    ],
  },

  // EU — PMI Composite
  {
    slug: 'eu-pmi-composite',
    title: 'EU PMI Composite',
    region: 'EU',
    importance: 'medium',
    tags: ['pmi', 'wzrost'],
    updatedAt: nowISO(),
    summaryOneLine: 'PMI Composite syntetyzuje przemysł i usługi; próg 50 i komponenty są kluczowe.',
    sixtySeconds: [
      'Zwracaj uwagę na komponenty i trend.',
      'Przejście przez 50 zmienia narrację o koniunkturze.',
      'Wpływ umiarkowany, większy w zmianie fazy.',
    ],
    preRelease: { t24h: ['Konsensus i trend'], t2h: ['Poziomy na EUR/Bund'], t15m: ['Sekwencja: headline → komponenty'] },
    during: ['Nagłówek vs 50', 'Komponenty', 'Reakcja EUR/Bund'],
    scenarios: [
      { id: 'A', title: 'PMI > 50 i rośnie', details: ['Wspiera poprawę koniunktury'], caveats: ['Wysokie „prices” łagodzą obraz'] },
      { id: 'B', title: 'PMI < 50 i spada', details: ['Sygnał słabości'], caveats: ['Sprzeczne dane ograniczają wpływ'] },
      { id: 'C', title: 'Mieszane komponenty', details: ['Reakcja niejednoznaczna'], caveats: ['Potrzebne potwierdzenia'] },
    ],
    pitfalls: ['Brak odniesienia do 50', 'Ignorowanie komponentów'],
    marketMap: { firstReactors: ['EURUSD'], confirmations: ['Bund'], crossChecks: ['Regionalne PMI'] },
    risks: ['Umiarkowany wpływ', 'Zmienne korelacje'],
    quickQuestions: ['Kiedy komponent „prices” dominuje interpretację?', 'Jak czytać trend vs jednorazowy odczyt?'],
    related: ['EURUSD', 'Bund10Y'],
    checklist: [{ id: 'pmi-consensus', label: 'Konsensus i trend' }],
    quiz: [],
    glossary: [{ term: 'PMI Composite', definition: 'Połączony PMI dla przemysłu i usług.' }],
  },

  // DE — Ifo
  {
    slug: 'de-ifo',
    title: 'DE Ifo Business Climate',
    region: 'EU',
    importance: 'medium',
    tags: ['ifo', 'sentiment', 'de'],
    updatedAt: nowISO(),
    summaryOneLine: 'Ifo mierzy klimat biznesowy w DE; sygnał sentymentu dla strefy euro.',
    sixtySeconds: ['Syntetyczny wskaźnik nastroju firm', 'Ważny przy zmianach cyklu'],
    preRelease: { t24h: ['Konsensus, trend'], t2h: ['EUR poziomy'], t15m: ['Kolejność: headline → subindeksy'] },
    during: ['Nagłówek vs konsensus', 'Subindeksy', 'Reakcja EUR'],
    scenarios: [
      { id: 'A', title: 'Wyżej niż konsensus', details: ['Lepszy sentyment'], caveats: ['Brak potwierdzeń w twardych danych'] },
      { id: 'B', title: 'Niżej niż konsensus', details: ['Słabszy sentyment'], caveats: ['Jednorazowy czynnik'] },
      { id: 'C', title: 'Blisko konsensusu', details: ['Mała reakcja'], caveats: [] },
    ],
    pitfalls: ['Wnioski bez cross-checku', 'Przecenianie pojedynczej publikacji'],
    marketMap: { firstReactors: ['EURUSD'], confirmations: [], crossChecks: ['PMI, produkcja'] },
    risks: ['Umiarkowany wpływ'],
    quickQuestions: ['Czy Ifo zmienia trend sentymentu?', 'Jak łączyć Ifo z PMI?'],
    related: ['EURUSD'],
    checklist: [{ id: 'ifo-consensus', label: 'Konsensus i subindeksy' }],
    quiz: [],
    glossary: [{ term: 'Ifo', definition: 'Wskaźnik klimatu biznesowego w Niemczech.' }],
  },

  // UK — CPI
  {
    slug: 'uk-cpi',
    title: 'UK CPI',
    region: 'UK',
    importance: 'high',
    tags: ['inflacja', 'boe', 'cpi'],
    updatedAt: nowISO(),
    summaryOneLine: 'Inflacja UK wpływa na oczekiwania BoE i GBP; headline i core są kluczowe.',
    sixtySeconds: ['Core CPI ma znaczenie dla BoE', 'GBP i Gilt reagują szybko', 'Rewizje i komponenty modyfikują obraz'],
    preRelease: { t24h: ['Konsensus headline/core'], t2h: ['Poziomy na GBPUSD/Gilt'], t15m: ['Sekwencja: headline → core → komponenty'] },
    during: ['Headline/core vs konsensus', 'Komponenty i rewizje', 'Reakcja Gilt/GBP'],
    scenarios: [
      { id: 'A', title: 'Wyżej niż konsensus', details: ['Gilt yields w górę', 'GBP mocniejszy'], caveats: ['Komponent energy przejściowy'] },
      { id: 'B', title: 'Niżej niż konsensus', details: ['Gilt yields w dół', 'GBP słabszy'], caveats: ['Jednorazowość odczytu'] },
      { id: 'C', title: 'Blisko konsensusu', details: ['Ograniczona reakcja'], caveats: [] },
    ],
    pitfalls: ['Rozjazd headline vs core', 'Brak analizy komponentów'],
    marketMap: { firstReactors: ['Gilt10Y', 'GBPUSD'], confirmations: [], crossChecks: ['Wynagrodzenia', 'PPI'] },
    risks: ['Whipsaw', 'Niska płynność o poranku'],
    quickQuestions: ['Kiedy core CPI w UK dominuje interpretację?', 'Jak płace wpływają na odbiór CPI UK?'],
    related: ['GBPUSD', 'Gilt10Y'],
    checklist: [{ id: 'ukcpi-consensus', label: 'Konsensus headline/core' }],
    quiz: [],
    glossary: [{ term: 'Gilt', definition: 'Brytyjskie obligacje skarbowe.' }],
  },

  // UK — BoE Decision
  {
    slug: 'boe-decision',
    title: 'BoE Decision (MPC)',
    region: 'UK',
    importance: 'high',
    tags: ['boe', 'stopy', 'komunikacja'],
    updatedAt: nowISO(),
    summaryOneLine: 'Decyzja MPC, minutes i głosowania; ton komunikacji wpływa na GBP i Gilt.',
    sixtySeconds: ['Głosy za/ przeciw istotne', 'Ton minutes/guidance bywa decydujący'],
    preRelease: { t24h: ['Oczekiwania rynku (SONIA)'], t2h: ['Poziomy GBP/Gilt'], t15m: ['Sekwencja: decyzja → minutes → konferencja'] },
    during: ['Decyzja vs konsensus', 'Głosy i minutes', 'Konferencja i ton'],
    scenarios: [
      { id: 'A', title: 'Gołębi ton', details: ['Gilt yields w dół', 'GBP słabszy'], caveats: ['Miękkie tylko przejściowo'] },
      { id: 'B', title: 'Jastrzębi ton', details: ['Gilt yields w górę', 'GBP mocniejszy'], caveats: ['Rynek może dyskontować wcześniej'] },
      { id: 'C', title: 'Neutral', details: ['Niewielka reakcja'], caveats: [] },
    ],
    pitfalls: ['Ignorowanie rozkładu głosów', 'Założenie stałych korelacji'],
    marketMap: { firstReactors: ['Gilt2Y/10Y', 'GBPUSD'], confirmations: [], crossChecks: ['UK CPI', 'Płace'] },
    risks: ['Wieloetapowość reakcji', 'Whipsaw'],
    quickQuestions: ['Jak interpretować rozkład głosów MPC?', 'Kiedy minutes odwracają pierwszy impuls?'],
    related: ['GBPUSD', 'Gilt10Y'],
    checklist: [{ id: 'boe-votes', label: 'Głosy MPC i minutes' }],
    quiz: [],
    glossary: [{ term: 'MPC', definition: 'Monetary Policy Committee (BoE).' }],
  },

  // UK — Labour Market
  {
    slug: 'uk-labour-market',
    title: 'UK Labour Market (wages/unemployment)',
    region: 'UK',
    importance: 'medium',
    tags: ['praca', 'płace', 'boe'],
    updatedAt: nowISO(),
    summaryOneLine: 'Rynek pracy UK i płace wpływają na inflację usług i decyzje BoE.',
    sixtySeconds: ['Płace są kluczowym kanałem', 'GBP i Gilt reagują'],
    preRelease: { t24h: ['Konsensus płac i bezrobocia'], t2h: ['Poziomy na GBP/Gilt'], t15m: ['Sekwencja: płace → bezrobocie → rewizje'] },
    during: ['Płace vs konsensus', 'Bezrobocie', 'Reakcja GBP/Gilt'],
    scenarios: [
      { id: 'A', title: 'Płace powyżej', details: ['Ryzyko inflacyjne', 'Gilt yields w górę'], caveats: ['Inne dane łagodzą'] },
      { id: 'B', title: 'Płace poniżej', details: ['Łagodniejszy obraz'], caveats: [] },
      { id: 'C', title: 'Mieszane', details: ['Reakcja niepewna'], caveats: [] },
    ],
    pitfalls: ['Wnioski z samego bezrobocia', 'Brak analizy płac'],
    marketMap: { firstReactors: ['GBPUSD', 'Gilt'], confirmations: [], crossChecks: ['CPI UK'] },
    risks: ['Whipsaw', 'Niska płynność'],
    quickQuestions: ['Jak płace wpływają na inflację usług?', 'Kiedy bezrobocie zmienia narrację?'],
    related: ['GBPUSD', 'Gilt10Y'],
    checklist: [{ id: 'uklab-consensus', label: 'Konsensus płac/bezrobocie' }],
    quiz: [],
    glossary: [{ term: 'Average Weekly Earnings', definition: 'Miara dynamiki płac w UK.' }],
  },

  // UK — GDP
  {
    slug: 'uk-gdp',
    title: 'UK GDP',
    region: 'UK',
    importance: 'medium',
    tags: ['pkb', 'wzrost'],
    updatedAt: nowISO(),
    summaryOneLine: 'PKB UK: komponenty i trend kształtują odbiór; wpływ na Gilt/GBP umiarkowany.',
    sixtySeconds: ['Komponenty i deflator', 'Reakcja zależna od kontekstu BoE'],
    preRelease: { t24h: ['Konsensus i komponenty'], t2h: ['Poziomy GBP/Gilt'], t15m: ['Sekwencja: headline → komponenty → deflator'] },
    during: ['Nagłówek vs konsensus', 'Komponenty/deflator', 'Reakcja GBP/Gilt'],
    scenarios: [
      { id: 'A', title: 'Silne dane', details: ['Gilt yields w górę', 'GBP mocniejszy'], caveats: ['Deflator łagodzi'] },
      { id: 'B', title: 'Słabe dane', details: ['Gilt yields w dół', 'GBP słabszy'], caveats: [] },
      { id: 'C', title: 'Mieszane', details: ['Reakcja ograniczona'], caveats: [] },
    ],
    pitfalls: ['Wnioski bez komponentów', 'Pominięcie deflatora'],
    marketMap: { firstReactors: ['Gilt10Y'], confirmations: ['GBPUSD'], crossChecks: ['PMI, Retail Sales'] },
    risks: ['Rewizje', 'Umiarkowany wpływ'],
    quickQuestions: ['Jak czytać deflator PKB UK?', 'Które komponenty dominują odbiór PKB?'],
    related: ['GBPUSD', 'Gilt10Y'],
    checklist: [{ id: 'ukgdp-consensus', label: 'Konsensus i deflator' }],
    quiz: [],
    glossary: [{ term: 'GDP deflator', definition: 'Miara zmian cen w gospodarce.' }],
  },
];

export type PlaybookFilter = {
  search?: string;
  regions?: Region[];
  types?: Array<'inflacja' | 'praca' | 'stopy' | 'wzrost' | 'sentyment'>;
  importance?: Importance[];
  sort?: 'top' | 'updated' | 'alpha';
};

export function getPlaybookBySlug(slug: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.slug === slug);
}


