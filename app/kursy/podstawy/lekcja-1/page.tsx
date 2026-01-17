import Link from "next/link";
import type { ReactNode } from "react";

/** Lokalny szablon — identyczny układ jak w innych lekcjach */
function LessonLayout({
  coursePath, courseTitle, lessonNumber, title, minutes, children, prevSlug, nextSlug,
}: {
  coursePath: "podstawy";
  courseTitle: string;
  lessonNumber: number;
  title: string;
  minutes: number;
  children: ReactNode;
  prevSlug?: string;
  nextSlug?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl p-6 md:p-8 space-y-6 animate-fade-in">
        <Link href={`/kursy/${coursePath}`} className="inline-flex items-center gap-2 text-sm underline hover:text-white transition-colors duration-150">← Wróć do spisu</Link>

        <header className="space-y-1">
          <p className="text-slate-400 text-sm">
            <span>{courseTitle}</span>
            <span> — </span>
            <span>Lekcja</span> <span>{lessonNumber}</span>
            <span> • ⏱ </span>
            <span>{minutes}</span> <span>min</span>
          </p>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
        </header>

        <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm p-6 space-y-8 shadow-lg">
          {children}
        </article>

        <nav className="flex items-center justify-between pt-4 border-t border-white/10">
          {prevSlug ? (
            <Link className="underline hover:text-white transition-colors duration-150" href={`/kursy/${coursePath}/${prevSlug}`}>← Poprzednia lekcja</Link>
          ) : <span />}
          {nextSlug ? (
            <Link className="underline hover:text-white transition-colors duration-150" href={`/kursy/${coursePath}/${nextSlug}`}>Następna lekcja →</Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <LessonLayout
      coursePath="podstawy"
      courseTitle="Podstawy"
      lessonNumber={1}
      minutes={15}
      title="Wprowadzenie: czym jest rynek Forex i jak to wszystko działa?"
      nextSlug="lekcja-2"
    >
      {/* CELE */}
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Zrozumiesz, <strong>czym jest Forex</strong> i jak działa handel walutami (OTC, 24/5, pary walutowe).</li>
          <li>Poznasz podstawowe pojęcia: <strong>base/quote</strong>, <strong>bid/ask</strong>, <strong>spread</strong>, <strong>pips</strong>, <strong>lot</strong>.</li>
          <li>Dowiesz się, kto tworzy rynek (banki, fundusze, brokerzy, traderzy detaliczni) i jakie są <strong>koszty</strong>.</li>
          <li>Przejrzysz skrót <strong>rodzajów zleceń</strong> i ram czasowych (sesje Tokio/Londyn/NY).</li>
        </ul>
      </section>

      {/* CO TO FOREX */}
      <section>
        <h2 className="text-xl font-semibold">Co to jest Forex?</h2>
        <p className="mt-2 text-slate-300">
          Forex (Foreign Exchange) to <strong>pozagiełdowy rynek wymiany walut</strong> (OTC), na którym handluje się
          parami walutowymi — np. <code>EURUSD</code>, <code>GBPUSD</code>, <code>USDJPY</code>. Notowanie pary mówi,
          ile waluty kwotowanej (quote) płacisz za jednostkę waluty bazowej (base).
        </p>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Struktura notowania</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Base</strong> (pierwsza waluta): EUR w <code>EURUSD</code>.</li>
              <li><strong>Quote</strong> (druga waluta): USD w <code>EURUSD</code>.</li>
              <li><strong>1.0840</strong> oznacza: 1 EUR kosztuje 1.0840 USD.</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Bid / Ask / Spread</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Bid</strong> — cena, po której sprzedasz bazową (broker kupi od Ciebie).</li>
              <li><strong>Ask</strong> — cena, po której kupisz bazową (broker sprzeda Ci bazową).</li>
              <li><strong>Spread</strong> = ask − bid (Twój ukryty koszt wejścia/wyjścia).</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-500/5 backdrop-blur-sm border border-indigo-400/20 p-4 mt-3 shadow-sm">
          <h3 className="font-semibold text-indigo-200">Uczestnicy rynku</h3>
          <p className="text-slate-300 mt-1">
            Banki inwestycyjne i centrale płynności, fundusze (hedge, emerytalne), korporacje zabezpieczające ryzyko
            walutowe, brokerzy (ECN/STP/market maker) oraz traderzy detaliczni. Rynek działa <strong>24/5</strong> —
            od niedzieli wieczorem do piątku wieczorem (czasu europejskiego).
          </p>
        </div>
      </section>

      {/* PIPS / LOT / WARTOŚĆ */}
      <section>
        <h2 className="text-xl font-semibold">Pips, lot i wstęp do wartości ruchu</h2>
        <p className="mt-2 text-slate-300">
          Podstawowa jednostka zmiany ceny to <strong>pips</strong> (na parach z 4 miejscami po przecinku to 0.0001;
          na parach z JPY — 0.01). Standardowa wielkość transakcji to <strong>lot</strong> (zwykle 100 000 jednostek
          waluty bazowej). Dla 1.00 lota na EURUSD 1 pips ≈ <strong>10 USD</strong>.
        </p>

        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 mt-3 space-y-2 shadow-sm">
          <h3 className="font-semibold text-white">Mini-obliczenia</h3>
          <ul className="list-disc pl-6 space-y-1 text-slate-300">
            <li><strong>Wartość 1 pipsa (EURUSD, 1.00 lot):</strong> ≈ 10 USD.</li>
            <li><strong>Wartość 1 pipsa (0.10 lot):</strong> ≈ 1 USD. <em>(dziesięć razy mniej)</em></li>
            <li><strong>Ruch 15 pipsów</strong> przy 0.20 lota ⇒ 15 × (10 USD × 0.2) = <strong>30 USD</strong>.</li>
          </ul>
          <p className="text-xs text-slate-400">
            W praktyce wpływa na to jeszcze kurs (na parach krzyżowych) oraz to, w jakiej walucie prowadzisz rachunek.
          </p>
        </div>
      </section>

      {/* KOSZTY */}
      <section>
        <h2 className="text-xl font-semibold">Jakie są koszty? (spread, prowizja, swap)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Spread</h3>
            <p className="mt-1 text-slate-300">Różnica ask − bid, zmienna w czasie (szerszy poza płynnością i na danych).</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Prowizja</h3>
            <p className="mt-1 text-slate-300">Na kontach typu ECN doliczana od wolumenu (np. X USD za 1 lot).</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Swap (overnight)</h3>
            <p className="mt-1 text-slate-300">Odsetki/finansowanie za przetrzymanie pozycji przez noc (dodatnie lub ujemne).</p>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 mt-3 shadow-sm">
          <h3 className="font-semibold text-amber-200">Przykład kosztu wejścia</h3>
          <p className="text-slate-300 mt-1">
            EURUSD bid/ask: 1.0839 / 1.0841 ⇒ spread 2 pipsy. Wejście long po 1.0841 oznacza, że „na starcie” masz
            −2 pipsy (przed ruchem rynku). Przy 0.10 lota to ok. −2 × 1 USD = −2 USD. Do tego może dojść prowizja.
          </p>
        </div>
      </section>

      {/* SESJE */}
      <section>
        <h2 className="text-xl font-semibold">Sesje i zmienność (Tokio/Londyn/Nowy Jork)</h2>
        <p className="mt-2 text-slate-300">
          Największa aktywność przypada zwykle na <strong>Londyn</strong> i nakładkę <strong>Londyn–Nowy Jork</strong>.
          Sesja azjatycka (Tokio) bywa spokojniejsza. Warto dopasować strategię do czasu dnia (trend vs. range).
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li><strong>Tokio (APAC)</strong> — niższa zmienność, częściej konsolidacje.</li>
          <li><strong>Londyn (EU)</strong> — główny impuls dnia; aktywne wybicia.</li>
          <li><strong>Nowy Jork (US)</strong> — druga fala ruchu; często re-price po danych makro.</li>
        </ul>
      </section>

      {/* ZLECENIA — PRZEGLĄD */}
      <section>
        <h2 className="text-xl font-semibold">Rodzaje zleceń — krótki przegląd</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Rynkowe (Market)</h3>
            <p className="text-slate-300 mt-1">Natychmiastowa realizacja po dostępnej cenie (ask/bid). Możliwy poślizg.</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Z limitem (Limit)</h3>
            <p className="text-slate-300 mt-1">Wejście po lepszej cenie niż obecna. Realizacja tylko, jeśli rynek dotknie limitu.</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">Stop / Stop-Limit</h3>
            <p className="text-slate-300 mt-1">Wejście, gdy rynek wybije poziom (momentum). Stop-Limit ogranicza cenę aktywacji.</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">SL / TP</h3>
            <p className="text-slate-300 mt-1">Zamykanie pozycji przy zadanej stracie (SL) lub zysku (TP). Podstawa zarządzania ryzykiem.</p>
          </div>
        </div>
      </section>

      {/* MINI-ĆWICZENIA */}
      <section>
        <h2 className="text-xl font-semibold">Ćwiczenia (5–7 min)</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-2 text-slate-300">
          <li>
            Masz rachunek 5 000 USD. Ile wynosi <strong>1R = 1%</strong>? Jaką wartość ma <strong>1R = 0.5%</strong>?
          </li>
          <li>
            EURUSD: spread 1.2 pipsa. Przy <strong>0.20 lota</strong> ile wynosi koszt spreadu na wejściu?
          </li>
          <li>
            Na sesji londyńskiej chcesz wejść <em>po wybiciu</em>. Jakie zlecenie rozważysz (market/stop/limit) i dlaczego?
          </li>
        </ol>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 mt-3 shadow-sm">
          <h3 className="font-semibold text-white">Przykładowe odpowiedzi</h3>
          <ul className="list-disc pl-6 space-y-1 text-slate-300">
            <li>1R (1%) = 50 USD; 1R (0.5%) = 25 USD.</li>
            <li>1.2 pipsa × (10 USD/pip × 0.2) ≈ <strong>2.4 USD</strong>.</li>
            <li>Wejście po wybiciu — sensowny jest <strong>stop</strong> (momentum) albo market, jeśli chcesz natychmiast.</li>
          </ul>
        </div>
      </section>

      {/* SŁOWNICZEK */}
      <section>
        <h2 className="text-xl font-semibold">Słowniczek pojęć</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li><strong>Base/Quote</strong> — waluta bazowa / kwotowana w parze walutowej.</li>
          <li><strong>Bid/Ask</strong> — ceny sprzedaży/kupna; <strong>spread</strong> to ich różnica.</li>
          <li><strong>Pips</strong> — podstawowa jednostka zmiany ceny (0.0001 lub 0.01 na JPY).</li>
          <li><strong>Lot</strong> — standardowy wolumen (zwykle 100 000 base); mini 0.10, mikro 0.01.</li>
          <li><strong>Swap</strong> — naliczenie/odliczenie odsetek za przetrzymanie pozycji przez noc.</li>
        </ul>
      </section>

      {/* CHECKLISTA */}
      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozpoznaję w notowaniu, co jest <strong>base</strong>, a co <strong>quote</strong>.</li>
          <li>Wiem, że kupno to <strong>ask</strong>, a sprzedaż to <strong>bid</strong> i że spread to koszt.</li>
          <li>Rozumiem różnicę między <strong>pips</strong>, <strong>lot</strong> i orientacyjną wartością pipsa.</li>
          <li>Potrafię wskazać koszty transakcyjne (spread, prowizja, swap) i kiedy się zwiększają.</li>
          <li>Wiem, które sesje są najaktywniejsze i jak dopasować do nich styl handlu.</li>
        </ul>
      </section>

      {/* ZADANIE DOMOWE */}
      <section>
        <h2 className="text-xl font-semibold">Zadanie praktyczne</h2>
        <p className="mt-2 text-slate-300">
          Otwórz konto demo i:
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-slate-300 mt-2">
          <li>Sprawdź notowania 3 par: <code>EURUSD</code>, <code>GBPUSD</code>, <code>USDJPY</code>. Zanotuj bid/ask i spread w różnych porach.</li>
          <li>Policz koszt spreadu dla 0.10 lota przy spreadzie 0.8 pipsa i 1.5 pipsa.</li>
          <li>Przetestuj 3 typy zleceń: market, limit i stop — zobacz, jak faktycznie realizują się w platformie.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
