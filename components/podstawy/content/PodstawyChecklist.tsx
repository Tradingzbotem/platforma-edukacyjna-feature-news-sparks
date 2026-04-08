import type { ReactNode } from "react";

/** Checklista po lekcji — spójny blok „co umiesz”. */
export function PodstawyChecklist({
  title = "Checklist po lekcji",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-xl border border-emerald-400/30 bg-emerald-500/[0.07] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:p-5"
      aria-label={title}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-sm font-bold text-emerald-200"
          aria-hidden
        >
          ✓
        </span>
        <h2 className="text-lg font-semibold text-emerald-50">{title}</h2>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-slate-200 [&_ul]:my-0 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:marker:text-emerald-400/80">
        {children}
      </div>
    </section>
  );
}
