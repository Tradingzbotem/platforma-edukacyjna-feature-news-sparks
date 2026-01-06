import React from "react";
import Link from "next/link";
import type { ArticleListItem } from "@/lib/redakcja/types";
import CoverImage from "./CoverImage";

type Props = {
	article: ArticleListItem;
};

export default function ArticleRow({ article }: Props) {
	const formattedDate = new Date(article.date).toLocaleDateString("pl-PL", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group flex items-stretch gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60"
		>
			<div className="relative w-28 sm:w-36 md:w-40 shrink-0 h-24 sm:h-24 md:h-28 overflow-hidden rounded-l-lg">
				<CoverImage
					src={article.coverImageUrl}
					alt={article.title}
					fill
					className="object-cover transition-transform group-hover:scale-105"
					sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
					priority={false}
				/>
			</div>
			<div className="py-3 pr-3 flex-1 min-w-0">
				<h3 className="text-base sm:text-lg font-semibold text-zinc-100 group-hover:text-white line-clamp-2">
					{article.title}
				</h3>
				<p className="mt-1 text-sm text-zinc-400 line-clamp-3">{article.excerpt}</p>
				<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
					<span className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800">{formattedDate}</span>
					<span className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800">
						{article.readingTime || 0} min
					</span>
					{article.tags.map((tag) => (
						<span key={tag} className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800">
							{tag}
						</span>
					))}
				</div>
			</div>
		</Link>
	);
}


