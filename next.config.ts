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
    // Serve images as-is, bypassing Vercel's optimizer. The Hobby plan's
    // monthly transformation quota was exhausted (the optimizer 402s —
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED — and new images break site-
    // wide). Our images are already pre-sized and compressed (~50 KB average:
    // ≤700px photos, palette-PNG diagrams), so optimization adds little here.
    // If the project ever moves to a paid plan, restore the previous tuning
    // (formats/deviceSizes/remotePatterns) from git history.
    unoptimized: true,
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
      // Homepage Wordpress
      ['/en/stem-little-explorers-stem-activities-kids', '/en'],
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
      ['/en/category/stem-en/science', '/en/category/science'],
      ['/en/category/stem-en/stem-engineering', '/en/category/engineering'],
      ['/hr/category/stem-hr/inzenjerstvo', '/hr/category/engineering'],
      ['/hr/category/stem-hr/inzenjerstvo', '/hr/category/engineering'],
      ['/hr/tag/kodiranje', '/hr/tag/coding'],
      ['/hr/tag/kemija', '/hr/tag/chemistry'],
      ['/hr/tag/fizika', '/hr/tag/physics'],
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
      ['/hr/articles', '/hr'],
      ['/en/articles', '/en'],
      ['/en/feed', '/rss-en.xml'],
      ['/hr/feed', '/rss-hr.xml'],
      ['/en/tag/sensomotoric-development', '/en/tag/sensory'],
      ['/hr/tag/senzomotorni-razvoj', '/hr/tag/sensory'],
      ['/en/kako-napraviti-raketu-od-sibica', '/en/how-to-make-match-head-rocket'],
      ['/en/contact-us', '/en/contact'],
      ['/en/tag/development-stages', '/en/tag/milestone'],
      ['/hr/how-to-make-colored-rice', '/hr/kako-napraviti-obojanu-rizu'],
      ['/hr/develop-math-reasoning-skills-origami', '/hr/kako-razviti-matematicki-nacin-razmisljanja-uz-origami'],
      ['/hr/origami-vjetrenjaca', '/hr/kako-napraviti-origami-vjetrenjacu-od-papira'],
      ['/hr/18-signs-gifted-child', '/hr/18-znakova-nadarenosti-kod-djeteta'],
      ['/hr/how-to-make-potato-battery', '/hr/kako-napraviti-bateriju-od-krumpira'],
      ['/hr/stem-mali-istrazivaci-stem-aktivnosti-za-djecu', '/hr'],
      ['/en/tag/food-science', '/en/tag/chemistry'],
      ['/make-cardboard-clock-learn-tell-time', '/en/make-cardboard-clock-learn-tell-time'],
      ['/en/category/stem-en/math', '/en/category/math'],
      ['/hr/category/stem-hr/math', '/hr/category/math'],
      ['/en/kako-izgraditi-impresivne-gradevine', '/en/create-amazing-structures'],
      ['/hr/tag/aktivnost/', '/hr/tag/activities'],
      ['/en/dvorac-od-kartona', '/en/toilet-roll-craft-cardboard-castle'],
      ['/5-amazing-balloon-experiments', '/en/5-amazing-balloon-experiments'],
      ['/make-homemade-playdough-learn-science', '/en/make-homemade-playdough-learn-science'],
      ['/make-christmas-reindeer-decoration', '/en/make-christmas-reindeer-decoration'],
      ['/hr/make-popsicle-catapult', '/hr/katapult-od-stapica-za-sladoled'],
      ['/improve-childs-working-memory', '/en/improve-childs-working-memory'],
      ['/sensory-bag-child-sensorimotor-development', '/en/sensory-bag-child-sensorimotor-development'],
      ['/hr/how-to-demonstrate-refraction', '/hr/demonstracija-refrakcije'],
      ['/learn-letters-and-numbers', '/en/learning-letters-for-preschoolers-activity'],
      ['/child-cognitive-development', '/en/your-childs-cognitive-development'],
      ['/how-to-make-homemade-rocket-vinegar-baking-soda', '/en/how-to-make-homemade-rocket-vinegar-baking-soda'],
      ['/hr/tag/inzenjerstvo/', '/hr/category/engineering'],
      ['/en/kako-napraviti-origami-kucicu', '/en/how-to-make-origami-house'],
      ['/candle-in-the-vacuum-experiment', '/en/candle-in-the-vacuum-experiment'],
      ['/hr/how-to-make-origami-pig', '/hr/kako-napraviti-origami-prascica'],
      ['/hr/how-to-make-fidget-spinner', '/hr/kako-napraviti-fidget-spinner'],
      ['/en/oksidacija-jabuke', '/en/apple-oxidation'],
      ['/hr/make-and-solve-tower-of-hanoi', '/hr/kako-napraviti-rijesiti-hanoi-toranj']
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
