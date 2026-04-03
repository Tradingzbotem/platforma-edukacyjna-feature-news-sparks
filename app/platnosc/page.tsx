'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Stary adres płatności za „plany” — sprzedaż wyłącznie przez Founders NFT (cennik / marketplace). */
export default function PaymentPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/cennik');
  }, [router]);
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <p className="text-white/70 text-sm">Przekierowanie do cennika…</p>
    </main>
  );
}
