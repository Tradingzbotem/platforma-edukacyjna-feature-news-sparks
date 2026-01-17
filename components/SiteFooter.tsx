'use server';

import Link from 'next/link';
import { cookies } from 'next/headers';
import { t } from '@/lib/i18n';

export default async function SiteFooter() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'pl';

  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-slate-950 to-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-sm">
              <span className="font-bold text-white">FX</span>
            </div>
            <span className="font-semibold text-white">EduLab</span>
          </div>
          <p className="text-white/70 leading-relaxed">
            {t(lang as any, 'disclaimer_short')}
          </p>
        </div>

        <div>
          <div className="font-semibold mb-4 text-white">{t(lang as any, 'navigation')}</div>
          <ul className="space-y-2.5 text-white/70">
            <li><Link href="/kursy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'courses')}</Link></li>
            <li><Link href="/quizy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'quizzes')}</Link></li>
            <li><Link href="/rankingi/brokerzy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'broker_rankings')}</Link></li>
            <li><Link href="/symulator" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'calculator')}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-4 text-white">{t(lang as any, 'resources')}</div>
          <ul className="space-y-2.5 text-white/70">
            <li><Link href="/zasoby/faq" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'faq')}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-4 text-white">{t(lang as any, 'legal')}</div>
          <ul className="space-y-2.5 text-white/70">
            <li><Link href="/cennik" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'pricing')}</Link></li>
            <li><Link href="/prawne/warunki" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'terms')}</Link></li>
            <li><Link href="/prawne/polityka" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'privacy_policy')}</Link></li>
            <li><Link href="/prawne/zwroty-odstapienie" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'returns')}</Link></li>
            <li><Link href="/prawne/cookies" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'cookies')}</Link></li>
            <li><Link href="/kontakt" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1 py-0.5 transition-colors duration-150 inline-block">{t(lang as any, 'contact')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 pt-6 border-t border-white/5 text-xs text-white/60 leading-relaxed">
        <p className="mb-2">
          {t(lang as any, 'compliance_disclaimer')}
        </p>
        <p>
          {t(lang as any, 'risk_warning_long')}
        </p>
      </div>
    </footer>
  );
}


