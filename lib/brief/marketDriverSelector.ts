// lib/brief/marketDriverSelector.ts — wybór PRIMARY MARKET DRIVER dla narrative brief (bez generacji tekstu)
import { classifyNewsStoryCategories, type LiveNewsContextItem, type NewsStoryCategory } from "@/lib/brief/liveNewsContext";

export type MarketDriverCategory =
  | "geopolitics"
  | "energy"
  | "central_banks"
  | "inflation"
  | "rates"
  | "fx"
  | "equities_macro"
  | "company_specific"
  | "m_and_a"
  | "other";

export type MarketDriverSelection = {
  primaryTheme: string;
  category: MarketDriverCategory;
  relatedNews: LiveNewsContextItem[];
};

export type PrimaryMarketThemeSelection = {
  themeKey: string;
  primaryThemeLabel: string;
  category: MarketDriverCategory;
  score: number;
  relatedNews: Array<LiveNewsContextItem & { themeKey: string }>;
  clusterSize: number;
};

const BASE_WEIGHT: Record<MarketDriverCategory, number> = {
  geopolitics: 10,
  energy: 10,
  central_banks: 9,
  inflation: 9,
  rates: 9,
  fx: 8,
  equities_macro: 7,
  company_specific: 3,
  m_and_a: 2,
  other: 1,
};

/** „Macro” w sensie zasad: spółki nie mogą wygrać, jeśli którykolwiek news dotyka tych tematów. */
const MACRO_OR_SYSTEMIC: ReadonlySet<MarketDriverCategory> = new Set([
  "geopolitics",
  "energy",
  "central_banks",
  "inflation",
  "rates",
  "fx",
  "equities_macro",
]);

/** Kolejność tie-break przy tym samym sumarycznym score (ważniejszy rynek = wyżej). */
const CATEGORY_PRIORITY: readonly MarketDriverCategory[] = [
  "geopolitics",
  "energy",
  "central_banks",
  "inflation",
  "rates",
  "fx",
  "equities_macro",
  "company_specific",
  "m_and_a",
  "other",
] as const;

const PRIMARY_THEME_LABEL: Record<MarketDriverCategory, string> = {
  geopolitics: "Geopolityka i napięcia międzynarodowe",
  energy: "Energia i surowce (ropa, gaz)",
  central_banks: "Banki centralne i polityka pieniężna",
  inflation: "Inflacja i ceny (CPI, PCE)",
  rates: "Stopy procentowe i rentowności / obligacje",
  fx: "Waluty i rynek FX",
  equities_macro: "Akcyjny obraz makro (indeksy, cykl)",
  company_specific: "Wydarzenia spółkowe",
  m_and_a: "Fuzje, przejęcia i transakcje",
  other: "Pozostałe tematy rynkowe",
};

/** Etykiety dla konkretnych themeKey (inferMarketThemeKey). */
const THEME_KEY_PRIMARY_LABEL: Record<string, string> = {
  iran_hormuz_oil: "Iran, Hormuz i ryzyko dla ropy",
  opec_supply: "OPEC i polityka podaży",
  fed_higher_for_longer: "Fed: dłużej restrykcyjna polityka",
  fed_rate_cut_path: "Fed: ścieżka cięć stóp",
  us_cpi_inflation: "Inflacja USA (CPI / PCE)",
  us_yields_jump: "Rentowności USA (Treasury, obligacje)",
  ecb_rate_path: "ECB i ścieżka stóp (strefa euro)",
  boe_rate_path: "BOE, inflacja i stopy w UK",
  boj_yen_policy: "BOJ, jen i polityka",
  apple_earnings: "Wyniki Apple",
  nvidia_ai_demand: "Nvidia i popyt na AI / chipy",
};

function primaryThemeLabelForKey(themeKey: string, clusterCategory: MarketDriverCategory): string {
  if (THEME_KEY_PRIMARY_LABEL[themeKey]) return THEME_KEY_PRIMARY_LABEL[themeKey];
  if (themeKey.endsWith("_generic")) {
    const raw = themeKey.slice(0, -"_generic".length);
    if (raw && raw in PRIMARY_THEME_LABEL) {
      return `${PRIMARY_THEME_LABEL[raw as MarketDriverCategory]} (ogólne)`;
    }
  }
  return PRIMARY_THEME_LABEL[clusterCategory];
}

