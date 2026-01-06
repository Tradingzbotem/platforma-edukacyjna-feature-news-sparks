import Link from 'next/link';
import type { Metadata } from 'next';
import Hero from './_components/Hero';
import Purpose from './_components/Purpose';
import Team from './_components/Team';
import Process from './_components/Process';
import Values from './_components/Values';
import Inside from './_components/Inside';
import FinalCta from './_components/FinalCta';

export const metadata: Metadata = {
  title: 'O nas — FX Edu',
  description:
    'Poznaj założenia projektu FX Edu: praktyka ponad teorię, jasne zasady ryzyka i edukacja bez obietnic zysku.',
};

/* ────────────────────── Strona O nas ────────────────────── */
export default function Page() {
  return (
    <main id="content" className="relative min-h-screen bg-[#0b1220] text-white">
      {/* Tło: gradient + delikatny pattern dots */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyan-600/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            backgroundPosition: '0 0',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Powrót */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded px-1"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
              <path d="M14 7l-5 5 5 5V7z" />
            </svg>
            <span>Wróć na stronę główną</span>
          </Link>
        </div>

        <Hero />
        <Purpose />
        <Team />
        <Process />
        <Values />
        <Inside />
        <FinalCta />

        {/* Disclaimer */}
        <section className="mt-14">
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-4">
            <p className="text-xs text-white/70">
              Treści mają charakter edukacyjny i informacyjny. Nie stanowią rekomendacji inwestycyjnej ani doradztwa.
            </p>
          </div>
        </section>

        {/* Watermark sekcji */}
        <div className="relative mt-10">
          <div className="pointer-events-none select-none absolute right-0 -bottom-2 text-4xl md:text-5xl font-black tracking-widest text-white/5">
            FX•EDU
          </div>
        </div>
        {/* Globalna stopka jest renderowana przez layout */}
      </div>
    </main>
  );
}


