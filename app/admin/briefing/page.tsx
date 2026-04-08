'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import BackButton from '@/components/BackButton';
import { Loader2, Sunrise } from 'lucide-react';
import type {
  MorningBriefingAsset,
  MorningBriefingEvent,
  MorningBriefingLivePriceSource,
  MorningBriefingScenarioBlock,
  MorningHistoricalBehavior,
  MorningInstitutionalBriefing,
  MorningInstitutionalDepth,
  MorningInstitutionalLanguage,
  MorningMacroTheme,
} from '@/lib/brief/morningInstitutionalBriefingTypes';
import type {
  MorningBriefingQuestionItem,
  MorningBriefingQuestionsPack,
} from '@/lib/brief/morningBriefingQuestionsTypes';
import {
  difficultyLabel,
  getMorningBriefingLocale,
  type MorningBriefingLocale,
} from '@/lib/brief/morningBriefingLocale';
import { normalizeMorningBriefingQuestionsPack } from '@/lib/brief/normalizeMorningBriefingQuestionsPack';
import {
  buildMorningBriefingGlossary,
  formatMorningBriefingGlossaryToPlainText,
  morningBriefingGlossaryTxtFilename,
} from '@/lib/brief/morningBriefingGlossary';
import {
  downloadTextFileUtf8,
  formatMorningBriefingToPlainText,
  morningBriefingTxtFilename,
} from '@/lib/brief/morningBriefingToPlainText';
import {
  formatMorningBriefingQuestionsToPlainText,
  morningBriefingQuestionsTxtFilename,
} from '@/lib/brief/morningBriefingQuestionsToPlainText';
import type { CompactFallbackCopy } from '@/lib/brief/morningBriefingPresentationQuality';
import {
  buildCompactFallbackCopy,
  buildFilteredBriefingForRender,
  filterMeaningfulHistoricalRows,
  shouldRenderSection,
  shouldUseCompactBriefingFallback,
} from '@/lib/brief/morningBriefingPresentationQuality';
import type { BriefingFormat, NarrativeBriefResponse } from '@/lib/brief/narrativeBriefingTypes';
import { parseNarrativeBriefingFromUnknown } from '@/lib/brief/parseNarrativeBriefing';
import {
  formatNarrativeBriefingToPlainText,
  narrativeBriefingTxtFilename,
} from '@/lib/brief/narrativeBriefingPlainText';

export type {
  MorningBriefingAsset,
  MorningBriefingEvent,
  MorningBriefingLivePriceSource,
  MorningBriefingScenarioBlock,
  MorningHistoricalBehavior,
  MorningInstitutionalBriefing,
  MorningInstitutionalDepth,
  MorningInstitutionalLanguage,
  MorningMacroTheme,
} from '@/lib/brief/morningInstitutionalBriefingTypes';

export type { MorningBriefingQuestionItem, MorningBriefingQuestionsPack } from '@/lib/brief/morningBriefingQuestionsTypes';

export type { BriefingFormat, NarrativeBriefResponse } from '@/lib/brief/narrativeBriefingTypes';

function asStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter((i): i is string => typeof i === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function asNonEmptyString(x: unknown): string {
  return typeof x === 'string' ? x : '';
}

function parseMacroThemeRow(row: unknown): MorningMacroTheme | null {
  if (row == null) return null;
  if (typeof row === 'string') {
    const s = row.trim();
    if (!s) return null;
    return {
      title: '—',
      whatHappened: s,
      whyItMatters: '',
      marketImpact: '',
    };
  }
  if (typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  return {
    title: asNonEmptyString(r.title),
    whatHappened: asNonEmptyString(r.whatHappened),
    whyItMatters: asNonEmptyString(r.whyItMatters),
    marketImpact: asNonEmptyString(r.marketImpact),
  };
}

function parseMacroRegion(x: unknown): MorningMacroTheme[] {
  if (!Array.isArray(x)) return [];
  const out: MorningMacroTheme[] = [];
  for (const row of x) {
    const t = parseMacroThemeRow(row);
    if (t) out.push(t);
  }
  return out;
}

function parseMacro(x: unknown): MorningInstitutionalBriefing['macro'] {
  const o = x && typeof x === 'object' ? (x as Record<string, unknown>) : {};
  return {
    usa: parseMacroRegion(o.usa),
    europe: parseMacroRegion(o.europe),
    asia: parseMacroRegion(o.asia),
    geopolitics: parseMacroRegion(o.geopolitics),
  };
}

function parseEvents(x: unknown): MorningBriefingEvent[] {
  if (!Array.isArray(x)) return [];
  const out: MorningBriefingEvent[] = [];
  for (const row of x) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const impact =
      typeof r.marketImpact === 'string'
        ? r.marketImpact
        : typeof r.impact === 'string'
          ? r.impact
          : '';
    out.push({
      name: asNonEmptyString(r.name),
      expectation: asNonEmptyString(r.expectation),
      bullCase: asNonEmptyString(r.bullCase),
      bearCase: asNonEmptyString(r.bearCase),
      marketImpact: impact,
    });
  }
  return out;
}

function parseLivePriceSource(x: unknown): MorningBriefingLivePriceSource | undefined {
  if (x === 'live' || x === 'override_recent' || x === 'none') return x;
  return undefined;
}

function parseHistoricalBehavior(x: unknown): MorningHistoricalBehavior[] {
  if (!Array.isArray(x)) return [];
  const out: MorningHistoricalBehavior[] = [];
  for (const row of x) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    out.push({
      setup: asNonEmptyString(r.setup),
      reaction: asNonEmptyString(r.reaction),
      lesson: asNonEmptyString(r.lesson),
    });
  }
  return out;
}