function normBlob(it: LiveNewsContextItem): string {
  return `${it.title} ${it.summary}`.toLowerCase();
}

function resolveStoryCategories(it: LiveNewsContextItem): NewsStoryCategory[] {
  return it.categories?.length ? it.categories : classifyNewsStoryCategories(it.title, it.summary);
}

// --- Konkretne themeKey (deterministyczne reguły; kolejność = priorytet) -----------------

const RE = {
  usCpi: /\bu\.?s\.?\s+cpi\b|\bcpi\b.*\b(u\.?s\.?|american|united\s+states)\b|\b(u\.?s\.?|american)\b.*\bcpi\b|\bus\s+consumer\s+prices\b|\bu\.?s\.?\s+inflation\b|\bpce\b|\bcore\s+pce\b/i,
  ukCue: /\buk\b|\britain\b|\british\b|\bbank\s+of\s+england\b|\bboe\b|\bbailey\b|\bgilt(s)?\b|\buk\s+cpi\b|\bcpi\s+in\s+the\s+uk\b/i,
  fedCue: /\bfed\b|\bfomc\b|\bpowell\b|\bfederal\s+reserve\b/i,
} as const;

function matchIranHormuzOil(b: string): boolean {
  const geo = /\biran\b|\btehran\b|\bhormuz\b|\bstrait\s+of\s+hormuz\b|\bpersian\s+gulf\b/.test(b);
  const oilFlow = /\boil\b|\bcrude\b|\bshipping\b|\btanker\b|\benergy\s+exports?\b|\bports?\b/.test(b);
  const sanctionsOil = /\bsanctions\b/.test(b) && /\b(oil|crude|iran|hormuz|persian|tanker|shipping)\b/.test(b);
  return (geo && (oilFlow || /\bsanctions\b/.test(b))) || sanctionsOil;
}

function matchOpecSupply(b: string): boolean {
  return /\bopec\b|\bopec\+\b|\bproduction\s+cut\b|\bsupply\s+cut\b|\boutput\s+cut\b|\boutput\s+target\b/i.test(b);
}

function matchFedContext(b: string): boolean {
  return RE.fedCue.test(b) && /\binflation\b|\brate(s)?\b|\bcut(s)?\b|\bhike\b|\bcpi\b|\bpce\b|\bpause\b|\beasing\b|\bhawkish\b|\bdovish\b|\bpivot\b|\bhold\b|\bpolicy\b/i.test(b);
}

function inferFedThemeKey(b: string): "fed_higher_for_longer" | "fed_rate_cut_path" {
  const cutPath =
    /\brate\s+cut(s)?\b|\bcuts?\s+to\s+rates\b|\beasing\b|\bdovish\b|\bpivot\b|\blower\s+rates\b|\baggressive\s+easing\b|\bstart\s+cutting\b/i.test(b);
  const holdHawk =
    /\bhigher[\s-]+for[\s-]+longer\b|\bhawkish\b|\bno\s+rush\b|\brestrictive\b|\bhold\s+rates\b|\bpause\b|\bsticky\b|\bnot\s+cutting\b|\bpatient\b/i.test(
      b,
    );
  if (cutPath && !holdHawk) return "fed_rate_cut_path";
  if (holdHawk && !cutPath) return "fed_higher_for_longer";
  if (cutPath) return "fed_rate_cut_path";
  return "fed_higher_for_longer";
}

function matchUsCpiInflation(b: string): boolean {
  if (RE.ukCue.test(b) && !/\bu\.?s\.?\b|\bamerican\b|\bu\.s\.\s+cpi\b/i.test(b)) return false;
  return RE.usCpi.test(b) || (/\bcpi\b/.test(b) && /\bfed\b|\bus\b|\bu\.s\.\b|\bamerican\b/i.test(b));
}

function matchUsYieldsJump(b: string): boolean {
  if (/\bgilt\b|\buk\s+yield\b|\bbailey\b/i.test(b) && !/\btreasur(y|ies)\b|\bu\.?s\.?\s+\d+\s*-\s*year\b|\bt\-note\b/i.test(b)) return false;
  return (
    /\btreasur(y|ies)\b|\bt\-note\b|\bus\s+\d+\s*-\s*year\b|\b10[\-\s]?year\b.*\byield\b|\byield(s)?\b.*\bjump(s|ed)?\b|\byield(s)?\b.*\bspike(s|d)?\b|\bbond(s)?\b.*\bselloff\b|\bselloff\b.*\bbond/i.test(
      b,
    ) || (/\byield(s)?\b/.test(b) && /\bsurge|soar|spike|plunge|jump/i.test(b) && /\bu\.?s\.?\b|\btreasur/i.test(b))
  );
}

