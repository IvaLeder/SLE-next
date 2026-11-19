"use server";

import MiniSearch, { type SearchOptions, type SearchResult } from "minisearch";
import { getAllPosts } from "./posts";
import { CATEGORY_DISPLAY, CATEGORY_ICONS } from "./categories";
import { baseVariants } from "./assets/helpers";
import { bestWindow, fold, hasHit, mdxToPlainText } from "./search-text";

/** One search result, already shaped for display (no MDX, no index internals). */
export type SearchHit = {
  slug: string;
  lang: "en" | "hr";
  title: string;
  /** Plain-text snippet: the post description, or the passage of the article
   *  that contains the match when the description doesn't. */
  snippet: string;
  category?: string;
  categoryIcon?: string;
  /** Smallest cover variant, for result thumbnails. */
  thumb?: { url: string; color?: string };
  /** Folded index terms this post matched — feed to highlight(). */
  terms: string[];
};

export type SearchResponse = { query: string; total: number; hits: SearchHit[] };

type IndexedDoc = {
  slug: string;
  title: string;
  description: string;
  tags: string;
  categories: string;
  text: string;
};

type LangIndex = {
  mini: MiniSearch<IndexedDoc>;
  /** Per-slug display data, kept outside MiniSearch so the index stays lean. */
  docs: Map<
    string,
    Omit<SearchHit, "terms" | "snippet"> & { description: string; text: string; folded: string }
  >;
};

const cachedIndex: { [lang: string]: LangIndex } = {};

/** Function words dropped from queries (already folded). Kept in the index;
 *  they just shouldn't decide what matches or get highlighted. */
const STOP_WORDS: Record<"en" | "hr", Set<string>> = {
  en: new Set(
    "a an the and or of to in on for with how what why when is are do does my your it at by from i me you about into".split(" "),
  ),
  hr: new Set(
    "i u s sa na za od do je se su kako sto zasto li a ali o po iz k ka te ili to da ne ce bi mi ti vi".split(" "),
  ),
};

/** Case endings trimmed from query words before prefix matching: a crude
 *  stemmer, so "jajem" finds "jaje", "raketu" finds "raketa" and "volcanoes"
 *  finds "volcano". Only query words are trimmed; prefix search then matches
 *  every form in the index. Longest ending first. */
const SUFFIXES: Record<"en" | "hr", string[]> = {
  en: ["ies", "es", "s"],
  hr: ["ima", "ama", "ovi", "eva", "om", "em", "og", "oj", "ih", "im", "a", "e", "i", "o", "u"],
};

function stem(lang: "en" | "hr", term: string): string {
  if (term.length < 5) return term;
  const suffix = SUFFIXES[lang].find((s) => term.endsWith(s) && term.length - s.length >= 3);
  return suffix ? term.slice(0, -suffix.length) : term;
}

/** English display name → slug, per language, for category icons. */
function categoryIcon(lang: "en" | "hr", display?: string) {
  if (!display) return undefined;
  const entry = Object.entries(CATEGORY_DISPLAY[lang]).find(
    ([, name]) => name.toLowerCase() === display.trim().toLowerCase(),
  );
  return entry ? CATEGORY_ICONS[entry[0]] : undefined;
}

/** Build (or reuse) the search index for a language. */
function buildSearchIndex(lang: "en" | "hr"): LangIndex {
  if (cachedIndex[lang]) return cachedIndex[lang];

  const posts = getAllPosts(lang);
  const docs: LangIndex["docs"] = new Map();
  const indexed: IndexedDoc[] = posts.map((p) => {
    // Article bodies are raw MDX; index (and later quote) only the prose.
    const text = mdxToPlainText(p.content);
    const description = p.description || p.excerpt || "";
    // 400w WebP is plenty for a ≤160px thumbnail at DPR 2-3.
    const smallest = p.cover
      ? (p.cover.variants.webp?.[0] ?? baseVariants(p.cover)?.[0])
      : undefined;
    docs.set(p.slug, {
      slug: p.slug,
      lang,
      title: p.title,
      category: p.categories?.[0],
      categoryIcon: categoryIcon(lang, p.categories?.[0]),
      thumb: smallest
        ? { url: smallest.url, color: p.cover?.dominantColor }
        : p.coverImage
          ? { url: p.coverImage }
          : undefined,
      description,
      text,
      folded: fold(text),
    });
    return {
      slug: p.slug,
      title: p.title,
      description,
      tags: (p.tags ?? []).join(" "),
      categories: (p.categories ?? []).join(" "),
      text,
    };
  });

  const mini = new MiniSearch<IndexedDoc>({
    idField: "slug",
    fields: ["title", "description", "tags", "categories", "text"],
    storeFields: [],
    // Lowercase + strip diacritics on both sides, so "cokolada" finds
    // "čokolada" and "Moon" finds "moon".
    processTerm: (term) => fold(term) || null,
    searchOptions: {
      // A hit in the title or tags says far more about what a post is about
      // than one passing mention deep in the body.
      boost: { title: 4, tags: 2.5, description: 2, categories: 1.5, text: 1 },
    },
  });
  mini.addAll(indexed);

  cachedIndex[lang] = { mini, docs };
  return cachedIndex[lang];
}

