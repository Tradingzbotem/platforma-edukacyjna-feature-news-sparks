"use client";

import { useEffect, useRef } from "react";

export type QuizMcqDecisionBlockProps = {
  questionId: string;
  question: string;
  optionOrder: readonly number[];
  options: readonly string[];
  correctDisplayIndex: number;
  /** Indeks wyświetlanej opcji (0…n-1) po wyborze; null = brak wyboru */
  selectedAnswer: number | null;
  /** true po wyborze — pokazuj ocenę, konsekwencję i stany wizualne */
  showFeedback: boolean;
  examEnabled: boolean;
  /** Quiz zakończony (podsumowanie) — zablokuj zmiany */
  locked: boolean;
  onSelect: (displayIndex: number) => void;
  explanation?: string;
  explanationIncorrect?: string;
  consequenceCorrect?: string;
  consequenceWrong?: string;
  /** Czy jest kolejne pytanie (CTA „Dalej”) */
  canGoNext: boolean;
  onNext: () => void;
  /** Seria poprawnych z rzędu (od początku quizu do pierwszej luki/błędu) — jak w runnerze */
  answerStreak: number;
  /** Tryb powtórki błędnych pytań — copy i podpowiedź „sprawdź rozumienie” */
  reviewMode?: boolean;
  /** Tylko admin: wskaż poprawną opcję zanim użytkownik odpowie (UI redakcyjne). */
  adminAnswerPreview?: boolean;
  /** Tryb chroniony: trwa weryfikacja odpowiedzi na serwerze. */
  verifyPending?: boolean;
};

const WRONG_CONSEQUENCE_PLACEHOLDER =
  "wyższe ryzyko na rachunku, gorsze wejście/wyjście albo rozmiar pozycji niespójny z planem — doprecyzuj w danych pytania pole konsekwencji błędu.";

function buildMechanicSnippet(q: string, maxLen = 72): string {
  const t = q.replace(/\s+/g, " ").trim();
  if (!t) return "omawianego zagadnienia";
  return t.length > maxLen ? `${t.slice(0, maxLen).trim()}…` : t;
}

