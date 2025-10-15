import Link from "next/link";

const QA: Array<{ q: string; a: string }> = [
  { q: "Czy materiały to porady inwestycyjne?", a: "Nie. Cała zawartość ma charakter edukacyjny i nie stanowi rekomendacji inwestycyjnych." },
  { q: "Czy mogę uczyć się od zera?", a: "Tak. Moduł „Podstawy” prowadzi od absolutnych podstaw do praktyki." },
  { q: "Czy są testy/quizy?", a: "Tak. Krótkie quizy po rozdziałach i testy podsumowujące pomagają utrwalić wiedzę." },
  { q: "Czy jest kalkulator ryzyka?", a: "Tak. Znajdziesz go w zakładce Kalkulator (wielkość pozycji, margin)." },
];

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8 text-white">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold">FAQ</h1>
      <p className="mt-2 text-white/70">Najczęstsze pytania i odpowiedzi.</p>

      <div className="mt-6 grid gap-3">
        {QA.map((item, i) => (
          <details key={i} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <summary className="cursor-pointer font-semibold">{item.q}</summary>
            <p className="mt-2 text-sm text-white/70">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
