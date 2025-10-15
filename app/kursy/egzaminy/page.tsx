import Link from "next/link";
// ⬇️ IMPORT CTA — wybierz właściwą ścieżkę zależnie od położenia pliku
import ExamCTA from "../../../components/ExamCTA"; 
// Jeśli trzymasz CTA w app/components/ExamCTA.tsx, użyj zamiast tego:
// import ExamCTA from "../../components/ExamCTA";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <Link className="text-sm underline" href="/kursy">
        ← Wróć do listy kursów
      </Link>

      <header className="space-y-1">
        <p className="text-slate-400 text-sm">Egzaminy • Regulacje</p>
        <h1 className="text-3xl font-semibold">Przewodnik: KNF / ESMA / MiFID</h1>
      </header>

      <article className="rounded-2xl bg-[#0b1220] border border-white/10 p-6 space-y-4">
        <p className="text-white/80">
          Ta sekcja kompiluje zagadnienia regulacyjne istotne dla inwestora detalicznego w UE:
          adekwatność i odpowiedniość, ryzyko, ochrona klienta, komunikacja marketingowa,
          konflikty interesów, oraz praktyka odpowiedzialnego inwestowania.
        </p>

        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>MiFID II / ESMA: ramy prawne, ochrona klienta detalicznego.</li>
          <li>KNF: ostrzeżenia, test adekwatności, dokumenty KID/KIIDs, ryzyka.</li>
          <li>Najlepsze praktyki: zarządzanie ryzykiem, przejrzystość kosztów, edukacja.</li>
        </ul>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20" href="/kursy/egzaminy/knf">
            Ścieżka: KNF
          </Link>
          <Link className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20" href="/kursy/egzaminy/cysec">
            Ścieżka: CySEC
          </Link>
        </div>

        <p className="text-xs text-white/60 mt-4">
          Uwaga: to materiały edukacyjne. Nie są poradą prawną i nie zastępują oficjalnych wytycznych.
        </p>
      </article>

      {/* CTA na dole strony egzaminów */}
      <ExamCTA slug="przewodnik" />
    </main>
  );
}
