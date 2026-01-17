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
    name: "FXPRO",
    trusted: true,
    rating: 4.55,
    platforms: ["MT4", "MT5", "cTrader", "TradingView"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)", "Krypto (CFD)"],
    pros: [
      "Szeroki wybór platform handlowych (MT4/MT5/cTrader/TradingView)",
      "Regulacja w wielu jurysdykcjach (FCA, CySEC, DFSA)",
      "Konkurencyjne spready i warunki handlowe",
      "Materiały edukacyjne i analizy rynkowe (wg komunikacji brokera)",
      "Dostępność różnych typów rachunków",
    ],
    risks: [
      "Warunki i koszty mogą różnić się w zależności od jurysdykcji i typu konta",
      "Zweryfikuj dokładnie strukturę opłat, swapy i politykę wykonania zleceń",
      "Dostępność niektórych instrumentów zależy od regionu",
    ],
    forWho: [
      "Traders ceniący wybór platform i zaawansowane narzędzia",
      "Osoby szukające regulowanego brokera z szeroką ofertą",
    ],
    checkBefore: [
      "Jurysdykcję i podmiot regulacyjny dla Twojego regionu",
      "Dokładne koszty transakcyjne i warunki finansowania overnight",
      "Dostępność wybranej platformy i instrumentów w Twojej lokalizacji",
    ],
    regulatedEU: true,
    education: true,
    links: [
      { label: "Strona", href: "https://www.fxpro.com" },
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
    vip24h: true,
    regulatedEU: true,
    links: [
      { label: "Strona", href: "https://www.xglobalmarkets.com" },
      { label: "Pobierz e-book (W)", href: "https://lp.xglobalmarkets.com/e-book-w" },
      { label: "Pobierz e-book (B)", href: "https://lp.xglobalmarkets.com/e-book-b" },
    ],
  },
  {
    name: "Plus500",
    trusted: true,
    rating: 4.45,
    platforms: ["Plus500 Web", "Plus500 Mobile"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)", "Krypto (CFD)", "ETF (CFD)"],
    pros: [
      "Prosta i intuicyjna platforma własna (Web/Mobile)",
      "Szeroka gama instrumentów CFD (akcje, ETF, krypto)",
      "Regulacja w wielu jurysdykcjach (FCA, CySEC, ASIC)",
      "Brak prowizji — zarabia na spreadach",
      "Dostępność konta demo do testowania",
    ],
    risks: [
      "Platforma własna — brak MT4/MT5, co może być ograniczeniem dla zaawansowanych traderów",
      "Koszty ukryte w spreadach — warto porównać z konkurencją",
      "Warunki mogą różnić się między jurysdykcjami",
      "Ograniczone narzędzia analityczne w porównaniu do dedykowanych platform",
    ],
    forWho: [
      "Początkujący traders szukający prostej platformy",
      "Osoby preferujące handel akcjami i ETF przez CFD",
      "Użytkownicy ceniący mobilność i dostęp z różnych urządzeń",
    ],
    checkBefore: [
      "Dokładne spready dla wybranych instrumentów i porównanie z konkurencją",
      "Warunki swapów i finansowania overnight",
      "Jurysdykcję i podmiot regulacyjny dla Twojego regionu",
      "Dostępność wszystkich interesujących Cię instrumentów",
    ],
    regulatedEU: true,
    links: [
      { label: "Strona", href: "https://www.plus500.com" },
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
      "Zaawansowane wykresy i narzędzia techniczne",
    ],
    risks: [
      "Struktura opłat i koszty mogą się różnić między regionami i ofertami",
      "MT4 dostępne tylko w wybranych ofertach — warto to potwierdzić",
      "Wyższe progi wejścia w niektórych regionach",
    ],
    forWho: [
      "Użytkownicy szukający zaawansowanej platformy do analizy i handlu na indeksach",
      "Traders ceniący profesjonalne narzędzia analityczne",
    ],
    checkBefore: [
      "Dokładne koszty (spready, prowizje, swapy) oraz ewentualne opłaty nieaktywności",
      "Dostępność instrumentów i platform w Twojej jurysdykcji",
      "Minimalne wymogi depozytowe",
    ],
    regulatedEU: true,
    education: true,
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
      "Dobre wsparcie dla programistów i algorytmicznego tradingu",
    ],
    risks: [
      "Zakres instrumentów i warunki mogą różnić się w zależności od regionu",
      "Różnice kosztów między typami rachunków — wymagają weryfikacji",
      "Ograniczona oferta w porównaniu do niektórych brokerów CFD",
    ],
    forWho: [
      "Osoby ceniące prostą platformę własną z integracjami i API",
      "Programiści i algorytmiczni traders",
      "Użytkownicy preferujący TradingView",
    ],
    checkBefore: [
      "Tabela kosztów, wymogi i dostępne rynki w Twojej jurysdykcji",
      "Dostępność integracji TradingView i warunki korzystania",
      "Warunki API i możliwości algorytmicznego tradingu",
    ],
    education: true,
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
      "Szeroka oferta webinarów i szkoleń (wg komunikacji)",
    ],
    risks: [
      "Prowizje/spready mogą się różnić w zależności od konta i regionu",
      "Oferta instrumentów zależna od jurysdykcji — warto zweryfikować",
      "Warunki mogą różnić się między różnymi podmiotami XM w różnych regionach",
    ],
    forWho: [
      "Początkujący i osoby chcące testować mniejsze wolumeny",
      "Traders szukający rozbudowanej edukacji",
      "Użytkownicy preferujący MT4/MT5",
    ],
    checkBefore: [
      "Dokładne koszty i parametry rachunków",
      "Dostępność instrumentów na danym regionie",
      "Jurysdykcję i podmiot regulacyjny",
    ],
    education: true,
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
      "Regulacja w wielu jurysdykcjach (FCA, CySEC, ASIC)",
    ],
    risks: [
      "Warunki różnią się między regionami i klasami aktywów — weryfikuj lokalną ofertę",
      "Koszty i finansowanie mogą się istotnie różnić między rachunkami",
      "Złożona struktura ofert — wymaga dokładnej weryfikacji",
    ],
    forWho: [
      "Użytkownicy chcący szerokiej oferty CFD z zapleczem edukacyjnym",
      "Traders szukający dostępu do akcji i ETF przez CFD",
    ],
    checkBefore: [
      "Dokładne koszty, swapy i opłaty administracyjne",
      "Dostępność poszczególnych klas aktywów dla Twojej jurysdykcji",
      "Warunki dla wybranego typu konta i regionu",
    ],
    education: true,
    regulatedEU: true,
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


