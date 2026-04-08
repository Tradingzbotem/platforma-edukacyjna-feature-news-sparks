import type { DataMcqRow } from "./dataMcqRow";

/** Moduł „Regulacje w praktyce” — quizy 1–5 (reg-01 … reg-60). Źródło merytoryczne: logika KNF / CySEC / MiFID w wersji procesowej, nie kopią starych quizów. */
export const REGULACJE_QUIZ_DATA: DataMcqRow[] = [
  // --- 1. klient-testy-i-kwalifikacja (reg-01 … reg-12) ---
  {
    id: "reg-01",
    question:
      "Na etapie kwalifikacji klient przyznaje, że nie rozumie, jak dźwignia wpływa na wielkość pozycji i ewentualną stratę względem depozytu. Account manager odpowiada, że „na start można ustawić wyższy lewar, wtedy łatwiej wejść w rynek”. Co jest najpoważniejszym błędem po stronie firmy?",
    options: [
      "Brak osobnego e-maila podsumowującego rozmowę",
      "Kontynuacja ścieżki i zachęta do wyższej dźwigni bez domknięcia zrozumienia mechaniki margin przy produkcie złożonym",
      "To, że klient nie używa terminologii branżowej",
      "Konieczność ponownego zaznaczenia zgód RODO",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kontynuacja ścieżki i zachęta do wyższej dźwigni bez domknięcia zrozumienia mechaniki margin przy produkcie złożonym",
    explanation:
      "Brak zrozumienia dźwigni przy produkcie złożonym powinien skutkować wstrzymaniem lub zmianą ścieżki sprzedaży, a nie zwiększaniem ekspozycji dla uproszczenia wejścia.",
    consequenceCorrect:
      "Wstrzymanie lub modyfikacja ścieżki; przekazanie treści edukacyjnej albo ponowny kontakt po potwierdzeniu zrozumienia; udokumentowanie działań w CRM.",
    consequenceWrong:
      "Ryzyko sprzedaży bez adekwatnego zrozumienia: reklamacje, postępowania, roszczenia, możliwa interwencja nadzoru.",
    topic: "Klient i kwalifikacja",
    difficulty: "hard",
  },
  {
    id: "reg-02",
    question:
      "Lead prosi, by „przejść test wiedzy możliwie szybko, bo chce dziś uruchomić konto”, i sugeruje, że odpowiedzi „i tak są oczywiste”. Co robi pracownik zgodnie z dobrym procesem?",
    options: [
      "Uznaje prośbę — test jest przede wszystkim formalnością konwersyjną",
      "Tłumaczy, że wynik musi odzwierciedlać wiedzę klienta; nie udaje „szybszego przejścia”; przy odmowie współpracy przerywa onboarding lub eskaluje",
      "Udostępnia ten sam link testu współpracownikowi „na wszelki wypadek”",
      "Skraca liczbę pytań bez zgody compliance, powołując się na deadline klienta",
    ],
    correctIndex: 1,
    correctAnswer:
      "Tłumaczy, że wynik musi odzwierciedlać wiedzę klienta; nie udaje „szybszego przejścia”; przy odmowie współpracy przerywa onboarding lub eskaluje",
    explanation:
      "Test weryfikuje wiedzę lub adekwatność; obejście procedury osłabia dokumentację i warstwę ochronną klienta.",
    consequenceCorrect: "Zachowanie wartości dowodowej wyniku i zgodności z wewnętrzną procedurą oceny.",
    consequenceWrong:
      "Ryzyko niewiarygodnej dokumentacji testu oraz utrudnionej obrony wobec klienta i organu nadzoru.",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-03",
    question:
      "Klient chce status profesjonalny, bo „ma doświadczenie”, ale nie spełnia progów merytorycznych. Najlepsza pierwsza reakcja:",
    options: [
      "Przyznajesz status lojalnościowo",
      "Tłumaczysz, że kategoria to próg prawny, nie prestiż; bez spełnienia kryteriów zostaje ochrona detaliczna",
      "Obiecujesz „załatwienie” przez managera bez dokumentów",
      "Odsyłasz do konkurencji bez wyjaśnienia",
    ],
    correctIndex: 1,
    correctAnswer:
      "Tłumaczysz, że kategoria to próg prawny, nie prestiż; bez spełnienia kryteriów zostaje ochrona detaliczna",
    explanation:
      "Nadanie statusu professional bez spełnienia kryteriów zawęża zestaw obowiązków informacyjnych i ochrony stosowanych wobec klienta detalicznego.",
    consequenceCorrect: "Stosowanie polityki kategorii klientów i ścieżki dokumentowej zgodnie z progami formalnymi.",
    consequenceWrong:
      "Ryzyko uznania nadania statusu bez spełnienia progów za obejście ochrony detalu (skutki prawne i reputacyjne).",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-04",
    question:
      "Klient nie zalicza testu adekwatności do produktu złożonego. Konsultant na czacie pisze, że przy kolejnej próbie „pomoże dobrać odpowiedzi”. Jak ocenić taką reakcję?",
    options: [
      "Jest dopuszczalna, jeśli druga próba jest następnego dnia roboczego",
      "Jest niedopuszczalna — podpowiedzi fałszują wynik i podważają wiarygodność całej oceny",
      "Jest wymagana przy skróconym onboardingzie zatwierdzonym przez dział sprzedaży",
      "Jest neutralna, bo system i tak zapisuje każdą próbę",
    ],
    correctIndex: 1,
    correctAnswer:
      "Jest niedopuszczalna — podpowiedzi fałszują wynik i podważają wiarygodność całej oceny",
    explanation:
      "Wynik testu ma odzwierciedlać samodzielną wiedzę klienta; podpowiadanie odpowiedzi unieważnia pomiar adekwatności.",
    consequenceCorrect: "Druga próba bez podpowiadania odpowiedzi albo ścieżka szkoleniowa przed kolejnym testem.",
    consequenceWrong: "Obniżenie wiarygodności wyniku w kontroli wewnętrznej i w ewentualnym sporze z klientem.",
    topic: "Klient i kwalifikacja",
    difficulty: "hard",
  },
  {
    id: "reg-05",
    question:
      "Klient na telefonie mówi, że nie czyta długich regulaminów i prosi o „krótkie podsumowanie w dwóch zdaniach” przed otwarciem konta na CFD. Co jest właściwe?",
    options: [
      "Uspokajasz go, że „u większości jest podobnie i jakoś działa”",
      "W prostym języku przekazujesz kluczowe ryzyka i koszty; wskazujesz dokumenty do lektury i czas na decyzję",
      "Kończysz rozmowę bez notatki, by nie przedłużać czasu",
      "Wysyłasz wyłącznie link do PDF bez komentarza w rozmowie",
    ],
    correctIndex: 1,
    correctAnswer:
      "Krótko, zrozumiale ujawniasz kluczowe ryzyka i koszty; oferujesz dokumenty i czas na decyzję",
    explanation:
      "Obowiązek informacyjny obowiązuje także przy prośbie o skrót; treść musi być przekazana w sposób zrozumiały dla klienta.",
    consequenceCorrect:
      "Udokumentowanie przekazanego streszczenia, doręczenie pełnych dokumentów oraz czas na decyzję bez presji.",
    consequenceWrong: "Ryzyko sprzedaży bez świadomej zgody: reklamacje i zarzuty wprowadzenia w błąd.",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-06",
    question:
      "Klient detaliczny chce reklasyfikację na professional „jutro podpiszemy”. Brak dowodów spełnienia progów. Ty:",
    options: [
      "Ustawiasz „wstępnie” w CRM",
      "Nie zmieniasz kategorii bez kompletu dowodów i akceptacji wg procedury",
      "Zmieniasz w systemie tymczasowo",
      "Obiecujesz zwrot prowizji jeśli źle",
    ],
    correctIndex: 1,
    correctAnswer: "Nie zmieniasz kategorii bez kompletu dowodów i akceptacji wg procedury",
    explanation: "Zmiana kategorii modyfikuje poziom ochrony i zakres obowiązków — nie jest elementem oferty handlowej.",
    consequenceCorrect: "Realizacja checklisty dowodów i decyzji zgodnie z procedurą reklasyfikacji.",
    consequenceWrong: "Utrwalenie praktyki zmiany kategorii bez spełnienia progów (naruszenie ochrony detalu).",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-07",
    question:
      "Dział sprzedaży chce skrócić onboarding z 40 do 5 minut, powołując się na krótsze ścieżki u konkurentów. Najsilniejszy argument compliance / ryzyka dla zarządu:",
    options: [
      "Krótszy onboarding zawsze podnosi marżę operacyjną na klienta",
      "Pomijanie kroków informacyjnych i testów zwiększa ryzyko skarg, zwrotów prowizji i interwencji nadzoru — krótkoterminowa konwersja tego nie zbilansuje",
      "Konkurencja działa poza tym samym zestawem wymogów, więc skrót jest obiektywnie neutralny",
      "Wystarczy jednorazowa notatka „zgoda compliance”, bez pomiaru jakości zgód",
    ],
    correctIndex: 1,
    correctAnswer:
      "Pominięcie kroków informacyjnych i testów rośnie kosztem skarg, clawback i nadzoru",
    explanation:
      "Skrócenie czasu możliwe jest przy zachowaniu istotnych kroków informacyjnych i testów; ich pomijanie podnosi profil ryzyka.",
    consequenceCorrect:
      "Decyzja biznesowa z jawnym bilansem konwersji i jakości procesu zgodności, bez obniżania wymogu poniżej minimum.",
    consequenceWrong:
      "Systemowe pomijanie kroków compliance: wzrost skarg, roszczeń zwrotowych i ryzyka działań nadzorczych.",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-08",
    question:
      "Klient informuje, że zlecenia na koncie w praktyce składa osoba trzecia („znajomy, który się zna”), a on „tylko podpisuje”. Twoja pierwsza reakcja w procesie:",
    options: [
      "Kontynuujesz, jeśli rachunek jest dodatni i nie było skarg",
      "Zatrzymujesz ścieżkę i eskalujesz — zlecenia powinien składać właściciel rachunku; relacja pod cudze dyspozycje to poważny sygnał ostrzegawczy",
      "Prosisz wyłącznie o mailowe „potwierdzenie” od znajomego bez weryfikacji tożsamości",
      "Sugerujesz otwarcie osobnego konta na dane znajomego, by uprościć sytuację",
    ],
    correctIndex: 1,
    correctAnswer:
      "Zatrzymujesz / eskalujesz — konto ma prowadzić właściciel; trading za obcą osobę to red flag",
    explanation:
      "Sygnał dotyczy tożsamości beneficjenta, zgody na ryzyko oraz obowiązków AML — wymaga procedury, a nie kontynuacji bez weryfikacji.",
    consequenceCorrect: "Zastosowanie procedury KYC/AML i decyzja zgodna z polityką; często wstrzymanie lub zamknięcie relacji.",
    consequenceWrong:
      "Ryzyko utrzymywania rachunku przy rozbieżności między deklaracją a faktycznym dysponentem (w tym pod kątem AML).",
    topic: "Klient i kwalifikacja",
    difficulty: "hard",
  },
  {
    id: "reg-09",
    question:
      "Model execution-only. Klient pyta wprost, który instrument wybrać przed jutrzejszym posiedzeniem banku centralnego. Nie masz uprawnień doradztwa inwestycyjnego. Najbezpieczniejsza linia:",
    options: [
      "Podajesz instrument i kierunek, ale bez uzasadnienia — „same fakty z rynku”",
      "Wyjaśniasz ogólnie ryzyko zdarzeń makro, odmawiasz rekomendacji konkretnego instrumentu, wskazujesz neutralne źródła informacji",
      "Odsyłasz do publicznego kanału społecznościowego, gdzie „wszyscy to omawiają”",
      "Przekazujesz krótką „obserwację” z wewnętrznego czatu dealerskiego",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ogólnie: ryzyko newsów, brak rekomendacji, wskazujesz neutralne źródła informacji",
    explanation:
      "Granica między edukacją ogólną a rekomendacją inwestycyjną; bez odpowiedniej licencji nie wskazuje się instrumentu ani kierunku.",
    consequenceCorrect:
      "Zachowanie modelu execution-only: opis ogólnych ryzyk, odmowa rekomendacji, neutralne źródła informacji.",
    consequenceWrong: "Ryzyko udzielania rekomendacji poza zakresem licencji (odpowiedzialność cywilna i nadzorcza).",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-10",
    question:
      'W CRM wpis: „klient potwierdza zrozumienie ryzyka” bez żadnej rozmowy o ryzyku. To jest:',
    options: [
      "Wystarczający dowód, jeśli pole jest obowiązkowe w systemie",
      "Słaby lub wprowadzający w błąd ślad — notatka musi odzwierciedlać realną treść komunikacji",
      "Dopuszczalny skrót przy wysokim wolumenie kontaktów",
      "Wymagany wyłącznie przy pierwszej transakcji na akcjach",
    ],
    correctIndex: 1,
    correctAnswer:
      "Słaby lub fałszywy ślad — notatka musi odzwierciedlać realną komunikację",
    explanation:
      "Kontrola wewnętrzna i postępowania sporowe oceniają przebieg procesu, a nie sam fakt wypełnienia pola w systemie.",
    consequenceCorrect: "Notatka CRM odzwierciedlająca faktyczną treść rozmowy oraz przekazane dokumenty.",
    consequenceWrong: "Słaba dokumentacja przebiegu obowiązku informacyjnego w audycie lub sporze.",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-11",
    question:
      "Klient VIP żąda wyłączenia komunikatów ryzyka „bo wie, co robi”. Ty:",
    options: [
      "Wyłączasz na prośbę",
      "Odmawiasz wyłączenia obowiązkowych ostrzeżeń; możesz ograniczyć marketing, nie rdzeń ryzyka",
      "Przekazujesz bez decyzji",
      "Zmieniasz kategorię bez dokumentów",
    ],
    correctIndex: 1,
    correctAnswer:
      "Odmawiasz wyłączenia obowiązkowych ostrzeżeń; możesz ograniczyć marketing, nie rdzeń ryzyka",
    explanation:
      "Obowiązkowe ostrzeżenia dla klienta detalicznego nie podlegają negocjacji w ramach relacji handlowej.",
    consequenceCorrect:
      "Możliwa redukcja częstotliwości komunikacji marketingowej przy niezmienionym rdzeniu ostrzeżeń o ryzyku.",
    consequenceWrong: "Ryzyko deprecjacji standardu informacyjnego oraz serii żądań wyłączeń od innych klientów.",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },
  {
    id: "reg-12",
    question:
      "Dwóch konsultantów tego samego dnia podaje jednemu klientowi różne informacje o koszcie finansowania pozycji (swap). To najpewniej wskazuje na:",
    options: [
      "Różną interpretację pojęć — wystarczy przeprosić klienta bez zmiany procedur",
      "Lukę w szkoleniu lub w materiałach referencyjnych: brak jednej wersji kosztów i spójnego skryptu — wymaga naprawy procesu",
      "Świadomą elastyczność cenową per agent",
      "Błąd po stronie klienta w zapisie rozmów",
    ],
    correctIndex: 1,
    correctAnswer:
      "Lukę w szkoleniu i brak jednej wersji prawdy w tabelach / skryptach — wymaga naprawy procesu",
    explanation:
      "Spójność informacji o kosztach wspiera rzetelną komunikację z klientem i jest oczekiwana w standardach ochrony inwestora (np. MiFID II).",
    consequenceCorrect: "Aktualizacja materiałów referencyjnych (np. FAQ, tabela opłat), szkolenie zespołu front office.",
    consequenceWrong: "Niespójne oczekiwania co do kosztów oraz podstawa do reklamacji lub skargi do organu.",
    topic: "Klient i kwalifikacja",
    difficulty: "medium",
  },

  // --- 2. ryzyko-jasnosc-komunikatu (reg-13 … reg-24) ---
  {
    id: "reg-13",
    question:
      "Kampania e-mailowa obiecuje „bezpieczniejsze operowanie kapitałem na rynku walutowym” przy jednoczesnym podkreśleniu dźwigni 1:500. Najpoważniejszy problem:",
    options: [
      "Brak segmentacji listy mailingowej",
      "Sugestia ochrony kapitału przy bardzo wysokiej dźwigni — sprzeczna z mechaniką ryzyka i może wprowadzać w błąd",
      "Zbyt krótki tekst oferty",
      "Brak porównania z konkurencją w treści",
    ],
    correctIndex: 1,
    correctAnswer:
      "Sugerowanie ochrony kapitału przy wysokiej dźwigni — wprowadzające w błąd względem realnego ryzyka straty",
    explanation: "Dźwignia amplifikuje straty; język „zabezpiecz” sugeruje coś odwrotnego do mechaniki CFD/FX.",
    consequenceCorrect: "Korekta copy z jasnym ostrzeżeniem o ryzyku utraty depozytu.",
    consequenceWrong: "Skarga klienta lub interwencja regulatora za wprowadzającą komunikację.",
    topic: "Ryzyko i komunikat",
    difficulty: "hard",
  },
  {
    id: "reg-14",
    question:
      "Na czacie pomocy klient wyraża obawę przed stratą. Konsultant odpowiada, że „rynek z czasem się odbija” i nie warto się tym przejmować przed otwarciem pozycji. To jest:",
    options: [
      "Standardowa wskazówka relacyjna akceptowalna przy każdym produkcie",
      "Bagatelizowanie ryzyka — niewłaściwe przy instrumentach spekulacyjnych z dźwignią",
      "Wymóg wynikający z dobrych praktyk obsługi klienta detalicznego",
      "Obowiązkowy element skryptu zatwierdzonego przez compliance",
    ],
    correctIndex: 1,
    correctAnswer: "Bagatelizowanie ryzyka — niewłaściwe przy produktach spekulacyjnych",
    explanation: "Komunikat sugeruje łatwe odrobienie straty i lekceważy ryzyko szybkiej utraty depozytu.",
    consequenceCorrect: "Neutralny język: szanse i ryzyko, bez obietnic o „powrocie”.",
    consequenceWrong: "Klient wchodzi bez świadomości, potem pretensje do firmy.",
    topic: "Ryzyko i komunikat",
    difficulty: "medium",
  },
  {
    id: "reg-15",
    question:
      "Na stronie mobilnej przycisk „Otwórz konto” jest widoczny od razu, a pełne ostrzeżenie o ryzyku dopiero kilka ekranów niżej. Problem:",
    options: [
      "Użytkownicy mobilni i tak rzadko czytają stopkę strony",
      "Ostrzeżenie nie jest realnie widoczne w momencie decyzji — słaba przejrzystość względem CTA",
      "CTA powinien być mniejszy, by zmieścić ostrzeżenie obok",
      "Brak materiału wideo wyjaśniającego ryzyko",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kluczowe ostrzeżenie nie jest widoczne przy decyzji — słaba przejrzystość",
    explanation: "Ostrzeżenie musi być realnie zauważalne w kontekście wezwania do działania.",
    consequenceCorrect: "Ostrzeżenie przy CTA lub jasny link „ryzyko” przed konwersją.",
    consequenceWrong: "Argument „było gdzieś na stronie” — słaba obrona.",
    topic: "Ryzyko i komunikat",
    difficulty: "medium",
  },
  {
    id: "reg-16",
    question:
      "Strona WWW zawiera wyraźne ostrzeżenie o wysokim ryzyku straty. W rozmowie telefonicznej agent mówi, że „u nich ryzyko jest utemperowane i klienci czują się bezpieczniej niż gdzie indziej”. Te komunikaty są:",
    options: [
      "Spójne — strona i rozmowa uzupełniają się",
      "Sprzeczne — podważają treść ostrzeżenia i mogą wprowadzać w błąd co do skali ryzyka",
      "Neutralne, bo klient i tak widział tekst na stronie",
      "Dopuszczalne, jeśli agent ma dobre wyniki sprzedażowe",
    ],
    correctIndex: 1,
    correctAnswer:
      "Sprzeczne — podważają treść ostrzeżenia i mogą wprowadzać w błąd",
    explanation: "Spójność kanałów jest częścią fair communication — nie gasisz ryzyka słowami.",
    consequenceCorrect: "Jeden zestaw prawdziwych komunikatów we wszystkich kanałach.",
    consequenceWrong: "Klient „usłyszał co innego niż przeczytał”.",
    topic: "Ryzyko i komunikat",
    difficulty: "hard",
  },
  {
    id: "reg-17",
    question:
      "Klient deklaruje, że nie rozumie angielskiego; umowy i KID są wyłącznie w tym języku, a wsparcie po polsku oferuje głównie bot z szablonami. Najpoważniejsze ryzyko:",
    options: [
      "Angielski jest powszechny w branży, więc domyślnie akceptowalny",
      "Kluczowe informacje mogą nie być zrozumiałe — sens obowiązku informacyjnego nie został spełniony",
      "Chatbot zastępuje obowiązek przekazania treści w zrozumiałej formie",
      "Przy CFD wystarczy krótka informacja ustna bez dokumentów w języku klienta",
    ],
    correctIndex: 1,
    correctAnswer:
      "Informacje kluczowe mogą nie być zrozumiałe — naruszenie sensu obowiązku informacyjnego",
    explanation: "Chodzi o realne zrozumienie, nie formalne „dostarczenie pliku PDF”.",
    consequenceCorrect: "Wersja językowa lub kwalifikowany kontakt przed otwarciem ryzykownych produktów.",
    consequenceWrong: "Zgoda bez zrozumienia — słaba linia obrony w sporze.",
    topic: "Ryzyko i komunikat",
    difficulty: "medium",
  },
  {
    id: "reg-18",
    question:
      "Skrypt sprzedaży porównuje CFD do lokaty „bo też trzymasz pieniądze u instytucji”. To jest:",
    options: [
      "Dobra analogia",
      "Wprowadzające w błąd — inna natura ryzyka, brak gwarancji kapitału jak w depozycie",
      "Wymagane przez KID",
      "OK jeśli klient się zgadza",
    ],
    correctIndex: 1,
    correctAnswer:
      "Wprowadzające w błąd — inna natura ryzyka, brak gwarancji kapitału jak w depozycie",
    explanation: "Porównanie do produktu niskiego ryzyka zaciera skalę straty przy dźwigni.",
    consequenceCorrect: "Porównania wyłącznie do innych instrumentów o podobnym profilu ryzyka, z ostrzeżeniem.",
    consequenceWrong: "Klient traktuje CFD jak oszczędzanie — potem szok i skarga.",
    topic: "Ryzyko i komunikat",
    difficulty: "hard",
  },
  {
    id: "reg-19",
    question:
      "Konsultant zapewnia klienta, że „nie straci więcej niż wpłacił”, podczas gdy dokumenty produktu i jurysdykcja nie przewidują gwarancji ograniczenia straty do depozytu. To jest:",
    options: [
      "Zasadniczo poprawne stwierdzenie przy każdym CFD",
      "Potencjalnie fałszywe lub niepełne — trzeba opisać realny scenariusz margin, zamknięć i ewentualnych zobowiązań zgodnie z dokumentacją",
      "Dozwolone uproszczenie, by klient nie rezygnował z konta",
      "Prawda automatycznie, jeśli na platformie widać poziom stop out",
    ],
    correctIndex: 1,
    correctAnswer:
      "Potencjalnie fałsz — trzeba opisać realny scenariusz margin i ewentualny deficyt zgodnie z faktami",
    explanation: "Obietnice o limicie straty muszą odpowiadać warunkom produktu i regulacji rynku.",
    consequenceCorrect: "Dokładny opis mechaniki zamknięć i ewentualnych dopłat wg dokumentów.",
    consequenceWrong: "Obietnica, której nie dotrzymasz — odpowiedzialność i utrata zaufania.",
    topic: "Ryzyko i komunikat",
    difficulty: "hard",
  },
  {
    id: "reg-20",
    question:
      "Prezentacja dla klientów pokazuje wyłącznie miesiące ze stratą dodatnią strategii kopiowanej z platformy, bez okresów strat ani kosztów. Problem:",
    options: [
      "Prezentacja handlowa może skupiać się na pozytywnych przykładach",
      "Cherry-picking wyników bez kontekstu ryzyka i kosztów — wprowadzający",
      "Wystarczy dopisek w stopce slajdu, bez zmiany treści",
      "Historia wyników z platformy jest z definicji reprezentatywna",
    ],
    correctIndex: 1,
    correctAnswer:
      "Selekcja wyników bez kontekstu ryzyka i kosztów — wprowadzająca",
    explanation: "Historia zwrotów wymaga kontekstu: ryzyko, koszty, pełny okres, a nie same zielone słupki.",
    consequenceCorrect: "Zbalansowany widok albo rezygnacja z obietnic opartych na cherry-picku.",
    consequenceWrong: "Klient wierzy w „pewny schemat zysku”.",
    topic: "Ryzyko i komunikat",
    difficulty: "medium",
  },
  {
    id: "reg-21",
    question:
      "Biuletyn do szerokiego grona klientów detalicznych używa żargonu pochodnych („gamma, roll, basis”) bez definicji ani warstwy wyjaśnień. Z perspektywy compliance:",
    options: [
      "Wizerunek ekspercki usprawiedliwia poziom trudności języka",
      "Ryzyko, że odbiorca nie rozumie istoty ryzyka — potrzebna warstwa prostym językiem lub słowniczek",
      "Obecność terminów technicznych sama w sobie spełnia obowiązek informacyjny",
      "Klienci detaliczni korzystający z pochodnych znają te pojęcia z definicji",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko, że klient nie rozumie istoty ryzyka — trzeba uprościć lub dodać wyjaśnienie",
    explanation: "Przejrzystość to zrozumiałość dla odbiorcy, nie pokaz słownictwa.",
    consequenceCorrect: "Warstwa „w prostych słowach” obok technicznej.",
    consequenceWrong: "Zgoda oparta na niezrozumieniu.",
    topic: "Ryzyko i komunikat",
    difficulty: "medium",
  },
  {
    id: "reg-22",
    question:
      "Zmiana opłaty za nocleg (finansowanie) wchodzi jutro. Klienci aktywni nie dostali żadnej wiadomości. Błąd:",
    options: [
      "Opłaty są tajemnicą handlową",
      "Brak terminowego ujawnienia istotnej zmiany kosztu — narusza uczciwość informacyjną",
      "Wystarczy akt na stronie dla nowych",
      "Klienci i tak widzą to na rachunku",
    ],
    correctIndex: 1,
    correctAnswer:
      "Brak terminowego ujawnienia istotnej zmiany kosztu — narusza uczciwość informacyjną",
    explanation: "Istotne zmiany warunków wymagają kanału, który realnie dociera do dotkniętych klientów.",
    consequenceCorrect: "Komunikat przed wejściem + aktualizacja dokumentów.",
    consequenceWrong: "Niespodzianka na rachunku — fala ticketów i utrata reputacji.",
    topic: "Ryzyko i komunikat",
    difficulty: "medium",
  },
  {
    id: "reg-23",
    question:
      "Rozmowa głosowa: ryzyko „wymienione szybko na końcu” bez potwierdzenia, że klient zrozumiał. Najlepsza praktyka:",
    options: [
      "Szybko przejść do zapisu",
      "Krótkie podsumowanie ryzyka własnymi słowami klienta lub pytanie kontrolne + notatka",
      "Nagranie bez zgody",
      "Pominąć ryzyko jeśli się spieszy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Krótkie podsumowanie ryzyka własnymi słowami klienta lub pytanie kontrolne + notatka",
    explanation: "Obowiązek informacyjny w rozmowie wymaga sensownego odbioru, nie tylko wymówienia.",
    consequenceCorrect: "Dowód procesu: co powiedziano, jak klient potwierdził rozumienie.",
    consequenceWrong: "„Powiedziałem” bez „zrozumiano”.",
    topic: "Ryzyko i komunikat",
    difficulty: "medium",
  },
  {
    id: "reg-24",
    question:
      "Powiadomienie push do aplikacji: „Dziś silny ruch na złocie — nie przegap okazji”. To jest typowo:",
    options: [
      "Neutralna informacja edukacyjna o rynku",
      "Sugestia kierunku i pilności przy spekulacji — wysokie ryzyko compliance w komunikacji masowej",
      "Standardowy komunikat makro, jeśli nie zawiera kwoty depozytu",
      "Element wymagany przy instrumentach referencyjnych",
    ],
    correctIndex: 1,
    correctAnswer:
      "Obietnica kierunku rynku / presja FOMO — wysokie ryzyko compliance w marketingu",
    explanation: "Nie sugerujesz pewności ruchu ani nie budujesz pilności na spekulacji.",
    consequenceCorrect: "Komunikaty o volatility i ryzyku, bez „pewniaka”.",
    consequenceWrong: "Klient wchodzi pod presją — łatwy materiał w sporze.",
    topic: "Ryzyko i komunikat",
    difficulty: "hard",
  },

  // --- 3. dokumenty-koszty-zrozumienie (reg-25 … reg-36) ---
  {
    id: "reg-25",
    question:
      "Klient pierwszy raz otwiera pozycję na złożonym instrumencie. Konsultant sugeruje wysłanie KID dopiero po zawarciu transakcji, „żeby nie opóźniać wejścia”. Co jest błędem?",
    options: [
      "KID można doręczyć w dowolnym momencie pierwszego dnia relacji",
      "Informacje kluczowe powinny być dostępne przed decyzją inwestycyjną — wysłanie „po fakcie” psuje sens dokumentu",
      "Po transakcji klient i tak widzi P/L, więc kolejność dokumentów jest drugorzędna",
      "KID dotyczy wyłącznie klientów profesjonalnych",
    ],
    correctIndex: 1,
    correctAnswer:
      "Kluczowe informacje przed decyzją powinny być dostępne na czas — opóźnienie psuje sens dokumentu",
    explanation:
      "KID/KIID ma umożliwić porównanie i decyzję przed wejściem — wysłanie „po fakcie” jest złym procesem.",
    consequenceCorrect: "KID przed złożeniem zlecenia + czas na lekturę lub pytania.",
    consequenceWrong: "Decyzja w próżni informacyjnej — skarga i trudna obrona.",
    topic: "Dokumenty i koszty",
    difficulty: "hard",
  },
  {
    id: "reg-26",
    question:
      "Na spotkaniu sprzedaż mówi tylko o „niskim spreadzie”, pomija prowizję, swap i ewentualną opłatę za dane. To jest:",
    options: [
      "Skupienie na najważniejszym",
      "Niepełny obraz kosztów — wprowadzający względem całkowitego kosztu posiadania",
      "Dozwolone jeśli spread jest faktycznie niski",
      "OK dla stałych klientów",
    ],
    correctIndex: 1,
    correctAnswer:
      "Niepełny obraz kosztów — wprowadzający względem całkowitego kosztu posiadania",
    explanation: "Koszty to pakiet: spread, prowizje, finansowanie, opłaty dodatkowe — klient musi widzieć sensowną całość.",
    consequenceCorrect: "Checklista kosztów w każdym skrypcie sprzedaży.",
    consequenceWrong: "„Nie wiedziałem o swapie” — powtarzalna reklamacja.",
    topic: "Dokumenty i koszty",
    difficulty: "medium",
  },
  {
    id: "reg-27",
    question:
      "Klient podpisuje zgody w 90 sekundach przy screen-sharingu bez czasu na czytanie, bo „kończy się bonus”. Problem:",
    options: [
      "Bonus jest ważniejszy",
      "Presja czasu podważa dobrowolność i zrozumienie — zły proces zgód",
      "Szybkość świadczy o zaufaniu",
      "PDF i tak nikt nie czyta",
    ],
    correctIndex: 1,
    correctAnswer:
      "Presja czasu podważa dobrowolność i zrozumienie — zły proces zgód",
    explanation: "Zgoda ma być świadoma; agresywny countdown to typowy red flag compliance.",
    consequenceCorrect: "Odłożenie decyzji albo wysłanie pakietu do przeczytania bez nagrody za pośpiech.",
    consequenceWrong: "Argument w sporze: „wmuszono mnie bonus-em”.",
    topic: "Dokumenty i koszty",
    difficulty: "hard",
  },
  {
    id: "reg-28",
    question:
      "Klient planuje utrzymać pozycję około tygodnia. W rozmowie sprzedażowej nikt nie wspomniał o kosztach finansowania nocnego (overnight). To:",
    options: [
      "Akceptowalne — szczegóły są widoczne w platformie transakcyjnej",
      "Istotny brak w komunikacji przed decyzją o horyzoncie — koszty carry mogą zmienić opłacalność",
      "Koszty overnight są znikome w porównaniu ze spreadem, więc można je pominąć",
      "Obowiązek wyłącznie działu rozliczeń, nie front office",
    ],
    correctIndex: 1,
    correctAnswer:
      "Istotny brak w komunikacji przed decyzją o horyzoncie — może zmienić opłacalność",
    explanation: "Przy dłuższym trzymaniu koszt carry bywa większy niż spread wejścia.",
    consequenceCorrect: "Proste wyjaśnienie finansowania przy planie „kilka dni+”.",
    consequenceWrong: "Zaskoczenie na rachunku — utrata zaufania.",
    topic: "Dokumenty i koszty",
    difficulty: "medium",
  },
  {
    id: "reg-29",
    question:
      "Tabela opłat ma trzy poziomy prowizji zależnie od obrotu, ale opis jest tak zawiły, że support sam się myli. Wniosek:",
    options: [
      "Zawiłość chroni firmę",
      "Struktura kosztów musi być możliwa do wytłumaczenia jednoznacznie — uprość lub dodaj przykłady",
      "Klient ma obowiązek zrozumieć matematykę wyższej",
      "Wystarczy link do PDF",
    ],
    correctIndex: 1,
    correctAnswer:
      "Struktura kosztów musi być możliwa do wytłumaczenia jednoznacznie — uprość lub dodaj przykłady",
    explanation: "Przejrzystość to nie tylko obecność liczb, ale ich sens dla typowego klienta.",
    consequenceCorrect: "Kalkulator przykładu + szkolenie frontu.",
    consequenceWrong: "Błędne rozliczenia i spory o „ukrytą” prowizję.",
    topic: "Dokumenty i koszty",
    difficulty: "medium",
  },
  {
    id: "reg-30",
    question:
      "Zmiana z CFD na akcje-CFD w pakiecie bez nowego dokumentu produktu i bez pauzy na lekturę. To jest:",
    options: [
      "Wygodny upsell",
      "Ryzyko pominięcia aktualizacji informacji kluczowych przy zmianie profilu produktu",
      "Dozwolone przy tym samym koncie",
      "Tylko marketing decyduje",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko pominięcia aktualizacji informacji kluczowych przy zmianie profilu produktu",
    explanation: "Inny bazowy ryzyko, inne koszty, inna mechanika — klient musi dostać właściwy pakiet informacji.",
    consequenceCorrect: "Nowy KID/warstwa informacji zgodnie z procedurą produktową.",
    consequenceWrong: "„Nie wiedziałem, że to nie to samo”.",
    topic: "Dokumenty i koszty",
    difficulty: "medium",
  },
  {
    id: "reg-31",
    question:
      "Regulator nakazuje obniżkę maksymalnej dźwigni dla detalu. Ty informujesz klientów:",
    options: [
      "Dopiero gdy zapytają",
      "Proaktywnie, z datą wejścia i skutkiem dla nowych i istniejących pozycji",
      "Tylko w regulaminie drobnym drukiem",
      "Nie informujesz — techniczna zmiana",
    ],
    correctIndex: 1,
    correctAnswer:
      "Proaktywnie, z datą wejścia i skutkiem dla nowych i istniejących pozycji",
    explanation: "Zmiana lewara zmienia ryzyko — komunikat musi być czytelny i terminowy.",
    consequenceCorrect: "Mail + baner w platformie + aktualizacja dokumentów.",
    consequenceWrong: "Pozycje zamknięte „z zaskoczenia” — lawina skarg.",
    topic: "Dokumenty i koszty",
    difficulty: "medium",
  },
  {
    id: "reg-32",
    question:
      "Klient pyta wprost, co dokładnie dzieje się na rachunku przy zbliżaniu się do margin call i przy przymusowych zamknięciach. Konsultant odpowiada, że „szczegóły są w regulaminie” i prosi o szybkie przejście dalej w formularzu. To jest:",
    options: [
      "Dopuszczalne przy wysokim wolumenie pracy — oszczędza czas obu stron",
      "Odmowa istotnego wyjaśnienia mechaniki ryzyka — zły proces wobec klienta detalicznego",
      "Właściwe, bo margin call dotyczy niewielkiej części klientów",
      "Wystarczające, jeśli link do regulaminu został wysłany mailem wcześniej",
    ],
    correctIndex: 1,
    correctAnswer:
      "Odmowa istotnego wyjaśnienia mechaniki ochrony klienta — zły proces",
    explanation: "Zamknięcia przymusowe i kolejność zleceń to część realnego ryzyka CFD.",
    consequenceCorrect: "Krótki, poprawny opis + link do sekcji dokumentu.",
    consequenceWrong: "Klient nie rozumie close-out — pretensje przy pierwszym szoku.",
    topic: "Dokumenty i koszty",
    difficulty: "hard",
  },
  {
    id: "reg-33",
    question:
      "Webinar ogłoszony jako edukacyjny kończy się wezwaniem do natychmiastowej wpłaty, by „wejść w ruch rynku”, bez równoważnego ostrzeżenia o ryzyku przy CTA finansowym. To jest:",
    options: [
      "Typowy lejek sprzedażowy bez implikacji compliance",
      "Ryzykowne: treść edukacyjna użyta jako promo bez równoważnego ryzyka przy wezwaniu do wpłaty",
      "Dopuszczalne po co najmniej 45 minutach merytorycznej części",
      "Neutralne, bo uczestnicy sami decydują o wpłacie",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzykowne mieszanie edukacji z sprzedażą bez równoważnego ryzyka przy CTA finansowym",
    explanation: "Treści edukacyjne używane jako promo podlegają tym samym zasadom uczciwości co reklama.",
    consequenceCorrect: "Jasne ostrzeżenie przy każdym wezwaniu do wpłaty / otwarcia pozycji.",
    consequenceWrong: "Regulator widzi „ukrytą sprzedaż”.",
    topic: "Dokumenty i koszty",
    difficulty: "hard",
  },
  {
    id: "reg-34",
    question:
      "Agent doradza w sprawie podatku od zysków z CFD jakby był ekspertem podatkowym. To jest:",
    options: [
      "Dobra obsługa premium",
      "Poza kompetencją — ryzyko błędnej porady; odsyłasz do doradcy podatkowego / urzędu",
      "Wymagane przez klienta",
      "OK jeśli „wydaje się” proste",
    ],
    correctIndex: 1,
    correctAnswer:
      "Poza kompetencją — ryzyko błędnej porady; odsyłasz do doradcy podatkowego / urzędu",
    explanation: "Firma inwestycyjna nie zastępuje doradcy podatkowego bez uprawnień.",
    consequenceCorrect: "Neutralna informacja + disclaimer podatkowy.",
    consequenceWrong: "Klient liczy zły podatek i obwinia firmę.",
    topic: "Dokumenty i koszty",
    difficulty: "medium",
  },
  {
    id: "reg-35",
    question:
      "Platforma „darmowa”, ale jest wysoka opłata za brak aktywności ukryta w załączniku do umowy. W komunikacji marketingowej „darmowe”. To jest:",
    options: [
      "Prawda marketingowa",
      "Wprowadzające, jeśli istotny koszt nie jest widoczny równolegle z obietnicą „darmowe”",
      "Dozwolone w załączniku",
      "Tylko problem księgowy",
    ],
    correctIndex: 1,
    correctAnswer:
      "Wprowadzające, jeśli istotny koszt nie jest widoczny równolegle z obietnicą „darmowe”",
    explanation: "„Darmowe” musi mieć te same granice co realny koszt posiadania konta.",
    consequenceCorrect: "Obok „0 prowizji” — kiedy pojawia się opłata i ile.",
    consequenceWrong: "Skarga: „mówili że za darmo”.",
    topic: "Dokumenty i koszty",
    difficulty: "hard",
  },
  {
    id: "reg-36",
    question:
      "Klient prosi o jedną stronę podsumowującą zamiast kilku osobnych plików PDF z dokumentacją. Najlepsza odpowiedź procesowa:",
    options: [
      "Odmowa — albo pełen pakiet PDF, albo brak kontynuacji relacji",
      "Możliwe jest spójne podsumowanie wraz z linkami do pełnych, wiążących dokumentów — podsumowanie nie zastępuje wymaganych materiałów",
      "Wystarczy przekazanie skrótu z nieoficjalnego kanału społecznościowego firmy",
      "Wystarczy ustne przekazanie przez innego pracownika bez śladu w CRM",
    ],
    correctIndex: 1,
    correctAnswer:
      "Możesz dać spójne podsumowanie + linki do pełnych dokumentów, by nie zastępowały wymaganych materiałów",
    explanation: "Ułatwiasz zrozumienie bez usuwania formalnych źródeł prawdy.",
    consequenceCorrect: "Layer „TL;DR” zatwierdzony przez compliance.",
    consequenceWrong: "Albo chaos PDF, albo nielegalne skracanie wymogów.",
    topic: "Dokumenty i koszty",
    difficulty: "medium",
  },

  // --- 4. wykonanie-konflikty-i-obsluga (reg-37 … reg-48) ---
  {
    id: "reg-37",
    question:
      "Firma zawsze realizuje zlecenia tylko wewnętrznie, choć czasem gorsza cena niż u zewnętrznego LP, bez jawności dla klienta. Najpoważniejszy problem:",
    options: [
      "Oszczędność infrastruktury",
      "Brak uczciwego wyjaśnienia modelu wykonania i potencjalnego konfliktu — klient nie może ocenić jakości",
      "Wewnętrzne zawsze jest najlepsze",
      "To standard retail",
    ],
    correctIndex: 1,
    correctAnswer:
      "Brak uczciwego wyjaśnienia modelu wykonania i potencjalnego konfliktu — klient nie może ocenić jakości",
    explanation: "Model dealing desk / internalization wymaga przejrzystości i polityki best execution w sensie procesowym.",
    consequenceCorrect: "Dokument wykonania + zgodność monitoringu cen.",
    consequenceWrong: "Podejrzenie faworyzowania firmy kosztem klienta.",
    topic: "Wykonanie i konflikty",
    difficulty: "hard",
  },
  {
    id: "reg-38",
    question:
      "Broker wynagradza influencera prowizją od wpłat pozyskanych z jego kodu, a publikacje nie informują o charakterze reklamowym współpracy. To jest:",
    options: [
      "Standardowa forma marketingu partnerskiego bez dodatkowych obowiązków",
      "Ukryta reklama i konflikt interesów — wymagana jawność oraz zgodność z polityką promocji i nadzorem",
      "Dopuszczalne, jeśli twórca nie przekracza ustalonego progu obserwujących",
      "Kwestia rozliczenia podatkowego twórcy, nie procedury brokera",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ukryta reklama i konflikt interesów — musi być jawność i zgodność z polityką promocji",
    explanation: "Opłaty za pozyskanie klienta muszą być widoczne dla odbiorcy treści.",
    consequenceCorrect: "Oznaczenie #reklama / partner + przegląd compliance przed publikacją.",
    consequenceWrong: "Zarzut wprowadzania konsumentów w błąd.",
    topic: "Wykonanie i konflikty",
    difficulty: "hard",
  },
  {
    id: "reg-39",
    question:
      "Pracownik działu operacji kupuje akcję na własny rachunek tuż przed wysłaniem wewnętrznej rekomendacji listowej do klientów. To jest:",
    options: [
      "Neutralne, jeśli rekomendacja jest jeszcze szkicem i nie wyszła do klientów",
      "Poważne ryzyko nadużycia informacji poufnej i naruszenia polityki personal dealing — zabronione i karalne",
      "Dopuszczalne przy niewielkiej wielkości pozycji względem obrotu spółki",
      "Dopuszczalne po godzinach pracy, gdy komunikacja nie jest już „oficjalna”",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko nadużycia informacji poufnych / insider trading — zabronione i karalne",
    explanation: "Chińskie mury między informacją a portfelem pracowników są obowiązkowe.",
    consequenceCorrect: "Polityka personal dealing + monitoring + blokady.",
    consequenceWrong: "Skandal i postępowanie karne.",
    topic: "Wykonanie i konflikty",
    difficulty: "hard",
  },
  {
    id: "reg-40",
    question:
      "Dział dealing regularnie otrzymuje wartościowe prezenty od jednego dostawcy płynności w kontekście preferencyjnego kierowania części przepływu zleceń. Co jest priorytetem compliance?",
    options: [
      "Utrzymanie relacji partnerskich bez ingerencji w model biznesowy",
      "Ocena i uregulowanie inducements: przejrzystość, ewentualne ograniczenia, wpływ na interes klienta i best execution",
      "Ewidencja podatkowa prezentów jako wystarczająca kontrola",
      "Sprawa wewnętrzna dealingu bez konieczności raportowania do compliance",
    ],
    correctIndex: 1,
    correctAnswer:
      "Uregulować inducements — przejrzystość, zgody, ewentualny zakaz wpływający na obsługę klienta",
    explanation: "Zachęty od kontrahentów mogą zniekształcać best execution i interes klienta.",
    consequenceCorrect: "Polityka prezentów + eskalacja do compliance przed akceptem.",
    consequenceWrong: "Ukryty konflikt kosztem jakości realizacji.",
    topic: "Wykonanie i konflikty",
    difficulty: "medium",
  },
  {
    id: "reg-41",
    question:
      "Klient składa reklamację mailowo. Dział odpowiada: „nie przyjmujemy maili, tylko telefon”, bez podania innego ścieżki. To jest:",
    options: [
      "Ochrona przed spamem",
      "Utrudnianie złożenia skargi — złe; podajesz jasną ścieżkę pisemną i termin jak w polityce",
      "Dozwolone dla VIP",
      "Standard B2B",
    ],
    correctIndex: 1,
    correctAnswer:
      "Utrudnianie złożenia skargi — złe; podajesz jasną ścieżkę pisemną i termin jak w politycie",
    explanation: "Proces reklamacyjny musi być dostępny i przewidywalny.",
    consequenceCorrect: "Ticket + numer sprawy + SLA.",
    consequenceWrong: "Wizerunek ukrywania problemów + eskalacja do regulatora.",
    topic: "Wykonanie i konflikty",
    difficulty: "medium",
  },
  {
    id: "reg-42",
    question:
      "Reklamacja leży 60 dni bez odpowiedzi mimo obietnicy 15 dni w regulaminie. To oznacza:",
    options: [
      "Klient zapomniał",
      "Naruszenie własnej obietnicy proceduralnej — ryzyko nadzoru i sporu",
      "Terminy są orientacyjne bez znaczenia",
      "Tylko prawnik może odpowiedzieć",
    ],
    correctIndex: 1,
    correctAnswer:
      "Naruszenie własnej obietnicy proceduralnej — ryzyko nadzoru i sporu",
    explanation: "SLA reklamacji to część zaufania; brak odpowiedzi jest dowodem zaniedbania.",
    consequenceCorrect: "Eskalacja wewnętrzna + odpowiedź z uzasadnieniem.",
    consequenceWrong: "Podwójna złość klienta i łatwy argument w sądzie.",
    topic: "Wykonanie i konflikty",
    difficulty: "medium",
  },
  {
    id: "reg-43",
    question:
      "Agent obiecuje klientowi „priorytet realizacji” bez pokrycia w polityce wykonania. To jest:",
    options: [
      "Dobra relacja",
      "Indywidualna obietnica poza dokumentacją — ryzyko mis-selling i niespełnienia",
      "Dozwolone dla dużych depozytów",
      "Automatycznie prawdziwe",
    ],
    correctIndex: 1,
    correctAnswer:
      "Indywidualna obietnica poza dokumentacją — ryzyko mis-selling i niespełnienia",
    explanation: "Obietnice muszą mieć oparcie w realnym procesie — inaczej to marketing fałszywy.",
    consequenceCorrect: "Tylko to, co wynika z dokumentu wykonania i faktycznych reguł.",
    consequenceWrong: "„Obiecano mi lepszą cenę” — spór bez końca.",
    topic: "Wykonanie i konflikty",
    difficulty: "medium",
  },
  {
    id: "reg-44",
    question:
      "Osoba podająca się za zewnętrznego audytora dzwoni i prosi o natychmiastowe przesłanie listy transakcji klientów VIP „dla kontroli”. Prawidłowa reakcja:",
    options: [
      "Wysyłasz plik na podany adres e-mail, by nie blokować audytu",
      "Weryfikujesz tożsamość, upoważnienie i kanał zgodnie z procedurą — nie przekazujesz danych bez potwierdzenia",
      "Udostępniasz wyłącznie zanonimizowane ID klientów bez pełnych danych",
      "Przekazujesz dostęp do CRM na ograniczony czas, by audytor „sam zrzucił dane”",
    ],
    correctIndex: 1,
    correctAnswer:
      "Weryfikujesz tożsamość i kanał zgodnie z procedurą SOC / compliance — nie publikujesz danych losowo",
    explanation: "Dane klientów i tajemnica handlowa wymagają kontrolowanego ujawniania.",
    consequenceCorrect: "Ścieżka whitelista + log dostępu.",
    consequenceWrong: "Wyciek danych lub phishing udany.",
    topic: "Wykonanie i konflikty",
    difficulty: "hard",
  },
  {
    id: "reg-45",
    question:
      "Manager każe ukryć przed klientem błąd w notowaniu, który zepsuł SL. Najlepsza postawa pracownika:",
    options: [
      "Ukrywasz zgodnie z poleceniem",
      "Odmowa + zgłoszenie przez kanał compliance / whistleblowing wewnętrzny",
      "Gaszenie po cichu bonusem",
      "Obwiniasz klienta",
    ],
    correctIndex: 1,
    correctAnswer: "Odmowa + zgłoszenie przez kanał compliance / whistleblowing wewnętrzny",
    explanation: "Celowe wprowadzanie klienta w błąd jest niedopuszczalne; hierarchia nie zwalnia z prawa.",
    consequenceCorrect: "Korekta, rekompensata zgodnie z polityką, ślad audytowy.",
    consequenceWrong: "Powtarzalny wzorzec ukrywania błędów — kara zbiorowa dla firmy.",
    topic: "Wykonanie i konflikty",
    difficulty: "hard",
  },
  {
    id: "reg-46",
    question:
      "Oddział sprzedaży dostaje wyższą premię za liczbę nowych kont niż za poprawność procesu KYC. Efekt uboczny:",
    options: [
      "Zdrowa konkurencja",
      "Motywacja do pośpiechu i obejść KYC — konflikt interesów wewnętrzny",
      "Lepsza jakość dokumentów",
      "Niższy churn",
    ],
    correctIndex: 1,
    correctAnswer:
      "Motywacja do pośpiechu i obejść KYC — konflikt interesów wewnętrzny",
    explanation: "Schematy premiowe muszą nagradzać zgodność, nie tylko wolumen.",
    consequenceCorrect: "Balans KPI: jakość + liczba + audyt próbek.",
    consequenceWrong: "Konta shell i późniejsze blokady.",
    topic: "Wykonanie i konflikty",
    difficulty: "medium",
  },
  {
    id: "reg-47",
    question:
      "Klient pyta, czy firma jest „po jego stronie” przy konflikcie z LP. Prawidłowa komunikacja:",
    options: [
      "„Zawsze po twojej stronie przeciwko wszystkim”",
      "Jasno: obowiązki wynikają z umowy i regulacji; nie obiecujesz lojalności sprzecznej z modelem brokera",
      "„Jesteśmy neutralni” bez wyjaśnienia",
      "Obiecujesz pozew przeciwko LP",
    ],
    correctIndex: 1,
    correctAnswer:
      "Jasno: obowiązki wynikają z umowy i regulacji; nie obiecujesz lojalności sprzecznej z modelem brokera",
    explanation: "Uczciwość relacji to precyzyjny opis roli firmy, nie slogan.",
    consequenceCorrect: "Krótki opis modelu counterparty / STP zgodnie z faktami.",
    consequenceWrong: "Fałszywe poczucie „adwokata” przy konflikcie interesów.",
    topic: "Wykonanie i konflikty",
    difficulty: "medium",
  },
  {
    id: "reg-48",
    question:
      "Raportowanie transakcji do nadzoru (tam gdzie jest wymagane) systematycznie spóźnia się o wiele dni z powodu przeciążenia zespołu i braku priorytetu. Ryzyko:",
    options: [
      "Ograniczone do wewnętrznych wskaźników operacyjnych",
      "Naruszenie obowiązków regulacyjnych z możliwą karą, postępowaniem i negatywnym sygnałem governance",
      "Niskie, bo opóźnienia są powszechne w branży",
      "Możliwe do skompensowania jednorazowym „nadganianiem” bez formalnego planu",
    ],
    correctIndex: 1,
    correctAnswer:
      "Naruszenie obowiązków regulacyjnych z karą dla firmy i wizerunkiem złego governance",
    explanation: "Reporting to nie papierologia — to warunek działania na rynku regulowanym.",
    consequenceCorrect: "Automatyzacja + alerty SLA.",
    consequenceWrong: "Kary, ograniczenia licencji, utrata zaufania partnerów.",
    topic: "Wykonanie i konflikty",
    difficulty: "medium",
  },

  // --- 5. marketing-i-obietnice (reg-49 … reg-60) ---
  {
    id: "reg-49",
    question:
      "Reklama podaje „średni zysk klientów 18% miesięcznie” bez metodologii, próby, okresu i definicji „zysku”. To jest:",
    options: [
      "Silny materiał dowodowy social proof przy odpowiedzialnej komunikacji",
      "Wysokie ryzyko wprowadzające — takie liczby wymagają pełnego kontekstu i metody albo nie powinny być używane",
      "Akceptowalne przy standardowym disclaimerze „wyniki w przeszłości…”",
      "Typowe dla branży, więc trudne do zakwestionowania",
    ],
    correctIndex: 1,
    correctAnswer:
      "Wysokie ryzyko wprowadzające — takie liczby wymagają dowodu i kontekstu albo nie mogą padać",
    explanation: "Średnie zyski bez metody to statystyka pozorna — łatwo manipulować próbą.",
    consequenceCorrect: "Albo pełna metodologia + disclaimer, albo rezygnacja z liczby.",
    consequenceWrong: "Klient wierzy w stały dochód — potem roszczenia.",
    topic: "Marketing",
    difficulty: "hard",
  },
  {
    id: "reg-50",
    question:
      "Strona marketingowa prezentuje wyłącznie pozytywne opinie klientów, bez kontekstu ryzyka utraty kapitału typowego dla CFD u detalu. Problem:",
    options: [
      "Opinie pozytywne są skuteczniejsze w konwersji niż ostrzeżenia",
      "Selekcja świadectw bez równoważnego kontekstu ryzyka może wprowadzać w błąd co do typowych wyników",
      "Testimonials są traktowane jako obiektywne oświadczenia statystyczne",
      "Wystarczy zgoda autora cytatu na publikację",
    ],
    correctIndex: 1,
    correctAnswer:
      "Selekcja świadectw bez równoważnego kontekstu ryzyka — wprowadzająca",
    explanation: "Social proof musi współistnieć z prawdą o ryzyku utraty kapitału.",
    consequenceCorrect: "Obok opinii — standardowe ostrzeżenie o ryzyku.",
    consequenceWrong: "Wrażenie, że „wszyscy zarabiają”.",
    topic: "Marketing",
    difficulty: "medium",
  },
  {
    id: "reg-51",
    question:
      "Bonus „bez ryzyka” warunkowany obrotem 50× depozytu w 7 dni. To jest typowo:",
    options: [
      "Prawdziwie bez ryzyka",
      "Ukryte ryzyko warunków — nazwa wprowadza w błąd względem realnej trudności",
      "Standardowy prezent lojalnościowy",
      "Zgodne z KID",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ukryte ryzyko warunków — nazwa wprowadza w błąd względem realnej trudności",
    explanation: "Warunki obrotu mogą zmusić do nadmiernego ryzyka — muszą być czytelne obok słowa „bonus”.",
    consequenceCorrect: "Prosty kalkulator „co muszę zrobić, żeby wypłacić”.",
    consequenceWrong: "Klient czuje się oszukany warunkami.",
    topic: "Marketing",
    difficulty: "hard",
  },
  {
    id: "reg-52",
    question:
      "Post influencera: „Link w bio — mój kod daje przewagę”. Brak informacji, że dostaje prowizję. To jest:",
    options: [
      "Autentyczna rekomendacja",
      "Brak jawności relacji komercyjnej — do naprawy przed publikacją",
      "Dozwolone dla mikro-influencerów",
      "Tylko problem platformy social",
    ],
    correctIndex: 1,
    correctAnswer:
      "Brak jawności relacji komercyjnej — do naprawy przed publikacją",
    explanation: "Ukryta reklama finansowych usług jest wysokim ryzykiem compliance.",
    consequenceCorrect: "Oznaczenie współpracy + zatwierdzony skrypt.",
    consequenceWrong: "Interwencja regulatora u brokerów i u twórcy.",
    topic: "Marketing",
    difficulty: "hard",
  },
  {
    id: "reg-53",
    question:
      "„Gwarantowany stop loss” reklamowany bez kosztu szerszego spreadu / opłaty i limitów przy gapiach. To jest:",
    options: [
      "Czysty produkt ochronny",
      "Ryzyko obietnicy bez pełnego opisu ograniczeń — musisz ujawnić warunki i koszt",
      "Zawsze darmowe",
      "Prawda przy każdym brokerze",
    ],
    correctIndex: 1,
    correctAnswer:
      "Ryzyko obietnicy bez pełnego opisu ograniczeń — musisz ujawnić warunki i koszt",
    explanation: "Ochrona bywa płatna i nie działa przy ekstremalnych lukach — klient musi to usłyszeć.",
    consequenceCorrect: "Tabela: kiedy działa, kiedy nie, ile kosztuje.",
    consequenceWrong: "„Obiecano stop, a zlukowało” — spór.",
    topic: "Marketing",
    difficulty: "medium",
  },
  {
    id: "reg-54",
    question:
      "Strona rejestracji pokazuje licznik „zostały 2 wolne miejsca”, który co godzinę wraca do tej samej wartości. To jest:",
    options: [
      "Technika UX zwiększająca konwersję, powszechnie stosowana w e-commerce",
      "Sztuczna rzadkość wprowadzająca w błąd — wysokie ryzyko w komunikacji usług finansowych",
      "Dopuszczalne, jeśli w danym dniu faktycznie sprzedano już część limitu",
      "Problem wyłącznie wizerunkowy, bez znaczenia dla compliance",
    ],
    correctIndex: 1,
    correctAnswer:
      "Sztuczna rzadkość wprowadzająca w błąd — wysokie ryzyko naruszenia uczciwości handlowej",
    explanation: "Fałszywy scarcity przy usługach finansowych bywa traktowany jako nieuczciwa praktyka.",
    consequenceCorrect: "Prawdziwe limity albo rezygnacja z licznika.",
    consequenceWrong: "Dowód manipulacji przy skardze zbiorowej.",
    topic: "Marketing",
    difficulty: "hard",
  },
  {
    id: "reg-55",
    question:
      "Porównanie: „Nasz spread 2× lepszy niż u X” bez daty pomiaru i instrumentu. To jest:",
    options: [
      "Dozwolona superlatywa",
      "Porównanie bez kontekstu — może być wprowadzające; potrzebne uściślenie lub dowód",
      "Prawda jeśli ktoś tak powiedział",
      "Tylko problem marki X",
    ],
    correctIndex: 1,
    correctAnswer:
      "Porównanie bez kontekstu — może być wprowadzające; potrzebne uściślenie lub dowód",
    explanation: "Porównania konkurencyjne wymagają metody i aktualności.",
    consequenceCorrect: "Stopka: instrument, czas, źródło danych.",
    consequenceWrong: "Konkurent pozwie lub regulator zwróci uwagę.",
    topic: "Marketing",
    difficulty: "medium",
  },
  {
    id: "reg-56",
    question:
      "Newsletter sygnałowy wysyła jasne wezwanie „kup teraz złoto” bez statusu doradztwa inwestycyjnego i bez równoważnego ostrzeżenia o ryzyku przy CTA. To jest:",
    options: [
      "Treść edukacyjna, bo dotyczy szeroko notowanego instrumentu",
      "Wezwanie do konkretnej transakcji — wymaga ram prawnych jak przy rekomendacji lub promocji instrumentu",
      "Neutralne przy wysyłce do listy subskrybentów, którzy sami się zapisali",
      "Kwestia wyłącznie filtrów antyspamowych, nie treści merytorycznej",
    ],
    correctIndex: 1,
    correctAnswer:
      "Personalizowana zachęta do transakcji — wymaga ram prawnych jak dla rekomendacji / promocji instrumentu",
    explanation: "„Kup teraz” to nie opis wykresu — to wezwanie do działania na rynku.",
    consequenceCorrect: "Albo ogólna analiza bez CTA, albo pełna zgodność z uprawnieniami.",
    consequenceWrong: "Nielegalne doradztwo lub fałszywe poczucie pewności.",
    topic: "Marketing",
    difficulty: "hard",
  },
  {
    id: "reg-57",
    question:
      "Kopiowanie strategii reklamowane jako „pasywny dochód bez wysiłku”. To jest:",
    options: [
      "Dokładny opis copy tradingu",
      "Obietnica dochodu bez wysiłku przy ryzyku spekulacji — wprowadzająca",
      "Zgodne z KID",
      "OK jeśli jest mała ikonka ryzyka",
    ],
    correctIndex: 1,
    correctAnswer:
      "Obietnica dochodu bez wysiłku przy ryzyku spekulacji — wprowadzająca",
    explanation: "Copy trading nadal niesie ryzyko strat i wymaga monitorowania — nie jest „pensją”.",
    consequenceCorrect: "Język: możliwość zysku i ryzyka straty, brak obietnic stałego dochodu.",
    consequenceWrong: "Klient traktuje to jak lokatę — potem roszczenia.",
    topic: "Marketing",
    difficulty: "hard",
  },
  {
    id: "reg-58",
    question:
      "Kampania e-mailowa pozyskania konta używa tematu sugerującego oficjalne rozliczenie lub dokument urzędowy („Odbierz rozliczenie zysku”), podczas gdy treść to oferta brokera. Ocena:",
    options: [
      "Dopuszczalna jako test konwersji, jeśli treść maila jest zgodna z prawdą",
      "Wprowadzająca — podszywanie się pod oficjalność w celu otwarcia wiadomości to wysokie ryzyko compliance",
      "Neutralna, bo odbiorca i tak pozna prawdziwego nadawcę po otwarciu",
      "Kwestia wyłącznie estetyki szablonu, bez znaczenia prawnego",
    ],
    correctIndex: 1,
    correctAnswer:
      "Wprowadzający tytuł sugerujący dokument urzędowy — wysokie ryzyko uznania za nieuczciwą praktykę",
    explanation: "Podszywanie się pod „oficjalność” w celu kliknięcia jest toksyczne compliance.",
    consequenceCorrect: "Jasny nadawca i temat bez fałszywej pilności urzędowej.",
    consequenceWrong: "Zgłoszenia phishing / misleading advertising.",
    topic: "Marketing",
    difficulty: "hard",
  },
  {
    id: "reg-59",
    question:
      "Landing page kładzie nacisk na „zero prowizji”, podczas gdy w stopce drobnym drukiem opisano opłaty finansowania, istotne dla swing tradera. Co poprawić w komunikacji?",
    options: [
      "Powiększyć hasło o zerowej prowizji, by przebić się przez szum rynkowy",
      "Obok głównej obietnicy wyraźnie pokazać inne koszty istotne dla typowego stylu handlu (np. utrzymanie pozycji)",
      "Przenieść informację o finansowaniu wyłącznie do regulaminu bez sygnału na stronie",
      "Skrócić treść strony, by użytkownik szybciej przechodził do rejestracji",
    ],
    correctIndex: 1,
    correctAnswer:
      "Obok głównej obietnicy widocznie: inne koszty, które mogą być istotne dla stylu handlu",
    explanation: "„Zero prowizji” nie może sugerować braku kosztów, jeśli carry jest realny.",
    consequenceCorrect: "Transparentny blok kosztów dla typowych stylów (dzień vs tydzień).",
    consequenceWrong: "Poczucie „darmowego lunchu”.",
    topic: "Marketing",
    difficulty: "medium",
  },
  {
    id: "reg-60",
    question:
      "Marketing proponuje stały znak „Zatwierdzone przez compliance” przy każdym poście w mediach społecznościowych, bez faktycznego przeglądu treści przez compliance. Ty:",
    options: [
      "Akceptujesz, by przyspieszyć publikację i budować zaufanie",
      "Odmawiasz — oznaczenie musi odzwierciedlać realny proces zatwierdzania, inaczej wprowadza w błąd",
      "Ograniczasz badge wyłącznie do konta zarządu",
      "Uznajesz, że social media są poza zakresem przeglądu compliance",
    ],
    correctIndex: 1,
    correctAnswer:
      "Odmawiasz — znak musi odpowiadać faktycznej procedurze zatwierdzania treści",
    explanation: "Fałszywa pieczęć zaufania to agresywne naruszenie uczciwości.",
    consequenceCorrect: "Workflow: wersja → review → publikacja z logiem.",
    consequenceWrong: "„Compliance widnieje, a nikt nie czytał” — kara i wycofanie zaufania.",
    topic: "Marketing",
    difficulty: "hard",
  },
];
