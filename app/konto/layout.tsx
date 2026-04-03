import Link from "next/link";
import type { ReactNode } from "react";
import SlowDataNotice from "@/components/SlowDataNotice";
import KontoHeader from "./KontoHeader";

/** Nested layout dla /konto (SERVER component) */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-transparent text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <KontoHeader />

        <SlowDataNotice />

        {children}
      </div>
    </main>
  );
}
