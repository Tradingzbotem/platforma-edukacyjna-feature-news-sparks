'use server';
import fs from 'fs';
import path from 'path';

export type FallbackMedia = {
	id: string;
	url: string;
	pathname: string | null;
	contentType: string | null;
	size: number | null;
	alt: string | null;
	notes: string | null;
	isArchived: boolean;
	createdAt: string;
	updatedAt: string;
};

const dataDir = path.join(process.cwd(), '.data');
const mediaPath = path.join(dataDir, 'media.json');

async function ensureDataDir() {
	await fs.promises.mkdir(dataDir, { recursive: true });
}

async function readAll(): Promise<FallbackMedia[]> {
	try {
		const exists = await fs.promises
			.access(mediaPath, fs.constants.F_OK)
			.then(() => true)
			.catch(() => false);
		if (!exists) return [];
		const raw = await fs.promises.readFile(mediaPath, 'utf-8');
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as FallbackMedia[]) : [];
	} catch {
		return [];
	}
}

async function writeAll(items: FallbackMedia[]) {
	await ensureDataDir();
	await fs.promises.writeFile(mediaPath, JSON.stringify(items, null, 2), 'utf-8');
}

export async function listFallbackMediaAssets(params?: { isArchived?: boolean; limit?: number }) {
	const items = await readAll();
	let filtered = items;
	if (typeof params?.isArchived === 'boolean') {
		filtered = filtered.filter((m) => m.isArchived === params.isArchived);
	}
	// newest first
	filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	if (params?.limit && params.limit > 0) {
		filtered = filtered.slice(0, params.limit);
	}
	return filtered;
}

export async function createFallbackMediaAsset(input: {
	id: string;
	url: string;
	pathname: string | null;
	contentType: string | null;
	size: number | null;
	alt: string | null;
	notes: string | null;
	isArchived?: boolean;
}) {
	const now = new Date().toISOString();
	const item: FallbackMedia = {
		id: input.id,
		url: input.url,
		pathname: input.pathname,
		contentType: input.contentType ?? null,
		size: input.size ?? null,
		alt: input.alt ?? null,
		notes: input.notes ?? null,
		isArchived: input.isArchived ?? false,
		createdAt: now,
		updatedAt: now,
	};
	const items = await readAll();
	// ensure unique by id
	const existingIndex = items.findIndex((m) => m.id === item.id);
	if (existingIndex >= 0) {
		items.splice(existingIndex, 1);
	}
	items.unshift(item);
	await writeAll(items);
	return item;
}

export async function updateFallbackMediaAsset(
	id: string,
	data: { alt?: string; notes?: string; archived?: boolean; isArchived?: boolean },
) {
	const items = await readAll();
	const idx = items.findIndex((m) => m.id === id);
	if (idx < 0) return null;
	const archived =
		typeof data.archived === 'boolean'
			? data.archived
			: typeof data.isArchived === 'boolean'
			? data.isArchived
			: undefined;
	const next: FallbackMedia = {
		...items[idx],
		...(data.alt !== undefined ? { alt: data.alt } : {}),
		...(data.notes !== undefined ? { notes: data.notes } : {}),
		...(archived !== undefined ? { isArchived: archived } : {}),
		updatedAt: new Date().toISOString(),
	};
	items[idx] = next;
	await writeAll(items);
	return next;
}


