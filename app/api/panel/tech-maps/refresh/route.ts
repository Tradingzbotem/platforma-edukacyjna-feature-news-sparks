// app/api/panel/tech-maps/refresh/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { TECH_MAPS, type TechMapItem } from '@/lib/panel/techMaps';
import { upsertTechMaps, refreshTechMapsFromStatic } from '@/lib/panel/techMapsStore';

export const dynamic = 'force-dynamic';

type Tf = TechMapItem['timeframe'];
const TF_ORDER: Tf[] = ['M30', 'H1', 'H4', 'D1', 'W1', 'MN'];

function inferValidFor(tf: Tf): '1d' | '1w' | '1m' {
	if (tf === 'M30' || tf === 'H1') return '1d';
	if (tf === 'H4' || tf === 'D1') return '1w';
	return '1m';
}

function systemFor(asset: string, tf: Tf) {
	const tfHints: Record<Tf, string> = {
		M30: 'intraday M30 (krótkie fale, retesty, momentum)',
		H1: 'intraday H1 (ruchy godzinowe, retesty poziomów, momentum)',
		H4: 'swing H4 (struktura, strefy, scenariusze warunkowe)',
		D1: 'swing D1 (kontekst dzienny, ATR, filtry kierunkowe)',
		W1: 'weekly W1 (trend tygodniowy, kluczowe strefy, ryzyka)',
		MN: 'monthly MN (trend wieloletni, szerokie strefy, cykl stóp/inflacji)',
	};
	return [
		'Jesteś asystentem edukacyjnym (EDU) od analizy technicznej.',
		'Zadanie: wygeneruj mapę techniczną dla aktywa, bez rekomendacji, bez sygnałów.',
		`Aktywo: ${asset}. Interwał: ${tfHints[tf]}.`,
		'Zwróć wyłącznie poprawny JSON o strukturze:',
		'{"trend": "...", "keyLevels": ["..."], "indicators": ["..."], "volatility": "...", "scenarioNotes": ["..."]}',
		'- trend: 1–2 zdania dopasowane do TF;',
		'- keyLevels: 4–6 poziomów (numeryczne lub opis stref), uporządkowane;',
		'- indicators: 2–4 proste wskazówki (MA/RSI/MACD/ATR/korelacje), dopasowane do TF;',
		'- volatility: 1 zdanie o ATR/środowisku i eventach;',
		'- scenarioNotes: 2–3 notatki warunkowe „co jeśli…”, bez SL/TP/entry.',
		'Język: polski. EDU — bez sygnałów.',
	].join('\n');
}

async function generateMap(openai: OpenAI, asset: string, tf: Tf) {
	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0.35,
		response_format: { type: 'json_object' },
		messages: [
			{ role: 'system', content: systemFor(asset, tf) },
			{ role: 'user', content: 'Wygeneruj JSON zgodny ze specyfikacją.' },
		],
		max_tokens: 600,
	});
	const content = completion.choices?.[0]?.message?.content ?? '{}';
	let parsed: any = {};
	try {
		parsed = JSON.parse(content);
	} catch {
		parsed = {};
	}
	return {
		trend: String(parsed?.trend || '').trim(),
		keyLevels: Array.isArray(parsed?.keyLevels) ? parsed.keyLevels.map(String).slice(0, 8) : [],
		indicators: Array.isArray(parsed?.indicators) ? parsed.indicators.map(String).slice(0, 6) : [],
		volatility: String(parsed?.volatility || '').trim(),
		scenarioNotes: Array.isArray(parsed?.scenarioNotes) ? parsed.scenarioNotes.map(String).slice(0, 6) : [],
	};
}

export async function GET() {
	try {
		const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
		if (!apiKey) {
			// Fallback: tylko odśwież aktualny timestamp/validFor
			const count = await refreshTechMapsFromStatic();
			return NextResponse.json({ ok: true, refreshed: count, mode: 'static' });
		}

		const openai = new OpenAI({ apiKey, organization: process.env.OPENAI_ORG_ID, project: process.env.OPENAI_PROJECT });

		// Zbierz unikalne aktywa z obecnych map
		const assets = Array.from(new Set(TECH_MAPS.map((m) => m.asset)));

		const now = new Date().toISOString();
		const out: TechMapItem[] = [];

		for (const asset of assets) {
			for (const tf of TF_ORDER) {
				const id = `${asset.toLowerCase()}-${tf.toLowerCase()}`;
				const data = await generateMap(openai, asset, tf);
				const item: TechMapItem = {
					id,
					asset,
					timeframe: tf,
					trend: data.trend || `EDU: kontekst ${tf} dla ${asset}.`,
					keyLevels: (data.keyLevels && data.keyLevels.length ? data.keyLevels : ['—']).slice(0, 6),
					indicators: (data.indicators && data.indicators.length ? data.indicators : ['—']).slice(0, 4),
					volatility: data.volatility || '—',
					scenarioNotes: (data.scenarioNotes && data.scenarioNotes.length ? data.scenarioNotes : ['—']).slice(0, 3),
					updatedAt: now,
					validFor: inferValidFor(tf),
				};
				out.push(item);
			}
		}

		await upsertTechMaps(out);
		return NextResponse.json({ ok: true, refreshed: out.length, mode: 'ai' });
	} catch (e: any) {
		return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
	}
}


