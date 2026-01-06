import Link from "next/link";

export default function Page() {
  const Updated = () => (
    <p className="text-xs text-white/60">Ostatnia aktualizacja: 2026-01-01</p>
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
        <h1 className="text-3xl md:text-4xl font-bold">Pakiet zgodności (Compliance)</h1>
        <p className="text-slate-300">
          Zestaw najważniejszych dokumentów i informacji: regulamin subskrypcji,
          polityka zwrotów i odstąpienia, skrót polityki prywatności oraz
          disclaimery rynkowe. Dokument ma charakter informacyjny i stanowi
          uzupełnienie szczegółowych polityk w sekcji Prawne.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["subskrypcja", "1. Regulamin subskrypcji"],
            ["zwroty", "2. Zwroty i odstąpienie od umowy"],
            ["prywatnosc", "3. Polityka prywatności (skrót)"],
            ["disclaimers", "4. Disclaimery rynkowe"],
            ["kontakt", "5. Kontakt"],
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

      {/* 1. Regulamin subskrypcji */}
      <section className="space-y-3">
        <H2 id="subskrypcja">1. Regulamin subskrypcji</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <b>Zakres usług:</b> dostęp do treści edukacyjnych, kursów, quizów i narzędzi
            udostępnianych w Serwisie w ramach wybranego planu.
          </li>
          <li>
            <b>Konto:</b> korzystanie wymaga aktywnego konta. Użytkownik odpowiada za
            poufność danych logowania i działania wykonane na koncie.
          </li>
          <li>
            <b>Płatności cykliczne:</b> subskrypcja odnawia się automatycznie w okresach
            rozliczeniowych (np. co miesiąc/rok) do czasu anulowania.
          </li>
          <li>
            <b>Okres próbny (jeśli dostępny):</b> po jego zakończeniu subskrypcja przechodzi
            automatycznie w plan płatny, chyba że zostanie anulowana przed końcem okresu próbnego.
          </li>
          <li>
            <b>Anulowanie:</b> możesz anulować w dowolnym momencie w ustawieniach konta
            (np. <span className="whitespace-nowrap">Konto → Ustawienia → Subskrypcja</span>).
            Anulowanie skutkuje brakiem odnowienia od kolejnego okresu rozliczeniowego;
            dostęp pozostaje aktywny do końca bieżącego okresu.
          </li>
          <li>
            <b>Zmiany cen i planów:</b> możemy zaktualizować ceny lub zakres planów; o
            zmianach poinformujemy z wyprzedzeniem. Zmiany obowiązują od kolejnego okresu
            rozliczeniowego.
          </li>
          <li>
            <b>Uczciwe korzystanie:</b> zakazane jest udostępnianie konta osobom trzecim
            oraz działania naruszające bezpieczeństwo Serwisu.
          </li>
          <li>
            <b>Charakter edukacyjny:</b> Serwis nie świadczy doradztwa inwestycyjnego ani
            rekomendacji; szczegóły w części „Disclaimery rynkowe”.
          </li>
        </ul>
        <p className="text-white/80">
          Pełny dokument:{" "}
          <Link href="/prawne/subskrypcja" className="underline font-semibold">Regulamin subskrypcji</Link>.
        </p>
      </section>

      {/* 2. Zwroty i odstąpienie */}
      <section className="space-y-3">
        <H2 id="zwroty">2. Zwroty i odstąpienie od umowy</H2>
        <div className="text-white/80 space-y-2">
          <p>
            <b>Odstąpienie 14 dni:</b> konsument może odstąpić od umowy zawartej na odległość
            w terminie 14 dni bez podawania przyczyny, chyba że dotyczy to dostarczania treści
            cyfrowych, które nie są zapisane na nośniku materialnym, a świadczenie rozpoczęto
            za wyraźną zgodą konsumenta przed upływem terminu odstąpienia i po poinformowaniu
            o utracie prawa odstąpienia.
          </p>
          <p>
            <b>Treści cyfrowe / subskrypcja:</b> aktywacja subskrypcji i uzyskanie dostępu do
            treści oznacza rozpoczęcie świadczenia usługi. W takim przypadku prawo odstąpienia
            nie przysługuje w zakresie rozpoczętego okresu rozliczeniowego.
          </p>
          <p>
            <b>Anulowanie na przyszłość:</b> możesz anulować subskrypcję w dowolnym momencie —
            skuteczność od kolejnego okresu rozliczeniowego. Co do zasady nie realizujemy zwrotów
            proporcjonalnych za okres już rozpoczęty.
          </p>
          <p>
            <b>Wyjątki i reklamacje:</b> w razie oczywistych błędów technicznych lub braku
            dostępu z naszej winy rozpatrujemy indywidualnie wnioski o rekompensatę/zwrot.
            Zgłoszenia złóż przez{" "}
            <Link href="/kontakt" className="underline">formularz kontaktowy</Link>.
          </p>
          <p>
            <b>Forma odstąpienia (jeśli przysługuje):</b> wyślij jednoznaczne oświadczenie
            (np. e‑mail przez formularz) w terminie 14 dni od zawarcia umowy.
          </p>
        </div>
        <p className="text-white/80">
          Pełny dokument:{" "}
          <Link href="/prawne/zwroty-odstapienie" className="underline font-semibold">Zwroty i odstąpienie</Link>.
        </p>
      </section>

      {/* 3. Prywatność (skrót) */}
      <section className="space-y-3">
        <H2 id="prywatnosc">3. Polityka prywatności (skrót)</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Dane konta: e‑mail, login, dane techniczne (logi, identyfikatory urządzenia).</li>
          <li>Cele: świadczenie usług Serwisu, bezpieczeństwo, komunikacja, statystyka (za zgodą).</li>
          <li>Podstawy prawne: umowa, uzasadniony interes, zgoda, obowiązki prawne.</li>
          <li>Twoje prawa: dostęp, sprostowanie, usunięcie, ograniczenie, sprzeciw, przenoszenie.</li>
          <li>Cookies: szczegóły w <Link href="/prawne/cookies" className="underline">Polityce cookies</Link>.</li>
        </ul>
        <p className="text-white/80">
          Pełny dokument:{" "}
          <Link href="/prawne/prywatnosc" className="underline font-semibold">
            Polityka prywatności
          </Link>
          .
        </p>
      </section>

      {/* 4. Disclaimery rynkowe */}
      <section className="space-y-3">
        <H2 id="disclaimers">4. Disclaimery rynkowe</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <b>Brak doradztwa:</b> treści mają charakter edukacyjny i informacyjny. Nie stanowią
            rekomendacji inwestycyjnych, doradztwa finansowego, podatkowego ani prawnego.
          </li>
          <li>
            <b>Ryzyko inwestycyjne:</b> inwestowanie na rynkach finansowych wiąże się z ryzykiem
            utraty kapitału. Instrumenty z dźwignią (np. CFD/FX) niosą podwyższone ryzyko.
          </li>
          <li>
            <b>Wyniki historyczne:</b> nie gwarantują przyszłych rezultatów. Symulatory i materiały
            edukacyjne nie odzwierciedlają w pełni warunków rynkowych.
          </li>
          <li>
            <b>Dane rynkowe:</b> mogą być opóźnione lub niepełne. Nie gwarantujemy dokładności ani
            dostępności w czasie rzeczywistym.
          </li>
          <li>
            <b>Odpowiedzialność:</b> Serwis nie ponosi odpowiedzialności za decyzje podjęte na
            podstawie treści dostępnych w Serwisie.
          </li>
        </ul>
        <p className="text-white/80">
          Pełny dokument:{" "}
          <Link href="/prawne/disclaimery" className="underline font-semibold">Disclaimery rynkowe</Link>.
        </p>
      </section>

      {/* 5. Kontakt */}
      <section className="space-y-3">
        <H2 id="kontakt">5. Kontakt</H2>
        <p className="text-white/80">
          W sprawach subskrypcji, odstąpienia, reklamacji lub prywatności skontaktuj się przez{" "}
          <Link href="/kontakt" className="underline">formularz kontaktowy</Link>.
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


