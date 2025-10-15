// app/api/brief/_store.ts
import { promises as fs } from 'fs';
import path from 'path';

export type Sentiment = 'Pozytywny' | 'Neutralny' | 'Negatywny';

export type Brief = {
  id: string;
  ts_iso: string;
  title: string;
  bullets: string[];
  content?: string;
  sentiment: Sentiment;
  metrics?: {
    rsi?: number;
    adx?: number;
    macd?: number;
    volume?: 'Niskie' | 'Średnie' | 'Wysokie';
    dist200?: string;
  };
  opinion?: string;
  type?: 'GEN' | 'DAILY';
};

const DATA_FILE = path.join(process.cwd(), 'data', 'briefs.json');
let BRIEFS: Brief[] | null = null;

async function ensureDir() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

export async function loadFromDiskIfEmpty(): Promise<void> {
  if (BRIEFS && Array.isArray(BRIEFS)) return;
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const arr = JSON.parse(raw) as Brief[];
    BRIEFS = Array.isArray(arr) ? arr : [];
  } catch {
    BRIEFS = [];
  }
}

export async function getBriefs(): Promise<Brief[]> {
  await loadFromDiskIfEmpty();
  return (BRIEFS || []).slice();
}

async function saveToDisk(): Promise<void> {
  await ensureDir();
  const data = JSON.stringify(BRIEFS || [], null, 2);
  await fs.writeFile(DATA_FILE, data, 'utf-8');
}

export async function addBrief(brief: Brief): Promise<void> {
  await loadFromDiskIfEmpty();
  BRIEFS = [brief, ...(BRIEFS || [])].slice(0, 100);
  await saveToDisk();
}


