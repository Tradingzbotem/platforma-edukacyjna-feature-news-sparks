'use client';
import { useEffect, useState } from "react";
import MediaUploader from "@/components/redakcja/MediaUploader";
import MediaGrid, { MediaItem } from "@/components/redakcja/MediaGrid";
import BackButton from "@/components/BackButton";

export default function AdminMediaPage() {
	const [items, setItems] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [archived, setArchived] = useState<0 | 1>(0);
	const [genTitle, setGenTitle] = useState('');
	const [generating, setGenerating] = useState(false);
	const [genError, setGenError] = useState<string | null>(null);
	const [genResult, setGenResult] = useState<{ url: string; alt: string; persisted: boolean } | null>(null);

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

	async function generateCover() {
		const title = genTitle.trim();
		if (!title) {
			setGenError('Wpisz tytuł, z którego mamy zrobić okładkę.');
			return;
		}

		setGenerating(true);
		setGenError(null);
		setGenResult(null);
		try {
			const r = await fetch('/api/admin/redakcja/generate-cover', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ title }),
			});
			const data = await r.json().catch(() => ({}));
			if (!r.ok || !data?.ok) {
				throw new Error(data?.message || data?.error || 'Nie udało się wygenerować okładki.');
			}
			setGenResult(data.image as { url: string; alt: string; persisted: boolean });
			setGenTitle('');
			// Nowy plik jest aktywny — jeśli ktoś jest w archiwum, przerzuć na aktywne.
			if (archived === 1) setArchived(0);
			else await load();
		} catch (e: any) {
			setGenError(e?.message || 'Nie udało się wygenerować okładki.');
		} finally {
			setGenerating(false);
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

			<div className="rounded-xl border border-white/10 bg-white/5 p-4">
				<div className="text-sm font-medium">Generator okładki (AI)</div>
				<p className="text-sm text-white/60 mt-0.5">
					Wpisz tytuł artykułu, a my wygenerujemy obraz i dodamy go do Biblioteki mediów jako osobny plik.
				</p>
				<div className="mt-3 flex flex-col gap-2 sm:flex-row">
					<input
						value={genTitle}
						onChange={(e) => setGenTitle(e.target.value)}
						placeholder="Np. 'Donald Trump i wpływ na rynki' / 'Zmiana regulacji KNF…'"
						className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
					/>
					<button
						onClick={generateCover}
						disabled={generating}
						className={`rounded-md px-4 py-2 text-sm border ${
							generating
								? 'bg-white/10 border-white/10 text-white/60 cursor-not-allowed'
								: 'bg-white text-slate-900 border-white hover:opacity-90'
						}`}
					>
						{generating ? 'Generuję…' : 'Wygeneruj okładkę'}
					</button>
				</div>
				{genError ? <div className="mt-2 text-sm text-red-300">{genError}</div> : null}
				{genResult ? (
					<div className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-2">
						<div className="w-28">
							<div className="aspect-video overflow-hidden rounded-md bg-black/30 border border-white/10">
								<img src={genResult.url} alt={genResult.alt || ''} className="h-full w-full object-cover" />
							</div>
						</div>
						<div className="min-w-0">
							<div className="text-xs text-white/60">Dodano do biblioteki</div>
							<div className="text-sm text-white/80 truncate" title={genResult.alt || ''}>{genResult.alt || '—'}</div>
						</div>
					</div>
				) : null}
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


