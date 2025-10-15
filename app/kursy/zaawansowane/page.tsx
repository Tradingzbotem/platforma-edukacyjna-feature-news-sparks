import Link from "next/link";

type Lesson = {
  slug: string;
  title: string;
  blurb: string;
  minutes: number;
  status?: "completed" | "inProgress";
};

function CourseIndex({
  courseTitle, coursePath, lessons,
}: { courseTitle: string; coursePath: "zaawansowane"; lessons: Lesson[] }) {
  const done = lessons.filter((l) => l.status === "completed").length;
  const progress = Math.round((done / lessons.length) * 100);

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <Link href="/kursy" className="text-sm underline">← Wróć do listy kursów</Link>

      <header className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Zaawansowane — spis lekcji</h1>
        <p className="mt-2 text-slate-300">
          Edge i statystyka, testy OOS/walk-forward, ryzyko i sizing, portfel, psychologia i operacyjka.
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span>Postęp: {done}/{lessons.length} lekcji</span><span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white/80" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <section className="mt-6 grid md:grid-cols-2 gap-5">
        {lessons.map((l, i) => (
          <article key={l.slug} className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="text-slate-400 text-sm mb-1">Lekcja {i + 1}</div>
              <h3 className="text-lg font-semibold">{l.title}</h3>
              <p className="mt-2 text-slate-300">{l.blurb}</p>
              <div className="mt-3 text-sm text-slate-400 flex items-center gap-4">
                <span>⏱ {l.minutes} min</span>
                {l.status === "completed" && <span className="text-emerald-400">✓ Ukończono</span>}
                {l.status === "inProgress" && <span className="text-sky-400">W toku</span>}
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/kursy/${coursePath}/${l.slug}`}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Otwórz
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const lessons: Lesson[] = [
  {
    slug: "lekcja-1",
    title: "Edge i wartość oczekiwana (EV)",
    blurb: "Jak policzyć EV systemu, co daje przewaga i jak ją utrzymać.",
    minutes: 12, status: "completed",
  },
  {
    slug: "lekcja-2",
    title: "Backtest: OOS, walk-forward, unikanie przecieku",
    blurb: "Dobre praktyki testowania, segmentacja danych, walidacja.",
    minutes: 15, status: "completed",
  },
  {
    slug: "lekcja-3",
    title: "Statystyka wyników: rozkłady, DD, risk of ruin, Monte Carlo",
    blurb: "Jak czytać metryki i przewidywać skrajne scenariusze.",
    minutes: 14,
  },
  {
    slug: "lekcja-4",
    title: "Sizing pro: Kelly (częściowy), fixed-fractional, portfel i korelacje",
    blurb: "Zarządzanie ryzykiem na poziomie strategii i portfela.",
    minutes: 13, status: "inProgress",
  },
  {
    slug: "lekcja-5",
    title: "Psychologia i operacyjka: rutyny, checklisty, dziennik",
    blurb: "Jak utrzymać edge w praktyce i nie psuć statystyki błędami.",
    minutes: 12,
  },
];

export default function Page() {
  return <CourseIndex courseTitle="Zaawansowane" coursePath="zaawansowane" lessons={lessons} />;
}
