// Materiał edukacyjny — egzaminy z przewodnika KNF/ESMA/MiFID
// Wersja 1: Podstawy regulacyjne
// Wersja 2: Ochrona klienta i testy
// Wersja 3: Marketing i compliance

export type ExamQuestion = {
  id: string;
  question: string;
  options: string[];      // możliwe odpowiedzi
  correctIndex: number;   // indeks poprawnej odpowiedzi w options
  explanation?: string;   // wyjaśnienie po sprawdzeniu
  hint?: string;          // opis/podpowiedź do pytania
};

// Wersja 1: Podstawy regulacyjne (20 pytań)
export const questions_v1: ExamQuestion[] = [
  {
    id: 'pw-v1-1',
    question: 'Co bada test adekwatności (appropriateness) w rozumieniu MiFID II?',
    options: [
      'Czy klient rozumie ryzyka danego produktu i ma doświadczenie',
      'Czy klient posiada odpowiedni kapitał i dochód',
      'Czy klient posiada zgodę zarządu na zakup produktu',
      'Czy firma ma licencję KNF/CySEC'
    ],
    correctIndex: 0,
    explanation: 'Test adekwatności sprawdza wiedzę/doświadczenie klienta co do ryzyk i złożoności produktu.'
  },
  {
    id: 'pw-v1-2',
    question: '„Best execution” dotyczy przede wszystkim…',
    options: [
      'polityki marketingowej',
      'najlepszej możliwej realizacji zleceń (cena, szybkość, koszty, prawdop.)',
      'wysokości depozytu zabezpieczającego',
      'tylko instrumentów akcyjnych'
    ],
    correctIndex: 1,
    explanation: 'Best execution oznacza podejmowanie wszelkich uzasadnionych działań dla najlepszego wyniku zlecenia.'
  },
  {
    id: 'pw-v1-3',
    question: 'Który materiał promocyjny narusza zasadę „fair, clear, not misleading”?',
    options: [
      'Zawiera ostrzeżenie o ryzyku i historyczne wyniki z zastrzeżeniami',
      'Obiecuje gwarantowany zysk bez ryzyka',
      'Wyjaśnia koszty i przykład R:R',
      'Odsyła do dokumentów KID/KIID'
    ],
    correctIndex: 1,
    explanation: 'Materiały promocyjne nie mogą obiecywać gwarantowanych zysków ani wprowadzać w błąd.'
  },
  {
    id: 'pw-v1-4',
    question: 'Kiedy powstaje konflikt interesów?',
    options: [
      'Zawsze przy każdej transakcji',
      'Gdy interes firmy/pośrednika może kolidować z interesem klienta',
      'Wyłącznie w kampaniach reklamowych',
      'Tylko w produktach skomplikowanych'
    ],
    correctIndex: 1,
    explanation: 'Konflikt interesów powstaje, gdy interesy firmy mogą wpływać negatywnie na interesy klienta.'
  },
  {
    id: 'pw-v1-5',
    question: 'Jakie informacje powinny znaleźć się w polityce kosztów/opłat?',
    options: [
      'Wyłącznie spread',
      'Wszystkie istotne koszty: prowizje, rollover, finansowanie, kursy przeliczeń',
      'Wyłącznie koszty depozytu',
      'Nie trzeba ujawniać kosztów w CFD'
    ],
    correctIndex: 1,
    explanation: 'Polityka kosztów musi ujawniać wszystkie istotne koszty związane z produktem i usługą.'
  },
  {
    id: 'pw-v1-6',
    question: 'ESMA – przykładowe limity dźwigni dla klienta detalicznego:',
    options: [
      'FX majors 1:30; złoto/„duże” indeksy 1:20; akcje 1:5; krypto 1:2',
      'FX majors 1:500 i wyżej dla wszystkich',
      'Akcje 1:50, FX 1:2',
      'Brak limitów – pełna dowolność'
    ],
    correctIndex: 0,
    explanation: 'ESMA wprowadziła limity dźwigni dla różnych kategorii instrumentów w celu ochrony klientów detalicznych.'
  },
  {
    id: 'pw-v1-7',
    question: 'Który test sprawdza, czy produkt (np. CFD) jest zrozumiały dla klienta?',
    options: [
      'Suitability (odpowiedniość)',
      'Appropriateness (adekwatność)',
      'Stress test',
      'Kategoryzacja (opt-up)'
    ],
    correctIndex: 1,
    explanation: 'Appropriateness dotyczy zrozumienia produktu – wymagany m.in. dla złożonych instrumentów jak CFD.'
  },
  {
    id: 'pw-v1-8',
    question: 'Co NIE jest elementem best execution?',
    options: [
      'Cena',
      'Szybkość',
      'Prawdopodobieństwo realizacji',
      'Kolor interfejsu platformy'
    ],
    correctIndex: 3,
    explanation: 'Best execution bierze pod uwagę cenę, koszty, szybkość i prawdopodobieństwo realizacji.'
  },
  {
    id: 'pw-v1-9',
    question: 'Który dokument zawiera kluczowe info o produkcie, ryzykach i kosztach?',
    options: [
      'KID/KIID',
      'FATCA',
      'LEI',
      'MAR'
    ],
    correctIndex: 0,
    explanation: 'KID (Key Information Document) i KIID (Key Investor Information Document) zawierają kluczowe informacje o produkcie.'
  },
  {
    id: 'pw-v1-10',
    question: 'Która kategoria klienta ma najwyższą ochronę regulacyjną?',
    options: [
      'Uprawniony kontrahent',
      'Profesjonalny',
      'Detaliczny',
      'Wszyscy taką samą'
    ],
    correctIndex: 2,
    explanation: 'Klienci detaliczni mają najwyższą ochronę regulacyjną zgodnie z MiFID II.'
  },
  {
    id: 'pw-v1-11',
    question: 'Inducements (zachęty) są dopuszczalne, jeśli…',
    options: [
      'Zawsze, bez ograniczeń',
      'Poprawiają jakość usługi i nie godzą w interes klienta',
      'Tylko dla klientów pro',
      'Nigdy'
    ],
    correctIndex: 1,
    explanation: 'Zachęty są dopuszczalne tylko jeśli poprawiają jakość usługi i nie godzą w interes klienta.'
  },
  {
    id: 'pw-v1-12',
    question: 'Co obejmuje polityka konfliktów interesów?',
    options: [
      'Identyfikację, ograniczanie, ujawnienia',
      'Wyłącznie publikacje marketingowe',
      'Wyłącznie politykę AML',
      'Wyłącznie kwestie IT'
    ],
    correctIndex: 0,
    explanation: 'Polityka konfliktów interesów obejmuje identyfikację, ograniczanie i ujawnianie konfliktów.'
  },
  {
    id: 'pw-v1-13',
    question: 'Kto wydaje wytyczne dot. CFD w UE?',
    options: [
      'ECB',
      'EBA',
      'ESMA',
      'EIOPA'
    ],
    correctIndex: 2,
    explanation: 'ESMA (European Securities and Markets Authority) wydaje wytyczne dotyczące CFD w UE.'
  },
  {
    id: 'pw-v1-14',
    question: 'Ex-ante koszty to…',
    options: [
      'Koszty rzeczywiste po roku',
      'Szacowane koszty przed transakcją/usługą',
      'Wyłącznie prowizje maklerskie',
      'Tylko spread'
    ],
    correctIndex: 1,
    explanation: 'Ex-ante oznacza koszty szacowane przed transakcją lub usługą.'
  },
  {
    id: 'pw-v1-15',
    question: 'Target market (TM) to…',
    options: [
      'Segment klientów wynikający z marketingu',
      'Rynek docelowy zdefiniowany w governance produktu',
      'Wyłącznie geografia',
      'Brak związku z MiFID II'
    ],
    correctIndex: 1,
    explanation: 'Target market to rynek docelowy zdefiniowany w ramach governance produktu zgodnie z MiFID II.'
  },
  {
    id: 'pw-v1-16',
    question: 'Który element jest wymagany w reklamach CFD?',
    options: [
      'Gwarancja zysku',
      'Standardowe ostrzeżenie o ryzyku',
      'Obietnica braku strat',
      'Brak wymagań'
    ],
    correctIndex: 1,
    explanation: 'Reklamy CFD muszą zawierać standardowe ostrzeżenie o ryzyku zgodnie z wytycznymi ESMA.'
  },
  {
    id: 'pw-v1-17',
    question: 'Co oznacza „ochrona przed saldem ujemnym”?',
    options: [
      'Broker dopłaca zysk',
      'Klient nie może stracić więcej niż depozyt',
      'Brak swapów',
      'Limit 1:1'
    ],
    correctIndex: 1,
    explanation: 'Ochrona przed saldem ujemnym oznacza, że klient nie może stracić więcej niż zdeponowany kapitał.'
  },
  {
    id: 'pw-v1-18',
    question: 'Kiedy stosuje się test odpowiedniości (suitability)?',
    options: [
      'Zawsze przy CFD',
      'Przy doradztwie/zarządzaniu portfelem',
      'Tylko przy akcjach',
      'Nigdy'
    ],
    correctIndex: 1,
    explanation: 'Test odpowiedniości (suitability) stosuje się przy usługach doradztwa inwestycyjnego i zarządzania portfelem.'
  },
  {
    id: 'pw-v1-19',
    question: 'Kto w PL pełni funkcję nadzoru rynku kapitałowego?',
    options: [
      'NBP',
      'GPW',
      'KNF',
      'KDPW'
    ],
    correctIndex: 2,
    explanation: 'KNF (Komisja Nadzoru Finansowego) pełni funkcję nadzoru rynku kapitałowego w Polsce.'
  },
  {
    id: 'pw-v1-20',
    question: 'Który zapis dotyczy record-keepingu?',
    options: [
      'Brak obowiązków',
      'Nagrywanie rozmów i przechowywanie instrukcji',
      'Tylko e-maile',
      'Wyłącznie nagrania video'
    ],
    correctIndex: 1,
    explanation: 'Record-keeping obejmuje nagrywanie rozmów z klientami i przechowywanie instrukcji zgodnie z MiFID II.'
  }
];

