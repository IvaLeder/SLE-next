import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import TOC from "@/components/mdx/TOC";
import PostBody from "@/components/PostBody";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS, splitContentForMidAd } from "@/lib/ads";

import { getPostBySlug, getAllPosts, Post } from "@/lib/posts";
import { categorySlugFromName } from "@/lib/categories";
import { getRelatedPosts } from "@/lib/related";
import {
  generatePostMetadata,
  generateJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/metadata";

import JsonLd from "@/components/JsonLd";
import FloatingSubscribeCard from "@/components/FloatingSubscribeCard";
import PostCard from "@/components/PostCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleHeader from "@/components/ArticleHeader";
import AuthorBio from "@/components/AuthorBio";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/ShareButtons";
import { SubscribeButton } from "@/components/SubscribeButton";
import TagChips from "@/components/TagChips";
import { surfacedTagsOf } from "@/lib/tags";
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
  const relatedPosts = getRelatedPosts("hr", post);
  const topicTags = surfacedTagsOf(post.tags);
  const [bodyBefore, bodyAfter] = splitContentForMidAd(post.content);

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
            // Article body is capped at max-w-3xl (~768 px). Above that
            // breakpoint the image never gets wider than 768 px, so don't
            // fetch 1920 px variants on a 4K screen.
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover rounded-2xl ring-1 ring-black/5"
          />
        </div>
      )}

      <ArticleHeader post={post} lang="hr" />

      <TOC lang="hr" />

      <article id="post-content" className="prose prose-lg max-w-none">
        <PostBody source={bodyBefore} lang="hr" />
        {bodyAfter && (
          <>
            <AdSlot slot={AD_SLOTS.inArticle} lang="hr" />
            <PostBody source={bodyAfter} lang="hr" />
          </>
        )}
      </article>

      {/* Topic tags — links to tag landing pages for "more like this" */}
      {topicTags.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-sans">
            Teme
          </span>
          <TagChips lang="hr" tags={topicTags} />
        </div>
      )}

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

      {/* End-of-article ad — engaged readers who reached the bottom */}
      <AdSlot slot={AD_SLOTS.endOfArticle} lang="hr" />

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
