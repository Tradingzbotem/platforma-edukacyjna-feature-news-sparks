import type { DecisionBriefJsonDto } from '@/lib/decision-brief/types';

type Row = {
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
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

export function decisionBriefToJsonDto(row: Row): DecisionBriefJsonDto {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    narrativeAxis: row.narrativeAxis,
    context: row.context,
    onRadar: row.onRadar,
    priorityOfDay: row.priorityOfDay,
    baseScenario: row.baseScenario,
    alternativeScenario: row.alternativeScenario,
    invalidation: row.invalidation,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    assets: row.assets.map((a) => ({
      id: a.id,
      asset: a.asset,
      baseDirection: a.baseDirection,
      supports: a.supports,
      weakens: a.weakens,
      sensitivity: a.sensitivity,
      sortOrder: a.sortOrder,
    })),
  };
}
