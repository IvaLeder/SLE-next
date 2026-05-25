/**
 * Category constants shared between server-side (posts.ts) and
 * client-side components (ActivitiesClient, PostList, …).
 *
 * Keep this file free of Node.js imports — it is bundled for the browser.
 */

/** ASCII URL slugs — safe to use as URL path segments in all environments. */
export const CATEGORY_SLUGS = [
  "science",
  "engineering",
  "math",
  "technology",
  "psychology",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/**
 * English slug → localised display name.
 * Use this to render headings / filter labels; never put display names in URLs.
 */
export const CATEGORY_DISPLAY: Record<"en" | "hr", Record<string, string>> = {
  en: {
    science:     "Science",
    engineering: "Engineering",
    math:        "Math",
    technology:  "Technology",
    psychology:  "Psychology",
  },
  hr: {
    science:     "Znanost",
    engineering: "Inženjerstvo",
    math:        "Matematika",
    technology:  "Tehnologija",
    psychology:  "Psihologija",
  },
};
