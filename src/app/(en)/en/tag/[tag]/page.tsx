import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getPostsByTag } from "@/lib/posts";
import { KNOWN_TAGS, TAG_DISPLAY, TAG_DESCRIPTION, isKnownTag } from "@/lib/tags";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const slug = tag.toLowerCase();
  if (!isKnownTag(slug)) return {};

  const displayName = TAG_DISPLAY["en"][slug];
  const description = TAG_DESCRIPTION["en"][slug];

  return {
    title: `${displayName} | STEM Little Explorers`,
    description,
    alternates: {
      canonical: `${siteConfig.url}/en/tag/${slug}`,
      languages: {
        en: `${siteConfig.url}/en/tag/${slug}`,
        hr: `${siteConfig.url}/hr/tag/${slug}`,
      },
    },
  };
}

// Pre-build every known tag at deploy time.
export function generateStaticParams() {
  return KNOWN_TAGS.map((tag) => ({ tag }));
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const slug = tag.toLowerCase();
  if (!isKnownTag(slug)) return notFound();

  const posts = getPostsByTag("en", slug);
  if (posts.length === 0) return notFound();

  const displayName = TAG_DISPLAY["en"][slug];
  const description = TAG_DESCRIPTION["en"][slug];

  return (
    <>
      <Header lang="en" switchUrl={`/hr/tag/${slug}`} />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand font-sans mb-2">
            Tag
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {displayName}
            <span className="ml-3 text-lg font-normal text-gray-500 font-sans tabular-nums">
              ({posts.length} {posts.length === 1 ? "article" : "articles"})
            </span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
            {description}
          </p>
        </header>

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
