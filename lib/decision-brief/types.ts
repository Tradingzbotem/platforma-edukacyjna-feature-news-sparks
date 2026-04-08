import type { BriefSensitivity } from '@/lib/decision-brief/sensitivity';

export type DecisionBriefAssetView = {
  asset: string;
  baseDirection: string;
  supports: string;
  weakens: string;
  sensitivity: BriefSensitivity;
  sortOrder: number;
};

/** Dane pod istniejący layout `BriefDecyzyjnyMockup` (bez zależności od Prisma w typach). */
export type DecisionBriefView = {
  title: string;
  summary: string;
  narrativeAxisLines: string[];
  contextLines: string[];
  onRadarLines: string[];
  priorityOfDay: string;
  baseScenarioLines: string[];
  alternativeScenarioLines: string[];
  invalidationLines: string[];
  assets: DecisionBriefAssetView[];
};

export type DecisionBriefJsonDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  narrativeAxis: string;
  context: string;
  onRadar: string;
  priorityOfDay: string;
  baseScenario: string;
  alternativeScenario: string;
  invalidation: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assets: Array<{
    id: string;
    asset: string;
    baseDirection: string;
    supports: string;
    weakens: string;
    sensitivity: string;
    sortOrder: number;
  }>;
};
