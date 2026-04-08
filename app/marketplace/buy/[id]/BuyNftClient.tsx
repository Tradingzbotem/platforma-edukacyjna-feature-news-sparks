'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { ArrowLeft, Check, Copy, Info } from 'lucide-react';
import {
  FoundersLockedBenefitsBlock,
  FoundersPricingLadderBlock,
} from '@/components/marketplace/FoundersMarketPanels';
import type { FoundersOffer } from '@/lib/marketplace/offers';
import { offerEditionToken, orderIdForOffer } from '@/lib/marketplace/offers';

const USDT_NETWORK = 'TRON (TRC20)';
/** Adres odbiorczy wpłat USDT (TRC20) w tej ścieżce płatności — aktualizowany po stronie FXEDULAB w razie zmian. */
const USDT_DEPOSIT_ADDRESS = 'TDk5WdeVjSNpNDZq9JUFrcooXzJJNF2x6Z';

const cardSurface =
  'relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-md p-6 sm:p-8 shadow-lg shadow-black/25 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_20px_48px_-28px_rgba(0,0,0,0.5),0_0_52px_-26px_rgba(16,185,129,0.1)]';

const mutedSurface =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.015] backdrop-blur-md p-6 sm:p-8 shadow-md shadow-black/25';

const pageContainerClass = 'mx-auto max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8';

const checkoutBlockClass =
  'relative overflow-hidden rounded-[1.35rem] border border-emerald-400/20 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-[#070b12] p-6 sm:p-8 shadow-[0_28px_64px_-36px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06),0_0_48px_-20px_rgba(16,185,129,0.14)]';

type Props = {
  offer: FoundersOffer;
};

function variantPresentation(offer: FoundersOffer): { label: string; badgeClass: string; subline: string } {
  if (offer.variant === 'gold') {
    return {
      label: 'Founders Gold',
      badgeClass:
        'rounded-md border border-amber-400/35 bg-gradient-to-br from-amber-500/20 to-amber-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100/95 shadow-[0_0_20px_-4px_rgba(251,191,36,0.35)]',
      subline: 'Edycja kolekcjonerska',
    };
  }
  if (offer.variant === 'support') {
    return {
      label: 'Support Edition',
      badgeClass:
        'rounded-md border border-teal-400/30 bg-teal-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-100/90 shadow-[0_0_18px_-4px_rgba(45,212,191,0.25)]',
      subline: 'Wsparcie projektu',
    };
  }
  return {
    label: 'Founders',
    badgeClass:
      'rounded-md border border-white/15 bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/88 shadow-[0_0_18px_-4px_rgba(52,211,153,0.3)]',
    subline: 'Founding edition',
  };
}

