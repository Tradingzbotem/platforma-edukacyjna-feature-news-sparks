'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const TickerFinnhubNoSSR = dynamic(() => import('@/components/TickerFinnhub'), { ssr: false });

/* ────────────────────── Ikony / drobnice ────────────────────── */
const BadgeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77 6.22 16.7l.91-5.32L3.27 7.62l5.34-.78L12 2z" />
  </svg>
);

const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.46a1 1 0 00-1.176 0l-3.38 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"
    />
  </svg>
);

/* ────────────────────── Dane ────────────────────── */
type Category = {
  key: 'fundamentals' | 'forex' | 'cfd' | 'advanced';
  title: string;
  desc: string;
  href: string;
};

const categories: Category[] = [
  { key: 'fundamentals', title: 'Podstawy inwestowania', desc: 'Ryzyko vs. zwrot, dźwignia, typy zleceń, czytanie świec.', href: '/kursy/podstawy' },
  { key: 'forex',        title: 'Forex',                  desc: 'Pary walutowe, pipsy i loty, sesje, wpływ makro i stóp procentowych.', href: '/kursy/forex' },
  { key: 'cfd',          title: 'CFD',                    desc: 'Mechanika CFD, finansowanie overnight, indeksy, surowce, krypto.', href: '/kursy/cfd' },
  { key: 'advanced',     title: 'Zaawansowane',           desc: 'Edge i statystyka, testy out-of-sample, psychologia i błędy poznawcze.', href: '/kursy/zaawansowane' },
];

type Q = { q: string; opts: string[]; a: number };

const BASE_QUESTIONS: Q[] = [
  { q: 'Ile pipsów ma ruch EURUSD z 1.0750 do 1.0762?', opts: ['10', '12', '100', '0.12'], a: 1 },
  { q: 'Co opisuje dźwignia 1:30?', opts: ['Gwarantuje 30% zysku', 'Ekspozycja do 30× depozytu', 'Limit 30 pozycji', 'Zmianę spreadu x30'], a: 1 },
  { q: 'Wartość 1 pipsa na 0.10 lota EURUSD to ok.:', opts: ['0.1 USD', '1 USD', '10 USD', '100 USD'], a: 1 },
  { q: 'Bid/Ask 1.0850/1.0853 — spread to:', opts: ['1 pips', '2 pipsy', '3 pipsy', '0.3 pipsa'], a: 2 },
  { q: 'Najwięcej płynności zwykle na sesji:', opts: ['Sydney', 'Tokio', 'Londyn', 'Weekend'], a: 2 },
  { q: 'Rollover (swap) najczęściej potrójny jest w:', opts: ['Poniedziałek', 'Wtorek', 'Środę', 'Piątek'], a: 2 },
  { q: 'SL powinien być:', opts: ['Losowy', 'Za ostatnim swingiem/SR', 'Zawsze 10 pips', 'Niepotrzebny'], a: 1 },
  { q: '1 lot na rynku FX to standardowo:', opts: ['1 000 jednostek', '10 000 jednostek', '100 000 jednostek', '1 000 000 jednostek'], a: 2 },
  { q: 'Po publikacji danych makro typowe są:', opts: ['Niższe spready', 'Poślizgi i rozszerzenie spreadu', 'Brak zmian', 'Stała zmienność'], a: 1 },
  { q: 'Wartość pipsa rośnie wraz z:', opts: ['Mniejszym lotem', 'Większym lotem', 'Wyższym spreadem', 'Niższym ATR'], a: 1 },
  { q: 'Który raport zwykle najmocniej wpływa na USD w 1. piątek miesiąca?', opts: ['CPI', 'NFP', 'ISM Services', 'PCE'], a: 1 },
  { q: 'Zlecenie LIMIT kupna realizuje się, gdy cena jest:', opts: ['Wyższa lub równa limitowi', 'Niższa lub równa limitowi', 'Dokładnie równa limitowi', 'Zawsze natychmiast'], a: 1 },
  { q: 'ATR (Average True Range) to miara:', opts: ['Trendów', 'Wolumenu', 'Zmienności', 'Kosztów swapu'], a: 2 },
  { q: 'Różnica między equity a free margin to m.in.:', opts: ['Free margin = equity + margin', 'Equity = saldo + P/L bieżący', 'Equity = free margin − margin', 'Free margin nie zależy od margin'], a: 1 },
  { q: 'Na USD/JPY 1 pips to zazwyczaj:', opts: ['0.0001', '0.001', '0.01', '1.00'], a: 2 },
];

