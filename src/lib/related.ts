import { getAllPosts, Post } from "./posts";

/**
 * Related posts, ranked by shared TAGS weighted by rarity (inverse document
 * frequency) plus a small shared-category bonus.
 *
 * A shared *rare* tag (e.g. "origami", "coding") is a strong topical signal; a
 * shared *ubiquitous* one ("activity", on ~2/3 of the catalogue) barely means
 * anything, so it's down-weighted by IDF. A shared category adds a light bonus
 * so same-subject posts win ties and still fill the slots when a post has few
 * or weak tags. Posts sharing neither a tag nor a category are dropped. Ties
 * break toward the newer post (freshness).
 *
 * Signature is `(lang, currentPost, limit)` to match the article-page callers.
 */
export function getRelatedPosts(
  lang: "en" | "hr",
  currentPost: Post,
  limit = 3
): Post[] {
  const candidates = getAllPosts(lang).filter((p) => p.slug !== currentPost.slug);

  // Document frequency per tag across candidates -> rarity weight.
  const tagDocFreq = new Map<string, number>();
  for (const p of candidates) {
    for (const t of p.tags ?? []) {
      const key = t.trim().toLowerCase();
      tagDocFreq.set(key, (tagDocFreq.get(key) ?? 0) + 1);
    }
  }

  const currentTags = new Set((currentPost.tags ?? []).map((t) => t.trim().toLowerCase()));
  const currentCats = new Set((currentPost.categories ?? []).map((c) => c.trim().toLowerCase()));

  return candidates
    .map((p) => {
      let score = 0;
      for (const t of p.tags ?? []) {
        const key = t.trim().toLowerCase();
        // Inverse document frequency: rarer shared tags weigh more.
        if (currentTags.has(key)) score += 1 / Math.log2((tagDocFreq.get(key) ?? 1) + 1);
      }
      // Light same-subject bonus / tie-breaker.
      if ((p.categories ?? []).some((c) => currentCats.has(c.trim().toLowerCase()))) score += 0.5;
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.post);
}
