'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LessonQuizQ } from '@/data/lessons';
import { useLessonProgressSession } from '@/app/contexts/LessonProgressSessionContext';
import {
  LESSON_PROGRESS_DONE,
  readLessonProgressValue,
  writeLessonProgressValue,
} from '@/lib/lessonProgressStorage';

function shuffledIndexes(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function LessonQuiz({
  course,
  lessonId,
  title,
  questions,
}: {
  course: string;
  lessonId: string;
  title: string;
  questions: LessonQuizQ[];
}) {
  const { userId, sessionReady } = useLessonProgressSession();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!sessionReady || typeof window === 'undefined') return;
    const v = readLessonProgressValue(localStorage, course, lessonId, userId);
    setDone(v === LESSON_PROGRESS_DONE);
  }, [course, lessonId, userId, sessionReady]);

  // Zbuduj układ wyświetlania (mieszanie opcji) – stabilny w trakcie życia komponentu
  const layout = useMemo(() => {
    return questions.map(q => {
      const order = shuffledIndexes(q.options.length);
      const correctDisplayIndex = order.indexOf(q.correctIndex);
      return { order, correctDisplayIndex };
    });
  }, [questions]);

  const score = useMemo(() => {
    return questions.reduce((acc, q, i) => {
      const sel = answers[q.id];
      if (typeof sel !== 'number') return acc;
      return acc + (sel === layout[i].correctDisplayIndex ? 1 : 0);
    }, 0);
  }, [answers, questions, layout]);

  function finish() {
    setSubmitted(true);
    const allAnswered = Object.keys(answers).length === questions.length;
    /** ≥70% poprawnych (minimum 1), wszystkie pytania muszą mieć odpowiedź — sensowny próg dla /kursy. */
    const passAt = Math.max(1, Math.round(questions.length * 0.7));
    if (allAnswered && score >= passAt) {
      try {
        writeLessonProgressValue(localStorage, course, lessonId, userId, LESSON_PROGRESS_DONE);
      } catch {
        /* ignore */
      }
      setDone(true);
      try {
        fetch('/api/progress/lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course, lessonId, done: true }),
        });
      } catch {}
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#101a2e]/90 to-[#0b1220]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-8">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-300/90">Sprawdź wiedzę</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">{title}</h3>
        </div>
        {done ? (
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
            Ukończono ✓
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
          >
            <p className="font-medium leading-snug text-slate-100">
              <span className="mr-2 font-semibold text-indigo-300/90">{i + 1}.</span>
              {q.question}
            </p>
            <div className="mt-4 grid gap-2">
              {layout[i].order.map((origIdx, displayIdx) => {
                const picked = answers[q.id] === displayIdx;
                const correct = submitted && layout[i].correctDisplayIndex === displayIdx;
                const wrong = submitted && picked && !correct;
                return (
                  <button
                    key={displayIdx}
                    type="button"
                    className={[
                      'rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                      'border-white/15 bg-white/5 text-slate-200 hover:border-white/25 hover:bg-white/[0.08]',
                      picked && !submitted ? 'border-indigo-400/50 bg-indigo-500/15 ring-1 ring-indigo-400/30' : '',
                      correct ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100' : '',
                      wrong ? 'border-red-500/50 bg-red-500/10 text-red-100' : '',
                      submitted ? 'cursor-default' : '',
                    ].join(' ')}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: displayIdx }))}
                    disabled={submitted}
                  >
                    {q.options[origIdx]}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{q.explanation}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {!submitted ? (
          <button
            type="button"
            onClick={finish}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-opacity hover:opacity-90"
          >
            Sprawdź wynik
          </button>
        ) : (
          <>
            <div className="text-sm text-slate-300">
              Wynik:{' '}
              <span className="font-semibold text-white">
                {score}/{questions.length}
              </span>
              {(() => {
                const passAt = Math.max(1, Math.round(questions.length * 0.7));
                if (score >= passAt) return null;
                return (
                  <span className="mt-1 block text-xs text-slate-500">
                    Do ukończenia lekcji potrzeba co najmniej {passAt}/{questions.length} poprawnych odpowiedzi.
                  </span>
                );
              })()}
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Jeszcze raz
            </button>
          </>
        )}
      </div>
    </section>
  );
}
