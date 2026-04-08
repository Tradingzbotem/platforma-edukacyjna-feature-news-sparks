import 'server-only';

import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';

import type { CertificationViewModel } from '@/lib/certifications/types';
import { CertificatePdfDocument } from '@/lib/certifications/pdf/template';
import { registerCertificatePdfFonts } from '@/lib/certifications/pdf/fonts';
import { buildCertificateVerifyAbsoluteUrl } from '@/lib/certifications/pdf/siteBaseUrl';
import {
  getCertificatePdfBilingualCopy,
  getTrackPdfBilingual,
  type PdfLocale,
} from '@/lib/certifications/pdf/i18n';
import { parseSkillBreakdownJson } from '@/lib/certifications/pdf/skillBreakdown';

export type PdfGenerationResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; error: string };

export type GenerateCertificatePdfOptions = {
  locale?: PdfLocale;
};

function formatIssuedDate(iso: string | null, locale: PdfLocale): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  const lng = locale === 'pl' ? 'pl-PL' : 'en-GB';
  return new Intl.DateTimeFormat(lng, { dateStyle: 'long' }).format(t);
}

async function tryCreateQrPngBuffer(verifyAbsoluteUrl: string): Promise<Buffer | null> {
  try {
    const buf = await QRCode.toBuffer(verifyAbsoluteUrl, {
      type: 'png',
      margin: 1,
      width: 200,
      color: { dark: '#0b0d12', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
    return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  } catch (e) {
    console.warn('[certifications/pdf] QR generation failed, PDF will omit QR image', e);
    return null;
  }
}

/**
 * Generuje PDF certyfikatu (on-demand). Wywołuj wyłącznie dla rekordów ISSUED.
 */
export async function generateCertificatePdf(
  certificate: CertificationViewModel,
  options?: GenerateCertificatePdfOptions,
): Promise<PdfGenerationResult> {
  if (certificate.status !== 'ISSUED') {
    return { ok: false, error: 'certificate_not_issuable' };
  }

  const locale = options?.locale ?? 'en';
  const copy = getCertificatePdfBilingualCopy();
  const track = getTrackPdfBilingual(certificate.track);

  try {
    registerCertificatePdfFonts();

    const verifyAbsoluteUrl = buildCertificateVerifyAbsoluteUrl(certificate.verificationToken);
    const qrImageBuffer = await tryCreateQrPngBuffer(verifyAbsoluteUrl);

    const issuedDateDisplay = formatIssuedDate(certificate.issuedAt, locale);
    const skillRows = parseSkillBreakdownJson(certificate.skillBreakdownJson);

    const element = (
      <CertificatePdfDocument
        certificate={certificate}
        copy={copy}
        track={track}
        qrImageBuffer={qrImageBuffer}
        issuedDateDisplay={issuedDateDisplay}
        skillRows={skillRows}
      />
    );

    const buffer = await renderToBuffer(element);
    return { ok: true, buffer };
  } catch (e) {
    console.error('[certifications/pdf/generate]', e);
    return { ok: false, error: 'pdf_render_failed' };
  }
}
