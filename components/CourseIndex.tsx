import Link from "next/link";

export type Lesson = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  completed?: boolean;
};

export function CourseIndex({
  courseTitle,
  coursePath,
  lessons,
}: {
  courseTitle: string;
  coursePath: string; // "forex" | "cfd" | "zaawansowane"
  lessons: Lesson[];
}) {
  const done = lessons.filter((l) => l.completed).length;
  const total = lessons.length;
  const pct = Math.round((done / total) * 100);

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">{courseTitle} — spis lekcji</h1>
        <p className="mt-2 text-slate-300">
          Startowy moduł. Zacznij od lekcji 1 i idź po kolei.
        </p>

        <div className="mt-6 rounded-xl bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Postęp: {done}/{total} lekcji</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-2 bg-white/80" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {lessons.map((l, i) => (
          <article key={l.slug} className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">Lekcja {i + 1}</span>
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
                className="rounded-xl px-4 py-2 text-sm font-medium bg-white text-black hover:opacity-90"
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
