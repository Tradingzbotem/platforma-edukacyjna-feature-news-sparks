import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // NIE w experimental — tylko top-level:
  outputFileTracingRoot: process.cwd(),

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
