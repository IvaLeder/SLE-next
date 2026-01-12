import { Post } from "./posts";
import { Metadata } from "next";

/**
 * Generate standard Next.js metadata for a post
 */
export function generatePostMetadata(post: Post | null, lang: "en" | "hr"): Metadata {
  if (!post) {
    return {
      title: lang === "hr" ? "Članak nije pronađen" : "Post not found",
      description: lang === "hr" ? "Traženi članak nije pronađen." : "The requested post could not be found.",
    };
  }

  const description = post.excerpt || post.content.slice(0, 150);
  const urlPrefix = lang === "hr" ? "/hr" : "/en";
  const fullUrl = `https://yourdomain.com${urlPrefix}/${post.slug}`;
  const imageUrl = post.coverImage
    ? `https://yourdomain.com${post.coverImage}`
    : `https://yourdomain.com/default-og-image.jpg`;

      // Determine URLs for alternate languages
  const siteUrl = "https://stemlittleexplorers.com";
  const alternates = {
    canonical: `${siteUrl}/${lang}/${post.slug}`,
    languages: {
      en: `${siteUrl}/en/${post.slug}`,
      hr: `${siteUrl}/hr/${post.slug}`,
    },
  };

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url: fullUrl,
      type: "article",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
    },
    alternates
  };
}

/**
 * Generate JSON-LD structured data for a post
 */
export function generateJsonLd(post: Post, lang: "en" | "hr") {
  const urlPrefix = lang === "hr" ? "/hr" : "/en";
  const fullUrl = `https://yourdomain.com${urlPrefix}/${post.slug}`;
  const imageUrl = post.coverImage
    ? `https://yourdomain.com${post.coverImage}`
    : `https://yourdomain.com/default-og-image.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 150),
    image: [imageUrl],
    author: { "@type": "Person", name: "Your Name" },
    datePublished: post.date,
    mainEntityOfPage: fullUrl,
    inLanguage: lang,
  };
}

export function generateBreadcrumbJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://stemlittleexplorers.com/${post.lang}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `https://stemlittleexplorers.com/${post.lang}/blog`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://stemlittleexplorers.com/${post.lang}/${post.slug}`,
      }
    ]
  };
}