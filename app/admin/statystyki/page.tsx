'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import {
  Users,
  BookOpen,
  HelpCircle,
  Newspaper,
  FileText,
  Mail,
  TrendingUp,
  Activity,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

type UserLearningRow = {
  userId: string;
  email: string;
  plan: string;
  lessons: Array<{ course: string; lessonId: string; done: boolean; updatedAt: string }>;
  quizzes: Array<{ slug: string; score: number; total: number; at: string; percentage: number }>;
  summary: {
    lessonRows: number;
    lessonsDone: number;
    quizAttempts: number;
    distinctQuizSlugs: number;
  };
};

type Statistics = {
  users: {
    total: number;
    byPlan: Record<string, number>;
    active: number;
    online: number;
  };
  courses: {
    totalLessons: number;
    completedLessons: number;
    uniqueUsers: number;
  };
  quizzes: {
    totalAttempts: number;
    uniqueUsers: number;
    averageScore: number;
  };
  news: {
    totalItems: number;
    enrichedItems: number;
    recentItems: number;
  };
  articles: {
    total: number;
  };
  contact: {
    total: number;
    unhandled: number;
  };
  userLearning?: UserLearningRow[];
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-1">{title}</h3>
          <div className="text-3xl font-bold text-white">{value}</div>
          {subtitle && <div className="text-xs text-white/50 mt-1">{subtitle}</div>}
        </div>
        <Icon className="h-8 w-8 text-white/30" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningFilter, setLearningFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/admin/statistics', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!mounted) return;
        if (!data.ok) throw new Error(data.error || 'Failed to load statistics');
        setStats(data.stats);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać statystyk');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const userLearning = stats?.userLearning ?? [];
  const learningFiltered = useMemo(() => {
    const q = learningFilter.trim().toLowerCase();
    if (!q) return userLearning;
    return userLearning.filter((u) => u.email.toLowerCase().includes(q));
  }, [userLearning, learningFilter]);

  const learningWithActivity = useMemo(
    () => learningFiltered.filter((u) => u.summary.lessonRows > 0 || u.summary.quizAttempts > 0),
    [learningFiltered],
  );

  if (loading) return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;
  if (error) return <main className="min-h-screen bg-slate-950 text-white p-6">Błąd: {error}</main>;
  if (!stats) return <main className="min-h-screen bg-slate-950 text-white p-6">Brak danych</main>;

  const completionRate = stats.courses.totalLessons > 0
    ? Math.round((stats.courses.completedLessons / stats.courses.totalLessons) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Statystyki</h1>
            <p className="mt-2 text-sm text-white/60">Przegląd platformy i aktywności użytkowników</p>
          </div>
        </div>

        {/* Users Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Użytkownicy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Wszyscy użytkownicy"
              value={stats.users.total}
              icon={Users}
              href="/admin/uzytkownicy"
            />
            <StatCard
              title="Aktywni (30 dni)"
              value={stats.users.active}
              subtitle={`${stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}% wszystkich`}
              icon={Activity}
            />
            <StatCard
              title="Online teraz"
              value={stats.users.online}
              icon={TrendingUp}
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm font-medium text-white/70 mb-3">Podział na plany</h3>
              <div className="space-y-2">
                {Object.entries(stats.users.byPlan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between text-sm">
                    <span className="text-white/70 capitalize">{plan}</span>
                    <span className="font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Courses & Quizzes Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kursy i Quizy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Ukończone lekcje"
              value={stats.courses.completedLessons}
              subtitle={`z ${stats.courses.totalLessons} wszystkich (${completionRate}%)`}
              icon={BookOpen}
            />
            <StatCard
              title="Użytkownicy z postępem"
              value={stats.courses.uniqueUsers}
              subtitle="w kursach"
              icon={Users}
            />
            <StatCard
              title="Próby quizów"
              value={stats.quizzes.totalAttempts}
              subtitle={`${stats.quizzes.uniqueUsers} unikalnych użytkowników`}
              icon={HelpCircle}
            />
            <StatCard
              title="Średni wynik"
              value={`${stats.quizzes.averageScore.toFixed(1)}%`}
              subtitle="w quizach"
              icon={TrendingUp}
            />
          </div>
        </section>

        {/* Per-user learning (DB) */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Postępy użytkowników (baza danych)
          </h2>
          <p className="text-sm text-white/50 mb-4 max-w-3xl">
            Źródło: tabele <span className="text-white/65">lesson_progress</span> (wszystkie kursy i moduły materiałów
            zapisywane do bazy) oraz <span className="text-white/65">quiz_results</span> (każda ukończona próba quizu
            zalogowanego użytkownika). Materiały dodatkowe trafiają do bazy przy oznaczeniu lekcji i przy ponownym
            wczytaniu modułu, jeśli postęp był wcześniej tylko w sesji. Lista kont odpowiada zakresowi z panelu
            użytkowników (do 500 najnowszych kont).
          </p>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex flex-col gap-1 text-sm text-white/60 sm:max-w-md">
              <span className="text-white/45">Filtruj po e‑mailu</span>
              <input
                type="search"
                value={learningFilter}
                onChange={(e) => setLearningFilter(e.target.value)}
                placeholder="np. fragment adresu…"
                className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-white placeholder:text-white/30"
              />
            </label>
            <div className="text-xs text-white/45 tabular-nums">
              {learningFiltered.length} użytkowników na liście · {learningWithActivity.length} z zapisanym postępem
            </div>
          </div>
          <div className="space-y-2 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
            {learningFiltered.map((u) => {
              const hasData = u.summary.lessonRows > 0 || u.summary.quizAttempts > 0;
              return (
                <details
                  key={u.userId}
                  className="group rounded-xl border border-white/10 bg-white/[0.04] open:bg-white/[0.06]"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition group-open:rotate-180" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-medium text-white break-all">{u.email}</span>
                        <span className="text-xs uppercase tracking-wide text-white/40">{u.plan}</span>
                      </div>
                      <div className="mt-1 text-xs text-white/50 tabular-nums">
                        Lekcje ukończone: {u.summary.lessonsDone}
                        {u.summary.lessonRows > 0 ? ` / ${u.summary.lessonRows} wierszy postępu` : ''} · Próby quizów:{' '}
                        {u.summary.quizAttempts}
                        {u.summary.distinctQuizSlugs > 0
                          ? ` (${u.summary.distinctQuizSlugs} różnych quizów)`
                          : ''}
                        {!hasData ? ' · brak zapisów w bazie' : ''}
                      </div>
                    </div>
                    <Link
                      href={`/admin/uzytkownicy/${encodeURIComponent(u.userId)}/aktywnosc`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-sky-200/90 hover:border-sky-400/35 hover:bg-white/[0.1]"
                    >
                      Podgląd
                      <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                    </Link>
                  </summary>
                  <div className="border-t border-white/10 px-4 pb-4 pt-2">
                    {!hasData ? (
                      <p className="text-sm text-white/45">Brak wierszy w lesson_progress i quiz_results.</p>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                            <BookOpen className="h-4 w-4" />
                            Lekcje / kursy ({u.lessons.length})
                          </h3>
                          <div className="overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-white/10 bg-white/[0.04] text-white/55">
                                  <th className="px-2 py-2 font-medium">Kurs</th>
                                  <th className="px-2 py-2 font-medium">Lekcja</th>
                                  <th className="px-2 py-2 font-medium">Status</th>
                                  <th className="px-2 py-2 font-medium">Aktualizacja</th>
                                </tr>
                              </thead>
                              <tbody>
                                {u.lessons.map((row, i) => (
                                  <tr key={`${row.course}-${row.lessonId}-${i}`} className="border-b border-white/5">
                                    <td className="px-2 py-1.5 capitalize text-white/80">{row.course}</td>
                                    <td className="px-2 py-1.5 text-white/70">{row.lessonId}</td>
                                    <td className="px-2 py-1.5">
                                      {row.done ? (
                                        <span className="text-emerald-400/90">Ukończona</span>
                                      ) : (
                                        <span className="text-white/45">W toku</span>
                                      )}
                                    </td>
                                    <td className="px-2 py-1.5 text-white/45 whitespace-nowrap">
                                      {new Date(row.updatedAt).toLocaleString('pl-PL')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                            <HelpCircle className="h-4 w-4" />
                            Quizy — próby ({u.quizzes.length})
                          </h3>
                          <div className="overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-white/10 bg-white/[0.04] text-white/55">
                                  <th className="px-2 py-2 font-medium">Quiz (slug)</th>
                                  <th className="px-2 py-2 font-medium">Wynik</th>
                                  <th className="px-2 py-2 font-medium">Data</th>
                                </tr>
                              </thead>
                              <tbody>
                                {u.quizzes.map((row, i) => (
                                  <tr key={`${row.slug}-${row.at}-${i}`} className="border-b border-white/5">
                                    <td className="px-2 py-1.5 font-medium text-white/85">{row.slug}</td>
                                    <td className="px-2 py-1.5 tabular-nums text-white/75">
                                      {row.score}/{row.total}{' '}
                                      <span
                                        className={
                                          row.percentage >= 70
                                            ? 'text-emerald-400/90'
                                            : row.percentage >= 50
                                              ? 'text-amber-300/90'
                                              : 'text-rose-400/80'
                                        }
                                      >
                                        ({row.percentage}%)
                                      </span>
                                    </td>
                                    <td className="px-2 py-1.5 text-white/45 whitespace-nowrap">
                                      {new Date(row.at).toLocaleString('pl-PL')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* Content Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Treści
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Artykuły"
              value={stats.articles.total}
              icon={FileText}
              href="/admin/redakcja"
            />
            <StatCard
              title="Wiadomości"
              value={stats.news.totalItems}
              subtitle={`${stats.news.enrichedItems} wzbogaconych, ${stats.news.recentItems} z ostatnich 7 dni`}
              icon={Newspaper}
            />
            <StatCard
              title="Wiadomości kontaktowe"
              value={stats.contact.total}
              subtitle={`${stats.contact.unhandled} nieobsłużonych`}
              icon={Mail}
              href="/admin/kontakt"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
