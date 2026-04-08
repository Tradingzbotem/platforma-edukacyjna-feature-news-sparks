import 'server-only';

import { getPrisma } from '@/lib/prisma';
import { mapDecisionBriefRowToView } from '@/lib/decision-brief/mapRowToView';
import { decisionBriefToJsonDto } from '@/lib/decision-brief/toJsonDto';
import type { DecisionBriefJsonDto } from '@/lib/decision-brief/types';
import type { DecisionBriefView } from '@/lib/decision-brief/types';

async function fetchPublishedDecisionBriefRow() {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.decisionBrief.findFirst({
    where: { isPublished: true },
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
    include: {
      assets: { orderBy: { sortOrder: 'asc' } },
    },
  });
}

export async function getPublishedDecisionBrief(): Promise<DecisionBriefView | null> {
  const row = await fetchPublishedDecisionBriefRow();
  if (!row) return null;
  return mapDecisionBriefRowToView(row);
}

export async function getPublishedDecisionBriefDto(): Promise<DecisionBriefJsonDto | null> {
  const row = await fetchPublishedDecisionBriefRow();
  if (!row) return null;
  return decisionBriefToJsonDto(row);
}
