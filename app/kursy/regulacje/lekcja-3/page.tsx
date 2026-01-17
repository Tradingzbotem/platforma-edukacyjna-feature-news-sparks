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
      lessonNumber={3}
      minutes={11}
      title="Best execution i konflikty interesów"
      prevSlug="lekcja-2"
      nextSlug="lekcja-4"
    >
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Zrozumiesz, czym jest <strong>best execution</strong> i jakie elementy bierze pod uwagę.</li>
          <li>Poznasz pojęcie <strong>konfliktu interesów</strong> i przykłady takich sytuacji.</li>
          <li>Dowiesz się, jak broker musi zarządzać konfliktami interesów.</li>
          <li>Zrozumiesz, dlaczego best execution jest ważny dla klienta.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Best Execution (Najlepsza realizacja)</h2>
        <p className="mt-2 text-slate-300">
          <strong>Best execution</strong> oznacza podejmowanie wszelkich uzasadnionych działań dla najlepszego wyniku zlecenia klienta, 
          biorąc pod uwagę cenę, koszty, szybkość, prawdopodobieństwo realizacji i inne istotne czynniki.
        </p>
        <div className="mt-4 rounded-xl bg-indigo-500/5 backdrop-blur-sm border border-indigo-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-indigo-200">Dlaczego best execution jest ważny?</h3>
          <p className="text-slate-300 mt-1 text-sm">
            Broker ma obowiązek działać w najlepszym interesie klienta. Nawet mała różnica w cenie realizacji może znacząco wpłynąć 
            na wyniki klienta, szczególnie przy częstych transakcjach.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Elementy best execution</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">1. Cena</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Najlepsza dostępna cena — broker musi wybrać najlepszą cenę spośród dostępnych opcji.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">2. Koszty</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Minimalizacja kosztów transakcyjnych — spread, prowizje, poślizg powinny być jak najniższe.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">3. Szybkość</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Szybka realizacja zlecenia — szczególnie ważne dla zleceń rynkowych i stop-loss.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">4. Prawdopodobieństwo realizacji</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Szansa na wykonanie zlecenia — broker musi ocenić, czy zlecenie zostanie zrealizowane.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm md:col-span-2">
            <h3 className="font-semibold text-white">5. Rozmiar i charakter zlecenia</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Broker musi uwzględnić wielkość zlecenia i jego charakter (np. zlecenie rynkowe vs. limit).
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Konflikty interesów</h2>
        <p className="mt-2 text-slate-300">
          <strong>Konflikt interesów</strong> powstaje, gdy interesy firmy lub pośrednika mogą kolidować z interesem klienta. 
          Broker musi identyfikować, zarządzać i ujawniać konflikty interesów.
        </p>
        <div className="mt-4 rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-red-200">Przykłady konfliktów interesów</h3>
          <ul className="text-slate-300 mt-1 space-y-2 text-sm">
            <li>
              <strong>Broker zarabia na spreadzie</strong> — może mieć interes w częstych transakcjach klienta, 
              nawet jeśli nie są one korzystne dla klienta.
            </li>
            <li>
              <strong>Prowizje od partnerów IB</strong> — broker może otrzymywać prowizje za polecenie konkretnych produktów, 
              co może wpływać na obiektywność rekomendacji.
            </li>
            <li>
              <strong>Własny trading desk</strong> — jeśli broker handluje własnym kapitałem, może konkurować z klientami, 
              co może prowadzić do konfliktów przy realizacji zleceń.
            </li>
            <li>
              <strong>Reklamy płatne</strong> — partnerzy płacący za reklamy mogą wpływać na obiektywność informacji 
              prezentowanych klientom.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Zarządzanie konfliktami interesów</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">1. Identyfikacja</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Broker musi systematycznie identyfikować potencjalne konflikty interesów w swojej działalności.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">2. Polityka konfliktów</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Broker musi mieć pisemną politykę konfliktów interesów, która opisuje, jak są one zarządzane.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">3. Ujawnianie</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Broker musi ujawnić klientowi potencjalne konflikty interesów przed zawarciem transakcji.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">4. Monitoring</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Broker musi regularnie monitorować i aktualizować swoją politykę konfliktów interesów.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Przykład best execution</h2>
        <div className="mt-4 rounded-xl bg-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 shadow-sm">
          <p className="text-slate-300 text-sm">
            Klient chce kupić EURUSD po cenie rynkowej. Broker ma dostęp do kilku źródeł płynności:
          </p>
          <ul className="text-slate-300 mt-2 space-y-1 text-sm list-disc pl-6">
            <li>Źródło A: 1.0850 (spread 1 pip)</li>
            <li>Źródło B: 1.0851 (spread 0.8 pip, ale wyższa prowizja)</li>
            <li>Źródło C: 1.0849 (spread 1.2 pip, wolniejsza realizacja)</li>
          </ul>
          <p className="text-slate-300 mt-2 text-sm">
            Broker musi ocenić wszystkie czynniki (cenę, koszty, szybkość, prawdopodobieństwo realizacji) 
            i wybrać najlepszą opcję dla klienta. Nie może kierować się tylko własnym zyskiem.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozumiem, czym jest <strong>best execution</strong> i jakie elementy bierze pod uwagę.</li>
          <li>Wiem, że best execution uwzględnia cenę, koszty, szybkość i prawdopodobieństwo realizacji.</li>
          <li>Rozumiem pojęcie <strong>konfliktu interesów</strong> i znam przykłady takich sytuacji.</li>
          <li>Wiem, że broker musi identyfikować, zarządzać i ujawniać konflikty interesów.</li>
          <li>Rozumiem, dlaczego best execution jest ważny dla ochrony interesów klienta.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
