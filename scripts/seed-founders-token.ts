/**
 * Tworzy przykładowy Founders Pass (Prisma).
 *
 * Użycie:
 *   npx tsx scripts/seed-founders-token.ts --unassigned
 *   npx tsx scripts/seed-founders-token.ts --email=user@example.com
 *
 * Wymaga DATABASE_URL lub POSTGRES_URL (jak reszta projektu).
 */

import { findUserByEmail } from '../lib/db';

function getDatabaseUrl(): string | null {
  const u =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    (process.env as { POSTGRES_PRISMA_URL?: string }).POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  return u?.trim() || null;
}

async function main() {
  const args = process.argv.slice(2);
  const unassigned = args.includes('--unassigned');
  let email: string | null = null;
  const ei = args.indexOf('--email');
  if (ei >= 0 && args[ei + 1]) {
    email = String(args[ei + 1]).trim().toLowerCase();
  }

  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    console.error('Brak DATABASE_URL / POSTGRES_URL. Ustaw zmienne środowiskowe i spróbuj ponownie.');
    process.exit(1);
  }

  process.env.DATABASE_URL = dbUrl;
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  let ownerUserId: string | null = null;
  if (!unassigned && !email) {
    console.error('Podaj --email=user@example.com albo --unassigned (token bez właściciela).');
    process.exit(1);
  }

  if (!unassigned) {
    const user = await findUserByEmail(email);
    if (!user) {
      console.error(`Nie znaleziono użytkownika: ${email}`);
      process.exit(1);
    }
    ownerUserId = user.id;
  }

  const code = 'FXF-0001';
  const token = await prisma.foundersToken.upsert({
    where: { code },
    create: {
      code,
      title: 'Founders Pass — seed',
      description: 'Przykładowy wewnętrzny pass utworzony skryptem seed.',
      status: 'active',
      transferable: true,
      ownerUserId,
      benefitsJson: ['Pełny dostęp do wskazanego modułu (przykład)', 'Możliwość transferu wewnątrz platformy'],
    },
    update: {
      title: 'Founders Pass — seed',
      description: 'Przykładowy wewnętrzny pass utworzony skryptem seed.',
      status: 'active',
      transferable: true,
      ownerUserId,
      benefitsJson: ['Pełny dostęp do wskazanego modułu (przykład)', 'Możliwość transferu wewnątrz platformy'],
    },
  });

  console.log('OK — FoundersToken:', {
    id: token.id,
    code: token.code,
    ownerUserId: token.ownerUserId,
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
