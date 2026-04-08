// lib/brief/liveNewsContext.ts — RSS → kontekst live + klasyfikacja + lead/secondary dla morning brief
import { XMLParser } from "fast-xml-parser";
import type { BriefingLanguage } from "@/lib/brief/morningInstitutionalBriefingTypes";

export type NewsStoryCategory =
  | "macro"
  | "geopolitics"
  | "central_banks"
  | "inflation"
  | "energy"
  | "rates"
  | "fx"
  | "equities_index"
  | "company_specific"
  | "m_and_a"
  | "sector_specific"
  | "other";

export type LiveNewsContextItem = {
  title: string;
  summary: string;
  source: string;
  publishedAt?: string;
  url?: string;
  /** Klasyfikacja tematyczna (wiele etykiet możliwe, np. geopolitics + energy). */
  categories?: NewsStoryCategory[];
};

const MAX_ITEMS = 15;
const STALE_HOURS = 36;
const RECENCY_HALF_LIFE_H = 30;
const LEAD_MIN = 3;
const LEAD_MAX = 5;

const FEEDS = [
  { source: "Reuters", url: "https://www.reuters.com/markets/rss" },
  { source: "Investing.com", url: "https://www.investing.com/rss/news_25.rss" },
] as const;

/** Najwyższy priorytet dla porannego briefu makro / cross-asset. */
const HIGH_PRIORITY: ReadonlySet<NewsStoryCategory> = new Set([
  "geopolitics",
  "energy",
  "inflation",
  "rates",
  "central_banks",
  "fx",
  "equities_index",
  "macro",
]);

/** Najniższy priorytet — pojedyncze spółki, M&A, sektor bez szerokiego cross-asset. */
const LOW_PRIORITY: ReadonlySet<NewsStoryCategory> = new Set([
  "company_specific",
  "m_and_a",
  "sector_specific",
]);

const RELEVANCE_KEYWORDS = [
  "iran",
  "trump",
  "fed",
  "cpi",
  "inflation",
  "oil",
  "crude",
  "hormuz",
  "tariffs",
  "ecb",
  "rates",
  "payrolls",
  "war",
  "sanctions",
] as const;

type RawRssItem = Record<string, unknown>;

type InternalItem = {
  title: string;
  summary: string;
  source: string;
  t: number;
  url?: string;
  hasReliableDate: boolean;
  categories: NewsStoryCategory[];
};

function textField(x: unknown): string {
  if (typeof x === "string") return x;
  if (x && typeof x === "object" && "#text" in x) return String((x as { "#text": unknown })["#text"]);
  if (Array.isArray(x)) return x.map(textField).join(" ");
  return "";
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parsePubDateMs(it: RawRssItem): number {
  const raw = textField(it.pubDate ?? it.pubdate ?? it["dc:date"] ?? "");
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
}

function itemSummary(it: RawRssItem): string {
  const enc = it["content:encoded"];
  const desc = it.description ?? enc;
  const raw = stripHtml(textField(desc));
  if (raw.length > 600) return `${raw.slice(0, 597)}…`;
  return raw || stripHtml(textField(it.title));
}

function itemUrl(it: RawRssItem): string | undefined {
  const L = it.link ?? it.guid;
  if (typeof L === "string") {
    const s = L.trim();
    if (s) return s;
  }
  if (L && typeof L === "object") {
    const o = L as Record<string, unknown>;
    const href = o["@_href"] ?? o.href;
    if (typeof href === "string" && href.trim()) return href.trim();
    const t = textField(L);
    if (t.trim()) return t.trim();
  }
  return undefined;
}

async function fetchRssItems(feedUrl: string): Promise<RawRssItem[]> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 10000);
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (FXEduLab/NewsContext)" },
      cache: "no-store",
      signal: ac.signal,
    });
    clearTimeout(t);
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const obj = parser.parse(xml);
    const items = obj?.rss?.channel?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch {
    clearTimeout(t);
    return [];
  }
}

export function normalizeTitleKey(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 120);
}

function containsKeywordToken(blobLower: string, k: string): boolean {
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return re.test(blobLower);
}

function keywordHits(blob: string): number {
  const low = blob.toLowerCase();
  let n = 0;
  for (const k of RELEVANCE_KEYWORDS) {
    if (containsKeywordToken(low, k)) n += 1;
  }
  return n;
}

