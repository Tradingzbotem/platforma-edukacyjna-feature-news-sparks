'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';

export type TopicBlockProps = {
	main: ArticleListItem;
	related: ArticleListItem[];
};

export default function TopicBlock({ main, related }: TopicBlockProps) {
	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-950/50">
			<Link href={`/redakcja/${main.slug}`} className="group block overflow-hidden">
				<div className="relative aspect-[16/9] w-full overflow-hidden">
					{main.coverImageUrl ? (
						<img
							src={main.coverImageUrl}
							alt=""
							className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
							loading="lazy"
						/>
					) : (
						<div className="h-full w-full bg-zinc-900/60" />
					)}
				</div>
				<div className="p-4 md:p-5">
					<div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2">
						<span>Temat przewodni</span>
						{main.tags?.length ? (
							<>
								<span className="opacity-50">•</span>
								<span className="truncate max-w-[10rem]">{main.tags.join(', ')}</span>
							</>
						) : null}
					</div>
					<h3 className="mt-1 text-xl md:text-2xl font-bold text-zinc-100 group-hover:underline">
						{main.title}
					</h3>
					{main.excerpt && (
						<p className="mt-2 text-sm text-zinc-300 line-clamp-3">{main.excerpt}</p>
					)}
					<div className="mt-3 text-xs text-zinc-400 flex flex-wrap items-center gap-2">
						<span>{main.date}</span>
						<span className="opacity-50">•</span>
						<span>{Math.max(1, main.readingTime)} min czytania</span>
					</div>
				</div>
			</Link>

			{related?.length > 0 && (
				<div className="border-t border-zinc-800 p-3 md:p-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{related.slice(0, 4).map((item) => (
							<Link
								key={item.slug}
								href={`/redakcja/${item.slug}`}
								className="group flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/60 transition-colors overflow-hidden p-2"
							>
								<div className="relative w-24 min-w-24 h-16 overflow-hidden rounded">
									{item.coverImageUrl ? (
										<img
											src={item.coverImageUrl}
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
										{item.title}
									</h4>
									<div className="mt-1 text-[11px] text-zinc-400 flex flex-wrap items-center gap-2">
										<span>{item.date}</span>
										<span className="opacity-50">•</span>
										<span>{Math.max(1, item.readingTime)} min</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}


