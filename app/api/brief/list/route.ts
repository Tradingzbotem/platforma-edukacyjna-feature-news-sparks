// app/api/brief/list/route.ts
import { addBrief, getBriefs, type Brief } from "../_store";

export const runtime = "nodejs";

function parseBucketToMs(bucket?: string | null): number | null {
  if (!bucket) return null;
  if (bucket === '24h') return 24 * 3600 * 1000;
  if (bucket === '48h') return 48 * 3600 * 1000;
  if (bucket === '72h') return 72 * 3600 * 1000;
  return null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const typeRaw = url.searchParams.get('type');
    const type = (typeRaw || '').trim(); // preserve case; filter must be case-sensitive
    const bucket = url.searchParams.get('bucket');
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || '10') || 10));
    const fallback = String(url.searchParams.get('fallback') || '').toLowerCase() === 'true';

    const all = await getBriefs();
    const now = Date.now();
    const rangeMs = parseBucketToMs(bucket);

    let items = all.slice();
    if (type) items = items.filter(b => (b.type || 'GEN') === type);
    // prefer entries that have either bullets or content
    items = items.filter(b => (Array.isArray(b.bullets) && b.bullets.length > 0) || (typeof (b as any).content === 'string' && (b as any).content.length > 0));
    if (rangeMs) items = items.filter(b => {
      const t = new Date(b.ts_iso).getTime();
      return t >= now - rangeMs && t <= now;
    });

    items.sort((a, b) => new Date(b.ts_iso).getTime() - new Date(a.ts_iso).getTime());
    items = items.slice(0, limit);

    // Fallback: jeśli prosimy o DAILY, a nie ma wyników i fallback=true,
    // zwróć ostatni wpis którego title zaczyna się od dokładnego "Info dnia (AI)"
    if (type === 'DAILY' && items.length === 0 && fallback) {
      const alt = all
        .filter(b => typeof b.title === 'string' && b.title.startsWith('Info dnia (AI)'))
        .sort((a, b) => new Date(b.ts_iso).getTime() - new Date(a.ts_iso).getTime())
        .slice(0, limit);
      return Response.json({ ok: true, items: alt }, { status: 200 });
    }

    return Response.json({ ok: true, items }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}


