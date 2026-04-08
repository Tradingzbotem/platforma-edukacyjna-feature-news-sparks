'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Users,
  Newspaper,
  FileText,
  Scale,
  CheckCircle2,
  PenLine,
  Brain,
  Image as LucideImage,
  BarChart3,
  Gift,
  Tags,
  Mail,
  Trophy,
  CalendarDays,
  Award,
  Sunrise,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { AdminTodayTodo } from '@/components/admin/AdminTodayTodo';

const QA_GHOST =
  'inline-flex items-center justify-center rounded-md border border-white/15 bg-white/[0.03] px-2.5 py-1 text-sm text-white/90 transition duration-150 hover:border-sky-400/40 hover:bg-white/[0.08] hover:shadow-[0_0_18px_-6px_rgba(56,189,248,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35';

function formatAdminDateTime(iso: string | null | undefined): string {
  if (iso == null || iso === '') return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(t);
}

function isPriceStale(iso: string | null | undefined): boolean {
  if (iso == null || iso === '') return true;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true;
  return Date.now() - t > 24 * 60 * 60 * 1000;
}

type DashboardStats = {
  users: { total: number; active?: number; online?: number };
  news: {
    totalItems?: number;
    enrichedItems?: number;
    itemsLast48h?: number;
    itemsLast24h?: number;
    recentItems?: number;
    lastIngestAt?: string | null;
    lastEnrichedAt?: string | null;
  };
  articles: {
    total: number;
    createdToday?: number;
    lastCreatedAt?: string | null;
    lastUpdatedAt?: string | null;
  };
  priceOverrides?: { lastUpdatedAt?: string | null };
  contact?: { total: number; unhandled: number };
  courses?: { totalLessons: number; completedLessons: number; uniqueUsers: number };
};

type BriefSnap = {
  isPublished: boolean;
  updatedAt: string;
  publishedAt: string | null;
};

type AdminNavTileDef = {
  title: string;
  href: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
};

/** Kolejność dopasowana do siatki lg:3 — każdy kafel „szeroki” (col-span-2) ma obok siebie jeden zwykły, bez dziur. */
const ADMIN_NAV_TILES: AdminNavTileDef[] = [
  {
    title: 'News',
    href: '/admin/news',
    desc: 'Zarządzanie wiadomościami: przegląd, usuwanie, status wzbogacenia.',
    icon: Newspaper,
    featured: true,
  },
  {
    title: 'Użytkownicy',
    href: '/admin/uzytkownicy',
    desc: 'Zarządzanie planami, przegląd kont i usuwanie użytkowników.',
    icon: Users,
  },
  {
    title: 'Redakcja',
    href: '/admin/redakcja',
    desc: 'Tworzenie i edycja artykułów oraz treści redakcyjnych.',
    icon: PenLine,
    featured: true,
  },
  {
    title: 'Darmowe Edulab 7 dni',
    href: '/admin/uzytkownicy/edulab-trial',
    desc: 'Zarządzanie prośbami o 7-dniowy trial pakietu Elite.',
    icon: Gift,
  },
  {
    title: 'Brief decyzyjny',
    href: '/admin/brief-decyzyjny',
    desc: 'Dzienny brief: treść, aktywa pod wpływem, scenariusze i publikacja na /rynek.',
    icon: Brain,
    featured: true,
  },
  {
    title: 'Poranny briefing',
    href: '/admin/briefing',
    desc: 'Ręczne generowanie instytucjonalnego briefingu makro (podgląd, bez zapisu w bazie).',
    icon: Sunrise,
  },
  {
    title: 'Override ceny',
    href: '/admin/override-ceny',
    desc: 'Aktualizacja cen wykorzystywanych w mapach technicznych.',
    icon: Tags,
  },
  {
    title: 'Wiadomości z kontaktu',
    href: '/admin/kontakt',
    desc: 'Przegląd zgłoszeń, oznaczanie jako przeczytane/nowe.',
    icon: Mail,
  },
  {
    title: 'Media',
    href: '/admin/redakcja/media',
    desc: 'Przesyłanie, zarządzanie i wstawianie zasobów medialnych.',
    icon: LucideImage,
  },
  {
    title: 'Statystyki',
    href: '/admin/statystyki',
    desc: 'Przegląd platformy: użytkownicy, kursy, quizy, treści i aktywność.',
    icon: BarChart3,
  },
  {
    title: 'Challenge',
    href: '/admin/challenge',
    desc: 'Przegląd wyborów użytkowników, ranking i statystyki Challenge.',
    icon: Trophy,
  },
  {
    title: 'Certyfikaty',
    href: '/admin/certifications',
    desc: 'Generowanie i zarządzanie certyfikatami: lista, edycja, weryfikacja publiczna.',
    icon: Award,
  },
  {
    title: 'Kalendarz makro — 30 dni (EDU)',
    href: '/admin/kalendarz',
    desc: 'Zarządzanie kalendarzem makro: odświeżanie danych dla klientów jednym kliknięciem.',
    icon: CalendarDays,
  },
];

