// app/konto/panel-rynkowy/playbooki-eventowe/PlaybookCard.tsx
'use client';

import Link from 'next/link';
import { Playbook } from '@/lib/panel/playbooks';

type Props = {
  item: Playbook;
};

function importanceBadge(importance: Playbook['importance']) {
  if (importance === 'high') return 'text-red-300 border-red-400/30 bg-red-500/10';
  if (importance === 'medium') return 'text-amber-300 border-amber-400/30 bg-amber-500/10';
  return 'text-white/70 border-white/20 bg-white/5';
}

export default function PlaybookCard({ item }: Props) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-sm hover:shadow-md hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Region: {item.region}</span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${importanceBadge(item.importance)}`}>
              Ważność: {item.importance === 'high' ? 'wysoka' : item.importance === 'medium' ? 'średnia' : 'niska'}
            </span>
          </div>
          <h3 className="mt-2 text-lg md:text-xl font-bold tracking-tight text-white/95">
            <Link href={`/konto/panel-rynkowy/playbooki-eventowe/${item.slug}`} className="hover:underline">
              {item.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-white/80">{item.summaryOneLine}</p>
        </div>
        <div className="text-right text-xs text-white/60">
          <div>Aktualizacja</div>
          <div className="font-medium text-white/80">{new Date(item.updatedAt).toLocaleDateString('pl-PL')}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.slice(0, 4).map((t) => (
          <span key={t} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">{t}</span>
        ))}
      </div>

      <div className="mt-4 grid gap-2 text-sm text-white/80">
        <div>
          <div className="font-semibold">Co zwykle porusza rynkiem</div>
          <div className="mt-1">{item.summaryOneLine}</div>
        </div>
        <div>
          <div className="font-semibold">Co sprawdzasz w 60s</div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {item.sixtySeconds.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={`/konto/panel-rynkowy/playbooki-eventowe/${item.slug}`}
          className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Otwórz playbook
        </Link>
        <Link
          href={`/konto/panel-rynkowy/playbooki-eventowe/${item.slug}?tab=tldr`}
          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Skrót 60s
        </Link>
        <Link
          href={`/konto/panel-rynkowy/playbooki-eventowe/${item.slug}?tab=quiz`}
          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Quiz
        </Link>
      </div>
    </article>
  );
}


