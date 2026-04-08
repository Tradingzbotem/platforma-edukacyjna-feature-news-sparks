"use client";

/**
 * components/QuizRunner.tsx
 * ...
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  QuizMcqQuestion,
  QuizMcqQuestionPublic,
  QuizQuestion,
  QuizQuestionPublic,
  QuizScenarioQuestion,
  QuizScenarioQuestionPublic,
} from "@/data/quizzes";
import { scenarioAnswerMatches } from "@/lib/quiz/scenarioAnswerGrading";
import {
  clearQuizCompleted,
  clearQuizInProgressStorage,
  writeQuizCompleted,
} from "@/lib/quizClientStorage";
import QuizMcqDecisionBlock from "@/components/quiz/QuizMcqDecisionBlock";
import QuizResultView from "@/components/quiz/QuizResultView";

export type {
  QuizQuestion,
  QuizMcqQuestion,
  QuizScenarioQuestion,
  QuizQuestionPublic,
  QuizMcqQuestionPublic,
  QuizScenarioQuestionPublic,
} from "@/data/quizzes";

const SCENARIO_WRONG_CONSEQUENCE_PLACEHOLDER =
  "np. nieadekwatną reakcję na ryzyko, błędną dokumentację decyzji lub działania trudne do obrony przed audytem (tekst zastępczy).";

function scenarioMechanicSnippet(q: string, maxLen = 72): string {
  const t = q.replace(/\s+/g, " ").trim();
  if (!t) return "omawianego zagadnienia";
  return t.length > maxLen ? `${t.slice(0, maxLen).trim()}…` : t;
}

type ShuffleCfg = {
  seed: number;
  shuffleQ: boolean;
  shuffleO: boolean;
};

type ExamCfg = {
  enabled: boolean;
  durationMs: number;
  startedAt?: number;
  finishAt?: number;
};

type QuizAnswer = number | string | null;

type SavedState = {
  v: 3 | 4;
  slug: string;
  idx: number;
  answers: QuizAnswer[];
  checked: boolean;
  ts: number;
  cfg: ShuffleCfg;
  exam: ExamCfg;
};

function storageKey(slug: string) {
  return `fxedu.quiz.${slug}`;
}
function loadSaved(slug: string): SavedState | null {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed || parsed.slug !== slug) return null;
    if (parsed.v !== 3 && parsed.v !== 4) return null;
    return parsed;
  } catch {
    return null;
  }
}
function saveState(slug: string, data: SavedState) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(data));
  } catch {}
}
function clearState(slug: string) {
  clearQuizInProgressStorage(slug);
}

// New storage keys for list cards and cross-session UX
function keySession(slug: string) {
  return `fxedu:quiz:session:${slug}`;
}
function keyProgress(slug: string) {
  return `fxedu:quiz:progress:${slug}`;
}
function keyStats(slug: string) {
  return `fxedu:quiz:stats:${slug}`;
}

function hashString32(s: string): number {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** RNG deterministyczny (mulberry32) */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffledIndexes(n: number, rand: () => number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Lista id błędnych pytań do trybu ?mode=review (localStorage). */
function quizReviewStorageKey(slug: string) {
  return `quiz_review_${slug}`;
}

/** Jawna ścieżka strony quizu z query — nie polega na `usePathname()`. */
function quizPageHref(pagePath: string | undefined, slug: string, query: Record<string, string>) {
  const base = pagePath ?? `/quizy/${encodeURIComponent(slug)}`;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) q.set(k, v);
  }
  const qs = q.toString();
  return `${base}${qs ? `?${qs}` : ""}`;
}

function clipInsightText(s: string | undefined, maxLen = 200): string {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length <= maxLen ? t : `${t.slice(0, maxLen).trim()}…`;
}

function formatTime(ms: number) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type RenderItemMcq = {
  kind: "mcq";
  q: QuizMcqQuestion | QuizMcqQuestionPublic;
  optionOrder: number[];
  /** W trybie chronionym (bez klucza na kliencie) ustawiane na -1 do czasu weryfikacji API. */
  correctDisplayIndex: number;
};

type RenderItemScenario = {
  kind: "scenario";
  q: QuizScenarioQuestion | QuizScenarioQuestionPublic;
};

type RenderItem = RenderItemMcq | RenderItemScenario;

function isFullMcqQuestion(q: QuizMcqQuestion | QuizMcqQuestionPublic): q is QuizMcqQuestion {
  return typeof (q as QuizMcqQuestion).correctIndex === "number";
}

export type QuizRunnerProps = {
  slug: string;
  title: string;
  questions: (QuizQuestion | QuizQuestionPublic)[];
  backHref?: string;
  /** Pełna ścieżka URL tego quizu (np. `/quizy/podstawy/pip-lot-wartosc`). Domyślnie `/quizy/{slug}`. */
  pagePath?: string;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  seed?: number;
  examMode?: boolean;
  examMinutes?: number;
  startMode?: "quick" | "full" | "exam";
  /** Powtórka tylko błędnych — z `?mode=review` + `quiz_review_{slug}` */
  reviewMode?: boolean;
  /** Tylko konto admina (ustawiane na serwerze): podgląd poprawnej odpowiedzi przed udzieleniem odpowiedzi. */
  adminAnswerPreview?: boolean;
  /**
   * `full` — pełne dane na kliencie (admin).
   * `protected` — bez klucza odpowiedzi w payloadzie; weryfikacja przez `/api/quiz/verify-answer`.
   */
  answerSecrets?: "full" | "protected";
  verifyContext?:
    | { kind: "module"; moduleSlug: string; quizSlug: string }
    | { kind: "pack"; packSlug: string };
};

/** Identyczny SSR + pierwszy paint klienta — bez losowych wartości i localStorage. */
function QuizRunnerSsrShell({ title, backHref = "/quizy" }: { title: string; backHref?: string }) {
  return (
    <div className="min-h-screen bg-[#070a0f] text-zinc-100">
      <div
        className="mx-auto max-w-6xl px-4 pb-32 pt-10"
        aria-busy="true"
        aria-live="polite"
      >
        <nav className="mb-5">
          <a
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <span aria-hidden className="text-zinc-500">
              ←
            </span>{" "}
            Wróć do listy
          </a>
        </nav>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Blok decyzyjny</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50 md:text-2xl">{title}</h1>
        <p className="mt-6 text-sm text-zinc-500">Ładowanie quizu…</p>
      </div>
    </div>
  );
}

export default function QuizRunner(props: QuizRunnerProps) {
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);
  if (!clientMounted) {
    return <QuizRunnerSsrShell title={props.title} backHref={props.backHref} />;
  }
  return <QuizRunnerInner {...props} />;
}

