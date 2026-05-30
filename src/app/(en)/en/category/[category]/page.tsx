import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import CategoryNav from "@/components/CategoryNav";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { CATEGORY_DISPLAY, CATEGORY_DESCRIPTION } from "@/lib/categories";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const slug = category.toLowerCase();
  const displayName = CATEGORY_DISPLAY["en"][slug] ?? (slug.charAt(0).toUpperCase() + slug.slice(1));

  // Use the same intro paragraph rendered on the page as the meta description —
  // keeps the on-page and SERP copy aligned and gives Google real content.
  const description =
    CATEGORY_DESCRIPTION["en"][slug] ??
    `Browse all articles in the ${displayName} category on STEM Little Explorers.`;

  return {
    title: `${displayName} | STEM Little Explorers`,
    description,
    alternates: {
      canonical: `https://stemlittleexplorers.com/en/category/${slug}`,
      languages: {
        en: `https://stemlittleexplorers.com/en/category/${slug}`,
        hr: `https://stemlittleexplorers.com/hr/category/${slug}`,
      },
      // Advertise the per-category RSS feed so feed readers can discover it.
      types: {
        "application/rss+xml": [
          {
            url: `https://stemlittleexplorers.com/rss-en-${slug}.xml`,
            title: `${displayName} — STEM Little Explorers (EN)`,
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
  const posts = getPostsByCategory("en", slug);

  if (!posts || posts.length === 0) return notFound();

  const displayName = CATEGORY_DISPLAY["en"][slug] ?? (slug.charAt(0).toUpperCase() + slug.slice(1));
  const description = CATEGORY_DESCRIPTION["en"][slug];

  return (
    <>
      <Header lang="en" switchUrl={`/hr/category/${slug}`} />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {displayName}
            <span className="ml-3 text-lg font-normal text-gray-500 font-sans tabular-nums">
              ({posts.length} {posts.length === 1 ? "article" : "articles"})
            </span>
          </h1>
          {description && (
            <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </header>

        {/* Subject switcher — lets visitors jump between categories without
            digging through the header/footer. */}
        <div className="mb-8">
          <CategoryNav lang="en" activeSlug={slug} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} lang="en" priority={i < 3} headingLevel="h2" />
          ))}
        </div>
      </main>
      <Footer lang="en" />
    </>
  );
}
