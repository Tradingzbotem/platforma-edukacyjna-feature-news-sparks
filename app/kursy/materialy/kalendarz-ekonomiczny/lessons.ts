/** Sekcje treści lekcji — stała kolejność na stronie (jak w analiza-techniczna). */
export type KalendarzEkonomLesson = {
  slug: string;
  title: string;
  blurb: string;
  intro: string;
  minutes: number;
  oCoChodzi: string[];
  naCoPatrzec: string[];
  typoweBledy: string[];
  wPraktyce: string[];
  miniChecklista: string[];
};

export const KALENDARZ_EKONOMICZNY_LEKCJE: KalendarzEkonomLesson[] = [
  {
    slug: "jak-czytac-kalendarz",
    title: "Jak czytać kalendarz",
    blurb:
      "Godzina, waluta, expected/previous/actual i ważność — które wydarzenia naprawdę ruszają FX/CFD, a które są tylko szumem w nagłówku.",
    intro:
      "Nauczysz się czytać wiersz w kalendarzu jak checklistę ryzyka: co dotyczy jakiej waluty, o której godzinie serwer/broker pokazuje dane i co oznacza rozrzut prognoz.",
    minutes: 8,
    oCoChodzi: [
      "Godzina publikacji musi być w tej samej strefie co twój broker/platforma — inaczej „przegapisz” okno albo wejdziesz myląc czas.",
      "Waluta wydarzenia mówi, które pary najpierw dostały impuls (np. USD przy NFP, GBP przy brytyjskich danych).",
      "Expected (prognoza), previous (poprzedni odczyt) i actual (faktyczny) pozwalają ocenić, czy rynek dostaje zaskoczenie względem konsensusu, nie względem twojej intuicji.",
      "Ważność (gwiazdki / kolor) to przybliżony filtr — im wyższa, tym większe prawdopodobieństwo skoku spreadu i zmienności na CFD/FX.",
      "Rynek realnie respektuje wydarzenia, które zmieniają oczekiwania co do stóp, inflacji lub wzrostu — reszta bywa krótkim szumem lub już w cenie.",
    ],
    naCoPatrzec: [
      "Czy w kalendarzu jest kilka publikacji w tej samej godzinie — sumaryczny chaos bywa większy niż przy pojedynczym evencie.",
      "Czy actual odbiega od konsensusu mocno, czy „w linii” — drugi przypadek często daje mniejszą, krótszą reakcję.",
      "Czy poprzedni odczyt był rewizją — czasem ważniejsza jest rewizja niż sam headline.",
      "Czy para, którą handlujesz, ma bezpośrednią ekspozycję na tę walutę, czy tylko pośrednią korelacją.",
      "Czy Twój broker podaje czas w GMT, CET czy czasie serwera — zapisz to raz na stałe w notatniku.",
    ],
    typoweBledy: [
      "Handel „bo jest gwiazdka”, bez sprawdzenia, czy dane faktycznie dotyczą twojej pary i horyzontu.",
      "Myślenie, że „dobre dla gospodarki” = zawsze wzrost waluty — kontekst stóp i oczekiwań jest ważniejszy.",
      "Ignorowanie różnicy czasu letni/zimowy między źródłem kalendarza a platformą.",
      "Traktowanie każdego PMI jak NFP — skala ruchu i płynność bywają zupełnie inne.",
      "Czytanie tylko actual bez previous i forecast — bez tego nie wiesz, co było zaskoczeniem.",
    ],
    wPraktyce: [
      "Rano zaznacz w kalendarzu 2–3 „twarde” godziny na dziś i ustaw alarm 5–10 min wcześniej na przegląd spreadu.",
      "Przy wydarzeniu walutowym najpierw nazwij ryzyko dla pary (np. EUR/USD + USD), potem dopiero szukaj setupu.",
      "Zrób listę 8–12 publikacji, które ty realnie respektujesz na swoim rynku — resztę traktuj jako drugorzędną.",
      "W platformie sprawdź, jak wygląda typowy spread 2–3 min przed i 2–3 min po podobnych danych w przeszłości (notatki).",
      "Jeśli jest kilka ważnych odczytów naraz, załóż domyślnie tryb obronny: mniejszy rozmiar lub brak nowych wejść.",
    ],
    miniChecklista: [
      "Czy godzina jest przeliczona na czas mojego brokera?",
      "Czy wiem, której waluty dotyczy publikacja?",
      "Czy widzę forecast, previous i actual (gdy już jest)?",
      "Czy ta publikacja jest na mojej liście high-impact?",
      "Czy sprawdziłem, czy nie ma drugiego ważnego wydarzenia w tej samej minucie?",
      "Czy moja para jest w pierwszej linii reakcji, czy tylko „przyległa”?",
    ],
  },
  {
    slug: "dane-najwazniejsze",
    title: "Dane najważniejsze",
    blurb:
      "CPI, NFP, PMI, decyzje stóp, konferencje banków centralnych, PKB, inflacja, bezrobocie, sprzedaż detaliczna — co zwykle porusza FX/CFD i dlaczego.",
    intro:
      "Uporządkujesz, które dane zmieniają dyskontowanie przyszłych stóp procentowych, a które częściej dają krótki impuls bez trwałego trendu.",
    minutes: 8,
    oCoChodzi: [
      "CPI (inflacja konsumencka) wpływa na oczekiwania co do polityki pieniężnej — na FX często mocniej niż pojedynczy odczyt wzrostu PKB.",
      "NFP (płace poza rolnictwem) to klasyk zmienności na parach z USD: szybkie pierwsze ruchy, potem często filtracja.",
      "PMI (przemysł / usługi) pokazuje impuls koniunktury; reakcja bywa krótsza niż przy CPI, chyba że zbiega się z narracją banku centralnego.",
      "Decyzje stóp i konferencje (Fed, ECB, BoE…) ustawiają ramy na tygodnie — tu ważne są projekcje i ton, nie tylko liczba.",
      "PKB, bezrobocie, sprzedaż detaliczna w praktyce: patrzysz na odchylenie od prognozy i rewizje poprzednich odczytów, nie na sam nagłówek „wzrost/spadek”.",
    ],
    naCoPatrzec: [
      "Czy dziś jest „risk day” dla dolara (np. CPI + Fed w tym samym tygodniu) — korelacje na indeksach CFD mogą się spiąć.",
      "Czy rynek już „wycenił” oczekiwania (np. po wypowiedziach z Fed) — wtedy actual musi mocno zaskoczyć.",
      "Czy publikacja jest headline czy core (np. core CPI) — dla stóp często ważniejsza jest miara bazowa.",
      "Czy w kalendarzu jest wstępny vs finalny odczyt — final bywa mniej dramatyczny, jeśli wstępny był ekstremalny.",
      "Czy na parach krzyżowych reakcja rozdziela się między dwie waluty naraz (np. dane EUR i USD tego samego dnia).",
    ],
    typoweBledy: [
      "Traktowanie każdego odczytu CPI jak „trade of the year” bez planu na poślizg.",
      "Wejście na NFP „na zasadzie”, że zawsze jest trend w jedną stronę — pierwszy ruch bywa fałszywy.",
      "Ignorowanie konferencji po decyzji stóp — tam często jest prawdziwy ruch.",
      "Handel newsów na parach egzotycznych przy szerokim spreadzie „bo tam też jest USD”.",
      "Łączenie w jednym trade’ie kilku niezależnych narracji makro bez hierarchii.",
    ],
    wPraktyce: [
      "Zrób własną tabelę: publikacja → typowa para → typowy profil (spike / trend / fade) wg twoich notatek.",
      "Przed CPI/NFP: zdecyduj z góry, czy jesteś w trybie obserwacji, zmniejszonego ryzyka, czy masz konkretny plan newsowy.",
      "Po decyzji stóp: pierwsze minuty to często chaos — jeśli nie masz procedury, ustaw domyślnie „czekam na konferencję”.",
      "Na CFD indeksach sprawdź, czy dany release dotyczy głównej gospodarki indeksu (US500 vs dane USA itd.).",
      "Trzymaj się listy publikacji, które realnie handlujesz — reszta to opcjonalny szum.",
    ],
    miniChecklista: [
      "Czy wiem, która dokładnie metryka jest publikowana (headline vs core, preliminary vs final)?",
      "Czy to wydarzenie jest na mojej liście A-grade?",
      "Czy sprawdziłem, czy w tym samym oknie nie ma przemówienia członka banku centralnego?",
      "Czy rozumiem, czy rynek szuka tu wzrostu stóp, czy recesji — jaka jest dominująca narracja?",
      "Czy moja para ma bezpośredni zwrot do tej waluty?",
      "Czy mam plan na spread i poślizg, jeśli i tak chcę brać udział?",
    ],
  },
  {
    slug: "zmiennosc-przed-i-po-danych",
    title: "Zmienność przed i po danych",
    blurb:
      "Spread, knoty, fake first move, poślizg — różnica między wejściem przed publikacją a reakcją tuż po niej na FX/CFD.",
    intro:
      "Zobaczysz, jak rynek zawęża się przed danymi, a po release potrafi najpierw zrobić pozorny kierunek — i jak to wpływa na realizację zleceń.",
    minutes: 8,
    oCoChodzi: [
      "Przed danymi spread często się rozszerza — ten sam nominalny SL może być trafiony przez koszt wejścia, nie przez tezę.",
      "Gwałtowne knoty to normalna próba płynności: szybkie przebicie poziomu i powrót, szczególnie przy zaskoczeniu i grubych zleceniach.",
      "Fake first move: pierwszy impuls bywa przeciwko „logice” nagłówka, bo rynek dyskontuje rewizje, forward guidance lub pozycjonowanie.",
      "Poślizg przy marketach w pierwszych sekundach bywa większy niż w testach na spokojnym rynku — limit nie zawsze wypełni się po żądanej cenie.",
      "Wejście przed publikacją to gra na przewadze informacyjnej, której retail nie ma; reakcja po publikacji to gra na wykonaniu i dyscyplinie po chaosie.",
    ],
    naCoPatrzec: [
      "Jak zmienia się spread 30–60 s przed release na twoim koncie — zapisz typowe wartości dla twoich par.",
      "Czy pierwsza świeca po danych ma szeroki knot vs zamknięcie — to podpowiada, czy rynek „wchłonął” zaskoczenie.",
      "Czy wolumen/płynność na danym instrumencie w ogóle pozwala na sensowny exit w pierwszych sekundach.",
      "Czy twoja strategia zakłada fade pierwszego ruchu czy kontynuację — to musi być z góry, nie „po fakcie”.",
      "Czy masz bufor na SL dalej niż „ładny poziom”, gdy ATR i spread skaczą jednocześnie.",
    ],
    typoweBledy: [
      "Ustalanie takiego samego SL jak w spokojny dzień, gdy spread przed newsami jest podwójny.",
      "Ściganie pierwszego ticka po danych marketem bez akceptacji poślizgu.",
      "Interpretowanie pierwszego ruchu jako „prawdy” bez poczekania na zamknięcie świecy M1/M5.",
      "Wejście „tuż przed” bez świadomości, że broker może podnieść marginę lub odrzucać modyfikacje.",
      "Handel na parach z szerokim spreadem „bo akurat tam widzę setup”.",
    ],
    wPraktyce: [
      "Ustal z góry: przed high-impact nie otwieram nowych pozycji X minut, albo otwieram tylko z połową normalnego ryzyka.",
      "Jeśli grasz po danych: pierwsze 1–2 minuty obserwacja spreadu i knotów — wejście dopiero po pierwszym sensownym zamknięciu wg twojej reguły.",
      "Preferuj limity tam, gdzie akceptujesz brak wypełnienia; market tam, gdzie akceptujesz poślizg.",
      "Po skoku rozważ handel na instrumentie z węższym spreadem w danej sesji.",
      "Zapisuj jednym zdaniem, jak zachował się rynek po twoich ostatnich 5 newsach — budujesz własną bibliotekę zachowań.",
    ],
    miniChecklista: [
      "Czy sprawdziłem bieżący spread vs średni dzienny?",
      "Czy mój SL uwzględnia rozszerzenie spreadu i knot?",
      "Czy wiem, czy gram przed, w pierwszych sekundach, czy po pierwszym zamknięciu?",
      "Czy akceptuję możliwy poślizg przy zleceniu market?",
      "Czy nie zwiększam lewara tuż przed publikacją?",
      "Czy mam zdefiniowane, co robię, gdy pierwszy ruch jest przeciwko mnie?",
    ],
  },
  {
    slug: "kiedy-nie-handlowac",
    title: "Kiedy nie handlować",
    blurb:
      "Brak przewagi w chaosie, wąski SL przy newsach, handel tuż przed danymi — kiedy pauza jest silniejszą decyzją niż zgadywanie.",
    intro:
      "Określisz proste reguły „czerwonej strefy”: kiedy rynek nie płaci za twoje ryzyko wykonania, nawet jeśli wykres wygląda „ładnie”.",
    minutes: 7,
    oCoChodzi: [
      "Bez przewagi przy chaosie: gdy spread, poślizg i zmienność zjadają typowy R:R twojego setupu, nie masz matematycznej przewagi.",
      "Publikacje wysokiej wagi mogą unieważnić techniczny poziom w sekundę — setup był dobry „przed”, nie „w trakcie”.",
      "Handel tuż przed danymi to często losowy wynik mimo poprawnej analizy — ryzyko wykonania dominuje.",
      "Wąski SL w czasie newsów jest trafiany przez szum, nie przez zmianę tezy — to najczęstszy powód serii strat w release.",
      "Lepiej poczekać niż zgadywać, gdy nie masz procedury na dany typ wydarzenia — brak trade’u też jest pozycją.",
    ],
    naCoPatrzec: [
      "Czy przed tobą jest publikacja z twojej listy A-grade w ciągu 15–30 minut.",
      "Czy spread już rośnie i realizacja zlecenia jest nieprzewidywalna.",
      "Czy próbujesz „dopchnąć” dzienny plan zysku, gdy warunki się pogorszyły.",
      "Czy śpisz krócej / jesteś zmęczony — to zwiększa skłonność do łamania reguł niehandlowania.",
      "Czy masz już dzienne straty blisko limitu — kolejny trade w newsach to często tilt.",
    ],
    typoweBledy: [
      "„Tylko mała pozycja przed CPI” — mała pozycja nadal może mieć duży poślizg i zły stosunek kosztu do potencjału.",
      "Upraszczanie: „jak się okaże, to wyjdę” bez konkretnego poziomu invalidation.",
      "Handel podczas przemówienia szefa banku centralnego przy włączonym dźwięku nagłówków — emocja zamiast planu.",
      "Ignorowanie podwyższonej marginy u brokera w oknach newsowych.",
      "Przekonanie, że skalper musi zawsze coś robić — wysoka częstotliwość w złych warunkach niszczy konto.",
    ],
    wPraktyce: [
      "Ustal twarde okno: np. od T-5 min do T+5 min przy wybranych publikacjach — zero nowych zleceń.",
      "Jeśli masz otwartą pozycję przed newsami: z góry decyzja — zmniejszyć, zamknąć, lub świadomie zaakceptować skok.",
      "W dniach z kilkoma ważnymi wydarzeniami rozważ skrócenie sesji handlowej do godzin „pomiędzy”.",
      "Traktuj pauzę jako część strategii — zapisuj w dzienniku dni bez trade’ów przy wysokim ryzyku makro.",
      "Na CFD sprawdź specyfikę instrumentu (np. indeks vs FX) — indeks może reagować na dane z głównej gospodarki nawet, gdy patrzysz na „technikalia”.",
    ],
    miniChecklista: [
      "Czy w najbliższych minutach jest high-impact na mojej liście?",
      "Czy spread i warunki wykonania są w normie dla mojego setupu?",
      "Czy próbuję odrobić dzień / tydzień zamiast szukać edge’u?",
      "Czy mój SL ma sens przy tym spreadzie i ATR?",
      "Czy potrafię wskazać przewagę oprócz „ładnego kształtu” na wykresie?",
      "Czy gdybym nie mógł handlować, poczułbym ulgę? (czasem to sygnał)",
    ],
  },
  {
    slug: "scenariusze-i-przygotowanie",
    title: "Scenariusze i przygotowanie",
    blurb:
      "Plan A/B/C przed publikacją, poziomy, obserwacja po danych i wejście po uspokojeniu — mniej improwizacji na żywym CFD/FX.",
    intro:
      "Ułożysz prostą procedurę: co robisz przed godziną zero, jak zaznaczasz poziomy i kiedy dopuszczasz wejście dopiero po pierwszym etapie dyskontowania.",
    minutes: 8,
    oCoChodzi: [
      "Plan A/B/C: z góry opisujesz, co robi rynek w reakcji na zaskoczenie w obie strony i w scenariuszu „w konsensusie” — bez tego reagujesz emocją.",
      "Przed publikacją: reset spreadu, zaznaczone kluczowe strefy na HTF, decyzja czy w ogóle bierzesz udział.",
      "Poziomy zaznaczasz od struktury sprzed newsów — po impulsie aktualizujesz, zamiast dopasowywać linię pod pozycję.",
      "Po danych obserwujesz: pierwszy kierunek, zamknięcie, czy wraca do zakresu, jak zachowuje się spread.",
      "Wejście po uspokojeniu oznacza akceptację tego, że ominiesz część ruchu — w zamian dostajesz czytelniejsze wykonanie.",
    ],
    naCoPatrzec: [
      "Czy masz zapisane trzy warianty zachowania ceny i odpowiadające im akcje (wejście / brak / redukcja).",
      "Czy poziomy są z HTF i z sesji przed newsami, nie „dorysowane” po pierwszej świecy.",
      "Czy pierwsza fala po danych zamknęła się jako kontynuacja czy jako fade — to filtruje, który plan jest aktywny.",
      "Czy kolejna publikacja za godzinę nie zdezawuuje twojego scenariusza — czasem lepiej poczekać na cały blok.",
      "Czy twoje cele są osiągalne przy typowym poślizgu na tej parze.",
    ],
    typoweBledy: [
      "Jeden scenariusz w głowie i frustracja, gdy rynek wybierze inny.",
      "Brak planu na brak wejścia — czujesz przymus działania.",
      "Zbyt wiele poziomów na wykresie; w chaosie nie wiesz, który jest ważny.",
      "Wejście „na pierwszy ruch” bez reguły potwierdzenia.",
      "Zmiana planu w trakcie, bo nagłówek był „zły”, a cena poszła „dobrze” — to już nie jest testowany edge.",
    ],
    wPraktyce: [
      "Na kartce / w notatniku: jeśli actual > forecast robi X na wykresie, to robię Y; jeśli <, to Z; jeśli w konsensusie — domyślnie nie gram lub tylko fade ekstremum wg reguły.",
      "Zaznacz przed newsami range ostatnich 30–60 min i poziomy HTF — po danych widzisz, czy jesteś nadal w zakresie.",
      "Pierwsze 2–5 min: tylko obserwacja i notatka — jeśli nie masz trybu „szybki skalp newsowy”, nie dodawaj go ad hoc.",
      "Wejście po uspokojeniu: np. pierwsze zamknięcie M5 zgodne z kierunkiem planu A i spread wrócony do normy.",
      "Po sesji z newsami: jedna linijka, który plan zadziałał — budujesz bibliotekę, nie kolekcję wymówek.",
    ],
    miniChecklista: [
      "Czy mam spisane A/B/C przed publikacją?",
      "Czy wiem, co robię, gdy pierwszy ruch jest przeciwko scenariuszowi A?",
      "Czy moje poziomy pochodzą z pre-newsowej struktury?",
      "Czy ustaliłem, po jakim sygnale (czas / zamknięcie / spread) wolno mi wejść?",
      "Czy akceptuję pominięcie pierwszej fali na rzecz lepszego wykonania?",
      "Czy po blokach makro planuję krótszą sesję lub tylko przegląd?",
    ],
  },
];

