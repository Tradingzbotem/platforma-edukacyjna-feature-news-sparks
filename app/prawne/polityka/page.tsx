// app/prawne/prywatnosc/page.tsx
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
        <h1 className="text-3xl md:text-4xl font-bold">Polityka prywatności</h1>
        <p className="text-slate-300">
          Ten dokument wyjaśnia, jakie dane przetwarzamy w Serwisie edukacyjnym,
          w jakich celach, na jakiej podstawie oraz jakie masz prawa.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["admin", "1. Administrator danych"],
            ["zakres", "2. Zakres przetwarzanych danych"],
            ["cele", "3. Cele i podstawa prawna (RODO)"],
            ["cookies", "4. Cookies i podobne technologie"],
            ["odbiorcy", "5. Odbiorcy danych"],
            ["transfer", "6. Transfer poza EOG"],
            ["okres", "7. Okres przechowywania"],
            ["prawa", "8. Twoje prawa"],
            ["zgoda", "9. Cofnięcie zgody"],
            ["skarga", "10. Skarga do organu"],
            ["bezp", "11. Bezpieczeństwo"],
            ["auto", "12. Zautomatyzowane decyzje"],
            ["zmiany", "13. Zmiany polityki"],
            ["kontakt", "14. Kontakt"],
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

      {/* 1. Administrator */}
      <section className="space-y-3">
        <H2 id="admin">1. Administrator danych</H2>
        <p className="text-white/80">
          Administratorem Twoich danych osobowych jest właściciel Serwisu
          (dalej: „Administrator”). W sprawach prywatności skontaktuj się przez
          <Link href="/kontakt" className="underline"> formularz kontaktowy</Link>.
        </p>
      </section>

      {/* 2. Zakres */}
      <section className="space-y-3">
        <H2 id="zakres">2. Zakres przetwarzanych danych</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Dane konta: e-mail, login, hasło (zahashowane), data rejestracji.</li>
          <li>Dane użycia: logi serwera, identyfikatory urządzenia/przeglądarki, adres IP.</li>
          <li>Aktywność edukacyjna: postęp w kursach, wyniki quizów, wpisy na forum.</li>
          <li>Dobrowolne dane w formularzach (np. wiadomości do wsparcia).</li>
        </ul>
      </section>

      {/* 3. Cele i podstawa */}
      <section className="space-y-3">
        <H2 id="cele">3. Cele i podstawa prawna (RODO)</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <b>Świadczenie usług Serwisu</b> (logowanie, treści, forum) — art. 6 ust. 1 lit.{" "}
            <b>b</b> RODO (umowa) oraz <b>f</b> (prawnie uzasadniony interes: zapewnienie
            ciągłości działania i bezpieczeństwa).
          </li>
          <li>
            <b>Komunikacja</b> (odpowiedź na zapytania) — art. 6 ust. 1 lit.{" "}
            <b>f</b> RODO.
          </li>
          <li>
            <b>Analiza i statystyka</b> (jeśli włączona) — art. 6 ust. 1 lit.{" "}
            <b>a</b> RODO (zgoda).
          </li>
          <li>
            <b>Obowiązki prawne</b> (np. rozliczeniowe) — art. 6 ust. 1 lit.{" "}
            <b>c</b> RODO.
          </li>
        </ul>
      </section>

      {/* 4. Cookies */}
      <section className="space-y-3">
        <H2 id="cookies">4. Cookies i podobne technologie</H2>
        <p className="text-white/80">
          Cookies to małe pliki zapisywane na Twoim urządzeniu. Stosujemy je m.in. do
          utrzymania sesji użytkownika, preferencji interfejsu oraz — po wyrażeniu zgody —
          do analityki. Szczegóły znajdziesz w{" "}
          <Link href="/prawne/cookies" className="underline">
            Polityce cookies
          </Link>
          .
        </p>
      </section>

      {/* 5. Odbiorcy */}
      <section className="space-y-3">
        <H2 id="odbiorcy">5. Odbiorcy danych</H2>
        <p className="text-white/80">
          Dane mogą być powierzane dostawcom usług IT (hosting, e-mail, analityka —
          jeśli włączona) wyłącznie na podstawie umów powierzenia przetwarzania i
          w zakresie niezbędnym do świadczenia usług na rzecz Administratora.
        </p>
      </section>

      {/* 6. Transfer */}
      <section className="space-y-3">
        <H2 id="transfer">6. Transfer poza EOG</H2>
        <p className="text-white/80">
          Jeżeli usługodawca ma siedzibę poza EOG, transfer odbywa się wyłącznie przy
          zastosowaniu mechanizmów zgodnych z RODO (np. standardowe klauzule umowne).
        </p>
      </section>

      {/* 7. Okres */}
      <section className="space-y-3">
        <H2 id="okres">7. Okres przechowywania</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Dane konta — do czasu usunięcia konta lub zakończenia świadczenia usług.</li>
          <li>Dane analityczne (za zgodą) — do czasu wycofania zgody lub upływu okresów retencji narzędzia.</li>
          <li>Logi techniczne — zwykle do 90 dni (dla bezpieczeństwa i diagnostyki).</li>
        </ul>
      </section>

      {/* 8. Prawa */}
      <section className="space-y-3">
        <H2 id="prawa">8. Twoje prawa</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>dostęp do danych oraz kopia danych,</li>
          <li>sprostowanie danych,</li>
          <li>usunięcie („prawo do bycia zapomnianym”) — o ile przepisy na to pozwalają,</li>
          <li>ograniczenie przetwarzania,</li>
          <li>sprzeciw wobec przetwarzania (art. 21 RODO),</li>
          <li>przenoszenie danych (art. 20 RODO).</li>
        </ul>
      </section>

      {/* 9. Zgoda */}
      <section className="space-y-3">
        <H2 id="zgoda">9. Cofnięcie zgody</H2>
        <p className="text-white/80">
          Jeśli podstawą jest zgoda, możesz ją wycofać w dowolnym momencie — bez
          wpływu na zgodność z prawem przetwarzania sprzed cofnięcia.
        </p>
      </section>

      {/* 10. Skarga */}
      <section className="space-y-3">
        <H2 id="skarga">10. Skarga do organu</H2>
        <p className="text-white/80">
          Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (PUODO),
          ul. Stawki 2, 00-193 Warszawa.
        </p>
      </section>

      {/* 11. Bezpieczeństwo */}
      <section className="space-y-3">
        <H2 id="bezp">11. Bezpieczeństwo</H2>
        <p className="text-white/80">
          Stosujemy środki techniczne i organizacyjne adekwatne do ryzyka
          (m.in. szyfrowanie transmisji, kontrola dostępu, regularne aktualizacje).
        </p>
      </section>

      {/* 12. Zautomatyzowane decyzje */}
      <section className="space-y-3">
        <H2 id="auto">12. Zautomatyzowane decyzje</H2>
        <p className="text-white/80">
          Nie podejmujemy wobec Ciebie decyzji wyłącznie w sposób zautomatyzowany,
          które wywołują skutki prawne (brak profilowania o takim skutku).
        </p>
      </section>

      {/* 13. Zmiany */}
      <section className="space-y-3">
        <H2 id="zmiany">13. Zmiany polityki</H2>
        <p className="text-white/80">
          Polityka może być aktualizowana. Nowa wersja obowiązuje od dnia publikacji
          w Serwisie, chyba że wskazano inaczej.
        </p>
      </section>

      {/* 14. Kontakt */}
      <section className="space-y-3">
        <H2 id="kontakt">14. Kontakt</H2>
        <p className="text-white/80">
          W sprawach prywatności skontaktuj się przez
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
