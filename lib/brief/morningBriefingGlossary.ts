import type {
  MorningInstitutionalBriefing,
  MorningInstitutionalDepth,
  MorningInstitutionalLanguage,
} from '@/lib/brief/morningInstitutionalBriefingTypes';
import {
  formatBriefingDateTime,
  getMorningBriefingLocale,
  languageValueLineForTxt,
} from '@/lib/brief/morningBriefingLocale';

export type MorningBriefingGlossaryEntry = {
  term: string;
  definition: string;
  whyItMattersHere: string;
};

export type MorningBriefingGlossaryDoc = {
  title: string;
  entries: MorningBriefingGlossaryEntry[];
};

type Lang = MorningInstitutionalLanguage;

type ConceptRow = {
  id: string;
  /** Wyższa wartość = wyżej przy remisie punktów. */
  priority: number;
  /** Wzorce dopasowania (Unicode, case-insensitive). */
  patterns: RegExp[];
  copy: Record<
    Lang,
    {
      term: string;
      definition: string;
      whyFallback: string;
    }
  >;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Nazwa pliku: język słowniczka + język źródłowego briefingu + zakres + znacznik czasu. */
export function morningBriefingGlossaryTxtFilename(
  glossaryLanguage: MorningInstitutionalLanguage,
  briefingLanguage: MorningInstitutionalLanguage,
  depth: MorningInstitutionalDepth,
  at: Date,
): string {
  const y = at.getFullYear();
  const mo = pad2(at.getMonth() + 1);
  const d = pad2(at.getDate());
  const h = pad2(at.getHours());
  const mi = pad2(at.getMinutes());
  return `morning-briefing-glossary-${glossaryLanguage}-from-${briefingLanguage}-${depth}-${y}-${mo}-${d}-${h}-${mi}.txt`;
}

/** Tekst briefingu do dopasowania haseł (bez etykiet sekcji — sam kontent). */
export function flattenMorningBriefingForGlossaryMatch(b: MorningInstitutionalBriefing): string {
  const chunks: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t) chunks.push(t);
  };
  for (const x of b.whatsDifferentVsRecentDays) push(x);
  for (const x of b.tldr) push(x);
  push(b.executiveSummary);
  for (const region of [b.macro.usa, b.macro.europe, b.macro.asia, b.macro.geopolitics]) {
    for (const m of region) {
      push(m.title);
      push(m.whatHappened);
      push(m.whyItMatters);
      push(m.marketImpact);
    }
  }
  for (const ev of b.events) {
    push(ev.name);
    push(ev.expectation);
    push(ev.bullCase);
    push(ev.bearCase);
    push(ev.marketImpact);
  }
  for (const a of b.assets) {
    push(a.asset);
    push(a.currentContext);
    push(a.drivers);
    if (a.livePrice?.trim()) push(a.livePrice);
    push(a.triggerBull);
    push(a.triggerBear);
    push(a.triggerLogic);
    for (const h of a.historicalBehavior) {
      push(h.setup);
      push(h.reaction);
      push(h.lesson);
    }
  }
  for (const x of b.crossAssetLinks) push(x);
  for (const s of b.scenarios) {
    push(s.title);
    push(s.scenarioIf);
    push(s.scenarioThen);
    push(s.confirmation);
    push(s.crossAssetReaction);
  }
  push(b.quickSummary ?? '');
  return chunks.join('\n');
}

function normalizeForMatch(s: string): string {
  return s.toLowerCase();
}

function countPatternHits(normalizedHaystack: string, patterns: RegExp[]): number {
  let n = 0;
  for (const p of patterns) {
    const re = new RegExp(p.source, p.flags.includes('g') ? p.flags : `${p.flags}g`);
    const m = normalizedHaystack.match(re);
    if (m) n += m.length;
  }
  return n;
}

function firstMatchIndexInOriginal(original: string, patterns: RegExp[]): number {
  let best = Infinity;
  for (const p of patterns) {
    const re = new RegExp(p.source, p.flags.replace(/g/g, ''));
    const m = re.exec(original);
    if (m && m.index >= 0 && m.index < best) best = m.index;
  }
  return best === Infinity ? -1 : best;
}

function excerptAroundIndex(text: string, idx: number, maxLen: number): string {
  if (idx < 0) return '';
  const start = Math.max(0, idx - Math.floor(maxLen * 0.35));
  let end = Math.min(text.length, idx + Math.ceil(maxLen * 0.65));
  let slice = text.slice(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) slice = `…${slice}`;
  if (end < text.length) slice = `${slice}…`;
  if (slice.length > maxLen + 4) slice = `${slice.slice(0, maxLen).trim()}…`;
  return slice;
}

