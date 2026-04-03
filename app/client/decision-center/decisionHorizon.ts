/**
 * Horyzont decyzji — warstwa UI + mapowanie na parametry `/api/decision-block`.
 * `decisionHorizon` steruje trybem myślenia silnika (copy, newsy, makro), nie tylko liczbami dni.
 */

import type { DecisionHorizonMode } from "@/lib/decision-engine/types";

export type DecisionHorizonId = DecisionHorizonMode;

export type DecisionHorizonApiParams = {
	/** Id horyzontu — przekazywane do silnika jako jawny tryb generacji. */
	decisionHorizon: DecisionHorizonMode;
	timeframe?: "H1" | "H4" | "D1";
	calendarDays: number;
	eventDays: number;
	highRiskDays: number;
};

export const DECISION_HORIZON_OPTIONS: {
	id: DecisionHorizonId;
	label: string;
	subtitle: string;
}[] = [
	{
		id: "session_end",
		label: "Do końca sesji",
		subtitle: "Węższe okno wydarzeń, interwał bliżej intraday (H1, gdy jest w scenariuszach).",
	},
	{
		id: "one_two_days",
		label: "1–2 dni",
		subtitle: "Balans między bieżącą sesją a najbliższymi publikacjami — domyślna głębokość kalendarza.",
	},
	{
		id: "full_week",
		label: "Cały tydzień",
		subtitle: "Szersze okno makro i interwał operacyjny H4 tam, gdzie jest dostępny w module ABC.",
	},
	{
		id: "macro_event",
		label: "Pod wydarzenie makro",
		subtitle: "Najszersza lista wydarzeń w horyzoncie i perspektywa D1, gdy scenariusz na D1 istnieje.",
	},
];

export function horizonToApiParams(id: DecisionHorizonId): DecisionHorizonApiParams {
	switch (id) {
		case "session_end":
			return {
				decisionHorizon: "session_end",
				timeframe: "H1",
				calendarDays: 10,
				eventDays: 2,
				highRiskDays: 1,
			};
		case "one_two_days":
			return {
				decisionHorizon: "one_two_days",
				calendarDays: 14,
				eventDays: 4,
				highRiskDays: 2,
			};
		case "full_week":
			return {
				decisionHorizon: "full_week",
				timeframe: "H4",
				calendarDays: 21,
				eventDays: 7,
				highRiskDays: 3,
			};
		case "macro_event":
			return {
				decisionHorizon: "macro_event",
				timeframe: "D1",
				calendarDays: 28,
				eventDays: 12,
				highRiskDays: 4,
			};
	}
}

/** Krótka etykieta do nagłówka karty (bez technicznych parametrów). */
export function horizonCardLabel(id: DecisionHorizonId): string {
	const hit = DECISION_HORIZON_OPTIONS.find((o) => o.id === id);
	return hit?.label ?? "1–2 dni";
}
