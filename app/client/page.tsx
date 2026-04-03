// app/client/page.tsx — hub startowy: dostęp → kierunki → edukacja → marketplace (bez Decision Block na tej stronie)
"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useClientPanelTier } from "./useClientPanelTier";
import {
  ArrowRight,
  BookOpen,
  Check,
  Crosshair,
  Crown,
  FlaskConical,
  LayoutGrid,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { getLearningSnapshot, getMembershipSnapshot, type PanelUserTier } from "./clientPanelMock";

function SectionEyebrow({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">
      <span className="tabular-nums text-white/55">{n}</span>
      <span className="h-px w-6 bg-white/15" aria-hidden />
      {children}
    </p>
  );
}

function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 ${className}`.trim()}
    >
      {children}
    </p>
  );
}

function NftMembershipVisual({
  hasNft,
  nftTier,
  imageUrl,
  productName,
}: {
  hasNft: boolean;
  nftTier: "none" | "founders" | "elite";
  imageUrl: string | null;
  productName: string;
}) {
  if (!hasNft) {
    return (
      <div
        className="relative mx-auto flex aspect-[3/4] w-full max-w-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/60 sm:mx-0 sm:max-w-[240px]"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <Lock className="relative h-10 w-10 text-white/35" />
        <p className="relative mt-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Brak aktywnego NFT
        </p>
        <p className="relative mt-1 px-4 text-center text-[10px] text-white/30">Karta dostępu nie jest przypisana</p>
      </div>
    );
  }

  const isElite = nftTier === "elite";

  if (imageUrl) {
    return (
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/15 bg-black sm:mx-0 sm:max-w-[240px]">
        <Image
          src={imageUrl}
          alt={`Podgląd NFT — ${productName}`}
          fill
          className="object-cover"
          sizes="240px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl border shadow-lg sm:mx-0 sm:max-w-[240px] ${
        isElite
          ? "border-cyan-400/35 bg-gradient-to-br from-cyan-950/90 via-slate-950 to-slate-950"
          : "border-amber-400/40 bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950"
      }`}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">FXEDULAB</span>
          {isElite ? (
            <Sparkles className="h-5 w-5 text-cyan-300/80" />
          ) : (
            <Crown className="h-5 w-5 text-amber-300/85" />
          )}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Access pass</p>
          <p className="mt-1 line-clamp-2 text-sm font-bold leading-tight text-white">{productName}</p>
        </div>
      </div>
    </div>
  );
}

