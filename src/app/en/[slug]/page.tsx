import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx";
import { Metadata } from "next";
import Image from "next/image";
import TOC from "@/components/mdx/TOC";

import { getPostBySlug, Post, getPrevNextPosts } from "@/lib/posts";
import { getRelatedPosts } from "@/lib/related";

import {
  generatePostMetadata,
  generateJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";
import FloatingSubscribeCard from "@/components/FloatingSubscribeCard";
import PostCard from "@/components/PostCard";

// ------------------------------
// Types
// ------------------------------
type Props = {
  params: Promise<{ slug: string }>;
};

// ------------------------------
// SEO Metadata
// ------------------------------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = getPostBySlug("en", slug);
  if (!post) return {};

  return generatePostMetadata(post, "en");
}

// ------------------------------
// Page Component
// ------------------------------
export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post: Post | null = getPostBySlug("en", slug);
  if (!post) return notFound();

  const articleJsonLd = generateJsonLd(post, "en");
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post);
  const relatedPosts = getRelatedPosts("en", post);
  const { prev, next } = getPrevNextPosts(post, post.lang);

  return (
    <main className="relative max-w-3xl mx-auto p-4">
      {/* JSON-LD */}
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

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

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 mb-6">{post.date}</p>

      {/* Categories */}
      {post.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((cat) => (
            <a
              href={`/${post.lang}/category/${cat.toLowerCase()}`}
              key={cat}
              className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              {cat}
            </a>
          ))}
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

      {relatedPosts.length > 0 && (
        <section className="mt-12 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">
            {post.lang === "en" ? "Related Posts" : "Srodni članci"}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((r) => (
              <PostCard
                key={r.slug}
                post={r}
                lang={post.lang}
              />
            ))}
          </div>
        </section>
      )}
      <FloatingSubscribeCard />
    </main>
  );
}
