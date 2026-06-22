import { getAllPosts, CATEGORY_SLUGS } from "@/lib/posts";
import { KNOWN_TAGS } from "@/lib/tags";
import { getAllAuthorSlugs } from "@/lib/authors";
import { siteConfig } from "@/config/site";
import { SUMMER_SLUG } from "@/lib/summer-ebook";
import { tools, TOOLS_SLUG } from "@/lib/tools";
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
    ...bilingual("/topics",     now, 0.7, "weekly"),
    ...bilingual("/about",      now, 0.5, "monthly"),
    ...bilingual("/contact",    now, 0.4, "yearly"),
    ...bilingual("/privacy",    now, 0.2, "yearly"),
    ...bilingual("/terms",      now, 0.2, "yearly"),
  ];

  // Summer e-book landing pages — slugs differ per language, so they can't use
  // the bilingual() helper (which assumes a shared path). Hand-build both with
  // cross-pointing hreflang alternates.
  const summerAlternates = {
    languages: {
      en: `${BASE_URL}/en/${SUMMER_SLUG.en}`,
      hr: `${BASE_URL}/hr/${SUMMER_SLUG.hr}`,
    },
  };
  const summerEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/en/${SUMMER_SLUG.en}`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: summerAlternates },
    { url: `${BASE_URL}/hr/${SUMMER_SLUG.hr}`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: summerAlternates },
  ];

  // Tools — hub + one entry per tool. Slugs differ per language (like summer),
  // so build both sides by hand with cross-pointing hreflang.
  const toolsHubAlternates = {
    languages: {
      en: `${BASE_URL}/en/${TOOLS_SLUG.en}`,
      hr: `${BASE_URL}/hr/${TOOLS_SLUG.hr}`,
    },
  };
  const toolsEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/en/${TOOLS_SLUG.en}`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: toolsHubAlternates },
    { url: `${BASE_URL}/hr/${TOOLS_SLUG.hr}`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: toolsHubAlternates },
    ...tools.flatMap((tool) => {
      const alternates = {
        languages: {
          en: `${BASE_URL}/en/${TOOLS_SLUG.en}/${tool.slug.en}`,
          hr: `${BASE_URL}/hr/${TOOLS_SLUG.hr}/${tool.slug.hr}`,
        },
      };
      return [
        { url: `${BASE_URL}/en/${TOOLS_SLUG.en}/${tool.slug.en}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7, alternates },
        { url: `${BASE_URL}/hr/${TOOLS_SLUG.hr}/${tool.slug.hr}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7, alternates },
      ];
    }),
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
        // Only emit when a real cover photo exists: the bare `/opengraph-image`
        // URL 404s (Next.js serves it at a hashed path), so falling back to it
        // would feed Google broken image references.
        ...(post.coverImage && {
          images: [`${BASE_URL}${post.coverImage}`],
        }),
      };
    });
  });

  // Deduplicate by URL
  const seen = new Set<string>();
  return [...staticEntries, ...summerEntries, ...toolsEntries, ...categoryEntries, ...tagEntries, ...authorEntries, ...postEntries].filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
