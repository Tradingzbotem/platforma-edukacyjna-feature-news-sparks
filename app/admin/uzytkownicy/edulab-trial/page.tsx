'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { Clock, CheckCircle2, XCircle, Loader2, Trash2, Play, Square } from 'lucide-react';

type Trial = {
  user_id: string;
  email: string;
  requested_at: string;
  started_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  original_plan: string | null;
  created_at: string;
  days_elapsed: number | null;
};

export default function EdulabTrialPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/admin/trial/elite/list', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!mounted) return;
        if (data.ok) {
          setTrials(data.trials || []);
        } else {
          setError(data.error || 'Nie udało się pobrać trialów');
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Błąd połączenia');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleActivate = async (userId: string) => {
    setBusy(userId);
    setError(null);
    try {
      const r = await fetch('/api/admin/trial/elite/activate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || `HTTP ${r.status}`);
      }
      setNotice('Trial został aktywowany');
      window.setTimeout(() => setNotice(null), 3500);
      // Refresh list
      const listRes = await fetch('/api/admin/trial/elite/list', { cache: 'no-store' });
      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.ok) {
          setTrials(listData.trials || []);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Nie udało się aktywować trialu');
    } finally {
      setBusy(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Czy na pewno chcesz wyłączyć trial dla tego użytkownika?')) return;
    setBusy(userId);
    setError(null);
    try {
      const r = await fetch('/api/admin/trial/elite/deactivate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || `HTTP ${r.status}`);
      }
      setNotice('Trial został wyłączony');
      window.setTimeout(() => setNotice(null), 3500);
      // Refresh list
      const listRes = await fetch('/api/admin/trial/elite/list', { cache: 'no-store' });
      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.ok) {
          setTrials(listData.trials || []);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Nie udało się wyłączyć trialu');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę prośbę o trial?')) return;
    setBusy(userId);
    setError(null);
    try {
      const r = await fetch(`/api/admin/trial/elite/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || `HTTP ${r.status}`);
      }
      setNotice('Prośba została usunięta');
      window.setTimeout(() => setNotice(null), 3500);
      // Refresh list
      const listRes = await fetch('/api/admin/trial/elite/list', { cache: 'no-store' });
      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.ok) {
          setTrials(listData.trials || []);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Nie udało się usunąć prośby');
    } finally {
      setBusy(null);
    }
  };

  const getStatusBadge = (trial: Trial) => {
    if (trial.is_active && trial.started_at) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-200 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-emerald-400/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aktywny {trial.days_elapsed !== null ? `(${trial.days_elapsed} dni)` : ''}
        </span>
      );
    }
    if (trial.started_at && trial.expires_at) {
      const expiresAt = new Date(trial.expires_at);
      const now = new Date();
      if (now >= expiresAt) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/20 text-slate-300 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-slate-400/30">
            <XCircle className="h-3.5 w-3.5" />
            Wygasł
          </span>
        );
      }
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 text-yellow-200 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-yellow-400/30">
        <Clock className="h-3.5 w-3.5" />
        Oczekuje
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 text-white/70">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Ładowanie…</span>
          </div>
        </div>
      </main>
    );
  }

  if (error && trials.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-rose-400">Błąd: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Darmowe Edulab 7 dni</h1>
            <p className="mt-1 text-sm text-white/60">
              Zarządzanie prośbami o 7-dniowy trial pakietu Elite
            </p>
          </div>
          <Link
            href="/admin/uzytkownicy"
            className="inline-flex items-center rounded-md bg-white/10 text-white px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
          >
            Wróć do użytkowników
          </Link>
        </div>

        {notice && (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm">
            <div>{notice}</div>
            <button
              onClick={() => setNotice(null)}
              className="rounded-md px-2 py-0.5 text-emerald-200/80 hover:text-emerald-100 hover:bg-emerald-500/10"
              aria-label="Zamknij powiadomienie"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm text-white/70 border-b border-white/10">
            <div className="col-span-3">E‑mail</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Data prośby</div>
            <div className="col-span-2">Data włączenia</div>
            <div className="col-span-1">Dni</div>
            <div className="col-span-2">Akcje</div>
          </div>
          {trials.length === 0 ? (
            <div className="px-4 py-6 text-white/70 text-sm text-center">
              Brak prośb o trial
            </div>
          ) : (
            trials.map((trial) => (
              <div key={trial.user_id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5">
                <div className="col-span-3 break-all text-sm">
                  {trial.email || trial.user_id}
                </div>
                <div className="col-span-2">
                  {getStatusBadge(trial)}
                </div>
                <div className="col-span-2 text-xs text-white/60">
                  {trial.requested_at ? new Date(trial.requested_at).toLocaleString('pl-PL') : '—'}
                </div>
                <div className="col-span-2 text-xs text-white/60">
                  {trial.started_at ? new Date(trial.started_at).toLocaleString('pl-PL') : '—'}
                </div>
                <div className="col-span-1 text-xs text-white/60">
                  {trial.days_elapsed !== null ? `${trial.days_elapsed}` : '—'}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {!trial.is_active && !trial.started_at && (
                    <button
                      onClick={() => handleActivate(trial.user_id)}
                      disabled={busy === trial.user_id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                      title="Włącz trial"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Włącz
                    </button>
                  )}
                  {trial.is_active && (
                    <button
                      onClick={() => handleDeactivate(trial.user_id)}
                      disabled={busy === trial.user_id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 disabled:opacity-50"
                      title="Wyłącz trial"
                    >
                      <Square className="h-3.5 w-3.5" />
                      Wyłącz
                    </button>
                  )}
                  {(!trial.is_active || (trial.started_at && trial.expires_at && new Date(trial.expires_at) < new Date())) && (
                    <button
                      onClick={() => handleDelete(trial.user_id)}
                      disabled={busy === trial.user_id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
                      title="Usuń prośbę"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
