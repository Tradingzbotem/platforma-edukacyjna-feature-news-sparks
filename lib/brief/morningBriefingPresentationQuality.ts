// lib/brief/morningBriefingPresentationQuality.ts — bramka jakości UI + filtry słabych treści (bez zmiany generacji)
import type {
  MorningBriefingAsset,
  MorningBriefingEvent,
  MorningBriefingScenarioBlock,
  MorningHistoricalBehavior,
  MorningInstitutionalBriefing,
  MorningMacroTheme,
} from '@/lib/brief/morningInstitutionalBriefingTypes';
import type { MorningBriefingLocale } from '@/lib/brief/morningBriefingLocale';

/** Minimalna liczba „mocnych” sekcji, poniżej której włączamy compact fallback. */
export const COMPACT_GATE_MIN_MEANINGFUL_SECTIONS = 2;

/** Udział pól uznanych za słabe/placeholder — próg „większość”. */
export const COMPACT_GATE_WEAK_FIELD_RATIO = 0.55;

const MIN_BULLET_MEANINGFUL = 22;
const MIN_EXEC_MEANINGFUL = 55;
const MIN_QUICK_MEANINGFUL = 40;
const MIN_MACRO_FIELD = 14;
const MIN_EVENT_NAME = 3;
const MIN_SCENARIO_FIELD = 16;

function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9ąćęłńóśźż]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tekst uznany za pusty, placeholder lub generyczny komunikat „brak danych”.
 */
export function isWeakText(value: string): boolean {
  const s = value.trim();
  if (!s) return true;
  if (/^[—\-–.…,;\s]+$/u.test(s)) return true;
  const low = s.toLowerCase();

  const phraseHit =
    /\bbrak\s+dostępnych\s+danych\b/i.test(low) ||
    /\bbrak\s+danych\s+rynkowych\b/i.test(low) ||
    /\bbrak\s+danych\b/i.test(low) ||
    /\bnie\s+wykryto\b/i.test(low) ||
    /\bnie\s+potwierdzono\b/i.test(low) ||
    /\bmieszane\s+sygnał/i.test(low) ||
    /\bmieszane\s+sygnały\b/i.test(low) ||
    /\bno\s+market\s+data\b/i.test(low) ||
    /\bmixed\s+signals\b/i.test(low) ||
    /\bnot\s+confirmed\s+in\s+the\s+current\s+input\b/i.test(low) ||
    /\binsufficient\s+data\b/i.test(low) ||
    /\bno\s+data\s+available\b/i.test(low) ||
    /\bdata\s+not\s+available\b/i.test(low) ||
    /\bnení\s+k\s+dispozici\b/i.test(low) ||
    /\bžádná\s+data\b/i.test(low);

  if (phraseHit) return true;

  if (/^brak\b/i.test(low) || /^no\s+data\b/i.test(low) || /^n\/a\.?$/i.test(low) || /^n\/d\.?$/i.test(low)) {
    return true;
  }

  if (s.length < 14) {
    if (/^(brak|nic|none|—|-|n\/a|tbd|todo)$/i.test(low)) return true;
  }

  return false;
}

export function isSubstantiveField(value: string, minLen: number = MIN_BULLET_MEANINGFUL): boolean {
  const t = value.trim();
  return t.length >= minLen && !isWeakText(t);
}

export function areTriggersWeakParaphrase(bull: string, bear: string): boolean {
  const b = bull.trim();
  const r = bear.trim();
  if (!b && !r) return true;
  if (isWeakText(b) && isWeakText(r)) return true;
  const nb = normalizeForCompare(b);
  const nr = normalizeForCompare(r);
  if (nb.length >= 12 && nr.length >= 12 && nb === nr) return true;
  if (nb.length >= 15 && nr.length >= 15) {
    const short = nb.length <= nr.length ? nb : nr;
    const long = nb.length > nr.length ? nb : nr;
    if (long.includes(short) && short.length / long.length >= 0.82) return true;
  }
  return false;
}

export function hasMeaningfulAssetContent(asset: MorningBriefingAsset): boolean {
  const name = asset.asset?.trim() ?? '';
  if (!name || name === '—' || isWeakText(name)) return false;

  const ctx = asset.currentContext?.trim() ?? '';
  const drv = asset.drivers?.trim() ?? '';
  const hasCtx = isSubstantiveField(ctx);
  const hasDrv = isSubstantiveField(drv);
  if (!hasCtx && !hasDrv) return false;

  if (areTriggersWeakParaphrase(asset.triggerBull, asset.triggerBear)) return false;

  return true;
}

export function hasMeaningfulMacroTheme(m: MorningMacroTheme): boolean {
  let good = 0;
  for (const f of [m.title, m.whatHappened, m.whyItMatters, m.marketImpact]) {
    const t = f.trim();
    if (t && !isWeakText(t) && t.length >= MIN_MACRO_FIELD) good++;
  }
  return good >= 2;
}

