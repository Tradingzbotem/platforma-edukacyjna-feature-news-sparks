import LessonSectionPanel, { LessonInlineCallout } from "@/components/LessonSectionPanel";
import ZaawansowaneLessonShell from "@/components/ZaawansowaneLessonShell";

export default function Page() {
  return (
    <ZaawansowaneLessonShell
      lessonNumber={2}
      lessonSlug="lekcja-2"
      title="Backtest: OOS, walk-forward, unikanie przecieku (leakage)"
      minutes={22}
      prevSlug="lekcja-1"
      nextSlug="lekcja-3"
    >
      <LessonSectionPanel variant="insight" title="Dobra krzywa na wykresie backtestu może być selfie z filtrami">
        <p>
          <strong>Backtest</strong> to odtworzenie Twoich reguł na przeszłych cenach. Czyli: „gdybym wtedy klikał tak jak dziś piszę w planie — co by wyszło?”.
        </p>
        <p>
          Pułapka: test, który <em>podpowiada przyszłość</em>. Albo parametry dopasowane tylko do <em>tego</em> kawałka historii.
        </p>
        <p>
          Raport: genialna krzywa. Konto: nie pasuje — bo oceniałeś bajkę, nie warunki realnego klikania.
        </p>
        <p>
          <strong>OOS (out-of-sample)</strong> — prostym językiem: wycinasz kawałek czasu, którego nie dotykasz przy strojeniu. Potem sprawdzasz, czy zamrożone reguły jeszcze żyją.
        </p>
        <p>
          To nie znaczy, że OOS musi być identyczne jak „część treningowa”. Znaczy, że nie masz prawa tam podglądać przy wyborze liczb — inaczej oszukujesz sam siebie.
        </p>
        <p>
          <strong>Walk-forward</strong> to to samo w ruchu: uczysz się na jednym oknie, testujesz na następnym, przesuwasz czas — kilka razy.
        </p>
        <p>
          Dla tradera oznacza to jedną rzecz: czy edge jest powtarzalny, czy był jednorazowym trafem w dane.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Minimalny workflow, który naprawdę chroni przed samooszustwem">
        <p>
          Szkielet anty-iluzji — krótki, powtarzalny, nie praca dyplomowa.
        </p>
        <ol className="list-decimal pl-6">
          <li>
            <strong>Podziel dane w czasie</strong> (np. 70% pod strojenie / 30% „na kłódkę”). Chronologicznie — bez losowania świec.
            W praktyce: żadna decyzja o parametrach nie może sięgać do zamkniętej części.
          </li>
          <li>
            <strong>Stroisz tylko na IN</strong>, <strong>zamrażasz</strong>, dopiero potem patrzysz na OOS.
            Najczęstszy błąd wygląda tak: „zajrzałem do OOS, wróciłem, podkręciłem jeden parametr”. Właśnie zabiłeś sens testu.
          </li>
          <li>
            Jeśli OOS jest w miarę żywe (nie musi być kopia IN, ale nie może być rozpacz), dorzuć <strong>prosty walk-forward</strong> — 3–5 przesunięć.
            Szukasz spójności, nie perfekcji w każdym okienku.
          </li>
        </ol>
        <p className="mt-4">
          Czyli prostym językiem: najpierw uczciwie trzymasz ręce z dala od „egzaminu”, potem dopiero go zdajesz.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="insight" title="Jak nie oszukać samego siebie: trzy klasyki">
        <p>
          <strong>1) Za dużo śrubek naraz.</strong> Okres, godziny, SL, TP, filtry — im więcej dźwigni, tym łatwiej trafić w szczelinę, która działała tylko na tej próbce.
        </p>
        <p>
          Dla Ciebie: mniej śrub albo reguła, którą obronisz jednym zdaniem bez arkusza.
        </p>
        <p>
          <strong>2) Patrzenie w przyszłość (look-ahead, leakage).</strong> Model „widzi” dane, których w realu nie było jeszcze przy decyzji — np. skala max/min z całej historii, złe czasy świec, fundamentalne serie w złym momencie.
        </p>
        <p>
          Jeśli krzywa jest podejrzanio gładka — nie zakładaj od razu geniuszu. Sprawdź, czy symulacja nie zna jutra.
        </p>
        <p>
          <strong>3) Brak kosztów albo zbyt słodki spread.</strong> Ignorowanie spreadu, prowizji i typowego poślizgu to jak liczenie zysku sklepu bez czynszu.
        </p>
        <p>
          Dla tradera oznacza to: raport mówi „tak”, a konto pyta „gdzie są pieniądze?”.
        </p>
        <LessonInlineCallout title="Mini-scenariusz">
          <p>
            Strategia na „gołej” cenie wygląda jak Ferrari. Dokładasz realny spread i poślizg — połowa „edge” znika.
          </p>
          <p className="mt-3">
            To nie znaczy, że pomysł jest śmieciowy. Znaczy, że wcześniej oceniałeś bajkę, nie rachunek.
          </p>
        </LessonInlineCallout>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Jak czytać stabilność bez pracy naukowej o 40 stronach">
        <p>
          Nie potrzebujesz grubego PDF-a. Potrzebujesz trzech pytań.
        </p>
        <ul className="list-disc pl-6">
          <li>
            IN vs OOS: czy OOS jest „gorsze, ale żywe”, czy rozpada się w proch? To drugie zwykle znaczy: sztuczka na próbie, nie mechanika rynku.
          </li>
          <li>
            Jeśli zmiana parametru o 5–10% zabija wynik — strategia jest krucha. W realu i tak zmieni się kontekst; chcesz zapasu, nie szkła.
          </li>
          <li>
            Walk-forward: szukasz powtarzalności. Jedno szczęśliwe okno = loteria, nie dowód.
          </li>
        </ul>
        <p className="mt-4">
          Najczęstszy błąd wygląda tak: szukasz identycznych liczb zamiast sensownego zachowania. Lepiej lekki spadek metryk przy żywym OOS niż kopia 1:1 z podejrzaną historią.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="closing" title="Ćwiczenie">
        <p>
          Backtest na 100–200 sygnałach z planu (nawet w arkuszu). Jedno cięcie OOS. Prosty walk-forward na 3 oknach.
        </p>
        <p>
          Zapisz: (1) prosty bilans R lub EV na IN vs OOS, (2) jedną rzecz, która mogła być leakage, (3) trzy hipotezy różnic OOS — <strong>co najmniej jedna</strong> o kosztach lub wykonaniu, nie o „złym rynku”.
        </p>
      </LessonSectionPanel>
    </ZaawansowaneLessonShell>
  );
}
