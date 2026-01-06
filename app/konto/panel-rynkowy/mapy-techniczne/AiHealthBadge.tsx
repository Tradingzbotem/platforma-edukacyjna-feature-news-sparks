// app/konto/panel-rynkowy/mapy-techniczne/AiHealthBadge.tsx
'use client';

import { useEffect, useState } from 'react';

type Health = { ok: boolean; hasKey: boolean; reachable: boolean };

export default function AiHealthBadge() {
	const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

	async function check() {
		try {
			setStatus('checking');
			const res = await fetch('/api/ai/health', { cache: 'no-store' });
			const json = (await res.json()) as Partial<Health>;
			if (res.ok && json?.ok && json?.hasKey && json?.reachable) {
				setStatus('online');
			} else {
				setStatus('offline');
			}
		} catch {
			setStatus('offline');
		}
	}

	useEffect(() => {
		check();
		// opcjonalnie odświeżenie co kilka minut
		const t = setInterval(check, 5 * 60 * 1000);
		return () => clearInterval(t);
	}, []);

	const cls =
		status === 'online'
			? 'bg-emerald-400'
			: status === 'offline'
			? 'bg-rose-400'
			: 'bg-amber-300 animate-pulse';

	const label = status === 'online' ? 'AI: online' : status === 'offline' ? 'AI: offline' : 'AI: sprawdzanie…';

	return (
		<button
			type="button"
			onClick={check}
			title="Kliknij, aby sprawdzić ponownie"
			className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
		>
			<span className={`h-2 w-2 rounded-full ${cls}`} aria-hidden />
			<span>{label}</span>
		</button>
	);
}


