import type { DataMcqRow } from "./dataMcqRow";

export const MIFID_QUIZ_DATA: DataMcqRow[] = [
  {
    id: "mf-01",
    question: "MiFID II reguluje głównie:",
    options: [
      "Rynki towarowe",
      "Rynki instrumentów finansowych, usługi inwestycyjne i ochronę inwestora",
      "Wyłącznie bankowość",
      "Podatki kapitałowe",
    ],
    correctIndex: 1,
    correctAnswer: "Rynki instrumentów finansowych, usługi inwestycyjne i ochronę inwestora",
    explanation:
      "MiFID II to pakiet dla rynków finansowych i firm inwestycyjnych — nie jest to ustawa podatkowa ani czysto bankowa.",
    consequenceCorrect:
      "Łączysz swoje doświadczenie z kontem u brokera z realnymi obowiązkami firm wobec Ciebie.",
    consequenceWrong:
      "Szukanie w MiFID odpowiedzi na PIT prowadzi w ślepą uliczkę.",
    topic: "Zakres",
    difficulty: "easy",
  },
  {
    id: "mf-02",
    question: "Przed świadczeniem usługi przekazujemy:",
    options: [
      "Informacje ex-ante o kosztach i opłatach",
      "Tylko umowę ramową",
      "Tylko KID",
      "Wyłącznie raport roczny",
    ],
    correctIndex: 0,
    correctAnswer: "Informacje ex-ante o kosztach i opłatach",
    explanation:
      "Klient musi dostać informacje o kosztach przed rozpoczęciem usługi — nie tylko po fakcie.",
    consequenceCorrect:
      "Porównujesz oferty na podstawie ex-ante, zanim zwiążesz się umową.",
    consequenceWrong:
      "Pierwsza transakcja bez znajomości pełnego modelu kosztów bywa zaskoczeniem na pierwszym raporcie.",
    topic: "Koszty",
    difficulty: "easy",
  },
  {
    id: "mf-03",
    question: "Suitability dotyczy przede wszystkim:",
    options: [
      "Doradztwa inwestycyjnego i zarządzania portfelem",
      "Rachunków demo",
      "MTF/OTF",
      "Krypto",
    ],
    correctIndex: 0,
    correctAnswer: "Doradztwa inwestycyjnego i zarządzania portfelem",
    explanation:
      "Rekomendacja i zarządzanie wymagają dopasowania do sytuacji klienta — suitability.",
    consequenceCorrect:
      "Nie oczekujesz raportu suitability przy czystym execution.",
    consequenceWrong:
      "Frustracja wobec brokera „bez porady” wynika z niezrozumienia zakresu usługi.",
    topic: "Suitability",
    difficulty: "easy",
  },
  {
    id: "mf-04",
    question: "Product governance – producent powinien:",
    options: [
      "Określić rynek docelowy i dystrybucję, przeglądać produkt w cyklu życia",
      "Wybrać nazwę",
      "Wybrać kolor UI",
      "Ustalić KPI marketingu",
    ],
    correctIndex: 0,
    correctAnswer: "Określić rynek docelowy i dystrybucję, przeglądać produkt w cyklu życia",
    explanation:
      "Producent odpowiada za target market i monitoring produktu — nie tylko branding.",
    consequenceCorrect:
      "Rozumiesz wycofania produktów i zmiany dystrybucji jako część compliance.",
    consequenceWrong:
      "Oburzenie „czemu nie mogę kupić” bez znajomości target market jest często nieuzasadnione regulacyjnie.",
    topic: "Produkt",
    difficulty: "hard",
  },
  {
    id: "mf-05",
    question: "Best execution oznacza:",
    options: [
      "Stały spread",
      "Najlepszy możliwy wynik (cena, koszty, szybkość, prawdopodobieństwo)",
      "Zawsze natychmiastową realizację",
      "Najniższą prowizję",
    ],
    correctIndex: 1,
    correctAnswer: "Najlepszy możliwy wynik (cena, koszty, szybkość, prawdopodobieństwo)",
    explanation:
      "To holistyczny standard jakości realizacji dla klienta, nie pojedyncza metryka typu spread.",
    consequenceCorrect:
      "Oceniasz brokera szerzej niż jednym licznikiem.",
    consequenceWrong:
      "Najniższa prowizja przy złej realizacji w vol bywa droższa netto.",
    topic: "Wykonanie",
    difficulty: "medium",
  },
  {
    id: "mf-06",
    question: "Inducements są dopuszczalne, jeśli:",
    options: [
      "Zawsze",
      "Nigdy",
      "Poprawiają jakość usługi i nie naruszają działania w interesie klienta",
      "Tylko dla profesjonalnych",
    ],
    correctIndex: 2,
    correctAnswer: "Poprawiają jakość usługi i nie naruszają działania w interesie klienta",
    explanation:
      "Zachęty muszą przejść test interesu klienta i transparentności — nie są ani zawsze zakazane, ani bezwarunkowo dozwolone.",
    consequenceCorrect:
      "Pytasz o naturę bonusu i ewentualny wpływ na rekomendację.",
    consequenceWrong:
      "Bonus bez analizy może zniekształcać motywacje pośrednika.",
    topic: "Inducements",
    difficulty: "hard",
  },
  {
    id: "mf-07",
    question: "Które NIE jest elementem ex-post do klientów?",
    options: [
      "Koszty poniesione w okresie",
      "Gwarantowany zysk",
      "Podsumowanie usług",
      "Informacje o opłatach",
    ],
    correctIndex: 1,
    correctAnswer: "Gwarantowany zysk",
    explanation:
      "Ex-post raportuje faktyczne koszty i usługi — nie może obiecywać gwarantowanego zysku.",
    consequenceCorrect:
      "Rozumiesz, że raport kosztów to rozliczenie, nie prognoza.",
    consequenceWrong:
      "Szukanie w ex-post „obietnicy zysku” jest błędem kategorii dokumentu.",
    topic: "Ex-post",
    difficulty: "easy",
  },
  {
    id: "mf-08",
    question: "Kategoryzacja klientów obejmuje:",
    options: [
      "Detaliczny, profesjonalny, uprawniony kontrahent",
      "Nowy, stały, VIP",
      "Private, retail",
      "FN/Non-FN",
    ],
    correctIndex: 0,
    correctAnswer: "Detaliczny, profesjonalny, uprawniony kontrahent",
    explanation:
      "Trzy kategorie MiFID determinują poziom informacji, ochrony i dostępu do produktów.",
    consequenceCorrect:
      "Świadomie rozważasz zmianę kategorii i jej skutki.",
    consequenceWrong:
      "Marketingowe VIP mylone z pro powoduje złe oczekiwania co do ochrony.",
    topic: "Klienci",
    difficulty: "easy",
  },
  {
    id: "mf-09",
    question: "Appropriateness sprawdza przede wszystkim:",
    options: [
      "Wiedzę/doświadczenie",
      "Cele inwestycyjne",
      "Dochody i majątek",
      "Preferencje językowe",
    ],
    correctIndex: 0,
    correctAnswer: "Wiedzę/doświadczenie",
    explanation:
      "Appropriateness = czy rozumiesz ryzyko produktu złożonego; cele to bardziej suitability.",
    consequenceCorrect:
      "Oddzielasz test wiedzy od planowania celów życiowych z doradcą.",
    consequenceWrong:
      "Mylenie obu testów prowadzi do złych pytań do supportu i frustracji.",
    topic: "Appropriateness",
    difficulty: "medium",
  },
  {
    id: "mf-10",
    question: "Record keeping dotyczy m.in.:",
    options: [
      "Nagrywania rozmów/komunikacji przy przyjmowaniu/przekazywaniu zleceń",
      "Backupów baz danych",
      "Transkrypcji webinarów",
      "Spotkań HR",
    ],
    correctIndex: 0,
    correctAnswer: "Nagrywania rozmów/komunikacji przy przyjmowaniu/przekazywaniu zleceń",
    explanation:
      "Zlecenia muszą być możliwe do odtworzenia — stąd utrwalanie kanałów zleceń.",
    consequenceCorrect:
      "Akceptujesz procedury nagrywania jako ochronę obu stron przy sporze.",
    consequenceWrong:
      "Oczekiwanie „nie śledźcie mnie” przy zleceniach głosowych jest niezgodne z typowymi wymogami.",
    topic: "Dokumentacja",
    difficulty: "medium",
  },
  {
    id: "mf-11",
    question: "Cel ostrzeżeń o ryzyku:",
    options: [
      "Spełnić wymogi marketingowe",
      "Przejrzyście poinformować klienta o istotnych ryzykach",
      "Zwiększyć sprzedaż",
      "Zachęta do spekulacji",
    ],
    correctIndex: 1,
    correctAnswer: "Przejrzyście poinformować klienta o istotnych ryzykach",
    explanation:
      "Ostrzeżenia mają umożliwić świadomą decyzję — nie spełniać formalności marketingowej.",
    consequenceCorrect:
      "Czytasz risk disclosure jako treść merytoryczną, nie tylko checkbox.",
    consequenceWrong:
      "Klikanie bez czytania pozostawia Cię bez argumentów przy „nie wiedziałem”.",
    topic: "Ryzyko",
    difficulty: "easy",
  },
  {
    id: "mf-12",
    question: "Klienci profesjonalni mają zwykle:",
    options: [
      "Niższą ochronę regulacyjną niż detaliczni",
      "Wyższą ochronę",
      "Identyczną ochronę",
      "Nie podlegają MiFID II",
    ],
    correctIndex: 0,
    correctAnswer: "Niższą ochronę regulacyjną niż detaliczni",
    explanation:
      "W zamian za spełnienie progów pro rezygnuje się z części standardów ochrony detalu.",
    consequenceCorrect:
      "Nie kwalifikujesz się na pro „dla zabawy” bez świadomości konsekwencji.",
    consequenceWrong:
      "Status pro bez potrzeby to często strata ochrony bez realnej korzyści.",
    topic: "Kategorie",
    difficulty: "easy",
  },
  {
    id: "mf-13",
    question: "„Best interests of the client” oznacza:",
    options: [
      "Minimalizować koszty własne",
      "Działać uczciwie, rzetelnie i profesjonalnie w najlepiej pojętym interesie klienta",
      "Maksymalizować zysk firmy",
      "Zawsze wybierać najniższy spread",
    ],
    correctIndex: 1,
    correctAnswer:
      "Działać uczciwie, rzetelnie i profesjonalnie w najlepiej pojętym interesie klienta",
    explanation:
      "To standard postępowania firmy wobec klienta — nie minimalizacja kosztów własnych kosztem jakości.",
    consequenceCorrect:
      "Masz język prawny do oceny konfliktów interesów i jakości obsługi.",
    consequenceWrong:
      "Oczekiwanie, że broker zawsze wybierze najniższy spread, zawęża pojęcie interesu klienta.",
    topic: "Standardy",
    difficulty: "medium",
  },
  {
    id: "mf-14",
    question: "Podział produktów na złożone/niezłożone ma znaczenie dla:",
    options: [
      "Wymogów appropriateness i ostrzeżeń",
      "Koloru UI",
      "AML",
      "Wielkości prowizji",
    ],
    correctIndex: 0,
    correctAnswer: "Wymogów appropriateness i ostrzeżeń",
    explanation:
      "Produkty złożone wymagają surowszych procedur informowania i testów — bo ryzyko jest trudniejsze do zrozumienia.",
    consequenceCorrect:
      "Rozumiesz dodatkowe kroki przy CFD/derivatives vs. prostsze instrumenty.",
    consequenceWrong:
      "Dziwienie się dodatkowym dokumentom „jak przy akcjach” wynika z nieznajomości klasy produktu.",
    topic: "Produkty",
    difficulty: "medium",
  },
  {
    id: "mf-15",
    question: "Info ex-ante o kosztach przekazujemy:",
    options: ["Przed świadczeniem usługi", "Raz na rok", "Po 12 mies.", "Nigdy"],
    correctIndex: 0,
    correctAnswer: "Przed świadczeniem usługi",
    explanation:
      "Zasada przejrzystości wymaga informacji o kosztach zanim klient zacznie ponosić opłaty w ramach usługi.",
    consequenceCorrect:
      "Żądasz tabeli opłat przed pierwszą transakcją.",
    consequenceWrong:
      "Akceptacja „dowiesz się później” osłabia Twoją pozycję przy pierwszej niezgodności faktury.",
    topic: "Koszty",
    difficulty: "easy",
  },
  {
    id: "mf-16",
    question: "Dokument zawierający scenariusze wyników i wskaźnik ryzyka (PRIIPs) to:",
    options: ["KID", "Prospekt", "Raport maklerski", "FATCA/CRS"],
    correctIndex: 0,
    correctAnswer: "KID",
    explanation:
      "KID (Key Information Document) dla PRIIPs zawiera m.in. scenariusze i wskaźnik ryzyka w ustandaryzowanej formie.",
    consequenceCorrect:
      "Porównujesz produkty pakietowe po KID, nie tylko po banerze.",
    consequenceWrong:
      "Mylenie KID z prospektem emisyjnym prowadzi do czytania niewłaściwego dokumentu.",
    topic: "KID",
    difficulty: "easy",
  },
  {
    id: "mf-17",
    question: "Conflicts of interest policy ma na celu:",
    options: [
      "Identyfikowanie, zarządzanie i ujawnianie konfliktów",
      "Minimalizację spreadu",
      "Wybór kolorów UI",
      "Raportowanie do banku centralnego",
    ],
    correctIndex: 0,
    correctAnswer: "Identyfikowanie, zarządzanie i ujawnianie konfliktów",
    explanation:
      "Polityka konfliktów to realne procedury, nie design aplikacji.",
    consequenceCorrect:
      "Czytasz, jak firma zarabia poza spreadem (np. rebates) i jak to ujawnia.",
    consequenceWrong:
      "Ignorowanie konfliktów utrudnia ocenę jakości rekomendacji.",
    topic: "Konflikty",
    difficulty: "medium",
  },
  {
    id: "mf-18",
    question: "Execution venues to:",
    options: [
      "Miejsca wykonania: rynki regulowane, MTF, OTF, podmioty OTC",
      "Wyłącznie giełdy papierów wartościowych",
      "Wyłącznie platformy krypto",
      "Wyłącznie biura maklerskie",
    ],
    correctIndex: 0,
    correctAnswer: "Miejsca wykonania: rynki regulowane, MTF, OTF, podmioty OTC",
    explanation:
      "Venues to szeroka kategoria miejsc realizacji zleceń, nie tylko klasyczna giełda.",
    consequenceCorrect:
      "Rozumiesz raporty RTS i politykę miejsc wykonania u brokera.",
    consequenceWrong:
      "Założenie „tylko GPW” nie oddaje realizacji CFD/FX.",
    topic: "Venues",
    difficulty: "hard",
  },
  {
    id: "mf-19",
    question: "Transaction reporting (MiFIR) to:",
    options: [
      "Przekazywanie organowi danych o transakcjach",
      "Newsletter",
      "Raport marketingowy",
      "Raport AML do banku",
    ],
    correctIndex: 0,
    correctAnswer: "Przekazywanie organowi danych o transakcjach",
    explanation:
      "Nadzór zbiera dane o transakcjach do monitorowania rynku — równolegle do dokumentów klienckich.",
    consequenceCorrect:
      "Nie mylisz raportowania nadzorczego z mailem potwierdzającym trade.",
    consequenceWrong:
      "Teorie „śledzą mnie żeby…” bez rozróżnienia celów prawa i marketingu.",
    topic: "MiFIR",
    difficulty: "medium",
  },
  {
    id: "mf-20",
    question: "Appropriateness warning stosujemy, gdy:",
    options: [
      "Klient nie przeszedł testu adekwatności dla produktu złożonego",
      "Zawsze przy zakupie akcji",
      "Wyłącznie przy profesjonalnych",
      "Nigdy",
    ],
    correctIndex: 0,
    correctAnswer: "Klient nie przeszedł testu adekwatności dla produktu złożonego",
    explanation:
      "Ostrzeżenie ma sens przy luce wiedzy/doświadczenia wobec produktu złożonego — nie „zawsze przy akcjach”.",
    consequenceCorrect:
      "Bierzesz ostrzeżenie jako sygnał edukacji przed dalszym lewarowaniem.",
    consequenceWrong:
      "Ignorowanie ostrzeżenia przy słabych wynikach testu to ryzyko operacyjne dla Ciebie, nie tylko dla brokera.",
    topic: "Ostrzeżenia",
    difficulty: "medium",
  },
  {
    id: "mf-21",
    question: "Który element NIE jest typowy dla polityki best execution?",
    options: [
      "Cena i koszty",
      "Szybkość i prawdopodobieństwo",
      "Strategia marketingowa",
      "Wielkość zlecenia",
    ],
    correctIndex: 2,
    correctAnswer: "Strategia marketingowa",
    explanation:
      "Polityka best execution opisuje jak realizować zlecenia klientów — nie kampanie marketingowe.",
    consequenceCorrect:
      "Szukasz w dokumencie execution factors, nie sloganów.",
    consequenceWrong:
      "Mylenie polityki realizacji z planem marketingu to błąd kategorii.",
    topic: "Best execution",
    difficulty: "easy",
  },
  {
    id: "mf-22",
    question: "RTS to:",
    options: [
      "Regulatory Technical Standards",
      "Raporty podatkowe",
      "Zasady księgowe",
      "Nazwy serwerów",
    ],
    correctIndex: 0,
    correctAnswer: "Regulatory Technical Standards",
    explanation:
      "RTS to techniczne standardy wykonawcze do rozporządzeń UE — np. szczegóły raportowania i procedur.",
    consequenceCorrect:
      "Rozumiesz, że „RTS” w komunikacie compliance odnosi się do prawa, nie IT.",
    consequenceWrong:
      "Szukanie RTS w księgowości podatkowej mija się z celem.",
    topic: "Prawo UE",
    difficulty: "medium",
  },
  {
    id: "mf-23",
    question: "Market making w firmie inwestycyjnej:",
    options: [
      "Utrzymywanie kwotowań kupna/sprzedaży i płynności OTC",
      "Wyłącznie HFT",
      "Wyłącznie algotrading",
      "Tylko giełda",
    ],
    correctIndex: 0,
    correctAnswer: "Utrzymywanie kwotowań kupna/sprzedaży i płynności OTC",
    explanation:
      "Market maker utrzymuje podwójne kwotowanie i zasila płynność — szerzej niż tylko HFT na giełdzie.",
    consequenceCorrect:
      "Rozumiesz, skąd bierze się kontrstrona i spread w modelu MM.",
    consequenceWrong:
      "Upraszczanie MM do „oszustwa HFT” utrudnia zrozumienie kosztów realizacji.",
    topic: "MM",
    difficulty: "medium",
  },
  {
    id: "mf-24",
    question: "Client money rules — który element NIE pasuje?",
    options: [
      "Segregacja środków",
      "Rachunki powiernicze",
      "Gwarantowany zwrot 10% rocznie",
      "Rekonsyliacja środków",
    ],
    correctIndex: 2,
    correctAnswer: "Gwarantowany zwrot 10% rocznie",
    explanation:
      "Zasady client money dotyczą bezpiecznego przechowywania środków — nie gwarantowanych zwrotów.",
    consequenceCorrect:
      "Wykrywasz absurdalne obietnice jako red flag niezależnie od segregacji.",
    consequenceWrong:
      "Wiara w „gwarantowany zwrot” przy segregacji to mieszanie pojęć ochrony kapitału i wyniku inwestycji.",
    topic: "Środki",
    difficulty: "easy",
  },
  {
    id: "mf-25",
    question: "Costs & charges ex-post to:",
    options: [
      "Okresowy raport kosztów po świadczeniu usługi",
      "Z góry określona prowizja",
      "Wyciąg bankowy",
      "PIT-38",
    ],
    correctIndex: 0,
    correctAnswer: "Okresowy raport kosztów po świadczeniu usługi",
    explanation:
      "Ex-post rozlicza faktycznie poniesione koszty usług i transakcji w okresie.",
    consequenceCorrect:
      "Porównujesz raport z wyciągami i wyłapujesz ukryte opłaty.",
    consequenceWrong:
      "Brak przeglądu ex-post utrudnia optymalizację kosztów roku.",
    topic: "Raporty",
    difficulty: "easy",
  },
  {
    id: "mf-26",
    question: "Główny cel MiFID II:",
    options: [
      "Zwiększyć ochronę inwestorów i przejrzystość rynków",
      "Wzrost liczby spółek na giełdzie",
      "Zmniejszyć spready do zera",
      "Zastąpić AML",
    ],
    correctIndex: 0,
    correctAnswer: "Zwiększyć ochronę inwestorów i przejrzystość rynków",
    explanation:
      "Filarem jest ochrona inwestora i transparentność — nie zerowy spread ani zastąpienie AML.",
    consequenceCorrect:
      "Widzisz swoje prawa jako element systemu, nie jako przypadek.",
    consequenceWrong:
      "Oczekiwanie „MiFID zniesie koszty” prowadzi do rozczarowania — cel to przejrzystość i standardy.",
    topic: "Cele",
    difficulty: "easy",
  },
];
