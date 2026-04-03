'use client';

import Link from 'next/link';
import { ArrowLeft, Coins, Scale, Store, Tag } from 'lucide-react';
import { FoundersMarketOverviewGrid } from '@/components/marketplace/FoundersMarketPanels';
import { listPurchasableOffers, offerAccessDescriptor, offerEditionToken, type FoundersOffer } from '@/lib/marketplace/offers';

const cardFrame =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md shadow-lg shadow-black/25';

const widePanel =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.02] backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-lg shadow-black/25 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_20px_48px_-28px_rgba(0,0,0,0.5)]';

const disclaimerPanel =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-md shadow-black/25 [box-shadow:0_0_0_1px_rgba(255,255,255,0.03)]';

function variantBadge(offer: FoundersOffer): { label: string; className: string } {
  if (offer.variant === 'gold') {
    return {
      label: 'Gold',
      className:
        'rounded-md border border-amber-400/35 bg-gradient-to-br from-amber-500/20 to-amber-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/95 shadow-[0_0_20px_-4px_rgba(251,191,36,0.35)]',
    };
  }
  if (offer.variant === 'support') {
    return {
      label: 'Support',
      className:
        'rounded-md border border-teal-400/30 bg-teal-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-100/90 shadow-[0_0_18px_-4px_rgba(45,212,191,0.25)]',
    };
  }
  return {
    label: 'Founders',
    className:
      'rounded-md border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/88 shadow-[0_0_18px_-4px_rgba(52,211,153,0.3)]',
  };
}

