'use client';

import { useMemo, useState } from 'react';

export type DemoQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export default function DemoQuiz({ title, questions }: { title: string; questions: DemoQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Wylosuj układ opcji per pytanie – stabilny w trakcie życia komponentu
  const layout = useMemo(() => {
    function shuffledIndexes(n: number) {
      const arr = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    return questions.map(q => {
      const order = shuffledIndexes(q.options.length);
      const correctDisplayIndex = order.indexOf(q.correctIndex);
      return { order, correctDisplayIndex };
    });
  }, [questions]);

  const score = Object.entries(answers).filter(([id, idx]) => {
    const qi = questions.findIndex(q => q.id === id);
    if (qi < 0) return false;
    return layout[qi].correctDisplayIndex === idx;
  }).length;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="opacity-70 text-sm mt-1">10 pytań — bez logowania</p>

      <div className="mt-6 grid gap-4">
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
                      picked ? 'bg-gray-50' : '',
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
            {submitted && (
              <p className="mt-2 text-sm opacity-80">
                Poprawna: <b>{q.options[q.correctIndex]}</b>
                {q.explanation ? ` — ${q.explanation}` : ''}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        {!submitted ? (
          <button
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            onClick={() => setSubmitted(true)}
          >
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
    </div>
  );
}
