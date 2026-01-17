'use client';
import React, { useState } from 'react';

export type MediaItem = {
	id: string;
	url: string;
	alt: string | null;
	notes?: string | null;
	isArchived?: boolean;
	createdAt: string | Date;
	mimeType?: string | null;
	size?: number | null;
};

export default function MediaGrid({ items, onChanged }: { items: MediaItem[]; onChanged?: () => void }) {
	const [busyId, setBusyId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [altValue, setAltValue] = useState('');
	const [notesValue, setNotesValue] = useState('');
	const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

	async function copyUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
		} catch {}
	}

	async function saveAlt(id: string) {
		setBusyId(id);
		try {
			const r = await fetch(`/api/redakcja/media/${id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ alt: altValue }),
			});
			if (!r.ok) throw new Error();
			onChanged?.();
			setEditingId(null);
		} catch {
			// ignore
		} finally {
			setBusyId(null);
		}
	}

	async function toggleArchive(id: string, archive: boolean) {
		setBusyId(id);
		try {
			const r = await fetch(`/api/redakcja/media/${id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ archived: archive }),
			});
			if (!r.ok) throw new Error();
			onChanged?.();
		} catch {
		} finally {
			setBusyId(null);
		}
	}

	async function deleteMedia(id: string) {
		const confirmDelete = window.confirm('Usunąć to zdjęcie na stałe? Tej operacji nie można cofnąć.');
		if (!confirmDelete) return;
		setBusyId(id);
		try {
			const r = await fetch(`/api/redakcja/media/${id}`, { method: 'DELETE' });
			if (!r.ok) throw new Error();
			onChanged?.();
		} catch {
		} finally {
			setBusyId(null);
		}
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
			{items.map((m) => (
				<div key={m.id} className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
					<div className="aspect-video bg-black/30 flex items-center justify-center relative">
						{failedImages.has(m.id) ? (
							<div className="flex flex-col items-center justify-center text-white/40 text-xs p-4 text-center">
								<svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<div>Nie można załadować obrazu</div>
							</div>
						) : (
							<img 
								src={m.url} 
								alt={m.alt || ''} 
								className="h-full w-full object-cover" 
								onError={() => setFailedImages(prev => new Set(prev).add(m.id))}
								loading="lazy"
							/>
						)}
					</div>
					<div className="p-2 text-xs text-white/80 space-y-1">
						<div className="truncate" title={m.url}>{m.url}</div>
						<div className="text-white/60">{new Date(m.createdAt as any).toLocaleString('pl-PL')}</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => copyUrl(m.url)}
								className="rounded bg-white/10 hover:bg-white/15 px-2 py-1 border border-white/10"
							>
								Kopiuj URL
							</button>
							<button
								onClick={() => {
									setEditingId(m.id);
									setAltValue(m.alt || '');
									setNotesValue(m.notes || '');
								}}
								className="rounded bg-white/10 hover:bg-white/15 px-2 py-1 border border-white/10"
							>
								Edytuj alt
							</button>
							{m.isArchived ? (
								<button
									onClick={() => toggleArchive(m.id, false)}
									disabled={busyId === m.id}
									className="rounded bg-emerald-600 hover:bg-emerald-500 px-2 py-1 text-white"
								>
									Przywróć
								</button>
							) : (
								<button
									onClick={() => toggleArchive(m.id, true)}
									disabled={busyId === m.id}
									className="rounded bg-yellow-600 hover:bg-yellow-500 px-2 py-1 text-white"
								>
									Archiwizuj
								</button>
							)}
							<button
								onClick={() => deleteMedia(m.id)}
								disabled={busyId === m.id}
								className="rounded bg-red-600 hover:bg-red-500 px-2 py-1 text-white"
							>
								Usuń
							</button>
						</div>
						{editingId === m.id && (
							<div className="mt-2 flex items-center gap-2">
								<input
									value={altValue}
									onChange={(e) => setAltValue(e.target.value)}
									className="w-full rounded bg-white/5 border border-white/10 px-2 py-1"
									placeholder="Alt"
								/>
								<input
									value={notesValue}
									onChange={(e) => setNotesValue(e.target.value)}
									className="w-full rounded bg-white/5 border border-white/10 px-2 py-1"
									placeholder="Notatki"
								/>
								<button
									onClick={async () => {
										setBusyId(m.id);
										try {
											const r = await fetch(`/api/redakcja/media/${m.id}`, {
												method: 'PATCH',
												headers: { 'content-type': 'application/json' },
												body: JSON.stringify({ alt: altValue, notes: notesValue }),
											});
											if (!r.ok) throw new Error();
											onChanged?.();
											setEditingId(null);
										} catch {
										} finally {
											setBusyId(null);
										}
									}}
									disabled={busyId === m.id}
									className="rounded bg-white text-slate-900 px-2 py-1"
								>
									Zapisz
								</button>
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}


