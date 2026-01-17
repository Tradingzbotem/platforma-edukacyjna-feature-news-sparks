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
      lessonNumber={2}
      minutes={12}
      title="Testy adekwatności i odpowiedniości"
      prevSlug="lekcja-1"
      nextSlug="lekcja-3"
    >
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Zrozumiesz różnicę między <strong>testem adekwatności</strong> a <strong>testem odpowiedniości</strong>.</li>
          <li>Dowiesz się, kiedy wymagany jest każdy z testów.</li>
          <li>Poznasz, co dokładnie bada każdy test.</li>
          <li>Zrozumiesz konsekwencje niezaliczenia testu.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Test adekwatności (Appropriateness Test)</h2>
        <p className="mt-2 text-slate-300">
          <strong>Test adekwatności</strong> sprawdza, czy klient rozumie ryzyka danego produktu i ma odpowiednie doświadczenie. 
          Jest wymagany dla produktów bez doradztwa inwestycyjnego, w tym dla CFD.
        </p>
        <div className="mt-4 rounded-xl bg-indigo-500/5 backdrop-blur-sm border border-indigo-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-indigo-200">Kiedy wymagany?</h3>
          <ul className="text-slate-300 mt-1 space-y-1 text-sm">
            <li>• Dla złożonych instrumentów jak CFD</li>
            <li>• Gdy broker świadczy usługę bez doradztwa inwestycyjnego</li>
            <li>• Przed pierwszą transakcją na danym instrumencie</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Co bada test adekwatności?</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">Wiedza o produkcie</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Czy klient rozumie charakterystykę produktu, mechanikę działania, ryzyka i możliwe konsekwencje?
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">Doświadczenie</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Czy klient ma doświadczenie w handlu podobnymi instrumentami? Ile transakcji wykonał w przeszłości?
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">Zrozumienie ryzyk</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Czy klient rozumie, że może stracić więcej niż wpłacony depozyt (przed wprowadzeniem negative balance protection)?
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">Świadomość możliwych strat</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Czy klient rozumie, że większość klientów detalicznych traci pieniądze przy handlu CFD?
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Test odpowiedniości (Suitability Test)</h2>
        <p className="mt-2 text-slate-300">
          <strong>Test odpowiedniości</strong> jest bardziej szczegółowy i wymagany przy doradztwie inwestycyjnym. 
          Sprawdza nie tylko wiedzę, ale także sytuację finansową klienta i cel inwestycyjny.
        </p>
        <div className="mt-4 rounded-xl bg-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-amber-200">Kiedy wymagany?</h3>
          <ul className="text-slate-300 mt-1 space-y-1 text-sm">
            <li>• Gdy broker świadczy doradztwo inwestycyjne</li>
            <li>• Przy rekomendacjach konkretnych produktów</li>
            <li>• Gdy broker zarządza portfelem klienta</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Różnice między testami</h2>
        <div className="mt-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white/70">Aspekt</th>
                <th className="text-left py-2 text-white/70">Appropriateness</th>
                <th className="text-left py-2 text-white/70">Suitability</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-white/5">
                <td className="py-2">Zastosowanie</td>
                <td className="py-2">Produkty bez doradztwa (np. CFD)</td>
                <td className="py-2">Produkty z doradztwem</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2">Sprawdza</td>
                <td className="py-2">Wiedzę i doświadczenie</td>
                <td className="py-2">Wiedzę, sytuację finansową i cele</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2">Sytuacja finansowa</td>
                <td className="py-2">Nie sprawdza</td>
                <td className="py-2">Sprawdza dochód i majątek</td>
              </tr>
              <tr>
                <td className="py-2">Cele inwestycyjne</td>
                <td className="py-2">Nie sprawdza</td>
                <td className="py-2">Sprawdza cele i horyzont czasowy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Konsekwencje niezaliczenia testu</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">Appropriateness — niezaliczenie</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Jeśli klient nie zaliczy testu adekwatności, broker <strong>nie może</strong> świadczyć usługi bez doradztwa. 
              Klient może zostać poproszony o dodatkowe szkolenie lub może zostać skierowany do produktów prostszych.
            </p>
          </div>
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">Suitability — niezaliczenie</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Jeśli klient nie zaliczy testu odpowiedniości, broker <strong>nie może</strong> świadczyć doradztwa inwestycyjnego. 
              Może zaproponować produkty bez doradztwa lub odmówić świadczenia usługi.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozumiem różnicę między <strong>testem adekwatności</strong> a <strong>testem odpowiedniości</strong>.</li>
          <li>Wiem, że <strong>appropriateness</strong> jest wymagany dla CFD bez doradztwa.</li>
          <li>Wiem, że <strong>suitability</strong> jest wymagany przy doradztwie inwestycyjnym.</li>
          <li>Rozumiem konsekwencje niezaliczenia każdego z testów.</li>
          <li>Wiem, że broker nie może świadczyć usługi, jeśli klient nie zaliczy wymaganego testu.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
