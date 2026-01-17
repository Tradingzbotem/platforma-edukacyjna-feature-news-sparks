// data/lessons/index.ts
// 👉 Centralny rejestr treści lekcji + mini-quizów (używany przez /kursy/[course]/lekcje/[id])

export type LessonAccess = 'public' | 'auth' | 'pro';

export type ContentBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; lang?: string; code: string };

export type LessonQuizQ = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type LessonDoc = {
  id: string;                  // np. 'fx-01'
  title: string;               // tytuł lekcji
  access: LessonAccess;        // public | auth | pro
  duration?: string;           // np. "08:30"
  content: ContentBlock[];     // blokowa treść
  quiz?: {
    title: string;
    questions: LessonQuizQ[];
  };
};

export type CourseLessons = Record<string, LessonDoc>;   // key = lessonId
export type LessonsRegistry = Record<string, CourseLessons>; // key = courseSlug

// -------------------------------------------------------------
// LEKCJE: muszą pokrywać się z ID używanymi w data/courses/index.ts
// (fx-01..04, cfd-01..04, adv-01..04)
// -------------------------------------------------------------
export const LESSONS: LessonsRegistry = {
  forex: {
    'fx-01': {
      id: 'fx-01',
      title: 'Wprowadzenie do rynku FX',
      access: 'auth',
      duration: '08:30',
      content: [
        { type: 'h2', text: 'Co to jest Forex?' },
        { type: 'p', text: 'Rynek walutowy (FX) to zdecentralizowany rynek wymiany walut. Uczestnicy: banki, fundusze, brokerzy, detaliści.' },
        { type: 'list', items: ['Sesje: azjatycka, europejska, amerykańska', 'Główne pary: EURUSD, GBPUSD, USDJPY, USDCHF', 'Mikrostruktura: bid/ask, order book, płynność'] },
        { type: 'quote', text: 'Największa płynność zwykle wypada przy nakładaniu się sesji EU/US.' },
      ],
      quiz: {
        title: 'Sprawdź podstawy FX (3 pytania)',
        questions: [
          { id: 'q1', question: 'Co to jest spread?', options: ['Różnica ask-bid', 'Opłata overnight', 'Rabat prowizyjny', 'Poślizg'], correctIndex: 0 },
          { id: 'q2', question: 'Która para to „major”?', options: ['EURUSD', 'PLNJPY', 'MXNCHF', 'ZARTRY'], correctIndex: 0 },
          { id: 'q3', question: 'Największa płynność zwykle jest podczas…', options: ['Azji', 'Nakładania EU/US', 'Weekendu', 'Świąt'], correctIndex: 1 },
        ],
      },
    },
    'fx-02': {
      id: 'fx-02',
      title: 'Pary walutowe i kwotowania',
      access: 'auth',
      duration: '09:10',
      content: [
        { type: 'h2', text: 'Base / Quote' },
        { type: 'p', text: 'W EURUSD walutą bazową jest EUR, a kwotowaną USD. 1.0845 oznacza ile USD za 1 EUR.' },
        { type: 'h3', text: 'Pip, tick i wartość pipsa' },
        { type: 'list', items: ['EURUSD: 1 pip = 0.0001', 'USDJPY: 1 pip = 0.01', 'Wartość pipsa zależy od wolumenu (lotów) i instrumentu'] },
        { type: 'code', lang: 'txt', code: 'Wartość pipsa ≈ (1 pip / kurs) × nominal × kurs_konta' },
      ],
      quiz: {
        title: 'Pipsy i kwotowania (2 pytania)',
        questions: [
          { id: 'q1', question: 'W EURUSD 1 pip to…', options: ['0.0001', '0.01', '1', '0.1'], correctIndex: 0 },
          { id: 'q2', question: 'Waluta bazowa w EURUSD to…', options: ['USD', 'EUR', 'GBP', 'CHF'], correctIndex: 1 },
        ],
      },
    },
    'fx-03': {
      id: 'fx-03',
      title: 'Dźwignia, margin i ryzyko',
      access: 'auth',
      duration: '11:45',
      content: [
        { type: 'h2', text: 'Dźwignia 1:30' },
        { type: 'p', text: 'Depozyt wymagany ≈ 1/30 ≈ 3.33% nominale. Zarządzanie pozycją jest kluczowe.' },
        { type: 'list', items: ['Ryzykuj stały % kapitału', 'Ustal R:R i trzymaj plan', 'Unikaj overtradingu'] },
      ],
      quiz: {
        title: 'Ryzyko i dźwignia (2 pytania)',
        questions: [
          { id: 'q1', question: '1:30 oznacza depozyt około…', options: ['30%', '3.33%', '0.3%', '13%'], correctIndex: 1 },
          { id: 'q2', question: 'Najlepsza praktyka MM to…', options: ['Stały % ryzyka', 'Brak SL', 'Martingale', 'Losowe wejścia'], correctIndex: 0 },
        ],
      },
    },
    'fx-04': {
      id: 'fx-04',
      title: 'Strategie intraday',
      access: 'auth',
      duration: '12:05',
      content: [
        { type: 'h2', text: 'Wejścia' },
        { type: 'p', text: 'Popularne: wybicia zakresu, pullback po wybiciu, zagrania na newsach (zachowaj ostrożność).' },
        { type: 'quote', text: 'Edge rodzi się z dyscypliny i statystyki – nie z jednego wejścia.' },
      ],
      quiz: {
        title: 'Intraday (2 pytania)',
        questions: [
          { id: 'q1', question: 'Setup „pullback” to…', options: ['Wejście po cofnięciu', 'Wejście na szczycie', 'Losowe wejście', 'Scalping newsów'], correctIndex: 0 },
          { id: 'q2', question: 'Zagrania na newsach…', options: ['Zawsze lepsze', 'Zawsze gorsze', 'Mogą mieć wyższy poślizg i ryzyko', 'Nie wpływają na nic'], correctIndex: 2 },
        ],
      },
    },
  },

  cfd: {
    'cfd-01': {
      id: 'cfd-01',
      title: 'Jak działają CFD?',
      access: 'auth',
      duration: '07:55',
      content: [
        { type: 'p', text: 'CFD to kontrakty na różnicę ceny. Pozwalają grać na wzrosty i spadki bez posiadania aktywa.' },
      ],
      quiz: {
        title: 'CFD basics',
        questions: [
          { id: 'q1', question: 'CFD to…', options: ['Akcja', 'Kontrakt na różnicę', 'Opcja', 'ETF'], correctIndex: 1 },
        ],
      },
    },
    'cfd-02': {
      id: 'cfd-02',
      title: 'Koszty i overnight',
      access: 'auth',
      duration: '06:40',
      content: [
        { type: 'list', items: ['Spread', 'Prowizja', 'Swap/financing (overnight)'] },
      ],
      quiz: {
        title: 'Koszty',
        questions: [
          { id: 'q1', question: 'Swap to…', options: ['Opłata za dane', 'Koszt finansowania pozycji', 'Rabat', 'Spread stały'], correctIndex: 1 },
        ],
      },
    },
    'cfd-03': {
      id: 'cfd-03',
      title: 'Indeksy i surowce',
      access: 'auth',
      duration: '10:20',
      content: [
        { type: 'p', text: 'US100, US500, DE40, XAUUSD, OIL – różna zmienność i godziny handlu.' },
      ],
      quiz: {
        title: 'Rynki',
        questions: [
          { id: 'q1', question: 'US100 to…', options: ['S&P 500', 'Nasdaq-100', 'Dow Jones', 'Russell 2000'], correctIndex: 1 },
        ],
      },
    },
    'cfd-04': {
      id: 'cfd-04',
      title: 'Risk & money management',
      access: 'auth',
      duration: '09:30',
      content: [
        { type: 'p', text: 'Pozycjonowanie, R:R, max. dzienny DD, korelacje – podstawy przetrwania.' },
      ],
    },
  },

  zaawansowane: {
    'adv-01': {
      id: 'adv-01',
      title: 'Edge i testy A/B strategii',
      access: 'auth',
      duration: '12:40',
      content: [
        { type: 'p', text: 'Hipotezy, metryki, overfitting – kontrola wariancji i biasu.' },
      ],
    },
    'adv-02': {
      id: 'adv-02',
      title: 'Backtest i walk-forward',
      access: 'auth',
      duration: '13:05',
      content: [
        { type: 'p', text: 'Walidacja OOS, data leakage, rolling windows.' },
      ],
    },
    'adv-03': {
      id: 'adv-03',
      title: 'Automatyzacja sygnałów',
      access: 'auth',
      duration: '11:15',
      content: [
        { type: 'p', text: 'Alerty, API, routing zleceń i monitoring.' },
      ],
    },
    'adv-04': {
      id: 'adv-04',
      title: 'Psychologia i ryzyko portfela',
      access: 'auth',
      duration: '09:50',
      content: [
        { type: 'p', text: 'Drawdown, korelacje krzyżowe, risk parity i sanity checks.' },
      ],
    },
  },

  regulacje: {
    'reg-01': {
      id: 'reg-01',
      title: 'Podstawy regulacyjne: MiFID II i ESMA',
      access: 'auth',
      duration: '15:00',
      content: [
        { type: 'h2', text: 'Wprowadzenie do regulacji finansowych' },
        { type: 'p', text: 'MiFID II (Markets in Financial Instruments Directive II) to unijna dyrektywa regulująca rynki finansowe, wprowadzona w 2018 roku. ESMA (European Securities and Markets Authority) to organ nadzorczy odpowiedzialny za ochronę inwestorów i stabilność rynków finansowych w UE.' },
        { type: 'h3', text: 'Główne organy regulacyjne' },
        { type: 'list', items: [
          'KNF (Komisja Nadzoru Finansowego) — nadzór nad rynkiem finansowym w Polsce',
          'CySEC (Cyprus Securities and Exchange Commission) — nadzór na Cyprze, popularny dla brokerów CFD',
          'ESMA — europejski organ nadzorczy koordynujący działania krajowych organów',
          'FCA (Financial Conduct Authority) — nadzór w Wielkiej Brytanii'
        ]},
        { type: 'h3', text: 'Kluczowe zasady MiFID II' },
        { type: 'list', items: [
          'Ochrona klienta detalicznego — najwyższy poziom ochrony',
          'Transparentność kosztów — pełne ujawnienie wszystkich opłat',
          'Best execution — najlepsza możliwa realizacja zleceń',
          'Zapobieganie konfliktom interesów',
          'Wymóg testów adekwatności dla złożonych instrumentów'
        ]},
        { type: 'quote', text: 'MiFID II wprowadza rygorystyczne wymogi dotyczące ochrony klientów detalicznych, szczególnie w kontekście instrumentów złożonych jak CFD.' },
      ],
      quiz: {
        title: 'Podstawy regulacyjne (3 pytania)',
        questions: [
          { id: 'q1', question: 'Co oznacza skrót ESMA?', options: ['European Securities and Markets Authority', 'European Stock Market Association', 'European Securities Management Agency', 'European System of Market Analysis'], correctIndex: 0, explanation: 'ESMA to Europejski Urząd Nadzoru Giełd i Papierów Wartościowych, odpowiedzialny za ochronę inwestorów w UE.' },
          { id: 'q2', question: 'Który organ nadzoruje rynek finansowy w Polsce?', options: ['ESMA', 'KNF', 'CySEC', 'FCA'], correctIndex: 1, explanation: 'KNF (Komisja Nadzoru Finansowego) to polski organ nadzorczy.' },
          { id: 'q3', question: 'MiFID II wprowadza szczególną ochronę dla:', options: ['Wszystkich klientów jednakowo', 'Klientów profesjonalnych', 'Klientów detalicznych', 'Tylko instytucji'], correctIndex: 2, explanation: 'MiFID II wprowadza najwyższy poziom ochrony dla klientów detalicznych.' },
        ],
      },
    },
    'reg-02': {
      id: 'reg-02',
      title: 'Testy adekwatności i odpowiedniości',
      access: 'auth',
      duration: '12:30',
      content: [
        { type: 'h2', text: 'Test adekwatności (Appropriateness Test)' },
        { type: 'p', text: 'Test adekwatności sprawdza, czy klient rozumie ryzyka danego produktu i ma odpowiednie doświadczenie. Jest wymagany dla produktów bez doradztwa inwestycyjnego, w tym dla CFD.' },
        { type: 'h3', text: 'Co bada test adekwatności?' },
        { type: 'list', items: [
          'Wiedzę klienta o charakterystyce produktu',
          'Doświadczenie w handlu podobnymi instrumentami',
          'Zrozumienie ryzyk związanych z produktem',
          'Świadomość możliwych strat'
        ]},
        { type: 'h3', text: 'Test odpowiedniości (Suitability Test)' },
        { type: 'p', text: 'Test odpowiedniości jest bardziej szczegółowy i wymagany przy doradztwie inwestycyjnym. Sprawdza nie tylko wiedzę, ale także sytuację finansową klienta i cel inwestycyjny.' },
        { type: 'h3', text: 'Różnice między testami' },
        { type: 'list', items: [
          'Appropriateness — dla produktów bez doradztwa (np. CFD)',
          'Suitability — dla produktów z doradztwem inwestycyjnym',
          'Appropriateness sprawdza głównie wiedzę i doświadczenie',
          'Suitability sprawdza także sytuację finansową i cele'
        ]},
        { type: 'quote', text: 'Broker nie może świadczyć usług bez przeprowadzenia odpowiedniego testu, jeśli produkt wymaga tego zgodnie z regulacjami.' },
      ],
      quiz: {
        title: 'Testy adekwatności (3 pytania)',
        questions: [
          { id: 'q1', question: 'Co bada test adekwatności (appropriateness)?', options: ['Czy klient rozumie ryzyka danego produktu i ma doświadczenie', 'Czy klient posiada odpowiedni kapitał i dochód', 'Czy klient posiada zgodę zarządu', 'Czy firma ma licencję'], correctIndex: 0, explanation: 'Test adekwatności sprawdza wiedzę/doświadczenie klienta co do ryzyk i złożoności produktu.' },
          { id: 'q2', question: 'Który test jest wymagany dla CFD bez doradztwa?', options: ['Suitability', 'Appropriateness', 'Stress test', 'Kategoryzacja'], correctIndex: 1, explanation: 'Dla CFD bez doradztwa wymagany jest test adekwatności (appropriateness).' },
          { id: 'q3', question: 'Test odpowiedniości (suitability) sprawdza:', options: ['Tylko wiedzę', 'Wiedzę, sytuację finansową i cele', 'Tylko doświadczenie', 'Tylko kapitał'], correctIndex: 1, explanation: 'Test odpowiedniości jest bardziej szczegółowy i sprawdza wiedzę, sytuację finansową oraz cele inwestycyjne.' },
        ],
      },
    },
    'reg-03': {
      id: 'reg-03',
      title: 'Best execution i konflikty interesów',
      access: 'auth',
      duration: '11:20',
      content: [
        { type: 'h2', text: 'Best Execution (Najlepsza realizacja)' },
        { type: 'p', text: 'Best execution oznacza podejmowanie wszelkich uzasadnionych działań dla najlepszego wyniku zlecenia klienta, biorąc pod uwagę cenę, koszty, szybkość, prawdopodobieństwo realizacji i inne istotne czynniki.' },
        { type: 'h3', text: 'Elementy best execution' },
        { type: 'list', items: [
          'Cena — najlepsza dostępna cena',
          'Koszty — minimalizacja kosztów transakcyjnych',
          'Szybkość — szybka realizacja zlecenia',
          'Prawdopodobieństwo realizacji — szansa na wykonanie zlecenia',
          'Rozmiar i charakter zlecenia'
        ]},
        { type: 'h3', text: 'Konflikty interesów' },
        { type: 'p', text: 'Konflikt interesów powstaje, gdy interesy firmy lub pośrednika mogą kolidować z interesem klienta. Broker musi identyfikować, zarządzać i ujawniać konflikty interesów.' },
        { type: 'h3', text: 'Przykłady konfliktów interesów' },
        { type: 'list', items: [
          'Broker zarabia na spreadzie — może mieć interes w częstych transakcjach',
          'Prowizje od partnerów IB — mogą wpływać na rekomendacje',
          'Własny trading desk — może konkurować z klientami',
          'Reklamy płatne — mogą wpływać na obiektywność'
        ]},
        { type: 'quote', text: 'Broker musi mieć politykę konfliktów interesów i ujawniać klientom potencjalne konflikty przed zawarciem transakcji.' },
      ],
      quiz: {
        title: 'Best execution i konflikty (3 pytania)',
        questions: [
          { id: 'q1', question: '„Best execution" dotyczy przede wszystkim:', options: ['Polityki marketingowej', 'Najlepszej możliwej realizacji zleceń (cena, szybkość, koszty, prawdop.)', 'Wysokości depozytu zabezpieczającego', 'Tylko instrumentów akcyjnych'], correctIndex: 1, explanation: 'Best execution oznacza podejmowanie wszelkich uzasadnionych działań dla najlepszego wyniku zlecenia.' },
          { id: 'q2', question: 'Kiedy powstaje konflikt interesów?', options: ['Zawsze przy każdej transakcji', 'Gdy interes firmy/pośrednika może kolidować z interesem klienta', 'Wyłącznie w kampaniach reklamowych', 'Tylko w produktach skomplikowanych'], correctIndex: 1, explanation: 'Konflikt interesów powstaje, gdy interesy firmy mogą wpływać negatywnie na interesy klienta.' },
          { id: 'q3', question: 'Co NIE jest elementem best execution?', options: ['Cena', 'Szybkość', 'Prawdopodobieństwo realizacji', 'Kolor interfejsu platformy'], correctIndex: 3, explanation: 'Best execution bierze pod uwagę cenę, koszty, szybkość i prawdopodobieństwo realizacji, ale nie wygląd interfejsu.' },
        ],
      },
    },
    'reg-04': {
      id: 'reg-04',
      title: 'Ochrona klienta: limity dźwigni i negative balance',
      access: 'auth',
      duration: '10:15',
      content: [
        { type: 'h2', text: 'Limity dźwigni ESMA dla klientów detalicznych' },
        { type: 'p', text: 'ESMA wprowadziła limity dźwigni dla różnych kategorii instrumentów w celu ochrony klientów detalicznych przed nadmiernym ryzykiem.' },
        { type: 'h3', text: 'Limity dźwigni ESMA' },
        { type: 'list', items: [
          'FX majors (EURUSD, GBPUSD, USDJPY) — 1:30',
          'Złoto i duże indeksy (US100, US500) — 1:20',
          'Inne towary i indeksy — 1:10',
          'Akcje — 1:5',
          'Kryptowaluty — 1:2'
        ]},
        { type: 'h3', text: 'Margin close-out' },
        { type: 'p', text: 'Zgodnie z regulacjami ESMA, broker musi zamknąć pozycje klienta detalicznego, gdy equity spadnie do 50% wymaganego depozytu zabezpieczającego (margin).' },
        { type: 'h3', text: 'Negative Balance Protection' },
        { type: 'p', text: 'Negative balance protection oznacza, że rachunek klienta nie może zejść poniżej zera — klient nie może stracić więcej niż wpłacony depozyt. To obowiązkowa ochrona dla klientów detalicznych w UE.' },
        { type: 'h3', text: 'Opt-up (zmiana kategorii klienta)' },
        { type: 'p', text: 'Klient detaliczny może poprosić o zmianę kategorii na profesjonalną (opt-up), co oznacza rezygnację z niektórych ochron regulacyjnych, w tym limitów dźwigni. Proces wymaga spełnienia określonych kryteriów.' },
        { type: 'quote', text: 'Limity dźwigni ESMA mają na celu ochronę klientów detalicznych przed nadmiernym ryzykiem, ale klient może zrezygnować z tej ochrony poprzez opt-up.' },
      ],
      quiz: {
        title: 'Ochrona klienta (3 pytania)',
        questions: [
          { id: 'q1', question: 'Limity dźwigni ESMA dla detalicznych: FX majors…', options: ['1:50', '1:30', '1:10', 'Brak limitów'], correctIndex: 1, explanation: 'FX majors mają limit 1:30; złoto/duże indeksy 1:20; inne towary/indeksy 1:10; akcje 1:5; krypto 1:2.' },
          { id: 'q2', question: 'Margin close-out wg ESMA dla CFD detalicznych:', options: ['Gdy margin spadnie do 25%', 'Gdy equity spadnie do 50% wymaganego depozytu', 'Na żądanie klienta', 'Zawsze przy 0%'], correctIndex: 1, explanation: 'Reguła zamknięcia przy 50% depozytu na poziomie portfela (co najmniej).' },
          { id: 'q3', question: 'Negative balance protection oznacza:', options: ['Brak swapów', 'Brak strat > depozyt', 'Gwarancję zysku', 'Zerowe koszty'], correctIndex: 1, explanation: 'Negative balance protection oznacza, że rachunek nie może zejść poniżej zera — klient nie może stracić więcej niż wpłacony depozyt.' },
        ],
      },
    },
    'reg-05': {
      id: 'reg-05',
      title: 'Marketing i compliance: KID/KIID, materiały promocyjne',
      access: 'auth',
      duration: '13:45',
      content: [
        { type: 'h2', text: 'Zasada "fair, clear, not misleading"' },
        { type: 'p', text: 'Wszystkie materiały marketingowe muszą być sprawiedliwe, jasne i nie wprowadzające w błąd. Nie mogą obiecywać gwarantowanych zysków ani ukrywać ryzyk.' },
        { type: 'h3', text: 'KID/KIID (Key Information Document)' },
        { type: 'p', text: 'KID (Key Information Document) to dokument zawierający kluczowe informacje o produkcie, ryzykach i kosztach. Musi być dostarczony klientowi przed zawarciem transakcji.' },
        { type: 'list', items: [
          'Opis produktu i jego charakterystyki',
          'Ryzyka związane z produktem',
          'Wszystkie koszty i opłaty',
          'Przykładowe scenariusze zysków i strat',
          'Informacje o gwarancjach i ochronie'
        ]},
        { type: 'h3', text: 'Zakazane praktyki marketingowe' },
        { type: 'list', items: [
          'Obiecywanie gwarantowanych zysków',
          'Ukrywanie ryzyk i kosztów',
          'Prezentowanie tylko korzystnych wyników',
          'Używanie agresywnych technik sprzedażowych',
          'Brak ostrzeżeń o ryzyku'
        ]},
        { type: 'h3', text: 'Wymagane ostrzeżenia' },
        { type: 'p', text: 'Materiały promocyjne CFD muszą zawierać ostrzeżenie o ryzyku, np.: "X% kont detalicznych traci pieniądze przy handlu CFD z tym dostawcą".' },
        { type: 'quote', text: 'Materiały promocyjne nie mogą wprowadzać w błąd ani obiecywać gwarantowanych zysków. Muszą być zrównoważone i zawierać odpowiednie ostrzeżenia.' },
      ],
      quiz: {
        title: 'Marketing i compliance (3 pytania)',
        questions: [
          { id: 'q1', question: 'Który materiał promocyjny narusza zasadę "fair, clear, not misleading"?', options: ['Zawiera ostrzeżenie o ryzyku i historyczne wyniki z zastrzeżeniami', 'Obiecuje gwarantowany zysk bez ryzyka', 'Wyjaśnia koszty i przykład R:R', 'Odsyła do dokumentów KID/KIID'], correctIndex: 1, explanation: 'Materiały promocyjne nie mogą obiecywać gwarantowanych zysków ani wprowadzać w błąd.' },
          { id: 'q2', question: 'Który dokument zawiera kluczowe info o produkcie, ryzykach i kosztach?', options: ['KID/KIID', 'FATCA', 'LEI', 'MAR'], correctIndex: 0, explanation: 'KID/KIID to dokument zawierający kluczowe informacje o produkcie, ryzykach i kosztach.' },
          { id: 'q3', question: 'Kto zatwierdza materiały marketingowe?', options: ['Dział sprzedaży', 'Compliance', 'Dowolny pracownik', 'Partner IB'], correctIndex: 1, explanation: 'Materiały marketingowe muszą być zatwierdzone przez dział compliance przed publikacją.' },
        ],
      },
    },
    'reg-06': {
      id: 'reg-06',
      title: 'Kategoryzacja klientów i opt-up',
      access: 'auth',
      duration: '09:30',
      content: [
        { type: 'h2', text: 'Kategorie klientów' },
        { type: 'p', text: 'MiFID II wprowadza trzy kategorie klientów, z różnym poziomem ochrony regulacyjnej.' },
        { type: 'h3', text: 'Kategorie klientów' },
        { type: 'list', items: [
          'Klient detaliczny (retail) — najwyższa ochrona, limity dźwigni, negative balance protection',
          'Klient profesjonalny (professional) — niższa ochrona, wyższe limity dźwigni',
          'Uprawniony kontrahent (eligible counterparty) — minimalna ochrona, najwyższe limity'
        ]},
        { type: 'h3', text: 'Opt-up (zmiana kategorii)' },
        { type: 'p', text: 'Klient detaliczny może poprosić o zmianę kategorii na profesjonalną (opt-up), co oznacza rezygnację z niektórych ochron regulacyjnych.' },
        { type: 'h3', text: 'Kryteria opt-up na profesjonalnego' },
        { type: 'list', items: [
          'Wartość portfela > 500 000 EUR',
          'LUB doświadczenie w sektorze finansowym',
          'LUB wielkość transakcji wskazująca na profesjonalizm',
          'Klient musi wyrazić świadomą zgodę i zrozumieć konsekwencje'
        ]},
        { type: 'h3', text: 'Konsekwencje opt-up' },
        { type: 'list', items: [
          'Rezygnacja z limitów dźwigni ESMA',
          'Rezygnacja z negative balance protection',
          'Mniej szczegółowe informacje o kosztach',
          'Możliwość wyższych dźwigni i większego ryzyka'
        ]},
        { type: 'quote', text: 'Opt-up jest procesem jednokierunkowym — klient może przejść z detalicznego na profesjonalnego, ale nie odwrotnie (z wyjątkiem szczególnych przypadków).' },
      ],
      quiz: {
        title: 'Kategoryzacja klientów (3 pytania)',
        questions: [
          { id: 'q1', question: 'Która kategoria klienta ma najwyższą ochronę regulacyjną?', options: ['Uprawniony kontrahent', 'Profesjonalny', 'Detaliczny', 'Wszyscy taką samą'], correctIndex: 2, explanation: 'Klient detaliczny ma najwyższą ochronę regulacyjną, w tym limity dźwigni i negative balance protection.' },
          { id: 'q2', question: 'Opt-up pozwala klientowi detalicznego:', options: ['Zwiększyć ochronę', 'Zmienić kategorię na profesjonalną', 'Zmniejszyć koszty', 'Uniknąć testów'], correctIndex: 1, explanation: 'Opt-up pozwala klientowi detalicznego zmienić kategorię na profesjonalną, rezygnując z niektórych ochron.' },
          { id: 'q3', question: 'Kryterium opt-up na profesjonalnego to m.in.:', options: ['Wartość portfela > 500 000 EUR', 'Wartość portfela > 50 000 EUR', 'Dowolna wartość', 'Brak kryteriów'], correctIndex: 0, explanation: 'Jednym z kryteriów opt-up jest wartość portfela przekraczająca 500 000 EUR.' },
        ],
      },
    },
  },
} as const;

// (opcjonalnie) ułatwienie importu domyślnego
export default LESSONS;
