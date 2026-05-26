import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getTranslatedPostBySlug,
} from "@/lib/posts";

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

  return (
    <>
      {/* Many activity posts embed YouTube — warm up the connection so the
          first click on a video saves ~200–400 ms of DNS + TLS. */}
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://i.ytimg.com" />
      <link rel="preconnect" href="https://img.youtube.com" />

      <Header
        lang="en"
        switchUrl={switchUrl}
      />
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer lang="en" />
    </>
  );
}