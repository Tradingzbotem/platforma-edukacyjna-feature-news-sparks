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

		// Użyj wyłącznie apiKey — bez nagłówków organization/project, aby uniknąć 401 Project mismatch
		const openai = new OpenAI({ apiKey });

		// Minimalne, tanie zapytanie (1-2 tokeny) z bezpiecznym fallbackiem modelu
		async function tryModel(model: string) {
			return openai.chat.completions.create({
				model,
				messages: [{ role: 'user', content: 'ping' }],
				max_tokens: 1,
				temperature: 0,
			});
		}

		let completion: any = null;
		try {
			completion = await tryModel('gpt-4o-mini');
		} catch {
			// Fallback na szerzej dostępny model
			completion = await tryModel('gpt-4.1-mini');
		}

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


