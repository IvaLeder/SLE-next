import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const config: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  // Pin the workspace root to this project so Next.js doesn't mistake a stray
  // /Users/iva/package-lock.json for the workspace root.
  turbopack: {
    root: '/Users/iva/my-blog',
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
  },
};

export default withMDX(config);
