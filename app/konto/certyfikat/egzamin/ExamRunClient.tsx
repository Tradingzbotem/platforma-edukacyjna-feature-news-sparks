'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ExamCertificateCta from '@/app/konto/certyfikat/egzamin/ExamCertificateCta';
import { useKontoExamLock } from '@/app/konto/KontoExamLockContext';
import {
  countQuestionKinds,
  getOpenTextMaxLength,
  isAnswerCompleteForQuestion,
  parseStoredAnswer,
} from '@/lib/certification-exam/answersCodec';
import { CERT_EXAM_V1_PLACEHOLDER_PASS_PERCENT } from '@/lib/certification-exam/constants';
import type {
  CertificationExamAttemptDto,
  ExamAnswersMap,
  ExamQuestionAdminPreview,
  ExamQuestionPublic,
} from '@/lib/certification-exam/types';

type AdminOpenQuestion = Extract<ExamQuestionAdminPreview, { type: 'open_text' }>;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M16.25 5.625L8.125 13.75L3.75 9.375"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useExamCountdownMs(startedAtIso: string | null, timeLimitMinutes: number) {
  // Avoid Date.now() in initial state: SSR and hydration run at different times and would mismatch.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!startedAtIso || now === null) return null;
    const started = Date.parse(startedAtIso);
    if (Number.isNaN(started)) return null;
    const deadline = started + timeLimitMinutes * 60_000;
    return Math.max(0, deadline - now);
  }, [startedAtIso, timeLimitMinutes, now]);
}

type BaseProps = {
  attemptId: string;
  initialAttempt: CertificationExamAttemptDto;
  trackLabel: string;
};

type Props =
  | (BaseProps & { adminExamPreview: true; questions: ExamQuestionAdminPreview[] })
  | (BaseProps & { adminExamPreview: false; questions: ExamQuestionPublic[] });

const BEFORE_UNLOAD_MESSAGE =
  'Masz aktywną sesję egzaminacyjną. Opuszczenie strony może skutkować utratą postępu.';

function sameDocumentUrl(candidate: URL, current: URL) {
  return candidate.pathname === current.pathname && candidate.search === current.search && candidate.hash === current.hash;
}

function dtoToClientAnswers(source: ExamAnswersMap | null): ExamAnswersMap {
  if (!source) return {};
  const out: ExamAnswersMap = {};
  for (const [k, v] of Object.entries(source)) {
    const p = parseStoredAnswer(v);
    if (p) out[k] = p;
  }
  return out;
}

function choiceSelectionFor(answers: ExamAnswersMap, qid: string): string | undefined {
  const p = parseStoredAnswer(answers[qid]);
  return p?.kind === 'single_choice' ? p.optionId : undefined;
}

function openTextFor(answers: ExamAnswersMap, qid: string): string {
  const p = parseStoredAnswer(answers[qid]);
  return p?.kind === 'open_text' ? p.text : '';
}

