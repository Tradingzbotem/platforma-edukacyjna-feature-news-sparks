// app/api/news/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

export async function POST() {
  try {
    revalidateTag('news');
    return Response.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}


