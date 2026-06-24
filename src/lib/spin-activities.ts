import { getAllPosts } from "@/lib/posts";
import { categorySlugFromName, CATEGORY_ICONS } from "@/lib/categories";

export interface SpinActivity {
  slug: string;
  title: string;
  emoji: string;
}

/**
 * Activity-tagged posts for a language, each with its subject emoji. Server-only
 * (reads posts from disk) — fetch it in a server component and pass the result
 * to <SpinActivity> as a prop. Baked into the page at build time.
 */
export function getSpinActivities(lang: "en" | "hr"): SpinActivity[] {
  return getAllPosts(lang)
    .filter((p) => (p.tags ?? []).includes("activity"))
    .map((p) => {
      const cat = p.categories?.[0];
      const slug = cat ? categorySlugFromName(cat) : null;
      return {
        slug: p.slug,
        title: p.title,
        emoji: (slug && CATEGORY_ICONS[slug]) || "🔬",
      };
    });
}