function PlatformCard({
  title,
  value,
  hint,
  icon: Icon,
  href,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 transition hover:border-white/15 hover:bg-white/[0.06]">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
        <Icon className="h-3.5 w-3.5 text-white/55" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-white/45">{title}</div>
        <div className="mt-0.5 text-lg font-semibold tabular-nums text-white">{value}</div>
        {hint ? <div className="mt-0.5 text-[11px] text-white/40">{hint}</div> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-xl">
        {inner}
      </Link>
    );
  }
  return inner;
}

function AdminNavTile({
  href,
  title,
  desc,
  meta,
  detailLines,
  tone = 'default',
  icon: Icon,
  featured,
  actions,
}: {
  href: string;
  title: string;
  desc: string;
  meta: string;
  detailLines?: string[];
  tone?: 'default' | 'warn';
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
  actions: ReactNode;
}) {
  const surface = featured
    ? 'border border-white/[0.22] bg-gradient-to-br from-white/[0.1] to-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]'
    : 'border border-white/10 bg-white/5';

  const iconBox = featured ? 'h-11 w-11 rounded-xl' : 'h-10 w-10 rounded-xl';

  const spanClass = featured
    ? 'col-span-1 min-h-[300px] sm:col-span-2 lg:col-span-2'
    : 'col-span-1 min-h-[300px]';

  return (
    <div
      className={[
        'group relative flex h-full rounded-2xl focus-within:ring-2 focus-within:ring-sky-400/35 focus-within:ring-offset-2 focus-within:ring-offset-slate-950',
        tone === 'warn' ? 'ring-1 ring-amber-400/40' : '',
        spanClass,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl transition-all duration-200 ease-out will-change-transform',
          'group-hover:scale-[1.02] group-hover:border-sky-300/25 group-hover:shadow-[0_0_40px_-12px_rgba(56,189,248,0.38)]',
          surface,
          'group-hover:bg-white/[0.09]',
        ].join(' ')}
      >
        <Link
          href={href}
          className="flex min-h-0 flex-1 flex-col rounded-t-2xl px-5 pt-5 outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:px-6 sm:pt-6"
        >
          <div className="flex min-h-0 flex-1 items-start gap-4">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className={featured ? 'text-xl font-semibold mb-1.5' : 'text-lg font-semibold mb-1'}>{title}</div>
              <div className="text-sm text-white/70 leading-snug">{desc}</div>
              {detailLines && detailLines.length > 0 ? (
                <ul className="mt-2 space-y-0.5 text-[11px] leading-snug text-white/50" aria-label="Szczegóły operacyjne">
                  {detailLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-auto pt-3">
                <div className="border-t border-white/10 pt-2.5 text-xs font-medium text-sky-200/75 tabular-nums">
                  {meta}
                </div>
              </div>
            </div>
            <div
              className={[
                'shrink-0 flex items-center justify-center border border-white/10 bg-white/[0.06] text-white/50 transition-colors duration-200',
                'group-hover:border-sky-300/30 group-hover:text-sky-200/90 group-hover:bg-sky-500/10',
                iconBox,
              ].join(' ')}
            >
              <Icon className={featured ? 'h-5 w-5' : 'h-[1.15rem] w-[1.15rem]'} aria-hidden />
            </div>
          </div>
        </Link>

        <div
          className="mt-auto shrink-0 border-t border-white/10 px-5 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-3.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [briefPublished, setBriefPublished] = useState<boolean | null>(null);
  const [briefSnap, setBriefSnap] = useState<BriefSnap | null>(null);
  const [briefLoaded, setBriefLoaded] = useState(false);
  const [newsRefreshBusy, setNewsRefreshBusy] = useState(false);
  const [newsEnrichBusy, setNewsEnrichBusy] = useState(false);

  const refreshStatsAfterNewsJob = useCallback(async () => {
    try {
      const statsRes = await fetch('/api/admin/statistics', { cache: 'no-store' });
      if (statsRes.ok) {
        const j = await statsRes.json();
        if (j?.ok && j.stats) setStats(j.stats as DashboardStats);
      }
    } catch {
      /* statystyki opcjonalne po jobie */
    }
  }, []);

  const runNewsRefreshJob = useCallback(async () => {
    setNewsRefreshBusy(true);
    try {
      const r = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.error || 'Refresh failed');
      await refreshStatsAfterNewsJob();
    } catch {
      /* brak toastów w MVP — błąd widać na /admin/news */
    } finally {
      setNewsRefreshBusy(false);
    }
  }, [refreshStatsAfterNewsJob]);

  const runNewsEnrichJob = useCallback(async () => {
    setNewsEnrichBusy(true);
    try {
      const r = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enrich' }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.error || 'Enrich failed');
      await refreshStatsAfterNewsJob();
    } catch {
      /* jak wyżej */
    } finally {
      setNewsEnrichBusy(false);
    }
  }, [refreshStatsAfterNewsJob]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [statsRes, briefRes] = await Promise.all([
          fetch('/api/admin/statistics', { cache: 'no-store' }),
          fetch('/api/admin/decision-brief', { cache: 'no-store' }),
        ]);

        if (mounted && statsRes.ok) {
          const data = await statsRes.json();
          if (data?.ok && data.stats) {
            setStats(data.stats as DashboardStats);
            setStatsError(false);
          } else {
            setStats(null);
            setStatsError(true);
          }
        } else if (mounted) {
          setStats(null);
          setStatsError(true);
        }

        if (mounted && briefRes.ok) {
          const briefData = await briefRes.json();
          if (briefData?.ok) {
            const b = briefData.brief;
            if (b) {
              setBriefPublished(Boolean(b.isPublished));
              setBriefSnap({
                isPublished: Boolean(b.isPublished),
                updatedAt: String(b.updatedAt ?? ''),
                publishedAt: b.publishedAt ? String(b.publishedAt) : null,
              });
            } else {
              setBriefPublished(null);
              setBriefSnap(null);
            }
          } else {
            setBriefPublished(null);
            setBriefSnap(null);
          }
        } else if (mounted) {
          setBriefPublished(null);
          setBriefSnap(null);
        }
      } catch {
        if (mounted) {
          setStats(null);
          setStatsError(true);
          setBriefPublished(null);
          setBriefSnap(null);
        }
      } finally {
        if (mounted) setBriefLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const tileMeta = useMemo((): Record<string, string> => {
    const err = statsError || !stats;
    const s = stats;
    const priceAt = s?.priceOverrides?.lastUpdatedAt ?? null;

    let briefLine = 'Ładowanie statusu…';
    if (briefLoaded) {
      if (briefPublished === true) briefLine = 'Opublikowany · /rynek';
      else if (briefPublished === false) briefLine = 'Szkic (niepubliczny)';
      else briefLine = 'Brak rekordu briefu';
    }

    const newsLine =
      err || !s ? 'Brak danych z API' : `${s.news?.totalItems ?? 0} w bazie · ${s.news?.enrichedItems ?? 0} wzb.`;

    const contactLine =
      err || !s
        ? 'Brak danych z API'
        : s.contact
          ? `${s.contact.unhandled} nieobsłużonych · ${s.contact.total} łącznie`
          : 'Skrzynka kontaktowa';

    const coursesLine =
      err || !s
        ? 'Brak danych z API'
        : s.courses
          ? `${s.courses.completedLessons}/${s.courses.totalLessons} lekcji ukończonych`
          : 'Dashboard KPI';

    let overrideLine = 'Źródło cen w mapach';
    if (err) overrideLine = 'Brak danych z API';
    else if (priceAt == null || priceAt === '') overrideLine = 'Brak zapisu override w bazie';
    else if (isPriceStale(priceAt)) overrideLine = 'Ostatni zapis >24h — sprawdź';

    return {
      '/admin/uzytkownicy': err || !s ? 'Brak danych z API' : `${s.users.total} kont w bazie`,
      '/admin/uzytkownicy/edulab-trial': 'Aktywacja 7-dniowego pakietu Elite',
      '/admin/override-ceny': overrideLine,
      '/admin/kontakt': contactLine,
      '/admin/redakcja': err || !s ? 'Brak danych z API' : `${s.articles.total} artykułów w bazie`,
      '/admin/redakcja/media': 'Obrazy i pliki dla redakcji',
      '/admin/statystyki': coursesLine,
      '/admin/news': newsLine,
      '/admin/brief-decyzyjny': briefLine,
      '/admin/briefing': 'Generator OpenAI · JSON makro / geo / aktywa',
      '/admin/challenge': 'Wybory użytkowników i ranking',
      '/admin/certifications': 'Wydawanie certyfikatów · weryfikacja /certificates/verify',
      '/admin/kalendarz': 'Wydarzenia makro · odświeżanie dla EDU',
    };
  }, [stats, statsError, briefLoaded, briefPublished]);

  const navTileExtras = useMemo((): Partial<
    Record<string, { detailLines: string[]; tone: 'default' | 'warn' }>
  > => {
    const err = statsError || !stats;
    const s = stats;
    const priceAt = s?.priceOverrides?.lastUpdatedAt ?? null;
    const priceWarn = Boolean(s) && !statsError && isPriceStale(priceAt);

    const briefDetail: { detailLines: string[]; tone: 'default' | 'warn' } = !briefLoaded
      ? { detailLines: ['Ładowanie danych briefu…'], tone: 'default' }
      : !briefSnap
        ? {
            detailLines: [
              'Status: brak rekordu',
              'Ostatnio zapisano: —',
              'Ostatnio opublikowano: —',
            ],
            tone: 'default',
          }
        : {
            detailLines: [
              briefSnap.isPublished ? 'Status: opublikowany' : 'Status: szkic',
              `Ostatnio zapisano: ${formatAdminDateTime(briefSnap.updatedAt)}`,
              briefSnap.publishedAt
                ? `Ostatnio opublikowano: ${formatAdminDateTime(briefSnap.publishedAt)}`
                : 'Ostatnio opublikowano: —',
            ],
            tone: 'default',
          };

    return {
      '/admin/brief-decyzyjny': briefDetail,
      '/admin/override-ceny': {
        detailLines: err
          ? ['Brak danych z API']
          : [
              `Ostatnia aktualizacja cen: ${formatAdminDateTime(priceAt)}`,
              ...(priceWarn ? ['Uwaga: dane starsze niż 24 h'] : []),
            ],
        tone: priceWarn ? 'warn' : 'default',
      },
      '/admin/redakcja': {
        detailLines:
          err || !s
            ? ['Brak danych z API']
            : [
                `Ostatni zapisany artykuł: ${formatAdminDateTime(s.articles?.lastCreatedAt)}`,
                `Ostatnia edycja: ${formatAdminDateTime(s.articles?.lastUpdatedAt)}`,
              ],
        tone: 'default',
      },
      '/admin/news': {
        detailLines:
          err || !s
            ? ['Brak danych z API']
            : [
                `Ostatni ingest: ${formatAdminDateTime(s.news?.lastIngestAt)}`,
                `Ostatnie wzbogacenie: ${formatAdminDateTime(s.news?.lastEnrichedAt)}`,
              ],
        tone: 'default',
      },
    };
  }, [stats, statsError, briefLoaded, briefSnap]);

  const quickActionsForTile = useCallback(
    (tileHref: string): ReactNode => {
      if (tileHref === '/admin/brief-decyzyjny') {
        return (
          <>
            <Link href="/admin/brief-decyzyjny" className={QA_GHOST}>
              Otwórz panel
            </Link>
            <Link href="/admin/brief-decyzyjny#empty" className={QA_GHOST}>
              Nowy brief
            </Link>
          </>
        );
      }
      if (tileHref === '/admin/redakcja') {
        return (
          <>
            <Link href="/admin/redakcja/new" className={QA_GHOST}>
              + Nowy artykuł
            </Link>
            <Link href="/admin/redakcja?ai=1" className={QA_GHOST}>
              AI artykuł
            </Link>
          </>
        );
      }
      if (tileHref === '/admin/news') {
        const newsJobBusy = newsRefreshBusy || newsEnrichBusy;
        return (
          <>
            <button
              type="button"
              disabled={newsJobBusy}
              onClick={() => void runNewsRefreshJob()}
              className={`${QA_GHOST} disabled:pointer-events-none disabled:opacity-45`}
            >
              {newsRefreshBusy ? 'Odświeżanie…' : 'Odśwież news'}
            </button>
            <button
              type="button"
              disabled={newsJobBusy}
              onClick={() => void runNewsEnrichJob()}
              className={`${QA_GHOST} disabled:pointer-events-none disabled:opacity-45`}
              title="Wzbogać surowe wpisy w kolejce (AI), bez ponownego zaciągania RSS"
            >
              {newsEnrichBusy ? 'Wzbogacanie…' : 'Wzbogać (AI)'}
            </button>
            <Link href="/admin/news" className={QA_GHOST}>
              Zarządzaj newsami
            </Link>
          </>
        );
      }
      if (tileHref === '/admin/uzytkownicy') {
        return (
          <Link href="/admin/uzytkownicy" className={QA_GHOST}>
            Zobacz użytkowników
          </Link>
        );
      }
      if (tileHref === '/admin/redakcja/media') {
        return (
          <Link href="/admin/redakcja/media" className={QA_GHOST}>
            Dodaj plik
          </Link>
        );
      }
      if (tileHref === '/admin/certifications') {
        return (
          <>
            <Link href="/admin/certifications" className={QA_GHOST}>
              Lista certyfikatów
            </Link>
            <Link href="/admin/certifications/new" className={QA_GHOST}>
              + Nowy certyfikat
            </Link>
          </>
        );
      }
      return (
        <Link href={tileHref} className={QA_GHOST}>
          Otwórz panel
        </Link>
      );
    },
    [newsRefreshBusy, newsEnrichBusy, runNewsRefreshJob, runNewsEnrichJob],
  );

  const usersLabel =
    statsError || !stats ? '—' : String(stats.users?.total ?? 0);
  const usersHint = statsError ? 'Brak danych (API / baza)' : undefined;

  const news48 =
    stats && typeof stats.news?.itemsLast48h === 'number' ? stats.news.itemsLast48h : null;
  const newsLabel = statsError ? '—' : news48 !== null ? String(news48) : '—';
  const newsHint = statsError ? 'Brak danych (API / baza)' : 'wg daty publikacji lub utworzenia';

  const articlesLabel =
    statsError || !stats ? '—' : String(stats.articles?.total ?? 0);
  const articlesHint = statsError ? 'Brak danych (API / baza)' : undefined;

  let briefLabel = '…';
  let briefHint: string | undefined;
  if (briefLoaded) {
    if (briefPublished === true) {
      briefLabel = 'Opublikowany';
    } else if (briefPublished === false) {
      briefLabel = 'Szkic (niepubliczny)';
      briefHint = 'Zapisany w bazie — zaznacz publikację przy zapisie, żeby był na /rynek';
    } else {
      briefLabel = 'Brak';
      briefHint = 'Brak rekordu roboczego';
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Panel admina</h1>
            <Link
              href="/redakcja"
              className="inline-flex items-center rounded-md bg-white text-slate-900 px-3 py-1.5 text-sm font-semibold hover:opacity-90"
            >
              Zobacz publicznie
            </Link>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Wybierz sekcję. Kafelki poniżej zawierają krótkie opisy funkcji — kolejne narzędzia będziemy dodawać tu w
            przyszłości.
          </p>
        </div>

        <AdminTodayTodo
          briefLoaded={briefLoaded}
          briefPublished={briefPublished}
          briefPublishedAt={briefSnap?.publishedAt ?? null}
          statsError={statsError}
          stats={stats}
        />

        <section className="mb-8" aria-labelledby="platform-status-heading">
          <h2 id="platform-status-heading" className="text-sm font-semibold text-white/80 mb-3">
            Stan platformy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
            <PlatformCard
              title="Użytkownicy"
              value={usersLabel}
              hint={usersHint}
              icon={Users}
              href="/admin/uzytkownicy"
            />
            <PlatformCard
              title="News (48h)"
              value={newsLabel}
              hint={newsHint}
              icon={Newspaper}
              href="/admin/news"
            />
            <PlatformCard
              title="Artykuły"
              value={articlesLabel}
              hint={articlesHint}
              icon={FileText}
              href="/admin/redakcja"
            />
            <PlatformCard
              title="Brief decyzyjny"
              value={briefLabel}
              hint={briefHint}
              icon={Scale}
              href="/admin/brief-decyzyjny"
            />
            <PlatformCard title="Status systemu" value="OK" hint="Monitorowanie w przygotowaniu" icon={CheckCircle2} />
          </div>
        </section>

        <section aria-label="Moduły administracyjne">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-visible">
            {ADMIN_NAV_TILES.map((t) => {
              const extra = navTileExtras[t.href];
              return (
                <AdminNavTile
                  key={t.href}
                  href={t.href}
                  title={t.title}
                  desc={t.desc}
                  meta={tileMeta[t.href] ?? '—'}
                  detailLines={extra?.detailLines}
                  tone={extra?.tone ?? 'default'}
                  icon={t.icon}
                  featured={t.featured}
                  actions={quickActionsForTile(t.href)}
                />
              );
            })}
          </div>
        </section>

        {/* End main content */}
      </div>
    </main>
  );
}
