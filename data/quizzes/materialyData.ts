import type { DataMcqRow } from "./dataMcqRow";

export const MATERIALY_QUIZ_DATA: DataMcqRow[] = [
  {
    id: "mat-01",
    question: "Formacja „młot” (hammer) to najczęściej:",
    options: [
      "Sygnał kontynuacji spadków",
      "Byczy sygnał odwrócenia",
      "Formacja neutralna",
      "Sygnał odwrotu trendu wzrostowego w dół (bearish)",
    ],
    correctIndex: 1,
    correctAnswer: "Byczy sygnał odwrócenia",
    explanation:
      "Młot przy dolnej świecy i długim dolnym cieniu sugeruje odrzucenie niższych cen — kontekst trendu i potwierdzenie są kluczowe.",
    consequenceCorrect:
      "Nie traktujesz pojedynczej świecy jako pewnego kupna — szukasz potwierdzenia i poziomu ryzyka.",
    consequenceWrong:
      "Łapanie „młota” w silnym downtrendzie bez kontekstu to często łapanie noża — wchodzisz marketem pod impuls, SL jest ciasny względem zmienności, więc jedna kontynuacja trendu realizuje stratę większą niż planowane ryzyko.",
    topic: "Świece",
    difficulty: "medium",
  },
  {
    id: "mat-02",
    question: "RSI powyżej 70 zwykle interpretuje się jako:",
    options: ["Wyprzedanie", "Wykupienie", "Brak trendu", "Sygnał kupna zawsze"],
    correctIndex: 1,
    correctAnswer: "Wykupienie",
    explanation:
      "RSI >70 oznacza silny impuls wzrostowy w oknie — to stan wykupienia, nie automatyczna sprzedaż (trend może trwać dalej).",
    consequenceCorrect:
      "Szukasz dywergencji lub struktury, zamiast shortować tylko dlatego, że RSI jest wysoki.",
    consequenceWrong:
      "Kontr-trend „bo RSI 80” bez struktury kończy się stop-outem w trendzie — płacisz serią strat na „wygaszonym” oscylatorze, podczas gdy cena dalej idzie z impetem i Twój kapitał się kurczy.",
    topic: "Oscylatory",
    difficulty: "easy",
  },
  {
    id: "mat-03",
    question: "Raport NFP (USA) zwykle publikowany jest:",
    options: [
      "W każdy poniedziałek",
      "W pierwszy piątek miesiąca",
      "W ostatnią środę miesiąca",
      "Raz na kwartał",
    ],
    correctIndex: 1,
    correctAnswer: "W pierwszy piątek miesiąca",
    explanation:
      "NFP to stały rytm kalendarza USA — pierwszy piątek miesiąca, zwykle z dużą zmiennością na USD i aktywach powiązanych.",
    consequenceCorrect:
      "Planujesz rozmiar i zlecenia świadomie w tym oknie, zamiast być zaskoczonym spreadem.",
    consequenceWrong:
      "Wejście tuż przed NFP „jak co dzień” to często losowy koszt realizacji — spread i poślizg rosną, więc nawet „dobry” kierunek kończy się stratą na egzekucji przy pełnym rozmiarze.",
    topic: "Kalendarz",
    difficulty: "easy",
  },
  {
    id: "mat-04",
    question: "Poziomy wsparcia/oporu w AT to:",
    options: [
      "Obszary, gdzie popyt/podaż historycznie zatrzymywały ruch ceny",
      "Linie wyłącznie rysowane co 10 pipsów",
      "Poziomy z kalendarza makro",
      "Miejsca, gdzie spread zawsze rośnie",
    ],
    correctIndex: 0,
    correctAnswer: "Obszary, gdzie popyt/podaż historycznie zatrzymywały ruch ceny",
    explanation:
      "S/R wynika z powtarzających się reakcji rynku na strefę — to nie arbitralna siatka co X pipów.",
    consequenceCorrect:
      "Rysujesz strefy reakcji, nie magiczne linie bez historii.",
    consequenceWrong:
      "Sztywna siatka ignoruje strukturę rynku — stawiasz zlecenia tam, gdzie rynek nie ma pamięci reakcji; SL wpada w szum, a koszt serii małych strat obniża kapitał bez realnego edge.",
    topic: "S/R",
    difficulty: "easy",
  },
  {
    id: "mat-05",
    question: "„1% ryzyka na transakcję” oznacza, że:",
    options: [
      "Potencjalna strata do SL to max 1% kapitału",
      "Pozycja ma wielkość 1% wolumenu rynku",
      "Zysk zawsze wyniesie 1%",
      "Prowizja to 1%",
    ],
    correctIndex: 0,
    correctAnswer: "Potencjalna strata do SL to max 1% kapitału",
    explanation:
      "Ryzyko to odległość do stopu × rozmiar pozycji względem equity — nie rozmiar nominalny wolumenu rynku.",
    consequenceCorrect:
      "Skalujesz lot tak, by przy danym SL ryzyko było stałe procentowo.",
    consequenceWrong:
      "Stały lot przy różnych SL = zupełnie różne ryzyko na trade — jedna pozycja ryzykuje 0,3% equity, inna 2% przy tym samym „nawyku” wielkości; drawdown rośnie nieprzewidywalnie i łamiesz własny limit kapitału.",
    topic: "Ryzyko",
    difficulty: "easy",
  },
  {
    id: "mat-06",
    question: "SMA i EMA różnią się tym, że:",
    options: [
      "EMA silniej waży świeższe dane",
      "SMA zawsze szybsza",
      "EMA jest średnią arytmetyczną",
      "Nie ma różnicy",
    ],
    correctIndex: 0,
    correctAnswer: "EMA silniej waży świeższe dane",
    explanation:
      "EMA to średnia wykładnicza — szybciej reaguje na nowe ceny niż prosta SMA tego samego okresu.",
    consequenceCorrect:
      "Dobierasz średnią pod cel: mniej lagu vs. więcej wygładzenia.",
    consequenceWrong:
      "Używasz tej samej odległości SL/TP przy innej dynamice sygnału — wchodzisz za wcześnio albo za późno, więc płacisz większym ścięciem lub poślizgiem przy tym samym „setupie”.",
    topic: "Średnie",
    difficulty: "easy",
  },
  {
    id: "mat-07",
    question: "MACD składa się z:",
    options: [
      "Dwie EMA, linia sygnału i histogram",
      "RSI i linia sygnału",
      "DMI i ADX",
      "ATR i sygnał",
    ],
    correctIndex: 0,
    correctAnswer: "Dwie EMA, linia sygnału i histogram",
    explanation:
      "MACD to różnica dwóch EMA z wygładzoną linią sygnału — histogram pokazuje ich rozjazd.",
    consequenceCorrect:
      "Czytasz MACD jako momentum/trend filter, nie jako losowy oscylator.",
    consequenceWrong:
      "Zmieniasz parametry „na czuja” — pozycja jest otwarta pod regułą, której nie rozumiesz; trudno wtedy utrzymać stały rozmiar i spójne wyjścia.",
    topic: "MACD",
    difficulty: "easy",
  },
  {
    id: "mat-08",
    question: "Bollinger Bands pokazują:",
    options: [
      "Odchylenia standardowe wokół średniej",
      "Wolumen tickowy",
      "Trend liniowy",
      "Korelację",
    ],
    correctIndex: 0,
    correctAnswer: "Odchylenia standardowe wokół średniej",
    explanation:
      "Pasmo to zmienność wokół SMA — szerokie przy vol, wąskie przy konsolidacji (squeeze).",
    consequenceCorrect:
      "Używasz BB do vol i mean-reversion z kontekstem, nie „kupuj zawsze przy dolnym paśmie”.",
    consequenceWrong:
      "Łamanie pasma w trendzie jest normą — shortujesz „wybicie” dolnego pasma w impulsie wzrostowym i tnie Cię kolejną świecą; ryzykujesz przeciwko momentum, licząc na revert bez potwierdzenia.",
    topic: "Zmienność",
    difficulty: "medium",
  },
  {
    id: "mat-09",
    question: "Ważność linii trendu rośnie wraz z:",
    options: [
      "Liczbą potwierdzonych dotknięć i czasem trwania",
      "Kolorem linii",
      "Godziną rysowania",
      "Parą walutową",
    ],
    correctIndex: 0,
    correctAnswer: "Liczbą potwierdzonych dotknięć i czasem trwania",
    explanation:
      "Trendline z wieloma reakcjami i dłuższą historią ma większą wagę niż linia przez dwa losowe szczyty.",
    consequenceCorrect:
      "Walidujesz linię liczbą testów, nie estetyką na wykresie.",
    consequenceWrong:
      "Stawiasz SL tuż za „linią z dwóch świec” bez historii reakcji — rynek ją przebija, a Ty tracisz na szumie, bo poziom nie miał realnego znaczenia dla podaży/popytu.",
    topic: "Trend",
    difficulty: "easy",
  },
  {
    id: "mat-10",
    question: "Heikin-Ashi względem klasycznych świec:",
    options: [
      "Wygładza ruch i redukuje szum",
      "Zawsze zwiększa zmienność",
      "Nie pokazuje trendu",
      "Nie ma świec",
    ],
    correctIndex: 0,
    correctAnswer: "Wygładza ruch i redukuje szum",
    explanation:
      "Heikin-Ashi buduje świece z uśrednionych OHLC — trend wygląda „czystiej”, ale to inna reprezentacja niż prawdziwe ceny.",
    consequenceCorrect:
      "Nie mieszasz execution po cenach HA z backtestem na zwykłych świecach.",
    consequenceWrong:
      "Handel na HA bez świadomości, że to nie tickowe OHLC, daje fałszywą pewność — SL/TP liczysz po „gładkich” świecach, a broker realizuje po prawdziwych cenach; drawdown jest większy niż widzisz na wykresie.",
    topic: "Świece",
    difficulty: "medium",
  },
  {
    id: "mat-11",
    question: "Fibonacci 61.8% to:",
    options: [
      "Często obserwowany poziom korekty",
      "Poziom wolumenu",
      "Wartość RSI",
      "Wartość ATR",
    ],
    correctIndex: 0,
    correctAnswer: "Często obserwowany poziom korekty",
    explanation:
      "61.8% (złoty podział) to popularny poziom retracementu — działa często jako samospełniająca się strefa przez crowds.",
    consequenceCorrect:
      "Traktujesz Fibo jako strefę z potwierdzeniem, nie talizman.",
    consequenceWrong:
      "Wchodzisz pełnym rozmiarem na poziomie Fibo bez potwierdzenia — jeden impuls przebija strefę i realizujesz stratę większą, niż zakładał plan, bo ryzyko było uzasadnione „magiczną” linią.",
    topic: "Fibo",
    difficulty: "easy",
  },
  {
    id: "mat-12",
    question: "ATR używamy m.in. do:",
    options: [
      "Dostosowania SL do zmienności",
      "Liczenia prowizji",
      "Wyceny dywidendy",
      "Obrotu na fixingu",
    ],
    correctIndex: 0,
    correctAnswer: "Dostosowania SL do zmienności",
    explanation:
      "ATR mierzy typowy zasięg ruchu — SL zbyt ciasny względem ATR jest często zbierany przez szum.",
    consequenceCorrect:
      "Ustalasz odległość SL w jednostkach zmienności, nie na sztywno w pipach.",
    consequenceWrong:
      "Ten sam SL w pipach przy niskiej i wysokiej vol to różne prawdopodobieństwo wybicia — w skoku zmienności trafiasz w stop częściej przy tym samym nominalnym ryzyku, więc realny ułamek konta na trade rośnie.",
    topic: "ATR",
    difficulty: "easy",
  },
  {
    id: "mat-13",
    question: "Dziennik transakcji (journal) pomaga:",
    options: [
      "W eliminacji błędów poznawczych i optymalizacji procesu",
      "W zawieszaniu reguł",
      "W unikaniu planu",
      "W zwiększaniu lewara bez ryzyka",
    ],
    correctIndex: 0,
    correctAnswer: "W eliminacji błędów poznawczych i optymalizacji procesu",
    explanation:
      "Journal łączy setup, emocję i wynik — bez tego powtarzasz te same błędy nieświadomie.",
    consequenceCorrect:
      "Widzisz własne wzorce (np. overtrading po stratach) i możesz je uciąć.",
    consequenceWrong:
      "Handel bez audytu to ten sam eksperyment w kółko — powtarzasz ten sam błąd wejścia (np. FOMO, przesunięcie SL) i każda kolejna strata jest przewidywalna, tylko nie jesteś tego świadomy.",
    topic: "Proces",
    difficulty: "easy",
  },
  {
    id: "mat-14",
    question: "Bias „loss aversion” oznacza, że:",
    options: [
      "Straty bolą bardziej niż zyski o tej samej wielkości",
      "Zawsze zwiększamy ryzyko",
      "Nie zamykamy stratnych",
      "Zawsze skracamy zyski",
    ],
    correctIndex: 0,
    correctAnswer: "Straty bolą bardziej niż zyski o tej samej wielkości",
    explanation:
      "Psychologicznie unikasz realizacji straty i przeciągasz losing trade — to klasyczny mechanizm aversji.",
    consequenceCorrect:
      "Świadomość biasu pozwala trzymać się planu SL zamiast „averaging down z emocji”.",
    consequenceWrong:
      "Bez nazwania biasu zamieniasz małą stratę w dużą przez odraczanie realizacji — dokładasz do przegranej pozycji albo przesuwasz SL, więc jeden błąd procesu pożera znacznie większy ułamek kapitału niż plan.",
    topic: "Psychologia",
    difficulty: "medium",
  },
  {
    id: "mat-15",
    question: "FOMO prowadzi często do:",
    options: [
      "Pogoni za rynkiem i gorszych wejść",
      "Lepszego timingu",
      "Niższych kosztów",
      "Braku poślizgu",
    ],
    correctIndex: 0,
    correctAnswer: "Pogoni za rynkiem i gorszych wejść",
    explanation:
      "FOMO to wejście pod koniec ruchu po tym, jak już „widać” zysk — zwykle słabsza relacja ryzyko/nagroda.",
    consequenceCorrect:
      "Masz regułę: jeśli przegapiłeś trigger, czekasz na pullback lub rezygnujesz.",
    consequenceWrong:
      "Market order na szczycie impulsu to często odwrócenie zaraz po Tobie — płacisz poślizgiem i szerokim spreadem na końcu ruchu, więc relacja nagroda/ryzyko jest gorsza niż w planie, nawet jeśli kierunek „był dobry”.",
    topic: "Psychologia",
    difficulty: "easy",
  },
  {
    id: "mat-16",
    question: "Elementy planu tradingowego to m.in.:",
    options: [
      "Setup, warunki wejścia/wyjścia, ryzyko, zarządzanie pozycją, dziennik",
      "Kolor świec i layout",
      "Preferencje muzyczne",
      "Zawsze scalping",
    ],
    correctIndex: 0,
    correctAnswer: "Setup, warunki wejścia/wyjścia, ryzyko, zarządzanie pozycją, dziennik",
    explanation:
      "Plan to zestaw reguł przed, w trakcie i po trade — bez tego dyskusja o edge nie ma sensu.",
    consequenceCorrect:
      "Każda transakcja jest porównywalna z checklistą — łatwiej debugować.",
    consequenceWrong:
      "Impulsywne wejścia bez planu uniemożliwiają ocenę edge — nie wiesz, czy wynik zależy od setupu, czy od emocji; utrwalasz chaos na koncie i nie możesz poprawić ani rozmiaru, ani wyjścia.",
    topic: "Plan",
    difficulty: "easy",
  },
  {
    id: "mat-17",
    question: "Overfitting to:",
    options: [
      "Przedobrzenie dopasowania do danych historycznych kosztem uogólnienia",
      "Zbyt mały spread",
      "Brak SL",
      "Niskie koszty",
    ],
    correctIndex: 0,
    correctAnswer: "Przedobrzenie dopasowania do danych historycznych kosztem uogólnienia",
    explanation:
      "Zbyt wiele reguł i parametrów „dopina” krzywą do szumu próby — w out-of-sample wynik się rozpada.",
    consequenceCorrect:
      "Stosujesz prostszą regułę z OOS, niż złożony model z in-sample.",
    consequenceWrong:
      "Strategia z 20 filtrami i perfekcyjnym backtestem to często iluzja — w live masz mniej sygnałów, ale każdy jest nadal losowy względem przyszłości; pełny sizing na takim systemie szybko kończy się drawdownem, gdy szum wraca.",
    topic: "Backtest",
    difficulty: "medium",
  },
  {
    id: "mat-18",
    question: "Test OOS (out-of-sample) służy do:",
    options: [
      "Weryfikacji modelu na nowych danych",
      "Zwiększania dźwigni",
      "Zmiany brokera",
      "Zawsze wyższych wyników",
    ],
    correctIndex: 0,
    correctAnswer: "Weryfikacji modelu na nowych danych",
    explanation:
      "Dane, których nie używałeś do strojenia, pokazują, czy sygnał nie jest artefaktem próby.",
    consequenceCorrect:
      "Nie wdrażasz strategii bez przynajmniej jednego OOS / forward testu.",
    consequenceWrong:
      "Tylko in-sample to planowanie sukcesu na danych, które już znasz — wdrażasz strategię i pierwszy out-of-sample miesiąc obnaża, że edge był artefaktem próby; kapitał spada, zanim zdążysz cofnąć rozmiar.",
    topic: "Walidacja",
    difficulty: "medium",
  },
  {
    id: "mat-19",
    question: "Expectancy/EV można przybliżyć jako:",
    options: [
      "Win% × średni zysk – Loss% × średnia strata",
      "Średni zysk ÷ średnia strata",
      "Wygrane – przegrane",
      "Sharpe × RR",
    ],
    correctIndex: 0,
    correctAnswer: "Win% × średni zysk – Loss% × średnia strata",
    explanation:
      "Expectancy to średni wynik na trade ważony częstością — stosunek średnich bez wag to nie to samo.",
    consequenceCorrect:
      "Liczenie expectancy po serii trade’ów mówi, czy gra ma sens statystycznie.",
    consequenceWrong:
      "Możesz mieć wysoki RR i nadal tracić, jeśli Win% jest za niski — strategia wygląda dobrze na papierze, ale traci kapitał, dopóki nie policzysz średniej wygranej i przegranej na trade po kosztach.",
    topic: "Statystyka",
    difficulty: "medium",
  },
  {
    id: "mat-20",
    question: "Dane makro wysokiej wagi w kalendarzu zwykle:",
    options: [
      "Podnoszą zmienność i ryzyko poślizgu",
      "Zmniejszają spread do zera",
      "Blokują egzekucję",
      "Nie dotyczą FX",
    ],
    correctIndex: 0,
    correctAnswer: "Podnoszą zmienność i ryzyko poślizgu",
    explanation:
      "Wysoka waga = duża niepewność wyniku i reakcji rynku — spread i poślizg rosną.",
    consequenceCorrect:
      "Dostosowujesz rozmiar lub unikasz handlu, jeśli nie masz edge na news.",
    consequenceWrong:
      "Scalping w pierwszej minucie CPI z pełnym sizingiem to często płacenie poślizgiem — nawet przy trafionym kierunku średnia cena wejścia/wyjścia psuje wynik; ryzykujesz dużym ułamkiem konta na losowej mikrostrukturze.",
    topic: "News",
    difficulty: "easy",
  },
  {
    id: "mat-21",
    question: "Korelacja ≠ przyczynowość, więc:",
    options: [
      "Potrzebne są dodatkowe testy, by ocenić zależność",
      "To to samo",
      "Wystarczy zobaczyć wykres",
      "Zawsze działa",
    ],
    correctIndex: 0,
    correctAnswer: "Potrzebne są dodatkowe testy, by ocenić zależność",
    explanation:
      "Dwa szeregi mogą współruszać przez wspólny czynnik lub przypadek — to nie dowód mechanizmu.",
    consequenceCorrect:
      "Budujesz tezę przyczynową i test ex-ante, zamiast handlować „bo linie podobne”.",
    consequenceWrong:
      "Strategie na fałszywej korelacji giną, gdy reżim się zmienia — dwie serie przestają się razem ruszać i hedge znika; zostajesz z gołą ekspozycją większą, niż myślisz, i drawdown przyspiesza.",
    topic: "Logika",
    difficulty: "medium",
  },
  {
    id: "mat-22",
    question: "Sharpe ratio mierzy:",
    options: [
      "Zwrot skorygowany o ryzyko (odchylenie) ponad stopę wolną od ryzyka",
      "Wyłącznie maksymalny zysk",
      "Wolumen",
      "Spread",
    ],
    correctIndex: 0,
    correctAnswer: "Zwrot skorygowany o ryzyko (odchylenie) ponad stopę wolną od ryzyka",
    explanation:
      "Sharpe łączy nadwyżkę zwrotu ponad rf z zmiennością — nie maks zysku ani wolumenu.",
    consequenceCorrect:
      "Porównujesz strategie o podobnym horyzoncie i częstotliwości.",
    consequenceWrong:
      "Strategia z jednym mega zyskiem i ogromnym vol może mieć gorszy Sharpe niż spokojniejsza — żyjesz na roller coasterze equity i łatwo przerwiesz trading w dołku albo zwiększysz ryzyko po szczęśliwym strzale, niszcząc długoterminowy wynik.",
    topic: "Metryki",
    difficulty: "medium",
  },
  {
    id: "mat-23",
    question: "„Risk of ruin” rośnie gdy:",
    options: [
      "Zwiększasz ryzyko na trade przy tej samej przewadze",
      "Zwiększasz RR",
      "Masz wyższy Win%",
      "Obniżasz zmienność",
    ],
    correctIndex: 0,
    correctAnswer: "Zwiększasz ryzyko na trade przy tej samej przewadze",
    explanation:
      "Większy ułamek kapitału na trade przy tej samej szansie serii strat szybciej doprowadza do ruiny.",
    consequenceCorrect:
      "Szukasz optymalnego frakcji kapitału, nie max lewara przy stałym edge.",
    consequenceWrong:
      "Podkręcanie % ryzyka po serii wygranych to klasyczny skrót do wipe-out — kolejna seria strat trafia na większy rozmiar i robi nieproporcjonalną dziurę w kapitale, bo przeszacowałeś trwałość edge.",
    topic: "Ryzyko",
    difficulty: "hard",
  },
  {
    id: "mat-24",
    question: "Zasada 2R/3R oznacza, że:",
    options: [
      "Celujesz w zysk ≥ 2–3 × ryzyko",
      "Ryzykujesz 2–3% equity bez SL",
      "Brak walidacji",
      "Zawsze 2 transakcje",
    ],
    correctIndex: 0,
    correctAnswer: "Celujesz w zysk ≥ 2–3 × ryzyko",
    explanation:
      "Chodzi o relację nagrody do ryzyka (R) — nie o liczbę transakcji ani brak SL.",
    consequenceCorrect:
      "Wybierasz setupy, gdzie potencjalny target uzasadnia przyjęte ryzyko.",
    consequenceWrong:
      "RR 0.3 z wysokim Win% nadal może być stratne po kosztach i serii strat — kilka większych przegranych zjada wiele małych wygranych; kapitał maleje mimo „dobrej statystyki” na screenie.",
    topic: "RR",
    difficulty: "easy",
  },
  {
    id: "mat-25",
    question: "Dobre praktyki wokół newsów:",
    options: [
      "Zredukować pozycję/ryzyko, jeśli strategia nie jest newsowa",
      "Zwiększać lewar na siłę",
      "Ustawiać bardzo wąskie SL",
      "Ignorować kalendarz",
    ],
    correctIndex: 0,
    correctAnswer: "Zredukować pozycję/ryzyko, jeśli strategia nie jest newsowa",
    explanation:
      "Wydarzenia wysokiej wagi podnoszą spread i poślizg — bez edge na news najbezpieczniej ograniczyć ekspozycję lub nie handlować.",
    consequenceCorrect:
      "Chronisz kapitał i unikasz losowej realizacji w najgorszej minucie dnia.",
    consequenceWrong:
      "Wąski SL lub pełny lewar przy CPI/NFP to często seria strat nie z edge, tylko z mikrostruktury — stop wpada na szumie, zanim teza ma szansę; tracisz kapitał na realizacji, nie na analizie.",
    topic: "News",
    difficulty: "easy",
  },
  {
    id: "mat-26",
    question:
      "Pin bar na szczycie impulsu bez dywergencji w strukturze ani poziomu — wchodzisz short marketem „bo pin”. Najczęstszy błąd to:",
    options: [
      "Zbyt mały spread",
      "Łapanie kontynuacji trendu za odwrócenie — brak kontekstu i potwierdzenia",
      "Zbyt szeroki SL",
      "Brak wykresu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Łapanie kontynuacji trendu za odwrócenie — brak kontekstu i potwierdzenia",
    explanation:
      "Świeca odwrócenia wymaga miejsca (S/R), czasu (sesja) i często potwierdzenia — sama forma nie jest przepustką.",
    consequenceCorrect: "Czekasz na invalidację struktury lub retest, zamiast gonić szczyt.",
    consequenceWrong: "Seria stopów pod impulsem — koszt „czytania kształtu” bez gry.",
    topic: "Świece",
    difficulty: "medium",
  },
  {
    id: "mat-27",
    question:
      "Bullish engulfing w konsolidacji tuż pod oporem przy niskiej zmienności. Decyzja ostrożna to:",
    options: [
      "Pełny lot long „bo engulfing”",
      "Traktować jako potencjalny fakeout — czekać na zamknięcie poza strefą lub akceptować niższe prawdopodobieństwo",
      "Zawsze short bez analizy",
      "Wyłączyć SL",
    ],
    correctIndex: 1,
    correctAnswer:
      "Traktować jako potencjalny fakeout — czekać na zamknięcie poza strefą lub akceptować niższe prawdopodobieństwo",
    explanation:
      "Engulfing w range często jest pułapką płynności, nie startem trendu.",
    consequenceCorrect: "Mniejszy rozmiar albo filtr trendu/regime.",
    consequenceWrong: "Pełna agresja w środku boxa — seria strat na fałszywych wybiciach.",
    topic: "Price action",
    difficulty: "hard",
  },
  {
    id: "mat-28",
    question:
      "Inside bar po silnym impulsie — wchodzisz na złamaniu mother bar w pierwszej minucie. Problem:",
    options: [
      "Zawsze zysk",
      "Brak filtra na fałszywe przebicie (fakeout) i koszt spreadu na mikroskali",
      "Inside bar zawsze kończy trend",
      "Nie da się handlować inside bar",
    ],
    correctIndex: 1,
    correctAnswer:
      "Brak filtra na fałszywe przebicie (fakeout) i koszt spreadu na mikroskali",
    explanation:
      "Kompresja często poprzedza ruch, ale kierunek bywa losowy bez kontekstu wyższego TF.",
    consequenceCorrect: "Czekasz na zamknięcie potwierdzające lub retest z limitem.",
    consequenceWrong: "Seria kosztownych stopów na szumie przy linii mother bar.",
    topic: "Price action",
    difficulty: "medium",
  },
  {
    id: "mat-29",
    question:
      "Dwukrotne testowanie tego samego minimum na H1 z krótkimi knotami — interpretacja operacyjna:",
    options: [
      "Gwarancja odbicia",
      "Rosnąca interakcja ze strefą — szukasz potwierdzenia lub akceptujesz, że trzeci test bywa przebiciem",
      "Rynek się zatrzymał na zawsze",
      "Spread znika",
    ],
    correctIndex: 1,
    correctAnswer:
      "Rosnąca interakcja ze strefą — szukasz potwierdzenia lub akceptujesz, że trzeci test bywa przebiciem",
    explanation:
      "Liquidity pod equal lows bywa zbierana przed kontynuacją — liczba dotknięć sama w sobie nie jest przewagą.",
    consequenceCorrect: "SL za strukturą, nie „za knotem”, i świadomość sweep risk.",
    consequenceWrong: "Martwi long na trzecim dotknięciu — jeden sweep czyści pozycję.",
    topic: "S/R",
    difficulty: "hard",
  },
  {
    id: "mat-30",
    question:
      "Rysujesz opór jako jedną cienką linię przez dwa szczyty z 2019 roku bez ostatnich reakcji. Błąd to:",
    options: [
      "Użycie linii",
      "Ignorowanie świeżej reakcji rynku — strefa S/R żyje z ostatnich interakcji, nie z nostalgii",
      "Użycie wykresu",
      "Użycie H1",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ignorowanie świeżej reakcji rynku — strefa S/R żyje z ostatnich interakcji, nie z nostalgii",
    explanation:
      "Strefa musi być potwierdzona przez rynek w aktualnym reżimie płynności.",
    consequenceCorrect: "Aktualizujesz box reakcji z ostatnich 20–50 świec kontekstu.",
    consequenceWrong: "Zlecenia przy „linii z przeszłości”, gdzie rynek nie ma pamięci.",
    topic: "S/R",
    difficulty: "medium",
  },
  {
    id: "mat-31",
    question:
      "Heikin-Ashi pokazuje długi „czysty” downtrend, ale zwykłe świece mają lower highs. Przed shortem:",
    options: [
      "Ignorujesz zwykłe świece",
      "Sprawdzasz realizację SL/TP po OHLC rzeczywistym, nie po wygładzonym HA",
      "HA jest jedyną prawdą",
      "Zawsze dodajesz do shorta",
    ],
    correctIndex: 1,
    correctAnswer:
      "Sprawdzasz realizację SL/TP po OHLC rzeczywistym, nie po wygładzonym HA",
    explanation:
      "HA opóźnia i wygładza — może ukryć mikrostrukturę, po której broker realizuje zlecenia.",
    consequenceCorrect: "Jedna świeca potwierdzająca na zwykłym wykresie lub tick awareness.",
    consequenceWrong: "SL liczony „na gładkim” — realny knot zbiera stop wcześniej niż widzisz.",
    topic: "Świece",
    difficulty: "medium",
  },
  {
    id: "mat-32",
    question:
      "Dywergencja RSI (cena HH, RSI LH) na M5 w silnym trendzie dziennym. Największe ryzyko decyzji:",
    options: [
      "Brak sygnału",
      "Kontr-trend na niskim TF bez filtru HTF — trend kontynuuje, dywergencja bywa wielokrotnie „naprawiana”",
      "RSI zawsze ma rację",
      "Trend nie istnieje",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kontr-trend na niskim TF bez filtru HTF — trend kontynuuje, dywergencja bywa wielokrotnie „naprawiana”",
    explanation:
      "Momentum może się rozjechać długo zanim nastąpi korekta godząca się z Twoim TP.",
    consequenceCorrect: "Skracasz cel albo czekasz na przełamanie struktury HTF.",
    consequenceWrong: "Pełny rozmiar short „na RSI” — seria strat w trendzie.",
    topic: "Oscylatory",
    difficulty: "medium",
  },
  {
    id: "mat-33",
    question:
      "MACD przecina linię sygnału od dołu tuż pod zerem przy flat na wyższym TF. To:",
    options: [
      "Automatyczny start nowego super-trendu",
      "Często szum w konsolidacji — potrzebny filtr trendu/vol lub poziomu",
      "Zawsze kupuj",
      "Zawsze sprzedawaj",
    ],
    correctIndex: 1,
    correctAnswer:
      "Często szum w konsolidacji — potrzebny filtr trendu/vol lub poziomu",
    explanation:
      "Krzyżówka MACD w chop generuje wiele fałszywych sygnałów kosztownych po spreadzie.",
    consequenceCorrect: "ADX, struktura lub wyższy TF jako gate.",
    consequenceWrong: "Overtrading w boxie — koszt transakcji zjada kapitał.",
    topic: "MACD",
    difficulty: "medium",
  },
  {
    id: "mat-34",
    question:
      "Bollinger squeeze (wąskie pasma) na indeksie przed ważnymi danymi:",
    options: [
      "Zawsze kupuj dolne pasmo",
      "Kompresja zapowiada ekspansję, ale kierunek nie jest z BB — musisz mieć plan na obie strony lub unikać gry w ciemno",
      "Squeeze = brak ruchu na zawsze",
      "Spread = 0",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kompresja zapowiada ekspansję, ale kierunek nie jest z BB — musisz mieć plan na obie strony lub unikać gry w ciemno",
    explanation:
      "Vol expansion po news może iść w obie strony — BB nie głosuje.",
    consequenceCorrect: "Opcje: bracket z buforem, redukcja, lub pauza.",
    consequenceWrong: "Jednostronny bet przed headline — 50/50 z wysokim kosztem realizacji.",
    topic: "Zmienność",
    difficulty: "hard",
  },
  {
    id: "mat-35",
    question:
      "ADX > 25 i +DI > -DI — interpretujesz to jako:",
    options: [
      "Kierunek long zawsze",
      "Silny trend bez informacji o kierunku z samego ADX — trzeba spojrzeć na DI i kontekst ceny",
      "Brak trendu",
      "Wyłącznie sygnał short",
    ],
    correctIndex: 1,
    correctAnswer:
      "Silny trend bez informacji o kierunku z samego ADX — trzeba spojrzeć na DI i kontekst ceny",
    explanation:
      "ADX mierzy siłę, nie znak — wysoki ADX bywa także przy silnych spadkach.",
    consequenceCorrect: "Łączysz ADX z kierunkiem struktury lub DI.",
    consequenceWrong: "Long tylko bo ADX wysoki — handlujesz pod downtrend.",
    topic: "Trend",
    difficulty: "medium",
  },
  {
    id: "mat-36",
    question:
      "Stochastic wykupienie w środku silnego trendu wzrostowego na H4:",
    options: [
      "Natychmiastowy short",
      "Impuls może utrzymywać „wykupienie” długo — oscylator nie zastępuje struktury",
      "Koniec świata",
      "Zakaz longów",
    ],
    correctIndex: 1,
    correctAnswer:
      "Impuls może utrzymywać „wykupienie” długo — oscylator nie zastępuje struktury",
    explanation:
      "Trendowe środowisko = momentum może być zawyżone tygodniami.",
    consequenceCorrect: "Szukasz pullbacków z trendem, nie kontr na pierwszym stochastic.",
    consequenceWrong: "Seria shortów w parabolicznym odcinku — margin i psychika cierpią.",
    topic: "Oscylatory",
    difficulty: "easy",
  },
  {
    id: "mat-37",
    question:
      "Cena dotyka średniej EMA200 jako „wsparcie” pierwszy raz po długim dystansie od niej:",
    options: [
      "Zawsze odbije",
      "Pierwszy test po ekstremalnym oddaleniu bywa „magnetyczny”, ale ryzyko przebicia rośnie — rozmiar i potwierdzenie mają znaczenie",
      "EMA200 nie działa",
      "Zawsze kupuj marketem",
    ],
    correctIndex: 1,
    correctAnswer:
      "Pierwszy test po ekstremalnym oddaleniu bywa „magnetyczny”, ale ryzyko przebicia rośnie — rozmiar i potwierdzenie mają znaczenie",
    explanation:
      "Mean reversion nie jest pewniakiem — momentum może ciągnąć przez średnią.",
    consequenceCorrect: "Częściowy rozmiar lub czekanie na reakcję świecy zamykającej.",
    consequenceWrong: "All-in na pierwszym dotknięciu — jeden impuls przecina średnią bez zatrzymania.",
    topic: "Średnie",
    difficulty: "medium",
  },
  {
    id: "mat-38",
    question:
      "Fibo retracement 61.8% rysujesz po jednej fali, której szczyt był news spike z 50 pipów w minutę:",
    options: [
      "To najlepszy anchor",
      "Ekstremum newsowe bywa złym kotwicą — lepiej użyć strukturalnych swingów po stabilizacji",
      "Fibo zawsze działa na news",
      "Nie można rysować Fibo",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ekstremum newsowe bywa złym kotwicą — lepiej użyć strukturalnych swingów po stabilizacji",
    explanation:
      "Outlier wysokości fali zniekształca poziomy — narzędzie jest tylko tak dobre jak zdrowy swing.",
    consequenceCorrect: "Kotwiczysz po domknięciu volatility lub używasz wielu TF.",
    consequenceWrong: "Zlecenia przy „magicznym” poziomie z dziwnego swinga — rynek go ignoruje.",
    topic: "Fibo",
    difficulty: "hard",
  },
  {
    id: "mat-39",
    question:
      "ATR spadł o połowę vs. średnia z 20 dni — Twój stały SL w punktach:",
    options: [
      "Jest automatycznie idealny",
      "Może być za szeroki względem aktualnej zmienności — płacisz większym ryzykiem na trade niż musisz albo wchodzisz za późno",
      "ATR nie ma znaczenia dla SL",
      "Zawsze zawężaj SL do zera",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może być za szeroki względem aktualnej zmienności — płacisz większym ryzykiem na trade niż musisz albo wchodzisz za późno",
    explanation:
      "Zmienność jest cykliczna — reguła „stałe 20 pipów” ignoruje regime.",
    consequenceCorrect: "Skalujesz SL do ATR lub percentylu zasięgu.",
    consequenceWrong: "Nadmierne ryzyko w cichym rynku albo zbyt ciasny SL gdy ATR wraca.",
    topic: "ATR",
    difficulty: "medium",
  },
  {
    id: "mat-40",
    question:
      "Po serii strat zwiększasz rozmiar, żeby „odrobić”. To jest:",
    options: [
      "Kelly w praktyce",
      "Revenge trading — zwykle eskalacja straty i odchylenie od planu",
      "Zalecane przez regulatorów",
      "Neutralne psychologicznie",
    ],
    correctIndex: 1,
    correctAnswer: "Revenge trading — zwykle eskalacja straty i odchylenie od planu",
    explanation:
      "Edge nie rośnie po stracie — rośnie tylko emocja i ryzyko ruiny.",
    consequenceCorrect: "Cooldown i powrót do minimalnego rozmiaru wg planu.",
    consequenceWrong: "Jedna duża strata resetuje konto lub łamie zasady ryzyka.",
    topic: "Psychologia",
    difficulty: "easy",
  },
  {
    id: "mat-41",
    question:
      "Szukasz w internecie analizy, która potwierdza Twój kierunek, ignorujesz sprzeczne dane. To:",
    options: [
      "Diversyfikacja informacji",
      "Confirmation bias — filtrujesz świat pod decyzję już podjętą",
      "Obiektywizm",
      "Best execution myśli",
    ],
    correctIndex: 1,
    correctAnswer: "Confirmation bias — filtrujesz świat pod decyzję już podjętą",
    explanation:
      "Świadomy trader szuka falifikacji tezy, nie aplauzu.",
    consequenceCorrect: "Lista „co musiałoby być nieprawdą, żebym zmienił zdanie”.",
    consequenceWrong: "Pełna pewność przy jednym scenariuszu — zaskoczenie, gdy rynek wybiera inny.",
    topic: "Psychologia",
    difficulty: "medium",
  },
  {
    id: "mat-42",
    question:
      "Planujesz „10 minut na setup”, realnie spędzasz godzinę scrollując wykres. Konsekwencja:",
    options: [
      "Lepszy timing",
      "Overtrading i decyzje zmęczeniowe — brak reguły czasu zwiększa błędy",
      "Niższe koszty",
      "Wyższy Sharpe zawsze",
    ],
    correctIndex: 1,
    correctAnswer:
      "Overtrading i decyzje zmęczeniowe — brak reguły czasu zwiększa błędy",
    explanation:
      "Czas przy ekranie bez procesu to ekspozycja na losowe sygnały.",
    consequenceCorrect: "Timer, checklista i hard stop sesji.",
    consequenceWrong: "Transakcje pod koniec sesji, gdy koncentracja spada.",
    topic: "Proces",
    difficulty: "medium",
  },
  {
    id: "mat-43",
    question:
      "Po dwóch stratach z rzędu obniżasz rozmiar o połowę do następnego dnia. To:",
    options: [
      "Znak słabości",
      "Rozsądny tilt-control — ograniczasz szkody, gdy psychika jest pod presją",
      "Zawsze zły pomysł",
      "Gwarantuje zysk następnego dnia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Rozsądny tilt-control — ograniczasz szkody, gdy psychika jest pod presją",
    explanation:
      "Proaktywne cięcie rozmiaru po sygnałach stresu chroni kapitał.",
    consequenceCorrect: "Reguła zapisana z góry, nie improvisacja w gniewie.",
    consequenceWrong: "Stały max rozmiar po złym dniu — spirala strat w tej samej głowie.",
    topic: "Psychologia",
    difficulty: "easy",
  },
  {
    id: "mat-44",
    question:
      "W dzienniku zapisujesz tylko wynik PLN, bez setupu i screenshotu poziomu. Za miesiąc:",
    options: [
      "Wystarczy do poprawy",
      "Nie odtworzysz błędu — brak danych wejściowych blokuje naukę",
      "PLN wystarczy zawsze",
      "Journal jest zbędny",
    ],
    correctIndex: 1,
    correctAnswer:
      "Nie odtworzysz błędu — brak danych wejściowych blokuje naukę",
    explanation:
      "Uczysz się z przyczyn, nie z samego efektu końcowego.",
    consequenceCorrect: "Minimalny szablon: rynek, setup, ryzyko, emocja, wykres.",
    consequenceWrong: "Powtarzanie tego samego błędu wejścia bez świadomości.",
    topic: "Proces",
    difficulty: "easy",
  },
  {
    id: "mat-45",
    question:
      "Edytujesz historię transakcji w arkuszu, żeby backtest „wyglądał” lepiej przed znajomymi:",
    options: [
      "Nieszkodliwe",
      "Oszukujesz przede wszystkim siebie — niszczysz feedback loop",
      "Poprawia edge",
      "Zatwierdzone przez CFA",
    ],
    correctIndex: 1,
    correctAnswer: "Oszukujesz przede wszystkim siebie — niszczysz feedback loop",
    explanation:
      "Uczciwy journal jest warunkiem poprawy procesu.",
    consequenceCorrect: "Surowe logi z brokera jako źródło prawdy.",
    consequenceWrong: "Wdrożenie strategii na fałszywej confidence.",
    topic: "Proces",
    difficulty: "medium",
  },
  {
    id: "mat-46",
    question:
      "Twój plan mówi max 3 transakcje dziennie — o 21:00 otwierasz czwartą „bo okazja”. To:",
    options: [
      "Dopasowanie do rynku",
      "Naruszenie reguły procesu — „okazja” po limicie często jest zmęczeniem, nie edge",
      "Zawsze zwiększa EV",
      "Bez znaczenia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Naruszenie reguły procesu — „okazja” po limicie często jest zmęczeniem, nie edge",
    explanation:
      "Limity istnieją, by chronić przed degradacją jakości decyzji.",
    consequenceCorrect: "Koniec sesji lub tylko obserwacja.",
    consequenceWrong: "Najgorsza seria strat zwykle z godzin po przekroczeniu limitu.",
    topic: "Plan",
    difficulty: "medium",
  },
  {
    id: "mat-47",
    question:
      "Medytacja i sport pomagają w tradingu głównie przez:",
    options: [
      "Gwarancję zysku",
      "Lepszą regulację stresu i koncentracji — nie zastępują edge matematycznego",
      "Usunięcie potrzeby SL",
      "Wyłączenie spreadu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Lepszą regulację stresu i koncentracji — nie zastępują edge matematycznego",
    explanation:
      "Psychofizyka podnosi jakość wykonania planu, nie zastępuje kosztów i prawdopodobieństwa.",
    consequenceCorrect: "Łączysz zdrowie z dyscypliną planu, nie z magią.",
    consequenceWrong: "Poczucie „jestem spokojny, więc mogę lewarować więcej”.",
    topic: "Psychologia",
    difficulty: "easy",
  },
  {
    id: "mat-48",
    question:
      "Dane makro wyszły „zgodnie z prognozą”, ale poprzednia wartość została mocno zrewidowana. Rynek często:",
    options: [
      "Ignoruje rewizje",
      "Reaguje na pełny obraz (poziom + rewizje + kontekst), nie tylko headline vs consensus",
      "Zawsze się zatrzymuje",
      "Spread znika",
    ],
    correctIndex: 1,
    correctAnswer:
      "Reaguje na pełny obraz (poziom + rewizje + kontekst), nie tylko headline vs consensus",
    explanation:
      "Rewizje zmieniają narrację trendu — samo „inline” bywa mylące.",
    consequenceCorrect: "Czytasz tabelę kompletu, nie tylko pierwszy wiersz Twittera.",
    consequenceWrong: "Pozycja oparta na uproszczonym nagłówku — nagła korekta po szczegółach.",
    topic: "Kalendarz",
    difficulty: "hard",
  },
  {
    id: "mat-49",
    question:
      "Wykres „dot plot” Fed dla detala ma sens głównie jako:",
    options: [
      "Dokładna mapa przyszłych stóp bez błędu",
      "Orientacja na oczekiwania ścieżki stóp, nie jako mechaniczny trigger wejścia co ćwierć",
      "Sygnał kupna akcji zawsze",
      "Zamiennik analizy technicznej",
    ],
    correctIndex: 1,
    correctAnswer:
      "Orientacja na oczekiwania ścieżki stóp, nie jako mechaniczny trigger wejścia co ćwierć",
    explanation:
      "Projekcje członków zmieniają się — rynek dyskontuje narrację, nie pojedynczą kropkę.",
    consequenceCorrect: "Kontekst dla FX i długich obligacji, nie skalp na konferencji bez planu.",
    consequenceWrong: "Skalp „na każde słowo” bez kosztów i szerokości SL.",
    topic: "Makro",
    difficulty: "medium",
  },
  {
    id: "mat-50",
    question:
      "W kalendarzu dwa wydarzenia: jedno czerwone, drugie żółte tego samego dnia. Błąd to:",
    options: [
      "Ignorować żółte całkowicie bez czytania opisu",
      "Zakładać, że kolor zawsze oddaje impact na Twój instrument — trzeba czytać specyfikację i historię reakcji",
      "Handlować tylko na czerwonym",
      "Unikać całego tygodnia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zakładać, że kolor zawsze oddaje impact na Twój instrument — trzeba czytać specyfikację i historię reakcji",
    explanation:
      "Ważność jest względna do Twojego rynku — CPI dla PLN może być mniejsze niż dla USD.",
    consequenceCorrect: "Własna ściąga instrument ↔ wydarzenie.",
    consequenceWrong: "Pełna ekspozycja „bo tylko żółte” — niespodziewany driver z drugiego release.",
    topic: "Kalendarz",
    difficulty: "medium",
  },
  {
    id: "mat-51",
    question:
      "Słyszysz „przeciek” danych przed czasem w social media. Odpowiedzialna reakcja:",
    options: [
      "Max lewar przed publikacją",
      "Traktować jako niepewną informację o podwyższonym ryzyku manipulacji — unikać gry na plotki",
      "Zawsze prawda",
      "Zgłosić się jako insider",
    ],
    correctIndex: 1,
    correctAnswer:
      "Traktować jako niepewną informację o podwyższonym ryzyku manipulacji — unikać gry na plotki",
    explanation:
      "Fake news i lawinowe retesty — brak edge na niezweryfikowanym leak.",
    consequenceCorrect: "Czekasz na oficjalny release i reakcję płynności.",
    consequenceWrong: "Pozycja na fake leak — podwójna strata na korekcie po prawdzie.",
    topic: "News",
    difficulty: "easy",
  },
  {
    id: "mat-52",
    question:
      "PPI (producenta) wyższy od oczekiwań, CPI za tydzień. Dla planu na tydzień:",
    options: [
      "PPI nie ma znaczenia dla CPI",
      "Może podnieść oczekiwania presji cenowej — warto uwzględnić w scenariuszu volatility na CPI, nie ignorować całkiem",
      "CPI zawsze niższe po PPI",
      "Tylko akcje USA reagują",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może podnieść oczekiwania presji cenowej — warto uwzględnić w scenariuszu volatility na CPI, nie ignorować całkiem",
    explanation:
      "Łańcuch kosztów bywa opóźniony — PPI często wcześniejszym sygnałem napięcia.",
    consequenceCorrect: "Kalendarz łączysz w narrację, nie izolowane punkty.",
    consequenceWrong: "Margin na max tuż przed CPI, ignorując PPI surprise.",
    topic: "Makro",
    difficulty: "hard",
  },
  {
    id: "mat-53",
    question:
      "ECB i Fed w tej samej godzinie — Twój plan na EUR/USD:",
    options: [
      "Standardowy skalp bez zmian",
      "Podwójna zmienność i nakładające się narracje — redukcja rozmiaru lub świadomy wybór jednego eventu",
      "Spread zawsze zero",
      "Tylko jeden bank ma wpływ",
    ],
    correctIndex: 1,
    correctAnswer:
      "Podwójna zmienność i nakładające się narracje — redukcja rozmiaru lub świadomy wybór jednego eventu",
    explanation:
      "Dwa źródła szoku mogą rozjeżdżać interpretację jednym headline.",
    consequenceCorrect: "Albo unikasz overlap, albo akceptujesz chaos w sizingu.",
    consequenceWrong: "Pełny lot w pierwszej minucie obu komunikatów.",
    topic: "Kalendarz",
    difficulty: "medium",
  },
  {
    id: "mat-54",
    question:
      "Po dużym ruchu czytasz komentarz „to już wycenione”. Do decyzji oznacza to:",
    options: [
      "Koniec ruchu zawsze",
      "Nic samo w sobie — „wycenione” to narracja; cena może dalej trendować przy nowych przepływach",
      "Zakaz longów i shortów",
      "Gwarancja konsolidacji",
    ],
    correctIndex: 1,
    correctAnswer:
      "Nic samo w sobie — „wycenione” to narracja; cena może dalej trendować przy nowych przepływach",
    explanation:
      "Efficient market w praktyce detala nie daje prostych haseł do timingu.",
    consequenceCorrect: "Wracasz do struktury i poziomów, nie do haseł.",
    consequenceWrong: "Kontr-trend „bo wycenione” — przeciągnięcie przez trend.",
    topic: "Interpretacja",
    difficulty: "medium",
  },
  {
    id: "mat-55",
    question:
      "Checklista przed wejściem — który element jest najbardziej „niepodlegający negocjacji”?",
    options: [
      "Kolor świec",
      "Maksymalne ryzyko na trade w % equity i zgodność z planem",
      "Liczba polubień pod tweetem",
      "Losowy wskaźnik bez reguły",
    ],
    correctIndex: 1,
    correctAnswer: "Maksymalne ryzyko na trade w % equity i zgodność z planem",
    explanation:
      "Bez limitu ryzyka reszta checklisty nie ma znaczenia przy długiej serii.",
    consequenceCorrect: "Ryzyko pierwsze, setup drugi.",
    consequenceWrong: "Świetny setup z rozmiarem poza limitem — jedna strata robi za duży dół.",
    topic: "Checklisty",
    difficulty: "easy",
  },
  {
    id: "mat-56",
    question:
      "Po zamknięciu transakcji review „co poszło nie tak” ma sens, gdy:",
    options: [
      "Tylko po stratach",
      "Zawsze — także po wygranej, żeby odróżnić skill od szczęścia",
      "Nigdy",
      "Tylko publicznie na Twitterze",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zawsze — także po wygranej, żeby odróżnić skill od szczęścia",
    explanation:
      "Winners mogą być źle wykonane (lucky), losers mogły być poprawne procesowo.",
    consequenceCorrect: "Krótki szablon 3 pytań po każdym trade.",
    consequenceWrong: "Utrwalenie złego nawyku po szczęśliwym dużym win.",
    topic: "Proces",
    difficulty: "medium",
  },
  {
    id: "mat-57",
    question:
      "Kiedy NIE przesuwasz SL dalej od ceny „żeby dać oddech”?",
    options: [
      "Zawsze przesuwaj",
      "Gdy rozszerzenie SL przekracza z góry ustalony limit ryzyka na trade lub łamie regułę planu",
      "Nigdy nie przesuwaj SL",
      "Tylko w piątek",
    ],
    correctIndex: 1,
    correctAnswer:
      "Gdy rozszerzenie SL przekracza z góry ustalony limit ryzyka na trade lub łamie regułę planu",
    explanation:
      "„Oddech” bez limitu to często unikanie realizacji straty, nie zarządzanie.",
    consequenceCorrect: "Z góry max „rozszerzenie” albo zakaz po X minutach.",
    consequenceWrong: "Mała strata zamienia się w dużą przez ruch SL bez reguły.",
    topic: "Ryzyko",
    difficulty: "medium",
  },
  {
    id: "mat-58",
    question:
      "Masz long EUR/USD i long GBP/USD — przed trzecim trade’em checklista korelacji mówi:",
    options: [
      "To automatyczna dywersyfikacja",
      "Że nosisz skumulowane ryzyko na podobnym czynniku (USD) — rozmiar łączny powinien być niższy",
      "Korelacja nie dotyczy FX",
      "Zwiększ rozmiar trzeciej pozycji",
    ],
    correctIndex: 1,
    correctAnswer:
      "Że nosisz skumulowane ryzyko na podobnym czynniku (USD) — rozmiar łączny powinien być niższy",
    explanation:
      "Portfel to suma czynników, nie liczba ticketów.",
    consequenceCorrect: "Cap ekspozycji na wspólny driver.",
    consequenceWrong: "Potrójny impuls na USD robi jedną wielką stratę z trzech „małych” pozycji.",
    topic: "Portfel",
    difficulty: "medium",
  },
  {
    id: "mat-59",
    question:
      "Po udanym tygodniu planujesz „podkręcić” agresję na następny bez zmiany edge. Lepiej:",
    options: [
      "Zawsze podwajać rozmiar",
      "Zachować lub stopniowo skalować wg z góry zapisanej reguły, nie pod emocją streaku",
      "Wyłączyć dziennik",
      "Zmienić instrument każdy dzień",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zachować lub stopniowo skalować wg z góry zapisanej reguły, nie pod emocją streaku",
    explanation:
      "Winning streak nie zwiększa matematycznie prawdopodobieństwa kolejnego trade’u.",
    consequenceCorrect: "Reguła skalowania po N tygodniach stabilnej realizacji planu.",
    consequenceWrong: "Max rozmiar tuż przed korektą — oddanie zysków tygodnia w jeden dzień.",
    topic: "Plan",
    difficulty: "medium",
  },
  {
    id: "mat-60",
    question:
      "Interpretujesz wykres: wyraźny higher high i higher low na H4. Na M15 widzisz krótki pullback. Operacyjnie:",
    options: [
      "Shortuj każdy zielony knot na M15",
      "Kontekst H4 sugeruje preferencję longów przy pullbacku z limitem ryzyka, nie walkę z HTF bez powodu",
      "HTF nie ma znaczenia",
      "M15 zawsze ważniejszy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kontekst H4 sugeruje preferencję longów przy pullbacku z limitem ryzyka, nie walkę z HTF bez powodu",
    explanation:
      "Top-down redukuje konflikt timeframe’ów i liczbę kontr-trendowych pułapek.",
    consequenceCorrect: "Szukasz setupu zgodnego z biasem HTF albo rezygnujesz.",
    consequenceWrong: "Kontr-trend na M15 w silnym HTF up — seria strat na mikrookresie.",
    topic: "Interpretacja",
    difficulty: "easy",
  },
];
