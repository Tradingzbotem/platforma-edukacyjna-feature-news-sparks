'use client';

import ExamCTA from '../../../components/ExamCTA';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LESSONS } from './data';

const AUTH_KEY = 'auth:pro';
const PROGRESS_KEY = 'course:egz:cysec:done';

/** Minimalny typ lekcji – dokładnie te pola są używane przez widok */
type LessonItem = {
  id: string;
  title: string;
  minutes?: number;
  free?: boolean;
  content?: ReactNode | string;
};

// Informujemy TS, jakich pól oczekujemy (dane pozostają bez zmian)
const LESSON_LIST = LESSONS as unknown as LessonItem[];

function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-[#0b1220] border border-white/10 p-6 ${className}`}>
      {children}
    </section>
  );
}

function Lock({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
      <div className="text-3xl">🔒</div>
      <p className="mt-2 text-slate-200">Dostęp po zalogowaniu.</p>
      <div className="mt-3 flex gap-3">
        <Link
          href="/logowanie"
          className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
        >
          Zaloguj / Zarejestruj
        </Link>
        <button
          onClick={() => {
            localStorage.setItem(AUTH_KEY, '1');
            location.reload();
          }}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
          title="Przycisk testowy w dev"
        >
          Odblokuj (DEV)
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const firstId = LESSON_LIST[0]?.id ?? 'intro';
  const [pro, setPro] = useState(false);
  const [active, setActive] = useState<string>(firstId);
  const [done, setDone] = useState<string[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Sprawdź autoryzację po stronie klienta
  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) {
          if (isActive) router.push('/logowanie');
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!Boolean((data as any)?.isLoggedIn)) {
          if (isActive) router.push('/logowanie');
          return;
        }
        if (isActive) setIsAuthChecked(true);
      } catch {
        if (isActive) router.push('/logowanie');
      }
    })();
    return () => { isActive = false; };
  }, [router]);

  useEffect(() => {
    setPro(localStorage.getItem(AUTH_KEY) === '1');
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignorujemy błędy parsowania z localStorage (dev)
    }
  }, []);

  // Wszystkie hooki muszą być przed warunkowym returnem
  const l =
    useMemo(() => LESSON_LIST.find((x) => x.id === active) ?? LESSON_LIST[0], [active]) ??
    { id: 'intro', title: 'Wprowadzenie', minutes: 0, free: true, content: null };

  const locked = false; // Odblokowane - wszystkie treści dostępne po zalogowaniu

  const progress = useMemo(() => {
    const total = LESSON_LIST.length || 1;
    return Math.round((done.length / total) * 100);
  }, [done]);

  const toggleDone = () => {
    const next = done.includes(l.id)
      ? done.filter((x) => x !== l.id)
      : Array.from(new Set([...done, l.id]));
    setDone(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  };

  if (!isAuthChecked) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">Sprawdzanie dostępu...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-6 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/kursy" className="text-sm underline">
            ← Wróć do kursów
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">CySEC — ścieżka nauki</h1>
          <p className="text-slate-300">CIF, marketing, ochrona klienta, cross-border.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-300">Postęp</div>
          <div className="mt-1 w-48 h-2 rounded bg-white/10 overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <div className="mt-1 text-sm text-slate-300">{Math.min(100, progress)}%</div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <h2 className="text-lg font-semibold">Program kursu</h2>
          <ul className="mt-4 space-y-2">
            {LESSON_LIST.map((m) => {
              const act = m.id === active;
              const isDone = done.includes(m.id);
              return (
                <li key={m.id}>
                  <button
                    onClick={() => setActive(m.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 border transition-all duration-200 ${
                      act ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{m.title}</span>
                      </div>
                      <span className="text-xs text-slate-300">
                        {m.minutes ?? '—'} min {isDone ? '• ✓' : ''}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="relative">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{l.title}</h2>
                <p className="text-slate-400 text-sm">
                  <span>Szacowany czas:</span> <span>{l.minutes ?? 0}</span> <span>min</span>
                </p>
              </div>
              <button
                onClick={toggleDone}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  done.includes(l.id)
                    ? 'bg-green-400 text-slate-900 hover:opacity-90'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {done.includes(l.id) ? '✓ Ukończono' : 'Oznacz jako ukończone'}
              </button>
            </div>
            <div className="mt-4">{l.content ?? null}</div>
            <Lock show={locked} />
          </Card>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold">Materiały</h3>
              <ul className="mt-2 list-disc pl-6 text-slate-300">
                <li>
                  <a href="/materialy/cysec/circulars-podsumowanie.pdf" target="_blank" rel="noreferrer">
                    Circulars — podsumowanie (PDF)
                  </a>
                </li>
                <li>
                  <a href="/materialy/cysec/wytyczne-marketing-cfd.pdf" target="_blank" rel="noreferrer">
                    Wytyczne marketing. CFD (PDF)
                  </a>
                </li>
                <li>
                  <a href="/materialy/cysec/lista-kontroli-compliance.docx" target="_blank" rel="noreferrer">
                    Lista kontroli (DOCX)
                  </a>
                </li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">Egzamin próbny</h3>
              <p className="text-slate-300">20 pytań z case’ami marketing/compliance.</p>
              <div className="mt-3">
                <Link
                  href="/kursy/egzaminy/cysec/egzamin"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 inline-block"
                >
                  Uruchom test
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ExamCTA slug="cysec" />
      </div>
    </main>
  );
}