function matchEcbPath(b: string): boolean {
  return /\becb\b|\blagarde\b|\beuro\s*zone\s+rates\b|\beurozone\s+policy\b/i.test(b);
}

function matchBoePath(b: string): boolean {
  return /\bbank\s+of\s+england\b|\bboe\b|\bbailey\b/i.test(b) || (RE.ukCue.test(b) && /\binflation\b|\brate(s)?\b|\bcpi\b/i.test(b));
}

function matchBojYen(b: string): boolean {
  return (
    /\bboj\b|\bbank\s+of\s+japan\b|\bueda\b/i.test(b) ||
    (/\byen\b|\bjpy\b/i.test(b) && /\bintervention\b|\bweak\s+yen\b|\bstrong\s+yen\b|\bmofer\b|\bministry\s+of\s+finance\b/i.test(b))
  );
}

function matchAppleEarnings(b: string): boolean {
  return /\bapple\b|\baapl\b/i.test(b) && /\bearnings\b|\bguidance\b|\bquarterly\b|\bprofit\b|\brevenue\b|\biphone\b/i.test(b);
}

function matchNvidiaAiDemand(b: string): boolean {
  return (
    /\bnvidia\b|\bnvda\b/i.test(b) && /\bai\b|\bgpu\b|\bachip\b|\bdatacenter\b|\bdata\s+center\b|\bblackwell\b|\bchips?\b/i.test(b)
  );
}

/**
 * Konkretny klucz tematu dla jednego newsa (regex / słowa kluczowe, bez AI).
 * Kolejność reguł jest nadrzędna — dodawaj nowe reguły jako wcześniejsze `tryMatch`, jeśli mają pierwszeństwo.
 */
export function inferMarketThemeKey(item: LiveNewsContextItem): string {
  const b = normBlob(item);

  if (matchIranHormuzOil(b)) return "iran_hormuz_oil";
  if (matchOpecSupply(b)) return "opec_supply";
  if (matchFedContext(b)) return inferFedThemeKey(b);
  if (matchUsCpiInflation(b)) return "us_cpi_inflation";
  if (matchUsYieldsJump(b)) return "us_yields_jump";
  if (matchEcbPath(b)) return "ecb_rate_path";
  if (matchBoePath(b)) return "boe_rate_path";
  if (matchBojYen(b)) return "boj_yen_policy";
  if (matchAppleEarnings(b)) return "apple_earnings";
  if (matchNvidiaAiDemand(b)) return "nvidia_ai_demand";

  return fallbackThemeKeyForItem(item);
}

/** Zwraca ten sam news z dołączonym `themeKey` (bez mutacji wejścia). */
export function attachMarketThemeKey<T extends LiveNewsContextItem>(item: T): T & { themeKey: string } {
  return { ...item, themeKey: inferMarketThemeKey(item) };
}

export type MarketThemeKeyFixture = {
  /** Krótka nazwa case’u (log / debug). */
  label: string;
  item: LiveNewsContextItem;
  expectedThemeKey: string;
};

/**
 * 10 sztucznych nagłówków + oczekiwany `themeKey` (do ręcznej weryfikacji lub skryptu).
 * Uruchomienie: `npx tsx -e "import { verifyMarketThemeKeyFixtures } from './lib/brief/marketDriverSelector.ts'; console.log(verifyMarketThemeKeyFixtures())"`
 */
