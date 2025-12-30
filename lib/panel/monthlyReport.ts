export type MonthlySection = {
  id: string;
  title: string;
  bullets: string[];
  note?: string;
};

export type MonthlyReport = {
  monthLabel: string;     // np. "Styczeń 2026"
  updatedAt: string;      // ISO
  scopeNote: string;      // EDU disclaimer / zakres
  sections: MonthlySection[];
};

export const MONTHLY_REPORT: MonthlyReport = {
  monthLabel: 'Styczeń 2026',
  updatedAt: new Date().toISOString(),
  scopeNote:
    'To materiał edukacyjny: bez rekomendacji inwestycyjnych i bez „sygnałów”. Celem jest uporządkowanie kontekstu i ryzyk.',
  sections: [
    {
      id: 'macro',
      title: 'Kontekst makro (EDU)',
      bullets: [
        'Inflacja: obserwuj trend (headline vs core) i wrażliwość rynku na niespodzianki.',
        'Stopy: narracja banków centralnych bywa ważniejsza niż pojedynczy odczyt danych.',
        'Rynek pracy (USA): ryzyko „re-pricing” oczekiwań stóp przy dużych odchyleniach od konsensusu.',
      ],
      note: 'Zawsze oceniaj dane przez pryzmat oczekiwań rynku i wcześniejszych wycen.',
    },
    {
      id: 'sentiment',
      title: 'Sentyment i przepływy',
      bullets: [
        'Risk-on/risk-off: rotacje sektorowe mogą zmieniać liderów, nawet jeśli indeksy są „płaskie”.',
        'Zmienność: spadek/wybicie VIX często wpływa na krótkoterminową dynamikę indeksów.',
        'USD i rentowności: kluczowe dla złota i FX, pośrednio dla Nasdaq/US100.',
      ],
    },
    {
      id: 'key-risks',
      title: 'Ryzyka miesiąca',
      bullets: [
        'Nagłe „repricing” stóp po CPI/NFP lub komunikacji Fed/EBC/BoE.',
        'Zaskoczenia geopolityczne i skoki ryzyka na rynkach energii.',
        'Fałszywe wybicia w oknie publikacji danych i poślizgi (slippage).',
      ],
    },
    {
      id: 'watchlist',
      title: 'Watchlist tematów',
      bullets: [
        'USA: CPI / PCE / NFP – jak rynek interpretuje odchylenia od konsensusu.',
        'EU: CPI (flash) i wpływ na oczekiwania wobec EBC.',
        'Technologia: breadth i relatywna siła vs reszta rynku (czy wzrosty są „wąskie”).',
      ],
    },
    {
      id: 'workflow',
      title: 'Procedura pracy (EDU)',
      bullets: [
        'Przed tygodniem: kalendarz + scenariusze A/B/C dla kluczowych rynków.',
        'Przed dniem: checklisty kontekst/technika/ryzyko.',
        'Po danych: weryfikacja narracji vs pierwsza reakcja + notatka „co rynek uznał za ważne”.',
      ],
    },
    {
      id: 'conditional-scenarios',
      title: 'Scenariusze warunkowe (EDU, bez sygnałów)',
      bullets: [
        'Jeśli dane inflacyjne konsekwentnie zaskakują w górę → rośnie ryzyko jastrzębiej wyceny stóp; obserwuj reakcję rentowności.',
        'Jeśli inflacja słabnie, ale rynek pracy pozostaje mocny → możliwy „mieszany” przekaz; ważny jest ton banku centralnego.',
        'Jeśli rośnie zmienność i spada breadth → zwiększa się ryzyko ruchów korekcyjnych; skup się na zarządzaniu ryzykiem.',
      ],
      note: 'To szablony interpretacyjne. Nie są wskazówką transakcyjną.',
    },
  ],
};

