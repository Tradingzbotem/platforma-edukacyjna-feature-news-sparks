// app/prawne/warunki/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function Page() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "en" ? "en" : "pl";
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
    ["zakres", "1. Zakres i akceptacja"],
    ["strona-umowy", "2. Strona umowy i Operator"],
    ["przedmiot", "3. Przedmiot serwisu i usługa cyfrowa"],
    ["charakter-tresci", "4. Charakter treści"],
    ["dostep-platnosci", "5. Dostęp, warianty, płatności i bonusy"],
    ["brak-gwarancji", "6. Brak gwarancji"],
    ["odpowiedzialnosc", "7. Odpowiedzialność"],
    ["reklamacje", "8. Reklamacje i zgodność z umową"],
    ["aktywacja", "9. Aktywacja dostępu"],
    ["publikacja-bonusow", "10. Funkcje dodatkowe i bonusy — informowanie"],
    ["definicje", "11. Definicje"],
    ["korzystanie", "12. Zasady korzystania"],
    ["wlasnosc", "13. Własność intelektualna"],
    ["dane", "14. Dane, konto i bezpieczeństwo"],
    ["ai-eksperymentalne", "15. Funkcje eksperymentalne i AI (Coach)"],
    ["rynkowe", "16. Dane rynkowe i opóźnienia"],
    ["zewnetrzne", "17. Treści zewnętrzne i linki"],
    ["zmiany-dostepow", "18. Zmiany dostępów i bonusów"],
    ["nft-platnosci", "19. NFT i szczegóły dostępu"],
    ["zmiany-dokumentu", "20. Zmiany regulaminu"],
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
        <h1 className="text-3xl md:text-4xl font-bold">Regulamin serwisu</h1>
        <p className="text-slate-300">
          Warunki korzystania z serwisu (dalej: „Serwis”) prowadzonego w ramach projektu
          edukacyjno-narzędziowego. Korzystając z Serwisu, akceptujesz poniższe postanowienia.
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
        <H2 id="zakres">1. Zakres i akceptacja</H2>
        <p className="text-white/80 font-medium">{t(lang as any, "compliance_disclaimer")}</p>
        <p className="text-white/80">
          Warunki mają zastosowanie do każdego, kto odwiedza Serwis lub z niego korzysta.
          Rozpoczęcie korzystania oznacza akceptację Regulaminu. Jeśli się z nim nie
          zgadzasz — nie korzystaj z Serwisu.
        </p>
        <p className="text-white/80">
          Serwis nie jest biurem maklerskim, domem maklerskim ani firmą inwestycyjną i nie
          świadczy usług doradztwa inwestycyjnego ani pośrednictwa w obrocie instrumentami
          finansowymi.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="strona-umowy">2. Strona umowy i Operator</H2>
        <p className="text-white/80">
          Umowa o świadczenie <strong>usługi cyfrowej</strong> zawierana jest między Tobą a podmiotem
          będącym jej stroną (dalej: „Operator”). Dane identyfikujące Operatora — w tym dane
          niezbędne do rozliczeń — podawane są najpóźniej w toku składania zamówienia oraz na
          potwierdzeniu zamówienia albo płatności.{" "}
          <Link href="/kontakt" className="underline">
            Formularz kontaktowy
          </Link>{" "}
          może dodatkowo służyć potwierdzeniu tożsamości Operatora na Twoje żądanie, lecz nie
          zastępuje informacji przekazywanych przy zamówieniu i rozliczeniu.
        </p>
        <p className="text-white/80">
          Nazwy handlowe używane w Serwisie (np. FXEDULAB, FX EduLab) służą identyfikacji
          projektu lub produktu — bez ustalania z mocy samego Regulaminu, że którakolwiek z
          nich jest osobą prawną będącą stroną umowy, chyba że wynika to z dokumentu
          potwierdzającego zakup.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="przedmiot">3. Przedmiot serwisu i usługa cyfrowa</H2>
        <p className="text-white/80">
          Przedmiotem świadczenia jest <strong>usługa cyfrowa</strong> polegająca na udostępnianiu
          funkcji Serwisu drogą elektroniczną — w zakresie wynikającym z opłaconego wariantu
          dostępu. Obejmuje to w szczególności:
        </p>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>dostęp do modułów, paneli i narzędzi analityczno-edukacyjnych,</li>
          <li>korzystanie z materiałów edukacyjnych, briefów, scenariuszy i checklist,</li>
          <li>funkcje pomocnicze (np. Coach AI) w zakresie opisanym w Serwisie,</li>
          <li>ewentualne bonusy czasowe lub rozszerzenia wymienione przy danym wariancie.</li>
        </ul>
        <p className="text-white/80">
          Treści mają charakter <strong>edukacyjny i informacyjny</strong>. Serwis nie świadczy
          doradztwa inwestycyjnego dopasowanego do indywidualnej sytuacji użytkownika.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="charakter-tresci">4. Charakter treści</H2>
        <p className="text-white/80">
          Briefy, scenariusze, analizy, komentarze, treści generowane przez AI oraz pozostałe
          materiały <strong>nie są rekomendacjami inwestycyjnymi</strong>, sygnałami transakcyjnymi ani
          gotową instrukcją zawarcia konkretnej transakcji.
        </p>
        <p className="text-white/80">
          Nie traktuj ich jak porady dopasowanej do Twojej indywidualnej sytuacji — takiej
          usługi Serwis w standardowym modelu nie świadczy.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="dostep-platnosci">5. Dostęp, warianty, płatności i bonusy</H2>
        <p className="text-white/80">
          Użytkownik uzyskuje <strong>czasowy lub inaczej określony w opisie wariantu</strong> dostęp do
          wybranych funkcji — w zamian za opłatę (np. przy zakupie licencji powiązanej z NFT,
          zgodnie z{" "}
          <Link href="/prawne/nft" className="underline">
            regulaminem NFT
          </Link>
          ).
        </p>
        <p className="text-white/80">
          <strong>Warianty dostępu</strong> mogą różnić się zakresem modułów, poziomem wsparcia
          projektu lub dodatkami. <strong>Bonusy czasowe</strong> (np. wcześniejszy dostęp, tymczasowe
          rozszerzenia, promocyjne okresy) mają zasięg i termin wskazany przy zamówieniu lub w
          opisie funkcji — po ich upływie wraca układ podstawowy wariantu, o ile nie
          przedłużono bonusu w sposób wyraźny.
        </p>
        <p className="text-white/80">
          Część opłaty może mieć charakter <strong>wsparcia rozwoju projektu</strong>, bez nabycia udziału,
          instrumentu finansowego ani prawa do zysków Operatora.
        </p>
        <p className="text-white/80">
          <strong>Zakup nie jest</strong> lokatą, inwestycją kapitałową w projekt, produktem
          inwestycyjnym ani usługą zarządzania Twoim kapitałem. Nie prowadzimy rachunku
          inwestycyjnego ani zleceń w Twoim imieniu.
        </p>
        <p className="text-white/80">
          Szczegóły:{" "}
          <Link href="/cennik" className="underline">
            cennik
          </Link>
          ,{" "}
          <Link href="/prawne/zwroty-odstapienie" className="underline">
            zwroty i odstąpienie
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="brak-gwarancji">6. Brak gwarancji</H2>
        <p className="text-white/80">Serwis nie gwarantuje:</p>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>rezultatu finansowego po skorzystaniu z materiałów,</li>
          <li>skuteczności analiz, scenariuszy ani narzędzi,</li>
          <li>że treści będą w pełni aktualne, kompletne lub wolne od błędów.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="odpowiedzialnosc">7. Odpowiedzialność</H2>
        <p className="text-white/80">
          Użytkownik <strong>sam interpretuje</strong> materiały i <strong>sam podejmuje decyzje</strong> dotyczące
          rynku, instrumentów lub kapitału.
        </p>
        <p className="text-white/80">
          <strong>Operator oraz zespół projektu nie odpowiadają</strong> za skutki decyzji
          inwestycyjnych lub transakcyjnych podjętych przez użytkownika na podstawie treści
          Serwisu — w granicach dopuszczalnych przez prawo.
        </p>
        <p className="text-white/80">
          Staramy się utrzymać Serwis w ruchu, lecz nie odpowiadamy za przerwy techniczne,
          działanie sieci blockchain ani błędy podmiotów trzecich. Odpowiedzialność za
          szkody pośrednie (np. utracone korzyści) jest wyłączona <strong>tylko w zakresie</strong>, w
          jakim taki wyłącznik jest skuteczny wobec Ciebie jako konsumenta — przepisy
          bezwzględnie obowiązujące mają pierwszeństwo.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="reklamacje">8. Reklamacje i zgodność z umową</H2>
        <p className="text-white/80">
          Jeśli opłacona <strong>usługa cyfrowa</strong> nie działa zgodnie z opisem wariantu (np. brak
          dostępu do modułów objętych umową, powtarzające się błędy uniemożliwiające
          korzystanie), zgłoś to przez{" "}
          <Link href="/kontakt" className="underline">
            formularz kontaktowy
          </Link>
          , podając e-mail konta, opis problemu oraz — jeśli masz — identyfikator zamówienia lub
          transakcji.
        </p>
        <p className="text-white/80">
          Odpowiedź na reklamację udzielamy co do zasady w terminie do 14 dni od otrzymania
          kompletnego zgłoszenia. Jeśli sprawa wymaga dłuższej weryfikacji (np. weryfikacja
          blockchain), powiadomimy o przyczynie oraz o przewidywanym terminie dalszego
          rozpatrzenia.
        </p>
        <p className="text-white/80">
          Przysługujące Ci uprawnienia z tytułu niezgodności usługi z umową wynikają z
          obowiązujących przepisów — w szczególności, gdy jesteś konsumentem.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="aktywacja">9. Aktywacja dostępu</H2>
        <p className="text-white/80">
          Dostęp do opłaconych funkcji jest <strong>aktywowany po weryfikacji płatności</strong> przez
          Operatora. Przy ścieżce NFT obowiązują dodatkowe kroki techniczne (np. weryfikacja
          tokena) opisane w{" "}
          <Link href="/prawne/nft" className="underline">
            regulaminie NFT
          </Link>
          .
        </p>
        <p className="text-white/80">
          Aktywacja następuje zwykle w terminie wskazanym przy zamówieniu; jeśli go nie
          wskazano — bez zbędnej zwłoki po skutecznej weryfikacji płatności (przy ścieżkach
          wymagających dodatkowych kroków — po ich zakończeniu zgodnie z opisem procesu).
        </p>
        <p className="text-white/80">
          Podajesz poprawne dane (konto, adres portfela, identyfikatory), które są potrzebne
          do przypisania uprawnień — błąd po Twojej stronie może opóźnić aktywację do czasu
          jego skorygowania.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="publikacja-bonusow">10. Funkcje dodatkowe i bonusy — informowanie</H2>
        <p className="text-white/80">
          O planowanych <strong>funkcjach dodatkowych</strong>, <strong>bonusach czasowych</strong> i większych zmianach w
          module informujemy w Serwisie (m.in.{" "}
          <Link href="/cennik" className="underline">
            cennik
          </Link>
          , panel, strona zamówienia), tak aby przed zakupem można było poznać istotne elementy
          oferty.
        </p>
        <p className="text-white/80">
          Elementy wyraźnie oznaczone jako tymczasowe nie wchodzą do minimalnego trwałego
          zakresu po zakończeniu okresu bonusu — chyba że z opisu wynika inaczej. Zasady
          trwałych zmian zakresu dostępu określa także pkt 18.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="definicje">11. Definicje</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>
            <b>Serwis</b> – witryna i powiązane funkcje (m.in. kursy, quizy, moduły, panel, czat AI).
          </li>
          <li>
            <b>Użytkownik</b> – osoba odwiedzająca lub korzystająca z Serwisu.
          </li>
          <li>
            <b>Treści</b> – materiały edukacyjne, briefy, scenariusze, wpisy, pliki, dane w modułach.
          </li>
          <li>
            <b>Founders NFT</b> – token NFT oferowany w ramach projektu jako nośnik niewyłącznej
            licencji na dostęp, zgodnie z{" "}
            <Link href="/prawne/nft" className="underline">
              Regulaminem sprzedaży NFT
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="korzystanie">12. Zasady korzystania</H2>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Zakazane jest publikowanie treści bezprawnych lub naruszających prawa osób trzecich.</li>
          <li>Na forum obowiązują zasady kulturalnej dyskusji, jeśli z forum korzystasz.</li>
          <li>
            Nie wolno wymuszać na AI treści w rodzaju sygnałów „kup/sprzedaj” ani obchodzić
            zasad edukacyjnego charakteru funkcji.
          </li>
          <li>Możemy chwilowo ograniczyć dostęp z powodów technicznych (np. konserwacja).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <H2 id="wlasnosc">13. Własność intelektualna</H2>
        <p className="text-white/80">
          Układ Serwisu, teksty, grafika i kod są chronione. Użytkownik otrzymuje licencję na
          korzystanie z Treści w zakresie wynikającym z Regulaminu i opłaconego dostępu —
          bez prawa do odsprzedaży materiałów, o ile nie uzgodniono inaczej.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="dane">14. Dane, konto i bezpieczeństwo</H2>
        <p className="text-white/80">
          Zasady przetwarzania danych:{" "}
          <Link href="/prawne/polityka-prywatnosci" className="underline">
            Polityka prywatności
          </Link>
          . Dbaj o poufność logowania; działania na koncie są przypisywane do użytkownika konta.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="ai-eksperymentalne">15. Funkcje eksperymentalne i AI (Coach)</H2>
        <p className="text-white/80">
          Część funkcji może być <strong>rozwijana, testowana lub udostępniana czasowo</strong> (beta,
          podgląd). Zachowanie może się zmieniać, o ile nie narusza to minimalnego zakresu z
          pkt 18.
        </p>
        <p className="text-white/80">
          Odpowiedzi AI mogą być uproszczone, niepełne lub błędne; mają charakter edukacyjny —
          nie są rekomendacjami inwestycyjnymi. Prompty mogą trafić do zewnętrznego dostawcy
          modelu — szczegóły w{" "}
          <Link href="/prawne/polityka-prywatnosci" className="underline">
            Polityce prywatności
          </Link>
          .
        </p>
        <p className="text-white/80">
          Weryfikuj informacje samodzielnie przed decyzjami finansowymi.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="rynkowe">16. Dane rynkowe i opóźnienia</H2>
        <p className="text-white/80">
          Moduły mogą pokazywać notowania z zewnętrznych źródeł. Dane mogą być opóźnione lub
          niekompletne — wyłącznie jako materiał edukacyjny, nie jako podstawa zleceń przez
          Serwis.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zewnetrzne">17. Treści zewnętrzne i linki</H2>
        <p className="text-white/80">
          Linki do serwisów trzecich służą informacji — za ich treść odpowiadają ich właściciele.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zmiany-dostepow">18. Zmiany dostępów i bonusów</H2>
        <p className="text-white/80">
          W miarę rozwoju projektu mogą się zmieniać bonusy, funkcje dodatkowe i zakres przy
          poszczególnych poziomach — by dodać wartość lub utrzymać serwis.
        </p>
        <p className="text-white/80">
          Zmiany <strong>nie mogą</strong> — w sposób sprzeczny z uczciwym opisem{" "}
          <strong>aktywnego wariantu</strong> z chwili zakupu — zabierać Ci{" "}
          <strong>minimalnego zakresu dostępu</strong> wynikającego z tego opisu. W razie wątpliwości
          pierwszeństwo ma opis oferty z chwili zakupu oraz regulamin szczegółowy dotyczący danej
          ścieżki (np. NFT); niniejszy Regulamin stosuje się pomocniczo w zakresie nieuregulowanym w
          tych dokumentach.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="nft-platnosci">19. NFT i szczegóły dostępu</H2>
        <p className="text-white/80">
          Ścieżka Founders NFT:{" "}
          <Link href="/prawne/nft" className="underline">
            Regulamin sprzedaży Founders NFT i licencji dostępu
          </Link>
          . NFT w tym modelu nie jest instrumentem finansowym ani udziałem w spółce.
        </p>
        <p className="text-white/80">
          Nie oferujemy standardowej miesięcznej subskrypcji za dostęp — chyba że w przyszłości
          pojawi się odrębny, wyraźnie opisany produkt.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="zmiany-dokumentu">20. Zmiany regulaminu</H2>
        <p className="text-white/80">
          Możemy zaktualizować Regulamin. Nowe brzmienie obowiązuje od publikacji, o ile nie
          wskazano innej daty. Zmiany nie mogą naruszać praw nabytych użytkownika wynikających z
          aktywnego opłaconego dostępu — chyba że zmiana wynika wyłącznie z przepisów prawa albo jest
          dla użytkownika korzystniejsza. Korzystanie po zmianie oznacza akceptację tekstu, z
          zastrzeżeniem powyższego oraz praw konsumenta wynikających z przepisów bezwzględnie
          obowiązujących.
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
