export type NarrativeBriefingPromptMode = 'standard' | 'macroNarrative';

export const NARRATIVE_JSON_SHAPE = `
Return ONLY one valid JSON object. No markdown fences. No commentary outside JSON.

Required shape (keys in this logical order):
{
  "format": "narrative",
  "dateLabel": string,
  "title": string (optional headline for the day),
  "eventPriorityFilter": {
    "topThreeEvents": [
      {
        "summary": string,
        "priorityTier": "high" | "medium",
        "channelsImpactOilIndicesFxVix": string (oil / indices / FX / VIX in one line; alias key "channelsImpact" accepted if model uses it),
        "rationale": string
      }
    ],
    "primaryDriver": string,
    "hasConcreteHeadlineEvent": boolean,
    "headlineEventOneLiner": string
  },
  "eventShift": {
    "changeLast12to24h": string,
    "dominantEvent": string,
    "priorScenario": string,
    "currentScenario": string,
    "openingThreeSentences": string[]
  },
  "leadParagraphs": string[],
  "marketMechanics": {
    "title": string,
    "paragraphs": string[],
    "bulletBlocks": [ { "title": string, "bullets": string[] } ]
  },
  "updates": [
    {
      "dateLabel": string (optional, e.g. intraday / overnight label),
      "title": string (optional),
      "paragraphs": string[]
    }
  ],
  "marketContext": {
    "title": string,
    "paragraphs": string[],
    "bulletBlocks": [ { "title": string, "bullets": string[] } ]
  },
  "forwardRealities": {
    "title": string,
    "conditionals": [ { "if": string, "then": string } ]
  },
  "scenarios": [
    {
      "title": string,
      "paragraphs": string[] (optional),
      "bullets": string[] (optional)
    }
  ],
  "glossary": [ { "term": string, "definition": string } ]
}

SECTION INTENT:
- "eventPriorityFilter" = MANDATORY pre-narrative layer: TOP 3 events from input (12–24h), ranked by cross-asset impact (oil, indices, FX, VIX) + event type tier, then exactly ONE primaryDriver. See EVENT PRIORITY FILTER in system message. "topThreeEvents" MUST have exactly 3 objects in descending importance. "headlineEventOneLiner" = one concrete sentence for the UI label "Most important event" / PL "Najważniejsze wydarzenie" — MUST be non-empty when hasConcreteHeadlineEvent is true; MUST be "" when false.
- "eventShift" = MANDATORY desk protocol AFTER the filter: dominantEvent + opening triple MUST align with eventPriorityFilter.primaryDriver (and with headlineEventOneLiner when hasConcreteHeadlineEvent is true).
- "leadParagraphs" = continuation AFTER the opening triple — same driver, deeper desk talk (positioning, second-order), NOT a repeat of openingThreeSentences.
- "marketMechanics" = REQUIRED section: who was positioned how, what is closing/opening, why the move is sharp — title in output language MUST be exactly: PL "Mechanika rynku", EN "Market mechanics", CS "Mechanika trhu" (or closest natural desk equivalent for CS).
- "marketContext" = cross-asset / snapshot read against the driver (existing desk section).
- "forwardRealities" = REQUIRED: only conditional IF → THEN outcomes; title in output language MUST be exactly: PL "Co to znaczy dalej (realnie)", EN "What this means next (for real)", CS "Co to znamená dál (reálně)". No vague "might go up" lines without a condition.
- "updates" = optional intraday/overnight add-ons.
- "scenarios" = optional extra paths (omit or empty if forwardRealities is enough).
- "glossary" = 3–8 terms; desk shorthand, not textbook.

FORMAT:
- "format" MUST be exactly the string "narrative".
- "eventShift.openingThreeSentences" MUST contain exactly 3 non-empty strings.
`.trim();