function keywordsPresentInText(blob: string): Set<string> {
  const low = blob.toLowerCase();
  const s = new Set<string>();
  for (const k of RELEVANCE_KEYWORDS) {
    if (containsKeywordToken(low, k)) s.add(k);
  }
  return s;
}

function computeDominantKeywords(items: InternalItem[]): string[] {
  const counts = new Map<string, number>();
  for (const it of items) {
    const blob = `${it.title} ${it.summary}`.toLowerCase();
    const seen = keywordsPresentInText(blob);
    for (const k of seen) {
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const multi = ranked.filter(([, c]) => c >= 2).map(([k]) => k);
  if (multi.length) return multi.slice(0, 6);
  return ranked.slice(0, 2).map(([k]) => k);
}

function touchesDominant(blob: string, dominant: string[]): boolean {
  if (!dominant.length) return false;
  const low = blob.toLowerCase();
  return dominant.some((k) => containsKeywordToken(low, k));
}

/** Sygnał „aktywny temat makro/geopolityczny” (Iran, Hormuz, Trump deadline, CPI, Fed, ECB, oil shock). */
export function hasMegaMarketMovingSignal(blob: string): boolean {
  const b = blob.toLowerCase();
  if (/\biran\b|\bhormuz\b|\bstrait\s+of\s+hormuz\b|\btehran\b/.test(b)) return true;
  if (/\btrump\b/.test(b) && /\b(ultimatum|deadline)\b/.test(b)) return true;
  if (/\boil\s+shock\b/.test(b)) return true;
  if (/\bcrude\b/.test(b) && /\b(surge|spike|soar|plunge)\b/.test(b) && /\b(oil|brent|wti)\b/.test(b)) return true;
  if (containsKeywordToken(b, "cpi") && /\b(us|u\.s\.|fed|inflation)\b/.test(b)) return true;
  if (containsKeywordToken(b, "fed") || /\bfomc\b|\bpowell\b/.test(b)) return true;
  if (/\becb\b|\blagarde\b/.test(b)) return true;
  return false;
}

/**
 * Klasyfikacja nagłówka. Iran / Hormuz / oil shock / Trump+deadline → geopolitics + energy (najwyższy priorytet).
 */
export function classifyNewsStoryCategories(title: string, summary: string): NewsStoryCategory[] {
  const blob = `${title} ${summary}`;
  const b = blob.toLowerCase();
  const out = new Set<NewsStoryCategory>();

  const megaGeoEnergy =
    /\biran\b|\bhormuz\b|\bstrait\s+of\s+hormuz\b|\btehran\b|\bpersian\s+gulf\b/.test(b) ||
    /\boil\s+shock\b/.test(b) ||
    (/\bcrude\b|\bbrent\b|\bwti\b/.test(b) && /\b(strait|shipping|tanker|sanctions|middle\s+east)\b/.test(b));
  const megaTrump = /\btrump\b/.test(b) && /\b(ultimatum|deadline)\b/.test(b);

  if (megaGeoEnergy || megaTrump) {
    out.add("geopolitics");
    out.add("energy");
  }

  if (
    /\bacquisition\b|\bmerger\b|\btakeover\b|\bagrees\s+to\s+buy\b|\bto\s+acquire\b|\bbuyout\b|\bbid\s+for\b|\bdeal\s+to\s+buy\b/i.test(
      blob,
    )
  ) {
    out.add("m_and_a");
  }

  if (
    containsKeywordToken(b, "fed") ||
    /\bfomc\b|\bpowell\b|\bfederal\s+reserve\b|\becb\b|\blagarde\b|\bbank\s+of\s+japan\b|\bboj\b|\bcentral\s+bank\b|\brate\s+decision\b/i.test(
      b,
    )
  ) {
    out.add("central_banks");
  }

  if (containsKeywordToken(b, "cpi") || containsKeywordToken(b, "inflation") || /\bpce\b|\bconsumer\s+prices\b|\bprice\s+pressures\b/i.test(b)) {
    out.add("inflation");
  }

  if (
    containsKeywordToken(b, "oil") ||
    containsKeywordToken(b, "crude") ||
    /\bbrent\b|\bwti\b|\bopec\b|\blng\b|\bnatural\s+gas\b|\bpetroleum\b|\bgasoline\b/i.test(b)
  ) {
    out.add("energy");
  }

  if (
    containsKeywordToken(b, "war") ||
    containsKeywordToken(b, "sanctions") ||
    /\bukraine\b|\bisrael\b|\bgaza\b|\bnato\b|\bmissile\b|\bgeopolit|\bmiddle\s+east\b|\bkremlin\b|\btehran\b/i.test(b)
  ) {
    out.add("geopolitics");
  }

  if (
    containsKeywordToken(b, "rates") ||
    /\byield\b|\btreasury\b|\bt-\s*bill\b|\bgilts\b|\bgovernment\s+bond\b|\bduration\b|\bcurve\b.*\byield\b/i.test(b)
  ) {
    out.add("rates");
  }

  if (
    /\bforex\b|\bdollar\s+index\b|\bdxy\b|\bcurrency\b|\byuan\b|\byen\b|\bcable\b|\bfx\b|\beuro\b.*\b(weak|strong|parity)\b/i.test(b)
  ) {
    out.add("fx");
  }

  if (
    /\bs\s*&\s*p\b|\bsp\s*500\b|\bnasdaq\b|\bdow\s+jones\b|\bdow\b.*\bindustrial\b|\bstoxx\b|\bmsci\b|\bwall\s+street\b.*\b(index|stocks)\b|\bglobal\s+stocks\b|\bstock\s+index\b/i.test(
      b,
    )
  ) {
    out.add("equities_index");
  }

  if (
    /\bgdp\b|\bpayrolls\b|\bjobs\s+report\b|\bnon-?farm\b|\bunemployment\b|\bism\b|\bpmi\b|\bretail\s+sales\b|\bhousing\s+starts\b|\bconsumer\s+confidence\b/i.test(
      b,
    )
  ) {
    out.add("macro");
  }

  if (
    /\bairlines\b|\bairline\s+stocks\b|\bsteelmakers?\b|\bsteel\s+sector\b|\bchipmakers?\b|\bsemiconductor\s+industry\b|\bhomebuilders?\b|\butilities\s+sector\b|\bauto\s+stocks\b|\benergy\s+sector\b|\bbank\s+stocks\b|\bsector\s+etf\b/i.test(
      b,
    )
  ) {
    out.add("sector_specific");
  }

  const companyCue =
    /\b(shares|stock)\s+(jump|surge|soar|plunge|slide|fall|rise|rally|tumble)\b/i.test(b) ||
    /\b(ceo|cfo|earnings|quarterly\s+profit|guidance|layoffs|cut\s+jobs)\b/i.test(b) ||
    /\b(inc|corp|ltd)\b.*\b(shares|stock)\b/i.test(b) ||
    /\bsupermicro\b|\bsmci\b|\balgoma\b/i.test(b);

  const hasHigh = [...out].some((c) => HIGH_PRIORITY.has(c));
  if (companyCue && !hasHigh) {
    out.add("company_specific");
  } else if (companyCue && hasHigh) {
    const narrowCompany =
      /\bsupermicro\b|\bsmci\b|\balgoma\b|\b(shares|stock)\s+(jump|surge|soar|plunge)\b/i.test(b) &&
      !/\bs\s*&\s*p\b|\bnasdaq\b|\bfed\b|\bcpi\b/i.test(b);
    if (narrowCompany) out.add("company_specific");
  }

  if (out.size === 0) out.add("other");

  return [...out];
}

function itemTierRank(categories: NewsStoryCategory[]): number {
  if (categories.some((c) => HIGH_PRIORITY.has(c))) return 0;
  if (categories.every((c) => LOW_PRIORITY.has(c))) return 2;
  return 1;
}

function isPureLowTier(categories: NewsStoryCategory[]): boolean {
  return categories.length > 0 && categories.every((c) => LOW_PRIORITY.has(c));
}

function scoreItem(it: InternalItem, now: number, dominant: string[]): number {
  const blob = `${it.title} ${it.summary}`;
  const hits = keywordHits(blob);
  const ageH = Math.max(0, (now - it.t) / 3600000);
  const recency = 100 * Math.exp(-ageH / RECENCY_HALF_LIFE_H);
  const relevance = Math.min(100, hits * (100 / RELEVANCE_KEYWORDS.length));
  const stale = ageH > STALE_HOURS;
  const exempt = hits >= 2 || touchesDominant(blob, dominant);
  let relW = relevance;
  let recW = recency;
  if (stale && !exempt) {
    relW *= 0.35;
    recW *= 0.2;
  }
  return relW * 0.52 + recW * 0.48;
}

function internalToPublic(it: InternalItem): LiveNewsContextItem {
  const out: LiveNewsContextItem = {
    title: it.title,
    summary: it.summary,
    source: it.source,
    categories: it.categories,
  };
  if (it.hasReliableDate) out.publishedAt = new Date(it.t).toISOString();
  if (it.url) out.url = it.url;
  return out;
}

function compareMorningItems(a: InternalItem, b: InternalItem, now: number, dominant: string[]): number {
  const ta = itemTierRank(a.categories);
  const tb = itemTierRank(b.categories);
  if (ta !== tb) return ta - tb;
  const sa = scoreItem(a, now, dominant);
  const sb = scoreItem(b, now, dominant);
  return sb - sa;
}

/**
 * Buduje listę z RSS: klasyfikacja, ranking warstwowy (makro cross-asset > spółki), anti-stale.
 */
export async function loadLiveNewsContextItemsFromRss(): Promise<LiveNewsContextItem[]> {
  const now = Date.now();
  const merged: InternalItem[] = [];

  await Promise.all(
    FEEDS.map(async (f) => {
      const rawItems = await fetchRssItems(f.url);
      for (const it of rawItems) {
        const title = stripHtml(textField(it.title)).trim();
        if (!title) continue;
        const parsed = parsePubDateMs(it);
        const hasReliableDate = parsed > 0;
        const t = hasReliableDate ? parsed : now - 24 * 3600000;
        const summary = itemSummary(it);
        merged.push({
          title,
          summary,
          source: f.source,
          t,
          hasReliableDate,
          url: itemUrl(it),
          categories: classifyNewsStoryCategories(title, summary),
        });
      }
    }),
  );

  const seen = new Set<string>();
  const unique = merged.filter((x) => {
    const k = normalizeTitleKey(x.title);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const dominant = computeDominantKeywords(unique);
  unique.sort((a, b) => compareMorningItems(a, b, now, dominant));

  return unique.slice(0, MAX_ITEMS).map(internalToPublic);
}

export function resolveBriefingRequestBaseUrl(req: Request): string {
  const url = new URL(req.url);
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${url.protocol}//${url.host}`)
  );
}

const CATEGORY_PARSE = new Set<string>([
  "macro",
  "geopolitics",
  "central_banks",
  "inflation",
  "energy",
  "rates",
  "fx",
  "equities_index",
  "company_specific",
  "m_and_a",
  "sector_specific",
  "other",
]);

function parseCategoriesField(raw: unknown): NewsStoryCategory[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: NewsStoryCategory[] = [];
  for (const x of raw) {
    if (typeof x === "string" && CATEGORY_PARSE.has(x)) out.push(x as NewsStoryCategory);
  }
  return out.length ? out : undefined;
}

export function ensureLiveNewsItemCategories(it: LiveNewsContextItem): LiveNewsContextItem {
  if (it.categories?.length) return it;
  return {
    ...it,
    categories: classifyNewsStoryCategories(it.title, it.summary),
  };
}

/**
 * Walidacja po stronie serwera: lead 3–5 (cross-asset), secondary — reszta; wykluczenie pure-low z leadu przy aktywnym makro/geopolityce.
 */
export function splitMorningLeadAndSecondaryNews(items: LiveNewsContextItem[]): {
  leadNews: LiveNewsContextItem[];
  secondaryNews: LiveNewsContextItem[];
} {
  const enriched = items.map(ensureLiveNewsItemCategories);
  const importantPool = enriched.some(
    (it) =>
      itemTierRank(it.categories!) === 0 ||
      hasMegaMarketMovingSignal(`${it.title} ${it.summary}`),
  );

  const now = Date.now();
  const toInternal = (e: LiveNewsContextItem): InternalItem => {
    const parsed = e.publishedAt ? Date.parse(e.publishedAt) : NaN;
    const t = !Number.isNaN(parsed) && parsed > 0 ? parsed : now - 24 * 3600000;
    return {
      title: e.title,
      summary: e.summary,
      source: e.source,
      t,
      hasReliableDate: Boolean(e.publishedAt && !Number.isNaN(parsed)),
      url: e.url,
      categories: e.categories ?? ["other"],
    };
  };

  const dominant = computeDominantKeywords(enriched.map(toInternal));
  const pairs = enriched.map((e) => ({ e, internal: toInternal(e) }));
  pairs.sort((a, b) => compareMorningItems(a.internal, b.internal, now, dominant));
  const sorted = pairs.map((p) => p.e);

  const used = new Set<string>();
  const push = (it: LiveNewsContextItem) => {
    const key = normalizeTitleKey(it.title);
    if (used.has(key)) return false;
    used.add(key);
    return true;
  };

  const nonLowSorted = sorted.filter((it) => !isPureLowTier(it.categories ?? ["other"]));
  const lowSorted = sorted.filter((it) => isPureLowTier(it.categories ?? ["other"]));

  const leadNews: LiveNewsContextItem[] = [];

  for (const it of nonLowSorted) {
    if (leadNews.length >= LEAD_MAX) break;
    if (push(it)) leadNews.push(it);
  }

  if (!importantPool) {
    for (const it of lowSorted) {
      if (leadNews.length >= LEAD_MIN || leadNews.length >= LEAD_MAX) break;
      if (push(it)) leadNews.push(it);
    }
  }

  if (!importantPool && leadNews.length < LEAD_MIN) {
    for (const it of sorted) {
      if (leadNews.length >= LEAD_MIN || leadNews.length >= LEAD_MAX) break;
      if (push(it)) leadNews.push(it);
    }
  }

  if (importantPool && leadNews.length < LEAD_MAX) {
    for (const it of lowSorted) {
      if (leadNews.length >= LEAD_MAX) break;
      if (leadNews.length < 3) continue;
      if (push(it)) leadNews.push(it);
    }
  }

  if (leadNews.length === 0 && sorted.length) {
    const it = sorted[0];
    if (push(it)) leadNews.push(it);
  }

  const secondaryNews = sorted.filter((it) => !used.has(normalizeTitleKey(it.title)));
  return { leadNews, secondaryNews };
}

export async function fetchLiveNewsContextItems(
  req: Request,
  opts?: { signal?: AbortSignal },
): Promise<LiveNewsContextItem[]> {
  try {
    const base = resolveBriefingRequestBaseUrl(req);
    const r = await fetch(`${base}/api/news/context`, {
      cache: "no-store",
      signal: opts?.signal,
    });
    if (!r.ok) return [];
    const j = (await r.json()) as { items?: unknown };
    if (!Array.isArray(j?.items)) return [];
    return j.items
      .map((row: unknown) => {
        const o = row as Record<string, unknown>;
        const title = typeof o?.title === "string" ? o.title.trim() : "";
        const summary = typeof o?.summary === "string" ? o.summary.trim() : "";
        const source = typeof o?.source === "string" ? o.source.trim() : "RSS";
        if (!title) return null;
        const item: LiveNewsContextItem = {
          title,
          summary: summary || title,
          source,
        };
        if (typeof o?.publishedAt === "string" && o.publishedAt.trim()) item.publishedAt = o.publishedAt.trim();
        if (typeof o?.url === "string" && o.url.trim()) item.url = o.url.trim();
        const parsedCats = parseCategoriesField(o?.categories);
        if (parsedCats) item.categories = parsedCats;
        return item;
      })
      .filter(Boolean) as LiveNewsContextItem[];
  } catch {
    return [];
  }
}

function formatItemLine(it: LiveNewsContextItem, index: number): string {
  const extra = it.summary && it.summary !== it.title ? ` — ${it.summary}` : "";
  const meta: string[] = [`[${it.source}]`];
  const cats = it.categories?.length ? `[${it.categories.join("+")}]` : "";
  if (cats) meta.push(cats);
  if (it.publishedAt) meta.push(it.publishedAt);
  if (it.url) meta.push(it.url);
  return `${index + 1}. ${it.title}${extra}\n   ${meta.join(" · ")}`;
}

/** Świeższe nagłówki pierwsze; brak daty traktuj jako najstarsze. */
export function sortClusterNewsForBrief(items: LiveNewsContextItem[]): LiveNewsContextItem[] {
  return [...items].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    const na = Number.isFinite(ta) && ta > 0 ? ta : 0;
    const nb = Number.isFinite(tb) && tb > 0 ? tb : 0;
    return nb - na;
  });
}

/**
 * Jedyny blok RSS dla morning-institutional po wyborze klastra — bez lead/secondary i bez rozszerzania tematu.
 */
export function formatClusterGroundedNewsBlock(
  lang: BriefingLanguage,
  primaryThemeLabel: string,
  themeKey: string,
  items: LiveNewsContextItem[],
): string {
  const lines = items.map((it, i) => formatItemLine(it, i));

  if (lang === "en") {
    return [
      "=== WINNING THEME CLUSTER (ONLY permitted facts for this brief) ===",
      `themeKey: ${themeKey}`,
      `primaryThemeLabel: ${primaryThemeLabel}`,
      "",
      "HARD RULES:",
      "- You may ONLY use facts that appear in the headlines below (plus the MARKET SNAPSHOT block).",
      "- Do not import unrelated regions, banks, commodities, or companies that are not clearly supported by these headlines.",
      "- If something is missing, state that it is not confirmed in the current input.",
      "",
      "HEADLINES IN THIS CLUSTER:",
      lines.length ? lines.join("\n") : "(none — say clearly that the feed/cluster is empty.)",
    ].join("\n");
  }

  if (lang === "cs") {
    return [
      "=== VÍTĚZNÝ CLUSTER TÉMATU (JEDINÉ povolené fakty pro tento brief) ===",
      `themeKey: ${themeKey}`,
      `primaryThemeLabel: ${primaryThemeLabel}`,
      "",
      "TVRDÁ PRAVIDLA:",
      "- Smíš používat jen fakty z níže uvedených titulků (plus blok MARKET SNAPSHOT).",
      "- Nepřidávej nesouvisející regiony, banky, komodity ani firmy, které titulky jasně nepodporují.",
      "- Chybí-li informace, napiš, že v aktuálním vstupu není potvrzena.",
      "",
      "TITULKY V TOMTO CLUSTERU:",
      lines.length ? lines.join("\n") : "(žádné — explicitně uveď, že feed/cluster je prázdný.)",
    ].join("\n");
  }

  return [
    "=== WYGRANY KLASTER TEMATU (JEDYNE dozwolone fakty w tym briefie) ===",
    `themeKey: ${themeKey}`,
    `primaryThemeLabel: ${primaryThemeLabel}`,
    "",
    "TWARDA ZASADA:",
    "- Możesz używać wyłącznie faktów z poniższych nagłówków (oraz bloku MARKET SNAPSHOT).",
    "- Nie dopisuj niepowiązanych regionów, banków, surowców ani spółek, jeśli nagłówki ich wyraźnie nie uzasadniają.",
    "- Jeśli czegoś brakuje, napisz, że nie jest to potwierdzone w bieżącym wejściu.",
    "",
    "NAGŁÓWKI W TYM KLASTRZE:",
    lines.length ? lines.join("\n") : "(brak — wyraźnie napisz, że kanał/klaster jest pusty.)",
  ].join("\n");
}

export function formatGenBriefLiveNewsBlock(lang: BriefingLanguage, items: LiveNewsContextItem[]): string {
  if (!items.length) return "";
  const header =
    lang === "en"
      ? "Based on the following CURRENT market headlines (live RSS, ranked by relevance and recency):"
      : lang === "cs"
        ? "Na základě následujících AKTUÁLNÍCH tržních událostí (živé RSS, seřazeno podle relevance a čerstvosti):"
        : "Na podstawie poniższych AKTUALNYCH wydarzeń rynkowych (nagłówki z RSS, ważność + świeżość):";
  const rule =
    lang === "en"
      ? "If headlines repeatedly point to one dominant theme (examples: Iran/geopolitics, Fed, US CPI/inflation), that theme MUST appear in the first bullet section at the top (\"WHAT'S LOUDEST NOW\" or equivalent) — do not bury it later. Items older than ~36h are supporting context only unless they continue a dominant theme still visible in fresher headlines."
      : lang === "cs"
        ? "Pokud se opakovaně objevuje jedno dominantní téma (např. Írán/geopolitika, Fed, CPI/inflace USA), MUSÍ být v první odrážkové sekci nahoře — neodsouvej ho dolů. Starší než ~36 h je jen podpůrný kontext, pokud nenavazuje na dominantní téma z čerstvějších titulků."
        : "Jeśli w nagłówkach wielokrotnie pojawia się jeden dominujący temat (np. Iran/geopolityka, Fed, CPI/inflacja USA), ten temat MUSI znaleźć się w pierwszej sekcji punktowej na górze („CO TERAZ GRA NAJGŁOŚNIEJ”) — nie chowaj go na końcu. Wpisy starsze niż ~36 h traktuj jako drugorzędne, chyba że są kontynuacją dominującego tematu widocznego w świeższych nagłówkach.";
  const lines = items.map((it, i) => formatItemLine(it, i));
  return `${header}\n\n${rule}\n\n${lines.join("\n")}`;
}

export function dominantKeywordHintsForPrompt(items: LiveNewsContextItem[]): string {
  const blobs = items.map((i) => `${i.title} ${i.summary}`.toLowerCase());
  const counts = new Map<string, number>();
  for (const b of blobs) {
    for (const k of RELEVANCE_KEYWORDS) {
      if (containsKeywordToken(b, k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, c]) => c >= 2)
    .map(([k]) => k);
  return top.length ? top.join(", ") : [...counts.keys()].slice(0, 3).join(", ") || "(none strong)";
}

function crossAssetRulesBlock(lang: BriefingLanguage): string[] {
  if (lang === "en") {
    return [
      "CROSS-ASSET LEAD (MANDATORY):",
      "- The first 3 daily topics derived from LEAD STORIES must be cross-asset relevant (rates, inflation, policy, FX, indices, commodities/geopolitics transmission) — not single-name equity idiosyncrasy.",
      "- Do NOT lead with single-stock stories if macro or geopolitical market-moving items exist in LEAD STORIES or SECONDARY at obvious index level.",
      "- Company / M&A / sector headlines belong in secondary narrative (macro cards, assets, events) unless they materially move index-level pricing or systemic risk.",
      "- Single-name stories (e.g. specific industrial or tech names) must NOT appear among the first 3 topics of the day unless there is no qualifying macro/geopolitical lead in the supplied lists (server enforced where possible).",
    ];
  }
  if (lang === "cs") {
    return [
      "CROSS-ASSET ÚVOD (POVINNÉ):",
      "- První 3 témata dne z LEAD STORIES musí být cross-asset (sazby, inflace, politika, FX, indexy, komodity/geopolitika) — ne idiosynkracie jednotlivých akcií.",
      "- Nezačínej jednotitulky, pokud existují makro/geopolitické tržně pohybující položky v LEAD nebo SECONDARY na úrovni indexu.",
      "- Společnosti / M&A / sektor patří do druhotné vrstvy, pokud nehýbou indexově nebo systémovým rizikem.",
      "- Konkrétní názvy společností nesmí být v prvních 3 tématech, pokud v dodaných seznamech existuje kvalifikovaný makro/geopolitický lead (kde to server umožní).",
    ];
  }
  return [
    "CROSS-ASSET — LEAD (OBOWIĄZKOWE):",
    "- Pierwsze 3 tematy dnia z LEAD STORIES muszą mieć znaczenie cross-asset (stopy, inflacja, polityka, FX, indeksy, surowce/geopolityka) — nie chodzi o pojedynczy tickery.",
    "- Nie rozpoczynaj od pojedynczych spółek, jeśli w LEAD lub SECONDARY są oczywiste makro/geopolityczne tematy poruszające rynek na poziomie indeksu.",
    "- Historie spółek / M&A / sektorowe umieszczaj drugoplanowo (makro, assets, events), chyba że materialnie przesuwają wycenę na poziomie indeksu lub ryzyko systemowe.",
    "- Pojedyncze nazwy spółek nie mogą być w pierwszych 3 tematach dnia, o ile w dostarczonych listach jest sensowny lead makro/geopolityczny (także po stronie serwera odfiltrowany).",
  ];
}

export function formatMorningInstitutionalLiveNewsBlock(
  lang: BriefingLanguage,
  leadNews: LiveNewsContextItem[],
  secondaryNews: LiveNewsContextItem[],
): string {
  if (!leadNews.length && !secondaryNews.length) return "";
  const hints = dominantKeywordHintsForPrompt([...leadNews, ...secondaryNews]);
  const leadLines = leadNews.map((it, i) => formatItemLine(it, i));
  const secLines = secondaryNews.map((it, i) => formatItemLine(it, i));
  const cross = crossAssetRulesBlock(lang);

  if (lang === "en") {
    return [
      "=== LIVE RSS GROUNDING (MANDATORY) ===",
      "Headlines are split by the server into LEAD STORIES (3–5, cross-asset priority) and SECONDARY STORIES (context / single names / sector / M&A).",
      `Automated keyword-density hints (dominant themes): ${hints}.`,
      "",
      ...cross,
      "",
      "HARD RULES:",
      "1) Build the opening of executiveSummary from LEAD STORIES: integrate the top 3 themes for cross-asset desk relevance.",
      "2) whatsDifferentVsRecentDays and tldr must foreground LEAD STORIES first (no verbatim duplication across sections).",
      "3) If one theme dominates LEAD STORIES, it MUST lead executiveSummary and the first bullets of list sections — never bury it below single-stock noise.",
      "4) ANTI-STALE: Items older than ~36h in SECONDARY are background unless they extend a dominant theme still present in fresher LEAD items.",
      "",
      "LEAD STORIES:",
      leadLines.length ? leadLines.join("\n") : "(none — use best available macro context carefully)",
      "",
      "SECONDARY STORIES:",
      secLines.length ? secLines.join("\n") : "(none)",
    ].join("\n");
  }

  if (lang === "cs") {
    return [
      "=== ŽIVÉ RSS (POVINNÉ ZAKOTVENÍ) ===",
      "Titulky jsou rozděleny serverem na LEAD STORIES (3–5, cross-asset priorita) a SECONDARY STORIES (kontext / jednotlivé firmy / sektor / M&A).",
      `Automatické nápovědy dominantních témat: ${hints}.`,
      "",
      ...cross,
      "",
      "TVRDÁ PRAVIDLA:",
      "1) Úvod executiveSummary vycházej z LEAD STORIES — top 3 témata musí být cross-asset.",
      "2) whatsDifferentVsRecentDays a tldr musí nejdříve reflektovat LEAD STORIES.",
      "3) Dominantní téma z LEAD musí vést executiveSummary a první odrážky sekcí — nepod single-stock šum.",
      "4) PROTI-ZASTARALOST: starší než ~36 h ve SECONDARY jen jako kontext, pokud neprodlužuje dominantní téma z čerstvějšího LEAD.",
      "",
      "LEAD STORIES:",
      leadLines.length ? leadLines.join("\n") : "(žádné — postupuj opatrně)",
      "",
      "SECONDARY STORIES:",
      secLines.length ? secLines.join("\n") : "(žádné)",
    ].join("\n");
  }

  return [
    "=== LIVE RSS (KOTWICENIE — OBOWIĄZKOWE) ===",
    "Nagłówki są podzielone przez serwer na LEAD STORIES (3–5, priorytet cross-asset) oraz SECONDARY STORIES (kontekst / pojedyncze spółki / sektor / M&A).",
    `Automatyczne wskazówki dominujących tematów: ${hints}.`,
    "",
    ...cross,
    "",
    "TWARDA ZASADA:",
    "1) Otwarcie executiveSummary buduj z LEAD STORIES — 3 najważniejsze tematy muszą być cross-asset (nie idiosynkrazja jednego tickera).",
    "2) whatsDifferentVsRecentDays i tldr muszą najpierw odzwierciedlać LEAD STORIES (bez kopiowania 1:1).",
    "3) Dominujący temat z LEAD musi prowadzić executiveSummary i pierwsze punkty sekcji listowych — nie chowaj go pod szumem single-stock.",
    "4) ANTI-STALE: wpisy >36 h w SECONDARY tylko jako tło, chyba że przedłużają temat nadal obecny w świeższym LEAD.",
    "",
    "LEAD STORIES:",
    leadLines.length ? leadLines.join("\n") : "(brak — ostrożnie z kontekstem makro)",
    "",
    "SECONDARY STORIES:",
    secLines.length ? secLines.join("\n") : "(brak)",
  ].join("\n");
}

export function systemRssNoteForGenBrief(lang: BriefingLanguage): string {
  if (lang === "en")
    return " If the user message includes live RSS headlines, treat them as today's factual layer; the first bullet section must reflect those themes and respect anti-stale logic from the user block.";
  if (lang === "cs")
    return " Pokud zpráva obsahuje živé titulky RSS, ber je jako faktickou vrstvu na dnešek; první odrážková sekce musí odrážet tato témata a logiku proti zastaralosti z bloku uživatele.";
  return " Jeśli wiadomość użytkownika zawiera listę aktualnych nagłówków RSS, jest to warstwa faktograficzna na dziś — pierwsza sekcja punktowa musi odnosić się do tych tematów i respektować regułę anti-stale z bloku użytkownika.";
}

export function genBriefSystemIntro(lang: BriefingLanguage): string {
  if (lang === "en")
    return "You are an assistant producing a short market briefing in English. Return a clear bullet list and a brief takeaway.";
  if (lang === "cs")
    return "Jsi asistent, který připravuje stručné tržní shrnutí v češtině. Vrať jasný seznam odrážek a krátký závěr.";
  return "Jesteś asystentem generującym krótki briefing rynkowy w języku polskim. Zwróć jasną listę punktów i krótką opinię.";
}
