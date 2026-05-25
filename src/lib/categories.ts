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

/**
 * Reverse lookup: display name (any language) → English ASCII slug.
 * Use this when you have a `post.categories[i]` value and need a safe URL slug.
 * Returns `null` if the name doesn't match any canonical category.
 */
const REVERSE_LOOKUP: Record<string, CategorySlug> = (() => {
  const map: Record<string, CategorySlug> = {};
  (Object.keys(CATEGORY_DISPLAY) as ("en" | "hr")[]).forEach((lang) => {
    Object.entries(CATEGORY_DISPLAY[lang]).forEach(([slug, display]) => {
      map[display.toLowerCase()] = slug as CategorySlug;
    });
  });
  return map;
})();

export function categorySlugFromName(name: string): CategorySlug | null {
  return REVERSE_LOOKUP[name.trim().toLowerCase()] ?? null;
}
