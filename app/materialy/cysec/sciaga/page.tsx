import type { Metadata } from 'next';
import ExamMaterialShell from '../../_components/ExamMaterialShell';

export const metadata: Metadata = {
  title: 'Ściąga CySEC — CIF | FXEduLab',
  description: 'Szybka ściąga: CIF, CySEC, circulars, CFD, outsourcing, skargi.',
};

const blockClass =
  'rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-4 md:p-5 shadow-md';
const kbd =
  'rounded border border-white/15 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] text-amber-200/90 md:text-xs';

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
      materialLabel="Ściąga"
      title="Ściąga CySEC — przed testem"
      description="Hasła i wzorce w świecie CIF. Zero opowieści — tylko to, co często wraca w pytaniach."
      badges={['Quick sheet', 'Powtórka']}
      downloadFormat="DOCX"
    >
      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">Skróty</h2>
        <ul className="mt-3 space-y-2 font-mono text-[11px] text-slate-300 md:text-xs">
          <li>
            <span className={kbd}>CySEC</span> nadzór rynku kapitałowego CY.
          </li>
          <li>
            <span className={kbd}>CIF</span> Cyprus Investment Firm — licencjonowany broker / firma inwest.
          </li>
          <li>
            <span className={kbd}>Circular</span> komunikat „co poprawcie w praktyce” → procedury.
          </li>
        </ul>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">Retail vs Pro</h2>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400 md:text-xs">
          Retail = ochrona max + testy + ostrzeżenia. Pro = po kwalifikacji, nie „na prośbę klienta”.
        </p>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">CFD marketing</h2>
        <ul className="mt-2 space-y-1 font-mono text-[11px] text-slate-300 md:text-xs">
          <li>Żadnych „gwarantów” zysku.</li>
          <li>Ryzyko straty depozytu — widoczne.</li>
          <li>Bonusy / promosy → polityka + zgodność z regulatorem.</li>
        </ul>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">Outsourcing</h2>
        <p className="mt-2 font-mono text-[11px] text-slate-300 md:text-xs">
          Out ≠ off-hook. Umowa, monitoring, ciągłość, dostęp do danych ograniczony.
        </p>
      </section>

      <section className={blockClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">Jeśli X → Y</h2>
        <ul className="mt-3 space-y-2 font-mono text-[11px] text-slate-300 md:text-xs">
          <li>
            <span className="text-emerald-300/90">Nowy circular</span> → impact analysis + update procedur +
            szkolenie + data wdrożenia.
          </li>
          <li>
            <span className="text-emerald-300/90">Skarga powtarzalna</span> → root cause + zmiana procesu,
            nie tylko „przepraszamy”.
          </li>
          <li>
            <span className="text-emerald-300/90">Influencer bez oznaczenia</span> → red flag marketing
            compliance.
          </li>
        </ul>
      </section>

      <section className={`${blockClass} border-amber-500/20`}>
        <h2 className="text-sm font-semibold text-amber-200">15 sekund</h2>
        <p className="mt-2 font-mono text-[11px] text-slate-400 md:text-xs">
          CySEC pilnuje CIF. Circulars zmieniają praktykę. CFD = wrażliwy marketing. Outsourcing zostaje
          Twoją odpowiedzialnością. Skargi mierz i naprawiaj proces.
        </p>
      </section>
    </ExamMaterialShell>
  );
}
