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
 * Split a raw MDX body into `[before, after]` at a heading boundary so an
 * in-article ad can sit between two sections. Returns `[content, null]` when:
 *   - ads aren't configured (no client / no in-article slot), or
 *   - the article has fewer than 3 `## ` sections (too short to place cleanly).
 *
 * The scan ignores ```fenced``` code blocks, and targets the 3rd H2 when there
 * are 4+ sections (upper-middle of the article) or the 2nd otherwise — always
 * guaranteeing real content both above and below the ad.
 */
export function splitContentForMidAd(content: string): [string, string | null] {
  if (!adsEnabled || !AD_SLOTS.inArticle) return [content, null];

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

  if (headingLines.length < 3) return [content, null];

  const targetLine = headingLines[headingLines.length >= 4 ? 2 : 1];
  return [
    lines.slice(0, targetLine).join("\n"),
    lines.slice(targetLine).join("\n"),
  ];
}
