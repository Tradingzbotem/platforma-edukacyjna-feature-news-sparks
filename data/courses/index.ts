// data/courses/index.ts
// Centralny rejestr kursów + kolejność lekcji. Z tego korzystają strony lekcji
// (m.in. /kursy/[course]/lekcje/[id]/page.tsx).

export type CourseLessonRef = {
  id: string;           // identyfikator lekcji (musi zgadzać się z data/lessons)
  title?: string;       // opcjonalnie tytuł do listingu kursu
  duration?: string;    // np. "08:30"
};

export type Course = {
  slug: string;               // np. "forex"
  title: string;              // np. "Forex"
  subtitle?: string;          // podtytuł widoczny pod nagłówkiem kursu
  description?: string;       // dłuższy opis (opcjonalnie)
  lessons: CourseLessonRef[]; // KOLEJNOŚĆ lekcji dla tego kursu
};

// -------------------------------------------------------------
// Ważne: ID lekcji poniżej MUSZĄ istnieć w data/lessons/index.ts
// (fx-01..04, cfd-01..04, adv-01..04) — podaliśmy je wcześniej.
// -------------------------------------------------------------

const FOREX: Course = {
  slug: 'forex',
  title: 'Forex',
  subtitle: 'Rynek walutowy, pipsy/loty, sesje, ryzyko i praktyka.',
  lessons: [
    { id: 'fx-01', title: 'Wprowadzenie do rynku FX', duration: '08:30' },
    { id: 'fx-02', title: 'Pary walutowe i kwotowania', duration: '09:10' },
    { id: 'fx-03', title: 'Dźwignia, margin i ryzyko', duration: '11:45' },
    { id: 'fx-04', title: 'Strategie intraday',        duration: '12:05' },
  ],
};

const CFD: Course = {
  slug: 'cfd',
  title: 'CFD',
  subtitle: 'Mechanika kontraktów, koszty, indeksy i surowce.',
  lessons: [
    { id: 'cfd-01', title: 'Jak działają CFD?',              duration: '07:55' },
    { id: 'cfd-02', title: 'Koszty i overnight',             duration: '06:40' },
    { id: 'cfd-03', title: 'Indeksy i surowce',              duration: '10:20' },
    { id: 'cfd-04', title: 'Risk & money management',        duration: '09:30' },
  ],
};

const ADV: Course = {
  slug: 'zaawansowane',
  title: 'Zaawansowane',
  subtitle: 'Edge/EV, testy OOS, automatyzacja i psychologia.',
  lessons: [
    { id: 'adv-01', title: 'Edge i testy A/B strategii',     duration: '12:40' },
    { id: 'adv-02', title: 'Backtest i walk-forward',        duration: '13:05' },
    { id: 'adv-03', title: 'Automatyzacja sygnałów',         duration: '11:15' },
    { id: 'adv-04', title: 'Psychologia i ryzyko portfela',  duration: '09:50' },
  ],
};

const REGULACJE: Course = {
  slug: 'regulacje',
  title: 'Regulacje i egzaminy',
  subtitle: 'MiFID II, ESMA, KNF, testy adekwatności, best execution, compliance.',
  lessons: [
    { id: 'reg-01', title: 'Podstawy regulacyjne: MiFID II i ESMA', duration: '15:00' },
    { id: 'reg-02', title: 'Testy adekwatności i odpowiedniości', duration: '12:30' },
    { id: 'reg-03', title: 'Best execution i konflikty interesów', duration: '11:20' },
    { id: 'reg-04', title: 'Ochrona klienta: limity dźwigni i negative balance', duration: '10:15' },
    { id: 'reg-05', title: 'Marketing i compliance: KID/KIID, materiały promocyjne', duration: '13:45' },
    { id: 'reg-06', title: 'Kategoryzacja klientów i opt-up', duration: '09:30' },
  ],
};

// Możesz później dodać kolejne kursy (np. "materialy") – byle ID lekcji
// były zdefiniowane w data/lessons/index.ts.
export const COURSES: Record<string, Course> = {
  [FOREX.slug]: FOREX,
  [CFD.slug]: CFD,
  [ADV.slug]: ADV,
  [REGULACJE.slug]: REGULACJE,
} as const;

// Wygodna lista (np. do mapowania po wszystkich kursach)
export const COURSES_LIST: Course[] = Object.values(COURSES);

// (opcjonalnie) domyślny eksport – nie jest wymagany przez nasz kod,
// ale nie przeszkadza i bywa wygodny.
export default COURSES;
