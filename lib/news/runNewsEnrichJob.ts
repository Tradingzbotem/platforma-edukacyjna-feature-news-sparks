// lib/news/runNewsEnrichJob.ts
// Wspólna logika wzbogacania newsów (używana przez cron GET oraz panel admina).
import OpenAI from 'openai';
import { listUnenriched, saveEnriched } from '@/lib/news/store';
import type { NewsItemEnriched, InstrumentImpact } from '@/lib/news/types';

const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

const RESPONSE_FORMAT_JSON_OBJECT: any = { type: 'json_object' };

function systemPrompt() {
  return [
    'Jesteś asystentem edukacyjnym rynku finansowego. Odpowiadasz WYŁĄCZNIE po polsku.',
    'Zadanie: streść nagłówek w 1–2 zdaniach, zaklasyfikuj (FX/Indeksy/Surowce/Makro/Spółki/Geo/Inne), wylistuj tickery/instrumenty,',
    'określ sentiment (positive/neutral/negative), impact 1–5, timeEdge 0–10, dodaj krótkie "dlaczego to ważne" oraz 2–3 punkty "co obserwować".',
    'Dodatkowo zwróć impacts: lista obiektów {symbol, direction: up|down|volatile|neutral, effect: 1 zdanie po polsku} dla najważniejszych instrumentów.',
    'Zwróć czysty JSON (bez komentarzy i bez dodatkowego tekstu).',
  ].join(' ');
}

function coerceArrayOfStrings(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((s) => String(s)).filter(Boolean);
}

function coerceImpacts(v: any): InstrumentImpact[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const dirSet = new Set(['up', 'down', 'volatile', 'neutral']);
  const out = v.map((x) => ({
    symbol: String(x?.symbol || '').toUpperCase(),
    direction: dirSet.has(String(x?.direction))
      ? (String(x.direction) as InstrumentImpact['direction'])
      : 'neutral',
    effect: String(x?.effect || ''),
  })).filter((x) => x.symbol && x.effect);
  return out.length ? out : undefined;
}

export type NewsEnrichJobResult = {
  ok: boolean;
  enriched: number;
  pending: number;
  failures: number;
  skippedMissingKey: boolean;
};

/**
 * Wzbogaca do `maxItems` surowych wpisów z kolejki (published_at DESC).
 */
export async function runNewsEnrichJob(opts: { maxItems: number }): Promise<NewsEnrichJobResult> {
  const maxItems = Math.min(100, Math.max(1, Math.floor(opts.maxItems)));
  const pending = await listUnenriched(maxItems);

  if (!pending.length) {
    return { ok: true, enriched: 0, pending: 0, failures: 0, skippedMissingKey: false };
  }

  if (!apiKey) {
    return {
      ok: false,
      enriched: 0,
      pending: pending.length,
      failures: 0,
      skippedMissingKey: true,
    };
  }

  const client = new OpenAI({ apiKey });
  const out: NewsItemEnriched[] = [];
  const models = ['gpt-4o-mini', 'gpt-4o'];
  let failures = 0;

  for (const it of pending) {
    let enriched: NewsItemEnriched | null = null;
    for (const model of models) {
      try {
        const user = [
          `Tytuł: ${it.title}`,
          `Źródło: ${it.source}`,
          `Data: ${it.publishedAt}`,
          `URL: ${it.url}`,
          '',
          'Zwróć JSON z polami: summaryShort, category, instruments[], sentiment, impact, timeEdge, whyItMatters, watch[], impacts[].',
        ].join('\n');

        const completion = await client.chat.completions.create({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: systemPrompt() },
            { role: 'user', content: user },
          ],
          response_format: RESPONSE_FORMAT_JSON_OBJECT,
        });
        const content = completion?.choices?.[0]?.message?.content ?? '';
        const parsed = JSON.parse(content || '{}');

        const summaryShort = String(parsed.summaryShort || '').trim();
        const category = String(parsed.category || 'Inne') as any;
        const instruments = coerceArrayOfStrings(parsed.instruments).map((s) => s.toUpperCase());
        const sentiment = (['positive', 'neutral', 'negative'].includes(String(parsed.sentiment))
          ? String(parsed.sentiment)
          : 'neutral') as any;
        const impact = Number(parsed.impact ?? 1);
        const timeEdge = Number(parsed.timeEdge ?? 0);
        const whyItMatters = String(parsed.whyItMatters || '').trim();
        const watch = coerceArrayOfStrings(parsed.watch);
        const impacts = coerceImpacts(parsed.impacts);

        if (!summaryShort && !whyItMatters && instruments.length === 0) {
          throw new Error('weak_generation');
        }

        enriched = {
          ...it,
          summaryShort,
          category,
          instruments,
          sentiment,
          impact: isFinite(impact) ? Math.max(1, Math.min(5, impact)) : 1,
          timeEdge: isFinite(timeEdge) ? Math.max(0, Math.min(10, timeEdge)) : 0,
          whyItMatters,
          watch,
          impacts,
          enrichedAt: new Date().toISOString(),
        };
        break;
      } catch {
        continue;
      }
    }
    if (enriched) out.push(enriched);
    else failures += 1;
  }

  if (out.length) {
    await saveEnriched(out);
  }

  return {
    ok: true,
    enriched: out.length,
    pending: pending.length,
    failures,
    skippedMissingKey: false,
  };
}
