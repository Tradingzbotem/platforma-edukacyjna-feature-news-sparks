// Materiał edukacyjny — przykładowy zestaw pytań wprowadzających.

export type ExamQuestion = {
  id: string;
  question: string;
  options: string[];      // możliwe odpowiedzi
  correctIndex: number;   // indeks poprawnej odpowiedzi w options
  explanation?: string;   // wyjaśnienie po sprawdzeniu
};

// Tytuł egzaminu (używany w UI)
export const title = 'Przewodnik — podstawy platformy i rynków';

// Pytania
export const questions: ExamQuestion[] = [
  {
    id: 'pw-1',
    question: 'Co oznacza skrót CFD?',
    options: [
      'Central Fund Deposit',
      'Contract for Difference',
      'Cash Flow Derivative',
      'Credit Fixed Derivative',
    ],
    correctIndex: 1,
    explanation: 'CFD = Contract for Difference (kontrakt na różnicę).',
  },
  {
    id: 'pw-2',
    question: 'Co zwykle oznacza „spread” w oknie zlecenia?',
    options: [
      'Różnicę między prowizją a swapem',
      'Różnicę między kursem kupna (bid) i sprzedaży (ask)',
      'Różnicę między depozytem a marżą wolną',
      'Różnicę między ceną rynkową a zleceniem oczekującym',
    ],
    correctIndex: 1,
    explanation: 'Spread = ask − bid.',
  },
  {
    id: 'pw-3',
    question: 'Dźwignia 1:30 oznacza, że…',
    options: [
      'potrzebujesz 30% wartości pozycji jako depozyt',
      'potrzebujesz ~3,33% wartości pozycji jako depozyt',
      'maksymalna strata to 30% depozytu',
      'pozycję można trzymać tylko 30 minut',
    ],
    correctIndex: 1,
    explanation: 'Przy 1:30 depozyt to 1/30 ≈ 3,33% nominale.',
  },
  {
    id: 'pw-4',
    question: 'Symbol XAUUSD odnosi się do:',
    options: [
      'Ropy naftowej w USD',
      'Srebra w USD',
      'Złota w USD',
      'Indeksu technologicznego w USD',
    ],
    correctIndex: 2,
  },
  {
    id: 'pw-5',
    question: 'Stop-loss służy przede wszystkim do:',
    options: [
      'Zwiększania zysku przez pyramiding',
      'Ograniczania ryzyka/straty na pozycji',
      'Przyspieszenia realizacji zlecenia',
      'Zabezpieczenia przed ujemnym saldem',
    ],
    correctIndex: 1,
  },
  {
    id: 'pw-6',
    question: 'Które stwierdzenie o zleceniach oczekujących jest poprawne?',
    options: [
      'Buy Stop aktywuje się przy spadku ceny do poziomu',
      'Sell Limit aktywuje się przy wzroście ceny do poziomu',
      'Buy Limit aktywuje się przy wzroście ceny do poziomu',
      'Sell Stop aktywuje się tylko w godzinach nocnych',
    ],
    correctIndex: 1,
    explanation: 'Limit — oczekujesz reakcji odrzucenia; Stop — wejście na wybicie.',
  },
];