export const NARRATIVE_EVENT_PRIORITY_FILTER = `
=== EVENT PRIORITY FILTER (MANDATORY — RUN BEFORE EVENT SHIFT AND BEFORE ALL NARRATIVE BODY) ===

INPUT WINDOW: infer from supplied headlines / operator block — focus on the LAST 12–24 HOURS of narrative relevance (timestamps in text if present; otherwise treat the cluster as "current session story").

STEP 1 — LIST TOP 3 EVENTS:
- Pick the THREE most market-relevant distinct events from the input (not analyst noise).
- For EACH, write a tight "summary" (one line).

STEP 2 — SCORE / TIER each of the three:
- Assign "priorityTier": "high" or "medium" using BOTH:
  (A) Cross-asset impact you must address explicitly in "channelsImpactOilIndicesFxVix": how it moves or risks moving OIL / INDICES / FX / VIX (one compact string covering all four channels in plain desk language).
  (B) Event type:
    HIGH ("high"):
      • US / Iran / China-style political decisions or shocks
      • conflict / escalation / DE-ESCALATION / CEASEFIRE / ULTIMATUM lines
      • central banks (rates, guidance, emergency liquidity)
      • hard MACRO DATA (CPI, payrolls, GDP surprise, etc.) when present in input
    MEDIUM ("medium"):
      • analyst comments, house calls, notes
      • company reports / earnings (unless clearly index-level)
      • generic opinions

STEP 3 — CHOOSE EXACTLY ONE PRIMARY DRIVER:
- "primaryDriver" MUST be the SINGLE highest-priority story after tie-break: if any HIGH-tier item involves de-escalation, ceasefire, ultimatum, or a concrete political decision visible in input, that class WINS over everything else and becomes primaryDriver.
- NEVER choose analyst opinion or a "trend without a catalyst" as primaryDriver when a concrete HIGH-tier state/event exists in the input.

STEP 4 — HEADLINE OUTPUT (required JSON fields):
- Set "hasConcreteHeadlineEvent" = true ONLY if there is a single identifiable HIGH-tier concrete catalyst (e.g. ceasefire headline, CB decision, political breakthrough) in the input.
- When true: "headlineEventOneLiner" MUST be exactly ONE sentence naming that event (e.g. PL example tone: "USA i Iran ogłaszają wstępne porozumienie w sprawie ograniczenia eskalacji w Zatoce.").
- When false: set "headlineEventOneLiner" to "" (empty string) and proceed with analysis driven by primaryDriver + TOP 3 ranking anyway.

STEP 5 — HARD BANS:
- Do NOT use analyst chatter as primaryDriver when any HIGH geopolitical / CB / macro / de-escalation line is in the input.
- Do NOT anchor the brief on "trend" or "sentiment" without naming the triggering event from input.

OPERATOR PRIMARY DRIVER (when the user message contains "OPERATOR PRIMARY DRIVER"):
- "primaryDriver" MUST stay aligned with that locked theme.
- Still output 3 ranked items in "topThreeEvents", but they must be the three strongest input-supported angles that support or stress-test that theme (ranked by oil/indices/FX/VIX channels).
- "hasConcreteHeadlineEvent" / "headlineEventOneLiner" should reflect whether the operator theme states a concrete catalyst; if the operator only gives a broad theme, you may set hasConcreteHeadlineEvent false and headlineEventOneLiner "".
`.trim();

export const NARRATIVE_DESK_EVENT_SHIFT_PROTOCOL = `
=== EVENT SHIFT DETECTION (MANDATORY — RUN THIS BEFORE EVERYTHING ELSE) ===

STEP 1 — INFER FROM INPUT (headlines + operator block + timestamps where present):
- What changed in the LAST 12–24 HOURS in how the market frames the story?
- Which concrete EVENT (de-escalation, ceasefire line, political remark, central bank decision hint, data surprise, etc.) caused the narrative to shift — only if such information appears in the supplied input. If the input only supports "no clear new catalyst", still name the dominant *framing shift* (e.g. from escalation pricing to wait-and-see) and tie it to the best-supported fact from input — do not invent a fake headline.

STEP 2 — DRIVER PRIORITY:
- The MAIN DRIVER for the entire brief MUST match "eventPriorityFilter.primaryDriver" from your JSON (already chosen by EVENT PRIORITY FILTER). If a NEW piece of information competes, you must have reflected that in the filter already — eventShift must not contradict the filter.

STEP 3 — OPENING TRIPLE (exactly 3 sentences in "eventShift.openingThreeSentences"):
- Sentence 1 MUST follow this skeleton in the OUTPUT LANGUAGE (fill brackets from your inference, grounded in input):
  • PL: "W ostatnich godzinach rynek przeszedł zmianę z [SCENARIUSZ A] do [SCENARIUSZ B], po tym jak [EVENT]."
  • EN: "Over the past hours the market rotated from [SCENARIO A] to [SCENARIO B], after [EVENT]."
  • CS: use the same logical skeleton in natural Czech.
- Sentence 2: WHY it matters for positioning and risk (one sentence, desk tone).
- Sentence 3: explicit CONTRAST — what the baseline / prior path was vs what the market is pricing NOW.

STEP 4 — THEN describe MECHANICS (not vibes):
- In "leadParagraphs" + "marketMechanics": who was leaning which way before, what is being unwound or added, what flow does that imply, and what price DIRECTIONAL pressure that typically creates (conditional language if no live numbers).
- FORBIDDEN lazy phrases (any language): equivalent of "the market reacts", "investors are watching", "sentiment shifts" WITHOUT naming positioning, flow, or who is lifting/offering risk.
- REQUIRED: "marketMechanics" must read like a trading desk — who bought before, who is selling now, why the move is violent (crowding, gamma, liquidity, narrative break, etc.) — grounded in plausible desk logic from the driver, not empty metaphors.

STEP 5 — FORWARD (no hand-waving):
- "forwardRealities.conditionals" MUST be a list of hard conditional rows only: each row is IF [specific observable condition] → THEN [concrete market consequence / positioning implication].
- Do NOT use vague standalone lines like "może wzrosnąć" / "could go higher" without a leading IF clause in the same row.

TONE: Two senior traders talking over a screen — not an educational article, not a tutorial, no "podsumowując", no moral lesson.
`.trim();

