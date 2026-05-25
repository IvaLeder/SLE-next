import fs from "fs";
import path from "path";
import matter from "gray-matter";
export { CATEGORY_SLUGS, CATEGORY_DISPLAY } from "./categories";
export type { CategorySlug } from "./categories";
import { CATEGORY_DISPLAY, CATEGORY_SLUGS } from "./categories";

// Type for frontmatter
export type PostMeta = {
  title: string;
  date: string;
  author?: string;
  slug: string;
  lang: "en" | "hr";
  description?: string;    // hand-written SEO description from frontmatter
  excerpt?: string;        // auto-generated fallback
  readingTimeMin?: number; // estimated reading time in minutes
  categories: string[];
  tags?: string[];
  coverImage?: string;
  heroAlt?: string;
  downloadables?: { label: string; url: string }[];
  translationKey: string;
};

// Type for full post
export type Post = PostMeta & {
  content: string;
};

// Base folder for posts
const postsDirectory = path.join(process.cwd(), "src/content/posts");

/**
 * Read all posts for a given language
 */
export function getAllPosts(lang: "en" | "hr"): Post[] {
  const langDir = path.join(postsDirectory, lang);
  const filenames = fs.readdirSync(langDir);

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

      const post: Post = {
        ...data,
        excerpt,
        readingTimeMin,
        content,
      } as Post;

      return post;
    });

  // Sort by date descending
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}

/**
 * Get single post by slug
 */
export function getPostBySlug(lang: "en" | "hr", slug: string): Post | null {
  const posts = getAllPosts(lang);
  return posts.find((p) => p.slug === slug) || null;
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
//  Get ALL category slugs (English, ASCII-safe, URL-ready)
// ------------------------------------------------------
export function getAllCategories(_lang?: "en" | "hr"): string[] {
  return [...CATEGORY_SLUGS];
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
 * Get posts related to the current post by category
 */
export function getRelatedPosts(current: Post, lang: "en" | "hr", limit = 3): Post[] {
  const posts = getAllPosts(lang).filter(
    (p) =>
      p.slug !== current.slug && // exclude current post
      p.categories.some((cat) => current.categories.includes(cat)) // shared category
  );

  return posts.slice(0, limit);
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