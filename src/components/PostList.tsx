"use client";

import { useState, useMemo } from "react";
import PostCard from "./PostCard";
import CategoryFilter from "./CategoryFilter";
import { PostMeta } from "../lib/posts";

export default function PostList({
  posts,
  lang,
}: {
  posts: PostMeta[];
  lang: "en" | "hr";
}) {
  const [category, setCategory] = useState<string | null>(null);

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

  return (
    <div>
      <CategoryFilter
        categories={categories}
        onChange={(cat) => setCategory(cat)}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <PostCard key={post.slug} post={post} lang={lang} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-gray-500 italic">No posts found for this category.</p>
      )}
    </div>
  );
}