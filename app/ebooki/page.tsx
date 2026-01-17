// app/ebooki/page.tsx — Pakiety handlu na rynku Forex
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useLang } from '@/lib/i18n-client';
import { t, type Lang as DictLang } from '@/lib/i18n';
import { BookOpen, Target, Users, CheckCircle2 } from 'lucide-react';

export default function EbookiPage() {
  const lang = useLang('pl');
  const dictLang: DictLang = lang === 'en' ? 'en' : 'pl';
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const handleChoose = useCallback(async (planId: 'starter' | 'pro' | 'elite') => {
    const planName = planId === 'starter' ? 'STARTER EDU' : planId === 'pro' ? 'PRO EDU' : 'ELITE EDU';
    const message = encodeURIComponent(`Dzień dobry,\n\nChcę skorzystać z darmowego tygodnia próbnego dla pakietu ${planName}.\nProszę o kontakt w sprawie aktywacji.\n\nPozdrawiam,\n`);
    const target = `/kontakt?topic=zakup-pakietu&plan=${encodeURIComponent(planId)}&message=${message}`;
    router.push(target);
  }, [router]);

  const scrollToPlany = useCallback(() => {
    document.getElementById('plany')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* SEKCJA A: HERO (split left/right) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        {/* Back to home */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded transition-colors"
          >
            ← Wróć do strony głównej
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Lewa kolumna - tekst */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span className="tracking-wide">PAKIETY EDUKACYJNE</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Opanuj handel na rynku Forex dzięki zrozumieniu go od środka.
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
              Nasze kompleksowe pakiety zrozumienia rynku wspierają zarówno aktywnych traderów, jak i inwestorów portfelowych — pomagają pewniej poruszać się po rynku Forex wartym codziennie ok. 6,6 bln USD.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={scrollToPlany}
                className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
              >
                Odkryj pakiety
              </button>
              <Link
                href={`/kontakt?topic=ogolne&subject=${encodeURIComponent("Darmowy dostęp")}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
              >
                Wypróbuj bezpłatnie
              </Link>
            </div>
          </div>

          {/* Prawa kolumna - obraz */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
              <img
                src="/pakiety/pakiety.png"
                alt="Pakiety edukacyjne FxEduLab"
                className="w-full h-auto object-contain"
              />
              {/* Subtle glow */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA B: Pakiety handlu + Dlaczego warto */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
            Pakiety handlu na rynku Forex dla inwestorów i traderów
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Dlaczego warto uczyć się w FxEduLab?
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            W FxEduLab wierzymy, że handel na rynku jest dostępny dla każdego. Kursy, quizy i pakiety łączą wiedzę teoretyczną z praktycznymi zastosowaniami, prowadząc Cię przez każdy etap przygody z rynkiem.
          </p>
        </div>

        {/* 3 kafelki */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
          {[
            {
              icon: BookOpen,
              title: 'Doświadczenie i zrozumienie rynku',
              desc: 'Fundament oparty na kontekście i zrozumieniu, bez zgadywania. Poznaj mechanizmy rynku od podstaw.',
            },
            {
              icon: Target,
              title: 'Praktyczne podejście',
              desc: 'Przykłady, ćwiczenia i zastosowanie od razu na platformie. Wiedza, którą możesz wykorzystać natychmiast.',
            },
            {
              icon: Users,
              title: 'Ciągłe wsparcie',
              desc: 'Odpowiedzi na pytania, wskazówki i prowadzenie w ramach edukacji. Nie zostawiamy Cię samego.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 mb-4">
                <item.icon className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEKCJA C: Dla kogo są nasze pakiety */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
            Naucz się handlu na rynku
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Dla kogo są nasze pakiety
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Stworzone dla osób, które chcą poznać podstawy handlu na rynku.
          </p>
          <Link
            href="/rejestracja"
            className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-bold px-8 py-4 text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
          >
            ZAREJESTRUJ SIĘ TERAZ
          </Link>
        </div>

        {/* 2 duże karty */}
        <div className="grid gap-6 md:grid-cols-2 mt-12">
          {[
            {
              title: 'HANDLOWCY',
              desc: 'Idealne dla tych, którzy poszukują zrozumienia rynku, a nie prowadzenia za rękę.',
              link: '/kursy',
              linkText: 'Przeglądaj kursy',
              gradient: 'from-emerald-500/10 to-emerald-600/5',
              border: 'border-emerald-400/20',
            },
            {
              title: 'INWESTORZY',
              desc: 'Idealne dla osób chcących poszerzać swoją wiedzę i rozumieć, co faktycznie wpływa na rynek.',
              link: '/kursy',
              linkText: 'Przeglądaj kursy',
              gradient: 'from-cyan-500/10 to-cyan-600/5',
              border: 'border-cyan-400/20',
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-8 hover:border-opacity-40 transition-all`}
            >
              <h3 className="text-3xl md:text-4xl font-extrabold mb-4">{card.title}</h3>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">{card.desc}</p>
              <Link
                href={card.link}
                className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
              >
                {card.linkText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SEKCJA D: PAKIETY / PLANY */}
      <section id="plany" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            {t(dictLang, 'plans_title')}
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
            Masz kontekst na tacy: momentum, scenariusze A/B/C, checklisty, statystykę i ramy ryzyka. Zamiast szukać informacji po wielu źródłach — łączysz je w jeden proces decyzyjny.
          </p>
        </div>

        {/* Przełącznik rozliczania */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                billing === 'monthly' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              {t(dictLang, 'billing_monthly')}
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`ml-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                billing === 'yearly' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              {t(dictLang, 'billing_yearly_2mo')}
            </button>
          </div>
        </div>

        {/* Karty planów */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-10">
          {[
            {
              id: 'starter' as const,
              name: t(dictLang, 'plan_starter_name'),
              price: '59',
              features: [
                t(dictLang, 'plan_starter_1'),
                t(dictLang, 'plan_starter_2'),
                t(dictLang, 'plan_starter_3'),
              ],
              accentClass: 'text-white/70',
              popular: false,
            },
            {
              id: 'pro' as const,
              name: t(dictLang, 'plan_pro_name'),
              price: '110',
              features: [
                t(dictLang, 'plan_pro_1'),
                t(dictLang, 'plan_pro_2'),
                t(dictLang, 'plan_pro_3'),
              ],
              accentClass: 'text-emerald-300',
              popular: true,
            },
            {
              id: 'elite' as const,
              name: t(dictLang, 'plan_elite_name'),
              price: '199',
              features: [
                t(dictLang, 'plan_elite_1'),
                t(dictLang, 'plan_elite_2'),
                t(dictLang, 'plan_elite_3'),
              ],
              accentClass: 'text-cyan-300',
              popular: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 transition ${
                plan.popular ? 'ring-1 ring-emerald-300/40' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4 inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
                  {t(dictLang, 'plan_most_popular')}
                </div>
              )}
              <div className={`text-xs font-semibold tracking-widest ${plan.accentClass}`}>
                {plan.name}
              </div>
              <div className="mt-2 text-3xl font-extrabold">
                {(() => {
                  const monthly = plan.id === 'starter' ? 59 : plan.id === 'pro' ? 110 : 199;
                  const yearly = plan.id === 'starter' ? 590 : plan.id === 'pro' ? 1100 : 1900;
                  const value = billing === 'monthly' ? monthly : yearly;
                  return (
                    <>
                      {value} {t(dictLang, 'currency_pln')}
                      <span className="text-base font-semibold text-white/60">
                        {billing === 'monthly' ? t(dictLang, 'per_month') : t(dictLang, 'per_year')}
                      </span>
                    </>
                  );
                })()}
              </div>
              {plan.id === 'elite' && (
                <div className="mt-2 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
                  {t(dictLang, 'elite_plus_badge')}
                </div>
              )}
              <div className="mt-2 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                Darmowe 7 dni
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleChoose(plan.id)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-4 py-2.5 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
                >
                  Wybierz plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEKCJA E: Kroki sukcesu */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
            Kroki sukcesu
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Nasze podejście do nauczania
          </h2>
        </div>

        {/* 4 kafelki */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-10">
          {[
            {
              number: '1',
              title: 'UCZYĆ SIĘ',
              desc: 'Zbuduj solidny fundament dzięki jasnym lekcjom podstaw rynku Forex i wykorzystuj je z dostępnymi pakietami.',
            },
            {
              number: '2',
              title: 'PRAKTYKA',
              desc: 'Twórz i sprawdzaj checklisty oraz challenge na platformie.',
            },
            {
              number: '3',
              title: 'STOSOWAĆ',
              desc: 'Wdrażaj wiedzę w rzeczywistych warunkach rynkowych, dbając o zarządzanie ryzykiem i bezpieczeństwo.',
            },
            {
              number: '4',
              title: 'GOSPODARZ',
              desc: 'Dopracuj swoje podejście i rozwiń unikalny styl.',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STOPKA / DISCLAIMER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-center">
          <p className="text-amber-200 text-sm">
            Materiały edukacyjne. Bez rekomendacji inwestycyjnych i sygnałów rynkowych.
          </p>
        </div>
      </section>
    </main>
  );
}
