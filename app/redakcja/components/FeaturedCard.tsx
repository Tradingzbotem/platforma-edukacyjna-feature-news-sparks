'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';
import {
	REDAKCJA_GRID_CARD_THUMB_H,
	redakcjaArticleTagPillClass,
	redakcjaGridCardMetaClass,
	redakcjaGridCardTitleClass,
} from './articleCardUi';

export type FeaturedCardProps = {
	article: ArticleListItem;
};

export default function FeaturedCard({ article }: FeaturedCardProps) {
	const tagPreview = article.tags?.slice(0, 2) ?? [];
	const readMin = Math.max(1, article.readingTime);
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group block overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/50 transition-[border-color,background-color] duration-200 hover:border-zinc-600/75 hover:bg-zinc-900/50"
		>
			<div className="grid gap-0 md:grid-cols-5 md:gap-3">
				<div className={`relative ${REDAKCJA_GRID_CARD_THUMB_H} w-full overflow-hidden md:col-span-2`}>
					{article.coverImageUrl ? (
						<img
							src={article.coverImageUrl}
							alt=""
							className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
							loading="lazy"
						/>
					) : (
						<div className="h-full w-full bg-zinc-900/60" />
					)}
				</div>
				<div className="flex flex-col gap-2 p-3 md:col-span-3 md:p-4">
					<h3 className={redakcjaGridCardTitleClass}>{article.title}</h3>
					{article.excerpt ? (
						<p className="text-xs leading-relaxed text-zinc-400 line-clamp-2 md:line-clamp-3">
							{article.excerpt}
						</p>
					) : null}
					<div className={redakcjaGridCardMetaClass}>
						<time dateTime={article.date}>{article.date}</time>
						<span className="opacity-40" aria-hidden>
							•
						</span>
						<span>{readMin} min czytania</span>
					</div>
					{tagPreview.length > 0 ? (
						<div className="flex flex-wrap gap-1">
							{tagPreview.map((t) => (
								<span key={t} className={redakcjaArticleTagPillClass}>
									{t}
								</span>
							))}
						</div>
					) : null}
				</div>
			</div>
		</Link>
	);
}
