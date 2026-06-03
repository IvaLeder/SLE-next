import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostsByTag } from "@/lib/posts";
import { SURFACED_TAGS, TAG_DISPLAY, TAG_DESCRIPTION } from "@/lib/tags";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Topics | STEM Little Explorers",
  description:
    "Browse articles by topic — origami, chemistry, physics, sensory play and experiments. Pick a topic to see every related activity.",
  alternates: {
    canonical: `${siteConfig.url}/en/topics`,
    languages: {
      en: `${siteConfig.url}/en/topics`,
      hr: `${siteConfig.url}/hr/topics`,
    },
  },
};

export default function TopicsPage() {
  // Only list topics that actually have posts (an empty tag page 404s).
  const topics = SURFACED_TAGS.map((slug) => ({
    slug,
    count: getPostsByTag("en", slug).length,
  })).filter((t) => t.count > 0);

  return (
    <>
      <Header lang="en" switchUrl="/hr/topics" />
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Topics</h1>
          <p className="text-gray-600 max-w-2xl">
            Browse articles by topic — the science and skills behind each
            project. Pick a topic to see every related activity.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ slug, count }) => (
            <Link
              key={slug}
              href={`/en/tag/${slug}`}
              className="group block rounded-xl border border-gray-100 bg-white p-5 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-xl font-bold group-hover:text-brand transition-colors">
                  {TAG_DISPLAY["en"][slug]}
                </h2>
                <span className="text-sm text-gray-500 font-sans tabular-nums">
                  {count} {count === 1 ? "article" : "articles"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {TAG_DESCRIPTION["en"][slug]}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer lang="en" />
    </>
  );
}
