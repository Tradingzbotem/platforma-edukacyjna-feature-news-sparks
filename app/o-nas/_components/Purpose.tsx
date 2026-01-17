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
    <section className="py-12 lg:py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Po co stworzyliśmy tę platformę?</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, desc, bullets, Icon }) => (
          <div
            key={title}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 mb-4">
              <Icon className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">{desc}</p>
            <ul className="space-y-2 text-sm text-white/80">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
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


