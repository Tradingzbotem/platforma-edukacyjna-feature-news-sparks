'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type NewsRow = { id: string; title: string; source: string; publishedAt: string };

/**
 * Przycisk „Wygeneruj artykuł (AI)” + kompaktowy popover (dropdown) wyrównany do przycisku.
 */
function GenerateArticleButtonInner() {
	const searchParams = useSearchParams();
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<'news' | 'topic'>('topic');
	const [loading, setLoading] = useState(false);
	const [loadingNews, setLoadingNews] = useState(false);
	const [newsRows, setNewsRows] = useState<NewsRow[]>([]);
	const [selectedNewsId, setSelectedNewsId] = useState('');
	const [topicTitle, setTopicTitle] = useState('');
	const [manualHints, setManualHints] = useState('');
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const rootRef = useRef<HTMLDivElement>(null);

	const loadNews = useCallback(async () => {
		setLoadingNews(true);
		setError(null);
		try {
			const r = await fetch('/api/admin/news?enriched=1&limit=100', { cache: 'no-store' });
			const data = await r.json();
			if (!data.ok) throw new Error(data.error || 'Nie udało się pobrać newsów');
			setNewsRows(Array.isArray(data.items) ? data.items : []);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Błąd listy newsów';
			setError(msg);
		} finally {
			setLoadingNews(false);
		}
	}, []);

	useEffect(() => {
		if (open && mode === 'news' && newsRows.length === 0 && !loadingNews) {
			void loadNews();
		}
	}, [open, mode, newsRows.length, loadingNews, loadNews]);

	/** Quick Actions z `/admin` — `?ai=1` lub `?generate=1` otwiera generator. */
	useEffect(() => {
		const v = searchParams.get('ai') || searchParams.get('generate');
		if (v === '1' || v === 'true') setOpen(true);
	}, [searchParams]);

	useEffect(() => {
		if (!open) return;
		function onDocMouseDown(e: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') setOpen(false);
		}
		document.addEventListener('mousedown', onDocMouseDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocMouseDown);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	async function handleGenerate() {
		setLoading(true);
		setError(null);

		try {
			let body: Record<string, unknown>;
			if (mode === 'news') {
				if (!selectedNewsId.trim()) {
					throw new Error('Wybierz wzbogacony news z listy.');
				}
				body = { newsId: selectedNewsId.trim() };
			} else {
				const title = topicTitle.trim();
				if (!title) {
					throw new Error('Wpisz temat artykułu.');
				}
				body = {
					sourceType: 'manual_topic',
					title,
					...(manualHints.trim() ? { manualHints: manualHints.trim() } : {}),
				};
			}

			const res = await fetch('/api/admin/redakcja/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			let data: unknown;
			const contentType = res.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				try {
					data = await res.json();
				} catch {
					throw new Error('Nieprawidłowa odpowiedź JSON z serwera');
				}
			} else {
				const text = await res.text();
				throw new Error(text || 'Nieoczekiwany format odpowiedzi');
			}

			const d = data as { ok?: boolean; error?: string; message?: string; article?: { id?: string }; imagePersisted?: boolean };
			if (!res.ok || !d?.ok) {
				const msg =
					(typeof d?.message === 'string' && d.message) ||
					(typeof d?.error === 'string' && d.error) ||
					`HTTP ${res.status}`;
				throw new Error(msg);
			}

			setOpen(false);
			if (d.article?.id) {
				const tmp = d.imagePersisted === false ? '&tmpImage=1' : '';
				router.push(`/admin/redakcja/${d.article.id}?generated=1${tmp}`);
			} else {
				router.refresh();
			}
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Wystąpił błąd podczas generowania artykułu');
		} finally {
			setLoading(false);
		}
	}

	const canSubmit =
		mode === 'news' ? !!selectedNewsId.trim() && !loadingNews : !!topicTitle.trim();

	return (
		<div ref={rootRef} className="relative inline-flex shrink-0">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				aria-haspopup="dialog"
				className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
			>
				<svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
				</svg>
				Wygeneruj artykuł (AI)
				<svg
					className={`h-3.5 w-3.5 shrink-0 opacity-80 transition-transform ${open ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{open && (
				<div
					role="dialog"
					aria-label="Generator artykułu"
					className="absolute right-0 top-[calc(100%+0.375rem)] z-[80] w-[min(420px,calc(100vw-1.5rem))] min-w-[min(360px,calc(100vw-1.5rem))] rounded-lg border border-white/12 bg-slate-900 shadow-xl shadow-black/40 ring-1 ring-black/20"
				>
					<div className="border-b border-white/10 px-3 py-2">
						<p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Generator artykułu</p>
					</div>

					<div className="space-y-3 p-3">
						<div className="flex rounded-md bg-white/[0.06] p-0.5" role="tablist" aria-label="Tryb generowania">
							<button
								type="button"
								role="tab"
								aria-selected={mode === 'topic'}
								onClick={() => setMode('topic')}
								className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
									mode === 'topic'
										? 'bg-white/12 text-white shadow-sm'
										: 'text-white/55 hover:text-white/80'
								}`}
							>
								Z tematu
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={mode === 'news'}
								onClick={() => setMode('news')}
								className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
									mode === 'news'
										? 'bg-white/12 text-white shadow-sm'
										: 'text-white/55 hover:text-white/80'
								}`}
							>
								Z newsa
							</button>
						</div>

						{mode === 'news' ? (
							<div className="space-y-1.5">
								<label className="block text-[11px] text-white/45">News (wzbogacony)</label>
								{loadingNews ? (
									<div className="py-2 text-xs text-white/40">Ładowanie…</div>
								) : (
									<select
										value={selectedNewsId}
										onChange={(e) => setSelectedNewsId(e.target.value)}
										className="w-full rounded-md border border-white/10 bg-slate-950/80 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
									>
										<option value="">— wybierz —</option>
										{newsRows.map((n) => (
											<option key={n.id} value={n.id}>
												{n.title.slice(0, 72)}
												{n.title.length > 72 ? '…' : ''} · {n.source}
											</option>
										))}
									</select>
								)}
								<button
									type="button"
									onClick={() => void loadNews()}
									disabled={loadingNews}
									className="text-[11px] text-violet-300/90 hover:text-violet-200 disabled:opacity-40"
								>
									Odśwież listę
								</button>
							</div>
						) : (
							<div className="space-y-2">
								<div>
									<label className="mb-1 block text-[11px] text-white/45">Temat</label>
									<input
										value={topicTitle}
										onChange={(e) => setTopicTitle(e.target.value)}
										placeholder="np. FOMC a rentowności 10Y"
										className="w-full rounded-md border border-white/10 bg-slate-950/80 px-2 py-1.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
									/>
								</div>
								<div>
									<label className="mb-1 block text-[11px] text-white/45">Wskazówki (opcjonalnie)</label>
									<textarea
										value={manualHints}
										onChange={(e) => setManualHints(e.target.value)}
										placeholder="Krótko: akcent, czego unikać…"
										rows={2}
										className="w-full resize-none rounded-md border border-white/10 bg-slate-950/80 px-2 py-1.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
									/>
								</div>
							</div>
						)}

						{error && (
							<div className="rounded border border-rose-500/25 bg-rose-950/30 px-2 py-1.5 text-[11px] text-rose-100/90">
								{error}
							</div>
						)}

						<button
							type="button"
							onClick={() => void handleGenerate()}
							disabled={loading || !canSubmit}
							className="flex w-full items-center justify-center gap-2 rounded-md border border-violet-500/35 bg-violet-600/90 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-45"
						>
							{loading ? (
								<>
									<svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Generowanie…
								</>
							) : (
								'Generuj artykuł'
							)}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default function GenerateArticleButton() {
	return (
		<Suspense
			fallback={
				<button
					type="button"
					disabled
					className="inline-flex shrink-0 cursor-wait items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600/45 to-blue-600/45 px-4 py-2 text-sm font-semibold text-white/65"
				>
					Wygeneruj artykuł (AI)
				</button>
			}
		>
			<GenerateArticleButtonInner />
		</Suspense>
	);
}
