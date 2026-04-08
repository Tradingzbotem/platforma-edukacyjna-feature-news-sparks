// app/api/brief/morning-institutional/route.ts — institutional morning briefing (cluster-grounded sketch JSON)
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { extractJsonObject } from "@/lib/brief/extractJsonObject";
import type { BriefingLanguage } from "@/lib/brief/morningInstitutionalBriefingTypes";
import {
	fetchMorningBriefMarketSnapshotForKeys,
	morningBriefNarrativeNoMarketData,
	MORNING_MARKET_SNAPSHOT_FETCH_MS,
} from "@/lib/brief/morningBriefMarketSnapshot";
import { overlayMorningBriefingAssetPriceFields } from "@/lib/brief/overlayMorningBriefAssetPrices";
import { assembleMorningBriefClusterInputs } from "@/lib/brief/assembleMorningBriefClusterInputs";
import { MANUAL_DRIVER_SYSTEM_ADDON } from "@/lib/brief/morningManualTopicPrompt";
import {
	NARRATIVE_GROUNDING_MACRO_NARRATIVE,
	NARRATIVE_GROUNDING_STANDARD,
	NARRATIVE_JSON_SHAPE,
	NARRATIVE_MACRO_NARRATIVE_TASK,
	NARRATIVE_MACRO_SNAPSHOT_USER_FRAMING,
	NARRATIVE_SYSTEM_CORE,
	depthNarrativeBlock,
	narrativeAllowedAssetsLine,
	type NarrativeBriefingPromptMode,
} from "@/lib/brief/narrativeBriefingPrompt";
import { parseNarrativeBriefingFromUnknown } from "@/lib/brief/parseNarrativeBriefing";
import type { BriefingFormat } from "@/lib/brief/narrativeBriefingTypes";

export const runtime = "nodejs";
export const maxDuration = 120;

const POST_WALL_MS = 118_000;
const OPENAI_MAIN_MIN_MS = 8_000;
const REFINE_MIN_MS = 2_500;
const REFINE_TAIL_BUFFER_MS = 2_000;
const MAIN_TAIL_BUFFER_MS = 4_000;

const MAX_CLUSTER_ASSETS = 4;

function isAbortError(err: unknown): boolean {
	if (!err || typeof err !== "object") return false;
	const e = err as { name?: string };
	return e.name === "AbortError";
}

/** Sekcje makro / geopolityka / wydarzenia / quick summary — tymczasowo wyłączone po stronie API (krok naprawczy). */
function stripNonSketchBriefSections(b: Record<string, unknown>): void {
	b.macro = { usa: [], europe: [], asia: [], geopolitics: [] };
	b.events = [];
	b.crossAssetLinks = [];
	b.quickSummary = "";
}

const JSON_SKETCH_SHAPE = `
Return ONLY one valid JSON object. No markdown fences. No commentary outside JSON.

Output keys in this order:
{
  "whatsDifferentVsRecentDays": string[],
  "tldr": string[],
  "executiveSummary": string,
  "macro": { "usa": [], "europe": [], "asia": [], "geopolitics": [] },
  "events": [],
  "assets": [
    {
      "asset": string,
      "currentContext": string,
      "drivers": string,
      "livePrice": string,
      "livePriceSource": "live" | "override_recent" | "none",
      "livePriceAgeHours": number,
      "triggerBull": string,
      "triggerBear": string,
      "triggerLogic": string,
      "historicalBehavior": [ { "setup": string, "reaction": string, "lesson": string } ]
    }
  ],
  "crossAssetLinks": [],
  "scenarios": [
    {
      "title": string,
      "if": string,
      "then": string,
      "confirmation": string,
      "crossAssetReaction": string
    }
  ],
  "quickSummary": ""
}

SECTION MEANING (UI mapping):
- "whatsDifferentVsRecentDays" = „Co dziś jest inne” — tylko kontrast vs wcześniejsza baza / percepcja, wyłącznie z dozwolonego wejścia.
- "tldr" = „Co naprawdę porusza rynek dziś” — jeden dominujący driver (łańcuch przyczyna → mechanizm → skutek), bez doklejania innych klastrów.
- "executiveSummary" = Executive summary — jeden spójny akapit, wąsko na wygrany temat.
- "assets" = Aktywa — wyłącznie instrumenty z listy dozwolonych etykiet w wiadomości użytkownika; max 4 wpisy.
- "scenarios" = Scenariusze — 2–3 warianty osadzone w tym samym driverze co reszta briefu.

EMPTY KEYS (mandatory — do not populate):
- "macro", "events", "crossAssetLinks" MUST stay exactly empty as shown (empty arrays / empty object branches).
- "quickSummary" MUST be "".

PRICE / SNAPSHOT:
- Obey MARKET SNAPSHOT [SOURCE] tags. livePrice non-empty only when LIVE or OVERRIDE_RECENT for that row.
- If [SOURCE] is NONE: livePrice="" and triggers are descriptive only (no invented levels).

HISTORICAL BEHAVIOR: at most 1 object per asset (compact).
`.trim();

