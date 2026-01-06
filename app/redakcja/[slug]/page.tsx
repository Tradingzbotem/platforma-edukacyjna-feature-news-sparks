import React from "react";
import CoverImage from "@/components/redakcja/CoverImage";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllSlugs } from "@/lib/redakcja/mockArticles";
import { getPublishedArticleBySlug } from "@/lib/redakcja/repo";
import { isDatabaseConfigured } from "@/lib/db";
import Markdown from "@/components/redakcja/Markdown";
import Disclaimer from "@/components/redakcja/Disclaimer";

type Params = {
	params: Promise<{
		slug: string;
	}>;
};

export function generateStaticParams() {
	return getAllSlugs().map((slug) => ({ slug }));
}

export const dynamic = "force-static";

export default async function ArticlePage({ params }: Params) {
	// Next.js 15 dynamic params are async
	const { slug } = await params;
	// Try DB first
	const dbArticle = await getPublishedArticleBySlug(slug);
	const article = dbArticle
		? {
				title: dbArticle.title,
				slug: dbArticle.slug,
				date: (dbArticle.publishedAt ?? dbArticle.createdAt).toISOString().slice(0, 10),
				tags: dbArticle.tags || [],
				readingTime: dbArticle.readingTime ?? 0,
				excerpt: dbArticle.excerpt ?? "",
				coverImageUrl: dbArticle.coverImageUrl ?? undefined,
				content: dbArticle.content,
		  }
		: isDatabaseConfigured()
		? null
		: getArticleBySlug(slug);
	if (!article) {
		return notFound();
	}
	const formattedDate = new Date(article.date).toLocaleDateString("pl-PL", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});

	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<header className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
				<div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
					<span className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800">
						{formattedDate}
					</span>
					<span className="rounded bg-zinc-900 px-2 py-1 border border-zinc-800">
						{article.readingTime} min czytania
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
			</header>

			<div className="relative mb-6 h-60 w-full overflow-hidden rounded-lg border border-zinc-800">
				<CoverImage
					src={article.coverImageUrl}
					alt={article.title}
					fill
					className="object-cover"
					sizes="(max-width: 768px) 100vw, 768px"
					priority={false}
				/>
			</div>

			<Markdown content={article.content} />

			<Disclaimer />
		</div>
	);
}


