// GET /api/decision-block?asset=US100 — Decision Engine v1 (deterministyczny, bez LLM)
import { NextResponse } from 'next/server';
import { buildDecisionBlockV1 } from '@/lib/decision-engine/buildDecisionBlock';
import { parseDecisionHorizonMode } from '@/lib/decision-engine/horizonMode';
import {
	getLatestNewsContextForAsset,
	type RedakcjaNewsPickDebug,
} from '@/lib/redakcja/getLatestNewsContextForAsset';
import type { ScenarioItem } from '@/lib/panel/scenariosABC';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseTf(v: string | null): ScenarioItem['timeframe'] | undefined {
	if (v === 'H1' || v === 'H4' || v === 'D1') return v;
	return undefined;
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const asset = url.searchParams.get('asset') || '';
		const tf = parseTf(url.searchParams.get('timeframe'));
		const calendarDays = Math.min(31, Math.max(7, Number(url.searchParams.get('calendarDays') || '14')));
		const eventListHorizonDays = Math.min(14, Math.max(1, Number(url.searchParams.get('eventDays') || '5')));
		const highRiskHorizonDays = Math.min(7, Math.max(1, Number(url.searchParams.get('highRiskDays') || '2')));
		const decisionHorizonMode = parseDecisionHorizonMode(url.searchParams.get('decisionHorizon'));

		const result = await buildDecisionBlockV1(asset, {
			timeframe: tf,
			calendarDays,
			eventListHorizonDays,
			highRiskHorizonDays,
			decisionHorizonMode,
		});

		if (!result.ok) {
			return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
		}

		const b = result.block;
		let redakcjaNewsContext = null;
		let redakcjaNewsPick: RedakcjaNewsPickDebug | null = null;
		try {
			const pick = await getLatestNewsContextForAsset(b.asset);
			redakcjaNewsContext = pick.context;
			redakcjaNewsPick = pick.pickDebug;
		} catch {
			redakcjaNewsContext = null;
			redakcjaNewsPick = null;
		}

		return NextResponse.json(
			{
				ok: true,
				block: b,
				redakcjaNewsContext,
				debug: {
					sourcesUsed: b.sourcesUsed,
					rulesApplied: b.rulesApplied,
					generatedAt: b.generatedAt,
					engineTrace: b.engineTrace,
					selectedScenarioKey: b.selectedScenarioKey,
					scenarioRuleId: b.scenarioRuleId,
					redakcjaNewsPick,
				},
			},
			{ status: 200, headers: { 'Cache-Control': 'no-store' } }
		);
	} catch (e: any) {
		return NextResponse.json({ ok: false, error: e?.message || 'decision-block error' }, { status: 500 });
	}
}
