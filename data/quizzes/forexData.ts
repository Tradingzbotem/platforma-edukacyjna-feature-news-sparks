import type { DataMcqRow } from "./dataMcqRow";

export const FOREX_QUIZ_DATA: DataMcqRow[] = [
  {
    id: "fxq-01",
    question: "W parze EUR/USD walutą kwotowaną (quote) jest:",
    options: ["EUR", "USD", "PLN", "GBP"],
    correctIndex: 1,
    correctAnswer: "USD",
    explanation:
      "W parze BASE/QUOTE druga waluta jest kwotowana — pokazuje, ile jednostek quote potrzeba na jedną jednostkę base; przy EUR/USD kwotą jest USD.",
    consequenceCorrect:
      "Poprawnie czytasz notowania i rozumiesz, jak liczyć wartość pipsa oraz P/L w swojej walucie rozliczenia.",
    consequenceWrong:
      "Odwracasz sens ruchu w P/L, źle liczysz wartość pipa i rozmiar pozycji — realnie ryzykujesz inną kwotą przy tym samym SL niż zakładasz.",
    topic: "Pary walutowe",
    difficulty: "easy",
  },
  {
    id: "fxq-02",
    question: "Przy pozycji 1 lot na EUR/USD, wartość 1 pipsa to około:",
    options: ["$1", "$10", "$100", "$1000"],
    correctIndex: 1,
    correctAnswer: "$10",
    explanation:
      "Przy standardowym locie (100 000 jednostek bazy) ruch o 0,0001 na parze z USD w kwocie daje ok. 10 USD na pip (przy kursie blisko 1 — przy innych kursach wartość w USD lekko się przesuwa).",
    consequenceCorrect:
      "Potrafisz powiązać lot z realnym wpływem pipa na rachunek — podstawa ryzyka i SL/TP.",
    consequenceWrong:
      "Zła wartość pipsa = zły rozmiar pozycji i fałszywe poczucie, ile ryzykujesz na jednym ruchu.",
    topic: "Lot i pip",
    difficulty: "easy",
  },
  {
    id: "fxq-03",
    question: "Swap/overnight (finansowanie) to:",
    options: [
      "Naliczana opłata/odsetki za utrzymanie pozycji przez noc",
      "Rodzaj zlecenia stop",
      "Opłata od depozytu gotówkowego",
      "Podatek od zysków",
    ],
    correctIndex: 0,
    correctAnswer: "Naliczana opłata/odsetki za utrzymanie pozycji przez noc",
    explanation:
      "Swap wynika z różnicy stóp i mechanizmu finansowania pozycji dzień do dnia — to nie jest to samo co rollover (zmiana daty waluty).",
    explanationIncorrect:
      "Swap to nie typ zlecenia ani podatek — to koszt lub przychód z utrzymania pozycji między dniami rozliczeniowymi.",
    consequenceCorrect:
      "Uwzględniasz koszt utrzymania w weekendy/środy (potrójny swap) przy długich pozycjach i swingach.",
    consequenceWrong:
      "Traktowanie swapu jako „cosmetic” bywa bolesne: strategia intraday może być OK, a po tygodniu koszt zjada edge.",
    topic: "Finansowanie",
    difficulty: "medium",
  },
  {
    id: "fxq-04",
    question: "Największa płynność na FX zwykle występuje podczas:",
    options: [
      "Nakładania się sesji Londyn–Nowy Jork",
      "Godzin azjatyckich wyłącznie",
      "Weekendu",
      "Po publikacji KID",
    ],
    correctIndex: 0,
    correctAnswer: "Nakładania się sesji Londyn–Nowy Jork",
    explanation:
      "Największe obroty i najwęższe spready często pojawiają się, gdy europejska i północnoamerykańska płynność działa równocześnie.",
    consequenceCorrect:
      "Planujesz wejścia/wyjścia z świadomością, kiedy realizacja bywa tańsza i szybsza.",
    consequenceWrong:
      "Handel tylko w „martwych” oknach często oznacza szerszy spread i większy poślizg przy tym samym setupie.",
    topic: "Sesje",
    difficulty: "easy",
  },
  {
    id: "fxq-05",
    question: "Co najczęściej powoduje rozszerzanie spreadu na FX?",
    options: [
      "Niska płynność / wysoka zmienność",
      "Wysoka płynność i spokojny rynek",
      "Duże zlecenie limit",
      "Brak danych makro",
    ],
    correctIndex: 0,
    correctAnswer: "Niska płynność / wysoka zmienność",
    explanation:
      "Dealerzy poszerzają spread, gdy ryzyko realizacji rośnie — np. przed danymi, w nocy na egzotykach lub przy nagłych skokach ceny.",
    consequenceCorrect:
      "Przed newsami i w cienkiej płynności liczysz wyższy koszt wejścia — nie łudzisz się średnim spreadem z spokojnego dnia.",
    consequenceWrong:
      "Kupujesz po wyższym ask i zamykasz po niższym bid — ten sam setup ma gorszy punkt wejścia/wyjścia i niższą realną expectancy po kosztach.",
    topic: "Spread",
    difficulty: "easy",
  },
  {
    id: "fxq-06",
    question: "Pipette to:",
    options: [
      "1/10 pipsa (piąte miejsce po przecinku na większości par)",
      "Mniejsza odmiana lota",
      "Wskaźnik zmienności",
      "Rodzaj opłaty",
    ],
    correctIndex: 0,
    correctAnswer: "1/10 pipsa (piąte miejsce po przecinku na większości par)",
    explanation:
      "Przy kwotowaniu do piątego miejsca po przecinku na majorach ostatnia cyfra to zwykle ułamek pipa (pipette).",
    consequenceCorrect:
      "Nie mylisz ruchu „1 pip” z jednym tickiem na wykresie — ważne przy mikroskalpie i kosztach.",
    consequenceWrong:
      "Pomyłka skali: myślisz, że rynek „prawie nie ruszył”, a to już znaczący koszt na dużej pozycji.",
    topic: "Pip",
    difficulty: "easy",
  },
  {
    id: "fxq-07",
    question: "Kurs krzyżowy (cross) to para:",
    options: [
      "Bez udziału USD (np. EUR/GBP)",
      "Zawsze z USD",
      "Wyłącznie z walutami EM",
      "Z towarami",
    ],
    correctIndex: 0,
    correctAnswer: "Bez udziału USD (np. EUR/GBP)",
    explanation:
      "Cross to para walutowa bez USD w kwotowaniu (w potocznym sensie FX) — np. EUR/GBP; handel i tak często przechodzi przez płynność dolarową w tle.",
    consequenceCorrect:
      "Rozumiesz, skąd biorą się spready na crossach i czemu bywają szersze niż na majorach z USD.",
    consequenceWrong:
      "Na crossach płacisz często szerszym spreadem i większym poślizgiem — bez tej wiedzy źle szacujesz koszt obrotu i łączne ryzyko portfela.",
    topic: "Pary",
    difficulty: "medium",
  },
  {
    id: "fxq-08",
    question: "Rollover na FX następuje standardowo:",
    options: [
      "O 17:00 czasu Nowy Jork",
      "O północy czasu lokalnego brokera",
      "O 8:00 londyńskiego",
      "W weekend",
    ],
    correctIndex: 0,
    correctAnswer: "O 17:00 czasu Nowy Jork",
    explanation:
      "Rollover to zmiana daty waluty (value date), standardowo ok. 17:00 ET — to nie jest naliczenie swapu, choć często jest z nim powiązane w praktyce platformowej.",
    explanationIncorrect:
      "Rollover nie jest „o północy u brokera” ani w weekend — to punkt odcięcia dnia walutowego wg konwencji rynku.",
    consequenceCorrect:
      "Wiesz, kiedy realnie przechodzisz na kolejny dzień rozliczeniowy — mniej niespodzianek przy swingach.",
    consequenceWrong:
      "Źle planujesz dzień zamknięcia swinga: płacisz niepotrzebny swap albo zamykasz za wcześnie — kapitał ucieka kosztami, których nie widzisz na świecy.",
    topic: "Rozliczenia",
    difficulty: "medium",
  },
  {
    id: "fxq-09",
    question: "Potrójny swap naliczany jest typowo:",
    options: ["W środę", "W piątek", "W poniedziałek", "W sobotę"],
    correctIndex: 0,
    correctAnswer: "W środę",
    explanation:
      "Żeby pokryć weekend, wiele platform stosuje potrójny swap od środy do czwartku (konwencja 2 dni spot) — szczegóły zależą od instrumentu i brokera.",
    explanationIncorrect:
      "Potrójny swap nie jest „w piątek za weekend” w typowej konwencji FX — to często środa, nie piątek.",
    consequenceCorrect:
      "Unikasz niespodzianek na rachunku, gdy trzymasz pozycję przez ten dzień tygodnia.",
    consequenceWrong:
      "Nieprzewidziany koszt weekendowy może zjeść zysk z kilku dobrych transakcji.",
    topic: "Swap",
    difficulty: "medium",
  },
  {
    id: "fxq-10",
    question: "Carry trade polega na:",
    options: [
      "Kupnie waluty o wyższej stopie i sprzedaży o niższej",
      "Arbitrażu między giełdami",
      "Transakcjach w fixingu 4pm",
      "Zawsze krótkiej sprzedaży",
    ],
    correctIndex: 0,
    correctAnswer: "Kupnie waluty o wyższej stopie i sprzedaży o niższej",
    explanation:
      "Carry to strategia zbierania różnicy stóp (plus swap), zwykle z ryzykiem kursowym na parze — zysk nie jest gwarantowany.",
    consequenceCorrect:
      "Rozumiesz, że „wysoka stopa” to nie tylko dodatni swap, ale ekspozycja, która może zjeść carry jednym ruchem.",
    consequenceWrong:
      "Traktujesz dodatni swap jak stały dochód i nadbudowujesz pozycję — jeden ruch przeciwko tobie na lewarze może zjeść miesiące „carry” z kapitału.",
    topic: "Stopy procentowe",
    difficulty: "medium",
  },
  {
    id: "fxq-11",
    question: "ESMA ogranicza dźwignię dla major FX do:",
    options: ["30:1", "50:1", "100:1", "10:1"],
    correctIndex: 0,
    correctAnswer: "30:1",
    explanation:
      "Dla klientów detalicznych w UE typowy limit dźwigni na głównych parach FX to 30:1 (margin ok. 3,33%).",
    consequenceCorrect:
      "Planujesz margin pod regulację, a nie pod reklamę „1000:1” z jurysdykcji offshore.",
    consequenceWrong:
      "Przecenianie dźwigni pod ESMA kończy się szybkim margin call przy normalnej zmienności.",
    topic: "Regulacje",
    difficulty: "easy",
  },
  {
    id: "fxq-12",
    question: "Zlecenie stop bywa wypełnione z poślizgiem głównie przez:",
    options: [
      "Luki/gapy i szybki ruch",
      "Stały spread",
      "Brak wolumenu minimalnego",
      "Błędny SL",
    ],
    correctIndex: 0,
    correctAnswer: "Luki/gapy i szybki ruch",
    explanation:
      "Stop staje się zleceniem rynkowym po aktywacji — przy skoku ceny realizacja bywa po gorszej cenie niż poziom stop.",
    consequenceCorrect:
      "Ustawiasz SL i wielkość pozycji z założeniem, że ekstremalny ruch może wykonać się poziomem dalej niż linia na wykresie.",
    consequenceWrong:
      "Oczekiwanie „wykonania dokładnie przy stopie” w newsach prowadzi do frustracji i złej oceny strategii.",
    topic: "Zlecenia",
    difficulty: "medium",
  },
  {
    id: "fxq-13",
    question: "Fixing WM/Reuters 16:00 (Londyn) to:",
    options: [
      "Okno referencyjne do wycen i benchmarków",
      "Start sesji azjatyckiej",
      "Godzina publikacji NFP",
      "Limit dzienny",
    ],
    correctIndex: 0,
    correctAnswer: "Okno referencyjne do wycen i benchmarków",
    explanation:
      "Fixing to zorganizowany snapshot kursów używany m.in. do wycen funduszy, indeksów i rozliczeń referencyjnych — nie „start sesji”.",
    consequenceCorrect:
      "Rozumiesz, czemu tuż przy fixingach bywa podbity wolumen i dziwny microstructure.",
    consequenceWrong:
      "Wejście/wyjście marketem przy fixingach bywa droższe i bardziej poślizgowe — ignorujesz mikrostrukturę i dziwisz się realizacji, choć to efekt płynności, nie „spisku”.",
    topic: "Benchmarki",
    difficulty: "medium",
  },
  {
    id: "fxq-14",
    question: "Najczęściej korelują dodatnio:",
    options: ["EUR/USD i GBP/USD", "USD/JPY i złoto", "USD/CAD i ropa (+)", "CHF/JPY i indeksy"],
    correctIndex: 0,
    correctAnswer: "EUR/USD i GBP/USD",
    explanation:
      "EUR/USD i GBP/USD mają wspólnego „mianownika” w USD — często ruszają się podobnym impulsem (korelacja bywa wysoka, choć nie stała).",
    explanationIncorrect:
      "USD/CAD zwykle ma odwrotną relację do ropy (ropa ↑ → CAD ↑ → USD/CAD ↓), a USD/JPY i złoto nie są typową parą dodatnią.",
    consequenceCorrect:
      "Nie budujesz „dywersyfikacji” z dwoma pozycjami, które w praktyce to podwójna ekspozycja na ten sam czynnik.",
    consequenceWrong:
      "Podwójny long na silnie skorelowanych parach to często 2× to samo ryzyko przy pozorze dwóch setupów.",
    topic: "Korelacje",
    difficulty: "medium",
  },
  {
    id: "fxq-15",
    question: "W parach z JPY 1 pip to zwykle:",
    options: ["0.01", "0.0001", "1", "0.1"],
    correctIndex: 0,
    correctAnswer: "0.01",
    explanation:
      "Na parach typu USD/JPY pip to zwykle drugie miejsce po przecinku (0,01), bo kwotowanie jest w mniejszych jednostkach niż u majorów z 4-5 miejscami.",
    consequenceCorrect:
      "Prawidłowo liczysz pipsy i wartość punktu na JPY — krytyczne przy ustawianiu SL/TP.",
    consequenceWrong:
      "Traktowanie JPY jak EUR/USD skaluje ryzyko 10× w złą stronę.",
    topic: "Pip",
    difficulty: "easy",
  },
  {
    id: "fxq-16",
    question: "EBS/Reuters to:",
    options: [
      "Platformy międzybankowe FX (OTC)",
      "Rodzaje wskaźników makro",
      "Indeksy zmienności",
      "Fundusze MM",
    ],
    correctIndex: 0,
    correctAnswer: "Platformy międzybankowe FX (OTC)",
    explanation:
      "To miejsca spotykania płynności instytucjonalnej na FX — budulec referencyjnych kursów, nie „wskaźnik makro”.",
    consequenceCorrect:
      "Rozumiesz warstwę wholesale ponad retailowym brokerem.",
    consequenceWrong:
      "Nie rozumiesz, że widzisz ścieżkę brokera/LP — źle oceniasz, czy szeroki spread to rynek czy warstwa dostępu; market order kosztuje więcej, niż zakładasz.",
    topic: "Infrastruktura",
    difficulty: "hard",
  },
  {
    id: "fxq-17",
    question: "Broker STP/ECN:",
    options: [
      "Przekazuje zlecenia na zewnętrzną płynność",
      "Zawsze market maker",
      "Nie ma prowizji",
      "Gwarantuje brak poślizgu",
    ],
    correctIndex: 0,
    correctAnswer: "Przekazuje zlecenia na zewnętrzną płynność",
    explanation:
      "STP/ECN oznacza agregację/przekazanie do LP — model inny niż czysty internalizacja MM, choć w praktyce hybrydy są powszechne.",
    consequenceCorrect:
      "Masz realistyczne oczekiwania co do poślizgu i tego, kto jest kontrstroną.",
    consequenceWrong:
      "W vol i przy większym rozmiarze realizacja odbiega od mid — zamiast zmniejszyć pozycję albo użyć limitów, tracisz kapitał na poślizgu i obwiniasz platformę.",
    topic: "Brokerzy",
    difficulty: "medium",
  },
  {
    id: "fxq-18",
    question: "Największe ruchy intraday często pojawiają się:",
    options: [
      "Wokół publikacji kluczowych danych (CPI, NFP, decyzje banków)",
      "W nocy w weekend",
      "W święta bankowe",
      "Po zamknięciu rynku",
    ],
    correctIndex: 0,
    correctAnswer: "Wokół publikacji kluczowych danych (CPI, NFP, decyzje banków)",
    explanation:
      "Niespodzianki makro i banki centralne zmieniają oczekiwania stóp — to najczęstsze paliwo na duże świecie w ciągu dnia.",
    consequenceCorrect:
      "Świadomie decydujesz: handel na news vs. unikanie — z rozumieniem spreadu i poślizgu.",
    consequenceWrong:
      "Pełny rozmiar i market order w sekundę publikacji to często poślizg i spread kilkukrotnie wyższy niż w spokoju — tracisz na egzekucji, nie na tezie.",
    topic: "Makro",
    difficulty: "easy",
  },
  {
    id: "fxq-19",
    question: "Ryzyko kursowe walut krajów z reżimem stałym (peg):",
    options: [
      "Może materializować się przy dewaluacjach/porzuceniu pegu (np. CHF 2015)",
      "Nie istnieje",
      "Dotyczy tylko krypto",
      "Zawsze dodatni swap",
    ],
    correctIndex: 0,
    correctAnswer: "Może materializować się przy dewaluacjach/porzuceniu pegu (np. CHF 2015)",
    explanation:
      "Peg obniża dzienne wahania, ale nie eliminuje ryzyka politycznego/rezerw — nagłe zwolnienie stopy bywa gwałtowne.",
    consequenceCorrect:
      "Nie lewarujesz „spokojnej” pary pegowanej jak głównego majora bez świadomości tail risk.",
    consequenceWrong:
      "Poczucie „pewnego kursu” bywa kosztowne: jeden dzień może przekreślić miesiące carry.",
    topic: "Ryzyko",
    difficulty: "hard",
  },
  {
    id: "fxq-20",
    question: "FIFO w USA oznacza:",
    options: [
      "Zamykanie pozycji w kolejności ich otwarcia",
      "Dowolna kolejność zamykania",
      "Zakaz SL",
      "Brak prowizji",
    ],
    correctIndex: 0,
    correctAnswer: "Zamykanie pozycji w kolejności ich otwarcia",
    explanation:
      "U regulowanych podmiotów w USA często obowiązuje First-In-First-Out dla tego samego instrumentu — ogranicza hedging „reżimu netto”.",
    consequenceCorrect:
      "Nie planujesz strategii zależnej od nettingu, której Twój regulamin zabrania.",
    consequenceWrong:
      "Błąd prawny-operacyjny: myślisz, że zamykasz wybrany leg, a system domyka najstarszą pozycję.",
    topic: "Regulacje USA",
    difficulty: "medium",
  },
  {
    id: "fxq-21",
    question: "Cross EUR/PLN to przykład:",
    options: ["Pary egzotycznej EM", "Majora", "Surowcowej", "Indeksowej"],
    correctIndex: 0,
    correctAnswer: "Pary egzotycznej EM",
    explanation:
      "PLN jest walutą rynku wschodzącego — para zwykle ma szerszy spread i większy poślizg niż EUR/USD.",
    consequenceCorrect:
      "Dostosowujesz wielkość i oczekiwania realizacji do płynności instrumentu.",
    consequenceWrong:
      "Traktowanie egzotyki jak EUR/USD kończy się zaskakującym kosztem wejścia/wyjścia.",
    topic: "Klasyfikacja par",
    difficulty: "easy",
  },
  {
    id: "fxq-22",
    question: "Tick size to:",
    options: [
      "Minimalny przyrost notowania instrumentu",
      "Rozmiar lota",
      "Wartość pipsa",
      "Wielkość wolumenu",
    ],
    correctIndex: 0,
    correctAnswer: "Minimalny przyrost notowania instrumentu",
    explanation:
      "Tick to najmniejszy krok ceny na danym rynku/instrumencie — może być drobniejszy niż „1 pip” w rozumieniu domu maklerskiego.",
    consequenceCorrect:
      "Rozumiesz różnicę między tickiem a pipsem przy automatyzacji i zleceniach.",
    consequenceWrong:
      "Mylenie ticka z lotem prowadzi do błędów w kodzie strategii i zleceniach stop/limit.",
    topic: "Mikrostruktura",
    difficulty: "medium",
  },
  {
    id: "fxq-23",
    question: "Wartość pipsa zależy m.in. od:",
    options: [
      "Wielkości pozycji i pary walutowej",
      "Rodzaju wykresu",
      "Koloru interfejsu",
      "Wyłącznie dźwigni",
    ],
    correctIndex: 0,
    correctAnswer: "Wielkości pozycji i pary walutowej",
    explanation:
      "Ten sam ruch w punktach ma inną wartość w walucie depozytu w zależności od kontraktu, lota i kursów krzyżowych.",
    consequenceCorrect:
      "Liczenie ryzyka w PLN/EUR na rachunku jest spójne z realnym P/L, nie z „pipsami abstrakcyjnymi”.",
    consequenceWrong:
      "Stała wartość pipa w głowie przy różnych parach to klasyczny błąd przy skalowaniu pozycji.",
    topic: "Ryzyko",
    difficulty: "easy",
  },
  {
    id: "fxq-24",
    question: "Główna różnica między zleceniem a pozycją:",
    options: [
      "Zlecenie to instrukcja, pozycja to już otwarta ekspozycja",
      "Brak różnicy",
      "Zlecenie to zawsze SL",
      "Pozycja to zawsze long",
    ],
    correctIndex: 0,
    correctAnswer: "Zlecenie to instrukcja, pozycja to już otwarta ekspozycja",
    explanation:
      "Zlecenie może nie zostać wypełnione; pozycja oznacza realną ekspozycję na ryzyko kursowe po wykonaniu.",
    consequenceCorrect:
      "Czytasz panel konta poprawnie: wiszące ordery ≠ otwarte ryzyko.",
    consequenceWrong:
      "Myślenie „mam zlecenie = mam pozycję” prowadzi do błędnej oceny drawdownu i marginu.",
    topic: "Platforma",
    difficulty: "easy",
  },
  {
    id: "fxq-25",
    question: "Wydarzenie „central bank rate decision” zwykle:",
    options: [
      "Zwiększa zmienność i ryzyko poślizgu",
      "Zmniejsza spread do zera",
      "Zamyka rynek",
      "Nie ma wpływu",
    ],
    correctIndex: 0,
    correctAnswer: "Zwiększa zmienność i ryzyko poślizgu",
    explanation:
      "Decyzja stóp i komunikat forward guidance potrafią rozstrzelić volatility — spread się poszerza, realizacja bywa losowa przy market.",
    explanationIncorrect:
      "Spread nie „zeruje się” przy decyzji banku — zwykle wręcz przeciwnie w pierwszych minutach.",
    consequenceCorrect:
      "Zmniejszasz rozmiar lub wychodzisz przed czasem, jeśli Twój plan nie jest pod vol-event.",
    consequenceWrong:
      "Pełny sizing w pierwszej minucie po decyzji to często płacenie poślizgiem zamiast edge.",
    topic: "Bank centralny",
    difficulty: "easy",
  },
  {
    id: "fxq-26",
    question: "Rynek FX jest:",
    options: [
      "OTC (poza giełdą), zdecentralizowany",
      "Wyłącznie na giełdzie",
      "Na jednym centralnym serwerze",
      "Dostępny tylko 3 dni w tygodniu",
    ],
    correctIndex: 0,
    correctAnswer: "OTC (poza giełdą), zdecentralizowany",
    explanation:
      "FX to sieć dealerów i platform OTC — nie ma jednej giełdy jak przy akcjach; widzisz ceny swojego LP/brokera.",
    explanationIncorrect:
      "FX nie jest „na jednej giełdzie” ani na jednym serwerze — to zdecentralizowany rynek kontraktów walutowych.",
    consequenceCorrect:
      "Rozumiesz, że „cena na wykresie” to ścieżka do Twojego dostawcy, nie jedyny światowy kurs.",
    consequenceWrong:
      "Każdy LP ma inny bid/ask — porównujesz wykres do „jedynej prawdy”, nadmiernie doregulowujesz pozycję i tracisz na kolejnych wejściach zamiast zaakceptować różnice kwotowań.",
    topic: "Struktura rynku",
    difficulty: "easy",
  },
  {
    id: "fxq-27",
    question: "Najwyższa aktywność zwykle jest:",
    options: [
      "Tuż po otwarciu Londynu i w oknie Londyn–NY",
      "W nocy niedzielnej",
      "W święta federalne",
      "Po 23:00 CET",
    ],
    correctIndex: 0,
    correctAnswer: "Tuż po otwarciu Londynu i w oknie Londyn–NY",
    explanation:
      "Londyn to hub FX; nałożenie z Nowym Jorkiem daje najwyższe obroty — niedzielne otwarcie bywa cienkie i z lukami.",
    consequenceCorrect:
      "Dobierasz sesję do stylu: breakout traderzy często czekają na ten blok, azjański range na innych setupach.",
    consequenceWrong:
      "Wybierasz godzinę pod życie, nie pod płynność — szerszy spread i fałszywe wybicia tną expectancy; ten sam SL kosztuje więcej realnych pieniędzy.",
    topic: "Sesje",
    difficulty: "easy",
  },
  {
    id: "fxq-28",
    question:
      "Porównujesz EUR/USD i egzotyczną parę EM z szerokim spreadem. Przy tym samym nominalnym ruchu w „punktach” na wykresie:",
    options: [
      "Koszt wejścia/wyjścia jest zawsze identyczny",
      "Na egzotyce realny koszt spreadu i poślizgu często pożera większy ułamek ruchu niż na majorze",
      "Egzotyka ma zawsze zerowy spread",
      "Majory nigdy nie mają poślizgu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Na egzotyce realny koszt spreadu i poślizgu często pożera większy ułamek ruchu niż na majorze",
    explanation:
      "Płynność i głębokość książki zleceń na EM bywa słabsza — ten sam „ruch” bywa droższy w realizacji.",
    consequenceCorrect: "Dopasowujesz rozmiar i oczekiwania do instrumentu, nie kopiujesz setupu z EUR/USD 1:1.",
    consequenceWrong:
      "Strategia „10 pipów zysku” na szerokim spreadzie kończy się break-even lub stratą mimo „trafionego” kierunku.",
    topic: "Pary",
    difficulty: "medium",
  },
  {
    id: "fxq-29",
    question: "W parze USD/CAD walutą bazową (pierwsza w zapisie) jest:",
    options: ["CAD", "USD", "Zawsze EUR", "Para nie ma bazy"],
    correctIndex: 1,
    correctAnswer: "USD",
    explanation: "Pierwsza waluta w parze to baza — przy USD/CAD bazą jest dolar amerykański.",
    consequenceCorrect: "Poprawnie interpretujesz kierunek wykresu i P/L przy long/short.",
    consequenceWrong: "Odwracasz logikę longa na USD/CAD — plan SL/TP jest ustawiony pod zły scenariusz.",
    topic: "Pary walutowe",
    difficulty: "easy",
  },
  {
    id: "fxq-30",
    question:
      "Masz long EUR/USD i long GBP/USD. Przy nagłym wzmocnieniu USD obie pozycje jednocześnie:",
    options: [
      "Zawsze zarabiają, bo to dwie pozycje",
      "Często tracą w podobnym impulsie — rosnące USD obniża obie pary w typowym scenariuszu",
      "Są całkowicie niezależne od USD",
      "Automatycznie się zabezpieczają",
    ],
    correctIndex: 1,
    correctAnswer:
      "Często tracą w podobnym impulsie — rosnące USD obniża obie pary w typowym scenariuszu",
    explanation:
      "Obie mają USD w kwocie — impuls na USD może uderzyć w obie pozycje jednocześnie.",
    consequenceCorrect: "Liczyć skumulowane ryzyko na USD, nie „dwie różne historie”.",
    consequenceWrong: "Podwójny long mylony z dywersyfikacją — jeden szok USD robi podwójną dziurę w equity.",
    topic: "Korelacje",
    difficulty: "medium",
  },
  {
    id: "fxq-31",
    question:
      "„Cross” bez USD w zapisie (np. EUR/GBP) w praktyce retail często jest wyceniany:",
    options: [
      "Bez udziału USD w tle",
      "Przez syntetyczne zestawienie par z USD w tle — nadal istnieje pośrednia ścieżka płynności",
      "Wyłącznie na giełdzie w Londynie",
      "Zawsze po stałym kursie ECB",
    ],
    correctIndex: 1,
    correctAnswer:
      "Przez syntetyczne zestawienie par z USD w tle — nadal istnieje pośrednia ścieżka płynności",
    explanation:
      "Retail widzi jeden symbol, ale routing płynności często przechodzi przez główne nogi dolarowe.",
    consequenceCorrect: "Nie dziwisz się, że cross reaguje na „dolarowe” newsy indywidualnie.",
    consequenceWrong: "Ignorujesz wpływ USD na cross — źle czasujesz wejście przy FOMC.",
    topic: "Pary",
    difficulty: "hard",
  },
  {
    id: "fxq-32",
    question: "Niedzielne otwarcie tygodnia na FX u wielu brokerów bywa:",
    options: [
      "Identyczne jak wtorkowy lunch w Londynie",
      "Cieńsze, z szerszym spreadem i lukami — wyższe ryzyko poślizgu",
      "Zamknięte bez wyjątków",
      "Zawsze bez spreadu",
    ],
    correctIndex: 1,
    correctAnswer: "Cieńsze, z szerszym spreadem i lukami — wyższe ryzyko poślizgu",
    explanation:
      "Po weekendzie zdarzeń geopolitycznych pierwsze kwotowania bywają chaotyczne i z lukami.",
    consequenceCorrect: "Unikasz marketów „na otwarciu”, jeśli nie masz planu na gap.",
    consequenceWrong: "Pełny lot marketem w pierwszej minucie tygodnia — realizacja bywa losowa i droga.",
    topic: "Struktura rynku",
    difficulty: "medium",
  },
  {
    id: "fxq-33",
    question: "„Liquidity gap” tuż po dużym ruchu oznacza dla zleceń stop:",
    options: [
      "Gwarancję ceny stop",
      "Ryzyko realizacji przez „pustkę” w ofertach — poślizg może być duży",
      "Brak aktywacji stop",
      "Spread zawsze zero",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko realizacji przez „pustkę” w ofertach — poślizg może być duży",
    explanation:
      "Gdy znikają zlecenia pośrednie, stop realizuje się po kolejnych dostępnych cenach, często dalej niż linia.",
    consequenceCorrect: "Projektujesz rozmiar i bufor SL pod ekstremalne warunki, nie pod średni dzień.",
    consequenceWrong: "Założenie „stop zawsze przy linii” w newsach — frustracja i nieplanowana strata.",
    topic: "Mikrostruktura",
    difficulty: "hard",
  },
  {
    id: "fxq-34",
    question:
      "Dlaczego dwa identyczne wykresy EUR/USD u dwóch brokerów mogą minimalnie różnić się ceną zamknięcia świecy M5?",
    options: [
      "Bo jeden broker zawsze manipuluje",
      "Różna ścieżka do LP, czas serwera i agregacja ticków — to normalne w OTC",
      "Bo Forex jest na jednej giełdzie z jednym fixem",
      "Nie mogą się różnić",
    ],
    correctIndex: 1,
    correctAnswer:
      "Różna ścieżka do LP, czas serwera i agregacja ticków — to normalne w OTC",
    explanation:
      "Nie ma jednego globalnego „oficjalnego” OHLC dla retail — każdy dostawca buduje świecę z własnego strumienia.",
    consequenceCorrect: "Nie walczysz z brokerem o 0,2 pipa, tylko testujesz strategię na stabilnym feedzie.",
    consequenceWrong: "Over-optimization pod świecę jednego brokera — na drugim koncie strategia się sypie.",
    topic: "Brokerzy",
    difficulty: "medium",
  },
  {
    id: "fxq-35",
    question: "„Tick volume” na FX w platformie retail zwykle oznacza:",
    options: [
      "Fizyczny wolumen jak na giełdzie akcji",
      "Liczba zmian ceny/ticków w interwale — przybliżenie aktywności, nie prawdziwy obrót",
      "Zawsze dokładną liczbę lotów banków centralnych",
      "To samo co open interest",
    ],
    correctIndex: 1,
    correctAnswer:
      "Liczba zmian ceny/ticków w interwale — przybliżenie aktywności, nie prawdziwy obrót",
    explanation:
      "W OTC retail nie widzisz pełnego wolumenu transakcji — tick volume to proxy aktywności.",
    consequenceCorrect: "Używasz wolumenu oszczędnie jako filtr, nie jako dowód absolutny.",
    consequenceWrong: "Traktujesz tick volume jak wolumen giełdowy — fałszywe sygnały dywergencji.",
    topic: "Pip",
    difficulty: "medium",
  },
  {
    id: "fxq-36",
    question: "Zmieniasz interwał z M1 na H1 przy tej samej strategii testowanej „na oko”. Wynik:",
    options: [
      "Zawsze identyczny",
      "Zmienia się koszt transakcji względem średniego ruchu — inna próba, inne poślizgi i szum",
      "M1 zawsze lepsze bez testów",
      "Interwał nie ma znaczenia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zmienia się koszt transakcji względem średniego ruchu — inna próba, inne poślizgi i szum",
    explanation:
      "Niższy TF = więcej sygnałów i więcej kosztów round-trip; wyższy TF = mniej transakcji, inna struktura szumu.",
    consequenceCorrect: "Walidujesz strategię na TF, na którym realnie handlujesz.",
    consequenceWrong: "Wdrażasz scalping bez uwzględnienia kosztu na M1 — edge znika w spreadzie.",
    topic: "Pip",
    difficulty: "medium",
  },
  {
    id: "fxq-37",
    question: "Przy tej samej wielkości pozycji ruch o 10 pipów na EUR/USD vs 10 „punktów” na koncie z inną definicją point:",
    options: [
      "Zawsze ten sam zysk w PLN bez przeliczeń",
      "Może oznaczać różny ruch ceny i różną wartość — trzeba czytać specyfikację symbolu",
      "Point i pip to zawsze to samo 1:1",
      "Tylko swap to zmienia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może oznaczać różny ruch ceny i różną wartość — trzeba czytać specyfikację symbolu",
    explanation:
      "Brokers define contract size and point — 10 „points” może być 1 pip lub 0.1 pip depending on digits.",
    consequenceCorrect: "Sprawdzasz specyfikację przed skalowaniem strategii między kontami.",
    consequenceWrong: "Kopiujesz SL z konta 5-digit na 3-digit bez konwersji — poziom ochrony jest zły.",
    topic: "Pip",
    difficulty: "hard",
  },
  {
    id: "fxq-38",
    question: "Wartość 1 pipa przy 0,05 lota na majorze z USD w kwocie jest w przybliżeniu:",
    options: [
      "Taka sama jak przy 1 locie",
      "Pięć razy mniejsza niż przy 1 locie (przy tej samej parze i konwencji lota)",
      "Zawsze zero",
      "Zawsze 100× większa",
    ],
    correctIndex: 1,
    correctAnswer: "Pięć razy mniejsza niż przy 1 locie (przy tej samej parze i konwencji lota)",
    explanation: "Liniowość względem lota — połowa lota ≈ połowa wpływu pipa (przy tej samej parze).",
    consequenceCorrect: "Szybko szacujesz ryzyko przy dzieleniu pozycji.",
    consequenceWrong: "Myślisz, że „mały lot” = brak ryzyka — nadal możesz stracić duży % konta przy ciasnym SL.",
    topic: "Lot i pip",
    difficulty: "easy",
  },
  {
    id: "fxq-39",
    question: "Swap naliczany „od środy” w wielu konwencjach FX dotyczy głównie:",
    options: [
      "Kary za mało transakcji",
      "Pokrycia wielodniowego finansowania weekendu — często potrójny swap w jednym dniu tygodnia",
      "Podatku od zysków",
      "Zmiany stopy referencyjnej NBP",
    ],
    correctIndex: 1,
    correctAnswer:
      "Pokrycia wielodniowego finansowania weekendu — często potrójny swap w jednym dniu tygodnia",
    explanation:
      "Value date convention — środa do czwartku bywa momentem potrójnego swapu u wielu platform.",
    consequenceCorrect: "Uwzględniasz ten dzień w koszcie swinga, nie tylko średni dzienny swap.",
    consequenceWrong: "Zaskoczenie dużym saldem swapu „znikąd” po środzie — zamykasz zyskowny trade netto w minusie.",
    topic: "Swap",
    difficulty: "medium",
  },
  {
    id: "fxq-40",
    question: "Rollover (zmiana daty valuacji) w praktyce retail jest powiązany z:",
    options: [
      "Zmianą koloru wykresu",
      "Punktem odcięcia dnia walutowego — często ok. 17:00 ET — i naliczeniami overnight",
      "Wyłącznie z podatkiem VAT",
      "Zamknięciem konta",
    ],
    correctIndex: 1,
    correctAnswer:
      "Punktem odcięcia dnia walutowego — często ok. 17:00 ET — i naliczeniami overnight",
    explanation: "To granica „kiedy pozycja przechodzi” na kolejny dzień rozliczeniowy w konwencji rynku.",
    consequenceCorrect: "Planujesz zamknięcie przed cut-off, jeśli chcesz uniknąć kolejnej doby swapu.",
    consequenceWrong: "Myślisz, że rollover = tylko nazwa — trzymasz pozycję i niespodziewany koszt zjada edge.",
    topic: "Rozliczenia",
    difficulty: "medium",
  },
  {
    id: "fxq-41",
    question: "Carry trade w praktyce detala na FX:",
    options: [
      "Gwarantuje dodatni swap bez ryzyka kursowego",
      "Zbiera różnicę stóp/swapu, ale nadal niesie ryzyko ruchu pary — jeden ruch może zjeść miesiące carry",
      "Działa tylko na koncie demo",
      "Wyłącza margin",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zbiera różnicę stóp/swapu, ale nadal niesie ryzyko ruchu pary — jeden ruch może zjeść miesiące carry",
    explanation:
      "Dodatni swap to nie „stały dochód” — ekspozycja kursowa nadal jest pełnym ryzykiem.",
    consequenceCorrect: "Szacujesz tail risk na parze, zanim budujesz pozycję pod carry.",
    consequenceWrong: "Max lewar pod swap — jeden impuls przeciwko pozycji kasuje carry i depozyt.",
    topic: "Stopy procentowe",
    difficulty: "medium",
  },
  {
    id: "fxq-42",
    question: "Spread „rozjeżdża się” tuż przed decyzją Fed, a Ty chcesz wejść marketem „na szybko”. Największe ryzyko:",
    options: [
      "Że spread zawsze się zawęzi w tej sekundzie",
      "Że zapłacisz wygórowany ask/bid i poślizg — realny koszt wejścia bywa znacznie wyższy niż w spokoju",
      "Że broker anuluje zysk",
      "Brak ryzyka przy market",
    ],
    correctIndex: 1,
    correctAnswer:
      "Że zapłacisz wygórowany ask/bid i poślizg — realny koszt wejścia bywa znacznie wyższy niż w spokoju",
    explanation:
      "W vol-event mikrostruktura dominuje — nawet dobry kierunek może przegrać z kosztem realizacji.",
    consequenceCorrect: "Redukcja rozmiaru, limit, lub pauza — świadomy wybór zamiast FOMO.",
    consequenceWrong: "Pełny lot w pierwszej sekundzie — płacisz premium za chaos, nie za edge.",
    topic: "Spread",
    difficulty: "medium",
  },
  {
    id: "fxq-43",
    question: "Fixing WM/Reuters ok. 16:00 Londynu jest istotny dla Ciebie głównie wtedy, gdy:",
    options: [
      "Handlujesz wyłącznie skalpem na M1 i ignorujesz benchmarki",
      "Masz zlecenia/rozliczenia powiązane z referencyjnym kursem (np. niektóre produkty, hedging firmowy) albo handlujesz przy oknie o podwyższonym wolumenie",
      "Nigdy — fixing nie istnieje na FX",
      "Tylko przy kupnie akcji spółek PL",
    ],
    correctIndex: 1,
    correctAnswer:
      "Masz zlecenia/rozliczenia powiązane z referencyjnym kursem (np. niektóre produkty, hedging firmowy) albo handlujesz przy oknie o podwyższonym wolumenie",
    explanation:
      "Fixing koncentruje przepływy wokół snapshotu — mikrostruktura bywa nietypowa tuż przy oknie.",
    consequenceCorrect: "Unikasz nieświadomego handlu „w ogniu” fixingów bez planu.",
    consequenceWrong: "SL marketem dokładnie w fixing — nietypowa realizacja i złość na „spisek”.",
    topic: "Benchmarki",
    difficulty: "hard",
  },
  {
    id: "fxq-44",
    question: "Peg waluty do koszyka (np. historycznie CHF) dla detala oznacza:",
    options: [
      "Zero ryzyka i stały kurs na zawsze",
      "Ryzyko nagłego zwolnienia pegu lub interwencji — skokowe ruchy i ekstremalny slippage",
      "Że nie można handlować tą parą",
      "Że swap zawsze dodatni",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko nagłego zwolnienia pegu lub interwencji — skokowe ruchy i ekstremalny slippage",
    explanation:
      "Peg obniża codzienne wahania, ale nie usuwa tail risk — jeden dzień może być ekstremalny.",
    consequenceCorrect: "Ostrożny sizing na parach z polityką kursową i świadomość black-swan.",
    consequenceWrong: "Max lewar na „spokojnym” pegu — jeden dzień resetuje konto.",
    topic: "Ryzyko",
    difficulty: "hard",
  },
  {
    id: "fxq-45",
    question:
      "Na koncie widzisz +12 „punktów” zysku na EUR/USD, ale w specyfikacji brokera 1 pip = 10 punktów (5 cyfr). To oznacza, że realnie:",
    options: [
      "Masz +12 pełnych pipów",
      "Masz +1,2 pipa — ostatnia cyfra to zwykle ułamek pipa (pipette)",
      "Masz +120 pipów",
      "Punkty i pipy są zawsze równoważne bez wyjątków",
    ],
    correctIndex: 1,
    correctAnswer: "Masz +1,2 pipa — ostatnia cyfra to zwykle ułamek pipa (pipette)",
    explanation:
      "Przy kwotowaniu 1,10512 ruch o 0,00012 to często 1,2 pipa w języku brokera, choć terminal liczy „points”.",
    consequenceCorrect: "Przeliczasz P/L i SL/TP na pipy wg specyfikacji, nie na surowe cyfry z panelu.",
    consequenceWrong: "Ustawiasz SL „12 punktów” myśląc o 12 pipach — ochrona jest 10× za ciasna lub za szeroka.",
    topic: "Pip",
    difficulty: "medium",
  },
  {
    id: "fxq-46",
    question:
      "Masz stop-sell pod wsparciem. Rynek otwiera się z luką w dół poniżej poziomu stop. Po aktywacji stop:",
    options: [
      "Zawsze wypełnisz się dokładnie przy linii stop",
      "Realizacja bywa zleceniem rynkowym po aktywacji — możesz dostać znacznie gorszą cenę niż linia",
      "Stop nigdy nie zadziała przy gapię",
      "Broker musi dopłacić różnicę do linii stop",
    ],
    correctIndex: 1,
    correctAnswer:
      "Realizacja bywa zleceniem rynkowym po aktywacji — możesz dostać znacznie gorszą cenę niż linia",
    explanation:
      "Stop nie jest gwarancją ceny — przy skoku płynności kolejna dostępna cena bywa daleko od poziomu.",
    consequenceCorrect: "Projektujesz rozmiar i bufor pod tail risk, nie pod idealny świat.",
    consequenceWrong: "Założenie „maks strat X pipów” przy gapię — realna strata bywa wielokrotnie większa.",
    topic: "Zlecenia",
    difficulty: "medium",
  },
  {
    id: "fxq-47",
    question:
      "Ustawiasz ten sam dystans SL w pipach przy 0,1 lota i przy 1 locie na tej samej parze. Porównując ryzyko w walucie rachunku:",
    options: [
      "Ryzyko jest identyczne w walucie",
      "Przy 1 locie ryzyko w walucie jest ok. 10× większe przy tym samym ruchu cenowym",
      "Przy mniejszym locie ryzyko zawsze większe",
      "Dźwignia usuwa różnicę",
    ],
    correctIndex: 1,
    correctAnswer:
      "Przy 1 locie ryzyko w walucie jest ok. 10× większe przy tym samym ruchu cenowym",
    explanation:
      "Ten sam ruch w pipsach skaluje się liniowo z wielkością pozycji — pip to nie procent konta sam z siebie.",
    consequenceCorrect: "Liczyć ryzyko w PLN/EUR z lota, nie tylko „20 pipów SL”.",
    consequenceWrong: "Skalujesz lot w górę bez przeliczenia — ten sam SL w pipach robi 10× większą dziurę w equity.",
    topic: "Lot i pip",
    difficulty: "easy",
  },
  {
    id: "fxq-48",
    question:
      "Long na walucie z wyższą stopą niż waluta kwotowana — swap dzień po dniu typowo:",
    options: [
      "Zawsze jest dodatni niezależnie od brokera",
      "Bywa dodatni lub ujemny w zależności od różnicy stóp, polityki brokera i strony kontraktu — trzeba czytać tabelę swapów",
      "Zawsze zero na FX",
      "Zależy tylko od koloru świecy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Bywa dodatni lub ujemny w zależności od różnicy stóp, polityki brokera i strony kontraktu — trzeba czytać tabelę swapów",
    explanation:
      "Znak swapu wynika z kosztu finansowania po stronie LP/brokera, nie z samej intuicji „wysoka stopa = zysk”.",
    consequenceCorrect: "Sprawdzasz swap przed trzymaniem tygodniami, nie zakładasz „carry na oko”.",
    consequenceWrong: "Trzymasz pozycję „pod carry” i odkrywasz ujemny swap — edge znika w koszcie.",
    topic: "Swap",
    difficulty: "medium",
  },
  {
    id: "fxq-49",
    question:
      "Chcesz uniknąć naliczenia kolejnego dnia swapu. Najbezpieczniej planujesz zamknięcie:",
    options: [
      "Dokładnie o północy czasu brokera",
      "Przed rollover/cut-off dnia walutowego wg specyfikacji (często okolice 17:00 ET), nie wg „wygodnej” strefy",
      "W każdą godzinę jest to samo",
      "Po weekendzie zawsze bez swapu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Przed rollover/cut-off dnia walutowego wg specyfikacji (często okolice 17:00 ET), nie wg „wygodnej” strefy",
    explanation:
      "Dzień rozliczeniowy FX nie musi pokrywać się z północą Twojego serwera — liczy się konwencja instrumentu.",
    consequenceCorrect: "Synchronizujesz exit z kalendarzem swapu, nie z intuicją czasu lokalnego.",
    consequenceWrong: "Zamykasz „o północy u brokera” i nadal dostajesz swap — plan kosztowy jest zły.",
    topic: "Rozliczenia",
    difficulty: "hard",
  },
  {
    id: "fxq-50",
    question:
      "Święto bankowe w USA, ale handel u Twojego brokera nadal działa na parze z USD. Typowo:",
    options: [
      "Płynność i jakość kwotowań bywają gorsze — szerszy spread i większy poślizg",
      "Rynek jest identyczny jak w zwykły wtorek londyński",
      "Spread zawsze zerowy",
      "USD znika z par",
    ],
    correctIndex: 0,
    correctAnswer:
      "Płynność i jakość kwotowań bywają gorsze — szerszy spread i większy poślizg",
    explanation:
      "Retail może mieć otwarte okno, ale instytucjonalna płynność bywa cieńsza — mikrostruktura się zmienia.",
    consequenceCorrect: "Redukujesz rozmiar albo rezygnujesz z agresywnego skalpu w martwych oknach.",
    consequenceWrong: "Pełny sizing w święto — ten sam setup płaci wyższy podatek spreadowy.",
    topic: "Sesje",
    difficulty: "medium",
  },
  {
    id: "fxq-51",
    question:
      "Świadomie trzymasz swinga przez środę z potrójnym swapem, żeby nie wybić pozycji przed ruchem. Decyzja oznacza:",
    options: [
      "Że swap w środę zawsze jest zerowy",
      "Że akceptujesz jednorazowo wyższy koszt overnight w zamian za kontynuację ekspozycji — musisz mieć to w budżecie trade’u",
      "Że broker musi zwrócić potrójny swap",
      "Że unikasz ryzyka kursowego",
    ],
    correctIndex: 1,
    correctAnswer:
      "Że akceptujesz jednorazowo wyższy koszt overnight w zamian za kontynuację ekspozycji — musisz mieć to w budżecie trade’u",
    explanation:
      "Potrójny swap to świadomy koszt utrzymania przez weekend w konwencji value date — nie „błąd systemu”.",
    consequenceCorrect: "Porównujesz oczekiwany ruch z kosztem środy zamiast sięgać po narrację „niesprawiedliwe”.",
    consequenceWrong: "Zyskowny setup netto zamykasz w minusie, bo swap zjadł przewagę — brak planu kosztowego.",
    topic: "Swap",
    difficulty: "medium",
  },
  {
    id: "fxq-52",
    question:
      "Handlujesz breakout z azjatyckiego zakresu na majorze. Najczęstszy błąd operacyjny to:",
    options: [
      "Czekanie na potwierdzenie przy londyńskiej płynności",
      "Wejście marketem w cienkiej azji „na wybicie” bez uwzględnienia fałszywych przebić i spreadu",
      "Prowadzenie dziennika",
      "Użycie SL",
    ],
    correctIndex: 1,
    correctAnswer:
      "Wejście marketem w cienkiej azji „na wybicie” bez uwzględnienia fałszywych przebić i spreadu",
    explanation:
      "Azja bywa range; bez europejskiej płynności breakout często jest szumem kosztowym.",
    consequenceCorrect: "Łączysz sygnał z oknem realizacji, nie tylko kształt świecy.",
    consequenceWrong: "Seria strat na „wybiciach” o 3:00 — edge jest w kontekście sesji, nie w samej linii.",
    topic: "Sesje",
    difficulty: "medium",
  },
  {
    id: "fxq-53",
    question:
      "Dane makro wypadają zgodnie z konsensusem, ale forward guidance banku centralnego zaskakuje rynek. Najczęściej:",
    options: [
      "Nic się nie dzieje na wykresie",
      "Ruch i poślizg bywają duże mimo „zgodnych liczb” — rynek dyskontuje narrację, nie tylko jedną publikację",
      "Spread zawsze się zawęża",
      "Zlecenia limit zawsze wypełniają się po mid",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ruch i poślizg bywają duże mimo „zgodnych liczb” — rynek dyskontuje narrację, nie tylko jedną publikację",
    explanation:
      "Surprise to często odchylenie od oczekiwań path stóp, nie tylko miss headline CPI.",
    consequenceCorrect: "Nie rozluźniasz zarządzania ryzykiem tylko dlatego, że „forecast trafiony”.",
    consequenceWrong: "Leverage pod „spokojny” release — komunikat tekstowy rozwala pozycję.",
    topic: "Makro",
    difficulty: "hard",
  },
  {
    id: "fxq-54",
    question:
      "Handlujesz w okresie świątecznym, gdy wiele biur jest zamkniętych. Co jest realistyczne?",
    options: [
      "Głęboka płynność jak przy NFP",
      "Cieńsza książka zleceń, szersze spready i większe ryzyko nietypowej realizacji",
      "Rynek FX globalnie zatrzymany dla wszystkich",
      "Brak swapów w święta",
    ],
    correctIndex: 1,
    correctAnswer:
      "Cieńsza książka zleceń, szersze spready i większe ryzyko nietypowej realizacji",
    explanation:
      "OTC nadal „żyje”, ale jakość płynności bywa gorsza — szczególnie na mniej płynnych parach.",
    consequenceCorrect: "Skracasz ekspozycję lub akceptujesz wyższy koszt jakoś w strategii.",
    consequenceWrong: "Agresywny skalp w święto — seria strat z tytułu kosztów, nie kierunku.",
    topic: "Płynność",
    difficulty: "easy",
  },
  {
    id: "fxq-55",
    question:
      "Broker działa jako market maker i internalizuje część flowu. Dla Ciebie jako klienta oznacza to przede wszystkim:",
    options: [
      "Że zawsze masz gorszy kurs niż na giełdzie",
      "Że kontrstroną bywa często dom maklerski — realizacja i rekwotowania zależą od jego polityki i warunków",
      "Że nie możesz zarabiać",
      "Że spread jest zawsze zerowy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Że kontrstroną bywa często dom maklerski — realizacja i rekwotowania zależą od jego polityki i warunków",
    explanation:
      "Model biznesowy MM różni się od czystego STP — oczekiwania co do slippage i obsługi zleceń muszą być realistyczne.",
    consequenceCorrect: "Czytasz regulamin, testujesz realizację na małym rozmiarze, oceniasz stabilność.",
    consequenceWrong: "Obwiniasz „manipulację” przy każdym poślizgu, zamiast dostosować styl i rozmiar.",
    topic: "Brokerzy",
    difficulty: "medium",
  },
  {
    id: "fxq-56",
    question:
      "Platforma pokazuje „off quotes” / brak ceny w skoku zmienności. Najrozsądniejsza reakcja:",
    options: [
      "Natychmiastowe podwajanie pozycji",
      "Nie forować serii marketów w chaosie — poczekać na stabilny feed, ewentualnie użyć limitów z buforem",
      "Wyłączenie internetu",
      "Złożenie zlecenia bez sprawdzenia ceny",
    ],
    correctIndex: 1,
    correctAnswer:
      "Nie forować serii marketów w chaosie — poczekać na stabilny feed, ewentualnie użyć limitów z buforem",
    explanation:
      "Brak kwot to objaw cienkiej płynności lub problemu mostu — market order w tym momencie to losowa cena.",
    consequenceCorrect: "Chronisz kapitał przed egzekucją w próżni.",
    consequenceWrong: "Frustracyjne kliki „w ciemno” — realizacja po ekstremalnym kursie.",
    topic: "Platforma",
    difficulty: "medium",
  },
  {
    id: "fxq-57",
    question:
      "Masz strategię swingową na H4. Opóźnienie VPS 30 ms vs 2 ms w praktyce zwykle:",
    options: [
      "Decyduje o zyskowności tak samo jak edge strategii",
      "Ma marginalne znaczenie wobec kosztów transakcji i jakości setupu — nie jest głównym bottleneckiem",
      "Wymusza zakup najdroższego serwera przy każdym brokerze",
      "Eliminuje poślizg",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ma marginalne znaczenie wobec kosztów transakcji i jakości setupu — nie jest głównym bottleneckiem",
    explanation:
      "Dla swinga dominują swap, spread i duże ruchy — latencja ma znaczenie przy HFT, nie przy H4.",
    consequenceCorrect: "Inwestujesz w proces i dane, zanim przepłacasz za mikrosekundy.",
    consequenceWrong: "Przekierowanie budżetu z edukacji na kolokację — edge nadal negatywny po kosztach.",
    topic: "Infrastruktura",
    difficulty: "easy",
  },
  {
    id: "fxq-58",
    question:
      "U dwóch brokerów „1 lot” na tej samej parze daje różną wartość nominalną w jednostkach bazy. Wynika to z:",
    options: [
      "Identycznej specyfikacji na całym świecie",
      "Różnej specyfikacji kontraktu (contract size) i konwencji lota — trzeba czytać instrument",
      "Błędu wykresu",
      "Tylko z koloru platformy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Różnej specyfikacji kontraktu (contract size) i konwencji lota — trzeba czytać instrument",
    explanation:
      "Retail „lot” nie jest jednym globalnym standardem jak kontrakt futures na giełdzie.",
    consequenceCorrect: "Przeliczasz ryzyko przy migracji konta, nie kopiujesz rozmiaru 1:1.",
    consequenceWrong: "Ten sam „lot” po zmianie brokera — nieplanowana ekspozycja i margin surprise.",
    topic: "Kontrakt",
    difficulty: "medium",
  },
  {
    id: "fxq-59",
    question:
      "Ochrona przed ujemnym saldem u detala w UE (w ramach produktu) oznacza, że:",
    options: [
      "Nie możesz stracić więcej niż depozyt przed zamknięciem pozycji — margin call i zamknięcia nadal działają wcześniej",
      "Możesz lewarować bez limitu bez ryzyka",
      "Stop out jest zabroniony",
      "Broker dopłaca do każdej straty",
    ],
    correctIndex: 0,
    correctAnswer:
      "Nie możesz stracić więcej niż depozyt przed zamknięciem pozycji — margin call i zamknięcia nadal działają wcześniej",
    explanation:
      "To zabezpieczenie po ekstremalnych lukach — nie zastępuje dyskyppliny margin ani limitu strat.",
    consequenceCorrect: "Nadal zarządzasz ryzykiem jak przy pełnym depozycie, nie „bo i tak jest kaptur”.",
    consequenceWrong: "Przecenianie lewara — zamknięcia po drodze i tak niszczą konto przed teoretycznym saldem ujemnym.",
    topic: "Regulacje",
    difficulty: "medium",
  },
  {
    id: "fxq-60",
    question:
      "„Last look” po stronie dostawcy płynności oznacza dla łańcucha realizacji, że:",
    options: [
      "Masz gwarancję najlepszej ceny na świecie",
      "Kontrahent może chwilowo odrzucić lub skorygować kwotowanie — u retail często widzisz efekt jako requote/opóźnienie, nie jako bezpośrednią negocjację",
      "Znika spread",
      "Dotyczy tylko akcji GPW",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kontrahent może chwilowo odrzucić lub skorygować kwotowanie — u retail często widzisz efekt jako requote/opóźnienie, nie jako bezpośrednią negocjację",
    explanation:
      "To element mikrostruktury OTC — wpływa na to, jak szybko i po jakiej cenie market order znajduje kontrę.",
    consequenceCorrect: "Nie traktujesz każdego poślizgu jako „ataku na Ciebie” — rozumiesz warstwę LP.",
    consequenceWrong: "Winisz wyłącznie platformę, zamiast unikać marketów w skrajnej vol i rozumieć model.",
    topic: "Realizacja",
    difficulty: "hard",
  },
];
