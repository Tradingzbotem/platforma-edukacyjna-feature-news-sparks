// lib/panel/calendarImpact.ts — wspólna logika wyprowadzenia wpływu wydarzeń
import type { CalendarEvent } from './calendar7d';

export function inferImpact(ev: CalendarEvent): { chips: string[]; reactionLines: string[] } {
  const region = ev.region;
  const title = ev.event.toLowerCase();

  const isCpi = title.includes('cpi') || title.includes('inflac') || title.includes('hicp');
  const isNfp = title.includes('nfp') || title.includes('non-farm');
  const isPce = title.includes('pce');
  const isPmi = title.includes('pmi') || title.includes('ism');
  const isFomc = title.includes('fomc') || title.includes('minutes') || title.includes('fed');
  const isOil =
    title.includes('crude') ||
    title.includes('eia') ||
    title.includes('api') ||
    title.includes('zapasy ropy') ||
    title.includes('zapasy') ||
    title.includes('oil');
  const isGdp = title.includes('gdp') || title.includes('pkb');
  const isUnemp = title.includes('unemployment') || title.includes('bezroboc');
  const isRetailSales = title.includes('retail sales') || title.includes('sprzedaż detaliczna');

  // Helpers
  const euChips = ['EURUSD', 'DAX', 'Bund (DE10Y)'];
  const deChips = ['EURUSD', 'EURPLN', 'DAX', 'Bund (DE10Y)'];
  const usRates = ['UST (US10Y)'];
  const usIndex = ['US100'];
  const usdFx = ['USDJPY', 'EURUSD'];

  // CPI / Inflacja
  if (isCpi) {
    if (region === 'US') {
      return {
        chips: [...usdFx, 'Złoto', ...usIndex, ...usRates],
        reactionLines: [
          'Wyższa inflacja vs konsensus często wzmacnia USD i podnosi rentowności.',
          'Indeksy bywają wrażliwe na narrację „higher for longer”; siła reakcji zależy od skali zaskoczenia.',
        ],
      };
    }
    if (region === 'DE' || region === 'EU' || region === 'FR') {
      return {
        chips: region === 'DE' ? deChips : euChips,
        reactionLines: [
          'Zaskoczenie inflacją zmienia oczekiwania dot. stóp; typowo ruch na EUR i bundach.',
          'Indeksy w Europie reagują zależnie od rentowności i narracji EBC.',
        ],
      };
    }
  }

  // NFP / rynek pracy (US)
  if (isNfp && region === 'US') {
    return {
      chips: ['USDJPY', 'EURUSD', 'US100', ...usRates],
      reactionLines: [
        'Duże zaskoczenie potrafi szybko poruszyć USD i rentowności.',
        'Pierwsza świeca bywa zmienna; kierunek zależy od szczegółów i rewizji.',
      ],
    };
  }

  // PCE (US)
  if (isPce && region === 'US') {
    return {
      chips: ['USDJPY', 'EURUSD', 'Złoto', ...usRates],
      reactionLines: [
        'PCE wyżej od konsensusu bywa „hawkish”: często wzmacnia USD i rentowności.',
        'Reakcja zależy od kontekstu trendu i komunikacji Fed.',
      ],
    };
  }

  // PMI / ISM
  if (isPmi) {
    if (region === 'US') {
      return {
        chips: [...usIndex, ...usdFx],
        reactionLines: [
          'PMI/ISM wpływają na postrzeganie cyklu; silne odchylenia ruszają indeksy i USD.',
          'Trwałość reakcji zależy od trendu i nastroju „risk-on/risk-off”.',
        ],
      };
    }
    return {
      chips: ['DAX', 'EURUSD'],
      reactionLines: [
        'Silniejsze PMI bywa wsparciem dla indeksów regionu i EUR.',
        'Znaczenie rośnie, gdy dane wpisują się w szerszy zwrot cykliczny.',
      ],
    };
  }

  // FOMC Minutes / Fed
  if (isFomc && region === 'US') {
    return {
      chips: [...usdFx, 'Złoto', ...usIndex, ...usRates],
      reactionLines: [
        'Ton jastrzębi/gołębi często wpływa na USD, rentowności i indeksy.',
        'Interpretacja zależy od akcentów w minutes i oczekiwań rynku.',
      ],
    };
  }

  // Zapasy ropy / EIA / API
  if (isOil) {
    return {
      chips: ['WTI', 'Brent', 'USDCAD', 'Energy'],
      reactionLines: [
        'Spadek zapasów vs oczekiwania bywa wsparciem dla ropy; wzrost zapasów może ją osłabiać.',
        'Liczy się też popyt/produkcja i komentarz w raporcie.',
      ],
    };
  }

  // GDP / PKB
  if (isGdp) {
    if (region === 'UK') {
      return {
        chips: ['GBPUSD'],
        reactionLines: [
          'Odchylenie PKB miewa wpływ na GBP i oczekiwania wobec stóp BoE.',
          'Kontekst globalny potrafi wzmacniać lub tłumić reakcję.',
        ],
      };
    }
    if (region === 'DE' || region === 'EU' || region === 'FR') {
      return {
        chips: ['EURUSD', 'DAX'],
        reactionLines: [
          'PKB w Europie często wpływa pośrednio na indeksy i EUR.',
          'Znaczenie rośnie, gdy zmienia narrację o wzroście.',
        ],
      };
    }
    if (region === 'US') {
      return {
        chips: [...usIndex, ...usRates, 'USDJPY'],
        reactionLines: [
          'Silniejsze PKB bywa wsparciem dla rentowności i USD; indeksy reagują różnie.',
          'Kontekst „growth vs rates” decyduje o kierunku i zmienności.',
        ],
      };
    }
  }

  // Stopa bezrobocia (US) — często z NFP
  if (isUnemp && region === 'US') {
    return {
      chips: [...usdFx, ...usRates, ...usIndex],
      reactionLines: [
        'Wzrost bezrobocia bywa „dovish”, spadek „hawkish”, zależnie od tła.',
        'Reakcja zwykle łączona z NFP i rewizjami.',
      ],
    };
  }

  // Sprzedaż detaliczna (US) — fallback
  if (isRetailSales && region === 'US') {
    return {
      chips: [...usIndex, ...usdFx],
      reactionLines: [
        'Odchylenia sprzedaży mogą poruszać indeksy i USD krótkoterminowo.',
        'Trwałość zależy od tego, czy zmienia ocenę cyklu.',
      ],
    };
  }

  // Ogólny fallback wg regionu
  if (region === 'US') {
    return {
      chips: [...usIndex, ...usdFx, ...usRates],
      reactionLines: [
        'Możliwa reakcja na USD, rentownościach i indeksach USA — zależnie od zaskoczenia vs konsensus.',
      ],
    };
  }
  if (region === 'DE' || region === 'EU' || region === 'FR') {
    return {
      chips: ['EURUSD', 'DAX', 'Bund (DE10Y)'],
      reactionLines: [
        'Często widać ruch na EUR oraz bundach; indeksy reagują zależnie od narracji stóp.',
      ],
    };
  }
  if (region === 'UK') {
    return {
      chips: ['GBPUSD', 'FTSE100'],
      reactionLines: ['Reakcja bywa widoczna na GBP i lokalnych indeksach; zależy od zaskoczenia.'],
    };
  }

  return { chips: [], reactionLines: [] };
}


