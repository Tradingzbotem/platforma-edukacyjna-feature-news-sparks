// lib/decision-engine/eduScenarioCopy.ts — scenariusz bazowy (PL) współdzielony przez silnik i UI

import type { DecisionBlockV1 } from './types';

export function humanizeMarketLanguage(text: string): string {
	if (!text) return text;
	let s = text;
	const reps: Array<{ re: RegExp; to: string }> = [
		{ re: /\brisk-off\b/gi, to: 'presja spadkowa' },
		{ re: /\brisk off\b/gi, to: 'presja spadkowa' },
		{ re: /\brisk-on\b/gi, to: 'presja wzrostowa' },
		{ re: /\brisk on\b/gi, to: 'presja wzrostowa' },
		{ re: /\bhawkish\b/gi, to: 'twardsze komunikaty / wyższe stopy (negatywne dla ryzyka)' },
		{ re: /\bdovish\b/gi, to: 'łagodniejsze komunikaty (łagodniejsze dla ryzyka)' },
	];
	for (const { re, to } of reps) s = s.replace(re, to);
	return s;
}

export function isLikelyStaleNumericCopy(text: string): boolean {
	const t = text.trim();
	if (!t) return true;
	if (/\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?/.test(t)) return true;
	if (/\b\d{4,}\b/.test(t)) return true;
	if (/\d+[.,]\d{2,}\b/.test(t)) return true;
	if (/\d+\s*[–\-]\s*\d/.test(t)) return true;
	return false;
}

/**
 * Bazowy scenariusz — najbardziej prawdopodobny stan (EDU), bez liczb i bez surowego ABC.
 */
export function buildBaseScenarioLine(block: DecisionBlockV1): string {
	const k = block.selectedScenarioKey;
	const er = block.engineTrace.eventRisk;
	const pz = block.engineTrace.priceZone;
	const tech = block.engineTrace.techAlignment;
	const rule = block.scenarioRuleId;

	if (er === 'high') {
		return 'Bazowy scenariusz to ostrożność przed danymi i brak pośpiechu z wejściem — najpierw obserwuj, jak rynek układa impet po publikacjach.';
	}

	if (k === 'B') {
		if (rule === 'RULE_B_UPPER_TECH_CLASH') {
			return 'Bazowy scenariusz to konflikt obrazu: rynek jest w mocniejszej strefie struktury, ale kontekst techniczny jest defensywny — jednego spójnego kierunku jeszcze nie widać.';
		}
		if (rule === 'RULE_B_RANGE_MACRO_DIGEST' || rule === 'RULE_B_RANGE_TRUE_NEUTRAL') {
			return 'Bazowy scenariusz to rynek boczny w zakresie, dopóki nie pojawi się wyraźne rozstrzygnięcie — sensowniej czekać na zachowanie niż wymuszać narrację.';
		}
		if (rule === 'RULE_B_MID_RISK_ON_MEDIUM_MACRO') {
			return 'Bazowy scenariusz to pozytywniejsze zachowanie ceny wewnątrz pasma, ale okno makro nadal może mieszać obraz — ostrożność do momentu wyjaśnienia publikacji.';
		}
		if (rule === 'RULE_B_LOWER_RECOVERY_WATCH') {
			return 'Bazowy scenariusz to obserwacja próby odbicia ze słabszej strefy — dopóki popyt nie pokaże trwałości, to faza weryfikacji, a nie gotowy kierunek.';
		}
		if (rule === 'RULE_B_LOWER_NEUTRAL') {
			return 'Bazowy scenariusz to niżej w strukturze bez twardego sygnału kontynuacji spadków — rynek potrzebuje potwierdzenia zachowaniem, nie jednym impulsem.';
		}
		if (rule === 'RULE_B_UNKNOWN_CALM') {
			return 'Bazowy scenariusz to spokojniejsze tło, ale w ćwiczeniu brakuje pełnego porównania ceny z poziomami — pracuj na strukturze i reakcjach, nie na udawanej precyzji miejsca na osi.';
		}
		return 'Bazowy scenariusz to faza pośrednia: brak jednoznacznego ekstremum; rozstrzygnięcie ma przyjść z kolejnych ustawień i reakcji na informacje.';
	}

	if (k === 'A') {
		if (pz === 'upper' && tech === 'risk_on_hint') {
			return 'Bazowy scenariusz to kontynuacja wzrostu dopiero po potwierdzeniu, że kupujący utrzymują inicjatywę i rynek nie oddaje świeżego impetu od razu.';
		}
		if (pz === 'upper' && tech === 'neutral') {
			return 'Bazowy scenariusz to przewaga kupujących w układzie strukturalnym, ale bez agresywnego potwierdzenia z mapy — wzrost jako hipoteza wymaga obrony zachowaniem ceny.';
		}
		if (pz === 'mid' && tech === 'risk_on_hint') {
			return 'Bazowy scenariusz to próba kontynuacji wewnątrz szerszego zakresu — ma sens, dopóki dynamika kupna utrzymuje się po mini-wybiciach, zamiast ginąć w szybkich cofkach.';
		}
		return 'Bazowy scenariusz to warunkowa presja wzrostowa z lekcji: narracja kontynuacji żyje tylko tak długo, jak zachowanie ceny jej nie obala.';
	}

	if (er === 'medium') {
		return 'Bazowy scenariusz to układ defensywny: makro wymaga uwagi, a technika nie sprzyja lekkiej interpretacji — priorytetem jest ostrożność, nie pełna pewność kierunku.';
	}
	if (pz === 'lower' && tech === 'risk_off_hint') {
		return 'Bazowy scenariusz to presja w strukturze ze słabszej strefy i z defensywnym tonem techniki — dopóki kupujący nie odzyskają inicjatywy, baza robocza zostaje po stronie słabości.';
	}
	if (pz === 'mid' && tech === 'risk_off_hint') {
		return 'Bazowy scenariusz to presja wewnątrz pasma: rynek w zakresie, ale kontekst techniczny sugeruje ostrożność — łatwo o pozorny spokój przed kolejnym impulsem.';
	}
	return 'Bazowy scenariusz to ostrożny układ z lekcji: większa waga na ryzyku odwrócenia lub wyższej zmienności, dopóki zachowanie ceny nie pokaże stabilizacji.';
}

export function firstSentenceOrTrim(text: string, maxLen: number): string {
	const t = text.trim();
	const m = t.match(/^(.+?[.!?])(\s|$)/);
	const one = m ? m[1].trim() : t;
	if (one.length <= maxLen) return one;
	return `${one.slice(0, maxLen - 1).trim()}…`;
}