export const MARKET_THEME_KEY_FIXTURES: MarketThemeKeyFixture[] = [
  {
    label: "iran-hormuz-oil",
    item: {
      title: "Oil jumps as traders weigh Hormuz shipping risk after Iran tensions",
      summary: "Crude benchmarks rose on sanctions and tanker concerns near the Strait of Hormuz.",
      source: "Reuters",
    },
    expectedThemeKey: "iran_hormuz_oil",
  },
  {
    label: "opec-supply",
    item: {
      title: "OPEC+ agrees to extend production cuts through next quarter",
      summary: "Members reaffirmed supply discipline and output targets.",
      source: "Investing.com",
    },
    expectedThemeKey: "opec_supply",
  },
  {
    label: "fed-higher-for-longer",
    item: {
      title: "Powell says Fed can stay patient as inflation remains sticky",
      summary: "Chair signals higher-for-longer stance and no rush to cut rates.",
      source: "Reuters",
    },
    expectedThemeKey: "fed_higher_for_longer",
  },
  {
    label: "fed-rate-cut-path",
    item: {
      title: "FOMC dots hint at faster easing as traders price deeper rate cuts",
      summary: "Markets react to dovish pivot language and expectations of multiple cuts.",
      source: "Reuters",
    },
    expectedThemeKey: "fed_rate_cut_path",
  },
  {
    label: "us-cpi",
    item: {
      title: "US CPI cools more than expected in latest month",
      summary: "Consumer prices rose at a slower pace, easing pressure on households.",
      source: "Reuters",
    },
    expectedThemeKey: "us_cpi_inflation",
  },
  {
    label: "us-yields",
    item: {
      title: "Treasury selloff sends 10-year yield jumping to session highs",
      summary: "Bonds slide as traders reassess the rate path after strong data.",
      source: "Investing.com",
    },
    expectedThemeKey: "us_yields_jump",
  },
  {
    label: "ecb",
    item: {
      title: "Lagarde: ECB will be data-dependent on next rate move",
      summary: "Euro zone inflation trajectory remains key for Governing Council.",
      source: "Reuters",
    },
    expectedThemeKey: "ecb_rate_path",
  },
  {
    label: "boe",
    item: {
      title: "BOE officials warn UK inflation could prove persistent",
      summary: "Bank of England speakers highlight services prices and wage pressure.",
      source: "Reuters",
    },
    expectedThemeKey: "boe_rate_path",
  },
  {
    label: "apple-earnings",
    item: {
      title: "Apple shares rally after earnings beat and upbeat guidance",
      summary: "iPhone revenue and services strength lift quarterly profit above estimates.",
      source: "Reuters",
    },
    expectedThemeKey: "apple_earnings",
  },
  {
    label: "nvidia-ai",
    item: {
      title: "Nvidia jumps on strong AI chip demand and data center outlook",
      summary: "NVDA guidance reflects robust GPU orders from hyperscalers.",
      source: "Investing.com",
    },
    expectedThemeKey: "nvidia_ai_demand",
  },
];

/** Prosty checker fixture’ów (bez frameworka testowego). */
export function verifyMarketThemeKeyFixtures(): {
  passed: boolean;
  failures: { label: string; expectedThemeKey: string; actualThemeKey: string }[];
} {
  const failures: { label: string; expectedThemeKey: string; actualThemeKey: string }[] = [];
  for (const f of MARKET_THEME_KEY_FIXTURES) {
    const actualThemeKey = inferMarketThemeKey(f.item);
    if (actualThemeKey !== f.expectedThemeKey) {
      failures.push({ label: f.label, expectedThemeKey: f.expectedThemeKey, actualThemeKey });
    }
  }
  return { passed: failures.length === 0, failures };
}

function fallbackThemeKeyForItem(it: LiveNewsContextItem): string {
  const storyCats = resolveStoryCategories(it);
  const driverCats = mapStoryToDriverCategories(storyCats);
  const blob = normBlob(it);
  const { primary } = pickPrimaryDriverCategory(driverCats, blob);
  return `${primary}_generic`;
}

function mapStoryToDriverCategories(cats: NewsStoryCategory[]): MarketDriverCategory[] {
  const out = new Set<MarketDriverCategory>();
  for (const c of cats) {
    if (c === "geopolitics") out.add("geopolitics");
    else if (c === "energy") out.add("energy");
    else if (c === "central_banks") out.add("central_banks");
    else if (c === "inflation") out.add("inflation");
    else if (c === "rates") out.add("rates");
    else if (c === "fx") out.add("fx");
    else if (c === "equities_index" || c === "macro" || c === "sector_specific") out.add("equities_macro");
    else if (c === "company_specific") out.add("company_specific");
    else if (c === "m_and_a") out.add("m_and_a");
    else out.add("other");
  }
  return [...out];
}