// Wersja 2: Ochrona klienta i testy (20 pytań)
export const questions_v2: ExamQuestion[] = [
  {
    id: 'pw-v2-1',
    question: 'Który test sprawdza, czy produkt (np. CFD) jest zrozumiały dla klienta?',
    options: [
      'Suitability (odpowiedniość)',
      'Appropriateness (adekwatność)',
      'Stress test',
      'Kategoryzacja (opt-up)'
    ],
    correctIndex: 1,
    explanation: 'Appropriateness dotyczy zrozumienia produktu – wymagany m.in. dla złożonych instrumentów jak CFD.'
  },
  {
    id: 'pw-v2-2',
    question: 'Co NIE jest elementem best execution?',
    options: [
      'Cena',
      'Szybkość',
      'Prawdopodobieństwo realizacji',
      'Kolor interfejsu platformy'
    ],
    correctIndex: 3,
    explanation: 'Best execution bierze pod uwagę cenę, koszty, szybkość i prawdopodobieństwo realizacji.'
  },
  {
    id: 'pw-v2-3',
    question: 'Margin close-out wg ESMA dla CFD detalicznych:',
    options: [
      'Gdy margin spadnie do 25%',
      'Gdy equity spadnie do 50% wymaganego depozytu',
      'Na żądanie klienta',
      'Zawsze przy 0%'
    ],
    correctIndex: 1,
    explanation: 'Reguła zamknięcia przy 50% depozytu na poziomie portfela (co najmniej).'
  },
  {
    id: 'pw-v2-4',
    question: 'Która kategoria klienta ma najwyższą ochronę regulacyjną?',
    options: [
      'Uprawniony kontrahent',
      'Profesjonalny',
      'Detaliczny',
      'Wszyscy taką samą'
    ],
    correctIndex: 2,
    explanation: 'Klienci detaliczni mają najwyższą ochronę regulacyjną zgodnie z MiFID II.'
  },
  {
    id: 'pw-v2-5',
    question: 'Kiedy można zakwalifikować klienta detalicznego do pro (opt-up)?',
    options: [
      'Zawsze na żądanie klienta',
      'Gdy spełnia min. 2 z 3 kryteriów: wielkość transakcji, doświadczenie, wiedza',
      'Tylko dla klientów z dużym kapitałem',
      'Nigdy'
    ],
    correctIndex: 1,
    explanation: 'Opt-up wymaga spełnienia minimum 2 z 3 kryteriów kwalifikacyjnych.'
  },
  {
    id: 'pw-v2-6',
    question: 'Co oznacza „negative balance protection”?',
    options: [
      'Broker dopłaca zysk',
      'Klient nie może stracić więcej niż depozyt',
      'Brak swapów',
      'Limit 1:1'
    ],
    correctIndex: 1,
    explanation: 'Ochrona przed saldem ujemnym oznacza, że klient nie może stracić więcej niż zdeponowany kapitał.'
  },
  {
    id: 'pw-v2-7',
    question: 'Kiedy stosuje się test odpowiedniości (suitability)?',
    options: [
      'Zawsze przy CFD',
      'Przy doradztwie/zarządzaniu portfelem',
      'Tylko przy akcjach',
      'Nigdy'
    ],
    correctIndex: 1,
    explanation: 'Test odpowiedniości (suitability) stosuje się przy usługach doradztwa inwestycyjnego i zarządzania portfelem.'
  },
  {
    id: 'pw-v2-8',
    question: 'Który dokument zawiera kluczowe informacje o produkcie, ryzykach i kosztach?',
    options: [
      'KID/KIID',
      'FATCA',
      'LEI',
      'MAR'
    ],
    correctIndex: 0,
    explanation: 'KID (Key Information Document) i KIID (Key Investor Information Document) zawierają kluczowe informacje o produkcie.'
  },
  {
    id: 'pw-v2-9',
    question: 'Limity dźwigni ESMA dla detalicznych: FX majors…',
    options: [
      '1:50',
      '1:30',
      '1:10',
      'Brak limitów'
    ],
    correctIndex: 1,
    explanation: 'FX majors 1:30; złoto/duże indeksy 1:20; inne towary/indeksy 1:10; akcje 1:5; krypto 1:2.'
  },
  {
    id: 'pw-v2-10',
    question: 'Co obejmuje polityka konfliktów interesów?',
    options: [
      'Identyfikację, ograniczanie, ujawnienia',
      'Wyłącznie publikacje marketingowe',
      'Wyłącznie politykę AML',
      'Wyłącznie kwestie IT'
    ],
    correctIndex: 0,
    explanation: 'Polityka konfliktów interesów obejmuje identyfikację, ograniczanie i ujawnianie konfliktów.'
  },
  {
    id: 'pw-v2-11',
    question: 'Który zapis dotyczy record-keepingu?',
    options: [
      'Brak obowiązków',
      'Nagrywanie rozmów i przechowywanie instrukcji',
      'Tylko e-maile',
      'Wyłącznie nagrania video'
    ],
    correctIndex: 1,
    explanation: 'Record-keeping obejmuje nagrywanie rozmów z klientami i przechowywanie instrukcji zgodnie z MiFID II.'
  },
  {
    id: 'pw-v2-12',
    question: 'Ex-post koszty to…',
    options: [
      'Koszty rzeczywiste po roku',
      'Szacowane koszty przed transakcją',
      'Wyłącznie prowizje maklerskie',
      'Tylko spread'
    ],
    correctIndex: 0,
    explanation: 'Ex-post oznacza koszty rzeczywiste po upływie określonego okresu (zwykle rok).'
  },
  {
    id: 'pw-v2-13',
    question: 'Który element jest wymagany w reklamach CFD?',
    options: [
      'Gwarancja zysku',
      'Standardowe ostrzeżenie o ryzyku',
      'Obietnica braku strat',
      'Brak wymagań'
    ],
    correctIndex: 1,
    explanation: 'Reklamy CFD muszą zawierać standardowe ostrzeżenie o ryzyku zgodnie z wytycznymi ESMA.'
  },
  {
    id: 'pw-v2-14',
    question: 'Kto wydaje wytyczne dot. CFD w UE?',
    options: [
      'ECB',
      'EBA',
      'ESMA',
      'EIOPA'
    ],
    correctIndex: 2,
    explanation: 'ESMA (European Securities and Markets Authority) wydaje wytyczne dotyczące CFD w UE.'
  },
  {
    id: 'pw-v2-15',
    question: 'Target market (TM) to…',
    options: [
      'Segment klientów wynikający z marketingu',
      'Rynek docelowy zdefiniowany w governance produktu',
      'Wyłącznie geografia',
      'Brak związku z MiFID II'
    ],
    correctIndex: 1,
    explanation: 'Target market to rynek docelowy zdefiniowany w ramach governance produktu zgodnie z MiFID II.'
  },
  {
    id: 'pw-v2-16',
    question: 'Kiedy powstaje konflikt interesów?',
    options: [
      'Zawsze przy każdej transakcji',
      'Gdy interes firmy/pośrednika może kolidować z interesem klienta',
      'Wyłącznie w kampaniach reklamowych',
      'Tylko w produktach skomplikowanych'
    ],
    correctIndex: 1,
    explanation: 'Konflikt interesów powstaje, gdy interesy firmy mogą wpływać negatywnie na interesy klienta.'
  },
  {
    id: 'pw-v2-17',
    question: 'Inducements (zachęty) są dopuszczalne, jeśli…',
    options: [
      'Zawsze, bez ograniczeń',
      'Poprawiają jakość usługi i nie godzą w interes klienta',
      'Tylko dla klientów pro',
      'Nigdy'
    ],
    correctIndex: 1,
    explanation: 'Zachęty są dopuszczalne tylko jeśli poprawiają jakość usługi i nie godzą w interes klienta.'
  },
  {
    id: 'pw-v2-18',
    question: 'Kto w PL pełni funkcję nadzoru rynku kapitałowego?',
    options: [
      'NBP',
      'GPW',
      'KNF',
      'KDPW'
    ],
    correctIndex: 2,
    explanation: 'KNF (Komisja Nadzoru Finansowego) pełni funkcję nadzoru rynku kapitałowego w Polsce.'
  },
  {
    id: 'pw-v2-19',
    question: 'Jakie informacje powinny znaleźć się w polityce kosztów/opłat?',
    options: [
      'Wyłącznie spread',
      'Wszystkie istotne koszty: prowizje, rollover, finansowanie, kursy przeliczeń',
      'Wyłącznie koszty depozytu',
      'Nie trzeba ujawniać kosztów w CFD'
    ],
    correctIndex: 1,
    explanation: 'Polityka kosztów musi ujawniać wszystkie istotne koszty związane z produktem i usługą.'
  },
  {
    id: 'pw-v2-20',
    question: 'Co bada test adekwatności (appropriateness) w rozumieniu MiFID II?',
    options: [
      'Czy klient rozumie ryzyka danego produktu i ma doświadczenie',
      'Czy klient posiada odpowiedni kapitał i dochód',
      'Czy klient posiada zgodę zarządu na zakup produktu',
      'Czy firma ma licencję KNF/CySEC'
    ],
    correctIndex: 0,
    explanation: 'Test adekwatności sprawdza wiedzę/doświadczenie klienta co do ryzyk i złożoności produktu.'
  }
];