export default function ExamRunClient({ attemptId, adminExamPreview, initialAttempt, questions, trackLabel }: Props) {
  const router = useRouter();
  const { setExamLocked } = useKontoExamLock();
  const [answers, setAnswers] = useState<ExamAnswersMap>(() => dtoToClientAnswers(initialAttempt.answers));
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [finished, setFinished] = useState<CertificationExamAttemptDto | null>(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveAcknowledged, setLeaveAcknowledged] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestAnswers = useRef(answers);
  latestAnswers.current = answers;

  const sessionActive =
    initialAttempt.status === 'IN_PROGRESS' && !finished;

  const remainingMs = useExamCountdownMs(initialAttempt.startedAt, initialAttempt.timeLimitMinutes);

  const questionStats = useMemo(() => countQuestionKinds(questions), [questions]);
  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswerCompleteForQuestion(q, answers[q.id])).length,
    [questions, answers],
  );
  const totalQuestions = questions.length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const progressPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const timerDisplay = useMemo(() => {
    if (remainingMs === null) return '—:—';
    const totalSec = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [remainingMs]);

  const timerTone =
    remainingMs === null
      ? 'text-white/55'
      : remainingMs <= 5 * 60_000
        ? 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.35)]'
        : remainingMs <= 15 * 60_000
          ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]'
          : 'text-white/90';

  const flushSave = useCallback(async () => {
    const payload = latestAnswers.current;
    if (Object.keys(payload).length === 0) return;
    setSaving(true);
    try {
      await fetch(`/api/konto/certyfikat/exam/${encodeURIComponent(attemptId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload }),
      });
    } finally {
      setSaving(false);
    }
  }, [attemptId]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    setExamLocked(sessionActive);
    return () => setExamLocked(false);
  }, [sessionActive, setExamLocked]);

  useEffect(() => {
    if (!sessionActive) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = BEFORE_UNLOAD_MESSAGE;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionActive) return;
    const onClickCapture = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      if (anchor.closest('[data-exam-lock-bypass]')) return;
      if (anchor.hasAttribute('data-exam-lock-bypass')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      try {
        const next = new URL(href, window.location.origin);
        const cur = new URL(window.location.href);
        if (next.origin !== cur.origin) return;
        if (sameDocumentUrl(next, cur)) return;
      } catch {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setLeaveAcknowledged(false);
      setLeaveModalOpen(true);
    };
    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [sessionActive]);

  useEffect(() => {
    if (!leaveModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLeaveModalOpen(false);
        setLeaveAcknowledged(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leaveModalOpen]);

  function scheduleSave(_next: ExamAnswersMap) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flushSave();
    }, 600);
  }

  function selectOption(questionId: string, optionId: string) {
    setSubmitError(null);
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: { kind: 'single_choice' as const, optionId } };
      scheduleSave(next);
      return next;
    });
  }

  function setOpenAnswer(questionId: string, text: string) {
    setSubmitError(null);
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: { kind: 'open_text' as const, text } };
      scheduleSave(next);
      return next;
    });
  }

  async function onSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await flushSave();
      const res = await fetch(`/api/konto/certyfikat/exam/${encodeURIComponent(attemptId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = (await res.json()) as { ok?: boolean; attempt?: CertificationExamAttemptDto; error?: string };
      if (!res.ok || !data.ok || !data.attempt) {
        if (data.error === 'missing_answers' || data.error === 'incomplete_answers') {
          setSubmitError('Odpowiedz na wszystkie pytania przed wysłaniem.');
        } else {
          setSubmitError('Nie udało się zakończyć egzaminu.');
        }
        return;
      }
      setFinished(data.attempt);
      router.refresh();
    } catch {
      setSubmitError('Błąd sieci przy wysyłce.');
    } finally {
      setSubmitting(false);
    }
  }

  if (finished) {
    const passed = finished.status === 'PASSED';
    return (
      <section className="space-y-8">
        <div
          className={`rounded-2xl border px-6 py-8 ${
            passed
              ? 'border-emerald-500/30 bg-emerald-500/[0.07]'
              : 'border-amber-500/25 bg-amber-500/[0.06]'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">Wynik egzaminu</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-white">
            {passed ? 'Zaliczone (placeholder)' : 'Niezaliczone (placeholder)'}
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Wynik: <span className="font-semibold text-white">{finished.scorePercent ?? '—'}%</span>. Próg placeholderowy:{' '}
            {CERT_EXAM_V1_PLACEHOLDER_PASS_PERCENT}%. To nie jest finalna ocena produkcyjna.
          </p>
          <p className="mt-2 text-xs text-white/50">
            Procent liczy wyłącznie pytania zamknięte. Odpowiedzi scenariuszowe (otwarte) są zapisane — bez automatycznej
            oceny w tej fazie.
          </p>
          {!passed ? (
            <p className="mt-3 text-sm text-white/60">
              Docelowo pojawi się tu polityka ponownych podejść i płatności — obecnie to wyłącznie fundament techniczny.
            </p>
          ) : null}
        </div>
        <ExamCertificateCta attemptId={attemptId} />
        <div className="flex flex-wrap gap-3">
          <Link
            href="/konto/certyfikat"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white/90 hover:border-white/25"
          >
            Wróć do certyfikatu
          </Link>
          <Link
            href="/konto/certyfikat/egzamin"
            className="text-sm text-amber-200/90 underline-offset-4 hover:underline"
          >
            Strona egzaminu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
    <div className="scroll-smooth lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-start lg:gap-10">
      <div className="min-w-0 space-y-6 lg:space-y-8">
        <div className="rounded-lg border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.08] via-black/40 to-black/20 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-amber-400/35 bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200/90">
              Sesja egzaminacyjna
            </span>
            <span className="text-xs text-white/75 sm:text-sm">
              Odpowiedzi nie mogą być zmienione po wysłaniu egzaminu.
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-amber-200/50">
            Upewnij się co do wyboru przed zatwierdzeniem — wysłanie jest jednorazowe w ramach tej sesji.
          </p>
        </div>

        {adminExamPreview ? (
          <div className="rounded-lg border border-emerald-500/35 bg-gradient-to-r from-emerald-950/[0.35] via-black/35 to-black/20 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-emerald-400/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200/95">
                Podgląd administratora
              </span>
              <span className="text-xs text-emerald-100/80 sm:text-sm">
                Widzisz klucz dla pytań zamkniętych oraz podpowiedzi do pytań otwartych (zielone oznaczenia). Kandydaci nie
                otrzymują tych danych.
              </span>
            </div>
          </div>
        ) : null}

        <div className="space-y-6 lg:space-y-8">
          {questions.map((q, idx) => {
            const n = String(idx + 1).padStart(2, '0');
            if (q.type === 'open_text') {
              const maxLen = getOpenTextMaxLength(q);
              const val = openTextFor(answers, q.id);
              const adminOpenHint = adminExamPreview ? (q as AdminOpenQuestion).hint : undefined;
              return (
                <article
                  key={q.id}
                  className="group rounded-xl border border-rose-500/20 bg-gradient-to-b from-rose-950/[0.12] to-black/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-400/25 hover:shadow-[0_12px_40px_-12px_rgba(244,63,94,0.08)] sm:p-6"
                >
                  <div className="flex flex-wrap items-start gap-3 gap-y-2">
                    <span className="font-mono text-sm font-semibold tabular-nums text-amber-400/90">{n}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded border border-rose-400/35 bg-rose-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-200/90">
                          Scenariusz
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Otwarta odpowiedź</span>
                        {adminExamPreview ? (
                          <span className="rounded border border-emerald-500/35 bg-emerald-950/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200/90">
                            Pytanie otwarte
                          </span>
                        ) : null}
                      </div>
                      <p className="text-lg font-medium leading-snug text-white/95">{q.prompt}</p>
                      {adminOpenHint ? (
                        <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-950/35 px-3 py-2.5 shadow-[inset_0_0_24px_rgba(16,185,129,0.06)]">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="rounded border border-emerald-400/45 bg-emerald-950/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200/95">
                              Podpowiedź (klucz)
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-200/55">
                              tylko administrator
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-emerald-100/85">{adminOpenHint}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-5 pl-0 sm:pl-10">
                    <label className="sr-only" htmlFor={`open-${q.id}`}>
                      Odpowiedź: {q.prompt.slice(0, 80)}
                    </label>
                    <textarea
                      id={`open-${q.id}`}
                      value={val}
                      onChange={(e) => setOpenAnswer(q.id, e.target.value)}
                      maxLength={maxLen}
                      rows={5}
                      className="w-full resize-y rounded-lg border border-white/[0.14] bg-black/40 px-4 py-3 text-sm leading-relaxed text-white/90 shadow-inner outline-none transition placeholder:text-white/30 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/30"
                      placeholder="Krótka odpowiedź tekstowa (wymagana przed wysłaniem)…"
                    />
                    <p className="mt-2 text-right text-[10px] text-white/35">
                      {val.length} / {maxLen}
                    </p>
                  </div>
                </article>
              );
            }
            const selectedId = choiceSelectionFor(answers, q.id);
            const correctOptionId =
              adminExamPreview && q.type === 'single_choice' && 'correctOptionId' in q ? q.correctOptionId : undefined;
            return (
              <article
                key={q.id}
                className="group rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-black/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_12px_40px_-12px_rgba(245,158,11,0.12)] sm:p-6"
              >
                <div className="flex flex-wrap items-start gap-3 gap-y-2">
                  <span className="font-mono text-sm font-semibold tabular-nums text-amber-400/90">{n}</span>
                  <div className="min-w-0 flex-1">
                    <span className="mb-2 inline-block rounded border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Jednokrotny wybór
                    </span>
                    <p className="text-lg font-medium leading-snug text-white/95">{q.prompt}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5 pl-0 sm:pl-10">
                  {q.options.map((o) => {
                    const selected = selectedId === o.id;
                    const isCorrectOption = correctOptionId !== undefined && o.id === correctOptionId;
                    const rowClass = isCorrectOption
                      ? 'border-emerald-500/60 bg-emerald-500/[0.14] shadow-[0_0_0_1px_rgba(16,185,129,0.35),inset_0_0_28px_rgba(16,185,129,0.08)] hover:shadow-[0_0_24px_rgba(16,185,129,0.18)]'
                      : selected
                        ? 'border-amber-400/70 bg-amber-500/[0.14] shadow-[0_0_0_1px_rgba(245,158,11,0.25),inset_0_0_24px_rgba(245,158,11,0.06)]'
                        : 'border-white/[0.14] bg-black/25 hover:border-amber-500/35 hover:bg-white/[0.04]';
                    const radioClass = isCorrectOption
                      ? 'border-emerald-400/85 bg-emerald-500/30 text-emerald-100'
                      : selected
                        ? 'border-amber-400/80 bg-amber-500/25 text-amber-200'
                        : 'border-white/25 bg-black/40 text-transparent';
                    return (
                      <label
                        key={o.id}
                        className={`relative flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 text-left text-sm text-white/88 transition duration-200 ease-out hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] ${rowClass}`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={q.id}
                          value={o.id}
                          checked={selected}
                          onChange={() => selectOption(q.id, o.id)}
                        />
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${radioClass}`}
                        >
                          <CheckIcon className="h-3 w-3" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <span>{o.label}</span>
                          {isCorrectOption ? (
                            <span className="shrink-0 self-start rounded border border-emerald-400/45 bg-emerald-950/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200/95 sm:self-auto">
                              Poprawna odpowiedź
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <div className="border-t border-white/10 pt-6 lg:hidden">
          {submitError ? <p className="mb-3 text-sm text-red-300/90">{submitError}</p> : null}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !allAnswered}
            className="w-full min-h-[52px] rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 px-6 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_28px_rgba(245,158,11,0.35)] transition hover:shadow-[0_0_36px_rgba(245,158,11,0.5)] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
          >
            {submitting ? 'Wysyłanie…' : 'Zakończ i wyślij'}
          </button>
          <div className="mt-3 flex items-center justify-between text-xs text-white/45">
            <span>{saving ? 'Zapisywanie…' : '\u00a0'}</span>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/42 lg:hidden">Postęp zapisywany automatycznie.</p>
        </div>
      </div>

      <aside className="mt-10 flex min-w-0 flex-col gap-0 lg:mt-0 lg:max-h-[calc(100vh-7rem)] lg:sticky lg:top-28">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.14] bg-[#0a0a0c] shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Status sesji</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-white/45">Status</dt>
                  <dd className="font-medium text-emerald-300/95">W trakcie</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/45">Ścieżka</dt>
                  <dd className="max-w-[58%] text-right font-medium text-white/90">{trackLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/45">Próba</dt>
                  <dd className="font-mono text-white/85">#1</dd>
                </div>
              </dl>
            </section>

            <section className="border-t border-white/10 pt-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Postęp</h3>
              <p className="mt-3 font-mono text-sm text-white/85">
                <span className="text-amber-300/95">{answeredCount}</span>
                <span className="text-white/35"> / </span>
                <span>{totalQuestions}</span>
                <span className="ml-2 text-xs font-sans font-normal text-white/45">pytań uzupełnionych</span>
              </p>
              <dl className="mt-3 space-y-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-[11px] text-white/55">
                <div className="flex justify-between gap-2">
                  <dt>Pytania łącznie</dt>
                  <dd className="font-mono text-white/80">{questionStats.total}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Zamknięte (MC)</dt>
                  <dd className="font-mono text-white/80">{questionStats.singleChoice}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Scenariuszowe</dt>
                  <dd className="font-mono text-rose-200/85">{questionStats.openText}</dd>
                </div>
              </dl>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </section>

            <section className="border-t border-white/10 pt-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Timer</h3>
              <p
                className={`mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight transition-colors duration-500 sm:text-4xl ${timerTone}`}
              >
                {timerDisplay}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/38">
                Pozostały czas (min:sek). Limit sesji: {initialAttempt.timeLimitMinutes} min. Egzekwowanie po stronie
                serwera — w kolejnych iteracjach.
              </p>
              <p className="mt-4 text-[10px] leading-relaxed text-white/42">
                Postęp zapisywany automatycznie.
              </p>
            </section>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#070708]/95 p-4 backdrop-blur-md">
            {submitError ? <p className="mb-3 text-xs text-red-300/90">{submitError}</p> : null}
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || !allAnswered}
              className="w-full min-h-[52px] rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 px-5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_28px_rgba(245,158,11,0.35)] transition hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
            >
              {submitting ? 'Wysyłanie…' : 'Zakończ i wyślij'}
            </button>
            <p className="mt-2 text-center text-[10px] text-white/35">{saving ? 'Zapisywanie odpowiedzi…' : '\u00a0'}</p>
          </div>
        </div>
      </aside>
    </div>

    {leaveModalOpen ? (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setLeaveModalOpen(false);
            setLeaveAcknowledged(false);
          }
        }}
      >
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exam-leave-title"
          className="relative z-10 w-full max-w-md rounded-xl border border-red-500/25 bg-[#0c0c0f] p-6 shadow-[0_0_48px_rgba(220,38,38,0.12)]"
        >
          <h2 id="exam-leave-title" className="text-base font-semibold text-white">
            Wyjście awaryjne z egzaminu
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Po wyjściu wrócisz do panelu klienta. Sesja egzaminu pozostanie zapisana — możesz do niej wrócić później z
            modułu certyfikatu.
          </p>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
            <input
              type="checkbox"
              checked={leaveAcknowledged}
              onChange={(e) => setLeaveAcknowledged(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-black/50 text-amber-500 focus:ring-amber-500/40"
            />
            <span>Rozumiem, że przerywam pracę nad egzaminem w tej chwili i chcę opuścić widok egzaminu.</span>
          </label>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="min-h-[44px] rounded-lg border border-white/15 bg-white/[0.06] px-5 text-sm font-semibold text-white/90 transition hover:border-white/25 hover:bg-white/[0.1]"
              onClick={() => {
                setLeaveModalOpen(false);
                setLeaveAcknowledged(false);
              }}
            >
              Zostań przy egzaminie
            </button>
            <button
              type="button"
              disabled={!leaveAcknowledged}
              className="min-h-[44px] rounded-lg border border-red-500/40 bg-red-500/[0.15] px-5 text-sm font-semibold text-red-100 transition hover:border-red-400/55 hover:bg-red-500/[0.22] disabled:pointer-events-none disabled:opacity-40"
              onClick={() => {
                setLeaveModalOpen(false);
                setLeaveAcknowledged(false);
                router.push('/client');
              }}
            >
              Wyjdź do panelu
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
