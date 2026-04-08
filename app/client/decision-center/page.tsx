// app/client/decision-center/page.tsx — workspace: aktywo + horyzont + Decision Block (API `/api/decision-block`)
"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  FlaskConical,
  LayoutGrid,
  Lock,
  Store,
  Zap,
} from "lucide-react";
import { DECISION_ASSET_OPTIONS, type DecisionAssetId } from "../decisionBlockMock";
import type { ClientPanelApiPayload } from "../useClientPanelTier";
import { useClientPanelTier } from "../useClientPanelTier";
import { getMembershipSnapshot, type PanelUserTier } from "../clientPanelMock";
import type { DecisionBlockV1 } from "@/lib/decision-engine/types";
import type { WorldRelatedEvent } from "@/lib/decision-engine/worldContext/types";
import type { RedakcjaNewsContextDto } from "@/lib/redakcja/redakcjaNewsContextTypes";
import { useDecisionBlock } from "./useDecisionBlock";
import { isFoundersMarketplaceSalesPaused } from "@/lib/marketplace/offers";
import {
  buildGrowthConditionRows,
  buildModuleQuickLines,
  buildNewsAssetBridge,
  buildOperationalChecklist24h,
  buildScenarioNarrativePack,
  buildWeaknessConditionRows,
  framePrimaryTakeawayForDisplay,
  humanizeMarketLanguage,
  macroMoodLabel,
  shouldShowNoEdgeBlock,
  type DecisionConditionRow,
} from "./decisionBlockCopy";
import {
  DECISION_HORIZON_OPTIONS,
  horizonCardLabel,
  horizonToApiParams,
  type DecisionHorizonId,
} from "./decisionHorizon";
import { tvSymbolForAsset } from "@/lib/tvSymbolMap";
import { buildPanelModuleDeepLink } from "@/lib/panel/decisionCenterNav";

const TradingViewChart = dynamic(() => import("@/components/TradingViewChart"), {
  ssr: false,
  loading: () => (
    <div
      className="h-[500px] w-full animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
      aria-hidden
    />
  ),
});

function SectionEyebrow({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">
      <span className="tabular-nums text-white/55">{n}</span>
      <span className="h-px w-6 bg-white/15" aria-hidden />
      {children}
    </p>
  );
}

