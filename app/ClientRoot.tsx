'use client';

import { useLang } from '@/lib/i18n-client';
import { useRef } from 'react';
import ProgressSync from './components/ProgressSync';

/**
 * ClientRoot – wrapper aplikacji.
 * Cel: trzymać wybór języka (cookie) i ew. udostępniać go UI,
 * bez automatycznego tłumaczenia DOM (to psuje SEO, stabilność i testowalność).
 */
export default function ClientRoot({ children }: { children: React.ReactNode }) {
  // Lang trzymamy jako stan (na razie tylko odczyt cookie).
  // Docelowo UI będzie czytał lang i renderował teksty z i18n słowników.
  const lang = useLang('pl');

  // Ref zostawiamy na przyszłość (np. do a11y/focus trap), ale nie tłumaczymy DOM.
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div id="app-content" ref={containerRef} data-lang={lang}>
      {children}
      <ProgressSync />
    </div>
  );
}
