'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';
import { Trophy, Users, TrendingUp, Clock } from 'lucide-react';

type PickRow = {
  user_id: string;
  ticker: string;
  direction: string | null;
  confidence: number | null;
  challenge_key: string | null;
  outcome: string | null;
  xp_awarded: number | null;
  created_at: string;
  settled_at: string | null;
};

type RankingRow = {
  user_id: string;
  total_xp: number;
  trades: number;
};

export default function AdminChallengePage() {
  const [picks, setPicks] = useState<PickRow[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'picks' | 'ranking'>('picks');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch picks
        const picksRes = await fetch('/api/challenge/picks', { cache: 'no-store' });
        if (!picksRes.ok) throw new Error(`HTTP ${picksRes.status}`);
        const picksData = await picksRes.json();
        if (!mounted) return;
        setPicks(Array.isArray(picksData) ? picksData : []);

        // Fetch ranking
        const rankingRes = await fetch('/api/challenge/ranking', { cache: 'no-store' });
        if (!rankingRes.ok) throw new Error(`HTTP ${rankingRes.status}`);
        const rankingData = await rankingRes.json();
        if (!mounted) return;
        setRanking(Array.isArray(rankingData) ? rankingData : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać danych');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;
  if (error) return <main className="min-h-screen bg-slate-950 text-white p-6">Błąd: {error}</main>;

  const stats = {
    totalPicks: picks.length,
    settledPicks: picks.filter(p => p.settled_at).length,
    totalXP: picks.reduce((sum, p) => sum + (p.xp_awarded || 0), 0),
    uniqueUsers: new Set(picks.map(p => p.user_id)).size,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Challenge — Podgląd</h1>
          <p className="mt-2 text-sm text-white/60">
            Przegląd wyborów użytkowników, ranking i statystyki modułu Challenge.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-white/60" />
              <span className="text-sm text-white/70">Użytkownicy</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.uniqueUsers}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-white/60" />
              <span className="text-sm text-white/70">Wszystkie typy</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalPicks}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-white/60" />
              <span className="text-sm text-white/70">Rozliczone</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.settledPicks}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-white/60" />
              <span className="text-sm text-white/70">Suma XP</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalXP}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('picks')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'picks'
                ? 'border-b-2 border-indigo-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Wszystkie typy ({picks.length})
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'ranking'
                ? 'border-b-2 border-indigo-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Ranking ({ranking.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'picks' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Użytkownik</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Ticker</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Kierunek</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Pewność</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Wynik</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">XP</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {picks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-white/60">
                        Brak danych
                      </td>
                    </tr>
                  ) : (
                    picks.map((pick, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white/90">{pick.user_id}</td>
                        <td className="px-4 py-3 text-white/90">{pick.ticker}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              pick.direction === 'up'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : pick.direction === 'down'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {pick.direction === 'up' ? '↑' : pick.direction === 'down' ? '↓' : '↔'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/90">{pick.confidence ?? '—'}%</td>
                        <td className="px-4 py-3">
                          {pick.outcome ? (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                pick.outcome === 'up'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : pick.outcome === 'down'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}
                            >
                              {pick.outcome === 'up' ? '↑' : pick.outcome === 'down' ? '↓' : '↔'}
                            </span>
                          ) : (
                            <span className="text-white/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/90">
                          {pick.xp_awarded !== null ? (
                            <span className="font-semibold text-indigo-300">+{pick.xp_awarded}</span>
                          ) : (
                            <span className="text-white/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-xs">
                          {new Date(pick.created_at).toLocaleString('pl-PL')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Pozycja</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Użytkownik</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Suma XP</th>
                    <th className="px-4 py-3 text-left text-white/70 font-semibold">Typy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {ranking.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-white/60">
                        Brak danych
                      </td>
                    </tr>
                  ) : (
                    ranking.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white/90">
                          <span className="font-semibold">#{i + 1}</span>
                        </td>
                        <td className="px-4 py-3 text-white/90">{row.user_id}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-indigo-300">{row.total_xp}</span>
                        </td>
                        <td className="px-4 py-3 text-white/70">{row.trades}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
