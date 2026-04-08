'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';
import {
	REDAKCJA_MINI_ROW_THUMB_BOX,
	redakcjaArticleTagPillClass,
	redakcjaGridCardMetaClass,
	redakcjaGridCardTitleClass,
} from './articleCardUi';

export type MiniRowProps = {
	article: ArticleListItem;
};

export default function MiniRow({ article }: MiniRowProps) {
	const tagPreview = article.tags?.slice(0, 2) ?? [];
	const readMin = Math.max(1, article.readingTime);
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group flex w-full gap-3 border-b border-white/[0.06] py-2.5 pl-0 pr-1 transition-colors duration-150 last:border-b-0 hover:bg-white/[0.04]"
		>
			<div
				className={`relative ${REDAKCJA_MINI_ROW_THUMB_BOX} shrink-0 overflow-hidden rounded-md bg-zinc-800/40`}
			>
				{article.coverImageUrl ? (
					<img
						src={article.coverImageUrl}
						alt=""
						className="h-full w-full object-cover"
						loading="lazy"
					/>
				) : (
					<div className="h-full w-full bg-zinc-800/60" />
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
				<h4 className={redakcjaGridCardTitleClass}>{article.title}</h4>
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
		</Link>
	);
}
