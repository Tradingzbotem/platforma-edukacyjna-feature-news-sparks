import type { ReactNode } from "react";

const proseCls =
  "prose prose-invert prose-slate max-w-none prose-headings:scroll-mt-24 prose-h3:mt-6 prose-h3:text-lg prose-h3:font-semibold prose-h3:text-slate-100 prose-p:leading-relaxed prose-li:marker:text-indigo-400/80 prose-code:text-indigo-200";

/** Sekcja lekcji: nagłówek + opcjonalny lead + treść (domyślnie typografia „prose”). */
export function PodstawySection({
  title,
  subtitle,
  children,
  prose = true,
  contentClassName = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  prose?: boolean;
  contentClassName?: string;
}) {
  return (
    <section className="scroll-mt-24">
      <header className="mb-4 border-b border-white/10 pb-3">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>
        ) : null}
      </header>
      <div
        className={
          prose
            ? `${proseCls} text-slate-300 ${contentClassName}`.trim()
            : `text-slate-300 ${contentClassName}`.trim()
        }
      >
        {children}
      </div>
    </section>
  );
}
