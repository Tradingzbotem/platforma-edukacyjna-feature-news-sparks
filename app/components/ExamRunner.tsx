"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ExamQuestion = {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation?: string;
};

type Props = {
  /** krótki identyfikator egzaminu; używany tylko w rogu UI */
  slug?: string;
  title: string;
  questions: ExamQuestion[];
  /** ile pytań pokazać w wersji demo (gdy nie PRO) */
  demoLimit?: number;
  /** czy użytkownik ma plan PRO – wtedy pokazujemy pełny test */
  isPro?: boolean;
  /** (opcjonalny) link „Wróć” nad egzaminem oraz pod wynikiem */
  backHref?: string;
};

export default function ExamRunner({
  slug,
  title,
  questions,
  demoLimit = 10,
  isPro = false,
  backHref,
}: Props) {
  const cap = isPro ? questions.length : Math.min(demoLimit, questions.length);
  const visibleQuestions = useMemo(
    () => questions.slice(0, cap),
    [questions, cap]
  );

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);

  const finished = step >= visibleQuestions.length;
  const q = !finished ? visibleQuestions[step] : null;

  const next = () => {
    if (finished) return;
    if (picked === null) return;

    if (!checked) {
      if (q && picked === q.correctIndex) setScore((s) => s + 1);
      setChecked(true);
      return;
    }

    // idziemy dalej
    setPicked(null);
    setChecked(false);
    setStep((s) => Math.min(s + 1, visibleQuestions.length));
  };

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-8 text-white">
      <div className="flex items-center justify-between mb-4">
        {backHref ? (
          <Link href={backHref} className="underline text-sm">
            ← Wróć
          </Link>
        ) : (
          <span />
        )}
        <div className="text-sm text-slate-300">
          {isPro ? "Pełny egzamin" : `Wersja demo (${cap}/${questions.length})`}
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>

      {!isPro && questions.length > (demoLimit ?? 10) && (
        <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-amber-200 text-sm">
          To jest wersja podglądowa. Zaloguj/aktywuj konto, aby odblokować pełny test.
        </div>
      )}

      {!finished ? (
        <section className="mt-6 rounded-2xl bg-[#0b1220] border border-white/10 p-6">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>
              Pytanie {step + 1} z {visibleQuestions.length}
            </span>
            <span>
              Wynik: {score} / {visibleQuestions.length}
            </span>
          </div>

          {q && (
            <>
              <h2 className="mt-3 text-lg font-semibold">{q.question}</h2>

              <div className="mt-4 space-y-2">
                {q.answers.map((a, i) => {
                  const isPicked = picked === i;
                  const isCorrect = checked && i === q.correctIndex;
                  const isWrong = checked && isPicked && i !== q.correctIndex;

                  return (
                    <button
                      key={i}
                      onClick={() => !checked && setPicked(i)}
                      className={`w-full text-left rounded-xl px-3 py-2 border transition
                        ${
                          isCorrect
                            ? "border-emerald-400/60 bg-emerald-500/10"
                            : isWrong
                            ? "border-rose-400/60 bg-rose-500/10"
                            : isPicked
                            ? "border-white/30 bg-white/10"
                            : "border-white/10 hover:bg-white/5"
                        }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>

              {checked && q.explanation && (
                <p className="mt-3 text-sm text-white/80">
                  <span className="font-semibold">Wyjaśnienie: </span>
                  {q.explanation}
                </p>
              )}
            </>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={next}
              disabled={picked === null && !checked}
              className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-40"
            >
              {checked
                ? step + 1 === visibleQuestions.length
                  ? "Zakończ"
                  : "Dalej →"
                : "Sprawdź odpowiedź"}
            </button>
            <div className="text-sm text-slate-400">
              {slug ? slug.toUpperCase() : ""}
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl bg-[#0b1220] border border-white/10 p-6 space-y-3">
          <h2 className="text-xl font-semibold">Wynik</h2>
          <p className="text-white/80">
            {score} / {visibleQuestions.length} poprawnych odpowiedzi (
            {visibleQuestions.length
              ? Math.round((score / visibleQuestions.length) * 100)
              : 0}
            %).
          </p>

          {/* Sync result to server (best-effort) */}
          <SyncResult slug={slug} score={score} total={visibleQuestions.length} />

          {!isPro && questions.length > (demoLimit ?? 10) && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-200 text-sm">
              Chcesz pełny test z omówieniami? Zaloguj się / aktywuj konto, a
              następnie uruchom egzamin w trybie PRO.
            </div>
          )}

          <div className="pt-2">
            {backHref && (
              <Link
                href={backHref}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                ← Wróć do ścieżki
              </Link>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function SyncResult({ slug, score, total }: { slug?: string; score: number; total: number }) {
  // post-render, fire-and-forget
  if (!slug) return null;
  try {
    fetch('/api/progress/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, score, total }),
    });
  } catch {}
  return null;
}
