import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8 text-white">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold">Cennik</h1>
      <p className="mt-2 text-white/70">Plany subskrypcyjne dla platformy edukacyjnej FX EduLab</p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Dostępne plany</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-6">
              <h3 className="text-xl font-bold">STARTER EDU</h3>
              <p className="text-2xl font-bold mt-2">59 PLN (€14)/miesiąc</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>Kalendarz wydarzeń 7 dni</li>
                <li>Scenariusze warunkowe A/B/C</li>
                <li>Checklisty decyzyjne</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-6">
              <h3 className="text-xl font-bold">PRO EDU</h3>
              <p className="text-2xl font-bold mt-2">110 PLN (€26)/miesiąc</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>Wszystko ze Starter</li>
                <li>Mapy techniczne (EDU)</li>
                <li>Playbooki eventowe</li>
                <li>Analizy makro</li>
              </ul>
            </div>

            {/* Elite Plan */}
            <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-6">
              <h3 className="text-xl font-bold">ELITE EDU</h3>
              <p className="text-2xl font-bold mt-2">199 PLN (€47)/miesiąc</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>Wszystko z Pro</li>
                <li>Ramy zarządzania ryzykiem</li>
                <li>Zaawansowane checklisty</li>
                <li>Dostęp do forum premium</li>
                <li>Asystent AI (bez limitu)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Subskrypcja i płatności</h2>
          <p className="text-white/80 mb-4">
            Wszystkie plany są dostępne w formie miesięcznej subskrypcji. Płatności są przetwarzane przez Paddle, naszego zaufanego partnera płatniczego.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-white/80">
            <li>Subskrypcja odnawia się automatycznie co miesiąc</li>
            <li>Możesz anulować subskrypcję w dowolnym momencie</li>
            <li>Anulowanie wejdzie w życie na koniec bieżącego okresu rozliczeniowego</li>
            <li>Akceptujemy karty kredytowe i inne metody płatności obsługiwane przez Paddle</li>
            <li>Ceny podane w złotych polskich (PLN) i euro (€) po aktualnym kursie wymiany</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Anulowanie i zwroty</h2>
          <p className="text-white/80 mb-4">
            Jeśli nie jesteś zadowolony z usługi, możesz anulować subskrypcję i zażądać zwrotu zgodnie z naszą polityką zwrotów.
          </p>
          <p className="text-white/80">
            Szczegóły znajdziesz w <Link href="/prawne/zwroty-odstapienie" className="underline">polityce zwrotów</Link>.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl bg-[#0b1220] border border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
        <p className="text-white/80">
          Masz pytania dotyczące cennika lub subskrypcji? Skontaktuj się z nami przez{" "}
          <Link href="/kontakt?topic=zakup-pakietu" className="underline">formularz kontaktowy</Link>.
        </p>
        <p className="text-white/80 mt-2">
          FX EduLab to platforma edukacyjna poświęcona nauce Forex i CFD. Nie świadczymy porad inwestycyjnych.
        </p>
      </div>
    </main>
  );
}