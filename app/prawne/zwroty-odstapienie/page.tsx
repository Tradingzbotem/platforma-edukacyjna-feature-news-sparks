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
        <h1 className="text-3xl md:text-4xl font-bold">Zwroty i odstąpienie od umowy</h1>
        <p className="text-slate-300">
          Zasady dotyczące prawa odstąpienia oraz polityki zwrotów dla usług cyfrowych i subskrypcji.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["prawo", "1. Prawo odstąpienia 14 dni"],
            ["wylaczenia", "2. Wyłączenia prawa odstąpienia"],
            ["procedura", "3. Procedura odstąpienia"],
            ["terminy", "4. Terminy i forma"],
            ["zwroty", "5. Zwrot świadczeń"],
            ["reklamacje", "6. Reklamacje i rekompensaty"],
            ["biznes", "7. Klienci biznesowi"],
            ["kontakt", "8. Kontakt"],
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
        <H2 id="prawo">1. Prawo odstąpienia 14 dni</H2>
        <p className="text-white/80">
          Konsument może odstąpić od umowy zawartej na odległość w terminie 14 dni bez podawania przyczyny,
          chyba że zachodzą ustawowe wyłączenia dotyczące treści cyfrowych.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="wylaczenia">2. Wyłączenia prawa odstąpienia</H2>
        <p className="text-white/80">
          W przypadku dostarczania treści cyfrowych, które nie są zapisane na nośniku materialnym, prawo odstąpienia
          nie przysługuje, jeżeli świadczenie rozpoczęto za wyraźną zgodą konsumenta przed upływem terminu odstąpienia
          i po poinformowaniu o utracie tego prawa.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="procedura">3. Procedura odstąpienia</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Złóż oświadczenie o odstąpieniu w terminie 14 dni (np. przez formularz kontaktowy).</li>
          <li>Wskaż dane konta i numer zamówienia/płatności, aby przyspieszyć obsługę.</li>
          <li>Otrzymasz potwierdzenie przyjęcia oświadczenia na trwałym nośniku.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="terminy">4. Terminy i forma</H2>
        <p className="text-white/80">
          Termin 14 dni liczony jest od dnia zawarcia umowy (dla usług cyfrowych). Do zachowania terminu
          wystarczy wysłanie oświadczenia przed jego upływem. Możesz skorzystać z naszego{" "}
          <Link href="/kontakt" className="underline">formularza</Link> lub własnego wzoru.
        </p>
        <p className="text-white/80">
          Przykładowy wzór: „Ja/My … niniejszym informuję/informujemy o odstąpieniu od umowy zawartej dnia …
          dotyczącej (plan/abonament) na koncie … (email)”.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zwroty">5. Zwrot świadczeń</H2>
        <p className="text-white/80">
          W przypadku skutecznego odstąpienia zwracamy dokonane płatności niezwłocznie, nie później niż w ciągu 14 dni
          od otrzymania oświadczenia, z wykorzystaniem tego samego sposobu zapłaty, chyba że uzgodniono inaczej.
        </p>
        <p className="text-white/80">
          W przypadku subskrypcji już aktywowanej co do zasady nie realizujemy zwrotów za rozpoczęty okres rozliczeniowy;
          możliwe jest anulowanie na przyszłość (brak dalszych obciążeń).
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="reklamacje">6. Reklamacje i rekompensaty</H2>
        <p className="text-white/80">
          W razie braku dostępu lub istotnych problemów technicznych z naszej winy możesz złożyć reklamację.
          Każdy przypadek rozpatrujemy indywidualnie. Zgłoszenia:{" "}
          <Link href="/kontakt" className="underline">formularz kontaktowy</Link>.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="biznes">7. Klienci biznesowi</H2>
        <p className="text-white/80">
          Postanowienia dotyczące prawa odstąpienia przewidziane są dla konsumentów i, w pewnych przypadkach,
          dla przedsiębiorców na prawach konsumenta. W pozostałych przypadkach zastosowanie mają postanowienia
          umowne oraz przepisy Kodeksu cywilnego.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="kontakt">8. Kontakt</H2>
        <p className="text-white/80">
          Pytania dotyczące odstąpienia lub zwrotów kieruj przez{" "}
          <Link href="/kontakt" className="underline">formularz kontaktowy</Link>.
        </p>
      </section>

      <div className="pt-4 border-t border-white/10">
        <Link href="/prawne" className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm border border-white/10">← Wróć do „Prawne”</Link>
      </div>
    </main>
  );
}


