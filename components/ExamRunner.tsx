// components/ExamRunner.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useProPlan } from './useProPlan';

export type Question = {
  q: string;
  answers: string[];
  correct: number;  // indeks poprawnej
  hint?: string;
};

type Props = {
  examKey: 'knf' | 'cysec' | 'przewodnik';
  title: string;
  questions: Question[];
  demoLimit?: number;   // domyślnie 10
  isPro?: boolean;      // opcjonalnie wymuszenie PRO (np. z ?pro=1)
};

export default function ExamRunner({
  examKey,
  title,
  questions,
  demoLimit = 10,
  isPro,
}: Props) {
  const { pro } = useProPlan();
  const unlocked = (typeof isPro === 'boolean' ? isPro : pro);

  const visibleQuestions = useMemo(
    () => (unlocked ? questions : questions.slice(0, demoLimit)),
    [unlocked, questions, demoLimit]
  );

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => { setAnswers(Array(visibleQuestions.length).fill(-1)); }, [visibleQuestions.length]);

  const q = visibleQuestions[idx];

  const onCheck = () => {
    if (picked === null) return;
    if (!checked) {
      if (picked === q.correct) setScore(s => s + 1);
      setChecked(true);
      setAnswers(a => {
        const na = [...a];
        na[idx] = picked;
        return na;
      });
    }
  };

  const onNext = () => {
    setChecked(false);
    setPicked(null);
    if (idx + 1 < visibleQuestions.length) setIdx(i => i + 1);
  };

  const onFinish = () => {
    setFinished(true);
    try {
      const payload = { at: new Date().toISOString(), score, total: visibleQuestions.length, answers };
      localStorage.setItem(`exam:${examKey}:latest`, JSON.stringify(payload));
    } catch {}
  };

  if (finished) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-slate-300">
          Wynik: <strong>{score}/{visibleQuestions.length}</strong>
        </p>
        {!unlocked && (
          <div className="mt-3 text-yellow-300">
            To był wynik z wersji DEMO. Włącz PRO, aby przejść pełny egzamin i wygenerować certyfikat.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-sm text-slate-300">
          Pytanie {idx + 1} / {visibleQuestions.length}
        </div>
      </div>

      {!unlocked && (
        <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4">
          <div className="font-semibold">Tryb DEMO</div>
          <div className="text-sm text-slate-900/90">
            Odpowiadasz na pierwsze {demoLimit} pytań. Włącz plan PRO (w „Konto”) albo użyj przycisku „Pełny test (PRO)”.
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <div className="text-lg font-medium">{q.q}</div>
        <div className="space-y-2">
          {q.answers.map((a, i) => (
            <label key={i} className={`block rounded-lg border px-4 py-2 cursor-pointer
              ${picked === i ? 'border-white/60 bg-white/10' : 'border-white/10 bg-white/5'}`}>
              <input
                type="radio"
                name={`q-${idx}`}
                className="mr-2"
                checked={picked === i}
                onChange={() => setPicked(i)}
              />
              {a}
            </label>
          ))}
        </div>

        {checked && picked !== q.correct && q.hint && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            Podpowiedź: {q.hint}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          {!checked ? (
            <button
              className="rounded-lg bg-white text-slate-900 px-4 py-2 font-semibold hover:opacity-90"
              onClick={onCheck}
              disabled={picked === null}
            >
              Sprawdź
            </button>
          ) : (
            <>
              {idx + 1 < visibleQuestions.length ? (
                <button className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20" onClick={onNext}>
                  Dalej →
                </button>
              ) : (
                <button className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold hover:bg-emerald-600" onClick={onFinish}>
                  Zakończ i zapisz wynik
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
