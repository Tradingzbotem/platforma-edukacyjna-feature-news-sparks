// app/zasoby/faq/page.tsx
'use client';

import Link from "next/link";

const QA = [
  {
    q: "Czy to są porady inwestycyjne?",
    a: "Nie. Serwis ma charakter wyłącznie edukacyjny. Nie udzielamy rekomendacji ani sygnałów rynkowych."
  },
  {
    q: "Czy muszę zakładać konto?",
    a: "Nie, treści otwarte (kursy/quizy demo/glosariusz) są dostępne bez logowania. Konto może być wymagane dla zapisu postępów."
  },
  {
    q: "Jak liczone są wyniki w quizach?",
    a: "Za każdą poprawną odpowiedź otrzymujesz 1 punkt. W wynikach pokazujemy liczbę punktów oraz procent poprawnych odpowiedzi."
  },
  {
    q: "Czy kalkulator obsługuje różne instrumenty?",
    a: "Tak. W kalkulatorze znajdziesz m.in. margin dla FX/indeksów/surowców oraz kalkulator wielkości pozycji z parametrami SL/ryzyko."
  },
  {
    q: "Jak dodać wątek na forum?",
    a: "Wejdź na /forum, kliknij „+ Nowy wątek”, wybierz kategorię, dodaj tytuł i treść. Pamiętaj o kulturze wypowiedzi."
  },
  {
    q: "Czy przechowujecie moje dane?",
    a: "Przechowujemy tylko dane niezbędne do działania serwisu (np. postęp nauki). Szczegóły w Polityce prywatności."
  },
  {
    q: "Z jakich źródeł warto korzystać?",
    a: "Czytaj dokumentacje brokerów/regulacji, raporty banków centralnych, a także testuj własne hipotezy na danych historycznych."
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <nav className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          ← Strona główna
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">FAQ</h1>
        <p className="mt-2 text-white/70">
          Najczęściej zadawane pytania o platformę i materiały edukacyjne.
        </p>
      </header>

      <section className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">
        <div className="grid gap-3">
          {QA.map((item) => (
            <details key={item.q} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <summary className="cursor-pointer font-semibold">{item.q}</summary>
              <p className="mt-2 text-sm text-white/80">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
