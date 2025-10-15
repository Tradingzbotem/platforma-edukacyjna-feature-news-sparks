'use client';

import { useRef } from 'react';
import { useLang, useAutoTranslate } from '@/lib/i18n-client';
import { usePathname } from 'next/navigation';
import ProgressSync from './components/ProgressSync';

/** Klientowy wrapper: tłumaczy wszystko w środku na podstawie cookie `lang`. */
export default function ClientRoot({ children }: { children: React.ReactNode }) {
  // Używamy ogólnego HTMLElement, żeby pasował do hooka (bez konfliktu typów)
  const containerRef = useRef<HTMLElement | null>(null);
  const lang = useLang('pl');
  const pathname = usePathname(); // „bump” przy każdej zmianie trasy

  // Automatyczna translacja całego kontenera po wejściu / zmianie języka / zmianie trasy
  useAutoTranslate(containerRef, lang, pathname);

  return (
    <div id="app-content" ref={containerRef as any}>
      {children}
      <ProgressSync />
    </div>
  );
}
