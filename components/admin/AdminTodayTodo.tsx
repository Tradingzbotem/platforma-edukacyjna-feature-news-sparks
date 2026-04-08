'use client';

import { useMemo } from 'react';
import Link from 'next/link';

const WARSAW_TZ = 'Europe/Warsaw';

function localDayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function isPublishedBriefToday(publishedAtIso: string | null | undefined, isPublished: boolean): boolean {
  if (!isPublished || !publishedAtIso) return false;
  const t = Date.parse(publishedAtIso);
  if (Number.isNaN(t)) return false;
  const pub = new Date(t);
  return localDayKey(pub, WARSAW_TZ) === localDayKey(new Date(), WARSAW_TZ);
}

function isPriceOverrideStale(lastUpdatedIso: string | null | undefined): boolean {
  if (lastUpdatedIso == null || lastUpdatedIso === '') return true;
  const t = Date.parse(lastUpdatedIso);
  if (Number.isNaN(t)) return true;
  return Date.now() - t > 24 * 60 * 60 * 1000;
}

export type AdminTodayTodoStats = {
  articles?: {
    total?: number;
    createdToday?: number;
    lastCreatedAt?: string | null;
    lastUpdatedAt?: string | null;
  };
  news?: { itemsLast24h?: number };
  priceOverrides?: { lastUpdatedAt?: string | null };
} | null;

export type AdminTodayTodoProps = {
  briefLoaded: boolean;
  /** `true` = opublikowany; `false` = szkic; `null` = brak rekordu */
  briefPublished: boolean | null;
  /** Z API briefu — data ostatniej publikacji (ISO) */
  briefPublishedAt: string | null;
  statsError: boolean;
  stats: AdminTodayTodoStats;
};

export type TodayTask = {
  id: string;
  type: 'error' | 'warning';
  title: string;
  action: { label: string; href: string };
};

function buildTasks(p: AdminTodayTodoProps): TodayTask[] {
  const tasks: TodayTask[] = [];

  if (!p.statsError && p.stats) {
    const pricesAt = p.stats.priceOverrides?.lastUpdatedAt ?? null;
    if (pricesAt == null || pricesAt === '') {
      tasks.push({
        id: 'prices-never',
        type: 'error',
        title: 'Override cen: brak zapisanej aktualizacji w bazie (albo tabela pusta)',
        action: { label: 'Przejdź do override cen', href: '/admin/override-ceny' },
      });
    } else if (isPriceOverrideStale(pricesAt)) {
      tasks.push({
        id: 'prices-stale',
        type: 'warning',
        title: 'Ceny (override) nie były aktualizowane dłużej niż 24 godziny',
        action: { label: 'Przejdź do override cen', href: '/admin/override-ceny' },
      });
    }
  }

  if (p.briefLoaded) {
    const okToday =
      p.briefPublished === true && isPublishedBriefToday(p.briefPublishedAt, true);
    if (!okToday) {
      tasks.push({
        id: 'brief-not-today',
        type: 'warning',
        title: 'Brak publikacji briefu decyzyjnego na dziś (wg strefy Europe/Warsaw)',
        action: { label: 'Przejdź do briefu', href: '/admin/brief-decyzyjny' },
      });
    }
  }

  if (!p.statsError && p.stats) {
    const createdToday = p.stats.articles?.createdToday;
    if (typeof createdToday === 'number' && createdToday === 0) {
      tasks.push({
        id: 'article-today',
        type: 'warning',
        title: 'Dziś nie zapisano nowego artykułu redakcyjnego w bazie',
        action: { label: 'Przejdź do redakcji', href: '/admin/redakcja' },
      });
    }
  }

  return tasks;
}

export function AdminTodayTodo(p: AdminTodayTodoProps) {
  const tasks = useMemo(
    () => buildTasks(p),
    [p.briefLoaded, p.briefPublished, p.briefPublishedAt, p.statsError, p.stats],
  );

  const dataReady = p.briefLoaded && (p.stats !== null || p.statsError);
  const allGood = !p.statsError && tasks.length === 0;
  const statsDownButQuiet = p.statsError && tasks.length === 0;

  const cardBase =
    'flex flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3';

  const cardError =
    `${cardBase} border-rose-500/40 bg-rose-950/25 shadow-[0_0_20px_-8px_rgba(248,113,113,0.45)]`;
  const cardWarning =
    `${cardBase} border-amber-400/35 bg-amber-950/20 shadow-[0_0_18px_-8px_rgba(251,191,36,0.35)]`;

  const btnBase =
    'inline-flex shrink-0 items-center justify-center rounded-md border px-2.5 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

  const btnError = `${btnBase} border-rose-300/40 bg-rose-500/90 text-white hover:bg-rose-500 hover:shadow-[0_0_16px_-4px_rgba(248,113,113,0.55)] focus-visible:ring-rose-400/50`;
  const btnWarning = `${btnBase} border-amber-300/40 bg-amber-500/15 text-amber-50 hover:bg-amber-500/25 hover:shadow-[0_0_16px_-4px_rgba(251,191,36,0.4)] focus-visible:ring-amber-400/45`;

  return (
    <section className="mb-8" aria-labelledby="admin-today-todo-heading">
      <h2 id="admin-today-todo-heading" className="text-sm font-semibold text-white/85 mb-3">
        Dzisiaj do zrobienia
      </h2>

      {!dataReady ? (
        <p className="text-xs text-white/45">Ładowanie…</p>
      ) : allGood ? (
        <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 px-3 py-2.5 shadow-[0_0_18px_-8px_rgba(52,211,153,0.25)]">
          <p className="text-sm font-medium text-emerald-200/95">Wszystko aktualne</p>
          <p className="text-xs text-emerald-200/65 mt-0.5">
            Kryteria na dziś: brief opublikowany (PL), override cen w bazie i nie starszy niż 24 h, nowy artykuł
            zapisany dziś.
          </p>
        </div>
      ) : statsDownButQuiet ? (
        <div className={cardWarning}>
          <p className="text-sm font-medium text-white/95 pr-1">
            Statystyki nie zostały wczytane — nie sprawdzono cen ani artykułów na dziś.
          </p>
          <Link href="/admin" className={btnWarning}>
            Odśwież /admin
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="list">
          {tasks.map((task) => (
            <li key={task.id}>
              <div className={task.type === 'error' ? cardError : cardWarning}>
                <p className="text-sm font-medium text-white/95 pr-1">{task.title}</p>
                <Link
                  href={task.action.href}
                  className={task.type === 'error' ? btnError : btnWarning}
                >
                  {task.action.label}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