const RX = {
  inflation: [
    /\binflation\b/giu,
    /\binflace\b/giu,
    /\binflaci\b/giu,
    /\binflacja\w*\b/giu,
    /\binflacj\w*\b/giu,
    /\binflac\w+\b/giu,
    /\binflationary\b/giu,
  ],
  cpi: [/\bcpi\b/giu, /\bconsumer price index\b/giu, /\bindex cen konsumpcyjnych\b/giu, /\bspotřebitelsk(é|ych) cen\w*\b/giu],
  ppi: [/\bppi\b/giu, /\bproducer price index\b/giu, /\bindex cen producenckich\b/giu, /\bvýrobn(í|ích) cen\w*\b/giu],
  gdp: [
    /\bgdp\b/giu,
    /\bpkb\b/giu,
    /\bgross domestic product\b/giu,
    /\bprodukt krajowy brutto\b/giu,
    /\bhrub(ý|ého) domác(í|ího) produkt\w*\b/giu,
  ],
  interest_rates: [
    /\binterest rates?\b/giu,
    /\b(policy )?rates?\b/giu,
    /\bstopy procentowe\b/giu,
    /\búrokov(é|ých) sazb\w*\b/giu,
    /\búrokov(á|é) sazby\b/giu,
    /\brate (hike|cut)s?\b/giu,
    /\bhawkish\b/giu,
    /\bdovish\b/giu,
  ],
  central_bank: [
    /\bcentral bank\b/giu,
    /\bbank centralny\b/giu,
    /\bcentrální bank\w*\b/giu,
    /\bmonetary policy\b/giu,
    /\bpolityka pieniężna\b/giu,
    /\bměnová politika\b/giu,
  ],
  fed: [
    /\bfed\b/giu,
    /\bfederal reserve\b/giu,
    /\bfomc\b/giu,
    /\brezerwa federalna\b/giu,
  ],
  ecb: [
    /\becb\b/giu,
    /\bebc\b/giu,
    /\beuropean central bank\b/giu,
    /\beuropejsk(ie|i) bank(u| centralnego)? centraln\w*\b/giu,
    /\bevropsk(á|é) centrální bank\w*\b/giu,
  ],
  bonds: [
    /\bbonds?\b/giu,
    /\bobligacj\w+\b/giu,
    /\bdlu(ż|z)sz\w* obligac\w*\b/giu,
    /\bdlu(ż|z)ne\b/giu,
    /\bdluhopis\w*\b/giu,
    /\btreasur(y|ies)\b/giu,
  ],
  bond_yield: [
    /\byields?\b/giu,
    /\bbond yield\w*\b/giu,
    /\brentowno(ść|ści)\b/giu,
    /\byield curve\b/giu,
    /\bkrzywa dochodowo(ść|ści)\b/giu,
    /\bvýnos\w* (dluhopis|obligac)\w*\b/giu,
  ],
  spread: [/\bspread\w*\b/giu, /\bspready\b/giu, /\bcredit spread\w*\b/giu],
  usd: [
    /\busd\b/giu,
    /\bdollar\b/giu,
    /\bdolar\w*\b/giu,
    /\bdolarů\b/giu,
    /\bdxy\b/giu,
    /\bus dollar\b/giu,
    /\bsila dolara\b/giu,
    /\bsíla dolaru\b/giu,
    /\bstrength of (the )?usd\b/giu,
  ],
  risk_on_off: [/\brisk[- ]?on\b/giu, /\brisk[- ]?off\b/giu],
  volatility: [/\bvolatility\b/giu, /\bzmienno(ść|ści)\b/giu, /\bvolatilit\w+\b/giu, /\bvolatile\b/giu],
  vix: [/\bvix\b/giu, /\bfear index\b/giu, /\bindeks strachu\b/giu],
  oil: [
    /\bbrent\b/giu,
    /\bwti\b/giu,
    /\bcrude\b/giu,
    /\brope\b/giu,
    /\bropy\b/giu,
    /\bropy naftowej\b/giu,
    /\bnafta\b/giu,
    /\boil\b/giu,
    /\biran\w*\b/giu,
    /\bopec\b/giu,
  ],
  gold: [/\bgold\b/giu, /\bzłot\w+\b/giu, /\bzlat\w+\b/giu, /\bxau\b/giu],
  equity_index: [
    /\bindeks\w* giełdow\w*\b/giu,
    /\bstock index\w*\b/giu,
    /\bequity index\w*\b/giu,
    /\bs&p\b/giu,
    /\bsp500\b/giu,
    /\bnasdaq\b/giu,
    /\bdow\b/giu,
    /\bdax\b/giu,
  ],
  correction: [/\bcorrection\b/giu, /\bkorekt\w+\b/giu, /\bpullback\b/giu, /\bdrawdown\b/giu],
  rally: [/\brally\b/giu, /\brajd\w*\b/giu, /\brip\b/giu, /\bsurge\b/giu],
  recession: [/\brecession\b/giu, /\brecesj\w+\b/giu, /\brecese\b/giu, /\bhard landing\b/giu],
  labor: [
    /\bpayrolls?\b/giu,
    /\bnfp\b/giu,
    /\bnon[- ]farm\b/giu,
    /\bemployment\b/giu,
    /\bunemployment\b/giu,
    /\brynek pracy\b/giu,
    /\btrh práce\b/giu,
    /\bnezaměstnanost\w*\b/giu,
    /\bwages?\b/giu,
    /\bplac\w+\b/giu,
  ],
  liquidity: [/\bliquidity\b/giu, /\bpłynno(ść|ści)\b/giu, /\blikvidit\w+\b/giu],
  risk_premium: [/\brisk premium\b/giu, /\bpremi\w* za ryzyko\b/giu, /\brizikov(á|ý) prémie\b/giu],
  sentiment: [/\bsentiment\b/giu, /\bsentyment\w*\b/giu, /\bnálada na trhu\b/giu, /\bmarket mood\b/giu],
  safe_haven: [/\bsafe haven\b/giu, /\bbezpieczn\w* przysta(ń|ni)\w*\b/giu, /\bútulek\b/giu, /\bhaven\b/giu],
  fx: [/\bfx\b/giu, /\bforex\b/giu, /\bforeign exchange\b/giu, /\brynek walut\w*\b/giu, /\bdeviz\w+\b/giu],
  cross_asset: [/\bcross[- ]asset\b/giu, /\bmiędzyrynkow\w*\b/giu, /\bmeziaktiv\w*\b/giu],
  real_rates: [/\breal (interest )?rates?\b/giu, /\brealn(e|ych) stop\w*\b/giu, /\brealn(é|ých) úrokov(é|ých)\b/giu],
  geopolitics: [/\bgeopolitic\w+\b/giu, /\bgeopolityk\w+\b/giu, /\bgeopolitik\w+\b/giu, /\bconflict\b/giu, /\bwar\b/giu, /\bwojn\w+\b/giu],
  commodities: [/\bcommodities\b/giu, /\bsurowc\w+\b/giu, /\bkomodit\w+\b/giu],
  supply_demand: [/\bsupply\b/giu, /\bdemand\b/giu, /\bpopyt\w*\b/giu, /\bpoda(ż|z)\w*\b/giu, /\bpoptávka\b/giu, /\bnabídka\b/giu],
};

