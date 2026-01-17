'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GenerateArticleButton() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	async function handleGenerate() {
		setLoading(true);
		setError(null);

		try {
			const res = await fetch('/api/admin/redakcja/generate', {
				method: 'POST',
			});

			const data = await res.json();

			if (!res.ok || !data.ok) {
				throw new Error(data.error || 'Nie udało się wygenerować artykułu');
			}

			// Przekieruj do edycji nowo utworzonego artykułu
			if (data.article?.id) {
				const tmp = data.imagePersisted === false ? '&tmpImage=1' : '';
				router.push(`/admin/redakcja/${data.article.id}?generated=1${tmp}`);
			} else {
				// Fallback: odśwież stronę
				router.refresh();
			}
		} catch (e: any) {
			setError(e?.message || 'Wystąpił błąd podczas generowania artykułu');
			setLoading(false);
		}
	}

	return (
		<div>
			<button
				onClick={handleGenerate}
				disabled={loading}
				className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
			>
				{loading ? (
					<>
						<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Generowanie...
					</>
				) : (
					<>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Wygeneruj artykuł (AI)
					</>
				)}
			</button>
			{error && (
				<div className="mt-2 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-red-200 text-sm">
					{error}
				</div>
			)}
		</div>
	);
}
