// app/api/panel/playbooks/generate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PLAYBOOKS, type Playbook } from '@/lib/panel/playbooks';

export const dynamic = 'force-dynamic';

type Body = {
  slug: string;
  tab:
    | 'tldr'
    | 'pre'
    | 'live'
    | 'scenarios'
    | 'pitfalls'
    | 'map'
    | 'risk'
    | 'quiz'
    | 'glossary';
  instrument?: 'US100' | 'XAUUSD' | 'EURUSD' | 'UST10Y';
};

function getPlaybook(slug: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.slug === slug);
}

function sysPrompt(pb: Playbook, tab: Body['tab']) {
  const base = [
    'Jesteś asystentem EDU (bez sygnałów) dla modułu „Playbooki eventowe”.',
    'Piszesz po polsku, zwięźle, klarownie, z dobrymi nagłówkami i listami.',
    'Absolutnie żadnych rekomendacji inwestycyjnych ani „sygnałów”.',
    'Zwróć dokładnie JSON bez dodatkowego tekstu.',
    `Kontekst: ${pb.title} | Region: ${pb.region} | Ważność: ${pb.importance} | Tagi: ${pb.tags.join(', ')}`,
  ].join('\n');

  const schemaByTab: Record<Body['tab'], string> = {
    tldr: `Schema: {"sixtySeconds": string[6..10]}`,
    pre: `Schema: {"preRelease":{"t24h": string[3..6], "t2h": string[3..6], "t15m": string[3..6]}}`,
    live: `Schema: {"during": string[4..8]}`,
    scenarios: `Schema: {"scenarios": [{"id":"A"|"B"|"C"|"D"|"E","title":string,"details": string[2..4],"caveats": string[1..3]}][3..5]}`,
    pitfalls: `Schema: {"pitfalls": string[6..10]}`,
    map: `Schema: {"marketMap":{"firstReactors": string[2..5], "confirmations": string[2..5], "crossChecks": string[2..5]}}`,
    risk: `Schema: {"risks": string[5..10]}`,
    quiz: `Schema: {"quiz":[{"question":string,"options": string[4], "correctIndex": number, "explanation": string}][5..8]}`,
    glossary: `Schema: {"glossary":[{"term":string,"definition":string}][8..14]}`,
  };

  return `${base}\n${schemaByTab[tab]}`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 500 });
    }
    const { slug, tab, instrument }: Body = await req.json();
    const pb = getPlaybook(String(slug || '').trim());
    if (!pb) return NextResponse.json({ error: 'Unknown playbook slug' }, { status: 404 });
    if (!tab) return NextResponse.json({ error: 'Missing tab' }, { status: 400 });

    const openai = new OpenAI({ apiKey, organization: process.env.OPENAI_ORG_ID, project: process.env.OPENAI_PROJECT });

    const user = [
      `Zadanie: wygeneruj zawartość dla zakładki "${tab}".`,
      instrument ? `Instrument focus: ${instrument} (jeśli sensowne, zasygnalizuj kontekst; bez sygnałów).` : '',
      'Styl: konkretne, edukacyjne, zero rekomendacji.',
      'Zwróć dokładnie JSON zgodny ze schematem. Bez innego tekstu.',
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sysPrompt(pb, tab) },
        { role: 'user', content: user },
      ],
      max_tokens: 1200,
    });

    const content = completion.choices?.[0]?.message?.content ?? '{}';
    let json: any = {};
    try {
      json = JSON.parse(content);
    } catch {
      json = {};
    }
    // Sanitize minimal
    return NextResponse.json({ ok: true, tab, data: json });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


