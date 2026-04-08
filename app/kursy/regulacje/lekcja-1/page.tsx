import RegulacjeLessonLayout from "@/components/kursy/RegulacjeLessonLayout";

export default function Page() {
  return (
    <RegulacjeLessonLayout
      lessonSlug="lekcja-1"
      lessonNumber={1}
      minutes={15}
      title="Podstawy regulacyjne: MiFID II i ESMA"
      nextSlug="lekcja-2"
    >
      {/* CELE */}
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Zrozumiesz podstawy regulacji finansowych w UE: <strong>MiFID II</strong> i <strong>ESMA</strong>.</li>
          <li>Poznasz główne organy nadzorcze: <strong>KNF</strong>, <strong>CySEC</strong>, <strong>FCA</strong>.</li>
          <li>Dowiesz się o kluczowych zasadach MiFID II dotyczących ochrony klienta.</li>
          <li>Zrozumiesz rolę ESMA w koordynacji nadzoru finansowego w Europie.</li>
        </ul>
      </section>

      {/* WPROWADZENIE */}
      <section>
        <h2 className="text-xl font-semibold">Wprowadzenie do regulacji finansowych</h2>
        <p className="mt-2 text-slate-300">
          <strong>MiFID II</strong> (Markets in Financial Instruments Directive II) to unijna dyrektywa regulująca rynki finansowe, wprowadzona w 2018 roku. 
          <strong>ESMA</strong> (European Securities and Markets Authority) to organ nadzorczy odpowiedzialny za ochronę inwestorów i stabilność rynków finansowych w UE.
        </p>
        <div className="mt-4 rounded-xl bg-indigo-500/5 backdrop-blur-sm border border-indigo-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-indigo-200">Dlaczego regulacje są ważne?</h3>
          <p className="text-slate-300 mt-1">
            Regulacje finansowe mają na celu ochronę klientów detalicznych przed nadmiernym ryzykiem, zapewnienie transparentności 
            oraz uczciwości na rynkach finansowych. Brokerzy muszą przestrzegać surowych zasad dotyczących informowania klientów, 
            zarządzania ryzykiem i realizacji zleceń.
          </p>
        </div>
      </section>

      {/* ORGANY NADZORCZE */}
      <section>
        <h2 className="text-xl font-semibold">Główne organy regulacyjne</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">KNF (Polska)</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Komisja Nadzoru Finansowego — nadzór nad rynkiem finansowym w Polsce. 
              Wszyscy brokerzy działający w Polsce muszą mieć licencję KNF.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">CySEC (Cypr)</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Cyprus Securities and Exchange Commission — popularny organ nadzorczy dla brokerów CFD. 
              Licencja CySEC pozwala na działanie w całej UE dzięki paszportowaniu MiFID.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">ESMA (UE)</h3>
            <p className="text-slate-300 mt-1 text-sm">
              European Securities and Markets Authority — europejski organ nadzorczy koordynujący działania krajowych organów. 
              ESMA wprowadza wspólne standardy ochrony klientów w całej UE.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-semibold text-white">FCA (Wielka Brytania)</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Financial Conduct Authority — nadzór w Wielkiej Brytanii. 
              Po Brexicie FCA działa niezależnie, ale nadal utrzymuje wysokie standardy ochrony klientów.
            </p>
          </div>
        </div>
      </section>

      {/* ZASADY MIFID II */}
      <section>
        <h2 className="text-xl font-semibold">Kluczowe zasady MiFID II</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">1. Ochrona klienta detalicznego</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Najwyższy poziom ochrony dla klientów detalicznych, w tym limity dźwigni, negative balance protection 
              oraz szczegółowe informowanie o ryzykach.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">2. Transparentność kosztów</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Pełne ujawnienie wszystkich opłat: spread, prowizje, swap, poślizg oraz kursy przeliczeń walut.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">3. Best execution</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Najlepsza możliwa realizacja zleceń — broker musi podejmować wszelkie uzasadnione działania dla najlepszego wyniku, 
              biorąc pod uwagę cenę, koszty, szybkość i prawdopodobieństwo realizacji.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">4. Zapobieganie konfliktom interesów</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Broker musi identyfikować, zarządzać i ujawniać potencjalne konflikty interesów, które mogą wpływać na interesy klienta.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">5. Wymóg testów adekwatności</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Dla złożonych instrumentów jak CFD broker musi przeprowadzić test adekwatności, sprawdzający wiedzę i doświadczenie klienta.
            </p>
          </div>
        </div>
      </section>

      {/* ROLA ESMA */}
      <section>
        <h2 className="text-xl font-semibold">Rola ESMA w ochronie klientów</h2>
        <p className="mt-2 text-slate-300">
          ESMA wprowadza wspólne standardy ochrony klientów w całej UE, w tym:
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
          <li><strong>Limity dźwigni</strong> dla klientów detalicznych (np. FX majors 1:30, akcje 1:5)</li>
          <li><strong>Negative balance protection</strong> — ochrona przed stratami większymi niż depozyt</li>
          <li><strong>Margin close-out</strong> — obowiązkowe zamknięcie pozycji przy 50% depozytu</li>
          <li><strong>Ostrzeżenia o ryzyku</strong> w materiałach marketingowych</li>
          <li><strong>Wymogi dotyczące KID/KIID</strong> — dokumentów informujących o ryzykach i kosztach</li>
        </ul>
        <div className="mt-4 rounded-xl bg-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-amber-200">Przykład działania ESMA</h3>
          <p className="text-slate-300 mt-1">
            W 2018 roku ESMA wprowadziła limity dźwigni dla klientów detalicznych, co znacząco ograniczyło ryzyko 
            nadmiernego zadłużenia. Te limity są obowiązkowe dla wszystkich brokerów działających w UE.
          </p>
        </div>
      </section>

      {/* CHECKLISTA */}
      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozumiem różnicę między <strong>MiFID II</strong> a <strong>ESMA</strong>.</li>
          <li>Znam główne organy nadzorcze: <strong>KNF</strong>, <strong>CySEC</strong>, <strong>ESMA</strong>, <strong>FCA</strong>.</li>
          <li>Wiem, jakie są kluczowe zasady <strong>MiFID II</strong> dotyczące ochrony klienta.</li>
          <li>Rozumiem rolę <strong>ESMA</strong> w koordynacji nadzoru finansowego w Europie.</li>
          <li>Wiem, że regulacje mają na celu ochronę klientów detalicznych przed nadmiernym ryzykiem.</li>
        </ul>
      </section>

      {/* ZADANIE DOMOWE */}
      <section>
        <h2 className="text-xl font-semibold">Zadanie praktyczne</h2>
        <p className="mt-2 text-slate-300">
          Sprawdź licencję swojego brokera:
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-slate-300 mt-2">
          <li>Znajdź informacje o licencji brokera na jego stronie internetowej.</li>
          <li>Sprawdź, który organ nadzorczy wydał licencję (KNF, CySEC, FCA itp.).</li>
          <li>Zweryfikuj, czy broker ma paszport MiFID (jeśli działa w Polsce z licencją z innego kraju UE).</li>
          <li>Przeczytaj politykę kosztów i sprawdź, czy wszystkie opłaty są jasno opisane.</li>
        </ol>
      </section>
    </RegulacjeLessonLayout>
  );
}