const LIVE_ASSET_RULES = `
PRICE SOURCE & ASSET TRIGGERS — MARKET SNAPSHOT in this message:
- Each line ends with [SOURCE: LIVE | OVERRIDE_RECENT | NONE].

1) LIVE — triggers may reference the quoted last= anchor.
2) OVERRIDE_RECENT — not live; cautious wording; avoid tight intraday ladders.
3) NONE — livePrice=""; descriptive triggers only; no fabricated numbers.

triggerLogic: one short sentence linking triggers to positioning / transmission.
`.trim();

const PRICE_LEVEL_HARD_RULE_USER = `
PRICE / TRIGGER — ABSOLUTE RULE FOR THIS RUN:
- If MARKET SNAPSHOT [SOURCE] is NONE for an instrument, livePrice="" and triggers have ZERO fabricated numeric levels.
- If [SOURCE] is OVERRIDE_RECENT, anchor cautiously to the reference snapshot — never label it as live.
- If [SOURCE] is LIVE, numeric anchors must match the quoted last=.
`.trim();

const GROUNDED_SYSTEM_CORE = `
You are a senior markets editor writing a NARROW internal morning note for ONE dominant driver only.

HARD GROUNDING (mandatory):
- Use ONLY facts explicitly present in the user message (CLUSTER headlines + MARKET SNAPSHOT). Treat that text as the entire world — no outside “filler” macro.
- Do NOT invent macro events, prices, central bank decisions, economic releases, or market moves not explicitly present in the input.
- If information is missing, say clearly that it is not confirmed in the current input (in the output language).
- The brief must focus on ONE dominant market driver only — the winning theme/cluster described in the user message.
- Do NOT broaden the report into unrelated regions, sectors, or themes (no Mexico, Brazil, OPEC, Fed, ECB, China, etc.) unless those words/themes appear in the CLUSTER headlines you were given.
- If the cluster is company-specific and no macro cluster dominates the supplied headlines, keep the brief narrow; do NOT generalize to “the whole market” unless multiple supplied headlines support that conclusion.

ANTI-DUPLICATION:
- whatsDifferentVsRecentDays vs tldr: no paraphrase overlap; first = change vs baseline, second = today’s driver chain only.

VOICE: institutional, dense, skeptical; no tutorial tone, no emoji.

OUTPUT LANGUAGE: Every string value must be entirely in the language specified in the user message (no mixing Polish/English/Czech within a field).
`.trim();

function depthSketchBlock(
	depth: string,
	languageLabel: string,
	assetRowCount: number,
	inputKind: "cluster" | "operator",
): string {
	const n = Math.max(1, Math.min(MAX_CLUSTER_ASSETS, assetRowCount));
	const src =
		inputKind === "operator"
			? "the OPERATOR PRIMARY DRIVER block (+ optional SUPPORTING headlines) + MARKET SNAPSHOT"
			: "the CLUSTER headlines + MARKET SNAPSHOT";
	const isShort = depth === "short";
	if (isShort) {
		return `
DEPTH: SHORT (${languageLabel})
- whatsDifferentVsRecentDays: 2 strings (each: change vs prior perception; grounded in ${src})
- tldr: exactly 3 strings (single-driver view for the stated horizon; no overlap with first array)
- executiveSummary: 3–5 sentences, one driver
- assets: exactly ${n} objects (one per ALLOWED ASSET LABEL, same order as listed); historicalBehavior: 1 object each
- scenarios: 2 objects (title, if, then, confirmation, crossAssetReaction — still only supported by input)
`.trim();
	}
	return `
DEPTH: LONG (${languageLabel})
- whatsDifferentVsRecentDays: 3 strings
- tldr: exactly 4 strings
- executiveSummary: 5–7 sentences, still ONE driver
- assets: exactly ${n} objects (one per ALLOWED ASSET LABEL); historicalBehavior: 1 object each
- scenarios: 3 objects
- Ground every bullet in ${src}; do not import unrelated themes.
`.trim();
}

