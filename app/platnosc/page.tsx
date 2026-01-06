'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = useMemo(() => {
    const raw = (searchParams?.get('plan') || '').toLowerCase();
    if (raw === 'starter' || raw === 'pro' || raw === 'elite') return raw as 'starter' | 'pro' | 'elite';
    return 'pro' as const;
  }, [searchParams]);

  // Redirect this placeholder payment page to the contact form
  useEffect(() => {
    const target = `/kontakt?topic=zakup-pakietu&plan=${encodeURIComponent(plan)}`;
    router.replace(target);
  }, [router, plan]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await r.json().catch(() => ({}));
        if (!mounted) return;
        setIsLoggedIn(Boolean(data?.isLoggedIn));
      } catch {
        if (!mounted) return;
        setIsLoggedIn(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-4">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Strona główna
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold">Płatność (mock)</h1>
          <p className="mt-2 text-white/70">
            Wybrany plan: <span className="font-semibold text-white">{plan.toUpperCase()}</span>.
          </p>

          {isLoggedIn === null ? (
            <div className="mt-6 text-white/70">Sprawdzam sesję…</div>
          ) : isLoggedIn ? (
            <div className="mt-6">
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-4">
                <div className="font-semibold text-emerald-200">Jesteś zalogowany.</div>
                <div className="mt-1 text-sm text-emerald-100/80">
                  W tym miejscu podepniemy bramkę płatności i finalizację zakupu.
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  disabled
                  className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold opacity-60 cursor-not-allowed"
                >
                  Zapłać (wkrótce)
                </button>
                <Link
                  href={`/api/auth/mock-login?plan=${encodeURIComponent(plan)}`}
                  className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
                >
                  Aktywuj (mock)
                </Link>
                <Link href="/ebooki#plany" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                  Wróć do planów
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-4">
                <div className="font-semibold text-amber-200">Wymagane logowanie</div>
                <div className="mt-1 text-sm text-amber-100/80">
                  Aby kontynuować, zaloguj się na swoje konto.
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
                  href={`/logowanie?next=${encodeURIComponent(`/platnosc?plan=${plan}`)}`}
                >
                  Przejdź do logowania
                </Link>
                <Link href="/rejestracja" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                  Nie masz konta? Zarejestruj się
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


