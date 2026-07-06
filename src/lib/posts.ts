import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getCardImage } from "./assets";
import type { ImageEntry } from "./assets/types";
export { CATEGORY_SLUGS, CATEGORY_DISPLAY } from "./categories";
export type { CategorySlug } from "./categories";
import { CATEGORY_DISPLAY, CATEGORY_SLUGS } from "./categories";

// Type for frontmatter
export type PostMeta = {
  title: string;
  date: string;             // original publication date — never bumped after launch
  dateModified?: string;    // optional; set when the article has been meaningfully edited
  author?: string;
  slug: string;
  lang: "en" | "hr";
  description?: string;    // hand-written SEO description from frontmatter
  excerpt?: string;        // auto-generated fallback
  readingTimeMin?: number; // estimated reading time in minutes
  /** Derived at build time in getAllPosts(): true when dateModified is set
   *  AND within the last 90 days. Kept on PostMeta so components can render
   *  the "Updated" chip without calling impure Date.now() in render. */
  isRecentlyUpdated?: boolean;
  categories: string[];
  tags?: string[];
  coverImage?: string;
  heroAlt?: string;
  /** Derived at build time in readAllPosts(): the image-pipeline manifest
   *  entry for coverImage (blur stripped — card grids are client components,
   *  so this travels in serialized props). Undefined when the manifest
   *  doesn't know the file; consumers fall back to plain coverImage. */
  cover?: ImageEntry;
  downloadables?: { label: string; url: string }[];
  translationKey: string;
  /** Draft workflow: `draft: true` posts are excluded from every public
   *  surface (listings, sitemap, RSS, search, static params, hreflang) and
   *  are only reachable at /{lang}/draft/{slug}?key={previewToken}. */
  draft?: boolean;
  previewToken?: string;
};

// Type for full post
export type Post = PostMeta & {
  content: string;
};

// Base folder for posts
const postsDirectory = path.join(process.cwd(), "src/content/posts");

// Build-time cache. getAllPosts is hit by every page's generateStaticParams /
// generateMetadata / render, and each call used to re-read and re-parse every
// MDX file per language (O(pages × posts) disk reads per build). Production
// only, so `next dev` still picks up content edits without a restart.
// readAllPosts returns the cached array itself — the public accessors below
// always derive a fresh array via filter(), so callers (getPrevNextPosts
// sorts in place) never mutate the cache.
const postsCache = new Map<"en" | "hr", Post[]>();
const cacheEnabled = process.env.NODE_ENV === "production";

/**
 * Read every post file for a language, drafts included. Internal — public
 * accessors filter by draft status.
 */
function readAllPosts(lang: "en" | "hr"): Post[] {
  if (cacheEnabled) {
    const cached = postsCache.get(lang);
    if (cached) return cached;
  }

  const langDir = path.join(postsDirectory, lang);
  const filenames = fs.readdirSync(langDir);

  // Single "now" reference per build so isRecentlyUpdated is stable across
  // all posts in this build. Build-time evaluation also keeps render pure
  // (no Date.now() in React components).
  const NOW = Date.now();
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

  const posts = filenames
    .filter((fn) => fn.endsWith(".md") || fn.endsWith(".mdx"))
    .map((filename) => {
      const filePath = path.join(langDir, filename);
      const file = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(file);
      const excerpt = data.excerpt || content.slice(0, 160).replace(/\n/g, " ") + "...";
      // Validate required fields
      if (!data.title || !data.date || !data.slug) {
        throw new Error(`Missing required frontmatter in ${filename}`);
      }

      // Estimate reading time (avg. 200 words/min)
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

      // "Updated" chip eligibility — frozen at build time.
      const isRecentlyUpdated =
        !!data.dateModified &&
        data.dateModified !== data.date &&
        NOW - new Date(data.dateModified).getTime() < NINETY_DAYS_MS;

      // Resolve the cover's manifest entry once at build time — grids render
      // in client components, which can't read the manifest themselves.
      const cover =
        typeof data.coverImage === "string"
          ? (getCardImage(data.coverImage) ?? undefined)
          : undefined;

      const post: Post = {
        ...data,
        excerpt,
        readingTimeMin,
        isRecentlyUpdated,
        cover,
        content,
      } as Post;

      return post;
    });

  // Sort by date descending
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  if (cacheEnabled) postsCache.set(lang, posts);
  return posts;
}

/**
 * Read all PUBLISHED posts for a given language. Drafts (`draft: true`) are
 * excluded here, which keeps them out of every public surface at once:
 * listings, sitemap, RSS, search, related/prev-next, and generateStaticParams.
 */
export function getAllPosts(lang: "en" | "hr"): Post[] {
  return readAllPosts(lang).filter((p) => p.draft !== true);
}

/**
 * Strip the heavy `content` (full markdown body) off posts before they cross
 * into a CLIENT component. The card-grid clients (PostList, ActivitiesClient)
 * only ever read PostMeta fields, but React serializes the *runtime* object —
 * so passing Post[] shipped every article's entire body in the page's hydration
 * payload. On the homepage that alone was ~1.1 MB of HTML (all ~90 posts), the
 * dominant cause of its slow FCP/LCP. Server grids (category/tag/author render
 * PostCard directly) don't need this — their props never leave the server.
 */
export function toPostMeta(posts: Post[]): PostMeta[] {
  return posts.map(({ content: _content, ...meta }) => meta);
}

/**
 * Get single post by slug
 */
