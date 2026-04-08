/**
 * Warstwa prezentacji Decision Block — język decyzyjny.
 * „Najważniejszy wniosek” pochodzi z silnika (`block.primaryTakeaway`); tu fallback dla starych odpowiedzi.
 */

import type { DecisionBlockV1, DecisionHorizonMode, TechAlignment } from "@/lib/decision-engine/types";
import type { WorldDirectionalPressure, WorldRelatedEvent } from "@/lib/decision-engine/worldContext/types";
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

/** Krótkie doszlifowanie: jeśli tekst nie nazywa instrumentu, dodaj ramę „Dla ASSET”. */
export function framePrimaryTakeawayForDisplay(block: DecisionBlockV1): string {
	const text = buildPrimaryTakeaway(block);
	const asset = block.asset?.trim();
	if (!asset) return text;
	const esc = asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	if (new RegExp(`\\b${esc}\\b`, "i").test(text)) return text;
	return `Dla ${asset}: ${text}`;
}

export type DecisionConditionState = "met" | "unmet" | "unknown";

export type DecisionConditionRow = {
	label: string;
	description?: string;
	state: DecisionConditionState;
};

function zoneGrowthState(pz: DecisionBlockV1["engineTrace"]["priceZone"]): DecisionConditionState {
	if (pz === "upper") return "met";
	if (pz === "lower") return "unmet";
	return "unknown";
}

function zoneWeaknessState(pz: DecisionBlockV1["engineTrace"]["priceZone"]): DecisionConditionState {
	if (pz === "lower") return "met";
	if (pz === "upper") return "unmet";
	return "unknown";
}

function macroCalmGrowth(er: DecisionBlockV1["macro"]["eventRisk"]): DecisionConditionState {
	if (er === "low") return "met";
	if (er === "high") return "unmet";
	return "unknown";
}

function macroStressWeak(er: DecisionBlockV1["macro"]["eventRisk"]): DecisionConditionState {
	if (er === "high") return "met";
	if (er === "low") return "unmet";
	return "unknown";
}

function techGrowthForIndex(tech: TechAlignment): DecisionConditionState {
	if (tech === "risk_on_hint") return "met";
	if (tech === "risk_off_hint") return "unmet";
	return "unknown";
}

function techWeakForIndex(tech: TechAlignment): DecisionConditionState {
	if (tech === "risk_off_hint") return "met";
	if (tech === "risk_on_hint") return "unmet";
	return "unknown";
}

/** Dla złota risk-on na akcjach często jest głową wiatru dla metali w krótkim oknie. */
function techGrowthForGold(tech: TechAlignment): DecisionConditionState {
	if (tech === "risk_off_hint") return "met";
	if (tech === "risk_on_hint") return "unmet";
	return "unknown";
}

function techWeakForGold(tech: TechAlignment): DecisionConditionState {
	if (tech === "risk_on_hint") return "met";
	if (tech === "risk_off_hint") return "unmet";
	return "unknown";
}

function worldGrowthForIndex(dp: WorldDirectionalPressure): DecisionConditionState {
	if (dp === "risk_on") return "met";
	if (dp === "risk_off") return "unmet";
	return "unknown";
}

function worldWeakForIndex(dp: WorldDirectionalPressure): DecisionConditionState {
	if (dp === "risk_off") return "met";
	if (dp === "risk_on") return "unmet";
	return "unknown";
}

function worldGrowthForGold(dp: WorldDirectionalPressure): DecisionConditionState {
	if (dp === "risk_off") return "met";
	if (dp === "risk_on") return "unmet";
	return "unknown";
}

function worldWeakForGold(dp: WorldDirectionalPressure): DecisionConditionState {
	if (dp === "risk_on") return "met";
	if (dp === "risk_off") return "unmet";
	return "unknown";
}