function todayLabelForPrompt(language: BriefingLanguage): string {
	const locale = language === "en" ? "en-GB" : language === "cs" ? "cs-CZ" : "pl-PL";
	return new Intl.DateTimeFormat(locale, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "Europe/Warsaw",
	}).format(new Date());
}

const QUALITY_CHECK_SYSTEM = `
You are a briefing quality editor.

INPUT: two arrays from the same morning briefing JSON:
- whatsDifferentVsRecentDays: CHANGE narrative only (before vs now / perception shift), grounded in the same facts as the original brief.
- tldr: TODAY'S DRIVERS only — each line = driver → mechanism → effect. No past-session comparison.

YOUR JOB:
1) Detect overlap: same theme, catalyst, or paraphrase appearing in BOTH arrays.
2) If overlap exists: rewrite ONLY tldr — new bullets with ZERO thematic overlap with any whatsDifferentVsRecentDays bullet. Keep the EXACT same number of strings as input tldr.
3) If no overlap: return tldr unchanged.
4) Every tldr string must be in the briefing output language given in the user message.
5) Avoid vague relative-time words: PL "wczoraj", "ostatnio", "niedawno"; EN "yesterday", "recently", "lately"; CS "včera", "nedávno", "v poslední době".

Return ONLY valid JSON: {"tldr": string[], "rewrote": boolean}
`.trim();

async function refineTldrIfOverlapping(
	client: OpenAI,
	language: BriefingLanguage,
	briefing: Record<string, unknown>,
	signal?: AbortSignal,
): Promise<Record<string, unknown>> {
	const diff = briefing.whatsDifferentVsRecentDays;
	const tldr = briefing.tldr;
	if (!Array.isArray(diff) || !Array.isArray(tldr)) return briefing;
	const diffStrs = diff.filter((x): x is string => typeof x === "string");
	const tldrStrs = tldr.filter((x): x is string => typeof x === "string");
	if (tldrStrs.length === 0) return briefing;

	const languageLabel =
		language === "en" ? "English" : language === "cs" ? "Czech" : "Polish";

	const userPrompt = [
		`Output language for every string inside tldr: ${languageLabel}`,
		"",
		"Arrays:",
		JSON.stringify({ whatsDifferentVsRecentDays: diffStrs, tldr: tldrStrs }, null, 2),
		"",
		`Keep exactly ${tldrStrs.length} items in tldr.`,
		"If overlap or paraphrase exists between the two arrays, rewrite tldr completely to remove it while preserving driver → mechanism → effect format.",
		'Return JSON only: {"tldr": string[], "rewrote": boolean}',
	].join("\n");

	try {
		const completion = await client.chat.completions.create(
			{
				model: "gpt-4o-mini",
				temperature: 0.2,
				max_tokens: 2048,
				response_format: { type: "json_object" },
				messages: [
					{ role: "system", content: QUALITY_CHECK_SYSTEM },
					{ role: "user", content: userPrompt },
				],
			},
			signal ? { signal } : undefined,
		);

		const content = completion.choices?.[0]?.message?.content;
		if (!content) return briefing;

		let out: unknown;
		try {
			out = JSON.parse(extractJsonObject(content));
		} catch {
			return briefing;
		}

		if (typeof out !== "object" || out === null) return briefing;
		const rec = out as Record<string, unknown>;
		const newTldr = rec.tldr;
		if (!Array.isArray(newTldr)) return briefing;
		const cleaned = newTldr.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
		if (cleaned.length !== tldrStrs.length) return briefing;

		return { ...briefing, tldr: cleaned };
	} catch (err: unknown) {
		if (isAbortError(err)) return briefing;
		throw err;
	}
}

