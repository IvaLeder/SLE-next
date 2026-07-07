import { Post, getTranslatedPostBySlug } from "./posts";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

const BASE_URL = siteConfig.url;

// Facebook-flavoured locale strings for og:locale. Map our short codes once.
const OG_LOCALE: Record<"en" | "hr", string> = {
  en: "en_US",
  hr: "hr_HR",
};
const otherLang = (lang: "en" | "hr") => (lang === "en" ? "hr" : "en");

/**
 * Produce a clean SEO/meta description from a post.
 * Priority: hand-written description → excerpt → first 155 chars of body.
 * In all cases we strip Markdown/MDX markers so descriptions read as plain prose.
 */
function makeDescription(post: Post): string {
  if (post.description) return post.description;
  if (post.excerpt && !post.excerpt.startsWith("---")) return post.excerpt;

  return post.content
    .replace(/<[^>]+>/g, " ")              // JSX/HTML tags (e.g. <YouTube …/>)
    .replace(/!?\[([^\]]*)\]\([^)]+\)/g, "$1")  // images & links → alt/text
    .replace(/^---[\s\S]*?---/m, "")       // any stray frontmatter
    .replace(/[#*_`>]+/g, "")              // markdown emphasis / headings / quotes
    .replace(/\s+/g, " ")                  // collapse whitespace
    .trim()
    .slice(0, 155);
}

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

  const description = makeDescription(post);

  const fullUrl = `${BASE_URL}/${lang}/${post.slug}`;

  // hreflang alternates must point at the translation's REAL slug —
  // translations are linked by `translationKey`, not by sharing a slug
  // (e.g. en/5-amazing-balloon-experiments ↔ hr/5-odlicnih-eksperimenata-s-balonima).
  // Same lookup the sitemap and the [slug] layouts use. When no translation
  // exists, the alternate is omitted entirely rather than advertising a 404.
  const other = otherLang(lang);
  const translated = getTranslatedPostBySlug(lang, post.slug);
  const languages: Record<string, string> = { [lang]: fullUrl };
  if (translated) {
    languages[other] = `${BASE_URL}/${other}/${translated.slug}`;
  }
  // x-default: the English version when one exists, otherwise this post.
  languages["x-default"] = languages.en ?? fullUrl;

  // OG image precedence:
  //  1. If the post has a coverImage, use it (real activity photo wins).
  //  2. Otherwise, OMIT the override — Next.js auto-injects the per-post
  //     dynamic OG image from src/app/(lang)/lang/[slug]/opengraph-image.tsx
  //     which is a branded card with title + category badge.
  const explicitImage = post.coverImage ? `${BASE_URL}${post.coverImage}` : null;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url: fullUrl,
      type: "article",
      // og:locale tells Facebook which language card to show; alternateLocale
      // signals the translation exists. Helps multilingual social previews.
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[otherLang(lang)]],
      siteName: siteConfig.name,
      ...(explicitImage && {
        images: [{ url: explicitImage, width: 1200, height: 630, alt: post.heroAlt || post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(explicitImage && { images: [explicitImage] }),
    },
    // Issue 12: x-default tells Google which version to show to unmatched locales.
    alternates: {
      canonical: fullUrl,
      languages,
    },
  };
}

// ---------------------------------------------------------------------------
// Article JSON-LD  (issues 9, 10)
// ---------------------------------------------------------------------------
export function generateJsonLd(post: Post, lang: "en" | "hr") {
  const fullUrl = `${BASE_URL}/${lang}/${post.slug}`;
  // Only emit `image` when we have a real cover photo. The per-post OG image
  // route is served at a hashed URL (e.g. `/opengraph-image-35z9bs.png`), so
  // a bare `/opengraph-image` link would 404 in the JSON-LD payload.
  const imageUrl = post.coverImage ? `${BASE_URL}${post.coverImage}` : null;

  const description = makeDescription(post);

  return {
    "@context": "https://schema.org",
    // BlogPosting is a subtype of Article specifically for blog content —
    // Google treats it identically but the narrower type helps the knowledge graph.
    "@type": "BlogPosting",
    headline: post.title,
    description,
    ...(imageUrl && { image: [imageUrl] }),
    author: {
      "@type": "Person",
      name: post.author ?? siteConfig.author.name,
      url: `${BASE_URL}/${lang}/about`,
    },
    datePublished: post.date,
    // dateModified surfaces the "Updated" label in Google SERPs. Falls back
    // to publish date when the post hasn't been edited — same as before.
    dateModified: post.dateModified ?? post.date,
    mainEntityOfPage: fullUrl,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        // Must be a public, stable URL — the app-router icon route is served
        // at a hashed path (`/icon-xxxx.png`), so bare `/icon` 404s.
        url: `${BASE_URL}/images/icon-512.png`,
      },
    },
    inLanguage: lang,
  };
}

// ---------------------------------------------------------------------------
// Breadcrumb JSON-LD — must match what's rendered on-screen so Google sees
// the same trail visible to users (Home › Category › Title).
// ---------------------------------------------------------------------------
import { categorySlugFromName, CATEGORY_DISPLAY } from "./categories";

export function generateBreadcrumbJsonLd(post: Post) {
  const homeLabel = post.lang === "hr" ? "Naslovnica" : "Home";

  const items: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: homeLabel,
      item: `${BASE_URL}/${post.lang}`,
    },
  ];

  // Insert the canonical category step if the post has one.
  const firstCat = post.categories?.[0];
  const catSlug = firstCat ? categorySlugFromName(firstCat) : null;
  if (firstCat && catSlug) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: CATEGORY_DISPLAY[post.lang]?.[catSlug] ?? firstCat,
      item: `${BASE_URL}/${post.lang}/category/${catSlug}`,
    });
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: post.title,
    item: `${BASE_URL}/${post.lang}/${post.slug}`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

// NOTE: HowTo JSON-LD was removed (2026-06): Google retired HowTo rich results
// in 2023, so it earned nothing — and its hand-rolled slugify produced step
// anchors that didn't match rehype-slug's ids on Croatian headings.

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

// ---------------------------------------------------------------------------
// Person JSON-LD — one entry per author bio on /about. Establishes authorship
// signals beyond what BlogPosting carries inline, and links the person to the
// publishing organisation. Render on /about (both languages).
// ---------------------------------------------------------------------------
import { authors } from "./authors";

export function generateAuthorsJsonLd(lang: "en" | "hr") {
  return Object.values(authors).map((a) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.name,
    url: `${BASE_URL}/${lang}/about#${a.name.toLowerCase().replace(/\s+/g, "-")}`,
    jobTitle: lang === "hr" ? a.roleHr : a.role,
    description: lang === "hr" ? a.bioHr : a.bio,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
    },
  }));
}

// ---------------------------------------------------------------------------
// Organization JSON-LD — establishes the brand entity for Google's knowledge
// graph. Render on the homepage. `sameAs` lists every live social profile so
// Google can unify the brand with its off-site presence.
// ---------------------------------------------------------------------------
export function generateOrganizationJsonLd() {
  // Filter out placeholder URLs (still set to "#" in site.ts) so we don't ship
  // dead sameAs links — Google would treat those as broken brand signals.
  const sameAs = (Object.values(siteConfig.social) as string[]).filter(
    (url) => url && url !== "#",
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: BASE_URL,
    // Stable public URL — bare `/icon` 404s (app-router icons get hashed paths).
    logo: `${BASE_URL}/images/icon-512.png`,
    description: siteConfig.description,
    ...(sameAs.length > 0 && { sameAs }),
  };
}
