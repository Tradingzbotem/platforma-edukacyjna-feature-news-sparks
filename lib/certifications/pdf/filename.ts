import 'server-only';

/** Bezpieczna nazwa pliku dla Content-Disposition (ASCII). */
export function buildCertificatePdfFilename(certificateId: string): string {
  const safe = certificateId.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 96);
  const base = safe.length > 0 ? safe : 'certificate';
  return `fxedulab-certificate-${base}.pdf`;
}
