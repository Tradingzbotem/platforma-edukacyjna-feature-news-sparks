// lib/decision-engine/macro.ts — okno kalendarza, eventRisk, inferImpact

import { inferImpact } from '@/lib/panel/calendarImpact';
import type { CalendarEvent } from '@/lib/panel/calendar7d';
import {
	loadMacroCalendarRawChain,
	rankMacroCalendarItems,
	type MacroCalendarApiEvent,
} from '@/lib/panel/macroCalendarCore';
import { eventRelevantToAsset } from './assetAliases';
import type { CollectOptions, DecisionInputs, DecisionMacroContext, EventWithImpact } from './types';

export function addDaysIso(iso: string, days: number): string {
	const [y, m, d] = iso.split('-').map(Number);
	const dt = new Date(y, m - 1, d);
	dt.setDate(dt.getDate() + days);
	return dt.toISOString().slice(0, 10);
}

function normalizeRegionForInfer(r?: string): CalendarEvent['region'] {
	const u = String(r || '').toUpperCase();
	if (u === 'US' || u === 'EU' || u === 'UK' || u === 'DE' || u === 'FR') return u;
	return 'US';
}

export function apiEventToCalendarEvent(e: MacroCalendarApiEvent): CalendarEvent {
	return {
		date: e.date,
		time: e.time || '00:00',
		region: normalizeRegionForInfer(e.region),
		event: e.title,
		importance: e.importance || 'low',
		why: '',
		how: '',
	};
}

export function filterEventsByDateRange(
	events: MacroCalendarApiEvent[],
	fromIso: string,
	toIso: string
): MacroCalendarApiEvent[] {
	return events.filter((ev) => ev.date >= fromIso && ev.date <= toIso);
}

/** Wydarzenia od dziś (UTC date) przez `horizonDays` dni w przód. */
export function filterEventsFromToday(events: MacroCalendarApiEvent[], horizonDays: number): MacroCalendarApiEvent[] {
	const today = new Date().toISOString().slice(0, 10);
	const to = addDaysIso(today, horizonDays);
	return filterEventsByDateRange(events, today, to);
}

function sortByImportanceThenDate(events: MacroCalendarApiEvent[]): MacroCalendarApiEvent[] {
	const pri = (x: MacroCalendarApiEvent) => (x.importance === 'high' ? 2 : x.importance === 'medium' ? 1 : 0);
	return events.slice().sort((a, b) => pri(b) - pri(a) || a.date.localeCompare(b.date));
}

/**
 * eventRisk v1:
 * - high: w horyzoncie `highRiskHorizonDays` jest wydarzenie importance high,
 *         którego inferImpact chips dotykają assetu
 * - medium: brak powyższego, ale (wysokie makro ogólne w tym horyzoncie) LUB
 *           (średnie/wysokie istotne dla assetu w szerszym horyzoncie listy)
 * - low: reszta
 */
export function computeEventRiskLevel(
	canonical: string,
	eventsHighHorizon: MacroCalendarApiEvent[],
	eventsListHorizon: MacroCalendarApiEvent[]
): 'low' | 'medium' | 'high' {
	for (const e of eventsHighHorizon) {
		if (e.importance !== 'high') continue;
		const { chips } = inferImpact(apiEventToCalendarEvent(e));
		if (eventRelevantToAsset(canonical, chips)) return 'high';
	}

	for (const e of eventsHighHorizon) {
		if (e.importance === 'high') {
			return 'medium';
		}
	}

	for (const e of eventsListHorizon) {
		if (e.importance !== 'high' && e.importance !== 'medium') continue;
		const { chips } = inferImpact(apiEventToCalendarEvent(e));
		if (eventRelevantToAsset(canonical, chips)) return 'medium';
	}

	return 'low';
}

export function buildTopImpacts(events: MacroCalendarApiEvent[], max = 5): EventWithImpact[] {
	const sorted = sortByImportanceThenDate(events);
	const out: EventWithImpact[] = [];
	for (const event of sorted.slice(0, max)) {
		const { chips, reactionLines } = inferImpact(apiEventToCalendarEvent(event));
		out.push({ event, chips, reactionLines });
	}
	return out;
}

export async function loadCalendarForDecisionEngine(calendarDays: number, rankLimit = 80): Promise<{
	raw: MacroCalendarApiEvent[];
	source: string;
	ranked: MacroCalendarApiEvent[];
}> {
	const { raw, source } = await loadMacroCalendarRawChain(calendarDays);
	const ranked = rankMacroCalendarItems(raw, rankLimit);
	return { raw, source, ranked };
}

export function buildMacroContextFromInputs(
	inputs: DecisionInputs,
	opts: Required<Pick<CollectOptions, 'eventListHorizonDays' | 'highRiskHorizonDays'>>
): DecisionMacroContext {
	const chipSet = new Set<string>();
	const lineSet = new Set<string>();
	for (const ti of inputs.topImpacts) {
		for (const c of ti.chips) chipSet.add(c);
		for (const l of ti.reactionLines) lineSet.add(l);
	}

	return {
		windowDays: opts.eventListHorizonDays,
		highRiskHorizonDays: opts.highRiskHorizonDays,
		events: inputs.eventsInMacroWindow.map((e) => ({
			date: e.date,
			time: e.time,
			title: e.title,
			importance: e.importance,
			region: e.region,
		})),
		eventRisk: inputs.eventRisk,
		impactChips: Array.from(chipSet),
		reactionLines: Array.from(lineSet).slice(0, 8),
		calendarSource: inputs.calendarSource,
		topEventsForImpact: inputs.topImpacts.map((t) => ({
			date: t.event.date,
			time: t.event.time,
			title: t.event.title,
			importance: t.event.importance,
			region: t.event.region,
		})),
	};
}
