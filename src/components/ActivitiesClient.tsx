"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import FilterChips from "./FilterChips";
import { PostMeta } from "@/lib/posts";
import { CATEGORY_DISPLAY, CATEGORY_ICONS } from "@/lib/categories";

type Props = {
  posts: PostMeta[];
  lang: "en" | "hr";
};

// Subjects in fixed display order — keys are always ASCII English slugs
const SUBJECTS: { key: string; label: Record<"en" | "hr", string> }[] = [
  { key: "science",     label: { en: "Science",     hr: "Znanost" } },
  { key: "engineering", label: { en: "Engineering",  hr: "Inženjerstvo" } },
  { key: "math",        label: { en: "Math",         hr: "Matematika" } },
  { key: "technology",  label: { en: "Technology",   hr: "Tehnologija" } },
  { key: "psychology",  label: { en: "Psychology",   hr: "Psihologija" } },
];

const POSTS_PER_PAGE = 12;

export default function ActivitiesClient({ posts, lang }: Props) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const allLabel = lang === "en" ? "All" : "Sve";

  const filtered = activeSubject
    ? posts.filter((p) => {
        // Translate the English slug to the canonical display name for this lang
        const canonicalName = CATEGORY_DISPLAY[lang]?.[activeSubject]?.toLowerCase();
        return p.categories?.some(
          (c) => c.trim().toLowerCase() === canonicalName
        );
      })
    : posts;

  // React 19 prefers "adjust state during render" over effect-based resets.
  // When the active filter changes, snap page back to 1 immediately.
  const [prevSubject, setPrevSubject] = useState(activeSubject);
  if (prevSubject !== activeSubject) {
    setPrevSubject(activeSubject);
    setPage(1);
  }

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const visible    = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <>
      <div className="mb-8">
        <FilterChips
          chips={SUBJECTS.map((s) => ({ key: s.key, label: s.label[lang], icon: CATEGORY_ICONS[s.key] }))}
          active={activeSubject}
          onChange={setActiveSubject}
          allLabel={allLabel}
          ariaLabel={lang === "en" ? "Filter by subject" : "Filtriraj po kategoriji"}
        />
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
          {visible.map((post, i) => (
            // First 3 cards are above-the-fold on most viewports → priority load
            <PostCard key={post.slug} post={post} lang={lang} priority={i < 3} headingLevel="h2" />
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
