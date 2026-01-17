import Link from "next/link";
import type { ReactNode } from "react";

function LessonLayout({
  coursePath, courseTitle, lessonNumber, title, minutes, children, prevSlug, nextSlug,
}: {
  coursePath: "regulacje";
  courseTitle: string;
  lessonNumber: number;
  title: string;
  minutes: number;
  children: ReactNode;
  prevSlug?: string;
  nextSlug?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl p-6 md:p-8 space-y-6 animate-fade-in">
        <Link href={`/kursy/${coursePath}`} className="inline-flex items-center gap-2 text-sm underline hover:text-white transition-colors duration-150">← Wróć do spisu</Link>

        <header className="space-y-1">
          <p className="text-slate-400 text-sm">
            <span>{courseTitle}</span>
            <span> — </span>
            <span>Lekcja</span> <span>{lessonNumber}</span>
            <span> • ⏱ </span>
            <span>{minutes}</span> <span>min</span>
          </p>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
        </header>

        <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm p-6 space-y-8 shadow-lg">
          {children}
        </article>

        <nav className="flex items-center justify-between pt-4 border-t border-white/10">
          {prevSlug ? (
            <Link className="underline hover:text-white transition-colors duration-150" href={`/kursy/${coursePath}/${prevSlug}`}>← Poprzednia lekcja</Link>
          ) : <span />}
          {nextSlug ? (
            <Link className="underline hover:text-white transition-colors duration-150" href={`/kursy/${coursePath}/${nextSlug}`}>Następna lekcja →</Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <LessonLayout
      coursePath="regulacje"
      courseTitle="Regulacje i egzaminy"
      lessonNumber={5}
      minutes={13}
      title="Marketing i compliance: KID/KIID, materiały promocyjne"
      prevSlug="lekcja-4"
      nextSlug="lekcja-6"
    >
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Zrozumiesz zasadę <strong>„fair, clear, not misleading”</strong> w materiałach marketingowych.</li>
          <li>Poznasz wymogi dotyczące dokumentów <strong>KID/KIID</strong>.</li>
          <li>Dowiesz się, jakie praktyki marketingowe są zakazane.</li>
          <li>Zrozumiesz, kto odpowiada za zatwierdzanie materiałów marketingowych.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Zasada „fair, clear, not misleading”</h2>
        <p className="mt-2 text-slate-300">
          Wszystkie materiały marketingowe muszą być <strong>sprawiedliwe</strong>, <strong>jasne</strong> i <strong>nie wprowadzające w błąd</strong>. 
          Nie mogą obiecywać gwarantowanych zysków ani ukrywać ryzyk.
        </p>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-emerald-200">Dozwolone praktyki</h3>
            <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
              <li>Zawieranie ostrzeżeń o ryzyku</li>
              <li>Prezentowanie historycznych wyników z zastrzeżeniami</li>
              <li>Wyjaśnianie kosztów i przykładów R:R</li>
              <li>Odsyłanie do dokumentów KID/KIID</li>
            </ul>
          </div>
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">Zakazane praktyki</h3>
            <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
              <li>Obiecywanie gwarantowanych zysków</li>
              <li>Ukrywanie ryzyk i kosztów</li>
              <li>Prezentowanie tylko korzystnych wyników</li>
              <li>Używanie agresywnych technik sprzedażowych</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">KID/KIID (Key Information Document)</h2>
        <p className="mt-2 text-slate-300">
          <strong>KID</strong> (Key Information Document) to dokument zawierający kluczowe informacje o produkcie, ryzykach i kosztach. 
          Musi być dostarczony klientowi przed zawarciem transakcji.
        </p>
        <div className="mt-4 rounded-xl bg-indigo-500/5 backdrop-blur-sm border border-indigo-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-indigo-200">Co musi zawierać KID/KIID?</h3>
          <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
            <li><strong>Opis produktu</strong> — charakterystyka i mechanika działania</li>
            <li><strong>Ryzyka</strong> — wszystkie istotne ryzyka związane z produktem</li>
            <li><strong>Koszty i opłaty</strong> — wszystkie istotne koszty: spread, prowizje, swap, poślizg</li>
            <li><strong>Przykładowe scenariusze</strong> — przykłady zysków i strat w różnych sytuacjach</li>
            <li><strong>Informacje o gwarancjach</strong> — czy produkt jest objęty gwarancjami (np. negative balance protection)</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Wymagane ostrzeżenia</h2>
        <p className="mt-2 text-slate-300">
          Materiały promocyjne CFD muszą zawierać ostrzeżenie o ryzyku, np.: <strong>„X% kont detalicznych traci pieniądze przy handlu CFD z tym dostawcą”</strong>.
        </p>
        <div className="mt-4 rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-red-200">Przykładowe ostrzeżenie</h3>
          <p className="text-slate-300 mt-1 text-sm italic">
            „74% kont detalicznych traci pieniądze przy handlu CFD. CFD są złożonymi instrumentami i wiążą się z wysokim ryzykiem szybkiej utraty środków 
            z powodu dźwigni finansowej. Powinieneś rozważyć, czy rozumiesz, jak działają CFD i czy możesz pozwolić sobie na wysokie ryzyko utraty pieniędzy.”
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Zatwierdzanie materiałów marketingowych</h2>
        <p className="mt-2 text-slate-300">
          Materiały marketingowe muszą być zatwierdzone przez <strong>dział compliance</strong> przed publikacją. 
          Nie może tego zrobić dział sprzedaży ani dowolny pracownik.
        </p>
        <div className="mt-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
          <h3 className="font-semibold text-white">Proces zatwierdzania</h3>
          <ol className="text-slate-300 mt-1 space-y-1 text-sm list-decimal pl-6">
            <li>Przygotowanie materiału przez dział marketingowy</li>
            <li>Przegląd przez dział compliance</li>
            <li>Weryfikacja zgodności z regulacjami (MiFID II, ESMA)</li>
            <li>Zatwierdzenie lub zwrot do poprawy</li>
            <li>Publikacja tylko po zatwierdzeniu</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Odpowiedzialność za materiały partnerów</h2>
        <p className="mt-2 text-slate-300">
          Jeśli partner IB (Introducing Broker) publikuje reklamę, odpowiada za nią <strong>również broker CIF</strong> (Cyprus Investment Firm), 
          ponieważ jest odpowiedzialny za przekaz informacji do klientów.
        </p>
        <div className="mt-4 rounded-xl bg-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-amber-200">Przykład</h3>
          <p className="text-slate-300 mt-1 text-sm">
            Jeśli partner IB publikuje reklamę CFD z obietnicą gwarantowanych zysków, odpowiedzialność ponosi zarówno partner IB, 
            jak i broker CIF, który powinien monitorować materiały swoich partnerów.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Zakazane praktyki marketingowe</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">1. Obiecywanie gwarantowanych zysków</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Materiały nie mogą sugerować, że zyski są gwarantowane lub że ryzyko jest minimalne.
            </p>
          </div>
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">2. Ukrywanie ryzyk i kosztów</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Wszystkie istotne ryzyka i koszty muszą być jasno przedstawione, nie mogą być ukryte w małym druku.
            </p>
          </div>
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">3. Prezentowanie tylko korzystnych wyników</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Materiały muszą być zrównoważone — nie można pokazywać tylko zysków bez pokazania ryzyk i możliwych strat.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozumiem zasadę <strong>„fair, clear, not misleading”</strong> w materiałach marketingowych.</li>
          <li>Wiem, czym jest <strong>KID/KIID</strong> i co musi zawierać.</li>
          <li>Znam zakazane praktyki marketingowe i wymagane ostrzeżenia.</li>
          <li>Wiem, że materiały marketingowe muszą być zatwierdzone przez <strong>dział compliance</strong>.</li>
          <li>Rozumiem, że broker odpowiada za materiały swoich partnerów IB.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
