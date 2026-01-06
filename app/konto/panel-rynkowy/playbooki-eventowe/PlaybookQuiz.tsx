// app/konto/panel-rynkowy/playbooki-eventowe/PlaybookQuiz.tsx
'use client';

import { useMemo, useState } from 'react';
import type { Playbook } from '@/lib/panel/playbooks';

type Props = {
  item: Playbook;
  itemsOverride?: Playbook['quiz'];
};

export default function PlaybookQuiz({ item, itemsOverride }: Props) {
  const items = itemsOverride && itemsOverride.length > 0 ? itemsOverride : item.quiz;
  const [answers, setAnswers] = useState<number[]>(Array(items.length).fill(-1));
  const [showResult, setShowResult] = useState<boolean[]>(Array(items.length).fill(false));

  const score = useMemo(
    () => answers.reduce((acc, a, i) => acc + (a === items[i]?.correctIndex ? 1 : 0), 0),
    [answers, items]
  );

  function choose(qIdx: number, optIdx: number) {
    setAnswers((prev) => {
      const cp = prev.slice();
      cp[qIdx] = optIdx;
      return cp;
    });
    setShowResult((prev) => {
      const cp = prev.slice();
      cp[qIdx] = true;
      return cp;
    });
  }

  if (items.length === 0) {
    return <div className="text-white/70 text-sm">Pytania w przygotowaniu.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-white/80">
        Wynik: <span className="font-semibold text-white">{score}</span> / {items.length}
      </div>
      {items.map((q, qi) => {
        const selected = answers[qi];
        const reveal = showResult[qi];
        return (
          <div key={qi} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold">{qi + 1}. {q.question}</div>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, oi) => {
                const isCorrect = reveal && oi === q.correctIndex;
                const isWrong = reveal && selected === oi && oi !== q.correctIndex;
                return (
                  <button
                    key={oi}
                    onClick={() => choose(qi, oi)}
                    className={`text-left rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 ${
                      isCorrect
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                        : isWrong
                        ? 'border-rose-400/30 bg-rose-500/10 text-rose-200'
                        : selected === oi
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/10 bg-slate-900/50 text-white/80 hover:bg-white/10'
                    }`}
                    aria-pressed={selected === oi}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {reveal && (
              <div className="mt-3 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-sm text-white/80">
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


