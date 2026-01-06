import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type MarkdownProps = {
	content: string;
	className?: string;
};

export default function Markdown({ content, className }: MarkdownProps) {
	return (
		<div className={className}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					a({ href, children }) {
						const url = href ?? "";
						const isExternal = /^https?:\/\//i.test(url);
						if (isExternal) {
							return (
								// eslint-disable-next-line react/jsx-no-target-blank
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
								>
									{children}
								</a>
							);
						}
						return (
							<Link
								href={url}
								className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
							>
								{children}
							</Link>
						);
					},
					h1({ children }) {
						return (
							<h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight">
								{children}
							</h1>
						);
					},
					h2({ children }) {
						return (
							<h2 className="mt-10 mb-3 text-2xl font-semibold">
								{children}
							</h2>
						);
					},
					h3({ children }) {
						return (
							<h3 className="mt-8 mb-2 text-xl font-semibold">
								{children}
							</h3>
						);
					},
					p({ children }) {
						return <p className="leading-7 mb-4">{children}</p>;
					},
					ul({ children }) {
						return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
					},
					ol({ children }) {
						return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
					},
					li({ children }) {
						return <li className="marker:text-zinc-400">{children}</li>;
					},
					blockquote({ children }) {
						return (
							<blockquote className="border-l-4 border-zinc-700 pl-4 italic text-zinc-300 my-4">
								{children}
							</blockquote>
						);
					},
					hr() {
						return <hr className="my-8 border-zinc-800" />;
					},
					strong({ children }) {
						return <strong className="font-semibold text-zinc-100">{children}</strong>;
					},
					em({ children }) {
						return <em className="text-zinc-300">{children}</em>;
					},
					code({ children }) {
						return (
							<code className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-200">
								{children}
							</code>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}


