import type { ReactNode } from "react";

const variants = {
  neutral: "border-white/12 bg-white/[0.04]",
  accent: "border-indigo-400/30 bg-indigo-500/[0.08]",
  amber: "border-amber-400/30 bg-amber-500/[0.07]",
  emerald: "border-emerald-400/25 bg-emerald-500/[0.06]",
} as const;

/** Wyróżniony box: reguła, mini-ściąga, definicja, ostrzeżenie. */
export function PodstawyCallout({
  variant = "neutral",
  title,
  eyebrow,
  children,
  className = "",
}: {
  variant?: keyof typeof variants;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  const hasHeader = Boolean(eyebrow || title);
  return (
    <aside
      className={`rounded-xl border px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:px-5 sm:py-5 ${variants[variant]} ${className}`}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{eyebrow}</p>
      ) : null}
      {title ? (
        <h3 className={`text-base font-semibold text-white ${eyebrow ? "mt-1" : ""}`}>{title}</h3>
      ) : null}
      <div
        className={`text-sm leading-relaxed text-slate-300 [&_strong]:text-slate-100 ${hasHeader ? "mt-2" : ""}`}
      >
        {children}
      </div>
    </aside>
  );
}
