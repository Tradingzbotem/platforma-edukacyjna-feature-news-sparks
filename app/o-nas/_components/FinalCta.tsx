import Link from 'next/link';

export default function FinalCta() {
  return (
    <section className="mt-16">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700/20 via-cyan-600/10 to-transparent border border-white/10 p-8 md:p-10 backdrop-blur">
        <h2 className="text-2xl md:text-3xl font-bold">
          Gotowy uczyć się procesem, nie emocjami?
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/ebooki#plany"
            aria-label="Zobacz pakiety"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Zobacz pakiety
          </Link>
          <Link
            href="/ebooki#plany"
            aria-label="Porównaj pakiety"
            className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white px-5 py-3 font-semibold border border-white/10 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Porównaj pakiety
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/70">
          Treści edukacyjne. Brak doradztwa inwestycyjnego.
        </p>
      </div>
    </section>
  );
}


