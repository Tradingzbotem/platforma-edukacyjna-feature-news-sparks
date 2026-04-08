import type { DataMcqRow } from "./dataMcqRow";

export const CFD_QUIZ_DATA: DataMcqRow[] = [
  {
    id: "cfd-01",
    question: "CFD (Contract for Difference) to instrument, który:",
    options: [
      "Rozlicza różnicę cen bez fizycznej dostawy aktywa",
      "Zawsze ma datę wygaśnięcia jak futures",
      "Jest notowany wyłącznie na giełdzie",
      "Nie wymaga depozytu zabezpieczającego",
    ],
    correctIndex: 0,
    correctAnswer: "Rozlicza różnicę cen bez fizycznej dostawy aktywa",
    explanation:
      "CFD to syntetyczna ekspozycja na ruch ceny bazowej — rozliczasz różnicę w gotówce, bez posiadania akcji czy baryłki ropy.",
    consequenceCorrect:
      "Wiesz, że P/L wynika z ceny i rozmiaru kontraktu, a nie z „własności” instrumentu bazowego.",
    consequenceWrong:
      "Planujesz jak przy akcjach w depozycie — inne są korekty, finansowanie i margin: źle szacujesz koszt utrzymania i wolny kapitał pod kolejne wejścia.",
    topic: "Definicja CFD",
    difficulty: "easy",
  },
  {
    id: "cfd-02",
    question: "Wymagany depozyt (margin) dla pozycji to w uproszczeniu:",
    options: [
      "Wartość nominalna / dźwignia",
      "Zawsze stałe 100 USD",
      "Różnica między bid i ask",
      "Suma swapów",
    ],
    correctIndex: 0,
    correctAnswer: "Wartość nominalna / dźwignia",
    explanation:
      "Margin to zabezpieczenie przy dźwigni — im wyższa dźwignia, tym mniejszy wymagany depozyt względem ekspozycji.",
    consequenceCorrect:
      "Potrafisz oszacować zajęty kapitał przed wejściem — nie trafiasz na margin call „znikąd”.",
    consequenceWrong:
      "Myślisz, że „wolne” środki są większe niż są — otwierasz kolejną pozycję i dostajesz margin call albo przymusowe zamknięcie w najgorszym momencie.",
    topic: "Margin",
    difficulty: "easy",
  },
  {
    id: "cfd-03",
    question: "Utrzymywanie długiej pozycji CFD przez noc zwykle:",
    options: [
      "Generuje koszt finansowania (chyba że stopy ujemne/odwrotne)",
      "Zawsze daje dodatni swap",
      "Nie ma wpływu na P/L",
      "Zamyka pozycję automatycznie",
    ],
    correctIndex: 0,
    correctAnswer: "Generuje koszt finansowania (chyba że stopy ujemne/odwrotne)",
    explanation:
      "Finansowanie dzienne odzwierciedla koszt utrzymania ekspozycji — może być ujemne lub dodatnie w zależności od instrumentu i strony pozycji.",
    consequenceCorrect:
      "Liczy się koszt utrzymania przy swingu — nie tylko spread wejścia/wyjścia.",
    consequenceWrong:
      "Zaskakujący swap po kilku nocach bywa powodem zamknięcia strategii, która „na świecach” wyglądała na plusie.",
    topic: "Finansowanie",
    difficulty: "easy",
  },
  {
    id: "cfd-04",
    question: "Ochrona przed saldem ujemnym (NBP) oznacza, że:",
    options: [
      "Klient detaliczny nie może zejść poniżej 0 na rachunku",
      "Broker gwarantuje stały zysk",
      "Nie ma margin call",
      "Zawsze obowiązuje klientów profesjonalnych",
    ],
    correctIndex: 0,
    correctAnswer: "Klient detaliczny nie może zejść poniżej 0 na rachunku",
    explanation:
      "W UE dla detalu NBP zamyka pozycje zanim saldo zejdzie na minus — to ochrona przed długiem wobec domu maklerskiego przy skrajnych ruchach.",
    explanationIncorrect:
      "NBP nie znosi margin call ani nie gwarantuje zysku — chroni wyłącznie przed ujemnym saldem.",
    consequenceCorrect:
      "Rozumiesz limit odpowiedzialności: nie jesteś winien brokerowi więcej niż depozyt (w ramach regulacji detalicznej).",
    consequenceWrong:
      "Myślenie „mogę zejść na -50k” bywa groźne poza kontekstem regulacyjnym i typu konta.",
    topic: "Regulacje",
    difficulty: "medium",
  },
  {
    id: "cfd-05",
    question: "Który czynnik NIE dotyczy polityki best execution dla CFD?",
    options: ["Cena", "Koszty", "Szybkość i prawdopodobieństwo", "Kolor interfejsu"],
    correctIndex: 3,
    correctAnswer: "Kolor interfejsu",
    explanation:
      "Best execution dotyczy jakości realizacji (cena, koszty, szybkość, prawdopodobieństwo) — nie wyglądu aplikacji.",
    consequenceCorrect:
      "Rozumiesz, czego wymagać od brokera merytorycznie, zamiast mylić compliance z UX.",
    consequenceWrong:
      "Ignorujesz cenę i koszt realizacji — każda transakcja ma gorszy efektywny spread/poślizg, więc strategia z backtestu „na papierze” traci kapitał na żywym koncie.",
    topic: "Best execution",
    difficulty: "easy",
  },
  {
    id: "cfd-06",
    question: "CFD na akcje zwykle:",
    options: [
      "Uwzględniają korekty o dywidendy/akcje (adjustments)",
      "Nie podlegają żadnym korektom",
      "Mają zawsze gwarantowany SL",
      "Są bez finansowania",
    ],
    correctIndex: 0,
    correctAnswer: "Uwzględniają korekty o dywidendy/akcje (adjustments)",
    explanation:
      "Dywidenda i corporate actions zmieniają teoretyczną cenę bazową — na CFD pojawiają się korekty na rachunku zamiast fizycznej dywidendy.",
    consequenceCorrect:
      "Nie jesteś zaskoczony jednorazowym saldem w dniu dywidendy przy short/long.",
    consequenceWrong:
      "Nieprzewidziana korekta bywa odebrana jako „oszustwo brokera”, choć to mechanika instrumentu.",
    topic: "Akcje",
    difficulty: "medium",
  },
  {
    id: "cfd-07",
    question: "Cash index CFD vs. futures-based CFD:",
    options: [
      "Cash zawiera fair value/finansowanie, futures śledzi kontrakt terminowy",
      "Nie ma różnicy",
      "Cash ma zawsze większy spread",
      "Futures nie ma wygasania",
    ],
    correctIndex: 0,
    correctAnswer: "Cash zawiera fair value/finansowanie, futures śledzi kontrakt terminowy",
    explanation:
      "Indeks cash jest zwykle syntetycznie „dospawany” do krzywej futures z kosztem utrzymania; kontrakt futures ma datę wygaśnięcia i rollovery.",
    consequenceCorrect:
      "Nie porównujesz bezmyślnie cash CFD z wykresem futures — to różne obiekty referencyjne.",
    consequenceWrong:
      "Ustawiasz SL/TP jak na innym instrumencie referencyjnym — realna ścieżka ceny i koszt finansowania różnią się, więc ryzykujesz złym poziomem wyjścia i rozmiarem.",
    topic: "Indeksy",
    difficulty: "hard",
  },
  {
    id: "cfd-08",
    question: "Godziny handlu CFD:",
    options: [
      "Zwykle odzwierciedlają godziny rynku bazowego z przerwami dostawcy",
      "Zawsze 24/7",
      "Wyłącznie w weekend",
      "Tylko w Azji",
    ],
    correctIndex: 0,
    correctAnswer: "Zwykle odzwierciedlają godziny rynku bazowego z przerwami dostawcy",
    explanation:
      "CFD na akcje/indeksy zamyka się, gdy zamyka się rynek bazowy (plus ewentualne przedłużenia u brokera).",
    consequenceCorrect:
      "Nie trzymasz pozycji przez weekend „bo zapomniałeś”, że instrument jest niehandlowalny z luką w poniedziałek.",
    consequenceWrong:
      "Gap weekendowy na indeksie bywa zaskoczeniem przy SL, jeśli ignorowałeś harmonogram.",
    topic: "Godziny",
    difficulty: "easy",
  },
  {
    id: "cfd-09",
    question: "Gwarantowany stop-loss (GSLO):",
    options: [
      "Może mieć dodatkową premię i eliminuje poślizg negatywny",
      "Jest darmowy",
      "Nie działa na indeksach",
      "Zawsze niedostępny w UE",
    ],
    correctIndex: 0,
    correctAnswer: "Może mieć dodatkową premię i eliminuje poślizg negatywny",
    explanation:
      "GSLO to produkt zwykle płatny (szerszy spread/premia) w zamian za gwarancję realizacji po zadeklarowanym poziomie przy spełnionych warunkach oferty.",
    consequenceCorrect:
      "Świadomie wybierasz: płacisz za redukcję tail risk przy skrajnych lukach.",
    consequenceWrong:
      "Oczekiwanie darmowego GSLO prowadzi do nieporozumień z regulaminem i kosztem.",
    topic: "Zlecenia",
    difficulty: "medium",
  },
  {
    id: "cfd-10",
    question: "Close-out/margin close-out wg ESMA następuje zazwyczaj, gdy:",
    options: [
      "Equity/Margin spada do 50%",
      "Saldo = 0",
      "Spread > 10 pips",
      "Swap = 0",
    ],
    correctIndex: 0,
    correctAnswer: "Equity/Margin spada do 50%",
    explanation:
      "Automatyczne domykanie przy zbliżeniu się margin level do progu (typowo ok. 50% dla detalu) ma chronić przed pełnym rozjechaniem konta.",
    consequenceCorrect:
      "Monitorujesz margin level, a nie tylko zysk/stratę pozycji — unikasz przymusowej likwidacji.",
    consequenceWrong:
      "Brak kontroli marginu kończy się serią zamknięć w najgorszym momencie paniki.",
    topic: "Margin",
    difficulty: "medium",
  },
  {
    id: "cfd-11",
    question: "Short na CFD na akcje przy dniu dywidendy:",
    options: [
      "Obciążany ujemną korektą dywidendy",
      "Otrzymuje dywidendę",
      "Bez zmian",
      "Zamyka się automatycznie",
    ],
    correctIndex: 0,
    correctAnswer: "Obciążany ujemną korektą dywidendy",
    explanation:
      "Short jest logicznie przeciwny do longa co do przepływów dywidendowych — na CFD rozlicza się to korektą zamiast wypłaty.",
    consequenceCorrect:
      "Wliczasz dywidendę w koszt shorta swingowego, nie tylko spread i financing.",
    consequenceWrong:
      "Niespodziewany debit na koncie bywa błędnie interpretowany jako błąd platformy.",
    topic: "Dywidenda",
    difficulty: "medium",
  },
  {
    id: "cfd-12",
    question: "Komisja na CFD na akcje:",
    options: [
      "Często występuje oprócz spreadu (np. x bps wartości transakcji)",
      "Nie istnieje",
      "Zastępuje spread",
      "Płacona tylko przy zamknięciu",
    ],
    correctIndex: 0,
    correctAnswer: "Często występuje oprócz spreadu (np. x bps wartości transakcji)",
    explanation:
      "Akcje CFD często mają prowizję za obrót + spread — pełny koszt to suma obu przy wejściu i wyjściu.",
    consequenceCorrect:
      "Porównujesz oferty „all-in”, nie tylko „zero prowizji” w reklamie.",
    consequenceWrong:
      "Skalowanie strategii bez prowizji w modelu kończy się ujemnym expectancy w realu.",
    topic: "Koszty",
    difficulty: "easy",
  },
  {
    id: "cfd-13",
    question: "Dźwignia ESMA dla akcji to zwykle:",
    options: ["1:5 (margin 20%)", "1:2", "1:30", "1:50"],
    correctIndex: 0,
    correctAnswer: "1:5 (margin 20%)",
    explanation:
      "Dla klientów detalicznych w UE dźwignia na akcjach jest mocno ograniczona względem FX — typowo 1:5.",
    consequenceCorrect:
      "Planujesz kapitał pod realny margin na akcjach, nie pod FX 30:1.",
    consequenceWrong:
      "Przeniesienie nawyku lewara z FX na akcje CFD prowadzi do natychmiastowego przesterowania konta.",
    topic: "Regulacje",
    difficulty: "easy",
  },
  {
    id: "cfd-14",
    question: "Weekend gap na indeksach może:",
    options: [
      "Powodować otwarcie z luką i poślizg zleceń stop",
      "Zmniejszać ryzyko",
      "Gwarantować wykonanie po cenie",
      "Być niemożliwy",
    ],
    correctIndex: 0,
    correctAnswer: "Powodować otwarcie z luką i poślizg zleceń stop",
    explanation:
      "Rynek pozagodzinowy i wydarzenia weekendowe zmieniają cenę otwarcia — stopy realizują się po dostępnych cenach, często z poślizgiem.",
    consequenceCorrect:
      "Zmniejszasz ekspozycję przed weekendem lub akceptujesz gap risk w planie.",
    consequenceWrong:
      "SL „na papierze” nie chroni przed luką — możesz zamknąć się znacznie niżej/wyżej niż poziom.",
    topic: "Luki",
    difficulty: "medium",
  },
  {
    id: "cfd-15",
    question: "CFD a futures – główna różnica:",
    options: [
      "CFD nie ma daty wygaśnięcia (cash), futures ma",
      "Brak różnic",
      "Futures nie ma depozytu",
      "CFD zawsze na giełdzie",
    ],
    correctIndex: 0,
    correctAnswer: "CFD nie ma daty wygaśnięcia (cash), futures ma",
    explanation:
      "Cash CFD jest zwykle bez rolloveru daty jak u kontraktu — futures wymaga rolowania lub wygaśnięcia.",
    consequenceCorrect:
      "Nie mylisz kosztów rollovingu futures z kosztem finansowania CFD.",
    consequenceWrong:
      "Porównanie P/L między instrumentami bez tej różnicy zniekształca backtesty.",
    topic: "Instrumenty",
    difficulty: "easy",
  },
  {
    id: "cfd-16",
    question: "Hedging portfela CFD może polegać na:",
    options: [
      "Zajęciu przeciwstawnej pozycji na korelującym instrumencie",
      "Zwiększeniu dźwigni",
      "Usunięciu SL",
      "Zmianie rachunku",
    ],
    correctIndex: 0,
    correctAnswer: "Zajęciu przeciwstawnej pozycji na korelującym instrumencie",
    explanation:
      "Hedge to świadoma offsetting exposure — np. przez instrument o znanej korelacji (nigdy przez „więcej lewara”).",
    consequenceCorrect:
      "Rozumiesz koszt hedge’u (podwójny spread/finansowanie) vs. redukcja ryzyka.",
    consequenceWrong:
      "„Hedging” przez dokładanie pozycji w tym samym kierunku to pyramiding, nie ochrona.",
    topic: "Ryzyko",
    difficulty: "medium",
  },
  {
    id: "cfd-17",
    question: "Corporate actions (split/merge) w CFD:",
    options: [
      "Powodują odpowiednie korekty wielkości i ceny pozycji",
      "Nie wpływają",
      "Zawsze zamykają pozycję",
      "Dotyczą tylko futures",
    ],
    correctIndex: 0,
    correctAnswer: "Powodują odpowiednie korekty wielkości i ceny pozycji",
    explanation:
      "Split łączy się ze skalowaniem pozycji i ceny tak, by ekonomicznie było spójnie — podobnie przy reverse split.",
    consequenceCorrect:
      "Nie panikujesz przy nagłej zmianie ceny/wolumenu na wykresie — weryfikujesz komunikat brokera.",
    consequenceWrong:
      "Interpretacja splitu jako „strata” bez korekty wielkości to błąd poznawczy typowy dla początkujących.",
    topic: "Corporate actions",
    difficulty: "medium",
  },
  {
    id: "cfd-18",
    question: "Ryzyko „symbol suspension” (zawieszenia obrotu) oznacza:",
    options: [
      "Możliwą niedostępność handlu/wyceny i rozszerzone spready",
      "Brak wpływu",
      "Zawsze zysk",
      "Stały spread",
    ],
    correctIndex: 0,
    correctAnswer: "Możliwą niedostępność handlu/wyceny i rozszerzone spready",
    explanation:
      "Emitent/regulator może zawiesić handel — wtedy nie domkniesz pozycji po żądanej cenie lub wcale przez jakiś czas.",
    consequenceCorrect:
      "Ograniczasz koncentrację w pojedynczych małych capach bez płynności.",
    consequenceWrong:
      "Pełen portfel „penny stock CFD” może się zamrozić w jednym dniu.",
    topic: "Płynność",
    difficulty: "medium",
  },
  {
    id: "cfd-19",
    question: "Indeksy CFD najczęściej są kwotowane:",
    options: ["W punktach indeksowych", "W USD za baryłkę", "W uncjach", "W buszlach"],
    correctIndex: 0,
    correctAnswer: "W punktach indeksowych",
    explanation:
      "Wartość kontraktu to zwykle kwota na punkt indeksu × wielkość — nie baryłki ani uncje.",
    consequenceCorrect:
      "Prawidłowo liczysz tick value i SL w punktach indeksu.",
    consequenceWrong:
      "Mylenie jednostek z rynku surowców prowadzi do absurdalnego rozmiaru pozycji.",
    topic: "Indeksy",
    difficulty: "easy",
  },
  {
    id: "cfd-20",
    question: "Różnica bid/ask w nocnych godzinach:",
    options: [
      "Może się rozszerzać ze względu na płynność",
      "Zawsze maleje",
      "Nie występuje",
      "Zawsze stała",
    ],
    correctIndex: 0,
    correctAnswer: "Może się rozszerzać ze względu na płynność",
    explanation:
      "Po godzinach sesji cash rynek bywa cieńszy — market makerzy poszerzają kwotowania.",
    consequenceCorrect:
      "Unikasz market orderów na szerokim spreadzie w after-hours bez potrzeby.",
    consequenceWrong:
      "Ten sam setup w dzień i w nocy ma często różne expectancy przez koszt wejścia.",
    topic: "Spread",
    difficulty: "easy",
  },
  {
    id: "cfd-21",
    question: "Model MM vs. STP w CFD:",
    options: [
      "MM może internalizować zlecenia; STP przekazuje do dostawców płynności",
      "To to samo",
      "STP = brak prowizji",
      "MM = brak poślizgu",
    ],
    correctIndex: 0,
    correctAnswer: "MM może internalizować zlecenia; STP przekazuje do dostawców płynności",
    explanation:
      "MM może być kontrstroną i zarządzać ryzykiem wewnętrznie; STP/ECN kieruje przepływ do zewnętrznej płynności — oba modele mają poślizg i koszty.",
    consequenceCorrect:
      "Oceniasz brokera po jakości realizacji i przejrzystości, nie po etykiecie marketingowej.",
    consequenceWrong:
      "Wiara w „STP = zawsze lepsze ceny” bez pomiaru prowadzi do złych wniosków.",
    topic: "Brokerzy",
    difficulty: "hard",
  },
  {
    id: "cfd-22",
    question: "CFD na towary (np. ropa) – główne czynniki ceny:",
    options: [
      "Podaż/popyt, zapasy, OPEC, makro",
      "Tylko kurs USD",
      "Tylko pogoda",
      "Wyłącznie polityka monetarna",
    ],
    correctIndex: 0,
    correctAnswer: "Podaż/popyt, zapasy, OPEC, makro",
    explanation:
      "Ropa ma własny bilans rynku fizycznego i geopolitykę — USD i stopy mają wpływ, ale nie są jedynym motorem.",
    consequenceCorrect:
      "Nie redukujesz driverów surowca do jednego wykresu dolara.",
    consequenceWrong:
      "Przeinwestowanie w pojedynczy czynnik zwiększa surprise risk przy raportach zapasów.",
    topic: "Towary",
    difficulty: "medium",
  },
  {
    id: "cfd-23",
    question: "CFD cash na indeks często zawiera w cenie:",
    options: [
      "Element finansowania (fair value) względem futures",
      "Dywidendy w pełnej wysokości",
      "Zero spreadu",
      "Gwarancję ceny",
    ],
    correctIndex: 0,
    correctAnswer: "Element finansowania (fair value) względem futures",
    explanation:
      "Cash index jest zsynchronizowany z krzywą futures z korektą kosztu utrzymania — stąd różnice vs. sam futures na wykresie.",
    consequenceCorrect:
      "Rozumiesz, czemu „ten sam indeks” może się minimalnie rozjeżdżać między produktami.",
    consequenceWrong:
      "Arbitraż „na oko” między CFD a futures bez kosztów finansowania zwykle jest iluzoryczny.",
    topic: "Wycena",
    difficulty: "hard",
  },
  {
    id: "cfd-24",
    question: "Slippage dodatni (positive) to:",
    options: [
      "Wykonanie po lepszej cenie niż oczekiwana",
      "Zawsze błąd platformy",
      "Niemożliwe",
      "Zawsze gorsza cena",
    ],
    correctIndex: 0,
    correctAnswer: "Wykonanie po lepszej cenie niż oczekiwana",
    explanation:
      "Przy zleceniach market/stop czasem trafisz lepszą cenę niż poziom zlecenia — to także poślizg, tylko na korzyść.",
    consequenceCorrect:
      "Nie zakładasz z automatu, że każdy poślizg to kradzież — mierzysz rozkład realizacji.",
    consequenceWrong:
      "Źle diagnozujesz jakość egzekucji — albo nadmiernie optymistycznie zakładasz edge, albo psujesz relację z brokerem; w obu przypadkach trudno poprawić realny koszt wejścia/wyjścia.",
    topic: "Egzekucja",
    difficulty: "medium",
  },
  {
    id: "cfd-25",
    question: "„Execution quality” w polityce best execution obejmuje m.in.:",
    options: [
      "Cenę, koszty, szybkość i prawdopodobieństwo wykonania",
      "Wygląd aplikacji",
      "Budżet marketingu",
      "Kolor świec",
    ],
    correctIndex: 0,
    correctAnswer: "Cenę, koszty, szybkość i prawdopodobieństwo wykonania",
    explanation:
      "Jakość wykonania to mierzalne parametry transakcji, nie estetyka platformy.",
    consequenceCorrect:
      "Wiesz, co warto audytować na koncie (slippage vs. mid, czas realizacji).",
    consequenceWrong:
      "Nie wiesz, co mierzyć na koncie (slippage vs. mid, czas realizacji) — trudno poprawić proces, a źle dobrane wejścia/wyjścia systematycznie obniżają wynik.",
    topic: "Best execution",
    difficulty: "easy",
  },
  {
    id: "cfd-26",
    question: "Najczęstsze ryzyka CFD to:",
    options: [
      "Dźwignia, zmienność, luki, finansowanie, poślizg",
      "Wyłącznie spread",
      "Brak płynności zawsze",
      "Brak ryzyka",
    ],
    correctIndex: 0,
    correctAnswer: "Dźwignia, zmienność, luki, finansowanie, poślizg",
    explanation:
      "Ryzyko CFD to pakiet: lewar spotęgowuje szybkość straty, luki i koszty utrzymania realnie tną edge.",
    consequenceCorrect:
      "Budujesz plan z checklistą wszystkich kosztów i scenariuszy ekstremalnych.",
    consequenceWrong:
      "Redukcja ryzyka do „spreadu” prowadzi do niedoszacowania tail events i margin close-out.",
    topic: "Ryzyko",
    difficulty: "easy",
  },
  {
    id: "cfd-27",
    question:
      "Po otwarciu zyskownej pozycji CFD equity na koncie rośnie, ale margin depozytowy na wiele instrumentów:",
    options: [
      "Zawsze spada do zera",
      "Może zostać skorygowany w górę lub w dół w zależności od zmienności, instrumentu i polityki brokera — nie zakładaj, że „zostało”",
      "Jest zamrożony na stałe przy wejściu",
      "Nie zależy od ceny rynkowej",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może zostać skorygowany w górę lub w dół w zależności od zmienności, instrumentu i polityki brokera — nie zakładaj, że „zostało”",
    explanation:
      "Margin to zabezpieczenie dynamiczne — przy wzroście zmienności dom może podnieść wymagania, nawet gdy pozycja jest na plusie.",
    consequenceCorrect: "Monitorujesz wolny margin i ewentualne „margin add-on”, nie tylko zysk pozycji.",
    consequenceWrong: "Dokładasz kolejne pozycje „bo jest zysk” — nagły podwyższony margin + drawdown robi margin call.",
    topic: "Margin",
    difficulty: "medium",
  },
  {
    id: "cfd-28",
    question: "Long CFD na indeks, gdy indeks rośnie o 1% (przed kosztami), Twój P/L w uproszczeniu:",
    options: [
      "Jest ujemny",
      "Jest dodatni proporcjonalnie do rozmiaru i wartości punktu — bo ekspozycja jest zgodna z kierunkiem bazowym",
      "Zawsze zero",
      "Zależy tylko od spreadu, nigdy od ruchu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Jest dodatni proporcjonalnie do rozmiaru i wartości punktu — bo ekspozycja jest zgodna z kierunkiem bazowym",
    explanation:
      "Long CFD na long underlying: zysk z wyższej ceny bazowej minus koszty wejścia, finansowania i wyjścia.",
    consequenceCorrect: "Łączysz kierunek z rozmiarem kontraktu, nie mylisz long/short.",
    consequenceWrong: "Short zamiast long przy tezie wzrostowej — kara podwójna: kierunek i koszty.",
    topic: "Wycena",
    difficulty: "easy",
  },
  {
    id: "cfd-29",
    question:
      "Na CFD indeksowym „1 punkt indeksu” to w praktyce:",
    options: [
      "Zawsze 1 PLN bez względu na wielkość",
      "Wartość pieniężna z tablicy instrumentu (np. kwota na punkt × wielkość) — bez tego źle liczysz SL w pieniądzu",
      "To samo co 1% indeksu",
      "Tylko liczba bez znaczenia dla P/L",
    ],
    correctIndex: 1,
    correctAnswer:
      "Wartość pieniężna z tablicy instrumentu (np. kwota na punkt × wielkość) — bez tego źle liczysz SL w pieniądzu",
    explanation:
      "Kontrakty mają contract value per point — backtest „w punktach” musi być przemnożony przez specyfikację.",
    consequenceCorrect: "Ryzyko w walucie rachunku jest spójne z planem.",
    consequenceWrong: "SL 50 punktów myślisz jako „mało”, a to niszczy konto — zła wartość punktu.",
    topic: "Kontrakt",
    difficulty: "medium",
  },
  {
    id: "cfd-30",
    question:
      "Short CFD na akcję w teorii (przed ograniczeniami brokera) ekspozycja na wzrost ceny bazowej jest:",
    options: [
      "Ograniczona jak przy longu",
      "Teoretycznie nieograniczona w górę — dlatego margin i polityka brokera bywają restrykcyjne",
      "Zawsze zerowa",
      "Zawsze dodatnia dla Ciebie",
    ],
    correctIndex: 1,
    correctAnswer:
      "Teoretycznie nieograniczona w górę — dlatego margin i polityka brokera bywają restrykcyjne",
    explanation:
      "Rosnąca cena bazy zwiększa stratę shorta; broker wymaga depozytu i może domykać przy braku pokrycia.",
    consequenceCorrect: "Short nie traktujesz jako „bezpieczniejszy kierunek” bez tail risk.",
    consequenceWrong: "Martwi short bez limitu strat — squeeze i margin close-out w jednej sesji.",
    topic: "Ryzyko",
    difficulty: "hard",
  },
  {
    id: "cfd-31",
    question:
      "Long CFD na akcję przez dzień dywidendy (ex-date) — typowy mechanizm rozliczenia:",
    options: [
      "Zawsze dostajesz gotówkę dywidendy jak akcjonariusz",
      "Pojawia się korekta salda zgodna z polityką brokera (często credit/debit zamiast fizycznej wypłaty)",
      "Dywidenda nie istnieje w CFD",
      "Spread zawsze = dywidenda",
    ],
    correctIndex: 1,
    correctAnswer:
      "Pojawia się korekta salda zgodna z polityką brokera (często credit/debit zamiast fizycznej wypłaty)",
    explanation:
      "CFD odzwierciedla ekonomicznie przepływy dywidendowe korektami, nie zawsze jako „wpływ na konto jak z banku”.",
    consequenceCorrect: "Czytasz komunikat dnia ex-div zanim interpretujesz skok ceny.",
    consequenceWrong: "Myślisz, że broker „ukradł” dywidendę — to najczęściej mechanika instrumentu.",
    topic: "Dywidenda",
    difficulty: "medium",
  },
  {
    id: "cfd-32",
    question:
      "CFD na akcję w porównaniu do posiadania akcji w depozycie:",
    options: [
      "Daje takie same prawa głosu na WZ",
      "Nie daje praw korporacyjnych właścicielskich — to syntetyczna ekspozycja na cenę",
      "Zawsze oznacza udział w zysku operacyjnym spółki poza ceną",
      "Jest identyczne podatkowo w każdym kraju bez wyjątku",
    ],
    correctIndex: 1,
    correctAnswer:
      "Nie daje praw korporacyjnych właścicielskich — to syntetyczna ekspozycja na cenę",
    explanation:
      "CFD to kontrakt z domem maklerskim na różnicę cen — nie jesteś akcjonariuszem.",
    consequenceCorrect: "Nie budujesz strategii „na prawach akcjonariusza” na CFD.",
    consequenceWrong: "Fałszywe oczekiwania co do przepływów i eventów korporacyjnych poza cennikiem brokera.",
    topic: "Instrumenty",
    difficulty: "easy",
  },
  {
    id: "cfd-33",
    question:
      "„Cash” CFD na surowiec względem kontraktu futures z datą wygaśnięcia różni się m.in. tym, że:",
    options: [
      "Oba mają identyczny koszt bez wyjątku",
      "Cash CFD nie wymaga od Ciebie ręcznego rollovingu daty jak przy serii futures — koszt utrzymania bywa w finansowaniu/spreadzie produktu",
      "Futures nie ma wygasania",
      "CFD zawsze dostarcza fizycznie rudę",
    ],
    correctIndex: 1,
    correctAnswer:
      "Cash CFD nie wymaga od Ciebie ręcznego rollovingu daty jak przy serii futures — koszt utrzymania bywa w finansowaniu/spreadzie produktu",
    explanation:
      "Użytkownik retail często widzi perpetual-like cash CFD; futures wymaga świadomej zmiany serii.",
    consequenceCorrect: "Porównujesz koszt całego cyklu, nie tylko pierwszy spread.",
    consequenceWrong: "Wdrażasz strategię futures 1:1 na cash CFD — inna krzywa kosztu i baza.",
    topic: "Instrumenty",
    difficulty: "hard",
  },
  {
    id: "cfd-34",
    question:
      "Karta informacyjna (KID) i test odpowiedniości przy CFD mają na celu głównie:",
    options: [
      "Zagwarantować zysk",
      "Uświadomić ryzyko i sprawdzić dopasowanie produktu — nie zastępują Twojego planu ryzyka",
      "Zastąpić analizę techniczną",
      "Wyłączyć dźwignię",
    ],
    correctIndex: 1,
    correctAnswer:
      "Uświadomić ryzyko i sprawdzić dopasowanie produktu — nie zastępują Twojego planu ryzyka",
    explanation:
      "To warstwa ochrony informacyjnej MiFID/omówień lokalnych — nadal możesz stracić depozyt szybko przy lewarze.",
    consequenceCorrect: "Traktujesz KID jako checklistę kosztów i scenariuszy, nie formalność.",
    consequenceWrong: "Klikasz „rozumiem” bez czytania — pierwszy gap robi close-out.",
    topic: "Regulacje",
    difficulty: "easy",
  },
  {
    id: "cfd-35",
    question:
      "Wskaźnik ryzyka w KID (np. skala 1–7) oznacza, że:",
    options: [
      "Produkt jest bezpieczny do poziomu wskaźnika",
      "To ustandaryzowana ocena historycznej zmienności/wyniku scenariuszy — nie limit strat na Twoim koncie",
      "Nie możesz stracić więcej niż wskaźnik × 100 PLN",
      "Broker zwraca straty powyżej 3",
    ],
    correctIndex: 1,
    correctAnswer:
      "To ustandaryzowana ocena historycznej zmienności/wyniku scenariuszy — nie limit strat na Twoim koncie",
    explanation:
      "Klasyfikacja pomaga porównać produkty; przy lewarze strata może objąć cały depozyt szybciej niż „średnia zmienność dnia”.",
    consequenceCorrect: "Dopasowujesz rozmiar do najgorszego dnia, nie do „średniej”.",
    consequenceWrong: "Większy poziom „bo KID pokazało 4/7” — niedoszacowanie tail risk.",
    topic: "Regulacje",
    difficulty: "medium",
  },
  {
    id: "cfd-36",
    question:
      "Oświadczenie, że „rozumiesz ryzyko łącznie z możliwością utraty całości wpłat”, gdy realnie nie masz planu na margin ani SL:",
    options: [
      "Chroni Cię automatycznie przed stratą",
      "Nie zmienia mechaniki rynku — to tylko potwierdzenie świadomości; odpowiadasz za konsekwencje tak jak przedtem",
      "Zwalnia brokera z obowiązku realizacji zleceń",
      "Blokuje dźwignię",
    ],
    correctIndex: 1,
    correctAnswer:
      "Nie zmienia mechaniki rynku — to tylko potwierdzenie świadomości; odpowiadasz za konsekwencje tak jak przedtem",
    explanation:
      "Compliance ≠ mentoring — nadal obowiązują margin, koszty i luki.",
    consequenceCorrect: "Budujesz plan albo ograniczasz lewar, zamiast „podpisać i zapomnieć”.",
    consequenceWrong: "Pierwszy impuls volatility kończy się przymusowym zamknięciem „niesprawiedliwym”.",
    topic: "Regulacje",
    difficulty: "easy",
  },
  {
    id: "cfd-37",
    question:
      "Segregacja środków klientów u regulowanego brokera ma sens głównie przy:",
    options: [
      "Gwarantowanym zysku",
      "Upadłości podmiotu — środki klientów są proceduralnie oddzielone od majątku właścicielskiego (w ramach przepisów i struktury)",
      "Eliminowaniu strat handlowych",
      "Znikaniu spreadu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Upadłości podmiotu — środki klientów są proceduralnie oddzielone od majątku właścicielskiego (w ramach przepisów i struktury)",
    explanation:
      "To ochrona prawna/organizacyjna przy niewypłacalności brokera, nie tarcza przed złym trade’em.",
    consequenceCorrect: "Rozróżniasz ryzyko brokera od ryzyka strategii.",
    consequenceWrong: "Wybierasz offshore bez segregacji, licząc tylko na „wyższy lewar”.",
    topic: "Regulacje",
    difficulty: "medium",
  },
  {
    id: "cfd-38",
    question:
      "Status klienta profesjonalnego (po spełnieniu kryteriów) zwykle:",
    options: [
      "Zawsze jest korzystny bez minusów",
      "Ogranicza lub usuwa część ochron detalicznych (np. wyższa dźwignia, inne zasady informowania) — wyższa swoboda = wyższa odpowiedzialność",
      "Zakazuje handlu CFD",
      "Daje prawo głosu w spółkach z CFD",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ogranicza lub usuwa część ochron detalicznych (np. wyższa dźwignia, inne zasady informowania) — wyższa swoboda = wyższa odpowiedzialność",
    explanation:
      "Profesjonalizacja to trade-off: mniej barier ochronnych w zamian za uznanie doświadczenia.",
    consequenceCorrect: "Decydujesz świadomie, czy naprawdę potrzebujesz wyższego lewara.",
    consequenceWrong: "Profesjonalny status „dla prestiżu” — utrata KID i wyższy lewar niszczy konto szybciej.",
    topic: "Regulacje",
    difficulty: "hard",
  },
  {
    id: "cfd-39",
    question:
      "Gdy margin level zbliża się do progu automatycznego domykania, broker zwykle:",
    options: [
      "Dopłaca do konta",
      "Zamyka pozycje (częściowo lub w całości) wg polityki, by podnieść stosunek equity do margin — kolejność bywa deterministyczna lub wg największej straty",
      "Zawiesza wszystkie straty",
      "Zmienia historię transakcji",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zamyka pozycje (częściowo lub w całości) wg polityki, by podnieść stosunek equity do margin — kolejność bywa deterministyczna lub wg największej straty",
    explanation:
      "Close-out ma chronić przed ujemnym saldem i spiralą — realizacja bywa po słabych cenach w panice.",
    consequenceCorrect: "Redukujesz pozycję sam wcześniej, zamiast dać się domknąć algorytmowi.",
    consequenceWrong: "Seria zamknięć w najgorszych cenach dnia — brak możliwości odbicia.",
    topic: "Margin",
    difficulty: "medium",
  },
  {
    id: "cfd-40",
    question:
      "Porównujesz ofertę „0 prowizji” na akcjach CFD z ofertą prowizji + węższym spreadem. Prawidłowe podejście:",
    options: [
      "Zawsze wybierać zero prowizji",
      "Liczyć koszt all-in przy Twoim typowym rozmiarze i częstotliwości — spread i prowizja razem",
      "Ignorować spread",
      "Zakładać identyczny spread u wszystkich",
    ],
    correctIndex: 1,
    correctAnswer:
      "Liczyć koszt all-in przy Twoim typowym rozmiarze i częstotliwości — spread i prowizja razem",
    explanation:
      "Prowizja zero często rekompensuje się szerszym spreadem — dla aktywnego skalpa bywa gorzej.",
    consequenceCorrect: "Model kosztowy strategii jest zgodny z realnym rachunkiem.",
    consequenceWrong: "Skalping „tanio” zjada edge w ukrytym spreadzie.",
    topic: "Koszty",
    difficulty: "medium",
  },
  {
    id: "cfd-41",
    question:
      "Finansowanie overnight na CFD jest naliczane typowo:",
    options: [
      "Tylko w piątek",
      "Per doba utrzymania pozycji wg harmonogramu brokera (zwykle okno doby handlowej), nie „za każdą godzinę kliknięcia”",
      "Tylko przy zysku",
      "Wyłącznie jako podatek",
    ],
    correctIndex: 1,
    correctAnswer:
      "Per doba utrzymania pozycji wg harmonogramu brokera (zwykle okno doby handlowej), nie „za każdą godzinę kliknięcia”",
    explanation:
      "Konwencja dnia rozliczeniowego decyduje, czy przechodzisz na kolejny koszt — podobnie jak w FX overnight.",
    consequenceCorrect: "Sprawdzasz harmonogram przed trzymaniem przez święto lub weekend.",
    consequenceWrong: "Niespodziewany koszt po jednej „dodatkowej” dobie — zysk netto ujemny.",
    topic: "Finansowanie",
    difficulty: "medium",
  },
  {
    id: "cfd-42",
    question:
      "Trzymanie pozycji przez weekend na indeksie/akcji CFD często oznacza:",
    options: [
      "Brak ryzyka, bo rynek zamknięty",
      "Ryzyko luki otwarcia i ewentualnie większy koszt finansowania w zależności od produktu i dni — gap może minąć SL",
      "Spread zawsze zero w poniedziałek",
      "Automatyczne zamknięcie w piątek",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko luki otwarcia i ewentualnie większy koszt finansowania w zależności od produktu i dni — gap może minąć SL",
    explanation:
      "Cena otwarcia po weekendzie bywa inna niż zamknięcie — stop nie jest gwarancją poziomu.",
    consequenceCorrect: "Świadomie redukujesz rozmiar przed weekendem lub akceptujesz gap w planie.",
    consequenceWrong: "Pełna ekspozycja na headline weekendowy — realizacja daleko poza SL.",
    topic: "Finansowanie",
    difficulty: "easy",
  },
  {
    id: "cfd-43",
    question:
      "Spread na CFD poza główną sesją cash rynku bazowego:",
    options: [
      "Jest zawsze taki sam jak w peak",
      "Bywa szerszy przez niższą płynność — ten sam setup ma gorsze expectancy",
      "Znika",
      "Dotyczy tylko Forex",
    ],
    correctIndex: 1,
    correctAnswer:
      "Bywa szerszy przez niższą płynność — ten sam setup ma gorsze expectancy",
    explanation:
      "Market makerzy poszerzają kwotowania, gdy jest mniej kontrstrony.",
    consequenceCorrect: "Ograniczasz handel after-hours do strategii uwzględniającej koszt.",
    consequenceWrong: "Skalp o 22:00 jak o 16:00 — seria strat na wejściu/wyjściu.",
    topic: "Spread",
    difficulty: "easy",
  },
  {
    id: "cfd-44",
    question:
      "Opłata za przewalutowanie przy CFD w walucie innej niż waluta rachunku:",
    options: [
      "Nigdy nie występuje",
      "Może doliczyć się do realnego kosztu P/L — trzeba czytać cennik, nie tylko spread",
      "Jest zabroniona w UE",
      "Dotyczy tylko krypto",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może doliczyć się do realnego kosztu P/L — trzeba czytać cennik, nie tylko spread",
    explanation:
      "Zysk/strata w USD na koncie PLN bywa przewalutowana po kursie/stawce brokera.",
    consequenceCorrect: "Porównujesz konta i instrumenty z uwzględnieniem FX na saldzie.",
    consequenceWrong: "Zysk „na papierze” w USD topnieje po przewalutowaniu i opłacie.",
    topic: "Koszty",
    difficulty: "medium",
  },
  {
    id: "cfd-45",
    question:
      "Opłata za bezczynność na małym koncie CFD:",
    options: [
      "Nie istnieje nigdzie",
      "Może stopniowo uszczuplać depozyt — przy długiej przerwie w handlu realnie obniża kapitał roboczy",
      "Jest dodatnia dla klienta",
      "Dotyczy tylko profesjonalnych",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może stopniowo uszczuplać depozyt — przy długiej przerwie w handlu realnie obniża kapitał roboczy",
    explanation:
      "Wielu brokerów ma maintenance fee — małe saldo + brak aktywności = eroding capital.",
    consequenceCorrect: "Zamykasz konto lub wycofujesz nadwyżkę, jeśli nie handlujesz.",
    consequenceWrong: "„Zaparkowany” depozyt znika w opłatach — wracasz do zera bez trade’ów.",
    topic: "Koszty",
    difficulty: "easy",
  },
  {
    id: "cfd-46",
    question:
      "„Round turn” w kosztach transakcyjnych oznacza w praktyce:",
    options: [
      "Tylko wejście",
      "Wejście i wyjście razem — pełny cykl obrotu",
      "Tylko swap",
      "Tylko podatek",
    ],
    correctIndex: 1,
    correctAnswer: "Wejście i wyjście razem — pełny cykl obrotu",
    explanation:
      "Porównując prowizje brokerów, sprawdzasz czy podana stawka jest per strona czy za obrót pełny.",
    consequenceCorrect: "Backtest kosztów mnożysz ×2 przy prowizji per side.",
    consequenceWrong: "Model z połową realnych kosztów — wdrażasz strategię, która w realu jest ujemna.",
    topic: "Koszty",
    difficulty: "medium",
  },
  {
    id: "cfd-47",
    question:
      "Handlujesz CFD na akcję US z Polski w godzinach pre-market u brokera. Największe ryzyko operacyjne to:",
    options: [
      "Brak zmienności",
      "Szerszy spread, mniejsza płynność i większy poślizg — realizacja bywa znacznie droższa niż w regular session",
      "Brak wykresu",
      "Automatyczny zysk",
    ],
    correctIndex: 1,
    correctAnswer:
      "Szerszy spread, mniejsza płynność i większy poślizg — realizacja bywa znacznie droższa niż w regular session",
    explanation:
      "Extended hours to inna mikrostruktura niż core session — ten sam sygnał techniczny ma inny koszt.",
    consequenceCorrect: "Filtrujesz sygnały pod sesję lub akceptujesz koszt w sizingu.",
    consequenceWrong: "Skopiowany SL/TP z RTH bez korekty kosztu — edge znika.",
    topic: "Godziny",
    difficulty: "medium",
  },
  {
    id: "cfd-48",
    question:
      "Emitent ogłasza rights issue (prawo poboru). Na CFD zwykle:",
    options: [
      "Automatycznie stajesz się akcjonariuszem z prawem",
      "Broker stosuje korekty/kompensacje zgodnie z regulaminem — możesz zobaczyć zmianę salda lub parametrów bez fizycznego pakietu praw",
      "Nic się nie dzieje",
      "CFD zamienia się w obligacje",
    ],
    correctIndex: 1,
    correctAnswer:
      "Broker stosuje korekty/kompensacje zgodnie z regulaminem — możesz zobaczyć zmianę salda lub parametrów bez fizycznego pakietu praw",
    explanation:
      "Corporate actions są mapowane na syntetyczny kontrakt — szczegóły zależą od polityki brokera.",
    consequenceCorrect: "Czytasz komunikat i specyfikację zdarzenia, nie porównujesz 1:1 do akcji w depozycie.",
    consequenceWrong: "Panika przy korekcie salda „bez mojej zgody” — to standardowa obsługa CA.",
    topic: "Corporate actions",
    difficulty: "hard",
  },
  {
    id: "cfd-49",
    question:
      "Wezwanie / przejęcie (takeover bid) przy otwartej pozycji long CFD:",
    options: [
      "Zawsze pozostaje po starej cenie bez zmian",
      "Może spowodować skok cenowy i zmianę płynności — P/L bywa ekstremalny, a handel bywa zawieszany lub ograniczany",
      "Zamyka zysk w ujemnym",
      "Wyłącza margin",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może spowodować skok cenowy i zmianę płynności — P/L bywa ekstremalny, a handel bywa zawieszany lub ograniczany",
    explanation:
      "M&A to tail event — spread i dostępność instrumentu mogą się gwałtownie zmienić.",
    consequenceCorrect: "Ograniczasz koncentrację w spółkach objętych spekulacją M&A.",
    consequenceWrong: "Max lewar na „pewnym” przejęciu — jedna zmiana warunków dealu niszczy pozycję.",
    topic: "Corporate actions",
    difficulty: "medium",
  },
  {
    id: "cfd-50",
    question:
      "Po splitcie akcji 4:1 Twój CFD:",
    options: [
      "Zawsze znika bez rekompensaty",
      "Powinien być przeskalowany tak, by wartość ekonomiczna pozycji była spójna — cena i wielkość się zmieniają, nie „tracisz” magicznie",
      "Zwiększa się bez zmiany ceny",
      "Zamienia się w short",
    ],
    correctIndex: 1,
    correctAnswer:
      "Powinien być przeskalowany tak, by wartość ekonomiczna pozycji była spójna — cena i wielkość się zmieniają, nie „tracisz” magicznie",
    explanation:
      "Split nie zmienia wartości firmy — zmienia jednostki notowania; CFD odzwierciedla to korektami.",
    consequenceCorrect: "Sprawdzasz komunikat zamiast panikować przy skoku ceny na wykresie.",
    consequenceWrong: "Zamykanie „straty” po splitcie, która była tylko efektem skali wykresu.",
    topic: "Corporate actions",
    difficulty: "easy",
  },
  {
    id: "cfd-51",
    question:
      "Specjalna dywidenda (special dividend) większa niż zwykła:",
    options: [
      "Nie wpływa na CFD",
      "Zwykle generuje większą korektę na pozycjach niż rutynowy ex-div — musisz liczyć wpływ na short/long",
      "Zawsze jest dodatnia dla shorta",
      "Dotyczy tylko obligacji",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zwykle generuje większą korektę na pozycjach niż rutynowy ex-div — musisz liczyć wpływ na short/long",
    explanation:
      "Wielkość dywidendy skaluje cash adjustment — special bywa „uderzeniem” w P/L.",
    consequenceCorrect: "Kalendarz dywidend uwzględnia special, nie tylko regular.",
    consequenceWrong: "Short „pod” special div — nieprzewidziany debit na koncie.",
    topic: "Dywidenda",
    difficulty: "medium",
  },
  {
    id: "cfd-52",
    question:
      "ADR (amerykański depozyt) na CFD vs. akcja na rodzimym rynku tej samej spółki:",
    options: [
      "Zawsze mają identyczny koszt i godziny bez wyjątku",
      "Mogą różnić się spreadem, godzinami, kursem FX i obsługą corporate actions — to nie ten sam instrument 1:1",
      "To zawsze ten sam ticker i ta sama płynność",
      "ADR nie podlega dywidendom",
    ],
    correctIndex: 1,
    correctAnswer:
      "Mogą różnić się spreadem, godzinami, kursem FX i obsługą corporate actions — to nie ten sam instrument 1:1",
    explanation:
      "ADR to pakiet praw w USA z ryzykiem kursowym bazowej waluty akcji.",
    consequenceCorrect: "Handlujesz symbolem, który faktycznie masz na platformie, nie „ideą spółki”.",
    consequenceWrong: "Arbitraż „ADR vs home” bez kosztów FX i różnic dywidendowych — stratny.",
    topic: "Akcje",
    difficulty: "hard",
  },
  {
    id: "cfd-53",
    question:
      "Krótką sprzedaż CFD na mało płynną small-cap:",
    options: [
      "Zawsze jest bezpiecznym hedgingiem portfela",
      "Niesie ryzyko squeeze, zawieszenia shortów u brokera i ekstremalnych spreadów — tail risk rośnie",
      "Nie ma ryzyka ceny",
      "Broker zawsze pożycza akcji za darmo",
    ],
    correctIndex: 1,
    correctAnswer:
      "Niesie ryzyko squeeze, zawieszenia shortów u brokera i ekstremalnych spreadów — tail risk rośnie",
    explanation:
      "Retail short na illiquid bywa ograniczany; koszt finansowania i dostępność zmieniają się dynamicznie.",
    consequenceCorrect: "Ograniczasz sizing i masz plan na brak możliwości domknięcia.",
    consequenceWrong: "Short meme-stock — margin call przy squeeze.",
    topic: "Płynność",
    difficulty: "hard",
  },
  {
    id: "cfd-54",
    question:
      "Dywidenda wypłacona w innej walucie niż waluta rachunku na CFD:",
    options: [
      "Zawsze przeliczana jest po kursie 1:1",
      "Korekta bywa przeliczona po kursie/stawce brokera — realny wpływ zależy od FX i opłat",
      "Jest zawsze wyższa niż nominal",
      "Ignorowana przez platformę",
    ],
    correctIndex: 1,
    correctAnswer:
      "Korekta bywa przeliczona po kursie/stawce brokera — realny wpływ zależy od FX i opłat",
    explanation:
      "Wielowalutowość dodaje warstwę kosztu/przeliczenia poza samą kwotą dywidendy.",
    consequenceCorrect: "Liczyć net po przewalutowaniu przy strategiach dywidendowych.",
    consequenceWrong: "Założenie identycznej kwoty w PLN co w USD na komunikacie spółki.",
    topic: "Dywidenda",
    difficulty: "medium",
  },
  {
    id: "cfd-55",
    question:
      "CFD na krypto u brokera vs. cash indeks giełdowy — weekend:",
    options: [
      "Zawsze identyczne godziny",
      "Bywa, że krypto CFD jest dostępne 24/7, podczas gdy inne klasy mają przerwy — gap między instrumentami robi różnicę w portfelu",
      "Krypto zawsze zamknięte w weekend",
      "Weekend nie istnieje na żadnym CFD",
    ],
    correctIndex: 1,
    correctAnswer:
      "Bywa, że krypto CFD jest dostępne 24/7, podczas gdy inne klasy mają przerwy — gap między instrumentami robi różnicę w portfelu",
    explanation:
      "Korelacje między klasami aktywów zmieniają się w czasie — różne sesje = różne ryzyko gap.",
    consequenceCorrect: "Nie zakładasz synchronicznych zamknięć bez sprawdzenia specyfikacji.",
    consequenceWrong: "Hedge BTC CFD pozycją na indeksie zamykanej w weekend — nieskuteczny hedge czasowy.",
    topic: "Godziny",
    difficulty: "medium",
  },
  {
    id: "cfd-56",
    question:
      "CFD na złoto przy gwałtownym wzroście realnych stóp i mocnym USD często:",
    options: [
      "Zawsze rośnie bez wyjątku",
      "Bywa pod presją wielu czynników naraz — brak prostego „jednego drivera”; scenariusz wymaga kontekstu",
      "Nie ma związku z USD",
      "Kopiuje ruch S&P 1:1",
    ],
    correctIndex: 1,
    correctAnswer:
      "Bywa pod presją wielu czynników naraz — brak prostego „jednego drivera”; scenariusz wymaga kontekstu",
    explanation:
      "Złoto ma relacje z real rates, USD, geopolityką i płynnością — uproszczenia prowadzą do błędów.",
    consequenceCorrect: "Jednofaktorowe narracje weryfikujesz na wykresie i kalendarzu, nie w credo.",
    consequenceWrong: "Koniec świata według jednego headline — pozycja przeciwko silnemu kontekstowi makro.",
    topic: "Towary",
    difficulty: "hard",
  },
  {
    id: "cfd-57",
    question:
      "Raport zapasów ropy (np. EIA) przy otwartej pozycji na CFD ropy:",
    options: [
      "Nigdy nie wpływa na cenę",
      "Może wywołać skok zmienności i spreadu — realizacja SL marketem bywa droga",
      "Zamyka pozycję automatycznie",
      "Zmienia contract size",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może wywołać skok zmienności i spreadu — realizacja SL marketem bywa droga",
    explanation:
      "Surprise w bilansie rynku często resetuje intraday range — mikrostruktura się psuje.",
    consequenceCorrect: "Redukcja rozmiaru przed publikacją lub świadomy akcept kosztu.",
    consequenceWrong: "Pełny lot i paniczny exit w sekundę danych — poślizg pośród volatility.",
    topic: "Towary",
    difficulty: "medium",
  },
  {
    id: "cfd-58",
    question:
      "W „fast market” broker informuje o możliwych requote/off-quote. Oznacza to:",
    options: [
      "Gwarancję ceny z poprzedniej sekundy",
      "Że realizacja market może być opóźniona, odrzucona lub po innej cenie niż ekran sugeruje w tej chwili",
      "Że spread = 0",
      "Że zyski są zamrożone",
    ],
    correctIndex: 1,
    correctAnswer:
      "Że realizacja market może być opóźniona, odrzucona lub po innej cenie niż ekran sugeruje w tej chwili",
    explanation:
      "Przy ekstremalnej vol ochrona systemów i brak płynności zmieniają zachowanie zleceń.",
    consequenceCorrect: "Unikasz forsowania serii marketów w chaosie.",
    consequenceWrong: "Frustracja i seria złych realizacji w jednym evencie.",
    topic: "Egzekucja",
    difficulty: "medium",
  },
  {
    id: "cfd-59",
    question:
      "Płacisz premię za gwarantowany stop na CFD. To jest:",
    options: [
      "Ukryty podatek",
      "Świadomy koszt ubezpieczenia tail risk — jak każdy koszt, obniża net expectancy strategii",
      "Zawsze stratne i bezużyteczne",
      "Zastępuje margin",
    ],
    correctIndex: 1,
    correctAnswer:
      "Świadomy koszt ubezpieczenia tail risk — jak każdy koszt, obniża net expectancy strategii",
    explanation:
      "GSLO ma cenę (spread/premia) w zamian za redukcję skrajnego slippage przy spełnionych warunkach oferty.",
    consequenceCorrect: "Używasz tylko tam, gdzie tail risk przewyższa koszt premii.",
    consequenceWrong: "GSLO na każdej pozycji — strategia staje się ujemna przez stały podatek.",
    topic: "Zlecenia",
    difficulty: "medium",
  },
  {
    id: "cfd-60",
    question:
      "Strategia działa na demo z idealnym wypełnieniem, a na live koszt realizacji jest wyższy. Pierwszy krok:",
    options: [
      "Zwiększyć lewar",
      "Zmierzyć slippage i spread w live vs. założenia w modelu — dopiero potem ocenić edge",
      "Zakładać manipulację bez danych",
      "Wyłączyć SL",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zmierzyć slippage i spread w live vs. założenia w modelu — dopiero potem ocenić edge",
    explanation:
      "Demo często nie replikuje mikrostruktury — różnica kosztów bywa całym „edge”.",
    consequenceCorrect: "Kalibracja strategii pod realne koszty zamiast narracji.",
    consequenceWrong: "Wdrożenie bez pomiaru — kapitał spływa przez execution tax.",
    topic: "Egzekucja",
    difficulty: "easy",
  },
];
