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

const FIRST_AD_TARGET = 0.32;
const SECOND_AD_TARGET = 0.68;
const MIN_WORDS_AROUND_AD = 300;

function countContentWords(value: string): number {
  // Remove JSX/HTML tags so long image alt text and component props don't skew
  // the reading-position estimate. Unicode properties cover both languages.
  return value.replace(/<[^>]*>/g, " ").match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

function closestHeadingCut({
  lines,
  candidates,
  target,
  totalWords,
  minimumWordsBefore,
  minimumWordsAfter,
}: {
  lines: string[];
  candidates: number[];
  target: number;
  totalWords: number;
  minimumWordsBefore: number;
  minimumWordsAfter: number;
}): number | null {
  let best: { line: number; distance: number } | null = null;

  for (const line of candidates) {
    const wordsBefore = countContentWords(lines.slice(0, line).join("\n"));
    if (
      wordsBefore < minimumWordsBefore ||
      totalWords - wordsBefore < minimumWordsAfter
    ) {
      continue;
    }

    const distance = Math.abs(wordsBefore / totalWords - target);
    if (!best || distance < best.distance) best = { line, distance };
  }

  return best?.line ?? null;
}

/**
 * Split a raw MDX body at section-heading boundaries so in-article ads can sit
 * between real content blocks. Returns the body as 1–3 chunks; the caller puts
 * one ad between consecutive chunks. A single-element result means "no safe
 * in-body placement".
 *
 * Placement is based on article words, not heading count. The old "third H2"
 * rule put first ads anywhere from 10–75% through the current corpus because
 * section lengths vary wildly. We now choose the eligible boundary nearest 32%
 * and, on articles with six or more sections, another nearest 68%. Every unit
 * must have at least 300 words before and after it (and between two units).
 *
 * Most posts use H2 sections. A small set of long, migrated posts use H3 for
 * their primary sections; when there aren't enough H2s, H3s are the fallback.
 * Fenced code blocks are ignored. The hard maximum remains two ads per article.
 */
export function splitContentForAds(content: string): string[] {
  if (!adsEnabled || !AD_SLOTS.inArticle) return [content];

  const lines = content.split("\n");
  const h2Lines: number[] = [];
  const h3Lines: number[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^## \S/.test(lines[i])) h2Lines.push(i);
    else if (/^### \S/.test(lines[i])) h3Lines.push(i);
  }

  const headingLines = h2Lines.length >= 3 ? h2Lines : h3Lines;
  const n = headingLines.length;
  if (n < 3) return [content];

  const totalWords = countContentWords(content);
  const first = closestHeadingCut({
    lines,
    candidates: headingLines,
    target: FIRST_AD_TARGET,
    totalWords,
    minimumWordsBefore: MIN_WORDS_AROUND_AD,
    minimumWordsAfter: MIN_WORDS_AROUND_AD,
  });
  if (first === null) return [content];

  const wordsBeforeFirst = countContentWords(
    lines.slice(0, first).join("\n")
  );
  const second = AD_SLOTS.endOfArticle && n >= 6
    ? closestHeadingCut({
        lines,
        candidates: headingLines.filter((line) => line > first),
        target: SECOND_AD_TARGET,
        totalWords,
        minimumWordsBefore: wordsBeforeFirst + MIN_WORDS_AROUND_AD,
        minimumWordsAfter: MIN_WORDS_AROUND_AD,
      })
    : null;

  const cuts = second !== null ? [first, second] : [first];

  const chunks: string[] = [];
  let start = 0;
  for (const cut of cuts) {
    chunks.push(lines.slice(start, cut).join("\n"));
    start = cut;
  }
  chunks.push(lines.slice(start).join("\n"));
  return chunks;
}
