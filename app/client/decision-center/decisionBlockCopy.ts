/**
 * Warstwa prezentacji Decision Block — język decyzyjny.
 * „Najważniejszy wniosek” pochodzi z silnika (`block.primaryTakeaway`); tu fallback dla starych odpowiedzi.
 */

import type { DecisionBlockV1, DecisionHorizonMode } from "@/lib/decision-engine/types";
import {
	buildBaseScenarioLine,
	firstSentenceOrTrim,
	humanizeMarketLanguage,
	isLikelyStaleNumericCopy,
} from "@/lib/decision-engine/eduScenarioCopy";
import { observeNowHorizonBullet } from "@/lib/decision-engine/horizonMode";

export { humanizeMarketLanguage, isLikelyStaleNumericCopy, buildBaseScenarioLine };

export function macroMoodLabel(eventRisk: DecisionBlockV1["macro"]["eventRisk"]): string {
	switch (eventRisk) {
		case "high":
			return "Dziś: ważne dane — większa zmienność jest realna";
		case "medium":
			return "Zbliżają się publikacje — jeśli po nich jest druga fala, temat zostaje";
		default:
			return "Makro w tym oknie spokojniejsze — więcej robi zachowanie ceny";
	}
}

function scenarioByKey(block: DecisionBlockV1, key: "A" | "B" | "C") {
	return block.scenarios.find((s) => s.key === key);
}

function safeScenarioField(
	slice: ReturnType<typeof scenarioByKey>,
	field: "confirmations" | "riskNotes"
): string | null {
	if (!slice) return null;
	const raw = (slice[field] ?? "").trim();
	if (!raw || isLikelyStaleNumericCopy(raw)) return null;
	return humanizeMarketLanguage(raw);
}

function bullishFallbackByAssetClass(block: DecisionBlockV1): string {
	const ac = block.assetClass;
	const tech = block.engineTrace.techAlignment;

	if (ac === "us_index" || ac === "eu_index" || ac === "single_stock") {
		if (tech === "risk_on_hint") {
			return "Wzrost potwierdza utrzymanie wybicia, popyt po cofnięciach i szerszy udział ruchu; szybkie oddanie całego impulsu osłabia scenariusz.";
		}
		return "Wzrost potwierdza utrzymanie wybicia i obronę po cofce; jeśli całość ruchu znika po jednej rundzie, to raczej test niż kontynuacja.";
	}
	if (ac === "gold") {
		return "Wzrost potwierdza słabszy USD, niższe rentowności oraz popyt po cofnięciu; przy jednocześnie mocnym dolarze i braku popytu scenariusz słabnie.";
	}
	if (ac === "oil") {
		return "Wzrost potwierdza utrzymanie wybicia przy ograniczonym ryzyku podaży (zapasy, OPEC+) i brak szybkiego cofnięcia po nagłówku o rynku ropy.";
	}
	if (ac === "fx_major") {
		return "Wzrost potwierdza linię wsparcia z danych makro lub banku centralnego oraz utrzymanie kierunku po publikacji bez natychmiastowego zacierania ruchu.";
	}
	return "Wzrost potwierdza utrzymanie wybicia i popyt po cofnięciach; gwałtowne oddanie całego impulsu sugeruje test, nie pełną kontynuację.";
}

function maybeAppendMacroPersistenceTail(block: DecisionBlockV1, line: string): string {
	const mode = block.decisionHorizonMode ?? "one_two_days";
	const er = block.engineTrace.eventRisk;
	const macroHeavy: DecisionHorizonMode[] = ["macro_event", "full_week"];
	if (!macroHeavy.includes(mode)) return line;
	if (er === "low") return line;
	if (/\bpo\s+(danych|publikacji|komunikacie)\b/i.test(line)) return line;
	return `${line} Jeśli po danych ruch nie jest szybko cofany, scenariusz wzrostowy pozostaje aktywny.`;
}

