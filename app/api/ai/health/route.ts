// app/api/ai/health/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
	try {
		const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
		const hasKey = !!apiKey;
		if (!hasKey) {
			return NextResponse.json(
				{ ok: false, hasKey: false, reachable: false, error: 'OPENAI_API_KEY missing' },
				{
					headers: {
						'Cache-Control': 'no-store',
					},
				},
			);
		}

		const openai = new OpenAI({ apiKey, organization: process.env.OPENAI_ORG_ID, project: process.env.OPENAI_PROJECT });

		// Minimalne, tanie zapytanie (1-2 tokeny)
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [{ role: 'user', content: 'ping' }],
			max_tokens: 1,
			temperature: 0,
		});

		const reachable = !!completion?.choices?.length;
		return NextResponse.json(
			{ ok: reachable, hasKey: true, reachable },
			{
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	} catch (e: any) {
		return NextResponse.json(
			{ ok: false, hasKey: true, reachable: false, error: String(e?.message || e) },
			{
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	}
}


