This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment

Create `.env.local` with:

```
POSTGRES_URL=postgresql://...
NEXT_PUBLIC_CHALLENGE_TEST=0
# optional
OPENAI_API_KEY=
FINNHUB_API_KEY=
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Observability & Debugging

- Health: `/api/dbcheck` returns simple JSON
- Session preview (dev): `/api/auth/session`
- Challenge APIs:
  - Picks listing: `GET /api/challenge/picks` (uses session user)
  - Global ranking: `GET /api/challenge/ranking`
  - After deploy: enable `NEXT_PUBLIC_CHALLENGE_TEST=1`, make one pick, wait ~60s, then verify `/konto`, picks, and ranking

## Database migrations

Run once on production (psql or Neon SQL console):

```sql
\i db/migrations/001_challenge_picks.sql
```

The migration is idempotent (CREATE IF NOT EXISTS + IF NOT EXISTS indexes).

<!-- Notes -->

### Cron timing

- Codzienny cron uruchamia "Info dnia (AI)" o 06:00 UTC, co odpowiada ok. 08:00 czasu CY.
