import Link from "next/link";

export default function Page() {
  const Updated = () => (
    <p className="text-xs text-white/60">Ostatnia aktualizacja: 2026-04-02</p>
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
          Zestaw najważniejszych dokumentów i informacji: regulamin sprzedaży Founders NFT, polityka zwrotów i odstąpienia,
          skrót polityki prywatności oraz disclaimery rynkowe. Dokument ma charakter informacyjny i stanowi uzupełnienie
          szczegółowych polityk w sekcji Prawne.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["nft-licencja", "1. Founders NFT i licencja dostępu"],
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

      {/* 1. Founders NFT */}
      <section className="space-y-3">
        <H2 id="nft-licencja">1. Founders NFT i licencja dostępu</H2>
        <p className="text-white/80">
          <b>Founders NFT:</b> jednorazowy zakup tokenu powiązanego z licencją dostępu do FXEDULAB; płatność w krypto;
          brak miesięcznej opłaty za dostęp dla posiadacza NFT; rynek wtórny na własne ryzyko. Pełny dokument:{" "}
          <Link href="/prawne/nft" className="underline font-semibold">Regulamin sprzedaży NFT</Link> —{" "}
          <Link href="/cennik" className="underline">cennik</Link>.
        </p>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <b>Zakres:</b> licencja uprawnia do korzystania z treści edukacyjnych, kursów, quizów i narzędzi Serwisu w
            zakresie opublikowanym przy sprzedaży NFT.
          </li>
          <li>
            <b>Konto:</b> korzystanie wymaga aktywnego konta i weryfikacji powiązania z NFT zgodnie z instrukcjami w
            Serwisie. Użytkownik odpowiada za poufność danych logowania i działania na koncie.
          </li>
          <li>
            <b>Uczciwe korzystanie:</b> zakazane jest udostępnianie konta w celu ominięcia modelu licencyjnego oraz
            działania naruszające bezpieczeństwo Serwisu.
          </li>
          <li>
            <b>Charakter edukacyjny:</b> Serwis nie świadczy doradztwa inwestycyjnego ani rekomendacji; szczegóły w części
            „Disclaimery rynkowe”.
          </li>
        </ul>
        <p className="text-white/80">
          Nie sprzedajemy abonamentu miesięcznego za dostęp do Serwisu — wyłącznie model jednorazowy (NFT) opisany
          powyżej.
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
            <b>Treści cyfrowe:</b> po rozpoczęciu świadczenia usługi cyfrowej za wyraźną zgodą konsumenta prawo odstąpienia
            może nie przysługiwać w zakresie przewidzianym przepisami.
          </p>
          <p>
            <b>NFT i krypto:</b> po zaksięgowaniu płatności i przekazaniu NFT może dojść do natychmiastowego wykonania
            świadczenia; prawo odstąpienia może być wyłączone po spełnieniu przesłanek ustawowych i wyraźnej zgody — zob.{" "}
            <Link href="/prawne/nft" className="underline">Regulamin NFT</Link>.
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
          W sprawach NFT, odstąpienia, reklamacji lub prywatności skontaktuj się przez{" "}
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