function parseAssets(x: unknown): MorningBriefingAsset[] {
  if (!Array.isArray(x)) return [];
  const out: MorningBriefingAsset[] = [];
  for (const row of x) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const ctx =
      typeof r.currentContext === 'string'
        ? r.currentContext
        : typeof r.context === 'string'
          ? r.context
          : '';
    const bull =
      typeof r.triggerBull === 'string'
        ? r.triggerBull
        : typeof r.bullishTrigger === 'string'
          ? r.bullishTrigger
          : typeof r.trigger === 'string'
            ? r.trigger
            : '';
    const bear =
      typeof r.triggerBear === 'string'
        ? r.triggerBear
        : typeof r.bearishTrigger === 'string'
          ? r.bearishTrigger
          : '';
    const liveRaw = typeof r.livePrice === 'string' ? r.livePrice.trim() : '';
    const asset: MorningBriefingAsset = {
      asset: asNonEmptyString(r.asset),
      currentContext: ctx,
      drivers: asNonEmptyString(r.drivers),
      triggerBull: bull,
      triggerBear: bear,
      triggerLogic:
        typeof r.triggerLogic === 'string'
          ? r.triggerLogic
          : typeof r.trigger_logic === 'string'
            ? r.trigger_logic
            : '',
      historicalBehavior: parseHistoricalBehavior(r.historicalBehavior),
    };
    const lps = parseLivePriceSource(r.livePriceSource);
    if (lps !== undefined) asset.livePriceSource = lps;
    const ageRaw = r.livePriceAgeHours;
    if (typeof ageRaw === 'number' && Number.isFinite(ageRaw)) {
      asset.livePriceAgeHours = ageRaw;
    }
    if (liveRaw) asset.livePrice = liveRaw;
    out.push(asset);
  }
  return out;
}

function parseScenarios(x: unknown): MorningBriefingScenarioBlock[] {
  if (!Array.isArray(x)) return [];
  const out: MorningBriefingScenarioBlock[] = [];
  for (const row of x) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const ifVal = r['if'];
    const thenVal = r['then'];
    const confirm =
      typeof r.confirmation === 'string'
        ? r.confirmation
        : typeof r.watch === 'string'
          ? r.watch
          : '';
    out.push({
      title: asNonEmptyString(r.title),
      scenarioIf: typeof ifVal === 'string' ? ifVal : '',
      scenarioThen: typeof thenVal === 'string' ? thenVal : '',
      confirmation: confirm,
      crossAssetReaction: asNonEmptyString(r.crossAssetReaction),
    });
  }
  return out;
}

function normalizeBriefing(raw: unknown): MorningInstitutionalBriefing {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const exec =
    typeof o.executiveSummary === 'string'
      ? o.executiveSummary.trim()
      : typeof o.executive_summary === 'string'
        ? o.executive_summary.trim()
        : '';

  const scenariosRaw = o.scenarios;
  const scenariosParsed = parseScenarios(scenariosRaw);
  const legacyScenarios = asStringArray(scenariosRaw);
  const scenarios: MorningBriefingScenarioBlock[] =
    scenariosParsed.length > 0
      ? scenariosParsed
      : legacyScenarios.map((line) => ({
          title: '—',
          scenarioIf: line,
          scenarioThen: '',
          confirmation: '',
          crossAssetReaction: '',
        }));

  const diffRaw = o.whatsDifferentVsRecentDays ?? o.whats_different_vs_recent_days;
  const qs =
    typeof o.quickSummary === 'string'
      ? o.quickSummary.trim()
      : asStringArray(o.conclusions).join(' ').trim();
  return {
    whatsDifferentVsRecentDays: asStringArray(diffRaw),
    tldr: asStringArray(o.tldr),
    executiveSummary: exec,
    macro: parseMacro(o.macro),
    events: parseEvents(o.events),
    assets: parseAssets(o.assets),
    crossAssetLinks: asStringArray(o.crossAssetLinks),
    scenarios,
    quickSummary: qs,
  };
}

type UiPhase = 'idle' | 'loading' | 'success' | 'error';

function derivePhase(
  loading: boolean,
  error: string | null,
  briefing: MorningInstitutionalBriefing | null,
  narrativeBriefing: NarrativeBriefResponse | null,
): UiPhase {
  if (loading) return 'loading';
  if (error) return 'error';
  if (briefing || narrativeBriefing) return 'success';
  return 'idle';
}

type QuestionsUiPhase = 'idle' | 'loading' | 'success' | 'error';

function deriveQuestionsPhase(
  loading: boolean,
  error: string | null,
  pack: MorningBriefingQuestionsPack | null,
): QuestionsUiPhase {
  if (loading) return 'loading';
  if (error) return 'error';
  if (pack) return 'success';
  return 'idle';
}

const selectClass =
  'rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-sky-500/40 min-w-[8rem]';

const controlInputClass =
  'w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-sky-500/40 placeholder:text-white/35 disabled:opacity-45';

const controlTextareaClass = `${controlInputClass} min-h-[88px] resize-y`;

