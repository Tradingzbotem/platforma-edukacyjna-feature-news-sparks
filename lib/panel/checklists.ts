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
      { id: 'calendar', text: 'Kalendarz: dziś/jutro kluczowe wydarzenia i godziny.', note: 'Zwróć uwagę na publikacje o wysokiej ważności.', tag: 'makro' },
      { id: 'sentiment', text: 'Sentyment: risk-on/off, relatywna siła sektorów.', tag: 'sentyment' },
      { id: 'volatility', text: 'Zmienność (ATR/VIX): środowisko spokojne czy podwyższone?', tag: 'zmiennosc' },
    ],
  },
  {
    id: 'technical',
    title: 'Technika / scenariusze',
    subtitle: 'Trend, poziomy, konfluencja i warunki unieważnienia (EDU).',
    items: [
      { id: 'trend-structure', text: 'Trend i struktura: swing high/low, HH/HL/LH/LL.', tag: 'technika' },
      { id: 'levels', text: 'Kluczowe poziomy: wsparcia/opory i strefy reakcji.', tag: 'technika' },
      { id: 'confluence', text: 'Konfluencja: niezależne argumenty wzmacniające tezę.', note: 'Im więcej niezależnych potwierdzeń, tym większa wiarygodność kontekstu.', tag: 'technika' },
      { id: 'invalidation', text: 'Unieważnienie: jasny warunek, kiedy teza przestaje obowiązywać.', tag: 'technika' },
    ],
  },
  {
    id: 'risk',
    title: 'Ryzyko / egzekucja',
    subtitle: 'Limit maks. straty, rozmiar pozycji i plan działania (EDU).',
    items: [
      { id: 'max-loss', text: 'Maksymalna strata na dzień/tydzień — z góry określona.', tag: 'ryzyko' },
      { id: 'size', text: 'Wielkość pozycji dopasowana do zmienności i akceptowanego 1R.', tag: 'ryzyko' },
      { id: 'stops', text: 'Warunki stop/wyjścia: rozpisane przed działaniem.', tag: 'ryzyko' },
      { id: 'plan-b', text: 'Plan B: co robisz, jeśli warunki rynkowe się zmienią.', tag: 'ryzyko' },
    ],
  },
];

