import Link from 'next/link';
import type { ReactNode } from 'react';

const breadcrumbLink =
  'text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline';
const cardClass =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] shadow-lg';

export type ExamMaterialShellProps = {
  trackBreadcrumbLabel: string;
  trackHref: string;
  materialLabel: string;
  title: string;
  description: string;
  badges: string[];
  backHref: string;
  backLabel: string;
  downloadFormat?: 'PDF' | 'DOCX';
  children: ReactNode;
};

export default function ExamMaterialShell({
  trackBreadcrumbLabel,
  trackHref,
  materialLabel,
  title,
  description,
  badges,
  backHref,
  backLabel,
  downloadFormat = 'PDF',
  children,
}: ExamMaterialShellProps) {
  return (
    <main id="content" className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl p-6 pb-16 md:p-8 md:pb-20 animate-fade-in">
        <nav aria-label="Ścieżka nawigacji" className="text-xs text-slate-500 md:text-sm">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/edukacja" className={breadcrumbLink}>
                Edukacja
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li>
              <Link href="/kursy/egzaminy" className={breadcrumbLink}>
                Egzaminy
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li>
              <Link href={trackHref} className={breadcrumbLink}>
                {trackBreadcrumbLabel}
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li className="text-slate-300" aria-current="page">
              {materialLabel}
            </li>
          </ol>
        </nav>

        <div className={`mt-6 ${cardClass} p-6 md:p-8`}>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200/90"
              >
                {b}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">{description}</p>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Możesz to potraktować jako:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-amber-400/80">
              <li>materiał do nauki</li>
              <li>powtórkę przed egzaminem</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={backHref}
              className="inline-flex w-fit items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-amber-500/25 hover:bg-amber-500/[0.08]"
            >
              {backLabel}
            </Link>
            <button
              type="button"
              disabled
              title="Eksport pliku będzie dostępny w kolejnej iteracji"
              className="inline-flex w-fit cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-500"
            >
              Pobierz jako {downloadFormat} (wkrótce)
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </main>
  );
}
