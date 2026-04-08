import type { NextRequest } from 'next/server';
import type { LiveNewsContextItem } from '@/lib/brief/liveNewsContext';
import {
	formatClusterGroundedNewsBlock,
	getLiveNewsContextItems,
	sortClusterNewsForBrief,
} from '@/lib/brief/liveNewsContext';
import {
	buildOperatorPrimaryDriverBlock,
	buildSupportingLiveHeadlinesBlock,
	parseManualPrimaryDriverFromRequestBody,
	type ParsedManualPrimaryDriver,
} from '@/lib/brief/morningManualTopicPrompt';
import { pickMorningBriefCanonicalKeysForCluster } from '@/lib/brief/morningBriefClusterAssets';
import type { MorningBriefCanonicalKey } from '@/lib/brief/morningBriefMarketSymbols';
import type { BriefingLanguage } from '@/lib/brief/morningInstitutionalBriefingTypes';
import { selectPrimaryMarketTheme } from '@/lib/brief/marketDriverSelector';

const NEWS_CONTEXT_FETCH_MS = 18_000;
const MAX_RELATED_NEWS = 5;
const MAX_CLUSTER_ASSETS = 4;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
	let id: ReturnType<typeof setTimeout> | undefined;
	const timeoutP = new Promise<T>((resolve) => {
		id = setTimeout(() => resolve(fallback), ms);
	});
	return Promise.race([
		promise.finally(() => {
			if (id !== undefined) clearTimeout(id);
		}),
		timeoutP,
	]);
}

/** Statystyki auto-klastra: puste gdy `manual.active` (operator). */
export type AutoClusterPipelineStats = {
	feedItemCount: number;
	clusterSize: number;
	relatedNewsToModel: number;
};

export type AssembledMorningBriefClusterInputs = {
	manual: ParsedManualPrimaryDriver;
	canonicalAssetKeys: MorningBriefCanonicalKey[];
	narrowNews: LiveNewsContextItem[];
	clusterBlock: string;
	inputKind: 'cluster' | 'operator';
	themeSummaryLines: string[];
	autoClusterStats: AutoClusterPipelineStats | null;
};