function bearishFallbackByAssetClass(block: DecisionBlockV1): string {
	const ac = block.assetClass;
	const tech = block.engineTrace.techAlignment;

	if (ac === "us_index" || ac === "eu_index" || ac === "single_stock") {
		if (tech === "risk_off_hint") {
			return "Spadek potwierdza brak utrzymania wybicia, podaż na odbiciach oraz silniejszy USD, wyższy VIX i rosnące rentowności, które dociążają ryzyko.";
		}
		return "Spadek potwierdza brak utrzymania wybicia i podaż na odbiciach. Jeśli rynek szybko oddaje wzrosty i nie wraca nad strefę wybicia, scenariusz spadkowy się wzmacnia.";
	}
	if (ac === "gold") {
		return "Spadek potwierdza silny USD, rosnące rentowności i brak popytu po cofnięciu — bez odkupów presja na metal utrzymuje się.";
	}
	if (ac === "oil") {
		return "Spadek potwierdza brak utrzymania poziomu po newsie o rynku ropy, szybkie oddanie wzrostu oraz sygnały nadpodaży, np. rosnące zapasy lub łagodniejsze cięcia OPEC+.";
	}
	if (ac === "fx_major") {
		return "Spadek potwierdza brak kontynuacji po danych lub po komunikacie, szybkie zanegowanie ruchu w górę oraz utrzymanie przewagi silniejszej waluty w parze.";
	}
	return "Spadek potwierdza brak utrzymania poziomu i podaż na odbiciach. Gdy cena nie wraca nad ostatnio obronioną strefę, kierunek w dół się utrwala.";
}

function maybeAppendBearishMacroTail(block: DecisionBlockV1, line: string): string {
	const mode = block.decisionHorizonMode ?? "one_two_days";
	const er = block.engineTrace.eventRisk;
	const macroHeavy: DecisionHorizonMode[] = ["macro_event", "full_week"];
	if (!macroHeavy.includes(mode)) return line;
	if (er === "low") return line;
	if (/\bpo\s+(danych|publikacji|komunikacie)\b/i.test(line)) return line;
	return `${line} Jeśli po danych ruch w dół nie jest szybko odkupowany, spadek ma większą trwałość.`;
}

/**
 * 2. Co potwierdza wzrost — warunek zachowania, nie „gdy rynek pójdzie w górę”.
 */
export function buildBullishConfirmationLine(block: DecisionBlockV1): string {
	const a = scenarioByKey(block, "A");
	const fromModule = safeScenarioField(a, "confirmations");
	const base = fromModule ?? bullishFallbackByAssetClass(block);
	return maybeAppendMacroPersistenceTail(block, base.trim());
}

/**
 * 3. Co potwierdza słabość / spadek — zachowanie, nie „gdy rynek spadnie”.
 */
export function buildBearishConfirmationLine(block: DecisionBlockV1): string {
	const c = scenarioByKey(block, "C");
	const fromModule = safeScenarioField(c, "confirmations");
	let base: string;
	if (fromModule) {
		base = fromModule;
	} else if (block.engineTrace.eventRisk === "high") {
		base =
			"Spadek potwierdza, że po danych słabsza strona zostaje przy stole i nie ma szybkiego odkupu — ważniejsza jest druga fala niż jedno szarpnięcie.";
	} else {
		base = bearishFallbackByAssetClass(block);
	}
	return maybeAppendBearishMacroTail(block, base.trim());
}

/**
 * 4. Kiedy nie robić nic — jawny komunikat o braku przewagi.
 */
export function buildNoTradeLine(block: DecisionBlockV1): string {
	const k = block.selectedScenarioKey;
	const er = block.engineTrace.eventRisk;
	const rule = block.scenarioRuleId;
	const tech = block.engineTrace.techAlignment;
	const pz = block.engineTrace.priceZone;

	if (er === "high") {
		return "Nie rób nic na pierwszym szarpnięciu po danych, jeśli nie widać strony — poczekaj na drugą falę albo utrzymanie po impulsie.";
	}

	if (k === "B") {
		if (rule === "RULE_B_UPPER_TECH_CLASH") {
			return "Nie rób nic, jeśli cena w mocniejszej strefie, a obraz techniczny jest defensywny — to konflikt bez przewagi do czasu rozstrzygnięcia.";
		}
		if (rule === "RULE_B_RANGE_TRUE_NEUTRAL" || rule === "RULE_B_RANGE_MACRO_DIGEST") {
			return "Nie rób nic, jeśli rynek stoi w środku zakresu i nie pokazuje przewagi żadnej strony.";
		}
		if (rule === "RULE_B_UNKNOWN_CALM") {
			return "Nie rób nic, jeśli w ćwiczeniu brakuje pełnego obrazu poziomów — bez tego nie naciągaj decyzji.";
		}
		return "Nie rób nic, jeśli po próbach impulsu są szybkie cofnięcia i nie ma utrzymania kierunku.";
	}

	if (k === "A" && er === "medium" && pz === "mid") {
		return "Nie forśuj A, jeśli po publikacjach reakcja jest chaotyczna — średnie ryzyko makro potrafi zdjąć przewagę.";
	}

	if (k === "C" && tech === "neutral" && er === "low") {
		return "Nie rób nic z samego defensywnego tła, jeśli cena jeszcze nie potwierdziła presji zachowaniem.";
	}

	return "Nie rób nic, jeśli scenariusz jest warunkowy albo dane nie rozstrzygnęły obrazu — brak przewagi zamiast narracji na siłę.";
}

