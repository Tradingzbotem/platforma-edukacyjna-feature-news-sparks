'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === 'pl' ? 'en' : 'pl';
    // Remove current locale from pathname and add new one
    const pathnameWithoutLocale = pathname.replace(/^\/[^/]+/, '') || '/';
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    router.push(newPath);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors"
      aria-label="Switch language"
    >
      <span className={locale === 'pl' ? 'text-white' : 'text-white/50'}>PL</span>
      <span className="text-white/30">/</span>
      <span className={locale === 'en' ? 'text-white' : 'text-white/50'}>EN</span>
    </button>
  );
}
