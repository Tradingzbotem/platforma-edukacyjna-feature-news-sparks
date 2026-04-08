/** Sekcje treści lekcji — stała kolejność na stronie (jak w analiza-techniczna). */
export type FormacjeLesson = {
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

export const FORMACJE_LEKCJE: FormacjeLesson[] = [
  {
    slug: "pin-bar",
    title: "Pin bar",
    blurb:
      "Knot vs korpus, odrzucenie strefy i miejsce na wykresie — pin bez kontekstu to tylko kształt, nie przewaga.",
    intro:
      "Zobaczysz, kiedy długi knot faktycznie mówi o odrzuceniu poziomu, a kiedy jest zwykłym szumem w chaotycznym ruchu.",
    minutes: 8,
    oCoChodzi: [
      "Korpus to zakres między open a close; knot to ekstremum, które rynek „sprawdził” i odrzucił w ramach tej świecy.",
      "Pin bar sensownie interpretujesz jako odrzucenie strefy (S/R, granica konsolidacji), gdy zamknięcie wraca wyraźnie w stronę, którą chcesz grać.",
      "Miejsce ma pierwszeństwo: ten sam kształt przy reakcji na strefie vs w środku zakresu to dwie różne historie.",
      "W kontynuacji trendu pin przy pullbacku do strefy często jest „testem” popytu/podaży; w środku chaosu bez struktury — losowa walka.",
      "Sam pin bar nie daje edge: potrzebujesz HTF, strefy i planu ryzyka — inaczej to tylko atrakcyjny rysunek.",
    ],
    naCoPatrzec: [
      "Czy knot wystaje poza oczywisty poziom, a cena zamyka się z powrotem (odrzucenie), czy knot jest „wszędzie” przy wysokiej zmienności.",
      "Czy przed pinem był impuls lub jasna struktura (HH/HL albo LH/LL), a pin jest przy korekcie do strefy.",
      "Spread i sesja: przy szerokim spreadzie knot FX może wyglądać jak pin bez realnego odrzucenia instytucji.",
      "Czy to pojedyncza anomalia, czy seria podobnych knotów bez kontynuacji (często konsolidacja / szum).",
    ],
    typoweBledy: [
      "Handel każdego długiego knotu jako „pin reversal” bez strefy i bez HTF.",
      "Ignorowanie, że pin w środku range’u to często liquidity / mikrofałsz, nie setup.",
      "Zbyt ciasny SL tuż pod knotem przy normalnym ATR — wybicie i powrót bez „łamania” tezy.",
      "Traktowanie pinu jako pełnego sygnału wejścia zamiast jako elementu checklisty (strefa + kontekst + invalidation).",
    ],
    wPraktyce: [
      "Na HTF zaznacz strefę; na LTF szukaj pinu przy odrzuceniu tej strefy zgodnie z biasem, nie pod prąd bez powodu.",
      "Zdefiniuj invalidation: np. zamknięcie z powrotem przez poziom, który pin miał bronić.",
      "Unikaj wejść marketem w szczycie knotu — rozważ limit na retest ciała lub potwierdzenie kolejną świecą, jeśli tak masz w planie.",
      "Przed newsem uprość: mniej pinów „na styk”, więcej czekania na poślizg i stabilizację spreadu.",
    ],
    miniChecklista: [
      "Czy widzę konkretną strefę, którą ten knot odrzuca?",
      "Czy kierunek zgadza się z HTF / strukturą, czy gram na odwrócenie „bo ładny pin”?",
      "Czy zamknięcie potwierdza odrzucenie, czy to tylko długi knot w trendzie bez reakcji na poziomie?",
      "Czy SL jest poza szumem, a nie „1 tick za knotem”?",
      "Czy potrafię w jednym zdaniu powiedzieć, co unieważnia ten pomysł?",
    ],
  },
  {
    slug: "engulfing",
    title: "Engulfing",
    blurb:
      "Objęcie jako krótkoterminowe przejęcie kontroli — po impulsie lub przy strefie ma sens, losowo na wykresie to szum.",
    intro:
      "Zrozumiesz bullish i bearish engulfing jako zmianę balansu na jednej lub dwóch świecach — bez traktowania ich jak automatycznego wejścia.",
    minutes: 8,
    oCoChodzi: [
      "Engulfing to sytuacja, gdy nowa świeca „pochłania” zakres poprzedniej — sygnalizuje, że w tej mini-sekwencji jedna strona przejęła inicjatywę.",
      "Bullish engulfing: kupujący zdominowali zamknięcie po wcześniejszej presji sprzedaży; bearish — odwrotnie.",
      "Po impulsie engulfing w korekcie przy strefie może oznaczać kontynuację; po ekstremum przy oporze/wsparciu — potencjalne wyczerpanie / reakcję.",
      "Przy strefie S/R i zgodności z HTF engulfing ma większą wagę niż ten sam kształt w środku niczego.",
      "Świeca objęcia nie jest samodzielnym skalpem: potrzebujesz miejsca na wykresie, rozmiaru w stosunku do ATR i planu na fałsz.",
    ],
    naCoPatrzec: [
      "Czy objęcie jest w kontekście struktury (trend, korekta, retest) czy w środku boxa.",
      "Wielkość świec względem ostatnich — czy to realna zmiana, czy normalny szum na danym TF.",
      "Zamknięcie: czy ciało faktycznie przejęło kontrolę, czy dominują knoty i małe korpusy (słabsze).",
      "Sesja i dane: engulfing tuż przy publikacji może być efektem gapy/spreadu, nie „klasycznym” PA.",
    ],
    typoweBledy: [
      "Wejście na każdym engulfingu w konsolidacji — seria fałszywych przełamań.",
      "Ignorowanie kierunku HTF — kontr-trend tylko dlatego, że pojawił się bearish engulfing.",
      "Brak invalidation: gdzie ten setup jest po prostu nieaktualny po zamknięciu następnej świecy.",
      "Market w szczycie dużej świecy objęcia bez czekania na pullback lub retest.",
    ],
    wPraktyce: [
      "Łącz engulfing ze strefą: retest breakoutu, odbicie od S/R zgodne z biasem, koniec korekty w trendzie.",
      "Ustal R wg struktury (swing za świecą / za strefą), nie wg sztywnej liczby pipsów.",
      "Jeśli handlujesz kontynuację, czekaj na pullback po impulsie zamiast gonić pierwszą świecę objęcia.",
      "Ogranicz liczbę par/rynku w tym samym czasie, żeby nie brać każdego „ładnego” engulfingu.",
    ],
    miniChecklista: [
      "Czy engulfing jest przy sensownym miejscu (strefa / kontynuacja po korekcie), czy w środku range’u?",
      "Czy zgadza się to z HTF, czy to pojedyncza świeca pod prąd?",
      "Czy wielkość świec ma sens względem ATR i ostatniego ruchu?",
      "Czy mam jasne unieważnienie i rozmiar pozycji pod ten SL?",
      "Czy nie wchodzę w pościgu za świecą bez planu na ewentualny retest?",
    ],
  },
  {
    slug: "inside-bar",
    title: "Inside bar",
    blurb:
      "Zawężenie zmienności przed wybiciem — kontynuacja albo pułapka; w konsolidacji często tylko szum.",
    intro:
      "Nauczysz się czytać inside bar jako pauzę lub kompresję przed decyzją rynku, a nie jako automatyczny kierunek.",
    minutes: 8,
    oCoChodzi: [
      "Inside bar mieści się w zakresie poprzedniej świecy (mother bar) — rynek „cofa się” w mniejszym zasięgu.",
      "To zwykle zawężenie zmienności: często przed wybiciem w stronę trendu albo fałszem w drugą stronę.",
      "Wybicie z inside bara interpretujesz w kontekście: kontynuacja po impulsie vs pułapka w zakresie.",
      "Miejsce i trend mają znaczenie: inside bar na pullbacku w trendzie ≠ inside bar w środku długiej konsolidacji.",
      "W szerokim boxie wiele inside barów z rzędu generuje fałsze — wtedy lepsza jest reguła na breakout całego boxa niż każdej matki z osobna.",
    ],
    naCoPatrzec: [
      "Kierunek mother bara i struktura przed nią — czy jest wyraźny impuls do kontynuacji.",
      "Czy wybicie ma zamknięcie poza mother barem, czy tylko knot (słabsze, częstsze fałsze).",
      "HTF: czy jesteś przy decyzyjnej strefie, czy w martwym zakresie bez strony.",
      "Ile razy ten zakres był już testowany — im więcej, tym większe ryzyko przejazdu.",
    ],
    typoweBledy: [
      "Handel każdego inside bara jako breakout strategy bez filtrowania miejsca.",
      "Wejście w środku konsolidacji na każdym „wybiciu” z inside — seria strat na fałszach.",
      "Ignorowanie mother bara: duża, chaotyczna świeca newsowa jako „matka” — inside na niej ma mało wartości informacyjnej.",
      "Brak planu na fałszywe wybicie (dwustronne liquidity w range).",
    ],
    wPraktyce: [
      "Stosuj inside bar głównie zgodnie z biasem HTF: np. kontynuacja po korekcie do strefy.",
      "Czekaj na zamknięcie poza mother barem lub miej jasno zapisany trigger (np. retest), zamiast łapać pierwszy tick.",
      "W długim sideways zmniejsz aktywność albo wymagaj wybicia całego zakresu, nie pojedynczego inside.",
      "Dopasuj pozycję do ATR po wybiciu — często ruch po inside bywa gwałtowny, ale spread też.",
    ],
    miniChecklista: [
      "Czy inside bar jest w kontekście trendu/strefy, czy w środku długiej konsolidacji?",
      "Czy mother bar daje sensowny zakres, czy to świeca „po newsku” pełna szumu?",
      "Czy planuję reakcję na fałszywe wybicie (invalidation / druga strona)?",
      "Czy HTF wspiera kierunek, który gram po wybiciu?",
      "Czy nie jest to już piąty inside w tym samym boxie bez decyzji rynku?",
    ],
  },
  {
    slug: "doj-spinning-top",
    title: "Doji i spinning top",
    blurb:
      "Niezdecydowanie: mały korpus vs realna zmiana gry — przy strefie może ostrzegać, w próżni często tylko szum.",
    intro:
      "Odróżnisz moment, gdy rynek naprawdę waha się przy poziomie, od sytuacji, gdy mały korpus nic nie mówi o kolejnym ruchu.",
    minutes: 7,
    oCoChodzi: [
      "Doji / spinning top to świeca z bardzo małym korpusem względem zasięgu — rynek zamyka się blisko otwarcia po obu stronach testów.",
      "To obraz niezdecydowania: kupujący i sprzedający nie ustalili dominacji w tej jednostce czasu.",
      "Różnica między „małym korpusem” a zmianą kontroli tkwi w miejscu: przy wsparciu/oporze doji może poprzedzać reakcję; w trendzie często tylko pauza.",
      "Doji na strefie + zgodność z HTF ma większe znaczenie niż doji w środku impulsu bez poziomu.",
      "Nie handlujesz samego kształtu — potrzebujesz potwierdzenia (następna świeca, struktura, retest) albo jasnego planu ryzyka.",
    ],
    naCoPatrzec: [
      "Czy doji pojawia się przy wcześniejszej strefie reakcji, czy „na płaskim” fragmencie wykresu.",
      "Długość knotów: symetryczne knoty vs jednostronne — kontekst liquidity i presji.",
      "Wyższy TF: czy na H4/D1 nadal jest wyraźny kierunek, czy rynek jest w range.",
      "Czy po doji jest realna zmiana zamknięć (kolejne świce), czy natychmiastowy powrót do trendu bez reakcji.",
    ],
    typoweBledy: [
      "Kupno „bo doji na spadku” bez strefy i bez potwierdzenia — random entry.",
      "Traktowanie każdego spinning top jako odwrócenia w środku korekty trendu.",
      "Mieszanie TF: doji na M1 jako argument przeciw trendowi na H4.",
      "Wejście przed zamknięciem świecy, gdy „wygląda jak doji”, a potem korpus się rozrasta.",
    ],
    wPraktyce: [
      "Używaj doji jako filtra ostrzegawczego: przy strefie rozważ redukcję ryzyka, pauzę lub czekanie na potwierdzenie.",
      "Jeśli grasz reakcję, niech trigger będzie zapisany (np. przebicie high/low doji z powrotem, retest).",
      "W silnym trendzie traktuj doji jako pauzę — częściej szukaj kontynuacji po strukturze niż kontry.",
      "Na CFD/FX uwzględnij koszt przejścia przez spread — mały korpus na niskim TF bywa artefaktem.",
    ],
    miniChecklista: [
      "Czy ta „niezdecydowana” świeca jest przy realnym poziomie, czy w próżni?",
      "Czy HTF daje mi bias, czy walczę z dominującym kierunkiem „bo doji”?",
      "Czy mam konkretny trigger po doji, czy wchodzę na samym kształcie?",
      "Czy rozumiem, że doji to nie kierunek, tylko pauza / potencjalny punkt uwagi?",
      "Czy następne zamknięcia potwierdzają lub zaprzeczają mojej tezie?",
    ],
  },
  {
    slug: "falszywe-sygnaly",
    title: "Fałszywe sygnały i filtracja",
    blurb:
      "Świeca bez kontekstu, formacja w środku zakresu i brak HTF — jak odróżnić ładny pattern od użytecznego setupu.",
    intro:
      "Zamkniesz listę filtrów: kiedy „sygnał” jest tylko szumem, a kiedy możesz go rozważyć w planie z ryzykiem i miejscem na wykresie.",
    minutes: 8,
    oCoChodzi: [
      "Świeca bez kontekstu (bez strefy, trendu, sesji) to najczęściej losowy ruch — edge jest w regule, nie w jednym kształcie.",
      "Formacja w środku zakresu między dwoma ścianami to zaproszenie do fałszywych wybijań i poślizgów.",
      "Ignorowanie HTF prowadzi do gry pod prąd „bo na M5 wyglądało dobrze” — na FX/CFD to droga do serii strat.",
      "Wejście bez strefy, bez zgodności z trendem/planem i bez rozmiaru ryzyka to nie setup, tylko impuls.",
      "Użyteczny setup = miejsce + kontekst + invalidation + rozmiar pozycji; ładny pattern to tylko jeden z elementów.",
    ],
    naCoPatrzec: [
      "Gdzie jesteś względem ostatniego zakresu: przy krawędzi i strefie, czy w 50% boxa.",
      "Zgodność TF: H1/H4 vs M5 — czy nie bierzesz „sygnału” przeciwko oczywistej strukturze wyżej.",
      "Czy przed/po wydarzeniu makro — spread i knoty mogą tworzyć pseudo-formacje.",
      "Czy masz jasne „nie”: co musi się stać, żebyś nie brał tej transakcji.",
    ],
    typoweBledy: [
      "Skanowanie wykresu w poszukiwaniu nazw formacji zamiast czytania struktury.",
      "Przesuwanie strefy pod aktualną świecę, żeby „pasowała” do pin/engulfing.",
      "Handel w godzinach niskiej płynności bez uwzględnienia kosztów i fałszy.",
      "Brak dziennika: nie wiesz, które filtry realnie odrzucają sygnały, a które tylko zmniejszają FOMO.",
    ],
    wPraktyce: [
      "Napisz 3–5 reguł filtrowania (HTF, strefa, sesja, odległość od newsa) i trzymaj się ich przed każdym wejściem.",
      "Jeśli nie potrafisz wskazać invalidation i 1R w kilka sekund — pomijasz setup.",
      "Porównuj „ładny pattern” z checklistą: miejsce, kontekst, trigger, SL, cel strukturalny.",
      "Co jakiś czas rób przegląd: ile sygnałów odrzuciłeś i ile z nich było faktycznie dobrych — kalibruj filtry, nie dodawaj ich bez limitu.",
    ],
    miniChecklista: [
      "Czy widzę konkretną strefę, nie tylko kształt świecy?",
      "Czy HTF wspiera ten kierunek?",
      "Czy nie jestem w środku zakresu bez wybicia struktury?",
      "Czy mam invalidation, SL i sensowny cel (struktura), nie tylko „duży R:R na papierze”?",
      "Czy ten pomysł przeszedłby moją regułę zapisanej strategii, czy to impuls?",
    ],
  },
];

export function getFormacjeLesson(slug: string): FormacjeLesson | undefined {
  return FORMACJE_LEKCJE.find((l) => l.slug === slug);
}

export function formacjeLessonIndex(slug: string): number {
  return FORMACJE_LEKCJE.findIndex((l) => l.slug === slug);
}

export const FORMACJE_LEKCJA_SEKCJE: {
  pole: keyof Pick<
    FormacjeLesson,
    "oCoChodzi" | "naCoPatrzec" | "typoweBledy" | "wPraktyce" | "miniChecklista"
  >;
  tytul: string;
  variant: "content" | "insight" | "closing" | "caution";
  eyebrow?: string;
}[] = [
  { pole: "oCoChodzi", tytul: "O co chodzi", variant: "content", eyebrow: "Wstęp" },
  { pole: "naCoPatrzec", tytul: "Na co patrzeć na wykresie", variant: "content", eyebrow: "Obserwacja" },
  { pole: "typoweBledy", tytul: "Typowe błędy", variant: "caution", eyebrow: "Uwaga" },
  { pole: "wPraktyce", tytul: "Jak użyć tego w praktyce", variant: "content", eyebrow: "Praktyka" },
  { pole: "miniChecklista", tytul: "Mini-checklista", variant: "closing", eyebrow: "Checklista" },
];
