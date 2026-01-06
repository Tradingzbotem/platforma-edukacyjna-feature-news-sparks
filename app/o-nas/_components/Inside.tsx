export default function Inside() {
  const metrics = [
    { title: 'Moduły', desc: 'Dziesiątki zwięzłych lekcji' },
    { title: 'Quizy', desc: 'Sprawdzenie zrozumienia' },
    { title: 'Scenariusze', desc: 'Kroki „co jeśli”' },
    { title: 'Checklisty', desc: 'Decyzje w punktach' },
  ];

  return (
    <section className="mt-14">
      <h2 className="text-2xl md:text-3xl font-bold">Co znajdziesz w środku?</h2>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-black/30 p-5"
          >
            <div className="text-base font-semibold">{m.title}</div>
            <div className="text-sm text-white/70 mt-1">{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl shadow-black/30 p-6">
          <div className="text-sm text-white/70">Przykład briefu</div>
          <h3 className="mt-1 font-semibold">Brief: „Co sprawdzamy przed decyzją”</h3>
          <p className="mt-2 text-sm text-white/75">
            Cel, kontekst, dane wejściowe. Warunki „STOP”, gdy informacja jest niepełna lub
            jakość sygnału jest niska. Decyzja dopiero po przejściu checklisty.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl shadow-black/30 p-6">
          <div className="text-sm text-white/70">Przykład checklisty</div>
          <h3 className="mt-1 font-semibold">Checklista: „Wejście/wyjście”</h3>
          <ul className="mt-2 text-sm text-white/80 space-y-1">
            <li>1) Warunek A i B spełnione?</li>
            <li>2) Jaki limit ryzyka obowiązuje?</li>
            <li>3) Czy kontekst rynkowy nie wyklucza decyzji?</li>
            <li>4) Plan wyjścia i kryterium oceny po fakcie.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}


