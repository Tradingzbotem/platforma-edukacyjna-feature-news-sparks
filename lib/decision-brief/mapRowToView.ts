import { normalizeBriefSensitivity } from '@/lib/decision-brief/sensitivity';
import { splitBriefLines } from '@/lib/decision-brief/splitLines';
import type { DecisionBriefView } from '@/lib/decision-brief/types';

type BriefWithAssets = {
  title: string;
  summary: string;
  narrativeAxis: string;
  context: string;
  onRadar: string;
  priorityOfDay: string;
  baseScenario: string;
  alternativeScenario: string;
  invalidation: string;
  assets: Array<{
    asset: string;
    baseDirection: string;
    supports: string;
    weakens: string;
    sensitivity: string;
    sortOrder: number;
  }>;
};

export function mapDecisionBriefRowToView(row: BriefWithAssets): DecisionBriefView {
  return {
    title: row.title,
    summary: row.summary,
    narrativeAxisLines: splitBriefLines(row.narrativeAxis),
    contextLines: splitBriefLines(row.context),
    onRadarLines: splitBriefLines(row.onRadar),
    priorityOfDay: row.priorityOfDay.trim(),
    baseScenarioLines: splitBriefLines(row.baseScenario),
    alternativeScenarioLines: splitBriefLines(row.alternativeScenario),
    invalidationLines: splitBriefLines(row.invalidation),
    assets: row.assets.map((a) => ({
      asset: a.asset,
      baseDirection: a.baseDirection,
      supports: a.supports,
      weakens: a.weakens,
      sensitivity: normalizeBriefSensitivity(a.sensitivity),
      sortOrder: a.sortOrder,
    })),
  };
}