/* ────────────────────── Strona ────────────────────── */
export default function HomePage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string>('Quiz');
  const [activeQuestions, setActiveQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  // ref do okna modala dla autofocusu
  const modalRef = useRef<HTMLDivElement | null>(null);

  // wynik dla aktualnego zestawu
  const score = useMemo(
    () => answers.reduce((acc, v, i) => (v === activeQuestions[i]?.a ? acc + 1 : acc), 0),
    [answers, activeQuestions]
  );

  // otwieranie quizu z określoną liczbą pytań
  const openQuiz = (count: number, title: string) => {
    const qs = BASE_QUESTIONS.slice(0, Math.min(count, BASE_QUESTIONS.length));
    setActiveQuestions(qs);
    setAnswers(Array(qs.length).fill(-1));
    setChecked(false);
    setQuizTitle(title);
    setQuizOpen(true);
  };

  const handlePick = (qi: number, ai: number) => {
    setAnswers((prev) => {
      const next = prev.slice();
      next[qi] = ai;
      return next;
    });
  };

  // UX: zamykanie modala ESC + klik w tło + blokada scrolla body
  useEffect(() => {
    if (!quizOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuizOpen(false);
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // autofocus w headerze modala
    const btn = modalRef.current?.querySelector<HTMLButtonElement>('button[data-close]');
    btn?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [quizOpen]);

  return (
    <main id="content" className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-white/10">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* LEWO: logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="font-bold">FX</span>
            </div>
            <span className="font-semibold tracking-wide">
              Edu<span className="text-white/60">Lab</span>
            </span>
          </div>

          {/* ŚRODEK: menu */}
            <ul className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <li><Link href="/kursy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">Kursy</Link></li>
            <li><Link href="/symulator" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">Kalkulator</Link></li>
            <li><Link href="/quizy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">Quizy</Link></li>
            <li><Link href="/ebooki" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">Ebooki</Link></li>
            <li><Link href="/rankingi/brokerzy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">Rankingi brokerów</Link></li>
            <li>
              <Link href="/challenge" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">
                Challenge
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">
                News
              </Link>
            </li>
          </ul>

          {/* PRAWO: auth */}
          <div className="flex items-center gap-3">
            <Link href="/logowanie" className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/50">
              Zaloguj
            </Link>
            <Link href="/rejestracja" className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-white/50">
              Dołącz za darmo
            </Link>
          </div>
        </nav>

        {/* LIVE ticker z Finnhub */}
        <TickerFinnhubNoSSR
          className="border-t border-white/10"
          speedSec={42}
          symbols={[
            'OANDA:NAS100_USD', // US100
            'OANDA:XAU_USD',    // Złoto
            'OANDA:WTICO_USD',  // Ropa WTI
            'OANDA:BCO_USD',    // Ropa Brent
            'OANDA:EUR_USD',    // EUR/USD
            'OANDA:USD_JPY',    // USD/JPY
          ]}
        />
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="grid md:grid-cols-2 items-center gap-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs mb-4">
                <BadgeIcon />
                <span className="tracking-wide">Edukacja od podstaw do pro (CFD & Forex)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Zbuduj solidne podstawy i praktyczne umiejętności na rynku Forex i CFD
              </h1>
              <p className="mt-4 text-white/70 max-w-xl">
                Lekcje, quizy, wyzwania i kalkulatory. Zero „sygnałów”, 100% edukacji. Ucz się w tempie, które daje wyniki.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/kursy" className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50">
                  Rozpocznij naukę
                </Link>
                <button
                  type="button"
                  onClick={() => openQuiz(10, 'Próbny test')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Zagraj próbny test
                </button>
              </div>
              <div className="mt-6 flex items-center gap-2 text-white/70">
                {[...Array(4)].map((_, i) => <Star key={i} />)}<Star filled={false} />
                <span className="text-sm">4.0/5 na podstawie 1 245 opinii</span>
              </div>
            </div>

            <div>
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl">
                {/* Moduły z linkiem */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((c) => (
                    <div key={c.key} className="group rounded-xl p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{c.title}</h3><BadgeIcon />
                      </div>
                      <p className="mt-2 text-sm text-white/70">{c.desc}</p>
                      <Link
                        href={c.href}
                        className="mt-3 inline-block text-sm underline underline-offset-4 decoration-white/30 group-hover:decoration-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                      >
                        Wejdź do modułu
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dekoracje */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </section>

      {/* STATS */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Kursy', value: '24' },
            { label: 'Lekcje', value: '180+' },
            { label: 'Uczestnicy', value: '12 500' },
            { label: 'Śr. czas / tydz.', value: '3.2h' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 py-5">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* POLECANE KURSY */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Polecane kursy</h2>
              <p className="text-white/70 mt-2">Zacznij od podstaw i przechodź do bardziej zaawansowanych tematów.</p>
            </div>
            <Link href="/kursy" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50">
              Zobacz wszystkie
            </Link>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[0,1,2,3].map((i) => (
              <article key={i} className="group rounded-2xl p-5 bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 hover:shadow-2xl hover:shadow-black/40 transition">
                <div className="text-xs font-semibold tracking-widest text-white/60">{['PODSTAWY','PODSTAWY','CFD','ZAAWANSOWANE'][i]}</div>
                <h3 className="mt-2 text-lg font-semibold leading-snug">{['Wprowadzenie do rynku Forex','Zarządzanie ryzykiem i wielkość pozycji','CFD na indeksy i surowce – praktyka','Testowanie strategii: od hipotezy do wyników'][i]}</h3>
                <p className="mt-2 text-sm text-white/70">{['Poznaj strukturę rynku, uczestników, płynność i interwały.','Obliczaj wielkość pozycji w pips/lot i trzymaj się R-multiple.','Finansowanie overnight, poślizg, sesje – praktyczne przykłady.','Stabilność statystyczna, out-of-sample, walk-forward (koncepcje).'][i]}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-white/60">
                  <span>🎥 {[8,6,9,7][i]} lekcji</span>
                  <span>⏱ {['2h 15m','1h 40m','2h 05m','2h 30m'][i]}</span>
                  <span>📈 {['Początkujący','Średniozaawansowany','Średniozaawansowany','Zaawansowany'][i]}</span>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Link href={['/kursy/forex','/kursy/podstawy','/kursy/cfd','/kursy/zaawansowane'][i]} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50">
                    Rozpocznij
                  </Link>
                  <button
                    type="button"
                    onClick={() => openQuiz(10, 'Próbny test')}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    Zagraj próbny test
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AI QUICK INFO — DUŻY CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl p-8 md:p-10 text-center bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 border border-white/10">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs mb-4">
              <BadgeIcon />
              <span className="tracking-wide">Bądź na bieżąco z AI</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">Szybkie info od AI</h3>
            <p className="mt-3 text-white/80 max-w-2xl mx-auto">
              Na bieżąco skanujemy wiarygodne źródła i podajemy najważniejsze informacje, zwięźle i bez rekomendacji inwestycyjnych.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/news"
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Bądź na bieżąco z AI
              </Link>
              <Link
                href="/news?refresh=now"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Odśwież teraz
              </Link>
            </div>
            <p className="mt-3 text-xs text-white/60">Edukacyjnie — bez rekomendacji inwestycyjnych.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold">Dołącz i odblokuj pełny program</h3>
          <p className="mt-2 text-white/70">Darmowy dostęp do modułu „Podstawy” + quizy wprowadzające.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/rejestracja" className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50">Załóż konto</Link>
            <Link href="/quizy" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50">Rozwiąż quiz</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="font-bold">FX</span>
              </div>
              <span className="font-semibold">EduLab</span>
            </div>
            <p className="mt-3 text-white/70">
              Platforma edukacyjna Forex/CFD. Bez porad inwestycyjnych – tylko wiedza i praktyka.
            </p>
          </div>

          <div>
            <div className="font-semibold mb-2">Nawigacja</div>
            <ul className="space-y-1 text-white/70">
              <li><Link href="/kursy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Kursy</Link></li>
              <li><Link href="/quizy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Quizy</Link></li>
              <li><Link href="/rankingi/brokerzy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Rankingi brokerów</Link></li>
              <li><Link href="/symulator" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Kalkulator</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2">Zasoby</div>
            <ul className="space-y-1 text-white/70">
              <li><Link href="/zasoby/faq" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2">Prawne</div>
            <ul className="space-y-1 text-white/70">
              <li><Link href="/prawne/warunki" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Warunki korzystania</Link></li>
              <li><Link href="/prawne/polityka" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Polityka prywatności</Link></li>
              <li><Link href="/prawne/cookies" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Cookies</Link></li>
              <li><Link href="/kontakt" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 text-xs text-white/60">
          <p>
            Ostrzeżenie o ryzyku: Handel instrumentami z dźwignią (w tym CFD i Forex) wiąże się z wysokim ryzykiem
            szybkiej utraty środków z powodu dźwigni finansowej. Materiały dostępne na tej stronie mają charakter
            wyłącznie edukacyjny i nie stanowią rekomendacji inwestycyjnych.
          </p>
        </div>
      </footer>

      {/* QUIZ MODAL */}
      {quizOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={quizTitle}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setQuizOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl outline-none"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-bold">
                {quizTitle}: {activeQuestions.length} pytań
              </h4>
              <button
                type="button"
                data-close
                onClick={() => setQuizOpen(false)}
                className="text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded px-1"
                aria-label="Zamknij"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-5 text-sm max-h-[70vh] overflow-y-auto pr-1">
              {activeQuestions.map((t, qi) => (
                <div key={qi} className="rounded-xl border border-white/10 p-3">
                  <div className="font-semibold mb-2">{qi + 1}) {t.q}</div>
                  <div className="grid gap-2">
                    {t.opts.map((opt, ai) => (
                      <label key={ai} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`q${qi}`}
                          className="accent-white"
                          checked={answers[qi] === ai}
                          onChange={() => handlePick(qi, ai)}
                        />
                        <span className={checked ? (ai === t.a ? 'text-emerald-300' : answers[qi] === ai ? 'text-rose-300' : '') : ''}>
                          {String.fromCharCode(65 + ai)}. {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-sm text-white/70">
                {checked ? <>Wynik: <span className="text-white font-semibold">{score}/{activeQuestions.length}</span></> : 'Zaznacz odpowiedzi i sprawdź wynik.'}
              </div>
              <div className="flex items-center gap-3">
                {!checked && (
                  <button
                    type="button"
                    onClick={() => setChecked(true)}
                    className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    Sprawdź odpowiedzi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setQuizOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
