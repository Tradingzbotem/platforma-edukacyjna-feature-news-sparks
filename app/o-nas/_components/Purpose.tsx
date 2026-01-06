import { BookIcon, ChartIcon, ShieldIcon } from './Icons';

export default function Purpose() {
  const cards = [
    {
      title: 'Praktyka ponad teorię',
      desc: 'Wiedza przełożona na działanie, małe kroki i ćwiczenia.',
      bullets: ['Scenariusze z checklistą', 'Zadania do wykonania'],
      Icon: ChartIcon,
    },
    {
      title: 'Jasne zasady ryzyka',
      desc: 'Zrozumiałe ramy: kapitał, ekspozycja, konsekwencje decyzji.',
      bullets: ['Progi i limity ryzyka', 'Przykłady decyzji „tak/nie”'],
      Icon: ShieldIcon,
    },
    {
      title: 'Edukacja, nie obietnice',
      desc: 'Uczymy procesu i krytycznego myślenia, nie wyników.',
      bullets: ['Quizy i testy kontrolne', 'Materiały referencyjne'],
      Icon: BookIcon,
    },
  ];

  return (
    <section className="mt-14">
      <h2 className="text-2xl md:text-3xl font-bold">Po co stworzyliśmy tę platformę?</h2>
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {cards.map(({ title, desc, bullets, Icon }) => (
          <div
            key={title}
            className="rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl shadow-black/30 p-6"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-white/75 text-sm">{desc}</p>
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}


