export type Question = {
  id: string;
  q: string;
  answers: string[];
  correct: number;     // index w answers
  explain?: string;
};

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    q: 'Który test sprawdza, czy produkt (np. CFD) jest zrozumiały dla klienta?',
    answers: ['Suitability (odpowiedniość)', 'Appropriateness (adekwatność)', 'Stress test', 'Kategoryzacja (opt-up)'],
    correct: 1,
    explain: 'Appropriateness dotyczy zrozumienia produktu – wymagany m.in. dla złożonych instrumentów jak CFD.'
  },
  {
    id: 'q2',
    q: 'Co NIE jest elementem best execution?',
    answers: ['Cena', 'Szybkość', 'Prawdopodobieństwo realizacji', 'Kolor interfejsu platformy'],
    correct: 3,
    explain: 'BE bierze pod uwagę m.in. cenę, koszty, szybkość i prawdopodobieństwo.'
  },
  {
    id: 'q3',
    q: 'Limity dźwigni ESMA dla detalicznych: FX majors…',
    answers: ['1:50', '1:30', '1:10', 'Brak limitów'],
    correct: 1,
    explain: 'FX majors 1:30; złoto/duże indeksy 1:20; inne towary/indeksy 1:10; akcje 1:5; krypto 1:2.'
  },
  {
    id: 'q4',
    q: 'Margin close-out wg ESMA dla CFD detalicznych:',
    answers: ['Gdy margin spadnie do 25%', 'Gdy equity spadnie do 50% wymaganego depozytu', 'Na żądanie klienta', 'Zawsze przy 0%'],
    correct: 1,
    explain: 'Reguła zamknięcia przy 50% depozytu na poziomie portfela (co najmniej).'
  },
  {
    id: 'q5',
    q: 'Który dokument zawiera kluczowe info o produkcie, ryzykach i kosztach?',
    answers: ['KID/KIID', 'FATCA', 'LEI', 'MAR'],
    correct: 0
  },
  {
    id: 'q6',
    q: 'Która kategoria klienta ma najwyższą ochronę regulacyjną?',
    answers: ['Uprawniony kontrahent', 'Profesjonalny', 'Detaliczny', 'Wszyscy taką samą'],
    correct: 2
  },
  {
    id: 'q7',
    q: 'Inducements (zachęty) są dopuszczalne, jeśli…',
    answers: ['Zawsze, bez ograniczeń', 'Poprawiają jakość usługi i nie godzą w interes klienta', 'Tylko dla klientów pro', 'Nigdy'],
    correct: 1
  },
  {
    id: 'q8',
    q: 'Co obejmuje polityka konfliktów interesów?',
    answers: ['Identyfikację, ograniczanie, ujawnienia', 'Wyłącznie publikacje marketingowe', 'Wyłącznie politykę AML', 'Wyłącznie kwestie IT'],
    correct: 0
  },
  {
    id: 'q9',
    q: 'Kto wydaje wytyczne dot. CFD w UE?',
    answers: ['ECB', 'EBA', 'ESMA', 'EIOPA'],
    correct: 2
  },
  {
    id: 'q10',
    q: 'Ex-ante koszty to…',
    answers: ['Koszty rzeczywiste po roku', 'Szacowane koszty przed transakcją/usługą', 'Wyłącznie prowizje maklerskie', 'Tylko spread'],
    correct: 1
  },
  {
    id: 'q11',
    q: 'Target market (TM) to…',
    answers: ['Segment klientów wynikający z marketingu', 'Rynek docelowy zdefiniowany w governance produktu', 'Wyłącznie geografia', 'Brak związku z MiFID II'],
    correct: 1
  },
  {
    id: 'q12',
    q: 'Który element jest wymagany w reklamach CFD?',
    answers: ['Gwarancja zysku', 'Standardowe ostrzeżenie o ryzyku', 'Obietnica braku strat', 'Brak wymagań'],
    correct: 1
  },
  {
    id: 'q13',
    q: 'Co oznacza „ochrona przed saldem ujemnym”?',
    answers: ['Broker dopłaca zysk', 'Klient nie może stracić więcej niż depozyt', 'Brak swapów', 'Limit 1:1'],
    correct: 1
  },
  {
    id: 'q14',
    q: 'Kiedy stosuje się test odpowiedniości (suitability)?',
    answers: ['Zawsze przy CFD', 'Przy doradztwie/zarządzaniu portfelem', 'Tylko przy akcjach', 'Nigdy'],
    correct: 1
  },
  {
    id: 'q15',
    q: 'Kto w PL pełni funkcję nadzoru rynku kapitałowego?',
    answers: ['NBP', 'GPW', 'KNF', 'KDPW'],
    correct: 2
  },
  {
    id: 'q16',
    q: 'Który zapis dotyczy record-keepingu?',
    answers: ['Brak obowiązków', 'Nagrywanie rozmów i przechowywanie instrukcji', 'Tylko e-maile', 'Wyłącznie nagrania video'],
    correct: 1
  },
  {
    id: 'q17',
    q: 'Kiedy można zakwalifikować klienta detalicznego do pro (opt-up)?',
    answers: ['Gdy tak chce sprzedawca', 'Po spełnieniu min. 2 z 3 kryteriów (wolumen/portfel/doświadczenie)', 'Zawsze na żądanie', 'Nigdy'],
    correct: 1
  },
  {
    id: 'q18',
    q: 'Czego dotyczy polityka best execution?',
    answers: ['Wyłącznie spreadu', 'Najlepszych praktyk HR', 'Zasad realizacji zleceń', 'Wyłącznie AML/KYC'],
    correct: 2
  },
  {
    id: 'q19',
    q: 'Co oznacza marketing „zrównoważony informacyjnie”?',
    answers: ['Akcent wyłącznie korzyści', 'Równoważenie ryzyk i korzyści', 'Brak ostrzeżeń', 'Gwarantowanie wyników'],
    correct: 1
  },
  {
    id: 'q20',
    q: 'KID/KIID zawiera…',
    answers: ['Wyłącznie opłaty transakcyjne', 'Opis produktu, ryzyka, koszty, scenariusze', 'Wyłącznie dane emitenta', 'Wyłącznie sprawozdanie finansowe'],
    correct: 1
  }
];
