import Link from "next/link";
import type { ReactNode } from "react";

/** Prosty lokalny layout (żadnych importów z zewnątrz) */
function ArticleLayout({
  backHref, title, minutes, children,
}: { backHref: string; title: string; minutes: number; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <Link href={backHref} className="text-sm underline">← Wróć do materiałów</Link>
      <header className="space-y-1">
        <p className="text-slate-400 text-sm">Materiały dodatkowe • ⏱ {minutes} min</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
      </header>
      <article className="rounded-2xl bg-[#0b1220] border border-white/10 p-6 space-y-8">{children}</article>
    </main>
  );
}

export default function Page() {
  return (
    <ArticleLayout backHref="/kursy/materialy" minutes={12} title="Formacje świecowe — prosto i praktycznie">
      <section>
        <h2 className="text-xl font-semibold">Co widzisz na świecy?</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Korpus</strong> — różnica między otwarciem a zamknięciem.</li>
          <li><strong>Knoty</strong> — jak wysoko/nisko cena „zajrzała”.</li>
          <li>Kolor mówi <em>kto wygrał tę świecę</em>, a knoty pokazują <em>odrzucenie poziomów</em>.</li>
        </ul>
        <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-slate-300"><strong>Zapamiętaj:</strong> Świeca = historia walki kupujących i sprzedających w danym czasie.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4 najczęstsze formacje</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Pin bar (młotek / strzelająca gwiazda)</strong> — długi knot i mały korpus. Sygnał, że rynek coś <em>odrzucił</em>.</li>
          <li><strong>Engulfing</strong> — świeca „pożera” poprzednią. Zmiana siły na drugą stronę.</li>
          <li><strong>Inside bar</strong> — świeca „w środku” poprzedniej (konsolidacja). Często przed wybiciem.</li>
          <li><strong>Doji</strong> — bardzo mały korpus (niepewność). Samo w sobie to tylko pauza.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Kiedy mają sens?</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Na poziomach S/R</strong> (miejsca, gdzie cena już reagowała).</li>
          <li><strong>Z trendem</strong> (np. pin bar w korekcie trendu wzrostowego).</li>
          <li>Z <strong>potwierdzeniem</strong> — wybicie korpusu formacji lub retest poziomu.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Wejście, SL i cel</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Wejście: po potwierdzeniu (np. wybicie korpusu).</li>
          <li>SL: <strong>za</strong> formacją/poziomem (ma być sensowny technicznie).</li>
          <li>Cel: przynajmniej <strong>1:1.5 R:R</strong> lub do najbliższego S/R.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Najczęstsze błędy</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Branie formacji „na środku niczego” — brak poziomu i kontekstu.</li>
          <li>SL „na oko” zamiast za strukturą.</li>
          <li>Ignorowanie spreadu i zmienności (ATR) — zbyt ciasny SL.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-checklista</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Jest poziom S/R lub krawędź strefy?</li>
          <li>Formacja z kierunkiem trendu (lub po fałszywym wybiciu)?</li>
          <li>Wejście z potwierdzeniem, a SL logicznie „za” formacją?</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ćwiczenie (10 min)</h2>
        <ol className="mt-2 list-decimal pl-6">
          <li>Znajdź 3 pin bary na wykresie dziennym w okolicach S/R.</li>
          <li>Zaznacz wejście, SL i prosty cel 1:1.5. Sprawdź jak by wyszło.</li>
        </ol>
      </section>
    </ArticleLayout>
  );
}
