import type { NewsCategory, NewsItemEnriched, InstrumentImpact } from '@/lib/news/types';
import { formatInstrument } from '@/lib/news/labels';
import type { BriefSensitivity } from '@/lib/decision-brief/sensitivity';

export type DecisionBriefPrefillDraft = {
  title: string;
  summary: string;
  narrativeAxis: string;
  context: string;
  onRadar: string;
  priorityOfDay: string;
  baseScenario: string;
  alternativeScenario: string;
  invalidation: string;
  assets: Array<{
    asset: string;
    baseDirection: string;
    supports: string;
    weakens: string;
    sensitivity: BriefSensitivity;
    sortOrder: number;
  }>;
};

/** @deprecated Zastąpione przez wybór klastra (topic_1…3). Zostawione dla ewentualnych starych importów. */
export type PrefillTopicMode = 'main_topic' | 'next_topic';

const SCORE_SUM_CAP = 15;
const DEFAULT_MAX_TOPICS = 3;

function linesJoin(parts: string[]): string {
  const cleaned = parts.map((s) => s.trim()).filter(Boolean);
  return cleaned.join('\n');
}

export function scoreNews(n: NewsItemEnriched): number {
  const impact = Number(n.impact ?? 1);
  const edge = Number(n.timeEdge ?? 0);
  const hasIns = (n.instruments?.length ?? 0) > 0 ? 6 : 0;
  const hasImpacts = (n.impacts?.length ?? 0) > 0 ? 5 : 0;
  const hasWhy = n.whyItMatters?.trim() ? 3 : 0;
  const hasSummary = n.summaryShort?.trim() ? 2 : 0;
  return impact * 10 + edge + hasIns + hasImpacts + hasWhy + hasSummary;
}

/**
 * Deterministyczny klaster tematyczny: `kategoria | posortowane tickery` albo `kategoria | t:znormalizowany_tytuł`.
 * Ten sam klucz = ten sam „temat” do grupowania newsów.
 */
export function topicClusterKey(n: NewsItemEnriched): string {
  const cat = n.category || 'Inne';
  const ins = [...(n.instruments || [])]
    .map((s) => String(s).trim().toUpperCase())
    .filter(Boolean)
    .sort();
  if (ins.length > 0) {
    return `${cat}|${ins.join(',')}`;
  }
  const t = n.title.trim().toLowerCase().replace(/\s+/g, ' ');
  return `${cat}|t:${t}`;
}

function rankByScore(items: NewsItemEnriched[]): NewsItemEnriched[] {
  return [...items].sort((a, b) => scoreNews(b) - scoreNews(a));
}

/** Dla klastra: pierwszeństwo `publishedAt`, inaczej `createdAt` (ISO). */
function itemRecencyMs(n: NewsItemEnriched): number {
  const pub = Date.parse(n.publishedAt);
  if (!Number.isNaN(pub)) return pub;
  const cre = Date.parse(n.createdAt);
  if (!Number.isNaN(cre)) return cre;
  return 0;
}

/**
 * Zakres czasu newsów w klastrze — max/min po polu recency (publikacja lub utworzenie).
 */
export function clusterNewsTimeBounds(items: NewsItemEnriched[]): {
  latestNewsAt: string;
  earliestNewsAt: string;
} {
  if (items.length === 0) {
    const z = new Date(0).toISOString();
    return { latestNewsAt: z, earliestNewsAt: z };
  }
  let minMs = Infinity;
  let maxMs = -Infinity;
  for (const n of items) {
    const ms = itemRecencyMs(n);
    if (ms < minMs) minMs = ms;
    if (ms > maxMs) maxMs = ms;
  }
  if (!Number.isFinite(minMs) || !Number.isFinite(maxMs)) {
    const z = new Date(0).toISOString();
    return { latestNewsAt: z, earliestNewsAt: z };
  }
  return {
    earliestNewsAt: new Date(minMs).toISOString(),
    latestNewsAt: new Date(maxMs).toISOString(),
  };
}

type ClusterKeyMeta = {
  category: NewsCategory;
  instruments: string[];
  titleRest?: string;
};

function parseClusterKeyMeta(clusterKey: string): ClusterKeyMeta {
  const sep = clusterKey.indexOf('|');
  const rawCat = sep >= 0 ? clusterKey.slice(0, sep) : 'Inne';
  const rest = sep >= 0 ? clusterKey.slice(sep + 1) : clusterKey;
  const allowed: NewsCategory[] = ['FX', 'Indeksy', 'Surowce', 'Makro', 'Spółki', 'Geo', 'Inne'];
  const category = (allowed as string[]).includes(rawCat) ? (rawCat as NewsCategory) : 'Inne';
  if (rest.startsWith('t:')) {
    return { category, instruments: [], titleRest: rest.slice(2) };
  }
  const instruments = rest
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return { category, instruments };
}

