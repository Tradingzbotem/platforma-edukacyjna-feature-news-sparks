/** Sekcje treści lekcji — stała kolejność na stronie. */
export type AnalizaLesson = {
  slug: string;
  title: string;
  blurb: string;
  /** Jedno zdanie pod tytułem na stronie lekcji. */
  intro: string;
  minutes: number;
  oCoChodzi: string[];
  naCoPatrzec: string[];
  typoweBledy: string[];
  wPraktyce: string[];
  miniChecklista: string[];
};

export const ANALIZA_LEKCJE: AnalizaLesson[] = [
  {
    slug: "struktura-rynku",
    title: "Struktura rynku",
    blurb: "HH/HL, LH/LL, konsolidacja, zmiana charakteru ruchu oraz praca HTF + LTF bez walki z trendem.",
    intro:
      "Nauczysz się czytać sekwencję szczytów i dołków, rozumieć zakres oraz nie wchodzić agresywnie pod prąd dominującej struktury na HTF.",
    minutes: 8,
    oCoChodzi: [
      "Struktura to kolejność szczytów i dołków: wzrost to HH i HL, spadek to LH i LL.",
      "Trend to sekwencja, która się powtarza; konsolidacja to brak nowych HH/HL albo LH/LL — cena „mieli” w zakresie.",
      "Zmiana charakteru: przebicie ostatniego istotnego HL (w spadku) lub LH (w wzroście) zwykle oznacza, że rynek przestaje być jednostronny.",
      "HTF mówi „gdzie grać”, LTF „jak wejść” — nie odwrotnie.",
      "Agresywny kontr-trend na FX/CFD bez mocnej konfluencji szybko kończy się serią strat.",
    ],
    naCoPatrzec: [
      "Ostatnie swing high / swing low — czy rośnie, czy się obniża szereg szczytów i dołków.",
      "Czy cena robi impulsy i korekty w jednym kierunku, czy wraca w środek poprzedniego zakresu (brak kontroli strony).",
      "Granice konsolidacji: góra i dół boxa; czy wybicia mają sensowne zamknięcia, czy tylko knoty.",
      "Zgodność interwałów: bias z H4/D1 vs. mikrostruktura na M15/M5 — szukaj zgodności, nie konfliktu.",
    ],
    typoweBledy: [
      "Shortowanie tylko dlatego, że „już wysoko”, gdy na HTF nadal jest sekwencja HH/HL.",
      "Traktowanie pojedynczej świecy jako odwrócenia całej struktury.",
      "Wejścia „na środku niczego”, bez powiązania z ostatnim swingiem lub strefą.",
      "Ignorowanie konsolidacji i handel w środku zakresu tak, jakby to był silny trend.",
    ],
    wPraktyce: [
      "Na HTF zaznacz ostatnie istotne HH/HL lub LH/LL i nazwij bias: wzrost / spadek / zakres.",
      "Nie planuj skalpowania pod prąd HTF, dopóki nie zobaczysz wyraźnej zmiany (np. przełamanie struktury + retest).",
      "Na LTF szukaj wejścia w kierunku HTF: pullback do strefy, odrzucenie, dopiero potem ryzyko.",
      "Przed newsem lub skokiem spreadu uprość plan: albo pauza, albo szerszy bufor pod strukturą.",
    ],
    miniChecklista: [
      "Jaki jest kierunek na HTF — HH/HL, LH/LL czy zakres?",
      "Czy ostatnie wybicie faktycznie zmieniło charakter (zamknięcie), czy to był tylko knot?",
      "Czy moje wejście jest zgodne z dominującą strukturą, czy gram w kontrę „na czuja”?",
      "Czy widzę konkretny swing, pod którym lub nad którym uzasadniam SL?",
      "Czy nie wchodzę w środku konsolidacji bez planu na wybicie?",
      "Czy LTF potwierdza to, co wynika z HTF, zamiast z tym walczyć?",
    ],
  },
  {
    slug: "strefy-sr",
    title: "Strefy S/R",
    blurb: "Pasmo zamiast linii, reakcje i retesty, konfluencja ze strukturą — bez „świętego poziomu”.",
    intro:
      "Zamienisz poziomy w sensowne strefy, zobaczysz reakcje i retesty oraz połączysz to z trendem zamiast handlować każdy dotyk linii.",
    minutes: 8,
    oCoChodzi: [
      "Support i resistance to obszary, gdzie kupujący lub sprzedający wcześniej przejmowali kontrolę — nie jedna cena z kalkulatora.",
      "Poziom to uproszczenie; strefa uwzględnia spread, poślizg i mikrostrukturę.",
      "Wybicie zmienia rolę strefy: były opór po przebiciu często zaczyna działać jak podpora (i odwrotnie).",
      "Strefa „goła”, bez kontekstu trendu i struktury, nie daje automatycznej przewagi.",
      "Konfluencja = strefa + kierunek struktury + (opcjonalnie) sesja / zmienność — wtedy reakcja ma sens.",
    ],
    naCoPatrzec: [
      "Klastry odrzuceń: kilka świec z długimi knotami lub szybkim powrotem ceny do środka zakresu.",
      "Miejsce, gdzie impuls startował lub zatrzymywał się wielokrotnie — grubiej zaznacz niż cieniej.",
      "Zamknięcia po wybiciu: czy cena utrzymuje się po drugiej stronie strefy, czy wraca jak guma.",
      "Retest: powrót do przebytej granicy strefy — często tam decyduje się kontynuacja albo fałsz.",
    ],
    typoweBledy: [
      "Rysowanie dziesiątek linii i handel na każdym „dotknięciu”.",
      "Kupowanie pod supportem w silnym LH/LL tylko dlatego, że to „support”.",
      "Wejście w pierwszy knot przez strefę — bez czekania na reakcję lub zamknięcie.",
      "Ignorowanie, że strefa była testowana 5+ razy — rośnie ryzyko przejazdu.",
    ],
    wPraktyce: [
      "Zaznacz strefę od ciała świec (nie tylko ekstremów knotów), jeśli chcesz mniej szumu.",
      "Szukaj setupu przy strefie zgodnej z biasem struktury: np. odbicie od supportu w HH/HL.",
      "Po wybiciu rozważ grę na retest — mniej pościgu, więcej czekania na potwierdzenie.",
      "Przed dużymi danymi zawęż listę stref: tylko te na HTF i najbardziej oczywiste.",
    ],
    miniChecklista: [
      "Czy to jest strefa (pasmo), a nie jedna linia „na oko”?",
      "Czy cena reaguje na strefę (odrzucenie), czy stoi w środku zakresu bez strony?",
      "Czy wybicie miało sensowne zamknięcie, a retest nie jest tylko kolejnym knotem?",
      "Czy mam kontekst: trend/struktura po stronie tej strefy?",
      "Czy nie łapię noża w mocnym impulsie przeciw mojej strefie?",
      "Czy strefa nie jest już „zmęczona” zbyt wieloma testami bez reakcji?",
    ],
  },
  {
    slug: "price-action",
    title: "Price Action",
    blurb: "Wybicia, fałsze i pullbacki — świeca to nie sygnał, dopóki nie ma kontekstu.",
    intro:
      "Odróżnisz wybicia od knotów, zrozumiesz fałsze i pullbacki oraz wejdziesz dopiero wtedy, gdy kontekst potwierdza sens transakcji.",
    minutes: 8,
    oCoChodzi: [
      "Price action to czytanie decyzji z zamknięć, zakresów świec i kolejności ruchów — nie nazewnictwo formacji dla samej nazwy.",
      "Wybicie to przejście ceny przez granicę struktury (np. konsolidacji) z utrzymaniem po drugiej stronie.",
      "Fałszywe wybicie / liquidity grab: szybkie przebicie strefy, które zbiera stopy i wraca — często przy oczywistych poziomach.",
      "Pullback po impulsie to normalna faza: rynek rzadko jedzie w linii prostej.",
      "Pojedyncza świeca bez miejsca na wykresie (strefa, trend, sesja) nie jest kompletnym setupsem.",
    ],
    naCoPatrzec: [
      "Czy wybicie jest zamknięciem, czy tylko knotem przez poziom.",
      "Czy przed wybiciem była konsolidacja lub zbieżność vol — masz „co przebijać”.",
      "Czy po impulsie jest korekta do strefy / małej struktury, gdzie można szukać kontynuacji.",
      "Czy fałsz pojawia się przy oczywistym liquidity (np. ponad lokalnym high) i wraca w zakres.",
    ],
    typoweBledy: [
      "Kupowanie młota lub pinbara wszędzie, ignorując trend i HTF.",
      "Pościg za pierwszą świecą po newsku — spread i poślizg zjadają przewagę.",
      "Łączenie „sygnału świecy” z zbyt ciasnym SL pod knotem przy wysokiej zmienności.",
      "Wejście bez planu: gdzie jest nieprawidłowość setupu (invalidation).",
    ],
    wPraktyce: [
      "Zdefiniuj przed wejściem: co musi się stać, żebyś wyszedł (np. zamknięcie z powrotem w strefę).",
      "Preferuj kontynuację po pullbacku w trendzie niż łapanie każdego możliwego odwrócenia.",
      "Po wybiciu rozważ limit na retest zamiast marketu w szczycie impulsu.",
      "Ogranicz liczbę wzorców — jeden sprawdzony schemat z kontekstem bije dziesięć „na ślep”.",
    ],
    miniChecklista: [
      "Czy widzę kontekst (HTF, strefa, struktura), a nie tylko kształt świecy?",
      "Czy to wybicie z zamknięciem, czy tylko knot przez poziom?",
      "Czy nie wchodzę w pościgu za świecą bez planu na pullback?",
      "Czy przy liquidity grab czekam na powrót ceny, zamiast gonić pierwszy ruch?",
      "Czy mój SL ma sens strukturalnie, a nie „3 pipsy pod knotem”?",
      "Czy potrafię w jednym zdaniu powiedzieć, co unieważnia ten pomysł?",
    ],
  },
  {
    slug: "zmiennosc-atr",
    title: "Zmienność i ATR",
    blurb: "ATR mierzy „siłę wstrząsów” rynku — SL, R:R i trailing pod realny ruch, nie pod życzenia.",
    intro:
      "Dopasujesz SL, cele, trailing i wielkość pozycji do realnej zmienności instrumentu zamiast walczyć ze szumem i „sztywnymi” pipsami.",
    minutes: 7,
    oCoChodzi: [
      "ATR (Average True Range) szacuje typowy zasięg ruchu w oknie czasowym — to miara zmienności, nie kierunku.",
      "Za ciasny SL przy normalnym ATRze kończy się serią strat mimo słusznego kierunku.",
      "R:R musi wynikać z odległości do realnych celów strukturalnych, nie z tego, że „chcesz 1:3”.",
      "Trailing ma sens, gdy rynek buduje nowe swingi i daje miejsce — zbyt wcześnie ucinasz impuls.",
      "Pełny lot przy skoku zmienności = ten sam kierunek, ale znacznie większe wahania equity — to prosta matematyka ryzyka.",
    ],
    naCoPatrzec: [
      "Aktualna wartość ATR w stosunku do ostatnich dni/sesji — czy vol rośnie czy maleje.",
      "Odległość SL do najbliższego swinga vs. wielkość ATR — czy SL jest realny, czy losowy.",
      "Sesje i wydarzenia: ATR przed i po danych — inna skala ruchu, inne poślizgi.",
      "Czy cel (TP) sięga choćby w okolicę następnej strefy, czy jest „na styk” przy szumie.",
    ],
    typoweBledy: [
      "Ustalanie SL na sztywną liczbę pipsów dla każdego instrumentu i sesji.",
      "Wymuszanie dużego R:R przy małym ruchu wewnątrz dnia — brak miejsca na zysk.",
      "Trailing 1:1 pod każdym mikroswingiem — wyjście z dobrego trendu przez nadgorliwość.",
      "Bez zmiany lotu przy wysokim ATR — to samo 1R staje się „innym” stresem na koncie.",
    ],
    wPraktyce: [
      "Użyj ATR jako punktu odniesienia: np. SL poza strukturą, ale sprawdź, czy odległość jest porównywalna z ATR (nie absurdalna).",
      "Dopasuj rozmiar pozycji tak, by przy danym SL nadal trzymać stały procent lub kwotę ryzyka (1R).",
      "Trailing przesuwaj po zamknięciach / nowych swingach, nie co tick.",
      "W skokach vol: albo mniejsza pozycja, albo szerszy SL i mniejsza pozycja — nie „pełny lot i ciaśniejszy SL”.",
    ],
    miniChecklista: [
      "Czy mój SL jest poza typowym szumem (w kontekście ATR i struktury)?",
      "Czy cel jest osiągalny przy obecnej zmienności, a nie teoretyczny?",
      "Czy nie ucinam zysku trailingiem, zanim rynek zdążył zrobić drugą nogę ruchu?",
      "Czy przy wysokim ATR zmniejszyłem lot, żeby 1R pozostało tym samym ryzykiem?",
      "Czy nie handluję „na styk” tuż przed dużymi danymi przy rozszerzonym ATR?",
      "Czy rozumiem, że ATR nie mówi „kup” ani „sprzedaj”?",
    ],
  },
  {
    slug: "wskazniki",
    title: "Wskaźniki (filtr)",
    blurb: "EMA/MA, RSI i wolumen jako filtry — mniej narzędzi, więcej czytania ceny.",
    intro:
      "Potraktujesz EMA/MA, RSI i ewentualny wolumen jako filtry wspierające decyzję z ceny — prosto, bez nadmiaru nakładek.",
    minutes: 7,
    oCoChodzi: [
      "EMA/MA pokazują średni kierunek i miejsce częstych korekt — to filtr trendu, nie automatyczne wejście przy dotknięciu linii.",
      "RSI mierzy tempo ruchu; skrajne wartości w trendzie mogą trwać długo — to filtr skrajności, nie spustowy mechanizm.",
      "Wolumen (gdy wiarygodny na danym rynku) może potwierdzać siłę impulsu lub słabość przy wybiciu.",
      "Wskaźnik ma wspierać decyzję już podjętą na podstawie ceny i ryzyka, nie zastępować lektury wykresu.",
      "Im mniej nakładki na wykres, tym łatwiej utrzymać spójność planu — nadmiar sygnałów = chaos.",
    ],
    naCoPatrzec: [
      "Czy cena jest powyżej czy poniżej średniej, której używasz jako biasu (np. EMA 50 na HTF).",
      "Czy RSI pokazuje ekstremum w miejscu istotnej strefy, czy „na płaskim” odcinku bez kontekstu.",
      "Czy przy wybiciu rośnie wolumen (jeśli go masz), czy impuls jest „pusty”.",
      "Czy sygnały wskaźników ze sobą nie sprzeczają się bez potrzeby — np. pięć oscylatorów naraz.",
    ],
    typoweBledy: [
      "Wejście tylko dlatego, że RSI < 30 lub > 70, bez S/R i struktury.",
      "Dodawanie kolejnego wskaźnika zamiast doprecyzować regułę wejścia/wyjścia.",
      "Traktowanie przecięcia średnich jako „świętego” sygnału w konsolidacji.",
      "Ignorowanie ceny, bo „wskaźnik jeszcze nie”.",
    ],
    wPraktyce: [
      "Wybierz max. 1–2 narzędzia pomocnicze i trzymaj się ich roli: bias, skrajność lub potwierdzenie.",
      "Szukaj zgodności: np. pullback do strefy + EMA jako orientacyjny kierunek + odrzucenie ceny.",
      "RSI używaj przy dywergencji lub w strefie z HTF, nie jako pojedynczego triggera.",
      "Jeśli wolumen jest niedostępny lub mały (niektóre FX), polegaj na strukturze i spreadzie/sesji.",
    ],
    miniChecklista: [
      "Czy wskaźnik tylko potwierdza to, co widzę na cenie, a nie prowadzi decyzję?",
      "Czy nie mam na wykresie zbędnego zestawu nakładek?",
      "Czy EMA/MA zgadza się z biasem struktury, który i tak bym widział bez niej?",
      "Czy RSI rozważam tylko przy konkretnej strefie / strukturze?",
      "Czy wolumen (jeśli jest) zgadza się z narracją wybicia lub osłabienia?",
      "Czy potrafię usunąć wskaźnik i nadal uzasadnić ten sam plan samym PA?",
    ],
  },
];

