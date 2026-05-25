"use client";

import { useState, useMemo, useEffect } from "react";
import PostCard from "./PostCard";
import CategoryFilter from "./CategoryFilter";
import { PostMeta } from "../lib/posts";

const POSTS_PER_PAGE = 12;

export default function PostList({
  posts,
  lang,
}: {
  posts: PostMeta[];
  lang: "en" | "hr";
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the category filter changes (issue 29)
  useEffect(() => {
    setPage(1);
  }, [category]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.categories?.forEach((cat) => set.add(cat)));
    return Array.from(set).sort();
  }, [posts]);

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
            {paginated.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} />
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
