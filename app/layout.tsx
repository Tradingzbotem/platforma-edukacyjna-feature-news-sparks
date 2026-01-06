import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import AiChatClient from "./AiChatClient";
import ClientRoot from "./ClientRoot";
import { t } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSession } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FX Edu — platforma edukacyjna",
  description: "Kursy, quizy i narzędzia FX/CFD + asystent AI (edukacyjny).",
  metadataBase: new URL("https://fx-edu.example"),
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
  try {
    const session = await getSession();
    const legacyAuth = cookieStore.get('auth')?.value === '1';
    initialIsLoggedIn = Boolean(session.userId) || legacyAuth;
  } catch {
    initialIsLoggedIn = null;
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

        {/* Globalny topbar */}
        <SiteHeader initialIsLoggedIn={initialIsLoggedIn} />

        {/* Główna zawartość aplikacji i klienty */}
        <ClientRoot>
          {children}
          <AiChatClient />
        </ClientRoot>
        <SiteFooter />
      </body>
    </html>
  );
}
