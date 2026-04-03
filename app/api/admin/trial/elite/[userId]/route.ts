import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { deleteEliteTrial } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * DELETE /api/admin/trial/elite/[userId]
 * Admin deletes a trial request
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'INVALID_USER_ID' }, { status: 400 });
    }

    await deleteEliteTrial(userId);

    return NextResponse.json({ ok: true, message: 'Trial request deleted' });
  } catch (error: any) {
    console.error('Error deleting trial:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
