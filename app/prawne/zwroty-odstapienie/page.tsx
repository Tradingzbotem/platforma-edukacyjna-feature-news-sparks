import Link from "next/link";

export default function Page() {
  const Updated = () => (
    <p className="text-xs text-white/60">Ostatnia aktualizacja: 2026-04-04</p>
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

  const toc: [string, string][] = [
    ["czym-umowa", "1. Czym jest umowa u nas"],
    ["prawo", "2. Prawo odstąpienia — 14 dni"],
    ["rozpoczecie", "3. Co znaczy „rozpoczęcie” usługi cyfrowej"],
    ["zgoda", "4. Zgoda na wcześniejsze rozpoczęcie"],
    ["po-rozpoczeciu", "5. Po rozpoczęciu świadczenia"],
    ["nft", "6. Zakup Founders NFT"],
    ["procedura", "7. Jak odstąpić (gdy przysługuje)"],
    ["zwroty", "8. Zwrot płatności"],
    ["reklamacje", "9. Reklamacje (nie to samo co odstąpienie)"],
    ["kontakt", "10. Kontakt"],
  ];

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8">
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

      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Zwroty i odstąpienie od umowy</h1>
        <p className="text-slate-300">
          Prosto o prawie odstąpienia od umowy zawartej na odległość przy{" "}
          <strong>usłudze cyfrowej</strong> i treściach cyfrowych — oraz jak to łączy się z zakupem
          Founders NFT. Szczegóły umowy:{" "}
          <Link href="/prawne/regulamin" className="underline">
            regulamin serwisu
          </Link>
          .
        </p>
        <Updated />
      </header>

      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
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
        <H2 id="czym-umowa">1. Czym jest umowa u nas</H2>
        <p className="text-white/80">
          Typowa umowa z konsumentem dotyczy <strong>dostępu do funkcji cyfrowych</strong> Serwisu
          (materiały edukacyjne, moduły, panel itd.) — w zakresie opisanym przy zamówieniu lub
          w{" "}
          <Link href="/prawne/regulamin" className="underline">
            regulaminie
          </Link>
          . Nie kupujesz od nas produktu inwestycyjnego, lokaty ani usługi zarządzania
          kapitałem.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="prawo">2. Prawo odstąpienia — 14 dni</H2>
        <p className="text-white/80">
          Jeśli jesteś <strong>konsumentem</strong>, zwykle przysługuje Ci prawo odstąpienia od umowy
          zawartej na odległość w ciągu <strong>14 dni</strong> bez podania przyczyny — o ile prawo to
          nie zostało wyłączone w konkretnym przypadku na podstawie przepisów (patrz niżej).
        </p>
        <p className="text-white/80">
          Termin liczy się od dnia zawarcia umowy. Aby go zachować, wystarczy wysłać oświadczenie
          przed upływem 14 dni.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="rozpoczecie">3. Co znaczy „rozpoczęcie” usługi cyfrowej</H2>
        <p className="text-white/80">
          W przypadku <strong>treści cyfrowych</strong> dostarczanych bez nośnika fizycznego ustawa
          przewiduje wyłączenie prawa odstąpienia, jeśli:
        </p>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <strong>świadczenie zostało rozpoczęte</strong> (np. udostępniono Ci dostęp do modułów,
            treści lub konta z pełnym zakresem){" "}
            <strong>za Twoją wyraźną zgodą</strong> przed upływem 14 dni, oraz
          </li>
          <li>
            zostałeś <strong>poinformowany</strong>, że po wyrażeniu tej zgody tracisz prawo
            odstąpienia.
          </li>
        </ul>
        <p className="text-white/80">
          W skrócie: jeśli przed upływem terminu wyraźnie zgodzisz się na natychmiastowy dostęp
          do treści/usługi cyfrowej i zostaniesz o konsekwencjach poinformowany, odstąpienie może
          nie przysługiwać — zgodnie z art. 38 ustawy o prawach konsumenta (brzmienie aktualne w
          źródle prawnym).
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zgoda">4. Zgoda na wcześniejsze rozpoczęcie</H2>
        <p className="text-white/80">
          Jeśli przy zakupie zaznaczysz odpowiednią zgodę (lub w inny sposób wyraźnie ją wyrazisz
          — zgodnie z procesem opisanym przy zamówieniu), możemy od razu włączyć dostęp. To
          typowe przy usługach cyfrowych, gdzie użytkownik chce korzystać od razu.
        </p>
        <p className="text-white/80">
          Treść i moment zbierania zgody muszą być zgodne z obowiązującym prawem; przy ścieżce
          NFT dodatkowe informacje znajdziesz w{" "}
          <Link href="/prawne/nft" className="underline">
            regulaminie NFT
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="po-rozpoczeciu">5. Po rozpoczęciu świadczenia</H2>
        <p className="text-white/80">
          Gdy wyłączenie prawa odstąpienia jest skuteczne, <strong>nie możesz już odstąpić</strong> od
          umowy w trybie 14-dniowym — ale nadal mogą Ci przysługiwać uprawnienia z tytułu{" "}
          <strong>niezgodności usługi z umową</strong> lub reklamacji (np. brak dostępu mimo
          zapłaty), zgodnie z przepisami.
        </p>
        <p className="text-white/80">
          W razie wątpliwości, czy w Twoim przypadku odstąpienie jeszcze przysługuje, napisz przez{" "}
          <Link href="/kontakt" className="underline">
            kontakt
          </Link>{" "}
          — podaj datę zakupu i rodzaj produktu.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="nft">6. Zakup Founders NFT</H2>
        <p className="text-white/80">
          Zakup Founders NFT wiąże się z przekazaniem tokenu i uruchomieniem ścieżki licencji na
          dostęp. W praktyce świadczenie może rozpocząć się <strong>niezwłocznie</strong> po spełnieniu
          warunków technicznych (np. zaksięgowanie, zapis na blockchainie). W takim zakresie
          mogą mieć zastosowanie <strong>ustawowe wyłączenia</strong> odstąpienia — dokładny opis procesu,
          zgód i wyjątków jest w{" "}
          <Link href="/prawne/nft" className="underline">
            Regulaminie sprzedaży NFT
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="procedura">7. Jak odstąpić (gdy przysługuje)</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Wyślij jednoznaczne oświadczenie o odstąpieniu w terminie 14 dni (np. przez formularz kontaktowy).</li>
          <li>Podaj e-mail konta, datę zamówienia oraz — jeśli masz — ID zamówienia lub TXID.</li>
          <li>Na żądanie możemy potwierdzić odbiór oświadczenia na trwałym nośniku.</li>
        </ul>
        <p className="text-white/80">
          Przykład treści: „Ja … niniejszym odstępuję od umowy zawartej dnia … dotyczącej dostępu
          do Serwisu / Founders NFT, konto …”.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zwroty">8. Zwrot płatności</H2>
        <p className="text-white/80">
          Jeśli odstąpienie jest skuteczne, zwracamy otrzymane płatności <strong>niezwłocznie</strong>, w
          zasadzie nie później niż w ciągu 14 dni od otrzymania oświadczenia, tą samą metodą
          płatności, o ile nie uzgodnimy inaczej.
        </p>
        <p className="text-white/80">
          Przy płatnościach krypto lub NFT szczegóły rozliczenia mogą zależeć od możliwości
          technicznych zwrotu — wtedy stosujemy zasady z{" "}
          <Link href="/prawne/nft" className="underline">
            regulaminu NFT
          </Link>{" "}
          i obowiązujące przepisy.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="reklamacje">9. Reklamacje (nie to samo co odstąpienie)</H2>
        <p className="text-white/80">
          Jeśli zapłaciłeś, a <strong>nie otrzymujesz opisanego dostępu</strong> albo usługa cyfrowa nie
          działa zgodnie z umową, złóż <strong>reklamację</strong> — to odrębna ścieżka od odstąpienia.
          Zasady:{" "}
          <Link href="/prawne/regulamin#reklamacje" className="underline">
            regulamin — reklamacje
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="kontakt">10. Kontakt</H2>
        <p className="text-white/80">
          Pytania o odstąpienie, zwroty i reklamacje:{" "}
          <Link href="/kontakt" className="underline">
            formularz kontaktowy
          </Link>
          .
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