export async function assembleMorningBriefClusterInputs(
	_req: NextRequest,
	body: Record<string, unknown>,
): Promise<AssembledMorningBriefClusterInputs> {
	const rawLang = typeof body.language === 'string' ? body.language.toLowerCase() : 'pl';
	const briefingLang: BriefingLanguage = rawLang === 'en' ? 'en' : rawLang === 'cs' ? 'cs' : 'pl';

	const manual = parseManualPrimaryDriverFromRequestBody(body, MAX_CLUSTER_ASSETS);

	let canonicalAssetKeys: MorningBriefCanonicalKey[] = [];
	let narrowNews: LiveNewsContextItem[] = [];
	let clusterBlock = '';
	let inputKind: 'cluster' | 'operator' = 'cluster';
	let themeSummaryLines: string[] = [];
	let autoClusterStats: AutoClusterPipelineStats | null = null;

	if (!manual.active) {
		console.info('[narrative-debug] assemble morning brief: loading RSS via direct service (no /api/news/context fetch)');
		const newsItems = await withTimeout(getLiveNewsContextItems(), NEWS_CONTEXT_FETCH_MS, []);
		const primaryThemeSelection = selectPrimaryMarketTheme(newsItems);
		const sortedCluster = sortClusterNewsForBrief(primaryThemeSelection.relatedNews);
		narrowNews = sortedCluster.slice(0, MAX_RELATED_NEWS);

		autoClusterStats = {
			feedItemCount: newsItems.length,
			clusterSize: primaryThemeSelection.clusterSize,
			relatedNewsToModel: narrowNews.length,
		};
		console.info('[narrative-debug] clustering→AI', {
			usedDirectRssServicePath: true,
			itemCountFromLoader: newsItems.length,
			clusterSize: primaryThemeSelection.clusterSize,
			relatedNewsToModel: narrowNews.length,
		});
		if (primaryThemeSelection.clusterSize === 0) {
			console.info('[narrative-debug] clusterSize still zero after direct RSS path', {
				itemCountFromLoader: newsItems.length,
			});
		}

		canonicalAssetKeys = pickMorningBriefCanonicalKeysForCluster(
			{
				themeKey: primaryThemeSelection.themeKey,
				category: primaryThemeSelection.category,
				relatedNews: narrowNews,
			},
			MAX_CLUSTER_ASSETS,
		);

		clusterBlock = formatClusterGroundedNewsBlock(
			briefingLang,
			primaryThemeSelection.primaryThemeLabel,
			primaryThemeSelection.themeKey,
			narrowNews,
		);

		themeSummaryLines = [
			`WINNING THEME SUMMARY (server — RSS cluster, auto):`,
			`- themeKey: ${primaryThemeSelection.themeKey}`,
			`- primaryThemeLabel: ${primaryThemeSelection.primaryThemeLabel}`,
			`- clusterSize in full feed: ${primaryThemeSelection.clusterSize}`,
			`- headlines passed to you: ${narrowNews.length} (max ${MAX_RELATED_NEWS})`,
		];

		console.info('[morning-institutional] cluster grounding', {
			driver: 'auto_cluster',
			themeKey: primaryThemeSelection.themeKey,
			clusterSize: primaryThemeSelection.clusterSize,
			primaryThemeLabel: primaryThemeSelection.primaryThemeLabel,
			relatedNewsToModel: narrowNews.length,
			relatedNewsTitles: narrowNews.map((n) => n.title),
			canonicalAssetKeysCount: canonicalAssetKeys.length,
			canonicalAssetKeys,
		});
	} else {
		inputKind = 'operator';
		autoClusterStats = null;
		canonicalAssetKeys = manual.assetKeys;
		const opBlock = buildOperatorPrimaryDriverBlock(briefingLang, {
			themeTitle: manual.themeTitle,
			narrativeContext: manual.narrativeContext,
			horizon: manual.horizon,
			mode: manual.mode,
		});

		if (manual.mode === 'manual_plus_live_context') {
			console.info('[narrative-debug] assemble manual+live: direct RSS service (no internal HTTP)');
			const newsItems = await withTimeout(getLiveNewsContextItems(), NEWS_CONTEXT_FETCH_MS, []);
			narrowNews = sortClusterNewsForBrief(newsItems).slice(0, MAX_RELATED_NEWS);
			console.info('[narrative-debug] manual+live supporting headlines', {
				usedDirectRssServicePath: true,
				itemCountFromLoader: newsItems.length,
				supportingToModel: narrowNews.length,
			});
			clusterBlock = `${opBlock}\n\n---\n\n${buildSupportingLiveHeadlinesBlock(briefingLang, narrowNews)}`;
		} else {
			narrowNews = [];
			clusterBlock = opBlock;
		}

		themeSummaryLines = [
			`PRIMARY DRIVER (operator lock — do not change theme):`,
			`- themeKey: manual_operator`,
			`- primaryThemeLabel: ${manual.themeTitle}`,
			`- narrativeHorizon: ${manual.horizon}`,
			`- mode: ${manual.mode}`,
			`- supportingLiveHeadlines: ${manual.mode === 'manual_plus_live_context' ? narrowNews.length : 0}`,
		];

		console.info('[morning-institutional] manual primary driver', {
			driver: 'manual_operator',
			mode: manual.mode,
			horizon: manual.horizon,
			themeTitle: manual.themeTitle,
			canonicalAssetKeys,
			supportingHeadlines: narrowNews.map((n) => n.title),
		});
	}

	return {
		manual,
		canonicalAssetKeys,
		narrowNews,
		clusterBlock,
		inputKind,
		themeSummaryLines,
		autoClusterStats,
	};
}