function AccessMembershipCard({
  membership,
  hasDecisionCenter,
}: {
  membership: ReturnType<typeof getMembershipSnapshot>;
  hasDecisionCenter: boolean;
}) {
  return (
    <section
      className="overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-slate-950/95 to-slate-950 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75)] sm:p-7 lg:p-8"
      aria-labelledby="access-card-heading"
    >
      <SectionEyebrow n="1">Mój dostęp / moje NFT</SectionEyebrow>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-stretch lg:gap-10 xl:grid-cols-[minmax(0,280px)_1fr]">
        <div className="flex justify-center lg:justify-start">
          <NftMembershipVisual
            hasNft={hasDecisionCenter}
            nftTier={membership.nftTier}
            imageUrl={membership.nftImageUrl}
            productName={membership.nftDisplayName}
          />
        </div>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {hasDecisionCenter ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Dostęp aktywny
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                  <Crown className="h-3 w-3 shrink-0" aria-hidden />
                  NFT
                </span>
                {membership.nftTier === "elite" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
                    <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
                    Elite
                  </span>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/65">
                <Lock className="h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden />
                Brak aktywnego NFT — centrum decyzji zablokowane
              </span>
            )}
          </div>

          <div>
            <h2 id="access-card-heading" className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {hasDecisionCenter ? "Twoja karta dostępu" : "Stan konta"}
            </h2>
            {hasDecisionCenter ? (
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-lg font-semibold text-white">{membership.nftDisplayName}</span>
                <span className="text-sm text-white/35">·</span>
                <span className="text-sm font-medium text-cyan-200/90">{membership.tierShortLabel}</span>
                {membership.purchasedPriceUsd != null && (
                  <>
                    <span className="text-sm text-white/35">·</span>
                    <span className="text-sm tabular-nums text-white/70">
                      Wejście <span className="font-semibold text-white/85">${membership.purchasedPriceUsd} USD</span>
                    </span>
                    <span className="text-[10px] text-white/35">demo</span>
                  </>
                )}
              </div>
            ) : (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/52">
                Nie masz przypisanego NFT — w sekcji dostępu widać to wyraźnie. Edukacja (kursy, quizy) działa na koncie.
                Pełne <span className="text-white/70">centrum decyzji</span> (Decision Block) odblokujesz w marketplace.
              </p>
            )}
            {hasDecisionCenter && (
              <p className="mt-3 max-w-xl text-sm text-white/45">
                Główny workspace z wyborem aktywa i Decision Block otworzysz z karty{" "}
                <span className="font-semibold text-white/70">Centrum decyzji</span> poniżej.
              </p>
            )}
          </div>

          {hasDecisionCenter ? (
            <div>
              <SectionLabel>Co odblokowuje</SectionLabel>
              <ul className="mt-3 grid gap-2 sm:grid-cols-1 lg:max-w-2xl">
                {membership.nftUnlocksSummary.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] leading-snug text-white/75"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/80" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <Store className="h-4 w-4 shrink-0" aria-hidden />
                Kup dostęp — odblokuj centrum decyzji
              </Link>
              <Link
                href="/cennik"
                className="inline-flex items-center justify-center rounded-xl border border-white/18 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/25"
              >
                Cennik
              </Link>
            </div>
          )}

          {hasDecisionCenter && (
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <Store className="h-3.5 w-3.5" aria-hidden />
                Marketplace — NFT i odsprzedaż
              </Link>
              <Link
                href="/cennik"
                className="inline-flex items-center rounded-lg border border-white/12 px-3.5 py-2 text-xs font-semibold text-white/55 hover:text-white/75 focus:outline-none focus:ring-2 focus:ring-white/15"
              >
                Cennik / upgrade
              </Link>
              <span className="self-center text-[11px] text-white/35">Obrót wg regulaminu</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MainEntryCards({ hasDecisionCenter, tierQuery }: { hasDecisionCenter: boolean; tierQuery: string }) {
  const decisionHref = `/client/decision-center${tierQuery}`;

  return (
    <section className="space-y-5" aria-labelledby="entry-cards-heading">
      <div>
        <SectionEyebrow n="2">Główne wejścia</SectionEyebrow>
        <h2 id="entry-cards-heading" className="mt-3 text-lg font-bold tracking-tight text-white sm:text-xl">
          Kierunki pracy
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Cztery wejścia — centrum decyzji jest głównym workspace dla holdera; dla konta bez NFT pokazujemy go jako premium.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {hasDecisionCenter ? (
          <Link
            href={decisionHref}
            className="group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/[0.12] via-white/[0.05] to-slate-950/90 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.08)_inset] transition hover:border-cyan-300/40 hover:from-cyan-500/[0.16] focus:outline-none focus:ring-2 focus:ring-cyan-400/35"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-gradient-to-br from-cyan-400/30 to-transparent blur-2xl"
              aria-hidden
            />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-100/90">
                Główne
              </div>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-slate-950/60">
                <Crosshair className="h-6 w-6 text-cyan-200/95" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-white">Centrum decyzji</h3>
              <p className="mt-1 text-sm text-white/55">Aktywo, Decision Block, kolejne kroki po werdykcie.</p>
            </div>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-100/90 group-hover:text-cyan-50">
              Otwórz workspace
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ) : (
          <Link
            href="/marketplace"
            className="group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.1] via-white/[0.03] to-slate-950 p-6 transition hover:border-amber-300/35 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            aria-describedby="dc-locked-desc"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-gradient-to-br from-amber-400/25 to-transparent blur-2xl"
              aria-hidden
            />
            <div className="relative">
              <div className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-100/95">
                <Lock className="h-3 w-3" aria-hidden />
                Premium
              </div>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50">
                <Crosshair className="h-6 w-6 text-white/35" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-white/90">Centrum decyzji</h3>
              <p id="dc-locked-desc" className="mt-1 text-sm text-white/48">
                Decision Block i aktywa po zakupie NFT. Kliknij — przejdziesz do marketplace.
              </p>
            </div>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-100/90 group-hover:text-amber-50">
              Odblokuj w marketplace
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        )}

        {(
          [
            {
              href: `/client/decision-lab${tierQuery}`,
              icon: FlaskConical,
              title: "Decision Lab",
              subtitle: "Analiza i eksperymenty",
              accent: "from-violet-500/20 to-transparent",
              iconClass: "text-violet-300/90",
            },
            {
              href: "/challenge",
              icon: Zap,
              title: "Challenge",
              subtitle: "Podejmij decyzję",
              accent: "from-amber-500/20 to-transparent",
              iconClass: "text-amber-300/90",
            },
            {
              href: "/konto/panel-rynkowy",
              icon: LayoutGrid,
              title: "Moduły EDU",
              subtitle: "Pełny panel rynkowy",
              accent: "from-cyan-500/20 to-transparent",
              iconClass: "text-cyan-300/90",
            },
          ] as const
        ).map(({ href, icon: Icon, title, subtitle, accent, iconClass }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-6 transition hover:border-white/22 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            <div
              className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
              aria-hidden
            />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50">
                <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-white">{title}</h3>
              <p className="mt-1 text-sm text-white/48">{subtitle}</p>
            </div>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/55 group-hover:text-white/85">
              Otwórz
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EducationZone({ learning }: { learning: ReturnType<typeof getLearningSnapshot> }) {
  const pct = learning.totalLessons > 0 ? Math.round((learning.completedLessons / learning.totalLessons) * 100) : 0;

  return (
    <section
      id="edukacja"
      className="scroll-mt-24 rounded-2xl border border-white/[0.08] bg-slate-900/35 p-5 sm:p-6 lg:p-8"
      aria-labelledby="edu-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 max-w-xl space-y-2">
          <SectionEyebrow n="3">Edukacja</SectionEyebrow>
          <h2 id="edu-heading" className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Rozwój — dostępne po rejestracji
          </h2>
          <p className="text-sm text-white/48">Kursy, quizy i postęp — zawsze na koncie, także bez NFT.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/kursy"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            <BookOpen className="h-4 w-4 text-white/65" aria-hidden />
            Kursy
          </Link>
          <Link
            href="/quizy"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/14 focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            <LineChart className="h-4 w-4 text-white/65" aria-hidden />
            Quizy
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 lg:grid-cols-2 lg:gap-10">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/38">Postęp lekcji</p>
          <p className="mt-1 text-sm text-white/78">
            {learning.completedLessons}/{learning.totalLessons} ukończonych
          </p>
          <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500/90 to-emerald-500/85"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p>
            <span className="text-white/42">Ostatni kurs: </span>
            <span className="text-white/82">{learning.lastCourseTitle}</span>
          </p>
          <p>
            <span className="text-white/42">Następny quiz: </span>
            <span className="text-white/82">{learning.nextQuizLabel}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function MarketplaceSecondaryStrip({
  hasDecisionCenter,
  purchaseValueBullets,
}: {
  hasDecisionCenter: boolean;
  purchaseValueBullets: string[];
}) {
  return (
    <section
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 sm:px-6"
      aria-label="Marketplace w panelu"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <SectionEyebrow n="4">Marketplace</SectionEyebrow>
          <p className="mt-2 text-sm text-white/48">
            {hasDecisionCenter
              ? "Zarządzaj NFT, kup upgrade lub skorzystaj z marketplace przy odsprzedaży — zgodnie z regulaminem."
              : "Kup dostęp (NFT), aby odblokować centrum decyzji. Po zakupie sekcja dostępu i kafel zaktualizują się (po podpięciu API)."}
          </p>
          {!hasDecisionCenter && purchaseValueBullets.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-white/55">
              {purchaseValueBullets.slice(0, 3).map((b, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-amber-400/60" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <Store className="h-4 w-4" aria-hidden />
            {hasDecisionCenter ? "Marketplace" : "Kup dostęp"}
          </Link>
          <Link
            href="/platnosc"
            className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-white/45 hover:text-white/65 focus:outline-none focus:ring-2 focus:ring-white/15"
          >
            Płatności
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClientPanelInner() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get("tier");
  const panel = useClientPanelTier(tierParam);

  if (panel.status === "loading") {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-[min(1440px,calc(100vw-1.5rem))] px-3 py-10 sm:px-5 lg:px-8">
          <div className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" aria-hidden />
        </div>
      </main>
    );
  }

  if (panel.status === "error") {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm text-rose-200/90">{panel.message}</p>
          <Link
            href="/logowanie?next=/client"
            className="mt-6 inline-flex rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.1]"
          >
            Logowanie
          </Link>
        </div>
      </main>
    );
  }

  const tier: PanelUserTier = panel.tier;
  const tierQuery = panel.tierQuerySuffix;

  const membership = getMembershipSnapshot(tier);
  const learning = getLearningSnapshot(tier);

  const hasDecisionCenter = membership.hasAccess && membership.hasNft;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-[min(1440px,calc(100vw-1.5rem))] px-3 pb-24 pt-5 sm:px-5 sm:pt-7 lg:px-8 lg:pt-9 xl:max-w-[1520px]">
        <div className="mb-8 flex flex-col gap-2 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">Panel klienta · hub</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">FXEDULAB</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">
              Start: dostęp, skróty, edukacja i marketplace. Workspace decyzyjny jest na osobnej ścieżce{" "}
              <span className="text-white/55">/client/decision-center</span>.
            </p>
            {panel.source === "account" && panel.plan != null && (
              <p className="mt-2 text-[11px] text-white/32">
                Plan konta: <span className="text-white/50">{panel.plan}</span>
                {panel.plan === "starter" ? " (Founders / NFT)" : null}
                {panel.plan === "pro" ? " (widok Founders w FXEDULAB)" : null}
              </p>
            )}
          </div>
          {panel.qaTierQueryAllowed ? (
            <p className="text-[11px] text-white/32 max-sm:order-first">
              QA URL:{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/50">?tier=free</code>,{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/50">founders</code>,{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/50">elite</code>
              {process.env.NODE_ENV === "production" ? (
                <span className="block mt-1 text-white/25">W produkcji wymaga CLIENT_PANEL_ALLOW_TIER_QUERY=1</span>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="space-y-10 lg:space-y-14">
          <AccessMembershipCard membership={membership} hasDecisionCenter={hasDecisionCenter} />

          <MainEntryCards hasDecisionCenter={hasDecisionCenter} tierQuery={tierQuery} />

          <EducationZone learning={learning} />

          <MarketplaceSecondaryStrip
            hasDecisionCenter={hasDecisionCenter}
            purchaseValueBullets={membership.purchaseValueBullets}
          />
        </div>
      </div>
    </main>
  );
}

function ClientPanelFallback() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-[min(1440px,calc(100vw-1.5rem))] px-3 py-10 sm:px-5 lg:px-8">
        <div className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" aria-hidden />
      </div>
    </main>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={<ClientPanelFallback />}>
      <ClientPanelInner />
    </Suspense>
  );
}
