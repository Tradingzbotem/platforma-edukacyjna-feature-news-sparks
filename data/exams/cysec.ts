// Materiał edukacyjny — przykładowe pytania compliance/operacyjne (poglądowe).

import type { ExamQuestion } from './przewodnik';

export const title = 'CySEC — praktyka, procesy i ryzyka (egz. poglądowy)';

export const questions: ExamQuestion[] = [
  {
    id: 'cy-1',
    question: 'Które działanie najlepiej wpisuje się w zasadę „best execution”?',
    options: [
      'Realizacja po pierwszej dostępnej cenie',
      'Realizacja z uwzględnieniem ceny, kosztów, szybkości i prawdopodobieństwa wykonania',
      'Realizacja wyłącznie po najniższym spreadzie',
      'Realizacja tylko na jednej liście dostawców płynności',
    ],
    correctIndex: 1,
  },
  {
    id: 'cy-2',
    question: 'Kiedy należy przeprowadzić procedurę KYC?',
    options: [
      'Tylko przy pierwszej wypłacie środków',
      'Tylko gdy klient poprosi',
      'Przy otwarciu rachunku i okresowo/warunkowo później',
      'Nigdy, jeśli klient wpłaca krypto',
    ],
    correctIndex: 2,
  },
  {
    id: 'cy-3',
    question: 'Czym jest „conflict of interest” w firmie inwestycyjnej?',
    options: [
      'Różnica zdań w zespole',
      'Sytuacja, w której interes firmy/osób może kolidować z interesem klienta',
      'Błąd platformy transakcyjnej',
      'Brak płynności u dostawcy',
    ],
    correctIndex: 1,
  },
  {
    id: 'cy-4',
    question: 'Co oznacza „risk warning” dla klientów detalicznych?',
    options: [
      'Informację marketingową',
      'Zastrzeżenie o braku odpowiedzialności prawnej',
      'Ujawnienie statystycznych ryzyk/strat historycznych i natury produktu',
      'Gwarancję maksymalnego zysku',
    ],
    correctIndex: 2,
  },
  {
    id: 'cy-5',
    question: 'Który z poniższych elementów pomaga ograniczyć overtrading?',
    options: [
      'Podnoszenie dźwigni do 1:100',
      'Zwiększanie wielkości pozycji po stracie',
      'Harmonogram sesji + limity dzienne i przerwy',
      'Wyłączanie dziennika transakcyjnego',
    ],
    correctIndex: 2,
  },
  {
    id: 'cy-6',
    question: 'Jaki jest właściwy sposób przechowywania środków klientów (client funds)?',
    options: [
      'Łączenie z kapitałem własnym firmy',
      'Segregacja środków na rachunkach wyodrębnionych',
      'Wypłata dzienna do zera',
      'Depozyt w stablecoinach bez umowy',
    ],
    correctIndex: 1,
  },
];
