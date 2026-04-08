import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import {
  buildDecisionBriefTopicClusters,
  pickDiverseQuickTopics,
  type TopicClusterChoice,
} from '@/lib/decision-brief/prefillFromNews';
import { listNews } from '@/lib/news/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const QUICK_TOPICS_DIVERSE = 5;
const MAX_TOPIC_CLUSTERS = 40;

function serializeTopic(t: TopicClusterChoice) {
  return {
    clusterId: t.clusterId,
    clusterKey: t.clusterKey,
    clusterLabel: t.clusterLabel,
    rank: t.rank,
    newsCount: t.newsCount,
    latestNewsAt: t.latestNewsAt,
    earliestNewsAt: t.earliestNewsAt,
    draft: t.draft,
  };
}

/**
 * GET /api/admin/decision-brief/prefill-from-news
 * Query: hours=24|48 (domyślnie 48).
 *
 * Zwraca `topicsQuick` (zróżnicowany szybki wybór), `topics` (alias), `topicsAll` (pełna lista).
 */
export async function GET(req: Request) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const hoursRaw = Number(url.searchParams.get('hours') || '48');
  const hours = hoursRaw === 24 || hoursRaw === 48 ? hoursRaw : 48;

  const includeDemo = process.env.NODE_ENV !== 'production';

  let minImpact = 2;
  let { items } = await listNews({ hours, minImpact, includeDemo });
  if (items.length < 3) {
    ({ items } = await listNews({ hours, minImpact: 1, includeDemo }));
  }

  const { topics, meta } = buildDecisionBriefTopicClusters(items, {
    maxHeadlines: 10,
    maxAssets: 12,
    maxTopics: MAX_TOPIC_CLUSTERS,
  });

  const topicsQuick = pickDiverseQuickTopics(topics, QUICK_TOPICS_DIVERSE);
  const serializedQuick = topicsQuick.map(serializeTopic);
  const serializedAll = topics.map(serializeTopic);

  return NextResponse.json(
    {
      ok: true,
      topicsQuick: serializedQuick,
      topics: serializedQuick,
      topicsAll: serializedAll,
      meta: {
        hours,
        newsCount: items.length,
        totalClustersRaw: meta.totalClustersRaw,
        skippedDuplicateOrSimilar: meta.skippedDuplicateOrSimilar,
        topicsReturned: topics.length,
        quickTopics: QUICK_TOPICS_DIVERSE,
        source: 'listNews (NewsItemEnriched) — klastry z topicClusterKey (kategoria + tickery / tytuł)',
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
