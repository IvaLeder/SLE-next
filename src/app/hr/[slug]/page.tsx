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
import { generatePostMetadata, generateJsonLd, generateBreadcrumbJsonLd } from "@/lib/metadata";

import JsonLd from "@/components/JsonLd";
import FloatingSubscribeCard from "@/components/FloatingSubscribeCard";
import PostCard from "@/components/PostCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthorBio from "@/components/AuthorBio";
import { SubscribeButton } from "@/components/SubscribeButton";

type Props = { params: Promise<{ slug: string }> };

// Pre-build every HR article at deploy time (issue 15)
export function generateStaticParams() {
  return getAllPosts("hr").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug("hr", slug);
  if (!post) return {};
  return generatePostMetadata(post, "hr");
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post: Post | null = getPostBySlug("hr", slug);
  if (!post) return notFound();

  const articleJsonLd = generateJsonLd(post, "hr");
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post);
  const relatedPosts = getRelatedPosts("hr", post);

  // Build breadcrumb trail — include first category if available (issue 28)
  // Use the canonical English slug for the URL; display name for the label.
  const firstCat = post.categories?.[0];
  const firstCatSlug = firstCat ? categorySlugFromName(firstCat) : null;
  const crumbs = [
    { label: "Naslovnica", href: "/hr" },
    ...(firstCat && firstCatSlug
      ? [{ label: firstCat, href: `/hr/category/${firstCatSlug}` }]
      : []),
    { label: post.title },
  ];

  return (
    // Issue 19: was <main> — layout already wraps children in <main>
    <div className="relative max-w-3xl mx-auto p-4">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Issue 28: visual breadcrumbs */}
      <Breadcrumbs crumbs={crumbs} />

      {post.coverImage && (
        <div className="w-full mb-6 relative aspect-[16/9]">
          <Image
            src={post.coverImage}
            alt={post.heroAlt || post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover rounded"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

      {/* Issue 17: reading time next to the date */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <time dateTime={post.date}>{post.date}</time>
        {post.readingTimeMin && (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.readingTimeMin} min čitanja</span>
          </>
        )}
      </div>

      {post.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((cat) => {
            const slug = categorySlugFromName(cat);
            if (!slug) return null;
            return (
              <a
                key={cat}
                href={`/hr/category/${slug}`}
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

      {/* Issue 21: author bio below the article body */}
      <AuthorBio name={post.author} lang="hr" />

      {/* Issue 24: inline subscribe CTA for mobile */}
      <div className="lg:hidden mt-10 p-6 bg-indigo-50 rounded-xl text-center">
        <p className="font-semibold text-gray-800 mb-1">Sviđa vam se ovaj članak?</p>
        <p className="text-sm text-gray-600 mb-4">
          Pretplatite se i primajte nove objave ravno u inbox.
        </p>
        <SubscribeButton lang="hr" />
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-12 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Srodni članci</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((r) => (
              <PostCard key={r.slug} post={r} lang="hr" />
            ))}
          </div>
        </section>
      )}

      <FloatingSubscribeCard lang="hr" />
    </div>
  );
}
