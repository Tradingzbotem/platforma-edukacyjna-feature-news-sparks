'use client';

import Link from "next/link";

type Props = {
  slug: 'knf' | 'cysec' | 'przewodnik';
};

export default function ExamCTA({ slug }: Props) {
  const hrefMap: Record<Props['slug'], string> = {
    knf: '/quizy/egzaminy/knf',
    cysec: '/quizy/egzaminy/cysec',
    przewodnik: '/quizy/egzaminy/przewodnik',
  };

  const titleMap: Record<Props['slug'], string> = {
    knf: 'Egzamin próbny KNF (demo)',
    cysec: 'Egzamin próbny CySEC (demo)',
    przewodnik: 'Egzamin próbny – przewodnik (demo)',
  };

  const openPro = () => {
    alert('Wersja PRO: pełny egzamin próbny + raport z błędami.');
  };

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Link
        href={hrefMap[slug]}
        className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90"
      >
        {titleMap[slug]}
      </Link>

      <button
        onClick={openPro}
        className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/20"
      >
        Odblokuj wersję PRO
      </button>
    </div>
  );
}
