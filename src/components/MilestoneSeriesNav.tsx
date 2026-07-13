import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { MILESTONE_GUIDE_SLUG, milestoneStages } from "@/lib/milestone-guide";

/**
 * Series navigation for the 24 monthly development posts, driven by the same
 * curated order as the pillar page (`milestone-guide.ts`). Both pieces take
 * the post's `translationKey` and render nothing for posts outside the guide,
 * so the article pages can include them unconditionally:
 *
 * - <MilestoneGuideBanner>: "part of our guide" box near the top — gives the
 *   pillar an in-content inlink from every month post.
 * - <MilestonePrevNext>: previous/next month links after the body, plus a
 *   link back to the full guide.
 */

type Lang = "en" | "hr";

const FLAT = milestoneStages.flatMap((s) => s.entries);

const copy: Record<
  Lang,
  {
    partOf: string;
    guideTitle: string;
    navLabel: string;
    prev: string;
    next: string;
    allStages: string;
  }
> = {
  en: {
    partOf: "This article is part of our guide:",
    guideTitle: "Baby development month by month",
    navLabel: "Continue the guide",
    prev: "Previous",
    next: "Next",
    allStages: "See the full guide",
  },
  hr: {
    partOf: "Ovaj članak dio je našeg vodiča:",
    guideTitle: "Razvoj djeteta po mjesecima",
    navLabel: "Nastavite čitati vodič",
    prev: "Prethodno",
    next: "Sljedeće",
    allStages: "Pogledajte cijeli vodič",
  },
};

function guideIndexOf(translationKey: string): number {
  return FLAT.findIndex((e) => e.translationKey === translationKey);
}

export function MilestoneGuideBanner({
  lang,
  translationKey,
}: {
  lang: Lang;
  translationKey: string;
}) {
  if (guideIndexOf(translationKey) === -1) return null;
  const c = copy[lang];
  return (
    <aside
      data-no-print
      className="mb-6 flex items-baseline gap-2 rounded-xl bg-brand-soft px-4 py-3 font-sans text-sm text-gray-700"
    >
      <span aria-hidden="true">👶</span>
      <p>
        {c.partOf}{" "}
        <Link
          href={`/${lang}/${MILESTONE_GUIDE_SLUG[lang]}`}
          className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
        >
          {c.guideTitle}
        </Link>
      </p>
    </aside>
  );
}

export function MilestonePrevNext({
  lang,
  translationKey,
}: {
  lang: Lang;
  translationKey: string;
}) {
  const i = guideIndexOf(translationKey);
  if (i === -1) return null;

  const c = copy[lang];
  const byKey = new Map(getAllPosts(lang).map((p) => [p.translationKey, p]));

  // Resolve neighbours to real posts in THIS language (skip missing/draft).
  const resolve = (entry: (typeof FLAT)[number] | undefined) => {
    if (!entry) return null;
    const post = byKey.get(entry.translationKey);
    return post ? { entry, post } : null;
  };
  const prev = resolve(FLAT[i - 1]);
  const next = resolve(FLAT[i + 1]);
  if (!prev && !next) return null;

  return (
    <nav data-no-print aria-label={c.navLabel} className="mt-10 font-sans">
      <div className="grid gap-4 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/${lang}/${prev.post.slug}`}
            className="group rounded-xl ring-1 ring-black/5 px-5 py-4 hover:bg-brand/5 transition-colors"
          >
            <span className="block text-xs uppercase tracking-wide text-gray-500">
              ← {c.prev}
            </span>
            <span className="mt-1 block font-semibold text-brand">
              {prev.entry.age[lang]}
            </span>
            <span className="mt-1 block text-sm text-gray-600">
              {prev.entry.whatsNew[lang]}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next && (
          <Link
            href={`/${lang}/${next.post.slug}`}
            className="group rounded-xl ring-1 ring-black/5 px-5 py-4 text-right hover:bg-brand/5 transition-colors"
          >
            <span className="block text-xs uppercase tracking-wide text-gray-500">
              {c.next} →
            </span>
            <span className="mt-1 block font-semibold text-brand">
              {next.entry.age[lang]}
            </span>
            <span className="mt-1 block text-sm text-gray-600">
              {next.entry.whatsNew[lang]}
            </span>
          </Link>
        )}
      </div>
      <p className="mt-3 text-center text-sm">
        <Link
          href={`/${lang}/${MILESTONE_GUIDE_SLUG[lang]}`}
          className="text-gray-500 hover:text-brand underline underline-offset-2"
        >
          {c.allStages}
        </Link>
      </p>
    </nav>
  );
}
