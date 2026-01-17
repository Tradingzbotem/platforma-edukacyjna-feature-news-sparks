// app/api/panel/tech-maps/assets/route.ts
import { NextResponse } from 'next/server';
import { TECH_MAPS } from '@/lib/panel/techMaps';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const assets = Array.from(new Set(TECH_MAPS.map((m) => m.asset))).sort();
		return NextResponse.json({ assets });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
	}
}


