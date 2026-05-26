import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx";
import { Metadata } from "next";
import Image from "next/image";
import TOC from "@/components/mdx/TOC";

import { getPostBySlug, getAllPosts, Post } from "@/lib/posts";
import { categorySlugFromName } from "@/lib/categories";
import { getRelatedPosts } from "@/lib/related";
import {
  generatePostMetadata,
  generateJsonLd,
  generateBreadcrumbJsonLd,
  generateHowToJsonLd,
} from "@/lib/metadata";

import JsonLd from "@/components/JsonLd";
import FloatingSubscribeCard from "@/components/FloatingSubscribeCard";
import PostCard from "@/components/PostCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthorBio from "@/components/AuthorBio";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/ShareButtons";
import { SubscribeButton } from "@/components/SubscribeButton";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

// Pre-build every EN article at deploy time (issue 15)
export function generateStaticParams() {
  return getAllPosts("en").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug("en", slug);
  if (!post) return {};
  return generatePostMetadata(post, "en");
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post: Post | null = getPostBySlug("en", slug);
  if (!post) return notFound();

  const articleJsonLd = generateJsonLd(post, "en");
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post);
  const howToJsonLd = generateHowToJsonLd(post, "en");
  const relatedPosts = getRelatedPosts("en", post);

  // Build breadcrumb trail — include first category if available (issue 28)
  // Use the canonical English slug for the URL; display name for the label.
  const firstCat = post.categories?.[0];
  const firstCatSlug = firstCat ? categorySlugFromName(firstCat) : null;
  const crumbs = [
    { label: "Home", href: "/en" },
    ...(firstCat && firstCatSlug
      ? [{ label: firstCat, href: `/en/category/${firstCatSlug}` }]
      : []),
    { label: post.title },
  ];

  return (
    // Issue 19: was <main> — the layout already wraps children in <main>,
    // so this was producing invalid nested <main> elements.
    <div className="relative max-w-3xl mx-auto p-4">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {howToJsonLd && <JsonLd data={howToJsonLd} />}

      {/* Issue 28: visual breadcrumbs */}
      <Breadcrumbs crumbs={crumbs} />

      {post.coverImage && (
        <div className="w-full mb-6 relative aspect-[16/9]">
          <Image
            src={post.coverImage}
            alt={post.heroAlt || post.title}
            fill
            priority
            // Article body is capped at max-w-3xl (~768 px). Above that
            // breakpoint the image never gets wider than 768 px, so don't
            // fetch 1920 px variants on a 4K screen.
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover rounded"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

      {/* Issue 17: reading time next to the date */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {post.readingTimeMin && (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.readingTimeMin} min read</span>
          </>
        )}
      </div>

      {post.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((cat) => {
            const slug = categorySlugFromName(cat);
            // Skip uncategorised legacy values that don't map to a canonical slug.
            if (!slug) return null;
            return (
              <a
                key={cat}
                href={`/en/category/${slug}`}
                className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                {cat}
              </a>
            );
          })}
        </div>
      )}

      <TOC />

      <article id="post-content" className="prose prose-lg max-w-none">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
              ],
            },
          }}
        />
      </article>

      {/* Social-share row directly under the article body */}
      <ShareButtons
        url={`${siteConfig.url}/en/${post.slug}`}
        title={post.title}
        image={post.coverImage ? `${siteConfig.url}${post.coverImage}` : undefined}
        lang="en"
      />

      {/* Issue 21: author bio below the article body */}
      <AuthorBio name={post.author} lang="en" />

      {/* Issue 24: inline subscribe CTA — visible on mobile, hidden on lg
          where the floating card is already visible */}
      <div data-no-print className="lg:hidden mt-10 p-6 bg-indigo-50 rounded-xl text-center">
        <p className="font-semibold text-gray-800 mb-1">Enjoyed this article?</p>
        <p className="text-sm text-gray-600 mb-4">
          Subscribe to get new posts straight to your inbox.
        </p>
        <SubscribeButton lang="en" />
      </div>

      {relatedPosts.length > 0 && (
        <section data-no-print className="mt-12 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((r) => (
              <PostCard key={r.slug} post={r} lang="en" />
            ))}
          </div>
        </section>
      )}

      <FloatingSubscribeCard lang="en" />
      <ReadingProgress lang="en" />
    </div>
  );
}
