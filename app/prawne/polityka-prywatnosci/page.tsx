import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8 text-white">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold">Polityka prywatności</h1>
      <p className="mt-2 text-white/70">Ostatnia aktualizacja: 2026-01-02</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-white/80">
        <section className="space-y-2">
          <h2 className="font-semibold">1) Administrator i kontakt</h2>
          <p>
            Administratorem danych jest właściciel Serwisu (dalej: „Administrator”). W sprawach
            ochrony danych skontaktuj się przez{" "}
            <Link href="/kontakt" className="underline">formularz kontaktowy</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">2) Zakres przetwarzanych danych</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><b>Dane konta</b>: email, pseudonim, ustawienia profilu.</li>
            <li><b>Dane użycia</b>: aktywność w Serwisie (np. postępy w kursach/quizach), logi techniczne.</li>
            <li><b>Treści użytkownika</b>: wiadomości na forum/czacie, odpowiedzi w quizach.</li>
            <li><b>Dane techniczne</b>: adres IP, nagłówki przeglądarki, identyfikatory sesji, cookies (szczegóły poniżej).</li>
            <li><b>Płatności/subskrypcje</b> (jeśli używasz): identyfikatory transakcji/abonamentu, statusy rozliczeń (bez pełnych danych kart).</li>
            <li><b>AI (EDU)</b>: treści zapytań (prompty) i kontekst przekazywane do dostawcy modelu (np. OpenAI) w celu wygenerowania odpowiedzi.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">3) Cele i podstawy prawne</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><b>Świadczenie usługi i funkcji konta</b> — art. 6 ust. 1 lit. b RODO.</li>
            <li><b>Bezpieczeństwo, zapobieganie nadużyciom, statystyki</b> — uzasadniony interes (art. 6 ust. 1 lit. f).</li>
            <li><b>Personalizacja i analityka</b> — uzasadniony interes lub zgoda (art. 6 ust. 1 lit. f/a).</li>
            <li><b>Obsługa płatności i rozliczeń</b> — wykonanie umowy/obowiązek prawny (art. 6 ust. 1 lit. b/c).</li>
            <li><b>Funkcje AI (EDU)</b> — wykonanie usługi na żądanie użytkownika oraz uzasadniony interes (art. 6 ust. 1 lit. b/f).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">4) Odbiorcy danych i podmioty przetwarzające</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><b>Hosting/infra</b>: dostawcy usług chmurowych/serwerowych (np. platforma hostingowa).</li>
            <li><b>AI</b>: OpenAI (API czatu i/lub podsumowań aktualności) — otrzymuje treść zapytań/kontekstu.</li>
            <li><b>Dane rynkowe</b>: źródła notowań (np. Binance WS, Finnhub REST/WS) — połączenia mogą odbywać się z przeglądarki do usługodawcy.</li>
            <li><b>Aktualności</b>: agregacja nagłówków z serwisów zewnętrznych (np. Reuters, CNBC, FXStreet, Investing.com); skróty mogą być generowane przez model językowy.</li>
            <li><b>Płatności</b> (jeśli używasz): operatorzy rozliczeń online — otrzymują dane niezbędne do obsługi transakcji.</li>
            <li><b>Analityka</b> (jeśli włączona): narzędzia statystyczne, na podstawie zgody lub uzasadnionego interesu.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">5) Transfer poza EOG</h2>
          <p>
            Dane mogą być przekazywane do państw trzecich (np. USA) w związku z korzystaniem z usług
            dostawców (AI/hosting/analityka). Zapewniamy mechanizmy zgodności (np. standardowe klauzule
            umowne) w zakresie wymaganym przez RODO.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">6) Okres przechowywania</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><b>Konto i treści</b>: przez czas trwania konta, a po usunięciu — przez okres niezbędny do rozliczeń/dochodzenia roszczeń.</li>
            <li><b>Logi techniczne</b>: co do zasady do 12 miesięcy, chyba że dłużej jest potrzebne dla bezpieczeństwa/roszczeń.</li>
            <li><b>AI</b>: treści zapytań mogą być krótkotrwale przechowywane przez dostawcę modelu (np. do 30 dni) w celach bezpieczeństwa/diagnozy.</li>
            <li><b>Rozliczenia</b>: zgodnie z przepisami prawa podatkowego/księgowego.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">7) Twoje prawa</h2>
          <p>
            Przysługują Ci: dostęp do danych, sprostowanie, usunięcie, ograniczenie, przenoszenie,
            sprzeciw wobec przetwarzania oraz skarga do organu nadzorczego. Aby skorzystać z praw,
            skontaktuj się przez{" "}
            <Link href="/kontakt" className="underline">formularz kontaktowy</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">8) Cookies i podobne technologie</h2>
          <p>
            Serwis wykorzystuje pliki cookies oraz podobne mechanizmy (np. localStorage) — m.in. do
            utrzymania sesji, zapamiętywania preferencji i, za zgodą, do analityki. Wybrane widżety
            mogą buforować dane w przeglądarce (np. ostatnie notowania). Szczegóły i możliwości
            zarządzania opisuje{" "}
            <Link href="/prawne/cookies" className="underline">Polityka cookies</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">9) Zmiany polityki</h2>
          <p>
            Możemy okresowo aktualizować Politykę prywatności. Nowa wersja obowiązuje od publikacji
            w Serwisie.
          </p>
        </section>
      </div>
    </main>
  );
}
