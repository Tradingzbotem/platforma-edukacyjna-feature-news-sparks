'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export type CategoryKey = 'Wszystkie' | 'Giełda' | 'Forex' | 'Surowce' | 'Spółki' | 'Wiadomości';

const CATEGORIES: CategoryKey[] = ['Wszystkie', 'Giełda', 'Forex', 'Surowce', 'Spółki', 'Wiadomości'];

function buildHref(pathname: string, searchParams: URLSearchParams, category: CategoryKey) {
	const params = new URLSearchParams(searchParams.toString());
	if (category === 'Wszystkie') {
		params.delete('cat');
	} else {
		params.set('cat', category);
	}
	const qs = params.toString();
	return qs ? `${pathname}?${qs}` : pathname;
}

export default function CategoryTabs() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const active = (searchParams.get('cat') as CategoryKey) || 'Wszystkie';

	return (
		<nav aria-label="Kategorie artykułów" className="flex flex-wrap gap-2">
			{CATEGORIES.map((cat) => {
				const isActive = active === cat;
				return (
					<Link
						key={cat}
						href={buildHref(pathname, searchParams, cat)}
						aria-current={isActive ? 'page' : undefined}
						className={[
							'px-3 py-1.5 rounded-full text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60',
							'border',
							isActive
								? 'bg-zinc-800/80 border-zinc-600 text-zinc-100'
								: 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:bg-zinc-900/70',
						].join(' ')}
					>
						{cat}
					</Link>
				);
			})}
		</nav>
	);
}


