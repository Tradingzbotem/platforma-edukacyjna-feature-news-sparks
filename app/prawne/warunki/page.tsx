// app/prawne/warunki/page.tsx
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

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8">
      {/* Nawigacja powrotna */}
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
        <h1 className="text-3xl md:text-4xl font-bold">Warunki korzystania</h1>
        <p className="text-slate-300">
          Niniejszy dokument określa zasady korzystania z serwisu edukacyjnego
          (dalej: „Serwis”). Korzystając z Serwisu, akceptujesz poniższe
          postanowienia.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">
          Spis treści
        </div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["zakres", "1. Zakres i akceptacja"],
            ["definicje", "2. Definicje"],
            ["korzystanie", "3. Zasady korzystania"],
            ["odpowiedzialnosc", "4. Ograniczenie odpowiedzialności"],
            ["wlasnosc", "5. Własność intelektualna"],
            ["dane", "6. Dane, konto i bezpieczeństwo"],
            ["zmiany", "7. Zmiany warunków"],
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

      {/* 1. Zakres */}
      <section className="space-y-3">
        <H2 id="zakres">1. Zakres i akceptacja</H2>
        <p className="text-white/80">
          Warunki mają zastosowanie do wszystkich użytkowników odwiedzających
          Serwis. Dostęp do Serwisu jest równoznaczny z akceptacją Warunków. Jeżeli
          nie akceptujesz Warunków – nie korzystaj z Serwisu.
        </p>
        <p className="text-white/80">
          Serwis ma charakter wyłącznie edukacyjny i nie stanowi doradztwa
          inwestycyjnego, rekomendacji ani pośrednictwa w obrocie instrumentami
          finansowymi.
        </p>
      </section>

      {/* 2. Definicje */}
      <section className="space-y-3">
        <H2 id="definicje">2. Definicje</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <b>Serwis</b> – strona internetowa i powiązane funkcje (kursy, quizy,
            kalkulatory, forum).
          </li>
          <li>
            <b>Użytkownik</b> – każda osoba odwiedzająca lub korzystająca z Serwisu.
          </li>
          <li>
            <b>Treści</b> – materiały edukacyjne, wpisy na forum, quizy, pliki i
            inne informacje.
          </li>
        </ul>
      </section>

      {/* 3. Korzystanie */}
      <section className="space-y-3">
        <H2 id="korzystanie">3. Zasady korzystania</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Zakazane jest publikowanie treści bezprawnych lub naruszających prawa osób trzecich.</li>
          <li>Na forum obowiązują zasady kulturalnej i rzeczowej dyskusji.</li>
          <li>Treści Serwisu służą wyłącznie celom edukacyjnym i nie stanowią porady inwestycyjnej.</li>
          <li>
            Możemy tymczasowo ograniczyć dostęp do Serwisu w celach technicznych
            (np. prace serwisowe).
          </li>
        </ul>
      </section>

      {/* 4. Odpowiedzialność */}
      <section className="space-y-3">
        <H2 id="odpowiedzialnosc">4. Ograniczenie odpowiedzialności</H2>
        <p className="text-white/80">
          Serwis dokłada starań, aby materiały były poprawne i aktualne, ale nie
          gwarantuje kompletności ani przydatności do określonego celu. Serwis nie
          ponosi odpowiedzialności za decyzje inwestycyjne podjęte na podstawie
          Treści ani za szkody wynikłe z przerw w działaniu Serwisu.
        </p>
      </section>

      {/* 5. IP */}
      <section className="space-y-3">
        <H2 id="wlasnosc">5. Własność intelektualna</H2>
        <p className="text-white/80">
          Układ strony, teksty, grafika i kod źródłowy są chronione prawem
          autorskim. Użytkownik otrzymuje niewyłączną licencję na prywatne
          korzystanie z Treści. Zabronione jest kopiowanie, dystrybucja lub
          komercyjne wykorzystanie bez zgody właściciela.
        </p>
      </section>

      {/* 6. Dane i bezpieczeństwo */}
      <section className="space-y-3">
        <H2 id="dane">6. Dane, konto i bezpieczeństwo</H2>
        <p className="text-white/80">
          Zasady przetwarzania danych opisuje dokument{" "}
          <Link href="/prawne/prywatnosc" className="underline">
            Polityka prywatności
          </Link>
          . Użytkownik odpowiada za poufność danych logowania oraz działania
          wykonane na swoim koncie.
        </p>
      </section>

      {/* 7. Zmiany */}
      <section className="space-y-3">
        <H2 id="zmiany">7. Zmiany warunków</H2>
        <p className="text-white/80">
          Zastrzegamy prawo do aktualizacji Warunków. Nowe brzmienie obowiązuje od
          chwili publikacji w Serwisie, o ile nie wskazano inaczej.
        </p>
      </section>

      {/* Sekcja kontakt została przeniesiona do oddzielnej strony /kontakt */}

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
