import MiniSearch from "minisearch";
import { getAllPosts, getPostBySlug, Post } from "./posts";

// Create a MiniSearch instance for posts
const miniSearch = new MiniSearch({
  fields: ["title", "excerpt", "categories", "tags", "content"], // fields to index
  storeFields: ["title", "slug", "lang", "excerpt"], // fields to return
  searchOptions: {
    prefix: true, // allows partial word matches
    fuzzy: 0.2, // allows minor typos
  },
});



export function buildSearchIndex(lang: "en" | "hr") {
  const metaPosts = getAllPosts(lang);
  // Map to full posts
  const posts: Post[] = metaPosts.map((p) => getPostBySlug(lang, p.slug)!).filter(Boolean);

  const miniSearch = new MiniSearch({
    fields: ["title", "excerpt", "categories", "tags", "content"],
    storeFields: ["title", "slug", "lang", "excerpt"],
    searchOptions: { prefix: true, fuzzy: 0.2 },
  });

  miniSearch.addAll(posts);
  return miniSearch;
}

// Perform a search
export function searchPosts(query: string, lang: "en" | "hr") {
  const index = buildSearchIndex(lang);
  return index.search(query).map(result => result);
}