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
};

export default withMDX(config);
