// app/client/page.tsx
'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import MobileStickyBar from "@/components/dashboard/MobileStickyBar";
import AssistantAI from "@/app/components/AssistantAI";
import { useEffect, useMemo, useState } from "react";
import WatchlistRealtime from "@/components/dashboard/WatchlistRealtime";
import WatchlistCustom from "@/components/dashboard/WatchlistCustom";
import QuickAI from "@/components/News/QuickAI";
import SparksCard from "@/components/News/SparksCard";
import LearningProgressCard from "@/components/dashboard/LearningProgressCard";
import { Calculator, LineChart, HelpCircle, BookOpen, Crown, Sparkles, ShieldCheck, ArrowRight, CalendarDays, Map as MapIcon, ListChecks, Brain, Flame } from "lucide-react";
import UpcomingCalendarMini from "@/components/dashboard/UpcomingCalendarMini";
import BackButton from "@/components/BackButton";

// Pasek z aktywami — spójny z danymi Finnhub jak na stronie głównej
const TickerFinnhubNoSSR = dynamic(() => import('@/components/TickerFinnhub'), { ssr: false });

type WatchItem = { symbol: string; label: string; price?: number; changePct?: number };

// Lista po lewej – spójne symbole z Finnhub (te same źródła co pasek u góry)
const LEFT_LIST: { label: string; symbol: string }[] = [
  { label: "US100",  symbol: "OANDA:NAS100_USD" },
  { label: "EURUSD", symbol: "OANDA:EUR_USD" },
  { label: "GOLD",   symbol: "OANDA:XAU_USD" },
  { label: "OIL",    symbol: "OANDA:WTICO_USD" },
  { label: "SP500",  symbol: "OANDA:US500_USD" },
  { label: "DAX40",  symbol: "OANDA:DE30_EUR" },
  { label: "BTCUSD", symbol: "BINANCE:BTCUSDT" },
  { label: "ETHUSD", symbol: "BINANCE:ETHUSDT" },
  { label: "USDJPY", symbol: "OANDA:USD_JPY" },
  { label: "GBPUSD", symbol: "OANDA:GBP_USD" },
];

