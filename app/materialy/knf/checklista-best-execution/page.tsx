import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Checklista Best Execution (MiFID II) | FXEduLab',
  description:
    'Operacyjna checklista best execution: przed, w trakcie i po transakcji — czynniki, obowiązki, typowe błędy i wskazówki na egzamin.',
};

const sectionCard =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-5 md:p-6 shadow-md';

function CheckRow({ children }: { children: ReactNode }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.04]">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-slate-900 text-amber-500 focus:ring-amber-500/40"
      />
      <span className="text-sm leading-relaxed text-slate-200">{children}</span>
    </label>
  );
}

export default function Page() {
  return (
    <ExamMaterialShell
      trackBreadcrumbLabel="KNF"
      trackHref="/kursy/egzaminy/knf"
      materialLabel="Best execution"
      title="Checklista Best Execution (MiFID II)"
      description="Praktyczna lista kontrolna dla domu maklerskiego i zespołu compliance: od polityki i parametrów po dokumentację i przegląd po zawarciu transakcji."
      badges={['Materiał referencyjny', 'Checklist']}
      backHref="/kursy/egzaminy/knf"
      backLabel="← Wróć do ścieżki KNF"
      downloadFormat="PDF"
    >
      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Czym jest best execution?</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Best execution to obowiązek podmiotu wykonującego zlecenie, aby uzyskać dla klienta{' '}
          <strong className="font-semibold text-white">najlepszy możliwy rezultat</strong> przy
          realizacji jego zlecenia — z uwzględnieniem wielu czynników (m.in. cena, koszty, szybkość,
          prawdopodobieństwo realizacji), a nie wyłącznie „najniższej widocznej ceny”.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          W praktyce oznacza to: politykę, monitoring rynków i miejsc realizacji, uzasadnienia
          wyboru oraz dowody, że procedury są stosowane konsekwentnie.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Czynniki (execution factors)</h2>
        <p className="mt-2 text-sm text-slate-400">
          Na egzaminie: potrafisz wymienić i krótko opisać, co każdy czynnik znaczy w kontekście
          instrumentu i zlecenia.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li>
            <span className="font-semibold text-amber-200/90">Price</span> — cena instrumentu
            bazowego lub pośredniego w momencie realizacji; porównanie wobec dostępnych ofert (w
            granicach wykonalności).
          </li>
          <li>
            <span className="font-semibold text-amber-200/90">Cost</span> — pełne koszty dla
            klienta: prowizje, spread, opłaty rynkowe, konwersje, ewentualne opłaty pośredników.
          </li>
          <li>
            <span className="font-semibold text-amber-200/90">Speed</span> — czas realizacji vs
            zmienność i ryzyko poślizgu (szczególnie przy dużej płynności lub zleceniach
            warunkowych).
          </li>
          <li>
            <span className="font-semibold text-amber-200/90">Likelihood of execution</span> — szansa
            faktycznego wypełnienia zlecenia w całości lub w akceptowalnym procencie (ważne przy
            zleceniach z limitem, w słabszej płynności, poza godzinami).
          </li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Przed transakcją</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Mam aktualną politykę best execution zgodną z profilem klientów i produktów (w tym
            warianty dla retail vs professional, jeśli stosujecie różnice uzasadnione prawem).
          </CheckRow>
          <CheckRow>
            Znam i dokumentuję miejsca realizacji (venues) oraz logikę routingu — kiedy idzie na
            RM, kiedy wewnętrznie, kiedy do partnera.
          </CheckRow>
          <CheckRow>
            Parametry monitorowania (np. porównania cen/kosztów, próby, tolerancje) są skalibrowane
            do klasy instrumentu i typu zlecenia.
          </CheckRow>
          <CheckRow>
            Klient otrzymał informacje o polityce i miejscach realizacji w sposób przewidziany
            przepisami (w tym aktualizacje przy istotnych zmianach).
          </CheckRow>
          <CheckRow>
            Zespół wie, jak obsłużyć zlecenia szczególne (duże, poza rynkiem, złożone produkty
            zależne).
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">W trakcie realizacji</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Routing jest zgodny z polityką; odstępstwa (np. awaria kontrahenta) są rejestrowane.
          </CheckRow>
          <CheckRow>
            Nie faworyzujemy własnego interesu ani powiązanych podmiotów kosztem klienta bez
            jawnego, zgodnego z prawem mechanizmu i kontroli konfliktów.
          </CheckRow>
          <CheckRow>
            Przy zleceniach podzielonych sprawdzamy, czy agregacja nie działa na niekorzyść klienta
            (i czy mamy wyjątki/reguły zgodne z wymaganiami).
          </CheckRow>
          <CheckRow>
            Zapisujemy kluczowe dane operacyjne: czas, venue, warunki rynkowe istotne dla oceny
            jakości realizacji.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Po transakcji</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Przeprowadzamy okresowy przegląd jakości realizacji (quality of execution) — nie tylko
            „średnia cena”, ale kontekst i porównania z benchmarkami tam, gdzie ma to sens.
          </CheckRow>
          <CheckRow>
            Wnioski z monitoringu trafiają do zarządu / komitetu — i faktycznie wpływają na
            zmiany polityki lub routingu.
          </CheckRow>
          <CheckRow>
            Incydenty i eskalacje są dokumentowane: root cause, działania korygujące, terminy.
          </CheckRow>
          <CheckRow>
            Dane do raportowania wewnętrznego/regulatorynego są kompletne i spójne z księgowaniem.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Obowiązki brokera (skrót)</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Ustanowić i utrzymywać skuteczną politykę best execution.</li>
          <li>Monitorować jakość realizacji i doskonalić ją na podstawie dowodów.</li>
          <li>Informować klientów w wymaganym zakresie (polityka, miejsca, zmiany).</li>
          <li>Zapewnić kontrolę konfliktów interesów tam, gdzie mogą wpływać na routing.</li>
          <li>Prowadzić dokumentację umożliwiającą audyt „dlaczego tak zrealizowano”.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Obowiązki klienta (perspektywa egzaminu)</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Przekazywanie rzetelnych informacji niezbędnych do oceny stosowności / właściwości.</li>
          <li>Świadomość kosztów i warunków zawartych w dokumentach informacyjnych.</li>
          <li>
            Rozumienie, że „najlepsza cena widoczna na ekranie” to nie zawsze pełny obraz kosztu i
            ryzyka realizacji.
          </li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Typowe błędy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-red-400/60">
          <li>Polityka istnieje „na półce”, ale operacje routują według starego nawyku.</li>
          <li>Uznawanie najniższego spreadu za best execution bez uwzględnienia kosztów pośrednich.</li>
          <li>Brak aktualizacji listy venues po zmianie struktury rynku lub kontrahentów.</li>
          <li>Monitoring tylko na jednym instrumencie „reprezentatywnym” bez pokrycia klas aktywów.</li>
          <li>Brak śladu decyzyjnego przy awarii systemu lub ręcznej interwencji dealera.</li>
          <li>Mylenie best execution z wykonaniem zlecenia „po każdej cenie” — to nie to samo.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Na egzaminie — co zwykle sprawdzają</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-emerald-400/70">
          <li>Definicja best execution i różnica względem „samej ceny”.</li>
          <li>Wymienienie czynników realizacji i przykład, kiedy który dominuje.</li>
          <li>Rola polityki, przeglądów jakości realizacji i raportowania do zarządu.</li>
          <li>Związek z konfliktami interesów (np. wewnętrzna realizacja, powiązania).</li>
          <li>Informowanie klientów o polityce i miejscach realizacji — sens merytoryczny.</li>
        </ul>
      </section>
    </ExamMaterialShell>
  );
}
