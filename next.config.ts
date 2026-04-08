import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/quizy/knf", destination: "/quizy/regulacje", permanent: false },
      { source: "/quizy/cysec", destination: "/quizy/regulacje", permanent: false },
      { source: "/quizy/mifid", destination: "/quizy/regulacje", permanent: false },
    ];
  },

  // NIE w experimental — tylko top-level:
  outputFileTracingRoot: process.cwd(),

  /** TTF Noto (ścieżki runtime) — dołącz do trace funkcji generującej PDF. */
  outputFileTracingIncludes: {
    '/api/admin/certifications/[id]/pdf': [
      './lib/certifications/pdf/assets/noto-sans/NotoSans-Regular.ttf',
      './lib/certifications/pdf/assets/noto-sans/NotoSans-Bold.ttf',
      './lib/certifications/pdf/assets/noto-sans/NotoSans-Italic.ttf',
      './lib/certifications/pdf/assets/noto-sans/NotoSans-BoldItalic.ttf',
    ],
  },

  /**
   * Node-only / native deps: nie bundluj ich w funkcje serverless — inaczej Prisma + pg
   * potrafią się nie zainicjalizować na Vercel (getPrisma() → null), podczas gdy @vercel/postgres działa.
   */
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@react-pdf/render',
    '@react-pdf/pdfkit',
    '@react-pdf/layout',
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
  ],

  // experimental: { }, // cleaned: remove unknown keys to satisfy typing

  // Nie przerywaj builda przez ESLint/TS na Vercel
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
    ],
  },
};

export default nextConfig;