function clusterScoreSum(items: NewsItemEnriched[]): number {
  const ranked = rankByScore(items);
  let s = 0;
  for (let i = 0; i < Math.min(SCORE_SUM_CAP, ranked.length); i++) {
    s += scoreNews(ranked[i]);
  }
  return s;
}

/** Sygnatura „nagłówkowa” klastra — do odrzucania prawie identycznych tematów (bez losowości). */
function clusterHeadlineSig(items: NewsItemEnriched[]): string {
  const ranked = rankByScore(items);
  return ranked
    .slice(0, 3)
    .map((n) => n.title.trim().toLowerCase().replace(/\s+/g, ' '))
    .join('||');
}

function draftFingerprint(d: DecisionBriefPrefillDraft): string {
  return JSON.stringify({
    title: d.title,
    summary: d.summary,
    narrativeAxis: d.narrativeAxis,
    context: d.context,
    onRadar: d.onRadar,
    priorityOfDay: d.priorityOfDay,
    baseScenario: d.baseScenario,
    alternativeScenario: d.alternativeScenario,
    invalidation: d.invalidation,
    assets: d.assets.map((a) => ({
      asset: a.asset,
      baseDirection: a.baseDirection,
      supports: a.supports,
      weakens: a.weakens,
      sensitivity: a.sensitivity,
    })),
  });
}

/** Stabilny, krótki identyfikator klastra (deterministyczny hash klucza). */
export function stableClusterId(clusterKey: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < clusterKey.length; i++) {
    h ^= clusterKey.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `cl_${h.toString(16)}`;
}

function buildClusterLabel(clusterKey: string, topItem: NewsItemEnriched): string {
  const cat = topItem.category || 'Inne';
  const raw = (topItem.instruments || []).map((x) => String(x).trim().toUpperCase()).filter(Boolean)[0];
  if (raw) {
    const lab = formatInstrument(raw);
    return lab !== raw ? `${cat} · ${lab}` : `${cat} · ${raw}`;
  }
  const t = topItem.title.trim();
  const short = t.length > 52 ? `${t.slice(0, 49)}…` : t;
  return `${cat} · ${short}`;
}

function directionPl(d: InstrumentImpact['direction']): string {
  switch (d) {
    case 'up':
      return 'presja w górę (risk-on)';
    case 'down':
      return 'presja w dół (risk-off)';
    case 'volatile':
      return 'wzrost zmienności';
    default:
      return 'bez wyraźnego kierunku';
  }
}

function sentimentDirectionHint(s: NewsItemEnriched['sentiment']): string {
  if (s === 'positive') return 'narracja pozytywna w newsach (do weryfikacji na wykresie)';
  if (s === 'negative') return 'narracja negatywna w newsach (do weryfikacji na wykresie)';
  return '';
}

function sensitivityFromImpact(impact: number): BriefSensitivity {
  if (impact >= 5) return 'wysoka';
  if (impact >= 3) return 'średnia';
  return 'niska';
}

type AssetAgg = {
  symbol: string;
  maxImpact: number;
  directions: InstrumentImpact['direction'][];
  supportEffects: string[];
  weakenEffects: string[];
  fallbackSummaries: string[];
};

