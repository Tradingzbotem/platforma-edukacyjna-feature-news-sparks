// app/api/jobs/news/enrich/route.ts
import { NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/cronAuth';
import { runNewsEnrichJob } from '@/lib/news/runNewsEnrichJob';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get('limit') || '60');
  const maxItems = Math.min(100, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 60));

  const result = await runNewsEnrichJob({ maxItems });

  if (result.skippedMissingKey) {
    return NextResponse.json(
      { ok: false, error: 'missing_api_key', pending: result.pending },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    enriched: result.enriched,
    pending: result.pending,
    failures: result.failures,
  });
}
