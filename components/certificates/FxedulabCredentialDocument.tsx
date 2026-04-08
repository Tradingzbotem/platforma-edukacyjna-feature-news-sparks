"use client";

import { QrCode } from "lucide-react";
import { Noto_Sans } from "next/font/google";
import { getCertificatePdfBilingualCopy, getTrackPdfBilingual } from "@/lib/certifications/pdf/bilingualCopy";
import type { CertificationTrack } from "@/lib/certifications/types";

const noto = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

/** Kolorystyka jak w `lib/certifications/pdf/template.tsx` (react-pdf). */
const p = {
  pageBg: "#05070b",
  innerBg: "#080b11",
  ink: "#f2efe6",
  inkSoft: "#b8b3a8",
  inkFaint: "#7a756c",
  gold: "#c9a962",
  goldBright: "#e4cf7a",
  goldLine: "#8a7340",
  hairline: "#1e2430",
  cellBg: "#0c1018",
} as const;

const PREVIEW_TRACK: CertificationTrack = "RISK_MANAGEMENT";
const DEMO_ID_READY = "FXEDU-EDU-PREVIEW01";

type FxedulabCredentialDocumentProps = {
  variant: "mini" | "full";
  /** Gdy false — meta pola jako „do wystawienia”. */
  allMainComplete: boolean;
  issuedDateDisplay: string;
  className?: string;
};

