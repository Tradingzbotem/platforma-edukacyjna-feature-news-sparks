"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

export type ExamQuestion = {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation?: string;
  hint?: string; // Opis/podpowiedź do pytania
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
  /** (opcjonalny) link „Wróć" nad egzaminem oraz pod wynikiem */
  backHref?: string;
  /** Czas trwania egzaminu w minutach */
  durationMinutes?: number;
  /** Opis egzaminu */
  description?: string;
};

export default function ExamRunner({
  slug,
  title,
  questions,
  demoLimit = 10,
  isPro = true, // Odblokowane - wszystkie pytania dostępne po zalogowaniu
  backHref,
  durationMinutes = 30,
  description,
}: Props) {
  const cap = questions.length; // Zawsze wszystkie pytania
  const visibleQuestions = useMemo(
    () => questions.slice(0, cap),
    [questions, cap]
  );

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60 * 1000); // w milisekundach
  const [examStarted, setExamStarted] = useState(false);
  // Przechowywanie wszystkich odpowiedzi podczas egzaminu
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array.from({ length: visibleQuestions.length }, () => null)
  );

  const finished = step >= visibleQuestions.length;
  const q = !finished ? visibleQuestions[step] : null;

  // Timer
  useEffect(() => {
    if (!examStarted || finished) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = durationMinutes * 60 * 1000 - elapsed;
      setTimeRemaining(Math.max(0, remaining));
      
      if (remaining <= 0) {
        // Czas się skończył - zapisz aktualne odpowiedzi i zakończ egzamin
        const finalAnswers = [...answers];
        // Zapisz aktualnie wybraną odpowiedź jeśli jest
        if (picked !== null && !finished) {
          finalAnswers[step] = picked;
        }
        setAnswers(finalAnswers);
        // Zapisz jako finalne do API
        saveToAPI(true, finalAnswers);
        setStep(visibleQuestions.length);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, finished, startTime, durationMinutes, visibleQuestions.length]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const startExam = () => {
    setExamStarted(true);
    
    // Wczytaj zapisane odpowiedzi z localStorage
    if (slug) {
      try {
        const storageKey = `fxedu:exam:${slug}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          if (Array.isArray(data.answers) && data.answers.length === visibleQuestions.length) {
            setAnswers(data.answers);
            // Przywróć zapisaną odpowiedź dla bieżącego pytania
            if (typeof data.step === 'number' && data.step >= 0 && data.step < visibleQuestions.length) {
              setStep(data.step);
              if (data.answers[data.step] !== null) {
                setPicked(data.answers[data.step]);
              }
            }
          }
        }
      } catch {}
    }
  };

  const next = () => {
    if (finished) return;
    if (picked === null) return;

    if (!checked) {
      // Zapisz odpowiedź przed sprawdzeniem
      const updatedAnswers = [...answers];
      updatedAnswers[step] = picked;
      setAnswers(updatedAnswers);
      
      if (q && picked === q.correctIndex) setScore((s) => s + 1);
      setChecked(true);
      
      // Zapisz do API po sprawdzeniu z aktualnymi odpowiedziami
      saveToAPI(false, updatedAnswers);
      return;
    }

    // Zapisz odpowiedź przed przejściem dalej
    const updatedAnswers = [...answers];
    updatedAnswers[step] = picked;
    setAnswers(updatedAnswers);
    
    // Jeśli to ostatnie pytanie, zapisz jako finalne
    const isFinal = step + 1 === visibleQuestions.length;
    if (isFinal) {
      saveToAPI(true, updatedAnswers);
    } else {
      saveToAPI(false, updatedAnswers);
    }

    // idziemy dalej
    setPicked(null);
    setChecked(false);
    setStep((s) => Math.min(s + 1, visibleQuestions.length));
  };

  // Automatyczne zapisywanie do localStorage przy zmianie odpowiedzi lub kroku
  useEffect(() => {
    if (!slug || !examStarted) return;
    try {
      const storageKey = `fxedu:exam:${slug}`;
      const data = {
        answers,
        step,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  }, [slug, examStarted, answers, step]);

  // Zapisz odpowiedzi do API
  const saveToAPI = async (isFinal: boolean = false, currentAnswers?: Array<number | null>) => {
    if (!slug) return;
    
    const answersToSave = currentAnswers || answers;
    
    try {
      const answersData = visibleQuestions.map((q, i) => {
        const userAnswer = answersToSave[i];
        const correctAnswer = q.correctIndex;
        const isCorrect = userAnswer !== null && userAnswer === correctAnswer;
        return {
          questionId: q.id,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
        };
      });

      // Oblicz aktualny wynik
      const currentScore = answersData.filter((a) => a.isCorrect).length;

      await fetch('/api/progress/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          score: currentScore,
          total: visibleQuestions.length,
          answers: answersData,
          at: isFinal ? new Date().toISOString() : undefined,
        }),
      });
    } catch {}
  };

  const skipToNext = () => {
    if (finished) return;
    if (picked === null) return;

    // Zapisz odpowiedź przed przejściem
    const updatedAnswers = [...answers];
    updatedAnswers[step] = picked;
    setAnswers(updatedAnswers);
    saveToAPI(false, updatedAnswers);

    // Przechodzimy do następnego pytania bez sprawdzania odpowiedzi
    setPicked(null);
    setChecked(false);
    setStep((s) => Math.min(s + 1, visibleQuestions.length));
  };

  // Ekran startowy przed rozpoczęciem egzaminu
  if (!examStarted) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-3xl p-6 md:p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            {backHref ? (
              <Link href={backHref} className="underline text-sm hover:text-white transition-colors">
                ← Wróć
              </Link>
            ) : (
              <span />
            )}
          </div>

          <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-8 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
              {description && (
                <p className="text-slate-300 mt-2">{description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-sm text-slate-400">Liczba pytań</div>
                <div className="text-2xl font-semibold mt-1">{cap}</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-sm text-slate-400">Czas trwania</div>
                <div className="text-2xl font-semibold mt-1">{durationMinutes} min</div>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-4">
              <h3 className="font-semibold text-emerald-200 mb-2">Instrukcje:</h3>
              <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                <li>Przeczytaj każde pytanie uważnie</li>
                <li>Wybierz jedną odpowiedź</li>
                <li>Możesz sprawdzić odpowiedź przed przejściem dalej</li>
                <li>Po sprawdzeniu zobaczysz wyjaśnienie</li>
                <li>Czas jest limitowany - monitoruj zegar</li>
                <li>Możesz wrócić do poprzednich pytań</li>
              </ul>
            </div>

            <button
              onClick={startExam}
              className="w-full px-6 py-4 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
            >
              Rozpocznij egzamin
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl p-6 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        {backHref ? (
          <Link href={backHref} className="underline text-sm hover:text-white transition-colors">
            ← Wróć
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
            timeRemaining < 5 * 60 * 1000 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50' 
              : timeRemaining < 10 * 60 * 1000
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
          }`}>
            ⏱ {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-slate-300">
            {cap} pytań
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>

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
              {q.hint && (
                <div className="mb-3 rounded-lg bg-blue-500/10 border border-blue-400/30 p-3">
                  <p className="text-sm text-blue-200">{q.hint}</p>
                </div>
              )}
              <h2 className="mt-3 text-lg font-semibold">{q.question}</h2>

              <div className="mt-4 space-y-2">
                {q.answers.map((a, i) => {
                  const isPicked = picked === i;
                  const isCorrect = checked && i === q.correctIndex;
                  const isWrong = checked && isPicked && i !== q.correctIndex;
                  // Sprawdź czy ta odpowiedź była wcześniej zapisana
                  const wasSaved = answers[step] === i;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (!checked) {
                          setPicked(i);
                          // Zapisz odpowiedź od razu po wyborze
                          const updatedAnswers = [...answers];
                          updatedAnswers[step] = i;
                          setAnswers(updatedAnswers);
                        }
                      }}
                      className={`w-full text-left rounded-xl px-3 py-2 border transition
                        ${
                          isCorrect
                            ? "border-emerald-400/60 bg-emerald-500/10"
                            : isWrong
                            ? "border-rose-400/60 bg-rose-500/10"
                            : isPicked || wasSaved
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
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => {
                    // Zapisz aktualną odpowiedź przed przejściem wstecz
                    if (picked !== null) {
                      const updatedAnswers = [...answers];
                      updatedAnswers[step] = picked;
                      setAnswers(updatedAnswers);
                    }
                    
                    // Przejdź do poprzedniego pytania
                    const prevStep = step - 1;
                    setStep(prevStep);
                    // Przywróć zapisaną odpowiedź dla poprzedniego pytania
                    const prevAnswer = answers[prevStep];
                    setPicked(prevAnswer);
                    setChecked(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all duration-200"
                >
                  ← Wstecz
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!checked && picked !== null && (
                <button
                  onClick={skipToNext}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all duration-200"
                >
                  Dalej →
                </button>
              )}
              <button
                onClick={next}
                disabled={picked === null && !checked}
                className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-40 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {checked
                  ? step + 1 === visibleQuestions.length
                    ? "Zakończ egzamin"
                    : "Dalej →"
                  : "Sprawdź odpowiedź"}
              </button>
            </div>
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
          <SyncResult 
            slug={slug} 
            score={score} 
            total={visibleQuestions.length}
            answers={visibleQuestions.map((q, i) => {
              const userAnswer = answers[i];
              const correctAnswer = q.correctIndex;
              const isCorrect = userAnswer !== null && userAnswer === correctAnswer;
              return {
                questionId: q.id,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
              };
            })}
          />


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
      </div>
    </main>
  );
}

function SyncResult({ 
  slug, 
  score, 
  total, 
  answers 
}: { 
  slug?: string; 
  score: number; 
  total: number;
  answers?: Array<{
    questionId: string;
    userAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}) {
  // post-render, fire-and-forget
  useEffect(() => {
    if (!slug) return;
    try {
      fetch('/api/progress/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug, 
          score, 
          total,
          answers,
          at: new Date().toISOString(),
        }),
      });
    } catch {}
  }, [slug, score, total, answers]);
  return null;
}
