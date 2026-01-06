export type ArticleTag = string;

export interface Article {
	title: string;
	slug: string;
	date: string; // ISO date string
	tags: ArticleTag[];
	readingTime: number; // in minutes
	excerpt: string;
	content: string; // markdown content
	coverImageUrl?: string;
}

export interface ArticleListItem
	extends Pick<Article, "title" | "slug" | "date" | "tags" | "readingTime" | "excerpt" | "coverImageUrl"> {}

export type GetArticleBySlug = (slug: string) => Article | undefined;


