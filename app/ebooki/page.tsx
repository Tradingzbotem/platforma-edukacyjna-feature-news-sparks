// app/ebooki/page.tsx — Panel rynkowy (EDU)
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useLang } from '@/lib/i18n-client';
import { t, type Lang as DictLang } from '@/lib/i18n';

export default function EbookiPage() {
  const lang = useLang('pl');
  const dictLang: DictLang = lang === 'en' ? 'en' : 'pl';
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const handleChoose = useCallback(async (planId: 'starter' | 'pro' | 'elite') => {
    const target = `/kontakt?topic=zakup-pakietu&plan=${encodeURIComponent(planId)}`;
    router.push(target);
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Back to home */}
        <div className="mb-3">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
          >
            ← Wróć do strony głównej
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-7 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span className="tracking-wide">{t(dictLang, 'badge_edu')}</span>
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            {t(dictLang, 'market_panel_title')}
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl text-base md:text-lg leading-relaxed">
            {t(dictLang, 'market_panel_lead')}
          </p>
          <div className="mt-7">
            <button
              type="button"
              onClick={() =>
                document.getElementById('plany')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-5 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {t(dictLang, 'choose_plan')}
            </button>
          </div>

          {/* subtle glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
      </section>

      {/* Co dostajesz w Panelu (EDU) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold">Co dostajesz w Panelu (EDU)</h2>
          <p className="mt-2 text-white/80 text-sm md:text-base leading-relaxed">
            Zebrane w jednym miejscu kluczowe elementy analizy rynku, żeby szybciej budować własną decyzję na podstawie wielu niezależnych potwierdzeń.
          </p>
          <ul className="mt-4 list-disc pl-5 text-white/80 space-y-1.5">
            <li>Przeskanowany rynek pod kątem trendów i kontekstu (co „prowadzi” ruch, gdzie jest momentum, gdzie rynek zwalnia).</li>
            <li>Mapa techniczna: kluczowe poziomy, struktura trendu, strefy reakcji oraz zmienność (ATR).</li>
            <li>Wskaźniki techniczne jako kontekst (np. trend/impuls/wyczerpanie) — bez „sygnałów kup/sprzedaj”.</li>
            <li>Kalendarz makro + interpretacja: co jest dziś/jutro ważne, jakie scenariusze zwykle rynek rozgrywa.</li>
            <li>Scenariusze warunkowe A/B/C: „jeśli–to” (warunki, unieważnienie, ryzyka), żeby działać planowo.</li>
            <li>Checklista ryzyka: wielkość pozycji, poziomy obronne, maksymalna strata, plan na zmienność.</li>
          </ul>
          <p className="mt-3 text-xs text-white/70">Materiały mają charakter edukacyjny. Brak rekomendacji inwestycyjnych i „sygnałów” — decyzję podejmujesz samodzielnie.</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="plany" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h3 className="text-xl md:text-2xl font-bold">{t(dictLang, 'plans_title')}</h3>
        {/* Przełącznik rozliczania */}
        <div className="mt-3">
          <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md ${billing === 'monthly' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
            >
              {t(dictLang, 'billing_monthly')}
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${billing === 'yearly' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
            >
              {t(dictLang, 'billing_yearly_2mo')}
            </button>
          </div>
        </div>
        {/* Wprowadzenie do wyboru pakietu */}
        <div className="mt-3 max-w-3xl text-white/80 text-sm md:text-base leading-relaxed">
          <p>
            Aby podjąć odpowiedzialną decyzję inwestycyjną, potrzebujesz procesu: nauka podstaw, praktyka na checklistach
            i dopiero wtedy wnioski na bazie wielu niezależnych potwierdzeń. Nasze pakiety łączą edukację, kontekst
            rynkowy i narzędzia do działania w jednej spójnej ścieżce.
          </p>
        </div>

        {/* Filary wartości */}
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            { title: 'Ucz się świadomie', desc: 'Kursy i słowniki, by rozumieć, nie zgadywać.' },
            { title: 'Trenuj decyzje', desc: 'Checklisty i scenariusze A/B/C zamiast emocji.' },
            { title: 'Kontekst rynku', desc: 'Mapa techniczna, kalendarz i momentum w jednym miejscu.' },
            { title: 'Działaj planowo', desc: 'Wielkość pozycji, ryzyko i unieważnienia z góry.' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" />
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-white/70">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dlaczego to ważne */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-3xl text-sm text-white/80 leading-relaxed">
              <span className="font-semibold text-white">Dlaczego to jest niezbędne?</span> Skuteczne inwestowanie to
              powtarzalny proces łączący naukę i praktykę. Bez jasnych warunków wejścia/wyjścia emocje sterują decyzją.
              Z procesem — decydujesz na podstawie obiektywnych przesłanek, a ryzyko masz policzone z góry.
            </div>
            <button
              type="button"
              onClick={() => handleChoose('pro')}
              className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-4 py-2.5 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {t(dictLang, 'choose_plan')}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                {/* Ceny miesięczne vs roczne (jawne wartości) */}
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
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleChoose(plan.id)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-4 py-2.5 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  {t(dictLang, 'choose_plan')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <h3 className="text-xl md:text-2xl font-bold">{t(dictLang, 'faq_title')}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h4 className="font-semibold">{t(dictLang, 'faq_q1')}</h4>
            <p className="mt-1 text-white/70 text-sm">
              {t(dictLang, 'faq_a1')}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h4 className="font-semibold">{t(dictLang, 'faq_q2')}</h4>
            <p className="mt-1 text-white/70 text-sm">
              {t(dictLang, 'faq_a2')}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
            <h4 className="font-semibold">{t(dictLang, 'faq_q3')}</h4>
            <p className="mt-1 text-white/70 text-sm">
              {t(dictLang, 'faq_a3')}
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6">
          <p className="text-amber-200 text-sm">
            {t(dictLang, 'disclaimer_short')}
          </p>
        </div>
      </section>
    </main>
  );
}


