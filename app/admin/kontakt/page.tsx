'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';

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

export default function AdminKontaktPage() {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyMsg, setBusyMsg] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/admin/contact', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!mounted) return;
        setMessages((data?.messages ?? []) as ContactMessageRow[]);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać wiadomości');
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <h1 className="text-2xl font-bold mb-6">Wiadomości z kontaktu</h1>

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
                <button
                  onClick={async () => {
                    if (!window.confirm('Usunąć tę wiadomość? Tej operacji nie można cofnąć.')) return;
                    setBusyMsg(m.id);
                    try {
                      const r = await fetch(`/api/admin/contact/${m.id}`, { method: 'DELETE' });
                      if (!r.ok) throw new Error(`HTTP ${r.status}`);
                      setMessages((prev) => prev.filter((x) => x.id !== m.id));
                    } catch (e: any) {
                      setError(e?.message || 'Nie udało się usunąć wiadomości');
                    } finally {
                      setBusyMsg(null);
                    }
                  }}
                  disabled={busyMsg === m.id}
                  className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm disabled:opacity-50 bg-rose-600 text-white hover:bg-rose-500"
                >
                  Usuń
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