function impactMatchesAsset(symbol: string, asset: string): boolean {
	const s = symbol.toUpperCase();
	const a = asset.toUpperCase();
	if (s.includes(a)) return true;
	const aliases: Record<string, string[]> = {
		US100: ["NAS", "NDX", "QQQ", "TECH"],
		US500: ["SPX", "SP500", "S&P"],
		DE40: ["DAX", "GER40"],
		GOLD: ["XAU", "ZŁOT"],
		EURUSD: ["EUR", "EURO"],
		GBPUSD: ["GBP", "CABLE"],
		USDJPY: ["JPY", "YEN"],
		WTI: ["OIL", "CRUDE", "CL ", "ROPA"],
	};
	for (const frag of aliases[a] ?? []) {
		if (s.includes(frag)) return true;
	}
	return false;
}

/**
 * 1–2 zdania: jak nagłówek przekłada się na wybrane aktywo (szczera o słabym wpływie).
 */
export function buildNewsAssetBridge(block: DecisionBlockV1, event: WorldRelatedEvent): string {
	const asset = block.asset.trim();
	const ac = block.assetClass;

	const hit = (event.impacts ?? []).find((row) => impactMatchesAsset(row.symbol, asset));
	if (hit?.effect?.trim()) {
		const dir = hit.direction?.trim();
		const tail = dir ? ` Kierunek w zestawieniu: ${dir}.` : "";
		return `Dla ${asset}: ${humanizeMarketLanguage(hit.effect.trim())}${tail} To jest najbardziej bezpośrednia linia z tagowania newsa do instrumentu.`;
	}

	const kinds = new Set(event.matchKinds ?? []);
	const geo = kinds.has("keyword_geo");
	const energy = kinds.has("keyword_energy");
	const cb = kinds.has("keyword_cb");
	const lowRel = (event.relevanceScore ?? 0) < 38;
	const mixedWorld = block.worldContext.directionalPressure === "mixed";

	if (ac === "us_index" || ac === "eu_index" || ac === "single_stock") {
		if (geo) {
			return `Dla ${asset} wpływ jest zwykle pośredni: eskalacja geopolityczna często podbija ropę i rentowności, co może dociążać spółki wzrostowe przez wyższy koszt kapitału i presję na wyceny. Ważne jest, czy widzisz utrwalenie w obligacjach i USD, a nie tylko jeden cykl nagłówków.`;
		}
		if (energy) {
			return `Dla ${asset} kanał jest mieszany: droższa energia potrafi podbić obawy inflacyjne i rentowności, co dla szerokiego indeksu bywa szkodliwe, choć część sektorów bywa wtedy relatywnie mocniejsza. Oceniaj to po zachowaniu indeksu po kolejnej sesji, nie po samej reakcji paliwa.`;
		}
		if (cb) {
			return `Dla ${asset} polityka pieniężna jest zwykle bezpośredniejszym kanałem niż pojedynczy news: komunikaty BC przekładają się na stopy, oczekiwania inflacyjne i USD, więc indeks reaguje często przez dyskont i rotację sektorów.`;
		}
		if (lowRel || mixedWorld) {
			return `Dla ${asset} powiązanie z tym nagłówkiem jest słabe albo pośrednie — traktuj to jako tło nastroju, dopóki nie zobaczysz drugiej fali w danych lub w strukturze ceny na Twoim interwale.`;
		}
		return `Dla ${asset} liczy się, czy temat z nagłówka przełoży się na kolejne ustawienia oraz na spójny ruch w obligacjach i USD; bez tego często dostajesz jednorazową volatility, a nie trwały driver dla indeksu.`;
	}

	if (ac === "gold") {
		if (geo || energy) {
			return `Dla ${asset} geopolityka i energia często podbijają popyt defensywny i argumenty „stagflacyjne”, co bywa wiatrem w plecy dla złota — o ile USD nie dominuje jednocześnie jako schronienie.`;
		}
		if (cb) {
			return `Dla ${asset} komunikaty banków centralnych są kluczowe: oczekiwania realnych stóp i USD często rozstrzygają, czy złoto trzyma impet, czy cofa się po nagłówku.`;
		}
		if (lowRel) {
			return `Dla ${asset} ten nagłówek ma słabe bezpośrednie przełożenie — bez potwierdzenia w USD i rentownościach zostaje tłem, nie gotowym triggerem.`;
		}
		return `Dla ${asset} patrz przede wszystkim na USD i dynamikę stóp w oczekiwaniach rynku; reszta nagłówków jest ważna dopiero wtedy, gdy widać to w kolejnych świecach, a nie w jednym impulsie.`;
	}

	if (ac === "oil") {
		if (energy || geo) {
			return `Dla ${asset} ten temat jest bliższy rdzeniowi: nagłówki o podaży, przerwach i napięciach geopolitycznych często przekładają się na premie ryzyka w cenie ropy.`;
		}
		if (cb) {
			return `Dla ${asset} polityka pieniężna działa pośrednio przez popyt globalny i dolara; sam nagłówek o BC bez ruchu w popycie nie musi utrzymać trendu ropy.`;
		}
		if (lowRel) {
			return `Dla ${asset} związek z tym newsem jest słaby — bez potwierdzenia w strukturze ceny ropy i w zapasach/narracji OPEC+ zostaje szumem sesyjnym.`;
		}
		return `Dla ${asset} oceń, czy driver jest „ropowy” (podaż, zapasy, geopolityka), a nie tylko ogólny risk-on/off na akcjach; bez tego reakcja często się wyciera.`;
	}

	if (ac === "fx_major") {
		if (cb) {
			return `Dla ${asset} komunikaty banku centralnego i dane inflacyjne są zwykle najbliższym kanałem — tu pojedynczy nagłówek ma sens tylko wtedy, gdy zmienia oczekiwania na stopy lub spread między walutami.`;
		}
		if (geo) {
			return `Dla ${asset} geopolityka często idzie przez USD i płynność: para może zareagować pośrednio, jeśli dolar przejmuje rolę schronienia albo risk-on rozlewa się na carry.`;
		}
		if (lowRel) {
			return `Dla ${asset} powiązanie jest słabe — bez potwierdzenia w danych lub w komunikatach dla obu walut para może zignorować nagłówek.`;
		}
		return `Dla ${asset} sprawdź, czy news zmienia relativne oczekiwania stóp i przepływy, a nie tylko ogólny sentyment; FX najczęściej potrzebuje „drugiej fali” po publikacji.`;
	}

	return `Dla ${asset} ten nagłówek traktuj ostrożnie: w silniku nie ma twardego mapowania wpływu — zostań przy poziomach i przy makro w Twoim horyzoncie.`;
}

