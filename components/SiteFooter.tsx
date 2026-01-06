'use server';

import Link from 'next/link';
import { cookies } from 'next/headers';
import { t } from '@/lib/i18n';

export default async function SiteFooter() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'pl';

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="font-bold">FX</span>
            </div>
            <span className="font-semibold">EduLab</span>
          </div>
          <p className="mt-3 text-white/70">
            {t(lang as any, 'disclaimer_short')}
          </p>
        </div>

        <div>
          <div className="font-semibold mb-2">{t(lang as any, 'navigation')}</div>
          <ul className="space-y-1 text-white/70">
            <li><Link href="/kursy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'courses')}</Link></li>
            <li><Link href="/quizy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'quizzes')}</Link></li>
            <li><Link href="/rankingi/brokerzy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'broker_rankings')}</Link></li>
            <li><Link href="/symulator" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'calculator')}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">{t(lang as any, 'resources')}</div>
          <ul className="space-y-1 text-white/70">
            <li><Link href="/zasoby/faq" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'faq')}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">{t(lang as any, 'legal')}</div>
          <ul className="space-y-1 text-white/70">
            <li><Link href="/cennik" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'pricing')}</Link></li>
            <li><Link href="/prawne/warunki" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'terms')}</Link></li>
            <li><Link href="/prawne/polityka" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'privacy_policy')}</Link></li>
            <li><Link href="/prawne/zwroty-odstapienie" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'returns')}</Link></li>
            <li><Link href="/prawne/cookies" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'cookies')}</Link></li>
            <li><Link href="/kontakt" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded">{t(lang as any, 'contact')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 text-xs text-white/60">
        <p>
          {t(lang as any, 'risk_warning_long')}
        </p>
      </div>
    </footer>
  );
}


