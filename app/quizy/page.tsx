// app/quizy/page.tsx
// SSR-only: filtr po tagu (?tag=FX|CFD|REG|PRO|EXTRA|START) i wyszukiwarka (?q=)
// Liczba pytań pobierana z QUIZZES. Kafelki bez paczki → "Wkrótce".

import Link from 'next/link';
import type { QuizPack } from '@/data/quizzes';
import { QUIZZES } from '@/data/quizzes';
import { QuizListClient } from '@/components/QuizListClient';

type CardMeta = {
  slug: string;
  tag: 'START' | 'FX' | 'CFD' | 'PRO' | 'EXTRA' | 'REG';
  title: string;
  blurb: string;
};

const CARDS: CardMeta[] = [
  { slug: 'podstawy',     tag: 'START', title: 'Podstawy',        blurb: 'Rynek, pipsy/loty, zlecenia, dźwignia, sesje, spread.' },
  { slug: 'forex',        tag: 'FX',    title: 'Forex',           blurb: 'Pary walutowe, wartość pipsa, sesje, ryzyko i praktyka.' },
  { slug: 'cfd',          tag: 'CFD',   title: 'CFD',             blurb: 'Mechanika kontraktów, margin, rollover/financing, indeksy/surowce.' },
  { slug: 'zaawansowane', tag: 'PRO',   title: 'Zaawansowane',    blurb: 'Edge/EV, R:R, Kelly, backtest OOS, pułapki statystyczne.' },
  { slug: 'materialy',    tag: 'EXTRA', title: 'Materiały',       blurb: 'AT, patterny świecowe, psychologia, kalendarz makro.' },
  { slug: 'knf',          tag: 'REG',   title: 'KNF (PL)',        blurb: 'Ramy prawne, MIFID II w PL, obowiązki informacyjne, test adekwatności.' },
  { slug: 'cysec',        tag: 'REG',   title: 'CySEC (CY)',      blurb: 'Wymogi dla firm inwestycyjnych, kategoryzacja klientów, materiały KID/KIID.' },
  { slug: 'mifid',        tag: 'REG',   title: 'MiFID II (UE)',   blurb: 'Ochrona inwestora, best execution, konflikty interesów, raportowanie.' },
];

// mały helper – działa gdy Next poda `searchParams` jako obiekt albo Promise
async function unwrap<T>(x: T | Promise<T>): Promise<T> {
  return x instanceof Promise ? await x : x;
}

function getPack(slug: string): QuizPack | undefined {
  return (QUIZZES as Record<string, QuizPack | undefined>)[slug];
}
function getCount(slug: string): number {
  return getPack(slug)?.questions.length ?? 0;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80">
      <span className="text-white font-semibold">{value}</span>{' '}
      <span className="text-white/60">{label}</span>
    </div>
  );
}

const TAGS: Array<{key: 'ALL' | CardMeta['tag']; label: string}> = [
  { key: 'ALL', label: 'Wszystkie' },
  { key: 'START', label: 'Start' },
  { key: 'FX', label: 'FX' },
  { key: 'CFD', label: 'CFD' },
  { key: 'PRO', label: 'Pro' },
  { key: 'EXTRA', label: 'Extra' },
  { key: 'REG', label: 'Regulacje' },
];

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string; tag?: string } | Promise<{ q?: string; tag?: string }>;
}) {
  const sp = searchParams ? await unwrap(searchParams) : undefined;
  const q = (sp?.q ?? '').toString().trim().toLowerCase();
  const tag = (sp?.tag ?? 'ALL').toString().toUpperCase() as 'ALL' | CardMeta['tag'];

  const cardsFiltered = CARDS.filter((c) => {
    const tagOk = tag === 'ALL' ? true : c.tag === tag;
    const qOk = !q ? true : (c.title + ' ' + c.blurb).toLowerCase().includes(q);
    return tagOk && qOk;
  });

  const totalOpen = CARDS.filter((c) => Boolean(getPack(c.slug))).length;
  const totalQuestions = CARDS.reduce((acc, c) => acc + getCount(c.slug), 0);

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-8">
      {/* Powrót */}
      <nav className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          <span aria-hidden>←</span> Strona główna
        </Link>
      </nav>

      {/* Nagłówek + statystyki */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold">Quizy</h1>
        <p className="mt-2 text-slate-300">
          <b>Tryb otwarty</b> — wszystkie dostępne quizy są odblokowane. Kliknij „Rozpocznij”, aby wejść.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Stat label="dostępnych quizów" value={totalOpen + '/' + CARDS.length} />
          <Stat label="pytań łącznie" value={totalQuestions} />
        </div>
      </header>

      <QuizListClient
        cards={cardsFiltered.map((c) => ({
          slug: c.slug,
          tag: c.tag,
          title: c.title,
          blurb: c.blurb,
          questionsCount: getCount(c.slug),
          live: Boolean(getPack(c.slug)),
        }))}
      />
    </main>
  );
}
