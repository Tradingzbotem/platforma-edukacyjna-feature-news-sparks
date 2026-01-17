export default function Process() {
  const steps = [
    {
      num: 1,
      title: 'Selekcja tematów',
      desc: 'Wybieramy zagadnienia, które mają praktyczne zastosowanie.',
      deliverable: 'brief',
    },
    {
      num: 2,
      title: 'Walidacja merytoryczna',
      desc: 'Sprawdzamy źródła, pojęcia i zależności — bez skrótów.',
      deliverable: 'checklista',
    },
    {
      num: 3,
      title: 'Przełożenie na praktykę',
      desc: 'Tworzymy scenariusze i zadania „krok po kroku”.',
      deliverable: 'scenariusz',
    },
    {
      num: 4,
      title: 'Aktualizacja materiałów',
      desc: 'Wracamy do treści, gdy pojawia się lepszy sposób wyjaśnienia.',
      deliverable: 'aktualizacja',
    },
  ];

  return (
    <section id="jak-pracujemy" className="py-12 lg:py-16 scroll-mt-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Jak pracujemy?</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 font-bold text-lg mb-4">
              {s.num}
            </div>
            <h3 className="text-xl font-bold mb-2">{s.title}</h3>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">{s.desc}</p>
            <div className="inline-flex text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">
              {s.deliverable}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


