export type OfferStatus = 'available' | 'listed' | 'sold';
export type OfferVariant = 'standard' | 'gold' | 'support';

export type FoundersOffer = {
  id: string;
  name: string;
  status: OfferStatus;
  /** Kwota w USD; na stronie zakupu ta sama wartość jest rozliczana jako USDT 1:1 (TRC20). */
  priceUsd: number;
  payOptions: string;
  variant: OfferVariant;
};

export const FOUNDERS_OFFERS: FoundersOffer[] = [
  {
    id: 'fd-541',
    name: 'FXEDULAB Founders · #541',
    status: 'available',
    priceUsd: 500,
    payOptions: 'USDT (TRC20)',
    variant: 'standard',
  },
  {
    id: 'fd-812',
    name: 'FXEDULAB Founders · #812',
    status: 'listed',
    priceUsd: 540,
    payOptions: 'USDT (TRC20)',
    variant: 'standard',
  },
  {
    id: 'fd-g228',
    name: 'FXEDULAB Founders Gold · #228',
    status: 'available',
    priceUsd: 920,
    payOptions: 'USDT (TRC20)',
    variant: 'gold',
  },
  {
    id: 'fd-327',
    name: 'FXEDULAB Founders · #327',
    status: 'sold',
    priceUsd: 610,
    payOptions: 'USDT (TRC20)',
    variant: 'standard',
  },
  {
    id: 'fd-s612',
    name: 'FXEDULAB Support Edition · #612',
    status: 'listed',
    priceUsd: 845,
    payOptions: 'USDT (TRC20)',
    variant: 'support',
  },
  {
    id: 'fd-1044',
    name: 'FXEDULAB Founders · #1044',
    status: 'available',
    priceUsd: 690,
    payOptions: 'USDT (TRC20)',
    variant: 'standard',
  },
  {
    id: 'fd-1789',
    name: 'FXEDULAB Founders · #1789',
    status: 'sold',
    priceUsd: 760,
    payOptions: 'USDT (TRC20)',
    variant: 'standard',
  },
  {
    id: 'fd-1522',
    name: 'FXEDULAB Founders · #1522',
    status: 'available',
    priceUsd: 990,
    payOptions: 'USDT (TRC20)',
    variant: 'standard',
  },
];

export function getOfferById(id: string): FoundersOffer | undefined {
  return FOUNDERS_OFFERS.find((o) => o.id === id);
}

export function isOfferPurchasable(offer: FoundersOffer): boolean {
  return offer.status === 'available' || offer.status === 'listed';
}

/** Oferty widoczne publicznie na liście — bez pozycji ze statusem „sold”. */
export function listPurchasableOffers(): FoundersOffer[] {
  return FOUNDERS_OFFERS.filter(isOfferPurchasable);
}

export function offerEditionToken(name: string, id: string): string {
  const part = name.split('·').pop()?.trim();
  return part && part.length > 0 ? part : id.toUpperCase();
}

export function offerStatusLabelPl(status: OfferStatus): { text: string; className: string } {
  if (status === 'available') {
    return { text: 'Dostępne', className: 'text-emerald-300/90' };
  }
  if (status === 'listed') {
    return { text: 'Wystawione', className: 'text-amber-200/90' };
  }
  return { text: 'Sprzedane', className: 'text-white/45' };
}

/** Identyfikator zamówienia widoczny przy płatności (powiązany z ofertą). */
export function orderIdForOffer(offerId: string): string {
  const slug = offerId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `FX-NFT-2026-${slug}`;
}

/** Krótka linia pod kartą — charakter dostępu / edycji (bez hype’u). */
export function offerAccessDescriptor(offer: FoundersOffer): { line: string; level: string } {
  if (offer.variant === 'gold') {
    return {
      level: 'Edycja kolekcjonerska',
      line: 'Lifetime access · wyższy poziom wejścia · odsprzedaż z przeniesieniem dostępu',
    };
  }
  if (offer.variant === 'support') {
    return {
      level: 'Support',
      line: 'Lifetime access · wsparcie projektu · dostęp przypisany do NFT',
    };
  }
  return {
    level: 'Founding edition',
    line: 'Lifetime access · miesięczny refill Insightów · odsprzedaż z przeniesieniem dostępu',
  };
}
