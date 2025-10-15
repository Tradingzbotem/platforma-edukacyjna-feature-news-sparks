'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

/** Prosty typ pytania */
type Question = {
  q: string;
  options: string[];
  correct: number;          // indeks poprawnej odpowiedzi
  explanation?: string;
};

/** DEMO – 6 przykładowych pytań do „Przewodnik: KNF/ESMA/MiFID” */
const QUESTIONS: Question[] = [
  {
    q: 'Co bada test adekwatności (appropriateness) w rozumieniu MiFID II?',
    options: [
      'Czy klient rozumie ryzyka danego produktu i ma doświadczenie',
      'Czy klient posiada odpowiedni kapitał i dochód',
      'Czy klient posiada zgodę zarządu na zakup produktu',
      'Czy firma ma licencję KNF/CySEC'
    ],
    correct: 0,
    explanation:
      'Test adekwatności sprawdza wiedzę/doświadczenie klienta co do ryzyk i złożoności produktu.'
  },
  {
    q: '„Best execution” dotyczy przede wszystkim…',
    options: [
      'polityki marketingowej',
      'najlepszej możliwej realizacji zleceń (cena, szybkość, koszty, prawdop.)',
      'wysokości depozytu zabezpieczającego',
      'tylko instrumentów akcyjnych'
    ],
    correct: 1
  },
  {
    q: 'Który materiał promocyjny narusza zasadę „fair, clear, not misleading”?',
    options: [
      'Zawiera ostrzeżenie o ryzyku i historyczne wyniki z zastrzeżeniami',
      'Obiecuje gwarantowany zysk bez ryzyka',
      'Wyjaśnia koszty i przykład R:R',
      'Odsyła do dokumentów KID/KIID'
    ],
    correct: 1
  },
  {
    q: 'Kiedy powstaje konflikt interesów?',
    options: [
      'Zawsze przy każdej transakcji',
      'Gdy interes firmy/pośrednika może kolidować z interesem klienta',
      'Wyłącznie w kampaniach reklamowych',
      'Tylko w produktach skomplikowanych'
    ],
    correct: 1
  },
  {
    q: 'Jakie informacje powinny znaleźć się w polityce kosztów/opłat?',
    options: [
      'Wyłącznie spread',
      'Wszystkie istotne koszty: prowizje, rollover, finansowanie, kursy przeliczeń',
      'Wyłącznie koszty depozytu',
      'Nie trzeba ujawniać kosztów w CFD'
    ],
    correct: 1
  },
  {
    q: 'ESMA – przykładowe limity dźwigni dla klienta detalicznego:',
    options: [
      'FX majors 1:30; złoto/„duże” indeksy 1:20; akcje 1:5; krypto 1:2',
      'FX majors 1:500 i wyżej dla wszystkich',
      'Akcje 1:50, FX 1:2',
      'Brak limitów – pełna dowolność'
    ],
    correct: 0
  }
];

/** PRO gating – w wersji demo pokaż tylko N pierwszych pytań */
const DEMO_QUESTIONS = 3;

