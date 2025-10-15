'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LESSONS /*, type Lesson */ } from './data';
import ExamCTA from '../../../../components/ExamCTA';

// Klucze do localStorage (dev/demo)
const AUTH_KEY = 'auth:pro';
const PROGRESS_KEY = 'course:egz:knf:done';

/** Minimalny typ lekcji zgodny z tym, czego używa ten widok */
type LessonItem = {
  id: string;
  title: string;
  minutes?: number;
  free?: boolean;
  content?: ReactNode | string;
};

// Rzutujemy importowane LESSONS na lokalny typ używany w widoku.
// (Nie zmienia to danych – tylko informujemy TS, jakie pola wykorzystujemy)
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

function LockOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
      <div className="text-3xl">🔒</div>
      <p className="mt-2 text-center text-slate-200">
        Moduł dostępny po zalogowaniu / aktywacji konta.
      </p>
      <div className="mt-3 flex gap-3">
        <Link
          href="/konto"
          className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
        >
          Zarejestruj się / Zaloguj
        </Link>
        <button
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
          onClick={() => {
            localStorage.setItem(AUTH_KEY, '1');
            location.reload();
          }}
          title="Przycisk testowy w dev"
        >
          Odblokuj (DEV)
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const firstId = LESSON_LIST[0]?.id ?? 'intro';
  const [isPro, setIsPro] = useState(false);
  const [active, setActive] = useState<string>(firstId);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setIsPro(localStorage.getItem(AUTH_KEY) === '1');
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignorujemy błędy parsowania z localStorage (dev)
    }
  }, []);

  const activeLesson =
    useMemo(() => LESSON_LIST.find((l) => l.id === active) ?? LESSON_LIST[0], [active]) ??
    { id: 'intro', title: 'Wprowadzenie', minutes: 0, free: true, content: null };

  const locked = !isPro && !activeLesson.free;

  const progress = useMemo(() => {
    const total = LESSON_LIST.length || 1;
    return Math.round((done.length / total) * 100);
  }, [done]);

  const toggleDone = () => {
    const id = activeLesson.id;
    const exists = done.includes(id);
    const next = exists ? done.filter((x) => x !== id) : Array.from(new Set([...done, id]));
    setDone(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  };

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/kursy" className="text-sm underline">
            ← Wróć do kursów
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">KNF — ścieżka nauki</h1>
          <p className="text-slate-300">Preview + pełny dostęp po rejestracji.</p>
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
        {/* Syllabus */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Program kursu</h2>
            {!isPro && (
              <span className="text-xs rounded bg-amber-500/20 border border-amber-400/30 px-2 py-1 text-amber-200">
                Tryb podglądu
              </span>
            )}
          </div>

          <ul className="mt-4 space-y-2">
            {LESSON_LIST.map((l) => {
              const isActive = l.id === active;
              const isLocked = !isPro && !l.free;
              const isDone = done.includes(l.id);
              return (
                <li key={l.id}>
                  <button
                    onClick={() => setActive(l.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 border transition
                      ${
                        isActive
                          ? 'bg-white text-slate-900 border-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{l.title}</span>
                        {isLocked && (
                          <span title="Zablokowane" className="text-xs">
                            🔒
                          </span>
                        )}
                        {l.free && (
                          <span className="text-xs rounded bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 text-emerald-200">
                            preview
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300">
                        {l.minutes ?? '—'} min {isDone ? '• ✓' : ''}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {!isPro && (
            <div className="mt-4 space-y-2">
              <Link
                href="/konto"
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Zarejestruj się i odblokuj pełną ścieżkę
              </Link>
              <button
                onClick={() => {
                  localStorage.setItem(AUTH_KEY, '1');
                  setIsPro(true);
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                title="Przycisk testowy w dev"
              >
                Odblokuj (DEV)
              </button>
            </div>
          )}
        </Card>

        {/* Treść modułu */}
        <div className="relative">
          <Card className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{activeLesson.title}</h2>
                <p className="text-slate-400 text-sm">
                  Szacowany czas: {activeLesson.minutes ?? 0} min
                </p>
              </div>
              <button
                onClick={toggleDone}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  done.includes(activeLesson.id)
                    ? 'bg-green-400 text-slate-900 hover:opacity-90'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {done.includes(activeLesson.id) ? '✓ Ukończono' : 'Oznacz jako ukończone'}
              </button>
            </div>

            <div className="mt-4">{activeLesson.content ?? null}</div>

            <LockOverlay show={locked} />
          </Card>

          {/* Dodatki pod modułem */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold">Materiały do pobrania</h3>
              <ul className="mt-2 list-disc pl-6 text-slate-300">
                <li>
                  <a
                    href="/materialy/knf/checklista-best-execution.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Checklista Best Execution (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="/materialy/knf/notatki-mifid.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Notatki MiFID II (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="/materialy/knf/sciaga-powtorkowa.docx"
                    target="_blank"
                    rel="noreferrer"
                  >
                    „Ściąga” do powtórek (DOCX)
                  </a>
                </li>
              </ul>
              <p className="text-slate-400 text-sm mt-2">*część materiałów tylko dla kont PRO.</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">Egzamin próbny</h3>
              <p className="text-slate-300">20 pytań jednokrotnego wyboru + wyjaśnienia.</p>
              <div className="mt-3">
                <Link
                  href="/kursy/egzaminy/knf/egzamin"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 inline-block"
                >
                  Uruchom test
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <nav className="mt-8 flex items-center justify-between">
        <Link href="/kursy" className="underline">
          ← Wróć do kursów
        </Link>
        <div className="flex gap-4">
          <Link href="/kursy/egzaminy/przewodnik" className="underline">
            Przewodnik: KNF/ESMA/MiFID
          </Link>
          <Link href="/kursy/egzaminy/cysec" className="underline">
            CySEC — ścieżka nauki
          </Link>
        </div>
      </nav>
      <ExamCTA slug="knf" />
    </main>
  );
}
