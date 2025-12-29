'use client';

import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export type Lang =
  | 'pl' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl'
  | 'sv' | 'no' | 'da' | 'fi' | 'cs' | 'sk' | 'ro' | 'hu'
  | 'uk' | 'ru' | 'tr' | 'ar' | 'zh' | 'ja' | 'ko' | 'el' | 'bg';

/* ───────── cookie ───────── */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function useLang(defaultLang: Lang = 'pl'): Lang {
  const normalize = (v: Lang | null | undefined): Lang => (v === 'en' ? 'en' : 'pl');
  const [lang, setLang] = useState<Lang>(normalize(defaultLang));
  useEffect(() => {
    const readAndSet = () => {
      const v = readCookie('lang') as Lang | null;
      setLang(v === 'en' ? 'en' : 'pl');
    };
    // initial read
    readAndSet();
    // react to global language change events
    const onLangChange = () => readAndSet();
    if (typeof window !== 'undefined') {
      window.addEventListener('langchange', onLangChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('langchange', onLangChange);
      }
    };
  }, [defaultLang]);
  return lang;
}

// Kept for import compatibility; now a no-op
export async function autoTranslateContainer(_container: HTMLElement, _lang: Lang) {
  return;
}

// Kept for import compatibility; now a no-op
export function useAutoTranslate(
  _rootRef: RefObject<HTMLElement | null>,
  _lang: Lang,
  _bump?: any
) {
  /* no-op */
}
