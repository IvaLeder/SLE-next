"use client";

import { useState, useTransition, useEffect, useRef, useId } from "react";
import Link from "@/components/Link";
import { useRouter } from "next/navigation";
import { preloadSearch, searchPosts } from "@/lib/search-client";
import type { SearchHit, SearchResponse } from "@/lib/search-core";
import { Highlight, ResultThumb } from "./SearchHighlight";

const DEBOUNCE_MS = 250;
const MAX_SHOWN = 6;

export default function Search({ lang }: { lang: "en" | "hr" }) {
  const [query, setQuery] = useState("");
  // The last response, tagged with the exact input it answers. Comparing that
  // tag with the live input tells us whether what's on screen is stale.
  const [response, setResponse] = useState<(SearchResponse & { input: string }) | null>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  // Index of the keyboard-highlighted option (-1 = none). Spans the result
  // links plus the trailing "view all" link.
  const [active, setActive] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest input, so a slow response for an older one can't overwrite it.
  const latestQuery = useRef(query);
  const router = useRouter();
  // Search renders twice (desktop nav + mobile menu), so listbox/option ids
  // must be unique per instance for aria-controls/activedescendant.
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const placeholder    = lang === "en" ? "Search posts…" : "Pretraži članke…";
  const noResultsLabel = lang === "en" ? "No matches" : "Nema rezultata";
  const searchingLabel = lang === "en" ? "Searching…" : "Tražim…";
  const viewAllLabel = (n: number) =>
    lang === "en"
      ? n > MAX_SHOWN ? `View all ${n} results →` : "Open results page →"
      : n > MAX_SHOWN ? `Pogledaj sve rezultate (${n}) →` : "Otvori stranicu rezultata →";
  const countLabel = (n: number) =>
    lang === "en"
      ? `${n} ${n === 1 ? "result" : "results"}`
      : `${n} ${n % 10 === 1 && n % 100 !== 11 ? "rezultat" : "rezultata"}`;

  // Debounced search — run DEBOUNCE_MS after the last keystroke.
  // We don't clear `response` here; instead the render works out whether it
  // is stale. That keeps this effect free of setState calls (React 19's
  // react-hooks/set-state-in-effect rule).
  useEffect(() => {
    latestQuery.current = query;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) return;

    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchPosts(query, lang, MAX_SHOWN);
        if (latestQuery.current === query) setResponse({ ...data, input: query });
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, lang]);

  // Render-time gate: only show results once the query is long enough.
  // `response` may still hold the batch for an earlier input; while the next
  // one is on its way we keep showing it (dimmed) instead of flashing
  // "No matches" during the debounce.
  const longEnough = query.trim().length >= 2;
  const isFresh = response?.input === query;
  const loading = longEnough && (!isFresh || isPending);
  const shown: SearchHit[] = longEnough && response ? response.hits.slice(0, MAX_SHOWN) : [];
  const total = longEnough && response ? response.total : 0;
  // Options = result links + the "view all" link (when there are results).
  const optionCount = shown.length > 0 ? shown.length + 1 : 0;
  // Clamp: the result set may have shrunk under the highlighted index.
  const activeIndex = active < optionCount ? active : -1;
  const activeId = activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined;

  // Close dropdown on outside-click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const showDropdown = open && query.trim().length >= 2;

  const searchPageHref = `/${lang}/search?q=${encodeURIComponent(query)}`;

  const navigateTo = (href: string) => {
    setQuery("");
    setOpen(false);
    setActive(-1);
    router.push(href);
  };

  // Combobox keyboard support: arrows move the highlight (aria-activedescendant
  // — focus stays in the input so typing keeps working), Enter opens the
  // highlighted result, or the full results page when nothing is highlighted.
  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (optionCount === 0) return;
      e.preventDefault();
      setOpen(true);
      const down = e.key === "ArrowDown";
      setActive((a) => {
        const current = a < optionCount ? a : -1;
        if (down) return (current + 1) % optionCount;
        return current <= 0 ? optionCount - 1 : current - 1;
      });
    } else if (e.key === "Enter") {
      if (query.trim().length < 2) return;
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < shown.length) {
        const r = shown[activeIndex];
        navigateTo(`/${r.lang}/${r.slug}`);
      } else {
        // No highlight (or highlight on "view all") → full results page.
        navigateTo(searchPageHref);
      }
    } else if (e.key === "Escape") {
      setActive(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          // Fetch the search index while the reader is still typing.
          preloadSearch(lang);
          if (query.trim().length >= 2) setOpen(true);
        }}
        onKeyDown={onInputKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring"
      />

      {/* Screen-reader status — announces result count without stealing focus.
          Rendered persistently so live-region changes are reliably picked up. */}
      <span role="status" aria-live="polite" className="sr-only">
        {longEnough
          ? loading
            ? searchingLabel
            : total === 0
              ? noResultsLabel
              : countLabel(total)
          : ""}
      </span>

      {showDropdown && (
        // Desktop: the header box is only ~9rem wide at lg, too narrow for
        // thumbnail + title + snippet, so the panel grows leftwards from the
        // box's right edge. Mobile menu: the box is full width already.
        <div className="absolute left-0 right-0 lg:left-auto lg:w-[26rem] lg:min-w-full lg:max-w-[calc(100vw-2rem)] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[min(70vh,32rem)] overflow-auto z-50">
          {shown.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500">
              {loading ? searchingLabel : noResultsLabel}
            </p>
          )}

          {shown.length > 0 && (
            <ul
              role="listbox"
              id={listboxId}
              aria-label={placeholder}
              aria-busy={loading}
              className={`transition-opacity ${loading ? "opacity-60" : ""}`}
            >
              {shown.map((r, i) => (
                <li key={r.slug} role="presentation">
                  <Link
                    href={`/${r.lang}/${r.slug}`}
                    role="option"
                    id={`${baseId}-opt-${i}`}
                    aria-selected={activeIndex === i}
                    onClick={() => {
                      setQuery("");
                      setOpen(false);
                      setActive(-1);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-start gap-3 px-3 py-2 hover:bg-brand-soft ${
                      activeIndex === i ? "bg-brand-soft" : ""
                    }`}
                  >
                    <ResultThumb hit={r} className="mt-0.5 h-10 w-14" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-sm leading-snug text-gray-900">
                        <Highlight text={r.title} terms={r.terms} />
                      </span>
                      {r.snippet && (
                        <span className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          <Highlight text={r.snippet} terms={r.terms} />
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
              {/* Always show the "view all" link — the dedicated /search page
                  shows the full list and supports shareable URLs. */}
              <li role="presentation">
                <Link
                  href={searchPageHref}
                  role="option"
                  id={`${baseId}-opt-${shown.length}`}
                  aria-selected={activeIndex === shown.length}
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                    setActive(-1);
                  }}
                  onMouseEnter={() => setActive(shown.length)}
                  className={`block border-t border-gray-200 px-4 py-2 text-sm font-medium text-brand hover:bg-brand-soft ${
                    activeIndex === shown.length ? "bg-brand-soft" : ""
                  }`}
                >
                  {viewAllLabel(total)}
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
