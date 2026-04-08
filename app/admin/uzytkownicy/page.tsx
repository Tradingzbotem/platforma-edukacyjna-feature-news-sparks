'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import BackButton from '@/components/BackButton';
import AdminFoundersModal from './AdminFoundersModal';
import {
  panelTierToDbPlan,
  panelUserTierFromDbPlan,
  type PanelUserTier,
} from '@/lib/client/panelTier';

type UserRow = {
  id: string;
  email: string;
  plan: 'free' | 'starter' | 'pro' | 'elite';
  created_at: string;
  last_active_at: string | null;
  is_online: boolean;
  decisionLabEnabled?: boolean;
  briefDecisionEnabled?: boolean;
  certificationAccessEnabled?: boolean;
};

type Banner = { kind: 'ok' | 'err'; text: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPlanFor, setSavingPlanFor] = useState<string | null>(null);
  const [togglingFlagFor, setTogglingFlagFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [foundersModalUser, setFoundersModalUser] = useState<UserRow | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/admin/users', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!mounted) return;
        const usersData = (data?.users ?? []) as UserRow[];

        const usersWithFlags = await Promise.all(
          usersData.map(async (user) => {
            try {
              const flagsRes = await fetch(`/api/admin/feature-flags?userId=${encodeURIComponent(user.id)}`, {
                cache: 'no-store',
              });
              if (flagsRes.ok) {
                const flagsData = await flagsRes.json();
                const decisionLabFlag = flagsData.flags?.find((f: { feature: string }) => f.feature === 'decision_lab');
                const briefDecisionFlag = flagsData.flags?.find((f: { feature: string }) => f.feature === 'brief_decision');
                const certificationFlag = flagsData.flags?.find(
                  (f: { feature: string }) => f.feature === 'certification_access',
                );
                return {
                  ...user,
                  decisionLabEnabled: decisionLabFlag?.enabled || false,
                  briefDecisionEnabled: briefDecisionFlag?.enabled || false,
                  certificationAccessEnabled: certificationFlag?.enabled || false,
                };
              }
            } catch {
              // ignore
            }
            return {
              ...user,
              decisionLabEnabled: false,
              briefDecisionEnabled: false,
              certificationAccessEnabled: false,
            };
          }),
        );

        if (!mounted) return;
        setUsers(usersWithFlags);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Nie udało się pobrać użytkowników');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function showBanner(kind: Banner['kind'], text: string) {
    setBanner({ kind, text });
    window.setTimeout(() => setBanner(null), kind === 'ok' ? 2800 : 5000);
  }

  async function savePlanAuto(userId: string, tier: PanelUserTier) {
    const newPlan = panelTierToDbPlan(tier);
    const prev = users.find((u) => u.id === userId);
    const previousPlan = prev?.plan ?? 'free';

    setUsers((list) => list.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u)));
    setSavingPlanFor(userId);
    try {
      const r = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/plan`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        throw new Error(t || `HTTP ${r.status}`);
      }
      showBanner('ok', 'Zapisano plan dostępu.');
    } catch (e: unknown) {
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, plan: previousPlan } : u)));
      showBanner('err', e instanceof Error ? e.message : 'Nie udało się zapisać planu.');
    } finally {
      setSavingPlanFor(null);
    }
  }

  async function toggleFeatureFlag(userId: string, feature: string, enabled: boolean) {
    setTogglingFlagFor(userId);
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
          if (u.id !== userId) return u;
          if (feature === 'decision_lab') return { ...u, decisionLabEnabled: enabled };
          if (feature === 'brief_decision') return { ...u, briefDecisionEnabled: enabled };
          if (feature === 'certification_access') return { ...u, certificationAccessEnabled: enabled };
          return u;
        }),
      );
      showBanner('ok', `Zaktualizowano flagę „${feature}”.`);
    } catch (e: unknown) {
      showBanner('err', e instanceof Error ? e.message : 'Zmiana flagi nie powiodła się');
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (feature === 'decision_lab') return { ...u, decisionLabEnabled: !enabled };
          if (feature === 'brief_decision') return { ...u, briefDecisionEnabled: !enabled };
          if (feature === 'certification_access') return { ...u, certificationAccessEnabled: !enabled };
          return u;
        }),
      );
    } finally {
      setTogglingFlagFor(null);
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;
  if (error) return <main className="min-h-screen bg-slate-950 text-white p-6">Błąd: {error}</main>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Użytkownicy</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/50">
            Dostęp do centrum decyzji i widoku NFT w panelu klienta wynika z{' '}
            <span className="text-white/70">planu konta</span> (kolumna „Plan dostępu”). Osobno możesz nadać rekord{' '}
            <span className="text-white/70">Founders w bazie</span> (członkostwo półmanualne, bez portfela). Feature flags
            są jeszcze innym mechanizmem.
          </p>
        </div>

        {banner && (
          <div
            className={`mb-4 flex items-start justify-between gap-4 rounded-md border px-4 py-3 text-sm ${
              banner.kind === 'ok'
                ? 'border-emerald-300/30 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-300/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            <div>{banner.text}</div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="rounded-md px-2 py-0.5 opacity-80 hover:opacity-100"
              aria-label="Zamknij"
            >
              ×
            </button>
          </div>
        )}

        {foundersModalUser ? (
          <AdminFoundersModal
            userId={foundersModalUser.id}
            email={foundersModalUser.email}
            open={!!foundersModalUser}
            onClose={() => setFoundersModalUser(null)}
            onSaved={(msg) => showBanner('ok', msg)}
          />
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm border-b border-white/10 bg-white/[0.03]">
            <div className="col-span-12 sm:col-span-3 font-medium text-white/80">E‑mail</div>
            <div className="col-span-12 sm:col-span-3">
              <div className="font-medium text-white/80">Plan dostępu</div>
              <p className="mt-1 text-[10px] font-normal leading-snug text-white/40">
                <span className="text-white/55">Free</span> — brak centrum decyzji.{' '}
                <span className="text-white/55">Founders</span> — centrum decyzji (NFT).{' '}
                <span className="text-white/55">Elite</span> — rozszerzony dostęp. Zapisuje się automatycznie po zmianie.
              </p>
            </div>
            <div className="col-span-12 sm:col-span-3">
              <div className="font-medium text-white/80">Feature flags</div>
              <p className="mt-1 text-[10px] font-normal leading-snug text-white/40">
                Osobno od planu — nie steruje centrum decyzji w FXEDULAB.
              </p>
            </div>
            <div className="col-span-12 sm:col-span-3 font-medium text-white/80">Akcje</div>
          </div>

          {users.map((u) => {
            const saving = savingPlanFor === u.id;
            const flagBusy = togglingFlagFor === u.id;
            const delBusy = deletingId === u.id;

            return (
              <div
                key={u.id}
                className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-white/5 last:border-b-0 items-start"
              >
                <div className="col-span-12 sm:col-span-3 break-all">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${u.is_online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`}
                      title={u.is_online ? 'Online' : 'Offline'}
                      aria-label={u.is_online ? 'Online' : 'Offline'}
                    />
                    <span>{u.email}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    Ostatnia aktywność: {u.last_active_at ? new Date(u.last_active_at).toLocaleString() : '—'}
                  </div>
                  {(u.plan === 'starter' || u.plan === 'pro') && (
                    <div className="mt-1 text-[10px] text-white/35">
                      W bazie: <span className="text-white/45">{u.plan}</span>
                      {u.plan === 'starter' ? ' (Founders)' : ' (legacy → widok jak Founders)'}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-3">
                  <div className="flex items-center gap-2 max-w-[260px]">
                    <select
                      value={panelUserTierFromDbPlan(u.plan)}
                      disabled={saving}
                      onChange={(e) => {
                        const tier = e.target.value as PanelUserTier;
                        void savePlanAuto(u.id, tier);
                      }}
                      className="min-w-0 flex-1 rounded-md bg-slate-800 border border-white/10 px-2 py-2 text-sm disabled:opacity-60"
                      aria-label={`Plan dostępu dla ${u.email}`}
                    >
                      <option value="free">Free</option>
                      <option value="founders">Founders (centrum decyzji)</option>
                      <option value="elite">Elite</option>
                    </select>
                    {saving ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/50" aria-label="Zapisywanie" />
                    ) : null}
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-3 flex flex-col gap-2.5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={u.decisionLabEnabled || false}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setUsers((prev) =>
                          prev.map((x) => (x.id === u.id ? { ...x, decisionLabEnabled: enabled } : x)),
                        );
                        void toggleFeatureFlag(u.id, 'decision_lab', enabled);
                      }}
                      disabled={flagBusy || saving}
                      className="rounded border-white/20 bg-slate-800 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <span>{flagBusy ? '…' : 'Decision Lab'}</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={u.briefDecisionEnabled || false}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setUsers((prev) =>
                          prev.map((x) => (x.id === u.id ? { ...x, briefDecisionEnabled: enabled } : x)),
                        );
                        void toggleFeatureFlag(u.id, 'brief_decision', enabled);
                      }}
                      disabled={flagBusy || saving}
                      className="rounded border-white/20 bg-slate-800 text-violet-500 focus:ring-violet-500 disabled:opacity-50"
                    />
                    <span>{flagBusy ? '…' : 'Brief decyzyjny'}</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={u.certificationAccessEnabled || false}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setUsers((prev) =>
                          prev.map((x) => (x.id === u.id ? { ...x, certificationAccessEnabled: enabled } : x)),
                        );
                        void toggleFeatureFlag(u.id, 'certification_access', enabled);
                      }}
                      disabled={flagBusy || saving}
                      className="rounded border-white/20 bg-slate-800 text-amber-400 focus:ring-amber-500 disabled:opacity-50"
                    />
                    <span>{flagBusy ? '…' : 'Moduł certyfikatu'}</span>
                  </label>
                </div>

                <div className="col-span-12 sm:col-span-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/uzytkownicy/${encodeURIComponent(u.id)}/aktywnosc`}
                    className="inline-flex items-center rounded-md bg-slate-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-600 border border-white/10"
                  >
                    Podgląd aktywności
                  </Link>
                  <button
                    type="button"
                    onClick={() => setFoundersModalUser(u)}
                    disabled={saving || delBusy}
                    className="inline-flex items-center rounded-md bg-amber-700/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 border border-white/10 disabled:opacity-50"
                  >
                    Founders
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Usunąć konto użytkownika ${u.email}? Tej operacji nie można cofnąć.`)) return;
                      setDeletingId(u.id);
                      try {
                        const r = await fetch(`/api/admin/users/${encodeURIComponent(u.id)}`, { method: 'DELETE' });
                        if (!r.ok) throw new Error(`HTTP ${r.status}`);
                        setUsers((prev) => prev.filter((x) => x.id !== u.id));
                        showBanner('ok', 'Konto usunięte.');
                      } catch (e: unknown) {
                        showBanner('err', e instanceof Error ? e.message : 'Usunięcie nie powiodło się');
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={delBusy || saving}
                    className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                  >
                    {delBusy ? '…' : 'Usuń konto'}
                  </button>
                </div>
              </div>
            );
          })}

          {users.length === 0 && <div className="px-4 py-6 text-white/70 text-sm">Brak użytkowników</div>}
        </div>
      </div>
    </main>
  );
}