export default function ClientPage() {
  // Lewa lista – dane spójne z paskiem (hydratacja z LocalStorage + opcjonalnie Finnhub)
  const token =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ??
    "";
  const [watch, setWatch] = useState<WatchItem[]>(
    () => LEFT_LIST.map(it => ({ symbol: it.symbol, label: it.label }))
  );

  // Natychmiastowy fallback – deterministyczne ceny startowe dla nowych użytkowników
  useEffect(() => {
    try {
      const topbarSymbols = [
        "OANDA:NAS100_USD",
        "OANDA:XAU_USD",
        "OANDA:WTICO_USD",
        "OANDA:BCO_USD",
        "OANDA:EUR_USD",
        "OANDA:USD_JPY",
        "OANDA:US500_USD",
      ];
      const storageKey = `ticker:finnhub:v1:${topbarSymbols.join(",")}`;
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
      // Jeśli nie ma jeszcze żadnych danych w localStorage — ustaw natychmiastowy fallback
      if (!raw) {
        const BASE: Record<string, number> = {
          "OANDA:NAS100_USD": 25445,
          "OANDA:EUR_USD": 1.187,
          "OANDA:XAU_USD": 2350,
          "OANDA:WTICO_USD": 77.2,
          "OANDA:US500_USD": 5632,
          "OANDA:DE30_EUR": 17000,
          "OANDA:USD_JPY": 151.72,
          "OANDA:GBP_USD": 1.265,
          "BINANCE:BTCUSDT": 48000,
          "BINANCE:ETHUSDT": 2300,
        };
        setWatch(prev => prev.map(it => {
          const base = Number.isFinite(BASE[it.symbol]) ? BASE[it.symbol] : 100;
          return { ...it, price: base, changePct: 0 };
        }));
      }
    } catch {}
  }, []);
  // Hydratacja z localStorage zapisywanego przez TickerFinnhub
  useEffect(() => {
    try {
      const topbarSymbols = [
        "OANDA:NAS100_USD",
        "OANDA:XAU_USD",
        "OANDA:WTICO_USD",
        "OANDA:BCO_USD",
        "OANDA:EUR_USD",
        "OANDA:USD_JPY",
        "OANDA:US500_USD",
      ];
      const storageKey = `ticker:finnhub:v1:${topbarSymbols.join(",")}`;
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, { price?: number; changePct?: number }>;
      if (!parsed || typeof parsed !== "object") return;
      setWatch(prev =>
        prev.map(it => {
          const q = parsed[it.symbol];
          return q ? { ...it, price: q.price, changePct: q.changePct } : it;
        })
      );
    } catch {}
  }, []);
  // Aktualizacja przez Finnhub (jeśli dostępny token)
  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    (async () => {
      try {
        const results = await Promise.allSettled(
          LEFT_LIST.map(async (it) => {
            const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(it.symbol)}&token=${token}`;
            const r = await fetch(url, { cache: "no-store" });
            if (!r.ok) throw new Error(String(r.status));
            const j = await r.json();
            const price = typeof j.c === "number" ? j.c : undefined;
            const prevClose = typeof j.pc === "number" ? j.pc : undefined;
            const changePct =
              price != null && prevClose != null && prevClose !== 0
                ? ((price - prevClose) / prevClose) * 100
                : undefined;
            return { s: it.symbol, price, changePct };
          })
        );
        if (cancelled) return;
        setWatch(prev => {
          const map = new Map<string, { price?: number; changePct?: number }>();
          for (const res of results) {
            if (res.status === "fulfilled") {
              map.set(res.value.s, { price: res.value.price, changePct: res.value.changePct });
            }
          }
          return prev.map(it => {
            const q = map.get(it.symbol);
            return q ? { ...it, ...q } : it;
          });
        });
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [token]);

  // Odczyt bieżącego planu/tier z API
  const [tier, setTier] = useState<'free' | 'starter' | 'pro' | 'elite' | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [tierLoaded, setTierLoaded] = useState<boolean>(false);
  const [adminLoaded, setAdminLoaded] = useState<boolean>(false);
  const [showPlans, setShowPlans] = useState<boolean>(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/panel/me', { cache: 'no-store' });
        const data = await r.json().catch(() => ({}));
        if (!mounted) return;
        const t = String(data?.tier || 'free');
        if (t === 'free' || t === 'starter' || t === 'pro' || t === 'elite') {
          setTier(t);
        } else {
          setTier('free');
        }
      } catch {
        if (!mounted) return;
        setTier('free');
      } finally {
        if (mounted) setTierLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Odczyt roli admin (jeden e-mail z ENV)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/admin/me', { cache: 'no-store' });
        const data = await r.json().catch(() => ({}));
        if (!mounted) return;
        setIsAdmin(Boolean(data?.isAdmin));
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
      } finally {
        if (mounted) setAdminLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const topReady = tierLoaded && adminLoaded;
  const [watchTab, setWatchTab] = useState<'default' | 'custom'>('default');

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Pasek z tickerem rynkowym (spójny z Finnhub) */}
      <TickerFinnhubNoSSR
        className="border-b border-white/10"
        speedSec={42}
        symbols={[
          "OANDA:NAS100_USD",
          "OANDA:XAU_USD",
          "OANDA:WTICO_USD",
          "OANDA:BCO_USD",
          "OANDA:EUR_USD",
          "OANDA:USD_JPY",
          "OANDA:US500_USD",
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard — Twój panel tradera</h1>
          <p className="text-sm text-white/60">Szybki przegląd rynku, nauki i narzędzi.</p>
          <StreakBadge />
        </div>

        {/* Szybkie akcje */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/kursy"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 font-semibold text-sm px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Kontynuuj naukę
            </Link>
            <Link
              href="/konto/panel-rynkowy/checklisty"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 text-white font-semibold text-sm px-3 py-2 hover:bg-white/20 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <ListChecks className="h-4 w-4" aria-hidden />
              Otwórz checklistę
            </Link>
            <Link
              href="/konto/panel-rynkowy/playbooki-eventowe"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 text-white font-semibold text-sm px-3 py-2 hover:bg-white/20 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Playbook dnia
            </Link>
          </div>
        </div>

        {/* Pasek statusu planu */}
        <div className="mb-6">
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-amber-400/40 via-emerald-400/20 to-cyan-400/20">
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 px-5 py-4 flex items-center justify-between backdrop-blur supports-[backdrop-filter]:backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                  {tier === 'elite' ? (
                    <Crown className="h-5 w-5 text-amber-300" aria-hidden />
                  ) : tier === 'pro' ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden />
                  ) : (
                    <Sparkles className="h-5 w-5 text-white/70" aria-hidden />
                  )}
                </div>
                <div className="text-sm">
                  {tier === null ? (
                    <span className="text-white/70" aria-live="polite">Sprawdzam Twój plan…</span>
                  ) : (
                    <>
                      <span className="text-white/70">Twój plan</span>
                      <span
                        className={
                          `ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ` +
                          (tier === 'elite'
                            ? 'bg-gradient-to-r from-amber-300 to-yellow-300 text-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.25)_inset]'
                            : tier === 'pro'
                              ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/30'
                              : tier === 'starter'
                                ? 'bg-white/10 text-white/80 ring-1 ring-inset ring-white/20'
                                : 'bg-white/5 text-white/60 ring-1 ring-inset ring-white/10')
                        }
                        aria-label="Aktualny plan"
                      >
                        {tier === 'elite' ? (
                          <>
                            <Crown className="h-3.5 w-3.5" />
                            ELITE
                          </>
                        ) : tier === 'pro' ? 'PRO' : tier === 'starter' ? 'STARTER' : 'FREE'}
                      </span>
                      {tier === 'elite' && (
                        <span className="ml-2 hidden sm:inline text-white/60">
                          Wszystkie moduły EDU odblokowane.
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 font-semibold text-sm px-3 py-2 ring-1 ring-inset ring-emerald-400/30 hover:bg-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/konto/panel-rynkowy"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 text-white font-semibold text-sm px-3 py-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Panel (EDU)
                </Link>
                <Link
                  href="/konto/plan"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white text-slate-900 font-semibold text-sm px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Mój plan
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowPlans(v => !v)}
                  aria-expanded={showPlans}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 text-white font-semibold text-sm px-3 py-2 ring-1 ring-inset ring-white/10 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {showPlans ? 'Ukryj plany' : 'Pokaż plany'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rząd główny: mini kalendarz + Quick markets */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Lewa kolumna: Kalendarz EDU (stabilny, bez zewnętrznego API) */}
          <UpcomingCalendarMini />

          {/* Prawa kolumna (2 kolumny): Quick markets */}
          <div className="md:col-span-2">
            <div className="mb-2 inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                type="button"
                onClick={() => setWatchTab('default')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md ${watchTab === 'default' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
              >
                Domyślna
              </button>
              <button
                type="button"
                onClick={() => setWatchTab('custom')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${watchTab === 'custom' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
              >
                Moja
              </button>
            </div>
            {watchTab === 'default' ? (topReady ? <WatchlistRealtime /> : <WatchlistSkeleton />) : <WatchlistCustom />}
          </div>
        </section>

        {/* Rząd 2: Nauka + Dzisiejszy brief / AI */}
        <section className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Kontynuuj naukę */}
          <LearningProgressCard />

          {/* Dzisiejszy brief / AI (2 kolumny) */}
          <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
            <QuickAI />
            <SparksCard />
          </div>
        </section>

        {/* Rząd 3: Porównaj brokerów + Narzędzia */}
        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 transition-colors hover:bg-white/10">
            <h2 className="text-lg font-semibold">Porównaj brokerów</h2>
            <p className="mt-1 text-sm text-white/70">
              Sprawdź opłaty, regulacje i parametry rachunków.
            </p>
            <Link
              href="/rankingi/brokerzy"
              className="mt-4 inline-flex px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
            >
              Rankingi brokerów
            </Link>
          </div>

          <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5 transition-colors hover:bg-white/10">
            <h2 className="text-lg font-semibold">Narzędzia</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/narzedzia/kalkulator"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                  <Calculator className="h-5 w-5" aria-hidden />
                </div>
                <div className="mt-3 font-medium">Kalkulator pozycji</div>
              </Link>

              <Link
                href="/quizy"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                  <LineChart className="h-5 w-5" aria-hidden />
                </div>
                <div className="mt-3 font-medium">Quizy</div>
              </Link>

              <Link
                href="/faq"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                  <HelpCircle className="h-5 w-5" aria-hidden />
                </div>
                <div className="mt-3 font-medium">FAQ</div>
              </Link>

              <Link
                href="/kursy"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                  <BookOpen className="h-5 w-5" aria-hidden />
                </div>
                <div className="mt-3 font-medium">Kursy</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Rząd 4: EDU hub */}
        <section className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5 transition-colors hover:bg-white/10">
          <h2 className="text-lg font-semibold">EDU hub</h2>
          <p className="mt-1 text-sm text-white/60">Szybkie przejścia do kluczowych modułów edukacyjnych.</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Link
              href="/konto/panel-rynkowy/kalendarz-7-dni"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                <CalendarDays className="h-5 w-5" aria-hidden />
              </div>
              <div className="mt-3 font-medium">Kalendarz 7 dni</div>
            </Link>
            <Link
              href="/konto/panel-rynkowy/scenariusze-abc"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                <ListChecks className="h-5 w-5" aria-hidden />
              </div>
              <div className="mt-3 font-medium">Scenariusze A/B/C</div>
            </Link>
            <Link
              href="/konto/panel-rynkowy/mapy-techniczne"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                <MapIcon className="h-5 w-5" aria-hidden />
              </div>
              <div className="mt-3 font-medium">Mapy techniczne</div>
            </Link>
            <Link
              href="/konto/panel-rynkowy/checklisty"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                <ListChecks className="h-5 w-5" aria-hidden />
              </div>
              <div className="mt-3 font-medium">Checklisty</div>
            </Link>
            <Link
              href="/konto/panel-rynkowy/playbooki-eventowe"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                <BookOpen className="h-5 w-5" aria-hidden />
              </div>
              <div className="mt-3 font-medium">Playbooki</div>
            </Link>
            <Link
              href="/konto/panel-rynkowy/coach-ai"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-black/20 active:translate-y-0"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-white/90 ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-white/20">
                <Brain className="h-5 w-5" aria-hidden />
              </div>
              <div className="mt-3 font-medium">Coach AI</div>
            </Link>
          </div>
        </section>
      </div>

      {/* Oferta panelu rynkowego — pakiety (zwijane) */}
      {showPlans && (
        <section id="plany" className="bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Oferta panelu rynkowego</h2>
              <p className="text-sm text-white/60">Wybierz plan dopasowany do Twojej nauki i praktyki.</p>
            </div>

            {/* Przełącznik rozliczania */}
            <div className="mb-6">
              <BillingSwitch />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Starter */}
              <StarterCard />

              {/* Pro — wyróżniony */}
              <ProCard />

              {/* Elite */}
              <EliteCard />
            </div>
          </div>
        </section>
      )}

      {/* Mobilny pasek skrótów + Asystent AI (FAB) */}
      <MobileStickyBar />
      <AssistantAI />
    </main>
  );
}

// ----------------------------
// Pricing helpers/components
// ----------------------------

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function StreakBadge() {
  const [count, setCount] = useState<number>(0);
  const [last, setLast] = useState<string>('');
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const doneToday = last === today;

  useEffect(() => {
    try {
      const c = Number(localStorage.getItem('streak:count') || '0');
      const l = String(localStorage.getItem('streak:last') || '');
      setCount(Number.isFinite(c) ? c : 0);
      setLast(l);
    } catch {}
  }, []);

  const markToday = () => {
    try {
      const prevCount = count;
      let next = 1;
      if (last === yesterday) next = prevCount + 1;
      else if (last === today) next = prevCount;
      else next = 1;
      localStorage.setItem('streak:count', String(next));
      localStorage.setItem('streak:last', today);
      setCount(next);
      setLast(today);
    } catch {}
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-white/15">
        <Flame className="h-3.5 w-3.5 text-amber-300" aria-hidden />
        Seria: {count} dni
      </span>
      <button
        type="button"
        onClick={markToday}
        disabled={doneToday}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${
          doneToday
            ? 'bg-white/10 text-white/60 ring-white/10 cursor-default'
            : 'bg-white text-slate-900 ring-white/20 hover:opacity-90'
        }`}
        aria-pressed={doneToday}
      >
        {doneToday ? 'Zaliczone' : 'Zaliczyć dziś'}
      </button>
    </div>
  );
}

function WatchlistSkeleton() {
  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 rounded bg-white/10" />
        <div className="h-4 w-32 rounded bg-white/10" />
      </div>
      <div className="mt-3 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="text-right">
              <div className="h-4 w-16 rounded bg-white/10 ml-auto" />
              <div className="mt-1 h-3 w-12 rounded bg-white/10 ml-auto" />
            </div>
            <div className="hidden sm:block">
              <div className="h-6 w-24 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type Billing = 'monthly' | 'yearly';

function useBilling(): [Billing, (b: Billing) => void] {
  const [billing, setBilling] = useState<Billing>('monthly');
  return [billing, setBilling];
}

function BillingSwitch() {
  const [billing, setBilling] = useBilling();
  // share state via window for sibling cards (simple global without context)
  useEffect(() => {
    (window as any).__billing = billing;
  }, [billing]);

  return (
    <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
      <button
        type="button"
        onClick={() => setBilling('monthly')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md ${billing === 'monthly' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
      >
        Miesięcznie
      </button>
      <button
        type="button"
        onClick={() => setBilling('yearly')}
        className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${billing === 'yearly' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
      >
        Rocznie (2 mies. gratis)
      </button>
    </div>
  );
}

function usePrice(monthly: number, yearly: number) {
  const [billing, setBilling] = useState<Billing>(() => (typeof window !== 'undefined' && (window as any).__billing) || 'monthly');
  useEffect(() => {
    const id = setInterval(() => {
      const b = (window as any).__billing as Billing | undefined;
      if (b && b !== billing) setBilling(b);
    }, 100);
    return () => clearInterval(id);
  }, [billing]);
  const isYearly = billing === 'yearly';
  const value = isYearly ? yearly : monthly;
  const unit = isYearly ? '/rok' : '/mies';
  return { value, unit, isYearly };
}

function StarterCard() {
  const { value, unit } = usePrice(59, 590);
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="text-xs tracking-wider uppercase text-white/60 font-semibold">Starter</div>
              <div className="mt-2">
                <div className="text-4xl font-extrabold">{value} <span className="text-lg font-bold align-top">PLN</span></div>
                <div className="text-sm text-white/60">{unit}</div>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span>Kalendarz 7 dni</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span>Scenariusze A/B/C (EDU)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span>Checklisty</span>
                </li>
              </ul>
              <Link
                href="/kontakt?topic=zakup-pakietu&plan=starter"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white text-slate-900 font-semibold py-2.5 hover:opacity-90"
              >
                Wybierz plan
              </Link>
            </div>
  );
}

function ProCard() {
  const { value, unit } = usePrice(110, 1100);
  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-emerald-400/40 via-emerald-400/10 to-transparent">
              <div className="rounded-2xl bg-slate-900 p-6 border border-white/10">
                <div className="absolute -top-3 right-4 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider">
                  Najczęściej wybierany
                </div>
                <div className="text-xs tracking-wider uppercase text-white/80 font-semibold">Pro</div>
                <div className="mt-2">
                  <div className="text-4xl font-extrabold">{value} <span className="text-lg font-bold align-top">PLN</span></div>
                  <div className="text-sm text-white/60">{unit}</div>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                    <span>Wszystko ze Starter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                    <span>Mapy techniczne (EDU)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                    <span>Playbooki eventowe</span>
                  </li>
                </ul>
                <Link
                  href="/kontakt?topic=zakup-pakietu&plan=pro"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-extrabold py-2.5 hover:opacity-90"
                >
                  Kup pakiet
                </Link>
              </div>
            </div>
  );
}

function EliteCard() {
  const { value, unit } = usePrice(199, 1900);
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="text-xs tracking-wider uppercase text-white/60 font-semibold">Elite</div>
              <div className="mt-2">
                <div className="text-4xl font-extrabold">{value} <span className="text-lg font-bold align-top">PLN</span></div>
                <div className="text-sm text-white/60">{unit}</div>
              </div>
              <div className="mt-2 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
                ELITE = PRO + Coach AI + Raport
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span>Wszystko z Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span>Coach AI (edukacyjny)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span>Raport miesięczny</span>
                </li>
              </ul>
              <Link
                href="/kontakt?topic=zakup-pakietu&plan=elite"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white text-slate-900 font-semibold py-2.5 hover:opacity-90"
              >
                Wybierz plan
              </Link>
            </div>
  );
}
