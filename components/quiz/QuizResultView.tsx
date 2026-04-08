"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

export type QuestionResult = {
  id: string;
  topic: string;
  question: string;
  correctAnswerLabel: string;
  explanation?: string;
  practical?: string;
};

export type QuizResultViewProps = {
  slug: string;
  score: number;
  correct: number;
  total: number;
  weakTopics: { topic: string; count: number }[];
  strongTopics: string[];
  incorrectQuestions: QuestionResult[];
  /** Linie uzupełniające kartę wyniku (np. egzamin) */
  examFooter?: ReactNode;
};

/** Ścieżka kwalifikacji głównej; slug quizu mapuje się przez `nextStepsTrackFromSlug`. */
export const NEXT_STEPS = {
  podstawy: {
    fail: "/kursy/podstawy",
    pass: "/quizy/forex",
  },
  forex: {
    fail: "/kursy/forex",
    pass: "/quizy/cfd",
  },
  cfd: {
    fail: "/kursy/cfd",
    pass: "/quizy/zaawansowane",
  },
  zaawansowane: {
    fail: "/kursy/zaawansowane",
    pass: "/quizy/regulacje",
  },
  regulacje: {
    fail: "/kursy/regulacje",
    pass: null,
  },
} as const;

export type QuizNextStepsTrack = keyof typeof NEXT_STEPS;

/** Quiz „Materiały” — ten sam silnik wyniku; ścieżka „co dalej” poza mapą główną. */
const MATERIALY_NEXT: { fail: string; pass: string } = {
  fail: "/kursy/materialy",
  pass: "/quizy/regulacje",
};

function moduleSlugFromQuizStorageSlug(slug: string): string {
  const i = slug.indexOf("__");
  return i === -1 ? slug : slug.slice(0, i);
}

const KNOWN_QUIZ_MODULE_SLUGS = new Set([
  "podstawy",
  "forex",
  "cfd",
  "zaawansowane",
  "materialy",
  "regulacje",
]);

/** Hub `/quizy/[moduleSlug]` dla znanego modułu; legacy KNF/CySEC/MiFID → regulacje. */
export function quizModuleHubHref(slug: string): string {
  if (slug === "knf" || slug === "cysec" || slug === "mifid") return "/quizy/regulacje";
  const mod = moduleSlugFromQuizStorageSlug(slug);
  if (KNOWN_QUIZ_MODULE_SLUGS.has(mod)) return `/quizy/${mod}`;
  return "/quizy";
}

const QUIZ_MODULE_BACK_CTA: Record<string, string> = {
  podstawy: "Wróć do Podstaw",
  forex: "Wróć do Forex",
  cfd: "Wróć do CFD",
  zaawansowane: "Wróć do Zaawansowanych",
  materialy: "Wróć do Materiałów",
  regulacje: "Wróć do Regulacji",
};

/** CTA z wyniku quizu (wynik < 60%): zawsze wobec aktualnego modułu, także dla `moduleSlug__quizSlug`. */
export function quizModuleBackCtaFromStorageSlug(slug: string): { href: string; label: string } {
  const href = quizModuleHubHref(slug);
  if (slug === "knf" || slug === "cysec" || slug === "mifid") {
    return { href, label: QUIZ_MODULE_BACK_CTA.regulacje };
  }
  const mod = moduleSlugFromQuizStorageSlug(slug);
  const label = QUIZ_MODULE_BACK_CTA[mod];
  if (label) return { href, label };
  return { href: "/quizy", label: "Wróć do listy quizów" };
}

export function nextStepsTrackFromSlug(slug: string): QuizNextStepsTrack | null {
  if (slug === "knf" || slug === "cysec" || slug === "mifid") return "regulacje";
  const mod = moduleSlugFromQuizStorageSlug(slug);
  if (mod in NEXT_STEPS) return mod as QuizNextStepsTrack;
  return null;
}

function resolveNextStepRow(
  slug: string
): { fail: string; pass: string | null } | null {
  const track = nextStepsTrackFromSlug(slug);
  if (track) return NEXT_STEPS[track];
  if (moduleSlugFromQuizStorageSlug(slug) === "materialy") return MATERIALY_NEXT;
  return null;
}

