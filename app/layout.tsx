import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";

import AiChatClient from "./AiChatClient";
import ClientRoot from "./ClientRoot";
import LangSwitch from "@/app/components/LangSwitch";
import { t } from "@/lib/i18n";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  const htmlLang = cookieLang === "en" ? "en" : "pl";

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
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-white/10">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Logo / lewa strona */}
            <Link
              href="/"
              className="font-semibold tracking-wide hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md"
            >
              {t(htmlLang, 'brand')}
            </Link>

            {/* Prawa strona: język */}
            <LangSwitch />
          </nav>
        </header>

        {/* Główna zawartość aplikacji i klienty */}
        <ClientRoot>
          {children}
          <AiChatClient />
        </ClientRoot>
      </body>
    </html>
  );
}
