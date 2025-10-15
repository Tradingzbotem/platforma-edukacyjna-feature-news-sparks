// app/kursy/[course]/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import AccessGuard from "../../components/AccessGuard";

type CourseSlug = "podstawy" | "forex" | "cfd" | "zaawansowane";

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
};

function isCourseSlug(x: string): x is CourseSlug {
  return x === "podstawy" || x === "forex" || x === "cfd" || x === "zaawansowane";
}

export default function CoursePage({ params }: { params: { course: string } }) {
  if (!isCourseSlug(params.course)) {
    notFound();
  }

  const meta = COURSES[params.course];
  const lessonNumbers = Array.from({ length: meta.lessons }, (_, i) => i + 1);

  return (
    <AccessGuard required="public">
      <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6 text-white">
        {/* Nawigacja powrotna */}
        <div className="flex items-center justify-between">
          <Link href="/kursy" className="text-sm underline">
            ← Wróć do kursów
          </Link>
          <Link href={`/quizy/${params.course}`} className="text-sm underline">
            Quiz: {meta.title}
          </Link>
        </div>

        {/* Nagłówek kursu */}
        <header>
          <h1 className="text-2xl md:text-3xl font-bold">{meta.title}</h1>
          <p className="mt-1 text-white/70">{meta.description}</p>
        </header>

        {/* Lista lekcji */}
        <section className="rounded-2xl bg-[#0b1220] border border-white/10 p-6">
          <h2 className="text-lg font-semibold">Lekcje</h2>
          <ul className="mt-4 grid sm:grid-cols-2 gap-3">
            {lessonNumbers.map((n) => (
              <li key={n}>
                <Link
                  href={`/kursy/${params.course}/lekcja-${n}`}
                  className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span>Lekcja {n}</span>
                    <span className="text-white/60">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-white/60">
            Brakuje treści? Upewnij się, że istnieją pliki{" "}
            <code>/app/kursy/{params.course}/lekcja-1..{meta.lessons}/page.tsx</code>.
          </p>
        </section>

        {/* Dalsze kroki */}
        <section className="rounded-2xl bg-[#0b1220] border border-white/10 p-6">
          <h2 className="text-lg font-semibold">Następne kroki</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-white/80">
            <li>Przerób 2–3 lekcje w tym module.</li>
            <li>
              Sprawdź się:{" "}
              <Link
                href={`/quizy/${params.course}`}
                className="underline underline-offset-4 decoration-white/30 hover:decoration-white"
              >
                quiz {meta.title}
              </Link>
              .
            </li>
            <li>
              Wróć do{" "}
              <Link
                href="/kursy"
                className="underline underline-offset-4 decoration-white/30 hover:decoration-white"
              >
                listy kursów
              </Link>{" "}
              i wybierz kolejny moduł.
            </li>
          </ol>
        </section>
      </main>
    </AccessGuard>
  );
}