// Wersja 3: Marketing i compliance (20 pytań)
export const questions_v3: ExamQuestion[] = [
  {
    id: 'pw-v3-1',
    question: 'Który materiał promocyjny narusza zasadę „fair, clear, not misleading”?',
    options: [
      'Zawiera ostrzeżenie o ryzyku i historyczne wyniki z zastrzeżeniami',
      'Obiecuje gwarantowany zysk bez ryzyka',
      'Wyjaśnia koszty i przykład R:R',
      'Odsyła do dokumentów KID/KIID'
    ],
    correctIndex: 1,
    explanation: 'Materiały promocyjne nie mogą obiecywać gwarantowanych zysków ani wprowadzać w błąd.'
  },
  {
    id: 'pw-v3-2',
    question: 'Co oznacza „zrównoważony przekaz” w materiałach marketingowych CFD?',
    options: [
      'Tylko pozytywne informacje',
      'Równowaga między możliwościami zysku a ryzykiem strat',
      'Wyłącznie ostrzeżenia',
      'Brak wymagań'
    ],
    correctIndex: 1,
    explanation: 'Zrównoważony przekaz oznacza prezentowanie zarówno możliwości zysku, jak i ryzyka strat.'
  },
  {
    id: 'pw-v3-3',
    question: 'Które stwierdzenie o bonusach jest poprawne?',
    options: [
      'Można obiecywać bonusy bez ograniczeń',
      'Bonusy nie mogą wprowadzać w błąd co do charakteru produktu',
      'Bonusy są zawsze zabronione',
      'Bonusy tylko dla klientów pro'
    ],
    correctIndex: 1,
    explanation: 'Bonusy są dopuszczalne, ale nie mogą wprowadzać w błąd co do charakteru produktu CFD.'
  },
  {
    id: 'pw-v3-4',
    question: 'Kto odpowiada za zgodność materiałów marketingowych z wytycznymi?',
    options: [
      'Tylko dział marketingu',
      'Tylko compliance',
      'Firma jako całość, z nadzorem compliance',
      'Nikt'
    ],
    correctIndex: 2,
    explanation: 'Firma jako całość odpowiada za zgodność, z nadzorem działu compliance.'
  },
  {
    id: 'pw-v3-5',
    question: 'Co musi zawierać standardowe ostrzeżenie o ryzyku w reklamach CFD?',
    options: [
      'Tylko informację o możliwości strat',
      'Informację o % klientów tracących pieniądze',
      'Pełne ostrzeżenie zgodne z wytycznymi ESMA',
      'Brak wymagań'
    ],
    correctIndex: 2,
    explanation: 'Reklamy CFD muszą zawierać pełne standardowe ostrzeżenie zgodne z wytycznymi ESMA.'
  },
  {
    id: 'pw-v3-6',
    question: 'Kiedy należy aktualizować materiały marketingowe?',
    options: [
      'Nigdy',
      'Tylko przy zmianie produktu',
      'Gdy zmieniają się wytyczne lub okoliczności',
      'Tylko raz w roku'
    ],
    correctIndex: 2,
    explanation: 'Materiały marketingowe należy aktualizować gdy zmieniają się wytyczne regulacyjne lub okoliczności.'
  },
  {
    id: 'pw-v3-7',
    question: 'Co oznacza „governance produktu”?',
    options: [
      'Tylko cennik produktu',
      'Proces zarządzania cyklem życia produktu, w tym target market',
      'Wyłącznie marketing',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Governance produktu to proces zarządzania cyklem życia produktu, w tym określenie target market.'
  },
  {
    id: 'pw-v3-8',
    question: 'Które działanie najlepiej wpisuje się w zasadę „best execution”?',
    options: [
      'Realizacja po pierwszej dostępnej cenie',
      'Realizacja z uwzględnieniem ceny, kosztów, szybkości i prawdopodobieństwa wykonania',
      'Realizacja wyłącznie po najniższym spreadzie',
      'Realizacja tylko na jednej liście dostawców płynności'
    ],
    correctIndex: 1,
    explanation: 'Best execution oznacza podejmowanie wszelkich uzasadnionych działań dla najlepszego wyniku zlecenia.'
  },
  {
    id: 'pw-v3-9',
    question: 'Kiedy należy przeprowadzić procedurę KYC?',
    options: [
      'Tylko przy pierwszej wypłacie środków',
      'Tylko gdy klient poprosi',
      'Przy otwarciu rachunku i okresowo/warunkowo później',
      'Nigdy, jeśli klient wpłaca krypto'
    ],
    correctIndex: 2,
    explanation: 'KYC (Know Your Customer) przeprowadza się przy otwarciu rachunku i okresowo/warunkowo później.'
  },
  {
    id: 'pw-v3-10',
    question: 'Czym jest „conflict of interest” w firmie inwestycyjnej?',
    options: [
      'Różnica zdań w zespole',
      'Sytuacja, w której interes firmy/osób może kolidować z interesem klienta',
      'Błąd platformy transakcyjnej',
      'Brak płynności u dostawcy'
    ],
    correctIndex: 1,
    explanation: 'Konflikt interesów to sytuacja, w której interes firmy lub osób może kolidować z interesem klienta.'
  },
  {
    id: 'pw-v3-11',
    question: 'Co oznacza „risk warning” dla klientów detalicznych?',
    options: [
      'Informację marketingową',
      'Zastrzeżenie o braku odpowiedzialności prawnej',
      'Ujawnienie statystycznych ryzyk/strat historycznych i natury produktu',
      'Gwarancję maksymalnego zysku'
    ],
    correctIndex: 2,
    explanation: 'Risk warning to ujawnienie statystycznych ryzyk, strat historycznych i natury produktu.'
  },
  {
    id: 'pw-v3-12',
    question: 'Które stwierdzenie o rejestrze materiałów marketingowych jest poprawne?',
    options: [
      'Nie trzeba prowadzić rejestru',
      'Trzeba prowadzić rejestr i przechowywać materiały',
      'Tylko dla materiałów online',
      'Tylko dla materiałów drukowanych'
    ],
    correctIndex: 1,
    explanation: 'Firma musi prowadzić rejestr materiałów marketingowych i je przechowywać zgodnie z wymogami.'
  },
  {
    id: 'pw-v3-13',
    question: 'Kto monitoruje zgodność przekazu partnerów marketingowych?',
    options: [
      'Tylko partnerzy',
      'Tylko broker',
      'Broker odpowiada za przekaz partnerów',
      'Nikt'
    ],
    correctIndex: 2,
    explanation: 'Broker odpowiada za zgodność przekazu partnerów marketingowych z wytycznymi.'
  },
  {
    id: 'pw-v3-14',
    question: 'Co oznacza „product governance”?',
    options: [
      'Tylko cennik',
      'Zarządzanie cyklem życia produktu, target market, monitoring',
      'Wyłącznie marketing',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Product governance to zarządzanie cyklem życia produktu, określenie target market i monitoring.'
  },
  {
    id: 'pw-v3-15',
    question: 'Które stwierdzenie o outsourcingu jest poprawne?',
    options: [
      'Outsourcing jest zabroniony',
      'Outsourcing wymaga due diligence, SLA i monitorowania',
      'Outsourcing nie wymaga kontroli',
      'Tylko dla małych firm'
    ],
    correctIndex: 1,
    explanation: 'Outsourcing wymaga due diligence, SLA (Service Level Agreement) i ciągłego monitorowania.'
  },
  {
    id: 'pw-v3-16',
    question: 'Co oznacza „cross-border activity”?',
    options: [
      'Tylko handel międzynarodowy',
      'Działalność transgraniczna wymagająca powiadomień',
      'Wyłącznie marketing',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Cross-border activity to działalność transgraniczna wymagająca powiadomień do nadzorców.'
  },
  {
    id: 'pw-v3-17',
    question: 'Które stwierdzenie o skargach klientów jest poprawne?',
    options: [
      'Nie trzeba rejestrować skarg',
      'Trzeba prowadzić rejestr skarg i analizować przyczyny',
      'Tylko skargi pisemne',
      'Tylko skargi telefoniczne'
    ],
    correctIndex: 1,
    explanation: 'Firma musi prowadzić rejestr skarg, analizować przyczyny źródłowe i odpowiadać w terminach.'
  },
  {
    id: 'pw-v3-18',
    question: 'Kto odpowiada za compliance w firmie?',
    options: [
      'Tylko zarząd',
      'Funkcja Compliance, niezależna i raportująca do zarządu',
      'Tylko dział IT',
      'Nikt'
    ],
    correctIndex: 1,
    explanation: 'Funkcja Compliance powinna być niezależna i raportować bezpośrednio do zarządu.'
  },
  {
    id: 'pw-v3-19',
    question: 'Co oznacza „AML/CTF”?',
    options: [
      'Anti-Money Laundering / Counter-Terrorist Financing',
      'Automatic Market Liquidity',
      'Asset Management License',
      'Brak definicji'
    ],
    correctIndex: 0,
    explanation: 'AML/CTF = Anti-Money Laundering (przeciwdziałanie praniu pieniędzy) / Counter-Terrorist Financing (przeciwdziałanie finansowaniu terroryzmu).'
  },
  {
    id: 'pw-v3-20',
    question: 'Które stwierdzenie o raportowaniu do nadzorców jest poprawne?',
    options: [
      'Nie trzeba raportować',
      'Trzeba raportować zgodnie z wymogami (np. transakcje, skargi)',
      'Tylko raz w roku',
      'Tylko w przypadku problemów'
    ],
    correctIndex: 1,
    explanation: 'Firma musi raportować do nadzorców zgodnie z wymogami regulacyjnymi (transakcje, skargi, incydenty).'
  }
];

// Wersja 4: Best Execution i konflikty (20 pytań)
export const questions_v4: ExamQuestion[] = [
  {
    id: 'pw-v4-1',
    question: 'Co oznacza „best execution” w kontekście MiFID II?',
    options: [
      'Tylko najniższa cena',
      'Najlepsza możliwa realizacja zlecenia uwzględniająca cenę, koszty, szybkość, prawdopodobieństwo i rozmiar',
      'Tylko najszybsza realizacja',
      'Tylko najwyższa cena'
    ],
    correctIndex: 1,
    explanation: 'Best execution oznacza podejmowanie wszelkich uzasadnionych działań dla najlepszego wyniku zlecenia, uwzględniając wszystkie istotne czynniki.'
  },
  {
    id: 'pw-v4-2',
    question: 'Które elementy są brane pod uwagę przy ocenie best execution?',
    options: [
      'Tylko cena',
      'Cena, koszty, szybkość, prawdopodobieństwo realizacji, rozmiar',
      'Tylko spread',
      'Tylko prowizja'
    ],
    correctIndex: 1,
    explanation: 'Best execution uwzględnia cenę, koszty, szybkość wykonania, prawdopodobieństwo realizacji i rozliczenia oraz rozmiar zlecenia.'
  },
  {
    id: 'pw-v4-3',
    question: 'Jak często firma musi publikować raport o best execution dla klientów?',
    options: [
      'Raz na miesiąc',
      'Raz na kwartał',
      'Raz na rok',
      'Nigdy'
    ],
    correctIndex: 2,
    explanation: 'Firma musi publikować raport o best execution raz na rok dla klientów detalicznych.'
  },
  {
    id: 'pw-v4-4',
    question: 'Co oznacza RTS 28 w kontekście best execution?',
    options: [
      'Regulacja techniczna dotycząca sprawozdawczości o miejscach realizacji zleceń',
      'Regulacja dotycząca tylko spreadów',
      'Regulacja dotycząca tylko prowizji',
      'Brak związku z best execution'
    ],
    correctIndex: 0,
    explanation: 'RTS 28 to regulacja techniczna dotycząca sprawozdawczości o miejscach realizacji zleceń (venues) w kontekście best execution.'
  },
  {
    id: 'pw-v4-5',
    question: 'Kiedy powstaje konflikt interesów?',
    options: [
      'Zawsze przy każdej transakcji',
      'Gdy interes firmy/pośrednika może kolidować z interesem klienta',
      'Wyłącznie w kampaniach reklamowych',
      'Tylko w produktach skomplikowanych'
    ],
    correctIndex: 1,
    explanation: 'Konflikt interesów powstaje, gdy interesy firmy lub osób w firmie mogą wpływać negatywnie na interesy klienta.'
  },
  {
    id: 'pw-v4-6',
    question: 'Co obejmuje polityka konfliktów interesów?',
    options: [
      'Identyfikację, ograniczanie, ujawnienia',
      'Wyłącznie publikacje marketingowe',
      'Wyłącznie politykę AML',
      'Wyłącznie kwestie IT'
    ],
    correctIndex: 0,
    explanation: 'Polityka konfliktów interesów obejmuje identyfikację, ograniczanie i ujawnianie konfliktów.'
  },
  {
    id: 'pw-v4-7',
    question: 'Które sytuacje mogą powodować konflikt interesów?',
    options: [
      'Market-making przez firmę',
      'Prowizje od dostawców płynności',
      'Powiązania kapitałowe z emitentami',
      'Wszystkie powyższe'
    ],
    correctIndex: 3,
    explanation: 'Konflikty interesów mogą wynikać z market-makingu, prowizji od dostawców płynności, powiązań kapitałowych i innych sytuacji.'
  },
  {
    id: 'pw-v4-8',
    question: 'Co oznacza „Chinese walls” (chiny mury) w kontekście konfliktów interesów?',
    options: [
      'Fizyczne ściany w biurze',
      'Procedury separacji informacji między działami',
      'Tylko polityka marketingowa',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Chinese walls to procedury separacji informacji między działami firmy w celu ograniczenia konfliktów interesów.'
  },
  {
    id: 'pw-v4-9',
    question: 'Kiedy firma musi ujawnić konflikt interesów klientowi?',
    options: [
      'Nigdy',
      'Przed realizacją transakcji lub usługi',
      'Tylko po transakcji',
      'Tylko na żądanie klienta'
    ],
    correctIndex: 1,
    explanation: 'Firma musi ujawnić konflikt interesów klientowi przed realizacją transakcji lub usługi.'
  },
  {
    id: 'pw-v4-10',
    question: 'Co oznacza „inducements” w kontekście konfliktów interesów?',
    options: [
      'Tylko prowizje',
      'Zachęty lub korzyści otrzymywane od stron trzecich',
      'Tylko bonusy',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Inducements to zachęty lub korzyści otrzymywane od stron trzecich, które mogą powodować konflikt interesów.'
  },
  {
    id: 'pw-v4-11',
    question: 'Kiedy inducements są dopuszczalne?',
    options: [
      'Zawsze',
      'Gdy poprawiają jakość usługi i nie godzą w interes klienta',
      'Tylko dla klientów pro',
      'Nigdy'
    ],
    correctIndex: 1,
    explanation: 'Inducements są dopuszczalne tylko jeśli poprawiają jakość usługi i nie godzą w interes klienta.'
  },
  {
    id: 'pw-v4-12',
    question: 'Co oznacza „market-making” w kontekście konfliktów?',
    options: [
      'Tylko handel na rynku',
      'Firma działa jako strona przeciwna do zleceń klientów',
      'Tylko dostarczanie płynności',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Market-making oznacza sytuację, gdy firma działa jako strona przeciwna do zleceń klientów, co może powodować konflikt interesów.'
  },
  {
    id: 'pw-v4-13',
    question: 'Jakie informacje musi zawierać polityka best execution?',
    options: [
      'Tylko cennik',
      'Informacje o miejscach realizacji, kryteriach wyboru, monitoringu',
      'Tylko spread',
      'Brak wymagań'
    ],
    correctIndex: 1,
    explanation: 'Polityka best execution musi zawierać informacje o miejscach realizacji, kryteriach wyboru i procesie monitoringu.'
  },
  {
    id: 'pw-v4-14',
    question: 'Kiedy firma musi aktualizować politykę best execution?',
    options: [
      'Nigdy',
      'Tylko raz w roku',
      'Gdy zmieniają się okoliczności wpływające na realizację zleceń',
      'Tylko na żądanie klienta'
    ],
    correctIndex: 2,
    explanation: 'Firma musi aktualizować politykę best execution gdy zmieniają się okoliczności wpływające na realizację zleceń.'
  },
  {
    id: 'pw-v4-15',
    question: 'Co oznacza „venue” w kontekście best execution?',
    options: [
      'Tylko giełda',
      'Miejsce realizacji zleceń (giełda, MTF, OTF, market maker)',
      'Tylko broker',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Venue to miejsce realizacji zleceń, które może być giełdą, MTF (Multilateral Trading Facility), OTF (Organised Trading Facility) lub market makerem.'
  },
  {
    id: 'pw-v4-16',
    question: 'Które stwierdzenie o konfliktach interesów jest poprawne?',
    options: [
      'Nie trzeba ich identyfikować',
      'Trzeba je identyfikować, ograniczać i ujawniać',
      'Tylko ujawniać',
      'Tylko identyfikować'
    ],
    correctIndex: 1,
    explanation: 'Firma musi identyfikować, ograniczać i ujawniać konflikty interesów zgodnie z wymogami MiFID II.'
  },
  {
    id: 'pw-v4-17',
    question: 'Co oznacza „organisational arrangements” w kontekście konfliktów?',
    options: [
      'Tylko struktura organizacyjna',
      'Procedury organizacyjne mające na celu ograniczenie konfliktów',
      'Tylko polityka HR',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Organisational arrangements to procedury organizacyjne mające na celu ograniczenie konfliktów interesów.'
  },
  {
    id: 'pw-v4-18',
    question: 'Które stwierdzenie o raportowaniu best execution jest poprawne?',
    options: [
      'Nie trzeba raportować',
      'Trzeba raportować klientom detalicznych raz na rok',
      'Tylko dla klientów pro',
      'Tylko na żądanie'
    ],
    correctIndex: 1,
    explanation: 'Firma musi raportować klientom detalicznych o best execution raz na rok zgodnie z RTS 28.'
  },
  {
    id: 'pw-v4-19',
    question: 'Co oznacza „execution policy” w kontekście best execution?',
    options: [
      'Tylko cennik',
      'Dokument określający sposób realizacji zleceń i kryteria wyboru venues',
      'Tylko polityka marketingowa',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Execution policy to dokument określający sposób realizacji zleceń i kryteria wyboru miejsc realizacji (venues).'
  },
  {
    id: 'pw-v4-20',
    question: 'Które stwierdzenie o ujawnianiu konfliktów jest poprawne?',
    options: [
      'Nie trzeba ujawniać',
      'Trzeba ujawnić przed transakcją, jeśli konflikt nie może być ograniczony',
      'Tylko po transakcji',
      'Tylko na żądanie klienta'
    ],
    correctIndex: 1,
    explanation: 'Jeśli konflikt interesów nie może być ograniczony, firma musi ujawnić go klientowi przed realizacją transakcji lub usługi.'
  }
];

// Wersja 5: Materiały + egzamin (20 pytań) - podsumowanie wszystkich modułów
export const questions_v5: ExamQuestion[] = [
  {
    id: 'pw-v5-1',
    question: 'Który dokument zawiera kluczowe informacje o produkcie, ryzykach i kosztach?',
    options: [
      'KID/KIID',
      'FATCA',
      'LEI',
      'MAR'
    ],
    correctIndex: 0,
    explanation: 'KID (Key Information Document) i KIID (Key Investor Information Document) zawierają kluczowe informacje o produkcie.'
  },
  {
    id: 'pw-v5-2',
    question: 'Co bada test adekwatności (appropriateness) w rozumieniu MiFID II?',
    options: [
      'Czy klient rozumie ryzyka danego produktu i ma doświadczenie',
      'Czy klient posiada odpowiedni kapitał i dochód',
      'Czy klient posiada zgodę zarządu na zakup produktu',
      'Czy firma ma licencję KNF/CySEC'
    ],
    correctIndex: 0,
    explanation: 'Test adekwatności sprawdza wiedzę/doświadczenie klienta co do ryzyk i złożoności produktu.'
  },
  {
    id: 'pw-v5-3',
    question: 'Które działanie najlepiej wpisuje się w zasadę „best execution”?',
    options: [
      'Realizacja po pierwszej dostępnej cenie',
      'Realizacja z uwzględnieniem ceny, kosztów, szybkości i prawdopodobieństwa wykonania',
      'Realizacja wyłącznie po najniższym spreadzie',
      'Realizacja tylko na jednej liście dostawców płynności'
    ],
    correctIndex: 1,
    explanation: 'Best execution oznacza podejmowanie wszelkich uzasadnionych działań dla najlepszego wyniku zlecenia.'
  },
  {
    id: 'pw-v5-4',
    question: 'Kiedy powstaje konflikt interesów?',
    options: [
      'Zawsze przy każdej transakcji',
      'Gdy interes firmy/pośrednika może kolidować z interesem klienta',
      'Wyłącznie w kampaniach reklamowych',
      'Tylko w produktach skomplikowanych'
    ],
    correctIndex: 1,
    explanation: 'Konflikt interesów powstaje, gdy interesy firmy mogą wpływać negatywnie na interesy klienta.'
  },
  {
    id: 'pw-v5-5',
    question: 'Który materiał promocyjny narusza zasadę „fair, clear, not misleading”?',
    options: [
      'Zawiera ostrzeżenie o ryzyku i historyczne wyniki z zastrzeżeniami',
      'Obiecuje gwarantowany zysk bez ryzyka',
      'Wyjaśnia koszty i przykład R:R',
      'Odsyła do dokumentów KID/KIID'
    ],
    correctIndex: 1,
    explanation: 'Materiały promocyjne nie mogą obiecywać gwarantowanych zysków ani wprowadzać w błąd.'
  },
  {
    id: 'pw-v5-6',
    question: 'ESMA – przykładowe limity dźwigni dla klienta detalicznego:',
    options: [
      'FX majors 1:30; złoto/„duże” indeksy 1:20; akcje 1:5; krypto 1:2',
      'FX majors 1:500 i wyżej dla wszystkich',
      'Akcje 1:50, FX 1:2',
      'Brak limitów – pełna dowolność'
    ],
    correctIndex: 0,
    explanation: 'ESMA wprowadziła limity dźwigni dla różnych kategorii instrumentów w celu ochrony klientów detalicznych.'
  },
  {
    id: 'pw-v5-7',
    question: 'Która kategoria klienta ma najwyższą ochronę regulacyjną?',
    options: [
      'Uprawniony kontrahent',
      'Profesjonalny',
      'Detaliczny',
      'Wszyscy taką samą'
    ],
    correctIndex: 2,
    explanation: 'Klienci detaliczni mają najwyższą ochronę regulacyjną zgodnie z MiFID II.'
  },
  {
    id: 'pw-v5-8',
    question: 'Co oznacza „ochrona przed saldem ujemnym”?',
    options: [
      'Broker dopłaca zysk',
      'Klient nie może stracić więcej niż depozyt',
      'Brak swapów',
      'Limit 1:1'
    ],
    correctIndex: 1,
    explanation: 'Ochrona przed saldem ujemnym oznacza, że klient nie może stracić więcej niż zdeponowany kapitał.'
  },
  {
    id: 'pw-v5-9',
    question: 'Kiedy stosuje się test odpowiedniości (suitability)?',
    options: [
      'Zawsze przy CFD',
      'Przy doradztwie/zarządzaniu portfelem',
      'Tylko przy akcjach',
      'Nigdy'
    ],
    correctIndex: 1,
    explanation: 'Test odpowiedniości (suitability) stosuje się przy usługach doradztwa inwestycyjnego i zarządzania portfelem.'
  },
  {
    id: 'pw-v5-10',
    question: 'Kto w PL pełni funkcję nadzoru rynku kapitałowego?',
    options: [
      'NBP',
      'GPW',
      'KNF',
      'KDPW'
    ],
    correctIndex: 2,
    explanation: 'KNF (Komisja Nadzoru Finansowego) pełni funkcję nadzoru rynku kapitałowego w Polsce.'
  },
  {
    id: 'pw-v5-11',
    question: 'Który zapis dotyczy record-keepingu?',
    options: [
      'Brak obowiązków',
      'Nagrywanie rozmów i przechowywanie instrukcji',
      'Tylko e-maile',
      'Wyłącznie nagrania video'
    ],
    correctIndex: 1,
    explanation: 'Record-keeping obejmuje nagrywanie rozmów z klientami i przechowywanie instrukcji zgodnie z MiFID II.'
  },
  {
    id: 'pw-v5-12',
    question: 'Jakie informacje powinny znaleźć się w polityce kosztów/opłat?',
    options: [
      'Wyłącznie spread',
      'Wszystkie istotne koszty: prowizje, rollover, finansowanie, kursy przeliczeń',
      'Wyłącznie koszty depozytu',
      'Nie trzeba ujawniać kosztów w CFD'
    ],
    correctIndex: 1,
    explanation: 'Polityka kosztów musi ujawniać wszystkie istotne koszty związane z produktem i usługą.'
  },
  {
    id: 'pw-v5-13',
    question: 'Target market (TM) to…',
    options: [
      'Segment klientów wynikający z marketingu',
      'Rynek docelowy zdefiniowany w governance produktu',
      'Wyłącznie geografia',
      'Brak związku z MiFID II'
    ],
    correctIndex: 1,
    explanation: 'Target market to rynek docelowy zdefiniowany w ramach governance produktu zgodnie z MiFID II.'
  },
  {
    id: 'pw-v5-14',
    question: 'Który element jest wymagany w reklamach CFD?',
    options: [
      'Gwarancja zysku',
      'Standardowe ostrzeżenie o ryzyku',
      'Obietnica braku strat',
      'Brak wymagań'
    ],
    correctIndex: 1,
    explanation: 'Reklamy CFD muszą zawierać standardowe ostrzeżenie o ryzyku zgodnie z wytycznymi ESMA.'
  },
  {
    id: 'pw-v5-15',
    question: 'Kto wydaje wytyczne dot. CFD w UE?',
    options: [
      'ECB',
      'EBA',
      'ESMA',
      'EIOPA'
    ],
    correctIndex: 2,
    explanation: 'ESMA (European Securities and Markets Authority) wydaje wytyczne dotyczące CFD w UE.'
  },
  {
    id: 'pw-v5-16',
    question: 'Ex-ante koszty to…',
    options: [
      'Koszty rzeczywiste po roku',
      'Szacowane koszty przed transakcją/usługą',
      'Wyłącznie prowizje maklerskie',
      'Tylko spread'
    ],
    correctIndex: 1,
    explanation: 'Ex-ante oznacza koszty szacowane przed transakcją lub usługą.'
  },
  {
    id: 'pw-v5-17',
    question: 'Co oznacza „product governance”?',
    options: [
      'Tylko cennik',
      'Zarządzanie cyklem życia produktu, target market, monitoring',
      'Wyłącznie marketing',
      'Brak definicji'
    ],
    correctIndex: 1,
    explanation: 'Product governance to zarządzanie cyklem życia produktu, określenie target market i monitoring.'
  },
  {
    id: 'pw-v5-18',
    question: 'Które stwierdzenie o konfliktach interesów jest poprawne?',
    options: [
      'Nie trzeba ich identyfikować',
      'Trzeba je identyfikować, ograniczać i ujawniać',
      'Tylko ujawniać',
      'Tylko identyfikować'
    ],
    correctIndex: 1,
    explanation: 'Firma musi identyfikować, ograniczać i ujawniać konflikty interesów zgodnie z wymogami MiFID II.'
  },
  {
    id: 'pw-v5-19',
    question: 'Które stwierdzenie o best execution jest poprawne?',
    options: [
      'Nie trzeba prowadzić polityki',
      'Trzeba prowadzić politykę i raportować klientom raz na rok',
      'Tylko dla klientów pro',
      'Tylko na żądanie'
    ],
    correctIndex: 1,
    explanation: 'Firma musi prowadzić politykę best execution i raportować klientom detalicznych raz na rok.'
  },
  {
    id: 'pw-v5-20',
    question: 'Co oznacza „AML/CTF”?',
    options: [
      'Anti-Money Laundering / Counter-Terrorist Financing',
      'Automatic Market Liquidity',
      'Asset Management License',
      'Brak definicji'
    ],
    correctIndex: 0,
    explanation: 'AML/CTF = Anti-Money Laundering (przeciwdziałanie praniu pieniędzy) / Counter-Terrorist Financing (przeciwdziałanie finansowaniu terroryzmu).'
  }
];

// Domyślna wersja (używana gdy nie podano wersji)
export const title = 'Przewodnik KNF/ESMA/MiFID — podstawy regulacyjne';
export const questions = questions_v1;

// Eksport wszystkich wersji
export const versions = {
  v1: { title: 'Przewodnik KNF/ESMA/MiFID — podstawy regulacyjne', questions: questions_v1 },
  v2: { title: 'Przewodnik KNF/ESMA/MiFID — ochrona klienta i testy', questions: questions_v2 },
  v3: { title: 'Przewodnik KNF/ESMA/MiFID — marketing i compliance', questions: questions_v3 },
  v4: { title: 'Przewodnik KNF/ESMA/MiFID — Best Execution i konflikty', questions: questions_v4 },
  v5: { title: 'Przewodnik KNF/ESMA/MiFID — materiały i egzamin', questions: questions_v5 },
};
