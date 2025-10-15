// app/ebooki/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

/* ──────────────────────────────────────────────────────────────
   Marketplace ebooków (publiczna strona, bez logowania)
   - zapis zakupów w localStorage: "ebooks:owned" -> string[]
   - wrzuć PDF-y do public/ebooks/<slug>(-sample).pdf
   ────────────────────────────────────────────────────────────── */

type Ebook = {
  slug: string;
  title: string;
  blurb: string;
  pages: number;
  level: 'Podstawy' | 'Średniozaawansowany' | 'Zaawansowany';
  price: number; // PLN
  sampleUrl: string; // /ebooks/<slug>-sample.pdf
  fullUrl: string;   // /ebooks/<slug>.pdf
  tags?: string[];
};

const BASE_EBOOKS: Ebook[] = [
  {
    slug: 'podstawy-inwestowania',
    title: 'Podstawy inwestowania',
    blurb:
      'Ryzyko vs. zwrot, dźwignia, typy zleceń, czytanie świec. Solidne fundamenty, dzięki którym rozumiesz wykres i instrument.',
    pages: 132,
    level: 'Podstawy',
    price: 49,
    sampleUrl: '/ebooks/podstawy-inwestowania-sample.pdf',
    fullUrl: '/ebooks/podstawy-inwestowania.pdf',
    tags: ['Fundamenty', 'Zlecenia', 'Świece'],
  },
  {
    slug: 'forex',
    title: 'Forex – praktyczny przewodnik',
    blurb:
      'Pary walutowe, pipsy i loty, sesje, wpływ makro i stóp procentowych, praktyczne aspekty handlu na FX.',
    pages: 138,
    level: 'Podstawy',
    price: 49,
    sampleUrl: '/ebooks/forex-sample.pdf',
    fullUrl: '/ebooks/forex.pdf',
    tags: ['FX', 'Sesje', 'Makro'],
  },
  {
    slug: 'cfd',
    title: 'CFD – mechanika i praktyka',
    blurb:
      'Kontrakty CFD na indeksy i surowce, finansowanie overnight, poślizgi, rolki, specyfika wykonania zleceń.',
    pages: 140,
    level: 'Średniozaawansowany',
    price: 49,
    sampleUrl: '/ebooks/cfd-sample.pdf',
    fullUrl: '/ebooks/cfd.pdf',
    tags: ['Indeksy', 'Surowce', 'Funding'],
  },
  {
    slug: 'zaawansowane',
    title: 'Zaawansowane: statystyka, OOS, psychologia',
    blurb:
      'Edge/EV, sizing (Kelly), testy out-of-sample i walk-forward, błędy poznawcze i higiena procesu decyzyjnego.',
    pages: 168,
    level: 'Zaawansowany',
    price: 89,
    sampleUrl: '/ebooks/zaawansowane-sample.pdf',
    fullUrl: '/ebooks/zaawansowane.pdf',
    tags: ['EV', 'Kelly', 'OOS', 'Psychologia'],
  },
];

// Pakiet wszystkich e-booków (199 PLN)
const BUNDLE = {
  slug: 'pakiet-wszystko',
  title: 'Pakiet: wszystkie e-booki',
  desc: 'Kup wszystkie e-booki jednocześnie w obniżonej cenie.',
  price: 199,
};

const fmt = (pln: number) =>
  pln.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 });

