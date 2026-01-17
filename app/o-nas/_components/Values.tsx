import { BookIcon, ShieldIcon, ChartIcon, GearIcon } from './Icons';

export default function Values() {
  const items = [
    {
      title: 'Klarowność i prosty język',
      desc:
        'Unikamy żargonu, gdy nie wnosi wartości. Materiały są krótkie, konkretne i logicznie ułożone.',
      Icon: BookIcon,
    },
    {
      title: 'Odpowiedzialne podejście do ryzyka',
      desc:
        'Decyzje mają konsekwencje. Uczymy limitów, ekspozycji i scenariuszy „co jeśli”.',
      Icon: ShieldIcon,
    },
    {
      title: 'Edukacja, nie obietnice zysku',
      desc:
        'Pokazujemy proces i ramy myślenia. Nie dajemy sygnałów, nie reklamujemy wyników.',
      Icon: ChartIcon,
    },
    {
      title: 'Transparentność działania',
      desc:
        'Wyjaśniamy skąd pochodzą treści i jak powstają. Aktualizujemy, gdy można lepiej.',
      Icon: GearIcon,
    },
  ];

  return (
    <section className="py-12 lg:py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Nasze wartości</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map(({ title, desc, Icon }) => (
          <div
            key={title}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex-shrink-0">
                <Icon className="w-6 h-6 text-emerald-300" />
              </span>
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


