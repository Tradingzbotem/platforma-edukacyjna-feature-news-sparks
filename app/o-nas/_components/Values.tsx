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
    <section className="mt-14">
      <h2 className="text-2xl md:text-3xl font-bold">Nasze wartości</h2>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {items.map(({ title, desc, Icon }) => (
          <div
            key={title}
            className="rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl shadow-black/30 p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="font-semibold">{title}</h3>
            </div>
            <p className="mt-2 text-white/80 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