const CONCEPTS: ConceptRow[] = [
  {
    id: 'inflation',
    priority: 95,
    patterns: RX.inflation,
    copy: {
      pl: {
        term: 'Inflacja',
        definition:
          'Utrzymujący się wzrost ogólnego poziomu cen dóbr i usług; zwykle mierzony w ujęciu rocznym.',
        whyFallback:
          'W makrobriefingu inflacja warunkuje oczekiwania co do stóp, realnych stóp i wyceny aktywów.',
      },
      en: {
        term: 'Inflation',
        definition:
          'A sustained rise in the general price level of goods and services, usually quoted as a year-on-year rate.',
        whyFallback:
          'In a macro briefing, inflation shapes expectations for policy rates, real rates, and asset pricing.',
      },
      cs: {
        term: 'Inflace',
        definition:
          'Trvalý růst obecné cenové hladiny zboží a služeb, obvykle vyjádřený meziročně.',
        whyFallback:
          'V makrobriefingu inflace utváří očekávání ohledně sazeb, reálných sazeb a oceňování aktiv.',
      },
    },
  },
  {
    id: 'cpi',
    priority: 92,
    patterns: RX.cpi,
    copy: {
      pl: {
        term: 'CPI',
        definition:
          'Consumer Price Index — wskaźnik cen towarów i usług konsumpcyjnych; kluczowy pomiar inflacji konsumenckiej.',
        whyFallback:
          'Niespodzianki CPI często przesuwają oczekiwania rynku co do polityki banku centralnego.',
      },
      en: {
        term: 'CPI',
        definition:
          'Consumer Price Index — tracks prices of a basket of consumer goods and services; a core measure of consumer inflation.',
        whyFallback:
          'CPI surprises frequently shift market expectations about central-bank policy.',
      },
      cs: {
        term: 'CPI',
        definition:
          'Consumer Price Index — sleduje ceny koše spotřebního zboží a služeb; klíčová měření spotřebitelské inflace.',
        whyFallback:
          'Překvapení CPI často posouvají tržní očekávání ohledně politiky centrální banky.',
      },
    },
  },
  {
    id: 'ppi',
    priority: 78,
    patterns: RX.ppi,
    copy: {
      pl: {
        term: 'PPI',
        definition:
          'Producer Price Index — ceny na etapie producenta; wcześniejszy sygnał presji kosztowej i potencjalnej inflacji konsumenckiej.',
        whyFallback:
          'PPI pomaga ocenić, czy presja cenowa narasta jeszcze przed wejściem do CPI.',
      },
      en: {
        term: 'PPI',
        definition:
          'Producer Price Index — prices at the producer stage; an earlier read on cost pressures feeding consumer inflation.',
        whyFallback:
          'PPI helps judge whether pipeline price pressure is building before it shows up in CPI.',
      },
      cs: {
        term: 'PPI',
        definition:
          'Producer Price Index — ceny na úrovni výrobců; dřívější signál nákladových tlaků směrem ke spotřebitelské inflaci.',
        whyFallback:
          'PPI pomáhá posoudit, zda tlak na ceny v řetězci sílí dříve, než se projeví v CPI.',
      },
    },
  },
  {
    id: 'gdp',
    priority: 80,
    patterns: RX.gdp,
    copy: {
      pl: {
        term: 'PKB (GDP)',
        definition:
          'Produkt krajowy brutto — suma wartości dóbr i usług wyprodukowanych w gospodarce w danym okresie.',
        whyFallback:
          'Tempo wzrostu PKB mówi o sile cyklu i perspektywach zysków oraz polityki fiskalnej.',
      },
      en: {
        term: 'GDP',
        definition:
          'Gross Domestic Product — the total value of goods and services produced in an economy over a period.',
        whyFallback:
          'GDP growth indicates cycle strength and informs earnings and fiscal-policy prospects.',
      },
      cs: {
        term: 'HDP (GDP)',
        definition:
          'Hrubý domácí produkt — celková hodnota zboží a služeb vyrobených v ekonomice za dané období.',
        whyFallback:
          'Růst HDP ukazuje sílu cyklu a ovlivňuje očekávání zisků a fiskální politiky.',
      },
    },
  },
  {
    id: 'interest_rates',
    priority: 94,
    patterns: RX.interest_rates,
    copy: {
      pl: {
        term: 'Stopy procentowe',
        definition:
          'Koszt pieniądza w czasie; polityczna stopa narzucana przez bank centralny waży na całej krzywie i warunkach finansowania.',
        whyFallback:
          'Stopy są głównym kanałem, przez który makro przekłada się na wycenę akcji, obligacji i FX.',
      },
      en: {
        term: 'Interest rates',
        definition:
          'The price of money over time; the central bank’s policy rate anchors the curve and funding conditions.',
        whyFallback:
          'Rates are the main channel through which macro maps into equities, bonds, and FX.',
      },
      cs: {
        term: 'Úrokové sazby',
        definition:
          'Cena peněz v čase; politická sazba centrální banky ukotvuje křivku a podmínky financování.',
        whyFallback:
          'Sazby jsou hlavním kanálem, jímž se makro promítá do akcií, dluhopisů a FX.',
      },
    },
  },
  {
    id: 'central_bank',
    priority: 88,
    patterns: RX.central_bank,
    copy: {
      pl: {
        term: 'Bank centralny',
        definition:
          'Instytucja odpowiedzialna m.in. za stabilność pieniądza i inflacji; instrumentarium obejmuje stopy i bilans.',
        whyFallback:
          'Komunikacja i działania banku centralnego ustawiają „ton” dla rynków w krótkim horyzoncie.',
      },
      en: {
        term: 'Central bank',
        definition:
          'Institution responsible for monetary stability (often inflation targeting); tools include rates and the balance sheet.',
        whyFallback:
          'Central-bank communication and actions set the near-term tone for markets.',
      },
      cs: {
        term: 'Centrální banka',
        definition:
          'Instituce odpovědná za měnovou stabilitu (často cílení inflace); nástroje zahrnují sazby a bilanci.',
        whyFallback:
          'Komunikace a kroky centrální banky určují krátkodobý tón trhů.',
      },
    },
  },
  {
    id: 'fed',
    priority: 93,
    patterns: RX.fed,
    copy: {
      pl: {
        term: 'Fed (Rezerwa Federalna)',
        definition:
          'System banku centralnego USA; decyzje FOMC o stopach i komunikat mocno napędzają globalne płyności i dolara.',
        whyFallback:
          'Fed często ustawia globalny ton ryzyka i kosztu kapitału.',
      },
      en: {
        term: 'The Fed (Federal Reserve)',
        definition:
          'The US central banking system; FOMC decisions and guidance heavily influence global liquidity and the US dollar.',
        whyFallback:
          'The Fed often sets the global tone for risk appetite and the cost of capital.',
      },
      cs: {
        term: 'Fed (Federal Reserve)',
        definition:
          'Centrální bankovní systém USA; rozhodnutí FOMC a komunikace silně ovlivňují globální likviditu a dolar.',
        whyFallback:
          'Fed často určuje globální tón pro rizikovou chuť a cenu kapitálu.',
      },
    },
  },
  {
    id: 'ecb',
    priority: 86,
    patterns: RX.ecb,
    copy: {
      pl: {
        term: 'EBC (ECB)',
        definition:
          'Europejski Bank Centralny; kształtuje warunki monetarne strefy euro i często wpływa na EUR oraz obligacje peryferii.',
        whyFallback:
          'Sygnalizacja EBC przekłada się na EUR, spreadów i sektor bankowy w strefie euro.',
      },
      en: {
        term: 'ECB',
        definition:
          'European Central Bank; sets monetary conditions for the euro area and often moves the euro and periphery spreads.',
        whyFallback:
          'ECB signalling maps into the euro, sovereign spreads, and euro-area banks.',
      },
      cs: {
        term: 'ECB',
        definition:
          'Evropská centrální banka; utváří měnové podmínky eurozóny a často hýbe eurem a spready na periferii.',
        whyFallback:
          'Signály ECB se promítají do eura, státních spreadů a bank eurozóny.',
      },
    },
  },
  {
    id: 'bonds',
    priority: 82,
    patterns: RX.bonds,
    copy: {
      pl: {
        term: 'Obligacje',
        definition:
          'Instrument dłużny: pożyczka inwestora emitentowi w zamian za odsetki i zwrot kapitału wg warunków emisji.',
        whyFallback:
          'Obligacje wiążą się z oczekiwaniami co do stóp, inflacji i premii za ryzyko.',
      },
      en: {
        term: 'Bonds',
        definition:
          'Debt securities: investors lend to an issuer for coupons and principal repayment under the bond’s terms.',
        whyFallback:
          'Bonds embed expectations for rates, inflation, and risk premia.',
      },
      cs: {
        term: 'Dluhopisy',
        definition:
          'Dluhové cenné papíry: investor půjčuje emitentovi za kupón a splácení jistiny dle podmínek emise.',
        whyFallback:
          'Dluhopisy nesou očekávání ohledně sazeb, inflace a rizikových prémií.',
      },
    },
  },
  {
    id: 'bond_yield',
    priority: 91,
    patterns: RX.bond_yield,
    copy: {
      pl: {
        term: 'Rentowność obligacji',
        definition:
          'Oczekiwany zwrot z obligacji w relacji do ceny (często wyrażany jako rentowność do zapadalności).',
        whyFallback:
          'Rentowności są „termometrem” kosztu kapitału bezryzykownego i często napędzają cross-asset.',
      },
      en: {
        term: 'Bond yield',
        definition:
          'The return implied by a bond’s price (often quoted as yield to maturity).',
        whyFallback:
          'Yields act as a barometer of risk-free borrowing costs and often drive cross-asset repricing.',
      },
      cs: {
        term: 'Výnos dluhopisů',
        definition:
          'Očekávaný výnos vzhledem k ceně (často jako výnos do splatnosti).',
        whyFallback:
          'Výnosy fungují jako barometr nákladů na bezrizikové financování a často hýbou cross-asset.',
      },
    },
  },
  {
    id: 'spread',
    priority: 79,
    patterns: RX.spread,
    copy: {
      pl: {
        term: 'Spread',
        definition:
          'Różnica między dwoma stopami zwrotu lub cenami (np. obligacji vs benchmark); mierzy ryzyko lub warunki finansowania.',
        whyFallback:
          'Szerzenie się spreadów często sygnalizuje stres lub przesunięcie premii za ryzyko.',
      },
      en: {
        term: 'Spread',
        definition:
          'The gap between two yields or prices (e.g., bond vs benchmark); reflects risk or funding conditions.',
        whyFallback:
          'Widening spreads often signal stress or a repricing of risk premia.',
      },
      cs: {
        term: 'Spread',
        definition:
          'Rozdíl mezi dvěma výnosy nebo cenami (např. dluhopis vs benchmark); odráží riziko nebo financování.',
        whyFallback:
          'Rozšiřující se spready často signalizují stres nebo přecenění rizikových prémií.',
      },
    },
  },
  {
    id: 'usd',
    priority: 87,
    patterns: RX.usd,
    copy: {
      pl: {
        term: 'Dolar (USD)',
        definition:
          'Główna waluta rezerwowa; jej siła wpływa na ceny surowców denominowanych w USD i na warunki finansowania globalnego.',
        whyFallback:
          'USD czyni z siebie wspólny mianownik dla risk-on/risk-off i surowców.',
      },
      en: {
        term: 'US dollar (USD)',
        definition:
          'The dominant reserve currency; its strength affects USD-denominated commodities and global funding conditions.',
        whyFallback:
          'The dollar is a common denominator for risk sentiment and commodities.',
      },
      cs: {
        term: 'Dolar (USD)',
        definition:
          'Dominantní rezervní měna; její síla ovlivňuje komodity v USD a globální financování.',
        whyFallback:
          'Dolar je společný jmenovatel pro rizikovou náladu a komodity.',
      },
    },
  },
  {
    id: 'risk_on_off',
    priority: 84,
    patterns: RX.risk_on_off,
    copy: {
      pl: {
        term: 'Risk-on / risk-off',
        definition:
          'Styl alokacji: risk-on to preferencja aktywów ryzykownych; risk-off to ucieczka do jakości, gotówki i bezpiecznych przystani.',
        whyFallback:
          'Regim risk-on/off porządkuje korelacje między akcjami, obligacjami, FX i surowcami.',
      },
      en: {
        term: 'Risk-on / risk-off',
        definition:
          'Allocation regimes: risk-on favours risky assets; risk-off favours quality, cash, and safe havens.',
        whyFallback:
          'The risk regime organises correlations across equities, bonds, FX, and commodities.',
      },
      cs: {
        term: 'Risk-on / risk-off',
        definition:
          'Režim alokace: risk-on upřednostňuje riziková aktiva; risk-off kvalitu, hotovost a útočiště.',
        whyFallback:
          'Režim rizika organizuje korelace mezi akciemi, dluhopisy, FX a komoditami.',
      },
    },
  },
  {
    id: 'volatility',
    priority: 81,
    patterns: RX.volatility,
    copy: {
      pl: {
        term: 'Zmienność (volatility)',
        definition:
          'Skala i tempo wahań cen; wyższa zmienność oznacza większe prawdopodobieństwo dużych ruchów w krótkim czasie.',
        whyFallback:
          'Zmienność wpływa na koszt zabezpieczeń, dźwignię i zachowanie strategii trendowych.',
      },
      en: {
        term: 'Volatility',
        definition:
          'The magnitude and speed of price swings; higher volatility implies larger moves over short horizons.',
        whyFallback:
          'Volatility affects hedging costs, leverage, and how trend strategies behave.',
      },
      cs: {
        term: 'Volatilita',
        definition:
          'Velikost a rychlost cenových výkyvů; vyšší volatilita znamená větší pravděpodobnost velkých pohybů.',
        whyFallback:
          'Volatilita ovlivňuje náklady na zajištění, páku a chování trendových strategií.',
      },
    },
  },
  {
    id: 'vix',
    priority: 83,
    patterns: RX.vix,
    copy: {
      pl: {
        term: 'VIX',
        definition:
          'Indeks implikowanej zmienności opcji na S&P 500; często interpretowany jako miernik „strachu” na rynku akcji USA.',
        whyFallback:
          'Skoki VIX często korelowane są z osłabieniem akcji i wzmocnieniem aktywów defensywnych.',
      },
      en: {
        term: 'VIX',
        definition:
          'Implied volatility index from S&P 500 options; often treated as an equity “fear gauge”.',
        whyFallback:
          'VIX spikes frequently coincide with weaker equities and stronger defensive positioning.',
      },
      cs: {
        term: 'VIX',
        definition:
          'Index implikované volatility opcí na S&P 500; často vnímán jako „index strachu“ na akciích USA.',
        whyFallback:
          'Výkyvy VIX často korelují se slabšími akciemi a silnější defenzivní alokací.',
      },
    },
  },
  {
    id: 'oil',
    priority: 90,
    patterns: RX.oil,
    copy: {
      pl: {
        term: 'Ropa (Brent / WTI)',
        definition:
          'Kluczowy surowiec energetyczny; notowania Brent i WTI są referencją dla cen paliw i czynnikiem inflacyjnym.',
        whyFallback:
          'Cena ropy przenosi się na inflację, transport i nastroje wobec wzrostu globalnego.',
      },
      en: {
        term: 'Oil (Brent / WTI)',
        definition:
          'A key energy commodity; Brent and WTI benchmarks anchor fuel prices and inflation impulses.',
        whyFallback:
          'Oil passes through into inflation, transport costs, and global growth sentiment.',
      },
      cs: {
        term: 'Ropa (Brent / WTI)',
        definition:
          'Klíčová energetická komodita; benchmarky Brent a WTI ukotvují ceny paliv a inflační impulsy.',
        whyFallback:
          'Ropa se promítá do inflace, dopravy a sentimentu k globálnímu růstu.',
      },
    },
  },
  {
    id: 'gold',
    priority: 76,
    patterns: RX.gold,
    copy: {
      pl: {
        term: 'Złoto',
        definition:
          'Metal szlachetny traktowany często jako realna wartość i aktywo „bezpiecznej przystani”; wrażliwy na realne stopy i USD.',
        whyFallback:
          'Złoto bywa grą na realne stopy, geopolitykę i słabość dolara.',
      },
      en: {
        term: 'Gold',
        definition:
          'A precious metal often viewed as a store of value and a safe haven; sensitive to real rates and the dollar.',
        whyFallback:
          'Gold often trades as a play on real rates, geopolitics, and dollar weakness.',
      },
      cs: {
        term: 'Zlato',
        definition:
          'Drahý kov často vnímaný jako uchovatel hodnoty a bezpečný přístav; citlivý na reálné sazby a dolar.',
        whyFallback:
          'Zlato často reflektuje reálné sazby, geopolitiku a slabší dolar.',
      },
    },
  },
  {
    id: 'equity_index',
    priority: 75,
    patterns: RX.equity_index,
    copy: {
      pl: {
        term: 'Indeks giełdowy',
        definition:
          'Miara zagregowanej wyceny koszyka akcji (np. S&P 500); proxy dla szerokiego sentymentu do ryzyka.',
        whyFallback:
          'Indeksy upraszczają odczyt trendu risk-on/off i sektorowych rotacji.',
      },
      en: {
        term: 'Equity index',
        definition:
          'A basket-based measure of stock-market performance (e.g., S&P 500); a proxy for broad risk sentiment.',
        whyFallback:
          'Indices simplify reading risk-on/off trends and sector rotations.',
      },
      cs: {
        term: 'Akciový index',
        definition:
          'Měření výkonu koše akcií (např. S&P 500); proxy široké rizikové nálady.',
        whyFallback:
          'Indexy zjednodušují čtení trendů risk-on/off a sektorových rotací.',
      },
    },
  },
  {
    id: 'correction',
    priority: 70,
    patterns: RX.correction,
    copy: {
      pl: {
        term: 'Korekta',
        definition:
          'Odwrócenie lub cofnięcie wcześniejszego ruchu cenowego; zwykle mniejsze i krótsze niż pełny trend spadkowy.',
        whyFallback:
          'Słownictwo korekty pomaga odróżnić konsolidację od zmiany reżimu.',
      },
      en: {
        term: 'Correction (pullback)',
        definition:
          'A partial reversal or give-back of a prior price move; typically shallower than a sustained bear trend.',
        whyFallback:
          'Correction language helps distinguish consolidation from a regime change.',
      },
      cs: {
        term: 'Korekce (pullback)',
        definition:
          'Částečné zvrácení předchozího cenového pohybu; obvykle mělčí než trvalejší medvědí trend.',
        whyFallback:
          'Slovník korekcí pomáší odlišit konsolidaci od změny režimu.',
      },
    },
  },
  {
    id: 'rally',
    priority: 68,
    patterns: RX.rally,
    copy: {
      pl: {
        term: 'Rajd (rally)',
        definition:
          'Wyraźny, często szybki wzrost cen aktywa lub indeksu w stosunkowo krótkim oknie czasu.',
        whyFallback:
          'Rajdy bywają napędzane short-coveringiem, przepływami lub nagłą zmianą narracji makro.',
      },
      en: {
        term: 'Rally',
        definition:
          'A pronounced, often rapid rise in an asset or index over a relatively short window.',
        whyFallback:
          'Rallies can be driven by short covering, flows, or a sudden shift in the macro narrative.',
      },
      cs: {
        term: 'Rally',
        definition:
          'Výrazný, často rychlý růst aktiva nebo indexu v relativně krátkém horizontu.',
        whyFallback:
          'Rally může táhnout zakrývání shortů, toky nebo náhlá změna makro narrativu.',
      },
    },
  },
  {
    id: 'recession',
    priority: 77,
    patterns: RX.recession,
    copy: {
      pl: {
        term: 'Recesja',
        definition:
          'Faza cyklu ze znaczącym osłabieniem aktywności gospodarczej (definicje instytucji różnią się progowo).',
        whyFallback:
          'Ryzyko recesji przesuwa premie za ryzyko i sektorowe preferencje (np. w stronę jakości).',
      },
      en: {
        term: 'Recession',
        definition:
          'A cycle phase of broad economic weakness (institutions use different technical definitions).',
        whyFallback:
          'Recession risk shifts risk premia and sector preferences (often toward quality).',
      },
      cs: {
        term: 'Recese',
        definition:
          'Fáze cyklu se širokým ekonomickým oslabením (instituce používají různé technické definice).',
        whyFallback:
          'Riziko recese posouvá rizikové prémie a sektorové preference (často k výběrovosti).',
      },
    },
  },
  {
    id: 'labor',
    priority: 85,
    patterns: RX.labor,
    copy: {
      pl: {
        term: 'Payrolle / rynek pracy',
        definition:
          'Dane o zatrudnieniu, bezrobociu i płacach; rynek pracy wpływa na presję płacową i inflację usług.',
        whyFallback:
          'Niespodzianki payrolls często przesuwają oczekiwania co do ścieżki stóp.',
      },
      en: {
        term: 'Payrolls / labour market',
        definition:
          'Employment, unemployment, and wage data; the labour market feeds wage pressure and services inflation.',
        whyFallback:
          'Payroll surprises often move expectations for the rate path.',
      },
      cs: {
        term: 'Payrolly / trh práce',
        definition:
          'Data o zaměstnanosti, nezaměstnanosti a mzdách; trh práce naplňuje tlak na mzdy a inflaci služeb.',
        whyFallback:
          'Překvapení z payrollů často posouvají očekávání ohledně sazeb.',
      },
    },
  },
  {
    id: 'liquidity',
    priority: 72,
    patterns: RX.liquidity,
    copy: {
      pl: {
        term: 'Płynność',
        definition:
          'Łatwość kupna/sprzedaży aktywa bez dużej zmiany ceny; także obecność gotówki i finansowania na rynku.',
        whyFallback:
          'Płynność warunkuje realizację scenariuszy i głębokość ruchów w streście.',
      },
      en: {
        term: 'Liquidity',
        definition:
          'Ease of trading size without large price impact; also the availability of cash and market funding.',
        whyFallback:
          'Liquidity conditions shape how scenarios play out and how deep moves can get in stress.',
      },
      cs: {
        term: 'Likvidita',
        definition:
          'Snadnost obchodovat objem bez velkého dopadu na cenu; také dostupnost hotovosti a financování.',
        whyFallback:
          'Likvidita určuje, jak scénáře probíhají a jak hluboké mohou být pohyby ve stresu.',
      },
    },
  },
  {
    id: 'risk_premium',
    priority: 74,
    patterns: RX.risk_premium,
    copy: {
      pl: {
        term: 'Premia za ryzyko',
        definition:
          'Dodatkowy zwrot wymagany ponad aktywo referencyjne jako rekompensata za ryzyko kredytowe, polityczne lub płynnościowe.',
        whyFallback:
          'Zmiana premii za ryzyko porządkuje wycenę akcji, spreadów HY i EM.',
      },
      en: {
        term: 'Risk premium',
        definition:
          'Extra compensation above a benchmark for bearing credit, political, or liquidity risk.',
        whyFallback:
          'Risk-premium shifts organise pricing in equities, HY spreads, and EM.',
      },
      cs: {
        term: 'Riziková prémie',
        definition:
          'Dodatečná náhrada nad benchmarkem za kreditní, politické nebo likviditní riziko.',
        whyFallback:
          'Změny rizikové prémie organizují oceňování akcií, HY spreadů a EM.',
      },
    },
  },
  {
    id: 'sentiment',
    priority: 73,
    patterns: RX.sentiment,
    copy: {
      pl: {
        term: 'Sentyment',
        definition:
          'Zbiorowa nastawienie uczestników rynku do ryzyka; może być pozytywne (risk-on) lub ostrożne (risk-off).',
        whyFallback:
          'Sentyment tłumaczy ruchy nie w pełni uzasadnione samą makroliczbą z ostatniej publikacji.',
      },
      en: {
        term: 'Sentiment',
        definition:
          'The market’s collective attitude to risk; can be constructive (risk-on) or cautious (risk-off).',
        whyFallback:
          'Sentiment explains moves not fully pinned to the latest macro print alone.',
      },
      cs: {
        term: 'Sentiment',
        definition:
          'Kolektivní postoj trhu k riziku; může být konstruktivní (risk-on) nebo opatrný (risk-off).',
        whyFallback:
          'Sentiment vysvětluje pohyby, které nelze svázat jen s poslední makrodaty.',
      },
    },
  },
  {
    id: 'safe_haven',
    priority: 71,
    patterns: RX.safe_haven,
    copy: {
      pl: {
        term: 'Safe haven (bezpieczna przystań)',
        definition:
          'Aktywa, które inwestorzy kupują w niepewności (np. część obligacji, USD, złoto) — zależnie od reżimu rynku.',
        whyFallback:
          'Rotacja do safe haven pomaga czytać zmiany reżimu ryzyka w briefingu.',
      },
      en: {
        term: 'Safe haven',
        definition:
          'Assets investors buy in uncertainty (e.g., certain bonds, USD, gold) — regime-dependent.',
        whyFallback:
          'Rotation into havens helps read shifts in the market’s risk regime.',
      },
      cs: {
        term: 'Bezpečný přístav (safe haven)',
        definition:
          'Aktiva nakupovaná v nejistotě (např. vybrané dluhopisy, USD, zlato) — závisí na režimu.',
        whyFallback:
          'Rotace do útočišť pomáhá číst změny rizikového režimu trhu.',
      },
    },
  },
  {
    id: 'fx',
    priority: 78,
    patterns: RX.fx,
    copy: {
      pl: {
        term: 'FX (rynek walutowy)',
        definition:
          'Rynek wymiany walut; pary FX reagują na różnice stów, wzrost, geopolitykę i przepływy kapitału.',
        whyFallback:
          'FX przenosi narrację makro na realne koszty eksportu/importu i warunki finansowania.',
      },
      en: {
        term: 'FX (foreign exchange)',
        definition:
          'The currency market; FX pairs respond to rate differentials, growth, geopolitics, and capital flows.',
        whyFallback:
          'FX translates the macro narrative into real import/export and funding conditions.',
      },
      cs: {
        term: 'FX (devizový trh)',
        definition:
          'Trh měn; měnové páry reagují na diferenciál sazeb, růst, geopolitiku a kapitálové toky.',
        whyFallback:
          'FX přenáší makro narrativ do reálných podmínek dovozu/vývozu a financování.',
      },
    },
  },
  {
    id: 'cross_asset',
    priority: 89,
    patterns: RX.cross_asset,
    copy: {
      pl: {
        term: 'Cross-asset',
        definition:
          'Analiza powiązań między klasami aktywów (np. obligacje–akcje–FX–surowce) w jednym scenariuszu.',
        whyFallback:
          'Cross-asset pokazuje, jak ten sam szok makro może mieć różny znak na różnych rynkach.',
      },
      en: {
        term: 'Cross-asset',
        definition:
          'How asset classes co-move (e.g., bonds–equities–FX–commodities) within one macro scenario.',
        whyFallback:
          'Cross-asset shows how the same shock can have different signs across markets.',
      },
      cs: {
        term: 'Cross-asset',
        definition:
          'Souvislosti mezi třídami aktiv (např. dluhopisy–akcie–FX–komodity) v jednom scénáři.',
        whyFallback:
          'Cross-asset ukazuje, jak stejný šok může mít na trzích opačné znaménko.',
      },
    },
  },
  {
    id: 'real_rates',
    priority: 88,
    patterns: RX.real_rates,
    copy: {
      pl: {
        term: 'Realne stopy procentowe',
        definition:
          'Stopa nominalna po odjęciu oczekiwanej inflacji; ważna dla wyceny długich aktywów i złota.',
        whyFallback:
          'Realne stopy często wyjaśniają, czemu rynek „nie wierzy” w twarde dane nominalne.',
      },
      en: {
        term: 'Real interest rates',
        definition:
          'Nominal rates minus expected inflation; key for long-duration assets and gold.',
        whyFallback:
          'Real rates often explain why markets “disagree” with strong nominal data.',
      },
      cs: {
        term: 'Reálné úrokové sazby',
        definition:
          'Nominální sazby mínus očekávaná inflace; klíčové pro dlouhou duraci a zlato.',
        whyFallback:
          'Reálné sazby často vysvětlují, proč trh „nevěří“ silným nominálním datům.',
      },
    },
  },
  {
    id: 'geopolitics',
    priority: 86,
    patterns: RX.geopolitics,
    copy: {
      pl: {
        term: 'Geopolityka',
        definition:
          'Ryzyko polityczne i militarne między państwami; wpływa na surowce, łańcuchy dostaw i przepływy kapitału.',
        whyFallback:
          'Geopolityka w briefingu często napędza premie za ryzyko i scenariusze stagflacyjne.',
      },
      en: {
        term: 'Geopolitics',
        definition:
          'Political and military risk between states; affects commodities, supply chains, and capital flows.',
        whyFallback:
          'Geopolitics in briefings often drives risk premia and stagflation-style scenarios.',
      },
      cs: {
        term: 'Geopolitika',
        definition:
          'Politická a vojenská rizika mezi státy; ovlivňuje komodity, dodavatelské řetězce a toky kapitálu.',
        whyFallback:
          'Geopolitika v briefingech často žene rizikové prémie a scénáře typu stagflace.',
      },
    },
  },
  {
    id: 'commodities',
    priority: 79,
    patterns: RX.commodities,
    copy: {
      pl: {
        term: 'Surowce',
        definition:
          'Dobra fizyczne (energia, metale, żywność) wrażliwe na popyt globalny, pogodę i geopolitykę.',
        whyFallback:
          'Surowce łączą cykl, inflację i często FX (np. USD).',
      },
      en: {
        term: 'Commodities',
        definition:
          'Physical goods (energy, metals, food) sensitive to global demand, weather, and geopolitics.',
        whyFallback:
          'Commodities bridge the cycle, inflation, and often FX (notably USD).',
      },
      cs: {
        term: 'Komodity',
        definition:
          'Fyzické statky (energie, kovy, potraviny) citlivé na globální poptávku, počasí a geopolitiku.',
        whyFallback:
          'Komodity propojují cyklus, inflaci a často FX (zejména USD).',
      },
    },
  },
  {
    id: 'supply_demand',
    priority: 69,
    patterns: RX.supply_demand,
    copy: {
      pl: {
        term: 'Popyt i podaż',
        definition:
          'Mechanizm równowagi cen: większy popyt przy ograniczonej podaży podbija ceny (i odwrotnie).',
        whyFallback:
          'Język popytu/podaży porządkuje narracje o surowcach, inflacji i rynku pracy.',
      },
      en: {
        term: 'Supply and demand',
        definition:
          'Price balance mechanics: stronger demand with constrained supply pushes prices up (and vice versa).',
        whyFallback:
          'Supply/demand language structures stories about commodities, inflation, and labour.',
      },
      cs: {
        term: 'Poptávka a nabídka',
        definition:
          'Mechanismus cenové rovnováhy: silnější poptávka při omezené nabídce zdražuje (a naopak).',
        whyFallback:
          'Slovník poptávky/nabídky strukturuje příběhy o komoditách, inflaci a práci.',
      },
    },
  },
];

