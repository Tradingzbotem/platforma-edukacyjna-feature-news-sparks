import Link from "next/link";

type Item = { slug: string; title: string; blurb: string; minutes: number };

const items: Item[] = [
  {
    slug: "analiza-techniczna",
    title: "Analiza techniczna — fundamenty i praktyka",
    blurb: "Trend, S/R, price action, multi-timeframe, ATR/vol i kilka wskaźników sensownie.",
    minutes: 18,
  },
  {
    slug: "formacje-swiecowe",
    title: "Formacje świecowe — jak czytać i filtrować",
    blurb: "Pin bar, engulfing, inside bar, doji — jako kontekst, nie sygnał magiczny.",
    minutes: 15,
  },
  {
    slug: "psychologia",
    title: "Psychologia inwestowania — proces i odporność",
    blurb: "Błędy poznawcze, tilt, rutyny, limity w R i dziennik decyzyjny.",
    minutes: 16,
  },
  {
    slug: "kalendarz-ekonomiczny",
    title: "Kalendarz ekonomiczny — jak nim pracować",
    blurb: "Jakie dane są ważne (CPI, NFP, PMI…), kiedy nie handlować i jak skalować ryzyko.",
    minutes: 14,
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <Link href="/kursy" className="text-sm underline">← Wróć do listy kursów</Link>

      <header className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Materiały dodatkowe</h1>
        <p className="mt-2 text-slate-300">
          Krótkie kompendia: analiza techniczna, formacje świecowe, psychologia inwestowania,
          praca z kalendarzem makro. Zaczynaj od tego, czego potrzebujesz tu i teraz.
        </p>
      </header>

      <section className="mt-6 grid md:grid-cols-2 gap-5">
        {items.map((m) => (
          <article
            key={m.slug}
            className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-semibold tracking-widest text-white/60">MATERIAŁ</div>
              <h3 className="mt-2 text-lg font-semibold">{m.title}</h3>
              <p className="mt-2 text-sm text-white/70">{m.blurb}</p>
              <div className="mt-3 text-sm text-slate-400">⏱ {m.minutes} min</div>
            </div>
            <div className="mt-5">
              <Link
                href={`/kursy/materialy/${m.slug}`}
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