export default function QuizMcqDecisionBlock({
  questionId,
  question,
  optionOrder,
  options,
  correctDisplayIndex,
  selectedAnswer,
  showFeedback,
  examEnabled,
  locked,
  onSelect,
  explanation,
  explanationIncorrect,
  consequenceCorrect: consequenceCorrectProp,
  consequenceWrong: consequenceWrongProp,
  canGoNext,
  onNext,
  answerStreak,
  reviewMode = false,
  adminAnswerPreview = false,
  verifyPending = false,
}: QuizMcqDecisionBlockProps) {
  const qRef = useRef<HTMLHeadingElement | null>(null);
  const consequenceRef = useRef<HTMLElement | null>(null);
  const scrolledForQuestionRef = useRef<string | null>(null);

  const isCorrect =
    showFeedback && correctDisplayIndex >= 0 && selectedAnswer === correctDisplayIndex;

  useEffect(() => {
    qRef.current?.focus();
  }, [questionId]);

  useEffect(() => {
    scrolledForQuestionRef.current = null;
  }, [questionId]);

  useEffect(() => {
    if (!showFeedback) return;
    if (scrolledForQuestionRef.current === questionId) return;
    scrolledForQuestionRef.current = questionId;
    requestAnimationFrame(() => {
      consequenceRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [showFeedback, questionId]);

  const mechanicSnippet = buildMechanicSnippet(question);

  const decisionShellClass = showFeedback
    ? isCorrect
      ? "rounded-lg border border-emerald-500/45 bg-emerald-950/15 shadow-[0_0_48px_-12px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/25"
      : "rounded-lg border border-red-500/40 bg-red-950/10 shadow-[0_0_40px_-14px_rgba(248,113,113,0.22)] ring-1 ring-red-500/20"
    : "rounded-lg border border-transparent";

  return (
    <article
      className={`rounded-lg border border-white/[0.07] p-5 sm:p-7 ${
        examEnabled ? "bg-[#08080a]" : "bg-[#0a0d12]"
      }`}
    >
      <div className="space-y-6">
        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Scenariusz</p>
          <h2
            ref={qRef}
            tabIndex={-1}
            className="mt-2 text-base font-medium leading-relaxed text-zinc-100 sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 rounded-sm"
          >
            {question}
          </h2>
        </section>

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Decyzja</p>
          <p className="mt-1 text-xs text-zinc-600">
            {reviewMode
              ? "Powtórka błędu — wybierz odpowiedź, potem porównaj z uzasadnieniem i upewnij się, że rozumiesz mechanizm."
              : examEnabled
                ? "Jeden wybór — po zatwierdzeniu zobaczysz ocenę i konsekwencję decyzji."
                : "Wybierz wariant, który najlepiej odpowiada sytuacji — potem zobaczysz uzasadnienie."}
          </p>
          {verifyPending ? (
            <p className="mt-2 text-xs text-zinc-500" aria-live="polite">
              Sprawdzanie odpowiedzi na serwerze…
            </p>
          ) : null}
          {adminAnswerPreview && !showFeedback && !locked && !verifyPending && correctDisplayIndex >= 0 ? (
            <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs leading-relaxed text-amber-100/95">
              <span className="font-semibold uppercase tracking-wide text-amber-200/90">Podgląd admina: </span>
              litera{" "}
              <strong className="tabular-nums text-amber-50">
                {String.fromCharCode(65 + correctDisplayIndex)}
              </strong>{" "}
              — poprawna opcja jest też oznaczona przerywaną ramką.
            </p>
          ) : null}

          <div className={`mt-4 p-3 sm:p-4 ${decisionShellClass}`}>
            <ul className="space-y-3">
              {optionOrder.map((origIdx, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrectOpt = correctDisplayIndex >= 0 && i === correctDisplayIndex;
                const letter = String.fromCharCode(65 + i);
                const baseOpt = examEnabled
                  ? "border-white/[0.1] bg-black/30 hover:border-white/[0.18] hover:bg-white/[0.04]"
                  : "border-white/10 bg-white/[0.02] hover:border-emerald-500/35 hover:bg-emerald-500/[0.06]";
                const adminHint =
                  adminAnswerPreview &&
                  !showFeedback &&
                  !locked &&
                  !verifyPending &&
                  isCorrectOpt
                    ? "border-amber-500/55 border-dashed bg-amber-950/20 ring-1 ring-amber-400/25"
                    : "";

                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onSelect(i)}
                      disabled={locked || showFeedback || verifyPending}
                      className={[
                        "group w-full rounded-lg border-2 px-4 py-4 text-left transition-all duration-200 sm:px-5 sm:py-4",
                        showFeedback
                          ? [
                              isCorrectOpt
                                ? "border-emerald-400/85 bg-emerald-950/45 text-emerald-50 shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)]"
                                : isSelected
                                  ? "border-red-500/70 bg-red-950/40 text-red-50"
                                  : "border-white/[0.06] bg-black/20 text-zinc-600 opacity-75",
                              "cursor-default",
                            ].join(" ")
                          : [baseOpt, adminHint, "border-white/[0.12] active:scale-[0.99]"].filter(Boolean).join(" "),
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={[
                            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-bold tabular-nums transition-colors",
                            showFeedback
                              ? isCorrectOpt
                                ? "border-emerald-300/50 bg-emerald-500/25 text-emerald-100"
                                : isSelected
                                  ? "border-red-300/50 bg-red-500/25 text-red-100"
                                  : "border-white/10 text-zinc-600"
                              : "border-white/15 bg-white/[0.04] text-zinc-400 group-hover:border-white/25 group-hover:text-zinc-200",
                          ].join(" ")}
                        >
                          {letter}
                        </span>
                        <span
                          className={[
                            "min-w-0 flex-1 text-sm leading-snug sm:text-[15px]",
                            showFeedback
                              ? isCorrectOpt
                                ? "font-semibold text-emerald-50"
                                : isSelected
                                  ? "font-semibold text-red-100"
                                  : "text-zinc-500"
                              : "font-medium text-zinc-300 group-hover:text-zinc-100",
                          ].join(" ")}
                        >
                          {options[origIdx]}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {showFeedback ? (
              <div
                className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-4 animate-fade-in"
                aria-live="polite"
              >
                {isCorrect ? (
                  <span className="inline-flex items-center rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-100">
                    Poprawna odpowiedź
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-red-400/45 bg-red-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-100">
                    Niepoprawna odpowiedź
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section
          ref={consequenceRef}
          className={[
            "border-t border-white/[0.06] pt-6 scroll-mt-28 transition-shadow duration-500",
            showFeedback ? "rounded-lg ring-2 ring-offset-2 ring-offset-[#0a0d12] ring-zinc-500/35" : "",
          ].join(" ")}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Konsekwencja</p>

          {!showFeedback ? (
            <p className="mt-2 text-sm text-zinc-600">
              {examEnabled
                ? "Tu pojawi się ocena decyzji i krótki opis konsekwencji — najpierw wybierz odpowiedź."
                : "Po wyborze zobaczysz, co Twoja decyzja oznacza w praktyce oraz (jeśli jest) uzasadnienie z bazy."}
            </p>
          ) : (
            <div className="mt-3 space-y-3 animate-fade-in">
              <p className="text-sm leading-relaxed text-zinc-200">
                {isCorrect ? (
                  consequenceCorrectProp ? (
                    <>
                      <span className="mr-1.5 inline-block" aria-hidden>
                        👉
                      </span>
                      <span className="font-medium text-zinc-100">{consequenceCorrectProp}</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1.5 inline-block" aria-hidden>
                        👉
                      </span>
                      Dobra decyzja — to oznacza, że rozumiesz mechanikę{" "}
                      <span className="font-medium text-zinc-50">„{mechanicSnippet}”</span>
                      <span className="text-zinc-500"> (placeholder — docelowo precyzyjny tag tematu).</span>
                    </>
                  )
                ) : consequenceWrongProp ? (
                  <>
                    <span className="mr-1.5 inline-block" aria-hidden>
                      👉
                    </span>
                    <span className="font-semibold text-zinc-300">W praktyce oznacza to: </span>
                    <span className="font-medium text-zinc-100">{consequenceWrongProp}</span>
                  </>
                ) : (
                  <>
                    <span className="mr-1.5 inline-block" aria-hidden>
                      👉
                    </span>
                    <span className="font-semibold text-zinc-300">W praktyce oznacza to: </span>
                    <span className="font-medium text-zinc-100">{WRONG_CONSEQUENCE_PLACEHOLDER}</span>
                  </>
                )}
              </p>

              {(isCorrect ? explanation ?? explanationIncorrect : explanationIncorrect ?? explanation) ? (
                <div
                  className={[
                    "rounded-lg border p-4 text-sm leading-relaxed",
                    isCorrect
                      ? "border-emerald-500/25 bg-emerald-950/20 text-emerald-100/95"
                      : "border-red-500/25 bg-red-950/25 text-red-100/95",
                  ].join(" ")}
                >
                  <span className="font-semibold">{isCorrect ? "Dlaczego: " : "Dlaczego to nietrafione: "}</span>
                  <span className="font-normal opacity-95">
                    {isCorrect
                      ? (explanation ?? explanationIncorrect)
                      : (explanationIncorrect ?? explanation)}
                  </span>
                </div>
              ) : (
                <p className="rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2 text-xs text-zinc-500">
                  Brak uzasadnienia w bazie — uzupełnij wyjaśnienie przy tym pytaniu.
                </p>
              )}

              {reviewMode ? (
                <p className="rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs font-medium leading-relaxed text-amber-100/90">
                  <span className="mr-1" aria-hidden>
                    👉
                  </span>
                  Sprawdź, czy już rozumiesz — jeśli tak, przejdź dalej; jeśli nie, zatrzymaj się na tym punkcie.
                </p>
              ) : null}

              <p
                className={[
                  "text-xs leading-relaxed",
                  isCorrect ? "text-emerald-200/90" : "text-amber-200/85",
                ].join(" ")}
              >
                <span className="mr-1" aria-hidden>
                  👉
                </span>
                {reviewMode
                  ? isCorrect
                    ? "Dobrze — utrwal to przy kolejnych decyzjach."
                    : "Przejrzyj uzasadnienie i spróbuj zapamiętać wzorzec."
                  : isCorrect
                    ? "OK — przejdź dalej"
                    : "Zwróć uwagę — to częsty błąd początkujących"}
              </p>

              {isCorrect && answerStreak >= 1 ? (
                <p className="text-sm font-medium text-zinc-200">
                  {answerStreak === 1
                    ? "1 dobra odpowiedź z rzędu"
                    : `${answerStreak} dobre odpowiedzi z rzędu`}
                </p>
              ) : null}

              <div className="border-t border-white/[0.08] pt-4">
                {canGoNext ? (
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-white sm:w-auto"
                  >
                    <span aria-hidden>👉</span>
                    Dalej →
                  </button>
                ) : (
                  <p className="text-xs text-zinc-500">
                    {reviewMode
                      ? "Ostatnia pozycja z powtórki — zakończ i zobacz podsumowanie poniżej."
                      : "To ostatnie pytanie — zakończ quiz przyciskiem na dole ekranu."}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
