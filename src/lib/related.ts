import { getAllPosts, Post } from "./posts";

export function getRelatedPosts(
  lang: "en" | "hr",
  currentPost: Post,
  limit = 3
): Post[] {
  const all = getAllPosts(lang);

  const relatedScores = all
    .filter((p) => p.slug !== currentPost.slug)
    .map((p) => {
      let score = 0;

      // Category overlap → strong signal
      const sharedCategories = p.categories.filter((c) =>
        currentPost.categories.includes(c)
      );
      score += sharedCategories.length * 3;

      // Tag overlap → weak signal
      const sharedTags = (p.tags || []).filter((t) =>
        (currentPost.tags || []).includes(t)
      );
      score += sharedTags.length * 1;

      return { post: p, score };
    })
    .filter((item) => item.score > 0) // only keep relevant ones
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);

  return relatedScores;
}