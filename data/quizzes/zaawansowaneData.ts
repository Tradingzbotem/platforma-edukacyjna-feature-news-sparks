import type { DataMcqRow } from "./dataMcqRow";

export const ZAAWANSOWANE_QUIZ_DATA: DataMcqRow[] = [
  {
    id: "adv-01",
    question: "Edge (przewaga) w ujęciu statystycznym to:",
    options: [
      "Dodatnia oczekiwana wartość (EV>0) po kosztach",
      "Zawsze najwyższy Win%",
      "Brak strat",
      "Stały spread",
    ],
    correctIndex: 0,
    correctAnswer: "Dodatnia oczekiwana wartość (EV>0) po kosztach",
    explanation:
      "Edge to dodatnie EV po prowizji, spreadzie i poślizgu — wysoki Win% bez EV i tak nie utrzyma konta.",
    consequenceCorrect:
      "Oceniasz strategię liczbami po kosztach, nie screenem samego wskaźnika wygranych.",
    consequenceWrong:
      "Możesz mieć wysoki RR i serię wygranych, a i tak tracić kapitał, jeśli EV po kosztach jest ujemna — Win% na ekranie myli, dopóki nie liczysz średniej wygranej i przegranej na trade.",
    topic: "Edge i EV",
    difficulty: "medium",
  },
  {
    id: "adv-02",
    question: "Look-ahead bias to:",
    options: [
      "Użycie informacji z przyszłości w backteście",
      "Zbyt mały sample",
      "Brak transakcji",
      "Błąd prowizji",
    ],
    correctIndex: 0,
    correctAnswer: "Użycie informacji z przyszłości w backteście",
    explanation:
      "Np. sygnał z ceny zamknięcia świecy, ale wejście na jej openie „wiedząc” już close — sztucznie zawyża wynik.",
    consequenceCorrect:
      "Projektujesz reguły czasowe tak, by dane były dostępne w momencie decyzji w live.",
    consequenceWrong:
      "Wdrażasz reguły, których w live nie da się powtórzyć — wejścia wyglądają tanio w testach, a na rachunku płacisz gorszą ceną i tracisz edge od pierwszych transakcji.",
    topic: "Backtest",
    difficulty: "medium",
  },
  {
    id: "adv-03",
    question: "Survivorship bias oznacza:",
    options: [
      "Ignorowanie padłych/delistowanych instrumentów w danych",
      "Zawsze losowanie danych",
      "Brak poboru danych",
      "Wyłącznie w krypto",
    ],
    correctIndex: 0,
    correctAnswer: "Ignorowanie padłych/delistowanych instrumentów w danych",
    explanation:
      "Tylko „żywe” spółki w indeksie wyglądają lepiej retrospektywnie — historyczny zestaw był inny niż dziś.",
    consequenceCorrect:
      "Szukasz zestawów point-in-time lub uwzględniasz delisting w symulacji.",
    consequenceWrong:
      "Przesterowujesz kapitał pod zawyżoną historię — w live trafiasz na delistingy i gorszą realizację, których „czysty” backtest nie pokazał.",
    topic: "Dane",
    difficulty: "hard",
  },
  {
    id: "adv-04",
    question: "Walk-forward analysis służy do:",
    options: [
      "Selekcji/aktualizacji parametrów przez okna IS/OOS w czasie",
      "Optymalizacji prowizji",
      "Zwiększania dźwigni",
      "Zmiany brokera",
    ],
    correctIndex: 0,
    correctAnswer: "Selekcji/aktualizacji parametrów przez okna IS/OOS w czasie",
    explanation:
      "Trenujesz na przeszłym oknie, testujesz na następnym i przesuwasz okno — symulacja tego, jak aktualizowałbyś model w czasie.",
    consequenceCorrect:
      "Mniej przeoptymalizowanych parametrów „na całą historię naraz”.",
    consequenceWrong:
      "Wdrażasz parametry dopasowane do całej historii naraz — na kolejnym odcinku rynku seria strat wygląda jak „zmiana charakteru rynku”, a to konsekwencja overfitu i złego sizingu.",
    topic: "Optymalizacja",
    difficulty: "hard",
  },
  {
    id: "adv-05",
    question: "P-hacking/multiple testing problem to:",
    options: [
      "Zwiększone ryzyko fałszywych trafień przy wielu testach",
      "Brak normalności rozkładu",
      "Błąd liczenia pipsów",
      "Zawsze wyższy Sharpe",
    ],
    correctIndex: 0,
    correctAnswer: "Zwiększone ryzyko fałszywych trafień przy wielu testach",
    explanation:
      "Testując 20 wariantów, jeden „znaczący” może być czystym szczęściem — trzeba korekty na liczbę testów lub OOS.",
    consequenceCorrect:
      "Traktujesz nowe odkrycia jak hipotezy do potwierdzenia na świeżych danych.",
    consequenceWrong:
      "Wdrażasz setup dopasowany do przeszłości — na koncie seria strat wygląda jak „pech”, a to statystyka fałszywych trafień; ryzykujesz pełnym sizingiem bez realnej przewagi.",
    topic: "Statystyka",
    difficulty: "hard",
  },
  {
    id: "adv-06",
    question: "Monte Carlo w tradingu służy do:",
    options: [
      "Symulacji losowej kolejności wyników/parametrów i oceny stabilności",
      "Ustalenia spreadu",
      "Obliczeń KID",
      "Zawsze do predykcji",
    ],
    correctIndex: 0,
    correctAnswer: "Symulacji losowej kolejności wyników/parametrów i oceny stabilności",
    explanation:
      "Permutacja kolejności trade’ów pokazuje rozkład drawdownu przy tym samym zestawie wyników — test stabilności szczęścia/kolejności.",
    consequenceCorrect:
      "Wiesz, czy seria strat to normalna zmienność procesu, czy sygnał złego modelu.",
    consequenceWrong:
      "Jedna ścieżka equity bez MC ukrywa, że losowa kolejność strat mogłaby zabić konto przy tym samym edge — w live trafiasz na „złą kolejność” i marginuje się szybciej, niż zakładałeś.",
    topic: "Symulacje",
    difficulty: "hard",
  },
  {
    id: "adv-07",
    question: "Sharpe ratio to:",
    options: [
      "(Zwrot – stopa wolna)/odchylenie stóp",
      "Wolumen ÷ koszt",
      "Zysk ÷ strata",
      "Win% × RR",
    ],
    correctIndex: 0,
    correctAnswer: "(Zwrot – stopa wolna)/odchylenie stóp",
    explanation:
      "Sharpe porównuje nadwyżkę zwrotu ponad stopę wolną od ryzyka do zmienności — nie jest to Win% ani prosty stosunek zysk/strata.",
    consequenceCorrect:
      "Poprawnie porównujesz strategie o różnej zmienności.",
    consequenceWrong:
      "Wybierasz strategię po złej metryce — możesz preferować wysoki Win% przy kolosalnej zmienności equity i dużym ryzyku ruiny, zamiast spójnego zwrotu na jednostkę ryzyka.",
    topic: "Metryki",
    difficulty: "medium",
  },
  {
    id: "adv-08",
    question: "Max Drawdown (MDD) mierzy:",
    options: [
      "Największe obsunięcie kapitału od szczytu",
      "Średnią stratę",
      "Najgorszy SL",
      "Spread efektywny",
    ],
    correctIndex: 0,
    correctAnswer: "Największe obsunięcie kapitału od szczytu",
    explanation:
      "MDD to peak-to-trough na krzywej kapitału — klucz do psychiki i wymogów kapitałowych strategii.",
    consequenceCorrect:
      "Dobierasz leverage i depozyt pod realny obszar spadków, nie pod średni trade.",
    consequenceWrong:
      "Niedoszacowany drawdown kończy się wyzerowaniem konta przed odwróceniem się edge — przerywasz strategię lub dokładasz ryzyko dokładnie wtedy, gdy kapitał jest najcieńszy.",
    topic: "Ryzyko",
    difficulty: "easy",
  },
  {
    id: "adv-09",
    question: "Kelly fraction (teoria) sugeruje:",
    options: [
      "Optymalny ułamek kapitału przy znanym EV i wariancji",
      "Brak ryzyka",
      "Stałe 1% na trade",
      "RR = 1",
    ],
    correctIndex: 0,
    correctAnswer: "Optymalny ułamek kapitału przy znanym EV i wariancji",
    explanation:
      "Kelly wymaga dobrych estymat prawdopodobieństw — w praktyce używa się ułamka Kelly, bo pełny Kelly jest zbyt agresywny i wrażliwy na błąd estymacji.",
    consequenceCorrect:
      "Traktujesz Kelly jako punkt odniesienia, nie jako automatyczny przycisk „max size”.",
    consequenceWrong:
      "Pełny Kelly na złych danych przyspiesza ruinę szybciej niż flat staking — jedna seria strat ścina equity tak głęboko, że nie ma już matematycznej szansy na odbicie przy tym samym systemie.",
    topic: "Sizing",
    difficulty: "hard",
  },
  {
    id: "adv-10",
    question: "Volatility targeting polega na:",
    options: [
      "Skalowaniu pozycji tak, by utrzymać docelową zmienność portfela",
      "Zwiększaniu dźwigni w trendzie",
      "Zawsze równym lewarze",
      "Braku SL",
    ],
    correctIndex: 0,
    correctAnswer: "Skalowaniu pozycji tak, by utrzymać docelową zmienność portfela",
    explanation:
      "Gdy realized vol rośnie, zmniejszasz exposure i odwrotnie — stabilizujesz ryzyko, nie nominal.",
    consequenceCorrect:
      "Unikasz sytuacji, w której ten sam rozmiar lota w spokoju i w panice ma radykalnie inne ryzyko.",
    consequenceWrong:
      "Stały lot w zmieniającej się vol = nieświadomy wzrost ryzyka w kryzysie — ten sam SL w jednostkach ceny oznacza większy ułamek konta, więc drawdown rośnie szybciej niż w spokojnych latach backtestu.",
    topic: "Ryzyko",
    difficulty: "hard",
  },
  {
    id: "adv-11",
    question: "Ryzyko „data leakage” to:",
    options: [
      "Przeciek informacji między zbiorami trening/test",
      "Brak logowania",
      "Zerowy wolumen",
      "Zła waluta",
    ],
    correctIndex: 0,
    correctAnswer: "Przeciek informacji między zbiorami trening/test",
    explanation:
      "Np. normalizacja na całej próbie zanim podzielisz train/test — model „widzi” przyszłość przez skalowanie.",
    consequenceCorrect:
      "Pipeline feature engineering jest zamknięty wewnątrz każdego folda walk-forward.",
    consequenceWrong:
      "Zawyżona skuteczność ML, która znika na koncie od pierwszego tygodnia — handlujesz pełnym rozmiarem na modelu, który widział przyszłość w cechach; realne wejścia są gorsze i seria strat zaczyna się od razu.",
    topic: "ML / dane",
    difficulty: "hard",
  },
  {
    id: "adv-12",
    question: "Regime switching w praktyce:",
    options: [
      "Zmiany warunków rynkowych (risk-on/off) wpływające na skuteczność strategii",
      "Brak wpływu",
      "Stały spread",
      "Tylko w krypto",
    ],
    correctIndex: 0,
    correctAnswer: "Zmiany warunków rynkowych (risk-on/off) wpływające na skuteczność strategii",
    explanation:
      "Ta sama reguła może działać w trendzie i ginąć w mean-reversion — rynek zmienia „reżim”.",
    consequenceCorrect:
      "Rozważasz filtry reżimu lub redukcję aktywności, gdy warunki się zmieniają.",
    consequenceWrong:
      "Uparte granie jednego setupu w każdym reżimie to proszenie się o equity flat lub spadek — płacisz kosztem konta w fazach, gdy Twój edge jest wyłączony, zamiast ograniczyć aktywność lub zmienić filtr.",
    topic: "Reżim",
    difficulty: "medium",
  },
  {
    id: "adv-13",
    question: "Risk parity dąży do:",
    options: [
      "Wyrównania wkładu ryzyka składników portfela",
      "Maks. zysku jednego składnika",
      "Minimalnej liczby pozycji",
      "Braku dywersyfikacji",
    ],
    correctIndex: 0,
    correctAnswer: "Wyrównania wkładu ryzyka składników portfela",
    explanation:
      "Wagi zależą od zmienności/kowariancji — niskovol dostaje większą wagę w jednostce ryzyka niż w jednostce nominalu.",
    consequenceCorrect:
      "Nie mylisz równych nominalów z równym ryzykiem.",
    consequenceWrong:
      "Portfel „zbalansowany 50/50” w USD może być w praktyce 90% ryzyka na jednym aktywie.",
    topic: "Portfel",
    difficulty: "hard",
  },
  {
    id: "adv-14",
    question: "Transakcyjne koszty niejawne to m.in.:",
    options: [
      "Poślizg i wpływ na cenę (market impact)",
      "Wyłącznie prowizja",
      "Opłata stała platformy",
      "Podatek dochodowy",
    ],
    correctIndex: 0,
    correctAnswer: "Poślizg i wpływ na cenę (market impact)",
    explanation:
      "Prowizja to tylko część — duże zlecenie porusza cenę przeciwko tobie; poślizg bywa większy niż spread.",
    consequenceCorrect:
      "Wliczasz impact przy skalowaniu algotradingu i dużych rozmiarach.",
    consequenceWrong:
      "Backtest „tylko spread + prowizja” przecenia edge — w live duże zlecenia i poślizg zjadają zwrot; strategia wygląda na plusie w symulacji, a na koncie jest pod kreską przy realnym rozmiarze.",
    topic: "Koszty",
    difficulty: "medium",
  },
  {
    id: "adv-15",
    question: "„Outlier handling” może obejmować:",
    options: [
      "Winsoryzację/cięcie ogonów w analizie",
      "Zawsze usuwanie wszystkich skrajnych",
      "Ignorowanie outlierów",
      "Zastąpienie 0",
    ],
    correctIndex: 0,
    correctAnswer: "Winsoryzację/cięcie ogonów w analizie",
    explanation:
      "Ekstremalne obserwacje mogą zdominować estymację — świadome ograniczenie wpływu to standard, nie „usuwanie strat”.",
    consequenceCorrect:
      "Rozumiesz różnicę między czyszczeniem błędów danych a cheatem na wynik.",
    consequenceWrong:
      "Usuwanie każdej dużej straty ze zbioru to self-deception — w live te straty i tak przyjdą; wdrażasz strategię na zawyżonym EV i nadmiernym rozmiarze, więc pierwszy outlier na koncie robi nieproporcjonalny dziurę w equity.",
    topic: "Analiza",
    difficulty: "medium",
  },
  {
    id: "adv-16",
    question: "Korelacje w portfelu są zdradliwe, bo:",
    options: [
      "Są niestacjonarne i zmieniają się w czasie",
      "Zawsze stałe",
      "Nie mają znaczenia",
      "Są liniowe",
    ],
    correctIndex: 0,
    correctAnswer: "Są niestacjonarne i zmieniają się w czasie",
    explanation:
      "W kryzysie korelacje rosną — dywersyfikacja „na papierze” znika, gdy najbardziej jej potrzebujesz.",
    consequenceCorrect:
      "Monitorujesz rolling correlation i stress test, nie tylko średnią z spokojnych lat.",
    consequenceWrong:
      "Wielość pozycji bez aktualnej korelacji to pozorna dywersyfikacja — w kryzysie wszystkie legi się ruszają razem i drawdown rośnie jak przy jednej dużej pozycji, mimo „rozsiania” po tickerach.",
    topic: "Portfel",
    difficulty: "medium",
  },
  {
    id: "adv-17",
    question: "Execution algos (TWAP/VWAP) służą do:",
    options: [
      "Rozłożenia zleceń w czasie, by ograniczyć wpływ na rynek",
      "Zwiększania poślizgu",
      "Zamykania wszystkich pozycji",
      "Arbitrażu podatkowego",
    ],
    correctIndex: 0,
    correctAnswer: "Rozłożenia zleceń w czasie, by ograniczyć wpływ na rynek",
    explanation:
      "Algorytm rozbija duży wolumen na małe części według czasu (TWAP) lub wolumenu (VWAP), by zmniejszyć market impact.",
    consequenceCorrect:
      "Duże wejścia/wyjścia planujesz z execution policy, nie jednym marketem.",
    consequenceWrong:
      "Jednorazowy duży market order może zjeść kilka dni edge w jednej sekundzie — średnia cena wejścia odbiega od backtestu, a koszt realizacji staje się głównym czynnikiem wyniku tej transakcji.",
    topic: "Egzekucja",
    difficulty: "medium",
  },
  {
    id: "adv-18",
    question: "Iceberg/hidden order to:",
    options: [
      "Zlecenie z ukrytą częścią wolumenu",
      "Zawsze stop",
      "Limit z warunkiem",
      "Brak egzekucji",
    ],
    correctIndex: 0,
    correctAnswer: "Zlecenie z ukrytą częścią wolumenu",
    explanation:
      "Widoczna jest tylko część wolumenu — reszta ujawnia się po wypełnieniu, by nie zdradzić pełnego zamiaru.",
    consequenceCorrect:
      "Rozumiesz, czemu wolumen na tape nie zawsze pokazuje pełny zamiar gracza instytucjonalnego.",
    consequenceWrong:
      "Interpretacja order book „dosłownie” bez icebergów prowadzi do fałszywych sygnałów popytu — wchodzisz pod pozorną ścianę zleceń i płacisz natychmiastową realizacją przeciwko ukrytemu wolumenowi.",
    topic: "Mikrostruktura",
    difficulty: "hard",
  },
  {
    id: "adv-19",
    question: "Automatyzacja sygnałów obejmuje m.in.:",
    options: [
      "Alerty, webhooki/API, kolejki, retrie, logi",
      "Tylko e-mail",
      "Wyłącznie SMS",
      "Ręczne wpisy",
    ],
    correctIndex: 0,
    correctAnswer: "Alerty, webhooki/API, kolejki, retrie, logi",
    explanation:
      "Prawdziwa automatyzacja to nie tylko „strzał sygnału”, ale niezawodne dostarczenie, idempotencja i audyt.",
    consequenceCorrect:
      "Projektujesz system odporny na timeouty i duplikaty zleceń.",
    consequenceWrong:
      "Brak kolejki i retry = przegapione sygnały lub podwójne wejścia przy błędzie sieci — albo tracisz edge przez spóźnione wejście, albo nagle podwajasz ryzyko na tym samym sygnale.",
    topic: "Automatyzacja",
    difficulty: "medium",
  },
  {
    id: "adv-20",
    question: "„Lookback window” w strategii odnosi się do:",
    options: [
      "Zakresu danych używanych do obliczeń (np. EMA(50))",
      "Godzin handlu",
      "Limitu prowizji",
      "Maks. poślizgu",
    ],
    correctIndex: 0,
    correctAnswer: "Zakresu danych używanych do obliczeń (np. EMA(50))",
    explanation:
      "Okno wstecz określa pamięć wskaźnika — zmiana okna zmienia całkowicie sygnał.",
    consequenceCorrect:
      "Świadomie wybierasz okno pod warunki rynku, nie losową liczbę z optymalizacji.",
    consequenceWrong:
      "Ustawiasz parametry pod konkretną historię — na żywym rynku sygnały się rozjeżdżają, a Ty dalej handlujesz pełnym rozmiarem, dopóki konto nie pokaże drawdownu.",
    topic: "Parametry",
    difficulty: "easy",
  },
  {
    id: "adv-21",
    question: "„Alpha decay” oznacza:",
    options: [
      "Spadek przewagi strategii w czasie",
      "Wzrost EV",
      "Stały zysk",
      "Brak zmian",
    ],
    correctIndex: 0,
    correctAnswer: "Spadek przewagi strategii w czasie",
    explanation:
      "Rynek i konkurencja adaptują się — edge nie jest wieczny bez monitorowania i odświeżania.",
    explanationIncorrect:
      "Alpha decay to nie wzrost przewagi — to jej erozja w czasie.",
    consequenceCorrect:
      "Masz plan recenzji strategii i kryteria wyłączenia, nie tylko „działało lata temu”.",
    consequenceWrong:
      "Trzymanie martwego systemu kosztuje kapitał i psychikę — każda kolejna transakcja to płacenie alpha decay zamiast przeniesienia się na żywy edge lub ograniczenia aktywności.",
    topic: "Edge",
    difficulty: "medium",
  },
  {
    id: "adv-22",
    question: "Testowanie robustności obejmuje:",
    options: [
      "Perturbacje parametrów/danych, permutacje, MC",
      "Tylko jeden parametr",
      "Zawsze optymalizację do max",
      "Brak weryfikacji",
    ],
    correctIndex: 0,
    correctAnswer: "Perturbacje parametrów/danych, permutacje, MC",
    explanation:
      "Sprawdzasz, czy wynik nie stoi na ostrzu igły — małe zmiany parametru lub szumu nie powinny zabijać edge.",
    consequenceCorrect:
      "Wdrażasz tylko strategie z szerokim plateau, nie z pojedynczego optimum.",
    consequenceWrong:
      "Krucha strategia „perfect fit” łamie się przy pierwszym innym brokerze i kosztach — zmieniasz środowisko realizacji, a edge znika; tracisz kapitał, zanim zrozumiesz, że wynik stał na cienkim lodzie kosztów.",
    topic: "Walidacja",
    difficulty: "hard",
  },
  {
    id: "adv-23",
    question: "Równanie EV w tradingu:",
    options: [
      "EV = Win% × AvgWin – Loss% × AvgLoss (po kosztach)",
      "EV = suma zysków",
      "EV = Sharpe × beta",
      "EV = prowizja – swap",
    ],
    correctIndex: 0,
    correctAnswer: "EV = Win% × AvgWin – Loss% × AvgLoss (po kosztach)",
    explanation:
      "Oczekiwana wartość to ważona średnia wyników po kosztach transakcyjnych — suma zysków bez wag nie jest EV.",
    consequenceCorrect:
      "Liczenie EV na trade po kosztach daje realny obraz, czy gra się opłaca.",
    consequenceWrong:
      "Możesz mieć wysoki RR i nadal tracić, jeśli Win% jest za niski — strategia wygląda dobrze na papierze, ale kapitał maleje trade po trade, dopóki nie policzysz EV po kosztach.",
    topic: "EV",
    difficulty: "medium",
  },
  {
    id: "adv-24",
    question: "Metryka „Ulcer Index” mierzy:",
    options: [
      "Głębokość i czas trwania spadków kapitału",
      "Szum rynkowy",
      "Spread",
      "Wolumen",
    ],
    correctIndex: 0,
    correctAnswer: "Głębokość i czas trwania spadków kapitału",
    explanation:
      "Ulcer kładzie nacisk na bolesne fazy pod wodą — bardziej „ludzki” niż sam MDD punktowy.",
    consequenceCorrect:
      "Wybierasz strategię nie tylko po końcowym zysku, ale po przeżywalności drawdownu.",
    consequenceWrong:
      "Nie planujesz depozytu i psychiki pod długi drawdown — zamykasz system w dołku lub dokładasz lewar w panice, zanim strategia zdąży się odwrócić.",
    topic: "Metryki",
    difficulty: "hard",
  },
  {
    id: "adv-25",
    question: "Alert risk-on/off można oprzeć na:",
    options: [
      "Kombinacji VIX, spreadów kredytowych, krzywej UST",
      "Wyłącznie RSI 14",
      "Kolorze świec",
      "Godzinie serwera",
    ],
    correctIndex: 0,
    correctAnswer: "Kombinacji VIX, spreadów kredytowych, krzywej UST",
    explanation:
      "Reżim aversji do ryzyka widać szerzej niż na jednym wskaźniku price-only — często łączy się dług, FX i vol.",
    consequenceCorrect:
      "Filtr makro uzupełnia setup techniczny zamiast go zastępować.",
    consequenceWrong:
      "Filtrujesz wejścia pojedynczym oscylatorem zamiast szerokiego risk-on/off — wchodzisz pełnym rozmiarem tuż przed zmianą reżimu i płacisz serią strat, których setup techniczny nie wyjaśnia.",
    topic: "Makro",
    difficulty: "medium",
  },
  {
    id: "adv-26",
    question:
      "Backtestujesz strategię tylko na indeksie, który dziś istnieje i ma długą historię — bez uwzględnienia spółek, które wypadły z koszyka. Największe ryzyko poznawcze to:",
    options: [
      "Brak ryzyka — indeks jest zawsze reprezentatywny",
      "Survivorship bias — wynik jest zawyżony względem realnego doświadczenia „życia” instrumentów",
      "Zawsze zaniżony zysk",
      "Tylko problem podatkowy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Survivorship bias — wynik jest zawyżony względem realnego doświadczenia „życia” instrumentów",
    explanation:
      "Indeksy bywają rekonstruowane — test na obecnym składzie nie widzi bankructw i delistów z przeszłości.",
    consequenceCorrect: "Szukasz danych point-in-time albo testujesz na instrumentach, które realnie mógłbyś handlować.",
    consequenceWrong: "Wdrożenie na żywo — edge znika, bo unikasz tail events widzianych tylko w pełnym uniwersum.",
    topic: "Biasy",
    difficulty: "hard",
  },
  {
    id: "adv-27",
    question:
      "Po każdym miesiącu przesuwasz okno optymalizacji i wybierasz nowe „najlepsze” parametry na ostatnich 12 miesiącach. To w praktyce:",
    options: [
      "Czysty walk-forward bez ryzyka",
      "Często ukryte wielokrotne strojenie na tych samych danych — rośnie ryzyko przypadkowego dopasowania",
      "Gwarantuje stabilność",
      "Eliminuje koszty",
    ],
    correctIndex: 1,
    correctAnswer:
      "Często ukryte wielokrotne strojenie na tych samych danych — rośnie ryzyko przypadkowego dopasowania",
    explanation:
      "Bez ścisłego OOS i pojedynczej zasady wyboru parametrów rolling optymalizacja bywa kolejną rundą data mining.",
    consequenceCorrect: "Jedna zasła decyzji parametrów + zamrożony test forward.",
    consequenceWrong: "Żywy system „zawsze świeży fit” — kapitał płaci za losowe parametry.",
    topic: "Walidacja",
    difficulty: "hard",
  },
  {
    id: "adv-28",
    question:
      "Do modelu predykcyjnego przypadkiem dodałeś kolumnę skorelowaną z przyszłą ceną (przeciek). W out-of-sample:",
    options: [
      "Wynik musi być lepszy",
      "Wynik zwykle się załamie — edge był artefaktem etykiety, nie przewidywalnym sygnałem",
      "Przeciek zwiększa robustność",
      "Nie ma znaczenia przy ML",
    ],
    correctIndex: 1,
    correctAnswer:
      "Wynik zwykle się załamie — edge był artefaktem etykiety, nie przewidywalnym sygnałem",
    explanation:
      "Target leakage to klasyczny błąd — model „widzi przyszłość” w próbie.",
    consequenceCorrect: "Audyt cech: żadna informacja spoza chwili decyzji.",
    consequenceWrong: "Pełny depozyt na strategii, która w live nie ma z czego czerpać.",
    topic: "ML",
    difficulty: "hard",
  },
  {
    id: "adv-29",
    question:
      "Testujesz 200 kombinacji wskaźników i publikujesz tylko jedną z najlepszym Sharpe w próbie. Statystycznie:",
    options: [
      "To obiektywny dowód edge",
      "Szansa na trafienie „szczęśliwej” próby rośnie z liczbą testów — rośnie ryzyko p-hackingu",
      "Sharpe zawsze koryguje liczbę testów automatycznie",
      "200 testów = 200 niezależnych strategii",
    ],
    correctIndex: 1,
    correctAnswer:
      "Szansa na trafienie „szczęśliwej” próby rośnie z liczbą testów — rośnie ryzyko p-hackingu",
    explanation:
      "Multiple testing bez korekty (Bonferroni, OOS, permutation) zawyża optymizm.",
    consequenceCorrect: "Definiujesz hipotezę przed testem albo korygujesz za liczbę prób.",
    consequenceWrong: "Wdrożenie losowej konfiguracji z górki próby — drawdown od pierwszego kwartału.",
    topic: "Statystyka",
    difficulty: "medium",
  },
  {
    id: "adv-30",
    question:
      "Dzielisz historię na reżimy (niski/wysoki VIX) i stroisz osobno. Bez niezależnego OOS na przejściach reżimu:",
    options: [
      "Masz pewność adaptacji",
      "Ryzykujesz overfitem do etykiet reżimu, które na żywo rozpoznajesz z opóźnieniem",
      "Reżimy eliminują koszty",
      "VIX nie ma znaczenia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzykujesz overfitem do etykiet reżimu, które na żywo rozpoznajesz z opóźnieniem",
    explanation:
      "Klasyfikacja reżimu ex-post ≠ decyzja ex-ante — lookahead w etykiecie psuje test.",
    consequenceCorrect: "Reguły wejścia używają tylko informacji dostępnej w momencie zlecenia.",
    consequenceWrong: "Strategia „działała w reżimie A” ale nigdy nie wiesz na żywo, że jesteś w A.",
    topic: "Reżim",
    difficulty: "hard",
  },
  {
    id: "adv-31",
    question:
      "Porównujesz dwie strategie: A ma wyższy zysk końcowy, B ma niższy MDD przy podobnym zwrocie. Przy ograniczonej psychice kapitału:",
    options: [
      "Zawsze wybierz A",
      "B często jest preferowalne — przeżywalność drawdownu wpływa na realizację i długość życia systemu",
      "MDD nie ma znaczenia",
      "Tylko liczba transakcji się liczy",
    ],
    correctIndex: 1,
    correctAnswer:
      "B często jest preferowalne — przeżywalność drawdownu wpływa na realizację i długość życia systemu",
    explanation:
      "Realny edge to edge × prawdopodobieństwo, że dokończysz serię strat bez sabotażu.",
    consequenceCorrect: "Wybierasz strategię pod limit bólu i margin, nie pod screen shot equity.",
    consequenceWrong: "Porzucenie lepszego ex-ante B przez panikę w dołku A — realizowany wynik gorszy niż backtest.",
    topic: "Drawdown",
    difficulty: "medium",
  },
  {
    id: "adv-32",
    question:
      "Sortino vs Sharpe w praktyce oceny strategii trendowej:",
    options: [
      "Zawsze identyczne",
      "Sortino karze tylko odchylenie ujemne — przy asymetrii zysków może lepiej oddać „bolesność” niż pełne odchylenie",
      "Sharpe ignoruje straty",
      "Żadna metryka nie uwzględnia vol",
    ],
    correctIndex: 1,
    correctAnswer:
      "Sortino karze tylko odchylenie ujemne — przy asymetrii zysków może lepiej oddać „bolesność” niż pełne odchylenie",
    explanation:
      "Downside deviation odróżnia szkodliwą vol od „dobrej” zmienności zysków.",
    consequenceCorrect: "Dobierasz metrykę do rozkładu P/L, nie jeden wskaźnik na siłę.",
    consequenceWrong: "Odrzucenie strategii z fat tail zysków tylko przez wysoki Sharpe vol z dużych wygranych.",
    topic: "Metryki",
    difficulty: "hard",
  },
  {
    id: "adv-33",
    question:
      "Calmar ratio (return / |MDD|) jest użyteczny, ale jako jedyna metryka:",
    options: [
      "Wystarczy zawsze",
      "Może ukryć krótki, ekstremalny drawdown lub nietypowy okres próby — warto łączyć z długością próby i kosztami",
      "Ignoruje zwrot",
      "Równa się Sharpe",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może ukryć krótki, ekstremalny drawdown lub nietypowy okres próby — warto łączyć z długością próby i kosztami",
    explanation:
      "Jeden punkt MDD na krótkiej próbie bywa nietypowy — stabilność wymaga kontekstu.",
    consequenceCorrect: "Patrzysz na rozkład drawdownów i długość pod wodą, nie na jedną liczbę.",
    consequenceWrong: "Przeciążenie kapitału na podstawie jednego lucky okresu.",
    topic: "Metryki",
    difficulty: "medium",
  },
  {
    id: "adv-34",
    question:
      "Symulacja Monte Carlo na serii trade’ów zakłada często i.i.d., podczas gdy straty klastrują się w reżimach. Konsekwencja:",
    options: [
      "MC zawsze jest konserwatywny",
      "Rozkład tail risk w MC bywa zaniżony — seria strat w jednym reżimie jest groźniejsza niż losowe permutacje sugerują",
      "Klastry zwiększają Win%",
      "Reżimy eliminują MDD",
    ],
    correctIndex: 1,
    correctAnswer:
      "Rozkład tail risk w MC bywa zaniżony — seria strat w jednym reżimie jest groźniejsza niż losowe permutacje sugerują",
    explanation:
      "Blok bootstrap lub modele reżimowe lepiej oddają zależność czasową strat.",
    consequenceCorrect: "Nie ufasz jednej symulacji permutacji bez sprawdzenia autokorelacji strat.",
    consequenceWrong: "Undersizing w złym miejscu i oversizing w oparciu o zbyt optymistyczny tail.",
    topic: "Symulacje",
    difficulty: "hard",
  },
  {
    id: "adv-35",
    question:
      "Profit factor bardzo wysoki na małej próbie transakcji:",
    options: [
      "Dowodzi trwałego edge",
      "Bywa niestabilny — kilka dużych wygranych zawyża wskaźnik; potrzebna jest długość próby i rozkład trade’ów",
      "Zastępuje OOS",
      "Eliminuje koszty transakcyjne",
    ],
    correctIndex: 1,
    correctAnswer:
      "Bywa niestabilny — kilka dużych wygranych zawyża wskaźnik; potrzebna jest długość próby i rozkład trade’ów",
    explanation:
      "Małe N + skew = metryka podatna na outliery.",
    consequenceCorrect: "Wymagasz minimalnej liczby trade’ów i testów stabilności po usunięciu outlierów.",
    consequenceWrong: "Skalowanie na pełny depozyt po 15 trade’ach — jedna zmiana reżimu resetuje statystykę.",
    topic: "Metryki",
    difficulty: "medium",
  },
  {
    id: "adv-36",
    question:
      "„Half-Kelly” w praktyce retail oznacza:",
    options: [
      "Zawsze max lewar",
      "Świadome ograniczenie ułamka Kelly w obawie o błąd estymacji prawdopodobieństw i rozkładu",
      "Połowę kapitału na jeden trade bez SL",
      "Zakaz sizingu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Świadome ograniczenie ułamka Kelly w obawie o błąd estymacji prawdopodobieństw i rozkładu",
    explanation:
      "Kelly jest wrażliwy na błąd p i R — pełny Kelly z przewartościowanym p prowadzi do ruiny.",
    consequenceCorrect: "Konserwatywny ułamek + cap na trade i na portfel.",
    consequenceWrong: "Pełny Kelly na wyestymowanym z backtestu p — seria strat podcinająca konto.",
    topic: "Sizing",
    difficulty: "medium",
  },
  {
    id: "adv-37",
    question:
      "Volatility targeting: zwiększasz rozmiar, gdy realizowana vol spadnie. Ryzyko operacyjne:",
    options: [
      "Brak — vol nie wraca",
      "Skok vol po okresie ciszy może uderzyć w większą pozycję niż w czasie budowy — procykliczne zwiększanie ryzyka",
      "Zawsze zmniejsza drawdown",
      "Usuwa koszty",
    ],
    correctIndex: 1,
    correctAnswer:
      "Skok vol po okresie ciszy może uderzyć w większą pozycję niż w czasie budowy — procykliczne zwiększanie ryzyka",
    explanation:
      "Skalowanie do niskiej vol bywa z gruntu short vol — trzeba capów i lagów.",
    consequenceCorrect: "Ograniczenia na max leverage i powolne dostosowanie rozmiaru.",
    consequenceWrong: "Powiększanie pozycji tuż przed wybuchem zmienności — podwójna kara.",
    topic: "Sizing",
    difficulty: "hard",
  },
  {
    id: "adv-38",
    question:
      "Hedge dwoma silnie skorelowanymi longami w tym samym reżimie:",
    options: [
      "Zawsze dzieli ryzyko na pół",
      "W kryzysie korelacja często rośnie do 1 — hedge znika, zostaje skumulowany drawdown",
      "Korelacja jest stała w czasie",
      "Eliminuje margin",
    ],
    correctIndex: 1,
    correctAnswer:
      "W kryzysie korelacja często rośnie do 1 — hedge znika, zostaje skumulowany drawdown",
    explanation:
      "Diversyfikacja warunkowa zawodzi dokładnie wtedy, gdy jest najbardziej potrzebna.",
    consequenceCorrect: "Stress test portfela przy wzroście korelacji, nie tylko średnia korelacja.",
    consequenceWrong: "Poczucie bezpieczeństwa z „dwóch różnych ETF” — jeden szok obniża oba.",
    topic: "Portfel",
    difficulty: "hard",
  },
  {
    id: "adv-39",
    question:
      "Backtest portfela bez kosztów rebalance i spreadu przy rotacji:",
    options: [
      "Jest zawsze konserwatywny",
      "Zawyża wynik — realne koszty obrotu obniżają net alpha strategii rotacyjnej",
      "Koszty są drugiego rzędu",
      "Dotyczy tylko akcji fizycznych",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zawyża wynik — realne koszty obrotu obniżają net alpha strategii rotacyjnej",
    explanation:
      "Częsta rotacja = podatek transakcyjny na kapitał — musi wejść do modelu.",
    consequenceCorrect: "Modelujesz koszt każdej zmiany łanu i minimalny holding.",
    consequenceWrong: "Wdrożenie miesięcznej rotacji — po kosztach strategia jest pusta.",
    topic: "Koszty",
    difficulty: "medium",
  },
  {
    id: "adv-40",
    question:
      "Strategia ma dodatnie EV w wysokiej vol, ujemne w niskiej. Ignorując filtr reżimu:",
    options: [
      "Średnia zawsze jest dodatnia",
      "Łączysz dwa światy — realne EV na koncie zależy od tego, ile czasu spędzasz w każdym reżimie; mieszanka może być ujemna netto",
      "Vol nie wpływa na EV",
      "Niskie vol zawsze zwiększa zysk",
    ],
    correctIndex: 1,
    correctAnswer:
      "Łączysz dwa światy — realne EV na koncie zależy od tego, ile czasu spędzasz w każdym reżimie; mieszanka może być ujemna netto",
    explanation:
      "Średnia ważona czasem reżimu decyduje — jedna średnia na całości historii myli.",
    consequenceCorrect: "Rozdzielasz wynik per reżim albo wyłączasz strategię w złym reżimie.",
    consequenceWrong: "Tłumaczenie strat „anomalią” zamiast wyłączenia strategii w niskiej vol.",
    topic: "EV",
    difficulty: "hard",
  },
  {
    id: "adv-41",
    question:
      "Structural break (zmiana mikrostruktury/stop) wykryty ex-post na wykresie:",
    options: [
      "Powinien automatycznie usprawiedliwić każdą stratę",
      "Nie daje prawa do cherry-pickingu podziału próby bez planu detekcji ex-ante — inaczej to kolejny overfit",
      "Zawsze oznacza koniec rynku",
      "Nie ma wpływu na strategię",
    ],
    correctIndex: 1,
    correctAnswer:
      "Nie daje prawa do cherry-pickingu podziału próby bez planu detekcji ex-ante — inaczej to kolejny overfit",
    explanation:
      "Cięcie historii „tam gdzie widać zmianę” bez z góry zdefiniowanej reguły to lookahead.",
    consequenceCorrect: "Reguła zmiany modelu zapisana przed testem i walidowana forward.",
    consequenceWrong: "Ciągłe „restarty” backtestu po każdej stracie — iluzja adaptacji.",
    topic: "Walidacja",
    difficulty: "hard",
  },
  {
    id: "adv-42",
    question:
      "Niski koszt fałszywego sygnału w strategii z bardzo wysokim Win% ale małym RR:",
    options: [
      "Zawsze jest OK",
      "Może być wysoki w ujęciu kosztów transakcji — częste małe wygrane mylą, dopóki koszt obrotu nie zje margin",
      "Win% eliminuje koszty",
      "RR nie ma znaczenia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może być wysoki w ujęciu kosztów transakcji — częste małe wygrane mylą, dopóki koszt obrotu nie zje margin",
    explanation:
      "High frequency of trades × (spread+slippage) może zabić mikroedge.",
    consequenceCorrect: "Liczenie EV per trade po kosztach przy realnym obrocie.",
    consequenceWrong: "Skalowanie skalpu bez pomiaru realizacji — ujemna krzywa kapitału mimo „70% win”.",
    topic: "EV",
    difficulty: "medium",
  },
  {
    id: "adv-43",
    question:
      "Information ratio (nadwyżka vs benchmark / tracking error) niski przy Twojej „alpha” backtestowej:",
    options: [
      "Dowodzi geniuszu",
      "Sugeruje, że nadwyżka jest niestabilna względem benchmarku — może być szumem lub krótkim lucky strendem",
      "Tracking error = zysk",
      "Benchmark nie istnieje",
    ],
    correctIndex: 1,
    correctAnswer:
      "Sugeruje, że nadwyżka jest niestabilna względem benchmarku — może być szumem lub krótkim lucky strendem",
    explanation:
      "Stabilna nadwyżka wymaga niskiego błędu śledzenia w czasie.",
    consequenceCorrect: "Weryfikujesz spójność ekspozycji i źródeł alfy.",
    consequenceWrong: "Sprzedaż „alfa produktu” bez out-of-sample stabilności względem indeksu.",
    topic: "Analiza",
    difficulty: "hard",
  },
  {
    id: "adv-44",
    question:
      "Po serii wygranych zwiększasz agresywnie rozmiar, bo „czujesz flow”. To jest:",
    options: [
      "Kelly w czystej postaci",
      "Procykliczne zwiększanie ryzyka na szczycie equity — klasyczny błąd behavioralny przed korektą",
      "Zawsze poprawne matematycznie",
      "Neutralne dla MDD",
    ],
    correctIndex: 1,
    correctAnswer:
      "Procykliczne zwiększanie ryzyka na szczycie equity — klasyczny błąd behavioralny przed korektą",
    explanation:
      "Dobry streak nie zwiększa matematycznie p — często zwiększa overconfidence.",
    consequenceCorrect: "Stałe reguły sizingu lub cap po zwycięskiej serii.",
    consequenceWrong: "Max rozmiar tuż przed odwróceniem reżimu — wipe poprzednich zysków.",
    topic: "Psychologia systemu",
    difficulty: "medium",
  },
  {
    id: "adv-45",
    question:
      "Filtr makro (np. tylko long gdy krzywa nie jest inwersją) ma sens, jeśli:",
    options: [
      "Dodałeś go po obejrzeniu całej historii i „pasuje idealnie”",
      "Masz hipotezę ekonomiczną i potwierdzenie OOS, że filtr poprawia rozkład trade’ów, a nie tylko usuwa jedną stratę w backteście",
      "Wyklucza połowę zyskownych lat bez testu",
      "Zawsze zwiększa liczbę trade’ów",
    ],
    correctIndex: 1,
    correctAnswer:
      "Masz hipotezę ekonomiczną i potwierdzenie OOS, że filtr poprawia rozkład trade’ów, a nie tylko usuwa jedną stratę w backteście",
    explanation:
      "Filtr dopasowany do jednego crashu to kolejny parametr do overfitu.",
    consequenceCorrect: "Filtr jest prosty, interpretowalny i testowany forward.",
    consequenceWrong: "„Makro filtr” który po prostu wycina najgorszy rok z próby — iluzja robustności.",
    topic: "Makro",
    difficulty: "hard",
  },
  {
    id: "adv-46",
    question:
      "TWAP jako algorytm egzekucji ma sens głównie, gdy:",
    options: [
      "Chcesz jednym kliknięciem przeskoczyć kolejkę bez kosztu",
      "Rozbijasz duży wolumen w czasie, by ograniczyć market impact — akceptujesz niepewność ceny średniej",
      "Zawsze daje lepszą cenę niż VWAP",
      "Eliminuje poślizg",
    ],
    correctIndex: 1,
    correctAnswer:
      "Rozbijasz duży wolumen w czasie, by ograniczyć market impact — akceptujesz niepewność ceny średniej",
    explanation:
      "TWAP to kompromis impact vs timing risk — nie gwarancja najlepszej ceny.",
    consequenceCorrect: "Dobierasz algorytm do rozmiaru i płynności instrumentu.",
    consequenceWrong: "Jedna wielka market order na illiquid — permanentny minus na średniej realizacji.",
    topic: "Egzekucja",
    difficulty: "medium",
  },
  {
    id: "adv-47",
    question:
      "Iceberg / ukryty rozmiar w order booku instytucjonalnym dla retail oznacza, że:",
    options: [
      "Widzisz całą głębokość zawsze",
      "To, co widzisz na L2, nie jest pełnym obrazem płynności — ekstrapolacja „braku kontrstrony” bywa błędna",
      "Retail ma pełny L2 za darmo wszędzie",
      "Spread znika",
    ],
    correctIndex: 1,
    correctAnswer:
      "To, co widzisz na L2, nie jest pełnym obrazem płynności — ekstrapolacja „braku kontrstrony” bywa błędna",
    explanation:
      "Ukryte zleczenia i dark pools zmieniają to, co widać na tape.",
    consequenceCorrect: "Nie budujesz tezy mikrostrukturalnej na niepełnym feedzie.",
    consequenceWrong: "Front-running widma na podstawie płytkiego L2 — stratne decyzje.",
    topic: "Mikrostruktura",
    difficulty: "hard",
  },
  {
    id: "adv-48",
    question:
      "Bot handlowy traci połączenie tuż po wysłaniu zlecenia, nie wiesz, czy pozycja jest otwarta. Pierwszy priorytet:",
    options: [
      "Natychmiastowe podwojenie zlecenia",
      "Idempotencja i procedura reconcile: odczyt stanu pozycji z brokera zanim wyślesz duplikat",
      "Wyłączenie zasilania serwera",
      "Zwiększenie lewara",
    ],
    correctIndex: 1,
    correctAnswer:
      "Idempotencja i procedura reconcile: odczyt stanu pozycji z brokera zanim wyślesz duplikat",
    explanation:
      "Duplikat zlecenia przy niepewności stanu to podwójna ekspozycja albo hedge przypadkowy.",
    consequenceCorrect: "Kill switch + kolejka poleceń z weryfikacją stanu.",
    consequenceWrong: "Podwójna pozycja lub niechciany flip — drawdown poza modelem.",
    topic: "Automatyzacja",
    difficulty: "medium",
  },
  {
    id: "adv-49",
    question:
      "VWAP jako benchmark egzekucji — kupiłeś średnio powyżej sesyjnego VWAP przy dużym rozmiarze:",
    options: [
      "To zawsze sukces",
      "Może oznaczać wysoki market impact — Twój zakup podniósł cenę przeciwko sobie",
      "VWAP nie ma znaczenia dla retail",
      "Broker zwraca różnicę",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może oznaczać wysoki market impact — Twój zakup podniósł cenę przeciwko sobie",
    explanation:
      "Duży rozmiar względem płynności = płacisz za swoją własną presję na cenę.",
    consequenceCorrect: "Dzielisz zlecenie lub używasz passive limits.",
    consequenceWrong: "Pełny rozmiar w cienkim papierze — realizacja psuje backtest „po mid”.",
    topic: "Egzekucja",
    difficulty: "medium",
  },
  {
    id: "adv-50",
    question:
      "Parametry strategii zmieniasz co tydzień na podstawie ostatnich 5 trade’ów. To:",
    options: [
      "Szybka adaptacja zawsze dobra",
      "Szum próbkowania — 5 trade’ów to za mało, by estymować stabilnie p lub średnią wygraną",
      "Zastępuje OOS",
      "Eliminuje bias",
    ],
    correctIndex: 1,
    correctAnswer:
      "Szum próbkowania — 5 trade’ów to za mało, by estymować stabilnie p lub średnią wygraną",
    explanation:
      "Krótkie okno = reagujesz na los, nie na zmianę edge.",
    consequenceCorrect: "Minimalna próba i reguła zmiany zapisana z góry (np. co kwartał po N trade’ach).",
    consequenceWrong: "Ciągłe kręcenie śruby — system nigdy nie ma czasu wykazać edge.",
    topic: "Parametry",
    difficulty: "medium",
  },
  {
    id: "adv-51",
    question:
      "Latency arbitrage między dwoma retail brokerami w praktycie:",
    options: [
      "Jest łatwym stałym zyskiem",
      "Jest zwykle iluzją po kosztach, opóźnieniach i ryzyku braku wypełnienia po drugiej stronie",
      "Działa bez ryzyka kursowego",
      "Nie wymaga dwóch kont",
    ],
    correctIndex: 1,
    correctAnswer:
      "Jest zwykle iluzją po kosztach, opóźnieniach i ryzyku braku wypełnienia po drugiej stronie",
    explanation:
      "Retail nie ma symetrycznej szybkości i głębokości jak HFT — leg risk dominuje.",
    consequenceCorrect: "Skupiasz się na edge z przewagi procesu, nie na wyścigu milisekund.",
    consequenceWrong: "Utrata kapitału na poślizgu i jednostronnym wypełnieniu.",
    topic: "Mikrostruktura",
    difficulty: "medium",
  },
  {
    id: "adv-52",
    question:
      "Wdrażasz ten sam kod strategii na dwóch brokerach i wynik się różni. Pierwsza hipoteza powinna być:",
    options: [
      "Jeden broker zawsze kradnie",
      "Różnice w danych, czasie świecy, kosztach, filtrach handlu i realizacji — kalibracja środowiska przed winą",
      "Kod jest zawsze identyczny więc wynik musi być ten sam",
      "Spread nie istnieje",
    ],
    correctIndex: 1,
    correctAnswer:
      "Różnice w danych, czasie świecy, kosztach, filtrach handlu i realizacji — kalibracja środowiska przed winą",
    explanation:
      "Identyczna logika ≠ identyczny wynik — execution environment jest częścią systemu.",
    consequenceCorrect: "Logujesz fill vs mid i porównujesz kosztownik.",
    consequenceWrong: "Bezproduktywna walka z supportem zamiast pomiaru slippage.",
    topic: "Automatyzacja",
    difficulty: "easy",
  },
  {
    id: "adv-53",
    question:
      "Równanie EV mówi, że strategia jest plus po kosztach, ale rozkład jest fat-tailed z rzadkimi dużymi stratami. Decyzja:",
    options: [
      "Ignoruj tail — średnia wystarczy",
      "Rozmiar pozycji musi uwzględniać tail risk i max adverse excursion, nie tylko średnią stratę",
      "Fat tails zwiększają Win%",
      "Koszty eliminują tail",
    ],
    correctIndex: 1,
    correctAnswer:
      "Rozmiar pozycji musi uwzględniać tail risk i max adverse excursion, nie tylko średnią stratę",
    explanation:
      "Średnia strata myli, gdy jedna strata może być wielokrotnością „typowej”.",
    consequenceCorrect: "Cap na trade, opcje ochronne, redukcja lewara przed eventami.",
    consequenceWrong: "Jedna czarna łabędź resetuje konto mimo dodatniego EV na papierze.",
    topic: "EV",
    difficulty: "hard",
  },
  {
    id: "adv-54",
    question:
      "Paper trading z idealnym wypełnieniem vs live z tym samym kodem — różnica P/L w pierwszym miesiącu najczęściej wynika z:",
    options: [
      "Tylko z pecha",
      "Kosztów realizacji, częściowych wypełnień i różnic w danych — zanim szukasz nowego edge",
      "Zmiany praw fizyki",
      "Braku internetu zawsze",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kosztów realizacji, częściowych wypełnień i różnic w danych — zanim szukasz nowego edge",
    explanation:
      "Execution tax bywa całą różnicą między paper a live przy tej samej logice.",
    consequenceCorrect: "Kalibracja modelu kosztów na live micro account.",
    consequenceWrong: "Porzucenie działającej logiki przez nierozpoznanie execution drift.",
    topic: "Egzekucja",
    difficulty: "easy",
  },
  {
    id: "adv-55",
    question:
      "Smart order routing w ujęciu retail (uproszczone) oznacza, że:",
    options: [
      "Zawsze dostajesz najlepszą cenę na świecie",
      "Broker/platforma kieruje zlecenie tam, gdzie jest dostępna płynność wg swojej logiki — Ty nadal płacisz spread i warunki brokera",
      "Eliminuje regulacje",
      "Usuwa margin",
    ],
    correctIndex: 1,
    correctAnswer:
      "Broker/platforma kieruje zlecenie tam, gdzie jest dostępna płynność wg swojej logiki — Ty nadal płacisz spread i warunki brokera",
    explanation:
      "SOR optymalizuje w ramach dostępnych venue i relacji brokera, nie „magiczny arbitraż”.",
    consequenceCorrect: "Realistyczne oczekiwania co do poprawy vs single venue.",
    consequenceWrong: "Oczekiwanie zerowego kosztu przez routing — rozczarowanie i złe sizingi.",
    topic: "Egzekucja",
    difficulty: "medium",
  },
  {
    id: "adv-56",
    question:
      "Częściowe wypełnienie limit buy w trendzie spadkowym przy Twoim dużym rozmiarze:",
    options: [
      "Zawsze oznacza błąd brokera",
      "Może oznaczać brak kontrstrony po Twojej cenie — reszta zlecenia zostaje lub anuluje się wg polityki",
      "Wymusza market na resztę bez pytania",
      "Zawsze wypełnia 100%",
    ],
    correctIndex: 1,
    correctAnswer:
      "Może oznaczać brak kontrstrony po Twojej cenie — reszta zlecenia zostaje lub anuluje się wg polityki",
    explanation:
      "Limit ≠ gwarancja pełnego wolumenu — szczególnie w szybkim rynku.",
    consequenceCorrect: "Plan na niekompletne wypełnienie i timeout.",
    consequenceWrong: "Ekspozycja połowa zamierzonej bez świadomości — hedge i risk mismatch.",
    topic: "Egzekucja",
    difficulty: "medium",
  },
  {
    id: "adv-57",
    question:
      "Automatyczny restart bota co godzinę bez sprawdzenia stanu otwartych pozycji:",
    options: [
      "Best practice",
      "Ryzyko podwójnego wejścia lub utraty synchronizacji z rzeczywistym stanem konta",
      "Zawsze bezpieczne",
      "Eliminuje potrzebę logów",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko podwójnego wejścia lub utraty synchronizacji z rzeczywistym stanem konta",
    explanation:
      "State machine musi startować z ground truth z API brokera.",
    consequenceCorrect: "Persistencja stanu + reconcile przy starcie.",
    consequenceWrong: "Ghost positions lub duplicate orders — drawdown nieobjęty testami.",
    topic: "Automatyzacja",
    difficulty: "medium",
  },
  {
    id: "adv-58",
    question:
      "Mikrostruktura: kolejka zleceń limit przed Tobą rośnie — Twoje kupno po tej samej cenie:",
    options: [
      "Zawsze pierwsze",
      "Bywa realizowane później lub częściowo — priorytet czasu i pozycji w kolejce ma znaczenie",
      "Ignoruje kolejkę",
      "Broker zawsze daje pierwszeństwo retail",
    ],
    correctIndex: 1,
    correctAnswer:
      "Bywa realizowane później lub częściowo — priorytet czasu i pozycji w kolejce ma znaczenie",
    explanation:
      "FIFO/pro-rata zależy od venue — passive order nie gwarantuje natychmiastowej ekspozycji.",
    consequenceCorrect: "Plan na opóźnione wejście i zmianę ceny rynku w międzyczasie.",
    consequenceWrong: "Założenie natychmiastowej ekspozycji — strategia czasu traci synchronizację.",
    topic: "Mikrostruktura",
    difficulty: "hard",
  },
  {
    id: "adv-59",
    question:
      "Backtest zakłada fill po mid, live masz fill po ask. Co robić przed wdrożeniem:",
    options: [
      "Ignorować — mid to prawda",
      "Dodać koszt połowy spreadu (lub więcej) do każdej transakcji w symulacji albo modelować kolejkę",
      "Zmienić broker bez pomiaru",
      "Zwiększyć częstotliwość bez kosztu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Dodać koszt połowy spreadu (lub więcej) do każdej transakcji w symulacji albo modelować kolejkę",
    explanation:
      "Mid jest teoretyczny — realna egzekucja retail jest po stronie książki.",
    consequenceCorrect: "Conservative assumption na koszt sprawia, że live jest „bonus”, nie cios.",
    consequenceWrong: "Wdrożenie strategii ujemnej po realnych kosztach.",
    topic: "Egzekucja",
    difficulty: "easy",
  },
  {
    id: "adv-60",
    question:
      "Wdrażasz ML, który na walidacji krzyżowej wygląda świetnie, ale live degraduje się w pierwszym miesiącu. Pierwszy audyt:",
    options: [
      "Dodać więcej cech bez sprawdzenia przecieków",
      "Sprawdzenie przecieków czasowych, stabilności rozkładu cech i kosztów realizacji sygnału — nie tylko accuracy",
      "Zwiększyć lewar",
      "Zmienić broker bez analizy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Sprawdzenie przecieków czasowych, stabilności rozkładu cech i kosztów realizacji sygnału — nie tylko accuracy",
    explanation:
      "CV na szeregach czasowych bez purged split bywa zbyt optymistyczna; delay sygnału vs trade też zabija edge.",
    consequenceCorrect: "Purged K-fold, embargo, symulacja opóźnienia sygnału.",
    consequenceWrong: "Kolejna runda „feature engineering” na tym samym wycieku — głębsza dziura.",
    topic: "ML",
    difficulty: "hard",
  },
];
