import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import JsonLd from "@/components/JsonLd";
import { getPostsByAuthor } from "@/lib/posts";
import { getAuthorBySlug, getAllAuthorSlugs, authorSlug } from "@/lib/authors";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};

  return {
    title: `${author.name} | Author | STEM Little Explorers`,
    description: author.bio,
    alternates: {
      canonical: `${siteConfig.url}/en/author/${slug}`,
      languages: {
        en: `${siteConfig.url}/en/author/${slug}`,
        hr: `${siteConfig.url}/hr/author/${slug}`,
      },
    },
  };
}

export function generateStaticParams() {
  return getAllAuthorSlugs().map((slug) => ({ slug }));
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return notFound();

  const posts = getPostsByAuthor("en", author.name);
  const initial = author.name.charAt(0).toUpperCase();

  // Per-author Person JSON-LD — establishes the author entity for Google E-E-A-T.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${siteConfig.url}/en/author/${authorSlug(author.name)}`,
    jobTitle: author.role,
    description: author.bio,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <>
      <JsonLd data={personJsonLd} />
      <Header lang="en" switchUrl={`/hr/author/${slug}`} />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        {/* Author hero — avatar + name + role + bio */}
        <header className="mb-10 flex flex-col sm:flex-row gap-6 items-start">
          <div
            className="flex-shrink-0 w-20 h-20 rounded-full bg-brand-tint flex items-center justify-center text-brand font-bold text-3xl select-none"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand font-sans mb-1">
              Author
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{author.name}</h1>
            <p className="text-sm text-brand font-sans mb-3">{author.role}</p>
            <p className="text-gray-700 leading-relaxed max-w-2xl">{author.bio}</p>
          </div>
        </header>

        <h2 className="text-xl font-bold mb-6 font-sans">
          Articles by {author.name}
          <span className="ml-2 text-base font-normal text-gray-500 tabular-nums">
            ({posts.length})
          </span>
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-500">No articles yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} lang="en" priority={i < 3} headingLevel="h2" />
            ))}
          </div>
        )}
      </main>
      <Footer lang="en" />
    </>
  );
}
