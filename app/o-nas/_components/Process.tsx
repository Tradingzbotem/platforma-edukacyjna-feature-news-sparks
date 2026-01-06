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
    <section id="jak-pracujemy" className="mt-14 scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold">Jak pracujemy?</h2>

      {/* Desktop: poziomo z linią; Mobile: lista */}
      <div className="mt-8">
        <div className="hidden md:block relative">
          <div className="absolute left-0 right-0 top-[36px] h-px bg-white/10" />
          <div className="grid grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="flex items-center gap-3">
                  <div className="relative z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 text-sm font-semibold">
                    {s.num}
                  </div>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-white/75">{s.desc}</div>
                    <div className="mt-2 inline-flex text-[11px] rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/80">
                      {s.deliverable}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className="rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl shadow-black/30 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/15 text-xs font-semibold">
                  {s.num}
                </div>
                <div className="font-semibold">{s.title}</div>
              </div>
              <p className="mt-1 text-sm text-white/75">{s.desc}</p>
              <div className="mt-2 inline-flex text-[11px] rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/80">
                {s.deliverable}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