export function getAnalizaLesson(slug: string): AnalizaLesson | undefined {
  return ANALIZA_LEKCJE.find((l) => l.slug === slug);
}

export function analizaLessonIndex(slug: string): number {
  return ANALIZA_LEKCJE.findIndex((l) => l.slug === slug);
}

/** Kolejność i tytuły sekcji treści (render + variant panelu na stronie lekcji). */
export const ANALIZA_LEKCJA_SEKCJE: {
  pole: keyof Pick<AnalizaLesson, "oCoChodzi" | "naCoPatrzec" | "typoweBledy" | "wPraktyce" | "miniChecklista">;
  tytul: string;
  variant: "content" | "insight" | "closing" | "caution";
  /** Nadpisuje domyślną etykietę „Sekcja” / „Uwaga” / … w panelu. */
  eyebrow?: string;
}[] = [
  { pole: "oCoChodzi", tytul: "O co chodzi", variant: "content", eyebrow: "Wstęp" },
  { pole: "naCoPatrzec", tytul: "Na co patrzeć na wykresie", variant: "content", eyebrow: "Obserwacja" },
  { pole: "typoweBledy", tytul: "Typowe błędy", variant: "caution", eyebrow: "Uwaga" },
  { pole: "wPraktyce", tytul: "Jak użyć tego w praktyce", variant: "content", eyebrow: "Praktyka" },
  { pole: "miniChecklista", tytul: "Mini-checklista", variant: "closing", eyebrow: "Checklista" },
];
