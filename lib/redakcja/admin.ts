import { z } from 'zod';

export function slugify(input: string): string {
	const s = (input || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-+/g, '-');
	return s || '';
}

export function parseTags(input: string | string[] | null | undefined): string[] {
	if (Array.isArray(input)) return input.map((t) => String(t).trim()).filter(Boolean);
	if (!input) return [];
	return String(input)
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);
}

export const articleInputSchema = z.object({
	title: z.string().min(1),
	slug: z.string().min(1),
	content: z.string().min(1),
	readingTime: z.coerce.number().int().min(0).optional().nullable(),
	tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;


