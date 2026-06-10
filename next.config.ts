import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

// ─── Content-Security-Policy ────────────────────────────────────────────────
// This site is fully static (every page SSG), so a nonce-based "strict" CSP
// isn't viable — nonces require per-request dynamic rendering, which would undo
// the static-first architecture. Instead we ship a header-based policy that is
// tight on every directive; `script`/`style` fall back to 'unsafe-inline'
// because there's no per-request nonce to bind to. Even so, the host allow-lists
// (an injected <script src="evil.com"> is still blocked) plus object-src/base-uri/
// frame-ancestors/form-action/connect-src give real defence-in-depth.
//
// ROLLOUT: ships in **Report-Only** mode — it logs violations to the browser
// console and blocks nothing. Flip CSP_REPORT_ONLY to `false` to ENFORCE, but
// only after confirming the live deploy logs zero CSP violations while
// exercising: the contact form (reCAPTCHA), a YouTube embed, GTM/Analytics, and
// Speed Insights. (Some directives like upgrade-insecure-requests are inert in
// report-only mode — that's expected; they activate on enforce.)
const CSP_REPORT_ONLY = true;

// The Vercel toolbar / Live comments run ONLY on preview & dev deployments and
// load from vercel.live (+ Pusher websockets). Allow those origins on
// non-production builds so the toolbar works and doesn't flood the Report-Only
// console with preview-only noise — while keeping the production policy tight.
const isProduction = process.env.VERCEL_ENV === "production";
const live        = isProduction ? "" : " https://vercel.live";
const liveConnect = isProduction ? "" : " https://vercel.live wss://*.pusher.com https://*.pusher.com";
const liveImg     = isProduction ? "" : " https://vercel.live https://vercel.com";
const liveFont    = isProduction ? "" : " https://vercel.live https://assets.vercel.com";

