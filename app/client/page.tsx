// app/client/page.tsx — hub startowy: dostęp → kierunki → edukacja → marketplace (bez Decision Block na tej stronie)
"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";
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
  X,
  Zap,
} from "lucide-react";
import { getLearningSnapshot, getMembershipSnapshot, type PanelUserTier } from "./clientPanelMock";
import { useClientCertificateStatus } from "./useClientCertificateStatus";
import { useKursyMainProgress } from "./useKursyMainProgress";
import { COURSES } from "@/data/courses";
import { FxedulabCredentialDocument } from "@/components/certificates/FxedulabCredentialDocument";
import { PUBLIC_CERT_FXEDULAB_PATH } from "@/lib/certifications/publicCertInfoPath";
import { isFoundersMarketplaceSalesPaused } from "@/lib/marketplace/offers";

function courseSlugFromNextLearnHref(href: string): string | null {
  const m = href.trim().match(/^\/kursy\/([^/?#]+)/);
  return m?.[1] ?? null;
}

function nextCourseStepLabel(
  nextLearnHref: string | undefined | null,
  fallbackLastCourseTitle: string,
): string {
  if (!nextLearnHref) return fallbackLastCourseTitle;
  const slug = courseSlugFromNextLearnHref(nextLearnHref);
  if (!slug || !(slug in COURSES)) return fallbackLastCourseTitle;
  const course = COURSES[slug as keyof typeof COURSES];
  return course.subtitle ? `${course.title} — ${course.subtitle}` : course.title;
}

/** Odmiana dla „Brakuje Ci jeszcze N …” */
function polishKrokiWord(n: number): string {
  if (n === 1) return "krok";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "kroki";
  return "kroków";
}

/** Mikro-komunikat pod X/Y w hero certyfikatu — progi 50% / 75% / 90%, nic poniżej 30%. */
function certHeroMicroFeedback(completed: number, total: number): string | null {
  if (total <= 0) return null;
  const r = completed / total;
  if (r < 0.3) return null;
  if (r >= 0.9) return "Ostatni etap — zaraz możesz podejść do egzaminu.";
  if (r >= 0.75) return "Zostało niewiele — jesteś blisko ukończenia.";
  if (r >= 0.5) return "Jesteś już w połowie drogi do certyfikatu.";
  return null;
}

/** Badge przy pasku postępu w hero certyfikatu — progi 50% / 75% / 90%. */
function certHeroProgressBarBadgeLabel(completed: number, total: number): string | null {
  if (total <= 0) return null;
  const r = completed / total;
  if (r >= 0.9) return "Prawie gotowe";
  if (r >= 0.75) return "75% ukończone";
  if (r >= 0.5) return "50% ukończone";
  return null;
}

function formatCertPreviewDatePl(): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/** LinkedIn — dodanie certyfikacji do profilu (certUrl = publiczna strona weryfikacji). */
function buildLinkedInCertificationAddUrl(verifyAbsoluteUrl: string): string {
  const p = new URLSearchParams();
  p.set("startTask", "CERTIFICATION_NAME");
  p.set("name", "Certyfikat FXEDULAB");
  p.set("organizationName", "FXEDULAB");
  p.set("certUrl", verifyAbsoluteUrl);
  return `https://www.linkedin.com/profile/add?${p.toString()}`;
}

function CertificateCompactPreview({
  allMainComplete,
  onOpen,
}: {
  allMainComplete: boolean;
  onOpen: () => void;
}) {
  const issuedDateDisplay = formatCertPreviewDatePl();
  return (
    <div className="group/prev mx-auto w-fit max-w-full origin-center rotate-[-1.5deg] rounded-lg shadow-[0_0_28px_-6px_rgba(251,191,36,0.38)] transition-[transform,box-shadow] duration-300 ease-out group-hover/prev:rotate-0 group-hover/prev:shadow-[0_0_52px_-4px_rgba(251,191,36,0.62)]">
      <button
        type="button"
        onClick={onOpen}
        className="relative mx-auto flex aspect-[297/210] w-full max-w-[260px] flex-col overflow-hidden rounded-[3px] border text-left transition duration-300 ease-out group-hover/prev:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 lg:max-w-[300px]"
        style={{
          borderColor: "#8a7340",
          boxShadow: "inset 0 1px 0 rgba(228,207,122,0.06)",
        }}
        aria-label="Powiększ podgląd certyfikatu"
      >
        <span
          className={`pointer-events-none absolute right-1.5 top-1.5 z-20 rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide shadow-sm ${
            allMainComplete
              ? "border-emerald-400/35 bg-emerald-950/90 text-emerald-100/90"
              : "border-amber-400/25 bg-black/70 text-amber-100/65"
          }`}
        >
          {allMainComplete ? "Gotowy" : "Nieukończony"}
        </span>
        <div className="relative z-[1] min-h-0 flex-1">
          <FxedulabCredentialDocument
            variant="mini"
            allMainComplete={allMainComplete}
            issuedDateDisplay={issuedDateDisplay}
            className="h-full min-h-0 w-full"
          />
        </div>
        <span className="pointer-events-none absolute inset-0 z-[12] flex items-center justify-center bg-black/58 opacity-0 transition-opacity duration-300 group-hover/prev:opacity-100">
          <span className="text-[11px] font-semibold text-amber-100/95">Zobacz certyfikat →</span>
        </span>
      </button>
    </div>
  );
}

function CertificateHeroPreviewColumn({
  allMainComplete,
  onOpen,
}: {
  allMainComplete: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[260px] shrink-0 flex-col gap-2 lg:max-w-[300px] xl:mx-0 xl:ml-auto">
      <p className="text-center text-[11px] font-medium leading-snug text-white/48 xl:text-right">
        Twój certyfikat po ukończeniu:
      </p>
      <CertificateCompactPreview allMainComplete={allMainComplete} onOpen={onOpen} />
      <p className="text-center text-[11px] leading-snug text-white/42 xl:text-right">
        Po ukończeniu możesz dodać do CV i LinkedIn
      </p>
    </div>
  );
}

function CertificatePreviewModal({
  open,
  onClose,
  allMainComplete,
}: {
  open: boolean;
  onClose: () => void;
  allMainComplete: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const issuedDate = formatCertPreviewDatePl();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        aria-label="Zamknij"
        onClick={onClose}
      />
      <div className="relative z-[1] flex max-h-[min(94vh,940px)] w-full max-w-[min(960px,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-2xl border border-amber-500/25 bg-[#05070b] shadow-[0_0_80px_-20px_rgba(251,191,36,0.45)] sm:max-w-[min(960px,calc(100vw-2rem))]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <p id="cert-modal-title" className="text-sm font-semibold text-white/88">
            Podgląd certyfikatu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-1.5 text-white/55 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/35"
            aria-label="Zamknij okno"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-3 py-5 sm:px-6 sm:py-7">
          <FxedulabCredentialDocument
            variant="full"
            allMainComplete={allMainComplete}
            issuedDateDisplay={issuedDate}
            className="mx-auto w-full max-w-[880px]"
          />
          <p className="mt-5 text-center text-[11px] text-white/40 sm:mt-6">
            {allMainComplete
              ? "Możesz pobrać i dodać do CV lub LinkedIn."
              : "Odblokujesz po ukończeniu wszystkich wymaganych modułów i egzaminu."}
          </p>
        </div>
      </div>
    </div>
  );
}

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
  compact = false,
}: {
  hasNft: boolean;
  nftTier: "none" | "founders" | "elite";
  imageUrl: string | null;
  productName: string;
  compact?: boolean;
}) {
  const maxW = compact ? "max-w-[168px]" : "max-w-[220px] sm:max-w-[240px]";

  if (!hasNft) {
    return (
      <div
        className={`relative mx-auto flex aspect-[3/4] w-full ${maxW} flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/60 sm:mx-0`}
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
      <div
        className={`relative mx-auto aspect-[3/4] w-full ${maxW} overflow-hidden rounded-2xl border border-white/15 bg-black sm:mx-0`}
      >
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
      className={`relative mx-auto aspect-[3/4] w-full ${maxW} overflow-hidden rounded-2xl border shadow-lg sm:mx-0 ${
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

/** Kompaktowa karta dostępu/NFT w prawej kolumnie hero dashboardu. */
function DashboardAccessCard({
  membership,
  hasDecisionCenter,
  salesPaused,
  tierQuery,
}: {
  membership: ReturnType<typeof getMembershipSnapshot>;
  hasDecisionCenter: boolean;
  salesPaused: boolean;
  tierQuery: string;
}) {
  const decisionHref = `/client/decision-center${tierQuery}`;
  return (
    <div
      className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-slate-950/95 to-slate-950 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75)] sm:p-5 lg:min-h-0"
      aria-labelledby="access-card-heading"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Mój dostęp / moje NFT</p>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 justify-center">
          <NftMembershipVisual
            compact
            hasNft={hasDecisionCenter}
            nftTier={membership.nftTier}
            imageUrl={membership.nftImageUrl}
            productName={membership.nftDisplayName}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {hasDecisionCenter ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100">
                  <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
                  Aktywny
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                  <Crown className="h-2.5 w-2.5 shrink-0" aria-hidden />
                  NFT
                </span>
                {membership.nftTier === "elite" && (
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-100">
                    <Sparkles className="h-2.5 w-2.5 shrink-0" aria-hidden />
                    Elite
                  </span>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-white/62">
                <Lock className="h-3 w-3 shrink-0 text-white/45" aria-hidden />
                Brak aktywnego NFT
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h2 id="access-card-heading" className="text-base font-bold tracking-tight text-white sm:text-lg">
              {hasDecisionCenter ? "Twoja karta dostępu" : "Stan konta"}
            </h2>
            {hasDecisionCenter ? (
              <div className="mt-2 space-y-1 text-[13px] leading-snug">
                <p className="font-semibold text-white/90">{membership.nftDisplayName}</p>
                <p className="text-white/48">{membership.tierShortLabel}</p>
                {membership.purchasedPriceUsd != null && (
                  <p className="tabular-nums text-white/55">
                    Wejście <span className="font-medium text-white/75">${membership.purchasedPriceUsd} USD</span>{" "}
                    <span className="text-[10px] text-white/30">demo</span>
                  </p>
                )}
                <p className="text-[12px] text-white/42">
                  Workspace: kafel <span className="font-medium text-white/60">Centrum decyzji</span> poniżej.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-2 text-[13px] leading-snug text-white/50">
                <p>
                  <span className="font-semibold text-white/82">Odblokuj pełny dostęp</span>
                </p>
                <p>
                  Decision Block, narzędzia analityczne i pełne środowisko pracy tradera.
                </p>
                {salesPaused ? (
                  <p className="text-[12px] text-white/45">
                    Zakup dostępu: <span className="text-amber-200/85">wstrzymany (brak miejsc)</span>.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {hasDecisionCenter ? (
            <div className="min-w-0 flex-1">
              <SectionLabel>Skrót</SectionLabel>
              <ul className="mt-2 space-y-1.5">
                {membership.nftUnlocksSummary.slice(0, 2).map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-[12px] leading-snug text-white/72"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/75" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={decisionHref}
                className="group mt-4 flex w-full flex-col gap-1.5 rounded-xl border border-cyan-400/22 bg-gradient-to-br from-cyan-500/[0.1] via-white/[0.03] to-transparent px-3 py-3 text-left shadow-[0_0_0_1px_rgba(34,211,238,0.06)_inset] transition hover:border-cyan-300/38 hover:from-cyan-500/[0.14] focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              >
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-cyan-100/95">
                  <Crosshair className="h-3.5 w-3.5 shrink-0 text-cyan-200/90" aria-hidden />
                  Panel decyzyjny
                </span>
                <span className="text-[11px] leading-snug text-white/52">
                  Wejdź i odkryj rynek z panelem decyzyjnym — aktywo, Decision Block i kontekst w jednym miejscu.
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-200/90">
                  Otwórz workspace
                  <ArrowRight className="h-3 w-3 shrink-0 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </div>
          ) : null}

          {!hasDecisionCenter ? (
            <div className="mt-auto flex flex-col gap-2">
              {salesPaused ? (
                <span
                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white/45"
                  aria-disabled
                >
                  <Store className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                  Brak miejsc — zakup wstrzymany
                </span>
              ) : (
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <Store className="h-4 w-4 shrink-0" aria-hidden />
                  Zobacz dostęp
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                </Link>
              )}
              <Link
                href="/cennik"
                className="inline-flex items-center justify-center rounded-xl border border-white/18 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/25"
              >
                Cennik
              </Link>
            </div>
          ) : (
            <div className="mt-auto flex flex-wrap gap-2 border-t border-white/10 pt-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <Store className="h-3 w-3" aria-hidden />
                Marketplace
              </Link>
              <Link
                href="/cennik"
                className="inline-flex items-center rounded-lg border border-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/55 hover:text-white/75 focus:outline-none focus:ring-2 focus:ring-white/15"
              >
                Cennik
              </Link>
              <span className="self-center text-[10px] text-white/32">Regulamin</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientDashboardHero({
  membership,
  hasDecisionCenter,
  salesPaused,
  tierQuery,
  kursyProgress,
  certificateStatus,
}: {
  membership: ReturnType<typeof getMembershipSnapshot>;
  hasDecisionCenter: boolean;
  salesPaused: boolean;
  tierQuery: string;
  kursyProgress: ReturnType<typeof useKursyMainProgress>;
  certificateStatus: ReturnType<typeof useClientCertificateStatus>;
}) {
  return (
    <section className="scroll-mt-24" aria-label="Pulpit — certyfikat i dostęp">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
        <div className="flex h-full min-h-0">
          <DashboardCertificateColumn
            kursyProgress={kursyProgress}
            certificateStatus={certificateStatus}
          />
        </div>
        <div className="flex h-full min-h-0">
          <DashboardAccessCard
            membership={membership}
            hasDecisionCenter={hasDecisionCenter}
            salesPaused={salesPaused}
            tierQuery={tierQuery}
          />
        </div>
      </div>
    </section>
  );
}

/** Materiały rozszerzające — kompaktowy blok pod certyfikatem FXEDULAB. */
function CertificateOptionalRegulationsExtension() {
  const tileClass =
    "group flex min-h-0 flex-col rounded-xl border border-white/10 p-4 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15";

  return (
    <div className="max-w-xl space-y-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="space-y-2">
        <p className="text-xs font-medium tabular-nums text-white/55">Masz 1/3 certyfikatów</p>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
          role="progressbar"
          aria-valuenow={1}
          aria-valuemin={0}
          aria-valuemax={3}
          aria-label="Postęp certyfikatów: 1 z 3"
        >
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500/80 to-emerald-400/60" />
        </div>
      </div>

      <h3 className="text-sm font-semibold tracking-tight text-white/70">Co dalej?</h3>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/kursy/egzaminy/knf" className={tileClass}>
          <span className="text-sm font-semibold text-white/88">KNF</span>
          <span className="mt-1 text-[11px] text-white/45">Następny krok</span>
          <span className="mt-3 text-[11px] font-semibold text-white/50 group-hover:text-white/70">
            Zobacz →
          </span>
        </Link>
        <Link href="/kursy/egzaminy/cysec" className={tileClass}>
          <span className="text-sm font-semibold text-white/88">CySEC</span>
          <span className="mt-1 text-[11px] text-white/45">Zaawansowane</span>
          <span className="mt-3 text-[11px] font-semibold text-white/50 group-hover:text-white/70">
            Zobacz →
          </span>
        </Link>
      </div>
    </div>
  );
}

function DashboardCertificateColumn({
  kursyProgress,
  certificateStatus,
}: {
  kursyProgress: ReturnType<typeof useKursyMainProgress>;
  certificateStatus: ReturnType<typeof useClientCertificateStatus>;
}) {
  const examHref = "/konto/certyfikat/egzamin";

  const ready = kursyProgress.status === "ready" ? kursyProgress.data : null;
  const showProgress = Boolean(ready && ready.totalLessons > 0);
  const pct = showProgress ? Math.round((ready!.completedLessons / ready!.totalLessons) * 100) : 0;
  const allMainComplete = Boolean(ready?.allMainCoursesComplete);
  const continueHref = ready?.nextLearnHref ?? "/kursy";
  const certMicroLine =
    showProgress && ready ? certHeroMicroFeedback(ready.completedLessons, ready.totalLessons) : null;
  const certBarBadgeLabel =
    showProgress && ready ? certHeroProgressBarBadgeLabel(ready.completedLessons, ready.totalLessons) : null;

  const certificateCompleted =
    certificateStatus.status === "ready" && certificateStatus.certificateCompleted === true;
  const verifyAbsoluteUrl =
    certificateStatus.status === "ready" && certificateStatus.certificateCompleted
      ? certificateStatus.verifyAbsoluteUrl
      : undefined;
  const linkedInHref =
    verifyAbsoluteUrl && verifyAbsoluteUrl.length > 0
      ? buildLinkedInCertificationAddUrl(verifyAbsoluteUrl)
      : null;

  const previewAsIssued = certificateCompleted || allMainComplete;

  const [certPreviewModalOpen, setCertPreviewModalOpen] = useState(false);

  const primaryCtaClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/20 via-amber-400/12 to-cyan-500/15 px-5 py-3.5 text-sm font-semibold text-amber-50 transition hover:border-amber-300/45 hover:from-amber-500/28 hover:via-amber-400/18 hover:shadow-[0_0_36px_-10px_rgba(251,191,36,0.35)] focus:outline-none focus:ring-2 focus:ring-amber-400/35 sm:w-auto";
  const secondaryCtaClass =
    "inline-flex w-full items-center justify-center rounded-2xl border border-white/14 bg-white/[0.06] px-5 py-3.5 text-sm font-semibold text-white/90 transition hover:border-cyan-400/25 hover:bg-white/[0.1] hover:shadow-[0_0_32px_-12px_rgba(34,211,238,0.2)] focus:outline-none focus:ring-2 focus:ring-cyan-400/30 sm:w-auto";

  return (
    <>
      <div
        className="group relative h-full min-h-0 w-full rounded-3xl p-px transition duration-300 hover:shadow-[0_0_56px_-12px_rgba(251,191,36,0.22)]"
        style={{
          background: certificateCompleted
            ? "linear-gradient(135deg, rgba(52,211,153,0.38) 0%, rgba(56,189,248,0.28) 52%, rgba(251,191,36,0.32) 100%)"
            : "linear-gradient(135deg, rgba(251,191,36,0.42) 0%, rgba(56,189,248,0.28) 48%, rgba(251,191,36,0.35) 100%)",
        }}
      >
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[calc(1.5rem-1px)] border border-white/[0.06] bg-gradient-to-br from-[#07080c] via-slate-950 to-black shadow-[0_24px_70px_-28px_rgba(0,0,0,0.85)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl transition duration-500 group-hover:bg-amber-400/14"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-cyan-500/8 blur-3xl transition duration-500 group-hover:bg-cyan-500/11"
          />

          <div className="relative flex min-h-0 flex-1 flex-col gap-6 p-5 sm:p-6 lg:p-8">
            <div className="flex min-h-0 flex-1 flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
              <div className="min-w-0 min-h-0 flex-1 space-y-5">
                {certificateCompleted ? (
                  <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/95">
                    ZALICZONE
                  </span>
                ) : (
                  <span className="inline-flex w-fit items-center rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100/90">
                    TWÓJ CEL
                  </span>
                )}
                <div>
                  <h2
                    id="cert-hub-heading"
                    className="text-lg font-bold tracking-tight text-white sm:text-xl"
                  >
                    {certificateCompleted ? "Certyfikat FXEDULAB zdobyty" : "Certyfikat FXEDULAB"}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/52">
                    {certificateCompleted
                      ? "Gratulacje — dokument jest w Twoim koncie i gotowy do wykorzystania zawodowego."
                      : "Zdobądź certyfikat, który możesz realnie wykorzystać w CV i na LinkedIn — pokazujący, że rozumiesz rynek, nie tylko teorię."}
                  </p>
                </div>

                {certificateCompleted ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-4 sm:px-5">
                    <p className="text-sm font-semibold text-emerald-50/95">Twój certyfikat jest gotowy</p>
                    <ul className="mt-3 space-y-2.5 text-sm text-white/72">
                      <li className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" aria-hidden />
                        <span>Gotowy do CV</span>
                      </li>
                      <li className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" aria-hidden />
                        <span>Możesz dodać do LinkedIn</span>
                      </li>
                      <li className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" aria-hidden />
                        <span>Potwierdza Twoje kompetencje</span>
                      </li>
                    </ul>
                  </div>
                ) : null}

                {certificateCompleted ? <CertificateOptionalRegulationsExtension /> : null}

                {!certificateCompleted ? (
                  <ul className="space-y-2.5 text-sm text-white/72">
                    <li className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/85" aria-hidden />
                      <span>Gotowy do dodania do CV i LinkedIn</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/85" aria-hidden />
                      <span>Pokazuje, że rozumiesz jak działa rynek (nie tylko definicje)</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/85" aria-hidden />
                      <span>Opiera się na realnych scenariuszach rynkowych</span>
                    </li>
                  </ul>
                ) : null}

                <div className="pt-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-amber-200/45">
                    Postęp do certyfikatu
                  </p>
                  {certificateCompleted ? (
                    <>
                      <div className="mt-3 xl:hidden">
                        <CertificateCompactPreview
                          allMainComplete
                          onOpen={() => setCertPreviewModalOpen(true)}
                        />
                      </div>
                      <div className="mt-3 flex max-w-md items-center gap-2">
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                          <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500/90 via-emerald-400/75 to-cyan-400/75" />
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-100/90">
                          Ukończono
                        </span>
                      </div>
                    </>
                  ) : certificateStatus.status === "loading" ? (
                    <p className="mt-2 text-sm text-white/40">Sprawdzanie statusu certyfikatu…</p>
                  ) : kursyProgress.status === "loading" ? (
                    <p className="mt-2 text-sm text-white/40">Synchronizacja postępu z konta…</p>
                  ) : kursyProgress.status === "error" ? (
                    <p className="mt-2 text-sm text-white/42">
                      Nie udało się wczytać postępu. Odśwież stronę lub spróbuj ponownie później.
                    </p>
                  ) : showProgress ? (
                    <>
                      <p className="mt-2 text-sm leading-snug text-white/65">
                        Jesteś w trakcie zdobywania certyfikatu:
                      </p>
                      <p className="mt-1.5 text-sm tabular-nums text-white/78">
                        Postęp do certyfikatu: {ready!.completedLessons}/{ready!.totalLessons}
                      </p>
                      {certMicroLine ? (
                        <p className="mt-1 text-sm text-white/60">{certMicroLine}</p>
                      ) : null}
                      <div className="mt-3 flex max-w-md items-center gap-2">
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500/90 via-amber-400/80 to-cyan-400/75"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {certBarBadgeLabel ? (
                          <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70">
                            {certBarBadgeLabel}
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-white/38">
                      Ukończ lekcje w głównych modułach — wtedy zobaczysz tu swój postęp.
                    </p>
                  )}
                </div>

                {!certificateCompleted ? (
                  <p className="max-w-xl text-[13px] leading-snug text-white/45">
                    Każdy ukończony moduł przybliża Cię do realnego certyfikatu, który możesz pokazać.
                  </p>
                ) : null}
              </div>

              <div className="hidden shrink-0 xl:block xl:w-[min(300px,100%)] xl:pt-1">
                {certificateCompleted ? (
                  <div className="mx-auto flex w-full max-w-[300px] flex-col gap-2">
                    <p className="text-center text-[11px] font-medium leading-snug text-white/48 xl:text-right">
                      Twój certyfikat:
                    </p>
                    <CertificateCompactPreview
                      allMainComplete
                      onOpen={() => setCertPreviewModalOpen(true)}
                    />
                  </div>
                ) : (
                  <CertificateHeroPreviewColumn
                    allMainComplete={previewAsIssued}
                    onOpen={() => setCertPreviewModalOpen(true)}
                  />
                )}
              </div>
            </div>

            <div className="relative shrink-0 space-y-3 border-t border-white/[0.08] pt-6">
              {certificateCompleted ? (
                <>
                  <a href="/api/konto/certyfikat/pdf" className={primaryCtaClass}>
                    Pobierz certyfikat
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                  {linkedInHref ? (
                    <a
                      href={linkedInHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={secondaryCtaClass}
                    >
                      Dodaj do LinkedIn
                      <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
                    </a>
                  ) : null}
                  <Link href="/konto/certyfikat" className={secondaryCtaClass}>
                    Przejdź dalej
                    <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
                  </Link>
                </>
              ) : allMainComplete ? (
                <Link href={examHref} className={primaryCtaClass}>
                  Przejdź do egzaminu
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <Link href={continueHref} className={secondaryCtaClass}>
                  Kontynuuj → kolejny krok
                </Link>
              )}
              <Link
                href="/konto/panel-rynkowy"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/16 bg-transparent px-4 py-2.5 text-sm font-semibold text-white/58 transition hover:border-cyan-400/40 hover:bg-cyan-500/[0.06] hover:text-white/85 hover:shadow-[0_0_32px_-10px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400/25 sm:w-auto"
              >
                Odblokuj narzędzia analityczne
              </Link>
            </div>

            <div className="shrink-0 pt-2 xl:hidden">
              {!certificateCompleted ? (
                <CertificateHeroPreviewColumn
                  allMainComplete={previewAsIssued}
                  onOpen={() => setCertPreviewModalOpen(true)}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <CertificatePreviewModal
        open={certPreviewModalOpen}
        onClose={() => setCertPreviewModalOpen(false)}
        allMainComplete={previewAsIssued}
      />
    </>
  );
}

function WhatsNextSection({
  learning,
  kursyProgress,
  certificateCompleted,
}: {
  learning: ReturnType<typeof getLearningSnapshot>;
  kursyProgress: ReturnType<typeof useKursyMainProgress>;
  certificateCompleted: boolean;
}) {
  const ready = kursyProgress.status === "ready" ? kursyProgress.data : null;
  const courseHref = ready?.nextLearnHref ?? "/kursy";
  const nextCourseTitle = nextCourseStepLabel(ready?.nextLearnHref ?? null, learning.lastCourseTitle);
  const quizLabel = learning.nextQuizLabel;
  const certProgressReady = Boolean(ready?.allMainCoursesComplete);
  const examHref = "/konto/certyfikat/egzamin";
  const certStepsRemaining =
    ready && ready.totalLessons > 0 && !certProgressReady
      ? Math.max(0, ready.totalLessons - ready.completedLessons)
      : null;

  const nextStepCtaClass =
    "inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/18 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:border-cyan-400/30 hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-cyan-400/25 sm:w-auto";

  return (
    <section
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br from-white/[0.06] via-slate-950/90 to-slate-950 p-5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.7)] sm:p-6 lg:p-8"
      aria-labelledby="whats-next-heading"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/50">Następny krok</p>
      <h2 id="whats-next-heading" className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">
        Co dalej teraz
      </h2>
      {certificateCompleted ? (
        <p className="mt-2 text-sm font-medium text-emerald-100/90">
          Zaliczyłeś egzamin — certyfikat FXEDULAB jest przypisany do konta.
        </p>
      ) : kursyProgress.status === "loading" ? (
        <p className="mt-2 text-sm text-white/40">Synchronizacja postępu z konta…</p>
      ) : kursyProgress.status === "error" ? (
        <p className="mt-2 text-sm text-white/42">
          Nie udało się wczytać postępu. Odśwież stronę lub spróbuj ponownie później.
        </p>
      ) : ready && ready.totalLessons > 0 ? (
        <>
          <p className="mt-2 text-sm font-medium tabular-nums text-white/78">
            Twój postęp do certyfikatu: {ready.completedLessons}/{ready.totalLessons}
          </p>
          <p className="mt-1 text-sm text-white/55">Jesteś w połowie drogi do certyfikatu.</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-white/45">
          Twój postęp do certyfikatu pojawi się po ukończeniu lekcji w głównych modułach.
        </p>
      )}
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/48">
        Na podstawie Twojego postępu podpowiadamy najbliższy sensowny krok.
      </p>

      <div className="mt-6 rounded-xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500/[0.08] via-white/[0.04] to-transparent px-4 py-3 sm:px-5 sm:py-3.5">
        <p className="text-sm font-semibold tracking-tight text-cyan-100/95">
          Najbliższy krok do certyfikatu:
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-cyan-400/40 bg-white/[0.05] p-4 shadow-[0_0_44px_-14px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/12 blur-2xl"
          />
          <div className="relative">
            <p className="text-sm font-bold tracking-tight text-white/95">Najlepszy następny krok</p>
            <span className="mt-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-100/95">
              REKOMENDOWANE
            </span>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Następna lekcja</p>
          </div>
          <p className="relative mt-2 text-sm font-semibold leading-snug text-white/92 line-clamp-3">{nextCourseTitle}</p>
          <div className="relative mt-2 flex-1">
            <p className="text-[13px] leading-relaxed text-white/52">
              To jest najbliższy krok, który przybliża Cię do certyfikatu.
            </p>
            <p className="mt-1 text-sm text-cyan-200/80">
              To najszybszy sposób, żeby odblokować egzamin.
            </p>
          </div>
          <Link href={courseHref} className={`${nextStepCtaClass} relative mt-4`}>
            Zrób kolejny krok
            <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
          </Link>
        </div>

        <div className="flex min-h-[200px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Następny quiz</p>
          <p className="mt-2 text-sm font-semibold leading-snug text-white/92 line-clamp-3">{quizLabel}</p>
          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/48">
            Sprawdź wiedzę i zwiększ postęp do certyfikatu.
          </p>
          <Link href="/quizy" className={`${nextStepCtaClass} mt-4`}>
            Rozwiąż quiz
            <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
          </Link>
        </div>

        <div className="flex min-h-[200px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">Status certyfikatu</p>
          <p className="mt-2 text-sm font-semibold leading-snug text-white/92">
            {certificateCompleted
              ? "Certyfikat zdobyty"
              : certProgressReady
                ? "Możesz podejść do egzaminu"
                : "Jeszcze nie gotowe"}
          </p>
          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/48">
            {certificateCompleted
              ? "Pobierz PDF, dodaj wpis na LinkedIn lub przejdź do pełnej strony certyfikatu na koncie."
              : certProgressReady
                ? "Masz wymagany progres. Czas podejść do egzaminu."
                : "Dokończ kursy i quizy, aby odblokować egzamin."}
          </p>
          {!certificateCompleted && !certProgressReady && certStepsRemaining != null && certStepsRemaining > 0 ? (
            <>
              <p className="mt-2 text-[13px] font-medium tabular-nums text-amber-200/80">
                Brakuje Ci jeszcze {certStepsRemaining} {polishKrokiWord(certStepsRemaining)}
              </p>
              <p className="mt-1 text-sm text-white/50">
                Im szybciej je ukończysz, tym szybciej odblokujesz egzamin.
              </p>
              <p className="mt-1 text-sm text-white/50">Po ich ukończeniu odblokujesz egzamin.</p>
            </>
          ) : null}
          {certificateCompleted ? (
            <Link
              href="/konto/certyfikat"
              className={`${nextStepCtaClass} mt-4 border-emerald-400/25 bg-emerald-500/[0.1] text-emerald-50 hover:border-emerald-400/40 hover:bg-emerald-500/[0.14] focus:ring-emerald-400/30`}
            >
              Zobacz certyfikat na koncie
              <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          ) : certProgressReady ? (
            <Link
              href={examHref}
              className={`${nextStepCtaClass} mt-4 border-amber-400/25 bg-amber-500/[0.1] text-amber-50 hover:border-amber-400/40 hover:bg-amber-500/[0.14] focus:ring-amber-400/30`}
            >
              Przejdź do egzaminu
              <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          ) : (
            <Link href={PUBLIC_CERT_FXEDULAB_PATH} className={`${nextStepCtaClass} mt-4`}>
              Zobacz wymagania
              <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center text-[12px] leading-snug text-white/45">
        {certificateCompleted
          ? "Masz certyfikat — wykorzystaj go w CV i na LinkedIn, albo przejdź do kolejnych narzędzi na koncie."
          : "Każdy ukończony krok przybliża Cię do egzaminu i certyfikatu."}
      </p>
    </section>
  );
}

function MainEntryCards({
  hasDecisionCenter,
  tierQuery,
  salesPaused,
}: {
  hasDecisionCenter: boolean;
  tierQuery: string;
  salesPaused: boolean;
}) {
  const decisionHref = `/client/decision-center${tierQuery}`;

  return (
    <section className="space-y-5" aria-labelledby="entry-cards-heading">
      <div>
        <SectionEyebrow n="3">Główne wejścia</SectionEyebrow>
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
                {salesPaused
                  ? "Pierwotny zakup NFT jest na razie wstrzymany (brak miejsc). Możesz przejść do strony marketplace po informacje."
                  : "Decision Block i aktywa po zakupie NFT. Kliknij — przejdziesz do marketplace."}
              </p>
            </div>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-100/90 group-hover:text-amber-50">
              {salesPaused ? "Brak miejsc — szczegóły" : "Odblokuj w marketplace"}
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

function EducationZone({
  learning,
  kursyProgress,
  certificateCompleted,
}: {
  learning: ReturnType<typeof getLearningSnapshot>;
  kursyProgress: ReturnType<typeof useKursyMainProgress>;
  certificateCompleted: boolean;
}) {
  const ready = kursyProgress.status === "ready" ? kursyProgress.data : null;
  const showCertProgress = Boolean(ready && ready.totalLessons > 0);
  const certPct = showCertProgress
    ? Math.round((ready!.completedLessons / ready!.totalLessons) * 100)
    : 0;

  return (
    <section
      id="edukacja"
      className="scroll-mt-24 rounded-2xl border border-white/[0.08] bg-slate-900/35 p-5 sm:p-6 lg:p-8"
      aria-labelledby="edu-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 max-w-xl space-y-2">
          <SectionEyebrow n="4">Edukacja</SectionEyebrow>
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
          {certificateCompleted ? (
            <>
              <p className="text-sm font-medium text-emerald-100/88">Certyfikat: ukończono</p>
              <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500/90 via-emerald-400/80 to-cyan-400/75" />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-white/45">
                Ścieżka edukacyjna domknięta certyfikatem — możesz nadal wracać do kursów i quizów.
              </p>
            </>
          ) : kursyProgress.status === "loading" ? (
            <p className="text-sm text-white/40">Synchronizacja postępu z konta…</p>
          ) : kursyProgress.status === "error" ? (
            <p className="text-sm text-white/42">
              Nie udało się wczytać postępu. Odśwież stronę lub spróbuj ponownie później.
            </p>
          ) : showCertProgress ? (
            <>
              <p className="text-sm font-medium tabular-nums text-white/82">
                Postęp do certyfikatu: {ready!.completedLessons}/{ready!.totalLessons}
              </p>
              <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500/90 via-amber-400/80 to-cyan-400/75"
                  style={{ width: `${certPct}%` }}
                />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-white/45">
                Ten postęp bezpośrednio wpływa na odblokowanie egzaminu certyfikacyjnego.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-white/45">
                Postęp do certyfikatu pojawi się po ukończeniu lekcji w głównych modułach.
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-white/40">
                Ten postęp bezpośrednio wpływa na odblokowanie egzaminu certyfikacyjnego.
              </p>
            </>
          )}
        </div>
        <div className="space-y-3 border-t border-white/[0.06] pt-6 text-[13px] leading-relaxed text-white/55 lg:border-t-0 lg:pt-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/32">Kontekst</p>
          <p>
            <span className="text-white/38">Ostatni kurs: </span>
            <span className="text-white/70">{learning.lastCourseTitle}</span>
          </p>
          <p>
            <span className="text-white/38">Następny quiz: </span>
            <span className="text-white/70">{learning.nextQuizLabel}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function MarketplaceSecondaryStrip({
  hasDecisionCenter,
  purchaseValueBullets,
  salesPaused,
}: {
  hasDecisionCenter: boolean;
  purchaseValueBullets: string[];
  salesPaused: boolean;
}) {
  return (
    <section
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 sm:px-6"
      aria-label="Marketplace w panelu"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <SectionEyebrow n="5">Marketplace</SectionEyebrow>
          <p className="mt-2 text-sm text-white/48">
            {hasDecisionCenter
              ? "Zarządzaj NFT, kup upgrade lub skorzystaj z marketplace przy odsprzedaży — zgodnie z regulaminem."
              : salesPaused
                ? "Pierwotny zakup dostępu (NFT) jest na razie wstrzymany — brak miejsc. Strona marketplace służy na ten moment głównie do informacji."
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
          {!hasDecisionCenter && salesPaused ? (
            <span
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/40"
              aria-disabled
            >
              <Store className="h-4 w-4 opacity-50" aria-hidden />
              Brak miejsc
            </span>
          ) : (
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <Store className="h-4 w-4" aria-hidden />
              {hasDecisionCenter ? "Marketplace" : "Kup dostęp"}
            </Link>
          )}
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
  const kursyProgress = useKursyMainProgress(panel.status === "ready");
  const certificateStatus = useClientCertificateStatus(panel.status === "ready");
  const certificateCompleted =
    certificateStatus.status === "ready" && certificateStatus.certificateCompleted === true;

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
  const salesPaused = isFoundersMarketplaceSalesPaused();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-[min(1440px,calc(100vw-1.5rem))] px-3 pb-24 pt-5 sm:px-5 sm:pt-7 lg:px-8 lg:pt-9 xl:max-w-[1520px]">
        <div className="mb-8 border-b border-white/[0.07] pb-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">Panel klienta · hub</p>
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight tracking-tight text-white sm:text-[2.0625rem]">
            FXEDULAB
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-white/40 sm:text-base">
            Twoje centrum nauki i decyzji rynkowych
          </p>
          {panel.source === "account" && panel.plan != null && (
            <p className="mt-2 text-xs text-white/32">
              Plan konta: <span className="text-white/50">{panel.plan}</span>
              {panel.plan === "starter" ? " (Founders / NFT)" : null}
              {panel.plan === "pro" ? " (widok Founders w FXEDULAB)" : null}
            </p>
          )}
        </div>

        <div className="space-y-10 lg:space-y-14">
          <ClientDashboardHero
            membership={membership}
            hasDecisionCenter={hasDecisionCenter}
            salesPaused={salesPaused}
            tierQuery={tierQuery}
            kursyProgress={kursyProgress}
            certificateStatus={certificateStatus}
          />

          <WhatsNextSection
            learning={learning}
            kursyProgress={kursyProgress}
            certificateCompleted={certificateCompleted}
          />

          <MainEntryCards hasDecisionCenter={hasDecisionCenter} tierQuery={tierQuery} salesPaused={salesPaused} />

          <EducationZone
            learning={learning}
            kursyProgress={kursyProgress}
            certificateCompleted={certificateCompleted}
          />

          <MarketplaceSecondaryStrip
            hasDecisionCenter={hasDecisionCenter}
            purchaseValueBullets={membership.purchaseValueBullets}
            salesPaused={salesPaused}
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
