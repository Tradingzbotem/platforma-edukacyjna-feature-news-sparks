import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { transferFoundersToken } from '@/lib/founders-token/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z
  .object({
    targetEmail: z.string().email().optional(),
    targetUserId: z.string().min(1).optional(),
    note: z.string().max(500).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    const e = val.targetEmail?.trim();
    const id = val.targetUserId?.trim();
    if (!!e === !!id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Podaj dokładnie jedno: targetEmail albo targetUserId',
      });
    }
  });

/**
 * POST /api/founders-token/transfer
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
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

  const { targetEmail, targetUserId, note } = parsed.data;
  const result = await transferFoundersToken({
    fromUserId: session.userId,
    targetEmail: targetEmail?.trim().toLowerCase(),
    targetUserId: targetUserId?.trim(),
    note: note ?? null,
  });

  if (!result.ok) {
    const map: Record<typeof result.error, number> = {
      NO_DATABASE: 503,
      NO_TOKEN: 404,
      NOT_TRANSFERABLE: 403,
      SAME_USER: 400,
      TARGET_NOT_FOUND: 404,
      AMBIGUOUS_TARGET: 400,
    };
    return NextResponse.json({ ok: false, error: result.error }, { status: map[result.error] });
  }

  return NextResponse.json({ ok: true, token: result.token });
}
