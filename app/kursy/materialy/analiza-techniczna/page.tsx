import Link from "next/link";
import type { ReactNode } from "react";

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
    <ArticleLayout
      backHref="/kursy/materialy"
      minutes={18}
      title="Analiza techniczna — fundamenty i praktyka"
    >
      <section>
        <h2 className="text-xl font-semibold">1) Trend i struktura rynku</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Trend</strong>: HH/HL (wzrost), LH/LL (spadek). Handel z kierunkiem zwiększa WR.</li>
          <li><strong>Struktura</strong>: swing high/low, wybicia, re-testy, konsolidacje.</li>
          <li><strong>Multi-timeframe</strong>: HTF daje bias; entry na LTF, ale w zgodzie z HTF.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">2) S/R, strefy popytu/podaży</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Poziomy z wielokrotną reakcją są najcenniejsze.</li>
          <li>Myśl „strefami”, nie kreskami (miejsce na spread/poślizg).</li>
          <li>Konfluencja: S/R + trend + PA → lepsze EV niż sam „sygnał”.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">3) Price Action i setupy</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Wybicia z akumulacji/dystrybucji (z testem powrotu).</li>
          <li>Reversal po fałszywym wybiciu (stop run) w strefie HTF.</li>
          <li>Kontynuacja po korekcie do EMA/MA lub S/R (pullback).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4) Volatility/ATR i zarządzanie pozycją</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>SL za strukturą i dopasowany do <strong>ATR</strong>.</li>
          <li>Targety: R:R ≥ 1:1.5; trailing po nowych swingach.</li>
          <li>Skalowanie lotu odwrotnie do vol, by wyrównać PnL.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">5) Wskaźniki: minimalistycznie</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>MA/EMA</strong> — kontekst trendu i pullbacki.</li>
          <li><strong>RSI</strong> — dywergencje w strefach; nie handluj „prze-” bez kontekstu.</li>
          <li><strong>Volume</strong> (jeśli masz) — potwierdza wybicia/konsolidacje.</li>
        </ul>
        <p className="mt-2 text-slate-300">Wskaźnik = filtr. Sygnał pochodzi ze struktury ceny i ryzyka.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist AT</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Trend/struktura na HTF? Gdzie S/R?</li>
          <li>Jaki setup PA na LTF? Czy mam konfluencję?</li>
          <li>SL logiczny (za swingiem), lot wg ATR, 1R stałe.</li>
        </ul>
      </section>
    </ArticleLayout>
  );
}
