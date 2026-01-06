/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Markdown from '@/components/redakcja/Markdown';
import { slugify } from '@/lib/redakcja/admin';
import MediaPickerModal from '@/components/redakcja/MediaPickerModal';

export type AdminArticleFormValues = {
	id?: string;
	title: string;
	slug: string;
	excerpt?: string | null;
	content: string;
	status: 'DRAFT' | 'PUBLISHED';
	coverImageUrl?: string | null;
	coverImageAlt?: string | null;
	readingTime?: number | null;
	tags?: string;
	seoTitle?: string | null;
	seoDescription?: string | null;
};

type Props = {
	initial?: Partial<AdminArticleFormValues>;
	mode: 'create' | 'edit';
	onSaved?: (id: string) => void;
};

export default function AdminArticleForm({ initial, mode, onSaved }: Props) {
	const router = useRouter();
	const [values, setValues] = useState<AdminArticleFormValues>({
		title: initial?.title || '',
		slug: initial?.slug || '',
		excerpt: initial?.excerpt || '',
		content: initial?.content || '',
		status: (initial?.status as any) || 'DRAFT',
		coverImageUrl: initial?.coverImageUrl || '',
		coverImageAlt: initial?.coverImageAlt || '',
		readingTime: (initial?.readingTime as any) ?? '',
		tags: Array.isArray((initial as any)?.tags) ? (initial as any)?.tags?.join(', ') : (initial as any)?.tags || '',
		seoTitle: initial?.seoTitle || '',
		seoDescription: initial?.seoDescription || '',
	});
	const [preview, setPreview] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [pickerOpen, setPickerOpen] = useState(false);

	const apiUrl = useMemo(() => {
		if (mode === 'create') return '/api/redakcja/articles';
		return `/api/redakcja/articles/${initial?.id}`;
	}, [mode, initial?.id]);

	function update<K extends keyof AdminArticleFormValues>(key: K, value: AdminArticleFormValues[K]) {
		setValues((v) => ({ ...v, [key]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setNotice(null);
		setBusy(true);
		try {
			const method = mode === 'create' ? 'POST' : 'PATCH';
			const payload: any = {
				...values,
				readingTime: values.readingTime === '' ? null : Number(values.readingTime),
			};
			if (!payload.slug) payload.slug = slugify(payload.title || '');
			const res = await fetch(apiUrl, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				const message =
					(data as any)?.message ||
					(data as any)?.error ||
					'Request failed';
				const hint = (data as any)?.hint ? ` — ${String((data as any).hint)}` : '';
				throw new Error(`${message}${hint}`);
			}
			const saved = data as any;
			if (saved?._storage === 'file') {
				setNotice('Zapisano lokalnie (brak bazy). Ustaw env DATABASE_URL/POSTGRES_URL aby zapisywać do bazy.');
			}
			if (onSaved) {
				onSaved(saved.id);
			} else {
				if (mode === 'create') {
					router.push(`/admin/redakcja/${saved.id}`);
				} else {
					router.refresh();
				}
			}
		} catch (err: any) {
			setError(err?.message || 'Wystąpił błąd');
		} finally {
			setBusy(false);
		}
	}

	async function publishToggle(action: 'publish' | 'unpublish') {
		if (!initial?.id) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(`/api/redakcja/articles/${initial.id}/${action}`, { method: 'POST' });
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error((data as any)?.error || 'Request failed');
			}
			const saved = await res.json();
			if (onSaved) {
				onSaved(saved.id);
			} else {
				router.refresh();
			}
		} catch (err: any) {
			setError(err?.message || 'Wystąpił błąd');
		} finally {
			setBusy(false);
		}
	}

	async function handleDelete() {
		if (!initial?.id) return;
		if (!confirm('Na pewno usunąć artykuł?')) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(`/api/redakcja/articles/${initial.id}`, { method: 'DELETE' });
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error((data as any)?.error || 'Request failed');
			}
			if (onSaved) {
				onSaved('__deleted__');
			} else {
				router.push('/admin/redakcja');
			}
		} catch (err: any) {
			setError(err?.message || 'Wystąpił błąd');
		} finally {
			setBusy(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<MediaPickerModal
				open={pickerOpen}
				onClose={() => setPickerOpen(false)}
				onPickCover={(m) => {
					update('coverImageUrl', m.url as any);
					update('coverImageAlt', (m.alt || '') as any);
					setPickerOpen(false);
				}}
				onInsertMarkdown={(m) => {
					const snippet = `\n\n![${m.alt || ''}](${m.url})\n\n`;
					update('content', (values.content || '') + snippet as any);
					setPickerOpen(false);
				}}
			/>
			{notice ? <div className="rounded-md border border-yellow-500/40 bg-yellow-950/40 px-3 py-2 text-yellow-100">{notice}</div> : null}
			{error ? <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-red-200">{error}</div> : null}
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-3">
					<div>
						<label className="block text-sm text-zinc-400">Tytuł</label>
						<input
							value={values.title}
							onChange={(e) => update('title', e.target.value)}
							className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
							required
						/>
					</div>
					<div>
						<label className="block text-sm text-zinc-400">Slug</label>
						<input
							value={values.slug}
							onChange={(e) => update('slug', e.target.value)}
							placeholder="auto-z-tytułu"
							className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
						/>
					</div>
					<div>
						<label className="block text-sm text-zinc-400">Excerpt</label>
						<textarea
							value={values.excerpt || ''}
							onChange={(e) => update('excerpt', e.target.value)}
							className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 min-h-[70px]"
						/>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-zinc-400">Okładka URL</label>
							<input
								value={values.coverImageUrl || ''}
								onChange={(e) => update('coverImageUrl', e.target.value)}
								className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
								placeholder="https://…"
							/>
							<button
								type="button"
								onClick={() => setPickerOpen(true)}
								className="mt-2 rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15"
							>
								Biblioteka mediów
							</button>
						</div>
						<div>
							<label className="block text-sm text-zinc-400">Alt</label>
							<input
								value={values.coverImageAlt || ''}
								onChange={(e) => update('coverImageAlt', e.target.value)}
								className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-zinc-400">Tagi (po przecinku)</label>
							<input
								value={values.tags || ''}
								onChange={(e) => update('tags', e.target.value)}
								className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
								placeholder="Makro, Psychologia"
							/>
						</div>
						<div>
							<label className="block text-sm text-zinc-400">Czas czytania (min)</label>
							<input
								type="number"
								min={0}
								value={values.readingTime as any}
								onChange={(e) => update('readingTime', e.target.value as any)}
								className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-zinc-400">SEO Title</label>
							<input
								value={values.seoTitle || ''}
								onChange={(e) => update('seoTitle', e.target.value)}
								className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
							/>
						</div>
						<div>
							<label className="block text-sm text-zinc-400">SEO Description</label>
							<input
								value={values.seoDescription || ''}
								onChange={(e) => update('seoDescription', e.target.value)}
								className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-zinc-400">Status</label>
						<select
							value={values.status}
							onChange={(e) => update('status', e.target.value as any)}
							className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
						>
							<option value="DRAFT">DRAFT</option>
							<option value="PUBLISHED">PUBLISHED</option>
						</select>
					</div>
				</div>
				<div className="space-y-3">
					<div>
						<label className="block text-sm text-zinc-400">Treść (Markdown)</label>
						<textarea
							value={values.content}
							onChange={(e) => update('content', e.target.value)}
							className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 min-h-[260px]"
							required
						/>
						<div className="mt-2 flex items-center gap-2">
							<button
								type="button"
								onClick={() => setPickerOpen(true)}
								className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15"
							>
								Wstaw obrazek z biblioteki
							</button>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<button
							type="button"
							onClick={() => setPreview((v) => !v)}
							className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-sm"
						>
							{preview ? 'Ukryj podgląd' : 'Pokaż podgląd'}
						</button>
						<div className="flex items-center gap-2">
							{mode === 'edit' && (
								<>
									<button
										type="button"
										onClick={() => publishToggle('publish')}
										className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
										disabled={busy}
									>
										Publikuj
									</button>
									<button
										type="button"
										onClick={() => publishToggle('unpublish')}
										className="px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm"
										disabled={busy}
									>
										Cofnij publikację
									</button>
									<button
										type="button"
										onClick={handleDelete}
										className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm"
										disabled={busy}
									>
										Usuń
									</button>
								</>
							)}
							<button
								type="submit"
								className="px-3 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:opacity-90"
								disabled={busy}
							>
								Zapisz
							</button>
						</div>
					</div>
				</div>
			</div>
			{preview && (
				<div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
					<h4 className="text-sm text-zinc-400 mb-2">Podgląd</h4>
					<Markdown content={values.content} />
				</div>
			)}
		</form>
	);
}


