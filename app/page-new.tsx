'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, ShieldCheck, LineChart, CheckCircle2 } from 'lucide-react';
import VersionToggle from '@/app/components/VersionToggle';

// Pasek z newsem dnia (zastępuje ticker z aktywami)
import InfoOfDayBanner from '@/components/News/InfoOfDayBanner';

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

export default function HomePageNew() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string>('Quiz');
  const [activeQuestions, setActiveQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  type PlanTier = 'starter' | 'pro' | 'elite';
  const [selectedPlanTier, setSelectedPlanTier] = useState<PlanTier>('starter');
  const modalRef = useRef<HTMLDivElement | null>(null);

  const score = useMemo(
    () => answers.reduce((acc, v, i) => (v === activeQuestions[i]?.a ? acc + 1 : acc), 0),
    [answers, activeQuestions]
  );

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

  useEffect(() => {
    if (!quizOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuizOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const btn = modalRef.current?.querySelector<HTMLButtonElement>('button[data-close]');
    btn?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [quizOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const hasLegacyAuth = /(?:^|; )auth=1(?:;|$)/.test(document.cookie);
    if (hasLegacyAuth && isLoggedIn == null) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

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

      {/* HERO - Nowy styl */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Lewa kolumna - tekst */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span className="tracking-wide">RYNEK NIE SPEŁNIA OCZEKIWAŃ. RYNEK STWARZA WARUNKI.</span>
            </div>
            <div className="text-xs text-white/60 mb-4">Inwestor nie decyduje — inwestor reaguje.</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              <span className="block">Dlaczego tracisz na giełdzie, a nie zarabiasz?</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-6 max-w-2xl">
              Bo większość inwestorów próbuje decydować,
              zamiast reagować na warunki, które tworzy rynek.
            </p>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
              Rynek nie jest maszyną do spełniania oczekiwań.
              To dynamiczny system oparty na czasie, zmienności, wolumenie i przepływie informacji.
              Zarabiają ci, którzy potrafią rozpoznać moment, gdy te elementy zaczynają się układać w przewagę.
            </p>

            <div className="mb-6">
              <div className="text-sm font-semibold text-white/90 mb-3">FXEduLab porządkuje ten proces.</div>
              <p className="text-sm text-white/80 mb-3">
                Nie pytasz „co rynek zrobi?”.
                Pytasz:
              </p>
              <ul className="grid gap-3 sm:grid-cols-1">
                {[
                  'Czy pojawiło się momentum?',
                  'Czy wolumen potwierdza ruch?',
                  'Jakie są scenariusze A/B/C?',
                  'Czy makro i newsy wspierają czy podważają ten kierunek?',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-300">•</span>
                    <span className="text-sm text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-white/80 text-base mb-2 max-w-xl">
              Dopiero wtedy podejmujesz decyzję.
            </p>
            <p className="text-white/80 text-base mb-8 max-w-xl">
              Nie handlujesz prognozy.
              Handlujesz warunki, które rynek właśnie tworzy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {isLoggedIn ? (
                <Link
                  href="/konto/panel-rynkowy"
                  className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
                >
                  Zobacz, jak wygląda panel
                </Link>
              ) : null}
              <Link
                href="/ebooki#plany"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
              >
                Poznaj pakiety
              </Link>
            </div>
            <p className="text-xs text-white/60 max-w-2xl">
              Treści mają charakter edukacyjny i analityczny. Decyzje inwestycyjne podejmujesz samodzielnie.
            </p>
          </div>

          {/* Prawa kolumna - Panel przed decyzją */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6">
              <h3 className="text-xl font-bold mb-2">Panel przed decyzją</h3>
              <p className="text-sm text-white/70 mb-6">Szybki kontekst, zanim określisz swoją decyzję.</p>
              <ul className="space-y-3 mb-6">
                {[
                  'Trend i struktura ceny',
                  'Wolumen i momentum',
                  'Kontekst makro / news',
                  'Kalendarz wydarzeń',
                  'Scenariusze A / B',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                    <span className="text-sm text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="h-px bg-white/10 mb-6" />
              <div className="mb-6">
                <div className="text-xs font-semibold text-white/80 mb-2">Co daje pakiet</div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
                    <span>Potwierdzenia z analizy technicznej i fundamentalnej</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
                    <span>Momentum i ograniczenie ryzyka</span>
                  </li>
                </ul>
              </div>
              {/* Wybór pakietu */}
              <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 space-y-3">
                <div className="text-xs text-white/60">Pakiety:</div>
                <div className="relative">
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
                  <div className="relative grid grid-cols-3 gap-0 rounded-md overflow-hidden border border-white/10 bg-white/5">
                    {(['starter', 'pro', 'elite'] as PlanTier[]).map((tier) => (
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
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/20 px-3 py-2">
                  <div className="text-xs font-semibold text-emerald-300 mb-1">🎁 Darmowy tydzień</div>
                  <div className="text-[11px] text-white/80">Wypróbuj pakiet przez 7 dni za darmo</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/70">
                    Wybrano:{' '}
                    <span className="font-semibold text-white">
                      {selectedPlanTier === 'starter' ? 'STARTER' : selectedPlanTier === 'pro' ? 'PRO' : 'ELITE'}
                    </span>
                  </div>
                  <Link
                    href={`/kontakt?topic=zakup-pakietu&plan=${selectedPlanTier}&message=${encodeURIComponent(`Dzień dobry,\n\nChcę skorzystać z darmowego tygodnia dla pakietu ${selectedPlanTier.toUpperCase()}.\nProszę o kontakt.\n\nPozdrawiam,\n`)}`}
                    className="text-sm font-semibold text-emerald-300 hover:text-emerald-200 underline decoration-white/20 hover:decoration-white/40"
                  >
                    Wybierz
                  </Link>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-white/60">Bez rekomendacji — decyzja po Twojej stronie.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DECISION STRIP */}
      <section className="border-t border-white/10 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Zasada cierpliwości', value: 'Brak decyzji to też decyzja' },
              { label: 'Powiedzenie rynku', value: 'Kupuj plotki, sprzedawaj fakty' },
              { label: 'Higiena tradingu', value: 'Emocje nie są dobrym doradcą' },
              { label: 'Perspektywa dynamiki', value: 'Rynek to organizm, nie maszyna' },
            ].map((s) => (
              <div
                key={s.label}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors text-center"
              >
                <div className="text-xl md:text-2xl font-extrabold tracking-tight mb-2">{s.value}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLECANE KURSY */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl md:text-4xl font-extrabold">Polecane kursy</h2>
              <div className="flex items-center gap-1 text-white/80">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.46a1 1 0 00-1.176 0l-3.38 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                ))}
                <span className="text-sm ml-1">4.8 na podstawie 1 245 opinii</span>
              </div>
            </div>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
              Zacznij od podstaw i przechodź do bardziej zaawansowanych tematów.
            </p>
            <Link
              href="/kursy"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
            >
              Zobacz wszystkie
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mt-10">
            {[
              {
                category: 'PODSTAWY',
                title: 'Wprowadzenie do rynku Forex',
                desc: 'Poznaj strukturę rynku, uczestników, płynność i interwały.',
                lessons: 8,
                time: '2h 15m',
                level: 'Początkujący',
                link: '/kursy/forex',
              },
              {
                category: 'PODSTAWY',
                title: 'Zarządzanie ryzykiem i wielkość pozycji',
                desc: 'Obliczaj wielkość pozycji w pips/lot i trzymaj się R-multiple.',
                lessons: 6,
                time: '1h 40m',
                level: 'Średniozaawansowany',
                link: '/kursy/podstawy',
              },
              {
                category: 'CFD',
                title: 'CFD na indeksy i surowce – praktyka',
                desc: 'Finansowanie overnight, poślizg, sesje – praktyczne przykłady.',
                lessons: 9,
                time: '2h 05m',
                level: 'Średniozaawansowany',
                link: '/kursy/cfd',
              },
              {
                category: 'ZAAWANSOWANE',
                title: 'Testowanie strategii: od hipotezy do wyników',
                desc: 'Stabilność statystyczna, out-of-sample, walk-forward (koncepcje).',
                lessons: 7,
                time: '2h 30m',
                level: 'Zaawansowany',
                link: '/kursy/zaawansowane',
              },
            ].map((course, i) => (
              <article
                key={i}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
              >
                <div className="text-xs font-semibold tracking-widest text-white/60 mb-3">{course.category}</div>
                <h3 className="text-lg font-bold mb-2 leading-snug">{course.title}</h3>
                <p className="text-sm text-white/70 mb-4 leading-relaxed">{course.desc}</p>
                <div className="flex items-center gap-4 text-xs text-white/70 mb-5">
                  <span>{course.lessons} Lekcje</span>
                  <span>⏱ {course.time}</span>
                  <span>📈 {course.level}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={course.link}
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity text-sm"
                  >
                    Rozpocznij
                  </Link>
                  <button
                    type="button"
                    onClick={() => openQuiz(10, 'Próbny test')}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors text-sm"
                  >
                    Test
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AI QUICK INFO */}
      <section className="border-t border-white/10 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="tracking-wide">RYNEK NA CZAS</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Rynek w pigułce: co dziś rusza ceny</h3>
                <p className="text-lg text-white/80 leading-relaxed mb-6 max-w-2xl">
                  Na bieżąco skanujemy wiarygodne źródła i podajemy najważniejsze informacje — zwięźle i bez rekomendacji inwestycyjnych.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/news"
                    className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
                  >
                    Bądź na bieżąco z AI
                  </Link>
                  <Link
                    href="/news?refresh=now"
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
                  >
                    Odśwież teraz
                  </Link>
                </div>
              </div>

              <aside className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6">
                <div className="text-sm font-semibold mb-4">Dziś w pigułce</div>
                <ul className="space-y-3">
                  {[
                    'Kalendarz makro (godziny + wpływ)',
                    'Najważniejsze nagłówki (kontekst)',
                    'Poziomy techniczne (reakcje rynku)',
                    'Zmienność / sentyment (krótko)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                      <span className="text-sm text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-[11px] text-white/60">Edukacyjnie — bez rekomendacji.</div>
              </aside>
            </div>

            <div className="mt-8">
              <div className="flex items-start justify-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm max-w-2xl mx-auto">
                <LineChart className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
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
                    <ExternalLink className="inline-block align-[-2px] ml-1 w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/60">Źródło wykresów na platformie.</div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-white/60 text-center">Edukacyjnie — bez rekomendacji inwestycyjnych.</p>

            {/* Subtle glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* CTA - Weryfikacja brokera */}
      <section className="border-t border-white/10 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="tracking-wide">WERYFIKACJA BROKERA</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Sprawdź brokera zanim zainwestujesz</h3>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              Zweryfikuj licencję i ostrzeżenia w oficjalnych rejestrach nadzoru. Kliknij instytucję:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'KNF', country: 'PL', type: 'Oficjalna strona', href: 'https://www.knf.gov.pl/', logo: '/logos/regulators/knf.svg' },
                { name: 'FCA', country: 'UK', type: 'Rejestr', href: 'https://register.fca.org.uk/', logo: '/logos/regulators/fca.svg' },
                { name: 'CySEC', country: 'CY', type: 'Rejestr', href: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/', logo: '/logos/regulators/cysec.svg' },
                { name: 'BaFin', country: 'DE', type: 'Oficjalna strona', href: 'https://www.bafin.de/EN/Homepage/homepage_node.html', logo: '/logos/regulators/bafin.svg' },
                { name: 'FINMA', country: 'CH', type: 'Rejestr', href: 'https://www.finma.ch/en/finma-public/authorised-institutions-individuals-and-products/', logo: '/logos/regulators/FINMA.svg' },
                { name: 'CSSF', country: 'LU', type: 'Oficjalna strona', href: 'https://www.cssf.lu/en/supervision/', logo: '/logos/regulators/cssf.svg' },
                { name: 'FSMA', country: 'BE', type: 'Ostrzeżenia', href: 'https://www.fsma.be/en/warnings', logo: '/logos/regulators/FSMA.svg' },
              ].map((reg) => (
                <a
                  key={reg.name}
                  href={reg.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src={reg.logo}
                      alt={`${reg.name} logo`}
                      className="h-5 w-auto object-contain brightness-0 invert"
                      width={20}
                      height={20}
                    />
                    <span className="font-semibold text-white">{reg.name}</span>
                  </div>
                  <div className="text-xs text-white/70">{reg.country} · {reg.type}</div>
                  <ExternalLink className="absolute top-2 right-2 w-4 h-4 text-white/40 group-hover:text-white/80" />
                </a>
              ))}
            </div>

            <p className="mt-8 text-xs text-white/60 max-w-3xl mx-auto">
              Linki mają charakter informacyjny. Serwis nie jest powiązany z regulatorami i nie stanowi rekomendacji ani doradztwa inwestycyjnego.
            </p>

            {/* Subtle glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-center">
            <p className="text-amber-200 text-sm">
              Materiały edukacyjne. Bez rekomendacji inwestycyjnych i sygnałów rynkowych.
            </p>
          </div>
        </div>
      </section>

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
                {checked ? (
                  <>
                    Wynik: <span className="text-white font-semibold">{score}/{activeQuestions.length}</span>
                  </>
                ) : (
                  'Zaznacz odpowiedzi i sprawdź wynik.'
                )}
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
