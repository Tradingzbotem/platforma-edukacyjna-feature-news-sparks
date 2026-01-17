'use client';

import Link from "next/link";

type Props = {
  slug: 'knf' | 'cysec' | 'przewodnik';
};

export default function ExamCTA({ slug }: Props) {
  const hrefMap: Record<Props['slug'], string> = {
    knf: '/kursy/egzaminy/knf/egzamin',
    cysec: '/kursy/egzaminy/cysec/egzamin',
    przewodnik: '/kursy/egzaminy/przewodnik/egzamin',
  };

  const titleMap: Record<Props['slug'], string> = {
    knf: 'Egzamin próbny KNF',
    cysec: 'Egzamin próbny CySEC',
    przewodnik: 'Egzamin próbny – przewodnik',
  };

  return (
    <div className="mt-8">
      <Link
        href={hrefMap[slug]}
        className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        {titleMap[slug]}
      </Link>
    </div>
  );
}
