/** Sekcje treści lekcji — stała kolejność na stronie (jak w analiza-techniczna). */
export type PsychologiaLesson = {
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

export const PSYCHOLOGIA_LEKCJE: PsychologiaLesson[] = [
  {
    slug: "bledy-poznawcze",
    title: "Błędy poznawcze",
    blurb:
      "Confirmation bias, overconfidence, anchoring i recent bias — jak mózg filtruje wykres pod twoją tezę i podbija ryzyko na FX/CFD.",
    intro:
      "Zobaczysz, jak szukasz potwierdzeń zamiast faktów, przeceniasz trafienia i przyklejasz się do starej ceny — oraz jak to wyłączyć w prostych regułach przed wejściem.",
    minutes: 8,
    oCoChodzi: [
      "Confirmation bias: zbierasz argumenty „za” swoim pomysłem i ignorujesz sygnały, że setup się rozjeżdża.",
      "Overconfidence: po kilku wygranych podnosisz agresję (większy lot, więcej wejść) bez nowej przewagi w danych.",
      "Anchoring: „w głowie” zostaje stary poziom (np. dzienne high) i dalej go bronisz, choć struktura już się zmieniła.",
      "Recent bias: ostatnie 2–3 transakcje ważą więcej niż długi track record — seria zysków lub strat zniekształca ocenę prawdopodobieństwa.",
      "Widzenie tego, co chcesz zobaczyć: dopasowujesz linię trendu, strefę S/R lub „sygnał” tak, by pasowało do wejścia, które już planowałeś.",
    ],
    naCoPatrzec: [
      "Czy potrafisz wypisać jednym zdaniem warunek uniewałomnienia zanim klikniesz zlecenie.",
      "Czy szukasz dowodu przeciw (co musiałoby być nie tak), a nie tylko potwierdzeń z Twittera lub koloru świecy.",
      "Czy rozmiar pozycji rośnie po wygranej serii „bo czuję flow” — to klasyczny moment na overconfidence.",
      "Czy uzasadnienie opiera się na bieżącej strukturze i sesji, czy na „pamiętnej” cenie sprzed godzin.",
      "Czy po serii strat nie skracasz horyzontu i nie szukasz szybszego „odbicia” na słabszym setupie.",
    ],
    typoweBledy: [
      "Skracanie analizy do obrazka, który już wybrałeś w głowie — reszta wykresu jest tłem.",
      "Traktowanie jednego mocnego ruchu jako dowodu geniuszu strategii zamiast losowej próby z wysoką zmiennością.",
      "Trzymanie tezy przy przełamanej strukturze, bo „kiedyś tu był opór”.",
      "Zmiana planu w trakcie transakcji bez nowych danych — tylko dlatego, że cena „musi” wrócić.",
      "Mieszanie edukacji z grą na zładowane emocje: po stracie szukasz kolejnego wejścia „na odrabianie”.",
    ],
    wPraktyce: [
      "Przed wejściem: zapisz setup, invalidation i 1R — jeśli nie da się tego uczciwie wypełnić, nie wchodzisz.",
      "Dodaj krok „devil’s advocate”: jedna linijka „dlaczego ten trade może być zły”.",
      "Po wygranej serii utrzymaj ten sam rozmiar ryzyka co w planie tygodnia — bonus to nie powód do lewara.",
      "Odświeżaj poziomy po zmianie sesji lub ważnych danych; stary anchor bez kontekstu wyłącz.",
      "Na FX/CFD traktuj wykres jak dane wejściowe do reguły, nie jak Rorschacha pod nastrój.",
    ],
    miniChecklista: [
      "Mam zapisany warunek wyjścia zanim wejdę?",
      "Czy widzę choć jeden mocny argument przeciw mojej stronie?",
      "Czy rozmiar pozycji jest taki sam jak w planie, a nie „na skróty” po emocji?",
      "Czy poziom, który bronię, nadal ma sens strukturalny na tym TF?",
      "Czy nie wchodzę tylko dlatego, że ostatnia transakcja była stratą lub zyskiem?",
      "Czy potrafię powiedzieć głośno: „co musi się stać, żebym uznał, że się mylę”?",
    ],
  },
  {
    slug: "emocje-i-reakcje",
    title: "Emocje i reakcje",
    blurb:
      "Strach przed wejściem, FOMO, chciwość przy zysku, paraliż po stracie — mapa reakcji pod presją na żywym rynku.",
    intro:
      "Nauczysz się rozpoznawać, kiedy decyzja pochodzi z ciała (napięcie, pośpiech, „muszę coś kliknąć”), a kiedy z wcześniej ustalonego planu.",
    minutes: 8,
    oCoChodzi: [
      "Strach przed wejściem często pojawia się przy dobrym setupie po serii strat — unikasz edge’u, bo boli historia konta, nie ten konkretny rynek.",
      "FOMO to wejście bez pełnego planu, bo „ucieka okazja” — typowe przy wybiciach i newsach na FX/CFD.",
      "Chciwość przy zysku: przesuwanie celu w nieskończoność albo dokładanie pozycji bez nowej przewagi.",
      "Paraliż po stracie: zamrażasz się, nie zamykasz według planu albo odwrotnie — zamykasz impulsywnie i żałujesz.",
      "Reakcja ciała i głowy pod presją (tętno, płytki oddech, tunnel vision) obniża jakość decyzji — to sygnał, by zmniejszyć aktywność, nie zwiększać.",
    ],
    naCoPatrzec: [
      "Czy wchodzisz dlatego, że setup spełnia reguły, czy dlatego, że „już długo nic nie robiłeś”.",
      "Czy przy dynamicznym ruchu sprawdzasz spread, sesję i najbliższe dane — czy tylko kierunek świecy.",
      "Czy przy otwartym zysku masz zdefiniowany trailing lub poziom częściowego zysku, czy „zobaczymy”.",
      "Czy po stracie pierwsza myśl to „odrobienie”, a nie pauza i powrót do checklisty.",
      "Czy czujesz fizyczny pośpiech — wtedy domyślnie: pauza, mniejszy rozmiar albo zero nowych wejść.",
    ],
    typoweBledy: [
      "Wejście marketem w szczycie impulsu tylko dlatego, że rynek „pędzi”.",
      "Zamykanie zysku za wcześnie ze strachu, a potem wejście z powrotem gorzej po FOMO.",
      "Trzymanie straty w nadziei, że „jakoś wróci”, bez invalidation z planu.",
      "Handel w godzinach, gdy jesteś zmęczony lub po konflikcie — jakość spada mocniej niż myślisz.",
      "Ignorowanie, że CFD/FX reagują na newsy i sesje — emocja + chaos = losowy wynik.",
    ],
    wPraktyce: [
      "Ustal z góry: max straty dnia w R i koniec ekranu po przekroczeniu — zanim otworzysz platformę.",
      "Przy FOMO: reguła „jedna minuta + limit zamiast market” albo całkowite pominięcie wejścia poza planem.",
      "Przy zysku: zapisz z góry, czy bierzesz część na konkretnym poziomie struktury, reszta według trailingu.",
      "Po stracie: 15–30 min bez nowego trade’u — tylko notatka: co poszło nie tak (proces vs rynek).",
      "Jeśli czujesz presję czasu, zmniejsz liczbę par/instrumentów i liczbę setupów dziennie.",
    ],
    miniChecklista: [
      "Czy ten trade był w planie sesji, zanim rynek zaczął tak wyglądać?",
      "Czy sprawdziłem kalendarz i spread przed impulsywnym kliknięciem?",
      "Czy wiem, co robię ze zyskiem zanim cena tam dojdzie?",
      "Czy po stracie najpierw robię przerwę zamiast szukać następnego wejścia?",
      "Czy moje ciało jest w trybie spokojnym, a nie „pedał w podłodze”?",
      "Czy mogę wypowiedzieć plan na głos bez tłumaczenia się przed sobą?",
    ],
  },
  {
    slug: "dyscyplina-i-rutyna",
    title: "Dyscyplina i rutyna",
    blurb:
      "Plan przed wejściem, checklista, powtarzalność i ograniczenie chaosu — proces ważniejszy niż pojedynczy wynik.",
    intro:
      "Zbudujesz powtarzalny schemat przed sesją i przed zleceniem, żeby mniej decyzji zostawało na autopilocie emocji.",
    minutes: 7,
    oCoChodzi: [
      "Plan przed wejściem to nie esej — to kilka punktów: kontekst (HTF), setup, SL, cel lub regula wyjścia, rozmiar w R.",
      "Checklista redukuje „sprzedaż opowieści” samemu sobie: jak coś nie jest zaznaczone, nie ma trade’u.",
      "Powtarzalność (ta sama kolejność czynności) obniża zużycie uwagi — zostaje miejsce na rynek, nie na improwizację.",
      "Ograniczenie chaosu: mniej instrumentów, mniej stylów w jednym dniu, mniej „tylko tym razem”.",
      "Pojedynczy wynik jest szumem; oceniasz tygodnie i miesiące — inaczej łatwo ciągle zmieniasz reguły.",
    ],
    naCoPatrzec: [
      "Czy każda sesja zaczyna się od tych samych kroków (rynki, dane, lista dozwolonych setupów).",
      "Czy liczba planowanych transakcji ma górny limit — np. max 3 jakościowe wejścia zamiast 15 średnich.",
      "Czy po każdym trade’ie wypełniasz minimum jedną linijkę w notatniku (nawet „brak setupu — nie handlowałem”).",
      "Czy rozróżniasz „nudę” od „braku edge’u” — nuda jest OK, szukanie akcji za wszelką cenę nie.",
      "Czy zmieniasz reguły w trakcie tygodnia bez danych — to sygnał, że proces jest zbyt ciężki emocjonalnie.",
    ],
    typoweBledy: [
      "Plan „w głowie”, który zmienia się co świecę.",
      "Checklista tylko na papierze, nigdy przy realnym zleceniu.",
      "Mieszanie skalpu, swinga i newsów w jednym dniu bez osobnych limitów ryzyka.",
      "Ocena siebie po jednym trade’ie zamiast po próbie 20–30 podobnych setupów.",
      "Dodawanie nowych filtrów po jednej stracie zamiast po serii danych.",
    ],
    wPraktyce: [
      "Szablon przed zleceniem: instrument, kierunek, trigger, SL, TP/trailing, % lub R ryzyka — zapisz w jednym miejscu.",
      "Lista dozwolonych setupów na dziś (max 2 typy) — reszta to szum.",
      "Blok czasu na handel vs blok „tylko przegląd” — nie mieszaj bez przerwy.",
      "Raz w tygodniu 15 min: co działało w procesie, co nie — bez oceny pojedynczych złotych/stratnych trade’ów.",
      "Na CFD/FX trzymaj stałe jednostki ryzyka; zmienność obsługuj rozmiarem, nie chaosem reguł.",
    ],
    miniChecklista: [
      "Czy mam spisany plan tej konkretnej transakcji przed kliknięciem?",
      "Czy ten setup jest na mojej dzisiejszej liście dozwolonych?",
      "Czy nie łamię dziennego limitu R / liczby trade’ów?",
      "Czy oceniam dzień po procesie, a nie po ostatnim ticku?",
      "Czy ograniczyłem instrumenty i style do tego, co realnie ogarniam?",
      "Czy potrafię powiedzieć „dzisiaj zero trade’ów” bez poczucia straty?",
    ],
  },
  {
    slug: "seria-strat-i-tilt",
    title: "Seria strat i tilt",
    blurb:
      "Spirala odrabiania, revenge trading i podnoszenie ryzyka — jak zatrzymać się po dwóch złych decyzjach, zanim rozlec się tydzień.",
    intro:
      "Zrozumiesz mechanikę tiltu: dlaczego po stracie mózg domaga się szybkiej sprawiedliwości i jak twarde reguły przerywają ten łańcuch.",
    minutes: 8,
    oCoChodzi: [
      "Spirala odrabiania zaczyna się, gdy ważniejsza staje się „równanie konta” niż jakość kolejnego setupu.",
      "Revenge trading to wejście bez przewagi, często większym ryzykiem, żeby „odzyskać” poprzednią stratę.",
      "Zwiększanie ryzyka po stracie to podwójny hazard: ryzykujesz więcej w momencie emocjonalnego przeciążenia.",
      "Pauza jest częścią edge’u — rynek jutro nadal będzie; konto musi przetrwać serię niekorzystnej wariancji.",
      "Dwa złe trade’y z rzędu mogą być normalne; problem zaczyna się przy trzecim „na siłę” bez resetu.",
    ],
    naCoPatrzec: [
      "Czy po stracie skracasz czas analizy i pomijasz checklistę.",
      "Czy rozmiar kolejnej pozycji jest większy niż zaplanowane 1R.",
      "Czy szukasz bardziej „agresywnego” instrumentu tylko dlatego, że poprzedni był spokojny i zabrał stratę.",
      "Czy myślisz w kategoriach „muszę to dziś odrobić” zamiast „czy setup jest A-grade”.",
      "Czy pojawia się poczucie krzywdy wobec rynku — to silny predyktor tiltu.",
    ],
    typoweBledy: [
      "Podwajanie lotu po stracie „żeby wrócić na zero”.",
      "Przenoszenie frustracji na inny instrument z większą zmiennością.",
      "Ignorowanie dziennego limitu strat, bo „jeszcze jeden trade naprawi dzień”.",
      "Handel w godzinach po pracy bez regeneracji — kumulacja zmęczenia i strat.",
      "Tłumaczenie revenge trade’u jako „ostatecznie setup był dobry”.",
    ],
    wPraktyce: [
      "Reguła twardej pauzy: 2 straty z rzędu → koniec nowych wejść na X minut lub do następnej sesji.",
      "Po serii strat: tylko tryb demo lub przegląd wykresów bez zleceń, dopóki nie wypełnisz krótkiej retrospektywy.",
      "Zapisz maks. dzienne straty w R w planie tygodnia — broker nie zrobi tego za ciebie.",
      "Jeśli czujesz tilt, zamknij platformę fizycznie — na telefonie usuń skrót na jeden dzień.",
      "Pamiętaj: na FX/CFD seria strat przy poprawnym 1R może być wariancją; seria revenge tradingu to już błąd procesu.",
    ],
    miniChecklista: [
      "Ile mam już strat z rzędu i czy osiągnąłem limit pauzy?",
      "Czy rozmiar tej pozycji jest taki sam jak w planie, nie „powiększony”?",
      "Czy potrafię wskazać pełny setup, czy tylko „muszę coś zrobić”?",
      "Czy minęło minimum X minut od ostatniej straty?",
      "Czy dzisiejsza strata nie przekracza limitu dnia?",
      "Czy gdybym doradzał koledze, poleciłbym mu teraz handel?",
    ],
  },
  {
    slug: "dziennik-i-retrospektywa",
    title: "Dziennik i retrospektywa",
    blurb:
      "Po co zapisywać, co warto notować i jak odróżnić błąd procesu od zwykłej straty — tygodniowa i miesięczna retrospektywa.",
    intro:
      "Ułożysz prosty dziennik pod FX/CFD: krótkie wpisy, które pokazują, czy tracisz przez execution, przez overtrading, czy przez wariancję przy dobrym planie.",
    minutes: 8,
    oCoChodzi: [
      "Dziennik to pamięć zewnętrzna — bez niego mózg buduje historię pod aktualny nastrój (zwłaszcza po tiltach).",
      "Warto zapisywać: kontekst (sesja, newsy), setup wg twojej nazwy, wynik w R, czy plan był przestrzegany, jedno zdanie „dlaczego”.",
      "Wnioski wyciągasz z powtarzających się wzorców, nie z jednego trade’u — pojedyncza strata może być kosztem edge’u.",
      "Błąd procesu: złamałeś regułę (np. bez SL, oversize, poza planem). Zwykła strata: plan OK, wynik niekorzystny statystycznie.",
      "Retrospektywa tygodniowa / miesięczna: ile było A-setupów, ile B, ile „śmieciowych” wejść, gdzie uciekało ryzyko.",
    ],
    naCoPatrzec: [
      "Czy większość strat pochodzi z jednego typu błędu (np. FOMO po danych).",
      "Czy zyskowne dni mają wspólny wzorzec czasu lub instrumentów.",
      "Czy „plan niezadany” pojawia się częściej niż „rynek zrobił coś nieprzewidywalnego”.",
      "Czy dziennik jest na tyle krótki, że realnie go wypełniasz — jeśli nie, uprość go o połowę.",
      "Czy miesiąc zamykasz z oceną procesu, a nie tylko z kwotą na koncie.",
    ],
    typoweBledy: [
      "Pisanie romansów zamiast 5 pól formularza — po tygodniu przestajesz.",
      "Ocena trade’u tylko po wyniku: zły = zły plan, dobry = geniusz.",
      "Brak tagów (FOMO, news, poza planem) — potem nie da się filtrować.",
      "Retrospektywa „w głowie” podczas prysznica — bez liczb to storytelling.",
      "Kopiowanie cudzych szablonów bez pól, które ty faktycznie chcesz śledzić.",
    ],
    wPraktyce: [
      "Minimalny wpis: data, instrument, long/short, R zysku/straty, zgodność z planem (tak/nie), jeden tag.",
      "Co niedziela 20 min: 3 pytania — co powtarzało się w błędach, co działało, co zmieniam w przyszłym tygodniu (max 1 zmiana).",
      "Miesięcznie: rozkład R, liczba trade’ów, % poza planem — jeśli >20% poza planem, problem nie jest w „edge’u”.",
      "Odróżnij: „strata po przestrzeganiu planu” vs „strata po złamaniu planu” — tylko druga wymaga zmiany zachowania.",
      "Na FX/CFD dopisz przy wpisie spread/slippage jeśli był ekstremalny — inaczej winisz setup.",
    ],
    miniChecklista: [
      "Czy każdy trade ma choć jedną linię notatki w dniu zdarzenia?",
      "Czy taguję emocjonalne / pozaplanowe wejścia?",
      "Czy raz w tygodniu przeglądam więcej niż ostatnie 3 wpisy?",
      "Czy potrafię wskazać ostatni błąd procesu vs ostatnią „zwykłą” stratę?",
      "Czy moja retrospektywa kończy się jedną konkretną zmianą na następny tydzień?",
      "Czy dziennik jest tak prosty, że go nie odkładam „na później”?",
    ],
  },
];

export function getPsychologiaLesson(slug: string): PsychologiaLesson | undefined {
  return PSYCHOLOGIA_LEKCJE.find((l) => l.slug === slug);
}

export function psychologiaLessonIndex(slug: string): number {
  return PSYCHOLOGIA_LEKCJE.findIndex((l) => l.slug === slug);
}

export const PSYCHOLOGIA_LEKCJA_SEKCJE: {
  pole: keyof Pick<
    PsychologiaLesson,
    "oCoChodzi" | "naCoPatrzec" | "typoweBledy" | "wPraktyce" | "miniChecklista"
  >;
  tytul: string;
  variant: "content" | "insight" | "closing" | "caution";
  eyebrow?: string;
}[] = [
  { pole: "oCoChodzi", tytul: "O co chodzi", variant: "content", eyebrow: "Wstęp" },
  { pole: "naCoPatrzec", tytul: "Na co zwracać uwagę", variant: "content", eyebrow: "Obserwacja" },
  { pole: "typoweBledy", tytul: "Typowe błędy", variant: "caution", eyebrow: "Uwaga" },
  { pole: "wPraktyce", tytul: "Jak użyć tego w praktyce", variant: "content", eyebrow: "Praktyka" },
  { pole: "miniChecklista", tytul: "Mini-checklista", variant: "closing", eyebrow: "Checklista" },
];
