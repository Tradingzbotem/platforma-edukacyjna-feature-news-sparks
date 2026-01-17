export default function Inside() {
  const metrics = [
    { title: 'Moduły', desc: 'Dziesiątki zwięzłych lekcji' },
    { title: 'Quizy', desc: 'Sprawdzenie zrozumienia' },
    { title: 'Scenariusze', desc: 'Kroki „co jeśli”' },
    { title: 'Checklisty', desc: 'Decyzje w punktach' },
  ];

  return (
    <section className="py-12 lg:py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Co znajdziesz w środku?</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5 hover:border-white/20 transition-colors"
          >
            <div className="text-base font-semibold mb-1">{m.title}</div>
            <div className="text-sm text-white/70">{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors">
          <div className="text-xs text-white/60 uppercase tracking-wider mb-2">Przykład briefu</div>
          <h3 className="text-xl font-bold mb-3">Brief: „Co sprawdzamy przed decyzją”</h3>
          <p className="text-sm text-white/70 leading-relaxed">
            Cel, kontekst, dane wejściowe. Warunki „STOP”, gdy informacja jest niepełna lub
            jakość sygnału jest niska. Decyzja dopiero po przejściu checklisty.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors">
          <div className="text-xs text-white/60 uppercase tracking-wider mb-2">Przykład checklisty</div>
          <h3 className="text-xl font-bold mb-3">Checklista: „Wejście/wyjście”</h3>
          <ul className="text-sm text-white/80 space-y-2">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
              <span>Warunek A i B spełnione?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
              <span>Jaki limit ryzyka obowiązuje?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
              <span>Czy kontekst rynkowy nie wyklucza decyzji?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
              <span>Plan wyjścia i kryterium oceny po fakcie.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}


