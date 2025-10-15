import Link from "next/link";
import type { ReactNode } from "react";

function ArticleLayout({
  backHref, title, minutes, children,
}: { backHref: string; title: string; minutes: number; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <Link href={backHref} className="text-sm underline">← Wróć do materiałów</Link>
      <header className="space-y-1">
        <p className="text-slate-400 text-sm">Materiały dodatkowe • ⏱ {minutes} min</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
      </header>
      <article className="rounded-2xl bg-[#0b1220] border border-white/10 p-6 space-y-8">{children}</article>
    </main>
  );
}

export default function Page() {
  return (
    <ArticleLayout backHref="/kursy/materialy" minutes={12} title="Psychologia inwestowania — proste zasady na co dzień">
      <section>
        <h2 className="text-xl font-semibold">Typowe pułapki</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>FOMO</strong> — „wejdę, bo ucieknie” → decyzja bez planu.</li>
          <li><strong>Odzyskiwanie strat</strong> — podwajanie ryzyka po serii niepowodzeń.</li>
          <li><strong>Overtrading</strong> — zbyt dużo transakcji „bo coś kliknę”.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Trzy proste reguły</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Limit dzienny</strong>: max <em>2R</em> w dół — koniec dnia.</li>
          <li><strong>Przerwa</strong>: 2 straty z rzędu → 20–30 min przerwy.</li>
          <li><strong>1R stałe</strong>: to samo ryzyko na każdą pozycję (np. 0.5% kapitału).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Prosta rutyna</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Przed sesją</strong>: 2–3 scenariusze „jeśli A → to B”, poziomy i 1R.</li>
          <li><strong>W trakcie</strong>: decyzje tylko z checklisty, bez „bo czuję”.</li>
          <li><strong>Po sesji</strong>: 2 zrzuty ekranu + 3 zdania: co było dobrze / błąd / co poprawić jutro.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-checklista (wydrukuj)</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Mam poziomy i scenariusze?</li>
          <li>Wejście zgodnie z planem (nie emocją)?</li>
          <li>SL/TP wpisane, rozmiar pozycji zgodny z 1R?</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ćwiczenie (5 min po sesji)</h2>
        <ol className="mt-2 list-decimal pl-6">
          <li>Napisz 3 zdania o dzisiejszych decyzjach.</li>
          <li>Jedna mała zmiana na jutro (np. „nie gram 10 min po danych”).</li>
        </ol>
      </section>
    </ArticleLayout>
  );
}