/**
 * Stopy/obligacje: polityka monetarna → waga 9; czysty rynek obligacji → 8 (wg spec: fx/bonds → 8).
 */
function ratesBaseWeight(blob: string, driverCats: MarketDriverCategory[]): number {
  const b = blob.toLowerCase();
  const policyCue =
    /\bfed\b|\bfomc\b|\bpowell\b|\becb\b|\blagarde\b|\bbank\s+of\s+england\b|\bboe\b|\bboj\b|\brate\s+decision\b|\bhike\b|\bcut\b.*\brate\b|\bpolicy\s+rate\b/i.test(
      b,
    );
  if (policyCue || driverCats.includes("central_banks")) return 9;
  if (driverCats.includes("rates")) return 8;
  return BASE_WEIGHT.rates;
}

function effectiveBaseWeight(cat: MarketDriverCategory, blob: string, driverCats: MarketDriverCategory[]): number {
  if (cat === "rates") return ratesBaseWeight(blob, driverCats);
  return BASE_WEIGHT[cat];
}

/** +3 jeśli wystąpi którykolwiek z wymienionych sygnałów (raz na news). */
function impactBoost(blob: string): number {
  const b = blob.toLowerCase();
  if (/\biran\b|\btehran\b/.test(b)) return 3;
  if (/\bcrude\b|\bhormuz\b|\bstrait\s+of\s+hormuz\b/.test(b)) return 3;
  if (/\boil\b/.test(b)) return 3;
  if (/\bfed\b|\bfomc\b|\bcpi\b/.test(b)) return 3;
  if (/\binflation\b/.test(b)) return 3;
  if (/\bwar\b|\bsanctions\b/.test(b)) return 3;
  return 0;
}

function pickPrimaryDriverCategory(
  driverCats: MarketDriverCategory[],
  blob: string,
): { primary: MarketDriverCategory; basePoints: number } {
  const uniq = [...new Set(driverCats.length ? driverCats : (["other"] as const))];
  let best: MarketDriverCategory = "other";
  let bestW = -1;
  let bestPri = 999;

  for (const c of uniq) {
    const w = effectiveBaseWeight(c, blob, uniq);
    const pri = CATEGORY_PRIORITY.indexOf(c);
    if (w > bestW || (w === bestW && pri < bestPri)) {
      bestW = w;
      best = c;
      bestPri = pri;
    }
  }

  return { primary: best, basePoints: bestW };
}

function itemTouchesMacroOrGeo(it: LiveNewsContextItem): boolean {
  const storyCats = it.categories?.length
    ? it.categories
    : classifyNewsStoryCategories(it.title, it.summary);
  const drivers = mapStoryToDriverCategories(storyCats);
  return drivers.some((d) => MACRO_OR_SYSTEMIC.has(d));
}

/**
 * Wybiera PRIMARY MARKET DRIVER na podstawie listy newsów (np. z fetchLiveNewsContextItems).
 * Nie generuje tekstu briefu — tylko kategorię, etykietę tematu i powiązane nagłówki.
 */
export function selectPrimaryMarketDriver(items: LiveNewsContextItem[]): MarketDriverSelection {
  if (!items.length) {
    return {
      primaryTheme: PRIMARY_THEME_LABEL.other,
      category: "other",
      relatedNews: [],
    };
  }

  const totals = new Map<MarketDriverCategory, number>();
  const primaries = new Map<LiveNewsContextItem, MarketDriverCategory>();

  for (const c of CATEGORY_PRIORITY) {
    totals.set(c, 0);
  }

  for (const it of items) {
    const storyCats = it.categories?.length
      ? it.categories
      : classifyNewsStoryCategories(it.title, it.summary);
    const driverCats = mapStoryToDriverCategories(storyCats);
    const blob = normBlob(it);
    const { primary, basePoints } = pickPrimaryDriverCategory(driverCats, blob);
    const boost = impactBoost(blob);
    const add = basePoints + boost;

    totals.set(primary, (totals.get(primary) ?? 0) + add);
    primaries.set(it, primary);
  }

  const macroTouch = items.some(itemTouchesMacroOrGeo);

  const eligible = CATEGORY_PRIORITY.filter((c) => {
    if (!macroTouch) return true;
    if (c === "company_specific" || c === "m_and_a") return false;
    return true;
  });

  let winner: MarketDriverCategory = "other";
  let bestScore = -Infinity;

  for (const c of eligible) {
    const s = totals.get(c) ?? 0;
    if (s > bestScore) {
      bestScore = s;
      winner = c;
    } else if (s === bestScore) {
      const priC = CATEGORY_PRIORITY.indexOf(c);
      const priW = CATEGORY_PRIORITY.indexOf(winner);
      if (priC < priW) winner = c;
    }
  }

  const related = items.filter((it) => primaries.get(it) === winner);

  return {
    primaryTheme: PRIMARY_THEME_LABEL[winner],
    category: winner,
    relatedNews: related,
  };
}

