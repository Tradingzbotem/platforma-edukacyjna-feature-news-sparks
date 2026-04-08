// POST /api/brief/morning-institutional/questions — pytania wyłącznie na podstawie przekazanego briefingu (JSON)
import { NextRequest, NextResponse } from "next/server";
import { createOpenAIClient } from "@/lib/openaiSdkClient";
import { extractJsonObject } from "@/lib/brief/extractJsonObject";

export const runtime = "nodejs";
export const maxDuration = 300;

const OUTPUT_SHAPE = `
Return ONLY one valid JSON object. No markdown. No commentary.

Schema:
{
  "title": string,
  "intro": string,
  "questions": [
    {
      "type": "single_choice" | "open_text",
      "question": string,
      "options": string[],
      "correctAnswer": string,
      "explanation": string,
      "difficulty": "easy" | "medium" | "hard",
      "sourceSection": string
    }
  ]
}

Rules for each question:
- For type "single_choice": options must be exactly 4 strings (A–D style content). correctAnswer must equal exactly one of the four option strings.
- For type "open_text": options must be an empty array []. correctAnswer is a concise model answer grounded in the briefing.
- sourceSection names which part of the briefing the question tests (e.g. macro US, cross-asset, scenario, historical analogy, risk flag).
`.trim();

export async function POST(req: NextRequest) {
	const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing" }, { status: 500 });
	}

	try {
		const body = await req.json().catch(() => ({}));
		const rawDepth = typeof body?.depth === "string" ? body.depth.toLowerCase() : "long";
		const depth = rawDepth === "short" ? "short" : "long";
		const rawLang = typeof body?.language === "string" ? body.language.toLowerCase() : "pl";
		const language = rawLang === "en" ? "en" : rawLang === "cs" ? "cs" : "pl";
		const languageLabel =
			language === "en" ? "English" : language === "cs" ? "Czech" : "Polish";

		const briefing = body?.briefing;
		if (briefing == null || typeof briefing !== "object") {
			return NextResponse.json(
				{ ok: false, error: "Missing or invalid briefing object" },
				{ status: 400 }
			);
		}

		const briefingJson = JSON.stringify(briefing);

		const counts =
			depth === "long"
				? `
MINIMUM COUNTS (HARD):
- questions: at least 12 total
- at least 8 questions with type "single_choice" (each with 4 options)
- at least 4 questions with type "open_text"
`.trim()
				: `
MINIMUM COUNTS (HARD):
- questions: at least 6 total
- at least 4 questions with type "single_choice"
- at least 2 questions with type "open_text"
`.trim();

		const systemPrompt = `
You create institutional comprehension questions for a trading/macro desk.

ABSOLUTE RULES:
- Use ONLY the provided briefing JSON as the source of truth. Do not import outside facts, figures, or events that are not stated or clearly implied in that briefing.
- Questions must be specific to THIS briefing: transmission channels, named assets, scenarios (if/then/confirmation/cross-asset), historical analogies, quickSummary, cross-asset links.
- No generic textbook questions (e.g. "what is inflation?").
- correctAnswer and explanation must be logically consistent with the briefing text.
- Questions should test: macro understanding, cross-asset dependencies, IF/THEN scenarios, scenario confirmation hooks, historical analogies, quickSummary.
- Tone: professional desk quiz, not school exam.

LANGUAGE:
- All user-visible strings (title, intro, every question, option, correctAnswer, explanation, sourceSection) must be written entirely in ${languageLabel}.
- Do not mix Polish, English, or Czech in any string.

${OUTPUT_SHAPE}
`.trim();

		const userPrompt = `
DEPTH MODE: ${depth.toUpperCase()}
Output language for all strings: ${languageLabel}

${counts}

BRIEFING JSON (sole source):
${briefingJson}

Produce the JSON object now.
`.trim();

		const client = createOpenAIClient(apiKey);

		const maxTokens = depth === "long" ? 8192 : 4096;

		const completion = await client.chat.completions.create({
			model: "gpt-4o-mini",
			temperature: 0.35,
			max_tokens: maxTokens,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
		});

		const content = completion.choices?.[0]?.message?.content;
		if (!content) {
			return NextResponse.json({ ok: false, error: "No content" }, { status: 500 });
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(extractJsonObject(content));
		} catch {
			return NextResponse.json(
				{ ok: false, error: "Invalid JSON from AI", raw: content },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			ok: true,
			success: true,
			pack: parsed,
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ ok: false, error: message }, { status: 500 });
	}
}
