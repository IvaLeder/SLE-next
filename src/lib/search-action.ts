"use server";

import MiniSearch from "minisearch";
import { getAllPosts, getPostBySlug, Post } from "./posts";

const cachedIndex: { [lang: string]: MiniSearch } = {};

/** Build (or reuse) a MiniSearch index for a language */
function buildSearchIndex(lang: "en" | "hr") {
  // reuse cached index if available (helps during dev)
  if (cachedIndex[lang]) return cachedIndex[lang];

  const metaPosts = getAllPosts(lang);
  const posts: Post[] = metaPosts
    .map((p) => getPostBySlug(lang, p.slug)!)
    .filter(Boolean);

  const mini = new MiniSearch({
    fields: ["title", "excerpt", "categories", "tags", "content"], // searchable fields
    storeFields: ["title", "slug", "lang", "excerpt"], // returned fields
    idField: "slug", // use 'slug' as the unique id (required)
    searchOptions: { prefix: true, fuzzy: 0.2 },
  });

  // Ensure each document has a slug (idField). Your Post type already has slug.
  mini.addAll(posts);

  // cache for subsequent calls
  cachedIndex[lang] = mini;
  return mini;
}

export async function searchPostsServer(query: string, lang: "en" | "hr") {
  if (typeof query !== "string" || query.trim().length === 0) return [];

  // This is a public server action — cap the input so an oversized query
  // can't make MiniSearch chew through an arbitrary amount of work.
  const q = query.slice(0, 100);

  const index = buildSearchIndex(lang);
  const results = index.search(q, { prefix: true, fuzzy: 0.2 });

  // results are objects with the stored fields; return them directly
  return results;
}