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

  // Psychology articles are Mind Explorers surfaces: the whole page, Header
  // and Footer included, sits inside the theme scope (BACKLOG §1c Phase 0/3).
  // Resolved statically per slug, so every page stays prerendered.
  const minds = isMindsPost(getPostBySlug("en", slug)?.categories);
  const Wrap = minds ? MindsTheme : Fragment;

  return (
    <Wrap>
      {/* Many activity posts embed YouTube — warm up the connection so the
          first click on a video saves ~200–400 ms of DNS + TLS. */}
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://i.ytimg.com" />
      <link rel="preconnect" href="https://img.youtube.com" />

      {/* AdSense library (no-op until NEXT_PUBLIC_ADSENSE_CLIENT is set) */}
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
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