// lib/panel/coachContext.ts — compact context packs for Coach AI (EDU)
// lib/panel/coachContext.ts — compact, selective context packs for Coach AI (EDU)

import { CALENDAR_7D } from '@/lib/panel/calendar7d';
import { SCENARIOS_ABC } from '@/lib/panel/scenariosABC';
import { CHECKLISTS } from '@/lib/panel/checklists';
import { EVENT_PLAYBOOKS } from '@/lib/panel/eventPlaybooks';
import { TECH_MAPS } from '@/lib/panel/techMaps';
import type { Tier } from '@/lib/panel/access';
import { isTierAtLeast } from '@/lib/panel/access';

export const CONTEXT_SOURCES = [
  'none',
  'calendar7d',
  'scenariosABC',
  'checklists',
  'eventPlaybooks',
  'techMaps',
] as const;

export type ContextSource = (typeof CONTEXT_SOURCES)[number];

export function normalizeContextSource(v: unknown): ContextSource {
  const s = String(v ?? 'none');
  return (CONTEXT_SOURCES as readonly string[]).includes(s) ? (s as ContextSource) : 'none';
}

// Minimalne wymagania tier dla źródeł kontekstu (spójne z modułami panelu)
export const CONTEXT_MIN_TIER: Record<Exclude<ContextSource, 'none'>, Tier> = {
  calendar7d: 'starter',
  scenariosABC: 'starter',
  checklists: 'starter',
  eventPlaybooks: 'pro',
  techMaps: 'pro',
};

export function isContextAllowedForTier(src: ContextSource, tier: Tier): boolean {
  if (src === 'none') return true;
  const required = CONTEXT_MIN_TIER[src];
  return isTierAtLeast(tier, required);
}

/**
 * Filtrowanie gotowego packa wg tieru użytkownika.
 * Jeśli dane źródło kontekstu nie jest dozwolone dla bieżącego tieru,
 * zwraca pusty ciąg (bez przebudowywania packa ani serializacji).
 * - Kiedy source nie jest podany (np. pack pochodzi z jednego źródła domyślnego),
 *   pack pozostaje bez zmian.
 */
export function filterContextPackByTier(
  pack: string,
  tier: Tier,
  source?: ContextSource
): string {
  if (!source) return pack;
  return isContextAllowedForTier(source, tier) ? pack : '';
}

type Timeframe = 'H1' | 'H4' | 'D1';

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function line(...parts: Array<string | undefined | null>) {
  return parts.filter(Boolean).join(' ');
}

function pickAnyString(obj: any, keys: string[], fallback = ''): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return fallback;
}

function pickAnyArray(obj: any, keys: string[]): string[] {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  }
  return [];
}

/**
 * Heurystyka: wyciąga instrument i TF z pytania, żeby zawęzić kontekst.
 * Canonical assets zgodne z Twoimi danymi: US100 / XAUUSD / EURUSD.
 */
function parseHints(text?: string): { asset?: 'US100' | 'XAUUSD' | 'EURUSD'; timeframe?: Timeframe; keywords: string[] } {
  const t = String(text ?? '').toLowerCase();

  // asset
  let asset: 'US100' | 'XAUUSD' | 'EURUSD' | undefined;
  if (/\b(us100|nas100|nasdaq|nq100|nq)\b/.test(t)) asset = 'US100';
  else if (/\b(xauusd|gold|złoto)\b/.test(t)) asset = 'XAUUSD';
  else if (/\b(eurusd)\b/.test(t)) asset = 'EURUSD';

  // timeframe
  let timeframe: Timeframe | undefined;
  if (/\b(h1|1h)\b/.test(t)) timeframe = 'H1';
  else if (/\b(h4|4h)\b/.test(t)) timeframe = 'H4';
  else if (/\b(d1|1d)\b/.test(t) || /\b(daily|dzienny|dzien)\b/.test(t)) timeframe = 'D1';

  // keywords for playbooks
  const kw: string[] = [];
  if (/\bcpi\b/.test(t)) kw.push('cpi');
  if (/\bnfp\b/.test(t) || /payroll/.test(t)) kw.push('nfp');
  if (/\bfomc\b/.test(t) && /minute/.test(t)) kw.push('minutes');
  if (/\bism\b/.test(t)) kw.push('ism');
  if (/\bfed\b/.test(t)) kw.push('fed');

  return { asset, timeframe, keywords: kw };
}

