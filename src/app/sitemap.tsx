import { getAllPosts } from "@/lib/posts";
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.stemlittleexplorers.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ["en", "hr"] as const;

  // Load both language post lists once so translation lookups are O(n) not O(n²)
  const postsByLang = {
    en: getAllPosts("en"),
    hr: getAllPosts("hr"),
  };

  // --- Static pages ---
  const staticEntries: MetadataRoute.Sitemap = langs.flatMap((lang) => [
    {
      url: `${BASE_URL}/${lang}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          hr: `${BASE_URL}/hr`,
        },
      },
    },
    {
      url: `${BASE_URL}/${lang}/about`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${BASE_URL}/en/about`,
          hr: `${BASE_URL}/hr/about`,
        },
      },
    },
    {
      url: `${BASE_URL}/${lang}/contact`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${BASE_URL}/en/contact`,
          hr: `${BASE_URL}/hr/contact`,
        },
      },
    },
  ]);

  // --- Post entries ---
  const postEntries: MetadataRoute.Sitemap = langs.flatMap((lang) => {
    const otherLang = lang === "en" ? "hr" : "en";

    return postsByLang[lang].map((post) => {
      // Match by translationKey, not by slug
      const translated = post.translationKey
        ? postsByLang[otherLang].find(
            (p) => p.translationKey === post.translationKey
          )
        : null;

      return {
        url: `${BASE_URL}/${lang}/${post.slug}`,
        lastModified: new Date(post.date),
        alternates: translated
          ? {
              languages: {
                [otherLang]: `${BASE_URL}/${translated.lang}/${translated.slug}`,
              },
            }
          : undefined,
      };
    });
  });

  // Deduplicate static entries (flatMap over both langs produces duplicates
  // for the symmetric alternates — keep only unique URLs)
  const seen = new Set<string>();
  const deduped = [...staticEntries, ...postEntries].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return deduped;
}
