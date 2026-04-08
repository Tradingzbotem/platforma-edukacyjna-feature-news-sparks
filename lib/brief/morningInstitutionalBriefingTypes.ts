/** Wspólny typ języka dla briefów (GEN + morning-institutional + eksporty). */
export type BriefingLanguage = 'pl' | 'en' | 'cs';
export type MorningInstitutionalLanguage = BriefingLanguage;
export type MorningInstitutionalDepth = 'short' | 'long';

export type MorningMacroTheme = {
  title: string;
  whatHappened: string;
  whyItMatters: string;
  marketImpact: string;
};

export type MorningBriefingEvent = {
  name: string;
  expectation: string;
  bullCase: string;
  bearCase: string;
  marketImpact: string;
};

export type MorningHistoricalBehavior = {
  setup: string;
  reaction: string;
  lesson: string;
};

/** Źródło ceny w sekcji aktywów (uzupełniane przez serwer po generacji). */
export type MorningBriefingLivePriceSource = 'live' | 'override_recent' | 'none';

export type MorningBriefingAsset = {
  asset: string;
  currentContext: string;
  drivers: string;
  /** Cena z live snapshot (np. z promptu serwera); opcjonalna. */
  livePrice?: string;
  livePriceSource?: MorningBriefingLivePriceSource;
  /** Wiek override w godzinach, gdy livePriceSource = override_recent. */
  livePriceAgeHours?: number;
  triggerBull: string;
  triggerBear: string;
  /** Dlaczego te progi / sygnały są istotne względem ceny i kontekstu. */
  triggerLogic: string;
  historicalBehavior: MorningHistoricalBehavior[];
};

export type MorningBriefingScenarioBlock = {
  title: string;
  scenarioIf: string;
  scenarioThen: string;
  /** Co potwierdza scenariusz (obserwowalny sygnał / warunek). */
  confirmation: string;
  /** Korelacja cross-asset (np. yield ↑ → tech ↓). */
  crossAssetReaction: string;
};

export type MorningInstitutionalBriefing = {
  /** Co zmienia się względem ostatnich dni (regime / katalizator vs baza). */
  whatsDifferentVsRecentDays: string[];
  /** Równoznaczne semantycznie z „co naprawdę porusza rynek dziś” (pole JSON: tldr). */
  tldr: string[];
  executiveSummary: string;
  macro: {
    usa: MorningMacroTheme[];
    europe: MorningMacroTheme[];
    asia: MorningMacroTheme[];
    geopolitics: MorningMacroTheme[];
  };
  events: MorningBriefingEvent[];
  assets: MorningBriefingAsset[];
  crossAssetLinks: string[];
  scenarios: MorningBriefingScenarioBlock[];
  /** Jeden zwarty akapit: na co uważać teraz i dlaczego (bez listy punktów). */
  quickSummary: string;
};
