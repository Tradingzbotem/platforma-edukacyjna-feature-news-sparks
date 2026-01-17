'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';

export type FeaturedCardProps = {
	article: ArticleListItem;
};

export default function FeaturedCard({ article }: FeaturedCardProps) {
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/60 transition-colors"
		>
			<div className="grid md:grid-cols-5 gap-0 md:gap-4">
				<div className="relative aspect-[16/9] md:aspect-auto md:col-span-2 overflow-hidden">
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
				<div className="p-4 md:p-6 md:col-span-3">
					<h3 className="text-2xl md:text-3xl font-bold text-zinc-100 leading-snug group-hover:underline">
						{article.title}
					</h3>
					{article.excerpt && (
						<p className="mt-3 text-sm md:text-base text-zinc-300 line-clamp-3">{article.excerpt}</p>
					)}
					<div className="mt-4 text-xs text-zinc-400 flex flex-wrap items-center gap-2">
						<span>{article.date}</span>
						<span className="opacity-50">•</span>
						<span>{Math.max(1, article.readingTime)} min czytania</span>
						{article.tags?.length ? (
							<>
								<span className="opacity-50">•</span>
								<span className="truncate max-w-[14rem]">{article.tags.join(', ')}</span>
							</>
						) : null}
					</div>
				</div>
			</div>
		</Link>
	);
}