type TopicDecisionHint = {
  improveFirst: string;
  doNext: string;
};

/** Najczęstszy temat wśród błędnych odpowiedzi; remis rozstrzygany kolejnością pierwszego wystąpienia na liście. */
function dominantWrongTopicFromIncorrect(
  incorrectQuestions: QuestionResult[]
): { topic: string; count: number } | null {
  if (!incorrectQuestions.length) return null;
  const counts = new Map<string, number>();
  const firstOrder: string[] = [];
  for (const row of incorrectQuestions) {
    const t = row.topic.trim() || "Inne";
    if (!counts.has(t)) firstOrder.push(t);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestC = 0;
  for (const t of firstOrder) {
    const c = counts.get(t) ?? 0;
    if (c > bestC) {
      bestC = c;
      best = t;
    }
  }
  return best ? { topic: best, count: bestC } : null;
}

/** Dokładne dopasowanie etykiety tematu (jak w `topic` w bankach pytań). */
const TOPIC_DECISION_HINT_EXACT: Record<string, TopicDecisionHint> = {
  "Klient i kwalifikacja": {
    improveFirst:
      "Uporządkuj ścieżkę kwalifikacji: zrozumienie produktu, testy adekwatności, kategorie klientów i dokumentacja w CRM — bez skracania kroków pod presją czasu.",
    doNext:
      "Dla każdego błędnego przypadku zapisz właściwą sekwencję działań z procedury, następnie wróć do pełnego quizu.",
  },
  "Ryzyko i komunikat": {
    improveFirst:
      "Sprawdź spójność przekazu: dźwignia, obietnice i ryzyko nie mogą się wykluczać; komunikat musi być zrozumiały i zgodny z faktami.",
    doNext:
      "Przećwicz na sucho formułowanie ostrzeżeń i opisów ryzyka (checklist), potem powtórz pytania z tego obszaru.",
  },
  "Dokumenty i koszty": {
    improveFirst:
      "Ustal jednolite źródło prawdy dla opłat i dokumentów (tabela, KID/Fee schedule) oraz sposób ich wyjaśniania klientowi.",
    doNext:
      "Porównaj błędne odpowiedzi z aktualnymi dokumentami kostkowymi; popraw luki w notatkach, potem kolejna seria.",
  },
  "Wykonanie i konflikty": {
    improveFirst:
      "Przećwicz granice: execution-only vs rekomendacja, konflikt interesów, inducements — z perspektywy procesu i dokumentacji.",
    doNext:
      "Przypisz każdemu błędowi „właściwą linię” (odmowa / eskalacja / neutralne źródło), utrwal w notatce, potem quiz.",
  },
  Marketing: {
    improveFirst:
      "Oceń obietnice i porównania: czy są mierzalne, zbalansowane i zgodne z profilem ryzyka produktu oraz regulacjami marketingowymi.",
    doNext:
      "Przejrzyj materiały pod kątem fair, clear, not misleading; popraw sformułowania, które powtarzają się w błędach.",
  },
  Podsumowanie: {
    improveFirst:
      "Moduł łączy wiele obszarów — wskaż powtarzające się luki (regulacje, ryzyko, proces) i domknij je punktowo w materiale źródłowym.",
    doNext:
      "Zrób mapę „pytanie → zasada → procedura” dla błędnych pozycji, potem jedna pełna seria podsumowania.",
  },
};

const TOPIC_DECISION_HINT_RULES: { test: (topic: string) => boolean; hint: TopicDecisionHint }[] = [
  {
    test: (t) =>
      /margin|dźwignia|stop\s*out|equity|margin\s*call|depozyt/i.test(t),
    hint: {
      improveFirst:
        "Ugruntuj relację: depozyt, wymagany margin, equity, stop out oraz skutek zmiany dźwigni — liczbowo i na jednym spójnym przykładzie.",
      doNext:
        "Rozłóż każdy błąd na wzór: rozmiar pozycji → margin → ruch ceny → wynik; potem powtórka modułu i quiz.",
    },
  },
  {
    test: (t) => /pip|lot|spread|notowan|kwotowan|pips/i.test(t),
    hint: {
      improveFirst:
        "Doprecyzuj jednostki (pip, lot), koszt wejścia (spread) i wpływ na wynik — bez mylenia notowań z wielkością pozycji.",
      doNext:
        "Dla błędnych pytań zapisz wzór obliczeniowy lub regułę odczytu, potem krótka seria liczbowa i ponowny test.",
    },
  },
  {
    test: (t) =>
      /zlecen|egzekucj|execution|best execution|sl\s*\/\s*tp|stop loss|take profit/i.test(t),
    hint: {
      improveFirst:
        "Uporządkuj typy zleceń, kolejność wykonania i ograniczenia platformy — zwłaszcza przy zmienności i lukach.",
      doNext:
        "Symuluj na jednym instrumencie: wejście, modyfikacja, wyjście; porównaj z błędnymi odpowiedziami i popraw zrozumienie.",
    },
  },
  {
    test: (t) =>
      /sesje|gap|makro|bank centralny|struktura rynku|mikrostrukt|benchmark|korelacj/i.test(t),
    hint: {
      improveFirst:
        "Powiąż kontekst czasowy i strukturę rynku z ryzykiem wykonania oraz kosztem — bez ogólników o „płynności”.",
      doNext:
        "Wybierz 2–3 zdarzenia (sesja, news, spread) i opisz ich wpływ na Twój scenariusz; utrwal, potem quiz.",
    },
  },
  {
    test: (t) =>
      /regulac|mifid|mifir|compliance|knf|cysec|suitability|kyc|aml|inducement|raport|mar\b|otc|ochrona|ostrzeż/i.test(
        t
      ),
    hint: {
      improveFirst:
        "Przypnij błędy do konkretnego obowiązku lub zakresu (informacja, kwalifikacja, raportowanie) — nie do pojedynczego sloganu.",
      doNext:
        "Dla każdego błędu wskaż źródło w procedurze lub regulacji, potem powtórka bloku i weryfikacja w teście.",
    },
  },
  {
    test: (t) =>
      /backtest|statyst|metryk|ev\b|edge|optymaliz|symulac|walidac|parametr|automatyz|drawdown|reżim|portfel|sizing|ml\b|\bdane\b|bias/i.test(
        t
      ),
    hint: {
      improveFirst:
        "Oddziel założenia modelu od wyniku: próba, koszty, przeciążenie i ryzyko realizacji muszą być jawne w rozumowaniu.",
      doNext:
        "Zapisz dla błędów checklistę walidacji (out-of-sample, koszty, stabilność), potem wróć do pytań z tego obszaru.",
    },
  },
  {
    test: (t) =>
      /świec|oscylator|macd|atr|fibo|trend|zmienność|s\/r|price action|średnie|kalendarz|\bnews\b|analiza/i.test(t),
    hint: {
      improveFirst:
        "Ustal reguły sygnału i kontekstu (trend, zmienność, konflikt timeframe) — unikaj interpretacji „po jednej świecy”.",
      doNext:
        "Odtwórz na wykresie warunki z błędnych pytań; zapisz definicję wejścia/wyjścia, potem krótka powtórka i quiz.",
    },
  },
  {
    test: (t) =>
      /cfd|instrument|indeks|akcj|towar|kontrakt|wycena|płynność|corporate|godzin|luki?\b/i.test(t),
    hint: {
      improveFirst:
        "Doprecyzuj mechanikę instrumentu (wycena, koszty rollovers, dywidenda, godziny) względem Twojego scenariusza.",
      doNext:
        "Dla każdego błędu sprawdź definicję w materiale modułu; zrób tabelę „instrument → ryzyko → koszt”, potem test.",
    },
  },
  {
    test: (t) => /koszt|swap|finansow|dywidend/i.test(t),
    hint: {
      improveFirst:
        "Rozłóż koszty utrzymania pozycji (finansowanie, swap, opłaty) na konkretny horyzont i kierunek pozycji.",
      doNext:
        "Porównaj swoje odpowiedzi z tabelą kosztów lub przykładem z modułu; popraw rozumienie, potem kolejna próba.",
    },
  },
  {
    test: (t) => /psychologia|błędy początk|plan|proces|logika|\brr\b/i.test(t),
    hint: {
      improveFirst:
        "Powiąż decyzję z planem: rozmiar, akceptowalna strata i warunek wyjścia — ogranicz impulsywne skróty myślowe.",
      doNext:
        "Zapisz dla błędnych sytuacji jedną zasadę operacyjną (np. max ryzyko na transakcję), potem powtórka i quiz.",
    },
  },
  {
    test: (t) => /broker|platforma|infrastruktur|rozliczeni/i.test(t),
    hint: {
      improveFirst:
        "Uporządkuj rolę brokera, infrastruktury i rozliczeń — gdzie kończy się edukacja, a zaczyna odpowiedzialność klienta.",
      doNext:
        "Sprawdź definicje z modułu (kontrahent, konto, zabezpieczenia); przypisz je do błędnych pytań i utrwal.",
    },
  },
  {
    test: (t) => /ryzyko/i.test(t),
    hint: {
      improveFirst:
        "Zdefiniuj scenariusz straty i warunek zamknięcia zanim wejdziesz — ryzyko opisuj liczbami i warunkami, nie hasłami.",
      doNext:
        "Dla każdego błędu dopisz „jeśli cena X, to akcja Y”; następnie moduł o ryzyku i ponowny test.",
    },
  },
];

function decisionHintForTopic(topic: string): TopicDecisionHint {
  const key = topic.trim();
  const exact = TOPIC_DECISION_HINT_EXACT[key];
  if (exact) return exact;
  for (const rule of TOPIC_DECISION_HINT_RULES) {
    if (rule.test(key)) return rule.hint;
  }
  return {
    improveFirst: `Priorytetowo opracuj obszar „${key}”: przypisz każdemu błędnemu pytaniu definicję lub regułę z modułu.`,
    doNext:
      "Po utrwaleniu wróć do pełnego quizu; przy stabilnym wyniku skorzystaj z sekcji „Co dalej” poniżej.",
  };
}

function hrefDisplayName(href: string, kind: "module" | "quiz"): string {
  const map: Record<string, string> = {
    "/kursy/podstawy": "Podstawy",
    "/kursy/forex": "Forex",
    "/kursy/cfd": "CFD",
    "/kursy/zaawansowane": "Zaawansowane",
    "/kursy/regulacje": "Regulacje",
    "/kursy/materialy": "Materiały",
    "/quizy/forex": "Forex",
    "/quizy/cfd": "CFD",
    "/quizy/zaawansowane": "Zaawansowane",
    "/quizy/regulacje": "Regulacje",
    "/quizy/knf": "KNF",
    "/quizy/cysec": "CySEC",
    "/quizy/mifid": "MiFID",
  };
  if (map[href]) return map[href];
  const last = href.split("/").filter(Boolean).pop() ?? "";
  if (kind === "quiz") return last.toUpperCase();
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function resultQualityBand(pct: number): {
  label: string;
  labelClass: string;
  blurb: string;
} {
  if (pct >= 85) {
    return {
      label: "Bardzo dobrze",
      labelClass: "border-emerald-400/40 bg-emerald-500/[0.12] text-emerald-100",
      blurb:
        "Masz dobrą kontrolę nad podstawami. Traktuj ten wynik jako punkt odniesienia — nie jako gwarancję przy realnym ryzyku.",
    };
  }
  if (pct >= 65) {
    return {
      label: "Solidna baza",
      labelClass: "border-cyan-400/35 bg-cyan-500/[0.1] text-cyan-50",
      blurb: "Baza jest, ale są luki do domknięcia. Zanim zwiększysz skalę decyzji, domknij tematy z sekcji poniżej.",
    };
  }
  if (pct >= 45) {
    return {
      label: "Do poprawy",
      labelClass: "border-amber-400/40 bg-amber-500/[0.1] text-amber-50",
      blurb: "To jeszcze nie jest poziom pewnej decyzji. Krótka powtórka błędów przyniesie tu wyraźny, szybki postęp.",
    };
  }
  return {
    label: "Poniżej progu",
    labelClass: "border-rose-400/40 bg-rose-500/[0.12] text-rose-50",
    blurb:
      "W tej próbie poziom jest jeszcze za niski na rutynowe decyzje pod presją. Uporządkuj materiał bieżącego modułu i rozłóż każdy błąd na czynniki pierwsze.",
  };
}

export default function QuizResultView({
  slug,
  score: pct,
  correct,
  total,
  weakTopics,
  strongTopics,
  incorrectQuestions,
  examFooter,
}: QuizResultViewProps) {
  const router = useRouter();
  const band = resultQualityBand(pct);
  const incorrectCount = total - correct;

  const weakSorted = [...weakTopics].sort((a, b) => b.count - a.count);
  const top3Weak = weakSorted.slice(0, 3);
  const restWeakTopics = weakSorted.slice(3).map((w) => w.topic);
  const biggestProblemTopic = weakSorted[0]?.topic ?? null;

  const step = resolveNextStepRow(slug);
  const passHref = step?.pass ?? null;
  const backToQuizModule = quizModuleBackCtaFromStorageSlug(slug);

  function goBackToQuizModuleHub() {
    if (process.env.NODE_ENV !== "production") {
      console.log("[quiz] back to quiz module hub", { slug, href: backToQuizModule.href });
    }
    void router.push(backToQuizModule.href);
  }

  function goPassNext() {
    if (!passHref) return;
    console.log("[quiz] next module clicked", { slug, href: passHref });
    void router.push(passHref);
  }

  const passName = passHref ? hrefDisplayName(passHref, "quiz") : null;

  const hasWrong = incorrectQuestions.length > 0;
  const dominantWrong = hasWrong ? dominantWrongTopicFromIncorrect(incorrectQuestions) : null;
  const decisionHint = dominantWrong ? decisionHintForTopic(dominantWrong.topic) : null;

  return (
    <>
      <section
        className="mt-8 overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] md:p-8"
        aria-labelledby="quiz-result-heading"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p id="quiz-result-heading" className="text-sm font-medium text-white/55">
              Wynik
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight text-white md:text-6xl">
              {pct}
              <span className="text-2xl font-medium text-white/40 md:text-3xl">%</span>
            </p>
            <p className="mt-2 text-base text-white/75">
              <span className="tabular-nums font-medium text-white">{correct}</span>
              <span className="text-white/45"> / </span>
              <span className="tabular-nums text-white/70">{total}</span>
              <span className="text-white/50"> poprawnych</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${band.labelClass}`}
            >
              {band.label}
            </span>
            {biggestProblemTopic ? (
              <span className="max-w-[14rem] text-right text-[10px] font-medium uppercase leading-snug tracking-wider text-rose-200/75">
                Największy problem: <span className="text-rose-100/95">{biggestProblemTopic}</span>
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-6 border-t border-white/[0.08] pt-6 text-sm leading-relaxed text-white/70">{band.blurb}</p>
        {examFooter}
      </section>

      {dominantWrong && decisionHint ? (
        <section className="mt-8 rounded-2xl border border-white/[0.09] bg-[#0a0e14]/90 p-5 md:p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Wskazówka po błędach
          </h2>
          <p className="mt-2 text-xs text-white/45">
            Dominujący temat w tej próbie:{" "}
            <span className="font-medium text-white/70">{dominantWrong.topic}</span>
            {dominantWrong.count > 1 ? (
              <span className="tabular-nums text-white/50"> · {dominantWrong.count}×</span>
            ) : null}
          </p>
          <div className="mt-5 space-y-5 border-t border-white/[0.06] pt-5">
            <div>
              <p className="text-sm font-semibold text-white/88">Co poprawić najpierw</p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{decisionHint.improveFirst}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/88">Co zrobić dalej</p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{decisionHint.doNext}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-white/[0.09] bg-[#0a0e14]/90 p-5 md:p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Co dalej</h2>
        {pct < 60 ? (
          <p className="mt-3 text-base leading-relaxed text-white/85">
            <button
              type="button"
              onClick={goBackToQuizModuleHub}
              className="font-semibold text-teal-300 underline decoration-teal-500/40 underline-offset-2 transition hover:text-teal-200"
            >
              {backToQuizModule.label}
            </button>
            <span className="text-white/50"> — uporządkuj bazę w tym module, zanim wejdziesz w kolejne testy.</span>
          </p>
        ) : pct < 80 ? (
          <p className="mt-3 text-base leading-relaxed text-white/85">
            <span className="font-semibold text-white">Powtórz błędne i spróbuj ponownie.</span>{" "}
            <span className="text-white/55">
              Domknij najpierw sekcję poniżej, potem pełna seria, gdy wynik się ustabilizuje.
            </span>
          </p>
        ) : passHref && passName ? (
          <p className="mt-3 text-base leading-relaxed text-white/85">
            <button
              type="button"
              onClick={goPassNext}
              className="font-semibold text-teal-300 underline decoration-teal-500/40 underline-offset-2 transition hover:text-teal-200"
            >
              Możesz iść dalej → {passName}
            </button>
            <span className="text-white/50"> — kolejny krok po opanowaniu tego bloku.</span>
          </p>
        ) : (
          <p className="mt-3 text-base leading-relaxed text-white/85">
            <span className="font-semibold text-white">Świetny wynik.</span>{" "}
            <span className="text-white/55">
              Możesz utrwalić materiał modułu lub wybrać kolejny temat z listy quizów.
            </span>
          </p>
        )}
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">Mocniejsze obszary</h2>
          <p className="mt-1 text-xs text-white/45">Na podstawie trafionych pytań (temat)</p>
          {strongTopics.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {strongTopics.map((t) => (
                <li
                  key={t}
                  className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1.5 text-sm text-emerald-50/95"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-white/45">Brak jednoznacznych mocnych tematów w tej próbie.</p>
          )}
        </section>
        <section className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200/85">Najważniejsze do poprawy</h2>
          <p className="mt-1 text-xs text-white/45">3 najczęściej błędne tematy (wg tej próby)</p>
          {top3Weak.length ? (
            <ol className="mt-5 space-y-3">
              {top3Weak.map((w, rank) => (
                <li
                  key={w.topic}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3"
                >
                  <span className="min-w-0 text-base font-semibold leading-snug text-rose-50">
                    <span className="mr-2 tabular-nums text-white/35">{rank + 1}.</span>
                    {w.topic}
                  </span>
                  <span className="shrink-0 tabular-nums text-xs font-medium text-rose-200/70">×{w.count}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-white/45">Bez słabych tematów — dobry sygnał.</p>
          )}
          {restWeakTopics.length ? (
            <div className="mt-5 border-t border-rose-500/15 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-200/45">Pozostałe</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {restWeakTopics.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-rose-500/15 bg-rose-500/[0.06] px-2 py-1 text-[11px] text-rose-100/75"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      {hasWrong ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">Najpierw popraw to</h2>
          <p className="mt-1 text-sm text-white/50">
            Niepoprawnych lub pominiętych: <span className="tabular-nums text-white/70">{incorrectCount}</span>
          </p>
          <ul className="mt-5 space-y-3">
            {incorrectQuestions.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-white/[0.08] bg-[#0c1018]/80 p-4 backdrop-blur-sm"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{row.topic}</p>
                <p className="mt-1 text-sm font-medium leading-snug text-white/90">{row.question}</p>
                <p className="mt-3 text-xs text-white/45">
                  Poprawna odpowiedź:{" "}
                  <span className="font-medium text-emerald-200/90">{row.correctAnswerLabel}</span>
                </p>
                {row.explanation ? (
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{row.explanation}</p>
                ) : null}
                {row.practical ? (
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    <span className="font-semibold text-white/50">W praktyce oznacza to: </span>
                    {row.practical}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
