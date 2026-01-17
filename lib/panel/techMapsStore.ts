// lib/panel/techMapsStore.ts
import { sql } from '@vercel/postgres';
import { TECH_MAPS, type TechMapItem } from './techMaps';
import { enforceCanonicalLevels } from './techLevels';
import { isDatabaseConfigured } from '@/lib/db';

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS tech_maps (
  id TEXT PRIMARY KEY,
  asset TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

function inferValidFor(tf: TechMapItem['timeframe']): '1d' | '1w' | '1m' {
  if (tf === 'M30' || tf === 'H1') return '1d';
  if (tf === 'H4' || tf === 'D1') return '1w';
  return '1m'; // W1, MN
}

export async function ensureTechMapsTable() {
  if (!isDatabaseConfigured()) return;
  try {
    await sql`
CREATE TABLE IF NOT EXISTS tech_maps (
  id TEXT PRIMARY KEY,
  asset TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
  } catch {
    // DB unreachable/misconfigured — allow caller to fallback to static maps
    return;
  }
}

export async function upsertTechMaps(items: TechMapItem[]) {
  if (!isDatabaseConfigured()) return;
  try {
    await ensureTechMapsTable();
  } catch {
    return;
  }
  const rows = items.map((m) => ({
    ...m,
    validFor: m.validFor ?? inferValidFor(m.timeframe),
  }));
  try {
    for (const m of rows) {
      await sql`
        INSERT INTO tech_maps (id, asset, timeframe, data, updated_at)
        VALUES (${m.id}, ${m.asset}, ${m.timeframe}, ${JSON.stringify(m)}, NOW())
        ON CONFLICT (id) DO UPDATE
        SET asset = EXCLUDED.asset,
            timeframe = EXCLUDED.timeframe,
            data = EXCLUDED.data,
            updated_at = NOW();
      `;
    }
  } catch {
    // ignore writes when DB is not reachable
  }
}

export async function getTechMaps(): Promise<TechMapItem[]> {
  // Merge DB overrides with static TECH_MAPS
  const base = TECH_MAPS.map((m) => ({
    ...m,
    validFor: m.validFor ?? inferValidFor(m.timeframe),
  }));

  if (!isDatabaseConfigured()) return enforceCanonicalLevels(base);
  try {
    await ensureTechMapsTable();
    const { rows } = await sql<{ data: any }>`SELECT data FROM tech_maps`;
    if (!rows?.length) return enforceCanonicalLevels(base);

    const byId = new Map<string, TechMapItem>();
    base.forEach((m) => byId.set(m.id, m));
    for (const r of rows) {
      const m = r.data as TechMapItem;
      byId.set(m.id, m);
    }
    return enforceCanonicalLevels(Array.from(byId.values()));
  } catch {
    // Fallback entirely to static maps when DB fetch fails
    return enforceCanonicalLevels(base);
  }
}

export async function refreshTechMapsFromStatic() {
  // Placeholder refresh: persists static maps with fresh updatedAt and inferred validFor
  const now = new Date().toISOString();
  const refreshed = TECH_MAPS.map((m) => ({
    ...m,
    updatedAt: now,
    validFor: m.validFor ?? inferValidFor(m.timeframe),
  }));
  await upsertTechMaps(refreshed);
  return refreshed.length;
}