// Google AdSense pulls scripts, frames, pixels and beacons from a broad set of
// Google ad domains (the creative itself can load from many of them). We start
// deliberately permissive here because the CSP is Report-Only — tighten from
// real violation reports before flipping to enforce. Leading space so these
// concatenate cleanly onto the directive strings below.
const adsScript  = " https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.googleadservices.com https://adservice.google.com https://*.adtrafficquality.google";
const adsImg     = " https://*.googlesyndication.com https://*.g.doubleclick.net https://*.doubleclick.net https://*.google.com https://*.gstatic.com https://*.adtrafficquality.google";
const adsConnect = " https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.g.doubleclick.net https://*.doubleclick.net https://*.google.com https://*.adtrafficquality.google";
const adsFrame   = " https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",          // clickjacking — complements X-Frame-Options
  "form-action 'self'",              // contact form posts to same-origin /api/contact
  // Scripts: app bundles (self) + Vercel + GTM/GA + reCAPTCHA. 'unsafe-inline'
  // covers Next's hydration scripts and the GTM consent-defaults inline script.
  // (Nonces would be stricter but require per-request rendering — incompatible
  // with this site's fully-static output.)
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://va.vercel-scripts.com${adsScript}${live}`,
  // Styles: Tailwind sheet (self) + React/next-image/reCAPTCHA inline styles.
  `style-src 'self' 'unsafe-inline'${live}`,
  // Images: local/optimised + YouTube thumbnails + GTM/GA tracking pixels.
  `img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.google.com https://www.gstatic.com${adsImg}${liveImg}`,
  `font-src 'self' data:${liveFont}`,  // Lora is self-hosted via next/font (no Google Fonts CDN)
  // XHR/fetch/beacons: GA/GTM collect + Vercel Speed-Insights vitals.
  `connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.google.com https://vitals.vercel-insights.com https://va.vercel-scripts.com${adsConnect}${liveConnect}`,
  // Iframes: YouTube embeds + reCAPTCHA challenge + AdSense ad frames.
  `frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://recaptcha.google.com${adsFrame}${live}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

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

  // ─── Legacy WordPress → new-slug redirects ────────────────────────────
  // The old WordPress site used different permalinks for some posts and a
  // nested category structure. Google's index and external backlinks still
  // point at those URLs; without these 301s they'd 404 on the new app.
  // Only slugs that actually CHANGED are listed — unchanged ones resolve
  // directly. Trailing-slash variants are handled by Next's normalisation,
  // so sources are written without a trailing slash.
  async redirects() {
    const moved: Array<[string, string]> = [
      // Posts (EN)
      ['/en/apple-oxidation-experiment', '/en/apple-oxidation'],
      ['/en/child-cognitive-development', '/en/your-childs-cognitive-development'],
      ['/en/engineering-stem-kids-activity-let-us-build-something', '/en/create-amazing-structures'],
      ['/en/how-to-make-an-origami-boat', '/en/how-to-make-origami-boat'],
      ['/en/stem-activity-kids-learn-programming-scratch-scratch', '/en/learn-programming-with-scratch'],
      ['/en/teach-child-colors-fun-way', '/en/learning-colors-how-to-teach-your-child-about-colors'],
      ['/en/toddler-first-three-months-after-second-year', '/en/what-to-expect-from-toddler-in-the-first-three-months-after-second-year'],
      ['/en/toilet-roll-christmas-tree', '/en/how-to-make-a-toilet-roll-christmas-tree'],
      // Posts (HR)
      ['/hr/baterija-od-krumpira-kako-napraviti', '/hr/kako-napraviti-bateriju-od-krumpira'],
      ['/hr/beba-dvanaest-mjeseci-starosti', '/hr/sto-ocekivati-od-djeteta-u-dvanaestom-mjesecu-zivota'],
      ['/hr/dijete-17-i-18-mjesec-zivota', '/hr/sto-ocekivati-od-djeteta-u-sedamnaestom-i-osamnaestom-mjesecu-zivota'],
      ['/hr/dijete-19-i-20-mjesec-zivota', '/hr/sto-ocekivati-od-djeteta-u-devetnaestom-i-dvadesetom-mjesecu-zivota'],
      ['/hr/dijete-21-i-22-mjesec', '/hr/sto-ocekivati-od-djeteta-u-dvadeset-prvom-i-dvadeset-drugom-mjesecu-zivota'],
      ['/hr/dijete-deseti-mjesec-zivota', '/hr/sto-ocekivati-od-djeteta-u-desetom-mjesecu-zivota'],
      ['/hr/dijete-deveti-mjesec-zivota', '/hr/sto-ocekivati-od-djeteta-u-devetom-mjesecu-zivota'],
      ['/hr/dijete-trinaesti-i-cetrnaesti-mjesec', '/hr/sto-ocekivati-od-djeteta-u-trinaestom-i-cetrnaestom-mjesecu-zivota'],
      ['/hr/djetete-dvije-godine-devet-mjeseci', '/hr/sto-ocekivati-od-djeteta-s-dvije-godine-i-devet-mjeseci'],
      ['/hr/djetete-petnaesti-i-sesnaesti-mjesecu-zivota', '/hr/sto-ocekivati-od-djeteta-u-petnaestom-i-sesnaestom-mjesecu-zivota'],
      ['/hr/drugi-mjesec-zivota', '/hr/sto-ocekivati-od-novorodenceta-u-drugom-mjesecu-zivota'],
      ['/hr/kako-uciti-o-polaritetu', '/hr/kako-uciti-o-polaritetu-koristeci-mlijeko-i-boje'],
      ['/hr/najzabavniji-nacin-kako-dijete-nauciti-o-bojama', '/hr/ucenje-boja-najzabavniji-nacin-kako-dijete-nauciti-o-bojama'],
      ['/hr/oksidacija-jabuke-eksperiment', '/hr/oksidacija-jabuke'],
      ['/hr/stem-aktivnost-za-djecu-iz-inzenjerstva-idemo-graditi', '/hr/kako-izgraditi-impresivne-gradevine'],
      ['/hr/ucenje-programiranja-za-djecu', '/hr/ucenje-programiranja-scratch'],
      // Nested WordPress category/permalink paths
      ['/hr/stem-hr/istrazimo-stem-podrucja', '/hr/istrazimo-stem-podrucja'],
      ['/hr/znanost/kako-napraviti-plastiku-kod-kuce-pomocu-mlijeka-i-octa', '/hr/kako-napraviti-plastiku-kod-kuce-pomocu-mlijeka-i-octa'],
      ['/en/category/child-development/first-year-of-childs-life', '/en/category/psychology'],
      ['/en/category/child-development/second-year-of-childs-life', '/en/category/psychology'],
      ['/hr/category/razvoj-djeteta/prva-godina-djetetovog-zivota', '/hr/category/psychology'],
      ['/hr/category/razvoj-djeteta/druga-godina-djetetovog-zivota', '/hr/category/psychology'],
      ['/en/category/stem-en/origami', '/en/tag/origami'],
      ['/hr/category/stem-hr/origami', '/hr/tag/origami'],
      // Old top-level WordPress "STEM" category — no 1:1 category in the new
      // taxonomy (STEM is split into Science/Engineering/Math/Technology), so
      // point it at the all-activities browse page, the closest equivalent.
      ['/en/category/stem-en', '/en/activities'],
      ['/hr/category/stem-hr', '/hr/activities'],
      // Tag slug rename
      ['/hr/tag/origami-hr', '/hr/tag/origami'],
      // Static pages renamed from WordPress (about page)
      ['/en/about-us', '/en/about'],
      ['/hr/o-nama', '/hr/about'],
      // Post slug corrected after migration (old interim slug 404'd external links)
      ['/en/learn-letters-and-numbers', '/en/learning-letters-for-preschoolers-activity'],
      ['/hr/ucenje-abecede-brojeva', '/hr/aktivnost-ucenja-slova-kod-predskolaca'],
    ];

    return moved.map(([source, destination]) => ({ source, destination, permanent: true }));
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

          // Content-Security-Policy (see contentSecurityPolicy above). Ships in
          // Report-Only mode; flip CSP_REPORT_ONLY to enforce.
          {
            key: CSP_REPORT_ONLY ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default withMDX(config);
