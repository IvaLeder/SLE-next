import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { CATEGORY_DISPLAY } from "@/lib/categories";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const slug = category.toLowerCase();
  const displayName = CATEGORY_DISPLAY["en"][slug] ?? (slug.charAt(0).toUpperCase() + slug.slice(1));

  return {
    title: `${displayName} | STEM Little Explorers`,
    description: `Browse all articles in the ${displayName} category on STEM Little Explorers.`,
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

  return (
    <>
      <Header lang="en" switchUrl={`/hr/category/${slug}`} />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">
          {displayName}
          <span className="ml-3 text-lg font-normal text-gray-400">
            ({posts.length} {posts.length === 1 ? "article" : "articles"})
          </span>
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} lang="en" priority={i < 3} />
          ))}
        </div>
      </main>
      <Footer lang="en" />
    </>
  );
}
