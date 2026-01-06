'use client';
import React, { useState } from 'react';

const QA = [
  {
    q: "Dlaczego ten sam broker ma różne warunki w zależności od kraju?",
    a: "Warunki zależą od jurysdykcji, regulacji, typu podmiotu i oferty na danym rynku. Sprawdzaj dokumenty oraz podmiot, z którym zawierasz umowę.",
  },
  {
    q: "Na co uważać przy promocjach i bonusach?",
    a: "Zawsze czytaj regulaminy: wymagane wolumeny, ograniczenia instrumentów, czas trwania. Unikaj wniosków bez weryfikacji warunków.",
  },
  {
    q: "CFD: dlaczego koszty overnight (swap) mają znaczenie?",
    a: "Swapy wpływają na wynik przy dłuższym utrzymaniu pozycji. Różnią się między rachunkami i instrumentami — sprawdzaj tabele kosztów.",
  },
  {
    q: "Jak porównać obsługę klienta przed założeniem konta?",
    a: "Sprawdź język i godziny wsparcia, czasy odpowiedzi, dostępność VIP, kanały kontaktu i jakość onboardingu.",
  },
  {
    q: "Czy platforma własna jest lepsza niż MT4/MT5?",
    a: "To zależy od potrzeb: własne platformy bywają wygodne i stabilne, MT4/MT5 dają szerokie integracje. Przetestuj konta demo.",
  },
];

export default function BrokersFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-semibold mb-2">FAQ</h3>
      <div className="divide-y divide-white/10">
        {QA.map((item, idx) => (
          <div key={idx}>
            <button
              className="w-full text-left py-3 flex items-center justify-between"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <span className="font-medium">{item.q}</span>
              <span className="text-white/60">{openIdx === idx ? "−" : "+"}</span>
            </button>
            {openIdx === idx && <p className="pb-3 text-sm text-white/80">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}


