/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Markdown from '@/components/redakcja/Markdown';
import { slugify } from '@/lib/redakcja/admin';
import MediaPickerModal from '@/components/redakcja/MediaPickerModal';
import { injectCoverMeta, extractCoverFromContent, listImagesFromContent, removeImageByUrl } from '@/lib/redakcja/content-utils';

export type AdminArticleFormValues = {
	id?: string;
	title: string;
	slug: string;
	content: string;
	readingTime?: number | string | null;
	tags?: string;
};

type Props = {
	initial?: Partial<AdminArticleFormValues>;
	mode: 'create' | 'edit';
	onSaved?: (id: string) => void;
};

export default function AdminArticleForm({ initial, mode, onSaved }: Props) {
	const router = useRouter();
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [values, setValues] = useState<AdminArticleFormValues>({
		title: initial?.title || '',
		slug: initial?.slug || '',
		content: initial?.content || '',
		readingTime: (initial?.readingTime as any) ?? '',
		tags: Array.isArray((initial as any)?.tags) ? (initial as any)?.tags?.join(', ') : (initial as any)?.tags || '',
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

	// Derive cover and content-for-preview (hide cover meta and first-image-as-cover)
	const derived = useMemo(() => extractCoverFromContent(values.content || ''), [values.content]);
	const imagesInContent = useMemo(() => listImagesFromContent(values.content || ''), [values.content]);

	function handleRemoveImage(url: string) {
		const res = removeImageByUrl(values.content || '', url);
		if (res.removed) {
			update('content', res.content as any);
			setNotice('Usunięto obraz z treści.');
			setTimeout(() => setNotice(null), 2000);
		}
	}

	function update<K extends keyof AdminArticleFormValues>(key: K, value: AdminArticleFormValues[K]) {
		setValues((v) => ({ ...v, [key]: value }));
	}

	// ───────── Markdown toolbar helpers ─────────
	function insertAroundSelection(prefix: string, suffix?: string) {
		const ta = textareaRef.current;
		if (!ta) {
			update('content', (values.content || '') + `${prefix}${suffix ?? ''}` as any);
			return;
		}
		const start = ta.selectionStart ?? 0;
		const end = ta.selectionEnd ?? 0;
		const before = (values.content || '').slice(0, start);
		const selected = (values.content || '').slice(start, end);
		const after = (values.content || '').slice(end);
		const post = `${before}${prefix}${selected}${suffix ?? ''}${after}`;
		update('content', post as any);
		// Restore focus for smoother editing
		requestAnimationFrame(() => {
			try {
				ta.focus();
				const caret = start + prefix.length + selected.length + (suffix ? suffix.length : 0);
				ta.setSelectionRange(caret, caret);
			} catch {}
		});
	}

	function addLinePrefix(prefix: string) {
		const ta = textareaRef.current;
		if (!ta) {
			update('content', `${prefix}${values.content || ''}` as any);
			return;
		}
		const start = ta.selectionStart ?? 0;
		const end = ta.selectionEnd ?? 0;
		const text = values.content || '';
		const lineStart = text.lastIndexOf('\n', start - 1) + 1;
		const lineEnd = text.indexOf('\n', end);
		const sliceEnd = lineEnd === -1 ? text.length : lineEnd;
		const selection = text.slice(lineStart, sliceEnd);
		const updatedSelection = selection
			.split('\n')
			.map((l) => (l.trim().length ? `${prefix}${l.replace(/^\s+/, '')}` : l))
			.join('\n');
		const post = text.slice(0, lineStart) + updatedSelection + text.slice(sliceEnd);
		update('content', post as any);
		requestAnimationFrame(() => {
			try {
				ta.focus();
				ta.setSelectionRange(lineStart, lineStart + updatedSelection.length);
			} catch {}
		});
	}

	function onBold() { insertAroundSelection('**', '**'); }
	function onItalic() { insertAroundSelection('_', '_'); }
	function onInlineCode() { insertAroundSelection('`', '`'); }
	function onCodeBlock() { insertAroundSelection('\n```\n', '\n```\n'); }
	function onH1() { addLinePrefix('# '); }
	function onH2() { addLinePrefix('## '); }
	function onH3() { addLinePrefix('### '); }
	function onH4() { addLinePrefix('#### '); }
	function onH5() { addLinePrefix('##### '); }
	function onH6() { addLinePrefix('###### '); }
	function onUl() { addLinePrefix('- '); }
	function onOl() { addLinePrefix('1. '); }
	function onQuote() { addLinePrefix('> '); }
	function onStrike() { insertAroundSelection('~~', '~~'); }
	function onTask() { addLinePrefix('- [ ] '); }
	function onHr() { insertAroundSelection('\n\n---\n\n'); }
	function onTable() {
		const template = '\n\n| Kolumna 1 | Kolumna 2 |\n| --- | --- |\n|  |  |\n\n';
		insertAroundSelection(template);
	}
	function onLink() {
		const ta = textareaRef.current;
		const selected = ta && (values.content || '').slice(ta.selectionStart ?? 0, ta.selectionEnd ?? 0);
		if (selected && selected.trim().length) {
			insertAroundSelection('[', `](https://)`);
		} else {
			insertAroundSelection('[tekst](https://)');
		}
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
				readingTime:
					typeof values.readingTime === 'string'
						? (values.readingTime.trim() === '' ? null : Number(values.readingTime))
						: (values.readingTime ?? null),
			};
			if (!payload.slug) payload.slug = slugify(payload.title || '');
			// strip unsupported fields just in case
			delete payload.seoTitle;
			delete payload.seoDescription;
			delete payload.coverImageUrl;
			delete payload.coverImageAlt;
			delete payload.excerpt;
			delete payload.status;
			let res = await fetch(apiUrl, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			let data = await res.json().catch(() => ({}));

			// Client-side fallback: if legacy/old article returns 404 on PATCH by id,
			// try creating a new article (POST) with the same payload.
			if (!res.ok && res.status === 404 && mode === 'edit') {
				try {
					res = await fetch('/api/redakcja/articles', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload),
					});
					data = await res.json().catch(() => ({}));
					if (res.ok) {
						setNotice('Utworzono nową wersję artykułu (migracja starszego wpisu).');
					}
				} catch {}
			}

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
				// Zapis w fallbacku — bezpiecznie wróć do listy, która obsługuje fallback.
				setNotice('Artykuł zapisany pomyślnie. Przekierowuję…');
				try { setTimeout(() => router.replace('/admin/redakcja?saved=1'), 50); } catch {}
				return;
			}
			if (onSaved) {
				onSaved(saved.id);
			} else {
				// Po zapisie pokaż krótką informację i wróć do listy artykułów z flagą powodzenia
				setNotice('Artykuł zapisany pomyślnie. Przekierowuję…');
				try { setTimeout(() => router.replace('/admin/redakcja?saved=1'), 50); } catch {}
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
					const next = injectCoverMeta(values.content || '', { url: m.url, alt: m.alt || '' });
					update('content', next as any);
					setNotice('Ustawiono miniaturę artykułu.');
					setTimeout(() => setNotice(null), 2500);
					setPickerOpen(false);
				}}
				onInsertMarkdown={(m) => {
					const snippet = `\n\n![${m.alt || ''}](${m.url})\n\n`;
					update('content', (values.content || '') + snippet as any);
					setNotice('Dodano obraz do treści.');
					setTimeout(() => setNotice(null), 2500);
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
					<div className="hidden">
						<label className="block text-sm text-zinc-400">Slug</label>
						<input
							value={values.slug}
							onChange={(e) => update('slug', e.target.value)}
							placeholder="auto-z-tytułu"
							className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
						/>
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
				</div>
				<div className="space-y-3">
					<div>
						<label className="block text-sm text-zinc-400">Treść (Markdown)</label>
						<div className="mt-1 mb-2 flex flex-wrap items-center gap-2">
							<button type="button" onClick={onBold} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15 font-semibold" aria-label="Pogrubienie (Ctrl+B)">B</button>
							<button type="button" onClick={onItalic} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15 italic" aria-label="Kursywa (Ctrl+I)">I</button>
							<div className="mx-1 h-5 w-px bg-white/10" />
							<button type="button" onClick={onH1} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Nagłówek H1">H1</button>
							<button type="button" onClick={onH2} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Nagłówek H2">H2</button>
							<button type="button" onClick={onH3} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Nagłówek H3">H3</button>
							<button type="button" onClick={onH4} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Nagłówek H4">H4</button>
							<button type="button" onClick={onH5} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Nagłówek H5">H5</button>
							<button type="button" onClick={onH6} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Nagłówek H6">H6</button>
							<div className="mx-1 h-5 w-px bg-white/10" />
							<button type="button" onClick={onUl} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Lista wypunktowana">• Lista</button>
							<button type="button" onClick={onOl} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Lista numerowana">1. Lista</button>
							<button type="button" onClick={onTask} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Lista zadań">☑ Zadania</button>
							<button type="button" onClick={onQuote} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Cytat">“ Cytat</button>
							<div className="mx-1 h-5 w-px bg-white/10" />
							<button type="button" onClick={onInlineCode} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Kod inline">` Kod</button>
							<button type="button" onClick={onCodeBlock} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Blok kodu">``` Blok</button>
							<button type="button" onClick={onStrike} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Przekreślenie">S̶</button>
							<div className="mx-1 h-5 w-px bg-white/10" />
							<button type="button" onClick={onTable} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Tabela">┼ Tabela</button>
							<button type="button" onClick={onHr} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Linia pozioma">— Linia</button>
							<div className="mx-1 h-5 w-px bg-white/10" />
							<button type="button" onClick={onLink} className="rounded-md bg-white/10 border border-white/15 px-2 py-1 text-xs hover:bg-white/15" aria-label="Link">🔗 Link</button>
						</div>
						<textarea
							ref={textareaRef}
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
								<button
									type="button"
									onClick={handleDelete}
									className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm"
									disabled={busy}
								>
									Usuń
								</button>
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
					{/* Hide cover meta/comment in preview */}
					<Markdown content={derived.contentWithoutCover} />
				</div>
			)}
			{/* Attached images overview */}
			<div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
				<h4 className="text-sm text-zinc-400 mb-3">Załączone obrazy w treści</h4>
				{imagesInContent.length === 0 ? (
					<div className="text-sm text-white/60">Brak obrazów w treści.</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
						{imagesInContent.map((img, idx) => (
							<div key={`${img.url}-${idx}`} className="rounded border border-white/10 bg-black/20 overflow-hidden">
								<div className="aspect-video bg-black/30">
									<img src={img.url} alt={img.alt || ''} className="h-full w-full object-cover" />
								</div>
								<div className="p-2 text-xs text-white/80 space-y-1">
									<div className="truncate" title={img.alt || ''}>{img.alt || '—'}</div>
									<div className="flex items-center gap-2">
										{img.isCover ? <div className="inline-block rounded bg-white text-slate-900 px-1.5 py-0.5">Okładka</div> : null}
										<button
											type="button"
											onClick={() => handleRemoveImage(img.url)}
											className="ml-auto rounded bg-red-600/90 hover:bg-red-500 text-white px-2 py-1"
										>
											Usuń
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</form>
	);
}


