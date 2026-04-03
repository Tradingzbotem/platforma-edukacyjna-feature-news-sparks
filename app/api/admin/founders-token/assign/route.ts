import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { assignFoundersTokenAdmin } from '@/lib/founders-token/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const foundersStatusSchema = z.enum(['active', 'pending', 'revoked', 'inactive']);

const bodySchema = z
  .object({
    code: z.string().min(1).max(120).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    imageUrl: z.string().max(2000).optional().nullable(),
    transferable: z.boolean().optional(),
    transferLocked: z.boolean().optional(),
    allowAccessWithoutNft: z.boolean().optional(),
    nftLabel: z.string().min(1).max(120).optional(),
    adminNotes: z.string().max(5000).optional().nullable(),
    status: foundersStatusSchema.optional(),
    benefitsJson: z.unknown().optional().nullable(),
    assignToEmail: z.string().email().optional(),
    assignToUserId: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    const e = val.assignToEmail?.trim();
    const id = val.assignToUserId?.trim();
    if (!!e === !!id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Podaj dokładnie jedno: assignToEmail albo assignToUserId',
      });
    }
  });

/**
 * POST /api/admin/founders-token/assign
 * Tworzy lub aktualizuje rekord Founders; bez `code` używa domyślnego `fxe-founders-{userId}`.
 */
export async function POST(req: NextRequest) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  if (!getPrisma()) {
    return NextResponse.json({ ok: false, error: 'DATABASE_UNAVAILABLE' }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
  }

  const session = await getSession();
  const grantedByAdminId = session.userId?.trim() || null;

  const {
    code,
    title,
    description,
    imageUrl,
    transferable,
    transferLocked,
    allowAccessWithoutNft,
    nftLabel,
    adminNotes,
    status,
    benefitsJson,
    assignToEmail,
    assignToUserId,
  } = parsed.data;

  const result = await assignFoundersTokenAdmin({
    code: code?.trim(),
    title,
    description,
    imageUrl: imageUrl ?? undefined,
    transferable,
    transferLocked,
    allowAccessWithoutNft,
    nftLabel: nftLabel?.trim(),
    adminNotes: adminNotes === null ? null : adminNotes,
    status,
    benefitsJson: benefitsJson === null ? null : benefitsJson,
    assignToEmail: assignToEmail?.trim().toLowerCase(),
    assignToUserId: assignToUserId?.trim(),
    grantedByAdminId,
  });

  if (!result.ok) {
    const status = result.error === 'NO_DATABASE' ? 503 : result.error === 'TARGET_NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, token: result.token });
}
