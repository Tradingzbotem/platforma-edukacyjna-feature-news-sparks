'use server';
import fs from 'fs';
import path from 'path';
import { slugify, parseTags, articleInputSchema } from '@/lib/redakcja/admin';

type FallbackArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  readingTime: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const dataDir = path.join(process.cwd(), '.data');
const articlesPath = path.join(dataDir, 'articles.json');

async function ensureDataDir() {
  await fs.promises.mkdir(dataDir, { recursive: true });
}

async function readAll(): Promise<FallbackArticle[]> {
  try {
    const exists = await fs.promises
      .access(articlesPath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    if (!exists) return [];
    const raw = await fs.promises.readFile(articlesPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FallbackArticle[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(items: FallbackArticle[]) {
  await ensureDataDir();
  await fs.promises.writeFile(articlesPath, JSON.stringify(items, null, 2), 'utf-8');
}

export async function listFallbackArticles(): Promise<FallbackArticle[]> {
  return await readAll();
}

export async function createFallbackArticle(input: unknown): Promise<FallbackArticle> {
  const parsed = articleInputSchema.parse({
    ...input,
    slug: (input as any)?.slug ? String((input as any).slug) : slugify(String((input as any)?.title || '')),
  });
  const tags = parseTags(parsed.tags);
  const now = new Date().toISOString();
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? (crypto as any).randomUUID()
    : `a_${Date.now().toString(36)}`;
  const item: FallbackArticle = {
    id,
    title: parsed.title,
    slug: parsed.slug,
    content: parsed.content,
    readingTime: parsed.readingTime ?? null,
    tags,
    createdAt: now,
    updatedAt: now,
  };
  const items = await readAll();
  items.unshift(item);
  await writeAll(items);
  return item;
}

export async function getFallbackArticleBySlug(slug: string): Promise<FallbackArticle | null> {
  const items = await readAll();
  const found = items.find((a) => a.slug === slug);
  return found ?? null;
}

export async function getFallbackArticleById(id: string): Promise<FallbackArticle | null> {
  const items = await readAll();
  const found = items.find((a) => a.id === id);
  return found ?? null;
}

export async function deleteFallbackArticleById(id: string): Promise<boolean> {
  const items = await readAll();
  const next = items.filter((a) => a.id !== id);
  if (next.length === items.length) return false;
  await writeAll(next);
  return true;
}

export async function updateFallbackArticleById(
  id: string,
  updates: Partial<Pick<FallbackArticle, 'title' | 'slug' | 'content' | 'readingTime' | 'tags'>>,
): Promise<FallbackArticle | null> {
  const items = await readAll();
  const idx = items.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const current = items[idx];
  const next: FallbackArticle = {
    ...current,
    title: updates.title !== undefined ? updates.title : current.title,
    slug: updates.slug !== undefined ? updates.slug : current.slug,
    content: updates.content !== undefined ? updates.content : current.content,
    readingTime: updates.readingTime !== undefined ? (updates.readingTime as any) : current.readingTime,
    tags: updates.tags !== undefined ? (updates.tags as any) : current.tags,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  await writeAll(items);
  return next;
}