/** Karta NFT w stylu marketplace / hero — checkout, bez stanu „sold”. */
function PurchaseHeroNftCard({
  offer,
  edition,
  amountUsdt,
  priceUsd,
}: {
  offer: FoundersOffer;
  edition: string;
  amountUsdt: string;
  priceUsd: number;
}) {
  const gid = `buyhero-${offer.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const vp = variantPresentation(offer);

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
      className={`relative mx-auto w-full max-w-[420px] lg:max-w-none overflow-hidden rounded-[1.35rem] border bg-gradient-to-b from-slate-800/92 via-slate-950 to-[#060a14] shadow-[0_32px_80px_-36px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.09),0_0_56px_-14px_rgba(34,211,238,0.35)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.07] ${borderRing}`}
      role="img"
      aria-label={`Podgląd karty NFT: ${offer.name}`}
    >
      <div
        className={`pointer-events-none absolute -inset-8 rounded-[1.6rem] bg-gradient-to-br ${outerGlow} blur-3xl opacity-85`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.35rem] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_-1px_0_0_rgba(0,0,0,0.35)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-24 bg-gradient-to-b from-cyan-200/12 to-transparent blur-2xl"
        aria-hidden
      />

      <div className="relative z-20 flex flex-wrap gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-100/90">
          Zakup
        </span>
        <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/75">
          Ready to pay
        </span>
        <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-100/85">
          USDT · TRC20
        </span>
      </div>

      <div className="relative aspect-[5/4] w-full min-h-[200px] sm:min-h-[240px]">
        <div
          className="pointer-events-none absolute -right-12 top-1/4 h-36 w-36 rounded-full bg-cyan-400/16 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-10 bottom-1/4 h-32 w-32 rounded-full bg-emerald-500/14 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.09)_0%,transparent_42%,transparent_58%,rgba(56,189,248,0.06)_100%)]"
          aria-hidden
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 320 260"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <linearGradient id={`${gid}-flow`} gradientUnits="userSpaceOnUse" x1="0" y1="130" x2="320" y2="120">
              <stop offset="0%" stopColor={flowStopA} stopOpacity="0.25" />
              <stop offset="40%" stopColor={flowStopB} stopOpacity="1" />
              <stop offset="65%" stopColor={flowStopC} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id={`${gid}-hub`} cx="50%" cy="36%" r="55%">
              <stop offset="0%" stopColor="rgb(207,250,254)" stopOpacity="0.24" />
              <stop offset="40%" stopColor="rgb(45,212,191)" stopOpacity="0.11" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id={`${gid}-contour`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="rgb(96,165,250)" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gid}-hub)`} />
          <g opacity="0.09" stroke="rgba(148,163,184,0.75)" strokeWidth="0.28">
            <line x1="0" y1="104" x2="320" y2="104" />
            <line x1="0" y1="130" x2="320" y2="130" />
            <line x1="0" y1="156" x2="320" y2="156" />
          </g>
          <g opacity="0.06" stroke="rgba(165,243,252,0.9)" strokeWidth="0.25">
            <line x1="52" y1="0" x2="52" y2="260" />
            <line x1="106" y1="0" x2="106" y2="260" />
            <line x1="160" y1="0" x2="160" y2="260" />
            <line x1="214" y1="0" x2="214" y2="260" />
            <line x1="268" y1="0" x2="268" y2="260" />
          </g>
          <g fill="none" stroke={`url(#${gid}-contour)`} strokeWidth="0.55" opacity="0.42">
            <ellipse cx="160" cy="200" rx="118" ry="54" />
            <ellipse cx="160" cy="200" rx="78" ry="36" />
          </g>
          <path
            d="M -36 188 C 38 170, 86 58, 158 114 C 194 144, 220 52, 302 46"
            fill="none"
            stroke={`url(#${gid}-flow)`}
            strokeWidth="15"
            strokeLinecap="round"
            opacity="0.28"
          />
          <path
            d="M -36 188 C 38 170, 86 58, 158 114 C 194 144, 220 52, 302 46"
            fill="none"
            stroke={`url(#${gid}-flow)`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3 sm:inset-x-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.15] to-white/[0.04] text-[10px] font-bold tracking-[0.2em] text-emerald-50 shadow-[0_0_20px_-4px_rgba(52,211,153,0.45)]">
            FX
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className={vp.badgeClass}>{vp.label}</span>
            <span className="max-w-[11rem] text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-cyan-100/70">
              {vp.subline}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-20 space-y-4 border-t border-white/10 bg-gradient-to-t from-black/35 to-transparent px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="bg-gradient-to-r from-white via-emerald-50 to-cyan-100/90 bg-clip-text text-lg sm:text-xl font-bold leading-snug tracking-tight text-transparent">
            {offer.name}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-white/45">Edycja</span>
            <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-white drop-shadow-sm">
              {edition}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">Do zapłaty</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-emerald-200/95">{amountUsdt}</p>
          <p className="mt-0.5 text-sm text-white/65">
            {priceUsd} USD · 1 USDT = 1 USD
          </p>
        </div>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  mono,
  copiedKey,
  copyKey,
  actionLabel,
  onCopy,
  emphasize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copiedKey: string | null;
  copyKey: string;
  actionLabel: string;
  onCopy: (key: string, text: string) => void;
  emphasize?: boolean;
}) {
  const done = copiedKey === copyKey;
  const box = emphasize
    ? 'rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
    : 'rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-4';
  return (
    <div className={box}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{label}</p>
          <p
            className={`mt-2 text-[15px] sm:text-base text-white/95 break-all leading-snug ${mono ? 'font-mono text-[13px] sm:text-[15px]' : ''}`}
          >
            {value}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCopy(copyKey, value)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/18 bg-white/12 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-colors"
        >
          {done ? <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {done ? 'Skopiowano' : actionLabel}
        </button>
      </div>
    </div>
  );
}

export default function BuyNftClient({ offer }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [markedSent, setMarkedSent] = useState(false);
  const [agreePurchaseTerms, setAgreePurchaseTerms] = useState(false);
  const [agreeEarlyDigitalService, setAgreeEarlyDigitalService] = useState(false);
  const [txidInput, setTxidInput] = useState('');

  const bothConsentsGiven = agreePurchaseTerms && agreeEarlyDigitalService;

  const orderId = orderIdForOffer(offer.id);
  const edition = offerEditionToken(offer.name, offer.id);
  const amountUsdt = `${offer.priceUsd.toFixed(2)} USDT`;
  const handleCopy = useCallback((key: string, text: string) => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(null), 2200);
      } catch {
        setCopiedKey(null);
      }
    })();
  }, []);

  return (
    <main id="content" className="min-h-screen bg-slate-950 text-white pb-24">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-indigo-500/8 blur-3xl" />

        <div className={`${pageContainerClass} py-10 lg:py-16`}>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300/90 hover:text-emerald-200 transition-colors mb-10 lg:mb-12"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Wróć do marketplace
          </Link>

          {/* Rząd 1: copy + kwota (7/12) | karta NFT (5/12) — bez paneli informacyjnych w wąskiej kolumnie */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-start">
            <div className="lg:col-span-7 space-y-8 min-w-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/75 mb-3">Zakup NFT</p>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.35rem] lg:leading-tight font-extrabold tracking-tight text-white">
                  {offer.name}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/80">
                    <span className="text-white/45">Edycja</span>
                    <span className="font-semibold tabular-nums text-white">{edition}</span>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.03] to-cyan-500/[0.05] p-6 sm:p-7 shadow-[0_0_40px_-24px_rgba(16,185,129,0.35)]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/70">Kwota zamówienia</p>
                <p className="mt-2 text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-white">
                  <span className="text-emerald-200/95">{amountUsdt}</span>
                </p>
                <p className="mt-2 text-sm text-white/65">
                  {offer.priceUsd} USD · USDT w sieci {USDT_NETWORK} — przy tej płatności 1 USDT = 1 USD.
                </p>
              </div>

              <p className="text-base sm:text-[17px] text-white/78 leading-relaxed max-w-2xl">
                Kupujesz <strong>NFT</strong> jako nośnik <strong>licencji na dostęp cyfrowy</strong> do FXEDULAB (moduły panelu,
                materiały EDU, narzędzia). To <strong>usługa cyfrowa</strong> w opisanym zakresie — nie jest to inwestycja, lokata,
                instrument finansowy ani doradztwo inwestycyjne. Część opłaty może mieć charakter wsparcia projektu.
              </p>
              <ul className="mt-4 max-w-2xl space-y-2 text-sm text-white/70 list-disc pl-5 marker:text-emerald-400/50">
                <li>
                  <strong>Na jak długo:</strong> dostęp typu lifetime dla posiadacza NFT w rozumieniu opisu oferty (bez
                  miesięcznego abonamentu za ten sam poziom) — szczegóły i ewentualne wyjątki w regulaminie NFT.
                </li>
                <li>
                  <strong>Bonusy czasowe</strong> (np. refill Insightów, okresy promocyjne) wygasają po upływie terminu z opisu —
                  nie są trwałym „zyskiem finansowym”.
                </li>
                <li>
                  Treści i funkcje AI mają charakter <strong>edukacyjny</strong>; nie stanowią rekomendacji inwestycyjnych ani
                  sygnałów.
                </li>
              </ul>
              <p className="mt-4 text-xs text-white/50 max-w-2xl">
                Poniżej: korzyści odblokowywane z czasem oraz porównanie ceny tego listingu z modelem progu wejścia.
              </p>
            </div>

            <div className="lg:col-span-5 w-full lg:sticky lg:top-8">
              <div className="w-full flex justify-center lg:justify-end">
                <div className="w-full max-w-[420px] lg:max-w-[440px]">
                  <PurchaseHeroNftCard
                    offer={offer}
                    edition={edition}
                    amountUsdt={amountUsdt}
                    priceUsd={offer.priceUsd}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rząd 2: szeroki grid ~50/50 — ta sama szerokość co bloki „Jak dokonać zakupu” / płatność */}
          <div
            className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-start"
            aria-label="Korzyści czasowe i model progu wejścia"
          >
            <FoundersLockedBenefitsBlock variant="default" className="min-w-0 w-full" />
            <FoundersPricingLadderBlock
              variant="default"
              context="checkout"
              offerPriceUsd={offer.priceUsd}
              className="min-w-0 w-full"
            />
          </div>
        </div>
      </section>

      <div className={`${pageContainerClass} py-12 lg:py-16 space-y-10 lg:space-y-12`}>
        <section aria-labelledby="buy-steps-heading">
          <div className={cardSurface}>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-cyan-500/[0.04]"
              aria-hidden
            />
            <div className="relative z-10">
              <h2 id="buy-steps-heading" className="text-lg sm:text-xl font-bold text-white">
                Jak dokonać zakupu
              </h2>
              <ol className="mt-6 space-y-3.5 text-sm sm:text-[15px] text-white/72 leading-relaxed list-decimal pl-5 marker:text-emerald-400/60">
                <li>Użyj portfela obsługującego USDT w sieci {USDT_NETWORK}.</li>
                <li>
                  Kup wymaganą ilość USDT w kantorze lub na giełdzie, jeśli nie masz jeszcze środków w tej sieci.
                </li>
                <li>Wyślij dokładnie kwotę z sekcji „Dane do płatności” na podany niżej adres portfela.</li>
                <li>Zachowaj identyfikator transakcji (TXID) — ułatwi weryfikację wpłaty.</li>
                <li>Po wysłaniu środków kliknij przycisk na dole strony: „Zgłoś płatność do weryfikacji” (po zaakceptowaniu zgód).</li>
              </ol>
              <p className="mt-6 text-xs text-white/45">
                <Link href="/kontakt?topic=platnosc-krypto" className="text-emerald-300/85 hover:text-emerald-200 underline-offset-2 hover:underline">
                  Nie masz jeszcze krypto? Przygotowanie płatności — kontakt
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="buy-payment-heading">
          <div className={checkoutBlockClass}>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-cyan-500/[0.05]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-emerald-500/[0.08] blur-3xl"
              aria-hidden
            />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <h2 id="buy-payment-heading" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-200">
                      <Info className="h-5 w-5 shrink-0" aria-hidden />
                    </span>
                    Dane do płatności
                  </h2>
                  <p className="mt-2 text-sm text-white/50 max-w-lg pl-0 sm:pl-[3.25rem]">
                    Skopiuj pola do aplikacji portfela — upewnij się, że wybrałeś sieć TRON (TRC20).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Waluta</p>
                  <p className="mt-1.5 text-lg font-semibold text-white">USDT</p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Sieć</p>
                  <p className="mt-1.5 text-lg font-semibold text-white leading-snug">{USDT_NETWORK}</p>
                </div>
              </div>

              <div className="space-y-4">
                <CopyRow
                  label="Adres portfela odbiorcy (USDT, TRC20)"
                  value={USDT_DEPOSIT_ADDRESS}
                  mono
                  copiedKey={copiedKey}
                  copyKey="addr"
                  actionLabel="Skopiuj adres"
                  onCopy={handleCopy}
                  emphasize
                />
                <CopyRow
                  label="Kwota do wpłaty"
                  value={amountUsdt}
                  copiedKey={copiedKey}
                  copyKey="amt"
                  actionLabel="Skopiuj kwotę"
                  onCopy={handleCopy}
                  emphasize
                />
                <CopyRow
                  label="ID zamówienia"
                  value={orderId}
                  mono
                  copiedKey={copiedKey}
                  copyKey="ord"
                  actionLabel="Skopiuj ID zamówienia"
                  onCopy={handleCopy}
                />
              </div>

              <p className="text-xs sm:text-sm text-white/55 leading-relaxed pt-8 mt-2 border-t border-white/10">
                Oficjalny adres odbiorczy FXEDULAB dla wpłat USDT w sieci TRON (TRC20) przy zakupie przez tę stronę. W polu
                memo (jeśli portfel je pokazuje) wpisz ID zamówienia — przyspiesza przypisanie wpłaty do zamówienia.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="buy-notes-heading">
          <div className={mutedSurface}>
            <div className="relative z-10">
              <h2 id="buy-notes-heading" className="text-lg font-bold text-white">
                Ważne informacje
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-white/62 leading-relaxed list-disc pl-5 marker:text-white/35">
                <li>Wysyłaj środki wyłącznie w USDT w sieci {USDT_NETWORK}.</li>
                <li>Transfer w niewłaściwej sieci lub walucie może skutkować utratą środków.</li>
                <li>Dostęp do platformy zostanie przyznany po weryfikacji wpłaty przez zespół FXEDULAB.</li>
                <li>NFT nie stanowi instrumentu finansowego w rozumieniu przepisów.</li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="buy-legal-ack-heading" className="max-w-2xl">
          <div className={mutedSurface}>
            <div className="relative z-10 space-y-4">
              <h2 id="buy-legal-ack-heading" className="text-base font-bold text-white">
                Dokumenty przed potwierdzeniem wpłaty
              </h2>
              <p className="text-sm text-white/65 leading-relaxed">
                Przed zgłoszeniem płatności do weryfikacji zapoznaj się z dokumentami — tam są m.in. zasady aktywacji,
                odstąpienia i reklamacji.
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <li>
                  <Link href="/prawne/regulamin" className="text-emerald-300/90 hover:text-emerald-200 underline underline-offset-2">
                    Regulamin serwisu
                  </Link>
                </li>
                <li>
                  <Link href="/prawne/nft" className="text-emerald-300/90 hover:text-emerald-200 underline underline-offset-2">
                    Regulamin NFT
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prawne/polityka-prywatnosci"
                    className="text-emerald-300/90 hover:text-emerald-200 underline underline-offset-2"
                  >
                    Polityka prywatności
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prawne/zwroty-odstapienie"
                    className="text-emerald-300/90 hover:text-emerald-200 underline underline-offset-2"
                  >
                    Zwroty i odstąpienie
                  </Link>
                </li>
              </ul>
              <label className="flex items-start gap-3 cursor-pointer text-sm text-white/75 leading-snug">
                <input
                  type="checkbox"
                  className="mt-1 accent-emerald-500 shrink-0"
                  checked={agreePurchaseTerms}
                  onChange={(e) => setAgreePurchaseTerms(e.target.checked)}
                />
                <span>
                  Potwierdzam zapoznanie się z Regulaminem serwisu, Regulaminem NFT, Polityką prywatności oraz zasadami
                  Zwrotów i odstąpienia i akceptuję warunki zakupu.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer text-sm text-white/75 leading-snug">
                <input
                  type="checkbox"
                  className="mt-1 accent-emerald-500 shrink-0"
                  checked={agreeEarlyDigitalService}
                  onChange={(e) => setAgreeEarlyDigitalService(e.target.checked)}
                />
                <span>
                  Żądam rozpoczęcia świadczenia usługi cyfrowej przed upływem 14 dni od zawarcia umowy i przyjmuję do
                  wiadomości, że po pełnym wykonaniu usługi lub rozpoczęciu dostarczania treści cyfrowych w przypadkach
                  przewidzianych prawem moje prawo odstąpienia może ulec ograniczeniu lub wygasnąć zgodnie z zasadami
                  opisanymi w dokumentach.
                </span>
              </label>
              <p className="text-xs text-white/50 leading-relaxed pt-1">
                Aktywacja dostępu następuje po weryfikacji wpłaty. Szczegóły dotyczące rozpoczęcia świadczenia,
                reklamacji oraz odstąpienia opisano w dokumentach powyżej.
              </p>
            </div>
          </div>
        </section>

        <div className="pt-2 space-y-4 max-w-2xl">
          <div className="space-y-2">
            <label htmlFor="checkout-txid" className="block text-[11px] font-semibold uppercase tracking-wide text-white/50">
              TXID / hash transakcji (opcjonalnie, ale zalecane)
            </label>
            <input
              id="checkout-txid"
              type="text"
              value={txidInput}
              onChange={(e) => setTxidInput(e.target.value)}
              placeholder="Wklej identyfikator transakcji"
              autoComplete="off"
              disabled={markedSent}
              className="w-full rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-emerald-400/35 focus:ring-2 focus:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            disabled={markedSent || !bothConsentsGiven}
            onClick={() => setMarkedSent(true)}
            className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-slate-900 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {markedSent ? 'Zgłoszono do weryfikacji' : 'Zgłoś płatność do weryfikacji'}
          </button>
          {!bothConsentsGiven && !markedSent ? (
            <p className="text-xs text-white/55 leading-relaxed">
              Aby zgłosić płatność, zaakceptuj warunki zakupu i potwierdź zgodę dotyczącą rozpoczęcia świadczenia usługi
              cyfrowej.
            </p>
          ) : null}
          {markedSent ? (
            <div
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/[0.12] px-4 py-3 text-sm text-emerald-50/95 leading-relaxed"
              role="status"
              aria-live="polite"
            >
              Płatność została zgłoszona do weryfikacji. Po potwierdzeniu transakcji przez zespół FXEDULAB dostęp zostanie
              aktywowany zgodnie z warunkami oferty.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
