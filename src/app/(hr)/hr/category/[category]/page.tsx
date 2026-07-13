import { Fragment } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import CategoryNav from "@/components/CategoryNav";
import MindsTheme from "@/components/minds/MindsTheme";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { CATEGORY_DISPLAY, CATEGORY_DESCRIPTION } from "@/lib/categories";
import { MINDS_SLUG, mindsCopy } from "@/lib/minds";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const slug = category.toLowerCase();
  const displayName = CATEGORY_DISPLAY["hr"][slug] ?? (slug.charAt(0).toUpperCase() + slug.slice(1));

  const description =
    CATEGORY_DESCRIPTION["hr"][slug] ??
    `Pregledajte sve članke u kategoriji ${displayName} na STEM Little Explorers.`;

  return {
    title: `${displayName} | STEM Little Explorers`,
    description,
    alternates: {
      canonical: `https://stemlittleexplorers.com/hr/category/${slug}`,
      languages: {
        en: `https://stemlittleexplorers.com/en/category/${slug}`,
        hr: `https://stemlittleexplorers.com/hr/category/${slug}`,
      },
      // Advertise the per-category RSS feed so feed readers can discover it.
      types: {
        "application/rss+xml": [
          {
            url: `https://stemlittleexplorers.com/rss-hr-${slug}.xml`,
            title: `${displayName} | STEM Little Explorers (HR)`,
          },
        ],
      },
    },
  };
}

export async function generateStaticParams() {
  return getAllCategories().map((slug) => ({ category: slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const slug = category.toLowerCase();
  const posts = getPostsByCategory("hr", slug);

  if (!posts || posts.length === 0) return notFound();

  const displayName = CATEGORY_DISPLAY["hr"][slug] ?? (slug.charAt(0).toUpperCase() + slug.slice(1));
  const description = CATEGORY_DESCRIPTION["hr"][slug];

  // Psychology is a Mind Explorers surface: themed, and it points up to the hub.
  const isMinds = slug === "psychology";
  const Wrap = isMinds ? MindsTheme : Fragment;

  return (
    <Wrap>
      {/* switchUrl uses the same ASCII slug — works in both languages */}
      <Header lang="hr" switchUrl={`/en/category/${slug}`} />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {displayName}
            <span className="ml-3 text-lg font-normal text-gray-500 font-sans tabular-nums">
              ({posts.length} {posts.length === 1 ? "članak" : "članaka"})
            </span>
          </h1>
          {description && (
            <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
          {isMinds && (
            <Link
              href={`/hr/${MINDS_SLUG.hr}`}
              className="mt-4 inline-block font-sans text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              Mind Explorers: {mindsCopy.hr.tagline.toLowerCase()} →
            </Link>
          )}
        </header>

        {/* Subject switcher — lets visitors jump between categories without
            digging through the header/footer. */}
        <div className="mb-8">
          <CategoryNav lang="hr" activeSlug={slug} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} lang="hr" priority={i < 3} headingLevel="h2" />
          ))}
        </div>
      </main>
      <Footer lang="hr" minds={isMinds} />
    </Wrap>
  );
}
