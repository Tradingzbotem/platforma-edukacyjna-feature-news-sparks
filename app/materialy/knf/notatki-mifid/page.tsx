import type { Metadata } from 'next';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Notatki MiFID II | FXEduLab',
  description:
    'Zwięzłe notatki z zakresu MiFID II: cele, kategorie klientów, KID/KIID, suitability i appropriateness, best execution, konflikty interesów, raportowanie.',
};

const sectionCard =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-5 md:p-6 shadow-md';

export default function Page() {
  return (
    <ExamMaterialShell
      trackBreadcrumbLabel="KNF"
      trackHref="/kursy/egzaminy/knf"
      materialLabel="MiFID II"
      title="Notatki — MiFID II (rdzeń pod KNF / compliance)"
      description="Uporządkowany zapis najważniejszych obszarów dyrektywy i rozporządzenia delegowanego w wersji przydatnej na egzamin i w pracy z procedurami."
      badges={['Materiał referencyjny', 'Notatki']}
      backHref="/kursy/egzaminy/knf"
      backLabel="← Wróć do ścieżki KNF"
      downloadFormat="PDF"
    >
      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Czym jest MiFID II?</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          MiFID II to unijny pakiet regulacji rynku instrumentów finansowych (dyrektywa MiFID II +
          rozporządzenie MiFIR + akty delegowane i RTS/ITS), który porządkuje{' '}
          <strong className="text-white">dystrybucję</strong>,{' '}
          <strong className="text-white">organizację rynku</strong>,{' '}
          <strong className="text-white">transparentność</strong> oraz{' '}
          <strong className="text-white">nadzór</strong> nad podmiotami świadczącymi usługi
          inwestycyjne.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          W Polsce implementacja spoczywa m.in. w ustawie o obrocie (z zastrzeżeniem aktualnych
          zmian legislacyjnych) — na egzaminie liczy się rozumienie unijnych celów i obowiązków
          podmiotu, nie cytowanie pojedynczych artykułów z pamięci.
        </p>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Cel regulacji (po co to jest)</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Większa ochrona inwestora i przejrzystość warunków świadczenia usług.</li>
          <li>Lepsza jakość infrastruktury rynkowej i danych transakcyjnych (m.in. raportowanie).</li>
          <li>Ograniczenie ryzyka nadużyć (m.in. w obszarze zleceń i komunikacji z rynkiem).</li>
          <li>Spójne standardy w UE dla firm świadczących usługi transgranicznie.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Klient detaliczny vs profesjonalny</h2>
        <p className="mt-3 text-sm text-slate-300">
          Podział ma konsekwencje dla poziomu informacji, testów i ochrony — to bardzo częsty motyw
          egzaminacyjny.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-amber-200/90">Retail (detaliczny)</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-slate-300 marker:text-slate-500">
              <li>Domyślna kategoria — wyższy poziom ochrony.</li>
              <li>Szerzej: KID/KIID, testy, ostrzeżenia, zasady marketingu.</li>
              <li>Możliwa zmiana kategorii tylko zgodnie z procedurą (opcjonalny opt-up).</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-amber-200/90">Professional</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-slate-300 marker:text-slate-500">
              <li>Przyjmuje się większą doświadczoną świadomość ryzyka.</li>
              <li>Część wymogów informacyjnych i procesowych jest łagodniejsza.</li>
              <li>Wymogi kwalifikacji muszą być dowodzone dokumentami (kryteria „duże”, „częste” itd.).</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">KID / KIID</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>
            <strong className="text-white">KIID</strong> — Key Investor Information Document (historycznie
            dla UCITS; w praktyce egzaminacyjnej często w parze z ideą karty produktu).
          </li>
          <li>
            <strong className="text-white">KID</strong> — Key Information Document (PRIIPs) dla wielu
            produktów pakietowych/detali — zwięzły, ustandaryzowany format informacji przed zakupem.
          </li>
          <li>
            Na egzaminie: rozumiesz{' '}
            <em className="text-slate-200">po co</em> dokument (porównanie, koszty, ryzyko, scenariusze),
            a nie tylko skrót nazwy.
          </li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Suitability vs appropriateness</h2>
        <p className="mt-3 text-sm text-slate-300">
          To najczęstsza para pojęć do rozróżnienia „jednym zdaniem + przykład”.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h3 className="font-semibold text-emerald-200/90">Suitability (doradztwo / rekomendacja)</h3>
            <p className="mt-2">
              Gdy podajesz <strong className="text-white">spersonalizowaną rekomendację</strong> lub
              działasz w modelu doradczym — musisz zbadać sytuację klienta (wiedza, doświadczenie,
              sytuacja finansowa, cele) i ocenić, czy produkt jest{' '}
              <strong className="text-white">odpowiedni</strong> dla tego klienta.
            </p>
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-400 marker:text-emerald-500/50">
              <li>Wynik: rekomendujesz tylko po spełnieniu testu zgodności.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
            <h3 className="font-semibold text-sky-200/90">Appropriateness (execution-only / bez rekomendacji)</h3>
            <p className="mt-2">
              Gdy klient sam inicjuje transakcję bez rekomendacji — oceniasz, czy produkt jest dla
              niego <strong className="text-white">stosowny</strong> w sensie zrozumienia ryzyka
              (kategoria „złożony” vs prostszy instrument).
            </p>
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-400 marker:text-sky-500/50">
              <li>Przy braku wiedzy: ostrzeżenie / odmowa (zależnie od scenariusza i procedur).</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Best execution</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Obowiązek uzyskania najlepszego możliwego rezultatu dla klienta przy realizacji zlecenia,
          z uwzględnieniem <strong className="text-white">ceny, kosztów, szybkości i prawdopodobieństwa
          realizacji</strong> — oraz polityki, monitoringu i informowania klientów.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Polityka + lista miejsc realizacji + okresowe przeglądy jakości.</li>
          <li>Uzasadnienie routingu przy istotnych zmianach rynku lub kontrahentów.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Conflicts of interest (konflikty interesów)</h2>
        <p className="mt-3 text-sm text-slate-300">
          Firma musi identyfikować sytuacje, w których interes klienta może zderzyć się z interesem
          firmy, pracownika lub innego klienta — i stosować środki zaradcze.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>Polityka konfliktów + rejestr + szkolenia + nadzór compliance.</li>
          <li>Segregacja funkcji, ograniczenia w nagrodach, chińskie ściany tam, gdzie trzeba.</li>
          <li>Ujawnianie klientowi istotnych konfliktów zgodnie z wymaganiami.</li>
        </ul>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold text-white">Reporting (skrót egzaminacyjny)</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-amber-400/70">
          <li>
            <strong className="text-white">Transaction reporting</strong> — raportowanie transakcji do
            organu (dane identyfikujące instrument, strony, czas, venue itd.) w celu nadzoru.
          </li>
          <li>
            <strong className="text-white">Order record keeping</strong> — utrzymanie spójnych zapisów
            zleceń i decyzji operacyjnych dla audytu.
          </li>
          <li>
            Transparentność przed i po transakcji (w zależności od typu podmiotu i instrumentu) —
            rozumiesz różnicę między obowiązkami na rynku regulowanym a poza nim na poziomie
            pojęciowym.
          </li>
        </ul>
      </section>
    </ExamMaterialShell>
  );
}
