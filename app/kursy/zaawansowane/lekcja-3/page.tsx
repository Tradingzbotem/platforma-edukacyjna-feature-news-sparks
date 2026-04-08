import LessonSectionPanel, { LessonInlineCallout } from "@/components/LessonSectionPanel";
import ZaawansowaneLessonShell from "@/components/ZaawansowaneLessonShell";

export default function Page() {
  return (
    <ZaawansowaneLessonShell
      lessonNumber={3}
      lessonSlug="lekcja-3"
      title="Statystyka wyników: rozkłady, drawdown, risk of ruin, Monte Carlo"
      minutes={22}
      prevSlug="lekcja-2"
      nextSlug="lekcja-4"
    >
      <LessonSectionPanel variant="content" title="Dlaczego „średnia wygrana” nie mówi Ci, jak się poczujesz jutro">
        <p>
          Wyniki w <em>R</em> rzadko układają się w ładny dzwonek. Bywa masa małych ruchów i rzadki grubas — albo odwrotnie.
        </p>
        <p>
          W praktyce wygląda to tak: średnia mówi „ogólnie jest OK”, a Ty w tym samym miesiącu przeżywasz serię, która wygląda jak koniec świata.
        </p>
        <p>
          Jeśli patrzysz tylko na średnią, <strong>nie widzisz ogonów</strong>. A ogon to często moment, w którym łamiesz plan — nie strategię.
        </p>
        <p>
          Dla tradera oznacza to: dokładasz medianę, kwartyle, percentyle. Nie tylko „średnio X”, ale „w połowie przypadków było gorzej niż Y”.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Drawdown — nie tylko liczba na wykresie">
        <p>
          <strong>Drawdown (DD)</strong> — prostym językiem: spadek od ostatniego szczytu kapitału do dołka, zanim wrócisz wyżej.
        </p>
        <p>
          <strong>Max DD</strong> to najgłębsza taka dziura w okresie. <strong>Time to recover</strong> — ile trwa droga z powrotem na szczyt.
        </p>
        <p>
          To nie znaczy, że płytki dołek jest łatwy.
        </p>
        <p>
          Długi, płytki spadek też męczy: presja, grzebanie przy planie, konflikt z życiem poza platformą.
        </p>
        <p>
          Operacyjnie DD znaczy jedno pytanie: przy tym spadku <strong>nadal grasz ten sam rozmiar i te same reguły</strong>, czy już zaczynasz kombinować?
        </p>
        <p>
          Najczęstszy błąd jest taki: 1R jest tak duży, że „normalny” DD z historii u Ciebie wygląda jak katastrofa. Matematyka się zgadza, Ty nie jesteś gotowy na tę ścieżkę.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="insight" title="Dobra strategia może mieć serię strat. To nie jest błąd — to jest cena wejścia">
        <p>
          Kilka strat z rzędu <strong>nie znaczy automatycznie</strong>, że edge zniknął. Przy niższym win-rate los często tak układa wyniki.
        </p>
        <p>
          Decyzja: <strong>łamałem plan, czy nie?</strong>
        </p>
        <p>
          Tak — to nie test strategii, tylko wykonanie. Nie — sprawdzasz, czy rynek nie rozszedł się z założeniami testu.
        </p>
        <LessonInlineCallout title="Prosty scenariusz">
          <p>
            Strategia z dodatnim EV może przez tydzień wyglądać jak porażka.
          </p>
          <p className="mt-3">
            Pytanie: czy ból mieści się w założeniach planu i czy dane do decyzji są aktualne?
          </p>
        </LessonInlineCallout>
        <LessonInlineCallout title="Seria strat — źle vs dobrze">
          <p>
            <strong>Źle:</strong> po czterech stopach wchodzisz „na pełnej pewności” w piąty, bo „rynek musi się odwrócić”. Rozmiar rośnie, filtry znikają — to już nie jest Twój backtest.
          </p>
          <p className="mt-3">
            <strong>Dobrze:</strong> po czterech stratach sprawdzasz checklistę: czy to były trade’y z planu, ten sam kontekst (sesja, spread, news), ten sam rozmiar? Jeśli tak — robisz przerwę albo obniżasz ryzyko <em>bez</em> zmiany reguł na kolanie.
          </p>
          <p className="mt-3">
            Dopiero potem decydujesz: kontynuacja z tym samym procesem, albo świadome „zamrażam handel do przeglądu weekendowego”. To nie panika — to zarządzanie procesem.
          </p>
        </LessonInlineCallout>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Risk of ruin — po ludzku: jak duże jest ryzyko gry w ruletkę z podkręconym stawianiem">
        <p>
          <strong>Risk of ruin (RoR)</strong> uprośćmy do jednego zdania: <strong>jak duże jest ryzyko, że odpadniesz z gry</strong> — bo kapitał, głowa albo zaufanie do planu się nie domkną.
        </p>
        <p>
          To nie jest wzór do wyśpiewania na pamięć. To trzy śruby: czy średnio zarabiasz na ryzyko, jak bardzo wyniki skaczą, i jak dużo ryzykujesz na jeden trade względem całości.
        </p>
        <p>
          W praktyce wygląda to tak: ta sama „przewaga”, ale dwa razy większy lot — nie tylko dwa razy szybszy wzrost w dobrym scenariuszu, ale też <strong>dużo ostrzejsze DD</strong> i częstsza pokusa łamania planu.
        </p>
        <p>
          Najczęstszy błąd jest taki: szukasz „lepszego sygnału”, zamiast zmniejszyć stawkę. Z 1% na trade na 0,5% często obcinasz RoR bardziej niż kosmetyka edge’u.
        </p>
        <p>
          Dla tradera oznacza to jedną decyzję: jeśli symulacje i historia mówią, że przy obecnym rozmiarze nie wytrzymasz — <strong>najpierw rozmiar</strong>, potem reszta.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Monte Carlo — po co, skoro backtest już ładnie wygląda?">
        <p>
          Backtest to <em>jedna</em> kolejność wyników — taka, jaka naprawdę padła w próbie. Życie nie musi ułożyć strat i wygranych w tej samej kolejności.
        </p>
        <p>
          <strong>Monte Carlo</strong> w wersji „na chłopski rozum”: bierzesz te same wyniki w R i <strong>tasujesz kolejność</strong> (albo losujesz z powtórzeniami) wiele razy. Patrzysz, jak wyglądałoby konto przy innych „układach pecha”.
        </p>
        <p>
          To nie przewidywanie jutra.
        </p>
        <p>
          Pytanie brzmi: jeśli pech ułoży te same trade’y inaczej — czy nadal trzymasz plan, czy już łamiesz?
        </p>
        <p>
          Odpalasz np. 1000 tasowań, dla każdego liczysz najgorszy DD. Patrzysz na <strong>dolny percentyl</strong> (np. 10% najgorszych ścieżek) — to „realny róg”, nie jedna ładna krzywa z backtestu.
        </p>
        <ul className="list-disc pl-6">
          <li>
            Jeśli 10. percentyl DD jest poza Twoją tolerancją — decyzja brzmi: mniejsze ryzyko na trade, mniej linii naraz, albo przerwa w module, dopóki nie przeprojektujesz procesu.
          </li>
          <li>
            Porównaj dwa rozmiary ryzyka: często jeden krok więcej agresji robi z DD coś, czego nie przeżyjesz operacyjnie — mimo że średnia z backtestu nadal ładna.
          </li>
        </ul>
      </LessonSectionPanel>

      <LessonSectionPanel variant="closing" title="Zadanie">
        <p>
          100 ostatnich wyników w R (z planu). 1000 prostych permutacji kolejności.
        </p>
        <p>
          Zanotuj medianę EV i <strong>10. percentyl najgorszego DD</strong>. Decyzja: czy przy tym rogu nadal handlujesz tym samym rozmiarem — tak/nie i dlaczego jednym zdaniem.
        </p>
        <p>
          Jeśli nie — zapisz konkretnie: co zmieniasz jutro w operacji (np. −0,2% ryzyka na R, lub −1 linia, lub przerwa do piątku), nie „poprawię mindset”.
        </p>
      </LessonSectionPanel>
    </ZaawansowaneLessonShell>
  );
}
