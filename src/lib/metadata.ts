import { Post } from "./posts";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

const BASE_URL = siteConfig.url;

// ---------------------------------------------------------------------------
// Post page metadata  (issues 8, 9, 12)
// ---------------------------------------------------------------------------
export function generatePostMetadata(post: Post | null, lang: "en" | "hr"): Metadata {
  if (!post) {
    return {
      title: lang === "hr" ? "Članak nije pronađen" : "Post not found",
      description:
        lang === "hr"
          ? "Traženi članak nije pronađen."
          : "The requested post could not be found.",
    };
  }

  // Issue 9: prefer the hand-written frontmatter description over the
  // auto-generated excerpt so meta descriptions are intentional and keyword-rich.
  const description =
    post.description ||
    post.excerpt ||
    post.content.slice(0, 155).replace(/\n/g, " ");

  const fullUrl = `${BASE_URL}/${lang}/${post.slug}`;

  // Issue 8: include dimensions so social platforms render the large card format.
  // When a post has no coverImage, fall back to the auto-generated OG image
  // produced by src/app/opengraph-image.tsx (Next.js mounts it at /opengraph-image).
  const imageUrl = post.coverImage
    ? `${BASE_URL}${post.coverImage}`
    : `${BASE_URL}/opengraph-image`;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url: fullUrl,
      type: "article",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
    },
    // Issue 12: x-default tells Google which version to show to unmatched locales.
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${BASE_URL}/en/${post.slug}`,
        hr: `${BASE_URL}/hr/${post.slug}`,
        "x-default": `${BASE_URL}/en/${post.slug}`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Article JSON-LD  (issues 9, 10)
// ---------------------------------------------------------------------------
export function generateJsonLd(post: Post, lang: "en" | "hr") {
  const fullUrl = `${BASE_URL}/${lang}/${post.slug}`;
  const imageUrl = post.coverImage
    ? `${BASE_URL}${post.coverImage}`
    : `${BASE_URL}/opengraph-image`;

  // Issue 9: same description priority as metadata above.
  const description =
    post.description ||
    post.excerpt ||
    post.content.slice(0, 155).replace(/\n/g, " ");

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    image: [imageUrl],
    author: { "@type": "Person", name: post.author ?? siteConfig.author.name },
    // Issue 10: dateModified is required for Google's "Updated" label in SERPs.
    // Fall back to datePublished if we don't track edits separately.
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: fullUrl,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
    },
    inLanguage: lang,
  };
}

// ---------------------------------------------------------------------------
// Breadcrumb JSON-LD  (issue 5 already fixed — kept clean here)
// ---------------------------------------------------------------------------
export function generateBreadcrumbJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}/${post.lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.title,
        item: `${BASE_URL}/${post.lang}/${post.slug}`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// WebSite JSON-LD  (issue 11)
// Placed on the home page so Google can associate the schema with the site root.
// ---------------------------------------------------------------------------
export function generateWebsiteJsonLd(lang: "en" | "hr") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: `${BASE_URL}/${lang}`,
    inLanguage: lang,
    description:
      lang === "hr"
        ? "Zabavne STEM aktivnosti i psihološki savjeti za djecu i roditelje."
        : siteConfig.description,
  };
}
