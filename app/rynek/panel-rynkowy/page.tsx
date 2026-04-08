import type { Metadata } from 'next';
import { hasFeature, FEATURE_BRIEF_DECISION } from '@/lib/features';
import { getSession } from '@/lib/session';
import PublicRynekPanelPage from './PublicRynekPanelPage';

export const metadata: Metadata = {
	title: 'Panel rynkowy — przegląd',
	description:
		'Najważniejsze aktywa, bieżący kontekst i tematy napędzające rynek. Materiał edukacyjny — bez rekomendacji inwestycyjnych.',
	openGraph: {
		title: 'Panel rynkowy — przegląd | FX EduLab',
		description:
			'Najważniejsze aktywa, bieżący kontekst i tematy napędzające rynek. Materiał edukacyjny.',
	},
};

export default async function RynekPanelRynkowyPage() {
	const session = await getSession();
	const userId = session.userId?.trim() || '';
	const hasBriefDecisionAccess = userId ? await hasFeature(userId, FEATURE_BRIEF_DECISION) : false;

	return <PublicRynekPanelPage hasBriefDecisionAccess={hasBriefDecisionAccess} />;
}
