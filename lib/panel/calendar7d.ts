// lib/panel/calendar7d.ts — statyczny kalendarz 7 dni (EDU)

export type CalendarImportance = 'low' | 'medium' | 'high';

export type CalendarEvent = {
  date: string;          // YYYY-MM-DD
  time: string;          // HH:mm (UTC or local label-free)
  region: 'US' | 'EU' | 'UK' | 'DE' | 'FR';
  event: string;         // e.g., CPI, NFP, ISM, etc.
  importance: CalendarImportance;
  why: string;           // educational rationale
  how: string;           // conditional, non-recommendational reaction pattern
};

export const CALENDAR_7D: CalendarEvent[] = [
  {
    date: '2026-01-02',
    time: '07:00',
    region: 'DE',
    event: 'CPI (wst.)',
    importance: 'medium',
    why: 'Inflacja w strefie euro bywa istotnym tłem dla oczekiwań wobec stóp procentowych.',
    how: 'Zaskoczenia wobec konsensusu często wpływają na rentowności i euro — skalowanie reakcji zależy od odchylenia i narracji rynku.',
  },
  {
    date: '2026-01-02',
    time: '09:00',
    region: 'EU',
    event: 'PMI przemysł',
    importance: 'low',
    why: 'Wskazuje kondycję przemysłu; przestawienie z recesji w ekspansję bywa rynkowo istotne.',
    how: 'Odchylenia od prognoz miewają krótkie, kierunkowe ruchy — zwykle ograniczone, o ile nie zmieniają trendu makro.',
  },
  {
    date: '2026-01-03',
    time: '13:30',
    region: 'US',
    event: 'PCE',
    importance: 'high',
    why: 'Preferowana przez Fed miara inflacji: wpływa na oczekiwania dot. polityki pieniężnej.',
    how: 'Wyższe od prognoz PCE bywa “hawkish”: krótkoterminowo umacnia USD i podnosi rentowności, jeśli zaskoczenie jest istotne.',
  },
  {
    date: '2026-01-03',
    time: '15:00',
    region: 'US',
    event: 'ISM Manufacturing',
    importance: 'medium',
    why: 'Obraz aktywności przemysłowej; komponenty zamówień/cen bywają wskazówką dla inflacji i cyklu.',
    how: 'Silne zaskoczenie może przełożyć się na ruch w indeksach i USD; trwałość zwykle zależy od narracji i potwierdzeń.',
  },
  {
    date: '2026-01-04',
    time: '13:30',
    region: 'US',
    event: 'Non-Farm Payrolls (NFP)',
    importance: 'high',
    why: 'Rynek pracy w USA często steruje oczekiwaniami stóp i ryzykiem recesji/miękkiego lądowania.',
    how: 'Duże odchylenie od konsensusu bywa impulsem kierunkowym; reakcje potrafią się odwracać po rewizjach i szczegółach raportu.',
  },
  {
    date: '2026-01-04',
    time: '13:30',
    region: 'US',
    event: 'Unemployment Rate',
    importance: 'medium',
    why: 'Uzupełnia obraz NFP; rosnąca stopa bywa argumentem “dovish”, spadek – “hawkish”, zależnie od tła.',
    how: 'Rynek często reaguje łącznie z NFP; znaczenie rośnie, gdy trend zmiany stopy jest trwały.',
  },
  {
    date: '2026-01-05',
    time: '07:00',
    region: 'DE',
    event: 'Factory Orders',
    importance: 'low',
    why: 'Wskaźnik zamówień w przemyśle może wyprzedzać aktywność produkcyjną.',
    how: 'Zwykle reakcje ograniczone; większe ruchy pojawiają się przy szerokim tle makro lub serii zaskoczeń.',
  },
  {
    date: '2026-01-05',
    time: '15:00',
    region: 'US',
    event: 'ISM Services',
    importance: 'medium',
    why: 'Sektor usług jest kluczowy dla gospodarki USA; komponenty cenowe bywają śladem presji inflacyjnej.',
    how: 'Silne odchylenia od prognoz mogą poruszać indeksy, USD i rentowności; potwierdzenia zwiększają trwałość ruchu.',
  },
  {
    date: '2026-01-06',
    time: '12:00',
    region: 'UK',
    event: 'GDP m/m',
    importance: 'medium',
    why: 'Wzrost gospodarczy kształtuje oczekiwania wobec polityki BoE oraz ryzyka stagflacji.',
    how: 'Duże odchylenia bywają kierunkowe dla GBP; znaczenie zależy od niespodzianki i otoczenia globalnego.',
  },
  {
    date: '2026-01-07',
    time: '19:00',
    region: 'US',
    event: 'FOMC Minutes',
    importance: 'high',
    why: 'Szczegóły dyskusji w Fed: bilans ryzyk, wrażliwość na dane, ścieżka stóp.',
    how: 'Ton jastrzębi/gołębi potrafi wpływać na USD i rentowności; znaczenie rośnie, gdy minutes zmieniają rynkową narrację.',
  },
  {
    date: '2026-01-07',
    time: '13:30',
    region: 'US',
    event: 'Retail Sales',
    importance: 'medium',
    why: 'Konsumpcja to istotna część PKB; dynamika sprzedaży wpływa na ocenę cyklu.',
    how: 'Silne wybicia/spadki wobec prognoz mogą kierunkowo poruszać indeksy; potwierdzenia wzmacniają ruch.',
  },
  {
    date: '2026-01-08',
    time: '10:00',
    region: 'EU',
    event: 'CPI (flash)',
    importance: 'high',
    why: 'Inflacja HICP dla strefy euro wpływa na oczekiwania co do EBC.',
    how: 'Zaskoczenia wobec konsensusu bywają impulsem dla EUR i bundów; reakcje są trwalsze, gdy potwierdzają trend.',
  },
  {
    date: '2026-01-08',
    time: '08:00',
    region: 'DE',
    event: 'Industrial Production',
    importance: 'low',
    why: 'Produkcja przemysłowa potrafi potwierdzać/kontrastować sygnały z PMI.',
    how: 'Rynek reaguje zwykle umiarkowanie; większa waga, gdy seria danych wskazuje na trwały zwrot.',
  },
];
