import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
	// Publishing workflow is disabled in the simplified schema.
	return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}


