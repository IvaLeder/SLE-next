import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import MindsTheme from "@/components/minds/MindsTheme";
import { CompassMark, StitchDivider } from "@/components/minds/motifs";
import { getPostBySlug } from "@/lib/posts";
import { MINDS_SLUG, mindsCopy } from "@/lib/minds";

const ASKA_PEEK_IMAGE = "/images/posts/aska-seven-day-peek.png";

/**
 * Mind Explorers hub landing page (EN + HR share this component).
 * The whole page, Header and Footer included, sits inside <MindsTheme> so
 * the shared chrome re-themes to plum (Phase 0 ruling, BACKLOG §1c).
 * The hub hero stays typography-led for strong contrast; Aska appears only
 * beside the primary practical tool, where she has a clear guiding role.
 */
export default function MindsHub({ lang }: { lang: "en" | "hr" }) {
  const copy = mindsCopy[lang];
  const otherLang = lang === "en" ? "hr" : "en";
  const featured = copy.featuredGuides.flatMap((guide) => {
    const post = getPostBySlug(lang, guide.slug);
    return post ? [{ ...guide, post }] : [];
  });
  const [calculator, ...companions] = copy.tools;

  return (
    <MindsTheme>
      <Header lang={lang} switchUrl={`/${otherLang}/${MINDS_SLUG[otherLang]}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-12">
        <header className="mb-14 max-w-3xl">
          <Link
            href={`/${lang}`}
            className="font-sans text-xs font-semibold uppercase tracking-widest transition-colors hover:text-brand"
          >
            {copy.endorsement}
          </Link>
          <div className="mt-3 mb-2 flex items-center gap-4">
            <CompassMark size={46} className="shrink-0" />
            <h1 className="text-4xl md:text-5xl">{copy.h1}</h1>
          </div>
          <p className="mb-6 text-xl text-brand italic md:text-2xl">{copy.tagline}</p>
          <p className="text-lg leading-relaxed">{copy.intro}</p>
          <StitchDivider className="mt-8" />
        </header>

        {/* Pillars */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl mb-6">{copy.pillarsHeading}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {copy.pillars.map((pillar) =>
              pillar.href ? (
                <Link
                  key={pillar.id}
                  href={pillar.href}
                  className="group flex flex-col rounded-2xl border border-(--me-border) bg-(--me-surface) p-6 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h3 className="mb-2 text-xl transition-colors group-hover:text-brand-hover">{pillar.title}</h3>
                  <p className="mb-4 flex-1 leading-relaxed">{pillar.blurb}</p>
                  <span className="font-sans text-sm font-semibold text-brand transition-colors group-hover:text-brand-hover">
                    {pillar.linkLabel} →
                  </span>
                </Link>
              ) : null,
            )}
          </div>
        </section>

        {/* Tools */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl mb-2">{copy.toolsHeading}</h2>
          <p className="max-w-3xl leading-relaxed">{copy.toolsBlurb}</p>

          <div className="mt-6 max-w-4xl overflow-hidden rounded-3xl border border-(--me-border) bg-(--me-surface) shadow-sm">
            <div className="relative min-h-64 overflow-hidden p-6 sm:min-h-60 sm:p-8">
              <div className="relative z-10 max-w-xl pr-16 sm:pr-36">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-brand">
                  {calculator.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl md:text-3xl">{calculator.title}</h3>
                <p className="mt-3 max-w-lg leading-relaxed">{calculator.blurb}</p>
                <Link
                  href={calculator.href}
                  className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                >
                  {calculator.cta} →
                </Link>
              </div>
              <Image
                src={ASKA_PEEK_IMAGE}
                alt=""
                width={420}
                height={420}
                sizes="(max-width: 639px) 96px, 160px"
                className="pointer-events-none absolute -bottom-2 right-1 h-auto w-24 sm:right-7 sm:w-40"
                aria-hidden="true"
              />
            </div>

            <div className="grid border-t border-(--me-border) sm:grid-cols-2">
              {companions.map((tool, index) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group p-6 transition-colors hover:bg-brand-soft ${
                    index === 0
                      ? "border-b border-(--me-border) sm:border-b-0 sm:border-r"
                      : ""
                  }`}
                >
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-widest text-brand">
                    {tool.eyebrow}
                  </p>
                  <h3 className="mt-2 text-lg transition-colors group-hover:text-brand-hover">
                    {tool.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed">{tool.blurb}</p>
                  <span className="mt-4 inline-block font-sans text-sm font-semibold text-brand">
                    {tool.cta} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Curated entry points across all three pillars */}
        <section>
          <h2 className="text-2xl md:text-3xl">{copy.latestHeading}</h2>
          <p className="mt-2 max-w-3xl leading-relaxed">{copy.latestBlurb}</p>
          <div className="mb-8 mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(({ label, post }) => (
              <div key={post.slug}>
                <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-brand">
                  {label}
                </p>
                <PostCard post={post} lang={lang} headingLevel="h3" />
              </div>
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
