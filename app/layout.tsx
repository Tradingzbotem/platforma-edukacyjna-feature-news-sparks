import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AiChatClient from "./AiChatClient";
import ClientRoot from "./ClientRoot";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  return (
    <html lang="pl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white selection:bg-white/20`}>
        {/* Link dostępności: przeskocz do treści */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900"
        >
          Przejdź do treści
        </a>

        {/* Globalny selektor języka (zawsze widoczny) */}
        <div className="fixed right-3 bottom-3 md:top-3 md:bottom-auto z-[30]">
          <LanguageSwitcher />
        </div>

        {/* WSZYSTKO poniżej jest tłumaczone (w tym widżet AI) */}
        <ClientRoot>
          {children}
          <AiChatClient />
        </ClientRoot>
      </body>
    </html>
  );
}
