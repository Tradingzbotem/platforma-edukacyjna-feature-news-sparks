'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';

export type TopCardProps = {
	article: ArticleListItem;
};

export default function TopCard({ article }: TopCardProps) {
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/60 transition-colors"
		>
			<div className="relative aspect-[16/9] w-full overflow-hidden">
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
			<div className="p-4">
				<h3 className="text-lg font-semibold text-zinc-100 line-clamp-2 group-hover:underline">
					{article.title}
				</h3>
				{article.excerpt && (
					<p className="mt-2 text-sm text-zinc-300 line-clamp-2">{article.excerpt}</p>
				)}
				<div className="mt-3 text-xs text-zinc-400 flex flex-wrap items-center gap-2">
					<span>{article.date}</span>
					<span className="opacity-50">•</span>
					<span>{Math.max(1, article.readingTime)} min czytania</span>
					{article.tags?.length ? (
						<>
							<span className="opacity-50">•</span>
							<span className="truncate max-w-[10rem]">{article.tags.join(', ')}</span>
						</>
					) : null}
				</div>
			</div>
		</Link>
	);
}


