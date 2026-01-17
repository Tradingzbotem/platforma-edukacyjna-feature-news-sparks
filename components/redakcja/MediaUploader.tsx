'use client';
import React, { useCallback, useRef, useState } from 'react';

export default function MediaUploader({ onUploaded }: { onUploaded?: () => void }) {
	const [dragOver, setDragOver] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const fileRef = useRef<HTMLInputElement | null>(null);
	const altRef = useRef<HTMLInputElement | null>(null);
	const notesRef = useRef<HTMLInputElement | null>(null);

	const handleFiles = useCallback(async (files: FileList | null) => {
		if (!files || files.length === 0) return;
		setBusy(true);
		setError(null);
		setMessage('Przesyłanie…');
		try {
			const file = files[0];
			const alt = altRef.current?.value || '';
			const form = new FormData();
			form.append('file', file);
			form.append('alt', alt);
			if (notesRef.current?.value) form.append('notes', notesRef.current.value);
			const res = await fetch('/api/redakcja/upload', { method: 'POST', body: form });
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error((data as any)?.message || (data as any)?.error || 'Upload failed');
			}
			onUploaded?.();
			if (altRef.current) altRef.current.value = '';
			if (notesRef.current) notesRef.current.value = '';
			if (fileRef.current) fileRef.current.value = '';
			setMessage('Zdjęcie przesłane.');
		} catch (e: any) {
			setError(e?.message || 'Upload failed');
			setMessage(null);
		} finally {
			setBusy(false);
			setDragOver(false);
			setTimeout(() => setMessage(null), 2500);
		}
	}, [onUploaded]);

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setDragOver(false);
				handleFiles(e.dataTransfer.files);
			}}
			className={`rounded-xl border px-4 py-4 ${dragOver ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}
		>
			<div className="flex flex-col sm:flex-row items-center gap-3">
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					onChange={(e) => handleFiles(e.target.files)}
					className="block w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white hover:file:bg-white/15"
				/>
				<input
					ref={altRef}
					type="text"
					placeholder="Alt (opcjonalnie)"
					className="w-full sm:w-64 rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
				/>
				<input
					ref={notesRef}
					type="text"
					placeholder="Notatki (opcjonalnie)"
					className="w-full sm:w-64 rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
				/>
				<button
					onClick={() => handleFiles(fileRef.current?.files || null)}
					disabled={busy}
					className="rounded-md bg-white text-slate-900 px-3 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
				>
					Prześlij
				</button>
			</div>
			<p className="mt-2 text-xs text-white/60">Przeciągnij i upuść plik lub wybierz z dysku. Obsługiwane: image/*</p>
			{busy ? <div className="mt-2 text-xs text-white/70">Przesyłanie pliku…</div> : null}
			{message && !busy ? (
				<div className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">
					{message}
				</div>
			) : null}
			{error ? <div className="mt-2 rounded-md border border-red-500/30 bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</div> : null}
		</div>
	);
}


