'use client';
import { useEffect, useState } from "react";
import MediaUploader from "@/components/redakcja/MediaUploader";
import MediaGrid, { MediaItem } from "@/components/redakcja/MediaGrid";
import BackButton from "@/components/BackButton";

export default function AdminMediaPage() {
	const [items, setItems] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [archived, setArchived] = useState<0 | 1>(0);

	async function load() {
		setLoading(true);
		try {
			const r = await fetch(`/api/redakcja/media?limit=60&archived=${archived}`, { cache: "no-store" });
			const data = await r.json().catch(() => ({ items: [] }));
			setItems((data.items || []) as MediaItem[]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, [archived]);

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Biblioteka mediów — Redakcja</h1>
					<p className="text-sm text-white/60">Miejsce na zdjęcia dla działu Redakcja.</p>
				</div>
				<div className="flex items-center gap-2">
					<BackButton variant="pill" fallbackHref="/admin/redakcja" />
				</div>
			</div>

			<MediaUploader onUploaded={load} />

			<div className="mt-6 flex items-center gap-2">
				<button
					onClick={() => setArchived(0)}
					className={`rounded-md px-3 py-1.5 text-sm border ${archived === 0 ? 'bg-white text-slate-900 border-white' : 'bg-white/10 border-white/15 text-white hover:bg-white/15'}`}
				>
					Aktywne
				</button>
				<button
					onClick={() => setArchived(1)}
					className={`rounded-md px-3 py-1.5 text-sm border ${archived === 1 ? 'bg-white text-slate-900 border-white' : 'bg-white/10 border-white/15 text-white hover:bg-white/15'}`}
				>
					Archiwum
				</button>
			</div>

			<div className="mt-6">
				<h2 className="text-lg font-medium mb-2">Twoje pliki</h2>
				{loading ? <div className="text-white/70 text-sm">Ładowanie…</div> : null}
				<MediaGrid items={items} onChanged={load} />
				{!loading && items.length === 0 ? (
					<div className="text-white/60 text-sm mt-4">Brak mediów — prześlij nowe.</div>
				) : null}
			</div>
		</div>
	);
}


