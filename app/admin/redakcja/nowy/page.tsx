import { redirect } from "next/navigation";
import AdminArticleForm from "@/components/redakcja/AdminArticleForm";
import { getIsAdmin } from "@/lib/admin";
import BackButton from "@/components/BackButton";

export default async function AdminRedakcjaCreatePage() {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return redirect("/"); // guarded by layout, but extra safety

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Nowy artykuł</h1>
					<p className="text-sm text-white/60">Treści edukacyjne — bez porad inwestycyjnych.</p>
				</div>
				<div className="flex items-center gap-2">
					<BackButton variant="pill" fallbackHref="/admin/redakcja" />
				</div>
			</div>
			<AdminArticleForm mode="create" />
		</div>
	);
}


