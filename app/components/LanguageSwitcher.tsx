'use client';

import { useEffect, useState } from 'react';

type Lang =
  | 'pl' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl'
  | 'sv' | 'no' | 'da' | 'fi' | 'cs' | 'sk' | 'ro' | 'hu'
  | 'uk' | 'ru' | 'tr' | 'ar' | 'zh' | 'ja' | 'ko' | 'el' | 'bg';

const SUPPORTED: Array<{ code: Lang; label: string }> = [
  { code: 'pl', label: 'Polish' },
  { code: 'en', label: 'English' },
];

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function setLangCookie(code: string) {
  document.cookie = `lang=${encodeURIComponent(code)}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`;
}

function clearTranslateCache() {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('tr:')) localStorage.removeItem(k);
    }
  } catch {}
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const [lang, setLang] = useState<Lang>('pl');

  useEffect(() => {
    const v = getCookie('lang') as Lang | null;
    if (v && SUPPORTED.some(s => s.code === v)) setLang(v);
  }, []);

  function onChange(code: Lang) {
    setLang(code);
    setLangCookie(code);
    clearTranslateCache();
    window.location.reload();
  }

  return (
    <div className={className}>
      <label htmlFor="lang" className="sr-only">Language</label>
      <select
        id="lang"
        value={lang}
        onChange={(e) => onChange(e.target.value as Lang)}
        className="px-3 py-1.5 rounded-lg border text-sm bg-slate-800 text-white border-white/10"
        style={{ colorScheme: 'dark' as any }}
      >
        {SUPPORTED.map(l => (
          <option key={l.code} value={l.code} className="bg-slate-800 text-white">
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
