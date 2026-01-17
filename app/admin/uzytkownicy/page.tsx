'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

type UserRow = {
  id: string;
  email: string;
  plan: 'free' | 'starter' | 'pro' | 'elite';
  created_at: string;
  last_active_at: string | null;
  is_online: boolean;
  decisionLabEnabled?: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/admin/users', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!mounted) return;
        const usersData = (data?.users ?? []) as UserRow[];
        
        // Fetch feature flags for each user
        const usersWithFlags = await Promise.all(
          usersData.map(async (user) => {
            try {
              const flagsRes = await fetch(`/api/admin/feature-flags?userId=${encodeURIComponent(user.id)}`, { cache: 'no-store' });
              if (flagsRes.ok) {
                const flagsData = await flagsRes.json();
                const decisionLabFlag = flagsData.flags?.find((f: any) => f.feature === 'decision_lab');
                return { ...user, decisionLabEnabled: decisionLabFlag?.enabled || false };
              }
            } catch {
              // Ignore errors fetching flags
            }
            return { ...user, decisionLabEnabled: false };
          })
        );
        
        if (!mounted) return;
        setUsers(usersWithFlags);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać użytkowników');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function applyPlan(userId: string, plan: UserRow['plan']) {
    setBusy(userId);
    try {
      const r = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/plan`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        throw new Error(t || `HTTP ${r.status}`);
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
      setNotice(`Zaktualizowano plan użytkownika na ${plan.toUpperCase()}.`);
      window.setTimeout(() => setNotice(null), 3500);
    } catch (e: any) {
      setError(e?.message || 'Zmiana planu nie powiodła się');
    } finally {
      setBusy(null);
    }
  }

  async function toggleFeatureFlag(userId: string, feature: string, enabled: boolean) {
    setBusy(userId);
    try {
      const r = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, feature, enabled }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        throw new Error(t || `HTTP ${r.status}`);
      }
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            if (feature === 'decision_lab') {
              return { ...u, decisionLabEnabled: enabled };
            }
            return u;
          }
          return u;
        })
      );
      setNotice(`Zaktualizowano flagę ${feature} dla użytkownika.`);
      window.setTimeout(() => setNotice(null), 3500);
    } catch (e: any) {
      setError(e?.message || 'Zmiana flagi nie powiodła się');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;
  if (error) return <main className="min-h-screen bg-slate-950 text-white p-6">Błąd: {error}</main>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Użytkownicy — subskrypcje</h1>
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

        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm text-white/70 border-b border-white/10">
            <div className="col-span-4">E‑mail</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-3">Feature flags</div>
            <div className="col-span-3">Akcje</div>
          </div>
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5">
              <div className="col-span-4 break-all">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${u.is_online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`}
                    title={u.is_online ? 'Online' : 'Offline'}
                    aria-label={u.is_online ? 'Online' : 'Offline'}
                  />
                  <span>{u.email}</span>
                </div>
                <div className="mt-1 text-xs text-white/50">
                  Ostatnia aktywność:{' '}
                  {u.last_active_at ? new Date(u.last_active_at).toLocaleString() : '—'}
                </div>
              </div>
              <div className="col-span-2">
                <select
                  value={u.plan}
                  onChange={(e) => {
                    const plan = e.target.value as UserRow['plan'];
                    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, plan } : x)));
                  }}
                  className="rounded-md bg-slate-800 border border-white/10 px-2 py-1 text-sm"
                >
                  <option value="free">FREE</option>
                  <option value="starter">STARTER</option>
                  <option value="pro">PRO</option>
                  <option value="elite">ELITE</option>
                </select>
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={u.decisionLabEnabled || false}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setUsers((prev) =>
                          prev.map((x) => (x.id === u.id ? { ...x, decisionLabEnabled: enabled } : x))
                        );
                        toggleFeatureFlag(u.id, 'decision_lab', enabled);
                      }}
                      disabled={busy === u.id}
                      className="rounded border-white/20 bg-slate-800 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <span className="text-white/80">Decision Lab</span>
                  </label>
                </div>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <Link
                  href={`/admin/uzytkownicy/${encodeURIComponent(u.id)}/aktywnosc`}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                >
                  Aktywność
                </Link>
                <button
                  onClick={() => applyPlan(u.id, u.plan)}
                  disabled={busy === u.id}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  Zapisz
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`Usunąć konto użytkownika ${u.email}? Tej operacji nie można cofnąć.`)) return;
                    setBusy(u.id);
                    try {
                      const r = await fetch(`/api/admin/users/${encodeURIComponent(u.id)}`, { method: 'DELETE' });
                      if (!r.ok) throw new Error(`HTTP ${r.status}`);
                      setUsers((prev) => prev.filter((x) => x.id !== u.id));
                    } catch (e: any) {
                      setError(e?.message || 'Usunięcie konta nie powiodło się');
                    } finally {
                      setBusy(null);
                    }
                  }}
                  disabled={busy === u.id}
                  className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-4 py-6 text-white/70 text-sm">Brak użytkowników</div>
          )}
        </div>
      </div>
    </main>
  );
}


