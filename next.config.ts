import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const config: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  // Pin the workspace root so Next.js doesn't mistake a stray parent-directory
  // lockfile for the workspace root. process.cwd() resolves to wherever
  // `next` is invoked from — i.e. the project root for npm scripts.
  turbopack: {
    root: process.cwd(),
  },

  images: {
    // Serve modern formats when the browser advertises support.
    // AVIF first (better compression), WebP fallback, original as last resort.
    formats: ['image/avif', 'image/webp'],

    // Cache optimised variants at the edge for a year.
    minimumCacheTTL: 60 * 60 * 24 * 365,

    // Restrict to the sizes we actually use (saves CDN spend).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Allow Next.js to proxy & optimise YouTube video thumbnails.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com',   pathname: '/vi/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/vi/**' },
    ],
  },

  // ─── Security headers ─────────────────────────────────────────────────
  // Defence-in-depth: each header closes one well-known attack class.
  // Applied to ALL routes via `source: '/(.*)'`.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Tell browsers to always use HTTPS for this domain (2 years, with subdomains + preload-list eligible).
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

          // Block this site from being framed by other origins (clickjacking).
          { key: 'X-Frame-Options', value: 'DENY' },

          // Prevent browsers from MIME-sniffing a response away from the declared content-type.
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // When navigating off-site, only send the origin (not the full URL with path/query).
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Explicitly opt out of powerful APIs we never use.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
          },

          // Cross-origin protections — modest values that don't break embeds (YouTube etc.).
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default withMDX(config);
