import { Lock, TrendingUp } from 'lucide-react';
import {
  FOUNDERS_MARKET_COPY,
  FOUNDERS_MARKET_PRICING,
  LOCKED_BENEFIT_TIERS,
} from '@/lib/marketplace/foundersMarketCopy';
import { checkoutOfferVsMarketLine, MARKET_ENTRY_STAGES_USD } from '@/lib/marketplace/pricingContext';

const ladderSurface =
  'relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-md p-6 sm:p-8 shadow-lg shadow-black/25 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_20px_48px_-28px_rgba(0,0,0,0.5),0_0_52px_-26px_rgba(16,185,129,0.1)]';

const subtleSurface =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.015] backdrop-blur-md p-6 sm:p-8 shadow-md shadow-black/25';

const stagesSurface =
  'relative overflow-hidden rounded-2xl border border-cyan-400/12 bg-gradient-to-b from-white/[0.06] via-slate-900/40 to-white/[0.02] backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-lg shadow-black/25 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_24px_56px_-32px_rgba(0,0,0,0.55),0_0_60px_-28px_rgba(34,211,238,0.08)]';

type Variant = 'default' | 'compact';

export type PricingLadderContext = 'marketplace' | 'checkout';

/** Wizualizacja rosnących etapów progu wejścia — dane z MARKET_ENTRY_STAGES_USD (pod API później). */
export function FoundersEntryStagesVisual({ className = '' }: { className?: string }) {
  const stages = MARKET_ENTRY_STAGES_USD;
  const c = FOUNDERS_MARKET_COPY;
  const max = Math.max(...stages);
  const min = Math.min(...stages);

  return (
    <div className={`${stagesSurface} ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-emerald-500/[0.06]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{c.stagesVisualTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm text-white/65 leading-relaxed">{c.stagesVisualSubtitle}</p>
          </div>
        </div>

        {/* Desktop: wykres schodkowy + węzły (kierunek wzrostu progu) */}
        <div className="mt-10 hidden md:block">
          <div className="relative mx-auto max-w-4xl px-2">
            <svg
              className="w-full h-[120px] text-emerald-400/90"
              viewBox="0 0 640 120"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <linearGradient id="entryLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="rgb(34,211,238)" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="rgb(45,212,191)" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              {(() => {
                const n = stages.length;
                const padX = 48;
                const w = 640 - padX * 2;
                const stepX = n > 1 ? w / (n - 1) : 0;
                const yBase = 88;
                const yTop = 28;
                const ys = stages.map((usd) => yBase - ((usd - min) / (max - min || 1)) * (yBase - yTop));
                const xs = stages.map((_, i) => padX + i * stepX);
                const d = stages
                  .map((_, i) => {
                    if (i === 0) return `M ${xs[0]} ${ys[0]}`;
                    return `L ${xs[i]} ${ys[i - 1]} L ${xs[i]} ${ys[i]}`;
                  })
                  .join(' ');
                return (
                  <>
                    <path
                      d={d}
                      fill="none"
                      stroke="url(#entryLine)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    {stages.map((usd, i) => (
                      <g key={usd}>
                        <circle
                          cx={xs[i]}
                          cy={ys[i]}
                          r="9"
                          className="fill-slate-950 stroke-emerald-400/70"
                          strokeWidth="1.5"
                        />
                        <circle cx={xs[i]} cy={ys[i]} r="4" className="fill-cyan-200/90" />
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
            <ul className="mt-2 flex justify-between gap-2 text-center">
              {stages.map((usd, i) => (
                <li key={usd} className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/38">Etap {i + 1}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-white/95">{usd} USD</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile: pasek postępu + etykiety */}
        <div className="mt-8 md:hidden space-y-4">
          <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.08]">
            {stages.map((usd, i) => (
              <div
                key={usd}
                className="flex-1 border-r border-white/[0.06] last:border-r-0 bg-gradient-to-t from-emerald-500/25 to-cyan-400/15"
                style={{ opacity: 0.35 + (i / stages.length) * 0.5 }}
                title={`${usd} USD`}
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-xs text-white/70 tabular-nums">
            {stages.map((usd) => (
              <span key={usd} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-semibold">
                {usd} USD
              </span>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm text-white/55 leading-relaxed border-t border-white/10 pt-6">
          Wyższe kwoty na liście NFT nie muszą być równe kolejnemu etapowi z tabeli — odzwierciedlają konkretny listing
          (edycja, rynek wtórny). Schemat pokazuje kierunek progu dla nowych wejść, nie gwarantuje przyszłych cen.
        </p>
      </div>
    </div>
  );
}

export function FoundersPricingLadderBlock({
  variant = 'default',
  context = 'marketplace',
  offerPriceUsd,
  className = '',
}: {
  variant?: Variant;
  context?: PricingLadderContext;
  /** Wymagane przy context=&quot;checkout&quot; — cena listingu użytkownika */
  offerPriceUsd?: number;
  className?: string;
}) {
  const compact = variant === 'compact';
  const { currentPriceUsd, nextPriceUsd } = FOUNDERS_MARKET_PRICING;
  const c = FOUNDERS_MARKET_COPY;
  const checkout = context === 'checkout' && typeof offerPriceUsd === 'number';

  return (
    <div className={`${ladderSurface} ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-cyan-500/[0.04]"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-200">
            <TrendingUp className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2
              className={`font-bold tracking-tight text-white ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}
            >
              {checkout ? 'Twoja kwota vs. model progu wejścia' : c.ladderHeading}
            </h2>
            <p className={`mt-2 text-white/65 leading-relaxed ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-[15px]'}`}>
              {checkout
                ? 'Poniżej rozdzielamy cenę tego listingu od referencyjnego progu dla nowych edycji — bez sprzecznych komunikatów.'
                : c.ladderSubheading}
            </p>
          </div>
        </div>

        <div className={`mt-6 grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
          {checkout ? (
            <>
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/[0.08] px-4 py-4 ring-1 ring-emerald-400/15">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/80">
                  {c.checkoutThisOfferLabel}
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-white">{offerPriceUsd} USD</p>
                <p className="mt-2 text-xs text-white/55 leading-relaxed">Kwota zamówienia za ten konkretny NFT.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{c.checkoutBaselineLabel}</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-emerald-200/95">{currentPriceUsd} USD</p>
                <p className="mt-2 text-xs text-white/55 leading-relaxed">{c.checkoutBaselineHint}</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{c.currentPriceLabel}</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-emerald-200/95">{currentPriceUsd} USD</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{c.nextPriceLabel}</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-white/95">{nextPriceUsd} USD</p>
              </div>
            </>
          )}
        </div>

        {checkout ? (
          <p
            className={`mt-4 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-white/62 leading-relaxed ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}
          >
            {c.checkoutBaselineScopeNote}
          </p>
        ) : null}

        {checkout ? (
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">{c.nextPriceLabel}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-white/90">{nextPriceUsd} USD</p>
            <p className="mt-1.5 text-xs text-white/50 leading-relaxed">{c.checkoutNextStageHint}</p>
          </div>
        ) : null}

        <p className={`mt-5 text-white/72 leading-relaxed ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>
          {checkout ? checkoutOfferVsMarketLine(offerPriceUsd!) : c.entryStageNote}
        </p>
        {!checkout ? (
          <p className={`mt-3 text-white/60 leading-relaxed border-t border-white/10 pt-5 ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>
            {c.dynamicsNote}
          </p>
        ) : null}
        <p className={`mt-3 text-white/60 leading-relaxed ${compact ? 'text-xs sm:text-sm' : 'text-sm'} ${checkout ? 'border-t border-white/10 pt-5' : ''}`}>
          {c.lifetimeInsightLine}
        </p>
      </div>
    </div>
  );
}

