import { Fragment } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSenseScript from "@/components/AdSenseScript";
import MindsTheme from "@/components/minds/MindsTheme";
import {
  getPostBySlug,
  getTranslatedPostBySlug,
} from "@/lib/posts";
import { isMindsPost } from "@/lib/minds";

export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const translatedPost =
    getTranslatedPostBySlug("en", slug);

  const switchUrl = translatedPost
    ? `/hr/${translatedPost.slug}`
    : "/hr";

  const post = getPostBySlug("en", slug);

  // Psychology articles are Mind Explorers surfaces: the whole page, Header
  // and Footer included, sits inside the theme scope (BACKLOG §1c Phase 0/3).
  // Resolved statically per slug, so every page stays prerendered.
  const minds = isMindsPost(post?.categories);
  const hasYouTube = post?.content.includes("<YouTube") ?? false;
  const hasAds = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
  const Wrap = minds ? MindsTheme : Fragment;

  return (
    <Wrap>
      {/* The click-to-play embed initially requests only its thumbnail. Avoid
          opening three third-party connections on articles with no video. */}
      {hasYouTube && <link rel="preconnect" href="https://i.ytimg.com" />}

      {/* AdSense library (no-op until NEXT_PUBLIC_ADSENSE_CLIENT is set) */}
      {hasAds && <link rel="preconnect" href="https://pagead2.googlesyndication.com" />}
      <AdSenseScript />

      <Header
        lang="en"
        switchUrl={switchUrl}
      />
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer lang="en" minds={minds} />
    </Wrap>
  );
}