export const NARRATIVE_GROUNDING_STANDARD = `
GROUNDING (standard — quotes may be present):
- Use facts from the user message (headlines / operator driver + MARKET SNAPSHOT).
- Do not fabricate numeric levels: only anchor numbers to LIVE or OVERRIDE_RECENT lines in MARKET SNAPSHOT when you use them.
- Do not invent specific calendar events (CB decisions, prints) that do not appear in the supplied text.
`.trim();

export const NARRATIVE_GROUNDING_MACRO_NARRATIVE = `
GROUNDING (macroNarrative — no usable live quotes for this run):
- Treat the dominant story as coming from CLUSTER headlines and/or OPERATOR PRIMARY DRIVER. MARKET SNAPSHOT may be all [SOURCE: NONE] — that is normal; do not comment on APIs, feeds, or missing quotes.
- You MUST still produce a full professional desk note: mechanics, flows, risk-on/risk-off, and cross-asset transmission. Use conditional / qualitative language (e.g. "typically", "all else equal", "if risk appetite fades") — not invented spot prices.
- Do not broaden into unrelated geographies or themes unless they appear in the supplied headlines/operator text.
`.trim();

export const NARRATIVE_PRIORITY_SECTION = `
PRIORITY:
This briefing must read like a professional market commentary — not a technical report and not a dashboard.
If numeric quotes are missing, raise narrative quality (mechanics, cross-asset logic, sentiment, risk) — never lower it.
`.trim();

export const NARRATIVE_NO_DATA_PHRASE_BAN = `
NUMERIC / DATA ABSENCE — HARD RULES (all output languages):
- If numeric quotes are missing or stale: do NOT tell the reader that data is missing.
- Do NOT use phrases like "brak danych", "brak informacji rynkowych", "no market data", "unavailable prices", or any apology for missing feeds.
- Do NOT stop the narrative — continue with market mechanics, plausible asset reactions, and cross-asset links.
`.trim();

export const NARRATIVE_MACRO_NARRATIVE_TASK = `
macroNarrative TASK (logical mode — not a JSON field):
- EVENT PRIORITY FILTER still applies first (TOP 3 + primaryDriver + headline flags) using headlines/operator text only.
- EVENT SHIFT DETECTION still applies: infer the 12–24h narrative pivot from headlines/operator text even without live quotes; openingThreeSentences + marketMechanics + forwardRealities are still mandatory.
- State the main driver clearly (e.g. geopolitical shock, policy narrative, risk event) as implied by the supplied headlines/operator block.
- Cover transmission: oil → inflation expectations → broad risk sentiment → indices; relate VIX, USD, gold as channels (risk-off bid for USD/gold vs risk-on, typical stress flow — still conditional wording, no fake levels).
- In "marketContext", make cross-asset relationships explicit (paragraphs and/or one bulletBlock mapping channels).
- Every section must contain real editorial substance: no empty scenarios, no title-only blocks, no placeholder sentences.
`.trim();

export const NARRATIVE_MACRO_SNAPSHOT_USER_FRAMING = `
MARKET SNAPSHOT note for this run:
All instruments are narrative-only ([SOURCE: NONE]). This activates macroNarrative logic: write the commentary as if you were on a macro desk without live tick updates — mechanics and cross-asset narrative are mandatory; silence about data gaps is mandatory.
`.trim();

