'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { Users, BookOpen, HelpCircle, Newspaper, FileText, Mail, TrendingUp, Activity } from 'lucide-react';

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
