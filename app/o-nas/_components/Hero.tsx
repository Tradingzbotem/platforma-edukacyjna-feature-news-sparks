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
    <section className="mt-6">
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            O nas
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl">
            Uczymy procesu i zarządzania ryzykiem, nie gonienia wyniku. Tworzymy narzędzia,
            które pomagają podejmować bardziej świadome decyzje: checklisty, scenariusze,
            quizy i praktyczne zadania — bez doradztwa inwestycyjnego.
          </p>

          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {bullets.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-white/90">{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/ebooki#plany"
              aria-label="Zobacz pakiety"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Zobacz pakiety
            </Link>
            <Link
              href="#jak-pracujemy"
              aria-label="Poznaj ścieżkę nauki"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white px-5 py-3 font-semibold border border-white/10 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Poznaj ścieżkę nauki
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
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

        <div className="lg:col-span-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {trust.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-black/30 p-5"
              >
                <div className="text-base font-semibold">{card.title}</div>
                <div className="text-sm text-white/70 mt-1">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


