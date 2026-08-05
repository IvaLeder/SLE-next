import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import fs from 'node:fs';
import path from 'node:path';

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

  // Draft previews (/{lang}/draft/[slug]) render on demand at request time,
  // so the serverless function needs the MDX sources at runtime — everything
  // else reads them at build time only. Without this, tracing may miss the
  // fs.readdirSync directory scan and drafts would 404 in production.
  outputFileTracingIncludes: {
    // The asset manifest is read with fs at request time (src/lib/assets),
    // which tracing can't statically see — include it alongside the MDX.
    '/en/draft/[slug]': ['./src/content/posts/**/*', './src/lib/assets/manifest.json'],
    '/hr/draft/[slug]': ['./src/content/posts/**/*', './src/lib/assets/manifest.json'],
  },

  // localImageDimensions() (mdx/index.tsx) reads `public/<dynamic src>`, so
  // the tracer conservatively globs ALL of public/images into every [slug]
  // function — with the asset pipeline's generated variants that's >250 MB
  // and Vercel rejects the function. Images are served from the CDN, never
  // from function bundles, and image dimensions come from the traced
  // manifest; the fs fallback simply misses at runtime for unknown files
  // (caught → letterbox, same as before the pipeline).
  outputFileTracingExcludes: {
    '*': ['./public/images/**'],
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
      // Milestone tag retired in favour of the curated month-by-month pillar.
      ['/en/tag/milestone', '/en/baby-development-month-by-month'],
      ['/hr/tag/milestone', '/hr/razvoj-djeteta-po-mjesecima'],
      // Homepage Wordpress
      ['/en/stem-little-explorers-stem-activities-kids', '/en'],
      // Posts (EN)
      ['/en/apple-oxidation-experiment', '/en/apple-oxidation'],
      ['/en/child-cognitive-development', '/en/your-childs-cognitive-development'],
      ['/en/engineering-stem-kids-activity-let-us-build-something', '/en/create-amazing-structures'],
      ['/en/explore-number-pi-π', '/en/explore-number-pi'],
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
      ['/hr/istrazimo-broj-pi-π', '/hr/istrazimo-broj-pi'],
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
      ['/hr/category/stem-hr/znanost', '/hr/category/science'],
      ['/hr/category/stem-hr/matematika', '/hr/category/math'],
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
      // NB: point straight at the pillar, NOT at /{lang}/tag/milestone —
      // that tag is itself redirected (above), so chaining here would 308→308.
      ['/en/tag/development-stages', '/en/baby-development-month-by-month'],
      ['/hr/how-to-make-colored-rice', '/hr/kako-napraviti-obojanu-rizu'],
      ['/hr/develop-math-reasoning-skills-origami', '/hr/kako-razviti-matematicki-nacin-razmisljanja-uz-origami'],
      ['/hr/origami-vjetrenjaca', '/hr/kako-napraviti-origami-vjetrenjacu-od-papira'],
      ['/hr/18-signs-gifted-child', '/hr/18-znakova-nadarenosti-kod-djeteta'],
      ['/hr/how-to-make-potato-battery', '/hr/kako-napraviti-bateriju-od-krumpira'],
      ['/hr/stem-mali-istrazivaci-stem-aktivnosti-za-djecu', '/hr'],
      ['/en/tag/food-science', '/en/tag/chemistry'],
      ['/en/tag/paper-activities', '/en/tag/origami'],
      ['/en/tag/technology', '/en/category/technology'],
      ['/make-cardboard-clock-learn-tell-time', '/en/make-cardboard-clock-learn-tell-time'],
      ['/en/category/stem-en/math', '/en/category/math'],
      ['/hr/category/stem-hr/math', '/hr/category/math'],
      ['/en/kako-izgraditi-impresivne-gradevine', '/en/create-amazing-structures'],
      // Sources must be written WITHOUT a trailing slash — Next normalises the
      // request (308 strips the slash) BEFORE matching this list, so a source
      // like '/hr/tag/aktivnost/' never matches anything.
      ['/hr/tag/aktivnost', '/hr/tag/activity'],
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
      ['/hr/tag/inzenjerstvo', '/hr/category/engineering'],
      ['/en/kako-napraviti-origami-kucicu', '/en/how-to-make-origami-house'],
      ['/candle-in-the-vacuum-experiment', '/en/candle-in-the-vacuum-experiment'],
      ['/hr/how-to-make-origami-pig', '/hr/kako-napraviti-origami-prascica'],
      ['/hr/how-to-make-fidget-spinner', '/hr/kako-napraviti-fidget-spinner'],
      ['/en/oksidacija-jabuke', '/en/apple-oxidation'],
      ['/hr/make-and-solve-tower-of-hanoi', '/hr/kako-napraviti-rijesiti-hanoi-toranj'],
      // ─── Legacy WordPress tag/category/author URLs still crawled by Google
      // (surfaced as 404s in the July 2026 Search Console export). Each maps
      // to the closest live equivalent in the new taxonomy (KNOWN_TAGS uses
      // shared ASCII slugs, so old localised WP tags have no direct match).
      ['/en/tag/engineering', '/en/category/engineering'],
      ['/en/tag/cardboard-activities', '/en/tag/activity'],
      ['/en/tag/baking-soda', '/en/tag/chemistry'],
      ['/en/tag/stem-preschoolers', '/en/activities'],
      ['/en/tag/stem-toddlers', '/en/activities'],
      ['/en/tag/stem-activities-2nd-grade', '/en/activities'],
      ['/en/tag/stem-activities-3rd-grade', '/en/activities'],
      ['/en/tag/stem-activities-4th-grade', '/en/activities'],
      ['/en/tag/stem-activities-6th-grade', '/en/activities'],
      ['/en/tag/working-memory', '/en/improve-childs-working-memory'],
      ['/en/category/child-development', '/en/category/psychology'],
      ['/en/cookie-policy', '/en/privacy'],
      ['/famous-people/grace-hopper', '/en'],
      ['/hr/category/razvoj-djeteta', '/hr/category/psychology'],
      ['/hr/category/psihologija', '/hr/category/psychology'],
      ['/hr/category/uncategorized', '/hr/activities'],
      ['/hr/author/admin', '/hr/about'],
      ['/hr/tag/brojevi', '/hr/category/math'],
      ['/hr/tag/vjezbe', '/hr/tag/activity'],
      ['/hr/tag/faze-razvoja', '/hr/razvoj-djeteta-po-mjesecima'],
      ['/hr/tag/znanstvena-metoda', '/hr/tag/experiment'],
      ['/hr/tag/stem-aktivnosti-todleri', '/hr/activities'],
      ['/hr/tag/stem-aktivnosti-6-razred', '/hr/activities'],
      ['/hr/tag/slova', '/hr/aktivnost-ucenja-slova-kod-predskolaca'],
      ['/hr/tag/ucenje', '/hr/activities'],
      ['/hr/tag/algoritmi', '/hr/tag/coding'],
      ['/hr/tag/programiranje', '/hr/tag/coding'],
      ['/hr/tag/raketa', '/hr/kako-napraviti-raketu-pomocu-octa-i-sode-bikarbone'],
      ['/hr/tag/kognitivni-razvoj', '/hr/tag/child-development'],
      ['/hr/tag/motoricke-vjestine', '/hr/tag/child-development'],
      ['/hr/tag/tantrum', '/hr/izazovi-roditeljstva-temper-tantrum'],
      // ─── Remaining 404s from the 2026-07-15 Search Console export (sweep of
      // all old www URLs still in Google's index after the June 1 migration).
      // Two are ARTICLES whose slug changed without a redirect; the rest are
      // WP tag/category/author archives mapped to the closest live equivalent.
      // Posts
      ['/hr/dijete-tri-godine', '/hr/dijete-3-godine'],
      ['/en/speech-development-tips', '/en/how-to-encourage-speech-development-in-toddlers-and-children'],
      // EN tags
      ['/en/tag/stem-activities-1st-grade', '/en/activities'],
      ['/en/tag/stem-activities-5th-grade', '/en/activities'],
      ['/en/tag/stem-kindergarten', '/en/activities'],
      ['/en/tag/stem-en', '/en/activities'],
      ['/en/tag/newborn', '/en/baby-development-month-by-month'],
      ['/en/tag/logical-skills', '/en/category/math'],
      ['/en/tag/scientific-method', '/en/tag/experiment'],
      ['/en/tag/scratch', '/en/learn-programming-with-scratch'],
      ['/en/tag/learning-to-program', '/en/tag/coding'],
      // EN categories / pages
      ['/en/category/first-year-of-childs-life', '/en/category/psychology'],
      ['/en/category/second-year-of-childs-life', '/en/category/psychology'],
      ['/en/category/third-year-of-child-life', '/en/category/psychology'],
      ['/en/category/stem-en/technology', '/en/category/technology'],
      ['/en/about-us/stem-little-explorers-privacy-policy', '/en/privacy'],
      ['/en/author/ierceg', '/en/about'],
      // HR tags
      ['/hr/tag/stem-aktivnosti-predskolska-dob', '/hr/activities'],
      ['/hr/tag/stem-aktivnosti-vrticka-dob', '/hr/activities'],
      ['/hr/tag/stem-aktivnosti-prvi-razred', '/hr/activities'],
      ['/hr/tag/stem-aktivnosti-drugi-razred', '/hr/activities'],
      ['/hr/tag/stem-aktivnosti-treci-razred', '/hr/activities'],
      ['/hr/tag/stem-aktivnosti-4-razred', '/hr/activities'],
      ['/hr/tag/stem-aktivnosti-peti-razred', '/hr/activities'],
      ['/hr/tag/znanost-o-hrani', '/hr/tag/chemistry'],
      ['/hr/tag/kuhinjski-eksperiment', '/hr/tag/chemistry'],
      ['/hr/tag/soda-bikarbona', '/hr/tag/chemistry'],
      ['/hr/tag/ocat', '/hr/tag/chemistry'],
      ['/hr/tag/aktivnosti-s-kartonom', '/hr/tag/activity'],
      ['/hr/tag/aktivnosti-od-papira', '/hr/tag/origami'],
      ['/hr/tag/kreativnost', '/hr/tag/activity'],
      ['/hr/tag/eksperiment', '/hr/tag/experiment'],
      ['/hr/tag/znanost', '/hr/category/science'],
      ['/hr/tag/gradnja', '/hr/category/engineering'],
      ['/hr/tag/tehnologija', '/hr/category/technology'],
      ['/hr/tag/logicke-vjestine', '/hr/category/math'],
      ['/hr/tag/djeca', '/hr/tag/parenting'],
      ['/hr/tag/roditeljstvo', '/hr/tag/parenting'],
      ['/hr/tag/razvoj-djeteta', '/hr/tag/child-development'],
      ['/hr/tag/senzorna-igra', '/hr/tag/sensory'],
      ['/hr/tag/voda', '/hr/magicne-karakteristike-vode'],
      ['/hr/tag/boje', '/hr/ucenje-boja-najzabavniji-nacin-kako-dijete-nauciti-o-bojama'],
      ['/hr/tag/radno-pamcenje', '/hr/kako-poboljsati-radno-pamcenje-vaseg-djeteta'],
      // HR categories / pages
      ['/hr/category/prva-godina-djetetovog-zivota', '/hr/category/psychology'],
      ['/hr/category/druga-godina-djetetovog-zivota', '/hr/category/psychology'],
      ['/hr/category/treca-godina-djetetovog-zivota', '/hr/category/psychology'],
      ['/hr/category/stem-hr/tehnologija', '/hr/category/technology'],
      ['/hr/clanci', '/hr'],
      ['/hr/o-nama/pravila-o-privatnosti', '/hr/privacy'],
      ['/hr/author/ierceg', '/hr/about'],
      // Cross-language URL Google discovered somewhere (GSC 5xx report)
      ['/en/kako-demonstrirati-difuziju', '/en/how-to-demonstrate-diffusion'],
      // ─── Still-404 archives from the 2026-07-28 Search Console validation
      // export. All old WordPress tag/category/author archives; the HR twin of
      // most of these was already mapped above, so these are the EN halves
      // that were missed (plus two HR stragglers). Same rule as before: point
      // at the closest live equivalent in the new taxonomy.
      ['/en/tag/children', '/en/tag/parenting'],
      ['/en/tag/cognitive-development', '/en/tag/child-development'],
      ['/en/tag/motor-skills', '/en/tag/child-development'],
      ['/en/tag/creativity', '/en/tag/activity'],
      ['/en/tag/excercises', '/en/tag/activity'],
      ['/en/tag/kitchen-experiment', '/en/tag/chemistry'],
      ['/en/tag/vinegar', '/en/tag/chemistry'],
      ['/en/tag/learning', '/en/activities'],
      ['/en/tag/numbers', '/en/category/math'],
      ['/en/tag/colors', '/en/learning-colors-how-to-teach-your-child-about-colors'],
      ['/en/tag/memory', '/en/improve-childs-working-memory'],
      ['/en/tag/water', '/en/the-amazing-properties-of-water'],
      ['/en/tag/tantrum-en', '/en/challenges-parent-temper-tantrum'],
      ['/en/author/admin', '/en/about'],
      ['/hr/tag/matematika', '/hr/category/math'],
      ['/hr/tag/ucenje-programiranja', '/hr/tag/coding'],
      // Nested year-of-life categories. first/second (EN) and prva/druga (HR)
      // were already mapped; these complete both sets.
      ['/en/category/child-development/third-year-of-child-life', '/en/category/psychology'],
      ['/hr/category/razvoj-djeteta/treca-godina-djetetovog-zivota', '/hr/category/psychology'],
      ['/hr/category/razvoj-djeteta/cetvrta-godina-djetetovog-zivota', '/hr/category/psychology'],
      // Site-wide WordPress comment feed, reached via the /feed rule below.
      ['/en/comments', '/en'],
      ['/hr/comments', '/hr'],
      // Only ever crawled with a /feed suffix, so they have no entry above but
      // the generic /feed rule below will land on them.
      ['/hr/tag/pamcenje', '/hr/kako-poboljsati-radno-pamcenje-vaseg-djeteta'],
      ['/en/category/uncategorized-en', '/en/activities'],
    ];

    // ─── Bare (language-less) post URLs ──────────────────────────────────
    // The original WordPress site served posts at the domain root, before
    // the /en + /hr split. Google still crawls those old paths (they show
    // up as language-less URLs in Search Console's 404 report) and old
    // backlinks point there. Generate one 301 per post from the content
    // directory so the list can never drift as posts are added or renamed.
    // Drafts are skipped; on an EN/HR slug collision the EN post wins.
    const seen = new Set(moved.map(([source]) => source));
    const addBare = (source: string, destination: string) => {
      if (seen.has(source)) return;
      seen.add(source);
      moved.push([source, destination]);
    };
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    // Published posts, indexed both ways, for the cross-language pass below.
    const keyBySlug: Record<'en' | 'hr', Map<string, string>> = { en: new Map(), hr: new Map() };
    const slugByKey: Record<'en' | 'hr', Map<string, string>> = { en: new Map(), hr: new Map() };
    for (const lang of ['en', 'hr'] as const) {
      for (const file of fs.readdirSync(path.join(postsDir, lang))) {
        if (!/\.mdx?$/.test(file)) continue;
        const raw = fs.readFileSync(path.join(postsDir, lang, file), 'utf8');
        if (/^draft:\s*true/m.test(raw)) continue;
        const slug = file.replace(/\.mdx?$/, '');
        addBare(`/${slug}`, `/${lang}/${slug}`);
        // NB: sources are BOM-prefixed, so anchor on ^ in multiline mode
        // rather than trying to parse the frontmatter block as a whole.
        const key = raw.match(/^translationKey:\s*["']?([^"'\r\n]+)/m)?.[1].trim();
        if (key) {
          keyBySlug[lang].set(slug, key);
          slugByKey[lang].set(key, slug);
        }
      }
    }
    // Renamed posts existed at the root under their OLD slug — reuse the
    // /en|/hr mappings above to send those bare variants straight to the
    // final destination (single hop, no chain through the prefixed 301).
    for (const [source, destination] of [...moved]) {
      const post = source.match(/^\/(?:en|hr)\/([^/]+)$/);
      if (post) addBare(`/${post[1]}`, destination);
    }

    // ─── Cross-language slug URLs ────────────────────────────────────────
    // Google holds a large set of /hr/<english-slug> and /en/<croatian-slug>
    // URLs (106 of them were still 404ing in the 2026-07-28 validation
    // export) — the migration's language split left posts briefly reachable
    // under either prefix. Each goes to the SAME post in the language the
    // prefix asks for, resolved through `translationKey`, which is exactly
    // what the hand-written entries above already do one at a time.
    //
    // MUST run after the bare-slug passes: those derive `/slug` sources from
    // every `/en|/hr` entry in `moved`, and a cross-language entry would make
    // them derive the wrong language for the bare form.
    //
    // A slug that is a real post in the target language is skipped, so this
    // can never shadow a live route.
    for (const lang of ['en', 'hr'] as const) {
      const other = lang === 'en' ? 'hr' : 'en';
      for (const [foreignSlug, key] of keyBySlug[other]) {
        if (keyBySlug[lang].has(foreignSlug)) continue;
        const own = slugByKey[lang].get(key);
        if (own) addBare(`/${lang}/${foreignSlug}`, `/${lang}/${own}`);
      }
    }

    // ─── Legacy WordPress media (/wp-content/uploads/…) ──────────────────
    // The old site served every image from /wp-content/uploads/YYYY/MM/, and
    // the migration kept the original filenames — so the same file now lives
    // at /images/posts/<filename>. Google Images still holds the old URLs
    // (image search is a large share of clicks), and they currently return a
    // hard error instead of pointing at the live file.
    //
    // Two rules, ORDER MATTERS. WordPress also generated resized derivatives
    // with a `-WIDTHxHEIGHT` suffix (…-300x169.jpg) and those outnumber the
    // full-size originals ~2:1 in Google's view of the old site, so the
    // suffix-stripping rule has to be tried first; the plain rule then
    // catches the originals. Filenames with no counterpart in
    // public/images/posts land on a 404, which is a cleaner signal for a
    // genuinely gone file than the error they return today.
    //
    // Vercel currently has no custom firewall rule for /wp-content/uploads/*,
    // so these application redirects are reachable at the edge. Automatic
    // DDoS mitigation does not need a matching allow rule.
    // ─── WordPress URL suffixes ──────────────────────────────────────────
    // Every WP post/tag/category was also served at `…/amp/` (AMP version)
    // and `…/feed/` (per-page comment feed). Both suffixes appear right
    // across the Search Console 404 export. One rule each strips the suffix
    // and hands the request to the parent page, which then follows whatever
    // mapping above applies to it.
    //
    // The AMP variants matter most — those were real, indexable pages with
    // their own history. The feed variants never ranked; stripping them is
    // mainly so the 404 report stops drowning known-dead noise and a genuine
    // new 404 stands out.
    const wpSuffixes = [
      {
        source: '/:lang(en|hr)/:path*/amp',
        destination: '/:lang/:path*',
        permanent: true,
      },
      {
        source: '/:lang(en|hr)/:path*/feed',
        destination: '/:lang/:path*',
        permanent: true,
      },
    ];

    // A small set of migrated files changed only by case, diacritics, a removed
    // π character, compression suffix, or output format. The two generic rules
    // below cannot express those filename changes, so keep the exceptions in a
    // compact data table and generate both original + WP-resized aliases.
    const legacyMediaAliasFiles: Array<{
      year: string;
      month: string;
      oldStem: string;
      oldExt: string;
      destination: string;
      derivatives?: boolean;
    }> = [
      {
        year: '2017', month: '07',
        oldStem: '5-odličnih-eksperimenata-s-balonima-Pocetna-Slika', oldExt: 'jpg',
        destination: '/images/posts/5-odlicnih-eksperimenata-s-balonima-Pocetna-Slika.jpg',
        derivatives: true,
      },
      {
        year: '2017', month: '08',
        oldStem: '7-zabavnih-aktivnosti-za-učenje-abecede-i-brojeva-Pocetna-Slika', oldExt: 'jpg',
        destination: '/images/posts/7-zabavnih-aktivnosti-za-ucenje-abecede-i-brojeva-Pocetna-Slika.jpg',
        derivatives: true,
      },
      {
        year: '2017', month: '08',
        oldStem: 'Kako-napraviti-Origami-Kucicu-Pocetna-slika', oldExt: 'jpg',
        destination: '/images/posts/Kako-napraviti-origami-kucicu-Pocetna-slika.jpg',
        derivatives: true,
      },
      ...[
        'Explore-the-Mysterious-Number-Pi-π-Archimedes-Pi',
        'Explore-the-Mysterious-Number-Pi-π-Materials-Needed',
        'Explore-the-Mysterious-Number-Pi-π-Pi-explored',
        'Explore-the-Mysterious-Number-Pi-π-Pi-is-irrational-number',
      ].map((oldStem) => ({
        year: '2019', month: '03', oldStem, oldExt: 'jpg', derivatives: true,
        destination: `/images/posts/${oldStem.replace('-π', '')}.jpg`,
      })),
      ...[
        'Istražimo-Misteriozan-Broj-Pi-π-Arhimedov-Pi',
        'Istražimo-Misteriozan-Broj-Pi-π-Pi-je-iracionalan-broj',
        'Istražimo-Misteriozan-Broj-Pi-π-Potrebni-materijali',
      ].map((oldStem) => ({
        year: '2019', month: '03', oldStem, oldExt: 'jpg',
        destination: `/images/posts/${oldStem.replace('-π', '')}.jpg`,
      })),
      {
        year: '2021', month: '11',
        oldStem: 'Balloon-getting-sucked-into-the-jar', oldExt: 'gif',
        destination: '/images/posts/Balloon-getting-sucked-into-the-jar.webp',
      },
      {
        year: '2022', month: '06',
        oldStem: 'Intenzitet-stresa-u-nasem-zivotu', oldExt: 'jpg',
        destination: '/images/posts/Intenzitet-stresa-u-nasem-zivotu-min.jpg',
        derivatives: true,
      },
      // Covers deliberately replaced during the redesign. Redirect the old
      // image URL to the new cover for the same article instead of letting the
      // generic same-filename rule land on a 404.
      ...[
        ['2017', '10', 'How-to-Shrink-a-Bag-with-Microwaves-Cover-Image', '/images/posts/microwave-cover.jpg'],
        ['2020', '01', 'What-is-inertia-and-how-to-demonstrate-it-Bead-Chain-Experiment', '/images/posts/What-is-inertia.jpg'],
        ['2017', '11', 'Aktivnost-za-Senzomotoricki-Razvoj-Pocetna-slika-1', '/images/posts/sensory-play.jpg'],
        ['2017', '11', 'Demonstracija-Osmoze-pomocu-gumenih-bombona-Pocetna-slika-1', '/images/posts/gummy-osmosis.jpg'],
        ['2021', '08', 'Fun-Activity-to-Introduce-Letters-to-Preschoolers-Cover-Image', '/images/posts/7-fun-Activities-to-Learn-Letters-and-Numbers-Cover-Image.jpg'],
        ['2017', '11', 'Gummy-Bears-Osmosis-Experiment-Cover-Image', '/images/posts/gummy-osmosis.jpg'],
        ['2017', '10', 'How-to-Demonstrate-Air-Pressure-with-Can-Crush-Experiment-Cover-Image', '/images/posts/can-crush-cover.jpg'],
        ['2020', '04', 'How-to-Make-a-Colored-Rainbow-Rice-Indoors-Activity-for-Kids-Cover-Image', '/images/posts/How-to-Make-a-Colored-Rainbow-Rice.webp'],
        ['2022', '01', 'How-to-Make-a-Lava-Lamp-Cover-Image', '/images/posts/lava-lamp.jpg'],
        ['2017', '11', 'How-to-make-Sensory-Play-Colors-Cover-Image', '/images/posts/sensory-play.jpg'],
        ['2017', '10', 'Kako-demonstrirati-pritisak-zraka-pomocu-pokusa-gnjecenja-limenke-Pocetna-slika', '/images/posts/can-crush-cover.jpg'],
        ['2017', '11', 'Kako-napraviti-Lava-Lampu-Pocetna-slika-1', '/images/posts/lava-lamp.jpg'],
        ['2017', '09', 'Kako-napraviti-raketu-od-šibica', '/images/posts/How-to-make-a-Match-Head-Rocket.jpg'],
        ['2017', '10', 'Kako-smanjiti-vrecicu-pomocu-mikrovalova-Pocetna-slika', '/images/posts/microwave-cover.jpg'],
        ['2017', '12', 'Kako-uciti-o-polaritetu-koristeci-mlijeko-i-boje-Pocetna-Slika-1', '/images/posts/How-to-Make-Colorful-Milk-Polarity-Experiment-Cover-Image.jpg'],
        ['2021', '07', 'Pokus-oksidacije-jabuke-Pocetna-slika', '/images/posts/apple-oxidation-cover.jpg'],
        ['2020', '01', 'Sto-je-inercija-i-kako-ju-demonstrirati-Pokus-s-ukrasnim-lancom', '/images/posts/What-is-inertia.jpg'],
        ['2020', '04', 'What-to-expect-from-the-Two-years-old-Toddler-Cover-Image', '/images/posts/What-to-expect-from-the-Two-years-old-Toddler.webp'],
        ['2021', '08', 'Zabavna-aktivnost-za-ucenje-slova-kod-predskolaca-Pocetna-slika', '/images/posts/7-zabavnih-aktivnosti-za-ucenje-abecede-i-brojeva-Pocetna-Slika.jpg'],
        ['2018', '11', 'Fun-activities-for-practicing-matching-patterns-Cover-Picture', '/images/posts/Zabavne-aktivnosti-prepoznavanja-i-dovršavanja-uzoraka-Pocetna-slika.jpg'],
        ['2018', '01', 'Poticanje-djevojčica-na-STEM-karijere.jpg', '/images/posts/Poticanje-djevojčica-na-STEM-karijere.jpg'],
        ['2018', '01', 'Women-in-STEM-cover.jpg', '/images/posts/Women-in-STEM-cover.jpg'],
        ['2019', '09', 'What-to-expect-from-17-and-18-month-old-toddler-Cover-Picture', '/images/posts/Sto-ocekivati-od-17-i-18-mjeseci-starog-djeteta-Pocetna-Slika.webp'],
      ].map(([year, month, oldStem, destination]) => ({
        year, month, oldStem, destination, oldExt: 'jpg', derivatives: true,
      })),
    ];

    const legacyMediaAliases = legacyMediaAliasFiles.flatMap((file) => {
      // Next matches redirect regexes against the raw URL path. Browsers send
      // non-ASCII filenames percent-encoded, so emit both spellings whenever
      // they differ (for example `π` + `%CF%80`, or `č` + `%C4%8D`).
      const sourceStems = [...new Set([file.oldStem, encodeURI(file.oldStem)])];
      return sourceStems.flatMap((sourceStem) => [
        ...(file.derivatives
          ? [{
              source: `/wp-content/uploads/${file.year}/${file.month}/${sourceStem}-:w(\\d{2,4})x:h(\\d{2,4}).${file.oldExt}`,
              destination: file.destination,
              permanent: true,
            }]
          : []),
        {
          source: `/wp-content/uploads/${file.year}/${file.month}/${sourceStem}.${file.oldExt}`,
          destination: file.destination,
          permanent: true,
        },
      ]);
    });

    // A few WP-sized derivatives are themselves the files retained by the
    // migration (for example `Big-House-1024x576.jpg`); there is no full-size
    // `Big-House.jpg` to strip back to. Generate one family alias that sends
    // every historical size, plus the old original URL, to the retained file.
    const migratedImageFiles = fs.readdirSync(
      path.join(process.cwd(), 'public', 'images', 'posts'),
    );
    const migratedDerivativeFamilies = migratedImageFiles
      .map((file) => {
        const match = file.match(/^(.*)-\d{2,4}x\d{2,4}(\.(?:jpe?g|png|gif|webp))$/i);
        if (!match) return null;
        const [, stem, extension] = match;
        // When the true original is present, the generic strip-to-original rule
        // below is preferable and this exception is unnecessary.
        if (migratedImageFiles.includes(`${stem}${extension}`)) return null;
        return { stem, extension, file };
      })
      .filter((item): item is { stem: string; extension: string; file: string } => Boolean(item));
    const legacyRetainedDerivativeAliases = migratedDerivativeFamilies.flatMap((item) => [
      {
        source: `/wp-content/uploads/:year(\\d{4})/:month(\\d{2})/${item.stem}-:w(\\d{2,4})x:h(\\d{2,4})${item.extension}`,
        destination: `/images/posts/${item.file}`,
        permanent: true,
      },
      {
        source: `/wp-content/uploads/:year(\\d{4})/:month(\\d{2})/${item.stem}${item.extension}`,
        destination: `/images/posts/${item.file}`,
        permanent: true,
      },
    ]);

    const legacyMedia = [
      {
        source:
          '/wp-content/uploads/:year(\\d{4})/:month(\\d{2})/:name-:w(\\d{2,4})x:h(\\d{2,4}).:ext(jpg|jpeg|png|gif|webp)',
        destination: '/images/posts/:name.:ext',
        permanent: true,
      },
      {
        source: '/wp-content/uploads/:year(\\d{4})/:month(\\d{2})/:file',
        destination: '/images/posts/:file',
        permanent: true,
      },
    ];

    return [
      ...moved.map(([source, destination]) => ({ source, destination, permanent: true })),
      ...wpSuffixes,
      ...legacyMediaAliases,
      ...legacyRetainedDerivativeAliases,
      ...legacyMedia,
    ];
  },

  // ─── Security headers ─────────────────────────────────────────────────
  // Defence-in-depth: each header closes one well-known attack class.
  // Applied to ALL routes via `source: '/(.*)'`.
  async headers() {
    return [
      // Draft previews: belt-and-braces noindex at the HTTP layer (the page
      // also emits robots noindex metadata). NOT disallowed in robots.txt on
      // purpose — crawlers must be able to fetch the page to see the noindex.
      {
        source: '/(en|hr)/draft/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      // RSS feeds: crawlable, but never a search result. Each feed's
      // <channel><link> points at the language homepage and its items repeat
      // that page's listing, so Google indexes the feed, picks the homepage as
      // canonical, and files the feed under "Duplicate without user-selected
      // canonical" — XML carries no canonical tag it can honour instead.
      // `noindex` settles it at the HTTP layer. `follow` is deliberate: the
      // feed stays a discovery path for new posts.
      {
        source: '/rss-:feed.xml',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, follow' },
        ],
      },
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
