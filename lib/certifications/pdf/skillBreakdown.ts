export type SkillBreakdownRow = {
  label: string;
  percent: number;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Normalizuje skillBreakdownJson z bazy do listy wierszy do PDF.
 */
export function parseSkillBreakdownJson(json: unknown): SkillBreakdownRow[] | null {
  if (json == null) return null;

  if (Array.isArray(json)) {
    const rows: SkillBreakdownRow[] = [];
    for (const item of json) {
      if (!isPlainObject(item)) continue;
      const label = String(item.label ?? item.name ?? item.skill ?? item.category ?? '').trim();
      const raw = item.percent ?? item.score ?? item.value ?? item.pct;
      const p = typeof raw === 'number' ? raw : Number(raw);
      if (!label || !Number.isFinite(p)) continue;
      rows.push({ label, percent: Math.max(0, Math.min(100, Math.round(p))) });
    }
    return rows.length ? rows : null;
  }

  if (isPlainObject(json)) {
    const rows: SkillBreakdownRow[] = [];
    for (const [k, v] of Object.entries(json)) {
      const p = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(p)) continue;
      rows.push({ label: k, percent: Math.max(0, Math.min(100, Math.round(p))) });
    }
    rows.sort((a, b) => a.label.localeCompare(b.label, 'en'));
    return rows.length ? rows : null;
  }

  return null;
}
