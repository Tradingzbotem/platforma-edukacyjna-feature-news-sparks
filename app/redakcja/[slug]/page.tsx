import React from "react";
import CoverImage from "@/components/redakcja/CoverImage";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllSlugs } from "@/lib/redakcja/mockArticles";
import { getPublishedArticleBySlug } from "@/lib/redakcja/repo";
import { isDatabaseConfigured } from "@/lib/db";
import Markdown from "@/components/redakcja/Markdown";
import Disclaimer from "@/components/redakcja/Disclaimer";
import { getFallbackArticleBySlug, listFallbackArticles } from "@/lib/redakcja/fallbackStore";
import { extractCoverFromContent } from "@/lib/redakcja/content-utils";

type Params = {
	params: Promise<{
		slug: string;
	}>;
};

export async function generateStaticParams() {
	// Pre-render mock slugs and any slugs present in fallback file storage
	const mock = getAllSlugs().map((slug) => ({ slug }));
	try {
		const fallback = await listFallbackArticles();
		const fileSlugs = Array.isArray(fallback) ? fallback.map((a) => ({ slug: a.slug })) : [];
		// Merge unique
		const all = new Map<string, { slug: string }>();
		for (const s of [...mock, ...fileSlugs]) all.set(s.slug, s);
		return Array.from(all.values());
	} catch {
		return mock;
	}
}

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: Params) {
	// Next.js 15 dynamic params are async
	const { slug } = await params;
	// Try DB first
	const dbArticle = await getPublishedArticleBySlug(slug);
	let article =
		dbArticle
			? {
					title: dbArticle.title,
					slug: dbArticle.slug,
					date: dbArticle.createdAt.toISOString().slice(0, 10),
					tags: dbArticle.tags || [],
					readingTime: dbArticle.readingTime ?? 0,
					excerpt: "",
					coverImageUrl: undefined,
					content: dbArticle.content,
			  }
			: null;

	// Fallback to file storage if available
	if (!article) {
		try {
			const f = await getFallbackArticleBySlug(slug);
			if (f) {
				article = {
					title: f.title,
					slug: f.slug,
					date: f.createdAt.slice(0, 10),
					tags: Array.isArray(f.tags) ? f.tags : [],
					readingTime: f.readingTime ?? 0,
					excerpt: "",
					coverImageUrl: undefined,
					content: f.content,
				};
			}
		} catch {
			// ignore and continue to mock fallback
		}
	}

	// Final fallback: mock articles bundled with the app
	if (!article && !isDatabaseConfigured()) {
		const mock = getArticleBySlug(slug);
		if (mock) {
			article = {
				title: mock.title,
				slug: mock.slug,
				date: mock.date,
				tags: mock.tags || [],
				readingTime: mock.readingTime ?? 0,
				excerpt: mock.excerpt ?? "",
				coverImageUrl: mock.coverImageUrl ?? undefined,
				content: mock.content,
			};
		}
	}
	if (!article) {
		return notFound();
	}
	// Derive cover image from content and remove it from body
	const derived = extractCoverFromContent(article.content);
	const coverUrl = derived.cover.url ?? article.coverImageUrl;
	const contentBody = derived.contentWithoutCover;
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
					src={coverUrl}
					alt={article.title}
					fill
					className="object-cover"
					sizes="(max-width: 768px) 100vw, 768px"
					priority={false}
				/>
			</div>

			<Markdown content={contentBody} />

			<Disclaimer />
		</div>
	);
}


