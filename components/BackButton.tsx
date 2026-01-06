'use client';

import { useRouter } from 'next/navigation';

type Props = {
	label?: string;
	fallbackHref?: string;
	className?: string;
	variant?: 'link' | 'pill';
};

export default function BackButton({
	label = '← Wróć',
	fallbackHref,
	className = '',
	variant = 'link',
}: Props) {
	const router = useRouter();

	function onClick() {
		try {
			if (typeof window !== 'undefined' && window.history.length > 1) {
				router.back();
			} else if (fallbackHref) {
				router.push(fallbackHref);
			} else {
				router.push('/');
			}
		} catch {
			// router may throw only in extreme cases; fall back to home
			router.push(fallbackHref || '/');
		}
	}

	const baseClass =
		variant === 'pill'
			? 'inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10'
			: 'inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded';

	const cls = [baseClass, className].filter(Boolean).join(' ');

	return (
		<button type="button" onClick={onClick} className={cls} aria-label="Wróć">
			{label}
		</button>
	);
}



