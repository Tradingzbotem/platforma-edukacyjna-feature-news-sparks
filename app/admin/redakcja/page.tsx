import Link from "next/link";
import BackButton from "@/components/BackButton";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { listFallbackArticles, deleteFallbackArticleById } from "@/lib/redakcja/fallbackStore";
import { sql } from "@vercel/postgres";
import { isDatabaseConfigured } from "@/lib/db";
import { ensureArticleTable } from "@/lib/redakcja/ensureDb";

export const dynamic = "force-dynamic";

type SearchParams = {
	searchParams?: Promise<{
		q?: string;
	}>;
};

export default async function AdminRedakcjaList({ searchParams }: SearchParams) {
	const prisma = getPrisma();
	const sp = (await searchParams) || {};
	const q = (sp.q || "").trim();
	const hasPrisma = !!prisma;

	// ───── Server Action: delete article ─────
	async function deleteArticleAction(formData: FormData) {
		"use server";
		const id = String(formData.get("id") || "");
		if (!id) return;
			const p = getPrisma();
			let slugToRevalidate: string | null = null;
			if (p) {
				try {
					// read slug for precise revalidation
					const before = await p.article.findUnique({ where: { id }, select: { slug: true } });
					slugToRevalidate = before?.slug ?? null;
					await p.article.delete({ where: { id } });
				} catch {}
			} else if (isDatabaseConfigured()) {
				try {
					await ensureArticleTable();
					const sel = await sql<{ slug: string }>`SELECT slug FROM "Article" WHERE id = ${id} LIMIT 1`;
					slugToRevalidate = sel.rows[0]?.slug ?? null;
					await sql`DELETE FROM "Article" WHERE id = ${id}`;
				} catch {}
			} else {
				try { await deleteFallbackArticleById(id); } catch {}
			}
			// Revalidate lists and the specific article detail if known
			revalidatePath("/admin/redakcja");
			revalidatePath("/redakcja");
			if (slugToRevalidate) {
				revalidatePath(`/redakcja/${slugToRevalidate}`);
			}
	}

	const where: any = {};
	if (q) {
		where.OR = [
			{ title: { contains: q, mode: "insensitive" } },
			{ slug: { contains: q, mode: "insensitive" } },
		];
	}

	let items: Array<{
		id: string;
		title: string;
		slug: string;
		updatedAt: Date | string;
	}> = [];

	if (prisma) {
		try {
			items = await prisma.article.findMany({
				where,
				orderBy: { updatedAt: "desc" },
			});
		} catch {
			// fall through to SQL/file
		}
	}
	// If Prisma is not available or failed, try direct SQL (Neon)
	if ((!items || items.length === 0) && isDatabaseConfigured()) {
		try {
			await ensureArticleTable();
			const { rows } = await sql<{
				id: string;
				slug: string;
				title: string;
				updatedAt: Date;
			}>`
        SELECT id, slug, title, "updatedAt"
        FROM "Article"
        ORDER BY "updatedAt" DESC
      `;
			let list = rows as any[];
			if (q) {
				const qq = q.toLowerCase();
				list = list.filter(
					(it) =>
						String(it.title || "").toLowerCase().includes(qq) ||
						String(it.slug || "").toLowerCase().includes(qq),
				);
			}
			items = list as any;
		} catch {
			// fall through to file
		}
	}
	// Final fallback: local file store (dev or DB unavailable)
	if (!items || items.length === 0) {
		const all = await listFallbackArticles();
		// manual filter/sort to mirror prisma/SQL branches
		let filtered = all as any[];
		if (q) {
			const qq = q.toLowerCase();
			filtered = filtered.filter(
				(it) =>
					String(it.title || "").toLowerCase().includes(qq) ||
					String(it.slug || "").toLowerCase().includes(qq),
			);
		}
		items = filtered.sort(
			(a, b) => new Date(b.updatedAt as any).getTime() - new Date(a.updatedAt as any).getTime(),
		) as any;
	}

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Redakcja — artykuły</h1>
					<p className="text-sm text-white/60">Treści edukacyjne — bez porad inwestycyjnych.</p>
				</div>
				<div className="flex items-center gap-2">
					<BackButton variant="pill" fallbackHref="/admin" />
					<Link href="/redakcja" className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15 border border-white/15">Zobacz publicznie</Link>
					<Link href="/admin/redakcja/nowy" className="rounded-lg bg-white text-slate-900 px-3 py-2 text-sm font-semibold hover:opacity-90">Nowy</Link>
				</div>
			</div>

			<form className="mb-4 grid gap-2 sm:grid-cols-3">
				<input
					name="q"
					defaultValue={q}
					placeholder="Szukaj po tytule lub slugu…"
					className="rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 sm:col-span-3"
				/>
				<div className="sm:col-span-3">
					<button className="rounded-md bg-white/10 border border-white/15 px-3 py-2 text-sm hover:bg-white/15">Filtruj</button>
				</div>
			</form>

			<div className="overflow-x-auto rounded-lg border border-white/10">
				<table className="min-w-full text-sm">
					<thead className="bg-white/5 text-white/70">
						<tr>
							<th className="px-3 py-2 text-left">Tytuł</th>
							<th className="px-3 py-2 text-left">Slug</th>
							<th className="px-3 py-2 text-left">Aktualizacja</th>
							<th className="px-3 py-2 text-right">Akcje</th>
						</tr>
					</thead>
					<tbody>
						{items.map((it) => (
							<tr key={it.id} className="border-t border-white/10">
								<td className="px-3 py-2">{it.title}</td>
								<td className="px-3 py-2">{it.slug}</td>
								<td className="px-3 py-2">{new Date(it.updatedAt).toLocaleString('pl-PL')}</td>
								<td className="px-3 py-2 text-right">
									<div className="flex items-center justify-end gap-2">
										<Link
											href={`/redakcja/${it.slug}`}
											target="_blank"
											rel="noopener noreferrer"
											className="rounded-md bg-white/10 border border-white/15 px-3 py-1.5 hover:bg-white/15"
										>
											Podgląd
										</Link>
										<Link href={`/admin/redakcja/${it.id}`} className="rounded-md bg-white/10 border border-white/15 px-3 py-1.5 hover:bg-white/15">Edytuj</Link>
										<form action={deleteArticleAction}>
											<input type="hidden" name="id" value={it.id} />
											<button
												type="submit"
												className="rounded-md bg-red-600 text-white px-3 py-1.5 hover:bg-red-500"
											>
												Usuń
											</button>
										</form>
									</div>
								</td>
							</tr>
						))}
						{items.length === 0 && (
							<tr>
								<td colSpan={6} className="px-3 py-6 text-center text-white/60">Brak wyników</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}


