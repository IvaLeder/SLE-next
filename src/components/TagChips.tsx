import Link from "next/link";
import { TAG_DISPLAY, type TagSlug } from "@/lib/tags";

/**
 * Pill links to tag landing pages. Server component (no client JS) — each chip
 * is a plain <Link> to a static /[lang]/tag/[slug] route.
 *
 * Visual style is kept in sync with CategoryNav / FilterChips so tags, subjects
 * and filters all read as the same component family across the site.
 *
 * Pass already-curated `tags` (e.g. from `surfacedTagsOf(post.tags)`); this
 * component does not filter. Renders nothing when `tags` is empty.
 */
export default function TagChips({
  lang,
  tags,
  activeSlug,
  ariaLabel,
}: {
  lang: "en" | "hr";
  tags: readonly TagSlug[];
  /** Highlight this slug as the current page (used on tag landing cross-nav). */
  activeSlug?: string;
  ariaLabel?: string;
}) {
  if (tags.length === 0) return null;

  // min-h-[44px] meets the WCAG / Apple HIG 44×44 px touch-target minimum.
  const base     = "inline-flex items-center min-h-[44px] px-4 py-1.5 rounded-full text-sm font-medium font-sans transition-colors border";
  const active   = "bg-brand text-white border-brand";
  const inactive = "bg-white text-gray-700 border-gray-200 hover:bg-brand-soft hover:border-brand-ring hover:text-brand";

  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label={ariaLabel ?? (lang === "en" ? "Topics" : "Teme")}
    >
      {tags.map((slug) => {
        const isActive = slug === activeSlug;
        return (
          <Link
            key={slug}
            href={`/${lang}/tag/${slug}`}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${isActive ? active : inactive}`}
          >
            {TAG_DISPLAY[lang][slug]}
          </Link>
        );
      })}
    </nav>
  );
}
