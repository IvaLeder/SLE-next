"use client";

import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { PostMeta } from "@/lib/posts";

type Props = {
  posts: PostMeta[];
  lang: "en" | "hr";
};

const SUBJECTS = {
  en: [
    { key: "science",     label: "Science" },
    { key: "engineering", label: "Engineering" },
    { key: "math",        label: "Math" },
    { key: "technology",  label: "Technology" },
    { key: "psychology",  label: "Psychology" },
  ],
  hr: [
    { key: "znanost",      label: "Znanost" },
    { key: "inženjerstvo", label: "Inženjerstvo" },
    { key: "matematika",   label: "Matematika" },
    { key: "tehnologija",  label: "Tehnologija" },
    { key: "psihologija",  label: "Psihologija" },
  ],
};

const POSTS_PER_PAGE = 12;

export default function ActivitiesClient({ posts, lang }: Props) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const subjects = SUBJECTS[lang];
  const allLabel  = lang === "en" ? "All" : "Sve";

  const filtered = activeSubject
    ? posts.filter((p) =>
        p.categories?.some(
          (c) => c.toLowerCase() === activeSubject.toLowerCase()
        )
      )
    : posts;

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const visible    = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [activeSubject]);

  const selectSubject = (key: string | null) => {
    setActiveSubject(key);
  };

  const btnBase =
    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border";
  const btnActive =
    "bg-indigo-600 text-white border-indigo-600";
  const btnInactive =
    "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600";

  return (
    <>
      {/* Subject filter chips */}
      <div
        className="flex flex-wrap gap-2 mb-8"
        role="group"
        aria-label={lang === "en" ? "Filter by subject" : "Filtriraj po predmetu"}
      >
        <button
          onClick={() => selectSubject(null)}
          className={`${btnBase} ${activeSubject === null ? btnActive : btnInactive}`}
          aria-pressed={activeSubject === null}
        >
          {allLabel}
        </button>
        {subjects.map((s) => (
          <button
            key={s.key}
            onClick={() => selectSubject(s.key)}
            className={`${btnBase} ${
              activeSubject === s.key ? btnActive : btnInactive
            }`}
            aria-pressed={activeSubject === s.key}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-6">
        {lang === "en"
          ? `${filtered.length} ${filtered.length === 1 ? "activity" : "activities"}`
          : `${filtered.length} ${filtered.length === 1 ? "aktivnost" : "aktivnosti"}`}
      </p>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          {lang === "en" ? "No activities found." : "Nema pronađenih aktivnosti."}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <PostCard key={post.slug} post={post} lang={lang} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            {lang === "en" ? "← Previous" : "← Prethodno"}
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            {lang === "en" ? "Next →" : "Sljedeće →"}
          </button>
        </div>
      )}
    </>
  );
}
