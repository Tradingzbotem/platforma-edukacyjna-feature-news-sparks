'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

type UserRow = {
  id: string;
  email: string;
  plan: 'free' | 'starter' | 'pro' | 'elite';
  created_at: string;
};

type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  handled: boolean;
  admin_note: string | null;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [busyMsg, setBusyMsg] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ru, rm] = await Promise.all([
          fetch('/api/admin/users', { cache: 'no-store' }),
          fetch('/api/admin/contact', { cache: 'no-store' }),
        ]);
        if (!ru.ok) throw new Error(`HTTP ${ru.status}`);
        if (!rm.ok) throw new Error(`HTTP ${rm.status}`);
        const data = await ru.json();
        const dataM = await rm.json();
        if (!mounted) return;
        setUsers((data?.users ?? []) as UserRow[]);
        setMessages((dataM?.messages ?? []) as ContactMessageRow[]);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać danych admina');
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
      // Success notice with auto-hide
      setNotice(`Zaktualizowano plan użytkownika na ${plan.toUpperCase()}.`);
      window.setTimeout(() => setNotice(null), 3500);
    } catch (e: any) {
      setError(e?.message || 'Zmiana planu nie powiodła się');
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;
  }
  if (error) {
    return <main className="min-h-screen bg-slate-950 text-white p-6">Błąd: {error}</main>;
  }
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panel admina — subskrypcje</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/redakcja"
              className="inline-flex items-center rounded-md bg-white/10 border border-white/15 px-3 py-1.5 text-sm hover:bg-white/15"
            >
              Redakcja
            </Link>
            <Link
              href="/admin/redakcja/media"
              className="inline-flex items-center rounded-md bg-white/10 border border-white/15 px-3 py-1.5 text-sm hover:bg-white/15"
            >
              Media
            </Link>
            <Link
              href="/redakcja"
              className="inline-flex items-center rounded-md bg-white text-slate-900 px-3 py-1.5 text-sm font-semibold hover:opacity-90"
            >
              Zobacz publicznie
            </Link>
          </div>
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
            <div className="col-span-5">E‑mail</div>
            <div className="col-span-3">Plan</div>
            <div className="col-span-4">Akcje</div>
          </div>
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5">
              <div className="col-span-5 break-all">{u.email}</div>
              <div className="col-span-3">
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
              <div className="col-span-4">
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
                  className="ml-2 inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
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

        <h2 className="text-xl font-bold mt-10 mb-4">Wiadomości z kontaktu</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm text-white/70 border-b border-white/10">
            <div className="col-span-3">Od</div>
            <div className="col-span-3">Temat</div>
            <div className="col-span-4">Wiadomość</div>
            <div className="col-span-2">Akcje</div>
          </div>
          {messages.map((m) => (
            <div key={m.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5">
              <div className="col-span-3">
                <div className="font-medium truncate" title={m.name}>{m.name}</div>
                <div className="text-xs text-white/70 break-all">{m.email}</div>
                <div className="text-xs text-white/50">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="col-span-3 break-words">{m.subject}</div>
              <div className="col-span-4 whitespace-pre-wrap break-words text-white/90 max-h-40 overflow-auto">
                {m.message}
              </div>
              <div className="col-span-2 flex items-start gap-2">
                <button
                  onClick={async () => {
                    setBusyMsg(m.id);
                    try {
                      const r = await fetch(`/api/admin/contact/${m.id}`, {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ handled: !m.handled }),
                      });
                      if (!r.ok) throw new Error(`HTTP ${r.status}`);
                      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, handled: !m.handled } : x)));
                    } catch (e: any) {
                      setError(e?.message || 'Nie udało się zaktualizować wiadomości');
                    } finally {
                      setBusyMsg(null);
                    }
                  }}
                  disabled={busyMsg === m.id}
                  className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm disabled:opacity-50 ${
                    m.handled ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {m.handled ? 'Oznacz jako nowe' : 'Oznacz jako przeczytane'}
                </button>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="px-4 py-6 text-white/70 text-sm">Brak wiadomości</div>
          )}
        </div>
      </div>
    </main>
  );
}