function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 ${className}`.trim()}
    >
      {children}
    </p>
  );
}

/** Opcjonalnie: zestaw liczb z silnika — domyślnie schowany. */
function OptionalNumericContext({ block }: { block: DecisionBlockV1 }) {
  const { levels } = block;
  if (!levels.normalizedLevels.length && levels.currentPrice == null) return null;

  return (
    <details className="group rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-[12px] font-medium text-white/45 outline-none marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180 text-white/35" aria-hidden />
        Dodatkowo: zestaw liczb z ćwiczenia (nie traktuj jak aktualnych cen z rynku)
      </summary>
      <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-white/50">
        <p>
          Liczby poniżej pochodzą z przeliczenia przykładowych poziomów względem odczytu ceny w silniku — mogą się nie
          zgadzać z tym, co widzisz u brokera. Służą tylko do nauki struktury, nie do wejścia w pozycję.
        </p>
        {levels.currentPrice != null ? (
          <p>
            <span className="text-white/35">Odczyt w ćwiczeniu:</span>{" "}
            <span className="tabular-nums text-white/70">{levels.currentPrice}</span>
          </p>
        ) : null}
        {levels.normalizedLevels.length > 0 ? (
          <p className="tabular-nums">Przykładowy zestaw: {levels.normalizedLevels.join(" · ")}</p>
        ) : null}
      </div>
    </details>
  );
}

function EduSectionTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h4
      id={id}
      className="flex items-start gap-2 text-[15px] font-bold leading-snug tracking-tight text-white sm:text-base"
    >
      <span className="mt-0.5 text-cyan-300/90" aria-hidden>
        🔹
      </span>
      <span>{children}</span>
    </h4>
  );
}

function worldFeedSentimentBadgeClass(s: string): string {
  const x = s.toLowerCase();
  if (x === "positive" || x === "pozytywny") {
    return "border-emerald-500/35 bg-emerald-950/35 text-emerald-200/95";
  }
  if (x === "negative" || x === "negatywny") {
    return "border-rose-500/35 bg-rose-950/35 text-rose-200/95";
  }
  return "border-white/12 bg-white/[0.05] text-white/55";
}

function WorldMarketContextStrip({
  event,
  redakcjaNewsContext,
  block,
}: {
  event: WorldRelatedEvent;
  redakcjaNewsContext: RedakcjaNewsContextDto | null;
  block: DecisionBlockV1;
}) {
  const bodyText =
    event.whyItMatters && event.whyItMatters.trim().length > 0
      ? event.whyItMatters.trim()
      : event.summaryShort && event.summaryShort.trim().length > 0
        ? event.summaryShort.trim()
        : null;
  const bridge = buildNewsAssetBridge(block, event);
  const impacts = (event.impacts ?? []).slice(0, 2);
  const watches = (event.watch ?? []).slice(0, 2);
  const sourceUrlOk = Boolean(event.url && /^https?:\/\//i.test(event.url));

  return (
    <aside
      className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.07] to-white/[0.02] px-4 py-3.5 sm:px-5 sm:py-4"
      aria-label="Kontekst rynkowy teraz"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Kontekst rynkowy teraz</p>
      <h4 className="mt-2 text-[14px] font-semibold leading-snug text-white/92 sm:text-[15px]">{event.title}</h4>
      {event.source ? <p className="mt-1 text-[11px] text-white/45">Źródło: {event.source}</p> : null}
      {(event.sentiment != null || event.impact != null || event.timeEdge != null) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {event.sentiment ? (
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize ${worldFeedSentimentBadgeClass(event.sentiment)}`}
            >
              {event.sentiment}
            </span>
          ) : null}
          {event.impact != null ? (
            <span className="rounded-md border border-amber-500/30 bg-amber-950/25 px-2 py-0.5 text-[10px] font-medium text-amber-100/90">
              Impact {String(event.impact)}
            </span>
          ) : null}
          {event.timeEdge != null ? (
            <span className="rounded-md border border-sky-500/30 bg-sky-950/25 px-2 py-0.5 text-[10px] font-medium text-sky-100/90">
              TimeEdge {String(event.timeEdge)}
            </span>
          ) : null}
        </div>
      )}
      <div className="mt-3 rounded-lg border border-white/[0.08] bg-slate-950/40 px-3 py-2.5 sm:px-3.5 sm:py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/55">Wpływ na wybrane aktywo</p>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/82 sm:text-[14px]">{bridge}</p>
      </div>
      {bodyText ? <p className="mt-2 text-[12px] leading-relaxed text-white/48">Źródło — streszczenie: {bodyText}</p> : null}
      {impacts.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Szczegółowy wpływ</p>
          <ul className="mt-1.5 space-y-1.5">
            {impacts.map((row, i) => (
              <li key={i} className="text-[12px] leading-relaxed text-white/58">
                <span className="font-medium text-white/78">{row.symbol}</span>
                {row.direction != null && String(row.direction).trim() !== "" ? (
                  <span className="text-white/40"> ({String(row.direction)})</span>
                ) : null}
                <span className="text-white/45"> — </span>
                <span>{row.effect}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {watches.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Obserwuj</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-white/55 marker:text-white/30">
            {watches.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
        {sourceUrlOk ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-[12px] font-semibold text-cyan-200/95 underline-offset-4 hover:text-white hover:underline"
          >
            Czytaj źródło
          </a>
        ) : null}
        {redakcjaNewsContext ? (
          <Link
            href={`/redakcja/${encodeURIComponent(redakcjaNewsContext.articleSlug)}`}
            className="inline-flex text-[12px] font-semibold text-violet-200/95 underline-offset-4 hover:text-white hover:underline"
          >
            Czytaj pełny kontekst
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

function ConditionStatusRow({ row }: { row: DecisionConditionRow }) {
  const met = row.state === "met";
  const unknown = row.state === "unknown";
  const statusLabel = met ? "spełnione" : unknown ? "brak danych" : "niespełnione";
  return (
    <li className="flex gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <span className="mt-0.5 shrink-0" aria-hidden>
        {met ? <Check className="h-4 w-4 text-emerald-400/90" strokeWidth={2.5} /> : <Circle className="h-4 w-4 text-white/22" strokeWidth={1.5} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[13px] font-semibold leading-snug text-white/88 sm:text-[14px]">{row.label}</span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${met ? "text-emerald-300/75" : "text-white/35"}`}
          >
            {statusLabel}
          </span>
        </div>
        {row.description ? <p className="mt-0.5 text-[12px] leading-relaxed text-white/42">{row.description}</p> : null}
      </div>
    </li>
  );
}

function ScenarioNarrativePanel({ block }: { block: DecisionBlockV1 }) {
  const pack = buildScenarioNarrativePack(block);
  const items = [pack.base, pack.risk, pack.alt] as const;
  return (
    <section className="space-y-3" aria-labelledby="edu-scenario-narratives">
      <EduSectionTitle id="edu-scenario-narratives">Scenariusze (narracja)</EduSectionTitle>
      <p className="text-[12px] leading-relaxed text-white/45">
        Trzy ramy z lekcji — bez sztucznych procentów; liczy się spójność zachowania ceny i makro w Twoim horyzoncie.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 sm:min-h-[7.5rem]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">{item.title}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/72 sm:text-[13px]">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrimaryTakeawayHero({ text }: { text: string }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/[0.14] via-slate-950/40 to-violet-600/[0.08] px-5 py-5 sm:px-6 sm:py-6 shadow-[0_0_48px_-12px_rgba(34,211,238,0.22)]"
      aria-labelledby="primary-takeaway-heading"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <h3
          id="primary-takeaway-heading"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/85"
        >
          Najważniejszy wniosek teraz
        </h3>
        <p className="mt-3 text-[17px] font-semibold leading-[1.45] tracking-tight text-white sm:text-lg sm:leading-[1.5]">
          {text}
        </p>
      </div>
    </section>
  );
}

function DecisionBlockFromApi({
  fetchState,
  horizonLabel,
  assetId,
  tierQuerySuffix,
}: {
  fetchState: ReturnType<typeof useDecisionBlock>;
  horizonLabel: string;
  assetId: DecisionAssetId;
  tierQuerySuffix: string;
}) {
  if (fetchState.status === "idle" || fetchState.status === "loading") {
    return (
      <div
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 sm:px-6"
        aria-busy="true"
        aria-label="Ładowanie Decision Block"
      >
        <div className="mx-auto max-w-md space-y-3">
          <div className="h-4 animate-pulse rounded bg-white/10" />
          <div className="h-24 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-32 animate-pulse rounded-lg bg-white/[0.05]" />
        </div>
        <p className="mt-4 text-center text-[12px] text-white/40">Ładowanie materiału…</p>
      </div>
    );
  }

  if (fetchState.status === "error") {
    return (
      <div
        className="overflow-hidden rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] px-5 py-6 sm:px-6"
        role="alert"
      >
        <p className="text-sm font-semibold text-rose-100/95">Nie udało się pobrać Decision Block</p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/65">{fetchState.message}</p>
        <p className="mt-3 text-[11px] text-white/40">Spróbuj ponownie za chwilę albo zmień aktywo / horyzont.</p>
      </div>
    );
  }

  if (fetchState.status === "empty") {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:px-6">
        <p className="text-sm font-semibold text-white/80">Brak danych</p>
        <p className="mt-2 text-[13px] text-white/50">{fetchState.message}</p>
      </div>
    );
  }

  if (fetchState.status !== "success") return null;

  const { block, redakcjaNewsContext } = fetchState;
  const primary = framePrimaryTakeawayForDisplay(block);
  const growthRows = buildGrowthConditionRows(block);
  const weaknessRows = buildWeaknessConditionRows(block);
  const showNoEdge = shouldShowNoEdgeBlock(block, growthRows, weaknessRows);
  const checklist24 = buildOperationalChecklist24h(block);
  const moduleLines = buildModuleQuickLines(block);
  const moduleLink = (path: string) =>
    buildPanelModuleDeepLink({
      path,
      asset: assetId,
      timeframe: block.timeframe,
      tierQuerySuffix,
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
      <div className="border-b border-white/10 bg-gradient-to-r from-white/[0.07] to-transparent px-5 py-3.5 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">Decision Block</h3>
            <span className="text-sm font-semibold text-white/90">{block.asset}</span>
            <span className="text-sm text-white/35">·</span>
            <span className="text-sm text-white/55">{horizonLabel}</span>
            <span className="text-sm text-white/35">·</span>
            <span className="text-sm text-white/45">interwał {block.timeframe}</span>
          </div>
          <p className="text-[11px] text-white/35 tabular-nums sm:shrink-0">
            Aktualizacja:{" "}
            {new Date(block.generatedAt).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium leading-snug text-white/80">
            {macroMoodLabel(block.macro.eventRisk)}
          </span>
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/50">
            Ćwiczenie EDU
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-amber-200/75">
          Materiał z modułów FXEDULAB — <strong className="font-semibold text-amber-100/90">to nie jest sygnał</strong> do
          kupna ani sprzedaży, tylko uproszczony opis sytuacji z kursu.
        </p>
      </div>

      <div className="space-y-7 px-5 py-6 sm:px-6 sm:py-7">
        <TradingViewChart symbol={tvSymbolForAsset(assetId)} />
        <PrimaryTakeawayHero text={primary} />
        {block.worldContext.relatedEvents[0] ? (
          <WorldMarketContextStrip
            event={block.worldContext.relatedEvents[0]}
            redakcjaNewsContext={redakcjaNewsContext ?? null}
            block={block}
          />
        ) : null}

        <section className="space-y-3" aria-labelledby="edu-growth-conditions">
          <EduSectionTitle id="edu-growth-conditions">Warunki wzrostu</EduSectionTitle>
          <ul className="flex flex-col gap-2">
            {growthRows.map((row, i) => (
              <ConditionStatusRow key={i} row={row} />
            ))}
          </ul>
        </section>

        <section className="space-y-3" aria-labelledby="edu-weak-conditions">
          <EduSectionTitle id="edu-weak-conditions">Warunki słabości / spadku</EduSectionTitle>
          <ul className="flex flex-col gap-2">
            {weaknessRows.map((row, i) => (
              <ConditionStatusRow key={i} row={row} />
            ))}
          </ul>
        </section>

        {showNoEdge ? (
          <aside
            className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3.5 sm:px-5 sm:py-4"
            aria-labelledby="edu-no-edge"
          >
            <p id="edu-no-edge" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/80">
              Brak przewagi
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/78 sm:text-[14px]">
              Sygnały są mieszane albo brak większości potwierdzeń po obu stronach — nie wymuszaj strony, dopóki struktura i
              makro nie rozstrzygną obrazu. To nie jest zaproszenie do „nie rób nic zawsze”, tylko do czytelnego odczekania.
            </p>
          </aside>
        ) : null}

        <section className="space-y-3" aria-labelledby="edu-checklist-48">
          <EduSectionTitle id="edu-checklist-48">Checklista 24–48h</EduSectionTitle>
          <ul className="flex flex-col gap-2">
            {checklist24.map((line, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-white/72 sm:text-[14px]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/55" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <ScenarioNarrativePanel block={block} />

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-white/70">Potwierdzenia</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={moduleLink("/konto/panel-rynkowy/scenariusze-abc")}
              className="group rounded-xl border border-white/10 p-4 transition hover:border-white/30"
            >
              <p className="text-[12px] leading-snug text-white/65">{moduleLines.scenarios}</p>
              <div className="mt-2 text-xs text-white/50">Scenariusze ABC</div>
              <div className="mt-0.5 text-sm font-medium text-white">Zobacz scenariusze dla aktywa</div>
            </a>
            <a
              href={moduleLink("/konto/panel-rynkowy/kalendarz-7-dni")}
              className="group rounded-xl border border-white/10 p-4 transition hover:border-white/30"
            >
              <p className="text-[12px] leading-snug text-white/65">{moduleLines.calendar}</p>
              <div className="mt-2 text-xs text-white/50">Kalendarz</div>
              <div className="mt-0.5 text-sm font-medium text-white">Sprawdź wydarzenia makro</div>
            </a>
            <a
              href={moduleLink("/konto/panel-rynkowy/mapy-techniczne")}
              className="group rounded-xl border border-white/10 p-4 transition hover:border-white/30"
            >
              <p className="text-[12px] leading-snug text-white/65">{moduleLines.technical}</p>
              <div className="mt-2 text-xs text-white/50">Technika</div>
              <div className="mt-0.5 text-sm font-medium text-white">Analiza techniczna</div>
            </a>
            <a
              href={moduleLink("/konto/panel-rynkowy/checklisty")}
              className="group rounded-xl border border-white/10 p-4 transition hover:border-white/30"
            >
              <p className="text-[12px] leading-snug text-white/65">{moduleLines.checklists}</p>
              <div className="mt-2 text-xs text-white/50">Checklisty</div>
              <div className="mt-0.5 text-sm font-medium text-white">Sprawdź warunki wejścia</div>
            </a>
          </div>
        </div>

        <OptionalNumericContext block={block} />

        {block.confidenceNotes.length ? (
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-4" aria-labelledby="edu-confidence">
            <SectionLabel className="text-white/40">Uwagi do pewności odczytu (ćwiczenie)</SectionLabel>
            <ul className="mt-2.5 space-y-1.5 text-[12px] leading-relaxed text-white/55">
              {block.confidenceNotes.map((n: string, i: number) => (
                <li key={i}>{humanizeMarketLanguage(n)}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="text-[10px] leading-relaxed text-white/35">
          EDU — treść opiera się na scenariuszach, makro i kontekście z modułów; nie jest sygnałem, prognozą ani poradą inwestycyjną.
        </p>
      </div>
    </div>
  );
}

function DecisionCenterLocked({ tierQuery }: { tierQuery: string }) {
  const salesPaused = isFoundersMarketplaceSalesPaused();

  return (
    <div
      className="relative flex min-h-[min(420px,55vh)] flex-col justify-center overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] via-slate-950/80 to-slate-950 px-6 py-10 sm:px-10"
      aria-labelledby="decision-lock-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(-12deg, transparent, transparent 12px, rgba(255,255,255,0.06) 12px, rgba(255,255,255,0.06) 13px)`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06]">
          <Lock className="h-7 w-7 text-amber-200/90" aria-hidden />
        </div>
        <h3 id="decision-lock-heading" className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl">
          Centrum decyzji — premium
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          {salesPaused ? (
            <>
              Decision Block i wybór aktywów są dostępne po przypisaniu NFT. Pierwotny zakup jest na razie wstrzymany —{" "}
              <span className="text-amber-200/85">brak miejsc</span>. Wróć do panelu startowego lub sprawdź marketplace (informacje).
            </>
          ) : (
            <>
              Decision Block i wybór aktywów są dostępne po przypisaniu NFT. Wróć do panelu startowego lub odblokuj dostęp w
              marketplace.
            </>
          )}
        </p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center">
          <Link
            href={`/client${tierQuery}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Panel startowy
          </Link>
          {salesPaused ? (
            <span
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/40"
              aria-disabled
            >
              <Store className="h-4 w-4 opacity-50" aria-hidden />
              Brak miejsc
            </span>
          ) : (
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <Store className="h-4 w-4" aria-hidden />
              Kup dostęp
            </Link>
          )}
          <Link
            href="/cennik"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            Cennik
          </Link>
        </div>
      </div>
    </div>
  );
}

function AssetSelector({
  allowed,
  value,
  onChange,
}: {
  allowed: DecisionAssetId[];
  value: DecisionAssetId;
  onChange: (id: DecisionAssetId) => void;
}) {
  const allowedSet = new Set(allowed);

  return (
    <section className="space-y-3" aria-label="Wybór aktywa">
      <SectionLabel>Aktywo</SectionLabel>
      <p className="max-w-2xl text-sm text-white/48">
        Instrumenty poniżej są obsługiwane przez silnik v1 (scenariusze ABC + kalendarz + wycena). Bez BTC ani EUR/JPY —
        nie ma jeszcze kompletnego zestawu scenariuszy w module.
      </p>
      <div className="flex flex-wrap gap-2">
        {DECISION_ASSET_OPTIONS.map((opt) => {
          const ok = allowedSet.has(opt.id);
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!ok}
              title={opt.hint ? `${opt.label} — ${opt.hint}` : opt.label}
              onClick={() => ok && onChange(opt.id)}
              className={[
                "inline-flex flex-col items-start gap-0 rounded-xl border px-3.5 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-offset-0 sm:min-w-[7.5rem]",
                active && ok
                  ? "border-white/25 bg-white text-slate-950 focus:ring-white/40"
                  : ok
                    ? "border-white/10 bg-white/5 text-white/85 hover:bg-white/10 focus:ring-white/25"
                    : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                {!ok && <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                {opt.label}
              </span>
              {opt.hint ? (
                <span
                  className={[
                    "text-[10px] font-medium leading-tight",
                    active && ok ? "text-slate-600" : ok ? "text-white/40" : "text-white/22",
                  ].join(" ")}
                >
                  {opt.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HorizonSelector({
  value,
  onChange,
}: {
  value: DecisionHorizonId;
  onChange: (id: DecisionHorizonId) => void;
}) {
  return (
    <section className="space-y-3" aria-label="Horyzont decyzji">
      <SectionLabel>Horyzont decyzji</SectionLabel>
      <p className="max-w-2xl text-sm text-white/48">
        Ustala, na jak głęboko silnik patrzy w kalendarz i jaki interwał scenariusza ABC preferuje (H1 / H4 / D1), gdy jest
        dostępny dla instrumentu.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DECISION_HORIZON_OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={[
                "rounded-xl border px-3.5 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-offset-0",
                active
                  ? "border-cyan-400/35 bg-cyan-500/15 text-white shadow-[0_0_24px_-8px_rgba(34,211,238,0.35)] focus:ring-cyan-400/30"
                  : "border-white/10 bg-white/[0.04] text-white/82 hover:border-white/16 hover:bg-white/[0.07] focus:ring-white/20",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold leading-snug">{opt.label}</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-white/45">{opt.subtitle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function NextStepsSection({ tierQuery }: { tierQuery: string }) {
  const items = [
    {
      href: `/client/decision-lab${tierQuery}`,
      icon: FlaskConical,
      title: "Decision Lab",
      subtitle: "Rozłóż tezę i ryzyka",
      accent: "from-violet-500/25 to-transparent",
      iconClass: "text-violet-300/90",
    },
    {
      href: "/challenge",
      icon: Zap,
      title: "Challenge",
      subtitle: "Ćwicz decyzję pod presją",
      accent: "from-amber-500/25 to-transparent",
      iconClass: "text-amber-300/90",
    },
    {
      href: `/client${tierQuery}`,
      icon: LayoutGrid,
      title: "Panel klienta",
      subtitle: "Hub, marketplace, ustawienia",
      accent: "from-cyan-500/25 to-transparent",
      iconClass: "text-cyan-300/90",
    },
  ] as const;

  return (
    <section className="space-y-4" aria-labelledby="next-steps-heading">
      <div>
        <SectionEyebrow n="02">Kontynuacja</SectionEyebrow>
        <h2 id="next-steps-heading" className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">
          Dalsze kroki
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Decision Lab, Challenge i hub panelu — kolejne kroki po przeczytaniu uproszczonego werdyktu.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map(({ href, icon: Icon, title, subtitle, accent, iconClass }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-5 transition hover:border-white/22 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
              aria-hidden
            />
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50">
                <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden />
              </div>
              <h3 className="mt-3 text-[15px] font-bold tracking-tight text-white">{title}</h3>
              <p className="mt-0.5 text-xs text-white/48">{subtitle}</p>
            </div>
            <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/50 group-hover:text-white/80">
              Otwórz
              <ArrowRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DecisionCenterInner() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get("tier");
  const panel = useClientPanelTier(tierParam);

  if (panel.status === "loading") {
    return <DecisionCenterFallback />;
  }

  if (panel.status === "error") {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm text-rose-200/90">{panel.message}</p>
          <Link
            href="/logowanie?next=/client/decision-center"
            className="mt-6 inline-flex rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.1]"
          >
            Logowanie
          </Link>
        </div>
      </main>
    );
  }

  return <DecisionCenterLoaded panel={panel} />;
}

function DecisionCenterLoaded({ panel }: { panel: ClientPanelApiPayload }) {
  const tier: PanelUserTier = panel.tier;
  const tierQuery = panel.tierQuerySuffix;

  const membership = getMembershipSnapshot(tier);
  const hasDecisionCenter = membership.hasAccess && membership.hasNft;

  const [assetId, setAssetId] = useState<DecisionAssetId>("US100");
  const [horizonId, setHorizonId] = useState<DecisionHorizonId>("one_two_days");

  useEffect(() => {
    if (!hasDecisionCenter) return;
    const first = membership.allowedAssets[0] ?? "US100";
    setAssetId((prev) => (membership.allowedAssets.includes(prev) ? prev : first));
  }, [hasDecisionCenter, membership.allowedAssets]);

  const horizonParams = useMemo(() => horizonToApiParams(horizonId), [horizonId]);
  const horizonLabel = horizonCardLabel(horizonId);
  const blockFetch = useDecisionBlock(assetId, hasDecisionCenter, horizonParams);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-[min(1440px,calc(100vw-1.5rem))] px-3 pb-24 pt-5 sm:px-5 sm:pt-7 lg:px-8 lg:pt-9 xl:max-w-[1520px]">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/client${tierQuery}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Hub
            </Link>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">FXEDULAB</p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Centrum decyzji</h1>
            </div>
          </div>
          {panel.qaTierQueryAllowed ? (
            <p className="text-[11px] text-white/32">
              QA URL:{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/50">?tier=free</code>,{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/50">founders</code>,{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/50">elite</code>
            </p>
          ) : null}
        </div>

        <div className="space-y-10 lg:space-y-12">
          <section
            className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 sm:p-7 lg:p-8"
            aria-labelledby="workspace-heading"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <SectionEyebrow n="01">Workspace</SectionEyebrow>
              <h2 id="workspace-heading" className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                Aktywo, horyzont i Decision Block
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-white/42">
                Najpierw wybierz instrument i horyzont — potem czytaj werdykt od najważniejszego wniosku. Treść nadal pochodzi z
                modułów EDU, bez sygnału transakcyjnego.
              </p>

              <div className="mt-8 space-y-8">
                {hasDecisionCenter ? (
                  <>
                    <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-[1fr_1fr] xl:items-start xl:gap-10">
                      <AssetSelector allowed={membership.allowedAssets} value={assetId} onChange={setAssetId} />
                      <HorizonSelector value={horizonId} onChange={setHorizonId} />
                    </div>
                    <DecisionBlockFromApi
                      fetchState={blockFetch}
                      horizonLabel={horizonLabel}
                      assetId={assetId}
                      tierQuerySuffix={tierQuery}
                    />
                  </>
                ) : (
                  <DecisionCenterLocked tierQuery={tierQuery} />
                )}
              </div>
            </div>
          </section>

          {hasDecisionCenter && <NextStepsSection tierQuery={tierQuery} />}
        </div>
      </div>
    </main>
  );
}

function DecisionCenterFallback() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-[min(1440px,calc(100vw-1.5rem))] px-3 py-10 sm:px-5 lg:px-8">
        <div className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" aria-hidden />
      </div>
    </main>
  );
}

export default function DecisionCenterPage() {
  return (
    <Suspense fallback={<DecisionCenterFallback />}>
      <DecisionCenterInner />
    </Suspense>
  );
}
