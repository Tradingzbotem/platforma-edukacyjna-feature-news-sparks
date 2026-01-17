import Link from 'next/link';
import type { Metadata } from 'next';
import Hero from './_components/Hero';
import Purpose from './_components/Purpose';
import Team from './_components/Team';
import Process from './_components/Process';
import Values from './_components/Values';
import Inside from './_components/Inside';
import Editorial from './_components/Editorial';

export const metadata: Metadata = {
  title: 'O nas — FX Edu',
  description:
    'Poznaj założenia projektu FX Edu: praktyka ponad teorię, jasne zasady ryzyka i edukacja bez obietnic zysku.',
};

/* ────────────────────── Strona O nas ────────────────────── */
export default function Page() {
  return (
    <main id="content" className="relative min-h-screen bg-slate-950 text-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-14 lg:pb-20">
        {/* Powrót */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded transition-colors"
          >
            ← Wróć do strony głównej
          </Link>
        </div>

        <Hero />
        <Purpose />
        <Team />
        <Process />
        <Values />
        <Editorial />
        <Inside />

        {/* Disclaimer */}
        <section className="mt-16">
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-center">
            <p className="text-amber-200 text-sm">
              Materiały edukacyjne. Bez rekomendacji inwestycyjnych i sygnałów rynkowych.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}


