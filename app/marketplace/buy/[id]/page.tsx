import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getOfferById, isFoundersMarketplaceSalesPaused, isOfferPurchasable } from '@/lib/marketplace/offers';
import BuyNftClient from './BuyNftClient';
import type { Metadata } from 'next';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const offer = getOfferById(id);
  if (!offer) {
    return { title: 'Oferta — FXEDULAB' };
  }
  return {
    title: `Zakup — ${offer.name} — FXEDULAB`,
    description: 'Instrukcja płatności i dane do przelewu USDT (TRC20).',
  };
}

export default async function MarketplaceBuyPage({ params }: PageProps) {
  const { id } = await params;
  const offer = getOfferById(id);
  if (!offer) {
    notFound();
  }

  const session = await getSession();
  const isLoggedIn = Boolean(session.userId);

  const returnPath = `/marketplace/buy/${encodeURIComponent(id)}`;
  if (!isLoggedIn) {
    redirect(`/logowanie?next=${encodeURIComponent(returnPath)}`);
  }

  if (!isOfferPurchasable(offer)) {
    const paused = isFoundersMarketplaceSalesPaused();
    return (
      <main id="content" className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md text-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 shadow-lg">
          <h1 className="text-xl font-bold text-white">{paused ? 'Brak miejsc' : 'Oferta niedostępna'}</h1>
          <p className="mt-3 text-sm text-white/65 leading-relaxed">
            {paused
              ? 'Na razie nie ma wolnych miejsc na pierwotny zakup Founders NFT ani dostępu przez tę ścieżkę. Sprzedaż zostanie wznowiona w osobnym komunikacie.'
              : 'Ta pozycja nie jest już dostępna do zakupu w marketplace. Wróć do listy ofert i wybierz inną edycję.'}
          </p>
          <Link
            href="/marketplace"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:opacity-95"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return <BuyNftClient offer={offer} />;
}
