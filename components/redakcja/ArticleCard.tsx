import React from "react";
import Link from "next/link";
import CoverImage from "./CoverImage";
import type { ArticleListItem } from "@/lib/redakcja/types";

type Props = {
	article: ArticleListItem;
};

export default function ArticleCard({ article }: Props) {
	const formattedDate = new Date(article.date).toLocaleDateString("pl-PL", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});

	return (
		<Link
			href={`/redakcja/${article.slug}`}
			className="group block rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/70 transition-colors"
		>
			<div className="flex flex-col sm:flex-row">
				<div className="relative w-full sm:w-48 h-40 sm:h-auto overflow-hidden rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none">
					<CoverImage
						src={article.coverImageUrl}
						alt={article.title}
						fill
						className="object-cover transition-transform group-hover:scale-105"
						sizes="(max-width: 640px) 100vw, 192px"
						priority={false}
					/>
				</div>
				<div className="p-4 sm:p-5 flex-1">
					<h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white">
						{article.title}
					</h3>
					<p className="mt-2 text-zinc-400">{article.excerpt}</p>
					<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
						<span className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800">
							{formattedDate}
						</span>
						<span className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800">
							{article.readingTime} min
						</span>
						{article.tags.map((tag) => (
							<span
								key={tag}
								className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</div>
		</Link>
	);
}