export function buildGrowthConditionRows(block: DecisionBlockV1): DecisionConditionRow[] {
	const pz = block.engineTrace.priceZone;
	const er = block.engineTrace.eventRisk;
	const tech = block.engineTrace.techAlignment;
	const dp = block.worldContext.directionalPressure;
	const ac = block.assetClass;

	if (ac === "gold") {
		return [
			{
				label: "Utrzymanie silniejszej strefy ceny",
				description: "Góra pasma / obrona po impulsie zamiast natychmiastowego oddania struktury.",
				state: zoneGrowthState(pz),
			},
			{
				label: "Okno makro bez skrajnego ryzyka jednej publikacji",
				description: "Niższe ryzyko „high” z kalendarza = mniejsze ryzyko jednorazowego szarpnięcia.",
				state: macroCalmGrowth(er),
			},
			{
				label: "Kontekst risk-on na akcjach nie dominuje jednostronnie",
				description: "Proxy: gdy akcje są w risk-off, złoto często ma łatwiej o narrację popytową.",
				state: techGrowthForGold(tech),
			},
			{
				label: "Globalny ton nie jest wyłącznie risk-on",
				description: "„Risk-off” w nagłówkach bywa wsparciem dla metali — o ile USD nie przejmuje całej ulotki.",
				state: worldGrowthForGold(dp),
			},
		];
	}

	if (ac === "oil") {
		return [
			{
				label: "Utrzymanie poziomu po impulsie",
				description: "Czy rynek trzyma wybicie, zamiast cofać całość ruchu po nagłówku.",
				state: zoneGrowthState(pz),
			},
			{
				label: "Sesja bez dominacji makro „high”",
				description: "Mniejsze ryzyko z kalendarza = mniej losowej volatility w samej ropie.",
				state: macroCalmGrowth(er),
			},
			{
				label: "Techniczny ton wspiera kontynuację",
				description: "Risk-on jako proxy płynności i apetytu na ryzyko — często koreluje z tight supply narrative.",
				state: techGrowthForIndex(tech),
			},
			{
				label: "Globalny apetyt na ryzyko",
				description: "Proxy „breadth”: risk-on w świecie nagłówków często wspiera cyclical commodities.",
				state: worldGrowthForIndex(dp),
			},
		];
	}

	if (ac === "fx_major") {
		return [
			{
				label: "Utrzymanie strony po ostatnich ustawieniach",
				description: "Czy para trzyma kierunek z lekcji, zamiast zacierać impuls.",
				state: zoneGrowthState(pz),
			},
			{
				label: "Makro bez skrajnego ryzyka w oknie",
				description: "Mniejsze ryzyko publikacji = mniej fałszywych wybicia na parze.",
				state: macroCalmGrowth(er),
			},
			{
				label: "Mapa techniczna nie jest w konflikcie z risk-on",
				description: "Krótki ton risk-on ułatwia kontynuację w trendowych układach FX.",
				state: techGrowthForIndex(tech),
			},
			{
				label: "Globalny przepływ nie jest jednoznacznie przeciwny",
				description: "Mieszany ton = brak twardych danych o dominacji strony.",
				state: worldGrowthForIndex(dp),
			},
		];
	}

	// us_index, eu_index, single_stock, other
	return [
		{
			label: "Utrzymanie górnej struktury / wybicia",
			description: "Sesyjne trzymanie silniejszej strefy zamiast cofania całego impulsu.",
			state: zoneGrowthState(pz),
		},
		{
			label: "Spokojniejsze okno makro (mniej „high”)",
			description: "Niższe ryzyko z kalendarza = mniejsza szansa na jednorazowe szarpnięcie rentowności.",
			state: macroCalmGrowth(er),
		},
		{
			label: "Technika w tonie risk-on",
			description: "Proxy momentum/struktury z mapy — wspiera kontynuację po stronie popytu.",
			state: techGrowthForIndex(tech),
		},
		{
			label: "Globalny ton risk-on (proxy breadth)",
			description: "Z ważonych nagłówków — nie zastępuje prawdziwego breadth, ale orientuje w krótkim oknie.",
			state: worldGrowthForIndex(dp),
		},
	];
}

