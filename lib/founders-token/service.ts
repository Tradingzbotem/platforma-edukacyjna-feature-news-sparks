import 'server-only';

import type { FoundersToken, FoundersTokenStatus, Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { findUserByEmail, findUserById } from '@/lib/db';

const STATUS_RANK: Record<FoundersTokenStatus, number> = {
  active: 0,
  pending: 1,
  revoked: 2,
  inactive: 3,
  transferred: 4,
};

function sortRowsForDisplay(rows: FoundersToken[]): FoundersToken[] {
  return [...rows].sort((a, b) => {
    const d = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (d !== 0) return d;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}

/** Aktywny dostęp aplikacyjny Founders — niezależny od planu FREE/STARTER/PRO/ELITE. */
export function isFoundersAccessActive(row: FoundersToken): boolean {
  if (row.status === 'active') return true;
  if (row.status === 'pending' && row.allowAccessWithoutNft) return true;
  return false;
}

export function canTransferFoundersToken(row: FoundersToken): boolean {
  return row.status === 'active' && row.transferable && !row.transferLocked;
}

export type FoundersTokenPublic = {
  id: string;
  code: string;
  title: string;
  description: string;
  imageUrl: string | null;
  benefits: unknown;
  status: FoundersTokenStatus;
  transferable: boolean;
  transferLocked: boolean;
  allowAccessWithoutNft: boolean;
  nftLabel: string;
  ownerUserId: string | null;
  accessActive: boolean;
  grantedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FoundersTokenAdminPublic = FoundersTokenPublic & {
  adminNotes: string | null;
  grantedByAdminId: string | null;
};

export type FoundersAccessSummary = {
  hasRecord: boolean;
  accessActive: boolean;
  status: FoundersTokenStatus | null;
  nftLabel: string | null;
  allowAccessWithoutNft: boolean;
};

export type FoundersTransferPublic = {
  id: string;
  tokenId: string;
  fromUserId: string | null;
  toUserId: string | null;
  note: string | null;
  createdAt: string;
};

function toPublicToken(row: FoundersToken): FoundersTokenPublic {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    benefits: row.benefitsJson ?? null,
    status: row.status,
    transferable: row.transferable,
    transferLocked: row.transferLocked,
    allowAccessWithoutNft: row.allowAccessWithoutNft,
    nftLabel: row.nftLabel,
    ownerUserId: row.ownerUserId,
    accessActive: isFoundersAccessActive(row),
    grantedAt: row.grantedAt ? row.grantedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toAdminPublicToken(row: FoundersToken): FoundersTokenAdminPublic {
  return {
    ...toPublicToken(row),
    adminNotes: row.adminNotes,
    grantedByAdminId: row.grantedByAdminId,
  };
}

async function loadFoundersRowsForOwner(userId: string): Promise<FoundersToken[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.foundersToken.findMany({
    where: { ownerUserId: userId },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Rekord Founders do wyświetlenia użytkownikowi (najpierw active, potem pending itd.).
 * Nie obejmuje przeniesionych tokenów (inny owner).
 */
export async function getFoundersTokenForUser(userId: string): Promise<FoundersTokenPublic | null> {
  const rows = await loadFoundersRowsForOwner(userId);
  if (rows.length === 0) return null;
  const best = sortRowsForDisplay(rows)[0];
  return toPublicToken(best);
}

/** Podsumowanie na karty SSR / plan — bez danych admin-only. */
export async function getFoundersAccess(userId: string): Promise<FoundersAccessSummary> {
  const token = await getFoundersTokenForUser(userId);
  if (!token) {
    return {
      hasRecord: false,
      accessActive: false,
      status: null,
      nftLabel: null,
      allowAccessWithoutNft: false,
    };
  }
  return {
    hasRecord: true,
    accessActive: token.accessActive,
    status: token.status,
    nftLabel: token.nftLabel,
    allowAccessWithoutNft: token.allowAccessWithoutNft,
  };
}

export async function hasFoundersAccess(userId: string): Promise<boolean> {
  const rows = await loadFoundersRowsForOwner(userId);
  return rows.some((r) => isFoundersAccessActive(r));
}

export async function getFoundersTokenAdminForUser(userId: string): Promise<FoundersTokenAdminPublic | null> {
  const rows = await loadFoundersRowsForOwner(userId);
  if (rows.length === 0) return null;
  return toAdminPublicToken(sortRowsForDisplay(rows)[0]);
}

export async function getTransferHistoryForToken(tokenId: string): Promise<FoundersTransferPublic[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const rows = await prisma.foundersTokenTransfer.findMany({
    where: { tokenId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    tokenId: r.tokenId,
    fromUserId: r.fromUserId,
    toUserId: r.toUserId,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type TransferFoundersTokenInput = {
  fromUserId: string;
  targetEmail?: string;
  targetUserId?: string;
  note?: string | null;
};

export type TransferFoundersTokenResult =
  | { ok: true; token: FoundersTokenPublic }
  | {
      ok: false;
      error:
        | 'NO_DATABASE'
        | 'NO_TOKEN'
        | 'NOT_TRANSFERABLE'
        | 'SAME_USER'
        | 'TARGET_NOT_FOUND'
        | 'AMBIGUOUS_TARGET';
    };

export async function transferFoundersToken(input: TransferFoundersTokenInput): Promise<TransferFoundersTokenResult> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: 'NO_DATABASE' };

  const { fromUserId, note } = input;
  const hasEmail = typeof input.targetEmail === 'string' && input.targetEmail.trim().length > 0;
  const hasId = typeof input.targetUserId === 'string' && input.targetUserId.trim().length > 0;
  if (hasEmail === hasId) {
    return { ok: false, error: 'AMBIGUOUS_TARGET' };
  }

  let toUserId: string;
  if (hasEmail) {
    const u = await findUserByEmail(input.targetEmail!.trim().toLowerCase());
    if (!u) return { ok: false, error: 'TARGET_NOT_FOUND' };
    toUserId = u.id;
  } else {
    const u = await findUserById(input.targetUserId!.trim());
    if (!u) return { ok: false, error: 'TARGET_NOT_FOUND' };
    toUserId = u.id;
  }

  if (toUserId === fromUserId) return { ok: false, error: 'SAME_USER' };

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const token = await tx.foundersToken.findFirst({
        where: { ownerUserId: fromUserId, status: 'active' },
        orderBy: { updatedAt: 'desc' },
      });
      if (!token) return { err: 'NO_TOKEN' as const };
      if (!canTransferFoundersToken(token)) return { err: 'NOT_TRANSFERABLE' as const };

      await tx.foundersTokenTransfer.create({
        data: {
          tokenId: token.id,
          fromUserId: fromUserId,
          toUserId,
          note: note?.trim() || null,
        },
      });

      const updated = await tx.foundersToken.update({
        where: { id: token.id },
        data: {
          ownerUserId: toUserId,
          status: 'active',
        },
      });
      return { row: updated };
    });

    if ('err' in outcome) {
      return { ok: false, error: outcome.err };
    }
    return { ok: true, token: toPublicToken(outcome.row) };
  } catch {
    return { ok: false, error: 'NO_TOKEN' };
  }
}

export type AssignFoundersTokenInput = {
  /** Unikalny kod slotu; jeśli pusty — generowany deterministycznie per użytkownik (szybkie nadanie z admina). */
  code?: string;
  title?: string;
  description?: string;
  imageUrl?: string | null;
  transferable?: boolean;
  transferLocked?: boolean;
  allowAccessWithoutNft?: boolean;
  nftLabel?: string;
  adminNotes?: string | null;
  /** Ręczna zmiana statusu członkostwa (bez blockchain). */
  status?: Extract<FoundersTokenStatus, 'active' | 'pending' | 'revoked' | 'inactive'>;
  benefitsJson?: Prisma.InputJsonValue | null;
  assignToEmail?: string;
  assignToUserId?: string;
  grantedByAdminId?: string | null;
};

export type AssignFoundersTokenResult =
  | { ok: true; token: FoundersTokenAdminPublic }
  | { ok: false; error: 'NO_DATABASE' | 'TARGET_NOT_FOUND' | 'AMBIGUOUS_TARGET' | 'INVALID_CODE' };

export async function assignFoundersTokenAdmin(input: AssignFoundersTokenInput): Promise<AssignFoundersTokenResult> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: 'NO_DATABASE' };

  const hasEmail = typeof input.assignToEmail === 'string' && input.assignToEmail.trim().length > 0;
  const hasId = typeof input.assignToUserId === 'string' && input.assignToUserId.trim().length > 0;
  if (hasEmail === hasId) return { ok: false, error: 'AMBIGUOUS_TARGET' };

  let ownerUserId: string;
  if (hasEmail) {
    const u = await findUserByEmail(input.assignToEmail!.trim().toLowerCase());
    if (!u) return { ok: false, error: 'TARGET_NOT_FOUND' };
    ownerUserId = u.id;
  } else {
    const u = await findUserById(input.assignToUserId!.trim());
    if (!u) return { ok: false, error: 'TARGET_NOT_FOUND' };
    ownerUserId = u.id;
  }

  const code = (input.code?.trim() || `fxe-founders-${ownerUserId}`).trim();
  if (!code) return { ok: false, error: 'INVALID_CODE' };

  const title = input.title?.trim() || 'Founders';
  const description = input.description?.trim() ?? '';
  const transferable = input.transferable ?? true;
  const transferLocked = input.transferLocked ?? false;
  const allowAccessWithoutNft = input.allowAccessWithoutNft ?? false;
  const nftLabel = input.nftLabel?.trim() || 'Founders';
  const status: FoundersTokenStatus = input.status ?? 'active';
  const adminNotes = input.adminNotes === undefined ? undefined : input.adminNotes?.trim() || null;
  const now = new Date();

  const row = await prisma.foundersToken.upsert({
    where: { code },
    create: {
      code,
      title,
      description,
      imageUrl: input.imageUrl?.trim() || null,
      benefitsJson: input.benefitsJson ?? undefined,
      status,
      transferable,
      transferLocked,
      allowAccessWithoutNft,
      nftLabel,
      ownerUserId,
      grantedByAdminId: input.grantedByAdminId?.trim() || null,
      grantedAt: now,
      adminNotes: adminNotes ?? null,
    },
    update: {
      title,
      description,
      imageUrl: input.imageUrl === undefined ? undefined : input.imageUrl?.trim() || null,
      benefitsJson: input.benefitsJson === undefined ? undefined : input.benefitsJson,
      transferable,
      transferLocked,
      allowAccessWithoutNft,
      nftLabel,
      ownerUserId,
      status,
      grantedByAdminId: input.grantedByAdminId === undefined ? undefined : input.grantedByAdminId?.trim() || null,
      grantedAt: now,
      adminNotes: adminNotes === undefined ? undefined : adminNotes,
    },
  });

  return { ok: true, token: toAdminPublicToken(row) };
}
