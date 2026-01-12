import { getAllPosts, getTranslatedPost } from "@/lib/posts";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ["en", "hr"] as const;

  const entries = langs.flatMap((lang) => {
    const posts = getAllPosts(lang);

    return posts.map((post) => {
      const otherLang = lang === "en" ? "hr" : "en";
      const translated = post.translationOf
        ? getTranslatedPost(otherLang, post.translationOf)
        : null;

      return {
        url: `https://www.stemlittleexplorers.com/${lang}/${post.slug}`,
        lastModified: new Date(post.date),
        alternates: translated
          ? {
              languages: {
                [otherLang]: `https://www.stemlittleexplorers.com/${translated.lang}/${translated.slug}`,
              },
            }
          : undefined,
      };
    });
  });

  return entries;
}