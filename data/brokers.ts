export type BrokerLink = { label: string; href: string };

export type Broker = {
  name: string;
  short?: string;
  rating?: number;
  ratingLabel?: string; // e.g. "Nowy / brak danych"
  platforms: string[];
  markets: string[];
  pros: string[]; // quick summary bullets (3–5)
  risks?: string[];
  forWho?: string[];
  checkBefore?: string[];
  note?: string;
  trusted?: boolean;
  statusLabel?: string; // e.g. "Zaufany", "Nowy", "W przygotowaniu dla PL"
  supportPL?: boolean;
  vip24h?: boolean;
  education?: boolean;
  promotions?: boolean;
  regulatedEU?: boolean; // UE regulation presence (e.g., CySEC)
  lowCostsDeclared?: boolean;
  links?: BrokerLink[];
};

export const BROKERS: Broker[] = [
  {
    name: "XTB",
    trusted: true,
    rating: 4.6,
    platforms: ["xStation"],
    markets: ["Forex", "Indeksy", "Surowce", "Akcje/ETF (CFD i/lub spot)"],
    pros: [
      "Bardzo dobra platforma xStation (UX, wykresy, narzędzia)",
      "Rozbudowany ekosystem materiałów i webinarów",
      "Promocje — warto zweryfikować aktualne warunki",
    ],
    risks: [
      "Zakres i dostępność wsparcia może zależeć od segmentu klienta",
      "Koszty i opłaty różnią się między instrumentami oraz rynkami",
    ],
    forWho: [
      "Osoby stawiające na wygodę analizy i stabilną platformę",
    ],
    checkBefore: [
      "Aktualną tabelę opłat i warunki dla poszczególnych klas aktywów",
      "Warunki promocji i ewentualne ograniczenia",
    ],
    supportPL: true,
    education: true,
    promotions: true,
    regulatedEU: true,
    links: [
      { label: "Strona", href: "https://www.xtb.com" },
    ],
  },
  {
    name: "XGLOBAL Markets",
    trusted: true,
    rating: 4.5,
    platforms: ["MT4", "MT5"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: [
      "PL komunikacja i wsparcie pod polski rynek",
      "Promocje — wymagają weryfikacji warunków",
      "Darmowe e‑booki i materiały edukacyjne",
      "Szkolenia online / webinary (wg komunikacji brokera)",
      "Przekazy informacyjne o rynku (edukacyjnie, nie sygnały)",
      "Aktywny rozwój oferty pod PL",
    ],
    risks: [
      "Warunki i koszty mogą się różnić zależnie od typu konta i regionu",
      "Zweryfikuj tabelę opłat, swapy i politykę wykonania zleceń",
      "Warunki promocji wymagają dokładnej lektury",
    ],
    forWho: [
      "Osoby chcące PL komunikacji + edukacji + wsparcia",
    ],
    checkBefore: [
      "Jurysdykcję i dokumenty, warunki rachunków",
      "Koszty transakcyjne i finansowanie overnight",
    ],
    supportPL: true,
    education: true,
    promotions: true,
    vip24h: true, // jeśli dostępne dla wybranych segmentów
    regulatedEU: true,
    links: [
      { label: "Strona", href: "https://www.xglobalmarkets.com" },
      { label: "Pobierz e-book (W)", href: "https://lp.xglobalmarkets.com/e-book-w" },
      { label: "Pobierz e-book (B)", href: "https://lp.xglobalmarkets.com/e-book-b" },
    ],
  },
  {
    name: "CMC Markets",
    rating: 4.4,
    platforms: ["Next Generation", "MT4 (wybrane oferty)"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: [
      "Platforma Next Generation z rozbudowanymi narzędziami analizy",
      "Szerokie spektrum indeksów i rynków towarowych",
      "Materiały edukacyjne i analizy rynkowe (wg komunikacji brokera)",
    ],
    risks: [
      "Struktura opłat i koszty mogą się różnić między regionami i ofertami",
      "MT4 dostępne tylko w wybranych ofertach — warto to potwierdzić",
    ],
    forWho: [
      "Użytkownicy szukający zaawansowanej platformy do analizy i handlu na indeksach",
    ],
    checkBefore: [
      "Dokładne koszty (spready, prowizje, swapy) oraz ewentualne opłaty nieaktywności",
      "Dostępność instrumentów i platform w Twojej jurysdykcji",
    ],
    regulatedEU: true,
    links: [
      { label: "Strona", href: "https://www.cmcmarkets.com" },
    ],
  },
  {
    name: "Saxo Bank",
    short: "Saxo",
    rating: 4.3,
    platforms: ["SaxoTraderGO / PRO"],
    markets: ["Forex", "CFD", "Akcje/ETF", "Obligacje", "Futures", "Opcje"],
    pros: [
      "Szeroka ekspozycja na rynki spot/ETF/obligacje poza samymi CFD",
      "Zaawansowane platformy GO/PRO z narzędziami analitycznymi",
      "Rozwinięte narzędzia do inwestowania długoterminowego",
    ],
    risks: [
      "Wyższy próg wejścia i/lub opłaty nieaktywności w wybranych regionach",
      "Złożona struktura kosztów — wymaga uważnej weryfikacji dokumentów",
    ],
    forWho: [
      "Osoby szukające szerokiej oferty instrumentów oraz rozwiązań poza CFD",
    ],
    checkBefore: [
      "Dokumentację kosztów i minimalne wymogi depozytowe",
      "Dostępność poszczególnych klas aktywów w Twojej jurysdykcji",
    ],
    regulatedEU: true,
    links: [
      { label: "Strona", href: "https://www.saxo.com" },
    ],
  },
  {
    name: "OANDA",
    rating: 4.2,
    platforms: ["OANDA Trade", "MT4", "TradingView (wybrane)"],
    markets: ["Forex", "Indeksy", "Towary", "Krypto (CFD)"],
    pros: [
      "Przejrzysta, własna platforma OANDA Trade",
      "Integracje/TradingView (wybrane rynki) oraz API programistyczne",
      "Materiałowe wsparcie edukacyjne i narzędzia do analizy (wg komunikacji)",
    ],
    risks: [
      "Zakres instrumentów i warunki mogą różnić się w zależności od regionu",
      "Różnice kosztów między typami rachunków — wymagają weryfikacji",
    ],
    forWho: [
      "Osoby ceniące prostą platformę własną z integracjami i API",
    ],
    checkBefore: [
      "Tabela kosztów, wymogi i dostępne rynki w Twojej jurysdykcji",
      "Dostępność integracji TradingView i warunki korzystania",
    ],
    links: [
      { label: "Strona", href: "https://www.oanda.com" },
    ],
  },
  {
    name: "XM",
    rating: 4.0,
    platforms: ["MT4", "MT5"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: [
      "Rozbudowana baza materiałów edukacyjnych (wg komunikacji)",
      "Dostępność rachunków z małymi wolumenami (np. mikro)",
      "Popularne platformy MT4/MT5",
    ],
    risks: [
      "Prowizje/spready mogą się różnić w zależności od konta i regionu",
      "Oferta instrumentów zależna od jurysdykcji — warto zweryfikować",
    ],
    forWho: [
      "Początkujący i osoby chcące testować mniejsze wolumeny",
    ],
    checkBefore: [
      "Dokładne koszty i parametry rachunków",
      "Dostępność instrumentów na danym regionie",
    ],
    links: [
      { label: "Strona", href: "https://www.xm.com" },
    ],
  },
  {
    name: "Admirals (dawniej Admiral Markets)",
    rating: 4.2,
    platforms: ["MT4", "MT5", "Web/Portal"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje/ETF (CFD i/lub spot – zależnie od oferty)"],
    pros: [
      "Materiały edukacyjne i analizy rynkowe (wg komunikacji brokera)",
      "Szeroka gama indeksów i towarów, a w wybranych ofertach także akcje/ETF",
      "Wygodny portal web do zarządzania kontem",
    ],
    risks: [
      "Warunki różnią się między regionami i klasami aktywów — weryfikuj lokalną ofertę",
      "Koszty i finansowanie mogą się istotnie różnić między rachunkami",
    ],
    forWho: [
      "Użytkownicy chcący szerokiej oferty CFD z zapleczem edukacyjnym",
    ],
    checkBefore: [
      "Dokładne koszty, swapy i opłaty administracyjne",
      "Dostępność poszczególnych klas aktywów dla Twojej jurysdykcji",
    ],
    links: [
      { label: "Strona", href: "https://www.admirals.com" },
    ],
  },
  {
    name: "ABF TRADE",
    ratingLabel: "Nowy / brak danych",
    platforms: ["MT4", "MT5"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: [
      "Ukierunkowanie na rynki zagraniczne i klientów międzynarodowych",
      "Regulacja UE (CySEC) — element do weryfikacji w rejestrach",
      "Planowana ekspansja na PL od połowy 2026 (wg komunikacji)",
    ],
    risks: [
      "Dostępność obsługi PL i lokalnych materiałów może być ograniczona do czasu wdrożenia",
      "Warunki i koszty zależne od regionu/typu konta",
    ],
    forWho: [
      "Osoby, które rozważają międzynarodową ofertę i platformy MT4/MT5",
    ],
    checkBefore: [
      "Status regulacyjny w rejestrach i dokumentach",
      "Zakres obsługi PL, materiały i godziny wsparcia",
    ],
    regulatedEU: true,
    statusLabel: "W przygotowaniu dla PL",
    links: [],
  },
];


