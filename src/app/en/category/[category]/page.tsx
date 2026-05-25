import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const titleCase = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${titleCase} | STEM Little Explorers`,
    description: `Browse all articles in the ${titleCase} category on STEM Little Explorers.`,
    alternates: {
      canonical: `https://stemlittleexplorers.com/en/category/${category}`,
      languages: {
        en: `https://stemlittleexplorers.com/en/category/${category}`,
        hr: `https://stemlittleexplorers.com/hr/category/${category}`,
      },
    },
  };
}

export async function generateStaticParams() {
  return getAllCategories("en").map((category) => ({
    category: category.toLowerCase(),
  }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const normalized = category.toLowerCase();
  const posts = getPostsByCategory("en", normalized);

  if (!posts || posts.length === 0) return notFound();

  const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <>
      <Header lang="en" switchUrl={`/hr/category/${category}`} />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">
          {titleCase}
          <span className="ml-3 text-lg font-normal text-gray-400">
            ({posts.length} {posts.length === 1 ? "article" : "articles"})
          </span>
        </h1>

        {/* Issue 20: use PostCard grid instead of plain text list */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} lang="en" />
          ))}
        </div>
      </main>
      <Footer lang="en" />
    </>
  );
}
