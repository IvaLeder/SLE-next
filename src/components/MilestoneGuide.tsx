import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/config/site";
import { MILESTONE_GUIDE_SLUG, milestoneGuideCopy, milestoneStages } from "@/lib/milestone-guide";

/**
 * "Baby development month by month" pillar page (EN + HR share this component).
 * Renders the curated, ordered milestone sequence grouped by stage, resolving
 * each entry to that language's real post via `translationKey`. Emits an
 * ItemList so Google sees the ordered set of month articles.
 */
export default function MilestoneGuide({ lang }: { lang: "en" | "hr" }) {
  const copy = milestoneGuideCopy[lang];
  const otherLang = lang === "en" ? "hr" : "en";

  // Resolve translationKey -> the post in THIS language (skip any missing/draft).
  const byKey = new Map(getAllPosts(lang).map((p) => [p.translationKey, p]));

  // Flatten to ordered, resolved rows once; reused for render + JSON-LD.
  const rows = milestoneStages.map((stage) => ({
    stage,
    items: stage.entries
      .map((e) => ({ entry: e, post: byKey.get(e.translationKey) }))
      .filter((x): x is { entry: typeof x.entry; post: NonNullable<typeof x.post> } => Boolean(x.post)),
  }));

  const ordered = rows.flatMap((r) => r.items);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.h1,
    description: copy.description,
    numberOfItems: ordered.length,
    itemListElement: ordered.map(({ post }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${lang}/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <>
      <Header lang={lang} switchUrl={`/${otherLang}/${MILESTONE_GUIDE_SLUG[otherLang]}`} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <JsonLd data={jsonLd} />

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{copy.h1}</h1>
          <p className="text-lg text-gray-700 leading-relaxed">{copy.intro}</p>
        </header>

        {rows.map(({ stage, items }) =>
          items.length === 0 ? null : (
            <section key={stage.id} className="mb-10">
              <h2 className="text-xl md:text-2xl font-bold mb-1">
                {stage.title[lang]}
                <span className="ml-3 text-base font-normal text-gray-500 font-sans">
                  {stage.ageRange[lang]}
                </span>
              </h2>
              <p className="text-gray-600 mb-4">{stage.blurb[lang]}</p>

              <ul className="divide-y divide-gray-100 rounded-2xl ring-1 ring-black/5 overflow-hidden">
                {items.map(({ entry, post }) => (
                  <li key={entry.translationKey}>
                    <Link
                      href={`/${lang}/${post.slug}`}
                      className="group flex items-baseline gap-4 px-5 py-4 hover:bg-brand/5 transition-colors"
                    >
                      <span className="shrink-0 w-28 font-sans text-sm font-semibold text-brand tabular-nums">
                        {entry.age[lang]}
                      </span>
                      <span className="flex-1 text-gray-800">{entry.whatsNew[lang]}</span>
                      <span className="shrink-0 self-center text-sm font-sans text-gray-400 group-hover:text-brand whitespace-nowrap">
                        {copy.readMore} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
