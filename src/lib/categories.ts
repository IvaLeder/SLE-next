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
 * Emoji icon per English slug. Language-independent, so a single map serves
 * both locales. Used to make subject chips/nav more recognisable at a glance
 * (Activities filter, CategoryFilter, CategoryNav).
 */
export const CATEGORY_ICONS: Record<string, string> = {
  science:     "🔬",
  engineering: "⚙️",
  math:        "📐",
  technology:  "💻",
  psychology:  "🧠",
};

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
 * Short intro paragraph for each category landing page. Renders at the top
 * of /[lang]/category/[slug] above the article grid. Two effects:
 *   1. Page is no longer a thin list — Google has actual content to index.
 *   2. Visitors get oriented before scrolling into a wall of cards.
 *
 * Keep these to 1–2 sentences. Plain language, audience = parents/educators.
 */
export const CATEGORY_DESCRIPTION: Record<"en" | "hr", Record<string, string>> = {
  en: {
    science:
      "Hands-on chemistry, biology and physics experiments you can run at the kitchen table. Each project explains the science in plain language before the steps, so kids understand what they're seeing and not just how to do it.",
    engineering:
      "Build-it activities that teach how things work: structures, simple machines, circuits, propulsion. Materials are everyday: cardboard, tape, paperclips, the recycling bin.",
    math:
      "Number sense, geometry and logic through play. From origami (spatial reasoning) and Tower of Hanoi (recursion) to homemade clocks and pattern matching.",
    technology:
      "Introductions to programming, computers and how digital tools work, designed for kids learning their first concepts. Visual and tactile wherever possible.",
    psychology:
      "Evidence-informed guides to child development: what to expect month by month, how to encourage speech, why temper tantrums happen and what helps. Written for parents and educators, grounded in research.",
  },
  hr: {
    science:
      "Praktični kemijski i fizikalni pokusi koje možete izvesti u kuhinji. Svaki projekt jednostavnim jezikom objašnjava znanost, pa djeca razumiju i koncepte. a ne samo kako to napraviti.",
    engineering:
      "Aktivnosti gradnje kojima djeca uče kako stvari rade: konstrukcije, jednostavni strojevi, strujni krugovi, pogon. Materijali su svakodnevni: karton, ljepljiva traka, spajalice, sadržaj kante za reciklažu.",
    math:
      "Osjećaj za brojeve, geometrija i logika kroz igru. Od origamija (prostorno razmišljanje) i Hanojskog tornja (rekurzija) do satova od kartona i prepoznavanja uzoraka.",
    technology:
      "Uvod u programiranje, računala i digitalne alate, prilagođen djeci koja tek upoznaju ove koncepte. Trudimo se da učenje bude vizualno i opipljivo..",
    psychology:
      "Vodiči o razvoju djeteta utemeljeni na istraživanjima: što očekivati iz mjeseca u mjesec, kako poticati govor, zašto se javljaju ispadi bijesa i što može pomoći. Pisano za roditelje i odgajatelje.",
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