function QuizRunnerInner({
  slug,
  title,
  questions,
  backHref = "/quizy",
  pagePath,
  shuffleQuestions = false,
  shuffleOptions = false,
  seed,
  examMode = false,
  examMinutes = 20,
  startMode,
  reviewMode = false,
  adminAnswerPreview = false,
  answerSecrets = "full",
  verifyContext,
}: QuizRunnerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /** Po ?retry=1 przebudowujemy sesję (nowe mieszanie). */
  const [sessionNonce, setSessionNonce] = useState(0);
  /** Mini-wynik po zakończeniu trybu review (tylko ta seria). */
  const [reviewFinishMeta, setReviewFinishMeta] = useState<{ total: number } | null>(null);

  type ReviewPayload =
    | { status: "inactive" }
    | { status: "missing" }
    | { status: "empty" }
    | { status: "ids"; ids: string[] };

  const reviewPayload: ReviewPayload = useMemo(() => {
    if (!reviewMode) return { status: "inactive" };
    if (typeof window === "undefined") return { status: "missing" };
    try {
      const raw = localStorage.getItem(quizReviewStorageKey(slug));
      if (raw === null) return { status: "missing" };
      const p = JSON.parse(raw) as unknown;
      if (!Array.isArray(p)) return { status: "missing" };
      if (p.length === 0) return { status: "empty" };
      return { status: "ids", ids: p.map(String) };
    } catch {
      return { status: "missing" };
    }
  }, [reviewMode, slug, sessionNonce]);

  // ===== 1) PRÓBA WZNOWIENIA =====
  const [resume, setResume] = useState<SavedState | null>(null);
  useEffect(() => {
    const saved = loadSaved(slug);
    if (saved && !saved.checked && saved.answers?.some((v) => v !== null)) {
      setResume(saved);
    }
  }, [slug]);

  // ===== 2) KONFIG MIXU =====
  const cfg: ShuffleCfg = useMemo(() => {
    if (resume?.cfg) return resume.cfg;
    const generatedSeed =
      typeof seed === "number" ? seed : Math.floor(Math.random() * 2 ** 31);
    return {
      seed: generatedSeed >>> 0,
      shuffleQ: !!shuffleQuestions,
      shuffleO: !!shuffleOptions,
    };
  }, [resume?.cfg, seed, shuffleQuestions, shuffleOptions]);

  // ===== 3) TRYB EGZAMINU =====
  const examInitial: ExamCfg = useMemo(() => {
    if (resume?.exam) return resume.exam;
    const durationMs = Math.max(1, Math.floor((examMinutes || 20) * 60_000));
    if (examMode) {
      const startedAt = Date.now();
      return { enabled: true, durationMs, startedAt, finishAt: startedAt + durationMs };
    }
    return { enabled: false, durationMs };
  }, [resume?.exam, examMode, examMinutes]);

  // ===== 4) BUDOWANIE UKŁADU =====
  function deriveTags(q: QuizQuestion | QuizQuestionPublic): string[] {
    const explicit: any = (q as any).tags;
    if (Array.isArray(explicit) && explicit.length) return explicit.map(String);
    const pref = q.id.includes('-') ? q.id.split('-')[0] : 'GEN';
    return [pref.toUpperCase()];
  }

  function sample<T>(arr: T[], k: number, rand: () => number): T[] {
    const n = arr.length;
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx.slice(0, Math.min(k, n)).map(i => arr[i]);
  }

  function topicLabelForItem(it: RenderItem): string {
    if (it.kind === "mcq" && it.q.topic?.trim()) return it.q.topic.trim();
    return deriveTags(it.q)[0] || "Inne";
  }

  const items: RenderItem[] = useMemo(() => {
    if (reviewPayload.status === "empty") {
      return [];
    }
    // Derive deterministic seed using session id + question ids to keep option order stable per session
    let sessId = '';
    try {
      const s = localStorage.getItem(keySession(slug));
      if (s) sessId = JSON.parse(s)?.sessionId || '';
      if (!sessId) {
        sessId = Math.random().toString(36).slice(2);
        localStorage.setItem(keySession(slug), JSON.stringify({ sessionId: sessId, startedAt: new Date().toISOString(), currentIndex: 0, answers: {} }));
      }
    } catch {}
    const baseSeed = cfg.seed ^ hashString32(slug + '|' + sessId);
    const rand = mulberry32(baseSeed >>> 0);
    let pool = Array.from({ length: questions.length }, (_, i) => i);
    if (reviewPayload.status === "ids") {
      const allow = new Set(reviewPayload.ids);
      const filtered = pool.filter((i) => allow.has(questions[i].id));
      if (filtered.length) pool = filtered;
    }
    if (startMode === "quick" && reviewPayload.status !== "ids") {
      let weak: string[] = [];
      try {
        const raw = localStorage.getItem(`fxedu:quiz:weakTags:${slug}`);
        weak = raw ? (JSON.parse(raw) as string[]) : [];
      } catch {}
      const weakSet = new Set(weak.map((t) => String(t).toUpperCase()));
      const weakIdxs: number[] = [];
      const otherIdxs: number[] = [];
      for (const i of pool) {
        const tags = deriveTags(questions[i]);
        const hasWeak = tags.some((t) => weakSet.has(String(t).toUpperCase()));
        (hasWeak ? weakIdxs : otherIdxs).push(i);
      }
      const totalPick = Math.min(10, pool.length);
      const minWeak = Math.min(weakIdxs.length, Math.ceil(totalPick * 0.6));
      const pickedWeak = sample(weakIdxs, minWeak, rand);
      const pickedOther = sample(
        otherIdxs.filter((i) => !pickedWeak.includes(i)),
        totalPick - pickedWeak.length,
        rand
      );
      pool = [...pickedWeak, ...pickedOther];
    }
    const qOrder = cfg.shuffleQ ? sample(pool, pool.length, rand) : pool;
    const built: RenderItem[] = [];
    for (const qi of qOrder) {
      const q = questions[qi];
      if (q.type === "scenario") {
        built.push({ kind: "scenario", q });
        continue;
      }
      const perQSeed = hashString32(String(baseSeed) + '|' + q.id);
      const randQ = mulberry32(perQSeed >>> 0);
      const optOrder = cfg.shuffleO
        ? shuffledIndexes(q.options.length, randQ)
        : Array.from({ length: q.options.length }, (_, i) => i);
      const correctDisplayIndex = isFullMcqQuestion(q) ? optOrder.indexOf(q.correctIndex) : -1;
      built.push({
        kind: "mcq",
        q,
        optionOrder: optOrder,
        correctDisplayIndex,
      });
    }
    return built;
  }, [questions, cfg.seed, cfg.shuffleQ, cfg.shuffleO, slug, startMode, sessionNonce, reviewPayload]);

  const showReviewChrome = useMemo(() => {
    if (!reviewMode || reviewPayload.status !== "ids") return false;
    if (!items.length) return false;
    const allow = new Set(reviewPayload.ids);
    return items.every((it) => allow.has(it.q.id));
  }, [reviewMode, reviewPayload, items]);

  const total = items.length;

  useEffect(() => {
    setReviewFinishMeta(null);
  }, [slug, sessionNonce]);

  useEffect(() => {
    if (total === 0) return;
    if (answerSecrets === "protected") return;
    const saved = loadSaved(slug);
    if (!saved?.checked) return;
    const a = saved.answers.slice(0, total);
    while (a.length < total) a.push(null);
    setAnswers(a);
    setIdx(clamp(saved.idx, 0, Math.max(0, total - 1)));
    setChecked(true);
    if (saved.exam) setExam(saved.exam);
  }, [slug, total, answerSecrets]);

  // ===== 5) STAN QUIZU =====
  const initialAnswers = useMemo(
    () => Array.from({ length: total }, () => null as QuizAnswer),
    [total]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(initialAnswers);
  const [scenarioDraft, setScenarioDraft] = useState("");
  const [checked, setChecked] = useState(false);
  const [exam, setExam] = useState<ExamCfg>(examInitial);
  const announcedRef = useRef(false);
  /** Po ?retry=1: nowa sesja — bez tego zostaje checked=true i stary zapis przywraca podsumowanie. */
  const lastBlankAnswersKeyRef = useRef("");

  type McqVerifyPayload = {
    isCorrect: boolean;
    correctDisplayIndex: number;
    correctOriginalIndex: number;
    explanation?: string;
    explanationIncorrect?: string;
    consequenceCorrect?: string;
    consequenceWrong?: string;
    correctAnswerLabel?: string;
  };
  type ScenarioVerifyPayload = {
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
    explanationIncorrect?: string;
  };
  const [mcqVerifyByIdx, setMcqVerifyByIdx] = useState<Record<number, McqVerifyPayload>>({});
  const [scenarioVerifyByIdx, setScenarioVerifyByIdx] = useState<Record<number, ScenarioVerifyPayload>>({});
  const [mcqVerifyPending, setMcqVerifyPending] = useState(false);
  const [scenarioVerifyPending, setScenarioVerifyPending] = useState(false);

  useLayoutEffect(() => {
    if (searchParams.get("retry") !== "1") return;
    clearQuizInProgressStorage(slug);
    lastBlankAnswersKeyRef.current = "";
    setSessionNonce((n) => n + 1);
    setChecked(false);
    setIdx(0);
    setReviewFinishMeta(null);
    setScenarioDraft("");
    setResume(null);
    announcedRef.current = false;
    setMcqVerifyByIdx({});
    setScenarioVerifyByIdx({});
    setMcqVerifyPending(false);
    setScenarioVerifyPending(false);
    try {
      window.scrollTo(0, 0);
    } catch {
      /* ignore */
    }
    const p = new URLSearchParams(searchParams.toString());
    p.delete("retry");
    const qs = p.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }, [slug, searchParams, pathname, router]);

  useLayoutEffect(() => {
    if (sessionNonce === 0 || total === 0) return;
    const key = `${sessionNonce}:${total}`;
    if (lastBlankAnswersKeyRef.current === key) return;
    lastBlankAnswersKeyRef.current = key;
    setAnswers(Array.from({ length: total }, () => null));
    setMcqVerifyByIdx({});
    setScenarioVerifyByIdx({});
    setMcqVerifyPending(false);
    setScenarioVerifyPending(false);
  }, [sessionNonce, total]);

  useEffect(() => {
    const it = items[idx];
    if (!it || it.kind !== "scenario") {
      setScenarioDraft("");
      return;
    }
    const a = answers[idx];
    setScenarioDraft(typeof a === "string" ? a : "");
  }, [idx, items, answers]);

  /** Po wznowieniu zapisu: odtwórz wyniki weryfikacji API (tryb chroniony). */
  useEffect(() => {
    if (answerSecrets !== "protected" || !verifyContext || checked || total === 0) return;
    const missing: number[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const a = answers[i];
      if (!it) continue;
      if (it.kind === "mcq" && typeof a === "number" && mcqVerifyByIdx[i] === undefined) missing.push(i);
      if (
        it.kind === "scenario" &&
        typeof a === "string" &&
        a.trim().length > 0 &&
        scenarioVerifyByIdx[i] === undefined
      ) {
        missing.push(i);
      }
    }
    if (missing.length === 0) return;
    let cancelled = false;
    void (async () => {
      for (const i of missing) {
        if (cancelled) return;
        const it = items[i];
        const a = answers[i];
        if (!it) continue;
        try {
          if (it.kind === "mcq" && typeof a === "number") {
            const orig = it.optionOrder[a];
            const body =
              verifyContext.kind === "module"
                ? {
                    scope: "module" as const,
                    moduleSlug: verifyContext.moduleSlug,
                    quizSlug: verifyContext.quizSlug,
                    questionId: it.q.id,
                    mcqOriginalIndex: orig,
                  }
                : {
                    scope: "pack" as const,
                    packSlug: verifyContext.packSlug,
                    questionId: it.q.id,
                    mcqOriginalIndex: orig,
                  };
            const res = await fetch("/api/quiz/verify-answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              setMcqVerifyByIdx((prev) => ({
                ...prev,
                [i]: {
                  isCorrect: false,
                  correctDisplayIndex: -1,
                  correctOriginalIndex: -1,
                  explanationIncorrect:
                    "Nie udało się zweryfikować odpowiedzi. Odśwież stronę lub spróbuj ponownie.",
                },
              }));
              continue;
            }
            const data = (await res.json()) as {
              kind: string;
              isCorrect: boolean;
              correctOriginalIndex: number;
              explanation?: string;
              explanationIncorrect?: string;
              consequenceCorrect?: string;
              consequenceWrong?: string;
              correctAnswerLabel?: string;
            };
            const correctDisplayIndex = it.optionOrder.indexOf(data.correctOriginalIndex);
            setMcqVerifyByIdx((prev) => ({
              ...prev,
              [i]: {
                isCorrect: data.isCorrect,
                correctDisplayIndex,
                correctOriginalIndex: data.correctOriginalIndex,
                explanation: data.explanation,
                explanationIncorrect: data.explanationIncorrect,
                consequenceCorrect: data.consequenceCorrect,
                consequenceWrong: data.consequenceWrong,
                correctAnswerLabel: data.correctAnswerLabel,
              },
            }));
          } else if (it.kind === "scenario" && typeof a === "string" && a.trim()) {
            const body =
              verifyContext.kind === "module"
                ? {
                    scope: "module" as const,
                    moduleSlug: verifyContext.moduleSlug,
                    quizSlug: verifyContext.quizSlug,
                    questionId: it.q.id,
                    scenarioText: a,
                  }
                : {
                    scope: "pack" as const,
                    packSlug: verifyContext.packSlug,
                    questionId: it.q.id,
                    scenarioText: a,
                  };
            const res = await fetch("/api/quiz/verify-answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              setScenarioVerifyByIdx((prev) => ({
                ...prev,
                [i]: {
                  isCorrect: false,
                  correctAnswer: "",
                  explanationIncorrect:
                    "Nie udało się zweryfikować odpowiedzi. Odśwież stronę lub spróbuj ponownie.",
                },
              }));
              continue;
            }
            const data = (await res.json()) as ScenarioVerifyPayload & { kind: string };
            setScenarioVerifyByIdx((prev) => ({
              ...prev,
              [i]: {
                isCorrect: data.isCorrect,
                correctAnswer: data.correctAnswer,
                explanation: data.explanation,
                explanationIncorrect: data.explanationIncorrect,
              },
            }));
          }
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [answerSecrets, verifyContext, checked, total, items, answers, mcqVerifyByIdx, scenarioVerifyByIdx]);

  // ===== 6) „CONTINUE” =====
  function resumeFromSaved() {
    if (!resume) return;
    const a = resume.answers.slice(0, total);
    while (a.length < total) a.push(null);
    setIdx(clamp(resume.idx, 0, total - 1));
    setAnswers(a);
    setChecked(false);
    setExam(resume.exam);
    setResume(null);
  }
  function discardSaved() {
    clearState(slug);
    setResume(null);
  }

  // ===== 7) AUTOSAVE =====
  useEffect(() => {
    const data: SavedState = {
      v: 4,
      slug,
      idx,
      answers,
      checked,
      ts: Date.now(),
      cfg,
      exam,
    };
    saveState(slug, data);

    // mirror session/progress for list cards
    try {
      const sessRaw = localStorage.getItem(keySession(slug));
      const sess = sessRaw ? JSON.parse(sessRaw) : {};
      const answersMap: Record<string, string> = sess.answers || {};
      // only store selected answers (letter labels) per question id
      if (typeof idx === "number" && answers[idx] !== null) {
        const qid = items[idx]?.q.id;
        const sel = answers[idx]!;
        if (typeof sel === "number") {
          answersMap[qid] = String.fromCharCode(65 + sel);
        } else if (typeof sel === "string") {
          answersMap[qid] = sel.length > 120 ? `${sel.slice(0, 120)}…` : sel;
        }
      }
      localStorage.setItem(keySession(slug), JSON.stringify({
        ...sess,
        currentIndex: idx,
        answers: answersMap,
        startedAt: sess.startedAt || new Date().toISOString(),
      }));

      const total = items.length;
      const answered = answers.filter((a) => a !== null).length;
      localStorage.setItem(keyProgress(slug), JSON.stringify({ answered, total }));
    } catch {}
  }, [slug, idx, answers, checked, cfg, exam, items]);

  // ===== 8) WYLICZENIA =====
  const current = items[idx];
  const progressPct = total ? Math.round(((idx + 1) / total) * 100) : 0;

  function evalItemCorrect(i: number): boolean {
    const item = items[i];
    const a = answers[i];
    if (a === null || !item) return false;
    if (item.kind === "scenario") {
      if (answerSecrets === "protected") {
        return scenarioVerifyByIdx[i]?.isCorrect === true;
      }
      return typeof a === "string" && scenarioAnswerMatches(item.q as QuizScenarioQuestion, a);
    }
    if (answerSecrets === "protected") {
      return mcqVerifyByIdx[i]?.isCorrect === true;
    }
    return typeof a === "number" && a === item.correctDisplayIndex;
  }

  function correctAnswerLabel(item: RenderItem, i: number): string {
    if (item.kind === "scenario") {
      if (answerSecrets === "protected") return scenarioVerifyByIdx[i]?.correctAnswer ?? "—";
      return (item.q as QuizScenarioQuestion).correctAnswer;
    }
    const row = mcqVerifyByIdx[i];
    if (answerSecrets === "protected" && row?.correctAnswerLabel) return row.correctAnswerLabel;
    const q = item.q as QuizMcqQuestion;
    return (q.correctAnswer ?? q.options[q.correctIndex] ?? "").trim() || "—";
  }

  function wrongReviewExplanation(item: RenderItem, i: number): string {
    if (answerSecrets === "protected") {
      if (item.kind === "scenario") {
        const v = scenarioVerifyByIdx[i];
        return clipInsightText(v?.explanationIncorrect ?? v?.explanation, 200);
      }
      const v = mcqVerifyByIdx[i];
      return clipInsightText(v?.explanationIncorrect ?? v?.explanation, 200);
    }
    if (item.kind === "scenario") return clipInsightText(item.q.explanation, 200);
    const q = item.q as QuizMcqQuestion;
    return clipInsightText(q.explanationIncorrect ?? q.explanation, 200);
  }

  function practicalMeansForWrong(item: RenderItem, i: number): string {
    if (item.kind !== "mcq") return "";
    if (answerSecrets === "protected") {
      const c = mcqVerifyByIdx[i]?.consequenceWrong?.trim();
      return c ? clipInsightText(c, 220) : "";
    }
    const c = (item.q as QuizMcqQuestion).consequenceWrong?.trim();
    return c ? clipInsightText(c, 220) : "";
  }

  const currentHasMcqPick = current?.kind === "mcq" && typeof answers[idx] === "number";
  const mcqVerifyReady =
    answerSecrets === "full" || (currentHasMcqPick && mcqVerifyByIdx[idx] !== undefined);
  const currentHasScenarioText =
    current?.kind === "scenario" &&
    typeof answers[idx] === "string" &&
    String(answers[idx]).trim().length > 0;
  const scenarioVerifyReady =
    answerSecrets === "full" ||
    (currentHasScenarioText && scenarioVerifyByIdx[idx] !== undefined);

  const currentAnswered =
    current?.kind === "mcq"
      ? currentHasMcqPick && mcqVerifyReady
      : current?.kind === "scenario"
        ? currentHasScenarioText && scenarioVerifyReady
        : answers[idx] !== null;

  const currentCorrect = current && currentAnswered ? evalItemCorrect(idx) : false;

  /** Krok 4 (MCQ): jawny model feedbacku — zsynchronizowany z `answers[idx]` (jedno źródło prawdy w storage). */
  const selectedAnswer: number | null = currentHasMcqPick ? (answers[idx] as number) : null;
  const showFeedback = Boolean(current?.kind === "mcq" && currentHasMcqPick && mcqVerifyReady);

  const correctCount: number = useMemo(
    () =>
      answers.reduce<number>((acc, a, i) => {
        if (a === null) return acc;
        return acc + (evalItemCorrect(i) ? 1 : 0);
      }, 0),
    [answers, items, answerSecrets, mcqVerifyByIdx, scenarioVerifyByIdx]
  );

  const scorePct: number = useMemo(() => {
    return total ? Math.round((correctCount / total) * 100) : 0;
  }, [correctCount, total]);

  const remainingQuestions = useMemo(
    () => answers.filter((a) => a === null).length,
    [answers]
  );

  /** Poprawne z rzędu (kolejność pytań 0…); błąd zeruje serię. */
  const answerStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < total; i++) {
      const a = answers[i];
      if (a === null) break;
      streak = evalItemCorrect(i) ? streak + 1 : 0;
    }
    return streak;
  }, [answers, items, total, answerSecrets, mcqVerifyByIdx, scenarioVerifyByIdx]);

  // persist stats and weak tags after finish
  useEffect(() => {
    if (!checked) return;
    try {
      localStorage.setItem(
        keyStats(slug),
        JSON.stringify({ lastScorePct: scorePct, attempts: undefined, lastAttemptAt: new Date().toISOString() })
      );
      const missMap = new Map<string, number>();
      const countMap = new Map<string, number>();
      items.forEach((it, i) => {
        const tags = (Array.isArray((it.q as any).tags) && (it.q as any).tags.length)
          ? ((it.q as any).tags as string[])
          : deriveTags(it.q);
        const sel = answers[i];
        const isWrong = sel !== null && !evalItemCorrect(i);
        for (const t of tags) {
          countMap.set(t, (countMap.get(t) || 0) + 1);
          if (isWrong) missMap.set(t, (missMap.get(t) || 0) + 1);
        }
      });
      const scored = Array.from(countMap.keys()).map((t) => {
        const misses = missMap.get(t) || 0;
        const totalT = countMap.get(t) || 1;
        return { t, rate: misses / totalT };
      });
      scored.sort((a, b) => b.rate - a.rate);
      const top3 = scored.slice(0, 3).map((x) => x.t);
      localStorage.setItem(`fxedu:quiz:weakTags:${slug}`, JSON.stringify(top3));
    } catch {}
  }, [checked, scorePct, slug, items, answers, answerSecrets, mcqVerifyByIdx, scenarioVerifyByIdx]);

  // ===== 9) HANDLERY =====
  function selectOption(optIndex: number) {
    if (checked) return;
    if (items[idx]?.kind !== "mcq") return;
    if (answers[idx] !== null) return;
    if (mcqVerifyPending) return;
    const at = idx;
    const it = items[at];
    if (!it || it.kind !== "mcq") return;

    if (answerSecrets === "protected") {
      if (!verifyContext) return;
      const orig = it.optionOrder[optIndex];
      setMcqVerifyPending(true);
      void (async () => {
        try {
          const body =
            verifyContext.kind === "module"
              ? {
                  scope: "module" as const,
                  moduleSlug: verifyContext.moduleSlug,
                  quizSlug: verifyContext.quizSlug,
                  questionId: it.q.id,
                  mcqOriginalIndex: orig,
                }
              : {
                  scope: "pack" as const,
                  packSlug: verifyContext.packSlug,
                  questionId: it.q.id,
                  mcqOriginalIndex: orig,
                };
          const res = await fetch("/api/quiz/verify-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = res.ok
            ? ((await res.json()) as {
                kind: string;
                isCorrect: boolean;
                correctOriginalIndex: number;
                explanation?: string;
                explanationIncorrect?: string;
                consequenceCorrect?: string;
                consequenceWrong?: string;
                correctAnswerLabel?: string;
              })
            : null;
          if (!data) {
            setMcqVerifyByIdx((prev) => ({
              ...prev,
              [at]: {
                isCorrect: false,
                correctDisplayIndex: -1,
                correctOriginalIndex: -1,
                explanationIncorrect:
                  "Nie udało się zweryfikować odpowiedzi. Odśwież stronę lub spróbuj ponownie.",
              },
            }));
            setAnswers((prev) => {
              const copy = [...prev];
              copy[at] = optIndex;
              return copy;
            });
            return;
          }
          const correctDisplayIndex = it.optionOrder.indexOf(data.correctOriginalIndex);
          setMcqVerifyByIdx((prev) => ({
            ...prev,
            [at]: {
              isCorrect: data.isCorrect,
              correctDisplayIndex,
              correctOriginalIndex: data.correctOriginalIndex,
              explanation: data.explanation,
              explanationIncorrect: data.explanationIncorrect,
              consequenceCorrect: data.consequenceCorrect,
              consequenceWrong: data.consequenceWrong,
              correctAnswerLabel: data.correctAnswerLabel,
            },
          }));
          setAnswers((prev) => {
            const copy = [...prev];
            copy[at] = optIndex;
            return copy;
          });
        } finally {
          setMcqVerifyPending(false);
        }
      })();
      return;
    }

    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = optIndex;
      return copy;
    });
  }

  function confirmScenarioAnswer() {
    if (checked) return;
    const it = items[idx];
    if (!it || it.kind !== "scenario") return;
    if (answers[idx] !== null) return;
    const t = scenarioDraft.trim();
    if (!t) return;
    if (scenarioVerifyPending) return;
    const at = idx;

    if (answerSecrets === "protected") {
      if (!verifyContext) return;
      setScenarioVerifyPending(true);
      void (async () => {
        try {
          const body =
            verifyContext.kind === "module"
              ? {
                  scope: "module" as const,
                  moduleSlug: verifyContext.moduleSlug,
                  quizSlug: verifyContext.quizSlug,
                  questionId: it.q.id,
                  scenarioText: t,
                }
              : {
                  scope: "pack" as const,
                  packSlug: verifyContext.packSlug,
                  questionId: it.q.id,
                  scenarioText: t,
                };
          const res = await fetch("/api/quiz/verify-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = res.ok
            ? ((await res.json()) as ScenarioVerifyPayload & { kind: string })
            : null;
          if (!data) {
            setScenarioVerifyByIdx((prev) => ({
              ...prev,
              [at]: {
                isCorrect: false,
                correctAnswer: "",
                explanationIncorrect:
                  "Nie udało się zweryfikować odpowiedzi. Odśwież stronę lub spróbuj ponownie.",
              },
            }));
            setAnswers((prev) => {
              const copy = [...prev];
              copy[at] = t;
              return copy;
            });
            return;
          }
          setScenarioVerifyByIdx((prev) => ({
            ...prev,
            [at]: {
              isCorrect: data.isCorrect,
              correctAnswer: data.correctAnswer,
              explanation: data.explanation,
              explanationIncorrect: data.explanationIncorrect,
            },
          }));
          setAnswers((prev) => {
            const copy = [...prev];
            copy[at] = t;
            return copy;
          });
        } finally {
          setScenarioVerifyPending(false);
        }
      })();
      return;
    }

    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = t;
      return copy;
    });
  }
  function prev() {
    if (exam.enabled) return;
    setIdx((i) => Math.max(i - 1, 0));
  }
  function next() {
    setIdx((i) => Math.min(i + 1, total - 1));
  }
  function buildAnswersPayload() {
    let score = 0;
    const answersData = items.map((item, i) => {
      const userAnswer = answers[i];
      const isCorrect = evalItemCorrect(i);
      if (isCorrect) score++;
      const correctAnswer =
        item.kind === "scenario"
          ? answerSecrets === "protected"
            ? scenarioVerifyByIdx[i]?.correctAnswer ?? ""
            : (item.q as QuizScenarioQuestion).correctAnswer
          : answerSecrets === "protected"
            ? mcqVerifyByIdx[i]?.correctOriginalIndex ?? -1
            : item.correctDisplayIndex;
      return {
        questionId: item.q.id,
        userAnswer,
        correctAnswer,
        isCorrect,
        questionKind: item.kind,
      };
    });
    return { score, answersData };
  }

  function submit() {
    if (reviewMode && reviewPayload.status === "ids") {
      const ids = reviewPayload.ids;
      if (items.length > 0 && items.every((it) => ids.includes(it.q.id))) {
        setReviewFinishMeta({ total });
      } else {
        setReviewFinishMeta(null);
      }
    } else {
      setReviewFinishMeta(null);
    }
    setChecked(true);
    if (exam.enabled && exam.finishAt && Date.now() < exam.finishAt) {
      setExam((e) => ({ ...e, finishAt: Date.now() }));
    }
  }

  async function finalizeAndExit() {
    const { score, answersData } = buildAnswersPayload();
    const pct = total ? Math.round((score / total) * 100) : 0;
    const incorrectIds = items
      .map((it, i) => (!evalItemCorrect(i) ? it.q.id : null))
      .filter((id): id is string => id !== null);
    try {
      await fetch("/api/progress/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          score,
          total,
          answers: answersData,
          at: new Date().toISOString(),
        }),
      });
    } catch {}
    writeQuizCompleted(slug, {
      score,
      total,
      percentage: pct,
      completedAt: new Date().toISOString(),
      answersSnapshot: [...answers],
      incorrectIds,
    });
    try {
      localStorage.setItem(
        keyStats(slug),
        JSON.stringify({
          lastScorePct: pct,
          attempts: undefined,
          lastAttemptAt: new Date().toISOString(),
        })
      );
    } catch {}
    try {
      localStorage.removeItem(quizReviewStorageKey(slug));
    } catch {}
    clearQuizInProgressStorage(slug);
    announcedRef.current = false;
    router.push(backHref);
  }
  function reset() {
    setReviewFinishMeta(null);
    setIdx(0);
    setScenarioDraft("");
    setAnswers(Array.from({ length: total }, () => null));
    setChecked(false);
    clearState(slug);
    setResume(null);
    if (examMode) {
      const startedAt = Date.now();
      const dur = Math.max(1, Math.floor((examMinutes || 20) * 60_000));
      setExam({ enabled: true, durationMs: dur, startedAt, finishAt: startedAt + dur });
    } else {
      setExam({ enabled: false, durationMs: examInitial.durationMs });
    }
  }

  function repeatWrongQuestions() {
    const wrongIds = items
      .map((it, i) => (!evalItemCorrect(i) ? it.q.id : null))
      .filter((id): id is string => id !== null);
    if (!wrongIds.length) {
      console.warn("[quiz] review clicked — brak błędnych pytań, pomijam nawigację");
      return;
    }
    console.log("[quiz] review clicked", { slug, wrongCount: wrongIds.length });
    try {
      localStorage.setItem(quizReviewStorageKey(slug), JSON.stringify(wrongIds));
    } catch (e) {
      console.error("[quiz] review — zapis localStorage nieudany", e);
      return;
    }
    announcedRef.current = false;
    clearQuizInProgressStorage(slug);
    const target = quizPageHref(pagePath, slug, { mode: "review", retry: "1" });
    void router.push(target);
  }

  function restartFullQuizFromResults() {
    console.log("[quiz] retry full clicked", { slug });
    try {
      localStorage.removeItem(quizReviewStorageKey(slug));
    } catch {}
    announcedRef.current = false;
    void router.push(quizPageHref(pagePath, slug, { retry: "1", mode: "full" }));
  }

  function goToQuizList() {
    const base = backHref.split("?")[0]?.replace(/\/$/, "") || "/quizy";
    const target = backHref.includes("?") ? backHref : `${base}?mode=full`;
    console.log("[quiz] back to list clicked", { target });
    void router.push(target);
  }

  // ===== 10) SKRÓTY, FOCUS =====
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") return prev();
      if (e.key === "ArrowRight") {
        if (answers[idx] !== null && idx < total - 1) next();
        return;
      }
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, A: 0, B: 1, C: 2, D: 3 };
      if (map[e.key] !== undefined) selectOption(map[e.key]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, checked, total, exam.enabled, answers, items]);

  const qRef = useRef<HTMLHeadingElement | null>(null);
  const scenarioConsequenceRef = useRef<HTMLElement | null>(null);
  const scenarioConsequenceScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    scenarioConsequenceScrolledRef.current = null;
  }, [idx]);

  useEffect(() => {
    if (!total || !current || current.kind !== "scenario" || !currentAnswered) return;
    const k = `${idx}:${current.q.id}`;
    if (scenarioConsequenceScrolledRef.current === k) return;
    scenarioConsequenceScrolledRef.current = k;
    requestAnimationFrame(() => {
      scenarioConsequenceRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [total, current, currentAnswered, idx]);

  useEffect(() => {
    qRef.current?.focus();
  }, [idx]);

  useEffect(() => {
    if (!checked || announcedRef.current) return;
    const msg =
      reviewFinishMeta && total
        ? `Powtórka błędów: poprawiłeś ${correctCount} z ${reviewFinishMeta.total} pozycji`
        : `Wynik: ${correctCount} z ${total} pytań`;
    const el = document.getElementById("quiz-aria-live");
    if (el) el.textContent = msg;
    announcedRef.current = true;
  }, [checked, correctCount, total, reviewFinishMeta]);

  // ===== 11) LICZNIK EGZAMINU =====
  const [timeLeftMs, setTimeLeftMs] = useState(() =>
    exam.enabled && exam.finishAt ? exam.finishAt - Date.now() : 0
  );
  useEffect(() => {
    if (!exam.enabled || checked) return;
    if (!exam.finishAt) {
      const startedAt = exam.startedAt ?? Date.now();
      const finishAt = startedAt + exam.durationMs;
      setExam((e) => ({ ...e, startedAt, finishAt }));
      setTimeLeftMs(finishAt - Date.now());
      return;
    }
    const id = setInterval(() => {
      const left = exam.finishAt! - Date.now();
      setTimeLeftMs(left);
      if (left <= 0) {
        clearInterval(id);
        submit();
      }
    }, 250);
    return () => clearInterval(id);
  }, [exam.enabled, exam.startedAt, exam.finishAt, exam.durationMs, checked]);

  const answeredCount = total - remainingQuestions;

  const modeLabel = exam.enabled
    ? "Egzamin"
    : showReviewChrome
      ? "Poprawa błędów"
      : startMode === "quick"
        ? "Szybki"
        : startMode === "full"
          ? "Pełny"
          : "Pełny";

  useEffect(() => {
    if (checked) return;
    const active =
      idx > 0 ||
      answers.some((a) => a !== null) ||
      (items[idx]?.kind === "scenario" && scenarioDraft.trim().length > 0);
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [checked, idx, answers, items, scenarioDraft]);

  function confirmLeave(): boolean {
    if (checked) return true;
    const active =
      idx > 0 ||
      answers.some((a) => a !== null) ||
      (items[idx]?.kind === "scenario" && scenarioDraft.trim().length > 0);
    if (!active) return true;
    return window.confirm("Przerwiesz egzamin — postęp zostanie utracony");
  }

  const shellClass = exam.enabled
    ? "min-h-screen bg-[#050508] text-zinc-100"
    : "min-h-screen bg-[#070a0f] text-zinc-100";

  // ===== 12) BRAK PYTAŃ =====
  if (!total) {
    const reviewEmpty = reviewMode && reviewPayload.status === "empty";
    return (
      <div className={shellClass}>
        <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
          <nav className="mb-4">
            <a
              href={backHref}
              className="inline-flex items-center gap-2 text-sm rounded-lg px-3 py-2 border border-white/10 bg-white/[0.04] text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span aria-hidden>←</span> Wróć do listy
            </a>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
          {reviewEmpty ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-6">
              <p className="text-lg font-medium text-emerald-100/95">Brak błędów do poprawy — możesz iść dalej.</p>
              <p className="mt-2 text-sm text-white/55">
                Lista powtórki była pusta. Wróć do pełnego quizu albo wybierz kolejny moduł.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("[quiz] empty review — start full quiz", { slug });
                    void router.push(quizPageHref(pagePath, slug, { retry: "1", mode: "full" }));
                  }}
                  className="inline-flex rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                >
                  Rozpocznij pełny quiz
                </button>
                <button
                  type="button"
                  onClick={goToQuizList}
                  className="inline-flex text-sm text-zinc-400 underline decoration-white/20 underline-offset-2 hover:text-zinc-200"
                >
                  Lista quizów
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-white/70">Brak pytań do wyświetlenia.</p>
          )}
        </div>
      </div>
    );
  }

  // ===== 13) PODSUMOWANIE =====
  if (checked) {
    const pct = scorePct;
    const incorrectCount = total - correctCount;

    const strongMap = new Map<string, number>();
    const weakMap = new Map<string, number>();
    items.forEach((it, i) => {
      const a = answers[i];
      const ok = a !== null && evalItemCorrect(i);
      const label = topicLabelForItem(it);
      if (ok) strongMap.set(label, (strongMap.get(label) || 0) + 1);
      else weakMap.set(label, (weakMap.get(label) || 0) + 1);
    });
    const topicsByWeight = (m: Map<string, number>) =>
      Array.from(m.entries())
        .filter(([, c]) => c > 0)
        .sort((x, y) => y[1] - x[1])
        .map(([k]) => k);
    const strongTopics = topicsByWeight(strongMap);
    const weakEntriesSorted = Array.from(weakMap.entries())
      .filter(([, c]) => c > 0)
      .sort((x, y) => y[1] - x[1]);
    const weakTopics = weakEntriesSorted.map(([topic, count]) => ({ topic, count }));

    const wrongReviewItems = items
      .map((it, i) => ({ it, i }))
      .filter(({ it, i }) => {
        const a = answers[i];
        return a === null || !evalItemCorrect(i);
      });

    const hasWrong = wrongReviewItems.length > 0;

    const incorrectQuestions = wrongReviewItems.map(({ it, i }) => {
      const expl = wrongReviewExplanation(it, i);
      const practical = practicalMeansForWrong(it, i);
      return {
        id: it.q.id,
        topic: topicLabelForItem(it),
        question: clipInsightText(it.q.question, 220),
        correctAnswerLabel: correctAnswerLabel(it, i),
        explanation: expl || undefined,
        practical: practical || undefined,
      };
    });

    return (
      <div className={shellClass}>
        <div className="mx-auto max-w-3xl px-4 py-8 pb-32 animate-fade-in">
          <nav className="mb-6">
            <a
              href={backHref}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-200"
            >
              <span aria-hidden className="text-zinc-500">
                ←
              </span>{" "}
              Wróć do listy
            </a>
          </nav>

          <div id="quiz-aria-live" aria-live="polite" className="sr-only" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Podsumowanie</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>

          {reviewFinishMeta ? (
            <div className="mt-6 rounded-2xl border border-teal-500/30 bg-teal-950/25 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/80">Powtórka błędów</p>
              <p className="mt-2 text-xl font-semibold tabular-nums text-teal-50">
                Poprawiłeś{" "}
                <span className="text-teal-200">
                  {correctCount} / {reviewFinishMeta.total}
                </span>{" "}
                błędów
              </p>
              <p className="mt-1 text-sm text-white/50">
                To wynik tej serii naprawczej — pełne podsumowanie i kolejne kroki masz poniżej.
              </p>
            </div>
          ) : null}

          <QuizResultView
            slug={slug}
            score={pct}
            correct={correctCount}
            total={total}
            weakTopics={weakTopics}
            strongTopics={strongTopics}
            incorrectQuestions={incorrectQuestions}
            examFooter={
              exam.enabled ? (
                <p className="mt-4 text-xs text-white/40">
                  Egzamin · {Math.round(exam.durationMs / 60000)} min
                  {exam.startedAt && exam.finishAt ? (
                    <>
                      {" "}
                      · czas: {formatTime(exam.finishAt - (exam.startedAt || 0))}
                    </>
                  ) : null}
                </p>
              ) : null
            }
          />

          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.08] pt-8">
            <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Działania
            </p>
            <button
              type="button"
              onClick={repeatWrongQuestions}
              disabled={!hasWrong}
              title={!hasWrong ? "Nie masz błędów do powtórki" : undefined}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3.5 text-center text-base font-semibold text-slate-950 shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Powtórz błędne
            </button>
            <button
              type="button"
              onClick={restartFullQuizFromResults}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-center text-base font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              Rozwiąż ponownie
            </button>
            <button
              type="button"
              onClick={goToQuizList}
              className="w-full rounded-xl py-3 text-center text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
            >
              Wróć
            </button>
            <button
              type="button"
              onClick={() => void finalizeAndExit()}
              className="w-full rounded-xl border border-white/12 bg-transparent px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              Zapisz wynik i zakończ
            </button>
            <p className="text-center text-[11px] text-white/35">
              Zapis na koncie i w przeglądarce, potem powrót do listy quizów.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/40">
              <Link href={`${backHref}?mode=quick`} className="underline decoration-white/20 underline-offset-2 hover:text-white/65">
                Szybka powtórka (10)
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearQuizInProgressStorage(slug);
                  clearQuizCompleted(slug);
                  try {
                    localStorage.removeItem(keyStats(slug));
                  } catch {}
                  router.push(backHref);
                }}
                className="underline decoration-white/20 underline-offset-2 hover:text-white/65"
              >
                Wyczyść zapis lokalny
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== 14) EKRAN GŁÓWNY =====
  const barGradient = exam.enabled
    ? timeLeftMs <= 60_000
      ? "from-red-600 via-orange-500 to-amber-400"
      : "from-zinc-500 via-zinc-400 to-zinc-300"
    : "from-emerald-500 via-teal-400 to-cyan-400";

  const panelClass = exam.enabled
    ? "border-white/[0.08] bg-[#0a0a0c]/90"
    : "border-white/10 bg-[#0c1018]/90";

  return (
    <div className={`${shellClass} relative`}>
      <div
        className="fixed left-0 right-0 top-0 z-50 h-1 bg-zinc-900"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Postęp quizu"
      >
        <div
          className={`h-full bg-gradient-to-r ${barGradient} transition-[width] duration-500 ease-out`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-32 pt-10 animate-fade-in">
        {resume && (
          <div
            className={`mb-5 rounded-lg border px-4 py-3.5 ${exam.enabled ? "border-red-500/25 bg-red-950/30" : "border-amber-500/25 bg-amber-950/25"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-200">
                Znaleziono niedokończony quiz.
                {resume.exam?.enabled && resume.exam.finishAt && (
                  <>
                    {" "}
                    Pozostały czas: <b className="tabular-nums">{formatTime(resume.exam.finishAt - Date.now())}</b>.
                  </>
                )}{" "}
                Wrócić do pytania <b>{Math.min(resume.idx + 1, total)}</b>?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resumeFromSaved}
                  className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white"
                >
                  Kontynuuj
                </button>
                <button
                  type="button"
                  onClick={discardSaved}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.04]"
                >
                  Zacznij od nowa
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="mb-5">
          <a
            href={backHref}
            onClick={(e) => {
              if (!confirmLeave()) e.preventDefault();
            }}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <span aria-hidden className="text-zinc-500">
              ←
            </span>{" "}
            Wróć do listy
          </a>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <div className="min-w-0">
            <header className="mb-6 border-b border-white/[0.06] pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {showReviewChrome ? "Powtórka decyzyjna" : "Blok decyzyjny"}
                  </p>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50 md:text-2xl">{title}</h1>
                  <p className="mt-2 text-sm tabular-nums text-zinc-400">
                    Pytanie <span className="font-medium text-zinc-100">{idx + 1}</span> / {total}
                    {showReviewChrome ? (
                      <span className="text-zinc-600"> · tylko wcześniejsze błędy</span>
                    ) : null}
                  </p>
                  {showReviewChrome ? (
                    <p className="mt-2 text-xs leading-relaxed text-amber-200/75">
                      Ten przebieg skupia się na naprawie — wybierz świadomie, potem porównaj z uzasadnieniem.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {showReviewChrome ? (
                    <span className="rounded border border-amber-500/45 bg-amber-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-100">
                      Tryb poprawy błędów
                    </span>
                  ) : null}
                  <span
                    className={`rounded border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      exam.enabled
                        ? "border-red-500/35 bg-red-950/40 text-red-200"
                        : "border-white/15 bg-white/[0.04] text-zinc-300"
                    }`}
                  >
                    {modeLabel}
                  </span>
                  {(cfg.shuffleQ || cfg.shuffleO) && (
                    <span className="rounded border border-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Losowanie
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Skróty: <kbd className="rounded border border-white/10 bg-white/[0.04] px-1">←</kbd>{" "}
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1">→</kbd>,{" "}
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1">A</kbd>–
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1">D</kbd>
              </p>

              <div className="mt-4 flex flex-wrap gap-3 lg:hidden">
                {exam.enabled && (
                  <div
                    className={[
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium tabular-nums",
                      timeLeftMs <= 60_000
                        ? "border-red-500/40 bg-red-950/40 text-red-100"
                        : "border-white/10 bg-white/[0.03] text-zinc-200",
                    ].join(" ")}
                    aria-live="polite"
                  >
                    <span className="text-zinc-500">Czas</span>
                    {formatTime(timeLeftMs)}
                  </div>
                )}
                <div className={`flex flex-1 flex-col gap-1 rounded-lg border px-3 py-2 text-xs ${panelClass}`}>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-zinc-500">
                      Odpowiedzi:{" "}
                      <strong className="tabular-nums text-zinc-100">{answeredCount}</strong> / {total}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500">
                      Pozostałe: <strong className="tabular-nums text-zinc-200">{remainingQuestions}</strong>
                    </span>
                  </div>
                  {answerStreak >= 2 ? (
                    <span className="font-medium text-emerald-200/90">
                      {answerStreak} dobre z rzędu
                    </span>
                  ) : null}
                </div>
              </div>
            </header>

            {current.kind === "scenario" ? (
              <article
                className={[
                  "rounded-lg border-l-2 p-5 sm:p-7",
                  exam.enabled ? "border-l-red-500/60 bg-[#08080a]" : "border-l-amber-500/50 bg-[#0a0c10]",
                  currentAnswered
                    ? currentCorrect
                      ? "ring-1 ring-emerald-500/20"
                      : "ring-1 ring-red-500/20"
                    : "",
                ].join(" ")}
              >
                <div className="space-y-6">
                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Scenariusz</p>
                    <h2
                      ref={qRef}
                      tabIndex={-1}
                      className="mt-2 text-base font-medium leading-relaxed text-zinc-100 sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 rounded-sm"
                    >
                      {current.q.question}
                    </h2>
                  </section>

                  <section className="border-t border-white/[0.06] pt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Decyzja</p>
                    {showReviewChrome && !currentAnswered ? (
                      <p className="mt-2 text-xs leading-relaxed text-amber-200/70">
                        Wracasz do scenariusza, który wcześniej poszedł nietraf — dopasuj odpowiedź do wzorca.
                      </p>
                    ) : null}
                    <div
                      className={[
                        "mt-3 rounded-lg p-3 sm:p-4",
                        currentAnswered
                          ? currentCorrect
                            ? "border border-emerald-500/40 bg-emerald-950/15 shadow-[0_0_40px_-12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/20"
                            : "border border-red-500/40 bg-red-950/15 shadow-[0_0_40px_-12px_rgba(248,113,113,0.22)] ring-1 ring-red-500/20"
                          : "",
                      ].join(" ")}
                    >
                      {!currentAnswered ? (
                        <div className="space-y-3">
                          {adminAnswerPreview && !checked && answerSecrets === "full" ? (
                            <div className="rounded-lg border border-amber-500/45 bg-amber-950/25 px-3 py-2.5 text-sm leading-relaxed text-amber-50/95">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/90">
                                Podgląd admina — wzorzec odpowiedzi
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-amber-50/95">
                                {(current.q as QuizScenarioQuestion).correctAnswer}
                              </p>
                            </div>
                          ) : null}
                          <label htmlFor={`scenario-${current.q.id}`} className="sr-only">
                            Twoja decyzja — opis działania
                          </label>
                          <textarea
                            id={`scenario-${current.q.id}`}
                            value={scenarioDraft}
                            onChange={(e) => setScenarioDraft(e.target.value)}
                            rows={5}
                            disabled={checked || scenarioVerifyPending}
                            placeholder="Sformułuj decyzję operacyjną (krótko, w punktach)…"
                            className="w-full resize-y rounded-lg border border-white/12 bg-black/40 px-4 py-3.5 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15"
                          />
                          <button
                            type="button"
                            onClick={confirmScenarioAnswer}
                            disabled={checked || !scenarioDraft.trim() || scenarioVerifyPending}
                            className="rounded-lg border border-white/20 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            Zatwierdź decyzję
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white/10 bg-black/35 px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Zapisana decyzja
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{String(answers[idx])}</p>
                        </div>
                      )}
                      {currentAnswered ? (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-4 animate-fade-in" aria-live="polite">
                          {currentCorrect ? (
                            <span className="inline-flex items-center rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-100">
                              Poprawna odpowiedź
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-red-400/45 bg-red-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-100">
                              Niepoprawna odpowiedź
                            </span>
                          )}
                          {!currentCorrect ? (
                            <span className="text-[11px] text-zinc-500">
                              Poniżej — wzorzec odpowiedzi podświetlony na zielono.
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </section>

                  <section
                    ref={scenarioConsequenceRef}
                    className={[
                      "border-t border-white/[0.06] pt-6 scroll-mt-28",
                      currentAnswered ? "rounded-lg ring-2 ring-offset-2 ring-offset-[#0a0c10] ring-zinc-500/35 transition-shadow duration-500" : "",
                    ].join(" ")}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Konsekwencja</p>
                    {!currentAnswered ? (
                      <p className="mt-2 text-sm text-zinc-600">
                        {exam.enabled
                          ? "Bez oceny do momentu zatwierdzenia — w egzaminie liczy się spójność, nie długość tekstu."
                          : "Po zatwierdzeniu zobaczysz, czy Twoja decyzja mieści się w oczekiwanym wzorcu."}
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3 animate-fade-in">
                        <p className="text-sm leading-relaxed text-zinc-200">
                          {currentCorrect ? (
                            <>
                              <span className="mr-1.5 inline-block" aria-hidden>
                                👉
                              </span>
                              Dobra decyzja — to oznacza, że rozumiesz mechanikę{" "}
                              <span className="font-medium text-zinc-50">
                                „{scenarioMechanicSnippet(current.q.question)}”
                              </span>
                              <span className="text-zinc-500"> (placeholder — docelowo precyzyjny opis tematu).</span>
                            </>
                          ) : (
                            <>
                              <span className="mr-1.5 inline-block" aria-hidden>
                                👉
                              </span>
                              Błąd — w praktyce oznaczałoby to:{" "}
                              <span className="font-medium text-zinc-100">{SCENARIO_WRONG_CONSEQUENCE_PLACEHOLDER}</span>
                            </>
                          )}
                        </p>
                        {!currentCorrect ? (
                          <div className="rounded-lg border border-emerald-500/45 bg-emerald-950/25 p-4 text-sm leading-relaxed text-emerald-100/95 shadow-[0_0_28px_-10px_rgba(52,211,153,0.35)]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/85">
                              Poprawna odpowiedź (wzorzec)
                            </span>
                            <p className="mt-2 font-medium text-emerald-50">
                              {answerSecrets === "protected"
                                ? scenarioVerifyByIdx[idx]?.correctAnswer ?? "—"
                                : (current.q as QuizScenarioQuestion).correctAnswer}
                            </p>
                          </div>
                        ) : null}
                        {(answerSecrets === "protected"
                          ? scenarioVerifyByIdx[idx]?.explanation || scenarioVerifyByIdx[idx]?.explanationIncorrect
                          : (current.q as QuizScenarioQuestion).explanation ||
                            (current.q as QuizScenarioQuestion).explanationIncorrect) ? (
                          <div
                            key={`quiz-fb-${idx}`}
                            className={[
                              "rounded-lg border p-4 text-sm leading-relaxed",
                              currentCorrect
                                ? "border-emerald-500/25 bg-emerald-950/20 text-emerald-100/95"
                                : "border-red-500/25 bg-red-950/30 text-red-100/95",
                            ].join(" ")}
                          >
                            <span className="font-semibold">{currentCorrect ? "Dlaczego: " : "Dlaczego to nietrafione: "}</span>
                            <span className="font-normal opacity-95">
                              {answerSecrets === "protected"
                                ? currentCorrect
                                  ? (scenarioVerifyByIdx[idx]?.explanation ??
                                    scenarioVerifyByIdx[idx]?.explanationIncorrect)
                                  : (scenarioVerifyByIdx[idx]?.explanationIncorrect ??
                                    scenarioVerifyByIdx[idx]?.explanation)
                                : currentCorrect
                                  ? ((current.q as QuizScenarioQuestion).explanation ??
                                    (current.q as QuizScenarioQuestion).explanationIncorrect)
                                  : ((current.q as QuizScenarioQuestion).explanationIncorrect ??
                                    (current.q as QuizScenarioQuestion).explanation)}
                            </span>
                          </div>
                        ) : (
                          <p className="rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2 text-xs text-zinc-500">
                            Szczegółowe uzasadnienie z bazy pytań zostanie tu podpięte w kolejnym kroku (placeholder).
                          </p>
                        )}

                        {showReviewChrome && currentAnswered ? (
                          <p className="rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs font-medium leading-relaxed text-amber-100/90">
                            <span className="mr-1" aria-hidden>
                              👉
                            </span>
                            Sprawdź, czy już rozumiesz — jeśli tak, idź dalej; jeśli nie, zatrzymaj się na tym punkcie.
                          </p>
                        ) : null}

                        <p
                          className={[
                            "text-xs leading-relaxed",
                            currentCorrect ? "text-emerald-200/90" : "text-amber-200/85",
                          ].join(" ")}
                        >
                          <span className="mr-1" aria-hidden>
                            👉
                          </span>
                          {showReviewChrome
                            ? currentCorrect
                              ? "Dobrze — utrwal to przy kolejnych decyzjach."
                              : "Przejrzyj uzasadnienie i zapamiętaj wzorzec."
                            : currentCorrect
                              ? "OK — przejdź dalej"
                              : "Zwróć uwagę — to częsty błąd początkujących"}
                        </p>

                        {currentCorrect && answerStreak >= 1 ? (
                          <p className="text-sm font-medium text-zinc-200">
                            {answerStreak === 1
                              ? "1 dobra odpowiedź z rzędu"
                              : `${answerStreak} dobre odpowiedzi z rzędu`}
                          </p>
                        ) : null}

                        <div className="border-t border-white/[0.08] pt-4">
                          {idx < total - 1 ? (
                            <button
                              type="button"
                              onClick={next}
                              className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-white sm:w-auto"
                            >
                              <span aria-hidden>👉</span>
                              Dalej →
                            </button>
                          ) : (
                            <p className="text-xs text-zinc-500">
                              {showReviewChrome
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
            ) : (
              <QuizMcqDecisionBlock
                questionId={current.q.id}
                question={current.q.question}
                optionOrder={current.optionOrder}
                options={current.q.options}
                correctDisplayIndex={
                  answerSecrets === "protected" && mcqVerifyByIdx[idx]
                    ? mcqVerifyByIdx[idx].correctDisplayIndex
                    : current.correctDisplayIndex
                }
                selectedAnswer={selectedAnswer}
                showFeedback={showFeedback}
                examEnabled={exam.enabled}
                locked={checked}
                onSelect={selectOption}
                explanation={
                  answerSecrets === "protected" && mcqVerifyByIdx[idx]
                    ? mcqVerifyByIdx[idx].explanation
                    : (current.q as QuizMcqQuestion).explanation
                }
                explanationIncorrect={
                  answerSecrets === "protected" && mcqVerifyByIdx[idx]
                    ? mcqVerifyByIdx[idx].explanationIncorrect
                    : (current.q as QuizMcqQuestion).explanationIncorrect
                }
                consequenceCorrect={
                  answerSecrets === "protected" && mcqVerifyByIdx[idx]
                    ? mcqVerifyByIdx[idx].consequenceCorrect
                    : (current.q as QuizMcqQuestion).consequenceCorrect
                }
                consequenceWrong={
                  answerSecrets === "protected" && mcqVerifyByIdx[idx]
                    ? mcqVerifyByIdx[idx].consequenceWrong
                    : (current.q as QuizMcqQuestion).consequenceWrong
                }
                canGoNext={idx < total - 1}
                onNext={next}
                answerStreak={answerStreak}
                reviewMode={showReviewChrome}
                adminAnswerPreview={adminAnswerPreview}
                verifyPending={answerSecrets === "protected" && mcqVerifyPending}
              />
            )}
          </div>

          <aside className={`hidden lg:block ${panelClass} sticky top-24 rounded-lg border p-4`}>
            {exam.enabled && (
              <div
                className={[
                  "mb-4 rounded-lg border px-3 py-3 text-center",
                  timeLeftMs <= 60_000
                    ? "border-red-500/40 bg-red-950/50"
                    : "border-white/10 bg-black/30",
                ].join(" ")}
                aria-live="polite"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Timer</p>
                <p
                  className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${
                    timeLeftMs <= 60_000 ? "text-red-200" : "text-zinc-100"
                  }`}
                >
                  {formatTime(timeLeftMs)}
                </p>
              </div>
            )}
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Odpowiedzi</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-50">
                  {answeredCount} <span className="text-zinc-600">/</span> {total}
                </dd>
              </div>
              <div className="border-t border-white/[0.06] pt-4">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</dt>
                <dd className="mt-2 space-y-1 text-zinc-300">
                  <p>
                    Ukończone:{" "}
                    <strong className="tabular-nums text-zinc-100">{answeredCount}</strong>
                  </p>
                  <p>
                    Pozostałe:{" "}
                    <strong className="tabular-nums text-zinc-100">{remainingQuestions}</strong>
                  </p>
                </dd>
              </div>
              <div className="border-t border-white/[0.06] pt-4">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Seria</dt>
                <dd className="mt-1 space-y-1 text-zinc-200">
                  <p className="text-lg font-semibold tabular-nums text-zinc-50">{answerStreak}</p>
                  {answerStreak >= 2 ? (
                    <p className="text-xs font-medium text-emerald-200/90">
                      {answerStreak} dobre odpowiedzi z rzędu
                    </p>
                  ) : answerStreak === 1 ? (
                    <p className="text-xs text-zinc-500">1 dobra z rzędu — trzymaj tempo</p>
                  ) : (
                    <p className="text-xs text-zinc-500">Odpowiedz poprawnie, by zbudować serię</p>
                  )}
                </dd>
              </div>
            </dl>
            {exam.enabled && (
              <p className="mt-4 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-zinc-600">
                Tryb egzaminu: bez cofania, napięcie czasowe, surowszy układ decyzji.
              </p>
            )}
          </aside>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#050508]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {!currentAnswered ? (
            <p className="text-center text-xs text-zinc-500 sm:text-left">
              {current.kind === "scenario"
                ? "Najpierw zatwierdź decyzję — potem możesz przejść dalej."
                : "Najpierw wybierz odpowiedź."}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={prev}
              className="min-h-[44px] rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={idx === 0 || exam.enabled}
              title={exam.enabled ? "W trybie egzaminu nie można cofać." : undefined}
            >
              Poprzednie
            </button>
            {currentAnswered && idx < total - 1 ? (
              <button
                type="button"
                onClick={next}
                className="min-h-[44px] rounded-lg border-2 border-emerald-500/50 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-100 shadow-[0_0_20px_-8px_rgba(52,211,153,0.4)] transition hover:border-emerald-400/60 hover:bg-emerald-500/25"
              >
                Dalej
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={submit}
            className={`min-h-[44px] rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${
              exam.enabled
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-zinc-100 text-zinc-950 hover:bg-white"
            }`}
            disabled={answers.every((a) => a === null)}
          >
            {exam.enabled
              ? "Zakończ egzamin"
              : showReviewChrome
                ? "Zakończ powtórkę"
                : "Zakończ i sprawdź"}
          </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