export function FoundersLockedBenefitsBlock({
  variant = 'default',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  const compact = variant === 'compact';
  const c = FOUNDERS_MARKET_COPY;

  return (
    <div className={`${subtleSurface} ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/[0.05] via-transparent to-emerald-500/[0.04]"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white/85">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2
              className={`font-bold tracking-tight text-white ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}
            >
              {c.lockedSectionTitle}
            </h2>
            <p className={`mt-2 text-white/65 leading-relaxed ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-[15px]'}`}>
              {c.holdUnlockIntro} {c.resaleTransferNote}
            </p>
          </div>
        </div>

        <ul className={`mt-6 space-y-4 ${compact ? '' : 'sm:space-y-5'}`}>
          {LOCKED_BENEFIT_TIERS.map((tier) => (
            <li
              key={tier.title}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 sm:px-5 sm:py-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200/75">{tier.badge}</p>
              <p className={`mt-1.5 font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>{tier.title}</p>
              <p className={`mt-1.5 text-white/62 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>{tier.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Marketplace: wizualizacja etapów + drabinka + benefity. */
export function FoundersMarketOverviewGrid({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-8 lg:space-y-10 ${className}`}>
      <FoundersEntryStagesVisual />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <FoundersPricingLadderBlock context="marketplace" />
        <FoundersLockedBenefitsBlock />
      </div>
    </div>
  );
}