export function hasMeaningfulEvent(ev: MorningBriefingEvent): boolean {
  const name = ev.name?.trim() ?? '';
  if (!name || name.length < MIN_EVENT_NAME || isWeakText(name)) return false;
  const parts = [ev.expectation, ev.bullCase, ev.bearCase, ev.marketImpact].filter(
    (x) => isSubstantiveField(x, 18),
  );
  return parts.length >= 1;
}

export function hasMeaningfulScenario(s: MorningBriefingScenarioBlock): boolean {
  const fields = [s.title, s.scenarioIf, s.scenarioThen, s.confirmation, s.crossAssetReaction];
  let good = 0;
  for (const f of fields) {
    const t = f.trim();
    if (t && !isWeakText(t) && t.length >= MIN_SCENARIO_FIELD) good++;
  }
  return good >= 2;
}

export function filterMeaningfulBulletLines(lines: string[], minLen: number = MIN_BULLET_MEANINGFUL): string[] {
  return lines.map((x) => x.trim()).filter((x) => x.length >= minLen && !isWeakText(x));
}

export function filterMeaningfulAssets(assets: MorningBriefingAsset[]): MorningBriefingAsset[] {
  return assets.filter(hasMeaningfulAssetContent);
}

export function filterMeaningfulMacroThemes(themes: MorningMacroTheme[]): MorningMacroTheme[] {
  return themes.filter(hasMeaningfulMacroTheme);
}

export function filterMeaningfulEvents(events: MorningBriefingEvent[]): MorningBriefingEvent[] {
  return events.filter(hasMeaningfulEvent);
}

export function filterMeaningfulScenarios(rows: MorningBriefingScenarioBlock[]): MorningBriefingScenarioBlock[] {
  return rows.filter(hasMeaningfulScenario);
}

export function filterMeaningfulHistoricalRows(rows: MorningHistoricalBehavior[]): MorningHistoricalBehavior[] {
  return rows.filter((h) =>
    [h.setup, h.reaction, h.lesson].some((t) => {
      const s = t.trim();
      return s.length >= 14 && !isWeakText(s);
    }),
  );
}

function macroHasAnyMeaningful(b: MorningInstitutionalBriefing): boolean {
  const regions = [b.macro.usa, b.macro.europe, b.macro.asia, b.macro.geopolitics];
  return regions.some((r) => filterMeaningfulMacroThemes(r).length > 0);
}

/**
 * Liczy sekcje z realną treścią (do bramki compact). Każda z poniższych liczy się max jako 1.
 */
export function countMeaningfulBriefingSections(b: MorningInstitutionalBriefing): number {
  let n = 0;
  if (filterMeaningfulBulletLines(b.whatsDifferentVsRecentDays).length) n++;
  if (filterMeaningfulBulletLines(b.tldr).length) n++;
  if (isSubstantiveField(b.executiveSummary, MIN_EXEC_MEANINGFUL)) n++;
  if (macroHasAnyMeaningful(b)) n++;
  if (filterMeaningfulEvents(b.events).length) n++;
  if (filterMeaningfulAssets(b.assets).length) n++;
  if (filterMeaningfulBulletLines(b.crossAssetLinks, 20).length) n++;
  if (filterMeaningfulScenarios(b.scenarios).length) n++;
  if (isSubstantiveField(b.quickSummary, MIN_QUICK_MEANINGFUL)) n++;
  return n;
}

function collectBriefingStrings(b: MorningInstitutionalBriefing): string[] {
  const out: string[] = [];
  out.push(
    ...b.whatsDifferentVsRecentDays,
    ...b.tldr,
    b.executiveSummary,
    b.quickSummary,
    ...b.crossAssetLinks,
  );
  for (const ev of b.events) {
    out.push(ev.name, ev.expectation, ev.bullCase, ev.bearCase, ev.marketImpact);
  }
  for (const a of b.assets) {
    out.push(a.asset, a.currentContext, a.drivers, a.triggerBull, a.triggerBear, a.triggerLogic);
    for (const h of a.historicalBehavior) {
      out.push(h.setup, h.reaction, h.lesson);
    }
  }
  for (const s of b.scenarios) {
    out.push(s.title, s.scenarioIf, s.scenarioThen, s.confirmation, s.crossAssetReaction);
  }
  for (const region of [b.macro.usa, b.macro.europe, b.macro.asia, b.macro.geopolitics]) {
    for (const m of region) {
      out.push(m.title, m.whatHappened, m.whyItMatters, m.marketImpact);
    }
  }
  return out;
}

function computeWeakFieldRatio(b: MorningInstitutionalBriefing): { ratio: number; total: number; weak: number } {
  const strs = collectBriefingStrings(b)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (strs.length === 0) return { ratio: 1, total: 0, weak: 0 };
  const weak = strs.filter(isWeakText).length;
  return { ratio: weak / strs.length, total: strs.length, weak };
}