function BulletList({ items, emptyHint }: { items: string[]; emptyHint: string }) {
  if (!items.length) {
    return <p className="text-sm text-white/45">{emptyHint}</p>;
  }
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/85 leading-relaxed">
      {items.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

function MacroRegionCard({
  loc,
  title,
  themes,
}: {
  loc: MorningBriefingLocale;
  title: string;
  themes: MorningMacroTheme[];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-200/85 mb-3">{title}</h3>
      {!themes.length ? (
        <p className="text-sm text-white/45">{loc.emptyNoEntries}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {themes.map((m, i) => (
            <li key={i} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
              <p className="font-semibold text-white text-sm">{m.title || loc.emptyDash}</p>
              <dl className="mt-2 space-y-2 text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{loc.fldWhatHappened}</dt>
                  <dd className="mt-0.5 text-white/80">{m.whatHappened || loc.emptyDash}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{loc.fldWhyMatters}</dt>
                  <dd className="mt-0.5 text-white/80">{m.whyItMatters || loc.emptyDash}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{loc.fldMarketImpact}</dt>
                  <dd className="mt-0.5 text-white/80">{m.marketImpact || loc.emptyDash}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">{children}</h2>
  );
}

function CompactBriefingPanel({ L, copy }: { L: MorningBriefingLocale; copy: CompactFallbackCopy }) {
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-950/30 via-white/[0.045] to-white/[0.02] px-5 py-6 sm:px-8 sm:py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      <h2 className="text-xl font-bold tracking-tight text-white">{L.compactCardTitle}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{L.compactCardSubtitle}</p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="mb-3 border-b border-white/10 pb-2 text-sm font-semibold text-amber-100/95">
            {L.compactSecDetected}
          </h3>
          <p className="text-sm leading-relaxed text-white/88 whitespace-pre-wrap">{copy.detected}</p>
        </div>
        <div>
          <h3 className="mb-3 border-b border-white/10 pb-2 text-sm font-semibold text-amber-100/95">
            {L.compactSecMissing}
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/82">
            {copy.missingLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        {copy.watch ? (
          <div>
            <h3 className="mb-3 border-b border-white/10 pb-2 text-sm font-semibold text-amber-100/95">
              {L.compactSecWatch}
            </h3>
            <p className="text-sm leading-relaxed text-white/88 whitespace-pre-wrap">{copy.watch}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NarrativeBriefingArticle({ n, loc }: { n: NarrativeBriefResponse; loc: MorningBriefingLocale }) {
  const es = n.eventShift;
  const ep = n.eventPriorityFilter;
  const tierLabel = (t: 'high' | 'medium') => (t === 'high' ? loc.narrativeTierHigh : loc.narrativeTierMedium);
  return (
    <article className="mx-auto max-w-3xl space-y-12">
      <header className="border-b border-white/10 pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-200/75">{n.dateLabel}</p>
        {n.title?.trim() ? (
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem] leading-snug">
            {n.title.trim()}
          </h2>
        ) : null}
      </header>

      <section className="space-y-6" aria-label={loc.narrativeSecEventPriorityFilter}>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-cyan-200/85">
          {loc.narrativeSecEventPriorityFilter}
        </h3>
        {ep.hasConcreteHeadlineEvent && ep.headlineEventOneLiner.trim() ? (
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/[0.07] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200/90">{loc.narrativeLabelHeadlineEvent}</p>
            <p className="mt-2 text-[15px] sm:text-base leading-relaxed text-white font-medium whitespace-pre-wrap">
              {ep.headlineEventOneLiner.trim()}
            </p>
          </div>
        ) : null}
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{loc.narrativeLabelPrimaryDriver}</p>
          <p className="mt-1 text-sm text-white/90 leading-snug">{ep.primaryDriver}</p>
        </div>
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/45">{loc.narrativeLabelTopThreeRank}</p>
          <div className="space-y-3">
            {ep.topThreeEvents.map((ev, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-3 text-sm text-white/85"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-cyan-300/90">{idx + 1}.</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      ev.priorityTier === 'high'
                        ? 'bg-rose-500/20 text-rose-200/95'
                        : 'bg-white/10 text-white/65'
                    }`}
                  >
                    {tierLabel(ev.priorityTier)}
                  </span>
                </div>
                <p className="mt-2 text-[15px] leading-snug text-white/92">{ev.summary}</p>
                <p className="mt-2 text-xs text-white/50">{loc.narrativeLabelChannelsImpact}</p>
                <p className="mt-0.5 text-sm text-white/78 whitespace-pre-wrap">{ev.channelsImpactOilIndicesFxVix}</p>
                <p className="mt-2 text-xs text-white/55 leading-relaxed">{ev.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6" aria-label={loc.narrativeSecEventShift}>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200/80">
          {loc.narrativeSecEventShift}
        </h3>
        <p className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">{es.changeLast12to24h}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{loc.narrativeMetaDominantEvent}</dt>
            <dd className="mt-1 text-white/88 leading-snug">{es.dominantEvent}</dd>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{loc.narrativeMetaScenarioPivot}</dt>
            <dd className="mt-1 text-white/85 leading-snug">
              <span className="text-white/55">{es.priorScenario}</span>
              <span className="mx-2 text-white/35">→</span>
              <span className="text-sky-200/90">{es.currentScenario}</span>
            </dd>
          </div>
        </dl>
        <div className="space-y-4 border-l-2 border-emerald-400/35 pl-4">
          {es.openingThreeSentences.map((s, i) => (
            <p key={i} className="text-[15px] sm:text-base leading-[1.82] text-white/92 font-medium whitespace-pre-wrap">
              {s}
            </p>
          ))}
        </div>
      </section>

      <section className="space-y-5" aria-label={loc.narrativeSecDeskContinuation}>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{loc.narrativeSecDeskContinuation}</h3>
        <div className="space-y-5">
          {n.leadParagraphs.map((p, i) => (
            <p key={i} className="text-[15px] sm:text-base leading-[1.82] text-white/88 whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="space-y-5 border-t border-white/10 pt-10" aria-label={n.marketMechanics.title}>
        <h3 className="text-xl font-semibold text-white">{n.marketMechanics.title}</h3>
        <div className="space-y-5">
          {n.marketMechanics.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] sm:text-base leading-[1.82] text-white/86 whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
        {n.marketMechanics.bulletBlocks?.map((b, i) => (
          <div key={i} className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-white/90">{b.title}</h4>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/80">
              {b.bullets.map((line, j) => (
                <li key={j}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {n.updates?.length ? (
        <section className="space-y-10 border-t border-white/10 pt-10" aria-label={loc.narrativeSecUpdates}>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-amber-200/75">{loc.narrativeSecUpdates}</h3>
          {n.updates.map((u, idx) => (
            <div key={idx} className="space-y-4">
              {u.dateLabel?.trim() ? <p className="text-sm text-white/50">{u.dateLabel.trim()}</p> : null}
              {u.title?.trim() ? <h4 className="text-lg font-semibold text-white">{u.title.trim()}</h4> : null}
              {u.paragraphs.map((p, j) => (
                <p key={j} className="text-[15px] sm:text-base leading-[1.82] text-white/86 whitespace-pre-wrap">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-5 border-t border-white/10 pt-10" aria-label={n.marketContext.title}>
        <h3 className="text-xl font-semibold text-white">{n.marketContext.title}</h3>
        <div className="space-y-5">
          {n.marketContext.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] sm:text-base leading-[1.82] text-white/86 whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
        {n.marketContext.bulletBlocks?.map((b, i) => (
          <div key={i} className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-white/90">{b.title}</h4>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/80">
              {b.bullets.map((line, j) => (
                <li key={j}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="space-y-5 border-t border-white/10 pt-10" aria-label={n.forwardRealities.title}>
        <h3 className="text-xl font-semibold text-amber-100/95">{n.forwardRealities.title}</h3>
        <ul className="space-y-3 text-sm leading-relaxed text-white/88">
          {n.forwardRealities.conditionals.map((row, i) => (
            <li key={i} className="rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3">
              <span className="font-semibold text-amber-200/90">{loc.narrativeForwardIfPrefix} </span>
              <span className="text-white/90">{row.if}</span>
              <span className="mx-2 text-amber-200/70">→</span>
              <span className="text-white/85">{row.then}</span>
            </li>
          ))}
        </ul>
      </section>

      {n.scenarios?.length ? (
        <section className="space-y-8 border-t border-white/10 pt-10" aria-label={loc.narrativeSecScenarios}>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-violet-200/80">
            {loc.narrativeSecScenarios}
          </h3>
          {n.scenarios.map((s, i) => (
            <div key={i} className="space-y-3">
              <h4 className="text-lg font-semibold text-white">{s.title}</h4>
              {(s.paragraphs ?? []).map((p, j) => (
                <p key={j} className="text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
                  {p}
                </p>
              ))}
              {(s.bullets ?? []).length ? (
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/80">
                  {(s.bullets ?? []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {n.glossary.length ? (
        <section className="border-t border-white/10 pt-10" aria-label={loc.narrativeSecGlossary}>
          <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-white/45">
            {loc.narrativeSecGlossary}
          </h3>
          <dl className="space-y-4">
            {n.glossary.map((g, i) => (
              <div key={i} className="rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3">
                <dt className="text-sm font-semibold text-sky-200/95">{g.term}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-white/78">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </article>
  );
}

function QuestionCard({ q, index, loc }: { q: MorningBriefingQuestionItem; index: number; loc: MorningBriefingLocale }) {
  const typeLabel = q.type === 'open_text' ? loc.typeOpenText : loc.typeSingleChoice;
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-violet-200/85 mb-1">
        {index + 1}. [{typeLabel}]
      </p>
      <p className="font-semibold text-white text-sm">{q.question || loc.emptyDash}</p>
      {q.type === 'single_choice' ? (
        <ul className="mt-3 space-y-1 text-sm text-white/85">
          {q.options.length === 0 ? (
            <li className="text-white/45">{loc.txtNone}</li>
          ) : (
            q.options.map((opt, i) => (
              <li key={i}>
                <span className="text-white/55">{loc.optionLetter(i)}</span> {opt}
              </li>
            ))
          )}
        </ul>
      ) : null}
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">
            {q.type === 'open_text' ? loc.modelAnswerOpenText : loc.fldCorrectAnswer}
          </dt>
          <dd className="mt-0.5 text-emerald-200/90">{q.correctAnswer || loc.emptyDash}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{loc.fldExplanation}</dt>
          <dd className="mt-0.5 text-white/80">{q.explanation || loc.emptyDash}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{loc.fldDifficulty}</dt>
          <dd className="mt-0.5 text-white/80">{difficultyLabel(loc, q.difficulty)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{loc.fldSourceSection}</dt>
          <dd className="mt-0.5 text-sky-200/85">{q.sourceSection || loc.emptyDash}</dd>
        </div>
      </dl>
    </li>
  );
}

export default function AdminMorningBriefingPage() {
  const [language, setLanguage] = useState<MorningInstitutionalLanguage>('pl');
  const [glossaryLanguage, setGlossaryLanguage] = useState<MorningInstitutionalLanguage>('pl');
  const [depth, setDepth] = useState<MorningInstitutionalDepth>('long');
  const [briefingFormat, setBriefingFormat] = useState<BriefingFormat>('structured');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<MorningInstitutionalBriefing | null>(null);
  const [narrativeBriefing, setNarrativeBriefing] = useState<NarrativeBriefResponse | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  /** API zwróciło `status: no_data` + statyczny fallback (brak RSS/klastra). */
  const [noDataFallbackMessage, setNoDataFallbackMessage] = useState<string | null>(null);

  const [questionsPack, setQuestionsPack] = useState<MorningBriefingQuestionsPack | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [questionsGeneratedAt, setQuestionsGeneratedAt] = useState<Date | null>(null);

  const [useManualTheme, setUseManualTheme] = useState(false);
  const [manualThemeTitle, setManualThemeTitle] = useState('');
  const [manualNarrativeContext, setManualNarrativeContext] = useState('');
  const [manualRelatedAssets, setManualRelatedAssets] = useState('');
  const [narrativeHorizon, setNarrativeHorizon] = useState<'today' | '2-3_days' | 'weekly'>('today');
  const [manualNarrativeMode, setManualNarrativeMode] = useState<
    'auto' | 'manual_only' | 'manual_plus_live_context'
  >('auto');

  const L = useMemo(() => getMorningBriefingLocale(language), [language]);

  const filteredBrief = useMemo(
    () => (briefing ? buildFilteredBriefingForRender(briefing) : null),
    [briefing],
  );
  const briefingCompact = Boolean(briefing && shouldUseCompactBriefingFallback(briefing));
  const compactFallbackCopy = useMemo(() => {
    if (!briefing || !briefingCompact) return null;
    return buildCompactFallbackCopy(briefing, L);
  }, [briefing, briefingCompact, L]);

  const structuredPair = useMemo(
    () => (briefing && filteredBrief ? { b: briefing, f: filteredBrief } : null),
    [briefing, filteredBrief],
  );

  useEffect(() => {
    setQuestionsPack(null);
    setQuestionsGeneratedAt(null);
    setQuestionsError(null);
  }, [language, depth]);

  useEffect(() => {
    setBriefing(null);
    setNarrativeBriefing(null);
    setGeneratedAt(null);
    setNoDataFallbackMessage(null);
    setQuestionsPack(null);
    setQuestionsGeneratedAt(null);
    setQuestionsError(null);
  }, [briefingFormat]);

  const phase = useMemo(
    () => derivePhase(loading, error, briefing, narrativeBriefing),
    [loading, error, briefing, narrativeBriefing],
  );
  const questionsPhase = useMemo(
    () => deriveQuestionsPhase(questionsLoading, questionsError, questionsPack),
    [questionsLoading, questionsError, questionsPack],
  );

  const generate = useCallback(async () => {
    const loc = getMorningBriefingLocale(language);
    const manualActive = useManualTheme && manualNarrativeMode !== 'auto';
    if (manualActive && !manualThemeTitle.trim()) {
      setError(loc.errorManualThemeRequired);
      return;
    }
    setLoading(true);
    setError(null);
    setNoDataFallbackMessage(null);
    try {
      const r = await fetch('/api/brief/morning-institutional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          depth,
          briefingFormat,
          useManualTheme: manualActive,
          manualThemeTitle: manualThemeTitle.trim(),
          manualNarrativeContext: manualNarrativeContext.trim(),
          manualRelatedAssets: manualRelatedAssets.trim(),
          narrativeHorizon,
          manualNarrativeMode: manualActive ? manualNarrativeMode : 'auto',
        }),
      });
      const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
      if (!r.ok || data.ok === false) {
        const msg =
          typeof data.error === 'string' && data.error.trim()
            ? data.error
            : loc.errorRequestFailed(r.status);
        throw new Error(msg);
      }
      const msgRaw = data.message;
      const isNoDataFallback =
        data.fallback === true && data.status === 'no_data' && typeof msgRaw === 'string';
      setNoDataFallbackMessage(isNoDataFallback ? msgRaw.trim() : null);
      const rawBriefing = data.briefing;
      if (rawBriefing == null || typeof rawBriefing !== 'object') {
        throw new Error(loc.errorNoBriefingField);
      }
      const fmt = data.briefingFormat === 'narrative' ? 'narrative' : 'structured';
      if (fmt === 'narrative') {
        const parsedNarrative = parseNarrativeBriefingFromUnknown(rawBriefing);
        if (!parsedNarrative) {
          throw new Error(loc.errorNoBriefingField);
        }
        setNarrativeBriefing(parsedNarrative);
        setBriefing(null);
      } else {
        setBriefing(normalizeBriefing(rawBriefing));
        setNarrativeBriefing(null);
      }
      setGeneratedAt(new Date());
      setQuestionsPack(null);
      setQuestionsGeneratedAt(null);
      setQuestionsError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : loc.errorUnknown);
    } finally {
      setLoading(false);
    }
  }, [
    language,
    depth,
    useManualTheme,
    manualNarrativeMode,
    manualThemeTitle,
    manualNarrativeContext,
    manualRelatedAssets,
    narrativeHorizon,
    briefingFormat,
  ]);

  const exportTxt = useCallback(() => {
    const at = generatedAt ?? new Date();
    if (narrativeBriefing) {
      const text = formatNarrativeBriefingToPlainText(narrativeBriefing, { generatedAt: at, language, depth });
      const filename = narrativeBriefingTxtFilename(language, depth, at);
      downloadTextFileUtf8(filename, text);
      return;
    }
    if (!briefing) return;
    const text = formatMorningBriefingToPlainText(briefing, { generatedAt: at, language, depth });
    const filename = morningBriefingTxtFilename(language, depth, at);
    downloadTextFileUtf8(filename, text);
  }, [briefing, narrativeBriefing, generatedAt, language, depth]);

  const exportGlossaryTxt = useCallback(() => {
    const at = generatedAt ?? new Date();
    const Lg = getMorningBriefingLocale(glossaryLanguage);
    if (narrativeBriefing?.glossary?.length) {
      const lines = [
        Lg.glossaryDocTitle,
        '',
        ...narrativeBriefing.glossary.map((g) => `${g.term}\n${g.definition}\n`),
        '— — —',
        '',
        `${Lg.txtGeneratedAt}: ${at.toISOString()}`,
      ];
      const filename = `glossary-narrative-${glossaryLanguage}-${language}-${depth}-${at.toISOString().slice(0, 10)}.txt`;
      downloadTextFileUtf8(filename, lines.join('\n'));
      return;
    }
    if (!briefing) return;
    const doc = buildMorningBriefingGlossary(briefing, glossaryLanguage);
    const text = formatMorningBriefingGlossaryToPlainText(doc, {
      generatedAt: at,
      glossaryLanguage,
      briefingLanguage: language,
      depth,
    });
    const filename = morningBriefingGlossaryTxtFilename(glossaryLanguage, language, depth, at);
    downloadTextFileUtf8(filename, text);
  }, [briefing, narrativeBriefing, generatedAt, glossaryLanguage, language, depth]);

  const generateQuestions = useCallback(async () => {
    if (!briefing) return;
    const loc = getMorningBriefingLocale(language);
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const r = await fetch('/api/brief/morning-institutional/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, depth, briefing }),
      });
      const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
      if (!r.ok || data.ok === false) {
        const msg =
          typeof data.error === 'string' && data.error.trim()
            ? data.error
            : loc.questionsErrorRequestFailed(r.status);
        throw new Error(msg);
      }
      const normalized = normalizeMorningBriefingQuestionsPack(data.pack);
      if (!normalized) {
        throw new Error(loc.questionsErrorNoPack);
      }
      setQuestionsPack(normalized);
      setQuestionsGeneratedAt(new Date());
    } catch (e: unknown) {
      setQuestionsError(e instanceof Error ? e.message : loc.errorUnknown);
      setQuestionsPack(null);
      setQuestionsGeneratedAt(null);
    } finally {
      setQuestionsLoading(false);
    }
  }, [briefing, language, depth]);

  const exportQuestionsTxt = useCallback(() => {
    if (!questionsPack) return;
    const at = questionsGeneratedAt ?? new Date();
    const text = formatMorningBriefingQuestionsToPlainText(questionsPack, {
      generatedAt: at,
      language,
      depth,
    });
    const filename = morningBriefingQuestionsTxtFilename(language, depth, at);
    downloadTextFileUtf8(filename, text);
  }, [questionsPack, questionsGeneratedAt, language, depth]);

  const phaseBanner = (() => {
    switch (phase) {
      case 'idle':
        return (
          <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
            {L.briefingIdleHint}
          </div>
        );
      case 'loading':
        return (
          <div className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-950/25 px-4 py-3 text-sm text-sky-100">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sky-300" aria-hidden />
            <span>{L.briefingLoading}</span>
          </div>
        );
      case 'success': {
        const narrativeOk = narrativeBriefing != null;
        const compactBanner = briefing != null && shouldUseCompactBriefingFallback(briefing);
        return (
          <div
            className={
              narrativeOk
                ? 'rounded-xl border border-emerald-500/35 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100'
                : compactBanner
                  ? 'rounded-xl border border-amber-500/35 bg-amber-950/25 px-4 py-3 text-sm text-amber-50'
                  : 'rounded-xl border border-emerald-500/35 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100'
            }
          >
            {narrativeOk ? L.briefingSuccessNarrative : compactBanner ? L.briefingSuccessCompact : L.briefingSuccess}
          </div>
        );
      }
      case 'error':
        return (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/25 px-4 py-3 text-sm text-rose-100">
            {error ?? L.errorGeneric}
          </div>
        );
      default:
        return null;
    }
  })();

  const questionsBanner = briefing
    ? (() => {
        switch (questionsPhase) {
          case 'idle':
            return (
              <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
                {L.questionsIdleHint}
              </div>
            );
          case 'loading':
            return (
              <div className="flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-950/25 px-4 py-3 text-sm text-violet-100">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-violet-300" aria-hidden />
                <span>{L.questionsLoading}</span>
              </div>
            );
          case 'success':
            return (
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
                {L.questionsSuccess}
              </div>
            );
          case 'error':
            return (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/25 px-4 py-3 text-sm text-rose-100">
                {questionsError ?? L.questionsErrorGeneric}
              </div>
            );
          default:
            return null;
        }
      })()
    : null;

  const questionsBusy = questionsLoading;
  const briefingOrQuestionsBusy = loading || questionsBusy;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>

        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-sky-200/90">
              <Sunrise className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{L.pageTitle}</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-white/60 leading-relaxed">{L.pageSubtitle}</p>
            </div>
          </div>
        </header>

        <section
          className="mb-8 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-4 sm:px-5 sm:py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          aria-label={L.controlPanel}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-white/45 mb-3">{L.controlPanel}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="brief-lang" className="text-xs text-white/50">
                {L.labelLanguage}
              </label>
              <select
                id="brief-lang"
                className={selectClass}
                value={language}
                disabled={loading}
                onChange={(e) => {
                  const v = e.target.value;
                  setLanguage(v === 'en' ? 'en' : v === 'cs' ? 'cs' : 'pl');
                }}
              >
                <option value="pl">Polski (pl)</option>
                <option value="en">English (en)</option>
                <option value="cs">Čeština (cs)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="brief-depth" className="text-xs text-white/50">
                {L.labelDepth}
              </label>
              <select
                id="brief-depth"
                className={selectClass}
                value={depth}
                disabled={loading}
                onChange={(e) => setDepth(e.target.value === 'short' ? 'short' : 'long')}
              >
                <option value="short">{L.depthShort}</option>
                <option value="long">{L.depthLong}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0 sm:min-w-[14rem]">
              <label htmlFor="brief-format" className="text-xs text-white/50">
                {L.labelBriefingFormat}
              </label>
              <select
                id="brief-format"
                className={`${selectClass} w-full min-w-0`}
                value={briefingFormat}
                disabled={loading}
                onChange={(e) => {
                  const v = e.target.value;
                  setBriefingFormat(v === 'narrative' ? 'narrative' : 'structured');
                }}
              >
                <option value="structured">{L.optFormatStructured}</option>
                <option value="narrative">{L.optFormatNarrative}</option>
              </select>
            </div>
          </div>

          <div
            className="mt-5 border-t border-white/10 pt-5 space-y-4"
            aria-label={L.manualSectionTitle}
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-200/80 mb-1">
                {L.manualSectionTitle}
              </p>
              <p className="text-xs text-white/50 leading-relaxed max-w-3xl">{L.manualSectionHint}</p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:max-w-xl">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-slate-950 text-sky-500 focus:ring-sky-500/40"
                checked={useManualTheme}
                disabled={loading}
                onChange={(e) => setUseManualTheme(e.target.checked)}
              />
              <span className="text-sm text-white/85 leading-snug">{L.labelUseManualTheme}</span>
            </label>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label htmlFor="manual-theme" className="text-xs text-white/50">
                  {L.labelManualThemeTitle}
                </label>
                <input
                  id="manual-theme"
                  type="text"
                  className={controlInputClass}
                  value={manualThemeTitle}
                  disabled={loading || !useManualTheme}
                  onChange={(e) => setManualThemeTitle(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label htmlFor="manual-narrative" className="text-xs text-white/50">
                  {L.labelManualNarrative}
                </label>
                <textarea
                  id="manual-narrative"
                  className={controlTextareaClass}
                  value={manualNarrativeContext}
                  disabled={loading || !useManualTheme}
                  onChange={(e) => setManualNarrativeContext(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label htmlFor="manual-assets" className="text-xs text-white/50">
                  {L.labelManualAssets}
                </label>
                <input
                  id="manual-assets"
                  type="text"
                  className={controlInputClass}
                  value={manualRelatedAssets}
                  disabled={loading || !useManualTheme}
                  onChange={(e) => setManualRelatedAssets(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="narrative-horizon" className="text-xs text-white/50">
                  {L.labelNarrativeHorizon}
                </label>
                <select
                  id="narrative-horizon"
                  className={`${selectClass} w-full min-w-0 sm:min-w-[12rem]`}
                  disabled={loading || !useManualTheme}
                  value={narrativeHorizon}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNarrativeHorizon(v === 'weekly' ? 'weekly' : v === '2-3_days' ? '2-3_days' : 'today');
                  }}
                >
                  <option value="today">{L.optHorizonToday}</option>
                  <option value="2-3_days">{L.optHorizon23Days}</option>
                  <option value="weekly">{L.optHorizonWeekly}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="manual-mode" className="text-xs text-white/50">
                  {L.labelManualMode}
                </label>
                <select
                  id="manual-mode"
                  className={`${selectClass} w-full min-w-0 sm:min-w-[12rem]`}
                  disabled={loading}
                  value={manualNarrativeMode}
                  onChange={(e) => {
                    const v = e.target.value;
                    setManualNarrativeMode(
                      v === 'manual_only'
                        ? 'manual_only'
                        : v === 'manual_plus_live_context'
                          ? 'manual_plus_live_context'
                          : 'auto',
                    );
                  }}
                >
                  <option value="auto">{L.optModeAuto}</option>
                  <option value="manual_only">{L.optModeManualOnly}</option>
                  <option value="manual_plus_live_context">{L.optModeManualPlus}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              disabled={(!briefing && !narrativeBriefing) || loading}
              onClick={exportTxt}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.12] disabled:pointer-events-none disabled:opacity-40"
            >
              {L.exportBriefingTxt}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void generate()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/20 px-5 py-2.5 text-sm font-semibold text-sky-50 hover:bg-sky-500/30 hover:border-sky-300/50 disabled:pointer-events-none disabled:opacity-45"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {L.generating}
                </>
              ) : (
                L.generateBriefing
              )}
            </button>
          </div>

          <div
            className="mt-5 border-t border-white/10 pt-5"
            aria-label={L.glossarySectionTitle}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-white/45 mb-3">{L.glossarySectionTitle}</p>
            {briefingFormat === 'narrative' ? (
              <p className="text-xs text-white/45 mb-3 max-w-2xl leading-relaxed">{L.glossaryNarrativeHint}</p>
            ) : null}
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="glossary-lang" className="text-xs text-white/50">
                  {L.labelGlossaryLanguage}
                </label>
                <select
                  id="glossary-lang"
                  className={selectClass}
                  value={glossaryLanguage}
                  disabled={loading}
                  onChange={(e) => {
                    const v = e.target.value;
                    setGlossaryLanguage(v === 'en' ? 'en' : v === 'cs' ? 'cs' : 'pl');
                  }}
                >
                  <option value="pl">Polski (pl)</option>
                  <option value="en">English (en)</option>
                  <option value="cs">Čeština (cs)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  disabled={
                    loading ||
                    (narrativeBriefing ? !(narrativeBriefing.glossary?.length) : !briefing)
                  }
                  onClick={exportGlossaryTxt}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.12] disabled:pointer-events-none disabled:opacity-40"
                >
                  {L.exportGlossaryTxt}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 space-y-3">
          {phaseBanner}
          {noDataFallbackMessage ? (
            <div
              className="rounded-xl border border-amber-500/40 bg-amber-950/25 px-4 py-3 text-sm text-amber-50/95"
              role="status"
            >
              {noDataFallbackMessage}{' '}
              <span className="text-amber-200/80">
                (Briefing statyczny — bez OpenAI; sprawdź logi{' '}
                <code className="rounded bg-black/30 px-1 py-0.5 text-xs">[narrative-debug]</code> na Vercelu.)
              </span>
            </div>
          ) : null}
          {narrativeBriefing ? (
            <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
              {L.questionsDisabledNarrative}
            </div>
          ) : briefing ? (
            questionsBanner
          ) : null}
        </div>

        {narrativeBriefing || structuredPair ? (
          <div className="space-y-10 pb-12">
            {narrativeBriefing ? (
              <NarrativeBriefingArticle n={narrativeBriefing} loc={L} />
            ) : structuredPair ? (
              structuredPair.b && shouldUseCompactBriefingFallback(structuredPair.b) && compactFallbackCopy ? (
              <CompactBriefingPanel L={L} copy={compactFallbackCopy} />
            ) : (
              <>
                {shouldRenderSection('whatsDifferent', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secWhatsDifferentToday}</SectionTitle>
                    <BulletList items={structuredPair.f.whatsDifferent} emptyHint={L.emptyNoWhatsDifferent} />
                  </section>
                ) : null}

                {shouldRenderSection('tldr', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secTldr}</SectionTitle>
                    <BulletList items={structuredPair.f.tldr} emptyHint={L.emptyNoTldr} />
                  </section>
                ) : null}

                {shouldRenderSection('executive', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secExecutiveSummary}</SectionTitle>
                    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{structuredPair.b.executiveSummary}</p>
                  </section>
                ) : null}

                {shouldRenderSection('macro', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secMacro}</SectionTitle>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        { title: L.regionUsa, themes: structuredPair.f.macro.usa },
                        { title: L.regionEurope, themes: structuredPair.f.macro.europe },
                        { title: L.regionAsia, themes: structuredPair.f.macro.asia },
                        { title: L.regionGeopolitics, themes: structuredPair.f.macro.geopolitics },
                      ]
                        .filter((r) => r.themes.length > 0)
                        .map((r) => (
                          <MacroRegionCard key={r.title} loc={L} title={r.title} themes={r.themes} />
                        ))}
                    </div>
                  </section>
                ) : null}

                {shouldRenderSection('events', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secEvents}</SectionTitle>
                    <ul className="flex flex-col gap-3">
                      {structuredPair.f.events.map((ev, i) => (
                        <li
                          key={i}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                        >
                          <p className="font-semibold text-white">{ev.name || L.emptyDash}</p>
                          <dl className="mt-3 space-y-2 text-sm">
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldExpectations}</dt>
                              <dd className="mt-0.5 text-white/80">{ev.expectation || L.emptyDash}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldBullCase}</dt>
                              <dd className="mt-0.5 text-emerald-200/85">{ev.bullCase || L.emptyDash}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldBearCase}</dt>
                              <dd className="mt-0.5 text-rose-200/85">{ev.bearCase || L.emptyDash}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldMarketImpact}</dt>
                              <dd className="mt-0.5 text-white/80">{ev.marketImpact || L.emptyDash}</dd>
                            </div>
                          </dl>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {shouldRenderSection('assets', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secAssets}</SectionTitle>
                    <ul className="flex flex-col gap-3">
                      {structuredPair.f.assets.map((a, i) => {
                        const histRows = filterMeaningfulHistoricalRows(a.historicalBehavior);
                        return (
                          <li
                            key={i}
                            className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                          >
                            <p className="font-semibold text-sky-200/95">{a.asset || L.emptyDash}</p>
                            <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                              <div className="sm:col-span-2">
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldContext}</dt>
                                <dd className="mt-0.5 text-white/80">{a.currentContext || L.emptyDash}</dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldDrivers}</dt>
                                <dd className="mt-0.5 text-white/80">{a.drivers || L.emptyDash}</dd>
                              </div>
                              {a.livePrice?.trim() && a.livePriceSource === 'live' ? (
                                <div className="sm:col-span-2">
                                  <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">
                                    {L.assetPriceBadgeLive}
                                  </dt>
                                  <dd className="mt-0.5 text-amber-200/90 font-mono text-sm">{a.livePrice.trim()}</dd>
                                </div>
                              ) : a.livePrice?.trim() && a.livePriceSource === 'override_recent' ? (
                                <div className="sm:col-span-2">
                                  <dt className="text-[10px] font-medium uppercase tracking-wide text-amber-200/55">
                                    {L.assetPriceBadgeOverride}
                                  </dt>
                                  <dd className="mt-0.5 text-amber-200/90 font-mono text-sm">{a.livePrice.trim()}</dd>
                                </div>
                              ) : a.livePrice?.trim() && a.livePriceSource !== 'none' ? (
                                <div className="sm:col-span-2">
                                  <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldLivePrice}</dt>
                                  <dd className="mt-0.5 text-amber-200/90 font-mono text-sm">{a.livePrice.trim()}</dd>
                                </div>
                              ) : null}
                              <div>
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldTriggerBull}</dt>
                                <dd className="mt-0.5 text-emerald-200/85">{a.triggerBull || L.emptyDash}</dd>
                              </div>
                              <div>
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldTriggerBear}</dt>
                                <dd className="mt-0.5 text-rose-200/85">{a.triggerBear || L.emptyDash}</dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldTriggerLogic}</dt>
                                <dd className="mt-0.5 text-white/75">{a.triggerLogic || L.emptyDash}</dd>
                              </div>
                            </dl>
                            {histRows.length ? (
                              <div className="mt-4 border-t border-white/10 pt-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-200/90 mb-2">
                                  {L.secHistoricalAnalogies}
                                </h4>
                                <ul className="flex flex-col gap-3">
                                  {histRows.map((h, j) => (
                                    <li
                                      key={j}
                                      className="rounded-lg border border-white/8 bg-black/20 px-3 py-2.5 text-sm"
                                    >
                                      <p className="text-white/90">
                                        <span className="text-white/50 text-[11px] uppercase tracking-wide">{L.fldSetup} </span>
                                        {h.setup || L.emptyDash}
                                      </p>
                                      <p className="mt-1.5 text-white/85">
                                        <span className="text-white/50 text-[11px] uppercase tracking-wide">{L.fldReaction} </span>
                                        {h.reaction || L.emptyDash}
                                      </p>
                                      <p className="mt-1.5 text-sky-200/90">
                                        <span className="text-white/50 text-[11px] uppercase tracking-wide">{L.fldLesson} </span>
                                        {h.lesson || L.emptyDash}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}

                {shouldRenderSection('crossAsset', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secCrossAsset}</SectionTitle>
                    <BulletList items={structuredPair.f.crossAssetLinks} emptyHint={L.emptyNoCrossAsset} />
                  </section>
                ) : null}

                {shouldRenderSection('scenarios', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secScenarios}</SectionTitle>
                    <ul className="flex flex-col gap-3">
                      {structuredPair.f.scenarios.map((s, i) => (
                        <li
                          key={i}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                        >
                          <p className="font-semibold text-white">{s.title || L.emptyDash}</p>
                          <dl className="mt-3 space-y-2 text-sm">
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldIf}</dt>
                              <dd className="mt-0.5 text-white/80">{s.scenarioIf || L.emptyDash}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldThen}</dt>
                              <dd className="mt-0.5 text-white/80">{s.scenarioThen || L.emptyDash}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldConfirmation}</dt>
                              <dd className="mt-0.5 text-violet-200/85">{s.confirmation || L.emptyDash}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">{L.fldCrossAssetReaction}</dt>
                              <dd className="mt-0.5 text-sky-200/85">{s.crossAssetReaction || L.emptyDash}</dd>
                            </div>
                          </dl>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {shouldRenderSection('quickSummary', structuredPair.f, structuredPair.b) ? (
                  <section>
                    <SectionTitle>{L.secQuickSummary}</SectionTitle>
                    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{structuredPair.b.quickSummary.trim()}</p>
                  </section>
                ) : null}
              </>
              )
            ) : null}

            {structuredPair ? (
            <>
            <section
              className="rounded-xl border border-violet-500/25 bg-violet-950/15 px-4 py-4 sm:px-5 sm:py-5"
              aria-label={L.questionsPanelTitle}
            >
              <h2 className="text-lg font-semibold text-white mb-3">{L.questionsPanelTitle}</h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <button
                  type="button"
                  disabled={!briefing || briefingOrQuestionsBusy}
                  onClick={() => void generateQuestions()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-400/40 bg-violet-600/25 px-5 py-2.5 text-sm font-semibold text-violet-50 hover:bg-violet-600/35 disabled:pointer-events-none disabled:opacity-40"
                >
                  {questionsBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      {L.questionsLoading}
                    </>
                  ) : (
                    L.generateQuestions
                  )}
                </button>
                <button
                  type="button"
                  disabled={!briefing || !questionsPack || briefingOrQuestionsBusy}
                  onClick={exportQuestionsTxt}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.12] disabled:pointer-events-none disabled:opacity-40"
                >
                  {L.exportQuestionsTxt}
                </button>
              </div>
            </section>

            {questionsPack ? (
              <section className="space-y-4">
                <SectionTitle>{L.secQuestionsBlock}</SectionTitle>
                {questionsPack.title.trim() ? (
                  <p className="text-base font-semibold text-white">{questionsPack.title}</p>
                ) : null}
                {questionsPack.intro.trim() ? (
                  <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{questionsPack.intro}</p>
                ) : null}
                {!questionsPack.questions.length ? (
                  <p className="text-sm text-white/45">{L.emptyNoQuestions}</p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {questionsPack.questions.map((q, i) => (
                      <QuestionCard key={i} q={q} index={i} loc={L} />
                    ))}
                  </ul>
                )}
              </section>
            ) : null}
            </>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