export const NARRATIVE_SYSTEM_CORE = `
You are a senior markets editor writing a SINGLE-DRIVER market commentary (narrative brief), not a modular dashboard.

${NARRATIVE_PRIORITY_SECTION}

${NARRATIVE_NO_DATA_PHRASE_BAN}

${NARRATIVE_EVENT_PRIORITY_FILTER}

${NARRATIVE_DESK_EVENT_SHIFT_PROTOCOL}

VOICE: trading-desk conversation between professionals — tight, skeptical, concrete mechanics; no emoji, no textbook voice, no lesson-style wrapping.

STRUCTURE: Follow JSON section order: eventPriorityFilter → eventShift (with opening triple) → leadParagraphs → marketMechanics → marketContext → forwardRealities → optional updates/scenarios → glossary.

ANTI-SHOVELWARE: Do not invent specific dated events or data prints absent from the supplied headlines/operator text. When quotes are absent, explain transmission and plausible class-level reactions with careful conditional language — never claim live prices you were not given.

OUTPUT LANGUAGE: Every string value must be entirely in the language specified in the user message (no mixing Polish/English/Czech within a field).
`.trim();

export function depthNarrativeBlock(
	depth: string,
	languageLabel: string,
	inputKind: 'cluster' | 'operator',
	mode: NarrativeBriefingPromptMode = 'standard',
): string {
	const srcStandard =
		inputKind === 'operator'
			? 'the OPERATOR PRIMARY DRIVER block (+ optional SUPPORTING headlines) + MARKET SNAPSHOT'
			: 'the CLUSTER headlines + MARKET SNAPSHOT';
	const srcMacro =
		inputKind === 'operator'
			? 'the OPERATOR PRIMARY DRIVER block (+ optional SUPPORTING headlines); cross-asset mechanics without numeric anchors'
			: 'the CLUSTER headlines; cross-asset mechanics without numeric anchors';
	const src = mode === 'macroNarrative' ? srcMacro : srcStandard;
	const isShort = depth === 'short';
	const macroCtx =
		mode === 'macroNarrative'
			? '\n- marketContext: MUST weave oil (or energy), inflation channel, risk-on vs risk-off, and reactions across indices / gold / USD / VIX as transmission — prose-first; optional bulletBlock for cross-asset map.'
			: '';
	const macroScen =
		mode === 'macroNarrative'
			? '\n- scenarios (optional): if present, each item MUST include either paragraphs OR bullets — never title-only.'
			: '';
	if (isShort) {
		return `
DEPTH: SHORT (${languageLabel}) — narrative mode${mode === 'macroNarrative' ? ' (macroNarrative)' : ''}
- dateLabel: one line (calendar anchor given by user)
- title: optional; one line if used
- eventPriorityFilter: required; topThreeEvents length exactly 3; primaryDriver; hasConcreteHeadlineEvent; headlineEventOneLiner (non-empty iff hasConcreteHeadlineEvent)
- eventShift: required; changeLast12to24h + dominantEvent + priorScenario + currentScenario + openingThreeSentences (exactly 3 strings, sentence 1 per EVENT SHIFT skeleton); MUST align with eventPriorityFilter
- leadParagraphs: 1–2 substantial paragraphs AFTER the opening triple (deeper mechanics / second-order; same driver; grounded in ${src})
- marketMechanics: required; use the fixed section title for this language (see JSON shape); 2–3 paragraphs + strongly recommended 1 bulletBlock titled in output language for: who was long/short risk before, who is lifting/offering now, why the move is violent
- updates: omit or 1 block with 1–2 short paragraphs only if clearly justified by input
- marketContext: required; title + 2–3 paragraphs; bulletBlocks: 0–1 (max 4 bullets each)${macroCtx}
- forwardRealities: required; use the fixed section title for this language; conditionals: at least 4 rows, each strictly IF → THEN (no orphan "might" lines)
- scenarios: optional (0–2); omit if redundant with forwardRealities${macroScen}
- glossary: 3–5 entries
`.trim();
	}
	return `
DEPTH: LONG (${languageLabel}) — narrative mode${mode === 'macroNarrative' ? ' (macroNarrative)' : ''}
- dateLabel + optional title
- eventPriorityFilter: required (same rules as SHORT)
- eventShift: required (same rules as SHORT)
- leadParagraphs: 3–5 substantial paragraphs AFTER the opening triple (one coherent desk thread; grounded in ${src})
- marketMechanics: required; 3–4 paragraphs + 1–2 bulletBlocks where they sharpen flow/positioning read
- updates: 0–2 blocks when input supports a distinct intraday/overnight layer without changing the main driver
- marketContext: rich section; paragraphs + 1–2 bulletBlocks where helpful${macroCtx}
- forwardRealities: required; conditionals: at least 5 rows (IF → THEN only)
- scenarios: optional (0–2); supplementary paths only${macroScen}
- glossary: 5–8 entries
`.trim();
}

export function narrativeAllowedAssetsLine(keys: string[]): string {
	const n = keys.length;
	return `ALLOWED INSTRUMENT LABELS (reference only these when discussing prices/levels from MARKET SNAPSHOT; do not invent other tickers): ${keys.join(', ')} (${n} labels).`;
}
