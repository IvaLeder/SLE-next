import { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import TagChips from "@/components/TagChips";
import MindsTheme from "@/components/minds/MindsTheme";
import { getPostsByTag } from "@/lib/posts";
import { KNOWN_TAGS, SURFACED_TAGS, TAG_DISPLAY, TAG_DESCRIPTION, isKnownTag } from "@/lib/tags";
import { MINDS_SLUG, isMindsTag, mindsCopy } from "@/lib/minds";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const slug = tag.toLowerCase();
  if (!isKnownTag(slug)) return {};

  const displayName = TAG_DISPLAY["hr"][slug];
  const description = TAG_DESCRIPTION["hr"][slug];

  return {
    title: `${displayName} | STEM Little Explorers`,
    description,
    alternates: {
      canonical: `${siteConfig.url}/hr/tag/${slug}`,
      languages: {
        en: `${siteConfig.url}/en/tag/${slug}`,
        hr: `${siteConfig.url}/hr/tag/${slug}`,
      },
    },
    // Minds tags (hub pillar destinations) carry the compass favicon; the
    // dynamic segment can't vary icon.tsx per param, so it's set here from
    // the static twin of src/lib/minds-icon.tsx. Other tags keep the site
    // favicon (no icons key = root fallback).
    ...(isMindsTag(slug) && {
      icons: { icon: [{ url: "/mind-explorers-icon.svg", type: "image/svg+xml" }] },
    }),
  };
}

export function generateStaticParams() {
  return KNOWN_TAGS.map((tag) => ({ tag }));
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const slug = tag.toLowerCase();
  if (!isKnownTag(slug)) return notFound();

  const posts = getPostsByTag("hr", slug);
  if (posts.length === 0) return notFound();

  const displayName = TAG_DISPLAY["hr"][slug];
  const description = TAG_DESCRIPTION["hr"][slug];

  // Minds tags are hub pillar destinations (see isMindsTag): themed like the
  // psychology category page so arriving from the hub doesn't leave the
  // sub-brand. Other tags render unwrapped, exactly as before.
  const minds = isMindsTag(slug);
  const Wrap = minds ? MindsTheme : Fragment;

  return (
    <Wrap>
      <Header lang="hr" switchUrl={`/en/tag/${slug}`} />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand font-sans mb-2">
            Oznaka
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {displayName}
            <span className="ml-3 text-lg font-normal text-gray-500 font-sans tabular-nums">
              ({posts.length} {posts.length === 1 ? "članak" : "članaka"})
            </span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
            {description}
          </p>
          {minds && (
            <Link
              href={`/hr/${MINDS_SLUG.hr}`}
              className="mt-4 inline-block font-sans text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              Mind Explorers: {mindsCopy.hr.tagline.toLowerCase()} →
            </Link>
          )}
        </header>

        {/* Browse other topics — highlights the current one */}
        <div className="mb-8">
          <TagChips lang="hr" tags={SURFACED_TAGS} activeSlug={slug} ariaLabel="Pregledaj teme" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} lang="hr" priority={i < 3} headingLevel="h2" />
          ))}
        </div>
      </main>
      <Footer lang="hr" minds={minds} />
    </Wrap>
  );
}