function toHit(index: LangIndex, r: SearchResult): SearchHit | null {
  const doc = index.docs.get(String(r.id));
  if (!doc) return null;
  // Single letters (an initial, "s") would light up every snippet.
  const terms = r.terms.filter((t) => t.length >= 2);
  // Prefer the hand-written description; fall back to the passage of the
  // article that actually contains the match, so readers see *why* this
  // post came up instead of a summary that never mentions their word.
  const snippet =
    hasHit(doc.description, terms) || hasHit(doc.title, terms)
      ? doc.description
      : (bestWindow(doc.text, doc.folded, terms) ?? doc.description);
  return {
    slug: doc.slug,
    lang: doc.lang,
    title: doc.title,
    snippet,
    category: doc.category,
    categoryIcon: doc.categoryIcon,
    thumb: doc.thumb,
    terms,
  };
}

export async function searchPostsServer(
  query: string,
  lang: "en" | "hr",
  limit = 50,
): Promise<SearchResponse> {
  if (typeof query !== "string" || query.trim().length === 0) {
    return { query: "", total: 0, hits: [] };
  }
  if (lang !== "en" && lang !== "hr") lang = "en";

  // This is a public server action — cap the input so an oversized query
  // can't make MiniSearch chew through an arbitrary amount of work.
  const q = query.slice(0, 100);
  const max = Math.min(Math.max(1, Number(limit) || 50), 50);

  const index = buildSearchIndex(lang);
  // Drop stop words ("how to", "kako", "s") unless that would leave nothing.
  const words = q.split(/[\n\r\p{Z}\p{P}]+/u).map(fold).filter(Boolean);
  const stops = STOP_WORDS[lang];
  const keepStops = words.every((w) => stops.has(w));
  const processTerm = (term: string) => {
    const t = fold(term);
    if (!t || (!keepStops && stops.has(t))) return null;
    return stem(lang, t);
  };

  // Search in stages, stopping at the first that finds anything:
  //   1. every word must match ("baking soda volcano" → all three), exactly
  //      or as a prefix (prefixes double as inflection: vulkan → vulkanu);
  //   2. same, now forgiving typos ("expirement") and expanding the 2-letter
  //      word still being typed ("ba" → baking);
  //   3–4. any word may match, strict then loose.
  // Loose matching only when strict finds nothing: a 6-letter word is one
  // edit from far too many others (baking/making, rocket/pocket), and "pi"
  // shouldn't bring every pig and pinecone along.
  const strict: SearchOptions = {
    processTerm,
    prefix: (term) => term.length >= 3,
    fuzzy: false,
  };
  const loose: SearchOptions = {
    processTerm,
    prefix: (term, i, terms) => term.length >= 3 || (i === terms.length - 1 && term.length === 2),
    fuzzy: (term) => (term.length < 5 ? false : term.length < 9 ? 1 : 2),
  };
  let results: SearchResult[] = [];
  const stages: SearchOptions[] = [
    { ...strict, combineWith: "AND" },
    { ...loose, combineWith: "AND" },
    { ...strict, combineWith: "OR" },
    { ...loose, combineWith: "OR" },
  ];
  for (const opts of stages) {
    results = index.mini.search(q, opts);
    if (results.length > 0) break;
  }

  const hits = results
    .slice(0, max)
    .map((r) => toHit(index, r))
    .filter((h): h is SearchHit => h !== null);

  return { query: q, total: results.length, hits };
}
