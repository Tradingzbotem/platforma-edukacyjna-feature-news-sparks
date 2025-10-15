'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LessonQuizQ } from '@/data/lessons';

function storageKey(course: string, id: string) {
  return `progress:${course}:${id}`;
}

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
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(storageKey(course, lessonId));
    setDone(v === '1');
  }, [course, lessonId]);

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
    if (Object.keys(answers).length === questions.length &&
        score === questions.length) {
      localStorage.setItem(storageKey(course, lessonId), '1');
      setDone(true);
      // Best-effort: inform server about lesson completion
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
    <section className="mt-10 rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {done && <span className="text-xs rounded-full border px-2 py-0.5">Ukończono ✅</span>}
      </div>

      <div className="mt-4 grid gap-4">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-xl border p-4">
            <p className="font-medium">{i + 1}. {q.question}</p>
            <div className="mt-3 grid gap-2">
              {layout[i].order.map((origIdx, displayIdx) => {
                const picked = answers[q.id] === displayIdx;
                const correct = submitted && layout[i].correctDisplayIndex === displayIdx;
                const wrong = submitted && picked && !correct;
                return (
                  <button
                    key={displayIdx}
                    className={[
                      'rounded-lg border px-3 py-2 text-left',
                      picked ? 'bg-gray-50 text-slate-900' : '',
                      correct ? 'border-green-500' : '',
                      wrong ? 'border-red-500' : '',
                    ].join(' ')}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: displayIdx }))}
                    disabled={submitted}
                  >
                    {q.options[origIdx]}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="mt-2 text-sm opacity-80">{q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {!submitted ? (
          <button onClick={finish} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
            Sprawdź wynik
          </button>
        ) : (
          <>
            <span className="text-sm">Wynik: <b>{score}/{questions.length}</b></span>
            <button
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              onClick={() => { setAnswers({}); setSubmitted(false); }}
            >
              Jeszcze raz
            </button>
          </>
        )}
      </div>
    </section>
  );
}
