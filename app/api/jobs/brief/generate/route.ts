// app/api/jobs/brief/generate/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { listNews, upsertBrief } from '@/lib/news/store';
import type { Brief, BriefWindow } from '@/lib/news/types';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

const RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'brief',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        window: { type: 'string', enum: ['24h', '48h', '72h'] },
        bullets: {
          type: 'object',
          additionalProperties: false,
          properties: {
            what: { type: 'array', items: { type: 'string' } },
            why: { type: 'array', items: { type: 'string' } },
            watch: { type: 'array', items: { type: 'string' } },
          },
          required: ['what', 'why', 'watch'],
        },
        extended: { type: 'string' },
        disclaimer: { type: 'string' },
      },
      // Niektóre implementacje json_schema w LLM wymagają, by wszystkie klucze
      // występujące w "properties" widniały w "required" przy strict=true.
      // Wymuśmy "extended" jako obecne (może być pustym stringiem).
      required: ['window', 'bullets', 'extended', 'disclaimer'],
    },
    strict: true as const,
  },
} as const;

function systemPrompt() {
  return [
    'Tworzysz edukacyjny briefing rynkowy (bez rekomendacji inwestycyjnych).',
    'Styl: zwięzły, rzeczowy, maksymalnie 5–7 punktów łącznie.',
    'Sekcje: Co się stało, Dlaczego to ważne, Co obserwować.',
    'Dodaj krótki disclaimer edukacyjny po polsku.',
    'Zwracaj ścisły JSON.',
  ].join(' ');
}

async function buildBrief(window: BriefWindow): Promise<Brief | null> {
  const hours = window === '24h' ? 24 : window === '48h' ? 48 : 72;
  const { items } = await listNews({ hours });
  if (!items.length) {
    const now = new Date().toISOString();
    const id = createHash('sha1').update(`${window}:${now}`).digest('hex');
    return {
      id,
      window,
      generatedAt: now,
      bullets: { what: [], why: [], watch: [] },
      extended: '',
      disclaimer: 'Materiał edukacyjny. Informacje nie stanowią rekomendacji inwestycyjnych.',
    };
  }
  if (!apiKey) return null;
  const client = new OpenAI({ apiKey });
  const newsDigest = items
    .slice(0, 60)
    .map((i) => `- ${i.title} (${i.category || 'Inne'}; impact ${i.impact ?? 1}; edge ${i.timeEdge ?? 0})`)
    .join('\n');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt() },
      { role: 'user', content: `Zakres: ${window}\n\nOto skrót zdarzeń:\n${newsDigest}` },
    ],
    response_format: RESPONSE_FORMAT as any,
  });
  const content = completion?.choices?.[0]?.message?.content ?? '';
  const parsed = JSON.parse(content);
  const now = new Date().toISOString();
  const id = createHash('sha1').update(`${window}:${now}`).digest('hex');
  const brief: Brief = {
    id,
    window,
    generatedAt: now,
    bullets: parsed.bullets || { what: [], why: [], watch: [] },
    extended: parsed.extended || '',
    disclaimer: parsed.disclaimer || 'Materiał edukacyjny. Informacje nie stanowią rekomendacji inwestycyjnych.',
  };
  return brief;
}

export async function GET() {
  const windows: BriefWindow[] = ['24h', '48h', '72h'];
  let generated = 0;
  for (const w of windows) {
    const brief = await buildBrief(w);
    if (brief) {
      await upsertBrief(brief);
      generated++;
    }
  }
  return NextResponse.json({ ok: true, generated });
}


