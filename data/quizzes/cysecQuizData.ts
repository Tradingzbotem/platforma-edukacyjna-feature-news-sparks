import type { DataMcqRow } from "./dataMcqRow";

export const CYSEC_QUIZ_DATA: DataMcqRow[] = [
  {
    id: "cy-01",
    question: "CySEC jest organem nadzoru dla:",
    options: [
      "Banków centralnych w UE",
      "Firm inwestycyjnych/rynku kapitałowego Cypru",
      "Wyłącznie giełd towarowych",
      "Wszystkich brokerów na świecie",
    ],
    correctIndex: 1,
    correctAnswer: "Firm inwestycyjnych/rynku kapitałowego Cypru",
    explanation:
      "CySEC reguluje m.in. CIF na Cyprze — nie jest nadrzędna dla wszystkich brokerów globalnie ani dla banków centralnych.",
    consequenceCorrect:
      "Sprawdzasz licencję i jurysdykcję konkretnej spółki, nie „logo UE” ogólnie.",
    consequenceWrong:
      "Błędne poczucie ochrony „bo CySEC” bez czytania warunków i ESMA dla detalu bywa kosztowne.",
    topic: "CySEC",
    difficulty: "easy",
  },
  {
    id: "cy-02",
    question: "CIF (Cyprus Investment Firm) musi posiadać m.in.:",
    options: [
      "Licencję CySEC i kapitał regulacyjny",
      "Wyłącznie biuro w Nikozji",
      "Linię kredytową",
      "Data center w UE",
    ],
    correctIndex: 0,
    correctAnswer: "Licencję CySEC i kapitał regulacyjny",
    explanation:
      "CIF wymaga autoryzacji i spełniania wymogów kapitałowych — biuro to nie wystarczy samo w sobie.",
    consequenceCorrect:
      "Weryfikujesz numer licencji w rejestrze, zanim wpłacisz środki.",
    consequenceWrong:
      "Marketing „siedziby na Cyprze” bez licencji to red flag — nie myl go z CIF.",
    topic: "CIF",
    difficulty: "easy",
  },
  {
    id: "cy-03",
    question: "Kategoryzacja klientów w CIF odpowiada:",
    options: [
      "Detaliczny / Profesjonalny / Uprawniony kontrahent",
      "Nowy / VIP / HNWI",
      "Inwestor / Trader / Akcjonariusz",
      "Retail / Corporate wyłącznie",
    ],
    correctIndex: 0,
    correctAnswer: "Detaliczny / Profesjonalny / Uprawniony kontrahent",
    explanation:
      "Klasyfikacja MiFID-style jest standardem w UE/CIF — wpływa na ochronę i produkty.",
    consequenceCorrect:
      "Rozumiesz skutki zmiany kategorii przy koncie u CIF w UE.",
    consequenceWrong:
      "Etykiety marketingowe zastępujące status regulacyjny wprowadzają w błąd przy sporach.",
    topic: "Klienci",
    difficulty: "easy",
  },
  {
    id: "cy-04",
    question: "CFD w ESMA podlegają ograniczeniom dot. m.in.:",
    options: [
      "Leverage, margin close-out, negative balance protection",
      "Wyłącznie koloru UI",
      "Opłat depozytowych",
      "Programów partnerskich B2B",
    ],
    correctIndex: 0,
    correctAnswer: "Leverage, margin close-out, negative balance protection",
    explanation:
      "Pakiet ESMA dla detalu obejmuje limity dźwigni, automatyczne zamykanie przy niskim margin i ochronę przed ujemnym saldem.",
    consequenceCorrect:
      "Wiesz, czego oczekiwać na koncie UE vs. offshore bez tych barier.",
    consequenceWrong:
      "Szukanie „wyższego lewara” poza regulacją często oznacza słabszą ochronę, nie lepszy edge.",
    topic: "ESMA",
    difficulty: "medium",
  },
  {
    id: "cy-05",
    question: "Do obowiązków CIF należy m.in.:",
    options: [
      "Segregacja środków klientów",
      "Gwarantowany zysk 5% rocznie",
      "Brak ujawnień ryzyka dla CFD",
      "Wykonywanie zleceń wyłącznie na giełdzie",
    ],
    correctIndex: 0,
    correctAnswer: "Segregacja środków klientów",
    explanation:
      "Client money rules wymagają separacji środków klientów od kapitału firmy — to fundament ochrony przy upadłości pośrednika.",
    consequenceCorrect:
      "Rozumiesz, dlaczego depozyt ma być na rachunkach segregowanych, nie „w kieszeni” firmy.",
    consequenceWrong:
      "Wiara w gwarantowany zysk jest niezgodna z regulacją i zdrowym rozsądkiem — typowa pułapka.",
    topic: "Środki",
    difficulty: "easy",
  },
  {
    id: "cy-06",
    question: "Appropriateness test w CIF:",
    options: [
      "Bada zdolność kredytową",
      "Ocena wiedzy/doświadczenia + ewentualne ostrzeżenie",
      "Wyłącznie potwierdza adres",
      "Weryfikuje FATCA/CRS",
    ],
    correctIndex: 1,
    correctAnswer: "Ocena wiedzy/doświadczenia + ewentualne ostrzeżenie",
    explanation:
      "Test adekwatności dotyczy wiedzy i doświadczenia wobec produktu złożonego — nie scoringu kredytowego.",
    consequenceCorrect:
      "Traktujesz test jako lustro, nie przeszkodę — uczciwe odpowiedzi chronią Cię przed złym produktem.",
    consequenceWrong:
      "Oszukiwanie testu tylko po to, by dostać wysoki lewar, zostawia Cię bez realnej ochrony edukacyjnej.",
    topic: "Testy",
    difficulty: "medium",
  },
  {
    id: "cy-07",
    question: "Suitability report dotyczy głównie:",
    options: [
      "Doradztwa/zarządzania (rekomendacje)",
      "Rachunków demo",
      "Kampanii marketingowych",
      "Wypłat afiliacyjnych",
    ],
    correctIndex: 0,
    correctAnswer: "Doradztwa/zarządzania (rekomendacje)",
    explanation:
      "Suitability to proces pod rekomendacje i zarządzanie — nie dotyczy typowego execution-only.",
    consequenceCorrect:
      "Nie oczekujesz pełnego raportu suitability przy samodzielnym klikaniu zleceń.",
    consequenceWrong:
      "Frustracja „dlaczego nie doradzają jak w banku” na koncie execution-only wynika z nieznajomości regulacji.",
    topic: "Suitability",
    difficulty: "medium",
  },
  {
    id: "cy-08",
    question: "AML/CTF w CIF wymaga m.in.:",
    options: [
      "Identyfikacji, weryfikacji i monitoringu transakcji",
      "Tylko zbierania e-maila",
      "Wyłącznie e-podpisu",
      "Nagrywania webinarów",
    ],
    correctIndex: 0,
    correctAnswer: "Identyfikacji, weryfikacji i monitoringu transakcji",
    explanation:
      "AML to pełny łańcuch: poznaj klienta, zweryfikuj, monitoruj nietypowe operacje — nie sam e-mail.",
    consequenceCorrect:
      "Współpracujesz z compliance, rozumiejąc cel przepisów.",
    consequenceWrong:
      "Unikanie weryfikacji szuka krawędzi poza systemem — wysokie ryzyko zamrożenia środków.",
    topic: "AML",
    difficulty: "easy",
  },
  {
    id: "cy-09",
    question: "Best execution bierze pod uwagę m.in.:",
    options: [
      "Cena, koszty, szybkość, prawdopodobieństwo",
      "Wyłącznie cenę",
      "Wyłącznie koszty",
      "Wyłącznie szybkość",
    ],
    correctIndex: 0,
    correctAnswer: "Cena, koszty, szybkość, prawdopodobieństwo",
    explanation:
      "CIF musi dążyć do najlepszego możliwego wyniku łącznie — jednowymiarowa optymalizacja nie wystarczy.",
    consequenceCorrect:
      "Oceniasz brokera holistycznie, nie tylko po jednym ticku.",
    consequenceWrong:
      "Pogoń za ceną przy koszmarnym slippage w vol daje gorszy wynik niż myślisz.",
    topic: "Wykonanie",
    difficulty: "easy",
  },
  {
    id: "cy-10",
    question: "Negative balance protection oznacza:",
    options: [
      "Detaliczny nie ma salda ujemnego",
      "Zawsze ujemne swapy",
      "Saldo w banku centralnym",
      "Brak margin calli",
    ],
    correctIndex: 0,
    correctAnswer: "Detaliczny nie ma salda ujemnego",
    explanation:
      "NBP w pakiecie ESMA dla detalu zamyka pozycje, zanim zobowiązanie przekroczy depozyt — nie znosi margin call w procesie.",
    explanationIncorrect:
      "NBP nie oznacza braku margin call ani „ujemnych swapów z definicji” — chroni przed ujemnym saldem po zamknięciu.",
    consequenceCorrect:
      "Rozumiesz limit strat na koncie detalicznym w UE w typowym modelu CFD.",
    consequenceWrong:
      "Myślenie, że NBP = brak ryzyka utraty kapitału, jest niebezpieczne — ryzyko jest do wysokości depozytu.",
    topic: "Ochrona",
    difficulty: "medium",
  },
  {
    id: "cy-11",
    question: "KYC obejmuje m.in.:",
    options: [
      "Imię, nazwisko, data ur., adres, obywatelstwo, źródło środków",
      "Wyłącznie email",
      "Profil w social media",
      "Preferencje językowe",
    ],
    correctIndex: 0,
    correctAnswer: "Imię, nazwisko, data ur., adres, obywatelstwo, źródło środków",
    explanation:
      "KYC to zestaw danych tożsamości i ryzyka — szerzej niż sam e-mail.",
    consequenceCorrect:
      "Masz dokumenty gotowe — krótszy onboarding.",
    consequenceWrong:
      "Opór przed podstawowymi danymi wydłuża KYC i budzi alerty compliance.",
    topic: "KYC",
    difficulty: "easy",
  },
  {
    id: "cy-12",
    question: "Skargi klienta w CIF:",
    options: [
      "Wymagają procedury, rejestru i terminów odpowiedzi",
      "Nie są wymagane",
      "Wystarczy skrzynka e-mail",
      "Tylko dla profesjonalnych",
    ],
    correctIndex: 0,
    correctAnswer: "Wymagają procedury, rejestru i terminów odpowiedzi",
    explanation:
      "Firmy muszą mieć jasną ścieżkę reklamacji z terminami — to standard ochrony konsumenta/inwestora.",
    consequenceCorrect:
      "Wiesz, jak eskalować spór formalnie, zamiast tylko pisać na czacie.",
    consequenceWrong:
      "Brak świadomości procedury utrudnia dochodzenie praw przy błędzie realizacji.",
    topic: "Reklamacje",
    difficulty: "easy",
  },
  {
    id: "cy-13",
    question: "Materiały marketingowe CIF:",
    options: [
      "Mogą obiecywać zysk",
      "Muszą być rzetelne, jasne, niewprowadzające w błąd; spójne z KID",
      "Nie podlegają nadzorowi",
      "Dotyczą wyłącznie social mediów",
    ],
    correctIndex: 1,
    correctAnswer: "Muszą być rzetelne, jasne, niewprowadzające w błąd; spójne z KID",
    explanation:
      "Marketing musi być zgodny z faktami produktu i dokumentami — obietnice zysku są zwykle niedopuszczalne.",
    consequenceCorrect:
      "Filtrujesz influencerów i reklamy pod kątem ryzyka i disclaimera.",
    consequenceWrong:
      "Decyzje na podstawie „screenshotów zysków” bez ryzyka to typowy błąd poznawczy.",
    topic: "Marketing",
    difficulty: "easy",
  },
  {
    id: "cy-14",
    question: "Raporty okresowe dla detalicznych:",
    options: [
      "Podsumowanie transakcji i kosztów",
      "Prognoza zysku",
      "Wyceny spółek GPW",
      "Lista klientów",
    ],
    correctIndex: 0,
    correctAnswer: "Podsumowanie transakcji i kosztów",
    explanation:
      "Okresowe raporty pokazują, co działo się na koncie i ile kosztowało — nie prognozy.",
    consequenceCorrect:
      "Porównujesz raport z historią platformy i wychwytujesz rozbieżności.",
    consequenceWrong:
      "Ignorowanie raportów utrudnia audyt kosztów rocznych.",
    topic: "Raporty",
    difficulty: "easy",
  },
  {
    id: "cy-15",
    question: "MAR obejmuje m.in.:",
    options: [
      "Insider dealing i manipulacje rynkowe",
      "Wyłącznie promo marketingu",
      "Wyłącznie kryptoaktywa",
      "Wyłącznie towary fizyczne",
    ],
    correctIndex: 0,
    correctAnswer: "Insider dealing i manipulacje rynkowe",
    explanation:
      "MAR to unijne zasady nadużyć rynkowych — szerokie, nie tylko jedna klasa aktywów.",
    consequenceCorrect:
      "Unikasz dzielenia się niepublikowanymi informacjami i sygnałów „na pewniaka”.",
    consequenceWrong:
      "Grupy sygnałowe z insiderem to ryzyko prawne dla wszystkich uczestników.",
    topic: "MAR",
    difficulty: "medium",
  },
  {
    id: "cy-16",
    question: "Product governance w CIF:",
    options: [
      "Rynek docelowy, dystrybucja, testy okresowe produktu",
      "Wybór nazwy",
      "Kalkulacja prowizji",
      "Szkolenia IT",
    ],
    correctIndex: 0,
    correctAnswer: "Rynek docelowy, dystrybucja, testy okresowe produktu",
    explanation:
      "Produkt musi mieć opisany target klienta i proces przeglądu — nie tylko nazwę marketingową.",
    consequenceCorrect:
      "Rozumiesz, czemu niektóre produkty są niedostępne dla detalu.",
    consequenceWrong:
      "Presja na „dostęp do wszystkiego” ignoruje obowiązki dystrybutora.",
    topic: "Produkt",
    difficulty: "hard",
  },
  {
    id: "cy-17",
    question: "Opt-up do „professional client” możliwy gdy:",
    options: [
      "Spełnione kryteria (doświadczenie, portfel, transakcje) oraz ocena",
      "Zawsze na życzenie",
      "Nigdy",
      "Tylko przy akcjach",
    ],
    correctIndex: 0,
    correctAnswer: "Spełnione kryteria (doświadczenie, portfel, transakcje) oraz ocena",
    explanation:
      "Status pro wymaga spełnienia progów i procedury kwalifikacji — nie samej chęci.",
    consequenceCorrect:
      "Decyzja o pro jest świadoma co do utraty części ochrony.",
    consequenceWrong:
      "„Pro na życzenie” bez kryteriów nie jest zgodne z celem regulacji.",
    topic: "Pro",
    difficulty: "medium",
  },
  {
    id: "cy-18",
    question: "Margin close-out (ESMA) to:",
    options: [
      "Auto-zamknięcie pozycji przy określonym progu kapitału",
      "Zamknięcie rynku w weekend",
      "Zamknięcie rachunku po roku",
      "Wyłącznie margin call",
    ],
    correctIndex: 0,
    correctAnswer: "Auto-zamknięcie pozycji przy określonym progu kapitału",
    explanation:
      "Automatyczne domykanie chroni przed pełnym rozjechaniem konta przy zbliżaniu się equity do progu margin.",
    explanationIncorrect:
      "To nie jest zamknięcie rynku ani rachunku z czasu — to mechanizm przy niskim margin level.",
    consequenceCorrect:
      "Monitorujesz margin level, wiesz że pozycje mogą spaść automatycznie.",
    consequenceWrong:
      "Niespodziewane zamknięcia „przez system” bez znajomości progu wyglądają jak sabotaż — a to regulacja.",
    topic: "Margin",
    difficulty: "medium",
  },
  {
    id: "cy-19",
    question: "Przed zawarciem umowy klient powinien dostać:",
    options: [
      "Warunki świadczenia usług i info o kosztach/ryzykach",
      "Wyłącznie login i hasło",
      "Podsumowanie roczne",
      "Faktury VAT z 12 mies.",
    ],
    correctIndex: 0,
    correctAnswer: "Warunki świadczenia usług i info o kosztach/ryzykach",
    explanation:
      "Prekontrakcyjne informacje o usłudze, ryzyku i kosztach są obowiązkowe — login to nie wystarczy.",
    consequenceCorrect:
      "Czytasz regulamin i dokumenty kosztów przed pierwszym depozytem.",
    consequenceWrong:
      "Akceptacja „ślepa” utrudnia późniejszą argumentację przy sporze o opłaty.",
    topic: "Umowa",
    difficulty: "easy",
  },
  {
    id: "cy-20",
    question: "Record keeping dotyczy m.in.:",
    options: [
      "Utrwalania rozmów/komunikacji przy przyjmowaniu zleceń",
      "Wyłącznie nagrywania webinarów",
      "Kopii paszportów",
      "Archiwizacji banerów",
    ],
    correctIndex: 0,
    correctAnswer: "Utrwalania rozmów/komunikacji przy przyjmowaniu zleceń",
    explanation:
      "Zlecenia muszą być możliwe do odtworzenia — stąd nagrania/rozmowy w kanale zleceń.",
    consequenceCorrect:
      "Rozumiesz, czemu telefoniczne zlecenie wymaga procedury i zgody na nagranie.",
    consequenceWrong:
      "Oczekiwanie anonimowych zleceń głosowych bez śladu jest nierealistyczne.",
    topic: "Dokumentacja",
    difficulty: "medium",
  },
  {
    id: "cy-21",
    question: "RTS 27/28 (historycznie) to raporty:",
    options: [
      "Jakości wykonania i miejsc wykonania",
      "Podatkowe VAT",
      "Sprawozdania dla GPW",
      "Prospekty",
    ],
    correctIndex: 0,
    correctAnswer: "Jakości wykonania i miejsc wykonania",
    explanation:
      "RTS 27/28 dotyczyły raportowania jakości i miejsc wykonania — przezroczystość dla nadzoru i rynku.",
    consequenceCorrect:
      "Łączysz wiedzę o best execution z realnym raportowaniem jakości.",
    consequenceWrong:
      "Mylenie RTS z podatkami utrudnia czytanie komunikatów compliance.",
    topic: "RTS",
    difficulty: "hard",
  },
  {
    id: "cy-22",
    question: "Ostrzeżenie o braku adekwatności należy dać, gdy:",
    options: [
      "Test wykazał brak wiedzy/doświadczenia dla produktu złożonego",
      "Zawsze przed transakcją",
      "Wyłącznie przy demo",
      "Nigdy",
    ],
    correctIndex: 0,
    correctAnswer: "Test wykazał brak wiedzy/doświadczenia dla produktu złożonego",
    explanation:
      "Ostrzeżenie ma sens tylko, gdy wynik testu wskazuje lukę względem złożonego produktu — nie „zawsze”.",
    consequenceCorrect:
      "Traktujesz ostrzeżenie jako moment na naukę, nie jako formalność.",
    consequenceWrong:
      "Ignorowanie ostrzeżenia przy braku wiedzy zwiększa ryzyko decyzji ponad kompetencje.",
    topic: "Ostrzeżenia",
    difficulty: "medium",
  },
  {
    id: "cy-23",
    question: "Który element NIE jest typowy dla KID?",
    options: [
      "Cele i ryzyka",
      "Scenariusze wyników",
      "Szczegółowy kod źródłowy algorytmu",
      "Koszty produktu",
    ],
    correctIndex: 2,
    correctAnswer: "Szczegółowy kod źródłowy algorytmu",
    explanation:
      "KID zawiera cele, ryzyko, scenariusze, koszty — nie kod źródłowy strategii.",
    consequenceCorrect:
      "Wiesz, czego szukać w KID przed zakupem produktu pakietowego.",
    consequenceWrong:
      "Szukanie w KID informacji technicznych nieistotnych dla decyzji inwestora marnuje czas.",
    topic: "KID",
    difficulty: "easy",
  },
  {
    id: "cy-24",
    question: "Conflicts of interest policy obejmuje m.in.:",
    options: [
      "Identyfikację, zapobieganie, ujawnianie konfliktów",
      "Listę pracowników",
      "Info o spreadach",
      "Politykę backupów",
    ],
    correctIndex: 0,
    correctAnswer: "Identyfikację, zapobieganie, ujawnianie konfliktów",
    explanation:
      "Polityka konfliktów to proces zarządzania sytuacjami, gdzie interes firmy może się rozminąć z klientem.",
    consequenceCorrect:
      "Czytasz ujawnienia rebate’ów i relacji producent–dystrybutor.",
    consequenceWrong:
      "Założenie „zero konfliktów” jest naiwne — ważne jest ujawnienie i zarządzanie.",
    topic: "Konflikty",
    difficulty: "medium",
  },
  {
    id: "cy-25",
    question: "„Client money” w CIF oznacza:",
    options: [
      "Środki klientów na rachunkach segregowanych",
      "Bonusy promocyjne",
      "Kapitał własny firmy",
      "Depozyty pracowników",
    ],
    correctIndex: 0,
    correctAnswer: "Środki klientów na rachunkach segregowanych",
    explanation:
      "Client money to środki klientów przechowywane oddzielnie od własnego kapitału CIF.",
    consequenceCorrect:
      "Rozumiesz priorytet wypłat przy problemach finansowych firmy (teoretycznie lepsza ochrona).",
    consequenceWrong:
      "Mylenie środków klientów z kapitałem firmy to fundamentalny błąd przy ocenie ryzyka brokera.",
    topic: "Środki",
    difficulty: "easy",
  },
  {
    id: "cy-26",
    question: "Różnica między appropriateness a suitability to:",
    options: [
      "Appropriateness = wiedza/doświadczenie; suitability = dopasowanie do celów/sytuacji",
      "To samo",
      "Appropriateness dotyczy AML",
      "Suitability dotyczy demo",
    ],
    correctIndex: 0,
    correctAnswer:
      "Appropriateness = wiedza/doświadczenie; suitability = dopasowanie do celów/sytuacji",
    explanation:
      "Appropriateness chroni przed produktem ponad wiedzę; suitability dobiera rekomendację do profilu i celów.",
    consequenceCorrect:
      "Wiesz, czego oczekiwać przy różnych usługach u tego samego brokera.",
    consequenceWrong:
      "Używanie tych pojęć zamiennie prowadzi do złych oczekiwać wobec doradztwa.",
    topic: "Pojęcia",
    difficulty: "medium",
  },
];