type ThemeClusterRow = {
  item: LiveNewsContextItem;
  themeKey: string;
  primary: MarketDriverCategory;
  score: number;
};

function itemPrimaryCategoryAndThemeScore(it: LiveNewsContextItem): ThemeClusterRow {
  const storyCats = it.categories?.length ? it.categories : classifyNewsStoryCategories(it.title, it.summary);
  const driverCats = mapStoryToDriverCategories(storyCats);
  const blob = normBlob(it);
  const { primary, basePoints } = pickPrimaryDriverCategory(driverCats, blob);
  const boost = impactBoost(blob);
  return {
    item: it,
    themeKey: inferMarketThemeKey(it),
    primary,
    score: basePoints + boost,
  };
}

function bestCategoryInCluster(rows: ThemeClusterRow[]): MarketDriverCategory {
  let best: MarketDriverCategory = "other";
  let bestPri = 999;
  for (const r of rows) {
    const pri = CATEGORY_PRIORITY.indexOf(r.primary);
    if (pri < bestPri) {
      bestPri = pri;
      best = r.primary;
    }
  }
  return best;
}

/**
 * Wybiera dominujący temat na poziomie `themeKey` (agregacja klastrów), z tą samą punktacją co przy wyborze kategorii:
 * waga bazowa primary category + impact boost na news.
 */
export function selectPrimaryMarketTheme(items: LiveNewsContextItem[]): PrimaryMarketThemeSelection {
  if (!items.length) {
    return {
      themeKey: "other_generic",
      primaryThemeLabel: PRIMARY_THEME_LABEL.other,
      category: "other",
      score: 0,
      relatedNews: [],
      clusterSize: 0,
    };
  }

  const rows = items.map(itemPrimaryCategoryAndThemeScore);
  const byKey = new Map<string, ThemeClusterRow[]>();
  for (const r of rows) {
    const list = byKey.get(r.themeKey);
    if (list) list.push(r);
    else byKey.set(r.themeKey, [r]);
  }

  let winnerKey = "";
  let winnerScore = -Infinity;
  let winnerCatPri = 999;
  let winnerSize = -1;

  for (const [themeKey, cluster] of byKey) {
    const score = cluster.reduce((s, r) => s + r.score, 0);
    const catPri = Math.min(...cluster.map((r) => CATEGORY_PRIORITY.indexOf(r.primary)));
    const size = cluster.length;

    if (score > winnerScore) {
      winnerKey = themeKey;
      winnerScore = score;
      winnerCatPri = catPri;
      winnerSize = size;
      continue;
    }
    if (score < winnerScore) continue;

    if (catPri < winnerCatPri) {
      winnerKey = themeKey;
      winnerCatPri = catPri;
      winnerSize = size;
      continue;
    }
    if (catPri > winnerCatPri) continue;

    if (size > winnerSize) {
      winnerKey = themeKey;
      winnerCatPri = catPri;
      winnerSize = size;
      continue;
    }
    if (size < winnerSize) continue;

    if (themeKey < winnerKey) {
      winnerKey = themeKey;
      winnerCatPri = catPri;
      winnerSize = size;
    }
  }

  const winnerCluster = byKey.get(winnerKey) ?? rows;
  const category = bestCategoryInCluster(winnerCluster);
  const relatedNews = winnerCluster.map((r) => ({ ...r.item, themeKey: r.themeKey }));

  return {
    themeKey: winnerKey,
    primaryThemeLabel: primaryThemeLabelForKey(winnerKey, category),
    category,
    score: winnerScore,
    relatedNews,
    clusterSize: winnerCluster.length,
  };
}
