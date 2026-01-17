import Link from 'next/link';

export default function FinalCta() {
  return (
    <section className="py-12 lg:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 md:p-12 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
          Gotowy uczyć się procesem, nie emocjami?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/ebooki#plany"
            aria-label="Zobacz pakiety"
            className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
          >
            Zobacz pakiety
          </Link>
          <Link
            href="/ebooki#plany"
            aria-label="Porównaj pakiety"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
          >
            Porównaj pakiety
          </Link>
        </div>
        <p className="text-sm text-white/70">
          Treści edukacyjne. Brak doradztwa inwestycyjnego.
        </p>
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
    </section>
  );
}


