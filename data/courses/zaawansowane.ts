import type { Course } from './index';

export const course: Course = {
  slug: 'zaawansowane',
  title: 'Zaawansowane — systemy i algotrading',
  subtitle: 'Edge, statystyka i automatyzacja',
  description:
    'Budowa przewagi statystycznej, testy wsteczne, optymalizacja, psychologia risk-on/off i automatyzacja strategii.',
  lessons: [
    { id: 'adv-01', title: 'Edge i testy A/B strategii',       duration: '12:40' },
    { id: 'adv-02', title: 'Backtest i walk-forward',          duration: '13:05' },
    { id: 'adv-03', title: 'Automatyzacja sygnałów',           duration: '11:15' },
    { id: 'adv-04', title: 'Psychologia i ryzyko portfela',    duration: '09:50' },
  ],
};
