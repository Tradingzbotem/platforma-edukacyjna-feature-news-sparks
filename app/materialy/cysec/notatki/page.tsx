import type { Metadata } from 'next';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Notatki CySEC / CIF | FXEduLab',
  description:
    'Notatki: rola CySEC, circulars, CIF, klienci, marketing CFD, outsourcing i skargi w pigułce.',
};

const sectionCard =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-5 md:p-6 shadow-md';

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
      materialLabel="Notatki"
      title="Notatki — CySEC i model CIF"
      description="Skondensowany obraz nadzoru cypryjskiego w warstwie egzaminacyjnej: co regulator egzekwuje, a co firma musi dowieść procedurami."
      badges={['Materiał referencyjny', 'Notatki']}
      downloadFormat="PDF"
    >
      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Czym jest CySEC w tym kursie</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Komisja Papierów Wartościowych i Giełd na Cyprze nadzoruje m.in. firmy inwestycyjne (CIF).
          W praktyce compliance oznacza to: spełnianie warunków licencji, raportowanie, ochronę klienta
          oraz reagowanie na circulars i komunikaty —{' '}
          <strong className="text-white">zanim</strong> staną się problemem egzekucyjnym.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Circulars i komunikaty</h2>
        <p className="mt-3 text-sm text-slate-300">
          Circular to typowy instrument „wyjaśnijmy rynkowi, czego oczekujemy”. Na egzaminie: rozumiesz,
          że circular wymaga mapowania na procedury (marketing, produkt, onboardingu), a nie tylko
          przeczytania przez jedną osobę.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Rejestr wejść w życie + właściciel wdrożenia + data szkolenia zespołu.</li>
          <li>Porównanie: co się zmienia w checklistach sprzedaży i compliance.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">CIF — organy i odpowiedzialność</h2>
        <p className="mt-3 text-sm text-slate-300">
          Zarząd odpowiada za kulturę compliance. Nie przerzucasz ryzyka na „dział compliance” —
          pokazujesz, że decyzje biznesowe mają warstwę zgodności (product governance, limity, aprobata
          kampanii).
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Klienci i produkty dźwigniowe</h2>
        <p className="mt-3 text-sm text-slate-300">
          Retail wymaga silniejszej ochrony: testy, ostrzeżenia, transparentność kosztów. Profesjonalny
          klient — po spełnieniu kryteriów — zakłada większą świadomość, ale{' '}
          <strong className="text-white">nie zwalnia</strong> z podstawowych zasad uczciwej komunikacji.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Marketing CFD (logika egzaminacyjna)</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Zakaz wprowadzających w błąd obietnic; porównania muszą być uczciwe i zrozumiałe.</li>
          <li>Ryzyko utraty kapitału musi być widoczne, nie „drukowanym microtextem”.</li>
          <li>Influencer / afiliacja: jawność relacji komercyjnej i zgodność z polityką firmy.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Outsourcing i dane</h2>
        <p className="mt-3 text-sm text-slate-300">
          Przenosisz operację, nie odpowiedzialność. Umowa + audyt + testy ciągłości dla krytycznych
          usług. Dane osobowe i transakcyjne — minimalizacja dostępu i ślad audytowy.
        </p>
      </section>
    </ExamMaterialShell>
  );
}
