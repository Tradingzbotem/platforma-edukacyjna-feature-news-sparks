// app/api/ai/chat/route.ts
import OpenAI from "openai";
import { z } from "zod";

export const runtime = "nodejs";

// System prompt: szerzej o finansach/rynkach, bez rekomendacji, z użyciem kontekstu.
const SYSTEM_PROMPT = `
Jesteś asystentem edukacyjnym platformy o rynkach finansowych: Forex, indeksy, surowce, akcje, krypto, instrumenty pochodne, makroekonomia, pojęcia i metody tradingu, quizy oraz materiały edukacyjne (KNF/ESMA/MiFID).

Zasady:
- Odpowiadaj po polsku, zwięźle i konkretnie (3–10 krótkich zdań lub zwięzłe punkty).
- Zero rekomendacji inwestycyjnych ani porad co do konkretnych transakcji; treści wyłącznie edukacyjne.
- Dopuszczalne: proste wzory/wyliczenia, przykłady liczbowe i syntetyczne podsumowania.

Kontekst:
- Jeśli w pytaniu znajduje się sekcja „Kontekst: …”, streść i wykorzystaj ją w odpowiedzi (bez halucynacji).
- Gdy kontekst jest niejednoznaczny, sformułuj rozsądne założenia i zaznacz je.

Styl:
- Klarownie, rzeczowo, bez „lania wody”; używaj list, gdy to pomaga.
- Jeżeli pytanie całkowicie odbiega od tematyki finansów/rynków, uprzejmie przekieruj rozmowę do tematów rynkowych zamiast odmawiać odpowiedzi.
`;

// Akceptujemy dwa formaty body, by dopasować się do różnych klientów:
// 1) { question: string }
// 2) { message: string } lub { messages: [{role, content}] }
const BodySchema = z.object({
  question: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "system", "assistant"]),
      content: z.string().min(1),
    })
  ).optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid body", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question, message, messages } = parsed.data;

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "Brak klucza API. Ustaw OPENAI_API_KEY w .env.local i zrestartuj serwer.",
        },
        { status: 500 }
      );
    }

    // Znormalizuj do listy wiadomości:
    const normalized =
      (messages && messages.length
        ? messages
        : [
            {
              role: "user" as const,
              content: (question ?? message ?? "").trim(),
            },
          ]
      ).filter(m => m.content.trim().length > 0);

    if (!normalized.length) {
      return Response.json(
        { error: "Brak treści pytania." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...normalized,
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Przepraszam, nie mam gotowej odpowiedzi.";

    return Response.json({ answer }, { status: 200 });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Błąd po stronie serwera AI." },
      { status: 500 }
    );
  }
}

// (opcjonalnie) prosta diagnostyka GET
export async function GET() {
  return Response.json({ ok: true, endpoint: "/api/ai/chat" });
}
