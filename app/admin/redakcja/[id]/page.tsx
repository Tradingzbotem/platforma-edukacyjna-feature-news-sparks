import { notFound, redirect } from "next/navigation";
import AdminArticleForm from "@/components/redakcja/AdminArticleForm";
import { getIsAdmin } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import BackButton from "@/components/BackButton";

type Params = { params: { id: string } };

export default async function AdminRedakcjaEditPage({ params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return redirect("/");
	const prisma = getPrisma();
	if (!prisma) return notFound();
	const item = await prisma.article.findUnique({ where: { id: params.id } });
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
					excerpt: item.excerpt ?? '',
					content: item.content,
					status: item.status,
					coverImageUrl: item.coverImageUrl ?? '',
					coverImageAlt: item.coverImageAlt ?? '',
					readingTime: item.readingTime ?? null,
					tags: (item.tags || []).join(', '),
					seoTitle: item.seoTitle ?? '',
					seoDescription: item.seoDescription ?? '',
				}}
			/>
		</div>
	);
}


