'use client';
import React from 'react';
import Link from 'next/link';
import type { TopStoryArticle } from './TopStoryHero';
import { redakcjaGridCardMetaClass } from './articleCardUi';

function teaser(a: TopStoryArticle): string {
	const ex = a.excerpt?.trim();
	if (ex) return ex;
	const lead = a.leadText?.trim();
	if (lead) return lead;
	return 'Pełna analiza i kontekst rynkowy — w artykule.';
}

export type DaySectionFeaturedTodayProps = {
	article: TopStoryArticle;
	/** solo = jedyny artykuł dnia; pair = komórka obok 2× TopCard (desktop) */
	layout?: 'solo' | 'pair';
};

/** Featured „Dziś”: kompaktowy, max ~340px, mniejszy padding; obraz + treść w jednym rzędzie od sm+. */
export default function DaySectionFeaturedToday({ article }: DaySectionFeaturedTodayProps) {
	const text = teaser(article);
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className={`group relative flex max-h-[340px] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-900/80 shadow-[0_0_32px_-18px_rgba(52,211,153,0.15)] transition-[border-color,background-color,box-shadow] duration-200 hover:border-emerald-400/35 hover:bg-zinc-900/90 sm:flex-row`}
		>
			<div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-full sm:max-h-[340px] sm:w-[44%]">
				{article.coverImageUrl ? (
					<img
						src={article.coverImageUrl}
						alt=""
						className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
						loading="lazy"
					/>
				) : (
					<div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
				)}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/20" />
			</div>
			<div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:py-3 sm:pr-4">
				<span className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-200/95">
					Najważniejsze dziś
				</span>
				<h2 className="text-base font-bold leading-snug tracking-tight text-zinc-50 sm:text-lg group-hover:underline decoration-emerald-500/35 underline-offset-2 line-clamp-3">
					{article.title}
				</h2>
				<div className={redakcjaGridCardMetaClass}>
					<time dateTime={article.date}>{article.date}</time>
					<span className="opacity-40" aria-hidden>
						•
					</span>
					<span>{Math.max(1, article.readingTime)} min czytania</span>
				</div>
				<p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">{text}</p>
				<span className="text-xs font-semibold text-emerald-300/90 group-hover:text-emerald-200">Czytaj →</span>
			</div>
		</Link>
	);
}
