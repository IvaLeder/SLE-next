import { Post } from "./posts";
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
  // Fall back to the per-post generated OG image (branded card) when no
  // explicit coverImage is set — looks much better than the site default.
  const imageUrl = post.coverImage
    ? `${BASE_URL}${post.coverImage}`
    : `${fullUrl}/opengraph-image`;

  const description = makeDescription(post);

  return {
    "@context": "https://schema.org",
    // BlogPosting is a subtype of Article specifically for blog content —
    // Google treats it identically but the narrower type helps the knowledge graph.
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: [imageUrl],
    author: {
      "@type": "Person",
      name: post.author ?? siteConfig.author.name,
      url: `${BASE_URL}/${lang}/about`,
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: fullUrl,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon`,
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

// ---------------------------------------------------------------------------
// HowTo JSON-LD  (P1-14: rich-results eligibility for activity posts)
// Returns null if the post is not a hands-on guide (no `activity` tag).
// Extracts H2 headings from the MDX content as step names — Google uses these
// to render the HowTo carousel in SERPs.
// ---------------------------------------------------------------------------
export function generateHowToJsonLd(post: Post, lang: "en" | "hr") {
  const isActivity = post.tags?.includes("activity");
  if (!isActivity) return null;

  // Extract H2 headings from raw MDX. We strip leading `## `, trailing whitespace,
  // and any inline markdown emphasis so step names are clean.
  const stepLines = post.content
    .split("\n")
    .filter((line) => /^##\s+/.test(line))
    .map((line) =>
      line
        .replace(/^##\s+/, "")
        .replace(/[*_`]/g, "")
        .trim()
    )
    .filter(Boolean);

  // A HowTo with fewer than 2 steps isn't useful — Google won't render it.
  if (stepLines.length < 2) return null;

  const fullUrl = `${BASE_URL}/${lang}/${post.slug}`;
  // Same precedence as BlogPosting: cover photo first, per-post generated card second.
  const imageUrl = post.coverImage
    ? `${BASE_URL}${post.coverImage}`
    : `${fullUrl}/opengraph-image`;

  const description = makeDescription(post);

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
    description,
    image: [imageUrl],
    inLanguage: lang,
    mainEntityOfPage: fullUrl,
    totalTime: "PT30M", // default 30-minute estimate; can be overridden via frontmatter later
    step: stepLines.map((name, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name,
      text: name,
      url: `${fullUrl}#${slugify(name)}`,
    })),
  };
}

// Mirror of the slugify used by rehype-slug / mdx index — keep step #urls aligned
// with the headings rendered on the page.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
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
  const sameAs = Object.values(siteConfig.social).filter((url) => url && url !== "#");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: BASE_URL,
    logo: `${BASE_URL}/icon`,
    description: siteConfig.description,
    ...(sameAs.length > 0 && { sameAs }),
  };
}
