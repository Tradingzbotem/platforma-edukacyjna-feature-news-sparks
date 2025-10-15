// Materiał edukacyjny — przykładowe pytania o ryzyku, kosztach i dobrych praktykach.

import type { ExamQuestion } from './przewodnik';

export const title = 'KNF — ryzyko, koszty, dobre praktyki (egz. poglądowy)';

export const questions: ExamQuestion[] = [
  {
    id: 'knf-1',
    question: 'Który koszt może być naliczany za przetrzymanie pozycji przez noc?',
    options: ['Prowizja', 'Spread', 'Swap/financing', 'Slippage'],
    correctIndex: 2,
    explanation: 'Swap/financing = koszt finansowania pozycji overnight.',
  },
  {
    id: 'knf-2',
    question: 'Które z poniższych najlepiej opisuje „apetyt na ryzyko”?',
    options: [
      'Maksymalny dzienny obrót',
      'Preferowaną wielkość pozycji i dopuszczalny drawdown',
      'Wymóg kapitałowy brokera',
      'Limit liczby transakcji w miesiącu',
    ],
    correctIndex: 1,
  },
  {
    id: 'knf-3',
    question: 'Co jest głównym celem testu adekwatności (appropriateness)?',
    options: [
      'Ocena wiedzy i doświadczenia klienta dla produktów/usług bez doradztwa',
      'Ustala dzienny limit zleceń',
      'Wyznacza gwarancję zysku',
      'Weryfikuje ważność dokumentu tożsamości',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-4',
    question: '„Negatywny bilans ochrony klienta” (negative balance protection) oznacza, że:',
    options: [
      'rachunek nie może zejść poniżej zera',
      'zlecenia zawsze realizują się po cenie żądanej',
      'broker gwarantuje stały spread',
      'zwalnia z obowiązku ustawiania SL',
    ],
    correctIndex: 0,
  },
  {
    id: 'knf-5',
    question: 'Co zwykle NIE jest elementem dobrej polityki zarządzania ryzykiem?',
    options: [
      'Stały procent ryzyka na transakcję (np. 0,5–1,0%)',
      'Max. liczba jednoczesnych pozycji',
      'Brak dziennych limitów straty',
      'Ustalony R:R i log zagrań',
    ],
    correctIndex: 2,
  },
  {
    id: 'knf-6',
    question: '„Slippage” to:',
    options: [
      'Różnica między ceną oczekiwaną a realizacji',
      'Prowizja stała naliczana przez brokera',
      'Opłata za dane rynkowe',
      'Różnica między equity a balansem',
    ],
    correctIndex: 0,
  },
];
