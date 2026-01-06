'use client';
import React, { useEffect, useState } from 'react';
import MediaGrid, { MediaItem } from './MediaGrid';

type Props = {
	open: boolean;
	onClose: () => void;
	onPickCover?: (item: MediaItem) => void;
	onInsertMarkdown?: (item: MediaItem) => void;
};

export default function MediaPickerModal({ open, onClose, onPickCover, onInsertMarkdown }: Props) {
	const [items, setItems] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) return;
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const r = await fetch('/api/redakcja/media?limit=60&archived=0', { cache: 'no-store' });
				const data = await r.json().catch(() => ({ items: [] }));
				if (!mounted) return;
				setItems((data.items || []) as MediaItem[]);
			} finally {
				if (!mounted) return;
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [open]);

	if (!open) return null;
	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center">
			<div className="absolute inset-0 bg-black/60" onClick={onClose} />
			<div className="relative w-[95vw] max-w-5xl max-h-[85vh] overflow-auto rounded-xl border border-white/10 bg-slate-950 p-4">
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-lg font-semibold">Biblioteka mediów</h3>
					<button onClick={onClose} className="rounded-md px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15">
						Zamknij
					</button>
				</div>
				{loading ? <div className="text-white/70 text-sm">Ładowanie…</div> : null}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{items.map((m) => (
						<div key={m.id} className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
							<div className="aspect-video bg-black/30">
								<img src={m.url} alt={m.alt || ''} className="h-full w-full object-cover" />
							</div>
							<div className="p-2 text-xs text-white/80 space-y-1">
								<div className="truncate" title={m.alt || ''}>{m.alt || '—'}</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => onPickCover?.(m)}
										className="rounded bg-white text-slate-900 px-2 py-1"
									>
										Ustaw jako okładkę
									</button>
									<button
										onClick={() => onInsertMarkdown?.(m)}
										className="rounded bg-white/10 hover:bg-white/15 px-2 py-1 border border-white/10"
									>
										Wstaw do treści
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
				{!loading && items.length === 0 ? (
					<div className="text-white/60 text-sm mt-4">Brak mediów — prześlij nowe w Bibliotece.</div>
				) : null}
			</div>
		</div>
	);
}