/**
 * Warunki wejścia w compact fallback (wszystkie z OR):
 * 1) Brak niepustych pól tekstowych w briefingu.
 * 2) Mniej niż `COMPACT_GATE_MIN_MEANINGFUL_SECTIONS` sekcji z mocną treścią.
 * 3) Brak co najmniej jednego aktywa z `hasMeaningfulAssetContent`.
 * 4) Udział pól słabych/placeholderów ≥ `COMPACT_GATE_WEAK_FIELD_RATIO`.
 */
export function shouldUseCompactBriefingFallback(b: MorningInstitutionalBriefing): boolean {
  const { ratio, total } = computeWeakFieldRatio(b);
  if (total === 0) return true;

  const sections = countMeaningfulBriefingSections(b);
  const assets = filterMeaningfulAssets(b.assets).length;

  if (sections < COMPACT_GATE_MIN_MEANINGFUL_SECTIONS) return true;
  if (assets < 1) return true;
  if (ratio >= COMPACT_GATE_WEAK_FIELD_RATIO) return true;
  return false;
}

export type CompactFallbackCopy = {
  detected: string;
  missingLines: string[];
  watch?: string;
};

export function buildCompactFallbackCopy(
  b: MorningInstitutionalBriefing,
  loc: Pick<
    MorningBriefingLocale,
    | 'compactDetectedDefault'
    | 'compactMissingLine1'
    | 'compactMissingLine2'
    | 'compactMissingLine3'
  >,
): CompactFallbackCopy {
  const bullets = [
    ...filterMeaningfulBulletLines(b.whatsDifferentVsRecentDays),
    ...filterMeaningfulBulletLines(b.tldr),
  ];
  let detected = bullets.slice(0, 3).join(' ');
  if (!detected || detected.length < 40) {
    const ex = b.executiveSummary.trim();
    if (isSubstantiveField(ex, 48)) {
      detected = ex.length > 320 ? `${ex.slice(0, 317)}…` : ex;
    } else {
      detected = loc.compactDetectedDefault;
    }
  }

  const missingLines = [loc.compactMissingLine1, loc.compactMissingLine2, loc.compactMissingLine3];

  const tldr0 = filterMeaningfulBulletLines(b.tldr)[0];
  const scen = filterMeaningfulScenarios(b.scenarios)[0];
  const watchCandidate =
    tldr0 ||
    (scen?.scenarioIf && !isWeakText(scen.scenarioIf) ? scen.scenarioIf : '') ||
    (scen?.scenarioThen && !isWeakText(scen.scenarioThen) ? scen.scenarioThen : '');
  const watch =
    watchCandidate && watchCandidate.trim().length >= MIN_BULLET_MEANINGFUL ? watchCandidate.trim() : undefined;

  return { detected, missingLines, watch };
}

export type BriefingRenderableSection =
  | 'whatsDifferent'
  | 'tldr'
  | 'executive'
  | 'macro'
  | 'events'
  | 'assets'
  | 'crossAsset'
  | 'scenarios'
  | 'quickSummary';

export type FilteredBriefingForRender = {
  whatsDifferent: string[];
  tldr: string[];
  assets: MorningBriefingAsset[];
  crossAssetLinks: string[];
  events: MorningBriefingEvent[];
  scenarios: MorningBriefingScenarioBlock[];
  macro: MorningInstitutionalBriefing['macro'];
};

export function buildFilteredBriefingForRender(b: MorningInstitutionalBriefing): FilteredBriefingForRender {
  return {
    whatsDifferent: filterMeaningfulBulletLines(b.whatsDifferentVsRecentDays),
    tldr: filterMeaningfulBulletLines(b.tldr),
    assets: filterMeaningfulAssets(b.assets),
    crossAssetLinks: filterMeaningfulBulletLines(b.crossAssetLinks, 20),
    events: filterMeaningfulEvents(b.events),
    scenarios: filterMeaningfulScenarios(b.scenarios),
    macro: {
      usa: filterMeaningfulMacroThemes(b.macro.usa),
      europe: filterMeaningfulMacroThemes(b.macro.europe),
      asia: filterMeaningfulMacroThemes(b.macro.asia),
      geopolitics: filterMeaningfulMacroThemes(b.macro.geopolitics),
    },
  };
}

export function shouldRenderSection(id: BriefingRenderableSection, f: FilteredBriefingForRender, b: MorningInstitutionalBriefing): boolean {
  switch (id) {
    case 'whatsDifferent':
      return f.whatsDifferent.length > 0;
    case 'tldr':
      return f.tldr.length > 0;
    case 'executive':
      return isSubstantiveField(b.executiveSummary, MIN_EXEC_MEANINGFUL);
    case 'macro':
      return (
        f.macro.usa.length +
          f.macro.europe.length +
          f.macro.asia.length +
          f.macro.geopolitics.length >
        0
      );
    case 'events':
      return f.events.length > 0;
    case 'assets':
      return f.assets.length > 0;
    case 'crossAsset':
      return f.crossAssetLinks.length > 0;
    case 'scenarios':
      return f.scenarios.length > 0;
    case 'quickSummary':
      return isSubstantiveField(b.quickSummary, MIN_QUICK_MEANINGFUL);
    default:
      return false;
  }
}
