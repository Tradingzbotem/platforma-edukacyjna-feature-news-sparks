import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Checklisty compliance CIF — CySEC | FXEduLab',
  description:
    'Operacyjne checklisty dla Cyprus Investment Firm: licencja, kapitał, funkcje kontrolne, outsourcing, CFD i skargi.',
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
  trackBreadcrumbLabel: 'CySEC',
  trackHref: '/kursy/egzaminy/cysec',
  backHref: '/kursy/egzaminy/cysec',
  backLabel: '← Wróć do ścieżki CySEC',
} as const;

export default function Page() {
  return (
    <ExamMaterialShell
      {...track}
      materialLabel="Checklisty"
      title="Checklisty compliance — model CIF"
      description="Punktowe „tak/nie” dla zespołu compliance na Cyprze: od ramy licencyjnej po marketing CFD i obsługę skarg. Materiał edukacyjny — weryfikuj z aktualnymi circulars i prawnikiem."
      badges={['Materiał referencyjny', 'Checklist']}
      downloadFormat="PDF"
    >
      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Status i ramy CIF</h2>
        <p className="mt-3 text-sm text-slate-300">
          Cyprus Investment Firm to podmiot uprawniony do świadczenia usług inwestycyjnych zgodnie z
          cypryjskim prawem i nadzorem CySEC. Checklista zakłada, że znasz własną kategorię zezwoleń i
          zakres działalności.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Licencja i zmiany materialne</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Rejestr zezwoleń i aneksów jest aktualny; nowe produkty lub rynki docelowe są mapowane na
            uprawnienia przed startem sprzedaży.
          </CheckRow>
          <CheckRow>
            Zmiany w strukturze właścicielskiej, zarządzie lub modelu przychodów są oceniane pod kątem
            obowiązku zgłoszenia do regulatora (wg procedur firmy i aktów).
          </CheckRow>
          <CheckRow>
            Spółka z grupy nie „pożycza” zezwolenia innej jednostki — cross-border ma jasną podstawę.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Kapitał, ryzyko, ICARA / wewnętrzne limity</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Monitorujesz wymogi kapitałowe i bufor bezpieczeństwa zgodnie z harmonogramem — dane są
            spójne z raportowaniem.
          </CheckRow>
          <CheckRow>
            Limity kontrahentów, ekspozycji i dźwigni są egzekwowane systemowo, nie tylko „na papierze”.
          </CheckRow>
          <CheckRow>
            Scenariusze stresowe i uzasadnienia limitów są udokumentowane dla zarządu.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Funkcje kontrolne i outsourcing</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Compliance, ryzyko i AML mają jasny podział obowiązków; konflikty funkcji są ograniczone.
          </CheckRow>
          <CheckRow>
            Outsourcing (np. IT, call center, płatności) ma umowy, monitoring SLA i testy ciągłości tam,
            gdzie to krytyczne.
          </CheckRow>
          <CheckRow>
            Dostęp do danych klienta przez podwykonawców jest ograniczony i logowany.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Klienci, CFD, marketing</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            Kategoryzacja klienta (retail / professional) jest poparta dokumentacją — bez „automatycznego pro”.
          </CheckRow>
          <CheckRow>
            Materiały CFD nie obiecują zysków, nie ukrywają ryzyka utraty depozytu ani nie sugerują
            łatwości zarobku.
          </CheckRow>
          <CheckRow>
            Bonusy / promocje są zgodne z polityką i (tam gdzie dotyczy) ograniczeniami regulatora.
          </CheckRow>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Skargi i whistleblowing</h2>
        <div className="mt-4 flex flex-col gap-2">
          <CheckRow>
            SLA odpowiedzi na skargi jest mierzone; wzorce przyczyn są raportowane do zarządu.
          </CheckRow>
          <CheckRow>
            Kanał zgłoszeń nadużyć jest znany pracownikom i testowany (nie tylko plakat na ścianie).
          </CheckRow>
        </div>
      </section>
    </ExamMaterialShell>
  );
}
