// Wspólny panel sekcji lekcji (LessonBody + statyczne strony /kursy/zaawansowane/lekcja-*)

import type { ReactNode } from "react";
import { ListChecks, Sparkles, TriangleAlert } from "lucide-react";

/** Te same klasy co moduły w LessonBody — kontrast względem zewnętrznej karty lekcji (gdy variant nie jest podany). */
export const LESSON_SECTION_PANEL_CLASS =
  "relative overflow-hidden rounded-2xl border-2 border-indigo-400/35 bg-gradient-to-b from-slate-800/95 via-[#151f33]/95 to-slate-950/98 p-6 sm:p-7 text-slate-300 shadow-[0_0_0_1px_rgba(129,140,248,0.12),0_12px_40px_-8px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.09)] ring-1 ring-inset ring-white/10 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(900px_circle_at_50%_-20%,rgba(129,140,248,0.14),transparent_55%)] before:content-['']";

/** Typografia i odstępy dla treści w modułach „Zaawansowane” (variant ustawiony). */
export const ADV_LESSON_PROSE_CLASS =
  "[&_p]:mb-4 [&_p:last-child]:mb-0 [&_p]:leading-[1.75] [&_ul]:my-4 [&_ol]:my-4 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:mt-2.5 [&_li]:pl-0.5 [&_li]:marker:text-indigo-400/80 [&_strong]:font-semibold [&_strong]:text-slate-100 [&_em]:text-slate-200 [&_code]:rounded-md [&_code]:border [&_code]:border-white/10 [&_code]:bg-slate-950/90 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:text-indigo-200 [&_table]:w-full [&_table]:text-sm [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-medium [&_th]:text-slate-400 [&_td]:py-2.5 [&_td]:pr-4 [&_tr]:border-t [&_tr]:border-white/[0.08]";

export type LessonSectionVariant = "content" | "insight" | "closing" | "caution";

/** Wyróżniony blok (np. przykład, wzór) wewnątrz sekcji — bez zmiany merytoryki, tylko styl. */
export function LessonInlineCallout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside
      className="mt-6 rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/[0.09] via-[#0f1628]/90 to-slate-950/60 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-amber-400/15"
      aria-label={title}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/85">{title}</p>
      <div className="mt-3 text-[15px] leading-[1.75] text-slate-200 [&_code]:rounded-md [&_code]:border [&_code]:border-white/10 [&_code]:bg-black/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-indigo-200">
        {children}
      </div>
    </aside>
  );
}

function variantShell(variant: LessonSectionVariant): string {
  switch (variant) {
    case "insight":
      return [
        "relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-[#1a1510]/95 via-[#0f141f]/95 to-slate-950/98",
        "p-7 sm:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        "ring-1 ring-inset ring-amber-400/20 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-gradient-to-b before:from-amber-400/90 before:via-amber-500/50 before:to-amber-600/30",
      ].join(" ");
    case "closing":
      return [
        "relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-emerald-950/35 via-[#0a1620]/95 to-slate-950/98",
        "p-7 sm:p-8 shadow-[0_24px_60px_-24px_rgba(16,185,129,0.12),0_12px_40px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.07)]",
        "ring-1 ring-inset ring-emerald-400/15 after:pointer-events-none after:absolute after:-right-16 after:-top-16 after:h-40 after:w-40 after:rounded-full after:bg-emerald-500/10 after:blur-3xl",
      ].join(" ");
    case "caution":
      return [
        "relative overflow-hidden rounded-2xl border border-amber-400/35 bg-gradient-to-br from-[#1c1610]/95 via-[#0e121c]/95 to-slate-950/98",
        "p-7 sm:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        "ring-1 ring-inset ring-amber-400/25 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-gradient-to-b before:from-amber-300/85 before:via-amber-500/55 before:to-amber-700/35",
      ].join(" ");
    default:
      return [
        "relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-b from-[#0d1528]/95 via-[#0a0f1a]/98 to-[#060a12]/98",
        "p-7 sm:p-8 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-inset ring-white/[0.06]",
      ].join(" ");
  }
}

function variantTitleClass(variant: LessonSectionVariant): string {
  switch (variant) {
    case "insight":
      return "text-xl font-semibold tracking-tight text-amber-50 sm:text-2xl";
    case "caution":
      return "text-xl font-semibold tracking-tight text-amber-100 sm:text-2xl";
    case "closing":
      return "text-xl font-semibold tracking-tight text-emerald-50 sm:text-2xl";
    default:
      return "text-xl font-semibold tracking-tight text-white sm:text-2xl";
  }
}

export default function LessonSectionPanel({
  title,
  children,
  variant,
  eyebrow,
  className,
}: {
  title?: string | null;
  children: ReactNode;
  /** Gdy brak — zachowanie legacy (LessonBody / kompatybilność). */
  variant?: LessonSectionVariant;
  /** Zastępuje domyślną etykietę nad tytułem („Sekcja” / „Insight” / …). */
  eyebrow?: string;
  /** Dodatkowe klasy na zewnętrznym `<section>`. */
  className?: string;
}) {
  if (variant === undefined) {
    return (
      <section className={LESSON_SECTION_PANEL_CLASS}>
        <div className="relative">
          {title ? (
            <header className="mb-5 border-b-2 border-indigo-400/45 pb-4">
              <h2 className="scroll-mt-24 text-xl font-semibold tracking-tight text-indigo-50 sm:text-2xl">{title}</h2>
            </header>
          ) : null}
          <div>{children}</div>
        </div>
      </section>
    );
  }

  const v = variant;
  const Icon =
    v === "insight" ? Sparkles : v === "closing" ? ListChecks : v === "caution" ? TriangleAlert : null;

  const defaultEyebrow =
    v === "insight" ? "Insight" : v === "closing" ? "Na koniec" : v === "caution" ? "Uwaga" : "Sekcja";
  const eyebrowText = eyebrow ?? defaultEyebrow;

  const headerBorderClass =
    v === "content"
      ? "mb-6 border-b border-white/10 pb-5"
      : v === "insight"
        ? "mb-6 border-b border-amber-400/20 pb-5"
        : v === "caution"
          ? "mb-6 border-b border-amber-400/30 pb-5"
          : "mb-6 border-b border-emerald-400/25 pb-5";

  const sectionClass = [variantShell(v), className].filter(Boolean).join(" ");

  return (
    <section className={sectionClass}>
      <div className="relative">
        {title ? (
          <header className={headerBorderClass}>
            <div className="flex flex-wrap items-start gap-3 gap-y-2">
              {Icon ? (
                <span
                  className={
                    v === "insight"
                      ? "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-200/95"
                      : v === "caution"
                        ? "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/15 text-amber-200"
                        : "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/35 bg-emerald-500/10 text-emerald-200/95"
                  }
                  aria-hidden
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrowText}</p>
                <h2 className={`mt-1 scroll-mt-24 ${variantTitleClass(v)}`}>{title}</h2>
              </div>
            </div>
          </header>
        ) : null}
        <div className={`text-[15px] text-slate-300 ${ADV_LESSON_PROSE_CLASS}`}>{children}</div>
      </div>
    </section>
  );
}
