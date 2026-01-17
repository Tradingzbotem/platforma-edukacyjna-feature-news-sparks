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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl p-6 md:p-8 animate-fade-in">
        <Link href="/kursy" className="inline-flex items-center gap-2 text-sm underline hover:text-white transition-colors duration-150">← Wróć do listy kursów</Link>

        <header className="mt-4 rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm border border-white/10 p-6 md:p-8 shadow-lg">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Materiały dodatkowe</h1>
          <p className="mt-2 text-slate-300">
            Krótkie kompendia: analiza techniczna, formacje świecowe, psychologia inwestowania,
            praca z kalendarzem makro. Zaczynaj od tego, czego potrzebujesz tu i teraz.
          </p>
        </header>

        <section className="mt-6 grid md:grid-cols-2 gap-5">
          {items.map((m) => (
            <article
              key={m.slug}
              className="rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm border border-white/10 p-5 flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <div>
                <div className="text-xs font-semibold tracking-widest text-white/60">MATERIAŁ</div>
                <h3 className="mt-2 text-lg font-semibold text-white">{m.title}</h3>
                <p className="mt-2 text-sm text-white/70">{m.blurb}</p>
                <div className="mt-3 text-sm text-slate-400">⏱ {m.minutes} min</div>
              </div>
              <div className="mt-5">
                <Link
                  href={`/kursy/materialy/${m.slug}`}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Otwórz
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
