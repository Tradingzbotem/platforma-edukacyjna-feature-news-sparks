'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Lang } from '@/lib/i18n-client';

function setLangCookie(lang: Lang) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `lang=${encodeURIComponent(lang)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export default function LangSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>('pl');

  useEffect(() => {
    const m = document.cookie.match(new RegExp('(?:^|;\\s*)lang=([^;]+)'));
    const v = m ? (decodeURIComponent(m[1]) as Lang) : 'pl';
    setLang(v === 'en' ? 'en' : 'pl');
  }, []);

  const other: Lang = lang === 'pl' ? 'en' : 'pl';

  return (
    <button
      type="button"
      onClick={() => {
        setLangCookie(other);
        setLang(other);
        router.replace(pathname);
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
      aria-label="Zmień język"
      title="Zmień język"
    >
      <span className={lang === 'pl' ? 'text-white' : 'text-white/50'}>PL</span>
      <span className="text-white/30">/</span>
      <span className={lang === 'en' ? 'text-white' : 'text-white/50'}>EN</span>
    </button>
  );
}