/**
 * 5. Co obserwować teraz — pierwszy punkt zależny od horyzontu i klasy aktywa, potem makro/kontekst.
 */
export function buildObserveNowBullets(block: DecisionBlockV1, max = 3): string[] {
	const bullets: string[] = [];

	bullets.push(
		humanizeMarketLanguage(
			observeNowHorizonBullet(block.decisionHorizonMode ?? "one_two_days", block.assetClass ?? "other")
		)
	);

	const top = block.macro.topEventsForImpact[0] ?? block.macro.events[0];
	if (top) {
		const head = top.time ? `${top.title.trim()} (${top.time})` : top.title.trim();
		bullets.push(humanizeMarketLanguage(`Kalendarz: ${head} — jeśli dotyczy instrumentu, zaplanuj reakcję przed i po.`));
	} else if (block.macro.eventRisk === "high") {
		bullets.push("Kalendarz: istotne publikacje — sprawdź tytuł i czas przed sesją.");
	} else if (block.macro.eventRisk === "medium") {
		bullets.push("Kalendarz: zbliżają się dane — jeśli wchodzą w twój horyzont, miej dwa warianty przed liczbą.");
	} else {
		bullets.push("Kalendarz spokojniejszy — większą wagę ma impet i zakres na wykresie.");
	}

	const reaction = block.macro.reactionLines
		.map((x) => humanizeMarketLanguage(x.trim()))
		.find((x) => x && !isLikelyStaleNumericCopy(x));
	if (reaction) {
		bullets.push(`Po komunikacie: ${reaction}`);
	} else {
		bullets.push("Po publikacji: jeśli impet zostaje w kolejnych ustawieniach, fakt wchodzi w ceny; pełny revert — często fałsz.");
	}

	const ctxClean = block.context
		.map((x) => humanizeMarketLanguage(x.trim()))
		.find((x) => x && !isLikelyStaleNumericCopy(x));
	if (ctxClean && ctxClean.length <= 160) {
		bullets.push(`${ctxClean} Jeśli po wybiciu impet zostaje, A jest wiarygodniejsze; pełne cofnięcie — test.`);
	} else {
		bullets.push("Wybicie: jeśli struktura zostaje zaakceptowana po cofce, kontynuacja ma sens; natychmiastowe oddanie całości — jednorazowy test.");
	}

	return bullets.slice(0, max);
}

function legacyPrimaryTakeaway(block: DecisionBlockV1): string {
	const wc = block.worldContext;
	const worldPrefix =
		wc && !wc.isEmpty && wc.takeawayModifier.leadSentence ? `${wc.takeawayModifier.leadSentence} ` : "";

	const er = block.macro.eventRisk;
	const macroLead =
		er === "high"
			? "Ważne dane w oknie — jeśli pierwsza reakcja nie zostaje, nie buduj całej tezy na jednym ruchu."
			: er === "medium"
				? "Zbliżają się publikacje — jeśli po nich jest druga fala, nastrój się utrwala; jedna świeca to za mało."
				: "Makro spokojniejsze — jeśli nic z kalendarza nie rusza instrumentu, liczy się układ ceny i scenariusz z lekcji.";
	const core = humanizeMarketLanguage(buildBaseScenarioLine(block));
	const coreShort = firstSentenceOrTrim(core, 280);
	return `${worldPrefix}${macroLead} ${coreShort}`.replace(/\s+/g, " ").trim();
}

/**
 * Główny wniosek — z silnika (`block.primaryTakeaway`); fallback dla starych odpowiedzi.
 */
export function buildPrimaryTakeaway(block: DecisionBlockV1): string {
	const t = block.primaryTakeaway?.trim();
	if (t) return humanizeMarketLanguage(t);
	return legacyPrimaryTakeaway(block);
}
