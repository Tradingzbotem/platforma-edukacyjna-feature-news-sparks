import type { DemoQuestion } from '@/components/DemoQuiz';

export const title = 'Demo quiz: podstawy FX/CFD';

export const questions: DemoQuestion[] = [
  { id: 'q1', question: 'CFD to…', options: ['Cash Flow Derivative', 'Contract for Difference', 'Central Fund Deposit', 'Credit Fix Derivative'], correctIndex: 1 },
  { id: 'q2', question: 'Spread to…', options: ['Różnica ask-bid', 'Prowizja brokera', 'Koszt overnight', 'Poślizg cenowy'], correctIndex: 0 },
  { id: 'q3', question: 'Dźwignia 1:30 oznacza depozyt ok.…', options: ['30%', '10%', '3,33%', '1%'], correctIndex: 2 },
  { id: 'q4', question: 'XAUUSD oznacza…', options: ['Srebro/USD', 'Złoto/USD', 'Ropa/USD', 'Indeks/USA'], correctIndex: 1 },
  { id: 'q5', question: 'Buy Limit aktywuje się, gdy cena…', options: ['spadnie do poziomu', 'wzrośnie do poziomu', 'przekroczy ATR', 'osiągnie nowy high'], correctIndex: 0 },
  { id: 'q6', question: 'Swap/financing to…', options: ['Opłata za dane', 'Koszt utrzymania pozycji nocą', 'Prowizja stała', 'Różnica equity-balance'], correctIndex: 1 },
  { id: 'q7', question: 'Slippage to…', options: ['Różnica oczekiwana vs realizacja ceny', 'Dodatkowy spread', 'Rabat prowizyjny', 'Brak płynności'], correctIndex: 0 },
  { id: 'q8', question: 'Stop-loss służy do…', options: ['Maksymalizacji zysku', 'Ograniczania ryzyka', 'Zwiększania dźwigni', 'Ominięcia swapu'], correctIndex: 1 },
  { id: 'q9', question: 'US100 to zwyczajowo…', options: ['S&P 500', 'Dow Jones', 'Nasdaq-100', 'Russell 2000'], correctIndex: 2 },
  { id: 'q10', question: 'R:R 1:2 oznacza…', options: ['ryzyko 2, zysk 1', 'ryzyko 1, zysk 2', 'bez ryzyka', 'zysk pewny'], correctIndex: 1 },
];
