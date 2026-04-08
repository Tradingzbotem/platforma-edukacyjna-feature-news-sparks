'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'fxedu_dev_banner_closed';

export default function DevBanner() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== 'true');
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
    setSpacerHeight(0);
  }, []);

  useLayoutEffect(() => {
    if (!visible) {
      setSpacerHeight(0);
      return;
    }
    const el = bannerRef.current;
    if (!el) return;
    const update = () => setSpacerHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        ref={bannerRef}
        className="fixed top-0 left-0 right-0 z-[45] w-full border-b border-white/10 bg-[#071328]/90 text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.04),0_10px_28px_-14px_rgba(0,0,0,0.55)] backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto grid min-h-[52px] w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 px-4 py-2 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-col justify-center gap-1.5 sm:contents">
            <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
              AKTUALIZACJE
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-sm font-medium leading-snug text-white sm:text-[15px]">
                Platforma jest rozwijana etapami — część modułów i widoków jest właśnie ulepszana.
              </p>
              <p className="text-xs leading-snug text-white/65 sm:text-sm">
                Dodajemy nowe lekcje, materiały, ścieżki egzaminacyjne i poprawki interfejsu.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center gap-2 sm:contents">
            <Link
              href="/redakcja"
              className="inline-flex shrink-0 whitespace-nowrap border-b border-transparent pb-px text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-200/70 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071328]"
            >
              Co się zmienia?
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/5 hover:text-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label="Zamknij baner informacyjny"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </div>
      {spacerHeight > 0 ? (
        <div className="shrink-0" style={{ height: spacerHeight }} aria-hidden />
      ) : null}
    </>
  );
}
