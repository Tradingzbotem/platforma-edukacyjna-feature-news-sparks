import type { ReactNode } from "react";

const DEFAULT_DURATION = "15 MIN";

export type LessonHeaderCardProps = {
  module: string;
  title: string;
  /** Np. „15 MIN” — domyślnie „15 MIN”, gdy brak jawnej wartości */
  duration?: string;
  /** Ścieżka powrotu do spisu (przekaż też do komponentu akcji postępu, np. KursyLessonProgressActions) */
  backHref: string;
  /** Opcjonalnie — rezerwa API (interakcja przez `actions`, np. KursyLessonProgressActions) */
  isCompleted?: boolean;
  /** Przyciski ukończenia + „← Spis lekcji” (klientowe komponenty postępu) */
  actions?: ReactNode;
  lead?: ReactNode;
  /** Dodatkowe klasy na `<header>` (np. `mt-6` w Podstawy, `mt-8` w Zaawansowane) */
  className?: string;
  /** Gdy brak `actions` — np. plakietka „Lekcja 1/5” w Podstawy */
  footer?: ReactNode;
  /** Domyślnie `h1`; ustaw `2`, gdy na stronie jest już inny `h1` (np. hub egzaminów). */
  titleHeadingLevel?: 1 | 2;
};

/**
 * Kafelek tytułowy lekcji — ten sam układ Tailwind co w module Podstawy (gradient, moduł, czas, tytuł, wiersz akcji).
 */
export default function LessonHeaderCard({
  module,
  title,
  duration,
  backHref,
  isCompleted: _isCompleted,
  actions,
  lead,
  className = "",
  footer,
  titleHeadingLevel = 1,
}: LessonHeaderCardProps) {
  void backHref;
  void _isCompleted;
  const hideDuration = duration === "";
  const durationLabel = hideDuration ? "" : (duration ?? DEFAULT_DURATION);
  const TitleTag = titleHeadingLevel === 2 ? "h2" : "h1";

  return (
    <header
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111a2e] via-[#0d1524] to-[#0a0f18] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-8 ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-300/90">
            Moduł: {module}
            {!hideDuration ? (
              <>
                {" "}
                · ⏱ {durationLabel}
              </>
            ) : null}
          </p>
          <TitleTag className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-[1.75rem] md:leading-tight">
            {title}
          </TitleTag>
          {lead ? (
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-400">{lead}</p>
          ) : null}
        </div>
        {actions != null ? (
          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-end sm:border-0 sm:pt-0">
            {actions}
          </div>
        ) : footer != null ? (
          footer
        ) : null}
      </div>
    </header>
  );
}
