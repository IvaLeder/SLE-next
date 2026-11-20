import { buildLangIndex, runSearch, type LangIndex, type SearchDoc, type SearchResponse } from "./search-core";

// Browser side of site search: fetch /search-{lang}.json once per page load,
// build the index in memory, then answer every query locally. The file is a
// static asset, so searching costs no server work at all.

const loading: Partial<Record<"en" | "hr", Promise<LangIndex>>> = {};

function loadIndex(lang: "en" | "hr"): Promise<LangIndex> {
  let promise = loading[lang];
  if (!promise) {
    promise = fetch(`/search-${lang}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Search index ${lang}: HTTP ${res.status}`);
        return res.json() as Promise<SearchDoc[]>;
      })
      .then(buildLangIndex)
      .catch((error) => {
        // Let the next search retry instead of caching the failure.
        delete loading[lang];
        throw error;
      });
    loading[lang] = promise;
  }
  return promise;
}

/** Start downloading the index early (e.g. when the search box gets focus). */
export function preloadSearch(lang: "en" | "hr"): void {
  loadIndex(lang).catch(() => {});
}

export async function searchPosts(
  query: string,
  lang: "en" | "hr",
  limit = 50,
): Promise<SearchResponse> {
  if (typeof query !== "string" || query.trim().length === 0) {
    return { query: "", total: 0, hits: [] };
  }
  const l = lang === "hr" ? "hr" : "en";
  return runSearch(await loadIndex(l), query, l, limit);
}