export async function POST(req: NextRequest) {
	const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing" }, { status: 500 });
	}

	const wallStart = Date.now();

	try {
		const body = await req.json().catch(() => ({}));
		const bodyObj =
			body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};

		const rawDepth = typeof bodyObj.depth === "string" ? bodyObj.depth.toLowerCase() : "long";
		const depth = rawDepth === "short" ? "short" : "long";
		const rawLang = typeof bodyObj.language === "string" ? bodyObj.language.toLowerCase() : "pl";
		const language: BriefingLanguage = rawLang === "en" ? "en" : rawLang === "cs" ? "cs" : "pl";
		const languageLabel =
			language === "en" ? "English" : language === "cs" ? "Czech" : "Polish";

		const rawFmt =
			typeof bodyObj.briefingFormat === "string" ? bodyObj.briefingFormat.toLowerCase().trim() : "structured";
		const briefingFormat: BriefingFormat = rawFmt === "narrative" ? "narrative" : "structured";

		const todayLine = todayLabelForPrompt(language);

		const assembled = await assembleMorningBriefClusterInputs(req, bodyObj);
		const { manual, canonicalAssetKeys, clusterBlock, inputKind, themeSummaryLines } = assembled;

		if (manual.active && !manual.themeTitle.trim()) {
			return NextResponse.json(
				{
					ok: false,
					error: "manualThemeTitle is required when manual theme override is enabled",
				},
				{ status: 400 },
			);
		}

		const snapshotResult = await fetchMorningBriefMarketSnapshotForKeys(req, canonicalAssetKeys, {
			fetchMs: MORNING_MARKET_SNAPSHOT_FETCH_MS,
		});
		const marketSnapshotBlock = snapshotResult.block;
		const snapshotPerLabel = snapshotResult.perLabel;

		const narrativePromptMode: NarrativeBriefingPromptMode =
			briefingFormat === "narrative" && morningBriefNarrativeNoMarketData(canonicalAssetKeys, snapshotPerLabel)
				? "macroNarrative"
				: "standard";

		const allowedAssetsLine = `ALLOWED ASSET LABELS (use these exact strings as assets[].asset, one per row, ${canonicalAssetKeys.length} entries): ${canonicalAssetKeys.join(", ")}`;

		let systemPrompt: string;
		let userPrompt: string;

		if (briefingFormat === "narrative") {
			const narrativeGrounding =
				narrativePromptMode === "macroNarrative" ? NARRATIVE_GROUNDING_MACRO_NARRATIVE : NARRATIVE_GROUNDING_STANDARD;
			systemPrompt = manual.active
				? [NARRATIVE_SYSTEM_CORE, "", narrativeGrounding, "", MANUAL_DRIVER_SYSTEM_ADDON, "", NARRATIVE_JSON_SHAPE].join(
						"\n",
					)
				: [NARRATIVE_SYSTEM_CORE, "", narrativeGrounding, "", NARRATIVE_JSON_SHAPE].join("\n");
			const genLeadNarrative =
				manual.active && manual.mode === "manual_only"
					? `Write the OPERATOR-LOCKED narrative brief. RSS is not a thematic source in this run.`
					: manual.active
						? `Write the OPERATOR-LOCKED narrative brief; supporting headlines are secondary only.`
						: `Write the CLUSTER-GROUNDED narrative market commentary for TODAY.`;
			const snapshotAndPriceRules =
				narrativePromptMode === "macroNarrative"
					? [`\n---\n=== MARKET SNAPSHOT (subset for this theme) ===\n${marketSnapshotBlock}`, `\n---\n`, NARRATIVE_MACRO_SNAPSHOT_USER_FRAMING, `\n---\n`, NARRATIVE_MACRO_NARRATIVE_TASK, `\n---\n`, narrativeAllowedAssetsLine(canonicalAssetKeys)].join(
							"\n",
						)
					: [
							`\n---\n=== MARKET SNAPSHOT (subset for this theme) ===\n${marketSnapshotBlock}`,
							`\n---\n${LIVE_ASSET_RULES}\n---\n`,
							narrativeAllowedAssetsLine(canonicalAssetKeys),
							`\n---\n${PRICE_LEVEL_HARD_RULE_USER}\n---\n`,
						].join("\n");
			userPrompt = [
				clusterBlock,
				snapshotAndPriceRules,
				genLeadNarrative,
				`Calendar anchor (Europe/Warsaw): ${todayLine}`,
				`Output language: ${languageLabel} — every string value in the JSON must be entirely in ${languageLabel}.`,
				"",
				...themeSummaryLines,
				"",
				depthNarrativeBlock(depth, languageLabel, inputKind, narrativePromptMode),
				"",
				'The JSON must include "format":"narrative" and satisfy the schema.',
				"Now produce the JSON object only.",
			].join("\n");
		} else {
			systemPrompt = manual.active
				? [GROUNDED_SYSTEM_CORE, "", MANUAL_DRIVER_SYSTEM_ADDON, "", JSON_SKETCH_SHAPE].join("\n")
				: [GROUNDED_SYSTEM_CORE, "", JSON_SKETCH_SHAPE].join("\n");
			const genLead =
				manual.active && manual.mode === "manual_only"
					? `Generate the OPERATOR-LOCKED brief sketch. RSS is not a thematic source in this run.`
					: manual.active
						? `Generate the OPERATOR-LOCKED brief sketch; supporting headlines are secondary only.`
						: `Generate the CLUSTER-GROUNDED morning brief sketch for TODAY.`;
			userPrompt = [
				clusterBlock,
				`\n---\n=== MARKET SNAPSHOT (subset for this theme) ===\n${marketSnapshotBlock}`,
				`\n---\n${LIVE_ASSET_RULES}\n---\n`,
				allowedAssetsLine,
				`\n---\n${PRICE_LEVEL_HARD_RULE_USER}\n---\n`,
				genLead,
				`Calendar anchor (Europe/Warsaw): ${todayLine}`,
				`Output language: ${languageLabel} — every string value in the JSON must be entirely in ${languageLabel}.`,
				"",
				...themeSummaryLines,
				"",
				depthSketchBlock(depth, languageLabel, canonicalAssetKeys.length, inputKind),
				"",
				"Now produce the JSON object only. Keep macro/events/crossAssetLinks/quickSummary empty as specified.",
			].join("\n");
		}

		const client = new OpenAI({
			apiKey,
			organization: process.env.OPENAI_ORG_ID,
			project: process.env.OPENAI_PROJECT,
		});

		const maxTokens =
			briefingFormat === "narrative"
				? depth === "long"
					? 5200
					: 3800
				: depth === "long"
					? 4500
					: 3200;

		const elapsedBeforeLlm = Date.now() - wallStart;
		const mainOpenAiMs = Math.max(
			OPENAI_MAIN_MIN_MS,
			POST_WALL_MS - elapsedBeforeLlm - MAIN_TAIL_BUFFER_MS,
		);
		const mainSignal = AbortSignal.timeout(mainOpenAiMs);

		let completion;
		try {
			completion = await client.chat.completions.create(
				{
					model: "gpt-4o-mini",
					temperature: 0.25,
					max_tokens: maxTokens,
					response_format: { type: "json_object" },
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userPrompt },
					],
				},
				{ signal: mainSignal },
			);
		} catch (err: unknown) {
			if (isAbortError(err)) {
				return NextResponse.json(
					{ ok: false, error: "Briefing generation exceeded time budget" },
					{ status: 504 },
				);
			}
			throw err;
		}

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
				{ status: 500 },
			);
		}

		if (briefingFormat === "narrative") {
			const narrative = parseNarrativeBriefingFromUnknown(parsed);
			if (!narrative) {
				return NextResponse.json(
					{ ok: false, error: "Invalid narrative briefing JSON from AI", raw: content },
					{ status: 500 },
				);
			}
			return NextResponse.json({
				ok: true,
				success: true,
				briefing: narrative,
				briefingFormat: "narrative" as const,
			});
		}

		const briefingRecord =
			typeof parsed === "object" && parsed !== null
				? (parsed as Record<string, unknown>)
				: null;

		const elapsedBeforeRefine = Date.now() - wallStart;
		const refineMs = Math.max(
			REFINE_MIN_MS,
			POST_WALL_MS - elapsedBeforeRefine - REFINE_TAIL_BUFFER_MS,
		);
		const refineSignal = AbortSignal.timeout(refineMs);

		let refined =
			briefingRecord != null
				? await refineTldrIfOverlapping(client, language, briefingRecord, refineSignal)
				: parsed;

		if (refined && typeof refined === "object" && refined !== null && !Array.isArray(refined)) {
			const rec = refined as Record<string, unknown>;
			stripNonSketchBriefSections(rec);
			overlayMorningBriefingAssetPriceFields(rec, snapshotPerLabel);
		}

		return NextResponse.json({
			ok: true,
			success: true,
			briefing: refined,
			briefingFormat: "structured" as const,
		});
	} catch (err: unknown) {
		if (isAbortError(err)) {
			return NextResponse.json(
				{ ok: false, error: "Briefing request aborted (time budget)" },
				{ status: 504 },
			);
		}
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ ok: false, error: message }, { status: 500 });
	}
}
