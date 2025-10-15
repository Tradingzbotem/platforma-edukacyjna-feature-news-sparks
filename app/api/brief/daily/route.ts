import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isProd = process.env.NODE_ENV === 'production';

function okAuth(req: NextRequest) {
  if (!isProd) return true; // dev bypass
  const param = req.nextUrl.searchParams.get('key');
  const header = req.headers.get('x-cron-secret');
  const want = process.env.CRON_SECRET;
  return Boolean(want && (param === want || header === want));
}

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export async function GET(req: NextRequest) {
  if (!okAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Prefer dynamic base built from request host (handles custom dev ports)
    const dynamicBase =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${req.nextUrl.protocol}//${req.headers.get('host')}`);

    // 1) Pobierz "ziarno" z ostatnich 24h (PL)
    const seedRes = await fetch(`${dynamicBase}/api/news/summarize?bucket=24h&lang=pl`, { cache: 'no-store' });
    const seedJson = seedRes.ok ? await seedRes.json() : { items: [] };
    const seedItems = Array.isArray(seedJson?.items) ? seedJson.items.slice(0, 30) : [];

    // 2) Zbuduj prompt nakierowany na "co dziś"
    const now = new Date();
    const day = String(now.getUTCDate()).padStart(2, '0');
    const mon = String(now.getUTCMonth() + 1).padStart(2, '0');
    const tit = `Info dnia (AI) — ${day}.${mon}, 08:00`;

    const hardIntro = 'Piszesz po polsku. Materiał edukacyjny, zero rekomendacji inwestycyjnych ani porad tradingowych.';
    const focus =
      'Zrób krótkie podsumowanie NA DZIŚ: kluczowe wydarzenia makro (USA i global), publikacje z kalendarza, ' +
      'istotne wyniki kwartalne w USA (jeśli dziś są), ewentualne decyzje banków centralnych/konferencje. ' +
      'Dla każdego punktu podaj tylko fakt + czego dotyczy, bez przewidywań i sentencji typu „to może spowodować…”.';
    const structure =
      'Struktura: \n' +
      '• Nagłówek: "Info dnia — DD.MM, 08:00"\n' +
      '• 4–8 punktów „na dziś” (jedno–dwa zdania każdy)\n' +
      '• Krótka „Opinia AI” (2 zdania; edukacyjnie, bez rekomendacji)\n' +
      '• Stopka: "Materiał edukacyjny — to nie jest rekomendacja inwestycyjna."';
    const grounding =
      'Jeśli brakuje potwierdzonych pozycji w źródłach, napisz krótko „Brak nowych, potwierdzonych pozycji na dziś w bazie.”\n' +
      'Oprzyj się wyłącznie na JSON z ostatnich 24h poniżej (nie wymyślaj):\n' +
      JSON.stringify(
        seedItems.map((i: any) => ({
          title: i.title,
          summary: i.summary,
          timestamp_iso: i.timestamp_iso,
          source: i.source,
          link: i.link,
          instruments: i.instruments,
        })),
        null,
        2
      );

    const prompt = `${hardIntro}\n\n${focus}\n\n${structure}\n\n${grounding}`;

    // 3) Wywołaj wewnętrzny generator briefów z typem DAILY – nawet jeśli seed pusty
    const genRes = await fetch(`${dynamicBase}/api/brief/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'pl',
        range: 'today',
        type: 'DAILY',
        title: tit,
        prompt,
      }),
      cache: 'no-store',
    });

    if (!genRes.ok) {
      console.error('Brief generator error', { status: genRes.status });
      const msg = `Generator HTTP ${genRes.status}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ ok: true, title: tit });
  } catch (e: any) {
    console.error('Daily brief error', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export const POST = GET;


