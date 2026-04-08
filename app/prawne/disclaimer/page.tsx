import Link from "next/link";

export default function DisclaimerPage() {
  const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h2 id={id} className="text-xl md:text-2xl font-semibold scroll-mt-24">
      {children}
    </h2>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">
      {children}
    </div>
  );

  const toc: [string, string][] = [
    ["czym-jest", "Czym jest projekt"],
    ["czym-nie-jest", "Czym projekt nie jest"],
    ["dostep", "Dostęp i funkcjonalności"],
    ["wsparcie", "Wsparcie projektu"],
    ["ai", "AI i Coach"],
    ["decyzje", "Twoje decyzje"],
    ["dane", "Dane i dokładność"],
    ["ryzyko", "Ryzyko rynkowe"],
  ];

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8">
      <nav className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          ← Strona główna
        </Link>
        <Link
          href="/prawne"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          ← Prawne
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Disclaimer — ryzyko i charakter treści</h1>
        <p className="text-slate-300 max-w-2xl">
          Konkretnie: co robi ten projekt, czego nie robi i na czym polega płatny dostęp — w
          zwykłym języku.
        </p>
        <p className="text-xs text-white/60">Ostatnia aktualizacja: 2026-04-04</p>
      </header>

      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Na tej stronie</div>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {toc.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-block rounded-lg px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <section className="space-y-3">
        <H2 id="czym-jest">Czym jest projekt</H2>
        <p className="text-white/80 leading-relaxed">
          Projekt udostępnia w serwisie m.in. treści edukacyjne, funkcje analityczne oraz
          scenariusze i narzędzia, które mają wspierać{" "}
          <strong>samodzielną</strong> analizę rynku — bez zastępowania Twojego osądu i bez
          prowadzenia przez transakcje.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="czym-nie-jest">Czym projekt nie jest</H2>
        <p className="text-white/80 leading-relaxed">
          Projekt <strong>nie jest</strong> brokerem, domem maklerskim ani firmą
          inwestycyjną. Nie świadczy doradztwa inwestycyjnego, nie podaje sygnałów
          transakcyjnych i <strong>nie podejmuje decyzji za Ciebie</strong>. Treści nie są
          dopasowane do indywidualnej sytuacji finansowej konkretnej osoby.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="dostep">Dostęp i funkcjonalności</H2>
        <p className="text-white/80 leading-relaxed">
          Opłata dotyczy dostępu do <strong>funkcjonalności cyfrowych</strong> serwisu:
          materiałów edukacyjnych, modułów, analiz, briefów, scenariuszy oraz ewentualnych
          bonusów lub rozszerzeń opisanych przy wybranym wariancie dostępu.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="wsparcie">Wsparcie projektu</H2>
        <p className="text-white/80 leading-relaxed">
          Niektóre poziomy dostępu lub wyższe kwoty mogą mieć również charakter{" "}
          <strong>wsparcia rozwoju projektu</strong>. W zamian możesz otrzymać m.in. dodatkowe
          funkcje, bonusy czasowe, rozszerzony zakres modułów lub wcześniejszy dostęp do
          wybranych elementów — zgodnie z opisem przy danym wariancie.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="ai">AI i Coach</H2>
        <p className="text-white/80 leading-relaxed">
          Funkcje sztucznej inteligencji (w tym Coach AI) mają wyłącznie charakter{" "}
          <strong>edukacyjny i pomocniczy</strong>. Odpowiedzi modeli nie są rekomendacjami
          inwestycyjnymi, poradami finansowymi ani sygnałami — traktuj je jak materiał do
          własnej oceny, a nie jako gotową instrukcję działania.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="decyzje">Twoje decyzje</H2>
        <p className="text-white/80 leading-relaxed">
          Działasz samodzielnie. Każda decyzja dotycząca rynku lub kapitału należy do Ciebie i
          jest podejmowana na <strong>Twoją wyłączną odpowiedzialność</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="dane">Dane i dokładność</H2>
        <p className="text-white/80 leading-relaxed">
          Notowania, zestawienia, scenariusze, interpretacje i treści generowane lub
          prezentowane w serwisie mogą być <strong>niepełne, opóźnione lub błędne</strong>.
          Zawsze warto je zweryfikować u źródeł, którym ufasz, zanim podejmiesz realne
          kroki na rynku.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="ryzyko">Ryzyko rynkowe</H2>
        <p className="text-white/80 leading-relaxed">
          Handel instrumentami finansowymi (w tym m.in. CFD i Forex) wiąże się z ryzykiem
          utraty kapitału, zwłaszcza przy dźwigni.
        </p>
      </section>

      <Card>
        <p className="text-sm text-white/80 leading-relaxed">
          <strong>W skrócie:</strong> to narzędzia i treści edukacyjno-analityczne. To nie jest
          doradztwo, sygnały ani zarządzanie Twoim kapitałem.
        </p>
      </Card>

      <p className="text-sm text-white/60">
        Więcej:{" "}
        <Link href="/prawne/disclaimery" className="underline hover:text-white/80">
          Disclaimery rynkowe
        </Link>
        ,{" "}
        <Link href="/prawne/regulamin" className="underline hover:text-white/80">
          regulamin serwisu
        </Link>
        .
      </p>

      <div className="pt-4 border-t border-white/10">
        <Link
          href="/prawne"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm border border-white/10"
        >
          ← Wróć do „Prawne”
        </Link>
      </div>
    </main>
  );
}
