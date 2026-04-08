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
// Forex / CFD / Zaawansowane: statyczne strony `/kursy/{slug}/lekcja-n` zapisują postęp
// pod tymi samymi ID (`lekcja-1` …) — muszą się zgadzać z COURSES, inaczej /kursy pokaże 0/Y.
// Rejestr LESSONS (fx-01, …) służy /kursy/{slug}/lekcje/{id} — stare linki przekierowują do lekcja-*.
// -------------------------------------------------------------

const PODSTAWY: Course = {
  slug: 'podstawy',
  title: 'Podstawy',
  subtitle: 'Notowania, zlecenia, dźwignia — start przed modułami FX/CFD.',
  lessons: [
    { id: 'lekcja-1', title: 'Wprowadzenie: czym jest rynek Forex?' },
    { id: 'lekcja-2', title: 'Pipsy, punkty i loty' },
    { id: 'lekcja-3', title: 'Rodzaje zleceń' },
    { id: 'lekcja-4', title: 'Dźwignia i ryzyko' },
    { id: 'lekcja-5', title: 'Czytanie świec' },
  ],
};

const FOREX: Course = {
  slug: 'forex',
  title: 'Forex',
  subtitle: 'Rynek walutowy, pipsy/loty, sesje, ryzyko i praktyka.',
  lessons: [
    { id: 'lekcja-1', title: 'Wprowadzenie do rynku walutowego', duration: '18:00' },
    { id: 'lekcja-2', title: 'Pipsy, punkty i loty', duration: '07:00' },
    { id: 'lekcja-3', title: 'Rodzaje zleceń', duration: '08:00' },
    { id: 'lekcja-4', title: 'Dźwignia i ryzyko', duration: '09:00' },
    { id: 'lekcja-5', title: 'Plan transakcyjny i dziennik', duration: '10:00' },
  ],
};

const CFD: Course = {
  slug: 'cfd',
  title: 'CFD',
  subtitle: 'Mechanika kontraktów, koszty, indeksy i surowce.',
  lessons: [
    { id: 'lekcja-1', title: 'Wprowadzenie do CFD', duration: '06:00' },
    { id: 'lekcja-2', title: 'Koszty i finansowanie overnight', duration: '07:00' },
    { id: 'lekcja-3', title: 'Indeksy i surowce — specyfika', duration: '08:00' },
    { id: 'lekcja-4', title: 'Realizacja zleceń i poślizg', duration: '09:00' },
    { id: 'lekcja-5', title: 'Zarządzanie ryzykiem w CFD', duration: '10:00' },
  ],
};

const ADV: Course = {
  slug: 'zaawansowane',
  title: 'Zaawansowane',
  subtitle: 'Edge/EV, testy OOS, automatyzacja i psychologia.',
  lessons: [
    { id: 'lekcja-1', title: 'Edge i wartość oczekiwana (EV)', duration: '22:00' },
    { id: 'lekcja-2', title: 'Backtest: OOS, walk-forward, unikanie przecieku', duration: '22:00' },
    { id: 'lekcja-3', title: 'Statystyka wyników: rozkłady, DD, risk of ruin, Monte Carlo', duration: '22:00' },
    { id: 'lekcja-4', title: 'Sizing pro: Kelly (częściowy), fixed-fractional, portfel i korelacje', duration: '22:00' },
    { id: 'lekcja-5', title: 'Psychologia i operacyjka: rutyny, checklisty, dziennik', duration: '20:00' },
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
  [PODSTAWY.slug]: PODSTAWY,
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
