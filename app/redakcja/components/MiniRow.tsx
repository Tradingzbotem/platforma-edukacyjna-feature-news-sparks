'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';

export type MiniRowProps = {
	article: ArticleListItem;
};

export default function MiniRow({ article }: MiniRowProps) {
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/60 transition-colors overflow-hidden p-2"
		>
			<div className="relative w-28 min-w-28 h-20 overflow-hidden rounded">
				{article.coverImageUrl ? (
					<img
						src={article.coverImageUrl}
						alt=""
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						loading="lazy"
					/>
				) : (
					<div className="h-full w-full bg-zinc-900/60" />
				)}
			</div>
			<div className="flex-1 py-1 pr-2">
				<h4 className="text-sm font-semibold text-zinc-100 line-clamp-2 group-hover:underline">
					{article.title}
				</h4>
				<div className="mt-1 text-[11px] text-zinc-400 flex flex-wrap items-center gap-2">
					<span>{article.date}</span>
					<span className="opacity-50">•</span>
					<span>{Math.max(1, article.readingTime)} min</span>
				</div>
			</div>
		</Link>
	);
}


