# Internal link check - 2026-07-15

Method: production build (`npm run build`, 494 pages) served locally with `next start`,
crawled every page reachable from /en and /hr, plus direct extraction of all
root-relative links from the 542 MDX sources (catches links the crawler can't see,
e.g. inside PredictionResult). 426 unique internal URLs checked with redirects NOT
followed, then every redirect chain followed to its final destination.

## Verdict

- **0 broken links.** Every internal URL ends at a real 200 page.
- **0 links depend on the legacy WordPress redirect map** (no stale slugs).
- **169 unique URLs (739 link occurrences in 180 MDX files) are written with a
  trailing slash** and therefore go through a **308 redirect** on every direct hit
  (`/en/apple-oxidation/` → 308 → `/en/apple-oxidation`).
- **3 links are missing the language prefix** and chain through TWO redirects.

## The trailing-slash pattern

Article content (WordPress import legacy) writes internal links as `/en/slug/`;
the site runs Next's default `trailingSlash: false`, so the canonical URL has no
slash and the slashed form 308s. All component-generated links (header, footer,
breadcrumbs, related posts, category/tag chips) are already slash-free - this is
purely an MDX content issue.

Impact: client-side `next/link` navigation doesn't hit the redirect, but first
loads, opens-in-new-tab, and crawlers do. Google follows 308s fine, but each hop
is wasted crawl budget and a slightly diluted internal-linking signal; canonicals
and sitemap already point at the no-slash form.

Counts:

- 739 occurrences across 180 MDX files (`grep -roE "\]\(/[^)#[:space:]]*/(#[^)]*)?\)" src/content/posts`)
- of which 22 are anchor links in the `/slug/#fragment` form (fix is `/slug#fragment`)

Note: the anchor examples in `dev-quickstart.md` §Content model show the slashed
form as ✅ - if a sweep is done, update the guide examples too.

## The 3 double-redirect links (fix these regardless)

| File | Link | Chain |
|---|---|---|
| `src/content/posts/en/baby-eleven-months-old.mdx:97` | `/baby-twelve-months-old/` | 308 slash-strip → 301 bare-slug → `/en/baby-twelve-months-old` |
| `src/content/posts/hr/beba-jedanaest-mjeseci-starosti.mdx:98` | `/beba-dvanaest-mjeseci-starosti/` | 308 → 301 → `/hr/sto-ocekivati-od-djeteta-u-dvanaestom-mjesecu-zivota` (old renamed slug!) |
| `src/content/posts/hr/kako-napraviti-bozicnog-soba.mdx:100` | `/bozicno-drvce-od-rola-toaletnog-papira/` | 308 → 301 → `/hr/bozicno-drvce-od-rola-toaletnog-papira` |

## Remedy — APPLIED same day

1. Swept `src/content/posts/**/*.mdx`: `](/path/)` → `](/path)` and
   `](/path/#frag)` → `](/path#frag)` — 739 links rewritten in 180 files.
2. The 3 bare-prefix links now point at their final destinations directly.
3. `dev-quickstart.md` updated: ✅ anchor examples de-slashed + an explicit
   "no trailing slash" rule added to §Internal links MUST be relative.
4. Verified: `npm run validate` 0 errors, `npm run build` green (494 pages),
   full re-crawl of the served build — **257 unique internal URLs, every one
   returns 200 directly. No redirects, no 404s.**
