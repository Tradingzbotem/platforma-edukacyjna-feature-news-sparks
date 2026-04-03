/**
 * Statyczna prezentacja „stanu rynku” i benefitów czasowych — podmiana na API / CMS bez zmiany UI.
 * Nie zawiera liczników sprzedaży ani sztucznych wolumenów.
 */

export const FOUNDERS_MARKET_PRICING = {
  /** Bieżący próg bazowy dla nowych wejść (referencyjny) — podłączenie: config / endpoint */
  currentPriceUsd: 500,
  /** Kolejny zapowiadany etap progu — podłączenie: config / endpoint */
  nextPriceUsd: 600,
} as const;

/** Progi czasu trzymania NFT (dni) — podłączenie: backend uprawnień */
export const BENEFITS_UNLOCK_DAYS = {
  aiCoach: 30,
  specialReports: 60,
} as const;

export const FOUNDERS_MARKET_COPY = {
  /** Marketplace + kontekst globalny */
  ladderHeading: 'Próg wejścia i kolejne etapy',
  ladderSubheading:
    'Model referencyjny: wcześniejsze wejście zwykle oznacza niższy próg. Kolejne etapy mogą podnieść minimalny poziom dostępu przy nowych edycjach.',
  currentPriceLabel: 'Bieżący próg bazowy (nowe wejścia)',
  nextPriceLabel: 'Następny referencyjny etap',
  entryStageNote:
    'Cena konkretnego NFT na liście może być wyższa — zależy od edycji, poziomu dostępu i odsprzedaży. Poniżej widać tylko model progu dla nowych wejść, nie kwotę każdego listingu.',
  dynamicsNote:
    'Każda oferta na marketplace ma własną cenę. Próg bazowy opisuje, od jakiego poziomu startują nowe edycje; z czasem może rosnąć.',
  lifetimeInsightLine:
    'Lifetime access do FXEDULAB, miesięczny refill Insightów, analiza kontekstu rynku i narzędzia panelu — przypisane do NFT i przenoszone przy odsprzedaży.',
  holdUnlockIntro:
    'Część funkcji w panelu uruchamia się po czasie przy NFT — spójnie z modelem lojalnościowym, bez sztucznej presji.',
  resaleTransferNote:
    'Odsprzedając NFT, przekazujesz nowemu posiadaczowi dostęp oraz już odblokowane korzyści czasowe.',
  lockedSectionTitle: 'Korzyści odblokowywane z czasem',
  /** Wizualizacja etapów — nagłówek sekcji */
  stagesVisualTitle: 'Jak rośnie próg wejścia',
  stagesVisualSubtitle:
    'Schemat referencyjny — bez liczników sprzedaży. Wcześniejszy zakup zwykle łapie niższy próg niż późniejsze etapy.',
  /** Checkout: pierwszy panel */
  checkoutThisOfferLabel: 'Cena tej oferty',
  checkoutBaselineLabel: 'Próg bazowy nowych edycji',
  checkoutBaselineHint: 'Od tego poziomu startuje model dla świeżych wejść; kolejne etapy mogą go podnieść.',
  checkoutNextStageHint: 'Zapowiadany kolejny krok referencyjny modelu (nie „twoja” cena).',
  /** Jednoznaczne rozdzielenie progu od cen wtórnych / premium — usuwa skojarzenie ze „stratą wartości”. */
  checkoutBaselineScopeNote:
    'Próg bazowy dotyczy wyłącznie nowych wejść w edycjach od platformy. Nie reguluje cen odsprzedaży ani poziomu cen w edycjach premium — wyższa kwota listingu to nie spadek wartości względem tego progu.',
} as const;

export type LockedBenefitTier = {
  badge: string;
  title: string;
  body: string;
};

export const LOCKED_BENEFIT_TIERS: LockedBenefitTier[] = [
  {
    badge: `${BENEFITS_UNLOCK_DAYS.aiCoach}+ dni przy NFT`,
    title: 'AI Coach',
    body: 'Po progu czasu trzymania odblokowujesz pełniejszy AI Coach w panelu — kontekst pod Twoje scenariusze i raporty.',
  },
  {
    badge: `${BENEFITS_UNLOCK_DAYS.specialReports}+ dni przy NFT`,
    title: 'Raporty specjalne',
    body: 'Dostęp do wybranych raportów i zestawień analitycznych poza standardowym cyklem publikacji.',
  },
  {
    badge: 'Posiadacze NFT',
    title: 'Wcześniejszy dostęp do modułów',
    body: 'Nowe moduły i usprawnienia platformy najpierw dla holderów — wcześniejszy dostęp do warstwy edukacyjnej.',
  },
];
