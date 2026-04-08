/**
 * Typy domenowe modułu certyfikatów (FXEDULAB Certification).
 * Enumy wartości odpowiadają modelowi Prisma — utrzymuj spójność ze schematem.
 */

export type CertificationTrack =
  | 'FOREX_FUNDAMENTALS'
  | 'TECHNICAL_ANALYSIS'
  | 'RISK_MANAGEMENT';

export type CertificationRecordStatus = 'DRAFT' | 'ISSUED' | 'REVOKED';

/** Rekord zwracany z warstwy serwisu (daty jako ISO). */
export type CertificationRecordDto = {
  id: string;
  certificateId: string;
  verificationToken: string;
  fullName: string;
  track: CertificationTrack;
  scorePercent: number;
  level: string;
  issuedAt: string | null;
  status: CertificationRecordStatus;
  skillBreakdownJson: unknown | null;
  pdfUrl: string | null;
  userId: string | null;
  createdByAdminUserId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Model widoku (np. verify / przyszły PDF / admin). */
export type CertificationViewModel = CertificationRecordDto;

export type IssueCertificateInput = {
  fullName: string;
  track: CertificationTrack;
  scorePercent: number;
  /** Opcjonalny JSON umiejętności (MVP). */
  skillBreakdownJson?: unknown | null;
  userId?: string | null;
  createdByAdminUserId?: string | null;
  notes?: string | null;
};

export type VerifyState = 'valid' | 'revoked' | 'not_found';

export type VerifyResult =
  | { state: 'not_found' }
  | { state: 'revoked'; certificate: CertificationViewModel }
  | { state: 'valid'; certificate: CertificationViewModel };