export function buildDraftFromPicked(
  picked: NewsItemEnriched[],
  maxHeadlines: number,
  maxAssets: number,
): DecisionBriefPrefillDraft {
  const datePl = new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let title = '';
  if (picked[0]?.title) {
    const t = picked[0].title.trim();
    title = t.length > 100 ? `${t.slice(0, 97)}…` : t;
  } else {
    title = `Kluczowe wątki rynku (${datePl})`;
  }

  const summaryParts: string[] = [];
  for (const n of picked.slice(0, 5)) {
    const s = (n.summaryShort || '').trim();
    if (s) summaryParts.push(s);
  }
  const summary = summaryParts.length ? summaryParts.join('\n\n') : '';

  const narrativeLines: string[] = [];
  const seenTitle = new Set<string>();
  for (const n of picked) {
    const t = n.title.trim();
    if (!t || seenTitle.has(t)) continue;
    seenTitle.add(t);
    const ss = (n.summaryShort || '').trim();
    narrativeLines.push(ss ? `• ${t} — ${ss}` : `• ${t}`);
    if (narrativeLines.length >= maxHeadlines) break;
  }

  const contextParts: string[] = [];
  for (const n of picked) {
    const w = (n.whyItMatters || '').trim();
    if (w) contextParts.push(`• ${w}`);
  }
  const context = linesJoin(contextParts);

  const radarSet = new Set<string>();
  for (const n of picked) {
    for (const w of n.watch || []) {
      const x = w.trim();
      if (x) radarSet.add(x);
    }
  }
  const onRadar = linesJoin([...radarSet].slice(0, 12).map((x) => `• ${x}`));

  const priorityOfDay = picked[0]
    ? `${picked[0].title.trim()}${picked[0].category ? ` [${picked[0].category}]` : ''}`
    : '';

  const pos = picked.filter((n) => n.sentiment === 'positive');
  const neg = picked.filter((n) => n.sentiment === 'negative');
  const baseFrom = pos.length >= neg.length ? pos : picked;
  const baseScenarioLines: string[] = [];
  for (const n of baseFrom.slice(0, 4)) {
    const s = (n.summaryShort || '').trim();
    if (s) baseScenarioLines.push(`• ${s}`);
  }
  const baseScenario = linesJoin(baseScenarioLines);

  const altFrom = pos.length >= neg.length ? neg : pos;
  const alternativeScenarioLines: string[] = [];
  for (const n of altFrom.slice(0, 4)) {
    const s = (n.summaryShort || '').trim();
    if (s) alternativeScenarioLines.push(`• ${s}`);
  }
  const alternativeScenario =
    pos.length && neg.length ? linesJoin(alternativeScenarioLines) : '';

  const invalidationParts: string[] = [];
  for (const n of picked.slice(0, 3)) {
    for (const im of n.impacts || []) {
      const e = (im.effect || '').trim();
      if (!e) continue;
      if (im.direction === 'volatile') {
        invalidationParts.push(`• Zmienność: ${e}`);
      }
    }
  }
  const invalidation = linesJoin(invalidationParts.slice(0, 6));

  const bySymbol = new Map<string, AssetAgg>();

  for (const n of picked) {
    const imp = Number(n.impact ?? 1);
    const impacts = n.impacts || [];
    if (impacts.length) {
      for (const im of impacts) {
        const sym = (im.symbol || '').trim().toUpperCase();
        if (!sym) continue;
        let agg = bySymbol.get(sym);
        if (!agg) {
          agg = {
            symbol: sym,
            maxImpact: imp,
            directions: [],
            supportEffects: [],
            weakenEffects: [],
            fallbackSummaries: [],
          };
          bySymbol.set(sym, agg);
        }
        agg.maxImpact = Math.max(agg.maxImpact, imp);
        agg.directions.push(im.direction);
        const e = (im.effect || '').trim();
        if (e) {
          if (im.direction === 'down') agg.weakenEffects.push(e);
          else if (im.direction === 'up') agg.supportEffects.push(e);
          else if (im.direction === 'volatile') {
            agg.supportEffects.push(e);
          }
        }
      }
    } else {
      for (const raw of n.instruments || []) {
        const sym = String(raw || '')
          .trim()
          .toUpperCase();
        if (!sym) continue;
        let agg = bySymbol.get(sym);
        if (!agg) {
          agg = {
            symbol: sym,
            maxImpact: imp,
            directions: [],
            supportEffects: [],
            weakenEffects: [],
            fallbackSummaries: [],
          };
          bySymbol.set(sym, agg);
        }
        agg.maxImpact = Math.max(agg.maxImpact, imp);
        const hint = sentimentDirectionHint(n.sentiment);
        const sum = (n.summaryShort || '').trim();
        if (sum) agg.fallbackSummaries.push(sum);
        if (hint) {
          if (n.sentiment === 'negative') agg.weakenEffects.push(`${hint} — ${n.title.trim()}`);
          else if (n.sentiment === 'positive') agg.supportEffects.push(`${hint} — ${n.title.trim()}`);
        }
      }
    }
  }

  const assetRows = [...bySymbol.values()]
    .sort((a, b) => b.maxImpact - a.maxImpact)
    .slice(0, maxAssets);

  const assets: DecisionBriefPrefillDraft['assets'] = assetRows.map((agg, i) => {
    const label = formatInstrument(agg.symbol);
    const assetLabel = label !== agg.symbol ? `${label} (${agg.symbol})` : agg.symbol;

    const uniq = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];

    let baseDirection = '';
    const dirs = agg.directions.length ? agg.directions : [];
    if (dirs.length) {
      const up = dirs.filter((d) => d === 'up').length;
      const down = dirs.filter((d) => d === 'down').length;
      const vol = dirs.filter((d) => d === 'volatile').length;
      if (vol >= up && vol >= down) baseDirection = directionPl('volatile');
      else if (down > up) baseDirection = directionPl('down');
      else if (up > down) baseDirection = directionPl('up');
      else if (up && down) baseDirection = 'sygnały mieszane w newsach';
      else baseDirection = directionPl(dirs[0]);
    } else {
      const fb = agg.fallbackSummaries[0];
      baseDirection = fb ? `zobacz kontekst: ${fb.slice(0, 120)}${fb.length > 120 ? '…' : ''}` : '';
    }

    const supports = uniq(agg.supportEffects).slice(0, 3).join('; ');
    const weakens = uniq(agg.weakenEffects).slice(0, 3).join('; ');

    return {
      asset: assetLabel,
      baseDirection,
      supports,
      weakens,
      sensitivity: sensitivityFromImpact(agg.maxImpact),
      sortOrder: i,
    };
  });

  return {
    title,
    summary,
    narrativeAxis: linesJoin(narrativeLines),
    context,
    onRadar,
    priorityOfDay,
    baseScenario,
    alternativeScenario,
    invalidation,
    assets: assets.length
      ? assets
      : [
          {
            asset: '',
            baseDirection: '',
            supports: '',
            weakens: '',
            sensitivity: 'średnia',
            sortOrder: 0,
          },
        ],
  };
}

