// app/kursy/[course]/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import AccessGuard from "../../components/AccessGuard";

type CourseSlug = "podstawy" | "forex" | "cfd" | "zaawansowane" | "regulacje";

const COURSES: Record<
  CourseSlug,
  {
    title: string;
    description: string;
    lessons: number; // ile lekcji linkujemy (masz lekcja-1..lekcja-5 w każdym module)
  }
> = {
  podstawy: {
    title: "Podstawy inwestowania",
    description:
      "Wprowadzenie do rynków, ryzyka, dźwigni, typów zleceń i świec.",
    lessons: 5,
  },
  forex: {
    title: "Forex",
    description:
      "Pary walutowe, pipsy i loty, sesje rynkowe, podstawy makro.",
    lessons: 5,
  },
  cfd: {
    title: "CFD",
    description:
      "Mechanika kontraktów CFD, finansowanie overnight, indeksy i surowce.",
    lessons: 5,
  },
  zaawansowane: {
    title: "Zaawansowane",
    description:
      "Zarządzanie ryzykiem, psychologia, strategie i zaawansowane narzędzia.",
    lessons: 5,
  },
  regulacje: {
    title: "Regulacje i egzaminy",
    description:
      "MiFID II, ESMA, KNF, testy adekwatności, best execution, ochrona klienta, marketing i compliance.",
    lessons: 6,
  },
};

function isCourseSlug(x: string): x is CourseSlug {
  return x === "podstawy" || x === "forex" || x === "cfd" || x === "zaawansowane" || x === "regulacje";
}

export default function CoursePage({ params }: { params: { course: string } }) {
  if (!isCourseSlug(params.course)) {
    notFound();
  }

  const meta = COURSES[params.course];
  const lessonNumbers = Array.from({ length: meta.lessons }, (_, i) => i + 1);

  return (
    <AccessGuard required="auth">
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl p-6 md:p-8 space-y-6 animate-fade-in">
          {/* Nawigacja powrotna */}
          <div className="flex items-center justify-between">
            <Link href="/kursy" className="inline-flex items-center gap-2 text-sm underline hover:text-white transition-colors duration-150">
              ← Wróć do kursów
            </Link>
            <Link href={`/quizy/${params.course}`} className="inline-flex items-center gap-2 text-sm underline hover:text-white transition-colors duration-150">
              Quiz: {meta.title}
            </Link>
          </div>

          {/* Nagłówek kursu */}
          <header>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{meta.title}</h1>
            <p className="mt-1 text-white/70">{meta.description}</p>
          </header>

          {/* Lista lekcji */}
          <section className="rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm border border-white/10 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Lekcje</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {lessonNumbers.map((n) => (
                <li key={n}>
                  <Link
                    href={`/kursy/${params.course}/lekcja-${n}`}
                    className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white">Lekcja {n}</span>
                      <span className="text-white/60">→</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-white/60">
              Brakuje treści? Upewnij się, że istnieją pliki{" "}
              <code className="bg-white/5 px-1 py-0.5 rounded text-xs">/app/kursy/{params.course}/lekcja-1..{meta.lessons}/page.tsx</code>.
            </p>
          </section>

          {/* Dalsze kroki */}
          <section className="rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm border border-white/10 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Następne kroki</h2>
            <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-white/80">
              <li>Przerób 2–3 lekcje w tym module.</li>
              <li>
                Sprawdź się:{" "}
                <Link
                  href={`/quizy/${params.course}`}
                  className="underline underline-offset-4 decoration-emerald-400/50 hover:decoration-emerald-400 transition-colors duration-150"
                >
                  quiz {meta.title}
                </Link>
                .
              </li>
              <li>
                Wróć do{" "}
                <Link
                  href="/kursy"
                  className="underline underline-offset-4 decoration-emerald-400/50 hover:decoration-emerald-400 transition-colors duration-150"
                >
                  listy kursów
                </Link>{" "}
                i wybierz kolejny moduł.
              </li>
            </ol>
          </section>
        </div>
      </main>
    </AccessGuard>
  );
}
