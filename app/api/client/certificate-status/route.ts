import { NextResponse } from 'next/server';

import { buildCertificateVerifyAbsoluteUrl } from '@/lib/certifications/pdf/siteBaseUrl';
import { getIssuedCertificateForUser } from '@/lib/certifications/service';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Lekki status certyfikatu dla panelu /client (bez logiki egzaminu).
 */
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if (!(await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))) {
    return NextResponse.json({ ok: true, certificateCompleted: false });
  }

  const cert = await getIssuedCertificateForUser(session.userId);
  if (!cert) {
    return NextResponse.json({ ok: true, certificateCompleted: false });
  }

  return NextResponse.json({
    ok: true,
    certificateCompleted: true,
    recordId: cert.id,
    verifyAbsoluteUrl: buildCertificateVerifyAbsoluteUrl(cert.verificationToken),
    verifyPath: `/certificates/verify/${encodeURIComponent(cert.verificationToken)}`,
  });
}