export type TopicClusterChoice = {
  clusterId: string;
  clusterKey: string;
  clusterLabel: string;
  rank: number;
  /** Liczba newsów w klastrze (przed obcięciem do draftu). */
  newsCount: number;
  /** Ostatni news w klastrze wg `publishedAt` (fallback `createdAt`), ISO 8601. */
  latestNewsAt: string;
  /** Najwcześniejszy news w klastrze — ten sam schemat co latestNewsAt. */
  earliestNewsAt: string;
  draft: DecisionBriefPrefillDraft;
};

const QUICK_PICK_BUCKET_ORDER: NewsCategory[] = ['FX', 'Surowce', 'Makro', 'Spółki', 'Geo', 'Indeksy', 'Inne'];

/** Czy dwa klastry są zbyt podobne, by trafić oba do szybkiego wyboru (ta sama „rodzina”). */
function quickPickTooSimilar(a: TopicClusterChoice, b: TopicClusterChoice): boolean {
  if (a.clusterId === b.clusterId) return true;
  const ma = parseClusterKeyMeta(a.clusterKey);
  const mb = parseClusterKeyMeta(b.clusterKey);
  if (ma.category !== mb.category) return false;
  if (a.clusterKey === b.clusterKey) return true;
  if (ma.instruments.length > 0 && mb.instruments.length > 0) {
    const setA = new Set(ma.instruments);
    for (const x of mb.instruments) {
      if (setA.has(x)) return true;
    }
  }
  if (ma.titleRest && mb.titleRest) {
    const sa = ma.titleRest.slice(0, 48);
    const sb = mb.titleRest.slice(0, 48);
    if (sa === sb) return true;
  }
  return false;
}

/**
 * Wybiera do `max` klastrów na szybki wybór: najpierw różne kategorie (wg kolejności produktowej),
 * potem dopełnienie z pełnej listy wg ranku, pomijając zbyt podobne do już wybranych.
 */
export function pickDiverseQuickTopics(topics: TopicClusterChoice[], max: number): TopicClusterChoice[] {
  const cap = Math.max(1, Math.min(12, max));
  const out: TopicClusterChoice[] = [];

  function conflictsWithOut(t: TopicClusterChoice): boolean {
    return out.some((p) => quickPickTooSimilar(t, p));
  }

  for (const bucket of QUICK_PICK_BUCKET_ORDER) {
    if (out.length >= cap) break;
    const next = topics.find((t) => parseClusterKeyMeta(t.clusterKey).category === bucket && !conflictsWithOut(t));
    if (next) out.push(next);
  }

  for (const t of topics) {
    if (out.length >= cap) break;
    if (out.some((x) => x.clusterId === t.clusterId)) continue;
    if (conflictsWithOut(t)) continue;
    out.push(t);
  }

  return out;
}

export type BuildTopicClustersResult = {
  topics: TopicClusterChoice[];
  meta: {
    totalClustersRaw: number;
    skippedDuplicateOrSimilar: number;
  };
};

/**
 * Grupuje newsy w klastry (`topicClusterKey`), sortuje klastry po sumie score (do SCORE_SUM_CAP newsów),
 * wybiera do `maxTopics` klastrów z de-dup po fingerprint draftu i po sygnaturze nagłówków.
 */
