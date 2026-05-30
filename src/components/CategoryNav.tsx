import Link from "next/link";
import { CATEGORY_SLUGS, CATEGORY_DISPLAY, CATEGORY_ICONS } from "@/lib/categories";

/**
 * Subject switcher shown at the top of every category landing page.
 *
 * Each subject is a static route (/[lang]/category/[slug]), so unlike the
 * Activities filter (which filters a list client-side) these are plain
 * <Link>s — no client JS needed. The active subject is highlighted.
 *
 * Visual style is kept in sync with FilterChips so the two read as the same
 * component family across the site.
 */
export default function CategoryNav({
  lang,
  activeSlug,
}: {
  lang: "en" | "hr";
  activeSlug: string;
}) {
  // min-h-[44px] meets the WCAG / Apple HIG 44×44 px touch-target minimum.
  const base     = "inline-flex items-center gap-1.5 min-h-[44px] px-4 py-1.5 rounded-full text-sm font-medium font-sans transition-colors border";
  const active   = "bg-brand text-white border-brand";
  const inactive = "bg-white text-gray-700 border-gray-200 hover:bg-brand-soft hover:border-brand-ring hover:text-brand";

  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label={lang === "en" ? "Browse by subject" : "Pregledaj po kategoriji"}
    >
      {CATEGORY_SLUGS.map((slug) => {
        const isActive = slug === activeSlug;
        return (
          <Link
            key={slug}
            href={`/${lang}/category/${slug}`}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${isActive ? active : inactive}`}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {CATEGORY_ICONS[slug]}
            </span>
            {CATEGORY_DISPLAY[lang][slug]}
          </Link>
        );
      })}
    </nav>
  );
}