export function buildWeaknessConditionRows(block: DecisionBlockV1): DecisionConditionRow[] {
	const pz = block.engineTrace.priceZone;
	const er = block.engineTrace.eventRisk;
	const tech = block.engineTrace.techAlignment;
	const dp = block.worldContext.directionalPressure;
	const ac = block.assetClass;

	if (ac === "gold") {
		return [
			{
				label: "Brak utrzymania po impulsie (słabsza strefa)",
				description: "Szybkie oddanie wybicia sugeruje, że popyt nie utrzymuje inicjatywy.",
				state: zoneWeaknessState(pz),
			},
			{
				label: "Skrajne ryzyko makro w oknie",
				description: "„High” z kalendarza = większa szansa na gwałtowne przełożenie na stopy i USD.",
				state: macroStressWeak(er),
			},
			{
				label: "Silny risk-on na akcjach bez korekty złota",
				description: "Proxy: gdy akcje jedzą ryzyko, złoto bywa przycinane przy stabilnym dolarze.",
				state: techWeakForGold(tech),
			},
			{
				label: "Risk-on w nagłówkach (presja na metale)",
				description: "Gdy świat jest jednoznacznie risk-on, złoto często traci priorytet ulotki.",
				state: worldWeakForGold(dp),
			},
		];
	}

	if (ac === "oil") {
		return [
			{
				label: "Brak utrzymania poziomu po nagłówku",
				description: "Pełne cofnięcie impulsu = narracja podażowa wraca do gry.",
				state: zoneWeaknessState(pz),
			},
			{
				label: "Wysokie ryzyko makro w oknie",
				description: "Większa volatility, która potrafi zabija follow-through w ropie.",
				state: macroStressWeak(er),
			},
			{
				label: "Technika w tonie risk-off",
				description: "Słabsza płynność i obrona przy odbiciach — często koreluje z lękiem popytowym.",
				state: techWeakForIndex(tech),
			},
			{
				label: "Risk-off w świecie nagłówków",
				description: "Proxy popytu na cyclicals — przy risk-off popyt na ropę bywa bardziej selektywny.",
				state: worldWeakForIndex(dp),
			},
		];
	}

	if (ac === "fx_major") {
		return [
			{
				label: "Brak utrzymania kierunku po próbach impulsu",
				description: "Para zaciera ruch — brak wiarygodności breakoutu.",
				state: zoneWeaknessState(pz),
			},
			{
				label: "Publikacje o wysokim ryzyku",
				description: "Większa szansa na fałsze i szerokie świece bez kontynuacji.",
				state: macroStressWeak(er),
			},
			{
				label: "Techniczny risk-off",
				description: "Defensywna mapa utrudnia kontynuację po stronie „agresywnego” kierunku.",
				state: techWeakForIndex(tech),
			},
			{
				label: "Jednoznaczny risk-off globalnie",
				description: "USD jako schronisko potrafi zdominować parę niezależnie od lokalnego newsa.",
				state: worldWeakForIndex(dp),
			},
		];
	}

	return [
		{
			label: "Brak utrzymania wybicia / presja w dolnej strukturze",
			description: "Jeśli rynek nie broni góry, scenariusz wzrostowy słabnie.",
			state: zoneWeaknessState(pz),
		},
		{
			label: "Napięcie makro (wyższa zmienność po danych)",
			description: "„High” z kalendarza = większe ryzyko szarpnięć w rentownościach i indeksie.",
			state: macroStressWeak(er),
		},
		{
			label: "Technika w tonie risk-off",
			description: "Defensywna mapa i podaż na odbiciach.",
			state: techWeakForIndex(tech),
		},
		{
			label: "Risk-off w nagłówkach (presja na growth)",
			description: "Proxy nastroju — przy risk-off indeksy growth często tracą relatywnie.",
			state: worldWeakForIndex(dp),
		},
	];
}