/** Tekst „dlaczego tutaj” w języku słowniczka; cytat z briefingu zostaje w oryginale. */
function buildWhyHere(
  glossaryLang: Lang,
  originalFlat: string,
  patterns: RegExp[],
  whyFallback: string,
): string {
  const idx = firstMatchIndexInOriginal(originalFlat, patterns);
  if (idx < 0) return whyFallback;
  const ex = excerptAroundIndex(originalFlat.replace(/\s+/g, ' '), idx, 150);
  if (!ex.trim()) return whyFallback;
  if (glossaryLang === 'pl') {
    return `W tym briefingu pojęcie pojawia się m.in. w kontekście: „${ex}”.`;
  }
  if (glossaryLang === 'en') {
    return `In this briefing it shows up in context such as: “${ex}”.`;
  }
  return `V tomto briefing se objevuje např. v souvislosti s: „${ex}”.`;
}

/**
 * Buduje słowniczek 12–25 haseł: tylko pojęcia dopasowane do treści briefingu,
 * posortowane wg trafności (liczba trafień + bonus za wystąpienie w streszczeniu/TL;DR).
 * @param glossaryLanguage Język haseł (definicje, ramki „dlaczego tutaj”); dopasowanie do treści briefingu jest niezależne od języka.
 */
export function buildMorningBriefingGlossary(
  briefing: MorningInstitutionalBriefing,
  glossaryLanguage: MorningInstitutionalLanguage,
): MorningBriefingGlossaryDoc {
  const L = getMorningBriefingLocale(glossaryLanguage);
  const originalFlat = flattenMorningBriefingForGlossaryMatch(briefing);
  const normFlat = normalizeForMatch(originalFlat);
  const headNorm = normalizeForMatch(
    [
      briefing.executiveSummary,
      ...briefing.tldr,
      ...briefing.whatsDifferentVsRecentDays.slice(0, 3),
    ].join('\n'),
  );

  type Scored = { row: ConceptRow; score: number; headBonus: number; firstIdx: number };
  const scored: Scored[] = [];

  for (const row of CONCEPTS) {
    const hits = countPatternHits(normFlat, row.patterns);
    const headHits = countPatternHits(headNorm, row.patterns);
    if (hits === 0) continue;
    const headBonus = headHits > 0 ? 8 + Math.min(6, headHits * 2) : 0;
    const score = hits * 4 + headBonus;
    const firstIdx = firstMatchIndexInOriginal(originalFlat, row.patterns);
    scored.push({ row, score, headBonus, firstIdx });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.headBonus !== a.headBonus) return b.headBonus - a.headBonus;
    if (b.row.priority !== a.row.priority) return b.row.priority - a.row.priority;
    return (a.firstIdx >= 0 ? a.firstIdx : 99999) - (b.firstIdx >= 0 ? b.firstIdx : 99999);
  });

  const picked = scored.slice(0, 25);

  const entries: MorningBriefingGlossaryEntry[] = picked.map((s) => {
    const c = s.row.copy[glossaryLanguage];
    return {
      term: c.term,
      definition: c.definition,
      whyItMattersHere: buildWhyHere(glossaryLanguage, originalFlat, s.row.patterns, c.whyFallback),
    };
  });

  return {
    title: L.glossaryDocTitle,
    entries,
  };
}

