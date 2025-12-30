"use client";

/**
 * components/QuizRunner.tsx
 * ...
 */

import { useEffect, useMemo, useRef, useState } from "react";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

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

type SavedState = {
  v: 3;
  slug: string;
  idx: number;
  answers: Array<number | null>;
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
    if (parsed.v !== 3) return null;
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
  try {
    localStorage.removeItem(storageKey(slug));
  } catch {}
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
function formatTime(ms: number) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type RenderItem = {
  q: QuizQuestion;
  optionOrder: number[];
  correctDisplayIndex: number;
};

export default function QuizRunner({
  slug,
  title,
  questions,
  backHref = "/quizy",
  shuffleQuestions = false,
  shuffleOptions = false,
  seed,
  examMode = false,
  examMinutes = 20,
  startMode,
}: {
  slug: string;
  title: string;
  questions: QuizQuestion[];
  backHref?: string;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  seed?: number;
  examMode?: boolean;
  examMinutes?: number;
  startMode?: 'quick' | 'full' | 'exam';
}) {
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
  function deriveTags(q: QuizQuestion): string[] {
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

  const items: RenderItem[] = useMemo(() => {
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
    if (startMode === 'quick') {
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
      const perQSeed = hashString32(String(baseSeed) + '|' + q.id);
      const randQ = mulberry32(perQSeed >>> 0);
      const optOrder = cfg.shuffleO
        ? shuffledIndexes(q.options.length, randQ)
        : Array.from({ length: q.options.length }, (_, i) => i);
      const correctDisplayIndex = optOrder.indexOf(q.correctIndex);
      built.push({ q, optionOrder: optOrder, correctDisplayIndex });
    }
    return built;
  }, [questions, cfg.seed, cfg.shuffleQ, cfg.shuffleO, slug, startMode]);

  const total = items.length;

  // ===== 5) STAN QUIZU =====
  const initialAnswers = useMemo(
    () => Array.from({ length: total }, () => null as number | null),
    [total]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(initialAnswers);
  const [checked, setChecked] = useState(false);
  const [exam, setExam] = useState<ExamCfg>(examInitial);

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
      v: 3,
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
      if (typeof idx === 'number' && answers[idx] !== null) {
        const qid = items[idx]?.q.id;
        const sel = answers[idx]!;
        answersMap[qid] = String.fromCharCode(65 + sel);
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
  }, [slug, idx, answers, checked, cfg, exam]);

  // ===== 8) WYLICZENIA =====
  const current = items[idx];
  const progressPct = total ? Math.round(((idx + 1) / total) * 100) : 0;

  const correctCount: number = useMemo(
    () =>
      answers.reduce<number>((acc, a, i) => {
        if (a === null) return acc;
        return acc + (a === items[i].correctDisplayIndex ? 1 : 0);
      }, 0),
    [answers, items]
  );

  const scorePct: number = useMemo(() => {
    return total ? Math.round((correctCount / total) * 100) : 0;
  }, [correctCount, total]);

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
        const isWrong = sel !== null && sel !== it.correctDisplayIndex;
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
  }, [checked, scorePct, slug, items, answers]);

  // ===== 9) HANDLERY =====
  function selectOption(optIndex: number) {
    if (checked) return;
    if (answers[idx] !== null) return; // lock per question after first selection
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = optIndex;
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
  function submit() {
    setChecked(true);
    if (exam.enabled && exam.finishAt && Date.now() < exam.finishAt) {
      setExam((e) => ({ ...e, finishAt: Date.now() }));
    }
  }
  function reset() {
    setIdx(0);
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

  // ===== 10) SKRÓTY, FOCUS =====
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") return prev();
      if (e.key === "ArrowRight") return next();
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, A: 0, B: 1, C: 2, D: 3 };
      if (map[e.key] !== undefined) selectOption(map[e.key]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, checked, total, exam.enabled]);

  const qRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    qRef.current?.focus();
  }, [idx]);

  const announcedRef = useRef(false);
  useEffect(() => {
    if (!checked || announcedRef.current) return;
    const msg = `Wynik: ${correctCount} z ${total} pytań`;
    const el = document.getElementById("quiz-aria-live");
    if (el) el.textContent = msg;
    announcedRef.current = true;
  }, [checked, correctCount, total]);

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

  // ===== 12) BRAK PYTAŃ =====
  if (!total) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <nav className="mb-4">
          <a
            href={backHref}
            className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
          >
            <span aria-hidden>←</span> Wróć do listy
          </a>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <p className="mt-2 opacity-80">Brak pytań do wyświetlenia.</p>
      </div>
    );
  }

  // ===== 13) PODSUMOWANIE =====
  if (checked) {
    const pct = scorePct;
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <nav className="mb-4">
          <a
            href={backHref}
            className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
          >
            <span aria-hidden>←</span> Wróć do listy
          </a>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-lg">
            <span>Twój wynik:</span> <b>{correctCount}</b> / <span>{total}</span> (<b>{pct}%</b>)
          </p>
          {exam.enabled && (
            <p className="mt-1 text-sm opacity-70">
              <span>Tryb egzaminu:</span> <span>{Math.round(exam.durationMs / 60000)}</span> <span>min</span>
              {exam.startedAt && exam.finishAt && (
                <> · <span>czas wykorzystany:</span> <span>{formatTime(exam.finishAt - (exam.startedAt || 0))}</span> </>
              )}
            </p>
          )}
          {(cfg.shuffleQ || cfg.shuffleO) && (
            <p className="mt-1 text-sm opacity-70">
              Układ mieszany (seed: <code>{cfg.seed}</code>, pytania: {cfg.shuffleQ ? "TAK" : "NIE"}, opcje:{" "}
              {cfg.shuffleO ? "TAK" : "NIE"}).
            </p>
          )}
          <div id="quiz-aria-live" aria-live="polite" className="sr-only" />
        </header>

        <section className="space-y-4">
          {items.map((item, i) => {
            const sel = answers[i];
            const ok = sel !== null && sel === item.correctDisplayIndex;
            return (
              <article
                key={item.q.id}
                className={[
                  "rounded-2xl border p-5",
                  ok ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold leading-snug">
                    {i + 1}. {item.q.question}
                  </h3>
                  <span
                    className={[
                      "inline-flex min-w-[80px] items-center justify-center rounded-full border px-2 py-1 text-xs font-semibold",
                      ok ? "border-green-400 text-green-200" : "border-red-400 text-red-200",
                    ].join(" ")}
                  >
                    {ok ? "✔ Poprawna" : "✖ Niepoprawna"}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 text-sm">
                  {item.optionOrder.map((origIdx, j) => {
                    const isCorrect = j === item.correctDisplayIndex;
                    const isSelected = sel === j;
                    return (
                      <li key={j} className="flex items-start gap-2">
                        <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span
                          className={[
                            isCorrect ? "font-semibold" : "",
                            isSelected && !isCorrect ? "underline decoration-dotted" : "",
                          ].join(" ")}
                        >
                          {item.q.options[origIdx]}
                          {isCorrect && <em className="ml-2 text-xs opacity-70">(poprawna)</em>}
                          {isSelected && !isCorrect && (
                            <em className="ml-2 text-xs opacity-70">(zaznaczona)</em>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {item.q.explanation && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                    <b>Wyjaśnienie:</b> {item.q.explanation}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-white px-5 py-2 font-semibold text-slate-900 hover:opacity-90"
          >
            Powtórz quiz
          </button>
          <a
            href={`${backHref}?mode=quick`}
            className="rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-300"
          >
            Szybka powtórka (10)
          </a>
          <button
            type="button"
            onClick={() => clearState(slug)}
            className="rounded-xl border px-4 py-2 hover:bg-white/10"
            title="Usuń zapis z urządzenia"
          >
            Wyczyść zapis
          </button>
        </div>
      </div>
    );
  }

  // ===== 14) EKRAN GŁÓWNY =====
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {resume && (
        <div className="mb-4 rounded-2xl border border-white/20 bg-yellow-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              Znaleziono niedokończony quiz.
              {resume.exam?.enabled && resume.exam.finishAt && (
                <> Pozostały czas: <b>{formatTime(resume.exam.finishAt - Date.now())}</b>.</>
              )}{" "}
              Wrócić do pytania <b>{Math.min(resume.idx + 1, total)}</b>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={resumeFromSaved}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90"
              >
                Kontynuuj
              </button>
              <button
                onClick={discardSaved}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-white/10"
              >
                Zacznij od nowa
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="mb-4">
        <a
          href={backHref}
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          <span aria-hidden>←</span> Wróć do listy
        </a>
      </nav>

      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            <p className="mt-1 opacity-80">
              <span>{total}</span> <span>pytań jednokrotnego wyboru. Skróty: ← → oraz A/B/C/D.</span>
            </p>
            {(cfg.shuffleQ || cfg.shuffleO) && (
              <p className="mt-1 text-xs opacity-70">
                Układ mieszany (seed: <code>{cfg.seed}</code>, pytania: {cfg.shuffleQ ? "TAK" : "NIE"}, opcje:{" "}
                {cfg.shuffleO ? "TAK" : "NIE"}).
              </p>
            )}
          </div>

          {exam.enabled && (
            <div
              className={[
                "rounded-xl border px-4 py-2 text-sm font-semibold",
                timeLeftMs <= 60_000 ? "border-red-400 text-red-200" : "border-white/20 opacity-90",
              ].join(" ")}
              aria-live="polite"
            >
              <span>⏳ </span><span>Pozostało:</span> <span>{formatTime(timeLeftMs)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 h-2 w-full rounded-full bg-white/10" aria-hidden>
          <div className="h-2 rounded-full bg-white" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-1 text-xs opacity-70">
          <span>Pytanie</span> <span>{idx + 1}</span> / <span>{total}</span> {exam.enabled && <span>· <span>Tryb egzaminu</span></span>}
        </div>
      </header>

      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
        <h2
          ref={qRef}
          tabIndex={-1}
          className="text-lg font-semibold leading-snug focus:outline-none focus:ring-2 focus:ring-white/40 rounded-md"
        >
          {current.q.question}
        </h2>

        <ul className="mt-4 space-y-2">
          {current.optionOrder.map((origIdx, i) => {
            const isSelected = answers[idx] === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectOption(i)}
                  className={[
                    "w-full text-left rounded-xl border px-4 py-3 transition",
                    isSelected ? "bg-white text-slate-900" : "hover:bg-white/10",
                    !isSelected ? "border-white/10" : "border-white",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{current.q.options[origIdx]}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {answers[idx] !== null && current.q.explanation && (
          <details className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <summary className="cursor-pointer list-none">
              <span className="underline decoration-dotted">Wyjaśnienie</span>
            </summary>
            <div className="mt-2">{current.q.explanation}</div>
          </details>
        )}
      </article>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="rounded-xl border px-4 py-2 hover:bg-white/10 disabled:opacity-40"
            disabled={idx === 0 || exam.enabled}
            title={exam.enabled ? "W trybie egzaminu nie można cofać." : undefined}
          >
            ← Poprzednie
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-xl border px-4 py-2 hover:bg-white/10 disabled:opacity-40"
            disabled={idx === total - 1}
          >
            Następne →
          </button>
        </div>

        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-white px-5 py-2 font-semibold text-slate-900 hover:opacity-90 disabled:opacity-40"
          disabled={answers.every((a) => a === null)}
        >
          Zakończ / Sprawdź
        </button>
      </div>
    </div>
  );
}
