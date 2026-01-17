'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();

  // ← domyślny cel po zalogowaniu; nadpisujemy go po montażu jeśli w URL jest ?next=
  const [next, setNext] = useState('/client');
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const n = q.get('next');
      if (n) setNext(n);
    } catch {}
  }, []);

  const [login, setLogin] = useState('');
  const [pass, setPass]   = useState('');
  const [show, setShow]   = useState(false);
  const [err, setErr]     = useState<string | null>(null);
  const [ok, setOk]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(null);

    if (!login || !pass) {
      setErr('Podaj login/e-mail i hasło.');
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`/api/auth/login?next=${encodeURIComponent(next)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ login, password: pass }), // ← WAŻNE: "login", nie "email"
      });

      if (r.ok) {
        let target = next;
        if ((r.headers.get('content-type') || '').includes('application/json')) {
          const data = await r.json().catch(() => ({}));
          if (typeof data?.redirect === 'string') target = data.redirect;
        }
        setOk(true);
        // Użyj pełnego przeładowania strony aby cookie sesji był dostępny i SiteHeader się odświeżył
        window.location.href = target;
        return;
      }

      if (r.status === 401) setErr('Nieprawidłowy login lub hasło.');
      else if (r.status === 405) setErr('Metoda niedozwolona (405) — użyj POST.');
      else {
        const text = await r.text().catch(() => '');
        setErr(`Błąd serwera (${r.status}). ${text}`);
      }
    } catch {
      setErr('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold">Zaloguj się</h1>
        <p className="text-white/70 mt-2">
          Wpisz dane, aby wejść do panelu i kontynuować naukę.
        </p>

        <form onSubmit={submit} className="mt-6 rounded-2xl p-6 bg-white/5 border border-white/10">
          <label className="block text-sm">
            Login lub e-mail
            <input
              className="mt-1 w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              inputMode="email"
              required
            />
          </label>

          <label className="block text-sm mt-4">
            Hasło
            <div className="mt-1 flex">
              <input
                className="flex-1 rounded-l-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                type={show ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="px-3 rounded-r-lg bg-white/10 hover:bg-white/20 border border-l-0 border-white/10 text-sm"
              >
                {show ? 'Ukryj' : 'Pokaż'}
              </button>
            </div>
          </label>

          {err && (
            <div className="mt-4 rounded-lg p-3 border border-red-400/40 bg-red-400/10 text-sm">
              {err}
            </div>
          )}
          {ok && (
            <div className="mt-4 rounded-lg p-3 border border-emerald-400/40 bg-emerald-400/10 text-sm">
              Zalogowano! Przekierowuję…
            </div>
          )}

          <button
            disabled={loading}
            className="mt-6 w-full px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-40"
          >
            {loading ? 'Logowanie…' : 'Zaloguj się'}
          </button>

          <div className="mt-4 text-sm text-white/70 flex items-center justify-between">
            <Link href="/rejestracja" className="hover:underline">
              Nie masz konta? Zarejestruj się
            </Link>
            <span className="opacity-60">Zapomniałeś hasła? (wkrótce)</span>
          </div>
        </form>

        <div className="mt-6">
          <Link href="/" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            ← Strona główna
          </Link>
        </div>
      </div>
    </main>
  );
}
