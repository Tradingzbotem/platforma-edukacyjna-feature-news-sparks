'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getIsAdmin } from '@/lib/admin';
import { getSession } from '@/lib/session';
import { resolveCertificationUserIdByEmail } from '@/lib/certifications/resolveAssigneeUserId';
import type { CertificationTrack } from '@/lib/certifications/types';
import {
  assignCertificateOwnerIfUnassigned,
  issueCertificate,
  revokeCertificate,
} from '@/lib/certifications/service';

const TRACKS: CertificationTrack[] = ['FOREX_FUNDAMENTALS', 'TECHNICAL_ANALYSIS', 'RISK_MANAGEMENT'];

function parseTrack(raw: FormDataEntryValue | null): CertificationTrack | null {
  const s = String(raw ?? '').trim();
  return TRACKS.includes(s as CertificationTrack) ? (s as CertificationTrack) : null;
}

function parseScore(raw: FormDataEntryValue | null): number | null {
  const n = Number(String(raw ?? '').trim());
  if (!Number.isFinite(n)) return null;
  const r = Math.round(n);
  if (r < 0 || r > 100) return null;
  return r;
}

export async function createCertificationAction(formData: FormData) {
  if (!(await getIsAdmin())) {
    redirect('/logowanie?next=/admin/certifications/new');
  }

  const fullName = String(formData.get('fullName') ?? '').trim();
  const track = parseTrack(formData.get('track'));
  const scorePercent = parseScore(formData.get('scorePercent'));
  const notesRaw = String(formData.get('notes') ?? '').trim();
  const assigneeEmailRaw = String(formData.get('assigneeEmail') ?? '');

  if (!fullName || !track || scorePercent === null) {
    redirect('/admin/certifications/new?err=invalid');
  }

  const resolved = await resolveCertificationUserIdByEmail(assigneeEmailRaw);
  if (!resolved.ok) {
    if (resolved.error === 'email_invalid') {
      redirect('/admin/certifications/new?err=email_invalid');
    }
    if (resolved.error === 'user_not_found') {
      redirect('/admin/certifications/new?err=user_not_found');
    }
    redirect('/admin/certifications/new?err=db');
  }

  const session = await getSession();
  const created = await issueCertificate({
    fullName,
    track,
    scorePercent,
    notes: notesRaw ? notesRaw : null,
    userId: resolved.userId,
    createdByAdminUserId: session.userId ?? null,
    skillBreakdownJson: null,
  });

  if (!created) {
    redirect('/admin/certifications/new?err=db');
  }

  revalidatePath('/admin/certifications');
  redirect(`/admin/certifications/${created.id}`);
}

export async function revokeCertificationAction(formData: FormData) {
  if (!(await getIsAdmin())) {
    redirect('/logowanie?next=/admin/certifications');
  }

  const id = String(formData.get('id') ?? '').trim();
  if (!id) {
    redirect('/admin/certifications?err=missing_id');
  }

  const updated = await revokeCertificate(id);
  if (!updated) {
    redirect(`/admin/certifications/${encodeURIComponent(id)}?err=revoke_failed`);
  }

  revalidatePath('/admin/certifications');
  revalidatePath(`/admin/certifications/${id}`);
  redirect(`/admin/certifications/${id}?revoked=1`);
}

export async function assignCertificationUserAction(formData: FormData) {
  if (!(await getIsAdmin())) {
    redirect('/logowanie?next=/admin/certifications');
  }

  const id = String(formData.get('certificateRecordId') ?? '').trim();
  const assigneeEmailRaw = String(formData.get('assigneeEmail') ?? '');

  if (!id) {
    redirect('/admin/certifications?err=missing_id');
  }

  const resolved = await resolveCertificationUserIdByEmail(assigneeEmailRaw);
  if (!resolved.ok) {
    const q =
      resolved.error === 'email_invalid'
        ? 'err=email_invalid'
        : resolved.error === 'user_not_found'
          ? 'err=user_not_found'
          : 'err=db';
    redirect(`/admin/certifications/${encodeURIComponent(id)}?${q}`);
  }

  if (resolved.userId === null) {
    redirect(`/admin/certifications/${encodeURIComponent(id)}?err=assign_email_required`);
  }

  const updated = await assignCertificateOwnerIfUnassigned(id, resolved.userId);
  if (!updated) {
    redirect(`/admin/certifications/${encodeURIComponent(id)}?err=assign_failed`);
  }

  revalidatePath('/admin/certifications');
  revalidatePath(`/admin/certifications/${id}`);
  redirect(`/admin/certifications/${id}?assigned=1`);
}
