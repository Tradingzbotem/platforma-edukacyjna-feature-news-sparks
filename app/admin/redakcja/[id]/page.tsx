import { notFound, redirect } from "next/navigation";
import AdminArticleForm from "@/components/redakcja/AdminArticleForm";
import { getIsAdmin } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import BackButton from "@/components/BackButton";
import { getFallbackArticleById } from "@/lib/redakcja/fallbackStore";
import { isDatabaseConfigured } from "@/lib/db";
import { ensureArticleTable } from "@/lib/redakcja/ensureDb";
import { sql } from "@vercel/postgres";

type Params = { params: Promise<{ id: string }> };

export default async function AdminRedakcjaEditPage({ params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return redirect("/");
	const { id } = await params;
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


