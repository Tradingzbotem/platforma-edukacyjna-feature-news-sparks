'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';

export type TopStoryArticle = ArticleListItem & { leadText?: string };

export type TopStoryHeroProps = {
	article: TopStoryArticle;
};

function teaserCopy(a: TopStoryArticle): string {
	const ex = a.excerpt?.trim();
	if (ex) return ex;
	const lead = a.leadText?.trim();
	if (lead) return lead;
	return 'Pełna analiza, kontekst rynkowy i implikacje — w rozwinięciu artykułu.';
}

export default function TopStoryHero({ article }: TopStoryHeroProps) {
	const teaser = teaserCopy(article);
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group relative block overflow-hidden rounded-2xl border border-amber-500/25 bg-zinc-950/70 shadow-[0_0_50px_-18px_rgba(251,191,36,0.22)] transition-[transform,box-shadow,border-color] duration-300 hover:scale-[1.01] hover:border-amber-400/40 hover:shadow-[0_0_60px_-12px_rgba(251,191,36,0.28),0_20px_40px_-24px_rgba(0,0,0,0.55)]"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 md:gap-0">
				<div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[min(100%,320px)] md:h-full">
					{article.coverImageUrl ? (
						<img
							src={article.coverImageUrl}
							alt=""
							className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
							loading="eager"
						/>
					) : (
						<div className="h-full min-h-[12rem] w-full bg-gradient-to-br from-zinc-900 to-zinc-950 md:min-h-[280px]" />
					)}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/20" />
				</div>
				<div className="flex flex-col justify-center gap-3 p-5 md:p-7 lg:p-8">
					<div>
						<span className="inline-flex items-center rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200/95">
							TOP STORY
						</span>
					</div>
					<h2 className="text-2xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-3xl lg:text-4xl group-hover:underline decoration-amber-500/40 underline-offset-4">
						{article.title}
					</h2>
					<div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
						<span>{article.date}</span>
						<span className="opacity-40">•</span>
						<span>{Math.max(1, article.readingTime)} min czytania</span>
					</div>
					<p className="text-sm leading-relaxed text-zinc-300 line-clamp-4 md:line-clamp-5">{teaser}</p>
					<div className="pt-1">
						<span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300/95 transition-colors group-hover:text-amber-200">
							Czytaj analizę
							<span aria-hidden className="transition-transform group-hover:translate-x-0.5">
								→
							</span>
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
