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
      <nav className="flex items-center gap-2 flex-wrap">
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
        <h1 className="text-3xl md:text-4xl font-bold">Regulamin sprzedaży Founders NFT i licencji dostępu</h1>
        <p className="text-slate-300">
          Zasady nabycia tokenu NFT powiązanego z niewyłączną licencją na korzystanie z narzędzi i materiałów
          edukacyjnych platformy FXEDULAB.
        </p>
        <Updated />
      </header>

      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["przedmiot", "1. Przedmiot i charakter NFT"],
            ["cena", "2. Cena i sposób zapłaty"],
            ["licencja", "3. Licencja na dostęp"],
            ["portfel", "4. Portfel, weryfikacja i konto"],
            ["wtor", "5. Odsprzedaż i rynek wtórny"],
            ["odpowiedzialnosc", "6. Ograniczenia i wyłączenia"],
            ["zmiany", "7. Zmiany zakresu Serwisu"],
            ["reklamacje", "8. Reklamacje"],
            ["postanowienia", "9. Postanowienia końcowe"],
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

      <section className="space-y-3">
        <H2 id="przedmiot">1. Przedmiot i charakter NFT</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <strong>Founders NFT</strong> to unikalny token w rozproszonej księdze (blockchain), oferowany przez
            operatora Serwisu jako nośnik uprawnień do korzystania z wybranych funkcji FXEDULAB zgodnie z niniejszym
            regulaminem.
          </li>
          <li>
            NFT <strong>nie stanowi</strong> instrumentu finansowego, udziału w spółce, obligacji ani prawa do
            udziału w zyskach. Nie jest rekomendacją inwestycyjną.
          </li>
          <li>
            Nabywca uzyskuje ograniczoną licencję dostępu do treści i narzędzi (dalej: <strong>licencja</strong>),
            a nie własność intelektualną materiałów Serwisu.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="cena">2. Cena i sposób zapłaty</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            Aktualna cena referencyjna i warunki promocji publikowane są na stronie Serwisu (m.in.{" "}
            <Link href="/" className="underline">
              strona główna
            </Link>
            ,{" "}
            <Link href="/cennik" className="underline">
              cennik
            </Link>
            ). Ostateczna kwota może zależeć od kursu krypto i prowizji sieci w momencie transakcji.
          </li>
          <li>
            Płatność może być realizowana w walutach cyfrowych (np. BTC, ETH, USDT) według instrukcji przy składaniu
            zamówienia. Operator może współpracować z podmiotami trzecimi przy obsłudze płatności i mintowaniu NFT.
          </li>
          <li>
            Zaksięgowanie płatności i przekazanie NFT na wskazany portfel uznaje się za wykonanie świadczenia
            związanego ze sprzedażą nośnika uprawnień. Szczegóły prawa odstąpienia i zwrotów:{" "}
            <Link href="/prawne/zwroty-odstapienie" className="underline">
              Zwroty i odstąpienie
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="licencja">3. Licencja na dostęp</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            Posiadanie Founders NFT w portfelu powiązanym z kontem użytkownika uprawnia do korzystania z funkcji
            FXEDULAB w zakresie określonym przy sprzedaży (pełny dostęp edukacyjny, o ile nie wskazano inaczej).
          </li>
          <li>
            Licencja jest <strong>niewyłączna</strong>, <strong>niezbywalna</strong> odrębnie od NFT — przeniesienie
            uprawnień następuje wraz z przeniesieniem własności tokena na blockchainie, zgodnie z zasadami sieci.
          </li>
          <li>
            Zabronione jest udostępnianie konta osobom trzecim w celu ominięcia modelu licencyjnego, automatyczne
            zrzuty treści na skalę przekraczającą zwykłe użytkowanie oraz działania naruszające bezpieczeństwo Serwisu.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="portfel">4. Portfel, weryfikacja i konto</H2>
        <p className="text-white/80">
          Użytkownik odpowiada za poprawność adresu portfela i zabezpieczenie kluczy. Operator nie ponosi
          odpowiedzialności za utratę dostępu do portfela po stronie użytkownika. Weryfikacja własności NFT może
          odbywać się przez podpis wiadomości, integrację portfela lub inne metody wskazane w Serwisie.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="wtor">5. Odsprzedaż i rynek wtórny</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            Możesz spróbować odsprzedać NFT na rynku wtórnym; powiązany dostęp do Serwisu przechodzi na nabywcę
            tokena po poprawnej weryfikacji po jego stronie.
          </li>
          <li>
            Operator <strong>nie gwarantuje</strong> płynności rynku wtórnego, czasu znalezienia nabywcy ani ceny
            odsprzedaży. Operator nie prowadzi obowiązkowego skupu NFT od użytkowników.
          </li>
          <li>
            Transakcje na rynku wtórnym zawierasz z kontrahentami na własne ryzyko; mogą obowiązywać odrębne opłaty
            sieci i platform giełdowych.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="odpowiedzialnosc">6. Ograniczenia i wyłączenia</H2>
        <p className="text-white/80">
          Serwis ma charakter edukacyjny — zob.{" "}
          <Link href="/prawne/disclaimery" className="underline">
            Disclaimery rynkowe
          </Link>
          . W przypadku naruszenia Regulaminu lub podejrzenia oszustwa operator może odmówić lub cofnąć dostęp
          powiązany z kontem, z zachowaniem przepisów bezwzględnie obowiązujących.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zmiany">7. Zmiany zakresu Serwisu</H2>
        <p className="text-white/80">
          Operator może rozwijać lub modyfikować funkcje Serwisu, pod warunkiem że Founders NFT nadal realizuje swoją
          podstawową funkcję dostępu edukacyjnego. O istotnych ograniczeniach poinformujemy z wyprzedzeniem w
          uzasadnionym terminie, o ile przepisy nie stanowią inaczej.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="reklamacje">8. Reklamacje</H2>
        <p className="text-white/80">
          Zgłoszenia dotyczące zakupu NFT, przypisania licencji lub działania Serwisu kieruj przez{" "}
          <Link href="/kontakt" className="underline">
            formularz kontaktowy
          </Link>
          , podając identyfikator transakcji lub adres portfela (w bezpieczny sposób).
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="postanowienia">9. Postanowienia końcowe</H2>
        <p className="text-white/80">
          Niniejszy regulamin uzupełnia{" "}
          <Link href="/prawne/warunki" className="underline">
            Warunki korzystania
          </Link>
          . W sprawach nieuregulowanych zastosowanie mają Warunki oraz przepisy prawa polskiego w zakresie
          stosownym do umowy z konsumentem.
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
