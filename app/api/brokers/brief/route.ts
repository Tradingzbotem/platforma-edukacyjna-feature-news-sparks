import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 60 min cache

/**
 * GET /api/brokers/brief?name=XTB
 * Proxy do naszego modułu news: zwróć 3 neutralne nagłówki + mini-komentarz.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get('name') || '').trim();

  if (!name) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  try {
    // 1) próbujemy użyć istniejącego endpointu news/summarize (jeśli jest w projekcie)
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const endpoint = `${base}/api/news/summarize?q=${encodeURIComponent(name)}&limit=6`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } }).catch(() => null);

    let raw: any = null;
    if (res && res.ok) raw = await res.json();

    // Zakładamy strukturę: [{title, source, url, ts}] – jeśli inna, zmapuj bezpiecznie
    const src: Array<any> = Array.isArray(raw?.items) ? raw.items : [];

    // --- utils: klasyfikacja + deterministyczna "losowość" --- //
    type Theme =
      | 'fees'        // opłaty, prowizje, spready
      | 'platform'    // platformy, narzędzia, MT4/5, xStation itd.
      | 'regulation'  // licencje, regulatorzy, kary
      | 'products'    // oferta rynków, krypto/CFD/akcje
      | 'promo'       // bonusy, oferty specjalne
      | 'incident'    // przerwy, awarie, performance
      | 'legal'       // pozwy, dochodzenia
      | 'financials'  // wyniki, przychody, raporty
      | 'hr'          // zarząd, kadry, CEO
      | 'generic';    // ogólne

    const KW: Record<Theme, string[]> = {
      fees: ['fee', 'fees', 'opł', 'commission', 'spread', 'spready', 'pricing', 'koszt', 'koszty', 'rate card', 'tabela opłat'],
      platform: ['platform', 'xstation', 'mt4', 'mt5', 'ctrader', 'webtrader', 'prorealtime', 'tradingview', 'narzędz', 'tools', 'functionality'],
      regulation: ['regulat', 'license', 'licenc', 'fca', 'cysec', 'asic', 'finma', 'baFin', 'kary', 'penalty', 'fine', 'compliance'],
      products: ['product', 'offer', 'oferta', 'markets', 'rynki', 'stocks', 'akcje', 'cfds', 'crypto', 'krypto', 'etf', 'spot'],
      promo: ['promo', 'bonus', 'promotion', 'oferta specjalna', 'cashback'],
      incident: ['outage', 'przerwa', 'awaria', 'downtime', 'maintenance', 'latency', 'incident', 'performance'],
      legal: ['lawsuit', 'pozew', 'class action', 'investigation', 'dochodzenie', 'sec', 'cftc'],
      financials: ['earnings', 'wyniki', 'revenue', 'przychod', 'zysk', 'loss', 'raport kwartalny', 'q1', 'q2', 'q3', 'q4'],
      hr: ['ceo', 'cfo', 'zarząd', 'board', 'management', 'appointment', 'resigns', 'odchodzi', 'mianowany'],
      generic: [],
    };

    // deterministyczny RNG (mulberry32)
    function mulberry32(seed: number) {
      return function() {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function hash(str: string): number {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    // zestawy notek per temat (krótkie, neutralne, max ~90 znaków)
    const NOTES: Record<Theme, string[]> = {
      fees: [
        'Dot. kosztów — porównaj tabelę opłat i model prowizji w Twojej jurysdykcji.',
        'Opłaty/spready mogą się różnić wg typu konta i aktywów.',
        'Sprawdź koszty finansowania pozycji oraz ewentualne opłaty dodatkowe.',
      ],
      platform: [
        'Dot. platform — dostępność funkcji zależy od regionu i rodzaju konta.',
        'Sprawdź, które platformy są dostępne dla Twojej lokalizacji.',
        'Zweryfikuj narzędzia/wykresy oraz wersje mobilne/przeglądarkowe.',
      ],
      regulation: [
        'Dot. regulacji — sprawdź nadzór i licencję właściwą dla Twojego kraju.',
        'Upewnij się, kto jest regulatorem Twojego podmiotu i jakie są zabezpieczenia.',
        'Warunki mogą się różnić między oddziałami — zweryfikuj informacje u regulatora.',
      ],
      products: [
        'Zakres rynków zależy od regionu; sprawdź listę instrumentów na stronie brokera.',
        'Nie wszystkie instrumenty są dostępne w każdej jurysdykcji.',
        'Zweryfikuj ofertę akcji/ETF/CFD i ewentualne ograniczenia produktowe.',
      ],
      promo: [
        'Oferty specjalne zwykle podlegają warunkom — przeczytaj regulamin promocji.',
        'Promocje mogą nie być dostępne w każdej jurysdykcji.',
        'Zweryfikuj wymagania kwalifikacyjne i ewentualne ograniczenia.',
      ],
      incident: [
        'Dot. dostępności — sprawdź status platformy i ew. komunikaty techniczne.',
        'Incydenty techniczne bywają lokalne; śledź status u brokera.',
        'Zweryfikuj planowane prace i możliwe przerwy w działaniu.',
      ],
      legal: [
        'Sprawy prawne mogą dotyczyć wybranych rynków/okresów — weryfikuj u źródeł.',
        'Dot. działań prawnych — sprawdź szczegóły i komunikaty regulatorów.',
        'Konsekwencje zależą od jurysdykcji — czytaj oryginalne dokumenty.',
      ],
      financials: [
        'Wyniki finansowe nie są poradą — zweryfikuj pełny raport i noty.',
        'Raporty mogą dot. grupy kapitałowej — sprawdź, którego podmiotu dotyczą.',
        'Porównaj dane r/r i sekwencyjnie; kontekst jest kluczowy.',
      ],
      hr: [
        'Zmiany w zarządzie — sprawdź komunikat spółki i zakres odpowiedzialności.',
        'Kadrowe aktualizacje mogą wpływać na strategię — śledź źródła.',
        'Zweryfikuj, którego podmiotu dotyczą zmiany i od kiedy.',
      ],
      generic: [
        'Informacyjny nagłówek — sprawdź szczegóły u źródła.',
        'Zweryfikuj oryginalny materiał i aktualność informacji.',
        'Warunki i dostępność zależą od regionu; czytaj komunikat źródłowy.',
      ],
    };

    function classifyTheme(title: string): Theme {
      const t = title.toLowerCase();
      for (const theme of Object.keys(KW) as Theme[]) {
        if (theme === 'generic') continue;
        if (KW[theme].some(k => t.includes(k))) return theme;
      }
      return 'generic';
    }

    function pickNote(theme: Theme, seedStr: string): string {
      const arr = NOTES[theme] ?? NOTES.generic;
      const rnd = mulberry32(hash(seedStr))();
      const idx = Math.floor(rnd * arr.length);
      return arr[idx];
    }

    // Tworzenie pozycji z deterministyczną notką zależną od tematu
    const items = src.slice(0, 3).map((it: any, i: number) => {
      const title: string = it?.title ?? 'Aktualizacja';
      const source: string = it?.source ?? 'Źródło';
      const url: string = it?.url ?? '#';
      const ts: string | null = it?.ts ?? null;

      const theme = classifyTheme(title);
      // seed = nazwa brokera + tytuł + index -> stabilny, ale różny
      const seed = `${name}::${title}::${i}`;
      const note = pickNote(theme, seed);

      return { title, source, url, ts, note };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    // fallback: pusto, ale nie psujemy strony
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}


