import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Checklisty regulacyjne — Przewodnik KNF / ESMA | FXEduLab',
  description:
    'Operacyjne checklisty: nadzór KNF, dokumentacja klienta, wytyczne ESMA, incydenty i przygotowanie pod egzamin.',
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

const track = {
  trackBreadcrumbLabel: 'Przewodnik',
  trackHref: '/kursy/egzaminy/przewodnik',
  backHref: '/kursy/egzaminy/przewodnik',
  backLabel: '← Wróć do ścieżki Przewodnik',
} as const;

export default function Page() {
  return (
    <ExamMaterialShell
      {...track}
      materialLabel="Checklisty"
      title="Checklisty regulacyjne — KNF, ESMA, dokument klienta"
      description="Lista kontrolna dla zespołu compliance i back-office: co zweryfikować zanim powiesz „zgodne z regulacją”, bez zastępowania prawnika — ale z porządkiem operacyjnym."
      badges={['Materiał referencyjny', 'Checklist']}
      downloadFormat="PDF"
    >
      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Po co ta lista</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Ścieżka „Przewodnik” łączy perspektywę polskiego nadzoru, unijnych wytycznych (w tym ESMA)
          oraz wymogi dystrybucji (MiFID). Checklista pomaga szybko sprawdzić, czy procesy i dowody
          są spójne — szczególnie przed audytem wewnętrznym lub testem.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Nadzór i ramy (KNF — orientacja)</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Wiem, które akty prawne i komunikaty KNF są kluczowe dla naszego modelu (np. dom maklerski
            vs inny podmiot) i gdzie je znaleźć na bieżąco.
          </CheckRow>
          <CheckRow>
            Lista wymogów raportowych / informacyjnych jest utrzymywana z terminami i właścicielem
            danych (nie „ktoś z Excela”).
          </CheckRow>
          <CheckRow>
            Zmiany w produktach lub dystrybucji mają ścieżkę zatwierdzenia compliance przed startem
            kampanii.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Wytyczne ESMA — wdrożenie w praktyce</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Zespół wie, które obszary są typowo regulowane wytycznymi (np. dystrybucja, ryzyka
            produktowe, komunikacja) i jak mapują się na nasze procedury.
          </CheckRow>
          <CheckRow>
            Nowe Q&amp;A lub aktualizacje ESMA są czytane przez wyznaczoną osobę i ewidencjonowane w
            rejestrze wpływu na firmę.
          </CheckRow>
          <CheckRow>
            Nie stosujemy „dosłownego tłumaczenia PDF na kampanię” bez oceny kontekstu polskiego
            nadzoru i własnej polityki produktowej.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Pakiet klienta detalicznego</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            KID / KIID / regulamin i ostrzeżenia są w wersjach aktualnych i spójnych z ofertą widoczną
            na stronie.
          </CheckRow>
          <CheckRow>
            Testy suitability lub appropriateness są zapisane z datą, wynikiem i ewentualnym
            ostrzeżeniem — zgodnie z modelem usługi (rada vs execution-only).
          </CheckRow>
          <CheckRow>
            Zgody marketingowe i bazy kontaktów mają podstawę prawną i wycofanie jest realnie
            obsługiwane.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Incydenty, skargi, eskalacja</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Jest zdefiniowany poziom eskalacji: kiedy sprawa idzie do compliance, kiedy do zarządu,
            kiedy do organu.
          </CheckRow>
          <CheckRow>
            Po incydencie operacyjnym (np. błąd cenowy, awaria routingu) zachowujemy log czasu,
            decyzje i komunikację z klientami.
          </CheckRow>
          <CheckRow>
            Skargi klientów są numerowane, mierzymy czas odpowiedzi i typowe przyczyny — to pod
            continuous improvement.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Na egzaminie</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Różnica: nadzór krajowy vs rola ESMA w standardach i koordynacji.</li>
          <li>Ślad dokumentacyjny przy zmianie polityki produktu lub kampanii.</li>
          <li>Spójność komunikacji zewnętrznej z dokumentami informacyjnymi.</li>
        </ul>
      </section>
    </ExamMaterialShell>
  );
}
