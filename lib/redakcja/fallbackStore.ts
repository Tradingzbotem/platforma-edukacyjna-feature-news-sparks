'use server';
import fs from 'fs';
import path from 'path';
import { slugify, parseTags, articleInputSchema } from '@/lib/redakcja/admin';

type FallbackArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  readingTime: number | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
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
    excerpt: parsed.excerpt ?? null,
    content: parsed.content,
    status: parsed.status || 'DRAFT',
    publishedAt: parsed.status === 'PUBLISHED' ? now : null,
    coverImageUrl: parsed.coverImageUrl ?? null,
    coverImageAlt: parsed.coverImageAlt ?? null,
    readingTime: parsed.readingTime ?? null,
    tags,
    seoTitle: parsed.seoTitle ?? null,
    seoDescription: parsed.seoDescription ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const items = await readAll();
  items.unshift(item);
  await writeAll(items);
  return item;
}