export function shouldShowNoEdgeBlock(
	block: DecisionBlockV1,
	growth: DecisionConditionRow[],
	weakness: DecisionConditionRow[]
): boolean {
	if (block.selectedScenarioKey === "B") return true;
	const metG = growth.filter((r) => r.state === "met").length;
	const metW = weakness.filter((r) => r.state === "met").length;
	if (metG >= 2 || metW >= 2) return false;
	if (block.worldContext.directionalPressure !== "mixed") return false;
	return metG < 2 && metW < 2;
}

export function buildOperationalChecklist24h(block: DecisionBlockV1): string[] {
	const pz = block.engineTrace.priceZone;
	const er = block.engineTrace.eventRisk;
	const dp = block.worldContext.directionalPressure;
	const fr = block.worldContext.freshness;

	const follow =
		pz === "upper"
			? "Następna sesja: czy jest follow-through zamiast jednorazowego wybicia (zamknięcia utrzymują górę struktury)."
			: pz === "lower"
				? "Następna sesja: czy pojawia się popyt po testach dołu bez natychmiastowego zawracania — bez tego presja zostaje przy sprzedających."
				: "Następna sesja: po której stronie zakresu zamyka się impet i czy nie ma fałszej ekspansji przed kolejnym makro.";

	const yields =
		er === "high"
			? "Rentowności / obligacje: po danych sprawdź, czy ruch się utrwala, czy to tylko jedno szarpnięcie bez drugiej fali."
			: "Rentowności: czy ruch stóp w oczekiwaniach potwierdza ton sesji (risk-on vs ulotka), bez kontradykcji z Twoim scenariuszem na aktywo.";

	const breadth =
		dp === "risk_on"
			? "Breadth / ton: czy risk-on z kontekstu świata widać w akceptacji wzrostu, czy to wąska, selektywna gra."
			: dp === "risk_off"
				? "Breadth / ton: czy risk-off rozlewa się szerzej, czy to tylko nagłówek bez kontynuacji w indeksie."
				: "Ton globalny jest mieszany — zobacz, który driver (makro vs geopolityka) dominuje w kolejnych godzinach.";

	const news =
		fr === "hot" || fr === "recent"
			? "News: czy driver wygasa, czy przychodzi druga fala nagłówków i potwierdzeń."
			: "News: okno jest płasksze — większą wagę mają poziomy i zachowanie po ostatniej fazie impulsu.";

	return [follow, yields, breadth, news];
}

