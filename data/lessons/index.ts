// data/lessons/index.ts
// 👉 Centralny rejestr treści lekcji + mini-quizów (używany przez /kursy/[course]/lekcje/[id])

export type LessonAccess = 'public' | 'auth' | 'pro';

export type ContentBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; lang?: string; code: string };

export type LessonQuizQ = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type LessonDoc = {
  id: string;                  // np. 'fx-01'
  title: string;               // tytuł lekcji
  access: LessonAccess;        // public | auth | pro
  duration?: string;           // np. "08:30"
  content: ContentBlock[];     // blokowa treść
  quiz?: {
    title: string;
    questions: LessonQuizQ[];
  };
};

export type CourseLessons = Record<string, LessonDoc>;   // key = lessonId
export type LessonsRegistry = Record<string, CourseLessons>; // key = courseSlug

// -------------------------------------------------------------
// LEKCJE: muszą pokrywać się z ID używanymi w data/courses/index.ts
// (fx-01..04, cfd-01..04, adv-01..04)
// -------------------------------------------------------------
export const LESSONS: LessonsRegistry = {
  forex: {
    'fx-01': {
      id: 'fx-01',
      title: 'Wprowadzenie do rynku FX',
      access: 'public',
      duration: '08:30',
      content: [
        { type: 'h2', text: 'Co to jest Forex?' },
        { type: 'p', text: 'Rynek walutowy (FX) to zdecentralizowany rynek wymiany walut. Uczestnicy: banki, fundusze, brokerzy, detaliści.' },
        { type: 'list', items: ['Sesje: azjatycka, europejska, amerykańska', 'Główne pary: EURUSD, GBPUSD, USDJPY, USDCHF', 'Mikrostruktura: bid/ask, order book, płynność'] },
        { type: 'quote', text: 'Największa płynność zwykle wypada przy nakładaniu się sesji EU/US.' },
      ],
      quiz: {
        title: 'Sprawdź podstawy FX (3 pytania)',
        questions: [
          { id: 'q1', question: 'Co to jest spread?', options: ['Różnica ask-bid', 'Opłata overnight', 'Rabat prowizyjny', 'Poślizg'], correctIndex: 0 },
          { id: 'q2', question: 'Która para to „major”?', options: ['EURUSD', 'PLNJPY', 'MXNCHF', 'ZARTRY'], correctIndex: 0 },
          { id: 'q3', question: 'Największa płynność zwykle jest podczas…', options: ['Azji', 'Nakładania EU/US', 'Weekendu', 'Świąt'], correctIndex: 1 },
        ],
      },
    },
    'fx-02': {
      id: 'fx-02',
      title: 'Pary walutowe i kwotowania',
      access: 'public',
      duration: '09:10',
      content: [
        { type: 'h2', text: 'Base / Quote' },
        { type: 'p', text: 'W EURUSD walutą bazową jest EUR, a kwotowaną USD. 1.0845 oznacza ile USD za 1 EUR.' },
        { type: 'h3', text: 'Pip, tick i wartość pipsa' },
        { type: 'list', items: ['EURUSD: 1 pip = 0.0001', 'USDJPY: 1 pip = 0.01', 'Wartość pipsa zależy od wolumenu (lotów) i instrumentu'] },
        { type: 'code', lang: 'txt', code: 'Wartość pipsa ≈ (1 pip / kurs) × nominal × kurs_konta' },
      ],
      quiz: {
        title: 'Pipsy i kwotowania (2 pytania)',
        questions: [
          { id: 'q1', question: 'W EURUSD 1 pip to…', options: ['0.0001', '0.01', '1', '0.1'], correctIndex: 0 },
          { id: 'q2', question: 'Waluta bazowa w EURUSD to…', options: ['USD', 'EUR', 'GBP', 'CHF'], correctIndex: 1 },
        ],
      },
    },
    'fx-03': {
      id: 'fx-03',
      title: 'Dźwignia, margin i ryzyko',
      access: 'auth',
      duration: '11:45',
      content: [
        { type: 'h2', text: 'Dźwignia 1:30' },
        { type: 'p', text: 'Depozyt wymagany ≈ 1/30 ≈ 3.33% nominale. Zarządzanie pozycją jest kluczowe.' },
        { type: 'list', items: ['Ryzykuj stały % kapitału', 'Ustal R:R i trzymaj plan', 'Unikaj overtradingu'] },
      ],
      quiz: {
        title: 'Ryzyko i dźwignia (2 pytania)',
        questions: [
          { id: 'q1', question: '1:30 oznacza depozyt około…', options: ['30%', '3.33%', '0.3%', '13%'], correctIndex: 1 },
          { id: 'q2', question: 'Najlepsza praktyka MM to…', options: ['Stały % ryzyka', 'Brak SL', 'Martingale', 'Losowe wejścia'], correctIndex: 0 },
        ],
      },
    },
    'fx-04': {
      id: 'fx-04',
      title: 'Strategie intraday',
      access: 'pro',
      duration: '12:05',
      content: [
        { type: 'h2', text: 'Wejścia' },
        { type: 'p', text: 'Popularne: wybicia zakresu, pullback po wybiciu, zagrania na newsach (zachowaj ostrożność).' },
        { type: 'quote', text: 'Edge rodzi się z dyscypliny i statystyki – nie z jednego wejścia.' },
      ],
      quiz: {
        title: 'Intraday (2 pytania)',
        questions: [
          { id: 'q1', question: 'Setup „pullback” to…', options: ['Wejście po cofnięciu', 'Wejście na szczycie', 'Losowe wejście', 'Scalping newsów'], correctIndex: 0 },
          { id: 'q2', question: 'Zagrania na newsach…', options: ['Zawsze lepsze', 'Zawsze gorsze', 'Mogą mieć wyższy poślizg i ryzyko', 'Nie wpływają na nic'], correctIndex: 2 },
        ],
      },
    },
  },

  cfd: {
    'cfd-01': {
      id: 'cfd-01',
      title: 'Jak działają CFD?',
      access: 'public',
      duration: '07:55',
      content: [
        { type: 'p', text: 'CFD to kontrakty na różnicę ceny. Pozwalają grać na wzrosty i spadki bez posiadania aktywa.' },
      ],
      quiz: {
        title: 'CFD basics',
        questions: [
          { id: 'q1', question: 'CFD to…', options: ['Akcja', 'Kontrakt na różnicę', 'Opcja', 'ETF'], correctIndex: 1 },
        ],
      },
    },
    'cfd-02': {
      id: 'cfd-02',
      title: 'Koszty i overnight',
      access: 'auth',
      duration: '06:40',
      content: [
        { type: 'list', items: ['Spread', 'Prowizja', 'Swap/financing (overnight)'] },
      ],
      quiz: {
        title: 'Koszty',
        questions: [
          { id: 'q1', question: 'Swap to…', options: ['Opłata za dane', 'Koszt finansowania pozycji', 'Rabat', 'Spread stały'], correctIndex: 1 },
        ],
      },
    },
    'cfd-03': {
      id: 'cfd-03',
      title: 'Indeksy i surowce',
      access: 'auth',
      duration: '10:20',
      content: [
        { type: 'p', text: 'US100, US500, DE40, XAUUSD, OIL – różna zmienność i godziny handlu.' },
      ],
      quiz: {
        title: 'Rynki',
        questions: [
          { id: 'q1', question: 'US100 to…', options: ['S&P 500', 'Nasdaq-100', 'Dow Jones', 'Russell 2000'], correctIndex: 1 },
        ],
      },
    },
    'cfd-04': {
      id: 'cfd-04',
      title: 'Risk & money management',
      access: 'pro',
      duration: '09:30',
      content: [
        { type: 'p', text: 'Pozycjonowanie, R:R, max. dzienny DD, korelacje – podstawy przetrwania.' },
      ],
    },
  },

  zaawansowane: {
    'adv-01': {
      id: 'adv-01',
      title: 'Edge i testy A/B strategii',
      access: 'auth',
      duration: '12:40',
      content: [
        { type: 'p', text: 'Hipotezy, metryki, overfitting – kontrola wariancji i biasu.' },
      ],
    },
    'adv-02': {
      id: 'adv-02',
      title: 'Backtest i walk-forward',
      access: 'pro',
      duration: '13:05',
      content: [
        { type: 'p', text: 'Walidacja OOS, data leakage, rolling windows.' },
      ],
    },
    'adv-03': {
      id: 'adv-03',
      title: 'Automatyzacja sygnałów',
      access: 'pro',
      duration: '11:15',
      content: [
        { type: 'p', text: 'Alerty, API, routing zleceń i monitoring.' },
      ],
    },
    'adv-04': {
      id: 'adv-04',
      title: 'Psychologia i ryzyko portfela',
      access: 'pro',
      duration: '09:50',
      content: [
        { type: 'p', text: 'Drawdown, korelacje krzyżowe, risk parity i sanity checks.' },
      ],
    },
  },
} as const;

// (opcjonalnie) ułatwienie importu domyślnego
export default LESSONS;
