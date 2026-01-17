// app/prawne/warunki/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function Page() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'pl';
  const Updated = () => (
    <p className="text-xs text-white/60">Ostatnia aktualizacja: 2026-01-02</p>
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
            ["ai", "7. Asystent AI (EDU)"],
            ["rynkowe", "8. Dane rynkowe i opóźnienia"],
            ["zewnetrzne", "9. Treści zewnętrzne i linki"],
            ["subskrypcje", "10. Subskrypcje i płatności"],
            ["zmiany", "11. Zmiany warunków"],
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
        <p className="text-white/80 font-medium">
          {t(lang as any, 'compliance_disclaimer')}
        </p>
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

      {/* 7. AI */}
      <section className="space-y-3">
        <H2 id="ai">7. Asystent AI (EDU)</H2>
        <p className="text-white/80">
          Serwis udostępnia funkcje AI o charakterze edukacyjnym (m.in. czat i
          asystent „Coach”). Odpowiedzi AI mają charakter informacyjny i nie
          stanowią rekomendacji inwestycyjnych, porad finansowych ani prawnych.
        </p>
        <p className="text-white/80">
          Treść zapytań (prompty) i kontekst mogą być przetwarzane przez zewnętrznego
          dostawcę modelu (np. OpenAI) w celu wygenerowania odpowiedzi. Więcej
          informacji znajdziesz w dokumencie{" "}
          <Link href="/prawne/polityka-prywatnosci" className="underline">
            Polityka prywatności
          </Link>
          .
        </p>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Zakaz proszenia AI o „sygnały” handlowe i konkretne transakcje.</li>
          <li>Treści AI mogą być nieaktualne, niepełne lub błędne.</li>
          <li>Użytkownik samodzielnie ocenia ryzyko wykorzystania odpowiedzi AI.</li>
        </ul>
      </section>

      {/* 8. Dane rynkowe */}
      <section className="space-y-3">
        <H2 id="rynkowe">8. Dane rynkowe i opóźnienia</H2>
        <p className="text-white/80">
          Wybrane widżety mogą prezentować uproszczone notowania (np. WebSocket
          Binance dla krypto, Finnhub dla instrumentów FX/indeksów/surowców).
          Dane te mogą być opóźnione, niekompletne lub chwilowo niedostępne.
          Nie służą do zawierania transakcji i są wyłącznie materiałem edukacyjnym.
        </p>
        <p className="text-white/80">
          Serwis nie gwarantuje poprawności, ciągłości ani aktualności danych
          rynkowych. Dostawcy zewnętrzni mogą stosować własne regulaminy i polityki.
        </p>
      </section>

      {/* 9. Zewnętrzne treści i linki */}
      <section className="space-y-3">
        <H2 id="zewnetrzne">9. Treści zewnętrzne i linki</H2>
        <p className="text-white/80">
          Sekcja Aktualności może agregować nagłówki z zewnętrznych źródeł (np.
          Reuters, CNBC, FXStreet, Investing.com) i generować skróty przy użyciu
          modelu językowego. Linki prowadzą do stron podmiotów trzecich, nad
          którymi nie mamy kontroli. Nie odpowiadamy za ich treść ani polityki.
        </p>
      </section>

      {/* 10. Subskrypcje */}
      <section className="space-y-3">
        <H2 id="subskrypcje">10. Subskrypcje i płatności</H2>
        <p className="text-white/80">
          Zasady płatności, odnowień i rezygnacji opisuje dokument{" "}
          <Link href="/prawne/subskrypcja" className="underline">Regulamin subskrypcji</Link>
          . Informacje o odstąpieniu i zwrotach znajdziesz w{" "}
          <Link href="/prawne/zwroty-odstapienie" className="underline">Zwroty i odstąpienie</Link>
          .
        </p>
      </section>

      {/* 11. Zmiany */}
      <section className="space-y-3">
        <H2 id="zmiany">11. Zmiany warunków</H2>
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
