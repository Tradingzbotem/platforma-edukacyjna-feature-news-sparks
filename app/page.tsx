'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, ShieldCheck, LineChart } from 'lucide-react';
import VersionToggle from '@/app/components/VersionToggle';

// Pasek z newsem dnia (zastępuje ticker z aktywami)
import InfoOfDayBanner from '@/components/News/InfoOfDayBanner';

// Nowa wersja strony głównej (lazy load)
const HomePageNew = dynamic(() => import('./page-new'), { ssr: false });

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
  const searchParams = useSearchParams();
  const useNewVersion = searchParams?.get('v') === 'new';

  // Jeśli użyto ?v=new, renderuj nową wersję
  // (Wrapper, żeby nie łamać rules-of-hooks w starej wersji)
  return useNewVersion ? <HomePageNew /> : <HomePageOld />;
}

function HomePageOld() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string>('Quiz');
  const [activeQuestions, setActiveQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  // Login state for conditional CTA
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  // UI: wybór pakietu (segment control w prawej karcie)
  type PlanTier = 'starter' | 'pro' | 'elite';
  const [selectedPlanTier, setSelectedPlanTier] = useState<PlanTier>('starter');

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

  // Heuristic cookie check (legacy 'auth=1') to avoid flash
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const hasLegacyAuth = /(?:^|; )auth=1(?:;|$)/.test(document.cookie);
    if (hasLegacyAuth && isLoggedIn == null) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  // Verify session via API
  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (!res.ok) {
          if (isActive) setIsLoggedIn((prev) => prev ?? false);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (isActive) setIsLoggedIn(Boolean((data as any)?.isLoggedIn));
      } catch {
        if (isActive) setIsLoggedIn((prev) => prev ?? false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main id="content" className="min-h-screen bg-slate-950 text-white">
      <VersionToggle />

      {/* News dnia – zastępuje pasek z aktywami */}
      <InfoOfDayBanner />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-24">
          <div className="grid md:grid-cols-12 items-start gap-10 animate-fade-in">
            {/* Lewa kolumna */}
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full px-4 py-1.5 text-xs font-medium mb-6 shadow-lg hover:shadow-xl hover:border-emerald-400/50 transition-all duration-300">
                <BadgeIcon />
                <span className="tracking-wider text-emerald-200 font-semibold">RYNEK NIE SPEŁNIA OCZEKIWAŃ. RYNEK STWARZA WARUNKI.</span>
              </div>
              <div className="text-sm text-emerald-300/80 mb-6 font-medium tracking-wide">Inwestor nie decyduje — inwestor reaguje.</div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
                <span className="block bg-gradient-to-r from-white via-white to-emerald-100 bg-clip-text text-transparent">
                  Dlaczego tracisz na giełdzie, a nie zarabiasz?
                </span>
              </h1>
              
              <p className="mt-6 text-xl sm:text-2xl text-white/90 max-w-3xl leading-relaxed font-medium mb-6">
                Bo większość inwestorów próbuje <span className="text-emerald-300 font-semibold">decydować</span>,
                zamiast <span className="text-emerald-300 font-semibold">reagować</span> na warunki, które tworzy rynek.
              </p>
              
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm">
                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-4">
                  Rynek nie jest maszyną do spełniania oczekiwań.
                </p>
                <p className="text-lg sm:text-xl text-white/85 leading-relaxed">
                  To dynamiczny system oparty na <span className="text-emerald-300 font-semibold">czasie</span>, <span className="text-emerald-300 font-semibold">zmienności</span>, <span className="text-emerald-300 font-semibold">wolumenie</span> i <span className="text-emerald-300 font-semibold">przepływie informacji</span>.
                  Zarabiają ci, którzy potrafią rozpoznać moment, gdy te elementy zaczynają się układać w przewagę.
                </p>
              </div>
              
              <div className="mt-8 mb-6">
                <div className="inline-block px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
                  <span className="text-lg font-bold text-emerald-200 tracking-wide">FXEduLab</span>
                  <span className="text-lg text-white/90 ml-2">porządkuje ten proces.</span>
                </div>
              </div>
              
              <div className="mt-8 space-y-1">
                <p className="text-lg text-white/80 max-w-3xl">
                  Nie pytasz <span className="text-white/60 italic">„co rynek zrobi?”</span>.
                </p>
                <p className="text-xl font-semibold text-white/95 mb-6">
                  Pytasz:
                </p>
              </div>
              
              <ul className="mt-6 space-y-4 max-w-3xl">
                <li className="flex items-start gap-4 group">
                  <span aria-hidden className="text-2xl text-emerald-400 mt-0.5 font-bold group-hover:text-emerald-300 transition-colors">•</span>
                  <span className="text-lg sm:text-xl text-white/90 leading-relaxed group-hover:text-white transition-colors">
                    Czy pojawiło się <span className="font-semibold text-emerald-300">momentum</span>?
                  </span>
                </li>
                <li className="flex items-start gap-4 group">
                  <span aria-hidden className="text-2xl text-emerald-400 mt-0.5 font-bold group-hover:text-emerald-300 transition-colors">•</span>
                  <span className="text-lg sm:text-xl text-white/90 leading-relaxed group-hover:text-white transition-colors">
                    Czy <span className="font-semibold text-emerald-300">wolumen</span> potwierdza ruch?
                  </span>
                </li>
                <li className="flex items-start gap-4 group">
                  <span aria-hidden className="text-2xl text-emerald-400 mt-0.5 font-bold group-hover:text-emerald-300 transition-colors">•</span>
                  <span className="text-lg sm:text-xl text-white/90 leading-relaxed group-hover:text-white transition-colors">
                    Jakie są <span className="font-semibold text-emerald-300">scenariusze A/B/C</span>?
                  </span>
                </li>
                <li className="flex items-start gap-4 group">
                  <span aria-hidden className="text-2xl text-emerald-400 mt-0.5 font-bold group-hover:text-emerald-300 transition-colors">•</span>
                  <span className="text-lg sm:text-xl text-white/90 leading-relaxed group-hover:text-white transition-colors">
                    Czy <span className="font-semibold text-emerald-300">makro i newsy</span> wspierają czy podważają ten kierunek?
                  </span>
                </li>
              </ul>
            </div>

            {/* Prawa kolumna — Panel przed decyzją (preview) */}
            <div className="md:col-span-5">
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-emerald-400/40 via-emerald-400/10 to-transparent shadow-glow hover:shadow-glow-hover transition-all duration-300">
                <aside className="rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/10 p-7 max-w-[440px] shadow-lg">
                  <h3 className="text-lg font-semibold">Panel przed decyzją</h3>
                  <p className="mt-1 text-xs text-white/70">Szybki kontekst, zanim określisz swoją decyzję.</p>
                  <ul className="mt-5 space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                      <span>Trend i struktura ceny</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                      <span>Wolumen i momentum</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                      <span>Kontekst makro / news</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                      <span>Kalendarz wydarzeń</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                      <span>Scenariusze A / B</span>
                    </li>
                  </ul>
                  <div className="mt-4 h-px bg-white/10" />
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-white/80">Co daje pakiet</div>
                    <ul className="mt-2 space-y-1.5 text-[13px] text-white/75">
                      <li className="flex items-start gap-2">
                        <span className="text-white/50">•</span>
                        <span>Potwierdzenia z analizy technicznej i fundamentalnej</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-white/50">•</span>
                        <span>Momentum i ograniczenie ryzyka</span>
                      </li>
                    </ul>
                  </div>
                  {/* Subtelny wybór pakietu: segment control z animacją */}
                  <div className="mt-5 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 space-y-2">
                    <div className="text-xs text-white/60">Pakiety:</div>
                    <div className="relative">
                      {/* Tło z przesuwanym podświetleniem */}
                      <div
                        className="absolute inset-y-0 left-0 w-1/3 rounded-md bg-white/10 ring-1 ring-white/10 transition-transform duration-300 ease-out"
                        style={{
                          transform:
                            selectedPlanTier === 'starter'
                              ? 'translateX(0%)'
                              : selectedPlanTier === 'pro'
                              ? 'translateX(100%)'
                              : 'translateX(200%)',
                        }}
                        aria-hidden
                      />
                      {/* Segmenty */}
                      <div className="relative grid grid-cols-3 gap-0 rounded-md overflow-hidden border border-white/10 bg-white/[0.06]">
                        {(['starter','pro','elite'] as PlanTier[]).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setSelectedPlanTier(tier)}
                            className={`h-8 text-[11px] font-semibold tracking-wide transition-colors ${
                              selectedPlanTier === tier ? 'text-white' : 'text-white/80 hover:text-white'
                            }`}
                            aria-pressed={selectedPlanTier === tier}
                          >
                            {tier === 'starter' ? 'STARTER' : tier === 'pro' ? 'PRO' : 'ELITE'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/70">
                        Wybrano:{' '}
                        <span className="font-semibold text-white">
                          {selectedPlanTier === 'starter' ? 'STARTER' : selectedPlanTier === 'pro' ? 'PRO' : 'ELITE'}
                        </span>
                      </div>
                      <Link
                        href="/ebooki#plany"
                        className="text-sm font-semibold text-emerald-300 hover:text-emerald-200 underline decoration-white/20 hover:decoration-white/40"
                        aria-label="Wybierz pakiet"
                      >
                        Wybierz
                      </Link>
                    </div>
                  </div>
                  <p className="mt-5 text-[11px] text-white/70">Bez rekomendacji — decyzja po Twojej stronie.</p>
                  <p className="mt-1 text-[11px] text-white/50">Podgląd — pełny kontekst w panelu i materiałach.</p>
                </aside>
              </div>
              
              {/* Końcowa sekcja tekstu */}
              <div className="mt-8 max-w-[440px]">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm">
                  <p className="text-lg text-white/90 leading-relaxed mb-3">
                    Dopiero wtedy podejmujesz decyzję.
                  </p>
                  <p className="text-xl font-bold text-white leading-relaxed">
                    Nie handlujesz <span className="text-red-300 line-through">prognozy</span>.
                    <br />
                    Handlujesz <span className="text-emerald-300">warunki</span>, które rynek właśnie tworzy.
                  </p>
                </div>
                
                <div className="mt-6 flex flex-col gap-3">
                  {isLoggedIn ? (
                    <Link href="/konto/panel-rynkowy" className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-md hover:shadow-lg text-center">
                      Zobacz, jak wygląda panel
                    </Link>
                  ) : null}
                  <Link
                    href="/ebooki#plany"
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-sm hover:shadow-md border border-white/10 text-center"
                  >
                    Poznaj pakiety
                  </Link>
                </div>
                
                <p className="mt-4 text-xs text-white/60">
                  Treści mają charakter edukacyjny i analityczny. Decyzje inwestycyjne podejmujesz samodzielnie.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dekoracje */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </section>

      

      {/* DECISION STRIP — aphorisms guiding better decisions */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Zasada cierpliwości', value: 'Brak decyzji to też decyzja' },
            { label: 'Powiedzenie rynku', value: 'Kupuj plotki, sprzedawaj fakty' },
            { label: 'Higiena tradingu', value: 'Emocje nie są dobrym doradcą' },
            { label: 'Perspektywa dynamiki', value: 'Rynek to organizm, nie maszyna' },
          ].map((s) => (
            <div
              key={s.label}
              tabIndex={0}
              className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-emerald-400/50"
            >
              {/* animated glow backdrop */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute -inset-10 aurora blur-2xl" />
              </div>
              {/* glossy light at the top */}
              <div className="pointer-events-none absolute inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-70" />

              <div className="relative z-10 text-xl sm:text-2xl font-extrabold tracking-tight leading-snug antialiased [text-wrap:balance]">
                {s.value}
              </div>
              <div className="relative z-10 mt-2 text-xs sm:text-sm text-white/75 tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POLECANE KURSY */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold">Polecane kursy</h2>
                <div className="flex items-center gap-2 text-white/80">
                  {[...Array(5)].map((_, i) => <Star key={i} />)}
                  <span className="text-sm">4.8 na podstawie 1 245 opinii</span>
                </div>
              </div>
              <p className="text-white/70 mt-2">Zacznij od podstaw i przechodź do bardziej zaawansowanych tematów.</p>
            </div>
            <Link href="/kursy" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50">
              Zobacz wszystkie
            </Link>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[0,1,2,3].map((i) => (
              <article key={i} className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 focus-within:ring-2 focus-within:ring-emerald-400/50">
                {/* glossy inner overlay */}
                <div className="pointer-events-none absolute inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-70" />
                <div className="relative z-10">
                  <div className="text-xs font-semibold tracking-widest text-white/60">{['PODSTAWY','PODSTAWY','CFD','ZAAWANSOWANE'][i]}</div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug">{['Wprowadzenie do rynku Forex','Zarządzanie ryzykiem i wielkość pozycji','CFD na indeksy i surowce – praktyka','Testowanie strategii: od hipotezy do wyników'][i]}</h3>
                  <p className="mt-2 text-sm text-white/70">{['Poznaj strukturę rynku, uczestników, płynność i interwały.','Obliczaj wielkość pozycji w pips/lot i trzymaj się R-multiple.','Finansowanie overnight, poślizg, sesje – praktyczne przykłady.','Stabilność statystyczna, out-of-sample, walk-forward (koncepcje).'][i]}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-white/70">
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden="true">🎥</span>
                      <span>{[8,6,9,7][i]}</span>
                      <span>Lekcje</span>
                    </span>
                    <span>⏱ {['2h 15m','1h 40m','2h 05m','2h 30m'][i]}</span>
                    <span>📈 {['Początkujący','Średniozaawansowany','Średniozaawansowany','Zaawansowany'][i]}</span>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <Link href={['/kursy/forex','/kursy/podstawy','/kursy/cfd','/kursy/zaawansowane'][i]} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-md hover:shadow-lg">
                      Rozpocznij
                    </Link>
                    <button
                      type="button"
                      onClick={() => openQuiz(10, 'Próbny test')}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 border border-white/10 shadow-sm hover:shadow-md"
                    >
                      Zagraj próbny test
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AI QUICK INFO — DUŻY CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative overflow-hidden rounded-2xl p-10 md:p-12 text-left border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md shadow-lg shadow-black/30 transition-all duration-300 hover:shadow-xl hover:shadow-black/40">
            {/* subtle inner gloss */}
            <div className="pointer-events-none absolute inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-70" />
            {/* emerald/cyan glow overlays */}
            <div className="pointer-events-none absolute -top-20 right-0 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-2 items-start">
              {/* Left column */}
              <div>
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur rounded-full px-3 py-1 text-xs mb-4">
                  <BadgeIcon />
                  <span className="tracking-wide">Rynek na czas</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold">Rynek w pigułce: co dziś rusza ceny</h3>
                <p className="mt-3 text-white/80 max-w-2xl">
                  Na bieżąco skanujemy wiarygodne źródła i podajemy najważniejsze informacje — zwięźle i bez rekomendacji inwestycyjnych.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href="/news"
                    className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Bądź na bieżąco z AI
                  </Link>
                  <Link
                    href="/news?refresh=now"
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 border border-white/10 shadow-sm hover:shadow-md"
                  >
                    Odśwież teraz
                  </Link>
                </div>
              </div>

              {/* Right mini panel */}
              <aside className="relative rounded-2xl p-5 border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/50">
                <div className="pointer-events-none absolute inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-70" />
                <div className="text-sm font-semibold">Dziś w pigułce</div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                    <span>Kalendarz makro (godziny + wpływ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                    <span>Najważniejsze nagłówki (kontekst)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                    <span>Poziomy techniczne (reakcje rynku)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="text-emerald-300 mt-0.5">✓</span>
                    <span>Zmienność / sentyment (krótko)</span>
                  </li>
                </ul>
                <div className="mt-3 text-[11px] text-white/60">Edukacyjnie — bez rekomendacji.</div>
              </aside>
            </div>

            {/* Źródło wykresów — widoczna atrybucja */}
            <div className="relative z-10 mt-8">
              <div className="mx-auto max-w-2xl">
                <div className="flex items-start justify-center gap-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur px-4 py-3 text-sm">
                  <div className="mt-0.5">
                    <LineChart className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <div className="text-white/90">
                      Wykresy dostarcza:{' '}
                      <a
                        href="https://www.tradingview.com/"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-semibold underline decoration-white/20 hover:decoration-white/40"
                      >
                        TradingView
                      </a>
                      <ExternalLink className="inline-block align-[-2px] ml-1 w-3.5 h-3.5 text-white/60" aria-hidden="true" />
                    </div>
                    <div className="mt-0.5 text-[11px] text-white/60">Źródło wykresów na platformie.</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="relative z-10 mt-3 text-xs text-slate-400/80 text-center">Edukacyjnie — bez rekomendacji inwestycyjnych.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative overflow-hidden rounded-2xl p-10 md:p-12 text-center bg-gradient-to-br from-slate-900 via-slate-900 to-zinc-900 border border-white/10 shadow-2xl shadow-black/40 hover:shadow-3xl transition-shadow duration-300">
            {/* emerald/cyan subtle glows */}
            <div className="pointer-events-none absolute -top-16 -right-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-glow" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />

            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur rounded-full px-3 py-1 text-xs mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-300/80" />
              <span className="tracking-wide">Weryfikacja brokera</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Sprawdź brokera zanim zainwestujesz</h3>
            <p className="mt-3 text-slate-300/80 max-w-3xl mx-auto">
              Zweryfikuj licencję i ostrzeżenia w oficjalnych rejestrach nadzoru. Kliknij instytucję:
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* KNF (PL) */}
              <a
                href="https://www.knf.gov.pl/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group relative rounded-xl h-20 border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40"
                aria-label="KNF (PL) — Oficjalna strona"
              >
                <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-400/40 opacity-60 group-hover:opacity-80" />
                <div className="flex items-center justify-between h-full px-4">
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Image
                        src="/logos/regulators/knf.svg"
                        alt="KNF logo"
                        className="h-6 w-auto object-contain brightness-0 invert"
                        width={24}
                        height={20}
                      />
                      <span className="text-base sm:text-lg">KNF</span>
                    </div>
                    <div className="text-xs text-slate-300/70">PL · Oficjalna strona</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/80" aria-hidden="true" />
                </div>
              </a>
              {/* FCA (UK) */}
              <a
                href="https://register.fca.org.uk/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group relative rounded-xl h-20 border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40"
                aria-label="FCA (UK) — Rejestr"
              >
                <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-400/40 opacity-60 group-hover:opacity-80" />
                <div className="flex items-center justify-between h-full px-4">
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Image
                        src="/logos/regulators/fca.svg"
                        alt="FCA logo"
                        className="h-6 w-auto object-contain brightness-0 invert"
                        width={24}
                        height={20}
                      />
                      <span className="text-base sm:text-lg">FCA</span>
                    </div>
                    <div className="text-xs text-slate-300/70">UK · Rejestr</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/80" aria-hidden="true" />
                </div>
              </a>
              {/* CySEC (CY) */}
              <a
                href="https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group relative rounded-xl h-20 border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40"
                aria-label="CySEC (CY) — Rejestr"
              >
                <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-400/40 opacity-60 group-hover:opacity-80" />
                <div className="flex items-center justify-between h-full px-4">
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Image
                        src="/logos/regulators/cysec.svg"
                        alt="CySEC logo"
                        className="h-6 w-auto object-contain brightness-0 invert"
                        width={24}
                        height={20}
                      />
                      <span className="text-base sm:text-lg">CySEC</span>
                    </div>
                    <div className="text-xs text-slate-300/70">CY · Rejestr</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/80" aria-hidden="true" />
                </div>
              </a>
              {/* BaFin (DE) */}
              <a
                href="https://www.bafin.de/EN/Homepage/homepage_node.html"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group relative rounded-xl h-20 border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40"
                aria-label="BaFin (DE) — Oficjalna strona"
              >
                <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-400/40 opacity-60 group-hover:opacity-80" />
                <div className="flex items-center justify-between h-full px-4">
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Image
                        src="/logos/regulators/bafin.svg"
                        alt="BaFin logo"
                        className="h-6 w-auto object-contain brightness-0 invert"
                        width={24}
                        height={20}
                      />
                      <span className="text-base sm:text-lg">BaFin</span>
                    </div>
                    <div className="text-xs text-slate-300/70">DE · Oficjalna strona</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/80" aria-hidden="true" />
                </div>
              </a>
              {/* FINMA (CH) */}
              <a
                href="https://www.finma.ch/en/finma-public/authorised-institutions-individuals-and-products/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group relative rounded-xl h-20 border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40"
                aria-label="FINMA (CH) — Rejestr"
              >
                <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-400/40 opacity-60 group-hover:opacity-80" />
                <div className="flex items-center justify-between h-full px-4">
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Image
                        src="/logos/regulators/FINMA.svg"
                        alt="FINMA logo"
                        className="h-6 w-auto object-contain brightness-0 invert"
                        width={24}
                        height={20}
                      />
                      <span className="text-base sm:text-lg">FINMA</span>
                    </div>
                    <div className="text-xs text-slate-300/70">CH · Rejestr</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/80" aria-hidden="true" />
                </div>
              </a>
              {/* CSSF (LU) */}
              <a
                href="https://www.cssf.lu/en/supervision/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group relative rounded-xl h-20 border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40"
                aria-label="CSSF (LU) — Oficjalna strona"
              >
                <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-400/40 opacity-60 group-hover:opacity-80" />
                <div className="flex items-center justify-between h-full px-4">
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Image
                        src="/logos/regulators/cssf.svg"
                        alt="CSSF logo"
                        className="h-6 w-auto object-contain brightness-0 invert"
                        width={24}
                        height={20}
                      />
                      <span className="text-base sm:text-lg">CSSF</span>
                    </div>
                    <div className="text-xs text-slate-300/70">LU · Oficjalna strona</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/80" aria-hidden="true" />
                </div>
              </a>
              {/* FSMA (BE) */}
              <a
                href="https://www.fsma.be/en/warnings"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group relative rounded-xl h-20 border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40"
                aria-label="FSMA (BE) — Ostrzeżenia"
              >
                <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-400/40 opacity-60 group-hover:opacity-80" />
                <div className="flex items-center justify-between h-full px-4">
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Image
                        src="/logos/regulators/FSMA.svg"
                        alt="FSMA logo"
                        className="h-6 w-auto object-contain brightness-0 invert"
                        width={24}
                        height={20}
                      />
                      <span className="text-base sm:text-lg">FSMA</span>
                    </div>
                    <div className="text-xs text-slate-300/70">BE · Ostrzeżenia</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/80" aria-hidden="true" />
                </div>
              </a>
            </div>

            <p className="mt-6 text-xs text-white/60 max-w-3xl mx-auto">
              Linki mają charakter informacyjny. Serwis nie jest powiązany z regulatorami i nie stanowi rekomendacji ani doradztwa inwestycyjnego.
            </p>
          </div>
        </div>
      </section>

      {/* QUIZ MODAL */}
      {quizOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={quizTitle}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setQuizOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-3xl rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/10 p-6 shadow-2xl outline-none animate-fade-in-scale"
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
                    className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Sprawdź odpowiedzi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setQuizOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 border border-white/10 shadow-sm hover:shadow-md"
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