export default function EbookiPage() {
  const [owned, setOwned] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'owned' | 'notowned'>('all');
  const [q, setQ] = useState('');

  // wczytaj posiadane ebooki (demo)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('ebooks:owned');
      setOwned(raw ? JSON.parse(raw) : []);
    } catch {
      setOwned([]);
    }
  }, []);

  const saveOwned = (list: string[]) => {
    setOwned(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ebooks:owned', JSON.stringify(list));
    }
  };

  const isOwned = (slug: string) => owned.includes(slug);
  const ownedAll = BASE_EBOOKS.every((e) => isOwned(e.slug));

  const filtered = useMemo(() => {
    return BASE_EBOOKS.filter((e) => {
      if (filter === 'owned' && !isOwned(e.slug)) return false;
      if (filter === 'notowned' && isOwned(e.slug)) return false;
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        const hay =
          `${e.title} ${e.blurb} ${e.level} ${e.tags?.join(' ') ?? ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [filter, q, owned]);

  const handleBuy = (slug: string) => {
    if (isOwned(slug)) return;
    const next = [...new Set([...owned, slug])];
    saveOwned(next);
  };

  const handleBuyBundle = () => {
    if (ownedAll) return;
    const missing = BASE_EBOOKS.map((e) => e.slug).filter((s) => !owned.includes(s));
    saveOwned([...owned, ...missing]);
  };

  const normalSum = BASE_EBOOKS.reduce((a, b) => a + b.price, 0); // 49+49+49+89 = 236
  const saving = normalSum - BUNDLE.price; // 37

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm"
            >
              ← Strona główna
            </Link>
            <span className="text-sm text-white/60 hidden sm:inline">
              E-booki: profesjonalne materiały PDF (platforma pozostaje darmowa)
            </span>
          </div>
          <Link
            href="/konto"
            className="rounded-lg bg-white text-slate-900 font-semibold px-3 py-1.5 hover:opacity-90"
          >
            Moje konto
          </Link>
        </div>
      </div>

      {/* Hero / nagłówek */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Ebooki</h1>
        <p className="mt-2 text-white/70 max-w-2xl">
          Kursy i dostęp do platformy są darmowe. Płatne są tylko e-booki (PDF): podstawy, Forex, CFD
          i moduł zaawansowany. Możesz też kupić cały pakiet taniej.
        </p>

        {/* Filtry */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm ${filter === 'all' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setFilter('notowned')}
              className={`px-3 py-2 text-sm ${
                filter === 'notowned' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              Do kupienia
            </button>
            <button
              onClick={() => setFilter('owned')}
              className={`px-3 py-2 text-sm ${
                filter === 'owned' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              Posiadane
            </button>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Szukaj (np. MiFID, risk, KNF)…"
            className="w-full sm:w-72 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          />
        </div>

        {/* Karta PAKIETU */}
        <div className="mt-6">
          <div className="rounded-2xl p-5 bg-gradient-to-r from-indigo-700/40 via-cyan-700/30 to-teal-700/30 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div>
                <div className="text-xs font-semibold tracking-widest text-white/80">PAKIET</div>
                <h3 className="mt-1 text-xl font-bold">{BUNDLE.title}</h3>
                <p className="mt-1 text-white/80 max-w-2xl">{BUNDLE.desc}</p>
                <ul className="mt-2 text-sm text-white/80 list-disc pl-5 space-y-1">
                  <li>Podstawy inwestowania (49 PLN)</li>
                  <li>Forex – praktyczny przewodnik (49 PLN)</li>
                  <li>CFD – mechanika i praktyka (49 PLN)</li>
                  <li>Zaawansowane: statystyka, OOS, psychologia (89 PLN)</li>
                </ul>
              </div>
              <div className="shrink-0 w-full lg:w-auto">
                <div className="text-sm text-white/70">Cena łączna: <s>{fmt(normalSum)}</s></div>
                <div className="text-3xl font-extrabold">{fmt(BUNDLE.price)}</div>
                <div className="text-xs text-emerald-300">Oszczędzasz {fmt(saving)}</div>
                {ownedAll ? (
                  <button
                    className="mt-3 w-full lg:w-auto px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
                    title="Masz już wszystkie e-booki"
                  >
                    Masz cały pakiet ✔
                  </button>
                ) : (
                  <button
                    onClick={handleBuyBundle}
                    className="mt-3 w-full lg:w-auto px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
                  >
                    Kup pakiet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lista pojedynczych e-booków */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((e) => {
            const owned = isOwned(e.slug);
            return (
              <article
                key={e.slug}
                className="group rounded-2xl p-5 bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 hover:shadow-2xl hover:shadow-black/40 transition flex flex-col"
              >
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  {e.level} · {e.pages} stron
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug">{e.title}</h3>
                <p className="mt-2 text-sm text-white/70 flex-1">{e.blurb}</p>

                {e.tags && e.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xl font-bold">{fmt(e.price)}</div>
                  <div className="flex items-center gap-2">
                    <a
                      href={e.sampleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                    >
                      Podgląd PDF
                    </a>

                    {owned ? (
                      <a
                        href={e.fullUrl}
                        download
                        className="px-3 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 text-sm"
                      >
                        Pobierz
                      </a>
                    ) : (
                      <button
                        onClick={() => handleBuy(e.slug)}
                        className="px-3 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 text-sm"
                      >
                        Kup
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/70 text-sm">
            Brak wyników dla zastosowanych filtrów.
          </div>
        )}
      </section>

      {/* Stopka info */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-xs text-white/60">
          <p>
            Uwaga: to wersja demonstracyjna – koszyk i zakup zapisywane są lokalnie w przeglądarce
            (localStorage). Pliki PDF powinny znajdować się w <code>public/ebooks/</code>.
          </p>
        </div>
      </footer>
    </main>
  );
}
