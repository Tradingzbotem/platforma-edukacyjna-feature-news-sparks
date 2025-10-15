// app/api/news/prewarm/route.ts
export const runtime = "nodejs";

const buckets = ["24h", "48h", "72h"] as const;
const langs = ["pl", "en"] as const;

export async function GET() {
  try {
    await Promise.all(
      buckets.flatMap((b) =>
        langs.map(async (l) => {
          const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/news/summarize?bucket=${b}&lang=${l}`;
          try {
            const ac = new AbortController();
            const to = setTimeout(() => ac.abort(), 8000);
            const res = await fetch(url.startsWith('http') ? url : `/api/news/summarize?bucket=${b}&lang=${l}`, {
              method: 'GET',
              cache: 'no-store',
              signal: ac.signal,
            }).catch(() => null as any);
            clearTimeout(to);
            if (!res || !('ok' in res) || !res.ok) return;
            await res.arrayBuffer();
          } catch {}
        })
      )
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'prewarm failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}


