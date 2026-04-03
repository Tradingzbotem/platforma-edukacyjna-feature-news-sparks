import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

import AiChatClient from "../AiChatClient";
import ClientRoot from "../ClientRoot";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSession } from "@/lib/session";
import Script from "next/script";
import { getIsAdmin } from "@/lib/admin";
import { cookies } from "next/headers";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  // Load messages for the locale
  const messages = await getMessages();

  // SSR: ustal stan zalogowania (iron-session + legacy cookie)
  const cookieStore = await cookies();
  let initialIsLoggedIn: boolean | null = null;
  let initialIsAdmin = false;
  try {
    const session = await getSession();
    const legacyAuth = cookieStore.get('auth')?.value === '1';
    initialIsLoggedIn = Boolean(session.userId) || legacyAuth;
    initialIsAdmin = await getIsAdmin();
  } catch {
    initialIsLoggedIn = null;
    initialIsAdmin = false;
  }

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Link dostępności: przeskocz do treści */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900"
      >
        Skip to content
      </a>

      {/* Globalny topbar */}
      <SiteHeader initialIsLoggedIn={initialIsLoggedIn} initialIsAdmin={initialIsAdmin} />

      {/* Główna zawartość aplikacji i klienty */}
      <ClientRoot>
        {children}
        <AiChatClient />
      </ClientRoot>
      <Script
        id="tv-mini-chart"
        type="module"
        src="https://widgets.tradingview-widget.com/w/en/tv-mini-chart.js"
        strategy="afterInteractive"
      />
      <SiteFooter />
    </NextIntlClientProvider>
  );
}