export type MorningBriefingGlossaryExportMeta = {
  generatedAt: Date;
  /** Język treści słowniczka w pliku TXT. */
  glossaryLanguage: MorningInstitutionalLanguage;
  /** Język wygenerowanego briefingu źródłowego. */
  briefingLanguage: MorningInstitutionalLanguage;
  depth: MorningInstitutionalDepth;
};

export function formatMorningBriefingGlossaryToPlainText(
  doc: MorningBriefingGlossaryDoc,
  meta: MorningBriefingGlossaryExportMeta,
): string {
  const Lg = getMorningBriefingLocale(meta.glossaryLanguage);
  const lines: string[] = [];
  const nl = () => lines.push('');
  const push = (s: string) => lines.push(s);

  push(doc.title.toUpperCase());
  nl();
  push(`${Lg.txtGeneratedAt}: ${formatBriefingDateTime(meta.generatedAt, meta.glossaryLanguage)}`);
  push(`${Lg.txtGlossaryLanguage}: ${languageValueLineForTxt(meta.glossaryLanguage)}`);
  push(
    `${Lg.glossaryLinkedBriefingLine}: ${languageValueLineForTxt(meta.briefingLanguage)}, ${Lg.txtDepthValue(meta.depth)}`,
  );
  nl();

  doc.entries.forEach((e, i) => {
    push(`${i + 1}. ${e.term}`);
    push(`${Lg.glossaryDefLabel}: ${e.definition}`);
    push(`${Lg.glossaryWhyHereLabel}: ${e.whyItMattersHere}`);
    nl();
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}
