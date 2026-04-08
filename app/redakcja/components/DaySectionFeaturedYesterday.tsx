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
	return 'Kontekst i dalsze implikacje — w pełnym artykule.';
}

export type DaySectionFeaturedYesterdayProps = {
	article: TopStoryArticle;
};

/** Pozioma karta wyróżniająca pierwszy artykuł z sekcji „Wczoraj”. */
export default function DaySectionFeaturedYesterday({ article }: DaySectionFeaturedYesterdayProps) {
	const text = teaser(article);
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group block overflow-hidden rounded-xl border border-white/15 bg-zinc-900/70 transition-[border-color,background-color] duration-200 hover:border-white/25 hover:bg-zinc-900/85"
		>
			<div className="grid grid-cols-1 gap-0 sm:grid-cols-12 sm:gap-0">
				<div className="relative aspect-[16/9] w-full overflow-hidden sm:col-span-5 sm:aspect-auto sm:h-[220px] sm:min-h-[220px] sm:max-h-[220px]">
					{article.coverImageUrl ? (
						<img
							src={article.coverImageUrl}
							alt=""
							className="h-full w-full object-cover"
							loading="lazy"
						/>
					) : (
						<div className="h-full min-h-[10rem] w-full bg-zinc-800/80 sm:min-h-[220px]" />
					)}
				</div>
				<div className="flex flex-col justify-center gap-2.5 p-5 sm:col-span-7 sm:p-6 md:p-7">
					<span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">
						Wczoraj – kontekst
					</span>
					<h3 className="text-lg font-bold leading-snug text-zinc-50 sm:text-xl md:text-2xl group-hover:underline decoration-white/20 underline-offset-4 line-clamp-3">
						{article.title}
					</h3>
					<p className="text-sm leading-relaxed text-zinc-400 line-clamp-2">{text}</p>
					<div className={redakcjaGridCardMetaClass}>
						<time dateTime={article.date}>{article.date}</time>
						<span className="opacity-40" aria-hidden>
							•
						</span>
						<span>{Math.max(1, article.readingTime)} min czytania</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
