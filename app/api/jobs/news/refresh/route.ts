// app/api/jobs/news/refresh/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const cronSecret = process.env.CRON_SECRET;
  const headers = cronSecret ? { 'x-cron-secret': cronSecret } : undefined;

  const ingestRes = await fetch(`${origin}/api/jobs/news/ingest`, { cache: 'no-store', headers }).catch(() => null);
  const ingest = ingestRes && ingestRes.ok ? await ingestRes.json() : { ok: false };
  const enrichRes = await fetch(`${origin}/api/jobs/news/enrich`, { cache: 'no-store', headers }).catch(() => null);
  const enrich = enrichRes && enrichRes.ok ? await enrichRes.json() : { ok: false };
  // Optional: generate briefs after fresh enrich
  const briefRes = await fetch(`${origin}/api/jobs/brief/generate`, { cache: 'no-store' }).catch(() => null);
  const brief = briefRes && briefRes.ok ? await briefRes.json() : { ok: false };
  return NextResponse.json({ ok: Boolean(ingest?.ok && enrich?.ok), ingest, enrich, brief });
}


