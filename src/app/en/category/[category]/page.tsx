import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getPostsByCategory, getAllCategories } from "@/lib/posts";

type Props = {
  params: Promise<{ category: string }>;
};

// ---------------------------------------------
//  Metadata
// ---------------------------------------------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;

  return {
    title: `Posts in ${category} | STEM Little Explorers`,
    description: `Articles categorized under ${category}.`,
    alternates: {
      canonical: `https://stemlittleexplorers.com/en/category/${category}`,
    },
  };
}

// ---------------------------------------------
//  Static params for SSG
// ---------------------------------------------
export async function generateStaticParams() {
  const categories = getAllCategories("en");

  return categories.map((category) => ({
    category: category.toLowerCase(),
  }));
}

// ---------------------------------------------
//  Category page
// ---------------------------------------------
export default async function CategoryPage({ params }: Props) {
  const { category } = await params; // ← FIXED

  const normalized = category.toLowerCase();
  const posts = getPostsByCategory("en", normalized);

  if (!posts || posts.length === 0) {
    return notFound();
  }

  const titleCase =
    normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Category: {titleCase}</h1>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-6">
            <Link
              href={`/en/${post.slug}`}
              className="text-2xl font-semibold text-blue-700 hover:underline"
            >
              {post.title}
            </Link>

            <p className="text-gray-500 mt-1">{post.date}</p>

            {post.excerpt && (
              <p className="mt-2 text-gray-700">{post.excerpt}</p>
            )}

            <Link
              href={`/en/${post.slug}`}
              className="inline-block mt-3 text-sm text-blue-600 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}