/** Mini asset zbliżony do hero NFT: głębia, glow, top highlight, SVG flow / topografia */
function MarketplaceMiniNftVisual({ offer }: { offer: FoundersOffer }) {
  const gid = offer.id.replace(/[^a-zA-Z0-9]/g, '');
  const badge = variantBadge(offer);
  const token = offerEditionToken(offer.name, offer.id);

  const outerGlow =
    offer.variant === 'gold'
      ? 'from-amber-400/25 via-emerald-500/12 to-amber-600/20'
      : offer.variant === 'support'
        ? 'from-teal-400/22 via-cyan-500/10 to-emerald-600/18'
        : 'from-cyan-400/28 via-emerald-400/15 to-blue-600/22';

  const borderRing =
    offer.variant === 'gold'
      ? 'border-amber-300/25 ring-amber-400/10'
      : offer.variant === 'support'
        ? 'border-teal-300/20 ring-teal-400/10'
        : 'border-white/[0.18] ring-cyan-400/8';

  const flowStopA =
    offer.variant === 'gold' ? '#fbbf24' : offer.variant === 'support' ? '#2dd4bf' : '#34d399';
  const flowStopB =
    offer.variant === 'gold' ? '#fcd34d' : offer.variant === 'support' ? '#5eead4' : '#22d3ee';
  const flowStopC =
    offer.variant === 'gold' ? '#fde68a' : offer.variant === 'support' ? '#99f6e4' : '#a5f3fc';

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-[1.05rem] border bg-gradient-to-b from-slate-800/92 via-slate-950 to-[#060a14] shadow-[0_24px_56px_-28px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08),0_0_36px_-10px_rgba(34,211,238,0.25)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.06] ${borderRing}`}
    >
      <div
        className={`pointer-events-none absolute -inset-6 rounded-[1.4rem] bg-gradient-to-br ${outerGlow} blur-2xl opacity-80`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.05rem] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_0_0_rgba(0,0,0,0.3)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-75"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-16 bg-gradient-to-b from-cyan-200/10 to-transparent blur-xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 top-1/4 h-28 w-28 rounded-full bg-cyan-400/14 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-8 bottom-1/4 h-24 w-24 rounded-full bg-emerald-500/12 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.08)_0%,transparent_40%,transparent_58%,rgba(56,189,248,0.05)_100%)]"
        aria-hidden
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 320 240"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${gid}-flow`} gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="320" y2="110">
            <stop offset="0%" stopColor={flowStopA} stopOpacity="0.25" />
            <stop offset="40%" stopColor={flowStopB} stopOpacity="1" />
            <stop offset="65%" stopColor={flowStopC} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id={`${gid}-hub`} cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="rgb(207,250,254)" stopOpacity="0.22" />
            <stop offset="40%" stopColor="rgb(45,212,191)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id={`${gid}-contour`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(96,165,250)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gid}-hub)`} />
        <g opacity="0.09" stroke="rgba(148,163,184,0.75)" strokeWidth="0.28">
          <line x1="0" y1="98" x2="320" y2="98" />
          <line x1="0" y1="120" x2="320" y2="120" />
          <line x1="0" y1="142" x2="320" y2="142" />
        </g>
        <g opacity="0.06" stroke="rgba(165,243,252,0.9)" strokeWidth="0.25">
          <line x1="52" y1="0" x2="52" y2="240" />
          <line x1="106" y1="0" x2="106" y2="240" />
          <line x1="160" y1="0" x2="160" y2="240" />
          <line x1="214" y1="0" x2="214" y2="240" />
          <line x1="268" y1="0" x2="268" y2="240" />
        </g>
        <g fill="none" stroke={`url(#${gid}-contour)`} strokeWidth="0.55" opacity="0.4">
          <ellipse cx="160" cy="192" rx="112" ry="52" />
          <ellipse cx="160" cy="192" rx="76" ry="34" />
        </g>
        <path
          d="M -36 178 C 38 162, 86 52, 158 108 C 194 138, 220 48, 302 42"
          fill="none"
          stroke={`url(#${gid}-flow)`}
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.28"
        />
        <path
          d="M -36 178 C 38 162, 86 52, 158 108 C 194 138, 220 48, 302 42"
          fill="none"
          stroke={`url(#${gid}-flow)`}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M -36 188 C 34 172, 82 64, 152 118"
          fill="none"
          stroke="rgba(207,250,254,0.18)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 flex h-full flex-col justify-between p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/18 bg-gradient-to-br from-white/[0.14] to-white/[0.03] text-[9px] font-bold tracking-[0.18em] text-emerald-50 shadow-[0_0_16px_-3px_rgba(52,211,153,0.4)]">
            FX
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className={badge.className}>{badge.label}</span>
            <span className="max-w-[9rem] text-[9px] font-semibold uppercase leading-tight tracking-[0.16em] text-cyan-100/72">
              {offer.variant === 'gold'
                ? 'Edycja kolekcjonerska'
                : offer.variant === 'support'
                  ? 'Wsparcie projektu'
                  : 'Founding edition'}
            </span>
          </div>
        </div>
        <div className="mt-auto border-t border-white/10 pt-2">
          <p className="bg-gradient-to-r from-white via-emerald-50/95 to-cyan-100/85 bg-clip-text text-sm font-bold leading-tight tracking-tight text-transparent line-clamp-2">
            {offer.name.split('·')[0]?.trim() ?? 'FXEDULAB'}
          </p>
          <div className="mt-1.5 flex items-end justify-between gap-2">
            <span className="text-[10px] text-white/42">Nośnik dostępu</span>
            <span className="text-lg font-semibold tabular-nums tracking-tight text-white/[0.9] sm:text-xl drop-shadow-sm">
              {token}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <main id="content" className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300/90 hover:text-emerald-200 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Strona główna
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Store className="h-10 w-10 text-emerald-300/90" aria-hidden />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">FXEDULAB Founders NFT Marketplace</h1>
          </div>
          <p className="max-w-3xl text-base sm:text-lg text-white/80 leading-relaxed">
            Płacisz raz za NFT z lifetime access do FXEDULAB. Insighty z miesięcznym refill, analiza kontekstu rynku i narzędzia
            panelu idą z tokenem — przy odsprzedaży przechodzą na nowego właściciela. Wcześniejsze wejście zwykle oznacza niższy
            próg cenowy niż późniejsze etapy modelu.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-14 lg:space-y-16">
        <section id="market-state" className="scroll-mt-24" aria-labelledby="market-state-heading">
          <h2 id="market-state-heading" className="sr-only">
            Wzrost progu wejścia, model cenowy i korzyści czasowe
          </h2>
          <FoundersMarketOverviewGrid />
        </section>

        <section id="offers" className="scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Oferty na marketplace</h2>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                Każda karta ma własną cenę listingu. Osobno pokazujemy model progu dla nowych wejść — żeby było widać, jak wcześniejszy
                zakup i kolejne etapy rynku układają się w jedną narrację wartości, bez liczników sprzedaży.
              </p>
            </div>
            <Tag className="h-8 w-8 text-white/25 hidden sm:block shrink-0" aria-hidden />
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {listPurchasableOffers().map((offer) => {
              const cardExtra =
                offer.variant === 'gold'
                  ? 'hover:border-amber-400/25'
                  : offer.variant === 'support'
                    ? 'hover:border-teal-400/20'
                    : 'hover:border-white/20';
              const access = offerAccessDescriptor(offer);

              return (
                <li key={offer.id} className={`${cardFrame} flex flex-col p-5 transition-all ${cardExtra}`}>
                  <MarketplaceMiniNftVisual offer={offer} />
                  <h3 className="mt-4 font-semibold text-white leading-snug">{offer.name}</h3>
                  <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-200/65">{access.level}</p>
                  <p className="mt-2 text-xs text-white/50 leading-relaxed">{access.line}</p>
                  <p className="mt-4 text-sm text-white/75">
                    <span className="text-white/45">Cena listingu:</span>{' '}
                    <span className="font-semibold text-white tabular-nums">{offer.priceUsd} USD</span>
                  </p>
                  <p className="mt-1 text-xs text-white/55 flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" aria-hidden />
                    Płatność: {offer.payOptions}
                  </p>
                  <Link
                    href={`/marketplace/buy/${encodeURIComponent(offer.id)}`}
                    className="mt-5 flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    Przejdź do zakupu
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="resale-info" className="scroll-mt-24 pb-4 lg:pb-8" aria-labelledby="footer-panels-heading">
          <h2 id="footer-panels-heading" className="sr-only">
            Odsprzedaż, zasady marketplace i informacje prawne
          </h2>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            <div className={widePanel}>
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-cyan-500/[0.05]"
                aria-hidden
              />
              <div className="relative z-10">
                <h3 id="resale" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Odsprzedaż dostępu przez NFT
                </h3>
                <ul className="mt-6 space-y-4 text-sm sm:text-[15px] text-white/70 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" aria-hidden />
                    <span>Wystawiasz ten sam token — kupujący przejmuje lifetime access i odblokowane wcześniej korzyści czasowe.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" aria-hidden />
                    <span>Cena wtórna ustala się między stronami; operator nie gwarantuje płynności ani odkupu po stałej cenie.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" aria-hidden />
                    <span>Zarządzanie listingiem i portfelem — z poziomu panelu konta, w zgodzie z aktualnym regulaminem marketplace.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className={widePanel}>
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-emerald-500/[0.05]"
                aria-hidden
              />
              <div className="relative z-10">
                <h3 id="how-marketplace" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Jak działa ten marketplace
                </h3>
                <ul className="mt-6 space-y-4 text-sm sm:text-[15px] text-white/70 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" aria-hidden />
                    <span>
                      NFT to nośnik licencji edukacyjnej na FXEDULAB — nie udział w spółce, nie obietnica zysku z samego tokenu.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" aria-hidden />
                    <span>
                      Model progu wejścia (wyżej na stronie) dotyczy nowych edycji; kwota przy składaniu zamówienia zawsze odpowiada
                      wybranemu listingu.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" aria-hidden />
                    <span>Marketplace nie gwarantuje wtórnej płynności — to świadomy zakup dostępu, z możliwością późniejszej odsprzedaży.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`${disclaimerPanel} mt-6 lg:mt-8`}>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/[0.05] via-transparent to-transparent"
              aria-hidden
            />
            <div className="relative z-10 lg:flex lg:gap-10 lg:items-start">
              <div className="flex gap-4 sm:gap-5 lg:shrink-0">
                <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400/40 shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0 lg:max-w-xs">
                  <h3
                    id="marketplace-disclaimer-heading"
                    className="text-sm font-semibold uppercase tracking-wider text-white/50"
                  >
                    Disclaimer prawny
                  </h3>
                  <p className="mt-2 text-xs text-white/45 leading-relaxed">
                    Skrót poniżej nie zastępuje pełnych dokumentów prawnych — służy szybkiej orientacji przy checkout.
                  </p>
                </div>
              </div>
              <ul className="mt-6 lg:mt-0 flex-1 space-y-3 text-sm text-white/58 leading-relaxed lg:columns-2 lg:gap-x-10 lg:space-y-3 [column-fill:_balance]">
                <li className="break-inside-avoid pl-1 border-l-2 border-white/10 lg:pl-4">
                  NFT nie stanowi instrumentu finansowego w rozumieniu obowiązujących przepisów.
                </li>
                <li className="break-inside-avoid pl-1 border-l-2 border-white/10 lg:pl-4">
                  Zakup nie oznacza udziału w spółce ani obietnicy zysku albo zwrotu z samego tokenu.
                </li>
                <li className="break-inside-avoid pl-1 border-l-2 border-white/10 lg:pl-4">
                  Treści FXEDULAB mają charakter edukacyjno-analityczny — to nie rekomendacja inwestycyjna w rozumieniu prawa.
                </li>
                <li className="break-inside-avoid pl-1 border-l-2 border-white/10 lg:pl-4">
                  Warunki dostępu, odsprzedaży i płatności regulują dokumenty prawne serwisu oraz regulamin marketplace.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
