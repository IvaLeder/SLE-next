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
  const howToJsonLd = generateHowToJsonLd(post, "hr");
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

      <h1 className="text-3xl md:text-4xl font-bold mb-2">{post.title}</h1>

      {/* Date display: same logic as the EN article page. "Updated …" shown
          prominently when dateModified is set AND >30 days after original date;
          original publish date appears as a secondary line below. */}
      {(() => {
        const fmt = (iso: string) =>
          new Date(iso).toLocaleDateString("hr-HR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const hasUpdate =
          post.dateModified &&
          new Date(post.dateModified).getTime() - new Date(post.date).getTime() > THIRTY_DAYS_MS;

        return (
          <div className="mb-6 font-sans">
            <div className="flex items-center gap-2 text-sm text-gray-500 tabular-nums">
              <time dateTime={hasUpdate ? post.dateModified : post.date}>
                {hasUpdate ? `Ažurirano ${fmt(post.dateModified!)}` : fmt(post.date)}
              </time>
              {post.readingTimeMin && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingTimeMin} min čitanja</span>
                </>
              )}
            </div>
            {hasUpdate && (
              <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                Izvorno objavljeno <time dateTime={post.date}>{fmt(post.date)}</time>
              </p>
            )}
          </div>
        );
      })()}

      {post.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((cat) => {
            const slug = categorySlugFromName(cat);
            if (!slug) return null;
            return (
              <a
                key={cat}
                href={`/hr/category/${slug}`}
                className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
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
        url={`${siteConfig.url}/hr/${post.slug}`}
        title={post.title}
        image={post.coverImage ? `${siteConfig.url}${post.coverImage}` : undefined}
        lang="hr"
      />

      {/* Issue 21: author bio below the article body */}
      <AuthorBio name={post.author} lang="hr" />

      {/* Issue 24: inline subscribe CTA for mobile */}
      <div data-no-print className="lg:hidden mt-10 p-6 bg-indigo-50 rounded-xl text-center">
        <p className="font-semibold text-gray-800 mb-1">Sviđa vam se ovaj članak?</p>
        <p className="text-sm text-gray-600 mb-4">
          Pretplatite se i primajte nove objave ravno u inbox.
        </p>
        <SubscribeButton lang="hr" />
      </div>

      {relatedPosts.length > 0 && (
        <section data-no-print className="mt-12 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Srodni članci</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((r) => (
              <PostCard key={r.slug} post={r} lang="hr" />
            ))}
          </div>
        </section>
      )}

      <FloatingSubscribeCard lang="hr" />
      <ReadingProgress lang="hr" />
    </div>
  );
}
