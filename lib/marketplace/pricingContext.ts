/**
 * Progi i narracja cenowa — podłączenie pod API: zamień stałe na odpowiedź z backendu.
 * Rozdziela „model rynku / próg wejścia” od ceny konkretnego listingu NFT.
 */

import { FOUNDERS_MARKET_PRICING } from '@/lib/marketplace/foundersMarketCopy';

/** Referencyjne etapy wzrostu progu wejścia (kolejność rosnąca). Bez liczników sprzedaży. */
export const MARKET_ENTRY_STAGES_USD: readonly number[] = [500, 600, 700, 850];

export function getMarketBaselineUsd(): number {
  return FOUNDERS_MARKET_PRICING.currentPriceUsd;
}

export function getMarketNextStageUsd(): number {
  return FOUNDERS_MARKET_PRICING.nextPriceUsd;
}

/** Krótka linia copy: relacja ceny listingu do progu bazowego (bez konfliktu z „aktualną ceną” oferty). */
export function checkoutOfferVsMarketLine(offerPriceUsd: number): string {
  const base = getMarketBaselineUsd();
  if (offerPriceUsd <= base) {
    return 'Ta oferta jest na poziomie lub poniżej bieżącego progu bazowego dla nowych wejść — kwota zamówienia odpowiada wskazanemu listingu.';
  }
  return 'Ta oferta ma wyższą kwotę niż bieżący próg bazowy nowych edycji — typowo edycja premium, wyższy poziom wejścia albo odsprzedaż na marketplace. Płacisz dokładnie cenę tego listingu.';
}
