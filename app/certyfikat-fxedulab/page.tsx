import type { Metadata } from 'next';

import {
  CertificateFxedulabMarketing,
  type PublicCertPageAudience,
  CertificateFxedulabPublicPageShell,
} from '@/components/certificates/CertificateFxedulabMarketing';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Certyfikat FXEDULAB — czym jest i jak go zdobyć | FX EduLab',
  description:
    'Certyfikacja FXEDULAB: weryfikowalny dokument, egzamin końcowy, publiczna weryfikacja. Jak uzyskać dostęp do modułu i certyfikatu.',
};

export const dynamic = 'force-dynamic';

export default async function PublicCertificateFxedulabPage() {
  const session = await getSession();
  let publicAudience: PublicCertPageAudience = 'guest';
  if (session.userId) {
    publicAudience = (await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))
      ? 'logged_in_with_module'
      : 'logged_in_no_module';
  }

  return (
    <CertificateFxedulabPublicPageShell>
      <CertificateFxedulabMarketing
        topBack={{ href: '/', label: '← Strona główna' }}
        examCta={null}
        publicAudience={publicAudience}
      />
    </CertificateFxedulabPublicPageShell>
  );
}
