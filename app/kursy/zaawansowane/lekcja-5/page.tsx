import LessonSectionPanel, { LessonInlineCallout } from "@/components/LessonSectionPanel";
import ZaawansowaneLessonShell from "@/components/ZaawansowaneLessonShell";

export default function Page() {
  return (
    <ZaawansowaneLessonShell
      lessonNumber={5}
      lessonSlug="lekcja-5"
      title="Psychologia i operacyjka: rutyny, checklisty, dziennik, limity"
      minutes={20}
      prevSlug="lekcja-4"
    >
      <LessonSectionPanel variant="content" title="Rutyna przed sesją — żebyś nie handlował „na impulsie z newsa”">
        <p>
          Przed kliknięciem: <strong>kontekst</strong> (co dziś może ruszyć Twoje instrumenty), <strong>gotowość</strong> (plan na wierzchu), <strong>scenariusze</strong> (jeśli A → B — bez dopisywania w środku świecy).
        </p>
        <p>
          Kalendarz 5 min: nie po to, żeby trafić kierunek — żebyś nie wchodził wtedy, gdy spread i poślizg zjadają edge z planu.
        </p>
        <ul className="list-disc pl-6">
          <li>
            Makro: mniej „zaskoczenia” w momencie, gdy i tak jesteś zmęczony.
          </li>
          <li>
            1R skalowany do vol (ATR / zasięg tygodnia) — ten sam wzorzec nie zamienia się w inne ryzyko tylko dlatego, że rynek jest dziś szerszy.
          </li>
          <li>
            Sen, stres, rozproszenie, alkohol, kłótnia — źle: <strong>mniejszy size albo zero trade’ów</strong>. To warunek pracy, nie wymówka.
          </li>
        </ul>
      </LessonSectionPanel>

      <LessonSectionPanel variant="insight" title="Checklista to nie ozdoba monitora — to hamulec bezpieczeństwa">
        <p>
          Cel: <strong>mniej decyzji na adrenalince</strong>. 5–8 punktów tak/nie — dłuższa lista = omijasz.
        </p>
        <ul className="list-disc pl-6">
          <li>
            Setup z planu? Kontekst jak w teście? Spread i poślizg w zakresie z założeń?
          </li>
          <li>
            SL i TP <em>przed</em> kliknięciem? Bez tego to nie jest ten sam trade co w statystyce.
          </li>
          <li>
            Jedna linijka: dlaczego, co psuje tezę, jak prowadzisz. Brak w 20 s = często impuls, nie decyzja.
          </li>
        </ul>
        <LessonInlineCallout title="Revenge — przykład">
          <p>
            Dwie straty z planu, −1,2R. Wchodzisz trzeci: „scalp kontr-trend”, nie był na liście setupów, większy size — „żeby dzień wyzerować”.
          </p>
          <p className="mt-3">
            To revenge w przebraniu „adaptacji”. Checklista: <strong>brak kliknięcia</strong> albo ten sam setup co zawsze — trzecia opcji nie ma.
          </p>
        </LessonInlineCallout>
      </LessonSectionPanel>

      <LessonSectionPanel variant="insight" title="Limity — i dlaczego je obchodzimy dokładnie wtedy, gdy są najbardziej potrzebne">
        <p>
          Limit (np. −2R dziennie) = <strong>wyłącznik</strong>. Jak negocjujesz przy −1,8R — limitu nie ma.
        </p>
        <LessonInlineCallout title="Obchodzenie limitu — przykład">
          <p>
            Reguła: −2R koniec. Jesteś na −1,7R. Otwierasz „micro” 0,4R poza planem: „to nie liczy się do limitu, to tylko wyprostowanie”.
          </p>
          <p className="mt-3">
            Na koncie liczy się każdy tick. Decyzja: albo limit twardy (platforma / alarm / koniec sesji), albo przyznajesz, że nie masz limitu — tylko zdanie w notatniku.
          </p>
        </LessonInlineCallout>
        <ul className="list-disc pl-6">
          <li>
            2 straty z rzędu → przerwa / zamknięty laptop — zanim size i jakość decyzji się posypią.
          </li>
          <li>
            Ciągłe obchodzenie = zmiana procesu: blokada, druga osoba, przerwa — zanim kolejny setup.
          </li>
          <li>
            Wyjątki tylko z góry na papierze. Reszta = tilt.
          </li>
        </ul>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Dziennik bez kłamstw = nauka; dziennik „dla spokoju sumienia” = nic">
        <p>
          Pola: setup, kontekst, SL/TP, wynik w R, emocja (krótko), błąd/plus, jakość A/B/C.
        </p>
        <LessonInlineCallout title="Teoria po fakcie — przykład">
          <p>
            Strata −1R, checklista była OK. Wpis wieczorem: „słaby kontekst, nie powinienem wchodzić” — choć rano oznaczyłeś kontekst jako zgodny z planem.
          </p>
          <p className="mt-3">
            To dopisywanie narracji pod wynik, nie dane do poprawy. Rozróżnij: <strong>błąd planu</strong> vs <strong>błąd wykonania</strong> — jednym zdaniem, tego samego dnia.
          </p>
        </LessonInlineCallout>
        <p>
          Wygrałeś → „genialny setup”; przegrałeś → „zły rynek” — bez checklisty to nie feedback, tylko uspokajanie opowieścią.
        </p>
        <p>
          Raz w tygodniu: WR, AvgWin/AvgLoss, EV, netto R, max DD tygodnia + jedno „ograniczam” + jedno „testuję”.
        </p>
        <p>
          Raz w miesiącu: czy pięć linii to pięć kopii jednego ryzyka — i którą linię tniesz, zanim znowu wszystko padnie razem.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="closing" title="Ćwiczenia">
        <ol className="list-decimal pl-6">
          <li>
            Checklista (≤8 pkt) + limit dzienny w R przy monitorze. Tydzień: każdy trade 100% z listy? Nie → <strong>nie otwieram</strong> albo wpis „łamanie planu” osobno.
          </li>
          <li>
            Notatka/zrzut w {"<"}10 s po zamknięciu — inaczej historia z pamięci, nie z danych.
          </li>
          <li>
            2 tygodnie: stały slot 20 min, trzy liczby (EV, liczba łamań planu, średni koszt realizacji) + jedno konkretne „od jutra: …” — bez sloganów.
          </li>
        </ol>
      </LessonSectionPanel>
    </ZaawansowaneLessonShell>
  );
}
