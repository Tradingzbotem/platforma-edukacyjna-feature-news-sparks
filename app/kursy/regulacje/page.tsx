import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulacje i egzaminy — spis lekcji | Kursy",
  description: "MiFID II, ESMA, KNF, testy adekwatności, best execution, ochrona klienta, marketing i compliance.",
};

type Lesson = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  completed?: boolean;
};

function CourseIndex({
  courseTitle,
  coursePath,
  lessons,
}: {
  courseTitle: string;
  coursePath: string;
  lessons: Lesson[];
}) {
  const done = lessons.filter((l) => l.completed).length;
  const total = lessons.length;
  const pct = Math.round((done / total) * 100);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm p-6 md:p-8 shadow-lg">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">{courseTitle} — spis lekcji</h1>
        <p className="mt-2 text-slate-300">
          Kompleksowy kurs o regulacjach finansowych. Zacznij od lekcji 1 i idź po kolei.
        </p>

        <div className="mt-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm text-white/70">
            <span>Postęp: {done}/{total} lekcji</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 shadow-sm"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {lessons.map((l, i) => (
          <article
            key={l.slug}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1322] to-[#0a0f1a] p-5 shadow-sm hover:shadow-lg hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300"><span>Lekcja</span> <span>{i + 1}</span></span>
              {l.completed ? (
                <span className="text-emerald-400 font-medium">✓ Ukończono</span>
              ) : (
                <span className="text-slate-400">W toku</span>
              )}
            </div>

            <h2 className="text-xl font-semibold text-white">{l.title}</h2>
            <p className="mt-1 text-slate-300">{l.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">⏱ {l.minutes} min</span>
              <Link
                href={`/kursy/${coursePath}/${l.slug}`}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Otwórz
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const lessons: Lesson[] = [
  { 
    slug: "lekcja-1", 
    title: "Podstawy regulacyjne: MiFID II i ESMA", 
    description: "Wprowadzenie do regulacji finansowych w UE, główne organy nadzorcze i kluczowe zasady MiFID II.", 
    minutes: 15 
  },
  { 
    slug: "lekcja-2", 
    title: "Testy adekwatności i odpowiedniości", 
    description: "Różnice między testami, kiedy są wymagane i co dokładnie badają.", 
    minutes: 12 
  },
  { 
    slug: "lekcja-3", 
    title: "Best execution i konflikty interesów", 
    description: "Najlepsza realizacja zleceń, elementy best execution i zarządzanie konfliktami interesów.", 
    minutes: 11 
  },
  { 
    slug: "lekcja-4", 
    title: "Ochrona klienta: limity dźwigni i negative balance", 
    description: "Limity dźwigni ESMA, margin close-out i negative balance protection.", 
    minutes: 10 
  },
  { 
    slug: "lekcja-5", 
    title: "Marketing i compliance: KID/KIID, materiały promocyjne", 
    description: "Zasada fair, clear, not misleading, wymogi dotyczące KID/KIID i zakazane praktyki marketingowe.", 
    minutes: 13 
  },
  { 
    slug: "lekcja-6", 
    title: "Kategoryzacja klientów i opt-up", 
    description: "Trzy kategorie klientów, proces opt-up i jego konsekwencje.", 
    minutes: 9 
  },
];

export default function RegulacjePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl p-6 space-y-6 animate-fade-in">
        <Link href="/kursy" className="inline-flex items-center gap-2 text-sm underline hover:text-white transition-colors duration-150">← Wróć do listy kursów</Link>
        <CourseIndex courseTitle="Regulacje i egzaminy" coursePath="regulacje" lessons={lessons} />
      </div>
    </main>
  );
}
