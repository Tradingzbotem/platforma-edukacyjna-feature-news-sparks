// Pure utility helpers for working with editorial article content.
// These functions are isomorphic (safe in both server and client).

export type CoverInfo = { url?: string; alt?: string | null };

const COVER_META_RE = /<!--\s*cover\s*:\s*(\{[\s\S]*?\})\s*-->/i;
const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/;
const MARKDOWN_IMAGE_RE_GLOBAL = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;

export function injectCoverMeta(content: string, cover: CoverInfo): string {
	const clean = removeCoverMeta(content);
	const json = JSON.stringify({ url: cover.url, alt: cover.alt ?? null });
	return `<!-- cover: ${json} -->\n\n${clean.trimStart()}`;
}

export function removeCoverMeta(content: string): string {
	return content.replace(COVER_META_RE, '').trimStart();
}

export function extractCoverFromContent(content: string): {
	cover: CoverInfo;
	contentWithoutCover: string;
} {
	// 1) Prefer explicit HTML comment meta
	const metaMatch = content.match(COVER_META_RE);
	if (metaMatch) {
		try {
			const raw = metaMatch[1];
			const parsed = JSON.parse(raw || '{}') as { url?: string; alt?: string | null };
			return {
				cover: { url: parsed?.url, alt: parsed?.alt ?? null },
				contentWithoutCover: removeCoverMeta(content),
			};
		} catch {
			// fall through to image parsing
		}
	}
	// 2) Fallback: first markdown image anywhere in content
	const imgMatch = content.match(MARKDOWN_IMAGE_RE);
	if (imgMatch) {
		const alt = (imgMatch[1] || '').trim();
		const url = (imgMatch[2] || '').trim();
		// remove only the first occurrence to avoid stripping other images
		const idx = imgMatch.index ?? -1;
		let without = content;
		if (idx >= 0) {
			without = content.slice(0, idx) + content.slice(idx + imgMatch[0].length);
		}
		return {
			cover: { url, alt },
			contentWithoutCover: without.trimStart(),
		};
	}
	// 3) No cover detected
	return { cover: { url: undefined, alt: null }, contentWithoutCover: content };
}

export function listImagesFromContent(content: string): Array<{ url: string; alt: string; isCover?: boolean }> {
	const images: Array<{ url: string; alt: string; isCover?: boolean }> = [];
	// From meta
	const metaMatch = content.match(COVER_META_RE);
	if (metaMatch) {
		try {
			const raw = metaMatch[1];
			const parsed = JSON.parse(raw || '{}') as { url?: string; alt?: string | null };
			if (parsed?.url) {
				images.push({ url: parsed.url, alt: (parsed.alt || '') as string, isCover: true });
			}
		} catch {
			// ignore meta parse errors
		}
	}
	// From markdown body
	const seen = new Set(images.map((i) => i.url));
	let m: RegExpExecArray | null;
	while ((m = MARKDOWN_IMAGE_RE_GLOBAL.exec(content)) !== null) {
		const alt = (m[1] || '').trim();
		const url = (m[2] || '').trim();
		if (!url || seen.has(url)) continue;
		seen.add(url);
		images.push({ url, alt });
	}
	return images;
}

/**
 * Removes one occurrence of an image from markdown content by URL.
 * - If the URL matches cover meta, the meta is removed.
 * - Otherwise, removes the first markdown image with that URL.
 */
export function removeImageByUrl(content: string, url: string): { content: string; removed: boolean } {
	let changed = false;
	// Remove cover meta if matches
	const metaMatch = content.match(COVER_META_RE);
	if (metaMatch) {
		try {
			const raw = metaMatch[1];
			const parsed = JSON.parse(raw || '{}') as { url?: string };
			if (parsed?.url && parsed.url === url) {
				content = removeCoverMeta(content);
				changed = true;
			}
		} catch {
			// ignore parse errors
		}
	}
	// Remove first markdown image occurrence with the URL
	let m: RegExpExecArray | null;
	MARKDOWN_IMAGE_RE_GLOBAL.lastIndex = 0;
	while ((m = MARKDOWN_IMAGE_RE_GLOBAL.exec(content)) !== null) {
		const u = (m[2] || '').trim();
		if (u === url) {
			const idx = m.index ?? -1;
			if (idx >= 0) {
				content = content.slice(0, idx) + content.slice(idx + m[0].length);
				changed = true;
			}
			break;
		}
	}
	return { content, removed: changed };
}


