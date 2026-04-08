import type { ReactNode } from "react";

const proseMini =
  "prose prose-invert prose-slate prose-sm max-w-none prose-headings:text-amber-50 prose-p:leading-relaxed prose-li:marker:text-amber-400/90 sm:prose-base";

/** Blok ćwiczeń — wyraźnie odróżniony od reszty lekcji. */
export function PodstawyExercise({
  title = "Ćwiczenia",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-xl border border-amber-400/25 border-l-4 border-l-amber-400/60 bg-amber-500/[0.05] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:p-5"
      aria-label={title}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-amber-400/20 pb-3">
        <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-bold tracking-wide text-amber-200">
          ĆWICZENIA
        </span>
        <h2 className="text-lg font-semibold text-amber-50">{title}</h2>
      </div>
      <div className={`${proseMini} text-slate-200`}>{children}</div>
    </section>
  );
}
