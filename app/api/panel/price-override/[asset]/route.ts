// app/api/panel/price-override/[asset]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';
import { getIsAdmin } from '@/lib/admin';

type RouteContext = { params: Promise<{ asset: string }> };

async function ensureTable() {
	if (!isDatabaseConfigured()) return;
	try {
		await sql`
      CREATE TABLE IF NOT EXISTS price_overrides (
        asset TEXT PRIMARY KEY,
        price NUMERIC NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
	} catch {
		// ignore
	}
}

function getMemStore(): Record<string, { price: number; updated_at: string }> {
	const g = globalThis as any;
	if (!g.__PRICE_OVERRIDES__) g.__PRICE_OVERRIDES__ = {};
	return g.__PRICE_OVERRIDES__;
}

export async function GET(_req: Request, context: RouteContext) {
	try {
		const { asset: assetParam } = await context.params;
		const asset = String(assetParam || '').trim().toUpperCase();
		if (!asset) return NextResponse.json({ error: 'asset required' }, { status: 400 });

		// 1) DB
		if (isDatabaseConfigured()) {
			try {
				await ensureTable();
				const { rows } = await sql<{ asset: string; price: string; updated_at: Date }>`
          SELECT asset, price::text, updated_at FROM price_overrides WHERE asset = ${asset} LIMIT 1
        `;
				const r = rows?.[0];
				if (r) {
					return NextResponse.json({
						asset,
						price: Number(r.price),
						updatedAt: new Date(r.updated_at).toISOString(),
						source: 'db',
					}, { headers: { 'Cache-Control': 'no-store' } });
				}
			} catch {
				// ignore and fallback
			}
		}

		// 2) ENV (e.g., OVERRIDE_XAGUSD_PRICE)
		const envKey = `OVERRIDE_${asset}_PRICE`;
		const envVal = process.env[envKey as any];
		const envNum = envVal != null ? Number(envVal) : NaN;
		if (Number.isFinite(envNum) && envNum > 0) {
			return NextResponse.json({ asset, price: envNum, updatedAt: null, source: 'env' }, { headers: { 'Cache-Control': 'no-store' } });
		}

		// 3) In-memory fallback
		const mem = getMemStore();
		const inMem = mem[asset];
		if (inMem && Number.isFinite(inMem.price) && inMem.price > 0) {
			return NextResponse.json({ asset, price: inMem.price, updatedAt: inMem.updated_at, source: 'mem' }, { headers: { 'Cache-Control': 'no-store' } });
		}

		return NextResponse.json({ asset, price: null, updatedAt: null, source: 'none' }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
	}
}

export async function PUT(req: Request, context: RouteContext) {
	try {
		const isAdmin = await getIsAdmin();
		if (!isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

		const { asset: assetParam } = await context.params;
		const asset = String(assetParam || '').trim().toUpperCase();
		if (!asset) return NextResponse.json({ error: 'asset required' }, { status: 400 });
		const body = (await req.json().catch(() => ({}))) as { price?: number };
		const price = Number((body as any)?.price);
		if (!Number.isFinite(price) || price <= 0) {
			return NextResponse.json({ error: 'invalid price' }, { status: 400 });
		}

		// 1) DB primary
		if (isDatabaseConfigured()) {
			try {
				await ensureTable();
				await sql`
          INSERT INTO price_overrides (asset, price, updated_at)
          VALUES (${asset}, ${price}, NOW())
          ON CONFLICT (asset) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW();
        `;
				return NextResponse.json({ ok: true, asset, price, source: 'db' }, { headers: { 'Cache-Control': 'no-store' } });
			} catch {
				// fallthrough to memory
			}
		}

		// 2) In-memory fallback
		const mem = getMemStore();
		mem[asset] = { price, updated_at: new Date().toISOString() };
		return NextResponse.json({ ok: true, asset, price, source: 'mem' }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
	}
}


