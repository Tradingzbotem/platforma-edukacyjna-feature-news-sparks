// app/prawne/page.tsx
import Link from "next/link";

type Item = { href: string; title: string; blurb: string };

const ITEMS: Item[] = [
  {
    href: "/prawne/warunki",
    title: "Warunki korzystania",
    blurb:
      "Zasady korzystania z serwisu, licencja na treści, odpowiedzialność i ograniczenia.",
  },
  {
    href: "/prawne/prywatnosc",
    title: "Polityka prywatności",
    blurb:
      "Jakie dane przetwarzamy, podstawy prawne, Twoje prawa i kontakt w sprawach RODO.",
  },
  {
    href: "/prawne/cookies",
    title: "Cookies",
    blurb:
      "Rodzaje plików cookie, cele, czas przechowywania i jak zarządzać zgodami.",
  },
  {
    href: "/kontakt",
    title: "Kontakt",
    blurb: "Wyślij nam wiadomość przez formularz kontaktowy.",
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8 space-y-8">
      {/* powrót */}
      <nav>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          <span aria-hidden>←</span> Strona główna
        </Link>
      </nav>

      {/* nagłówek */}
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Prawne</h1>
        <p className="text-slate-300 max-w-2xl">
          Poniżej znajdziesz komplet dokumentów regulujących korzystanie z
          serwisu. Dokumenty mają charakter informacyjny i obowiązują wszystkich
          odwiedzających.
        </p>
      </header>

      {/* list dokumentów */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ITEMS.map((it) => (
          <article
            key={it.href}
            className="h-full rounded-2xl bg-[#0b1220] border border-white/10 p-5 flex flex-col"
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold leading-snug">{it.title}</h3>
              <p className="mt-2 text-sm text-white/70">{it.blurb}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link
                href={it.href}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
                aria-label={`Zobacz dokument: ${it.title}`}
              >
                Zobacz dokument <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
