/**
 * AdSense configuration + helpers.
 *
 * The publisher id and slot ids are PUBLIC (they appear verbatim in the page
 * source of every AdSense site), so reading them from `NEXT_PUBLIC_*` env and
 * committing the references is safe. When they're unset (local dev / preview),
 * `adsEnabled` is false → `<AdSlot>` and `<AdSenseScript>` render nothing, so
 * dev never loads the ad library or shows blank/test units.
 *
 * To go live: set these three in `.env.local` (and in Vercel → Project →
 * Settings → Environment Variables, all environments):
 *   NEXT_PUBLIC_ADSENSE_CLIENT            = ca-pub-XXXXXXXXXXXXXXXX
 *   NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE   = 10-digit slot id (In-article unit)
 *   NEXT_PUBLIC_ADSENSE_SLOT_END          = 10-digit slot id (In-article unit)
 *   NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED      = 10-digit slot id (In-feed unit, homepage grid)
 *   NEXT_PUBLIC_ADSENSE_SLOT_TOOLS        = 10-digit slot id (Display unit, tool pages)
 *
 * Also remember to turn Auto ads OFF in the AdSense dashboard (Ads → By site),
 * otherwise Google injects its own placements on top of these manual ones.
 */

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export const AD_SLOTS = {
  /** In-article unit injected mid-article (after the first section or two). */
  inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? "",
  /** In-article unit at the end of the body, just before Related Posts. */
  endOfArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_END ?? "",
  /** In-feed unit rendered as a card inside the homepage post grid. */
  inFeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED ?? "",
  /** Responsive display unit below the interactive tool on tool pages. */
  tools: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOLS ?? "",
} as const;

/**
 * Layout key for the in-feed unit. Not a secret — Google generates it when the
 * ad unit is created and it describes the unit's visual layout, so it belongs
 * in code next to the format, not in env.
 */
export const IN_FEED_LAYOUT_KEY = "-70+dm+1r-q+2l";

/** True once a publisher id is configured. */
export const adsEnabled = ADSENSE_CLIENT.length > 0;

/**
 * Split a raw MDX body at heading boundaries so in-article ads can sit between
 * sections. Returns the body as 1–3 chunks; the caller renders an ad between
 * consecutive chunks (`inArticle` after the first, `endOfArticle` after the
 * second). A single-element result means "no in-body ads".
 *
 * The scan ignores ```fenced``` code blocks and only counts top-level `## `
 * headings.
 *
 * Placement, by section count `n`:
 *   - `n < 3`  → no split. Too short to place cleanly.
 *   - `3 ≤ n < 6` → one ad, before the 3rd section (or the 2nd when n is 3),
 *     landing roughly a third of the way down. Unchanged from the original
 *     single-split behaviour.
 *   - `n ≥ 6`  → two ads, at ~1/3 and ~2/3, with at least two sections above,
 *     between and below them.
 *
 * The second position matters: previously the `endOfArticle` unit sat *after*
 * the body and all the trailing components, measuring ~94% down the page. On
 * articles this long almost no one reached it, so it served an ad that was
 * paid for but never seen. Moving it to ~2/3 puts it where readers actually
 * are, and short articles (which keep the after-body slot) now cost nothing
 * when unreached, because AdSlot only requests on approach.
 */
export function splitContentForAds(content: string): string[] {
  if (!adsEnabled || !AD_SLOTS.inArticle) return [content];

  const lines = content.split("\n");
  const headingLines: number[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    // Top-level H2 only ("## Heading" — not "### " or "##nospace").
    if (!inFence && /^## \S/.test(lines[i])) headingLines.push(i);
  }

  const n = headingLines.length;
  if (n < 3) return [content];

  const first = n >= 4 ? 2 : 1;

  // Second ad only when the article can spare two sections between the ads and
  // two more below the last one — otherwise they'd stack up too close.
  const second =
    AD_SLOTS.endOfArticle && n >= 6
      ? Math.min(Math.round((2 * n) / 3), n - 2)
      : -1;

  const cuts = (second > first ? [first, second] : [first]).map(
    (i) => headingLines[i]
  );

  const chunks: string[] = [];
  let start = 0;
  for (const cut of cuts) {
    chunks.push(lines.slice(start, cut).join("\n"));
    start = cut;
  }
  chunks.push(lines.slice(start).join("\n"));
  return chunks;
}
