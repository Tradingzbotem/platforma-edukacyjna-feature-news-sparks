import type { Metadata } from 'next';
import { Suspense } from 'react';
import WykresyChartsClient from './WykresyChartsClient';
import WykresyChartsFallback from './WykresyChartsFallback';

export const metadata: Metadata = {
	title: 'Wykresy',
	description:
		'Wykresy TradingView: indeksy, forex, surowce i krypto — układ edukacyjny z krótkim opisem aktywa. Bez rekomendacji inwestycyjnych.',
	openGraph: {
		title: 'Wykresy | FX EduLab',
		description: 'Wykresy z TradingView — materiał edukacyjny FX EduLab.',
	},
};

export default function WykresyPage() {
	return (
		<Suspense fallback={<WykresyChartsFallback />}>
			<WykresyChartsClient />
		</Suspense>
	);
}