export function getKalendarzEkonomLesson(slug: string): KalendarzEkonomLesson | undefined {
  return KALENDARZ_EKONOMICZNY_LEKCJE.find((l) => l.slug === slug);
}

export function kalendarzEkonomLessonIndex(slug: string): number {
  return KALENDARZ_EKONOMICZNY_LEKCJE.findIndex((l) => l.slug === slug);
}

export const KALENDARZ_EKONOMICZNY_LEKCJA_SEKCJE: {
  pole: keyof Pick<
    KalendarzEkonomLesson,
    "oCoChodzi" | "naCoPatrzec" | "typoweBledy" | "wPraktyce" | "miniChecklista"
  >;
  tytul: string;
  variant: "content" | "insight" | "closing" | "caution";
  eyebrow?: string;
}[] = [
  { pole: "oCoChodzi", tytul: "O co chodzi", variant: "content", eyebrow: "Wstęp" },
  { pole: "naCoPatrzec", tytul: "Na co patrzeć na rynku", variant: "content", eyebrow: "Obserwacja" },
  { pole: "typoweBledy", tytul: "Typowe błędy", variant: "caution", eyebrow: "Uwaga" },
  { pole: "wPraktyce", tytul: "Jak użyć tego w praktyce", variant: "content", eyebrow: "Praktyka" },
  { pole: "miniChecklista", tytul: "Mini-checklista", variant: "closing", eyebrow: "Checklista" },
];
