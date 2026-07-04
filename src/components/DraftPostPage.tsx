import { notFound } from "next/navigation";
import { Metadata } from "next";
import { timingSafeEqual, createHash } from "node:crypto";
import CoverImage from "@/components/CoverImage";

import TOC from "@/components/mdx/TOC";
import PostBody from "@/components/PostBody";
import ArticleHeader from "@/components/ArticleHeader";
import { getDraftBySlug, Post } from "@/lib/posts";

/**
 * Token-gated draft preview, shared by the EN and HR /draft/[slug] routes.
 *
 * Access model: the URL carries a per-file secret (?key=…) that must match
 * the post's `previewToken` frontmatter. Anything else — missing key, wrong
 * key, published post, unknown slug — is a plain 404, so the route leaks
 * nothing about whether a draft exists.
 *
 * Not indexed: robots noindex metadata below, plus an X-Robots-Tag header on
 * /draft/ paths (next.config.ts). Deliberately NOT robots.txt-disallowed —
 * crawlers must be able to fetch the page to see the noindex.
 */

export type DraftRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const LABELS = {
  en: {
    badge: "Draft",
    note: "Unpublished preview — don't share this link publicly. This page is not indexed by search engines.",
  },
  hr: {
    badge: "Skica",
    note: "Neobjavljeni pregled — ne dijelite ovu poveznicu javno. Stranica nije indeksirana u tražilicama.",
  },
} as const;

// Constant-time comparison; hashing first makes the two buffers equal length
// (timingSafeEqual throws on length mismatch) and hides token length.
function tokenMatches(expected: string, provided: string): boolean {
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(provided).digest();
  return timingSafeEqual(a, b);
}

async function resolveDraft(
  lang: "en" | "hr",
  { params, searchParams }: DraftRouteProps
): Promise<Post | null> {
  const { slug } = await params;
  const { key } = await searchParams;
  const post = getDraftBySlug(lang, slug);
  if (
    !post?.previewToken ||
    typeof key !== "string" ||
    key.length === 0 ||
    !tokenMatches(post.previewToken, key)
  ) {
    return null;
  }
  return post;
}

export async function draftMetadata(
  lang: "en" | "hr",
  props: DraftRouteProps
): Promise<Metadata> {
  const post = await resolveDraft(lang, props);
  return {
    // Same generic title for "exists but wrong key" and "doesn't exist".
    title: post ? `[${LABELS[lang].badge}] ${post.title}` : LABELS[lang].badge,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
  };
}

export default async function DraftPostPage({
  lang,
  ...props
}: DraftRouteProps & { lang: "en" | "hr" }) {
  const post = await resolveDraft(lang, props);
  if (!post) return notFound();

  const t = LABELS[lang];

  return (
    <div className="relative max-w-3xl mx-auto p-4">
      <div
        role="status"
        className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3"
      >
        <span className="mr-2 inline-block rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          {t.badge}
        </span>
        <span className="text-sm text-amber-900">{t.note}</span>
      </div>

      {post.coverImage && (
        <CoverImage src={post.coverImage} alt={post.heroAlt || post.title} />
      )}

      <ArticleHeader post={post} lang={lang} />

      <TOC lang={lang} />

      {/* No ads, JSON-LD, share buttons or related posts on drafts — this is
          a working preview, not a public page. */}
      <article id="post-content" className="prose prose-lg max-w-none">
        <PostBody source={post.content} lang={lang} />
      </article>
    </div>
  );
}
