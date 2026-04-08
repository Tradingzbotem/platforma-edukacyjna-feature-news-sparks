import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import AiChatClient from "./AiChatClient";
import ClientRoot from "./ClientRoot";
import { t } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DevBanner from "@/components/ui/DevBanner";
import { getSession } from "@/lib/session";
import Script from "next/script";
import { getIsAdmin } from "@/lib/admin";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL;
    return url.startsWith('http') ? url : `https://${url}`;
  }
  return "http://localhost:3000";
}

const META_TITLE = "FX Edu — platforma edukacyjna";
const META_DESC = "Kursy, quizy i narzędzia FX/CFD + asystent AI (edukacyjny).";

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  metadataBase: new URL(getSiteUrl()),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "FXEduLab",
    title: META_TITLE,
    description: META_DESC,
  },
  twitter: {
    card: "summary",
    title: META_TITLE,
    description: META_DESC,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  const htmlLang = cookieLang === "en" ? "en" : "pl";
  // SSR: ustal stan zalogowania (iron-session + legacy cookie)
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
    <html lang={htmlLang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white selection:bg-white/20`}>
        {/* Link dostępności: przeskocz do treści */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900"
        >
          {t(htmlLang, 'skip_to_content')}
        </a>

        <DevBanner />

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
      </body>
    </html>
  );
}
