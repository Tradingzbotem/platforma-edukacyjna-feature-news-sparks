import type { Metadata } from 'next';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Ściąga egzaminacyjna — Przewodnik | FXEduLab',
  description: 'Skrót przed testem: KNF, ESMA, MiFID, suitability, marketing, konflikty.',
};

const blockClass =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-4 md:p-5 shadow-md';
const kbd =
  'rounded border border-white/15 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] text-amber-200/90 md:text-xs';

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
      materialLabel="Ściąga"
      title="Ściąga egzaminacyjna — ultra skrót"
      description="Hasła pod przewodnik: nadzór, dystrybucja, klient. Czytaj tuż przed wejściem."
      badges={['Quick sheet', 'Powtórka']}
      downloadFormat="DOCX"
    >
      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">3 słowa na temat</h2>
        <ul className="mt-3 space-y-2 font-mono text-[11px] text-slate-300 md:text-xs">
          <li>
            <span className={kbd}>KNF</span> nadzór PL — liczy się proces + dowody.
          </li>
          <li>
            <span className={kbd}>ESMA</span> standardy/wytyczne UE — wpływ na procedury.
          </li>
          <li>
            <span className={kbd}>MiFID</span> dystrybucja, ochrona, rynek, raportowanie (pakiet).
          </li>
        </ul>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">Suit vs Approp</h2>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400 md:text-xs">
          Suit = doradzam / rekomenduję → profil klienta kompletny. Approp = sam chce, ja tylko
          realizuję → test wiedzy o ryzyku (i ostrzeżenie).
        </p>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">Best ex — 4</h2>
        <p className="mt-2 font-mono text-[11px] text-slate-300 md:text-xs">
          price · cost · speed · likelihood + polityka + przegląd jakości.
        </p>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">Jeśli w pytaniu…</h2>
        <ul className="mt-3 space-y-2 font-mono text-[11px] text-slate-300 md:text-xs">
          <li>
            …<span className="text-emerald-300/90">„nowa kampania”</span> → zatwierdzenie compliance +
            zgodność z KID/regulaminem + archiwum wersji.
          </li>
          <li>
            …<span className="text-emerald-300/90">„ESMA Q&amp;A”</span> → wpływ na procedurę +
            rejestr zmian, nie „ciche wdrożenie”.
          </li>
          <li>
            …<span className="text-emerald-300/90">„skarga klienta”</span> → ślad czasowy + eskalacja
            + root cause.
          </li>
        </ul>
      </section>

      <section className={`${blockClass} border-amber-500/20`}>
        <h2 className="text-sm font-semibold text-amber-200">30 sekund</h2>
        <p className="mt-2 font-mono text-[11px] text-slate-400 md:text-xs">
          KNF egzekwuje lokalnie. ESMA harmonizuje wytycznymi. MiFID ustawia reguły gry dla dystrybucji
          i rynku. Dokumenty klienta muszą być aktualne. Marketing nie może kłamać co do ryzyka.
        </p>
      </section>
    </ExamMaterialShell>
  );
}
