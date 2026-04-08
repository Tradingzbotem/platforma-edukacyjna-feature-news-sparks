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
        { type: 'h2', text: 'Idea kontraktu na różnicę' },
        { type: 'p', text: 'CFD (Contract for Difference) to umowa między Tobą a dostawcą: rozliczacie się różnicą ceny między otwarciem a zamknięciem pozycji. Nie kupujesz fizycznie akcji, baryłki ropy ani uncji złota — obstawiasz kierunek ruchu ceny instrumentu bazowego według reguł danego kontraktu.' },
        { type: 'h3', text: 'Long i short bez „posiadania” aktywa' },
        { type: 'p', text: 'Pozycja długa (long) zarabia, gdy cena rośnie; pozycja krótka (short) zarabia, gdy cena spada. To ta sama logika co na wielu innych rynkach pochodnych — różnica jest w tym, że przy typowym CFD cash nie ma daty wygaśnięcia jak u klasycznego futures (u dostawcy mogą obowiązywać inne zasady rollover — warto czytać specyfikację instrumentu).' },
        { type: 'list', items: ['Kontrakt odzwierciedla zachowanie ceny bazowej (z drobnymi różnicami specyfikacji u brokerów).', 'Zysk lub strata to różnica cen × rozmiar pozycji, minus koszty (np. spread, ewentualna prowizja, overnight).', 'Ryzyko jest dwustronne: możesz stracić cały zainwestowany depozyt i więcej, jeśli brakuje ochrony przed ujemnym saldem — zależnie od regulacji i typu konta.'] },
        { type: 'h3', text: 'Margin i kontrahent' },
        { type: 'p', text: 'Żeby otworzyć pozycję, blokujesz depozyt zabezpieczający (margin) — ułamek ekspozycji wynikający z dźwigni i wymogów dostawcy. To nie jest „opłata kupna”, tylko zabezpieczenie na rachunku.' },
        { type: 'p', text: 'Transakcja CFD odbywa się z brokerem lub innym pośrednikiem (model market maker / hedging — zależnie od firmy). Dlatego ważne są regulacja, zasady realizacji zleceń i transparentność kosztów, a nie tylko sama mechanika kliknięcia „buy/sell”.' },
        { type: 'quote', text: 'CFD to narzędzie ekspozycji na cenę, a nie skrót do „pewnego” kierunku rynku — najpierw rozumiesz mechanikę i koszty, potem budujesz plan ryzyka.' },
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
        { type: 'h2', text: 'Skąd bierze się koszt transakcji' },
        { type: 'p', text: 'Każda pozycja CFD ma koszt wejścia i wyjścia oraz — jeśli trzymasz ją przez zmianę dnia sesji — koszt utrzymania (overnight). Żeby ocenić, czy dany setup ma sens, patrzysz na sumę tych elementów, a nie tylko na sam kurs na wykresie.' },
        { type: 'h3', text: 'Spread' },
        { type: 'p', text: 'Spread to różnica między ceną kupna (ask) a sprzedaży (bid). Wchodząc po ask i wychodząc po bid, od razu „płacisz” około jednego spreadu w każdą stronę — im węższy spread przy tej samej jakości realizacji, tym mniejszy podatek od samego wejścia.' },
        { type: 'list', items: ['Spread bywa stały lub zmiennym — w nocy i przy newsach często się poszerza.', 'Na mniejszym timeframe duży spread w procentach ruchu może zjeść większość potencjalnego ruchu.', 'Zawsze sprawdzaj specyfikację instrumentu u swojego dostawcy (nie ma jednej uniwersalnej tabeli dla wszystkich tickerów).'] },
        { type: 'h3', text: 'Prowizja' },
        { type: 'p', text: 'Na części instrumentów (np. niektóre CFD na akcje) broker dolicza prowizję obok spreadu albo zamiast „gołego” spreadu. W praktyce porównujesz całkowity koszt otwarcia i zamknięcia, a nie pojedynczą pozycję w cenniku.' },
        { type: 'h3', text: 'Overnight: swap / financing' },
        { type: 'p', text: 'Utrzymanie pozycji przez noc (czasem przez ustalony „cut-off” dnia) generuje koszt lub wyjątkowo dodatnie saldo financingowe — zależnie od instrumentu, kierunku pozycji i różnic stóp. To nie jest „kara”, tylko odzwierciedlenie kosztu finansowania ekspozycji po stronie dostawcy.' },
        { type: 'list', items: ['Długie pozycje na indeksach lub FX często mają ujemną lub dodatnią dzienną stawkę — zależy od specyfikacji.', 'Weekend może być rozliczany jako kilka dni naraz — sprawdź zasady w dokumentacji.', 'Scalping z wieloma transakcjami dziennie: spread i ewentualna prowizja robią większą rolę niż swap; swing: odwrotnie.'] },
        { type: 'quote', text: 'Ten sam ruch ceny może być zyskowny albo stratny po kosztach — dlatego koszt transakcji jest częścią planu, nie „dodatkiem w regulaminie”.' },
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
        { type: 'h2', text: 'Dlaczego indeks i ropa nie zachowują się tak samo' },
        { type: 'p', text: 'W jednym miejscu platformy widzisz tickery typu US500, US100, DE40, XAUUSD czy ropa — każdy z nich ma inną sesję, inną typową zmienność i inne zdarzenia, które napędzają ceny. Lekcja nie wybiera „najlepszego” instrumentu; chodzi o to, żebyś nie mylił nazwy z ryzykiem.' },
        { type: 'h3', text: 'Indeksy (CFD na benchmark)' },
        { type: 'p', text: 'Kontrakty na indeks odzwierciedlają zachowanie koszyka lub metodyki benchmarku (np. S&P 500, Nasdaq-100, DAX). Na platformie nazwy bywają skrócone — ważne jest, co dokładnie stoi pod tickermem w specyfikacji (np. cash vs kontrakt z terminem u niektórych dostawców).' },
        { type: 'list', items: ['US500 — szeroki rynek USA (często utożsamiany z S&P 500).', 'US100 — segment growth / tech w USA (popularnie łączony z Nasdaq-100).', 'DE40 — duży niemiecki benchmark (często DAX).', 'Godziny handlu podążają za sesją bazową + ewentualnymi rozszerzeniami u brokera — sprawdź harmonogram przed planowaniem wejścia.'] },
        { type: 'h3', text: 'Surowce: złoto, ropa i inne' },
        { type: 'p', text: 'Złoto (np. XAUUSD) i ropa reagują na inne czynniki niż typowy indeks akcji: dolara, stóp, geopolityki, zapasów, popytu przemysłowego. To oznacza inną „krzywą” zmienności i czasem inne zachowanie spreadu w nocy lub w weekend (u instrumentów z luką).' },
        { type: 'h3', text: 'Zmienność i płynność w praktyce' },
        { type: 'p', text: 'Wyższa zmienność nie jest „lepsza” ani „gorsza” — jest inna. Przy tej samej wielkości pozycji szersze świeczki oznaczają szybsze ruchy na equity i często szerszy spread lub poślizg przy zleceniach rynkowych.' },
        { type: 'list', items: ['Przed ważnymi danymi makro spready na indeksach i FX potrafią wyraźnie rosnąć.', 'Luka otwarcia po weekendzie dotyczy instrumentów z przerwą w notowaniach — indeksy i surowce bywają podatne na „skoki” otwarcia.', 'Korelacja między instrumentami nie jest stała — w kryzysach zbiegają się, w spokojnych fazach rozchodzą.'] },
        { type: 'quote', text: 'Ticker to skrót — pełny obraz to specyfikacja kontraktu, sesja i typowa zmienność, a nie sama nazwa na liście obserwowanych.' },
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
        { type: 'h2', text: 'Plan ryzyka przed pierwszym kliknięciem' },
        { type: 'p', text: 'Money management w CFD to nie wybór „magicznej” dźwigni, tylko spójne reguły: ile ryzykujesz na trade, gdzie kończy się scenariusz błędu i jak nie łączysz przypadkowo podwójnej ekspozycji na ten sam czynnik. Poniżej — szkielet myślenia, który możesz dostosować do własnej tolerancji ryzyka i regulaminu konta.' },
        { type: 'h3', text: 'Ryzyko na transakcję i wielkość pozycji' },
        { type: 'p', text: 'Wielu traderów ustala z góry maksymalną stratę na jedną transakcję jako procent kapitału (np. ułamek procentu do niewielkich jednostek procentowych — zależnie od stylu). Z tego progu i odległości do logicznego miejsca wyjścia (np. poziom techniczny, który unieważnia tezę) wynika dopuszczalny rozmiar pozycji — nie odwrotnie.' },
        { type: 'list', items: ['Ten sam tick value przy większej liczbie kontraktów/lotów mnoży zarówno zysk, jak i stratę.', 'Zmiana dźwigni bez zmiany rozmiaru pozycji nie „zmniejsza ryzyka” — zmienia tylko depozyt zablokowany na pozycji.', 'Margin call i automatyczne zamknięcia zależą od equity i reguł brokera — trzymaj zapas pod zmienność, nie tylko pod minimalny margin.'] },
        { type: 'h3', text: 'Stosunek zysku do ryzyka (R:R)' },
        { type: 'p', text: 'R:R opisuje relację potencjalnego zysku do akceptowanej straty w danym setupie. Sam w sobie nie gwarantuje zyskowności — jeśli strategia nie ma przewagi statystycznej, żaden stosunek nie uratuje wyniku. Sensowne jest natomiast świadome ustalanie, gdzie kończy się błąd i gdzie realizujesz zysk według planu, zamiast improwizacji w trakcie ruchu.' },
        { type: 'h3', text: 'Limit dzienny, seria strat i korelacje' },
        { type: 'p', text: 'Limit dziennej straty (daily stop) wyłącza handel po osiągnięciu ustalonego drawdownu — chroni przed „nadganianiem” rynku w złym stanie psychicznym. Osobno warto patrzeć na skorelowane pozycje: np. kilka CFD na podobne indeksy lub ten sam czynnik walutowy to często jedna duża ekspozycja, a nie trzy „małe”.' },
        { type: 'list', items: ['Po kilku stratach z rzędu warto sprawdzić, czy warunki rynku się zmieniły — nie tylko „dokładać” kolejny lot.', 'Portfel long na silnie skorelowanych instrumentach zachowuje się jak jedna duża pozycja pod względem ryzyka.', 'Dziennik zleceń (nawet krótki) ułatwia dostrzec powtarzające się błędy rozmiaru lub ignorowanie stopu.'] },
        { type: 'code', lang: 'txt', code: 'Ryzyko na trade ≈ (odległość do wyjścia × wartość pozycji na jednostkę ruchu)\nSzukasz rozmiaru pozycji przy stałym procencie ryzyka od equity — nie „dopasowujesz” stopu tylko po to, by wcisnąć większy lot.' },
        { type: 'quote', text: 'Brak reguł rozmiaru i dziennego limitu straty to najczęstszy powód, dla którego krótkoterminowe błędy zamieniają się w długoterminowy problem na koncie.' },
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
        { type: 'h2', text: 'Dwie krzywe — jedna wygląda lepiej. Czy na pewno wiesz, co z tego wynika?' },
        { type: 'p', text: 'Kończysz serię testów: wariant A i wariant B. Jeden ma gładszą linię equity, drugi więcej „dziur” w kalendarzu. Musisz wybrać, co dalej rozwijasz — a czasu na kolejne tygodnie bezkresnej optymalizacji nie ma.' },
        { type: 'p', text: 'Pytanie nie brzmi: „który wariant jest gwarantowanym zwycięzcą na rynku”. Brzmi: czy to, co widzisz, wynika z różnicy reguł, a nie z przypadku, pominiętego kosztu albo z podpatrzenia danych walidacyjnych. Reszta lekcji to procedura, żeby tego nie pomylić.' },
        { type: 'h3', text: 'Gdzie ludzie się mylą' },
        { type: 'list', items: [
          'Zmieniają naraz kilka rzeczy (wejście, wyjście, filtr, godziny) i potem nie wiedzą, co ewentualnie zadziałało.',
          'Patrzą głównie na sumę lub szczyt krzywej, zamiast na rozkład wyników, drawdown i koszt realizacji.',
          'Podglądają fragment danych zarezerwowany na „jutro” i nieświadomie dopasowują do niego reguły.',
          'Traktują jeden udany okres jak dowód, zamiast sprawdzić, czy wynik nie rozsypie się po lekkim pesymizmie założeń.',
          'Backtest staje się prezentacją „dla siebie”, a nie audytem: wtedy łatwo uwierzyć we własną narrację.',
        ] },
        { type: 'h3', text: 'Rama decyzyjna: zanim powiesz „to działa”' },
        { type: 'p', text: 'Trzymaj się kolejności. Skróty kończą się tym, że budujesz na piasku.' },
        { type: 'list', items: [
          'Zapisz w jednym zdaniu hipotezę: co konkretnie ma być lepsze w wariancie B względem A (najlepiej jedna świadoma zmiana).',
          'Odtwórz decyzje bez wglądu w przyszłość; włącz koszty wejścia, wyjścia i realizacji w sposób konserwatywny, nie „idealny”.',
          'Ustal proste odniesienie: ten sam styl częstotliwości decyzji, inna reguła lub najprostszy baseline z tej samej rodziny setupów.',
          'Jeśli B wygląda lepiej: usuń najlepszy fragment próby czasowej albo podbij koszt transakcji o 15–25% — czy różnica w ogóle zostaje?',
          'Zapisz wersję: data, numer eksperymentu, co zmieniłeś. Bez tego wracasz do magii i „tego wczorajszego pliku”.',
        ] },
        { type: 'code', lang: 'txt', code: 'Test A/B w jednym zdaniu:\n„Zmieniam tylko X; reszta identyczna; wynik porównuję do baseline Y\ni do wersji sprzed zmiany, z tym samym kosztem realizacji.”' },
        { type: 'h3', text: 'Mini-case: jedna „drobna” zmiana' },
        { type: 'p', text: 'Wariant X ma wyższy wynik w próbie treningowej niż Y. Różnica: ciaśniejszy poziom wyjścia ze straty — technicznie „jedna śrubka”. Po uwzględnieniu typowego poślizgu przy zamykaniu X traci większość przewagi; Y zmienia się niewiele.' },
        { type: 'p', text: 'Masz wybrać, który wariant rozwijasz dalej. Bez „jeszcze sprawdzę na weekendzie” — decyzja teraz. X czy Y? Jedno zdanie: dlaczego?' },
        { type: 'p', text: 'Podejrzane: wybierasz X tylko dlatego, że krzywa wygląda lepiej przed stresem kosztem i wycięciem najlepszego tygodnia, albo bo „to tylko śrubka”. OK: wybierasz Y (albo X), bo po szczuciu założeń ten wariant nadal ma sens, a drugi rozsypuje się na tym samym teście — i potrafisz to wypowiedzieć w jednym zdaniu bez tłumaczenia się.' },
        { type: 'h3', text: 'Teoria w pigułce: WR, AvgWin, AvgLoss i EV' },
        { type: 'p', text: 'WR (win rate): jaki odsetek transakcji kończy się tak, jak zakładasz w zyskownym scenariuszu. AvgWin i AvgLoss: średni rozmiar wygranej vs średni rozmiar straty — najczytelniej w jednostkach ryzyka R, żeby porównywać strategie o różnym skalowaniu.' },
        { type: 'p', text: 'EV (expectancy) to w dużym uproszczeniu bilans: częstość × typowa wygrana vs częstość × typowa strata — jedna liczba mówiąca, czy średnio po wielu decyzjach reguły dodają czy odejmują, zanim zaczniesz oceniać „jakość pojedynczego wejścia”. To narzędzie opisu, nie instrukcja, co robić jutro na rynku.' },
        { type: 'h3', text: 'Checklista: zanim uznasz, że coś działa' },
        { type: 'list', items: [
          'Czy zmieniam najwyżej jedną rzecz między wariantami albo mam jasny powód, żeby zrobić wyjątek?',
          'Czy hipotezę zapisałem zanim patrzyłem na wynik na danych zarezerwowanych do walidacji?',
          'Czy wynik przetrwa podbicie kosztu transakcji lub usunięcie najlepszego fragmentu próby?',
          'Czy widzę rozkład wyników i DD, a nie tylko sumę albo szczyt equity?',
          'Czy potrafię wskazać jeden element wyniku, który najbardziej napędza „sukces” — i sprawdzić, czy to nie jednorazowy strzał?',
          'Czy następny krok to osobny, ponumerowany eksperyment, a nie dokręcanie „z pamięci”?',
          'Czy w jednym zdaniu umiem powiedzieć, co musiałoby się stać, żebym ten wariant odrzucił zamiast go bronić?',
        ] },
        { type: 'quote', text: 'Jeśli nie potrafisz odrzucić własnego wariantu, nigdy go naprawdę nie testowałeś — tylko szukałeś powodu, żeby mu zaufać.' },
      ],
    },
    'adv-02': {
      id: 'adv-02',
      title: 'Backtest i walk-forward',
      access: 'auth',
      duration: '13:05',
      content: [
        { type: 'h2', text: 'Backtest jako laboratorium — pod warunkiem uczciwych zasad' },
        { type: 'p', text: 'Backtest odtwarza decyzje na historii. Jego wartość zależy od tego, czy symulacja oddaje ograniczenia realnego handlu: kolejność świec, brak wglądu w przyszłość, koszty, brak wypełnień po nierealnych cenach. Bez tego nawet poprawna matematyka daje fałszywy komfort.' },
        { type: 'p', text: 'Walk-forward to sposób, by zbliżyć się do pytania „czy to nadal działa, gdy nie znam przyszłości”: uczysz lub kalibrujesz na jednym oknie, testujesz na następnym, przesuwasz czas — i patrzysz na stabilność zachowania, nie na jeden agregat.' },
        { type: 'h3', text: 'In-sample vs out-of-sample (OOS)' },
        { type: 'p', text: 'In-sample to dane, na których dobierałeś reguły lub parametry. OOS to dane trzymane z dala od tego procesu — jedyna część, która symuluje „jutro”. Jeśli optymalizujesz na całej historii i potem chwalisz się wynikiem na tej samej historii, OOS w praktyce nie istnieje.' },
        { type: 'list', items: [
          'Zarezerwuj OOS zanim zobaczysz wyniki na IS — inaczej łatwo nieświadomie „dostroić” się pod ukryty fragment próby.',
          'OOS powinien obejmować różne reżimy rynku (spokój, trend, podwyższona zmienność), jeśli to możliwe.',
          'Jeden długi OOS jest lepszy niż seria mikroskopijnych okien, z których każde jest podatne na przypadek.',
        ] },
        { type: 'h3', text: 'Walk-forward i okna przesuwne' },
        { type: 'p', text: 'Typowy schemat: okno treningowe (np. kalibracja prostych progów lub wyboru wariantu), potem krótsze okno testowe wyłącznie do oceny; następnie przesunięcie całości w czasie. Powtarzasz cykl, zbierając serię wyników OOS. Szukasz spójności, nie perfekcji w każdym segmencie.' },
        { type: 'code', lang: 'txt', code: 'Uproszczony schemat myślowy:\n[====IS opt====][==OOS test==] → przesuwasz →\n    [====IS opt====][==OOS test==] → …\nŁączysz wyniki z segmentów OOS, nie średnią z IS.' },
        { type: 'h3', text: 'Data leakage: cichy zabójca wiarygodności' },
        { type: 'p', text: 'Wyciek danych to sytuacja, w której model lub reguła „widzą” informację z przyszłości: błędna synchronizacja serii, uśrednianie z całego okresu, normalizacja na max/min z całej próby, przeciekające dane fundamentalne. Objaw to często „zbyt dobry” backtest i gwałtowne rozczarowanie na żywo.' },
        { type: 'list', items: [
          'Sprawdzasz każdą zewnętrzną serię: czy punkt danych był dostępny w momencie decyzji?',
          'Unikasz globalnych statystyk liczonych na całej historii przy symulacji krok po kroku.',
          'Zwracasz uwagę na brakujące świece, sesje i zmiany specyfikacji instrumentu — to nie kosmetyka, to integralność próby.',
        ] },
        { type: 'quote', text: 'Dobry backtest jest nudny: jasne założenia, powtarzalny kod, jawne koszty. Zły backtest jest ekscytujący i kruchy.' },
      ],
    },
    'adv-03': {
      id: 'adv-03',
      title: 'Automatyzacja sygnałów',
      access: 'auth',
      duration: '11:15',
      content: [
        { type: 'h2', text: 'Od reguły w głowie do powtarzalnego procesu' },
        { type: 'p', text: 'Automatyzacja w tradingu oznacza tu: spójne wykrywanie warunków z Twojego planu, powiadomienia, ewentualnie połączenie z platformą — bez improwizacji i bez „puszczania oczka” do wykresu. Chodzi o system, który działa tak samo o 8:00 i o 15:30, gdy zmęczenie rośnie.' },
        { type: 'p', text: 'Nie chodzi o sprzedaż gotowych „sygnałów” ani o obietnicę zysków. Chodzi o narzędzia: alerty, skrypty, logi i monitoring, które utrzymują dyscyplinę procesu, który sam zdefiniowałeś.' },
        { type: 'h3', text: 'Alerty i warstwa decyzyjna' },
        { type: 'p', text: 'Alert to nie decyzja — to przypomnienie, że spełniły się warunki techniczne lub czasowe z Twojego szkieletu. Zostawiasz sobie miejsce na ostatni filtr ludzki (np. kontekst sesji), jeśli tak zaprojektowałeś proces — ale unikasz sytuacji, w której „coś mignęło” i nie ma śladu po kryteriach.' },
        { type: 'list', items: [
          'Jeden alert = jedno jasno opisane zdarzenie (np. przebicie poziomu po zamknięciu świecy M15, a nie „obserwuj parę”).',
          'Treść alertu wskazuje następny krok z planu (checklista), nie emocjonalny komunikat.',
          'Archiwum zdarzeń (nawet proste) pozwala później porównać rzeczywistość z założeniami backtestu.',
        ] },
        { type: 'h3', text: 'API, zlecenia i odpowiedzialność operacyjna' },
        { type: 'p', text: 'Połączenie z API brokera lub platformą to kolejny poziom złożoności: opóźnienia, ponowienia zleceń, błędy sieci, różnice między środowiskiem paper a real. Zanim zautomatyzujesz wykonanie, warto zautomatyzować rejestrowanie intencji i wyniku — tam często jest największy zwrot z inwestycji w kod.' },
        { type: 'code', lang: 'txt', code: 'Minimalny „kontrakt” automatyzacji:\n• Wejście: jakie dane muszą być świeże?\n• Logika: jednoznaczny pseudokod bez „jeśli czuję”.\n• Wyjście: zapis czasu, ceny, parametru i wyniku.\n• Awaria: co się dzieje przy braku danych lub błędzie API?' },
        { type: 'h3', text: 'Monitoring, wersjonowanie i pauza' },
        { type: 'p', text: 'System bez monitoringu żyje własnym życiem: przestaje działać broker, zmienia się tick size, a Ty dowiadujesz się po fakcie. Wersjonujesz reguły tak jak kod. Ustalasz z góry warunki pauzy (np. seria błędów, zmiana zmienności), żeby automat nie stał się automatycznym eskalatorem ryzyka.' },
        { type: 'quote', text: 'Automatyzacja nie zastępuje edge’u — przenosi go z głowy na szyny, gdzie widać każdy wyślizg.' },
      ],
    },
    'adv-04': {
      id: 'adv-04',
      title: 'Psychologia i ryzyko portfela',
      access: 'auth',
      duration: '09:50',
      content: [
        { type: 'h2', text: 'Portfel to nie suma tickerów, tylko mapa ryzyka' },
        { type: 'p', text: 'Zaawansowany uczestnik rynku patrzy nie tylko na pojedynczą pozycję, ale na to, jak wiele pozycji reaguje na ten sam czynnik: dolar, stopy, strach na rynku akcji, surowce. Psychologia wchodzi wtedy w grę podwójnie: przy drawdownie portfela ból jest większy niż przy pojedynczej stracie — i tam najczęściej podejmowane są pochopne decyzje.' },
        { type: 'p', text: 'Lekcja scala świadomość korelacji, kontrolę ekspozycji i proste sanity checki, które utrzymują plan przy życiu bez obiecywania konkretnych alokacji.' },
        { type: 'h3', text: 'Drawdown: zanim złamiesz zasady' },
        { type: 'p', text: 'Drawdown to spadek wartości szczytu do dołka. Ważne jest nie tylko jego głębokość, ale czas trwania: długi, płytki dołek też męczy. Z góry warto wiedzieć, przy jakim scenariuszu equity zmniejszasz agresję lub przerywasz handel — zanim emocja wybierze za Ciebie.' },
        { type: 'list', items: [
          'Limit dzienny / tygodniowy straty jako twarde ogniwo operacyjne, nie „sugestia”.',
          'Po przekroczeniu progu: przerwa, przegląd dziennika, nie „odgrywanie” rynku.',
          'Rozróżniasz normalną zmienność strategii od sygnału, że reżim rynku się zmienił.',
        ] },
        { type: 'h3', text: 'Korelacje krzyżowe i koncentracja' },
        { type: 'p', text: 'Dwie pozycje na pozór różnych klas mogą jechać na tym samym ryzykiem (np. indeksy growth i FX z silnym beta na risk-on). Koncentracja nie znika, bo zmieniłeś nazwę instrumentu. Proste ćwiczenie: grupujesz pozycje według czynników, nie według tickerów.' },
        { type: 'h3', text: 'Risk parity myślowe i sanity checki' },
        { type: 'p', text: 'Idea risk parity w uproszczeniu: ryzyko (zmienność lub potencjalna strata) poszczególnych składowych jest bardziej zbalansowane niż przy równych nominalnych wagach. Nie musisz stosować wzorów z papiera — wystarczy świadomie pytać: czy ta nowa pozycja podwaja to samo ryzyko, które już niesiesz?' },
        { type: 'list', items: [
          'Przed otwarciem: „Co się dzieje z portfelem, jeśli ten jeden scenariusz (-X%) trafi na trzy skorelowane linie naraz?”',
          'Sprawdzasz, czy sizing jest spójny z tym samym planem, który testowałeś — nie z „dzisiejszym impulsem”.',
          'Regularny, krótki przegląd: czy liczba otwartych linii nie przekracza zdolności mentalnej do śledzenia ich bez przycinania zasad.',
        ] },
        { type: 'quote', text: 'Ryzyko portfela rośnie najczęściej tam, gdzie myślisz, że dywersyfikujesz — a w praktyce powielasz jeden bet.' },
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
