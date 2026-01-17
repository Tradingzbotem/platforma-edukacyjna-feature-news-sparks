'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { BookOpen, HelpCircle, ClipboardList, ChevronRight, X } from 'lucide-react';

type Activity = {
  lessons: Array<{
    course: string;
    lessonId: string;
    done: boolean;
    updatedAt: string;
  }>;
  quizzes: Array<{
    slug: string;
    score: number;
    total: number;
    percentage: number;
    at: string;
  }>;
  checklists: Array<{
    id: string;
    createdAt: string;
    asset: string | null;
    timeframe: string | null;
  }>;
};

type QuizDetails = {
  attempts: Array<{
    score: number;
    total: number;
    percentage: number;
    at: string;
    answers: any;
    errors: Array<{
      questionId: string;
      userAnswer: number | null;
      correctAnswer: number;
      isCorrect: boolean;
    }>;
  }>;
  quizData: {
    title: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
  } | null;
};

export default function UserActivityPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/activity`, {
          cache: 'no-store',
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!mounted) return;
        if (!data.ok) throw new Error(data.error || 'Failed to load activity');
        setActivity(data.activity);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać aktywności');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  async function loadQuizDetails(slug: string) {
    if (selectedQuiz === slug && quizDetails) {
      setSelectedQuiz(null);
      setQuizDetails(null);
      return;
    }
    setSelectedQuiz(slug);
    setLoadingDetails(true);
    try {
      const r = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/quiz-details/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load quiz details');
      setQuizDetails(data);
    } catch (e: any) {
      setError(e?.message || 'Nie udało się pobrać szczegółów quizu');
    } finally {
      setLoadingDetails(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;
  if (error) return <main className="min-h-screen bg-slate-950 text-white p-6">Błąd: {error}</main>;
  if (!activity) return <main className="min-h-screen bg-slate-950 text-white p-6">Brak danych</main>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Aktywność użytkownika</h1>
          <p className="mt-2 text-sm text-white/60">Szczegółowy przegląd aktywności użytkownika</p>
        </div>

        {/* Lessons */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Lekcje ({activity.lessons.length})
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5">
            {activity.lessons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-sm text-white/70">Kurs</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Lekcja</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Status</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Ostatnia aktualizacja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.lessons.map((lesson, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="px-4 py-2 text-sm capitalize">{lesson.course}</td>
                        <td className="px-4 py-2 text-sm">{lesson.lessonId}</td>
                        <td className="px-4 py-2 text-sm">
                          {lesson.done ? (
                            <span className="text-emerald-400">Ukończona</span>
                          ) : (
                            <span className="text-slate-500">W trakcie</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-white/70">
                          {new Date(lesson.updatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-6 text-white/70 text-sm">Brak danych o lekcjach</div>
            )}
          </div>
        </section>

        {/* Quizzes */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Quizy ({activity.quizzes.length})
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5">
            {activity.quizzes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-sm text-white/70">Quiz</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Wynik</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Błędy</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Data</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.quizzes.reduce<ReactNode[]>((acc, quiz) => {
                      const errorCount = quiz.total - quiz.score;
                      acc.push(
                        <tr key={quiz.slug} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => loadQuizDetails(quiz.slug)}>
                          <td className="px-4 py-2 text-sm font-medium">{quiz.slug}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={quiz.percentage >= 70 ? 'text-emerald-400' : quiz.percentage >= 50 ? 'text-yellow-400' : 'text-rose-400'}>
                              {quiz.score}/{quiz.total} ({quiz.percentage}%)
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {errorCount > 0 ? (
                              <span className="text-rose-400">{errorCount} błędów</span>
                            ) : (
                              <span className="text-emerald-400">Brak błędów</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-white/70">
                            {new Date(quiz.at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadQuizDetails(quiz.slug);
                              }}
                              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                            >
                              Szczegóły
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                      
                      if (selectedQuiz === quiz.slug && quizDetails) {
                        acc.push(
                          <tr key={`${quiz.slug}-details`} className="border-b border-white/10 bg-slate-900/50">
                            <td colSpan={5} className="px-4 py-4">
                              {loadingDetails ? (
                                <div className="text-white/70 text-sm">Ładowanie szczegółów…</div>
                              ) : (
                                <QuizDetailsView details={quizDetails} />
                              )}
                            </td>
                          </tr>
                        );
                      }
                      
                      return acc;
                    }, [])}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-6 text-white/70 text-sm">Brak danych o quizach</div>
            )}
          </div>
        </section>

        {/* Checklists */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Checklisty ({activity.checklists.length})
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5">
            {activity.checklists.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-sm text-white/70">Aktywo</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Timeframe</th>
                      <th className="px-4 py-2 text-left text-sm text-white/70">Data utworzenia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.checklists.map((checklist) => (
                      <tr key={checklist.id} className="border-b border-white/5">
                        <td className="px-4 py-2 text-sm">{checklist.asset || '—'}</td>
                        <td className="px-4 py-2 text-sm">{checklist.timeframe || '—'}</td>
                        <td className="px-4 py-2 text-sm text-white/70">
                          {new Date(checklist.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-6 text-white/70 text-sm">Brak danych o checklistach</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function QuizDetailsView({ details }: { details: QuizDetails }) {
  if (!details.quizData) {
    return <div className="text-white/70 text-sm">Brak danych o quizie</div>;
  }

  const questionMap = new Map(details.quizData.questions.map(q => [q.id, q]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{details.quizData.title}</h3>
        <div className="text-sm text-white/70">
          {details.attempts.length} {details.attempts.length === 1 ? 'próba' : 'prób'}
        </div>
      </div>

      {details.attempts.map((attempt, attemptIdx) => (
        <div key={attemptIdx} className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-medium">
                Próba #{details.attempts.length - attemptIdx} — {new Date(attempt.at).toLocaleString()}
              </span>
              <div className="mt-1">
                <span className={attempt.percentage >= 70 ? 'text-emerald-400' : attempt.percentage >= 50 ? 'text-yellow-400' : 'text-rose-400'}>
                  Wynik: {attempt.score}/{attempt.total} ({attempt.percentage}%)
                </span>
              </div>
            </div>
            {attempt.errors.length > 0 && (
              <div className="text-rose-400 text-sm font-medium">
                {attempt.errors.length} {attempt.errors.length === 1 ? 'błąd' : 'błędów'}
              </div>
            )}
          </div>

          {attempt.errors.length > 0 && (
            <div className="mt-4 space-y-4">
              <h4 className="text-sm font-semibold text-rose-400">Błędy:</h4>
              {attempt.errors.map((error, errorIdx) => {
                const question = questionMap.get(error.questionId);
                if (!question) return null;
                return (
                  <div key={errorIdx} className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3">
                    <div className="text-sm font-medium text-white mb-2">{question.question}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">Odpowiedź użytkownika:</span>
                        <span className="text-rose-300">
                          {error.userAnswer !== null && error.userAnswer < question.options.length
                            ? question.options[error.userAnswer]
                            : 'Brak odpowiedzi'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">Poprawna odpowiedź:</span>
                        <span className="text-emerald-300">{question.options[question.correctIndex]}</span>
                      </div>
                      {question.explanation && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-white/80">
                          <span className="font-medium">Wyjaśnienie:</span> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {attempt.errors.length === 0 && (
            <div className="mt-4 text-sm text-emerald-400">Wszystkie odpowiedzi poprawne! 🎉</div>
          )}
        </div>
      ))}
    </div>
  );
}
