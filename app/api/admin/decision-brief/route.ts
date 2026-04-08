import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getIsAdmin } from '@/lib/admin';
import { DECISION_BRIEF_ADMIN_SLUG } from '@/lib/decision-brief/constants';
import { normalizeBriefSensitivity } from '@/lib/decision-brief/sensitivity';
import { decisionBriefToJsonDto } from '@/lib/decision-brief/toJsonDto';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const assetInput = z.object({
  asset: z.string().min(1).max(64),
  baseDirection: z.string().max(500).optional().default(''),
  supports: z.string().max(2000).optional().default(''),
  weakens: z.string().max(2000).optional().default(''),
  sensitivity: z.string().max(32).optional().default('średnia'),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

const putBody = z.object({
  title: z.string().min(1).max(500),
  summary: z.string().max(20000).optional().default(''),
  narrativeAxis: z.string().max(20000).optional().default(''),
  context: z.string().max(20000).optional().default(''),
  onRadar: z.string().max(20000).optional().default(''),
  priorityOfDay: z.string().max(5000).optional().default(''),
  baseScenario: z.string().max(20000).optional().default(''),
  alternativeScenario: z.string().max(20000).optional().default(''),
  invalidation: z.string().max(20000).optional().default(''),
  isPublished: z.boolean(),
  assets: z.array(assetInput).max(50),
});

/**
 * GET /api/admin/decision-brief — rekord roboczy (slug `daily`), także gdy nieopublikowany.
 */
export async function GET() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }

  try {
    const row = await prisma.decisionBrief.findUnique({
      where: { slug: DECISION_BRIEF_ADMIN_SLUG },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!row) {
      return NextResponse.json({ ok: true, brief: null });
    }

    return NextResponse.json({ ok: true, brief: decisionBriefToJsonDto(row) });
  } catch (e) {
    console.error('[admin/decision-brief GET]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/decision-brief — zapis treści + aktywów; opcjonalna publikacja (wyłącza inne).
 */
export async function PUT(req: Request) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }

  let body: z.infer<typeof putBody>;
  try {
    const json = await req.json();
    body = putBody.parse(json);
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'invalid_body', detail: String(e) }, { status: 400 });
  }

  const slug = DECISION_BRIEF_ADMIN_SLUG;

  try {
    const existing = await prisma.decisionBrief.findUnique({ where: { slug } });

    let briefId: string;

    if (!existing) {
      const created = await prisma.decisionBrief.create({
        data: {
          slug,
          title: body.title,
          summary: body.summary,
          narrativeAxis: body.narrativeAxis,
          context: body.context,
          onRadar: body.onRadar,
          priorityOfDay: body.priorityOfDay,
          baseScenario: body.baseScenario,
          alternativeScenario: body.alternativeScenario,
          invalidation: body.invalidation,
          isPublished: false,
          publishedAt: null,
          assets: {
            create: body.assets.map((a, i) => ({
              asset: a.asset.trim(),
              baseDirection: a.baseDirection,
              supports: a.supports,
              weakens: a.weakens,
              sensitivity: normalizeBriefSensitivity(a.sensitivity),
              sortOrder: a.sortOrder ?? i,
            })),
          },
        },
      });
      briefId = created.id;
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.decisionBrief.update({
          where: { id: existing.id },
          data: {
            title: body.title,
            summary: body.summary,
            narrativeAxis: body.narrativeAxis,
            context: body.context,
            onRadar: body.onRadar,
            priorityOfDay: body.priorityOfDay,
            baseScenario: body.baseScenario,
            alternativeScenario: body.alternativeScenario,
            invalidation: body.invalidation,
          },
        });
        await tx.decisionBriefAsset.deleteMany({ where: { briefId: existing.id } });
        if (body.assets.length > 0) {
          await tx.decisionBriefAsset.createMany({
            data: body.assets.map((a, i) => ({
              briefId: existing.id,
              asset: a.asset.trim(),
              baseDirection: a.baseDirection,
              supports: a.supports,
              weakens: a.weakens,
              sensitivity: normalizeBriefSensitivity(a.sensitivity),
              sortOrder: a.sortOrder ?? i,
            })),
          });
        }
      });
      briefId = existing.id;
    }

    if (body.isPublished) {
      await prisma.$transaction(async (tx) => {
        await tx.decisionBrief.updateMany({
          data: { isPublished: false, publishedAt: null },
        });
        await tx.decisionBrief.update({
          where: { id: briefId },
          data: { isPublished: true, publishedAt: new Date() },
        });
      });
    } else {
      await prisma.decisionBrief.update({
        where: { id: briefId },
        data: { isPublished: false, publishedAt: null },
      });
    }

    const saved = await prisma.decisionBrief.findUniqueOrThrow({
      where: { id: briefId },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
    });

    revalidatePath('/rynek/brief-decyzyjny-mockup');

    return NextResponse.json({ ok: true, brief: decisionBriefToJsonDto(saved) });
  } catch (e) {
    console.error('[admin/decision-brief PUT]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
