'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useNewsSWR } from './useNewsSWR';

type NewsItem = {
  title: string;
  summary: string;
  instruments: string[];
  timestamp_iso: string;
  source: string;
  link: string;
};

type ApiResponse = {
  items: NewsItem[];
  cachedAt: string;
};

function SparkSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="mt-2 h-3 w-full bg-white/10 rounded" />
          <div className="mt-1 h-3 w-2/3 bg-white/10 rounded" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-16 bg-white/10 rounded" />
            <div className="h-6 w-20 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SparksCard() {
  const { data, error, isLoading } = useNewsSWR<ApiResponse>('/api/news/summarize?bucket=24h');

  const top = useMemo(() => {
    const list = data?.items ?? [];
    return list.slice(0, 4);
  }, [data]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sygnały dnia</h2>
        <Link
          href="/news"
          className="text-sm text-white/70 hover:text-white underline underline-offset-4"
        >
          Zobacz więcej
        </Link>
      </div>
      <p className="mt-1 text-sm text-white/60">Najważniejsze sygnały z ostatnich 24h.</p>

      {isLoading && <div className="mt-4"><SparkSkeleton /></div>}
      {error && !isLoading && (
        <div className="mt-4 text-sm text-rose-300">
          Nie udało się pobrać newsów. Spróbuj ponownie później.
        </div>
      )}
      {!isLoading && !error && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {top.map((it) => (
            <article key={it.link} className="group rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <Link href={it.link} target="_blank" rel="noreferrer" className="block">
                <h3 className="font-medium leading-snug line-clamp-2 group-hover:text-white">{it.title}</h3>
              </Link>
              <div className="mt-1 text-[11px] text-white/50">
                {new Date(it.timestamp_iso).toLocaleString()}
                <span className="mx-1">·</span>
                {it.source}
              </div>
              <p className="mt-2 text-sm text-white/70 line-clamp-3">{it.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {it.instruments.slice(0, 3).map(sym => (
                  <span key={sym} className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-white/10 ring-1 ring-inset ring-white/10">
                    {sym}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/news?explain=${encodeURIComponent(it.title)}`}
                  className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white/10 ring-1 ring-inset ring-white/10 hover:bg-white/15"
                >
                  Wyjaśnij
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white/5 ring-1 ring-inset ring-white/10 text-white/80 hover:bg-white/10"
                  title="Wymaga planu EDU (placeholder)"
                >
                  Dodaj do checklisty
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


