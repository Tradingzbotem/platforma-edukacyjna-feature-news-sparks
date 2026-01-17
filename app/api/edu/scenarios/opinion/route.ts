// app/api/edu/scenarios/opinion/route.ts — EDU: Opinia AI do scenariuszy (starter+)
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  asset?: string;
  timeframe?: 'H1' | 'H4' | 'D1';
  levels?: Array<string | number>;
  levelsNormalized?: Array<string>;
  currentPrice?: number;
  contextText?: string;
};

function clamp(s: string, max = 900) {
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Brak OPENAI_API_KEY w środowisku.' }, { status: 500 });
    }

    // Tier gating: starter+ (zgodne z modułem)
    const c = await cookies();
    const session = await getSession();
    const tier = resolveTierFromCookiesAndSession(c, session);
    if (!isTierAtLeast(tier, 'starter')) {
      return NextResponse.json(
        { error: 'STARTER required', code: 'TIER_REQUIRED', required: 'starter' },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const asset = String(body.asset || '').slice(0, 40);
    const timeframe = (body.timeframe as any) || '';
    const levels = Array.isArray(body.levels) ? body.levels.map((x) => String(x)).slice(0, 10) : [];
    const levelsNormalized = Array.isArray(body.levelsNormalized) ? body.levelsNormalized.map((x) => String(x)).slice(0, 10) : [];
    const currentPrice = typeof (body as any)?.currentPrice === 'number' ? (body as any).currentPrice as number : undefined;
    const contextText = String(body.contextText || '').slice(0, 1200);

    const SYSTEM = `
Jesteś edukacyjnym komentatorem technicznym. Opisuj sytuację na wykresie prostym, potocznym językiem, bez żargonu.
Zasady bezpieczeństwa:
- Bez rekomendacji i sygnałów (bez kup/sprzedaj, wejścia/wyjścia, SL/TP, dźwigni).
- Mów warunkowo i niekategorycznie: "często", "zwykle", "jeśli… to…", "zależy od kontekstu".
- Skup się na czytaniu wykresu: trend vs konsolidacja, strefy z poziomów, co by potwierdzało kierunek (wybicie/odbicie), charakter świec (duże/małe, spokojnie/gwałtownie).
Na końcu NIE dodawaj sygnału — to ma być komentarz edukacyjny.
`.trim();

    const userMsg = `
Instrument: ${asset || 'N/D'}${timeframe ? ` · ${timeframe}` : ''}
Aktualna cena: ${currentPrice != null && isFinite(currentPrice) ? currentPrice : '—'}
Poziomy (bazowe): ${levels.join(', ') || '—'}
Poziomy (dopasowane do bieżącej ceny): ${levelsNormalized.join(', ') || '—'}
Kontekst (skrótem): ${contextText || '—'}
Zadanie: Podaj krótki komentarz edukacyjny (600–900 znaków), bazując w pierwszej kolejności na "Poziomach (dopasowanych)" i aktualnej cenie. Jeśli różnią się od bazowych, traktuj bazowe tylko jako historyczne odniesienie. Odpowiedz po polsku.
`.trim();

    const payload = {
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      max_tokens: 750,
      messages: [
        { role: 'system' as const, content: SYSTEM },
        { role: 'user' as const, content: userMsg },
      ],
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return NextResponse.json(
        { error: `OpenAI error: ${r.status} ${r.statusText} ${txt?.slice(0, 500)}` },
        { status: 500 }
      );
    }

    const json = await r.json();
    const reply = String(json?.choices?.[0]?.message?.content ?? '').trim();

    // Skróć i dodaj krótki disclaimer na końcu w kliencie (klient dokleja), ale tu zwróć czysty tekst
    return NextResponse.json({ shortOpinion: clamp(reply, 900) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