export function buildDecisionBriefTopicClusters(
  items: NewsItemEnriched[],
  opts?: { maxHeadlines?: number; maxAssets?: number; maxTopics?: number },
): BuildTopicClustersResult {
  const maxHeadlines = Math.max(3, Math.min(20, opts?.maxHeadlines ?? 10));
  const maxAssets = Math.max(1, Math.min(24, opts?.maxAssets ?? 12));
  const maxTopics = Math.max(1, Math.min(50, opts?.maxTopics ?? DEFAULT_MAX_TOPICS));

  const byKey = new Map<string, NewsItemEnriched[]>();
  for (const n of items) {
    const k = topicClusterKey(n);
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(n);
  }

  const totalClustersRaw = byKey.size;

  type Row = { clusterKey: string; items: NewsItemEnriched[]; score: number };
  const rows: Row[] = [];
  for (const [clusterKey, clusterItems] of byKey) {
    const sorted = rankByScore(clusterItems);
    rows.push({
      clusterKey,
      items: sorted,
      score: clusterScoreSum(sorted),
    });
  }

  rows.sort((a, b) => b.score - a.score || a.clusterKey.localeCompare(b.clusterKey));

  const topics: TopicClusterChoice[] = [];
  let skippedDuplicateOrSimilar = 0;
  const seenFp = new Set<string>();
  const seenHeadSig = new Set<string>();

  for (const row of rows) {
    if (topics.length >= maxTopics) break;
    const picked = row.items.slice(0, maxHeadlines);
    const draft = buildDraftFromPicked(picked, maxHeadlines, maxAssets);
    const fp = draftFingerprint(draft);
    const headSig = clusterHeadlineSig(row.items);
    if (seenFp.has(fp)) {
      skippedDuplicateOrSimilar += 1;
      continue;
    }
    if (seenHeadSig.has(headSig)) {
      skippedDuplicateOrSimilar += 1;
      continue;
    }
    seenFp.add(fp);
    seenHeadSig.add(headSig);
    const top = row.items[0];
    const bounds = clusterNewsTimeBounds(row.items);
    topics.push({
      clusterId: stableClusterId(row.clusterKey),
      clusterKey: row.clusterKey,
      clusterLabel: buildClusterLabel(row.clusterKey, top),
      rank: 0,
      newsCount: row.items.length,
      latestNewsAt: bounds.latestNewsAt,
      earliestNewsAt: bounds.earliestNewsAt,
      draft,
    });
  }

  const rankedTopics = topics.map((t, i) => ({ ...t, rank: i + 1 }));

  return { topics: rankedTopics, meta: { totalClustersRaw, skippedDuplicateOrSimilar } };
}

/** @deprecated Użyj buildDecisionBriefTopicClusters. */
export type BuildPrefillFromNewsResult = {
  draft: DecisionBriefPrefillDraft | null;
  mode: PrefillTopicMode;
  hasAlternative: boolean;
  reason?: string;
  excludedMainCluster?: string;
};

/**
 * @deprecated Zachowane dla kompatybilności: `main_topic` = pierwszy klaster, `next_topic` = drugi.
 */
export function buildDecisionBriefPrefillFromNews(
  items: NewsItemEnriched[],
  opts?: { maxHeadlines?: number; maxAssets?: number; mode?: PrefillTopicMode },
): BuildPrefillFromNewsResult {
  const mode: PrefillTopicMode = opts?.mode === 'next_topic' ? 'next_topic' : 'main_topic';
  const { topics, meta } = buildDecisionBriefTopicClusters(items, {
    maxHeadlines: opts?.maxHeadlines,
    maxAssets: opts?.maxAssets,
    maxTopics: 3,
  });

  if (mode === 'main_topic') {
    const t0 = topics[0];
    return {
      draft: t0?.draft ?? null,
      mode: 'main_topic',
      hasAlternative: topics.length > 1,
      ...(topics.length === 0
        ? { reason: 'Brak odrębnych klastrów do zbudowania briefu w tym oknie newsów.' }
        : {}),
    };
  }

  const t1 = topics[1];
  if (!t1) {
    return {
      draft: null,
      mode: 'next_topic',
      hasAlternative: false,
      reason:
        meta.totalClustersRaw < 2
          ? 'Za mało odrębnych klastrów tematycznych — potrzebny jest co najmniej drugi temat w oknie czasu.'
          : 'Drugorzędne klastry odrzucone jako zbyt podobne do wybranego (de-dup).',
      excludedMainCluster: topics[0]?.clusterKey,
    };
  }
  return {
    draft: t1.draft,
    mode: 'next_topic',
    hasAlternative: true,
    excludedMainCluster: topics[0]?.clusterKey,
  };
}
