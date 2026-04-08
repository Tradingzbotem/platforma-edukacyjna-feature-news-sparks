import LessonSectionPanel, { LessonInlineCallout } from "@/components/LessonSectionPanel";
import ZaawansowaneLessonShell from "@/components/ZaawansowaneLessonShell";

export default function Page() {
  return (
    <ZaawansowaneLessonShell
      lessonNumber={4}
      lessonSlug="lekcja-4"
      title="Sizing pro: Kelly (częściowy), fixed-fractional, volatility targeting i portfel"
      minutes={22}
      prevSlug="lekcja-3"
      nextSlug="lekcja-5"
    >
      <LessonSectionPanel variant="content" title="Ta sama strategia, inny rozmiar — inne życie na koncie">
        <p>
          <strong>Fixed-fractional</strong> — to samo ryzyko w % kapitału na 1R (np. 0,5%).
        </p>
        <p>
          Ten sam setup, ten sam plan wejścia — zmieniasz tylko ile jednostek ryzykujesz na jeden pełny stop.
        </p>
        <p>
          Przykład: konto <strong>20 000</strong>, każda strata = pełne 1R.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2 pr-4">Ryzyko na 1R</th>
                <th className="py-2 pr-4">1 strata (≈)</th>
                <th className="py-2 pr-4">5 strat z rzędu (≈)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { pct: "0,5%", one: "100", five: "−500" },
                { pct: "1%", one: "200", five: "−1000" },
                { pct: "2%", one: "400", five: "−2000" },
              ].map((r) => (
                <tr key={r.pct} className="border-t border-white/10">
                  <td className="py-2 pr-4">{r.pct}</td>
                  <td className="py-2 pr-4">{r.one}</td>
                  <td className="py-2 pr-4">{r.five}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Teoria vs konto: matematyka setupu jest jedna — przy 2% piąta strata boli jak u innego przy dziesięciu przy 0,5%. Pokusa „coś teraz zmienić w regułach” rośnie z drugą kolumną, nie z pierwszą.
        </p>
        <p>
          <strong>Kelly</strong> w skrócie: jaki ułamek kapitału maksymalizuje długi wzrost — <em>jeśli</em> EV i rozrzut znasz naprawdę dobrze.
        </p>
        <p>
          Pełny Kelly na żywym koncie bywa jak za mocny gaz. Używasz <em>części</em> (np. ¼–½) albo Kelly tylko jako kierunek, nie jako gotowy rozmiar pozycji.
        </p>
        <LessonInlineCallout title="Ten sam trade — trzy konta w głowie">
          <p>
            Setup identyczny. Trader X: 0,5% na R. Y: 1%. Z: 2%.
          </p>
          <p className="mt-3">
            Po czterech stopach X ma ok. −400 na equity, Z ok. −1600 — <strong>ten sam błąd rynku</strong>, inna głębokość dołka i inna presja na piąty trade.
          </p>
          <p className="mt-3">
            To nie znaczy, że Z ma słabszą głowę. Znaczy, że variance trafiła w większą stawkę.
          </p>
        </LessonInlineCallout>
        <LessonInlineCallout title="Kelly w liczbie — ostrożnie">
          <p>
            Czasem: Kelly ≈ <code>EV / Var</code> (w R). Var = jak mocno skaczą wyniki; jedna gruba strata psuje próbę.
          </p>
          <p className="mt-3">
            Nawet jak coś wyjdzie: <strong>ułamek</strong>, sanity check, nie pozwolenie na pełny size.
          </p>
        </LessonInlineCallout>
      </LessonSectionPanel>

      <LessonSectionPanel variant="content" title="Volatility targeting — po co skalować, skoro setup jest ten sam?">
        <p>
          Ten sam lot przy spokojnym i przy szalonym tygodniu = <strong>inne ryzyko w jednostkach konta</strong>.
        </p>
        <p>
          <strong>Volatility targeting:</strong> vol w górę → mniejszy rozmiar. Vol w dół → możesz lekko podnieść. Chodzi o podobny „kop”, nie o ten sam lot na siłę.
        </p>
        <p>
          Tydzień A: wąski zasięg, ten sam lot = mały kop. Tydzień B: zasięg 2× — ten sam lot = kop 2× mocniejszy na koncie.
        </p>
        <ul className="list-disc pl-6">
          <li>
            Jeden instrument: ATR lub szerokość tygodnia — spójnie z planem, nie perfekcyjnie.
          </li>
          <li>
            Kilka linii: wagi ~ 1/vol — żeby pięć pozycji „po 1%” nie zachowywało się jak jedna grubaska.
          </li>
        </ul>
        <p className="mt-4">
          Najczęstszy błąd: pięć nazw tickera, jeden wspólny strach na rynku — na wykresie dywersyfikacja, na koncie jedna duża stawka.
        </p>
      </LessonSectionPanel>

      <LessonSectionPanel variant="insight" title="Portfel: pięć pozycji, jeden bet — jak to wyłapać zanim Cię zje">
        <p>
          Problem nie jest w etykiecie „portfel”, tylko w <strong>koncentracji ryzyka</strong>: wszystko może złapać ten sam cios w tym samym dniu.
        </p>
        <p>
          Scenariusz: long na indeksie, long na dwóch growth, long na dwóch krypto skorelowanych z risk-on. W poniedziałek wszystko zielone, w środę jedna wiadomość — pięć pozycji, jedna rana na equity.
        </p>
        <p>
          Pytanie operacyjne: <strong>co jednym ruchem uderza we wszystkie linie?</strong> Jeśli odpowiedź to np. „panika na USD / risk-off” — nie masz pięciu niezależnych betów.
        </p>
        <ul className="list-disc pl-6">
          <li>
            Limit strat na jeden czynnik (np. jeden makro-scenariusz): ile max mogę zostawić na stole, gdy ten scenariusz się wywali?
          </li>
          <li>
            „Wygładzenie” krzywej działa tylko wtedy, gdy pozycje naprawdę padają z innych powodów — nie z tego samego strachu.
          </li>
        </ul>
      </LessonSectionPanel>

      <LessonSectionPanel variant="closing" title="Ćwiczenie">
        <p>
          Trzy rynki, które realnie handlujesz. Jedna miara vol na każdy (np. ATR w R lub szerokość tygodnia).
        </p>
        <p>
          Wagi 1/vol. Zapisz: gdy wszystkie trzy idą razem przeciw Tobie vs gdy jeden jest przeciw — jak zmienia się łączny ubytek?
        </p>
        <p>
          Decyzja: przy którym % na R (i ile linii) nadal akceptujesz operację po lekcji 3 (percentyl DD)? Konkret: „X% / Y linii” albo „zmniejszam do Z”.
        </p>
      </LessonSectionPanel>
    </ZaawansowaneLessonShell>
  );
}
