import Link from 'next/link';

export type ExamMaterialType = 'checklist' | 'notes' | 'cheatsheet';

export type ExamMaterialItem = {
  title: string;
  description?: string;
  href: string;
  type: ExamMaterialType;
};

const TYPE_LABEL: Record<ExamMaterialType, string> = {
  checklist: 'Checklist',
  notes: 'Notatki',
  cheatsheet: 'Ściąga',
};

const TYPE_SURFACE: Record<ExamMaterialType, string> = {
  checklist: 'border-emerald-500/25 bg-emerald-500/[0.06]',
  notes: 'border-sky-500/25 bg-sky-500/[0.06]',
  cheatsheet: 'border-amber-500/30 bg-amber-500/[0.08]',
};

export default function ExamMaterialsLibrary({ items }: { items: ExamMaterialItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`group block rounded-xl border px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 ${TYPE_SURFACE[item.type]} hover:border-amber-500/35`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 group-hover:text-amber-200/80">
                  {TYPE_LABEL[item.type]}
                </span>
                <p className="mt-1 text-sm font-semibold text-white group-hover:text-amber-50/95">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <span
                className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-200/90"
                aria-hidden
              >
                →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
