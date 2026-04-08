'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { KursyModuleProgress } from "@/lib/kursyModuleProgressTypes";
import {
  moduleProgressBadgeClass,
  moduleProgressLabel,
} from "@/components/kursy/kursyModuleProgressBadge";

export type ExamTrackCardCtaLabels = {
  notStarted?: string;
  inProgress?: string;
  completed?: string;
};

type Props = {
  tag?: string;
  title: string;
  description?: string;
  href: string;
  cta?: string;
  /** Nadpisuje domyślne „Rozpocznij / Kontynuuj / Powtórz” dla ścieżek egzaminowych. */
  ctaLabels?: ExamTrackCardCtaLabels;
  storageKey: string;
  totalBlocks: number;
};

function progressFromDoneCount(
  doneCount: number,
  totalBlocks: number,
  href: string,
  ctaLabels?: ExamTrackCardCtaLabels
): KursyModuleProgress {
  const totalLessons = totalBlocks;
  const doneLessons = Math.min(Math.max(0, doneCount), totalLessons);
  const state: KursyModuleProgress["state"] =
    totalLessons <= 0
      ? "not_started"
      : doneLessons >= totalLessons
        ? "completed"
        : doneLessons > 0
          ? "in_progress"
          : "not_started";

  let cta: string;
  if (state === "completed") cta = ctaLabels?.completed ?? "Powtórz";
  else if (state === "in_progress") cta = ctaLabels?.inProgress ?? "Kontynuuj";
  else cta = ctaLabels?.notStarted ?? "Rozpocznij";

  return {
    courseSlug: "egzaminy",
    totalLessons,
    doneLessons,
    state,
    actionHref: href,
    cta,
    lastActivityAt: null,
  };
}

/**
 * Karta jak na /kursy, ale postęp z localStorage (ścieżki egzaminowe — brak zapisu w DB).
 */
export default function KursyExamTrackCardClient({
  tag,
  title,
  description,
  href,
  cta = "Otwórz",
  ctaLabels,
  storageKey,
  totalBlocks,
}: Props) {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
          setDoneCount(0);
          return;
        }
        const parsed = JSON.parse(raw) as unknown;
        setDoneCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setDoneCount(0);
      }
    }

    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    const onVis = () => {
      if (document.visibilityState === "visible") read();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [storageKey]);

  const moduleProgress = useMemo(
    () => progressFromDoneCount(doneCount, totalBlocks, href, ctaLabels),
    [doneCount, totalBlocks, href, ctaLabels]
  );

  const linkHref = moduleProgress.actionHref;
  const linkCta = moduleProgress.cta ?? cta;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-black/40">
      <div className="flex min-h-[1.25rem] flex-wrap items-start gap-2">
        {tag ? (
          <span className="inline-block w-fit rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70 shadow-sm">
            {tag}
          </span>
        ) : (
          <span className="h-4" aria-hidden />
        )}
        <span
          className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${moduleProgressBadgeClass(moduleProgress.state)}`}
        >
          {moduleProgressLabel(moduleProgress.state)}
        </span>
      </div>

      <div className="mt-2">
        <h3 className="text-lg font-semibold leading-snug text-white">{title}</h3>
        <p className="mt-1.5 text-xs tabular-nums text-white/50">
          {moduleProgress.doneLessons} / {moduleProgress.totalLessons} bloków
        </p>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
        ) : null}
      </div>

      <div className="mt-auto flex w-full flex-col gap-2 border-t border-white/10 pt-4">
        <Link
          href={linkHref}
          className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-md transition-all duration-200 hover:scale-[1.02] hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          aria-label={`${linkCta}: ${title}`}
        >
          {linkCta}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
