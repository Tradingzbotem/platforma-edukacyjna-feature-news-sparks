'use client';
import React from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '@/lib/redakcja/types';

export type TopicBlockProps = {
	main: ArticleListItem;
	related: ArticleListItem[];
};

export default function TopicBlock({ main, related }: TopicBlockProps) {
	const mainTags = main.tags?.slice(0, 2) ?? [];
	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-950/50">
			<Link href={`/redakcja/${main.slug}`} className="group block overflow-hidden">
				<div className="relative aspect-[5/2] w-full overflow-hidden">
					{main.coverImageUrl ? (
						<img
							src={main.coverImageUrl}
							alt=""
							className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
							loading="lazy"
						/>
					) : (
						<div className="h-full w-full bg-zinc-900/60" />
					)}
				</div>
				<div className="p-3 md:p-4">
					<div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
						<span>Temat przewodni</span>
						{mainTags.length > 0 ? (
							<>
								<span className="opacity-50">•</span>
								<span className="flex flex-wrap gap-1">
									{mainTags.map((t) => (
										<span
											key={t}
											className="rounded border border-zinc-700/70 bg-zinc-900/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500"
										>
											{t}
										</span>
									))}
								</span>
							</>
						) : null}
					</div>
					<h3 className="mt-1 text-base md:text-xl font-bold text-zinc-100 line-clamp-3 group-hover:underline">
						{main.title}
					</h3>
					{main.excerpt && (
						<p className="mt-1.5 text-xs md:text-sm text-zinc-300 line-clamp-3">{main.excerpt}</p>
					)}
					<div className="mt-2 text-xs text-zinc-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
						<span>{main.date}</span>
						<span className="opacity-50">•</span>
						<span>{Math.max(1, main.readingTime)} min czytania</span>
					</div>
				</div>
			</Link>

			{related?.length > 0 && (
				<div className="border-t border-zinc-800 p-2.5 md:p-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{related.slice(0, 4).map((item) => (
							<Link
								key={item.slug}
								href={`/redakcja/${item.slug}`}
								className="group flex gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 transition-[border-color,background-color,opacity] duration-200 hover:border-zinc-600/80 hover:bg-zinc-900/55 overflow-hidden p-1.5"
							>
								<div className="relative w-24 min-w-24 h-12 overflow-hidden rounded">
									{item.coverImageUrl ? (
										<img
											src={item.coverImageUrl}
											alt=""
											className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
											loading="lazy"
										/>
									) : (
										<div className="h-full w-full bg-zinc-900/60" />
									)}
								</div>
								<div className="flex-1 min-w-0 py-0.5 pr-1.5">
									<h4 className="text-xs font-semibold text-zinc-100 line-clamp-3 group-hover:underline">
										{item.title}
									</h4>
									<div className="mt-1 text-xs text-zinc-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
										<span>{item.date}</span>
										<span className="opacity-50">•</span>
										<span>{Math.max(1, item.readingTime)} min</span>
									</div>
									{(item.tags ?? []).slice(0, 2).length > 0 ? (
										<div className="mt-1 flex flex-wrap gap-0.5">
											{(item.tags ?? []).slice(0, 2).map((t) => (
												<span
													key={t}
													className="rounded border border-zinc-700/70 bg-zinc-900/60 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-500 truncate max-w-[5rem]"
												>
													{t}
												</span>
											))}
										</div>
									) : null}
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
