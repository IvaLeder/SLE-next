import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Type for frontmatter
export type PostMeta = {
  title: string;
  date: string;
  author?: string;
  slug: string;
  lang: "en" | "hr";
  excerpt?: string;
  categories: string[];
  tags?: string[];
  coverImage?: string;
  heroAlt?: string;
  downloadables?: { label: string; url: string }[];
  translationOf?: string;  // <— ADD THIS LINE
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

      const post: Post = {
        ...data,
        excerpt,
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

export function getTranslatedPost(lang: "en" | "hr", translationOf: string): PostMeta | null {
  const posts = getAllPosts(lang);
  return posts.find((p) => p.translationOf === translationOf) || null;
}

export function getPostTranslations(translationOf: string): PostMeta[] {
  const en = getTranslatedPost("en", translationOf);
  const hr = getTranslatedPost("hr", translationOf);
  return [en, hr].filter(Boolean) as PostMeta[];
}

// ------------------------------------------------------
//  Get posts that belong to a given category
// ------------------------------------------------------
export function getPostsByCategory(lang: "en" | "hr", category: string): Post[] {
  const all = getAllPosts(lang);

  const normalizedCategory = category.trim().toLowerCase();

  return all.filter((post) =>
    post.categories?.some(
      (cat) => cat.trim().toLowerCase() === normalizedCategory
    )
  );
}

// ------------------------------------------------------
//  Get ALL categories that exist in a language
// ------------------------------------------------------
export function getAllCategories(lang: "en" | "hr"): string[] {
  const posts = getAllPosts(lang);

  const categories = new Set<string>();

  posts.forEach((post) => {
    post.categories?.forEach((cat) => {
      categories.add(cat.trim());
    });
  });

  return Array.from(categories).sort((a, b) => a.localeCompare(b));
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