import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import MindsTheme from "@/components/minds/MindsTheme";
import { CompassMark, StitchDivider } from "@/components/minds/motifs";
import { getPostsByCategory } from "@/lib/posts";
import { MINDS_SLUG, mindsCopy } from "@/lib/minds";

/**
 * Mind Explorers hub landing page (EN + HR share this component).
 * The whole page, Header and Footer included, sits inside <MindsTheme> so
 * the shared chrome re-themes to plum (Phase 0 ruling, BACKLOG §1c).
 * Deliberately motif-free in v1: stitch path, compass and knots arrive with
 * Phase 4 components. Copy lives in src/lib/minds.ts.
 */
export default function MindsHub({ lang }: { lang: "en" | "hr" }) {
  const copy = mindsCopy[lang];
  const otherLang = lang === "en" ? "hr" : "en";
  const latest = getPostsByCategory(lang, "psychology").slice(0, 6);

  return (
    <MindsTheme>
      <Header lang={lang} switchUrl={`/${otherLang}/${MINDS_SLUG[otherLang]}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-12">
        {/* Hero — typography-led; the endorsement line doubles as the
            "part of STEM Little Explorers" requirement from the brand sheet. */}
        <header className="mb-14 max-w-3xl">
          <Link
            href={`/${lang}`}
            className="font-sans text-xs font-semibold uppercase tracking-widest hover:text-brand transition-colors"
          >
            {copy.endorsement}
          </Link>
          <div className="mt-3 mb-2 flex items-center gap-4">
            <CompassMark size={46} className="shrink-0" />
            <h1 className="text-4xl md:text-5xl">{copy.h1}</h1>
          </div>
          <p className="text-xl md:text-2xl text-brand italic mb-6">{copy.tagline}</p>
          <p className="text-lg leading-relaxed">{copy.intro}</p>
          {/* the short stitch path leading "into" the content (sheet §5) */}
          <StitchDivider className="mt-8" />
        </header>

        {/* Pillars */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl mb-6">{copy.pillarsHeading}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {copy.pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="flex flex-col rounded-2xl border border-(--me-border) bg-(--me-surface) p-6"
              >
                <h3 className="text-xl mb-2">{pillar.title}</h3>
                <p className="leading-relaxed mb-4 flex-1">{pillar.blurb}</p>
                {pillar.href && (
                  <Link
                    href={pillar.href}
                    className="font-sans text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
                  >
                    {pillar.linkLabel} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl mb-2">{copy.toolsHeading}</h2>
          <p className="leading-relaxed mb-6 max-w-3xl">{copy.toolsBlurb}</p>
          <div className="grid gap-5 sm:grid-cols-2 max-w-3xl">
            {copy.tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl bg-brand-soft p-6 transition-colors hover:bg-brand-tint"
              >
                <h3 className="text-lg mb-1 group-hover:text-brand-hover">
                  {tool.title} →
                </h3>
                <p className="text-sm leading-relaxed">{tool.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest psychology guides */}
        <section>
          <h2 className="text-2xl md:text-3xl mb-6">{copy.latestHeading}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} headingLevel="h3" />
            ))}
          </div>
          <Link
            href={`/${lang}/category/psychology`}
            className="inline-block rounded-lg bg-brand px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {copy.allLink} →
          </Link>
        </section>
      </main>
      <Footer lang={lang} />
    </MindsTheme>
  );
}
