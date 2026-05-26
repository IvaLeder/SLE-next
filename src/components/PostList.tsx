"use client";

import { useState, useMemo } from "react";
import PostCard from "./PostCard";
import CategoryFilter from "./CategoryFilter";
import { PostMeta } from "../lib/posts";

const POSTS_PER_PAGE = 12;

// Canonical display order for each language. Hoisted out of the component
// so it's a stable reference (otherwise useMemo deps complain).
const CATEGORY_ORDER: Record<string, string[]> = {
  en: ["Science", "Engineering", "Math", "Technology", "Psychology"],
  hr: ["Znanost", "Inženjerstvo", "Matematika", "Tehnologija", "Psihologija"],
};

export default function PostList({
  posts,
  lang,
}: {
  posts: PostMeta[];
  lang: "en" | "hr";
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // React 19 prefers "adjust state during render" over useEffect-based resets.
  // When the active filter changes, snap page back to 1 immediately — this
  // happens during the same render pass, no cascading re-render.
  const [prevCategory, setPrevCategory] = useState(category);
  if (prevCategory !== category) {
    setPrevCategory(category);
    setPage(1);
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.categories?.forEach((cat) => set.add(cat)));
    const order = CATEGORY_ORDER[lang] ?? [];
    return Array.from(set).sort(
      (a, b) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
    );
  }, [posts, lang]);

  const filtered = useMemo(() => {
    if (!category) return posts;
    return posts.filter((p) =>
      p.categories?.map((c) => c.toLowerCase()).includes(category.toLowerCase())
    );
  }, [posts, category]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const t = {
    en: {
      empty: "No posts found for this category.",
      prev: "← Previous",
      next: "Next →",
      page: (cur: number, total: number) => `Page ${cur} of ${total}`,
    },
    hr: {
      empty: "Nema članaka u ovoj kategoriji.",
      prev: "← Prethodno",
      next: "Sljedeće →",
      page: (cur: number, total: number) => `Stranica ${cur} od ${total}`,
    },
  }[lang];

  return (
    <div>
      <CategoryFilter categories={categories} lang={lang} onChange={setCategory} />

      {filtered.length === 0 ? (
        <p className="mt-6 text-gray-500 italic">{t.empty}</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((post, i) => (
              // First 3 cards are above-the-fold on most viewports → priority load
              <PostCard key={post.slug} post={post} lang={lang} priority={i < 3} />
            ))}
          </div>

          {/* Issue 29: pagination controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:bg-indigo-50 hover:border-indigo-400"
              >
                {t.prev}
              </button>

              <span className="text-sm text-gray-500">{t.page(page, totalPages)}</span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:bg-indigo-50 hover:border-indigo-400"
              >
                {t.next}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
