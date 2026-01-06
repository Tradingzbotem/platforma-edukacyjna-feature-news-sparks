import Link from "next/link";

export default function Page() {
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
      {/* Nawigacja */}
      <nav className="flex items-center gap-2">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
        <Link href="/prawne" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Prawne</Link>
      </nav>

      {/* Nagłówek */}
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Regulamin subskrypcji</h1>
        <p className="text-slate-300">
          Zasady korzystania z płatnych planów subskrypcyjnych w Serwisie edukacyjnym.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["zakres", "1. Zakres usługi"],
            ["konto", "2. Rejestracja i konto"],
            ["platnosci", "3. Płatności i rozliczenia"],
            ["odnowienia", "4. Odnowienia i anulacje"],
            ["zmiany", "5. Zmiany planów i cen"],
            ["proporcje", "6. Zmiany planu (upgrade/downgrade)"],
            ["fairuse", "7. Zasady uczciwego korzystania"],
            ["prawo-odst", "8. Prawo odstąpienia a treści cyfrowe"],
            ["rozwiazanie", "9. Rozwiązanie umowy"],
            ["reklamacje", "10. Reklamacje"],
            ["postanowienia", "11. Postanowienia końcowe"],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-block rounded-lg px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <section className="space-y-3">
        <H2 id="zakres">1. Zakres usługi</H2>
        <p className="text-white/80">
          Subskrypcja zapewnia dostęp do treści edukacyjnych i funkcjonalności Serwisu zgodnie z wybranym planem.
          Zakres może obejmować kursy, quizy, symulatory, forum i inne moduły określone w opisie planu.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="konto">2. Rejestracja i konto</H2>
        <p className="text-white/80">
          Do korzystania z subskrypcji wymagane jest aktywne konto. Użytkownik odpowiada za poufność danych logowania
          oraz działania wykonane na swoim koncie.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="platnosci">3. Płatności i rozliczenia</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Płatności realizowane są z góry za okres rozliczeniowy (miesięczny/roczny).</li>
          <li>W przypadku niepowodzenia płatności możemy ponowić obciążenie w rozsądnych odstępach.</li>
          <li>Faktury/rachunki (jeśli dotyczy) udostępniamy elektronicznie.</li>
          <li>Kody rabatowe/promocje mają własne warunki; mogą nie łączyć się z innymi ofertami.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="odnowienia">4. Odnowienia i anulacje</H2>
        <p className="text-white/80">
          Subskrypcja odnawia się automatycznie do czasu anulowania w ustawieniach konta. Anulowanie obowiązuje
          od kolejnego okresu; dostęp pozostaje do końca bieżącego okresu.
        </p>
        <p className="text-white/80">
          Jeżeli plan obejmuje okres próbny, po jego zakończeniu nastąpi pierwsze obciążenie zgodnie z cennikiem,
          o ile subskrypcja nie zostanie wcześniej anulowana.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zmiany">5. Zmiany planów i cen</H2>
        <p className="text-white/80">
          Zastrzegamy prawo do zmiany zakresu planów i cen. O zmianach informujemy z wyprzedzeniem.
          Nowe warunki obowiązują od kolejnego okresu rozliczeniowego.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="proporcje">6. Zmiany planu (upgrade/downgrade)</H2>
        <p className="text-white/80">
          Zmiana planu w trakcie okresu rozliczeniowego może skutkować proporcjonalnym rozliczeniem (pro‑rata)
          lub natychmiastowym dostępem do wyższych funkcji (np. narzędzia AI dla planu ELITE), zgodnie z informacją
          wyświetlaną podczas zmiany.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="fairuse">7. Zasady uczciwego korzystania</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Zakaz udostępniania konta osobom trzecim.</li>
          <li>Zakaz działań naruszających bezpieczeństwo Serwisu lub omijania ograniczeń.</li>
          <li>Funkcje AI (jeśli dostępne w planie) mają charakter edukacyjny i nie służą do generowania sygnałów.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="prawo-odst">8. Prawo odstąpienia a treści cyfrowe</H2>
        <p className="text-white/80">
          W przypadku treści cyfrowych dostarczanych natychmiast po zakupie prawo odstąpienia może nie przysługiwać,
          jeśli wyrazisz wyraźną zgodę na rozpoczęcie świadczenia przed upływem 14 dni i zostaniesz poinformowany(-a)
          o utracie prawa odstąpienia. Szczegóły znajdują się w{" "}
          <Link href="/prawne/zwroty-odstapienie" className="underline">Zwroty i odstąpienie</Link>.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="rozwiazanie">9. Rozwiązanie umowy</H2>
        <p className="text-white/80">
          Możemy zawiesić lub zakończyć świadczenie usługi w przypadku istotnego naruszenia Regulaminu.
          Użytkownik może zakończyć korzystanie poprzez anulowanie subskrypcji i usunięcie konta.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="reklamacje">10. Reklamacje</H2>
        <p className="text-white/80">
          Reklamacje dotyczące rozliczeń lub dostępu rozpatrujemy w rozsądnym terminie. Zgłoszenia prosimy
          kierować przez <Link href="/kontakt" className="underline">formularz kontaktowy</Link>.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="postanowienia">11. Postanowienia końcowe</H2>
        <p className="text-white/80">
          Regulamin subskrypcji stanowi uzupełnienie{" "}
          <Link href="/prawne/warunki" className="underline">Warunków korzystania</Link>.
        </p>
      </section>

      <div className="pt-4 border-t border-white/10">
        <Link href="/prawne" className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm border border-white/10">← Wróć do „Prawne”</Link>
      </div>
    </main>
  );
}


