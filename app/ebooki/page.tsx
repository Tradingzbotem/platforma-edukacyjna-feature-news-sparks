// app/ebooki/page.tsx — strona środowiska edukacyjnego FXEDULAB (ścieżka: nauka → quizy → certyfikat → narzędzia)
'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { BookOpen, Award, Compass, CheckCircle2 } from 'lucide-react';
import { isFoundersMarketplaceSalesPaused } from '@/lib/marketplace/offers';

export default function EbookiPage() {
  const salesPaused = isFoundersMarketplaceSalesPaused();
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
              <span className="tracking-wide">FXEDULAB — EDUKACJA I ŚRODOWISKO PRACY</span>
            </div>
            <h1 className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight mb-4">
              Zrozum rynek od podstaw — aż po uporządkowane decyzje w zmiennych warunkach.
            </h1>
            <p className="mb-4 max-w-xl text-base text-zinc-300">
              FXEDULAB to ścieżka od nauki do działania: kursy, quizy, certyfikat i pełne środowisko pracy dla osób,
              które chcą rozumieć rynek, a nie tylko śledzić nagłówki.
            </p>
            <div className="mt-4 max-w-2xl space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" aria-hidden />
                <p className="text-sm leading-relaxed text-zinc-300">
                  <span className="font-semibold text-white">Kursy</span> — budujesz fundament i strukturę
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" aria-hidden />
                <p className="text-sm leading-relaxed text-zinc-300">
                  <span className="font-semibold text-white">Quizy</span> — sprawdzasz wiedzę w praktyce
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" aria-hidden />
                <p className="text-sm leading-relaxed text-zinc-300">
                  <span className="font-semibold text-white">Certyfikat</span> — potwierdzasz ukończenie ścieżki
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" aria-hidden />
                <p className="text-sm leading-relaxed text-zinc-300">
                  <span className="font-semibold text-white">Panel</span> i narzędzia — układasz kontekst i proces decyzyjny
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/rejestracja"
                className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
              >
                Zacznij bezpłatnie
              </Link>
              <button
                type="button"
                onClick={scrollToPlany}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
              >
                Zobacz pełny dostęp
              </button>
            </div>
          </div>

          {/* Prawa kolumna - obraz */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
              <img
                src="/pakiety/pakiety.png"
                alt="Środowisko edukacyjne FxEduLab — kursy, quizy, certyfikat i narzędzia"
                className="w-full h-auto object-contain"
              />
              {/* Subtle glow */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section id="plany" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Darmowy start vs pełny dostęp */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
              Co dostajesz
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              Darmowy start i pełne środowisko — obok siebie
            </h2>
            <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              Ten sam kierunek edukacji; pełny dostęp rozszerza Cię o warstwę „środowiska pracy” — narzędzia, kontekst
              i moduły bez abonamentu miesięcznego za sam dostęp (szczegóły przy zakupie).
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-2">Darmowy start</h3>
              <p className="text-sm text-white/60 mb-6">Fundament bez kosztu wejścia — uczysz się i budujesz nawyk.</p>
              <ul className="space-y-3 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Kursy i materiały edukacyjne</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Quizy i utrwalanie wiedzy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Panel postępu / dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Ścieżka przygotowania do certyfikatu</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/rejestracja"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-5 py-2.5 hover:bg-white/10 transition-colors"
                >
                  Załóż konto
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-2">Pełny dostęp</h3>
              <p className="text-sm text-white/60 mb-6">
                Środowisko pracy: więcej kontekstu, modułów i narzędzi wspierających proces — nadal w modelu EDU.
              </p>
              <ul className="space-y-3 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Panel decyzyjny (Decision Block i powiązane widoki)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Szerszy kontekst rynkowy, checklisty i scenariusze</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Pełny panel rynkowy EDU i dodatkowe moduły</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span>Dostęp realizowany przez Founders NFT — bez miesięcznej opłaty za sam dostęp</span>
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('pelny-dostep-cena')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-semibold px-5 py-2.5 hover:bg-emerald-400"
                >
                  Szczegóły i cena
                </button>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-2.5 text-sm font-semibold"
                >
                  Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA B: Dlaczego warto — 3 filary */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
            Dlaczego FxEduLab
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Od lekcji do narzędzi — w jednym miejscu
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            Budujesz wiedzę metodycznie, sprawdzasz ją w quizach, potwierdzasz postęp certyfikatem i — przy pełnym
            dostępie — korzystasz z panelu, który pomaga układać kontekst i proces decyzyjny w ramach edukacji.
          </p>
        </div>

        {/* 3 kafelki */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
          {[
            {
              icon: BookOpen,
              title: 'Nauka, która prowadzi krok po kroku',
              desc: 'Strukturalne kursy i materiały: od pojęć po bardziej zaawansowany kontekst, bez chaosu i skakania po źródłach.',
            },
            {
              icon: Award,
              title: 'Certyfikat i potwierdzenie postępu',
              desc: 'Quizy i ścieżka przygotowują Cię do egzaminu; certyfikat dokumentuje ukończenie — możesz go wykorzystać w CV i na LinkedIn.',
            },
            {
              icon: Compass,
              title: 'Narzędzia od teorii do decyzji',
              desc: 'Przy pełnym dostępie: filtrowanie informacji, scenariusze, checklisty i panel rynkowy EDU — zawsze w duchu edukacji, bez sygnałów „kup / sprzedaj”.',
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

      {/* SEKCJA: Certyfikat — akcent wartości */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-8 md:p-10 lg:flex lg:items-center lg:gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200/90 mb-4 uppercase tracking-wider">
              Certyfikat FxEduLab
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
              Ukończ ścieżkę i potwierdź ją certyfikatem
            </h2>
            <p className="text-white/75 leading-relaxed mb-6 max-w-2xl">
              Realnie domykasz edukację: przechodzisz materiały, utrwalasz wiedzę w quizach, zdajesz egzamin i otrzymujesz
              certyfikat, który możesz pokazać pracodawcy lub w profilu zawodowym — jako dowód ukończenia programu, nie
              jako obietnicę wyników finansowych.
            </p>
            <Link
              href="/certyfikat-fxedulab"
              className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
            >
              Jak działa certyfikat
            </Link>
          </div>
          <ul className="mt-8 lg:mt-0 flex-1 space-y-4 text-sm text-white/80">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
              <span>Ścieżka łączy kursy, quizy i wymagania egzaminacyjne — wiesz, co jeszcze zostało.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
              <span>Certyfikat potwierdza ukończenie programu edukacyjnego FxEduLab.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
              <span>Możesz go wykorzystać w CV i na LinkedIn jako element wiarygodności zawodowej.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* SEKCJA C: Dla kogo */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
            Dla kogo jest FxEduLab
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Trzy poziomy — jedna platforma
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Niezależnie od punktu startu, zaczynasz od jasnej struktury i możesz schodzić głębiej w narzędzia, gdy
            będziesz gotowy.
          </p>
          <Link
            href="/rejestracja"
            className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-bold px-8 py-4 text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
          >
            Rozpocznij bezpłatnie
          </Link>
        </div>

        {/* 3 karty */}
        <div className="grid gap-6 md:grid-cols-3 mt-12">
          {[
            {
              title: 'Początkujący',
              desc: 'Chcesz zrozumieć rynek od zera: pojęcia, mechanika, ryzyko i ramy bez presji „szybkich decyzji”. Zaczynasz od kursów i spokojnej ścieżki.',
              link: '/kursy/podstawy',
              linkText: 'Zobacz podstawy',
              gradient: 'from-emerald-500/10 to-emerald-600/5',
              border: 'border-emerald-400/20',
            },
            {
              title: 'W trakcie rozwoju',
              desc: 'Chcesz uporządkować wiedzę i sprawdzić ją w quizach: mniej zgadywania, więcej pewności co do tego, co już opanowałeś.',
              link: '/quizy',
              linkText: 'Przejdź do quizów',
              gradient: 'from-cyan-500/10 to-cyan-600/5',
              border: 'border-cyan-400/20',
            },
            {
              title: 'Bardziej zaawansowani',
              desc: 'Szukasz kontekstu, scenariuszy i spójnego procesu decyzyjnego w ramach edukacji — nie „tipów”, tylko struktury pod własną odpowiedzialność.',
              link: '/rynek/panel-rynkowy',
              linkText: 'Podgląd panelu rynkowego',
              gradient: 'from-indigo-500/10 to-indigo-600/5',
              border: 'border-indigo-400/20',
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-8 hover:border-opacity-40 transition-all`}
            >
              <h3 className="text-2xl md:text-3xl font-extrabold mb-4">{card.title}</h3>
              <p className="text-base text-white/80 mb-6 leading-relaxed">{card.desc}</p>
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

      {/* SEKCJA D: proces decyzyjny, pełny dostęp, cena */}
      <section className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Proces decyzyjny — powiązany z produktem */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
              Po teorii — struktura
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white">
              FxEduLab nie kończy się na lekcji
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 mb-10">
              <p className="text-lg text-white/80 leading-relaxed">
                Rynek dostarcza mnóstwo informacji naraz. W edukacji liczy się umiejętność ich filtrowania, układania w
                scenariusze i rozumienia warunków — zamiast szukania jednej „magicznej odpowiedzi”.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                W FxEduLab łączysz naukę z narzędziami, które pomagają przejść od teorii do praktycznego, uporządkowanego
                myślenia: od checklist po szerszy kontekst i ramy decyzyjne w panelu (przy pełnym dostępie).
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Uczysz się warunków, nie haseł
              </h3>
              <p className="text-white/80 leading-relaxed">
                Zamiast „co rynek zrobi”, skupiasz się na tym, jakie scenariusze są możliwe i co musiałoby się zadziać,
                żeby któryś z nich stał się bardziej prawdopodobny — w ramach własnej odpowiedzialności i bez rekomendacji
                inwestycyjnych.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                  <span className="text-white/80">Filtrowanie szumu i priorytetyzacja informacji</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                  <span className="text-white/80">Scenariusze A/B/C i jasne „jeśli — to”</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                  <span className="text-white/80">Checklisty i spójność z tym, czego się nauczyłeś</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                  <span className="text-white/80">Kontekst rynkowy i newsy jako tło decyzji — nie jako sygnał zakupu</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-sm text-white/60">
              Wyłącznie materiały edukacyjne. Bez rekomendacji inwestycyjnych i obietnic wyników finansowych.
            </p>
          </div>
        </div>

        <div id="pelny-dostep-cena" className="scroll-mt-24 text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Pełne środowisko pracy</h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-6">
            Pełny dostęp to warstwa narzędziowa FxEduLab:{' '}
            <strong className="text-white/95 font-semibold">Decision Block</strong>, checklisty i scenariusze, szerszy
            kontekst rynkowy oraz pełny panel rynkowy EDU z dodatkowymi modułami. Nie kupujesz „kolejnego kursu” —{' '}
            odblokowujesz środowisko, w którym edukacja łączy się z codziennym porządkowaniem informacji.
          </p>
          <p className="text-sm text-white/55 max-w-2xl mx-auto">
            Dostęp przypisujemy do Founders NFT: to forma licencji na korzystanie z pełnej warstwy produktu, nie odrębny
            „projekt kolekcjonerski”. Szczegóły prawne i zakres — w regulaminie oraz na marketplace.
          </p>
        </div>

        <div className="max-w-lg mx-auto rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-slate-900 p-8">
          <p className="text-center text-sm font-medium text-emerald-200/90 uppercase tracking-wider mb-2">
            Founders — odblokowanie pełnego dostępu
          </p>
          <p className="text-center text-4xl font-extrabold">od ~500 USD</p>
          <p className="text-center text-sm text-white/55 mt-1">cena referencyjna — aktualna kwota przy zamówieniu</p>
          <ul className="mt-6 space-y-3 text-sm text-white/85">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
              <span>Płatność BTC / ETH / USDT</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
              <span>Licencja na pełne środowisko przypisana do NFT</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
              <span>NFT nie jest instrumentem finansowym — zob. regulamin</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            {salesPaused ? (
              <span
                className="inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/45"
                aria-disabled
              >
                Brak miejsc
              </span>
            ) : (
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-semibold px-5 py-2.5 hover:bg-emerald-400"
              >
                Marketplace
              </Link>
            )}
            <Link
              href="/cennik"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-2.5 text-sm font-semibold"
            >
              Cennik
            </Link>
            <Link
              href="/prawne/nft"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-2.5 text-sm font-semibold"
            >
              Regulamin NFT
            </Link>
          </div>
        </div>
      </section>

      {/* SEKCJA E: Ścieżka w produkcie */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4 uppercase tracking-wider">
            Jak to się układa
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Od lekcji do środowiska decyzyjnego
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            Naturalna kolejność w FxEduLab — bez presji, za to z jasnym celem na każdym etapie.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-10">
          {[
            {
              number: '1',
              title: 'NAUKA',
              desc: 'Kursy i materiały budują fundament: pojęcia, ramy ryzyka i kontekst rynku.',
            },
            {
              number: '2',
              title: 'QUIZY',
              desc: 'Sprawdzasz, co naprawdę zostało — mniej złudnej pewności, więcej konkretu.',
            },
            {
              number: '3',
              title: 'CERTYFIKAT',
              desc: 'Domykasz ścieżkę egzaminem i dokumentem do CV lub LinkedIn.',
            },
            {
              number: '4',
              title: 'ŚRODOWISKO',
              desc: 'Przy pełnym dostępie: panel decyzyjny, checklisty, scenariusze i szerszy kontekst EDU.',
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
