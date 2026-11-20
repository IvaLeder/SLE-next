import { getAllPosts } from "./posts";
import { CATEGORY_DISPLAY, CATEGORY_ICONS } from "./categories";
import { baseVariants } from "./assets/helpers";
import { mdxToPlainText } from "./search-text";
import type { SearchDoc } from "./search-core";

// Build-time only: the document list behind /search-{lang}.json (see
// src/app/(en)/search-{en,hr}.json/route.ts). Reads posts from disk, so it must
// never be imported by a client component; search-client.ts fetches the JSON.

/** English display name → slug, per language, for category icons. */
function categoryIcon(lang: "en" | "hr", display?: string) {
  if (!display) return undefined;
  const entry = Object.entries(CATEGORY_DISPLAY[lang]).find(
    ([, name]) => name.toLowerCase() === display.trim().toLowerCase(),
  );
  return entry ? CATEGORY_ICONS[entry[0]] : undefined;
}

export function searchDocuments(lang: "en" | "hr"): SearchDoc[] {
  return getAllPosts(lang).map((p) => {
    // 400w WebP is plenty for a ≤160px thumbnail at DPR 2-3.
    const smallest = p.cover
      ? (p.cover.variants.webp?.[0] ?? baseVariants(p.cover)?.[0])
      : undefined;
    return {
      slug: p.slug,
      lang,
      title: p.title,
      description: p.description || p.excerpt || "",
      tags: (p.tags ?? []).join(" "),
      categories: (p.categories ?? []).join(" "),
      // Article bodies are raw MDX; index (and later quote) only the prose.
      text: mdxToPlainText(p.content),
      category: p.categories?.[0],
      categoryIcon: categoryIcon(lang, p.categories?.[0]),
      thumb: smallest
        ? { url: smallest.url, color: p.cover?.dominantColor }
        : p.coverImage
          ? { url: p.coverImage }
          : undefined,
    };
  });
}
