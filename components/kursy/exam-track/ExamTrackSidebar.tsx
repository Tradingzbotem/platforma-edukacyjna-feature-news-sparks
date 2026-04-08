import type { ReactNode } from "react";

export type ExamTrackSidebarItem = {
  key: string;
  blockLabel: string;
  title: string;
  minutes?: number | string;
  done: boolean;
  active: boolean;
  onSelect: () => void;
};

export default function ExamTrackSidebar({
  items,
  footer,
}: {
  items: ExamTrackSidebarItem[];
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b1220] p-5 md:p-6">
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Zakres przygotowania
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Kolejność odzwierciedla typową roadmapę przed egzaminem i pracą w compliance.
        </p>
      </div>
      <ol className="mt-5 space-y-1.5">
        {items.map((it, idx) => (
          <li key={it.key ? `${it.key}-${idx}` : `sidebar-${idx}`}>
            <button
              type="button"
              onClick={it.onSelect}
              className={`group w-full rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                it.active
                  ? "border-amber-500/25 bg-amber-500/[0.06] ring-1 ring-inset ring-amber-500/15"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        it.active ? "text-amber-200/80" : "text-slate-500"
                      }`}
                    >
                      {it.blockLabel}
                    </span>
                    {it.done ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400/90">
                        Zaliczone
                      </span>
                    ) : null}
                  </div>
                  <div
                    className={`mt-1 text-sm font-medium leading-snug ${
                      it.active ? "text-white" : "text-slate-300 group-hover:text-slate-100"
                    }`}
                  >
                    {it.title}
                  </div>
                </div>
                {it.minutes != null && it.minutes !== "" ? (
                  <span className="shrink-0 tabular-nums text-[11px] text-slate-500">
                    {it.minutes}
                    {typeof it.minutes === "number" ? " min" : ""}
                  </span>
                ) : null}
              </div>
            </button>
          </li>
        ))}
      </ol>
      {footer != null ? <div className="mt-5 border-t border-white/[0.06] pt-4">{footer}</div> : null}
    </section>
  );
}
