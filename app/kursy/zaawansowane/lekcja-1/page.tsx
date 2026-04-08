import LessonSectionPanel, { LessonInlineCallout } from "@/components/LessonSectionPanel";
import ZaawansowaneLessonShell from "@/components/ZaawansowaneLessonShell";

export default function Page() {
  return (
    <ZaawansowaneLessonShell
      lessonNumber={1}
      lessonSlug="lekcja-1"
      title="Edge i wartość oczekiwana (EV) — jak liczyć i utrzymać przewagę"
      minutes={22}
      nextSlug="lekcja-2"
    >
      <LessonSectionPanel variant="insight" title="Po co Ci EV, skoro i tak widzisz wykres?">
        <p>
          Wielu traderów myśli: „mam 60% skuteczności, więc jestem na plusie”. W praktyce <strong>win-rate (WR)</strong> to tylko jedna dźwignia.
        </p>
        <p>
          Druga to: <em>ile</em> zwykle zarabiasz przy wygranej i <em>ile</em> tracisz przy przegranej — w jednostkach ryzyka, nie w „pipsach z dnia”.
        </p>
        <p>
          <strong>EV (expectancy, wartość oczekiwana)</strong> — średnio na jedno zagranie <em>z planu</em>: ile wychodzi w <em>R</em> po kosztach?
        </p>
        <p>
          Dodatnie EV = masz <strong>edge</strong>. To nie obietnica zielonego dnia jutro — tylko informacja, co robi się z kontem przy wielu powtórzeniach tego samego procesu.
        </p>
        <p>
          Teoria vs konto: wykres i narracja mogą wyglądać świetnie, a EV być słabe lub ujemne — wtedy masz ładny obrazek, nie rachunek.
        </p>
        <p>
          Cel: ostrzeżenie w liczbach zanim konto je wypunktuje.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="R, EV i edge — minimum, które naprawdę musisz rozumieć">
        <p>
          <strong>1R</strong> to stałe ryzyko na jedną transakcję jako ułamek kapitału (np. 0,5% lub 1%). Czyli: „ten trade kosztował mnie 1R”, „ten dał +2,1R” — porównujesz jabłka z jabłkami.
        </p>
        <p>
          <strong>EV w R</strong> to bilans wygranych i przegranych w jednostkach R, uśredniony po wielu trade’ach z planu.
        </p>
        <p>
          Wzór pomocniczy (narzędzie, nie dogmat): <code>WR × AvgWin − (1 − WR) × AvgLoss</code>.
          <em>AvgWin</em> / <em>AvgLoss</em> to typowa wygrana i strata w R (np. średnia z ostatnich transakcji wykonanych według reguł).
        </p>
        <p>
          <strong>Edge</strong> to dodatnie EV <em>po</em> spreadzie, prowizji, typowym poślizgu i po tym, jak naprawdę klikasz — nie po idealnym backteście.
        </p>
        <p>
          Plan vs wykonanie: ten sam sygnał w testerze i przy emocjach to często dwa różne EV.
        </p>
        <LessonInlineCallout title="Przykład liczbowy (ten sam „wzór”, inna historia)">
          <p>
            <strong>A)</strong> WR 55%, średnia wygrana 0,9R, średnia strata 1R → EV ≈ <strong>0,045R</strong> na trade.
          </p>
          <p className="mt-3">
            Na koncie: wygląda jak przewaga, a realizacja i koszty robią z tego płytki plus albo minus. Wysoki WR ukrywa słaby payoff.
          </p>
          <p className="mt-3">
            <strong>B)</strong> WR 38%, średnia wygrana 2,4R, strata 1R → EV ≈ <strong>0,292R</strong>.
          </p>
          <p className="mt-3">
            To nie znaczy, że strategia jest zła — znaczy, że psychika musi znosić serie strat, a matematyka bywa lepsza niż przy wariantach „ładnych procentowo”.
          </p>
          <p className="mt-3">
            <strong>C)</strong> WR 43%, AvgWin 2,2R, AvgLoss 1,0R → <strong>0,376R</strong>/trade. Sensowny punkt odniesienia — dopóki w realu nie rozdmuchasz AvgLoss przez ruch SL.
          </p>
        </LessonInlineCallout>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Co się zmienia, gdy lekko ruszysz jedną dźwignię?">
        <p>
          Najczęstszy błąd wygląda tak: polujesz na +2–3 pkt procentowe WR, a w praktyce <strong>AvgLoss i AvgWin robią różnicę</strong>.
        </p>
        <p>
          „Tylko” +0,1R do średniej straty potrafi zjeść więcej niż kosmetyczna poprawa WR.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2 pr-4">WR</th>
                <th className="py-2 pr-4">AvgWin</th>
                <th className="py-2 pr-4">AvgLoss</th>
                <th className="py-2 pr-4">EV (R)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { wr: 0.4, aw: 2.0, al: 1.0 },
                { wr: 0.45, aw: 2.0, al: 1.0 },
                { wr: 0.4, aw: 2.2, al: 1.0 },
                { wr: 0.43, aw: 2.2, al: 1.1 },
              ].map((r) => {
                const ev = r.wr * r.aw - (1 - r.wr) * r.al;
                return (
                  <tr key={`${r.wr}-${r.aw}-${r.al}`} className="border-t border-white/10">
                    <td className="py-2 pr-4">{Math.round(r.wr * 100)}%</td>
                    <td className="py-2 pr-4">{r.aw.toFixed(2)}R</td>
                    <td className="py-2 pr-4">{r.al.toFixed(2)}R</td>
                    <td className="py-2 pr-4">{ev.toFixed(3)}R</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Dla tradera oznacza to jedną rzecz: zanim dotkniesz filtrów „pod WR”, policz, co dzieje się ze średnią wygraną i stratą.
        </p>
        <p>
          Jeśli widzisz wyższy win-rate, <strong>nie zakładaj od razu</strong>, że EV rośnie — sprawdź, czy nie kupiłeś go gorszym payoffem.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="insight" title="Plan był dobry — a EV i tak leci. Co się dzieje?">
        <p>
          Najczęstsze „niszczyciele EV” siedzą w wykonaniu, nie w nazwie setupu.
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Rozsuwasz stop</strong> — w liczbach rośnie <em>AvgLoss</em>. Ten sam sygnał, większy ból niż w planie.
          </li>
          <li>
            <strong>Wycinasz zysk z lęku</strong> — <em>AvgWin</em> maleje. Equity może jeszcze rosnąć, a Ty stopniowo gasisz przewagę.
          </li>
          <li>
            <strong>Handlujesz „planem” przy szerokim spreadzie i poślizgu</strong> — backtest bez tarcia kłamie. W praktyce koszt to podatek od EV.
          </li>
        </ul>
        <p className="mt-4">
          Jeśli teoria jest piękna, a Ty na koncie słaby — najpierw sprawdź, czy to w ogóle ten sam trade. Potem szukaj nowego wskaźnika.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="closing" title="Ćwiczenia — żeby to zostało w głowie, nie w notatniku">
        <ol className="list-decimal pl-6">
          <li>
            Ostatnie 50–100 transakcji <em>z planu</em> (nie z pamięci). WR, AvgWin, AvgLoss, EV w R. Jedno zdanie: „moja przewaga dziś: …”.
          </li>
          <li>
            Na kartce: podnieś AvgLoss o 0,15R — co robi z EV? Potem WR +3 p.p. kosztem AvgWin −0,3R. Która zmiana boli bardziej? To mówi, czego nie ruszać pierwszego.
          </li>
          <li>
            Dwie reguły obniżające <strong>AvgLoss</strong> (np. brak przesuwania SL bez wpisu w plan) i jedna utrzymująca <strong>AvgWin</strong> (np. trailing tylko z checklisty).
          </li>
        </ol>
      </LessonSectionPanel>
    </ZaawansowaneLessonShell>
  );
}
