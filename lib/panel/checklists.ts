// lib/panel/checklists.ts — statyczne checklisty (EDU)

export type ChecklistItem = {
  id: string;
  text: string;
  note?: string;
  tag?: 'makro' | 'technika' | 'ryzyko' | 'sentyment' | 'zmiennosc';
};

export type ChecklistGroup = {
  id: string;
  title: string;
  subtitle?: string;
  items: ChecklistItem[];
};

export const CHECKLISTS: ChecklistGroup[] = [
  {
    id: 'context',
    title: 'Przed analizą / kontekst',
    subtitle: 'Makro, kalendarz, sentyment i zmienność jako tło decyzji (EDU).',
    items: [
      { id: 'macro-brief', text: 'Makro: najważniejsze wątki (inflacja, stopy, wzrost).', tag: 'makro' },
      { id: 'calendar', text: 'Sprawdzony kalendarz: dziś/jutro ważne publikacje i godziny.', note: 'Zwróć uwagę na publikacje o wysokiej ważności.', tag: 'makro' },
      { id: 'events-impacts', text: 'Czy nadchodzące wydarzenia mogą mocno poruszyć to aktywo?', tag: 'makro' },
      { id: 'sentiment', text: 'Sentyment: risk-on/off, relatywna siła sektorów.', tag: 'sentyment' },
      { id: 'volatility', text: 'Zmienność: spokojnie, normalnie czy „szarpie”?', tag: 'zmiennosc' },
      { id: 'seasonality', text: 'Cykliczność/sezonowość: czy w tym okresie bywa specyficznie?', tag: 'makro' },
    ],
  },
  {
    id: 'technical',
    title: 'Technika / scenariusze',
    subtitle: 'Trend, poziomy, konfluencja i warunki unieważnienia (EDU).',
    items: [
      { id: 'trend-htf', text: 'Trend na wyższym interwale: zgodny, przeciwny czy boczny?', tag: 'technika' },
      { id: 'levels', text: 'Kluczowe poziomy: wsparcia/opory i strefy reakcji — zaznaczone.', tag: 'technika' },
      { id: 'recent-extremes', text: 'Aktualny pułap: blisko dziennego/tygodniowego minimum/maksimum?', tag: 'technika' },
      { id: 'retests', text: 'Jest odrzucenie/retest poziomu zamiast zgadywania?', tag: 'technika' },
      { id: 'confluence', text: 'Konfluencja: 2–3 niezależne argumenty za tezą.', note: 'Im więcej niezależnych potwierdzeń, tym większa wiarygodność kontekstu.', tag: 'technika' },
      { id: 'invalidation', text: 'Unieważnienie: jasny warunek, kiedy teza przestaje obowiązywać.', tag: 'technika' },
    ],
  },
  {
    id: 'risk',
    title: 'Ryzyko / egzekucja',
    subtitle: 'Limit maks. straty, rozmiar pozycji i plan działania (EDU).',
    items: [
      { id: 'max-loss', text: 'Maksymalna strata na dzień/tydzień — z góry określona.', tag: 'ryzyko' },
      { id: 'size', text: 'Wielkość pozycji dopasowana do bieżącej zmienności.', tag: 'ryzyko' },
      { id: 'stops', text: 'Warunki stop/wyjścia: ustalone zanim klikniesz.', tag: 'ryzyko' },
      { id: 'plan-b', text: 'Plan B: co robisz, jeśli warunki rynkowe się zmienią.', tag: 'ryzyko' },
      { id: 'spread-check', text: 'Sprawdzony spread/warunki wykonania przed działaniem.', tag: 'ryzyko' },
    ],
  },
];

