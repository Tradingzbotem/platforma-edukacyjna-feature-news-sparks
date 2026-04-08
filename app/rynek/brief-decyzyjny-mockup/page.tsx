import type { Metadata } from 'next';
import { hasFeature, FEATURE_BRIEF_DECISION } from '@/lib/features';
import { getPublishedDecisionBrief } from '@/lib/decision-brief/getPublishedDecisionBrief';
import { getSession } from '@/lib/session';
import BriefDecyzyjnyMockup from './BriefDecyzyjnyMockup';

export const metadata: Metadata = {
	title: 'Brief decyzyjny (mockup)',
	description:
		'Szkic modułu premium: temat główny, aktywa pod wpływem, scenariusze. Materiał edukacyjny — wersja robocza.',
	robots: { index: false, follow: false },
};

export default async function BriefDecyzyjnyMockupPage() {
	const session = await getSession();
	const userId = session.userId?.trim() || '';
	const hasFullBriefAccess = userId ? await hasFeature(userId, FEATURE_BRIEF_DECISION) : false;
	const publishedBrief = await getPublishedDecisionBrief();

	return (
		<BriefDecyzyjnyMockup hasFullBriefAccess={hasFullBriefAccess} publishedBrief={publishedBrief} />
	);
}
