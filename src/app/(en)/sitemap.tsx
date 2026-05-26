import { getAllPosts, CATEGORY_SLUGS } from "@/lib/posts";
import { KNOWN_TAGS } from "@/lib/tags";
import { getAllAuthorSlugs } from "@/lib/authors";
import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

// IMPORTANT: must match the canonical host used everywhere else (no www).
const BASE_URL = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ["en", "hr"] as const;

  // Load both language post lists once so translation lookups are O(n) not O(n²)
  const postsByLang = {
    en: getAllPosts("en"),
    hr: getAllPosts("hr"),
  };

  const now = new Date();

  // Helper: build a bilingual entry that lists both language URLs as alternates.
  const bilingual = (
    path: string,
    lastModified: Date = now,
    priority?: number,
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]
  ): MetadataRoute.Sitemap =>
    langs.map((lang) => ({
      url: `${BASE_URL}/${lang}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: `${BASE_URL}/en${path}`,
          hr: `${BASE_URL}/hr${path}`,
        },
      },
    }));

  // --- Static pages ---
  const staticEntries: MetadataRoute.Sitemap = [
    ...bilingual("",            now, 1.0, "weekly"),
    ...bilingual("/activities", now, 0.9, "weekly"),
    ...bilingual("/about",      now, 0.5, "monthly"),
    ...bilingual("/contact",    now, 0.4, "yearly"),
    ...bilingual("/privacy",    now, 0.2, "yearly"),
    ...bilingual("/terms",      now, 0.2, "yearly"),
  ];

  // --- Category pages (one per slug per language) ---
  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.flatMap((slug) =>
    bilingual(`/category/${slug}`, now, 0.7, "weekly")
  );

  // --- Tag pages (one per known tag per language) ---
  const tagEntries: MetadataRoute.Sitemap = KNOWN_TAGS.flatMap((slug) =>
    bilingual(`/tag/${slug}`, now, 0.6, "weekly")
  );

  // --- Author pages (one per author per language) ---
  const authorEntries: MetadataRoute.Sitemap = getAllAuthorSlugs().flatMap((slug) =>
    bilingual(`/author/${slug}`, now, 0.5, "monthly")
  );

  // --- Post entries with translation alternates ---
  const postEntries: MetadataRoute.Sitemap = langs.flatMap((lang) => {
    const otherLang = lang === "en" ? "hr" : "en";

    return postsByLang[lang].map((post) => {
      const translated = post.translationKey
        ? postsByLang[otherLang].find(
            (p) => p.translationKey === post.translationKey
          )
        : null;

      // Always include self in language alternates; add the translation if found.
      const languages: Record<string, string> = {
        [lang]: `${BASE_URL}/${lang}/${post.slug}`,
      };
      if (translated) {
        languages[otherLang] = `${BASE_URL}/${otherLang}/${translated.slug}`;
      }

      return {
        url: `${BASE_URL}/${lang}/${post.slug}`,
        // Prefer dateModified when set — tells crawlers to re-index edits.
        lastModified: new Date(post.dateModified ?? post.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: { languages },
        // Image sitemap protocol — surfaces cover photos in Google Images.
        // Falls back to the auto-generated OG image when no cover is set.
        images: [
          post.coverImage
            ? `${BASE_URL}${post.coverImage}`
            : `${BASE_URL}/opengraph-image`,
        ],
      };
    });
  });

  // Deduplicate by URL
  const seen = new Set<string>();
  return [...staticEntries, ...categoryEntries, ...tagEntries, ...authorEntries, ...postEntries].filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
