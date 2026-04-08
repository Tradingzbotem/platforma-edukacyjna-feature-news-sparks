import Link from "next/link";
import type { ReactNode } from "react";

export type ExamTrackHeroProps = {
  badge: string;
  title: string;
  subtitle: string;
  tracksHref: string;
  tracksLabel?: string;
  /** Dodatkowe elementy obok linku „Mapa ścieżek” (np. drugi CTA) */
  extraActions?: ReactNode;
  className?: string;
};

const tracksBtnClass =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10";

/**
 * Hero dla ścieżek egzaminowych / compliance — bez „Moduł: …” z lekcji kursowych.
 */
export default function ExamTrackHero({
  badge,
  title,
  subtitle,
  tracksHref,
  tracksLabel = "Mapa ścieżek",
  extraActions,
  className = "",
}: ExamTrackHeroProps) {
  return (
    <header
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1729] via-[#0c1220] to-[#080c14] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:p-8 ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-slate-500/[0.07] blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
            {badge}
          </span>
          <span className="hidden text-slate-600 sm:inline" aria-hidden>
            ·
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Ścieżka przygotowania zawodowego
          </span>
        </div>
        <div className="min-w-0 space-y-3">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-[1.85rem] md:leading-snug">
            {title}
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-400">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link href={tracksHref} className={`${tracksBtnClass} w-fit`}>
            ← {tracksLabel}
          </Link>
          {extraActions != null ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{extraActions}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
