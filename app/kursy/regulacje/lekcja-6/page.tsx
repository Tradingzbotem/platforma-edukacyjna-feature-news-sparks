import Link from "next/link";
import RegulacjeLessonLayout from "@/components/kursy/RegulacjeLessonLayout";

export default function Page() {
  return (
    <RegulacjeLessonLayout
      lessonSlug="lekcja-6"
      lessonNumber={6}
      minutes={9}
      title="Kategoryzacja klientów i opt-up"
      prevSlug="lekcja-5"
    >
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Poznasz trzy kategorie klientów w MiFID II.</li>
          <li>Zrozumiesz różnice w poziomie ochrony między kategoriami.</li>
          <li>Dowiesz się, jak działa proces <strong>opt-up</strong>.</li>
          <li>Poznasz kryteria i konsekwencje zmiany kategorii.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Kategorie klientów</h2>
        <p className="mt-2 text-slate-300">
          MiFID II wprowadza trzy kategorie klientów, z różnym poziomem ochrony regulacyjnej:
        </p>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-emerald-200">1. Klient detaliczny</h3>
            <p className="text-slate-300 mt-1 text-sm">
              <strong>Najwyższa ochrona:</strong> limity dźwigni, negative balance protection, szczegółowe informacje o kosztach, 
              wymóg testów adekwatności.
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-amber-200">2. Klient profesjonalny</h3>
            <p className="text-slate-300 mt-1 text-sm">
              <strong>Niższa ochrona:</strong> wyższe limity dźwigni, możliwość rezygnacji z negative balance protection, 
              mniej szczegółowe informacje o kosztach.
            </p>
          </div>
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">3. Uprawniony kontrahent</h3>
            <p className="text-slate-300 mt-1 text-sm">
              <strong>Minimalna ochrona:</strong> najwyższe limity dźwigni, brak negative balance protection, 
              minimalne wymogi informacyjne.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Opt-Up (Zmiana kategorii klienta)</h2>
        <p className="mt-2 text-slate-300">
          Klient detaliczny może poprosić o zmianę kategorii na profesjonalną (opt-up), co oznacza rezygnację z niektórych ochron regulacyjnych. 
          Proces wymaga spełnienia określonych kryteriów i świadomej zgody.
        </p>
        <div className="mt-4 rounded-xl bg-indigo-500/5 backdrop-blur-sm border border-indigo-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-indigo-200">Kryteria opt-up na profesjonalnego</h3>
          <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
            <li>Wartość portfela przekracza <strong>500 000 EUR</strong></li>
            <li>LUB klient ma odpowiednie doświadczenie w sektorze finansowym (min. 1 rok pracy w instytucji finansowej)</li>
            <li>LUB wielkość transakcji wskazuje na profesjonalizm (min. 10 transakcji o znaczącej wartości w ciągu ostatnich 4 kwartałów)</li>
            <li>Klient musi wyrazić świadomą zgodę i zrozumieć konsekwencje</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Konsekwencje opt-up</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">Rezygnacja z ochron</h3>
            <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
              <li><strong>Rezygnacja z limitów dźwigni ESMA</strong> — możliwość wyższych dźwigni (np. 1:500 zamiast 1:30)</li>
              <li><strong>Rezygnacja z negative balance protection</strong> — możliwość strat większych niż depozyt</li>
              <li><strong>Mniej szczegółowe informacje o kosztach</strong> — broker nie musi ujawniać wszystkich szczegółów</li>
              <li><strong>Możliwość wyższego ryzyka</strong> — klient przyjmuje większe ryzyko na siebie</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">Proces jest jednokierunkowy</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Opt-up jest procesem jednokierunkowym — klient może przejść z detalicznego na profesjonalnego, 
              ale nie odwrotnie (z wyjątkiem szczególnych przypadków, np. gdy sytuacja finansowa klienta znacząco się zmieni). 
              Decyzja powinna być przemyślana i świadoma.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Proces opt-up</h2>
        <div className="mt-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
          <ol className="text-slate-300 space-y-2 text-sm list-decimal pl-6">
            <li>
              <strong>Weryfikacja kryteriów</strong> — broker sprawdza, czy klient spełnia kryteria opt-up 
              (wartość portfela, doświadczenie, wielkość transakcji).
            </li>
            <li>
              <strong>Informowanie o konsekwencjach</strong> — broker musi szczegółowo wyjaśnić klientowi, 
              z jakich ochron rezygnuje i jakie są konsekwencje.
            </li>
            <li>
              <strong>Świadoma zgoda</strong> — klient musi wyrazić świadomą zgodę na zmianę kategorii, 
              najlepiej na piśmie.
            </li>
            <li>
              <strong>Zmiana kategorii</strong> — po wyrażeniu zgody, broker zmienia kategorię klienta 
              i informuje o nowych warunkach.
            </li>
            <li>
              <strong>Monitoring</strong> — broker powinien monitorować sytuację klienta i w razie potrzeby 
              zaproponować powrót do kategorii detalicznej (jeśli jest to możliwe).
            </li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Kiedy opt-up ma sens?</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-emerald-200">Ma sens, gdy:</h3>
            <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
              <li>Klient ma duże doświadczenie i kapitał</li>
              <li>Potrzebuje wyższych dźwigni dla strategii</li>
              <li>Rozumie ryzyka i konsekwencje</li>
              <li>Ma odpowiednie zabezpieczenia finansowe</li>
            </ul>
          </div>
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">Nie ma sensu, gdy:</h3>
            <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
              <li>Klient jest początkujący</li>
              <li>Nie rozumie konsekwencji</li>
              <li>Nie ma odpowiedniego kapitału</li>
              <li>Chce tylko wyższych dźwigni bez zrozumienia ryzyk</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Znam trzy kategorie klientów: <strong>detaliczny</strong>, <strong>profesjonalny</strong>, <strong>uprawniony kontrahent</strong>.</li>
          <li>Rozumiem różnice w poziomie ochrony między kategoriami.</li>
          <li>Wiem, jak działa proces <strong>opt-up</strong> i jakie są jego kryteria.</li>
          <li>Rozumiem konsekwencje zmiany kategorii na profesjonalną.</li>
          <li>Wiem, że opt-up jest procesem jednokierunkowym i wymaga świadomej zgody.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Podsumowanie kursu</h2>
        <p className="mt-2 text-slate-300">
          Gratulacje! Ukończyłeś kurs o regulacjach finansowych. Teraz rozumiesz:
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
          <li>Podstawy regulacji MiFID II i ESMA</li>
          <li>Testy adekwatności i odpowiedniości</li>
          <li>Best execution i konflikty interesów</li>
          <li>Ochronę klienta: limity dźwigni i negative balance protection</li>
          <li>Marketing i compliance: KID/KIID, materiały promocyjne</li>
          <li>Kategoryzację klientów i opt-up</li>
        </ul>
        <div className="mt-4 rounded-xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-emerald-200">Następne kroki</h3>
          <p className="text-slate-300 mt-1 text-sm">
            Rozwiąż egzaminy praktyczne w sekcji <Link href="/kursy/egzaminy" className="underline">Egzaminy / regulacje</Link> 
            oraz sprawdź swoją wiedzę w quizach kontrolnych.
          </p>
        </div>
      </section>
    </RegulacjeLessonLayout>
  );
}
