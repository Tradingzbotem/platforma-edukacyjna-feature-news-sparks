import type { DataMcqRow } from "./dataMcqRow";

export const KNF_QUIZ_DATA: DataMcqRow[] = [
  {
    id: "knf-01",
    question: "Czym jest test adekwatności (appropriateness) w MiFID II?",
    options: [
      "Sprawdza, czy produkt pasuje do celów i sytuacji klienta",
      "Ocena wiedzy/ doświadczenia klienta dla produktów nieobjętych doradztwem",
      "Badanie zdolności kredytowej klienta",
      "Test ryzyka operacyjnego w firmie inwestycyjnej",
    ],
    correctIndex: 1,
    correctAnswer: "Ocena wiedzy/ doświadczenia klienta dla produktów nieobjętych doradztwem",
    explanation:
      "Appropriateness dotyczy usług bez doradztwa inwestycyjnego — firma sprawdza, czy klient rozumie ryzyko produktu złożonego i może wydać ostrzeżenie.",
    explanationIncorrect:
      "To nie jest suitability (dopasowanie do celów) — suitability obowiązuje przy doradztwie i zarządzaniu.",
    consequenceCorrect:
      "Rozumiesz, kiedy broker pyta o wiedzę, a kiedy o cele — mniej frustracji przy onboardingu.",
    consequenceWrong:
      "Mylenie testów sprawia, że oczekujesz „rekomendacji” tam, gdzie prawo wymaga tylko ostrzeżenia o ryzyku.",
    topic: "MiFID — klient",
    difficulty: "medium",
  },
  {
    id: "knf-02",
    question: "Dokument KID/KIID służy głównie do:",
    options: [
      "Raportowania transakcji do KNF",
      "Przedstawienia kluczowych informacji o produkcie klientowi",
      "Wyliczania depozytu zabezpieczającego",
      "Weryfikacji tożsamości klienta",
    ],
    correctIndex: 1,
    correctAnswer: "Przedstawienia kluczowych informacji o produkcie klientowi",
    explanation:
      "KID/KIID to skondensowany dokument o produkcie (cele, ryzyko, koszty, scenariusze) przed decyzją klienta.",
    consequenceCorrect:
      "Umiesz odróżnić KID od umowy i od potwierdzenia transakcji — czytasz właściwy dokument we właściwym momencie.",
    consequenceWrong:
      "Szukanie w KID danych KYC albo depozytu marnuje czas i prowadzi do złych pytań do BOK.",
    topic: "Dokumenty",
    difficulty: "easy",
  },
  {
    id: "knf-03",
    question: "Zasada best execution oznacza, że firma inwestycyjna powinna:",
    options: [
      "Realizować zlecenia zawsze na GPW",
      "Utrzymywać najniższe koszty stałe",
      "Dążyć do najlepszego możliwego wyniku (cena, koszty, szybkość, prawdopodobieństwo realizacji)",
      "Zawsze wykonywać zlecenia natychmiast",
    ],
    correctIndex: 2,
    correctAnswer:
      "Dążyć do najlepszego możliwego wyniku (cena, koszty, szybkość, prawdopodobieństwo realizacji)",
    explanation:
      "Best execution to całościowa ocena jakości realizacji dla klienta, nie „zawsze GPW” ani „zawsze natychmiast”.",
    consequenceCorrect:
      "Rozumiesz, że poślizg i koszt są częścią obrazu — nie tylko sama cena na ticku.",
    consequenceWrong:
      "Oczekiwanie realizacji zawsze na jednej giełdzie nie oddaje realiów rynku OTC i wielu instrumentów.",
    topic: "Wykonanie",
    difficulty: "medium",
  },
  {
    id: "knf-04",
    question: "Który z poniższych produktów jest zwykle uznawany za złożony w rozumieniu MiFID II?",
    options: ["Akcje blue-chip", "ETF UCITS plain-vanilla", "CFD na indeks", "Obligacje skarbowe"],
    correctIndex: 2,
    correctAnswer: "CFD na indeks",
    explanation:
      "CFD to typowo produkt złożony z dźwignią — wymaga surowszych procedur informowania i testów adekwatności.",
    consequenceCorrect:
      "Nie dziwisz się dodatkowym ostrzeżeniom i dokumentom przy CFD w porównaniu do prostych akcji.",
    consequenceWrong:
      "Traktowanie CFD jak „zwykłej akcji” prowadzi do niedoceniania wymogów i własnego ryzyka.",
    topic: "Produkty",
    difficulty: "easy",
  },
  {
    id: "knf-05",
    question: "Kategoryzacja klientów obejmuje:",
    options: [
      "Detaliczny, profesjonalny, uprawniony kontrahent",
      "Nowy, stały, VIP",
      "Standard, premium, private",
      "Klient ryzyka A, B, C",
    ],
    correctIndex: 0,
    correctAnswer: "Detaliczny, profesjonalny, uprawniony kontrahent",
    explanation:
      "MiFID rozróżnia kategorie z różnym poziomem ochrony — detaliczny ma najsilniejszą ochronę informacyjną i ograniczenia produktowe.",
    consequenceCorrect:
      "Wiesz, że zmiana kategorii zmienia zasady ochrony — nie jest to marketingowy status VIP.",
    consequenceWrong:
      "Myślenie w kategoriach „VIP z brokera” zamiast regulacyjnych może zmylić przy sporze o dokumentację.",
    topic: "Kategorie",
    difficulty: "easy",
  },
  {
    id: "knf-06",
    question: "Cel polityki konfliktów interesów to:",
    options: [
      "Minimalizacja kosztów działalności",
      "Zapobieganie sytuacjom konfliktu interesów i ich ujawnianie",
      "Zapewnienie najlepszych cen",
      "Uproszczenie dokumentacji KYC",
    ],
    correctIndex: 1,
    correctAnswer: "Zapobieganie sytuacjom konfliktu interesów i ich ujawnianie",
    explanation:
      "Polityka ma identyfikować, zapobiegać i ujawniać konflikty — nie optymalizować spreadu ani KYC.",
    consequenceCorrect:
      "Rozumiesz, czemu firma informuje o powiązaniach i zasadach rekompensat.",
    consequenceWrong:
      "Oczekiwanie, że konflikt interesów „nie istnieje”, bo jest zakazany, jest naiwne — prawo wymaga zarządzania, nie magii.",
    topic: "Compliance",
    difficulty: "easy",
  },
  {
    id: "knf-07",
    question: "Informacje o kosztach i opłatach przekazujemy:",
    options: [
      "Wyłącznie po zawarciu umowy",
      "Przed świadczeniem usługi i okresowo ex-post",
      "Tylko przy pierwszej transakcji",
      "Nie ma takiego obowiązku",
    ],
    correctIndex: 1,
    correctAnswer: "Przed świadczeniem usługi i okresowo ex-post",
    explanation:
      "Klient ma dostać informacje ex-ante przed usługą oraz okresowe podsumowania kosztów po świadczeniu.",
    consequenceCorrect:
      "Wiesz, że możesz żądać przejrzystości kosztów przed i po — to standard, nie łaska.",
    consequenceWrong:
      "Akceptacja „kosztów bez rozliczenia” osłabia Twoją zdolność porównania ofert i audytu.",
    topic: "Koszty",
    difficulty: "easy",
  },
  {
    id: "knf-08",
    question: "Typowe ostrzeżenie dla CFD to:",
    options: [
      "Brak ryzyka utraty kapitału",
      "Dźwignia może spotęgować zyski i straty",
      "Gwarantowany zysk roczny",
      "CFD są wyłącznie dla profesjonalnych",
    ],
    correctIndex: 1,
    correctAnswer: "Dźwignia może spotęgować zyski i straty",
    explanation:
      "Ostrzeżenie o ryzyku utraty kapitału i dźwigni jest kluczowe — nie wolno obiecywać braku ryzyka ani gwarantowanego zysku.",
    consequenceCorrect:
      "Czytasz ostrzeżenia jako opis mechaniki, nie jako przeszkodę marketingową.",
    consequenceWrong:
      "Wiara w „bezpieczny CFD” ignoruje to, jak szybko dźwignia przekłada się na realne straty.",
    topic: "CFD",
    difficulty: "easy",
  },
  {
    id: "knf-09",
    question: "Zgodnie z AML/KYC firma inwestycyjna powinna przede wszystkim:",
    options: [
      "Weryfikować tożsamość i beneficjenta rzeczywistego",
      "Zapewnić dostępność platformy 24/7",
      "Oferować demo",
      "Składać raporty kwartalne do GPW",
    ],
    correctIndex: 0,
    correctAnswer: "Weryfikować tożsamość i beneficjenta rzeczywistego",
    explanation:
      "AML/KYC ma wykrywać pranie pieniędzy i finansowanie terroryzmu — rdzeń to identyfikacja i weryfikacja + UBO.",
    consequenceCorrect:
      "Rozumiesz, czemu proszą o źródło środków — to obowiązek prawny, nie osobisty atak.",
    consequenceWrong:
      "Unikanie KYC szuka dziur w regulacjach i zwykle kończy się zamrożeniem konta.",
    topic: "AML",
    difficulty: "easy",
  },
  {
    id: "knf-10",
    question: "Czym jest transaction reporting (MiFIR)?",
    options: [
      "Przekazywanie organowi nadzoru szczegółów transakcji",
      "Wysyłka potwierdzeń do klienta",
      "Raport P/L klienta",
      "Sprawozdanie finansowe emitenta",
    ],
    correctIndex: 0,
    correctAnswer: "Przekazywanie organowi nadzoru szczegółów transakcji",
    explanation:
      "Transaction reporting to raportowanie transakcji do nadzoru w celu monitorowania rynku i manipulacji — równolegle do potwierdzeń dla klienta.",
    consequenceCorrect:
      "Nie mylisz raportowania nadzorczego z dokumentem, który dostajesz Ty jako klient.",
    consequenceWrong:
      "Pomyłka z potwierdzeniem transakcji utrudnia zrozumienie, po co firma zbiera dane.",
    topic: "MiFIR",
    difficulty: "medium",
  },
  {
    id: "knf-11",
    question: "Klient detaliczny ma zazwyczaj:",
    options: [
      "Najniższą ochronę",
      "Taką samą ochronę jak profesjonalny",
      "Najwyższy poziom ochrony regulacyjnej",
      "Brak prawa do informacji o ryzykach",
    ],
    correctIndex: 2,
    correctAnswer: "Najwyższy poziom ochrony regulacyjnej",
    explanation:
      "Retail ma silniejsze standardy informacyjne, ograniczenia produktowe i ochronę przed saldem ujemnym w UE niż typowy profesjonalny.",
    consequenceCorrect:
      "Świadomie decydujesz o ewentualnym opt-in na pro — wiesz, co tracisz i co zyskujesz.",
    consequenceWrong:
      "Chęć „bycia pro” bez rozumienia konsekwencji bywa stratna przy pierwszej kontrowersji z firmą.",
    topic: "Ochrona",
    difficulty: "easy",
  },
  {
    id: "knf-12",
    question: "Materiały marketingowe powinny być:",
    options: [
      "Zawsze krótsze niż 1 strona",
      "Rzetelne, jasne i niewprowadzające w błąd",
      "Wyłącznie po polsku",
      "Zatwierdzane przez KNF przed publikacją",
    ],
    correctIndex: 1,
    correctAnswer: "Rzetelne, jasne i niewprowadzające w błąd",
    explanation:
      "Marketing finansowy podlega standardom rzetelności — nie może obiecywać zysków ani ukrywać ryzyka.",
    consequenceCorrect:
      "Filtrujesz reklamy przez test: czy widać ryzyko i koszty, czy tylko obietnice.",
    consequenceWrong:
      "Wiarę w „gwarantowane scenariusze” z baneru łatwo przenieść na nadmierny lewar w praktyce.",
    topic: "Marketing",
    difficulty: "easy",
  },
  {
    id: "knf-13",
    question: "Zachęty (inducements) są dopuszczalne, gdy:",
    options: [
      "Zawsze i bez ograniczeń",
      "Nigdy",
      "Poprawiają jakość usługi i nie naruszają działania w najlepiej pojętym interesie klienta",
      "Wyłącznie przy klientach profesjonalnych",
    ],
    correctIndex: 2,
    correctAnswer:
      "Poprawiają jakość usługi i nie naruszają działania w najlepiej pojętym interesie klienta",
    explanation:
      "Inducements muszą być zgodne z interesem klienta i transparentne — nie każdy bonus jest dozwolony w każdej formie.",
    consequenceCorrect:
      "Pytasz, co jest za bonusem i czy nie zniekształca to rekomendacji lub zachowań.",
    consequenceWrong:
      "Bonus jako jedyny powód otwarcia konta często maskuje wyższe koszty lub presję obrotu.",
    topic: "Inducements",
    difficulty: "hard",
  },
  {
    id: "knf-14",
    question: "Który dokument klient otrzymuje regularnie po rozpoczęciu współpracy?",
    options: [
      "Wyłącznie potwierdzenia transakcji",
      "Raporty okresowe ex-post dot. kosztów i usług",
      "Sprawozdania finansowe emitentów",
      "Prospekt emisyjny",
    ],
    correctIndex: 1,
    correctAnswer: "Raporty okresowe ex-post dot. kosztów i usług",
    explanation:
      "Ex-post to okresowe podsumowanie kosztów i usług — obok potwierdzeń transakcji i innych informacji.",
    consequenceCorrect:
      "Sprawdzasz roczne podsumowania kosztów — porównujesz z tym, co widzisz na platformie.",
    consequenceWrong:
      "Brak świadomości raportów ex-post utrudnia walkę o zwrot ukrytych opłat.",
    topic: "Raporty",
    difficulty: "medium",
  },
  {
    id: "knf-15",
    question: "MAR dotyczy m.in.:",
    options: [
      "Wyłącznie rynku towarowego",
      "Insider dealing i manipulacji na rynku",
      "Podwyższania limitów dźwigni",
      "Spółek > 1 mld PLN",
    ],
    correctIndex: 1,
    correctAnswer: "Insider dealing i manipulacji na rynku",
    explanation:
      "MAR (Market Abuse Regulation) reguluje m.in. insider trading i manipulację — szerzej niż tylko towary.",
    consequenceCorrect:
      "Rozumiesz granice dyskusji o niepublikowanych informacjach i „tipsach”.",
    consequenceWrong:
      "Lekceważenie MAR przy social trading i pokojach sygnałowych może mieć poważne konsekwencje prawne.",
    topic: "MAR",
    difficulty: "medium",
  },
  {
    id: "knf-16",
    question: "„Appropriateness warning” to:",
    options: [
      "Ostrzeżenie o braku zgodności produktu z celami",
      "Ostrzeżenie o braku wiedzy/doświadczenia klienta",
      "Wezwanie do uzupełnienia depozytu",
      "Komunikat o przerwie technicznej",
    ],
    correctIndex: 1,
    correctAnswer: "Ostrzeżenie o braku wiedzy/doświadczenia klienta",
    explanation:
      "Ostrzeżenie adekwatności mówi: test wskazał luki w wiedzy/doświadczeniu względem produktu złożonego — to nie to samo co suitability.",
    consequenceCorrect:
      "Traktujesz ostrzeżenie jako sygnał edukacji, nie tylko checkbox do kliknięcia.",
    consequenceWrong:
      "Ignorowanie ostrzeżenia i tak dźwignia ryzyko, że podejmujesz decyzje ponad aktualny poziom rozumienia.",
    topic: "Ostrzeżenia",
    difficulty: "medium",
  },
  {
    id: "knf-17",
    question: "Który kanał komunikacji wymaga utrwalania przy przyjmowaniu zleceń?",
    options: ["Telefon/komunikatory", "Tylko e-mail", "Tylko papier", "Żaden"],
    correctIndex: 0,
    correctAnswer: "Telefon/komunikatory",
    explanation:
      "Rozmowy i komunikatory przy zleceniach często muszą być nagrywane/zapisywane dla audytu i ochrony obu stron.",
    consequenceCorrect:
      "Rozumiesz, czemu BOK prosi o powtórzenie zlecenia lub nagranie — to compliance, nie nieufność osobista.",
    consequenceWrong:
      "Oczekiwanie „ustnych zleceń bez śladu” jest niezgodne z typowymi wymogami dokumentowania.",
    topic: "Zlecenia",
    difficulty: "medium",
  },
  {
    id: "knf-18",
    question: "Suitability (odpowiedniość) stosujemy:",
    options: [
      "Przy doradztwie i zarządzaniu",
      "Zawsze przy demo",
      "Wyłącznie dla profesjonalnych",
      "Nigdy",
    ],
    correctIndex: 0,
    correctAnswer: "Przy doradztwie i zarządzaniu",
    explanation:
      "Suitability wymaga zrozumienia celów, sytuacji i wiedzy klienta przed rekomendacją — stosuje się w doradztwie i zarządzaniu.",
    consequenceCorrect:
      "Wiesz, czego oczekiwać przy portfolio advisory vs. przy zwykłym execution-only.",
    consequenceWrong:
      "Żądanie „rekomendacji na chat” bez procesu suitability jest regulacyjnie nierealistyczne.",
    topic: "Suitability",
    difficulty: "easy",
  },
  {
    id: "knf-19",
    question: "Cel polityki best execution to:",
    options: [
      "Zwiększyć przychody",
      "Zapewnić najniższy spread",
      "Uzyskać najlepszy możliwy rezultat (cena, koszty, szybkość, prawdopodobieństwo)",
      "Zapewnić zawsze GPW",
    ],
    correctIndex: 2,
    correctAnswer:
      "Uzyskać najlepszy możliwy rezultat (cena, koszty, szybkość, prawdopodobieństwo)",
    explanation:
      "Cel to interes klienta w wymiarze całościowym, nie maksymalizacja przychodu firmy ani „najniższy spread” jako jedyna metryka.",
    consequenceCorrect:
      "Oceniasz brokera szerzej niż jednym licznikiem spreadu na EUR/USD.",
    consequenceWrong:
      "Pogoń za najniższym spreadem przy słabej realizacji w vol to często gorszy wynik netto.",
    topic: "Best execution",
    difficulty: "medium",
  },
  {
    id: "knf-20",
    question: "Element KYC to m.in.:",
    options: [
      "Adres, PESEL/ID, źródło środków",
      "Wskaźnik beta portfela",
      "Wynik roczny spółki",
      "Średni spread brokera",
    ],
    correctIndex: 0,
    correctAnswer: "Adres, PESEL/ID, źródło środków",
    explanation:
      "KYC to dane identyfikacyjne i źródło majątku — nie parametry inwestycyjne portfela.",
    consequenceCorrect:
      "Przygotowujesz dokumenty z wyprzedzeniem — szybsze otwarcie konta.",
    consequenceWrong:
      "Frustracja na KYC bez rozumienia celu przedłuża onboarding i nie pomaga relacji z firmą.",
    topic: "KYC",
    difficulty: "easy",
  },
  {
    id: "knf-21",
    question: "Opt-up do statusu profesjonalnego:",
    options: [
      "Możliwy po spełnieniu kryteriów i ocenie",
      "Niemożliwy",
      "Tylko na 30 dni",
      "Tylko dla CFD",
    ],
    correctIndex: 0,
    correctAnswer: "Możliwy po spełnieniu kryteriów i ocenie",
    explanation:
      "Status pro wymaga spełnienia progów majątkowych/doświadczeniowych i procedury — nie jest to klik w ustawieniach bez kryteriów.",
    consequenceCorrect:
      "Decyzja o pro jest świadoma: mniejsza ochrona w zamian za dostęp do szerszej oferty.",
    consequenceWrong:
      "Próby obejścia kryteriów „na skróty” mogą skutkować cofnięciem kategorii i blokadą.",
    topic: "Kategorie",
    difficulty: "medium",
  },
  {
    id: "knf-22",
    question: "Product governance dotyczy:",
    options: [
      "Określenia rynku docelowego i dystrybucji",
      "Wyłącznie prowizji",
      "Koloru aplikacji",
      "Backupów systemowych",
    ],
    correctIndex: 0,
    correctAnswer: "Określenia rynku docelowego i dystrybucji",
    explanation:
      "Producent i dystrybutor mają ustalić, dla kogo produkt jest odpowiedni i jak jest rozprowadzany — to product governance.",
    consequenceCorrect:
      "Rozumiesz, czemu nie każdy produkt jest dla detalu w każdej formie.",
    consequenceWrong:
      "Oczekiwanie „wszystkiego dla każdego” pomija obowiązki producenta wobec rynku docelowego.",
    topic: "Produkt",
    difficulty: "hard",
  },
  {
    id: "knf-23",
    question: "Ostrzeżenie na stronie dla CFD zwykle zawiera informację o:",
    options: [
      "Procent rachunków tracących",
      "Gwarancji zysku",
      "Braku poślizgu",
      "Porównaniu z lokatą",
    ],
    correctIndex: 0,
    correctAnswer: "Procent rachunków tracących",
    explanation:
      "W UE detaliczne CFD wymagają standardowego ostrzeżenia o odsetku rachunków tracących — uzupełnienie o ryzyko, nie reklama.",
    consequenceCorrect:
      "Czytasz disclaimer jako statystykę ryzyka populacji, nie jako osobistą prognozę.",
    consequenceWrong:
      "Pominięcie ostrzeżenia utrwala iluzję, że większość klientów systematycznie zarabia.",
    topic: "CFD",
    difficulty: "easy",
  },
  {
    id: "knf-24",
    question: "Potwierdzenie transakcji wysyłamy:",
    options: [
      "Zwykle najpóźniej następnego dnia roboczego po wykonaniu",
      "Raz w roku",
      "Na żądanie",
      "Tylko przy akcjach",
    ],
    correctIndex: 0,
    correctAnswer: "Zwykle najpóźniej następnego dnia roboczego po wykonaniu",
    explanation:
      "Standard MiFID to potwierdzenie „bez zbędnej zwłoki”, praktycznie często do następnego dnia roboczego po transakcji.",
    consequenceCorrect:
      "Wiesz, kiedy spodziewać się papieru/e-maila do reconciliacji z platformą.",
    consequenceWrong:
      "Brak wiedzy o terminach utrudnia reklamację rozbieżności po czasie.",
    topic: "Transakcje",
    difficulty: "medium",
  },
  {
    id: "knf-25",
    question: "Który element NIE należy do raportu kosztów i opłat?",
    options: [
      "Koszty transakcyjne",
      "Koszty usług doradczych",
      "Prognoza ceny instrumentu",
      "Koszt finansowania (swap)",
    ],
    correctIndex: 2,
    correctAnswer: "Prognoza ceny instrumentu",
    explanation:
      "Raport kosztów ma ujawniać poniesione koszty — nie prognozy przyszłej ceny instrumentu.",
    consequenceCorrect:
      "Szukasz w raporcie faktur kosztów, nie „researchu” maklerskiego.",
    consequenceWrong:
      "Mylenie raportu kosztów z rekomendacją inwestycyjną prowadzi do złych oczekiwać wobec dokumentu.",
    topic: "Raporty",
    difficulty: "easy",
  },
  {
    id: "knf-26",
    question: "Przy zleceniach OTC firma powinna ujawniać m.in.:",
    options: [
      "Adresy pracowników",
      "Miejsca wykonania, politykę best execution i ryzyka",
      "Wejście do systemu back-office",
      "Dane wszystkich klientów",
    ],
    correctIndex: 1,
    correctAnswer: "Miejsca wykonania, politykę best execution i ryzyka",
    explanation:
      "Klient OTC powinien rozumieć, gdzie i jak realizowane są zlecenia oraz jakie ryzyka wynikają z modelu.",
    consequenceCorrect:
      "Czytasz dokumenty miejsc wykonania i polityki — pytasz o internalizację vs. przekazanie do LP.",
    consequenceWrong:
      "Ignorowanie opisu modelu wykonania utrudnia ocenę jakości i ewentualną reklamację.",
    topic: "OTC",
    difficulty: "medium",
  },
];
