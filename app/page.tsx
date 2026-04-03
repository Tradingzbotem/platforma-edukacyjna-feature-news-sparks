import Link from 'next/link';
import { CheckCircle2, Layers, ListChecks, Newspaper, Radar, Sparkles, Store } from 'lucide-react';
import { FOUNDERS_MARKET_COPY, FOUNDERS_MARKET_PRICING } from '@/lib/marketplace/foundersMarketCopy';

const cardBase =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md p-5 sm:p-6 shadow-lg shadow-black/20';

/** Sekcja marketplace na dole homepage — spójna z cardBase / founders */
const homeMarketCard =
  'relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-md p-8 sm:p-10 shadow-lg shadow-black/25 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_-28px_rgba(0,0,0,0.55),0_0_60px_-24px_rgba(16,185,129,0.12)]';

/** Statyczna wizualizacja karty NFT w hero (PL) — collectible / pass, bez assetu zewnętrznego */
function HeroFoundersNftCard() {
  const gid = 'hero-nft-pl';
  return (
    <div
      className="relative mx-auto w-full max-w-[380px] sm:max-w-[410px] lg:w-[min(100%,440px)] lg:max-w-[460px] shrink-0 select-none [perspective:1400px]"
      role="img"
      aria-label="Ilustracja karty FXEDULAB Founders NFT — nośnik dostępu do platformy"
    >
      <div
        className="pointer-events-none absolute -bottom-12 left-1/2 h-32 w-[110%] max-w-none -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.28),rgba(34,211,238,0.08)_45%,transparent_72%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-1/2 h-24 w-[78%] -translate-x-1/2 rounded-[100%] bg-emerald-400/12 blur-2xl"
        aria-hidden
      />
      <div className="relative origin-center transition-transform duration-500 ease-out will-change-transform lg:[transform:rotateX(5deg)_rotateY(-6deg)] lg:hover:[transform:rotateX(3deg)_rotateY(-4deg)_translateY(-6px)]">
        <div
          className="pointer-events-none absolute -inset-10 rounded-[2.25rem] bg-gradient-to-br from-cyan-400/30 via-emerald-400/18 to-blue-600/25 blur-3xl opacity-[0.85]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-t from-emerald-500/25 via-transparent to-cyan-400/10 blur-2xl"
          aria-hidden
        />
        <div
          className="relative flex min-h-[26rem] flex-col overflow-hidden rounded-[1.85rem] border border-white/[0.2] bg-gradient-to-b from-slate-800/95 via-slate-950 to-[#060d18] shadow-[0_40px_100px_-32px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.1),0_0_70px_-12px_rgba(34,211,238,0.4),0_0_120px_-35px_rgba(16,185,129,0.25)] backdrop-blur-2xl sm:min-h-[28rem] lg:min-h-[30rem] ring-1 ring-inset ring-white/[0.07]"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[1.85rem] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_-1px_0_0_rgba(0,0,0,0.35)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-24 bg-gradient-to-b from-cyan-200/12 to-transparent blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 top-1/4 h-56 w-56 rounded-full bg-cyan-400/18 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-12 bottom-1/3 h-48 w-48 rounded-full bg-emerald-500/14 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.11)_0%,transparent_38%,transparent_62%,rgba(56,189,248,0.06)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-[34%] h-56 w-[78%] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(207,250,254,0.2),rgba(45,212,191,0.08)_38%,transparent_65%)] blur-2xl"
            aria-hidden
          />
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 440 520"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <filter id={`${gid}-flowBlur`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                </feMerge>
              </filter>
              <linearGradient id={`${gid}-flow`} gradientUnits="userSpaceOnUse" x1="0" y1="260" x2="440" y2="240">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                <stop offset="38%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="62%" stopColor="#a5f3fc" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.35" />
              </linearGradient>
              <radialGradient id={`${gid}-hub`} cx="50%" cy="36%" r="48%">
                <stop offset="0%" stopColor="rgb(207,250,254)" stopOpacity="0.28" />
                <stop offset="35%" stopColor="rgb(45,212,191)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id={`${gid}-node`} cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ecfeff" stopOpacity="1" />
                <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${gid}-contour`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="rgb(96,165,250)" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${gid}-hub)`} />
            <g opacity="0.1" stroke="rgba(148,163,184,0.7)" strokeWidth="0.35">
              <line x1="0" y1="212" x2="440" y2="212" />
              <line x1="0" y1="268" x2="440" y2="268" />
              <line x1="0" y1="324" x2="440" y2="324" />
            </g>
            <g opacity="0.07" stroke="rgba(165,243,252,0.85)" strokeWidth="0.3">
              <line x1="72" y1="0" x2="72" y2="520" />
              <line x1="146" y1="0" x2="146" y2="520" />
              <line x1="220" y1="0" x2="220" y2="520" />
              <line x1="294" y1="0" x2="294" y2="520" />
              <line x1="368" y1="0" x2="368" y2="520" />
            </g>
            <g fill="none" stroke={`url(#${gid}-contour)`} strokeWidth="0.7" opacity="0.45">
              <ellipse cx="220" cy="418" rx="155" ry="72" />
              <ellipse cx="220" cy="418" rx="105" ry="48" />
            </g>
            <path
              d="M -48 372 C 52 352, 118 188, 218 252 C 268 288, 302 168, 398 158 C 428 154, 462 162, 492 172"
              fill="none"
              stroke={`url(#${gid}-flow)`}
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.32"
              filter={`url(#${gid}-flowBlur)`}
            />
            <path
              d="M -48 372 C 52 352, 118 188, 218 252 C 268 288, 302 168, 398 158 C 428 154, 462 162, 492 172"
              fill="none"
              stroke={`url(#${gid}-flow)`}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M -48 388 C 48 368, 112 210, 212 268 C 262 302, 298 188, 392 178"
              fill="none"
              stroke="rgba(207,250,254,0.22)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <circle cx="218" cy="252" r="22" fill={`url(#${gid}-node)`} opacity="0.14" />
            <circle cx="218" cy="252" r="7" fill={`url(#${gid}-node)`} opacity="0.92" />
            <circle cx="218" cy="252" r="3" fill="#f0fdfa" opacity="0.5" />
          </svg>
          <div className="relative z-10 flex flex-1 flex-col px-7 pb-8 pt-8 sm:px-8 sm:pb-9 sm:pt-9">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.12] to-white/[0.03] text-[11px] font-bold tracking-[0.2em] text-emerald-100 shadow-[0_0_24px_-4px_rgba(52,211,153,0.45)]">
                FX
              </div>
              <span className="max-w-[11rem] text-right text-[10px] font-semibold uppercase leading-snug tracking-[0.2em] text-cyan-100/80">
                FOUNDING EDITION
              </span>
            </div>
            <div className="mt-auto pt-16 sm:pt-20">
              <p className="bg-gradient-to-r from-white via-emerald-50 to-cyan-100/90 bg-clip-text text-2xl font-bold leading-tight tracking-tight text-transparent sm:text-[1.65rem]">
                FXEDULAB Founders
              </p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200/55">
                Pas dostępu Founders
              </p>
              <p className="mt-6 text-sm leading-relaxed text-white/45">Dostęp przypisany do NFT</p>
              <p className="mt-8 text-lg font-medium tabular-nums tracking-wide text-white/[0.88] sm:text-xl">
                {FOUNDERS_MARKET_PRICING.currentPriceUsd} USD
              </p>
              <p className="mt-1.5 text-xs text-white/45">
                Kolejny poziom: {FOUNDERS_MARKET_PRICING.nextPriceUsd} USD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main id="content" className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">
            <div className="min-w-0 lg:col-span-7">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-200/90 mb-6">
                  <Sparkles className="w-4 h-4" aria-hidden />
                  <span className="tracking-wide font-semibold">FXEDULAB · dostęp przez Founders NFT</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.12] tracking-tight text-white">
                  Dostęp do systemu decyzji rynkowych przez{' '}
                  <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-200/90 bg-clip-text text-transparent">
                    FXEDULAB Founders NFT
                  </span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-2xl">
                  FXEDULAB porządkuje scenariusze, checklisty i kontekst rynkowy w jednym miejscu. Kupujesz dostęp przez NFT —
                  bez miesięcznego abonamentu.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <Link
                    href="/marketplace"
                    className="inline-flex justify-center items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-opacity text-center"
                  >
                    Kup Founders NFT
                  </Link>
                  <Link
                    href="/konto/panel-rynkowy"
                    className="inline-flex justify-center items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-colors text-center"
                  >
                    Zobacz jak działa platforma
                  </Link>
                </div>
                <p className="mt-5 text-sm text-white/55 max-w-xl">
                  Płatność w BTC / ETH / USDT. Dostęp przypisany do NFT.
                </p>
              </div>
            </div>
            <div className="flex justify-center lg:col-span-5 lg:justify-end lg:pl-2">
              <HeroFoundersNftCard />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
      </section>

      {/* CO DOSTAJESZ */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Co dostajesz z dostępem</h2>
          <p className="mt-2 text-white/65 max-w-2xl text-sm sm:text-base">
            Jednorazowa licencja dostępu — narzędzia i materiały w jednym spójnym workflow.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {[
              'Scenariusze A/B/C — trzy warianty ścieżki przed decyzją',
              'Checklisty przed wejściem w pozycję',
              'Makro, momentum i nagłówki w jednym panelu',
              'Jeden workflow: od kontekstu do checklisty bez skakania między narzędziami',
              'Wszystkie moduły platformy w ramach licencji dostępu',
              'Jednorazowy model — bez miesięcznej opłaty dla posiadacza NFT',
            ].map((text) => (
              <li key={text} className={`${cardBase} flex gap-3 items-start h-full min-h-[5.5rem]`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                <span className="text-sm sm:text-[15px] text-white/90 leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* JAK TO DZIAŁA */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Jak to działa</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3 items-stretch">
            {[
              {
                step: '1',
                title: 'Kupujesz Founders NFT',
                body: 'Jednorazowa płatność w BTC, ETH lub USDT.',
              },
              {
                step: '2',
                title: 'Odblokowujesz pełny dostęp do platformy',
                body: 'Narzędzia i materiały powiązane z Twoim NFT.',
              },
              {
                step: '3',
                title: 'Korzystasz z systemu i przenosisz dostęp razem z NFT',
                body: 'Dostęp jest przypisany do NFT i przechodzi na nowego właściciela.',
              },
            ].map(({ step, title, body }) => (
              <li key={step} className={`${cardBase} h-full flex flex-col`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-sm font-bold text-emerald-200">
                  {step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PLATFORMA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Platforma</h2>
          <p className="mt-2 text-white/65 max-w-2xl text-sm sm:text-base">
            Spójny system narzędzi: panel, scenariusze, checklisty i kontekst rynkowy — pracujesz w jednym miejscu, nie
            tylko czytasz materiały.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 items-stretch">
            {[
              {
                icon: Radar,
                title: 'Panel decyzyjny',
                desc: 'Struktura rynku, momentum i alerty — szybki obraz przed decyzją.',
              },
              {
                icon: Layers,
                title: 'Scenariusze A/B/C',
                desc: 'Trzy nazwane warianty zamiast jednej „pewnej” ścieżki.',
              },
              {
                icon: ListChecks,
                title: 'Checklisty',
                desc: 'Lista kontrolna przed wejściem — mniej pominiętych kroków.',
              },
              {
                icon: Newspaper,
                title: 'Rynek w pigułce',
                desc: 'Makro, nagłówki i tło sytuacji w jednym widoku — charakter edukacyjno-analityczny.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`${cardBase} flex gap-4 h-full`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <Icon className="w-5 h-5 text-emerald-300" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDERS NFT */}
      <section id="founders-nft" className="scroll-mt-24 border-t border-white/10 bg-gradient-to-b from-emerald-950/20 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className={`${cardBase} p-8 sm:p-10 border-emerald-400/20`}>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">FXEDULAB Founders NFT</h2>
            <p className="mt-3 text-white/75 max-w-2xl text-sm sm:text-base leading-relaxed">
              <span className="text-white/90">
                Aktualna cena dostępu NFT:{' '}
                <strong className="text-white font-semibold">{FOUNDERS_MARKET_PRICING.currentPriceUsd} USD</strong>
                {' · '}
                kolejny poziom:{' '}
                <strong className="text-white font-semibold">{FOUNDERS_MARKET_PRICING.nextPriceUsd} USD</strong>.
              </span>{' '}
              {FOUNDERS_MARKET_COPY.entryStageNote} Płatność w{' '}
              <strong className="text-white font-semibold">BTC / ETH / USDT</strong>. {FOUNDERS_MARKET_COPY.lifetimeInsightLine}{' '}
              Bez abonamentu miesięcznego za sam dostęp. {FOUNDERS_MARKET_COPY.holdUnlockIntro}{' '}
              {FOUNDERS_MARKET_COPY.resaleTransferNote}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="inline-flex justify-center items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-center"
              >
                Kup Founders NFT
              </Link>
              <Link
                href="/marketplace#offers"
                className="inline-flex justify-center items-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-colors text-center"
              >
                Przejdź do marketplace
              </Link>
            </div>
            <div className="mt-10 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <p className="text-xs text-white/45 font-medium">Informacja prawna</p>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-white/60 leading-relaxed list-disc pl-4">
                <li>NFT nie stanowi instrumentu finansowego w rozumieniu przepisów.</li>
                <li>Zakup nie oznacza udziału w spółce ani obietnicy jakiegokolwiek zwrotu.</li>
                <li>Treści na platformie mają charakter wyłącznie edukacyjno-analityczny — bez rekomendacji.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DOMKNIĘCIE CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Zdobądź dostęp do FXEDULAB przez Founders NFT
            </h2>
            <p className="mt-4 text-white/65 text-sm sm:text-base leading-relaxed">
              Jednorazowy dostęp do systemu decyzji rynkowych, scenariuszy i narzędzi uporządkowanych w jednym miejscu.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:items-center">
              <Link
                href="/marketplace"
                className="inline-flex justify-center items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-opacity text-center"
              >
                Kup Founders NFT
              </Link>
              <Link
                href="/marketplace#offers"
                className="inline-flex justify-center items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-colors text-center"
              >
                Przejdź do marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      {/* Marketplace — gradient jak reszta homepage */}
      <section className="relative border-t border-white/10 overflow-hidden pb-20 lg:pb-24">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-950/[0.07] via-slate-950/50 to-slate-950"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-20 right-[8%] h-72 w-72 rounded-full bg-emerald-500/[0.07] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-10 left-[-6%] h-64 w-64 rounded-full bg-cyan-500/[0.06] blur-3xl"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="animate-fade-in">
            <div className={homeMarketCard}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent" />
              <div className="pointer-events-none absolute -right-20 -bottom-24 h-56 w-56 rounded-full bg-emerald-500/[0.07] blur-2xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200/90 mb-6">
                  <Store className="h-3.5 w-3.5" aria-hidden />
                  Marketplace
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Marketplace i odsprzedaż</h2>
                <p className="mt-3 sm:mt-4 text-white/75 max-w-3xl text-sm sm:text-base leading-relaxed">
                  Możesz wystawić swoje Founders NFT na sprzedaż. Inny użytkownik może je odkupić — dostęp do platformy
                  przechodzi razem z NFT. Nie obiecujemy płynności rynku wtórnego, nie prowadzimy odkupu od
                  użytkowników i nie udzielamy gwarancji co do ceny ani możliwości odsprzedaży.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
