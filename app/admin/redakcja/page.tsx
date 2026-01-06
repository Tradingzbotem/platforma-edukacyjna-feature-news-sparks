import Link from "next/link";
import BackButton from "@/components/BackButton";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = {
	searchParams?: Promise<{
		status?: "ALL" | "DRAFT" | "PUBLISHED";
		q?: string;
	}>;
};

export default async function AdminRedakcjaList({ searchParams }: SearchParams) {
	const prisma = getPrisma();
	const sp = (await searchParams) || {};
	const status = (sp.status || "ALL") as "ALL" | "DRAFT" | "PUBLISHED";
	const q = (sp.q || "").trim();

	const where: any = {};
	if (status !== "ALL") where.status = status;
	if (q) {
		where.OR = [
			{ title: { contains: q, mode: "insensitive" } },
			{ slug: { contains: q, mode: "insensitive" } },
		];
	}

	const items = prisma
		? await prisma.article.findMany({
				where,
				orderBy: { updatedAt: "desc" },
		  })
		: [];

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
				<select
					name="status"
					defaultValue={status}
					className="rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
				>
					<option value="ALL">Wszystkie</option>
					<option value="DRAFT">DRAFT</option>
					<option value="PUBLISHED">PUBLISHED</option>
				</select>
				<input
					name="q"
					defaultValue={q}
					placeholder="Szukaj po tytule lub slugu…"
					className="rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 sm:col-span-2"
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
							<th className="px-3 py-2 text-left">Status</th>
							<th className="px-3 py-2 text-left">Publikacja</th>
							<th className="px-3 py-2 text-left">Aktualizacja</th>
							<th className="px-3 py-2 text-right">Akcje</th>
						</tr>
					</thead>
					<tbody>
						{items.map((it) => (
							<tr key={it.id} className="border-t border-white/10">
								<td className="px-3 py-2">{it.title}</td>
								<td className="px-3 py-2">{it.slug}</td>
								<td className="px-3 py-2">{it.status}</td>
								<td className="px-3 py-2">{it.publishedAt ? new Date(it.publishedAt).toLocaleString('pl-PL') : '-'}</td>
								<td className="px-3 py-2">{new Date(it.updatedAt).toLocaleString('pl-PL')}</td>
								<td className="px-3 py-2 text-right">
									<Link href={`/admin/redakcja/${it.id}`} className="rounded-md bg-white/10 border border-white/15 px-3 py-1.5 hover:bg-white/15">Edytuj</Link>
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


