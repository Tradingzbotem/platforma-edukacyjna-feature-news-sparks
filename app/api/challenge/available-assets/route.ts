import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/challenge/available-assets
 * Zwraca listę aktywów, które mają ustawione ceny override (price > 0)
 */
export async function GET() {
  try {
    const assets: string[] = [];

    // 1) DB
    if (isDatabaseConfigured()) {
      try {
        const { rows } = await sql<{ asset: string }>`
          SELECT DISTINCT asset FROM price_overrides WHERE price > 0 ORDER BY asset
        `;
        for (const row of rows) {
          assets.push(row.asset);
        }
      } catch {
        // ignore
      }
    }

    // 2) ENV variables (OVERRIDE_*_PRICE)
    if (typeof process.env !== 'undefined') {
      for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith('OVERRIDE_') && key.endsWith('_PRICE')) {
          const asset = key.replace('OVERRIDE_', '').replace('_PRICE', '');
          const price = Number(value);
          if (Number.isFinite(price) && price > 0 && !assets.includes(asset)) {
            assets.push(asset);
          }
        }
      }
    }

    // 3) In-memory fallback
    const g = globalThis as any;
    if (g.__PRICE_OVERRIDES__) {
      for (const [asset, data] of Object.entries(g.__PRICE_OVERRIDES__)) {
        const priceData = data as { price: number; updated_at: string };
        if (priceData && Number.isFinite(priceData.price) && priceData.price > 0) {
          if (!assets.includes(asset)) {
            assets.push(asset);
          }
        }
      }
    }

    return NextResponse.json({ assets: assets.sort() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('Available assets error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
