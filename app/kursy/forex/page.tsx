import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forex — spis lekcji | Kursy",
  description: "Pary, pipsy i loty, zlecenia, dźwignia i plan transakcyjny.",
};

type Lesson = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  completed?: boolean;
};

/**
 * UWAGA: To jest "funkcja lokalna" — czyli komponent zdefiniowany
 * BEZPOŚREDNIO W TYM PLIKU, a nie importowany z /components.
 * Dzięki temu wszystko zadziała od razu, bez kombinacji z importami.
 */
function CourseIndex({
  courseTitle,
  coursePath,
  lessons,
}: {
  courseTitle: string;
  coursePath: string; // "forex"
  lessons: Lesson[];
}) {
  const done = lessons.filter((l) => l.completed).length;
  const total = lessons.length;
  const pct = Math.round((done / total) * 100);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-6 md:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">{courseTitle} — spis lekcji</h1>
        <p className="mt-2 text-slate-300">
          Startowy moduł. Zacznij od lekcji 1 i idź po kolei.
        </p>

        {/* Pasek postępu jak w „Podstawy” */}
        <div className="mt-6 rounded-2xl bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Postęp: {done}/{total} lekcji</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-white/90"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {lessons.map((l, i) => (
          <article
            key={l.slug}
            className="rounded-2xl border border-white/10 bg-[#0c1322] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]"
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300"><span>Lekcja</span> <span>{i + 1}</span></span>
              {l.completed ? (
                <span className="text-emerald-400">✓ Ukończono</span>
              ) : (
                <span className="text-slate-400">W toku</span>
              )}
            </div>

            <h2 className="text-xl font-semibold">{l.title}</h2>
            <p className="mt-1 text-slate-300">{l.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">⏱ {l.minutes} min</span>
              <Link
                href={`/kursy/${coursePath}/${l.slug}`}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
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
  { slug: "lekcja-1", title: "Wprowadzenie do rynku walutowego", description: "Pojęcia bazowe, uczestnicy, mechanika FX.", minutes: 6, completed: true },
  { slug: "lekcja-2", title: "Pipsy, punkty i loty", description: "Jak liczyć ruch ceny i wielkość pozycji.", minutes: 7, completed: true },
  { slug: "lekcja-3", title: "Rodzaje zleceń", description: "Market, limit, stop, stop-limit — kiedy których używać.", minutes: 8, completed: true },
  { slug: "lekcja-4", title: "Dźwignia i ryzyko", description: "Ekspozycja, margin, R-multiple i kontrola DD.", minutes: 9 },
  { slug: "lekcja-5", title: "Plan transakcyjny i dziennik", description: "Reguły wejść/wyjść, checklisty, metryki skuteczności.", minutes: 10 },
];

export default function ForexPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <Link href="/kursy" className="text-sm underline">← Wróć do listy kursów</Link>
      <CourseIndex courseTitle="Forex" coursePath="forex" lessons={lessons} />
    </main>
  );
}
