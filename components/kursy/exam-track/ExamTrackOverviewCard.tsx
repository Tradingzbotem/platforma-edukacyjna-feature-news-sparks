import type { ReactNode } from "react";
import type { ExamBlockDisplayMeta } from "@/lib/examTrackBlockMeta";

export default function ExamTrackOverviewCard({
  eyebrow,
  blockLabel,
  title,
  durationLabel,
  meta,
  actions,
  children,
  lockOverlay,
}: {
  eyebrow: string;
  blockLabel: string;
  title: string;
  durationLabel?: string;
  meta: ExamBlockDisplayMeta;
  actions?: ReactNode;
  children?: ReactNode;
  lockOverlay?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden
      />
      <div className="relative min-h-[4rem] p-5 md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {eyebrow} · {blockLabel}
            </p>
            <h2 className="text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {title}
            </h2>
            {durationLabel ? (
              <p className="text-xs font-medium text-slate-500">Szacowany czas: {durationLabel}</p>
            ) : null}
          </div>
          {actions != null ? (
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">{actions}</div>
          ) : null}
        </div>

        <div className="mt-6 space-y-6 border-t border-white/[0.06] pt-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Briefing bloku
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{meta.briefing}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kluczowe obszary
            </h3>
            <ul className="mt-3 list-none space-y-2.5 pl-0">
              {meta.focusAreas.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-200/70">
              Na egzaminie
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{meta.examFocusNote}</p>
          </div>
        </div>

        {children != null ? (
          <div className="mt-8 border-t border-white/[0.06] pt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Materiał źródłowy
            </h3>
            <div className="mt-4">{children}</div>
          </div>
        ) : null}

        {lockOverlay}
      </div>
    </section>
  );
}