export default function Page() {
  // Tu możesz podpiąć realne logowanie/plan PRO z globalnego stanu.
  const isProUser = false; // ← na razie „na sztywno” (demo). Podmienisz, gdy będzie auth.

  const visibleQuestions = useMemo(
    () => (isProUser ? QUESTIONS : QUESTIONS.slice(0, DEMO_QUESTIONS)),
    [isProUser]
  );

  const [i, setI] = useState(0);                          // indeks pytania
  const [answers, setAnswers] = useState<number[]>(
    Array(visibleQuestions.length).fill(-1)
  );
  const [checked, setChecked] = useState<boolean[]>(      // zaznaczone/zatwierdzone pytania
    Array(visibleQuestions.length).fill(false)
  );
  const [finished, setFinished] = useState(false);

  const current = visibleQuestions[i];

  const score = useMemo(
    () =>
      answers.reduce((acc, a, idx) => {
        if (a === visibleQuestions[idx].correct) return acc + 1;
        return acc;
      }, 0),
    [answers, visibleQuestions]
  );

  const onPick = (opt: number) => {
    const next = [...answers];
    next[i] = opt;
    setAnswers(next);
  };

  const onCheck = () => {
    const next = [...checked];
    next[i] = true;
    setChecked(next);
  };

  const allAnswered = answers.every((a) => a !== -1);

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-8">
      <Link href="/kursy" className="text-sm underline">
        ← Wróć do kursów
      </Link>

      <header className="mt-2 space-y-1">
        <p className="text-slate-400 text-sm">Egzaminy / regulacje • ⏱ 15–20 min</p>
        <h1 className="text-3xl font-semibold">
          Egzamin próbny — przewodnik KNF / ESMA / MiFID
        </h1>
      </header>

      {!isProUser && (
        <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4">
          <p className="font-medium text-yellow-300">
            Wersja demo: dostępne pierwsze {DEMO_QUESTIONS} pytania.
          </p>
          <p className="text-sm text-slate-300">
            Zaloguj się / wykup dostęp PRO, aby odblokować pełen test, zapis wyników,
            statystyki i certyfikat ukończenia.
          </p>
        </div>
      )}

      {/* Pasek postępu */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Pytanie {i + 1} z {visibleQuestions.length}</span>
          <span>Wynik: {score}/{visibleQuestions.length}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/5">
          <div
            className="h-full bg-white/80"
            style={{
              width: `${((i + (answers[i] !== -1 ? 1 : 0)) / visibleQuestions.length) * 100}%`,
              transition: 'width .2s ease'
            }}
          />
        </div>
      </div>

      {/* Pytanie */}
      <article className="mt-6 rounded-2xl border border-white/10 bg-[#0b1220] p-5 space-y-4">
        <h2 className="text-xl font-semibold">{current.q}</h2>

        <div className="space-y-2">
          {current.options.map((opt, idx) => {
            const picked = answers[i] === idx;
            const isChecked = checked[i];

            const correct = idx === current.correct;
            const wrongPicked = isChecked && picked && !correct;

            return (
              <button
                key={idx}
                onClick={() => onPick(idx)}
                className={[
                  'w-full text-left rounded-xl px-4 py-3 border transition',
                  picked ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10',
                  isChecked && correct && 'border-emerald-400/60 bg-emerald-500/10',
                  wrongPicked && 'border-rose-400/60 bg-rose-500/10'
                ].filter(Boolean).join(' ')}
              >
                <span className="block">{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2"
            onClick={() => setI((x) => Math.max(0, x - 1))}
            disabled={i === 0}
          >
            ← Wstecz
          </button>
          <button
            className="rounded-lg bg-white px-4 py-2 text-slate-900 font-semibold hover:opacity-90"
            onClick={() => setI((x) => Math.min(visibleQuestions.length - 1, x + 1))}
            disabled={i === visibleQuestions.length - 1}
          >
            Dalej →
          </button>

          <button
            className="ml-auto rounded-lg bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-600"
            onClick={onCheck}
            disabled={answers[i] === -1 || checked[i]}
            title="Sprawdź bieżące pytanie"
          >
            Sprawdź odpowiedź
          </button>
        </div>

        {/* Wyjaśnienie po sprawdzeniu */}
        {checked[i] && current.explanation && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
            <strong>Wyjaśnienie: </strong>{current.explanation}
          </div>
        )}
      </article>

      {/* Zakończ test */}
      <div className="mt-6 flex items-center justify-between">
        <Link href="/kursy/egzaminy/przewodnik" className="underline text-sm">
          ← Wróć do przewodnika
        </Link>

        <button
          className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold hover:bg-emerald-600 disabled:opacity-50"
          onClick={() => setFinished(true)}
          disabled={!allAnswered}
        >
          Zakończ i policz wynik
        </button>
      </div>

      {finished && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1220] p-5">
          <h3 className="text-lg font-semibold">Wynik</h3>
          <p className="mt-1 text-slate-300">
            Zdobyłeś <strong>{score}</strong> / {visibleQuestions.length} punktów.
          </p>
          {!isProUser && (
            <p className="mt-2 text-sm text-slate-400">
              To był test demo. Pełny test (30–50 pytań + mini case’y) oraz certyfikat dostępne po zalogowaniu.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
