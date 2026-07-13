"use client";

import { Fragment, useState, useMemo, useRef, useSyncExternalStore } from "react";
import PostCard from "./PostCard";
import CategoryFilter from "./CategoryFilter";
import AdSlot from "./AdSlot";
import { IN_FEED_LAYOUT_KEY } from "../lib/ads";
import { PostMeta } from "../lib/posts";

const POSTS_PER_PAGE = 12;

// ── ?page= as the source of truth ──────────────────────────────────────────
// The page number lives in the URL so page 2+ is shareable/bookmarkable and
// back/forward works. Read via useSyncExternalStore: the server snapshot is
// always 1 (matching the prerendered HTML, so no hydration mismatch and the
// page-1 grid stays in static HTML for crawlers); the client re-renders to the
// real ?page= right after hydration. PAGE_EVENT covers same-tab pushState
// (which doesn't fire popstate); popstate covers back/forward.
const PAGE_EVENT = "postlist-pagechange";

function subscribePage(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(PAGE_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(PAGE_EVENT, cb);
  };
}
function readPageFromUrl(): number {
  const n = Number(new URLSearchParams(window.location.search).get("page"));
  return Number.isInteger(n) && n > 1 ? n : 1;
}
const pageOnServer = () => 1;

// Canonical display order for each language. Hoisted out of the component
// so it's a stable reference (otherwise useMemo deps complain).
const CATEGORY_ORDER: Record<string, string[]> = {
  en: ["Science", "Engineering", "Math", "Technology", "Psychology"],
  hr: ["Znanost", "Inženjerstvo", "Matematika", "Tehnologija", "Psihologija"],
};

export default function PostList({
  posts,
  lang,
  adSlot,
}: {
  posts: PostMeta[];
  lang: "en" | "hr";
  /** AdSense in-feed slot id. When set, ad cards render after the 3rd and 9th
   *  posts (second and fourth row on desktop) — first page, unfiltered view
   *  only, so paging/filtering doesn't re-request ads. */
  adSlot?: string;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const page = useSyncExternalStore(subscribePage, readPageFromUrl, pageOnServer);
  const listRef = useRef<HTMLDivElement>(null);

  // Write the page to the URL. Prev/Next push (each page is a history entry,
  // back button steps through); the filter-change reset replaces, so filtering
  // doesn't pollute history.
  const setPage = (n: number, opts?: { reset?: boolean }) => {
    const url = new URL(window.location.href);
    if (n > 1) url.searchParams.set("page", String(n));
    else url.searchParams.delete("page");
    if (opts?.reset) {
      window.history.replaceState(null, "", url);
    } else {
      window.history.pushState(null, "", url);
      // Paging from the bottom controls: bring the top of the new page's grid
      // into view (instant for reduced-motion users).
      listRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
    window.dispatchEvent(new Event(PAGE_EVENT));
  };

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
  // Clamp: ?page= can arrive out of range (hand-edited URL, shrunken filter).
  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const paginated = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

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
    // scroll-mt offsets the sticky header when paging scrolls back up here.
    <div ref={listRef} className="scroll-mt-20">
      <CategoryFilter
        categories={categories}
        lang={lang}
        onChange={(c) => {
          setCategory(c);
          setPage(1, { reset: true });
        }}
      />

      {filtered.length === 0 ? (
        <p className="mt-6 text-gray-500 italic">{t.empty}</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((post, i) => (
              <Fragment key={post.slug}>
                {/* Same in-feed unit twice per page is fine with AdSense;
                    split into separate slot ids later if per-placement
                    reporting becomes interesting. */}
                {adSlot && !category && currentPage === 1 && (i === 3 || i === 9) && (
                  <AdSlot
                    slot={adSlot}
                    lang={lang}
                    format="in-feed"
                    layoutKey={IN_FEED_LAYOUT_KEY}
                    variant="card"
                  />
                )}
                {/* Only the first card eager-loads. Mobile LCP is the hero
                    <h1> text (not an image), and the hero pushes cards 2–3
                    below the fold, so marking three 100vw covers priority just
                    stole bandwidth from the render path. One priority image is
                    the standard recommendation; the rest lazy-load. */}
                <PostCard post={post} lang={lang} priority={i === 0} headingLevel="h2" />
              </Fragment>
            ))}
          </div>

          {/* Issue 29: pagination controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:bg-brand-soft hover:border-brand-muted"
              >
                {t.prev}
              </button>

              <span className="text-sm text-gray-500">{t.page(currentPage, totalPages)}</span>

              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:bg-brand-soft hover:border-brand-muted"
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