export function buildModuleQuickLines(block: DecisionBlockV1): {
	scenarios: string;
	calendar: string;
	technical: string;
	checklists: string;
} {
	const scenarios = humanizeMarketLanguage(firstSentenceOrTrim(buildBaseScenarioLine(block), 220));

	const top = block.macro.topEventsForImpact[0] ?? block.macro.events[0];
	let calendar: string;
	if (!top && block.macro.eventRisk === "low") {
		calendar =
			"W najbliższym oknie brak krytycznego makro — większe znaczenie ma reakcja ceny i utrwalenie impetu po kolejnej sesji.";
	} else if (top) {
		const t = top.time ? `${top.title.trim()} (${top.time})` : top.title.trim();
		calendar = `Najbliższy punkt: ${t} — zaplanuj reakcję przed i po publikacji, zamiast gonić pierwszą świecę.`;
	} else {
		calendar = "Kalendarz wymaga uwagi — sprawdź konkretny tytuł i czas przed sesją; bez tego łatwo o przypadkowy szum.";
	}

	let technical: string;
	if (block.engineTrace.techAlignment === "risk_on_hint") {
		technical =
			"Mapa jest w tonie risk-on, ale krótki horyzont wymaga potwierdzenia zachowaniem — jedna świeca nie zastępuje struktury.";
	} else if (block.engineTrace.techAlignment === "risk_off_hint") {
		technical =
			"Mapa jest defensywna — odbicia wymagają weryfikacji, czy to nie tylko techniczna korekta w większej presji.";
	} else {
		technical =
			"Technika jest neutralna względem horyzontu — kluczowe jest, czy następne ustawienia dają konfluencję, a nie konflikt z makro.";
	}

	let checklists: string;
	if (block.selectedScenarioKey === "A") {
		checklists =
			"Warunki wejścia są częściowo po stronie kontynuacji — dopatrz się utrwalenia zamiast chase na pierwszym impulsie.";
	} else if (block.selectedScenarioKey === "C") {
		checklists =
			"Warunki są defensywne — lista powinna karać pośpiech po danych i wymagać drugiej fali, zanim uznasz kierunek za pewny.";
	} else {
		checklists =
			"Warunki są rozłączone — checklista służy do odczekania rozstrzygnięcia struktury, a nie do wymuszania strony.";
	}

	return { scenarios, calendar, technical, checklists };
}

export function buildScenarioNarrativePack(block: DecisionBlockV1): {
	base: { title: string; body: string };
	risk: { title: string; body: string };
	alt: { title: string; body: string };
} {
	const pick = (k: "A" | "B" | "C") => block.scenarios.find((s) => s.key === k);
	const safe = (slice: (typeof block.scenarios)[0] | undefined, fallback: string) => {
		const raw = slice?.condition?.trim();
		if (raw && !isLikelyStaleNumericCopy(raw)) return humanizeMarketLanguage(firstSentenceOrTrim(raw, 260));
		return humanizeMarketLanguage(fallback);
	};
	return {
		base: {
			title: "Scenariusz bazowy",
			body: safe(
				pick("A"),
				"Kontynuacja po stronie popytu jest warunkowa — wymaga obrony struktury po cofce."
			),
		},
		risk: {
			title: "Scenariusz ryzyka",
			body: safe(
				pick("C"),
				"Presja spadkowa rośnie, gdy rynek nie utrzymuje ostatnio bronionej strefy i pojawia się podaż na odbiciach."
			),
		},
		alt: {
			title: "Scenariusz alternatywny",
			body: safe(
				pick("B"),
				"Układ pośredni: rynek w zakresie lub w konflikcie sygnałów — sensowniej czekać na rozstrzygnięcie niż naciągać stronę."
			),
		},
	};
}
