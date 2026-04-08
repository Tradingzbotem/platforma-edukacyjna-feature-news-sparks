import type { Metadata } from 'next';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Ściąga powtórkowa KNF / MiFID | FXEduLab',
  description:
    'Skondensowana ściąga przed egzaminem: definicje, różnice, typowe pytania i wzorce „jeśli X → odpowiedź Y”.',
};

const blockClass =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-4 md:p-5 shadow-md';
const kbd =
  'rounded border border-white/15 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] text-amber-200/90 md:text-xs';

export default function Page() {
  return (
    <ExamMaterialShell
      trackBreadcrumbLabel="KNF"
      trackHref="/kursy/egzaminy/knf"
      materialLabel="Ściąga"
      title="Ściąga powtórkowa — KNF / MiFID (ultra skrót)"
      description="Hasła i skróty pod test: zero lania wody. Czytaj 15 minut przed wejściem albo jako szybki reset pamięci."
      badges={['Quick sheet', 'Powtórka']}
      backHref="/kursy/egzaminy/knf"
      backLabel="← Wróć do ścieżki KNF"
      downloadFormat="DOCX"
    >
      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">
          Definicje (1 linijka)
        </h2>
        <ul className="mt-3 space-y-2 font-mono text-[11px] leading-snug text-slate-300 md:text-xs">
          <li>
            <span className={kbd}>MiFID II</span> pakiet UE: dystrybucja, rynek, transparentność, nadzór.
          </li>
          <li>
            <span className={kbd}>MiFIR</span> rozporządzenie bezpośrednio stosowane (m.in. część raportowa).
          </li>
          <li>
            <span className={kbd}>Best ex</span> najlepszy możliwy rezultat dla klienta — nie tylko cena.
          </li>
          <li>
            <span className={kbd}>Retail</span> domyślnie; max ochrony. <span className={kbd}>Pro</span>{' '}
            wyższa wiedza zakładana — procedury lżejsze.
          </li>
          <li>
            <span className={kbd}>KID</span> karta PRIIPs. <span className={kbd}>KIID</span> karta UCITS
            (tradycyjnie).
          </li>
          <li>
            <span className={kbd}>Suit</span> rekomendacja → pełny profil klienta.{' '}
            <span className={kbd}>Approp</span> bez rekomendacji → test wiedzy o ryzyku.
          </li>
          <li>
            <span className={kbd}>CoI</span> konflikt interesów — zidentyfikuj, ogranicz, ujawnij.
          </li>
        </ul>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">
          Najważniejsze różnice
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-left text-[11px] text-slate-300 md:text-xs">
            <thead>
              <tr className="border-b border-white/10 text-amber-200/80">
                <th className="py-2 pr-3 font-semibold">Temat</th>
                <th className="py-2 font-semibold">A vs B</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 font-mono text-slate-400">Suit vs Approp</td>
                <td className="py-2">
                  doradztwo / „bierz to” = Suit · sam przyszedł bez rady = Approp
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 font-mono text-slate-400">Price vs cost</td>
                <td className="py-2">
                  cena instrumentu vs pełny koszt klienta (prowizje, spread, opłaty)
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 font-mono text-slate-400">KID vs KIID</td>
                <td className="py-2">PRIIPs vs UCITS — inny produktowy kontekst</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-mono text-slate-400">Retail vs Pro</td>
                <td className="py-2">ochrona / procesy vs kwalifikacja dokumentalna</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">
          Najczęstsze pytania (szkielet odpowiedzi)
        </h2>
        <ul className="mt-3 space-y-2 text-xs text-slate-300 md:text-sm">
          <li>
            <strong className="text-white">Czynniki best execution?</strong> price, cost, speed,
            likelihood of execution (+ kontekst instrumentu).
          </li>
          <li>
            <strong className="text-white">Co to polityka best execution?</strong> pisemna, aktualna,
            venues, monitoring, przeglądy, informowanie klientów.
          </li>
          <li>
            <strong className="text-white">Kiedy suitability?</strong> gdy jest rekomendacja /
            spersonalizowana porada inwestycyjna.
          </li>
          <li>
            <strong className="text-white">Kiedy appropriateness?</strong> execution-only / bez rady —
            ocena zrozumienia ryzyka.
          </li>
          <li>
            <strong className="text-white">Konflikt interesów — kroki?</strong> identyfikacja → środki
            (organizacyjne) → nadzór → ujawnienie klientowi (gdy wymagane).
          </li>
          <li>
            <strong className="text-white">Po co transaction reporting?</strong> nadzór organu,
            wykrywanie nadużyć, jakość danych rynkowych.
          </li>
        </ul>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">
          Jeśli widzisz X → myśl Y
        </h2>
        <ul className="mt-3 space-y-2 font-mono text-[11px] text-slate-300 md:text-xs">
          <li>
            <span className="text-emerald-300/90">„Rekomenduję Ci ETF na emeryturę”</span> → Suitability
            + pełny profil.
          </li>
          <li>
            <span className="text-emerald-300/90">„Kupiłem sam, tylko realizacja”</span> →
            Appropriateness + ostrzeżenie przy braku wiedzy.
          </li>
          <li>
            <span className="text-emerald-300/90">„Najniższy spread = best ex”</span> → Błąd — liczy się
            pełny rezultat (koszty, realizacja).
          </li>
          <li>
            <span className="text-emerald-300/90">„Wewnętrzny market maker spółki grupy”</span> → Konflikt
            interesów + kontrola + transparentność.
          </li>
          <li>
            <span className="text-emerald-300/90">„Klient pro bez dokumentów”</span> → Nie można
            „uznać” kategorii bez spełnienia kryteriów.
          </li>
          <li>
            <span className="text-emerald-300/90">„Brak śladu po awarii routingu”</span> → Słaba
            dokumentacja / incydent compliance.
          </li>
        </ul>
      </section>

      <section className={`${blockClass} border-amber-500/20`}>
        <h2 className="text-sm font-semibold text-amber-200">60-sekundowy reset przed wejściem</h2>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400 md:text-xs">
          Suit = rada. Approp = bez rady. Best ex = 4 czynniki + polityka + przegląd. CoI = znajdź —
          ogranicz — ujawnij. KID/KIID = pre-trade info. Reporting = nadzór organu.
        </p>
      </section>
    </ExamMaterialShell>
  );
}