function filterByAssetTf<T extends { asset?: string; timeframe?: string }>(
  items: T[],
  hint: { asset?: string; timeframe?: string }
): T[] {
  const { asset, timeframe } = hint;
  if (!asset && !timeframe) return items;
  return items.filter((x) => {
    const okAsset = asset ? String(x.asset) === asset : true;
    const okTf = timeframe ? String(x.timeframe) === timeframe : true;
    return okAsset && okTf;
  });
}

function filterPlaybooksByKeywords<T extends { id?: string; eventName?: string }>(
  items: T[],
  keywords: string[]
): T[] {
  if (!keywords.length) return items;
  const k = keywords.join('|');
  const re = new RegExp(k, 'i');
  return items.filter((x) => re.test(String(x.id ?? '')) || re.test(String(x.eventName ?? '')));
}

/**
 * Buduje "context pack" (bez JSON), opcjonalnie selektywny pod asset/TF z pytania.
 */
export function buildCoachContext(src: ContextSource, maxChars = 6000, queryText?: string): string {
  if (!src || src === 'none') return '';

  const hint = parseHints(queryText);
  let out = '';

  if (src === 'calendar7d') {
    const items = CALENDAR_7D.slice(0, 14);
    const lines = items.map((ev: any, i: number) => {
      const title = pickAnyString(ev, ['title', 'event', 'name'], `Wydarzenie ${i + 1}`);
      const date = pickAnyString(ev, ['date', 'day', 'when', 'datetime'], '');
      const time = pickAnyString(ev, ['time', 'hour'], '');
      const region = pickAnyString(ev, ['region', 'country', 'market'], '');
      const importance = pickAnyString(ev, ['importance', 'impact', 'level'], '');
      const note = pickAnyString(ev, ['note', 'comment', 'details'], '');
      return `- ${line(date, time, region && `(${region})`, importance && `— ważność: ${importance}`, title)}${note ? ` — ${note}` : ''}`;
    });

    out = [
      'KONTEXT (EDU): Kalendarz 7 dni — statyczne przykłady wydarzeń jako tło.',
      'Używaj do interpretacji i scenariuszy; nie traktuj jako „aktualnego feedu”.',
      '',
      ...lines,
    ].join('\n');
  }

  if (src === 'scenariosABC') {
    const base = SCENARIOS_ABC.slice(0, 10);
    const filtered = filterByAssetTf(base as any, hint);
    const picked = (filtered.length ? filtered : base).slice(0, 6);

    const lines = picked.map((s: any) => {
      const asset = pickAnyString(s, ['asset'], 'ASSET');
      const tf = pickAnyString(s, ['timeframe', 'tf'], '');
      const levels = Array.isArray(s?.levels) ? s.levels.map((x: any) => String(x)) : [];
      return [
        `- ${asset}${tf ? ` · ${tf}` : ''}`,
        `  Kontekst: ${clamp(String(s?.context ?? ''), 220)}`,
        `  Poziomy: ${levels.slice(0, 6).join(', ')}`,
        `  A: IF ${clamp(String(s?.scenarioA?.if ?? ''), 160)} | INV ${clamp(String(s?.scenarioA?.invalidation ?? ''), 140)}`,
        `  B: IF ${clamp(String(s?.scenarioB?.if ?? ''), 160)} | INV ${clamp(String(s?.scenarioB?.invalidation ?? ''), 140)}`,
        `  C: IF ${clamp(String(s?.scenarioC?.if ?? ''), 160)} | INV ${clamp(String(s?.scenarioC?.invalidation ?? ''), 140)}`,
      ].join('\n');
    });

    out = [
      'KONTEXT (EDU): Scenariusze A/B/C — przykłady warunkowe (IF / invalidation / confirmations / risk notes).',
      hint.asset || hint.timeframe
        ? `Dopasowanie: ${[hint.asset, hint.timeframe].filter(Boolean).join(' · ')} (jeśli brak dopasowania, użyto ogólnych przykładów).`
        : 'Użyj jako wzorca struktury, nie jako gotowej instrukcji.',
      '',
      ...lines,
    ].join('\n');
  }

  if (src === 'checklists') {
    const groups = CHECKLISTS.slice(0, 6);
    const lines = groups.map((g: any) => {
      const title = pickAnyString(g, ['title'], 'Grupa');
      const items = Array.isArray(g?.items) ? g.items : [];
      const bullets = items.slice(0, 10).map((it: any) => {
        const t = pickAnyString(it, ['text'], '');
        const tag = pickAnyString(it, ['tag'], '');
        return `  - ${t}${tag ? ` [${tag}]` : ''}`;
      });
      return [`- ${title}`, ...bullets].join('\n');
    });

    out = [
      'KONTEXT (EDU): Checklisty — punkty kontrolne (makro/technika/ryzyko/sentyment/zmienność).',
      'Użyj do zbudowania własnej listy kontrolnej pod instrument i wydarzenie.',
      '',
      ...lines,
    ].join('\n');
  }

  if (src === 'eventPlaybooks') {
    const base = EVENT_PLAYBOOKS.slice(0, 10);
    const filtered = filterPlaybooksByKeywords(base as any, hint.keywords);
    const picked = (filtered.length ? filtered : base).slice(0, 6);

    const lines = picked.map((pb: any) => {
      const name = pickAnyString(pb, ['eventName', 'name'], 'Event');
      const region = pickAnyString(pb, ['region'], '');
      const importance = pickAnyString(pb, ['importance'], '');
      const watch = pickAnyArray(pb, ['whatToWatch']).slice(0, 4);
      const patterns = pickAnyArray(pb, ['typicalPatterns']).slice(0, 3);
      const invalid = pickAnyArray(pb, ['invalidationClues']).slice(0, 3);
      const risk = pickAnyArray(pb, ['riskNotes']).slice(0, 3);

      return [
        `- ${name}${region ? ` · ${region}` : ''}${importance ? ` · ważność: ${importance}` : ''}`,
        `  Na co patrzeć: ${watch.join(' | ')}`,
        `  Typowe mechanizmy: ${patterns.join(' | ')}`,
        `  Kiedy odwraca: ${invalid.join(' | ')}`,
        `  Ryzyka: ${risk.join(' | ')}`,
      ].join('\n');
    });

    out = [
      'KONTEXT (EDU): Playbooki eventowe — schemat interpretacji danych (what to watch / typical patterns / invalidation / risk).',
      hint.keywords.length
        ? `Dopasowanie: ${hint.keywords.join(', ')} (jeśli brak dopasowania, użyto ogólnych playbooków).`
        : 'Użyj do przygotowania planu „co obserwować” i „jak nie dać się złapać na pierwszą reakcję”.',
      '',
      ...lines,
    ].join('\n');
  }

  if (src === 'techMaps') {
    const base = TECH_MAPS.slice(0, 10);
    const filtered = filterByAssetTf(base as any, hint);
    const picked = (filtered.length ? filtered : base).slice(0, 6);

    const lines = picked.map((m: any) => {
      const asset = pickAnyString(m, ['asset'], 'ASSET');
      const tf = pickAnyString(m, ['timeframe', 'tf'], '');
      const levels = Array.isArray(m?.keyLevels) ? m.keyLevels : [];
      const indicators = Array.isArray(m?.indicators) ? m.indicators : [];
      const notes = Array.isArray(m?.scenarioNotes) ? m.scenarioNotes : [];

      return [
        `- ${asset}${tf ? ` · ${tf}` : ''}`,
        `  Trend: ${clamp(String(m?.trend ?? ''), 220)}`,
        `  Poziomy: ${levels.slice(0, 6).join(', ')}`,
        `  Wskaźniki: ${indicators.slice(0, 4).join(' | ')}`,
        `  Zmienność: ${clamp(String(m?.volatility ?? ''), 180)}`,
        `  Notatki: ${notes.slice(0, 2).map((x: any) => clamp(String(x), 200)).join(' | ')}`,
      ].join('\n');
    });

    out = [
      'KONTEXT (EDU): Mapy techniczne — opis trendu, poziomów, wskaźników i zmienności (bez sygnałów).',
      hint.asset || hint.timeframe
        ? `Dopasowanie: ${[hint.asset, hint.timeframe].filter(Boolean).join(' · ')} (jeśli brak dopasowania, użyto ogólnych map).`
        : 'Użyj jako kontekstu do scenariuszy warunkowych.',
      '',
      ...lines,
    ].join('\n');
  }

  return clamp(out, maxChars);
}