function MetaCell({
  labelEn,
  labelPl,
  value,
  valueMono,
  compact,
  row,
}: {
  labelEn: string;
  labelPl: string;
  value: string;
  valueMono?: boolean;
  compact: boolean;
  /** W miniaturze: jeden rząd czterech komórek. */
  row?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center border-t py-1.5 text-center sm:py-2 ${row ? "min-w-0 flex-1 px-0.5 py-1" : "w-[48%]"}`}
      style={{
        backgroundColor: p.cellBg,
        borderTopColor: p.goldLine,
        borderTopWidth: compact ? 1 : 2,
        paddingLeft: compact && !row ? 2 : row ? 2 : 10,
        paddingRight: compact && !row ? 2 : row ? 2 : 10,
      }}
    >
      <p
        className={`font-bold uppercase leading-none ${compact ? (row ? "text-[4px]" : "text-[4px] sm:text-[5px]") : "text-[9px]"}`}
        style={{ color: p.inkFaint, letterSpacing: compact ? "0.06em" : "0.12em" }}
      >
        {labelEn}
      </p>
      <p
        className={`leading-none ${compact ? (row ? "text-[3px]" : "text-[3.5px] sm:text-[4.5px]") : "text-[8px]"}`}
        style={{ color: p.inkFaint, letterSpacing: compact ? "0.03em" : "0.05em" }}
      >
        {labelPl}
      </p>
      <p
        className={`mt-0.5 font-bold tabular-nums leading-none ${compact ? (row ? "text-[6px]" : "text-[7px] sm:text-[8px]") : valueMono ? "text-xs sm:text-sm" : "text-lg sm:text-xl"}`}
        style={{
          color: valueMono ? p.goldBright : p.ink,
          fontFamily: valueMono ? "ui-monospace, monospace" : undefined,
          fontWeight: valueMono ? 500 : 700,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function FxedulabCredentialDocument({
  variant,
  allMainComplete,
  issuedDateDisplay,
  className = "",
}: FxedulabCredentialDocumentProps) {
  const copy = getCertificatePdfBilingualCopy();
  const track = getTrackPdfBilingual(PREVIEW_TRACK);
  const compact = variant === "mini";

  const scoreV = allMainComplete ? "88%" : "—";
  const levelV = allMainComplete ? "L2" : "—";
  const dateV = allMainComplete ? issuedDateDisplay : "—";
  const idV = allMainComplete ? DEMO_ID_READY : "—";

  return (
    <div
      className={`${noto.className} ${className}`.trim()}
      style={{ backgroundColor: p.pageBg, color: p.ink }}
    >
      <div
        className="box-border w-full"
        style={{
          borderWidth: compact ? 1 : 1.5,
          borderColor: p.goldLine,
          padding: compact ? 2 : 3,
        }}
      >
        <div
          className="box-border w-full"
          style={{
            borderWidth: 1,
            borderColor: p.hairline,
            backgroundColor: p.innerBg,
            paddingTop: compact ? 6 : 14,
            paddingBottom: compact ? 5 : 12,
            paddingLeft: compact ? 6 : 18,
            paddingRight: compact ? 6 : 18,
          }}
        >
          {/* Top row — brand + track badge */}
          <div className="flex items-start justify-between gap-1 pb-1 sm:pb-1.5">
            <div className="min-w-0 flex-1">
              <p
                className={`font-bold uppercase ${compact ? "text-[6px] sm:text-[7px]" : "text-[11px] sm:text-xs"}`}
                style={{ color: p.goldBright, letterSpacing: compact ? "0.2em" : "0.28em" }}
              >
                FXEDULAB
              </p>
              <p
                className={`${compact ? "mt-0.5 text-[5px] sm:text-[6px]" : "mt-1 text-[10px]"}`}
                style={{ color: p.inkSoft, letterSpacing: compact ? "0.06em" : "0.1em" }}
              >
                {copy.brandSubtle.en}
              </p>
              <p className={`${compact ? "text-[4px] sm:text-[5px]" : "mt-0.5 text-[9px]"}`} style={{ color: p.inkFaint }}>
                {copy.brandSubtle.pl}
              </p>
            </div>
            <div
              className="shrink-0 text-right"
              style={{
                borderWidth: 1,
                borderColor: p.goldLine,
                backgroundColor: p.cellBg,
                padding: compact ? "3px 5px" : "6px 10px",
              }}
            >
              <p
                className={`font-bold uppercase ${compact ? "max-w-[72px] text-[4px] sm:max-w-[88px] sm:text-[5px]" : "text-[9px] sm:text-[10px]"}`}
                style={{ color: p.gold, letterSpacing: compact ? "0.06em" : "0.1em" }}
              >
                {track.enBadge}
              </p>
              <p
                className={`font-normal uppercase ${compact ? "mt-0.5 text-[3.5px] sm:text-[4.5px]" : "mt-1 text-[8px]"}`}
                style={{ color: p.inkFaint, letterSpacing: compact ? "0.04em" : "0.06em" }}
              >
                {track.plBadge}
              </p>
            </div>
          </div>

          {/* Ornament */}
          <div className={`flex items-center ${compact ? "my-1" : "my-2"}`}>
            <div className="h-px flex-1" style={{ backgroundColor: p.goldLine }} />
            <div
              className="mx-1.5 rounded-full sm:mx-2.5"
              style={{
                width: compact ? 3 : 5,
                height: compact ? 3 : 5,
                backgroundColor: p.gold,
              }}
            />
            <div className="h-px flex-1" style={{ backgroundColor: p.goldLine }} />
          </div>

          {/* Ceremonial block */}
          <div className={`text-center ${compact ? "space-y-0.5 px-0.5 leading-tight" : "space-y-1 px-1"}`}>
            {compact ? (
              <p className="text-[3.5px] font-bold uppercase" style={{ color: p.goldLine, letterSpacing: "0.08em" }}>
                {copy.prestigeBrand.en} · {copy.prestigeBrand.pl}
              </p>
            ) : (
              <>
                <p
                  className="text-[10px] font-bold uppercase sm:text-[11px]"
                  style={{ color: p.goldLine, letterSpacing: "0.2em" }}
                >
                  {copy.prestigeBrand.en}
                </p>
                <p className="text-[9px]" style={{ color: p.inkFaint }}>
                  {copy.prestigeBrand.pl}
                </p>
              </>
            )}
            <p
              className={`font-bold ${compact ? "text-[7px]" : "text-lg sm:text-2xl"}`}
              style={{ color: p.goldBright }}
            >
              {copy.mainTitle.en}
            </p>
            <p className={`${compact ? "text-[5px]" : "text-xs sm:text-sm"}`} style={{ color: p.inkSoft }}>
              {copy.mainTitle.pl}
            </p>
            {compact ? (
              <p className="text-[4px] italic" style={{ color: p.inkSoft }}>
                {copy.certifiesIntro.en} · {copy.certifiesIntro.pl}
              </p>
            ) : (
              <>
                <p className="text-xs italic sm:text-sm" style={{ color: p.inkSoft }}>
                  {copy.certifiesIntro.en}
                </p>
                <p className="text-[11px] italic sm:text-xs" style={{ color: p.inkFaint }}>
                  {copy.certifiesIntro.pl}
                </p>
              </>
            )}
            <p className={`font-bold leading-tight ${compact ? "text-[8px]" : "text-xl sm:text-3xl"}`} style={{ color: p.ink }}>
              Imię Nazwisko
            </p>
            {compact ? (
              <p className="text-[3.5px]" style={{ color: p.inkFaint }}>
                <span style={{ color: p.inkSoft }}>{copy.completionLine.en}</span> · {copy.completionLine.pl}
              </p>
            ) : (
              <>
                <p className="text-xs sm:text-sm" style={{ color: p.inkSoft }}>
                  {copy.completionLine.en}
                </p>
                <p className="text-[11px] sm:text-xs" style={{ color: p.inkFaint }}>
                  {copy.completionLine.pl}
                </p>
              </>
            )}
            <p className={`font-bold ${compact ? "text-[6px]" : "text-sm sm:text-base"}`} style={{ color: p.gold }}>
              {track.enLine}
            </p>
            <p className={`${compact ? "text-[4.5px]" : "text-xs"}`} style={{ color: p.goldBright }}>
              {track.plLine}
            </p>
          </div>

          <div
            className="mx-auto"
            style={{
              width: compact ? 20 : 40,
              height: 1,
              backgroundColor: p.goldLine,
              marginTop: compact ? 2 : 12,
              marginBottom: compact ? 2 : 10,
            }}
          />

          {/* Meta: PDF 2×2 (full) / jeden rząd (mini) */}
          {compact ? (
            <div className="mx-auto flex w-full max-w-[520px] flex-nowrap gap-px">
              <MetaCell row compact={compact} labelEn={copy.metaScore.en} labelPl={copy.metaScore.pl} value={scoreV} />
              <MetaCell row compact={compact} labelEn={copy.metaLevel.en} labelPl={copy.metaLevel.pl} value={levelV} />
              <MetaCell row compact={compact} labelEn={copy.metaDateIssued.en} labelPl={copy.metaDateIssued.pl} value={dateV} />
              <MetaCell
                row
                compact={compact}
                labelEn={copy.metaCertificateId.en}
                labelPl={copy.metaCertificateId.pl}
                value={idV}
                valueMono
              />
            </div>
          ) : (
            <div className="mx-auto flex max-w-[520px] flex-wrap justify-between gap-y-1">
              <MetaCell compact={compact} labelEn={copy.metaScore.en} labelPl={copy.metaScore.pl} value={scoreV} />
              <MetaCell compact={compact} labelEn={copy.metaLevel.en} labelPl={copy.metaLevel.pl} value={levelV} />
              <MetaCell compact={compact} labelEn={copy.metaDateIssued.en} labelPl={copy.metaDateIssued.pl} value={dateV} />
              <MetaCell
                compact={compact}
                labelEn={copy.metaCertificateId.en}
                labelPl={copy.metaCertificateId.pl}
                value={idV}
                valueMono
              />
            </div>
          )}

          {!compact ? (
            <>
              <div
                className="mt-4 border-t pt-4 sm:mt-6 sm:pt-5"
                style={{ borderTopColor: p.hairline }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1" style={{ backgroundColor: "#5c4d32" }} />
                  <div className="px-2 text-center sm:px-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]" style={{ color: p.gold }}>
                      {copy.competencyProfile.en}
                    </p>
                    <p className="mt-0.5 text-[9px]" style={{ color: p.inkFaint }}>
                      {copy.competencyProfile.pl}
                    </p>
                  </div>
                  <div className="h-px flex-1" style={{ backgroundColor: "#5c4d32" }} />
                </div>
                <div
                  className="border px-3 py-3 sm:px-4 sm:py-4"
                  style={{
                    borderColor: p.hairline,
                    borderWidth: 1,
                    backgroundColor: p.cellBg,
                    borderLeftWidth: 3,
                    borderLeftColor: p.goldLine,
                  }}
                >
                  <p className="text-center text-xs italic leading-relaxed sm:text-sm" style={{ color: p.inkSoft }}>
                    {copy.skillFallback.en}
                  </p>
                  <p className="mt-2 text-center text-[11px] italic leading-relaxed sm:text-xs" style={{ color: p.inkFaint }}>
                    {copy.skillFallback.pl}
                  </p>
                </div>
              </div>

              <div
                className="mt-5 border-t pt-4 sm:mt-6 sm:pt-5"
                style={{ borderTopColor: p.goldLine, borderTopWidth: 2 }}
              >
                <div className="mb-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px]" style={{ color: p.gold }}>
                    {copy.authSectionTitle.en}
                  </p>
                  <p className="mt-1 text-[9px]" style={{ color: p.inkFaint }}>
                    {copy.authSectionTitle.pl}
                  </p>
                </div>
                <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 space-y-2 pr-0 sm:pr-4">
                    <p className="text-xs leading-relaxed sm:text-sm" style={{ color: p.inkSoft }}>
                      {copy.verifyScan.en}
                    </p>
                    <p className="text-[11px] leading-relaxed sm:text-xs" style={{ color: p.inkFaint }}>
                      {copy.verifyScan.pl}
                    </p>
                  </div>
                  <div
                    className="flex shrink-0 items-center justify-center self-center border bg-white p-2 sm:self-auto"
                    style={{ borderColor: p.goldLine, borderWidth: 2 }}
                    aria-hidden
                  >
                    <div className="flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 text-slate-400 sm:h-[76px] sm:w-[76px]">
                      <QrCode className="h-9 w-9 opacity-70 sm:h-10 sm:w-10" strokeWidth={1.25} />
                      <span className="text-[8px] font-medium uppercase tracking-wider text-slate-500">QR</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-[9px] leading-snug sm:mt-6 sm:text-[10px]" style={{ color: p.inkFaint }}>
                {copy.footNote.en}
              </p>
              <p className="mt-1 text-center text-[9px] leading-snug sm:text-[10px]" style={{ color: p.inkFaint }}>
                {copy.footNote.pl}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
