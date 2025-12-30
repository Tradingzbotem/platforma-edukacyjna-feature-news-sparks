// app/api/ai/coach/route.ts — EDU Coach AI (no investment advice, no signals) + selective context
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';
import { getSession } from '@/lib/session';
import { buildCoachContext, isContextAllowedForTier, filterContextPackByTier, normalizeContextSource, type ContextSource } from '@/lib/panel/coachContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Msg = { role: 'user' | 'assistant'; content: string };

function sanitizeMessages(messages: unknown): Msg[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && typeof m === 'object')
    .map((m: any) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: String(m.content ?? '').slice(0, 4000),
    }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-20);
}

const SYSTEM = `
Jesteś edukacyjnym asystentem rynku (EDU). Twoim celem jest uczenie procesu analizy:
- budowa scenariuszy warunkowych (IF / invalidation / confirmations / risk notes),
- checklisty, playbooki eventowe, interpretacja danych makro,
- kontekst techniczny jako opis, nie sygnał.

Zasady bezpieczeństwa:
- NIE podawaj rekomendacji inwestycyjnych, NIE dawaj "sygnałów" typu kup/sprzedaj/otwórz pozycję.
- NIE personalizuj pod konkretną sytuację finansową użytkownika.
- Gdy użytkownik prosi o sygnały/konkretne wejście/SL/TP/pozycję, odmów i zaproponuj edukacyjny framework.
- Zawsze formułuj odpowiedź jako EDU: warunkowo, z ryzykami, bez pewników.
- Jeśli brakuje danych (instrument/TF/kontekst), poproś o 2–3 kluczowe informacje, ale podaj też ogólny schemat.
- Na końcu dodaj: "EDU: brak rekomendacji, brak sygnałów".
`.trim();

const CONTEXT_RULES = `
Jeśli dostaniesz KONTEXT (EDU), traktuj go jako materiał referencyjny:
- Nie cytuj surowych danych ani nie wklejaj JSON.
- Streszczaj i wykorzystuj jako wzorzec struktury (scenariusze/checklisty/playbooki).
- Jeśli kontekst nie pasuje do pytania, powiedz to wprost i przejdź do ogólnego schematu.
- Jeśli NIE ma kontekstu dołączonego, rozpocznij odpowiedź zdaniem: "Brak kontekstu wejściowego — doprecyzuj: (1) instrument, (2) TF, (3) czy to event (CPI/NFP/FOMC) czy technika/scenariusz." Następnie podaj ogólny schemat (A/B/C + checklist) bez sygnałów/SL/TP. Nie wspominaj o planach ani o blokadach.
`.trim();

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Brak OPENAI_API_KEY w środowisku.' }, { status: 500 });
    }

    // Tier gating (ELITE only)
    const c = await cookies();
    const session = await getSession();
    const tier = resolveTierFromCookiesAndSession(c, session);
    if (!isTierAtLeast(tier, 'elite')) {
      return NextResponse.json(
        { error: 'ELITE required', code: 'TIER_REQUIRED', required: 'elite' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = sanitizeMessages(body?.messages);

    const contextSource = normalizeContextSource(body?.contextSource);

    // Selective context based on last user message (instrument/TF/event keywords) with tier gating
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const contextAllowed = isContextAllowedForTier(contextSource, tier);
    const rawPack = contextAllowed ? buildCoachContext(contextSource, 6000, lastUserMsg) : '';
    const context = filterContextPackByTier(rawPack, tier, contextSource);

    // Missing-info helper when no context is attached
    const hasContext = Boolean(context && context.trim().length > 0);
    const MISSING_INFO_HINT = `
Brak dołączonego kontekstu: zadaj maksymalnie 3 krótkie pytania doprecyzowujące (instrument, TF, event vs technika).
Następnie odpowiedz w układzie: "Założenia → Scenariusz A/B/C → Checklist → Ryzyka".
Nie podawaj sygnałów ani wartości SL/TP ani konkretnych zleceń.
`.trim();

    // Anti-signal (regex)
    const lastUser = lastUserMsg.toLowerCase();
    const wantsSignal = /(\bsygna(ł|l)\b|\bkup\b|\bsprzed\b|\bwej(ś|s)ci(e|a)\b|\bsl\b|\btp\b|\bstop loss\b|\btake profit\b|\blong\b|\bshort\b|\botw(ó|o)rz\b|\bpozycj)/i.test(
      lastUser
    );

    const userOverride = wantsSignal
      ? `Użytkownik prosi o sygnał/konkretną transakcję. Odmów i podaj wyłącznie edukacyjny framework: scenariusze warunkowe, kryteria unieważnienia, potwierdzenia, ryzyka, checklistę. Bez wejść/SL/TP.`
      : '';

    const payload = {
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      max_tokens: 750,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'system', content: CONTEXT_RULES },
        ...(userOverride ? [{ role: 'system', content: userOverride }] : []),
        ...(context ? [{ role: 'system', content: context }] : []),
        ...(!hasContext ? [{ role: 'system', content: MISSING_INFO_HINT }] : []),
        ...messages,
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

    return NextResponse.json({ reply: reply || 'Brak odpowiedzi.' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


