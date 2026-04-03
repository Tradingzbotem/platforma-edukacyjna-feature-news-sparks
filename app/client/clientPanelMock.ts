/**
 * Snapshoty UI panelu FXEDULAB (hub + centrum decyzji) na podstawie `PanelUserTier`.
 *
 * Źródło tieru konta: `GET /api/client/me/panel` → `users.plan` (mapowanie w `@/lib/client/panelTier`).
 */

import type { DecisionAssetId } from "./decisionBlockMock";
import type { PanelUserTier } from "@/lib/client/panelTier";

export type { PanelUserTier } from "@/lib/client/panelTier";
export { parsePanelTierParam } from "@/lib/client/panelTier";

export type MembershipSnapshot = {
  /** Dostęp do centrum decyzji (Decision Block + pełne aktywa) — wymaga NFT / premium. */
  hasAccess: boolean;
  hasNft: boolean;
  nftTier: "none" | "founders" | "elite";
  nftDisplayName: string;
  /** Krótka etykieta tieru do UI (np. „Founders”, „Elite”). */
  tierShortLabel: string;
  /** null = brak zakupu / nie dotyczy */
  purchasedPriceUsd: number | null;
  /** max 3–4 krótkie linie — co odblokowuje NFT (karta dostępu). */
  nftUnlocksSummary: string[];
  /** Krótkie linie dla free: wartość zakupu NFT (CTA / lock). */
  purchaseValueBullets: string[];
  allowedAssets: DecisionAssetId[];
  /**
   * Opcjonalny URL podglądu NFT (np. CDN / metadata).
   * null = w UI renderowany jest domyślny „pass” (gradient + wzorzec).
   */
  nftImageUrl: string | null;
};

export type LearningSnapshot = {
  completedLessons: number;
  totalLessons: number;
  lastCourseTitle: string;
  nextQuizLabel: string;
};

const ALL_ASSETS: DecisionAssetId[] = [
  "US100",
  "US500",
  "DE40",
  "GOLD",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "WTI",
];

export function getMembershipSnapshot(tier: PanelUserTier): MembershipSnapshot {
  if (tier === "free") {
    return {
      hasAccess: false,
      hasNft: false,
      nftTier: "none",
      nftDisplayName: "—",
      tierShortLabel: "Free",
      purchasedPriceUsd: null,
      nftUnlocksSummary: [],
      purchaseValueBullets: [
        "Decision Block — dzienny bias, poziomy i scenariusze A/B/C dla wybranych aktywów.",
        "Pełna synchronizacja z modułami EDU, Decision Lab i narzędziami panelu.",
        "NFT jako klucz dostępu; marketplace — zakup i późniejsza odsprzedaż wg regulaminu.",
      ],
      allowedAssets: [],
      nftImageUrl: null,
    };
  }

  if (tier === "founders") {
    return {
      hasAccess: true,
      hasNft: true,
      nftTier: "founders",
      nftDisplayName: "Founders NFT",
      tierShortLabel: "Founders",
      purchasedPriceUsd: 490,
      nftUnlocksSummary: [
        "Centrum decyzji (osobny workspace) — Decision Block na wszystkich aktywach.",
        "Panel rynkowy EDU: kalendarz, checklisty, mapy, playbooki.",
        "Decision Lab i Coach AI wg zasad produktu.",
      ],
      purchaseValueBullets: [],
      allowedAssets: [...ALL_ASSETS],
      nftImageUrl: null,
    };
  }

  // elite
  return {
    hasAccess: true,
    hasNft: true,
    nftTier: "elite",
    nftDisplayName: "Founders NFT · Elite",
    tierShortLabel: "Elite",
    purchasedPriceUsd: 890,
    nftUnlocksSummary: [
      "Wszystko z Founders + priorytetowe insighty i rozszerzone limity (gdy wdrożone).",
      "Pełna biblioteka modułów i wcześniejszy dostęp do eksperymentów.",
      "Decision Lab — rozszerzone widoki przy fladze konta.",
    ],
    purchaseValueBullets: [],
    allowedAssets: [...ALL_ASSETS],
    nftImageUrl: null,
  };
}

export function getLearningSnapshot(tier: PanelUserTier): LearningSnapshot {
  if (tier === "free") {
    return {
      completedLessons: 3,
      totalLessons: 24,
      lastCourseTitle: "Forex i CFD — lekcja 3: spread i dźwignia",
      nextQuizLabel: "Quiz: podstawy rynku",
    };
  }
  if (tier === "founders") {
    return {
      completedLessons: 11,
      totalLessons: 24,
      lastCourseTitle: "Zarządzanie ryzykiem — pozycja i drawdown",
      nextQuizLabel: "Quiz: scenariusze A/B/C",
    };
  }
  return {
    completedLessons: 18,
    totalLessons: 24,
    lastCourseTitle: "Psychologia wykonania — checklista przed wejściem",
    nextQuizLabel: "Quiz: makro i sesje",
  };
}
