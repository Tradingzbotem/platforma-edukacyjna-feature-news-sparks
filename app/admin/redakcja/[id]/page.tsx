import { notFound, redirect } from "next/navigation";
import AdminArticleForm from "@/components/redakcja/AdminArticleForm";
import { getIsAdmin } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import BackButton from "@/components/BackButton";
import { getFallbackArticleById } from "@/lib/redakcja/fallbackStore";
import { isDatabaseConfigured } from "@/lib/db";
import { ensureArticleTable } from "@/lib/redakcja/ensureDb";
import { sql } from "@vercel/postgres";

type Params = { 
	params: Promise<{ id: string }>;
	searchParams?: Promise<{ generated?: string; tmpImage?: string }>;
};

export default async function AdminRedakcjaEditPage({ params, searchParams }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return redirect("/");
	const { id } = await params;
	const sp = await searchParams;
	const generated = sp?.generated === '1';
	const tmpImage = sp?.tmpImage === '1';
	const prisma = getPrisma();
	let item: any = null;
	if (prisma) {
		item = await prisma.article.findUnique({ where: { id } });
	}
	// Try direct SQL if DB configured but Prisma didn't find it
	if (!item && isDatabaseConfigured()) {
		try {
			await ensureArticleTable();
			const sel = await sql<{
				id: string;
				title: string;
				slug: string;
				content: string;
				readingTime: number | null;
				tags: string[];
			}>`SELECT id, title, slug, content, "readingTime", tags FROM "Article" WHERE id = ${id} LIMIT 1`;
			item = sel.rows[0] ?? null;
		} catch {
			// ignore, fall through to file store
		}
	}
	if (!item) {
		// fallback: read from file store
		item = await getFallbackArticleById(id);
	}
	if (!item) return notFound();

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Edycja artykułu</h1>
					<p className="text-sm text-white/60">Treści edukacyjne — bez porad inwestycyjnych.</p>
				</div>
				<div className="flex items-center gap-2">
					<BackButton variant="pill" fallbackHref="/admin/redakcja" />
				</div>
			</div>
			{generated && (
				<div className="mb-4 rounded-md border border-green-500/30 bg-green-950/30 px-3 py-2 text-green-100">
					Artykuł został wygenerowany pomyślnie! Możesz go teraz edytować.
				</div>
			)}
			{tmpImage && (
				<div className="mb-4 rounded-md border border-yellow-500/40 bg-yellow-950/40 px-3 py-2 text-yellow-100">
					Uwaga: obraz jest tymczasowy i nie został zapisany w bibliotece mediów. Rozważ dodanie własnego zdjęcia.
				</div>
			)}
			<AdminArticleForm
				mode="edit"
				initial={{
					id: item.id,
					title: item.title,
					slug: item.slug,
					content: item.content,
					readingTime: item.readingTime ?? null,
					tags: (item.tags || []).join(', '),
				}}
			/>
		</div>
	);
}


