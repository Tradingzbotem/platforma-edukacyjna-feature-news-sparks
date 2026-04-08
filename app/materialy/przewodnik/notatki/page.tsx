import type { Metadata } from 'next';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Notatki skrótowe — Przewodnik KNF / ESMA / MiFID | FXEduLab',
  description:
    'Notatki: trójkąt KNF–ESMA–dystrybutor, ochrona klienta, marketing, best execution i konflikty w pigułce.',
};

const sectionCard =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-5 md:p-6 shadow-md';

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
      materialLabel="Notatki"
      title="Notatki skrótowe — jak to się układa"
      description="Mapa pojęć łącząca polski kontekst nadzoru z unijną logiką MiFID i praktyką dystrybucji. Na egzaminie liczy się zrozumienie relacji, nie pojedyncze daty."
      badges={['Materiał referencyjny', 'Notatki']}
      downloadFormat="PDF"
    >
      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Trójkąt: KNF — ESMA — firma</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          <strong className="text-white">KNF</strong> nadzoruje podmioty w Polsce i stosuje lokalne
          przepisy implementujące MiFID oraz prawo pomocnicze.{' '}
          <strong className="text-white">ESMA</strong> w praktyce edukacyjnej często występuje jako
          źródło wytycznych, Q&amp;A i wspólnych standardów dla nadzorców UE — firma musi umieć
          przełożyć je na procedury. Ty jako pracownik odpowiadasz za{' '}
          <strong className="text-white">spójność</strong> między tym, co mówisz klientowi, a tym,
          co wynika z dokumentów i nadzoru.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">MiFID II w jednym akapicie użytkowym</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Organizacja dystrybucji: kto może doradzać, kto tylko realizuje, jak dokumentujemy testy.</li>
          <li>Transparentność kosztów i ryzyka: KID/KIID, ostrzeżenia, zgodność kampanii z faktami.</li>
          <li>Jakość realizacji zleceń i konflikty interesów — gdy dotyczy modelu brokera.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Ochrona klienta detalicznego</h2>
        <p className="mt-3 text-sm text-slate-300">
          Retail to domyślna kategoria z najsilniejszą ochroną. Na egzaminie często pada:{' '}
          <em>kiedy obniżamy standard</em> (kategoria profesjonalna) i{' '}
          <em>jakie dokumenty muszą być kompletne</em> zanim zaoferujemy złożony produkt.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Suitability = rekomendacja / spersonalizowana porada — pełniejszy profil klienta.</li>
          <li>Appropriateness = brak rekomendacji — test zrozumienia ryzyka przy produktach wymagających.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Marketing i komunikacja</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Każda obietnica „zysku”, „pewności” lub porównanie do depozytu bankowego jest strefą ryzyka.
          Porównawcze materiały muszą mieć sensowną podstawę metodologiczną i nie wprowadzać w błąd co
          do kosztów i ryzyka utraty kapitału.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Best execution i konflikty (skrót)</h2>
        <p className="mt-3 text-sm text-slate-300">
          Best execution to nie „najtańszy spread na ekranie”, tylko{' '}
          <strong className="text-white">najlepszy możliwy rezultat</strong> dla klienta z uwzględnieniem
          ceny, kosztów, szybkości i prawdopodobieństwa realizacji. Konflikty interesów wymagają
          identyfikacji, ograniczeń organizacyjnych i ujawnień tam, gdzie przepis to nakazuje.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Typowe pytania w stylu przewodnika</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-emerald-400/70">
          <li>„Co robisz, gdy wytyczna ESMA zderza się z lokalną interpretacją?” — procedura, konsultacja, dokumentacja.</li>
          <li>„Czym różni się ścieżka dla klienta profesjonalnego od detalicznego?” — dokumenty, testy, poziom ostrzeżeń.</li>
          <li>„Jak udowadniasz, że kampania była zgodna z KID?” — wersjonowanie, archiwum, approval.</li>
        </ul>
      </section>
    </ExamMaterialShell>
  );
}
