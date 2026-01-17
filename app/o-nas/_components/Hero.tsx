import Link from 'next/link';
import { BookIcon, ChartIcon, ShieldIcon, RefreshIcon } from './Icons';

export default function Hero() {
  const bullets = [
    { label: 'Scenariusze i checklisty', Icon: ChartIcon },
    { label: 'Quizy i testy wiedzy', Icon: BookIcon },
    { label: 'Symulator i praktyka', Icon: RefreshIcon },
    { label: 'Briefy i skróty dnia', Icon: ShieldIcon },
  ];

  const trust = [
    { title: 'Scenariusze i checklisty', desc: 'Ustrukturyzowane materiały do pracy' },
    { title: 'Aktualizowane materiały', desc: 'Rozwój treści i korekty' },
    { title: 'Edukacja bez doradztwa', desc: 'Bez sygnałów i obietnic zysku' },
    { title: 'Proces i ryzyko', desc: 'Zrozumienie mechaniki rynku' },
  ];

  return (
    <section className="py-12 lg:py-16">
      <div className="grid lg:grid-cols-2 lg:gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span className="tracking-wide">O NAS</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            O nas
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
            Uczymy procesu i zarządzania ryzykiem, nie gonienia wyniku. Tworzymy narzędzia,
            które pomagają podejmować bardziej świadome decyzje: checklisty, scenariusze,
            quizy i praktyczne zadania — bez doradztwa inwestycyjnego.
          </p>

          <ul className="mb-8 grid sm:grid-cols-2 gap-4">
            {bullets.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                  <Icon className="w-5 h-5 text-emerald-300" />
                </span>
                <span className="text-white/90">{label}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link
              href="/ebooki#plany"
              aria-label="Zobacz pakiety"
              className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
            >
              Zobacz pakiety
            </Link>
            <Link
              href="#jak-pracujemy"
              aria-label="Poznaj ścieżkę nauki"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
            >
              Poznaj ścieżkę nauki
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/60 mr-1">Czego NIE robimy:</span>
            {['Nie dajemy sygnałów', 'Nie prowadzimy doradztwa', 'Nie obiecujemy wyników'].map(
              (b) => (
                <span
                  key={b}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80"
                >
                  {b}
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <div className="grid sm:grid-cols-2 gap-6">
            {trust.map((card) => (
              <div
                key={card.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
              >
                <div className="text-base font-semibold mb-2">{card.title}</div>
                <div className="text-sm text-white/70">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


