import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { buildCertificatePdfFilename } from '@/lib/certifications/pdf/filename';
import { generateCertificatePdf } from '@/lib/certifications/pdf/generate';
import { normalizePdfLocale } from '@/lib/certifications/pdf/i18n';
import { buildCertificateViewModel } from '@/lib/certifications/mapper';
import { getCertificateById, getIssuedCertificateForUser } from '@/lib/certifications/service';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if (!(await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  try {
    const url = new URL(request.url);
    const recordId = url.searchParams.get('recordId')?.trim() ?? '';

    const row =
      recordId.length > 0
        ? await (async () => {
            const one = await getCertificateById(recordId);
            if (!one || one.userId !== session.userId || one.status !== 'ISSUED') return null;
            return one;
          })()
        : await getIssuedCertificateForUser(session.userId);

    if (!row) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }

    const vm = buildCertificateViewModel(row);
    const cookieStore = await cookies();
    const pdfLocale = normalizePdfLocale(cookieStore.get('lang')?.value);
    const pdf = await generateCertificatePdf(vm, { locale: pdfLocale });

    if (!pdf.ok) {
      if (pdf.error === 'certificate_not_issuable') {
        return NextResponse.json(
          { ok: false, error: 'certificate_not_issuable', status: row.status },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: pdf.error }, { status: 500 });
    }

    const filename = buildCertificatePdfFilename(vm.certificateId);

    return new Response(pdf.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[konto/certyfikat/pdf GET]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
