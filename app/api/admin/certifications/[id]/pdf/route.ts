import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getIsAdmin } from '@/lib/admin';
import { buildCertificatePdfFilename } from '@/lib/certifications/pdf/filename';
import { generateCertificatePdf } from '@/lib/certifications/pdf/generate';
import { normalizePdfLocale } from '@/lib/certifications/pdf/i18n';
import { buildCertificateViewModel } from '@/lib/certifications/mapper';
import { getCertificateById } from '@/lib/certifications/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  }

  try {
    const row = await getCertificateById(id);
    if (!row) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }

    if (row.status !== 'ISSUED') {
      return NextResponse.json(
        { ok: false, error: 'certificate_not_issuable', status: row.status },
        { status: 409 },
      );
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
    const buffer = pdf.buffer;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[admin/certifications/[id]/pdf GET]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
