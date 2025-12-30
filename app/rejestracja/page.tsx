'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ──────────────────────────────
   Małe klocki UI (lokalne)
   ────────────────────────────── */
function TopBar() {
  return (
    <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm"
          title="Wróć na stronę główną"
        >
          <span>←</span> Strona główna
        </Link>
        <Link
          href="/kursy"
          className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-sm"
          title="Przejdź do listy kursów"
        >
          Kursy →
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string | null;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && !error ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
      {error ? (
        <div
          className="mt-1 rounded-md border border-rose-400/40 bg-rose-400/10 px-2 py-1.5 text-xs text-rose-200"
          aria-live="polite"
        >
          {error}
        </div>
      ) : null}
    </label>
  );
}

function PasswordMeter({ value }: { value: string }) {
  const score = useMemo(() => {
    let s = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[a-z]/.test(value)) s++;
    if (/\d/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return Math.min(s, 4); // 0..4
  }, [value]);

  const labels = ['Bardzo słabe', 'Słabe', 'Średnie', 'Dobre', 'Świetne'];
  const perc = (score / 4) * 100;

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded bg-white/10 overflow-hidden">
        <div
          className={`h-full ${score < 2 ? 'bg-rose-400' : score < 3 ? 'bg-amber-400' : 'bg-emerald-400'}`}
          style={{ width: `${perc}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-slate-400">{labels[score]}</div>
    </div>
  );
}

/* ──────────────────────────────
   Strona: rejestracja / konto
   ────────────────────────────── */
export default function Page() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [agree, setAgree] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  // Walidacja „w locie”
  const emailError =
    mail.length === 0 ? null : /^\S+@\S+\.\S+$/.test(mail) ? null : 'Podaj poprawny adres e-mail.';
  const passError =
    pass.length === 0
      ? null
      : pass.length < 8
      ? 'Hasło powinno mieć min. 8 znaków.'
      : !/[A-Z]/.test(pass) || !/\d/.test(pass)
      ? 'Dodaj przynajmniej 1 wielką literę i 1 cyfrę.'
      : null;
  const pass2Error = pass2.length === 0 ? null : pass !== pass2 ? 'Hasła się różnią.' : null;

  // ⬇️ ZMIANA: pozwalamy formularzowi wykonać POST do /api/auth/mock-register,
  // ale TYLKO jeśli walidacja przejdzie. W przeciwnym razie blokujemy submit.
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    setErr(null);

    if (!name || !mail || !pass || !pass2) {
      e.preventDefault();
      return setErr('Uzupełnij wszystkie pola.');
    }
    if (emailError) {
      e.preventDefault();
      return setErr(emailError);
    }
    if (passError) {
      e.preventDefault();
      return setErr(passError);
    }
    if (pass2Error) {
      e.preventDefault();
      return setErr(pass2Error);
    }
    if (!agree) {
      e.preventDefault();
      return setErr('Zaznacz zgodę na regulamin.');
    }

    // OK – pozwalamy na domyślne zachowanie przeglądarki:
    // POST → /api/auth/mock-register (ustawi cookies) → 302 → /konto
    setOk(true);
    setLoading(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <TopBar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Kolumna lewa: korzyści / info */}
          <section className="order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl font-bold">Załóż konto</h1>
            <p className="text-white/70 mt-2">
              Dołącz za darmo i odblokuj śledzenie postępów, quizy, checklisty oraz egzamin próbny.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold">Co zyskasz?</h3>
                <ul className="mt-2 list-disc pl-5 text-slate-300 space-y-1">
                  <li>Zapisywanie postępów w kursach i quizach.</li>
                  <li>Pełne wersje ścieżek (np. KNF, CySEC) i materiały do pobrania.</li>
                  <li>Wkrótce: tablica wyników i certyfikaty ukończenia.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold">Bezpieczeństwo</h3>
                <p className="mt-2 text-slate-300 text-sm">
                  Nigdy nie udostępniamy Twoich danych osobom trzecim. Hasła są przechowywane w
                  postaci zaszyfrowanej.
                </p>
              </div>
            </div>
          </section>

          {/* Kolumna prawa: formularz */}
          <section className="order-1 lg:order-2">
            <form
              method="POST"
              action="/api/auth/register"
              onSubmit={submit}
              className="rounded-2xl p-6 bg-white/5 border border-white/10 shadow-xl"
              noValidate
            >
              <Field label="Imię / Nick">
                <input
                  className="mt-1 w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="np. Ania"
                  name="name"             // ⬅️ ważne
                  required
                  aria-invalid={!!err && !name}
                />
              </Field>

              <div className="mt-4">
                <Field label="E-mail" error={emailError}>
                  <input
                    className="mt-1 w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    autoComplete="email"
                    type="email"
                    placeholder="twoj@mail.com"
                    name="email"           // ⬅️ ważne
                    required
                    aria-invalid={!!emailError}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="Hasło"
                  hint="Min. 8 znaków, zalecamy wielkie litery, cyfry i znak specjalny."
                  error={passError}
                >
                  <div className="mt-1 relative">
                    <input
                      className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 pr-10 outline-none focus:border-white/30"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      name="password"       // ⬅️ ważne
                      required
                      aria-invalid={!!passError}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white"
                      aria-label={showPass ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showPass ? 'Ukryj' : 'Pokaż'}
                    </button>
                  </div>
                  <PasswordMeter value={pass} />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Powtórz hasło" error={pass2Error}>
                  <div className="mt-1 relative">
                    <input
                      className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 pr-10 outline-none focus:border-white/30"
                      value={pass2}
                      onChange={(e) => setPass2(e.target.value)}
                      type={showPass2 ? 'text' : 'password'}
                      autoComplete="new-password"
                      name="password2"      // ⬅️ (opcjonalne; dla backendu nieużywane)
                      required
                      aria-invalid={!!pass2Error}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass2((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white"
                      aria-label={showPass2 ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showPass2 ? 'Ukryj' : 'Pokaż'}
                    </button>
                  </div>
                </Field>
              </div>

              <label className="mt-5 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-white"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  name="accept"           // ⬅️ ważne
                  value="1"
                  required
                />
                <span>
                  Akceptuję{' '}
                  <a className="underline hover:no-underline" href="/regulamin">
                    regulamin
                  </a>{' '}
                  i{' '}
                  <a className="underline hover:no-underline" href="/polityka-prywatnosci">
                    politykę prywatności
                  </a>
                  .
                </span>
              </label>

              {err ? (
                <div
                  className="mt-4 rounded-lg p-3 border border-rose-400/40 bg-rose-400/10 text-sm"
                  aria-live="polite"
                >
                  {err}
                </div>
              ) : null}

              {ok ? (
                <div
                  className="mt-4 rounded-lg p-3 border border-emerald-400/40 bg-emerald-400/10 text-sm"
                  aria-live="polite"
                >
                  Konto utworzone! Przekierowuję…
                </div>
              ) : null}

              <button
                disabled={loading}
                className="mt-6 w-full px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-40"
              >
                {loading ? 'Tworzenie konta…' : 'Dołącz za darmo'}
              </button>

              <div className="mt-4 text-sm text-white/70">
                Masz już konto?{' '}
                <Link href="/logowanie" className="hover:underline">
                  Zaloguj się
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
                <span>Potrzebujesz tylko przejrzeć kursy?</span>
                <Link href="/kursy" className="underline hover:no-underline">
                  Przejdź do listy
                </Link>
              </div>
            </form>

            {/* Link powrotu także pod formularzem (dla wygody) */}
            <div className="mt-6">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 inline-flex items-center gap-2"
              >
                ← Strona główna
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
