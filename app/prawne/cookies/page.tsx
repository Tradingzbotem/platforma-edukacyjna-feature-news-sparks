// app/prawne/cookies/page.tsx
import Link from "next/link";

export default function Page() {
  const Updated = () => (
    <p className="text-xs text-white/60">Ostatnia aktualizacja: 2025-08-01</p>
  );

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

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block text-[11px] rounded-full px-2 py-0.5 bg-white/10 border border-white/10">
      {children}
    </span>
  );

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8">
      {/* Nawigacja */}
      <nav className="flex items-center gap-2">
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

      {/* Nagłówek */}
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Polityka cookies</h1>
        <p className="text-slate-300">
          Wyjaśniamy, czym są pliki cookies, jakie stosujemy i jak możesz
          nimi zarządzać.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["def", "1. Czym są pliki cookies"],
            ["rodzaje", "2. Rodzaje i cele stosowanych cookies"],
            ["czas", "3. Czas życia plików"],
            ["zarz", "4. Jak zarządzać zgodą i cookies"],
            ["third", "5. Cookies podmiotów trzecich"],
            ["zmiany", "6. Zmiany polityki"],
            ["kontakt", "7. Kontakt"],
          ].map(([id, label]) => (
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

      {/* 1. Definicja */}
      <section className="space-y-3">
        <H2 id="def">1. Czym są pliki cookies</H2>
        <p className="text-white/80">
          Cookies to niewielkie pliki zapisywane na Twoim urządzeniu podczas
          korzystania z Serwisu. Pozwalają m.in. utrzymać sesję użytkownika,
          zapamiętać preferencje oraz, po wyrażeniu zgody, prowadzić analitykę.
        </p>
      </section>

      {/* 2. Rodzaje */}
      <section className="space-y-3">
        <H2 id="rodzaje">2. Rodzaje i cele stosowanych cookies</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-2">
          <li>
            <b>Niezbędne</b> <Pill>required</Pill> — techniczne utrzymanie sesji,
            bezpieczeństwo, obsługa formularzy i podstawowych funkcji Serwisu.
          </li>
          <li>
            <b>Funkcjonalne</b> — zapamiętanie preferencji interfejsu (np. język,
            motyw).
          </li>
          <li>
            <b>Analityczne</b> <Pill>za zgodą</Pill> — statystyki użycia Serwisu
            (np. agregowane informacje o odwiedzinach) w celu poprawy jakości.
          </li>
          <li>
            <b>Reklamowe</b> <Pill>opcjonalne</Pill> — wykorzystywane wyłącznie,
            jeśli takie funkcje zostaną włączone; obecnie Serwis ich nie używa,
            chyba że wyraźnie wskażemy inaczej.
          </li>
        </ul>
      </section>

      {/* 3. Czas życia */}
      <section className="space-y-3">
        <H2 id="czas">3. Czas życia plików</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <b>Sesyjne</b> — usuwane po zamknięciu przeglądarki.
          </li>
          <li>
            <b>Stałe</b> — pozostają na urządzeniu do upływu wskazanego terminu
            lub do ręcznego usunięcia (np. 1–12 miesięcy w zależności od celu).
          </li>
        </ul>
      </section>

      {/* 4. Zarządzanie */}
      <section className="space-y-3">
        <H2 id="zarz">4. Jak zarządzać zgodą i cookies</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            Zgody na kategorie nie-niezbędne możesz udzielić/wycofać poprzez
            baner zgód (jeśli jest wyświetlany) lub ustawienia przeglądarki.
          </li>
          <li>
            W przeglądarce możesz zablokować zapisywanie cookies, usuwać istniejące
            oraz ustawić pytanie przed zapisaniem nowego pliku.
          </li>
          <li>
            Pamiętaj: wyłączenie niezbędnych cookies może ograniczyć działanie Serwisu.
          </li>
        </ul>
      </section>

      {/* 5. Third-party */}
      <section className="space-y-3">
        <H2 id="third">5. Cookies podmiotów trzecich</H2>
        <p className="text-white/80">
          Niektóre elementy mogą pochodzić od zewnętrznych dostawców (np. narzędzia
          analityczne). W takim przypadku pliki mogą być odczytywane również przez
          te podmioty na zasadach ich polityk prywatności. Szczegóły wskażemy w
          konfiguracji banera zgód, jeśli takie narzędzia zostaną aktywowane.
        </p>
      </section>

      {/* 6. Zmiany */}
      <section className="space-y-3">
        <H2 id="zmiany">6. Zmiany polityki</H2>
        <p className="text-white/80">
          Polityka cookies może być aktualizowana wraz ze zmianami technicznymi
          Serwisu lub dostawców. Nowa wersja obowiązuje od dnia publikacji.
        </p>
      </section>

      {/* 7. Kontakt */}
      <section className="space-y-3">
        <H2 id="kontakt">7. Kontakt</H2>
        <p className="text-white/80">
          Pytania dotyczące cookies możesz wysłać przez
          <Link href="/kontakt" className="underline"> formularz kontaktowy</Link>.
        </p>
      </section>

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
