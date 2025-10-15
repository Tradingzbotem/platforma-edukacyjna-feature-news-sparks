// data/quizzes/knf.ts
export const title = 'KNF (PL) — wiedza regulacyjna';

export const questions = [
  {
    id: 'knf-01',
    question: 'Czym jest test adekwatności (appropriateness) w MiFID II?',
    options: [
      'Sprawdza, czy produkt pasuje do celów i sytuacji klienta',
      'Ocena wiedzy/ doświadczenia klienta dla produktów nieobjętych doradztwem',
      'Badanie zdolności kredytowej klienta',
      'Test ryzyka operacyjnego w firmie inwestycyjnej',
    ],
    correctIndex: 1,
    explanation:
      'Test adekwatności ocenia wiedzę i doświadczenie klienta dla usług bez doradztwa, aby ostrzec przy produktach złożonych.',
  },
  {
    id: 'knf-02',
    question: 'Dokument KID/KIID służy głównie do:',
    options: [
      'Raportowania transakcji do KNF',
      'Przedstawienia kluczowych informacji o produkcie klientowi',
      'Wyliczania depozytu zabezpieczającego',
      'Weryfikacji tożsamości klienta',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-03',
    question: 'Zasada best execution oznacza, że firma inwestycyjna powinna:',
    options: [
      'Realizować zlecenia zawsze po cenie rynkowej z GPW',
      'Utrzymywać najniższe koszty stałe',
      'Podejmować wszelkie uzasadnione działania dla najlepszego wyniku zlecenia',
      'Zawsze wykonywać zlecenia z natychmiastowym wypełnieniem',
    ],
    correctIndex: 2,
  },
  {
    id: 'knf-04',
    question: 'Który z poniższych produktów jest zazwyczaj uznawany za złożony w rozumieniu MiFID II?',
    options: ['Akcje blue-chip', 'ETF UCITS plain-vanilla', 'CFD na indeks', 'Obligacje skarbowe'],
    correctIndex: 2,
  },
  {
    id: 'knf-05',
    question: 'Kategoryzacja klientów obejmuje następujące grupy:',
    options: [
      'Detaliczny, profesjonalny, uprawniony kontrahent',
      'Nowy, stały, VIP',
      'Standard, premium, private',
      'Klient ryzyka A, B, C',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-06',
    question: 'Jaki jest cel polityki konfliktów interesów?',
    options: [
      'Minimalizacja kosztów działalności',
      'Zapobieganie sytuacjom, w których interes firmy/ pracowników koliduje z interesem klienta',
      'Zapewnienie najlepszych cen transakcyjnych',
      'Uproszczenie dokumentacji KYC',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-07',
    question: 'Kiedy należy przekazać klientowi informacje o kosztach i opłatach?',
    options: [
      'Wyłącznie po zawarciu umowy',
      'Przed świadczeniem usługi i regularnie w raportach okresowych',
      'Tylko przy pierwszej transakcji',
      'Nie ma takiego obowiązku',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-08',
    question: 'Które oświadczenie o ryzykach jest typowe dla CFD?',
    options: [
      'Brak ryzyka utraty kapitału',
      'Dźwignia finansowa może spotęgować zyski i straty',
      'Gwarantowany zysk roczny',
      'CFD są przeznaczone wyłącznie dla klientów profesjonalnych',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-09',
    question: 'Zgodnie z wymogami AML/KYC, firma inwestycyjna powinna przede wszystkim:',
    options: [
      'Weryfikować tożsamość i beneficjenta rzeczywistego',
      'Zapewnić stałą dostępność platformy 24/7',
      'Oferować rachunki demonstracyjne',
      'Składać raporty kwartalne do GPW',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-10',
    question: 'Czym jest raportowanie transakcji (transaction reporting)?',
    options: [
      'Przekazywanie KNF szczegółów transakcji w instrumentach finansowych',
      'Przesyłanie klientom potwierdzeń realizacji zleceń',
      'Raport zysków i strat klienta',
      'Sprawozdanie finansowe spółki publicznej',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-11',
    question: 'Klient detaliczny ma zazwyczaj:',
    options: [
      'Najniższy poziom ochrony',
      'Taki sam poziom ochrony jak profesjonalny',
      'Najwyższy poziom ochrony regulacyjnej',
      'Brak prawa do informacji o ryzykach',
    ],
    correctIndex: 2,
  },
  {
    id: 'knf-12',
    question: 'Materiały marketingowe powinny być:',
    options: [
      'Zawsze krótsze niż jedna strona',
      'Rzetelne, jasne i niewprowadzające w błąd',
      'Wyłącznie w języku polskim',
      'Zatwierdzane przez KNF przed publikacją',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-13',
    question: 'Kiedy firma może pobierać zachęty (inducements)?',
    options: [
      'Zawsze i bez ograniczeń',
      'Nigdy',
      'Jeśli poprawia to jakość usługi dla klienta i nie narusza działania w najlepiej pojętym interesie klienta',
      'Wyłącznie przy klientach profesjonalnych',
    ],
    correctIndex: 2,
  },
  {
    id: 'knf-14',
    question: 'Który dokument klient otrzymuje regularnie po rozpoczęciu współpracy?',
    options: [
      'Wyłącznie potwierdzenia transakcji',
      'Raporty okresowe o kosztach i opłatach oraz o usługach',
      'Sprawozdania finansowe emitentów',
      'Prospekt emisyjny spółek z GPW',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-15',
    question: 'MAR (nadużycia na rynku) dotyczy m.in.:',
    options: [
      'Zawsze wyłącznie rynku towarowego',
      'Wykorzystywania informacji poufnych i manipulacji na rynku',
      'Podwyższania limitów dźwigni',
      'Wyłącznie spółek o kapitalizacji powyżej 1 mld PLN',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-16',
    question: '„Appropriateness warning” to:',
    options: [
      'Ostrzeżenie o braku zgodności produktu z celami inwestycyjnymi',
      'Ostrzeżenie o braku wystarczającej wiedzy/ doświadczenia klienta',
      'Komunikat o przekroczeniu depozytu zabezpieczającego',
      'Komunikat o przerwie technicznej',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-17',
    question: 'Który kanał komunikacji wymaga utrwalania (record keeping) przy przyjmowaniu zleceń?',
    options: ['Telefon i komunikatory elektroniczne', 'Tylko e-mail', 'Tylko papier', 'Żaden'],
    correctIndex: 0,
  },
  {
    id: 'knf-18',
    question: 'Kiedy należy przeprowadzić test odpowiedniości (suitability)?',
    options: [
      'Przy doradztwie inwestycyjnym/zarządzaniu portfelem',
      'Zawsze przy rachunkach demo',
      'Wyłącznie przy klientach profesjonalnych',
      'Nigdy',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-19',
    question: 'Jaki jest cel polityki najlepszego wykonania?',
    options: [
      'Zwiększyć przychody firmy',
      'Zapewnić jak najniższy spread',
      'Uzyskać najlepszy możliwy rezultat realizacji zlecenia, biorąc pod uwagę cenę, koszty, szybkość i prawdopodobieństwo realizacji',
      'Zapewnić zawsze wykonanie zlecenia na GPW',
    ],
    correctIndex: 2,
  },
  {
    id: 'knf-20',
    question: 'Które dane są elementem KYC?',
    options: ['Wskaźnik beta portfela', 'Adres i PESEL/ID, źródło środków', 'Wynik roczny spółki', 'Średni spread brokera'],
    correctIndex: 1,
  },
  {
    id: 'knf-21',
    question: 'Czy klient detaliczny może wnioskować o status profesjonalny?',
    options: ['Tak, po spełnieniu kryteriów i procedury opt-up', 'Nie, to niemożliwe', 'Tylko na 30 dni', 'Tylko dla CFD'],
    correctIndex: 0,
  },
  {
    id: 'knf-22',
    question: '„Product governance” dotyczy w szczególności:',
    options: [
      'Określenia rynku docelowego produktu i kanałów dystrybucji',
      'Wyłącznie ustalania prowizji',
      'Wyboru koloru aplikacji',
      'Backupów systemowych',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-23',
    question: 'Co zwykle zawiera ostrzeżenie o ryzyku dla CFD na stronie głównej?',
    options: [
      'Procent rachunków detalicznych tracących środki',
      'Gwarancję zysku',
      'Zapewnienie o braku poślizgu',
      'Porównanie z lokatą bankową',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-24',
    question: 'Kiedy klient otrzymuje potwierdzenie transakcji?',
    options: [
      'Zwykle nie później niż następnego dnia roboczego po wykonaniu zlecenia',
      'Raz w roku',
      'Wyłącznie na żądanie',
      'Tylko przy akcjach',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-25',
    question: 'Który element nie należy do raportu kosztów i opłat?',
    options: ['Koszty transakcyjne', 'Koszty usług doradczych', 'Prognoza ceny instrumentu', 'Koszt finansowania (swap)'],
    correctIndex: 2,
  },
  {
    id: 'knf-26',
    question: 'Przy realizacji zleceń OTC firma powinna klientowi ujawnić m.in.:',
    options: [
      'Adres zamieszkania pracowników',
      'Miejsca wykonania, politykę best execution i informacje o ryzykach',
      'Wejście do systemu back-office',
      'Pełne dane wszystkich klientów',
    ],
    correctIndex: 1,
  },
];