export function getPostBySlug(lang: "en" | "hr", slug: string): Post | null {
  const posts = getAllPosts(lang);
  return posts.find((p) => p.slug === slug) || null;
}

/**
 * Get a single DRAFT post by slug — only used by the token-gated preview
 * route at /{lang}/draft/{slug}. Published posts are not reachable here.
 */
export function getDraftBySlug(lang: "en" | "hr", slug: string): Post | null {
  return (
    readAllPosts(lang).find((p) => p.draft === true && p.slug === slug) || null
  );
}

export function getTranslatedPost(
  current: Post
): Post | null {
  const targetLang =
    current.lang === "en" ? "hr" : "en";

  return (
    getAllPosts(targetLang).find(
      (p) =>
        p.translationKey === current.translationKey
    ) || null
  );
}


// ------------------------------------------------------
//  Get posts that belong to a given category
//  `slug` is always an ASCII English key (science, engineering, …)
// ------------------------------------------------------
export function getPostsByCategory(lang: "en" | "hr", slug: string): Post[] {
  const all = getAllPosts(lang);
  const displayName = CATEGORY_DISPLAY[lang]?.[slug.toLowerCase()];
  if (!displayName) return [];
  const target = displayName.toLowerCase();
  return all.filter((post) =>
    post.categories?.some((cat) => cat.trim().toLowerCase() === target)
  );
}

// ------------------------------------------------------
//  Get ALL category slugs (English, ASCII-safe, URL-ready).
//  The slugs are language-neutral by design; both `/en/category/science`
//  and `/hr/category/science` route to the same slug — the page resolves
//  the display name via CATEGORY_DISPLAY[lang].
// ------------------------------------------------------
export function getAllCategories(): string[] {
  return [...CATEGORY_SLUGS];
}

// ------------------------------------------------------
//  Get all posts written by a given author (matched by the frontmatter
//  `author` field — same string used as the key in src/lib/authors.ts).
// ------------------------------------------------------
export function getPostsByAuthor(lang: "en" | "hr", authorName: string): Post[] {
  const all = getAllPosts(lang);
  const needle = authorName.trim().toLowerCase();
  return all.filter((p) => p.author?.trim().toLowerCase() === needle);
}

// ------------------------------------------------------
//  Get posts that have a given tag
// ------------------------------------------------------
export function getPostsByTag(lang: "en" | "hr", tag: string): Post[] {
  const all = getAllPosts(lang);
  const normalizedTag = tag.trim().toLowerCase();
  return all.filter((post) =>
    (post.tags ?? []).some((t) => t.trim().toLowerCase() === normalizedTag)
  );
}

// ------------------------------------------------------
//  Get ALL tags that exist in a language
// ------------------------------------------------------
export function getAllTags(lang: "en" | "hr"): string[] {
  const posts = getAllPosts(lang);
  const tags = new Set<string>();
  posts.forEach((post) => {
    (post.tags ?? []).forEach((t) => tags.add(t.trim()));
  });
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

/**
 * Get posts related to the current post.
 *
 * Relevance is driven by shared TAGS, weighted by rarity: a shared "coding" or
 * "origami" tag is a strong topical signal, while a shared "activity" tag (on
 * ~2/3 of the catalogue) barely means anything. We weight each shared tag by
 * inverse document frequency so rare tags dominate. A shared category adds a
 * small bonus so same-subject posts win ties and still fill the slots when a
 * post has few/weak tags. Posts sharing neither a tag nor a category are
 * dropped. Ties break toward the newer post (freshness).
 */
export function getRelatedPosts(current: Post, lang: "en" | "hr", limit = 3): Post[] {
  const candidates = getAllPosts(lang).filter((p) => p.slug !== current.slug);

  // Document frequency per tag across candidates → rarity weight.
  const tagDocFreq = new Map<string, number>();
  for (const p of candidates) {
    for (const t of p.tags ?? []) {
      const key = t.trim().toLowerCase();
      tagDocFreq.set(key, (tagDocFreq.get(key) ?? 0) + 1);
    }
  }

  const currentTags = new Set((current.tags ?? []).map((t) => t.trim().toLowerCase()));
  const currentCats = new Set(current.categories.map((c) => c.trim().toLowerCase()));

  const scored = candidates.map((p) => {
    let score = 0;
    for (const t of p.tags ?? []) {
      const key = t.trim().toLowerCase();
      if (currentTags.has(key)) {
        // Inverse document frequency: rarer shared tags weigh more.
        score += 1 / Math.log2((tagDocFreq.get(key) ?? 1) + 1);
      }
    }
    if (p.categories.some((c) => currentCats.has(c.trim().toLowerCase()))) {
      score += 0.5; // light same-subject bonus / tie-breaker
    }
    return { post: p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((s) => s.post);
}

/**
 * Get previous and next posts relative to the current post
 */
export function getPrevNextPosts(current: Post, lang: "en" | "hr") {
  const posts = getAllPosts(lang).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const index = posts.findIndex((p) => p.slug === current.slug);

  const prev = index > 0 ? posts[index - 1] : null;
  const next = index < posts.length - 1 ? posts[index + 1] : null;

  return { prev, next };
}

export function getTranslatedPostBySlug(
  currentLang: "en" | "hr",
  slug: string
): Post | null {
  const currentPost = getPostBySlug(currentLang, slug);

  if (!currentPost) return null;

  const targetLang =
    currentLang === "en" ? "hr" : "en";

  return (
    getAllPosts(targetLang).find(
      (p) =>
        p.translationKey ===
        currentPost.translationKey
    ) || null
  );
}