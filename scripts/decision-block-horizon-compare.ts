/**
 * Porównanie primary takeaway: aktywo × horyzont (uruchom z katalogu projektu):
 *   npx --yes tsx scripts/decision-block-horizon-compare.ts
 */
import { buildDecisionBlockV1 } from '../lib/decision-engine/buildDecisionBlock';
import type { DecisionHorizonMode } from '../lib/decision-engine/types';
import { horizonToApiParams } from '../app/client/decision-center/decisionHorizon';

type Row = { asset: string; horizon: DecisionHorizonMode; label: string };

const ROWS: Row[] = [
	{ asset: 'US100', horizon: 'session_end', label: 'US100 · do końca sesji' },
	{ asset: 'US100', horizon: 'full_week', label: 'US100 · cały tydzień' },
	{ asset: 'DE40', horizon: 'session_end', label: 'DE40 · do końca sesji' },
	{ asset: 'DE40', horizon: 'full_week', label: 'DE40 · cały tydzień' },
	{ asset: 'WTI', horizon: 'session_end', label: 'WTI · do końca sesji' },
	{ asset: 'WTI', horizon: 'full_week', label: 'WTI · cały tydzień' },
	{ asset: 'XAUUSD', horizon: 'one_two_days', label: 'XAU · 1–2 dni' },
	{ asset: 'XAUUSD', horizon: 'macro_event', label: 'XAU · pod wydarzenie makro' },
];

async function main() {
	console.log('Decision Block — porównanie primaryTakeaway (FXEDULAB)\n');
	for (const row of ROWS) {
		const p = horizonToApiParams(row.horizon);
		const r = await buildDecisionBlockV1(row.asset, {
			timeframe: p.timeframe,
			calendarDays: p.calendarDays,
			eventListHorizonDays: p.eventDays,
			highRiskHorizonDays: p.highRiskDays,
			decisionHorizonMode: p.decisionHorizon,
		});
		if (!r.ok) {
			console.log(`\n--- ${row.label} ---\nBŁĄD: ${r.error}\n`);
			continue;
		}
		const { primaryTakeaway, assetClass, decisionHorizonMode } = r.block;
		console.log(`\n--- ${row.label} ---`);
		console.log(`assetClass=${assetClass} horizon=${decisionHorizonMode}`);
		console.log(primaryTakeaway);
	}
	console.log('\n');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
